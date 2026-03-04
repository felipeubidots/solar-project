import React from 'react';

const RiskCard = ({ title, level, description, indicatorColor }) => {
    return (
        <div className="card">
            <div className="label typewriter-text">{title}</div>
            <div className="value" style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {indicatorColor && (
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: `var(--color-${indicatorColor})`,
                        boxShadow: `0 0 8px var(--color-${indicatorColor})`
                    }}></div>
                )}
                {level}
            </div>
            <div className="sub-value">({description})</div>
        </div>
    );
};

export default RiskCard;
