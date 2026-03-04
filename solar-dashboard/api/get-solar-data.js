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
        const requests = variableList.map(variable => {
            if (isHistorical) {
                // Calcular page_size dinámico basado en el rango de tiempo
                const diffMs = endNum - startNum;
                let pageSize = 100;
                if (diffMs > 14 * 24 * 60 * 60 * 1000) {
                    pageSize = 500; // Más de 2 semanas
                } else if (diffMs > 2 * 24 * 60 * 60 * 1000) {
                    pageSize = 200; // Más de 2 días
                }

                // Endpoint estándar de valores con filtro de tiempo
                const url = `https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values?page_size=${pageSize}&start=${startNum}&end=${endNum}`;

                return fetch(url, {
                    headers: {
                        'X-Auth-Token': token,
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    console.log('Ubidots Values Response Status:', response.status, response.statusText);
                    if (!response.ok) throw new Error(`Ubidots Values Error: ${response.statusText}`);
                    return response.json();
                });
            } else {
                // Último valor puntual (Overview)
                const url = `https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values?page_size=1`;
                return fetch(url, {
                    headers: {
                        'X-Auth-Token': token,
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (!response.ok) throw new Error(`Ubidots Error: ${response.statusText}`);
                    return response.json();
                });
            }
        });

        const results = await Promise.all(requests);

        const extractedData = {};
        variableList.forEach((variable, index) => {
            if (isHistorical) {
                // La respuesta de /values viene como {results: [{value, timestamp, ...}, ...], count, next, previous}
                const rawResults = results[index].results || [];
                // Ordenar cronológicamente (Ubidots devuelve más reciente primero)
                extractedData[variable] = rawResults
                    .map(r => ({
                        timestamp: r.timestamp,
                        value: r.value
                    }))
                    .sort((a, b) => a.timestamp - b.timestamp);
            } else {
                extractedData[variable] = results[index].results.length > 0 ? results[index].results[0].value : null;
            }
        });

        return res.status(200).json(extractedData);
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Failed to fetch data from Ubidots.', details: error.message });
    }
}
