import 'dotenv/config';
const UBIDOTS_TOKEN = process.env.UBIDOTS_TOKEN;
const deviceLabel = 'solar-monitor';
const variable = 'kp_index';

// Test with 3 days ago to now
const end = Date.now();
const start = end - (3 * 24 * 60 * 60 * 1000);

async function test(url) {
    console.log(`\nTesting URL: ${url}`);
    try {
        const res = await fetch(url, {
            headers: { 'X-Auth-Token': UBIDOTS_TOKEN }
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            console.log('Sample Result (first 2):', JSON.stringify(data.results?.slice(0, 2), null, 2));
            console.log('Total points:', data.results?.length);
        } else {
            const text = await res.text();
            console.log('Error Body:', text);
        }
    } catch (e) {
        console.error('Fetch Failed:', e.message);
    }
}

async function run() {
    // 1. Mayúsculas con barra
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values/aggregation/?method=mean&period=6H&start=${start}&end=${end}`);

    // 2. Minúsculas sin barra
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values/aggregation?method=mean&period=6h&start=${start}&end=${end}`);

    // 3. Endpoint de estadísticas (GET)
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/variables/${variable}/statistics/mean/${start}/${end}`);

    // 4. Endpoint de valores con parámetros de agregación (GET)
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/variables/${variable}/values?aggregation_method=mean&aggregation_period=6h&start=${start}&end=${end}`);

    // 5. Endpoint de variables por label para conseguir el ID (GET)
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/variables/${variable}`);

    // 6. Listar todas las variables del dispositivo para ver sus IDs y Labels reales
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/variables`);

    // New: Resolve multiple IDs and test individual aggregation for each
    console.log('\nStep 9: Resolving multiple IDs and testing individual aggregation...');
    const varsToAggregate = ['kp_index', 'flare_risk', 'storm_warning'];
    for (const v of varsToAggregate) {
        console.log(`\nResolving ID for ${v}...`);
        const resId = await fetch(`https://industrial.api.ubidots.com/api/v1.6/variables/?label=${v}&datasource__label=${deviceLabel}`, {
            headers: { 'X-Auth-Token': UBIDOTS_TOKEN }
        });
        const idData = await resId.json();
        if (idData.results && idData.results.length > 0) {
            const id = idData.results[0].id;
            console.log(`Found ID for ${v}: ${id}`);

            // Test individual aggregation with this ID
            const aggUrl = `https://industrial.api.ubidots.com/api/v1.6/variables/${id}/values/aggregation?method=mean&period=6h&start=${start}&end=${end}`;
            const resAgg = await fetch(aggUrl, { headers: { 'X-Auth-Token': UBIDOTS_TOKEN } });
            console.log(`Agg Status for ${v}: ${resAgg.status}`);
            if (resAgg.ok) {
                const aggData = await resAgg.json();
                console.log(`Points for ${v}: ${aggData.results?.length}`);
            } else {
                console.log(`Agg Error for ${v}:`, await resAgg.text());
            }
        } else {
            console.log(`FAILED to resolve ${v}`);
        }
    }

    // 10. Get ID first, then test POST aggregation
    console.log('\nStep 10: Resolving ID and Testing POST aggregation...');
    const resId = await fetch(`https://industrial.api.ubidots.com/api/v1.6/variables/?label=${variable}&datasource__label=${deviceLabel}`, {
        headers: { 'X-Auth-Token': UBIDOTS_TOKEN }
    });
    const idData = await resId.json();
    const varId = idData.results[0].id;
    console.log(`Resolved ID for ${variable}: ${varId}`);

    const postUrl = 'https://industrial.api.ubidots.com/api/v1.6/data/aggregation';
    const body = {
        variables: [varId],
        aggregation: 'mean',
        period: '1h',
        start: start,
        end: end
    };

    console.log('Testing POST URL:', postUrl);
    const resPost = await fetch(postUrl, {
        method: 'POST',
        headers: {
            'X-Auth-Token': UBIDOTS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    console.log(`POST Status: ${resPost.status} ${resPost.statusText}`);
    if (resPost.ok) {
        const data = await resPost.json();
        console.log('POST Result Sample (first 2):', JSON.stringify(data.results?.slice(0, 2), null, 2));
    } else {
        console.log('POST Error:', await resPost.text());
    }

    console.log('\nStep 11: Multi-Variable POST aggregation...');

    // Resolve two IDs
    const vars = ['kp_index', 'flare_risk'];
    const ids = [];
    for (const v of vars) {
        const resIdMulti = await fetch(`https://industrial.api.ubidots.com/api/v1.6/variables/?label=${v}&datasource__label=${deviceLabel}`, {
            headers: { 'X-Auth-Token': UBIDOTS_TOKEN }
        });
        const idDataMulti = await resIdMulti.json();
        if (idDataMulti.results && idDataMulti.results.length > 0) {
            ids.push(idDataMulti.results[0].id);
        } else {
            console.warn(`Could not resolve ID for variable: ${v}`);
        }
    }
    console.log('Resolved IDs:', ids);

    const postUrlMulti = 'https://industrial.api.ubidots.com/api/v1.6/data/aggregation';
    const bodyMulti = {
        variables: ids,
        aggregation: 'mean',
        period: '1h',
        start: start,
        end: end
    };

    console.log('Testing Multi-Variable POST URL:', postUrlMulti);
    const resPostMulti = await fetch(postUrlMulti, {
        method: 'POST',
        headers: {
            'X-Auth-Token': UBIDOTS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyMulti)
    });
    console.log(`Multi-Variable POST Status: ${resPostMulti.status} ${resPostMulti.statusText}`);
    if (resPostMulti.ok) {
        const dataMulti = await resPostMulti.json();
        // Log first few points to see how variables are represented
        console.log('Multi-Variable Result Sample (first 5):', JSON.stringify(dataMulti.results?.slice(0, 5), null, 2));
    } else {
        console.log('Multi-Variable POST Error:', await resPostMulti.text());
    }

    // 7. Test exact pattern from Overview (should work if labels are correct)
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values?page_size=1`);

    // 8. Test the same but for historical range (raw values)
    await test(`https://industrial.api.ubidots.com/api/v1.6/devices/${deviceLabel}/${variable}/values?start=${start}&end=${end}&page_size=100`);
}

run();
