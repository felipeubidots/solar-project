import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './HistoryChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const HistoryChart = ({ historicalData, isDark, onDateChange, loading, startDate: propStartDate, endDate: propEndDate }) => {
    const variables = [
        { id: 'kp_index', label: 'KP Index', color: '#3B82F6', axis: 'y' },
        { id: 'flare_risk', label: 'Flare Risk', color: '#F59E0B', axis: 'y1' },
        { id: 'storm_warning', label: 'Storm Risk', color: '#EF4444', axis: 'y1' }
    ];

    const [selectedVars, setSelectedVars] = useState(['kp_index', 'flare_risk', 'storm_warning']);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [chartOptions, setChartOptions] = useState({});
    const [selectedRange, setSelectedRange] = useState('this_week');

    const toggleVariable = (id) => {
        setSelectedVars(prev => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev;
                return prev.filter(v => v !== id);
            }
            return [...prev, id];
        });
    };

    const handlePresetChange = (e) => {
        const range = e.target.value;
        setSelectedRange(range);

        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (range) {
            case 'this_week':
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                start = new Date(today.setDate(diff));
                end = new Date();
                break;
            case 'last_week':
                const lastMon = new Date();
                const d = lastMon.getDay();
                const mDiff = lastMon.getDate() - d + (d === 0 ? -6 : 1) - 7;
                start = new Date(lastMon.setDate(mDiff));
                end = new Date(new Date(start).setDate(start.getDate() + 6));
                break;
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date();
                break;
            case 'last_30':
                start = new Date();
                start.setDate(today.getDate() - 30);
                end = new Date();
                break;
            default:
                break;
        }

        const format = (d) => d.toISOString().split('T')[0];
        if (onDateChange) onDateChange(format(start), format(end));
    };

    // Initial call to set the date range based on default preset
    useEffect(() => {
        // Simulate a change event for the default 'this_week'
        handlePresetChange({ target: { value: 'this_week' } });
    }, []); // Run only once on mount

    useEffect(() => {
        const gridColor = isDark ? '#334155' : '#E2E8F0';
        const tickColor = isDark ? '#94A3B8' : '#64748B';

        let extractedLabels = [];
        let hasData = false;
        let sortedData = historicalData;
        if (historicalData) {
            sortedData = {};
            Object.keys(historicalData).forEach(key => {
                if (Array.isArray(historicalData[key])) {
                    // Sort chronologically (oldest first) so the chart draws left-to-right
                    sortedData[key] = [...historicalData[key]].sort((a, b) => a.timestamp - b.timestamp);
                } else {
                    sortedData[key] = historicalData[key];
                }
            });
        }

        if (sortedData) {
            const firstVar = Object.keys(sortedData)[0];
            if (sortedData[firstVar] && Array.isArray(sortedData[firstVar]) && sortedData[firstVar].length > 0) {
                hasData = true;
                const dataPoints = sortedData[firstVar].length;
                let showHours = false;
                if (dataPoints > 1) {
                    const firstTime = sortedData[firstVar][0].timestamp;
                    const lastTime = sortedData[firstVar][dataPoints - 1].timestamp;
                    // Use Math.abs in case it arrives newest-first
                    const timeSpanHours = Math.abs(lastTime - firstTime) / (1000 * 60 * 60);
                    showHours = timeSpanHours <= 48; // Mostrar horas si el rango es de 48 horas o menos
                } else if (selectedRange === 'this_week' || selectedRange === 'last_week' || selectedRange === 'this_month' || selectedRange === 'last_30') {
                    showHours = false;
                } else {
                    showHours = true;
                }
                extractedLabels = sortedData[firstVar].map(item => {
                    const date = new Date(item.timestamp);
                    if (showHours) {
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                });
            }
        }

        const datasets = variables
            .filter(v => selectedVars.includes(v.id))
            .map(v => {
                let seriesData = [];
                if (sortedData && sortedData[v.id]) {
                    seriesData = sortedData[v.id].map(item => item.value);
                }

                // If no data, fill with nulls so the chart area stays consistent
                if (seriesData.length === 0 && hasData) { // Only fill with nulls if there are labels but no data for this specific variable
                    seriesData = new Array(extractedLabels.length).fill(null);
                }

                return {
                    label: v.label,
                    data: seriesData,
                    borderColor: v.color,
                    backgroundColor: `${v.color}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: v.axis,
                    pointBackgroundColor: v.color,
                    pointRadius: seriesData.length > 50 ? 0 : 3,
                };
            });

        setChartData({
            labels: extractedLabels,
            datasets
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: tickColor, font: { family: "'Inter', sans-serif", size: 11 } }
                },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: selectedVars.includes('kp_index'),
                    position: 'left',
                    beginAtZero: true,
                    max: 9,
                    title: { display: true, text: 'KP Index', color: tickColor, font: { size: 10 } },
                    grid: { color: gridColor },
                    ticks: { color: tickColor },
                },
                y1: {
                    type: 'linear',
                    display: selectedVars.some(v => ['flare_risk', 'storm_warning'].includes(v)),
                    position: 'right',
                    beginAtZero: true,
                    max: 3,
                    title: { display: true, text: 'Risk Level', color: tickColor, font: { size: 10 } },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: tickColor,
                        stepSize: 1,
                        callback: (value) => value === 0 ? 'Low' : value === 1 ? 'Mod' : value === 2 ? 'High' : value
                    },
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: tickColor,
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8,
                        font: { size: 10 }
                    },
                },
            },
        });
    }, [historicalData, isDark, selectedVars]);

    return (
        <div className="card" style={{ gridColumn: 'span 2', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div className="label" style={{ marginBottom: '0.5rem' }}>Analytical Insights</div>
                    <div className="filter-container">
                        {variables.map(v => (
                            <div
                                key={v.id}
                                className={`chip ${selectedVars.includes(v.id) ? 'active' : ''} ${v.id.split('_')[0]}`}
                                onClick={() => toggleVariable(v.id)}
                            >
                                {v.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="date-picker-controls" style={{ alignItems: 'flex-end', marginLeft: 'auto' }}>
                    <div className="date-input-group">
                        <label htmlFor="range-preset" className="ds-body" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Temporal Range</label>
                        <select
                            id="range-preset"
                            className="date-input"
                            value={selectedRange}
                            onChange={handlePresetChange}
                            style={{ padding: '0.5rem 2rem 0.5rem 0.8rem', minWidth: '180px', borderRadius: '8px' }}
                        >
                            <option value="this_week">This Week</option>
                            <option value="last_week">Last Week</option>
                            <option value="this_month">This Month</option>
                            <option value="last_30">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="chart-container" style={{ flexGrow: 1, marginTop: '0.5rem', minHeight: '340px', position: 'relative' }}>
                {loading && (
                    <div className="loading-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(var(--bg-rgb), 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '12px',
                        backdropFilter: 'blur(6px)',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div className="skeleton-line" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                        Synchronizing solar insights...
                    </div>
                )}
                {!loading && chartData.labels.length === 0 && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                        No historical snapshots found in this period.<br />Try selecting a different range.
                    </div>
                )}
                {!loading && chartData.labels.length > 0 && (
                    <Line key={selectedRange + isDark + chartData.labels.length} data={chartData} options={chartOptions} />
                )}
            </div>
        </div>
    );
};

export default HistoryChart;
