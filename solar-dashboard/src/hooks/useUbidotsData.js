import { useState, useEffect } from 'react';

// Reusable hook to fetch data from Ubidots API
export const useUbidotsData = (deviceLabel, variables = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!deviceLabel) {
            setLoading(false);
            setError('Missing deviceLabel.');
            return;
        }

        const fetchData = async () => {
            try {
                const variablesQuery = variables.join(',');
                const response = await fetch(`/api/get-solar-data?deviceLabel=${deviceLabel}&variables=${variablesQuery}`);

                if (!response.ok) {
                    const errBody = await response.json();
                    throw new Error(errBody.error || 'Failed to fetch from proxy');
                }

                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Polling cada 60 segundos
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);

    }, [deviceLabel, JSON.stringify(variables)]);

    return { data, loading, error };
};
