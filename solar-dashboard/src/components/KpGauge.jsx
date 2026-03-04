import React from 'react';

const KpGauge = ({ value, label }) => {
    // Map KP value (0-9) to percentage for marker position (approximate visual mapping)
    const markerPosition = `${(value / 9) * 100}%`;

    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="label typewriter-text">Current KP Index</div>
            <div className="value">
                {value} <span className="sub-value">({label})</span>
            </div>
            <div className="gauge-container">
                <div className="gauge-marker" style={{ left: markerPosition }}></div>
            </div>
        </div>
    );
};

export default KpGauge;
