import { useState, useEffect } from 'react'
import KpGauge from './components/KpGauge'
import RiskCard from './components/RiskCard'
import HistoryChart from './components/HistoryChart'
import RiskComparisonChart from './components/RiskComparisonChart'
import InfoPanel from './components/InfoPanel'
import DevicePanel from './components/DevicePanel'
import { CardSkeleton } from './components/Skeletons'
import { Moon, Sun } from 'lucide-react'
import { useUbidotsData } from './hooks/useUbidotsData'
import './index.css'

function App() {
  const [isDark, setIsDark] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  const deviceLabel = import.meta.env.VITE_DEVICE_LABEL || 'solar-monitor';
  const variables = ['kp_index', 'flare_risk', 'storm_warning'];

  // Fetch real data (now through proxy)
  const { data, loading, error } = useUbidotsData(deviceLabel, variables);

  // Helper functions to map numeric risk values to labels
  const getKpLabel = (kp) => {
    if (kp == null) return 'N/A';
    if (kp < 5) return 'Quiet';
    if (kp < 7) return 'Active';
    return 'Storm';
  };

  const getRiskLabel = (riskValue) => {
    if (riskValue == null) return { level: 'N/A', description: '', color: 'secondary' };
    if (riskValue < 1) return { level: 'Low', description: 'Safe', color: 'safe' };
    if (riskValue < 2) return { level: 'Moderate', description: 'Watch', color: 'warning' };
    return { level: 'High', description: 'Warning', color: 'danger' };
  };

  // Historical Data State
  const [historicalData, setHistoricalData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Date Range Management
  const getDefaultDates = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    return {
      start: lastWeek.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  const handleHistoryUpdate = async (startDate, endDate) => {
    setHistoryLoading(true);
    try {
      // Use provided dates or current state
      const sDate = startDate || dateRange.start;
      const eDate = endDate || dateRange.end;

      if (startDate && endDate) {
        setDateRange({ start: startDate, end: endDate });
      }

      const startMs = new Date(sDate + 'T00:00:00').getTime();
      const endMs = new Date(eDate + 'T23:59:59').getTime();

      const variablesQuery = variables.join(',');
      // Cache buster
      const cb = Date.now();
      const response = await fetch(`/api/get-solar-data?deviceLabel=${deviceLabel}&variables=${variablesQuery}&start=${startMs}&end=${endMs}&_cb=${cb}`);

      if (!response.ok) throw new Error('Failed to fetch history');

      const result = await response.json();
      setHistoricalData(result);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch when entering History tab
    if (activeTab === 'History' && !historicalData) {
      handleHistoryUpdate();
    }
  }, [activeTab]);

  useEffect(() => {
    // Apply theme correctly bridging React state to index.css selectors
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '0.5rem 1.5rem' }}>
      <header className="header">
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Solar Monitor</h1>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'History' ? 'active' : ''}`}
            onClick={() => setActiveTab('History')}
          >
            History
          </button>
          <button
            className={`tab-button ${activeTab === 'Device' ? 'active' : ''}`}
            onClick={() => setActiveTab('Device')}
          >
            Device
          </button>
          <button
            className={`tab-button ${activeTab === 'Info' ? 'active' : ''}`}
            onClick={() => setActiveTab('Info')}
          >
            Info
          </button>
        </div>

        <label className="theme-toggle" style={{ cursor: 'pointer' }}>
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
          <span style={{ marginLeft: '8px' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          <div className="switch" style={{ marginLeft: '8px' }}>
            <input
              type="checkbox"
              checked={isDark}
              onChange={() => setIsDark(!isDark)}
            />
            <span className="slider"></span>
          </div>
        </label>
      </header>

      <main className="section">

        {/* Error State */}
        {error && (
          <div className="card" style={{ gridColumn: 'span 2', borderColor: 'var(--color-danger)' }}>
            <div className="label" style={{ color: 'var(--color-danger)' }}>Connection Error</div>
            <div className="ds-body">Failed to fetch data from Ubidots: {error}</div>
          </div>
        )}

        {loading ? (
          // Skeleton Loading State
          <div className="grid-desktop">
            <CardSkeleton />
            <div className="card"><div className="skeleton skeleton-value" style={{ width: '80%', margin: '0 auto' }}></div></div>
            <div className="card"><div className="skeleton skeleton-value" style={{ width: '80%', margin: '0 auto' }}></div></div>
          </div>
        ) : (data && !error) ? (
          // Data Loaded State
          <div>

            {activeTab === 'Overview' && (
              <div className="grid-desktop">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <KpGauge
                    value={data['kp_index'] || 0}
                    label={getKpLabel(data['kp_index'])}
                  />

                  <RiskCard
                    title="Solar Flare Risk"
                    level={getRiskLabel(data['flare_risk']).level}
                    description={getRiskLabel(data['flare_risk']).description}
                    indicatorColor={getRiskLabel(data['flare_risk']).color}
                  />

                  <RiskCard
                    title="Solar Storm Risk"
                    level={getRiskLabel(data['storm_warning']).level}
                    description={getRiskLabel(data['storm_warning']).description}
                    indicatorColor={getRiskLabel(data['storm_warning']).color}
                  />
                </div>

                <RiskComparisonChart
                  key={isDark ? 'comp-dark' : 'comp-light'}
                  isDark={isDark}
                  currentFlareRisk={data['flare_risk']}
                  currentStormRisk={data['storm_warning']}
                />
              </div>
            )}

            {activeTab === 'History' && (
              <HistoryChart
                key={isDark ? 'dark' : 'light'}
                isDark={isDark}
                historicalData={historicalData}
                loading={historyLoading}
                startDate={dateRange.start}
                endDate={dateRange.end}
                onDateChange={handleHistoryUpdate}
              />
            )}

            {activeTab === 'Device' && (
              <DevicePanel deviceLabel={deviceLabel} variables={variables} />
            )}

            {activeTab === 'Info' && (
              <InfoPanel />
            )}

          </div>
        ) : null}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Made with ☕ by Pipe
      </footer>
    </div>
  )
}

export default App
