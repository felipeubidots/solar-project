export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { deviceLabel, variables, start, end } = req.query;
    const token = process.env.UBIDOTS_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'Server authentication token is not configured.' });
    }

    if (!deviceLabel || !variables) {
        return res.status(400).json({ error: 'Missing deviceLabel or variables.' });
    }

    const variableList = variables.split(',');
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    const isHistorical = !isNaN(startNum) && !isNaN(endNum);

    try {
        let extractedData = {};

        if (isHistorical) {
            // First, get the IDs of the variables because the resample endpoint requires IDs, not labels
            const varsRes = await fetch(`https://industrial.api.ubidots.com/api/v1.6/variables/?datasource__label=${deviceLabel}`, {
                headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' }
            });
            if (!varsRes.ok) throw new Error(`Failed to get variables: ${varsRes.statusText}`);
            const varsData = await varsRes.json();

            // Map labels to IDs
            const labelToId = {};
            varsData.results.forEach(v => {
                labelToId[v.label] = v.id;
            });

            // Filter out requested variables that aren't on this device
            const ids = [];
            const idsToLabels = {};
            variableList.forEach(label => {
                if (labelToId[label]) {
                    ids.push(labelToId[label]);
                    idsToLabels[labelToId[label]] = label;
                }
            });

            // If no valid variables found, return empty arrays
            if (ids.length === 0) {
                variableList.forEach(v => extractedData[v] = []);
                return res.status(200).json(extractedData);
            }

            // Calculamos el periodo
            const diffMs = endNum - startNum;
            let period = '1h'; // Default: 1 hora
            if (diffMs > 14 * 24 * 60 * 60 * 1000) {
                period = '1D'; // Más de 2 semanas: resolución diaria (Ubidots resample requiere 1D en lugar de 1d)
            } else if (diffMs > 2 * 24 * 60 * 60 * 1000) {
                period = '6h'; // Más de 2 días: resolución cada 6 horas
            }

            const body = {
                variables: ids,
                aggregation: 'mean',
                period: period,
                join_dataframes: true,
                start: startNum,
                end: endNum
            };

            const resampleRes = await fetch('https://industrial.api.ubidots.com/api/v1.6/data/stats/resample/', {
                method: 'POST',
                headers: {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!resampleRes.ok) {
                console.error('Resample API Error:', await resampleRes.text());
                throw new Error(`Ubidots Resample Error: ${resampleRes.statusText}`);
            }

            const resampleData = await resampleRes.json();
            const resultsData = resampleData.results || [];
            const columns = resampleData.columns || [];

            console.log('Variable Request IDs:', JSON.stringify(ids));
            console.log('Ubidots Columns:', JSON.stringify(columns));

            // Initialize extractedData
            variableList.forEach(v => extractedData[v] = []);

            if (resultsData.length > 0 && columns.length > 0) {
                // Find column index for each variable
                const colIndexes = {};
                ids.forEach(id => {
                    const colName = `${id}.value.value`;
                    const idx = columns.indexOf(colName);
                    if (idx !== -1) {
                        colIndexes[idsToLabels[id]] = idx;
                    }
                });

                // Map results back to chart format
                // resultsData rows are [timestamp, val1, val2...] matching the columns order
                resultsData.forEach(row => {
                    const ts = row[0]; // index 0 is always timestamp in Ubidots resample
                    variableList.forEach(label => {
                        if (colIndexes[label] !== undefined) {
                            const val = row[colIndexes[label]];
                            if (val !== null && val !== undefined) {
                                extractedData[label].push({
                                    timestamp: ts,
                                    value: val
                                });
                            }
                        }
                    });
                });
            }
        } else {
            // Último valor puntual (Overview)
            const requests = variableList.map(variable => {
                const url = `https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values?page_size=1`;
                return fetch(url, {
                    headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' }
                }).then(response => {
                    if (!response.ok) throw new Error(`Ubidots Error: ${response.statusText}`);
                    return response.json();
                });
            });

            const results = await Promise.all(requests);
            variableList.forEach((variable, index) => {
                extractedData[variable] = results[index].results.length > 0 ? results[index].results[0].value : null;
            });
        }

        return res.status(200).json({
            ...extractedData,
            _debug_columns: columns,
            _debug_ids: ids
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Failed to fetch data from Ubidots.', details: error.message });
    }
}
