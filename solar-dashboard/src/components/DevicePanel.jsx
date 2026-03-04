import React from 'react';

const DevicePanel = ({ deviceLabel, variables }) => {
    return (
        <div className="grid-desktop">
            <div className="card" style={{ height: '100%', alignItems: 'flex-start', textAlign: 'left', width: '100%' }}>
                <div className="ds-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-safe)', boxShadow: '0 0 8px var(--color-safe)' }}></div>
                    Device Info
                </div>
                <div className="ds-body" style={{ marginTop: '0.5rem' }}>
                    <strong>API Label:</strong> <code>{deviceLabel}</code><br />
                    <strong>Status:</strong> Active & Connected<br />
                    <strong>Data Source:</strong> Remote Weather Sensors
                </div>
            </div>

            <div className="card" style={{ height: '100%', alignItems: 'flex-start', textAlign: 'left', width: '100%' }}>
                <div className="ds-title">Monitored Variables</div>
                <div className="ds-body" style={{ marginTop: '0.5rem', width: '100%' }}>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {variables.map((variable, index) => (
                            <li key={index} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{variable}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Numeric Float/Int</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DevicePanel;
