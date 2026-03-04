import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RiskComparisonChart = ({ isDark, currentFlareRisk, currentStormRisk }) => {
    const [chartData, setChartData] = useState({ datasets: [] });
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const gridColor = isDark ? '#334155' : '#E2E8F0';
        const tickColor = isDark ? '#94A3B8' : '#64748B';

        // Mock historical data trending towards the current values.
        // The last point must exactly match the current Ubidots risk state (0, 1, or 2).
        const baseFlare = currentFlareRisk ?? 0;
        const baseStorm = currentStormRisk ?? 0;

        setChartData({
            labels: ['-5h', '-4h', '-3h', '-2h', '-1h', 'Now'],
            datasets: [
                {
                    label: 'Solar Flare Risk',
                    data: [
                        Math.max(0, baseFlare - 0.5),
                        Math.max(0, baseFlare - 0.2),
                        baseFlare,
                        Math.max(0, baseFlare - 0.1),
                        baseFlare,
                        baseFlare // Must end exactly on current value
                    ],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: '#F59E0B',
                },
                {
                    label: 'Solar Storm Risk',
                    data: [
                        Math.max(0, baseStorm - 0.4),
                        baseStorm,
                        Math.max(0, baseStorm - 0.2),
                        baseStorm,
                        baseStorm,
                        baseStorm // Must end exactly on current value
                    ],
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: '#EF4444',
                }
            ],
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                y: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: tickColor,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3, // Since risks are 0, 1, or 2 (Low, Mod, High) but can be higher
                    grid: { color: gridColor },
                    ticks: {
                        color: tickColor, stepSize: 1, callback: function (value) {
                            if (value === 0) return 'Low';
                            if (value === 1) return 'Moderate';
                            if (value >= 2) return 'High';
                            return value;
                        }
                    },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: tickColor },
                },
            },
        });
    }, [isDark, currentFlareRisk, currentStormRisk]);

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="label typewriter-text" style={{ alignSelf: 'flex-start' }}>Risk Comparison Trend</div>
            <div className="chart-container" style={{ flexGrow: 1, marginTop: '0.5rem', height: '240px' }}>
                {chartData.datasets.length > 0 && <Line data={chartData} options={chartOptions} />}
            </div>
        </div>
    );
};

export default RiskComparisonChart;
