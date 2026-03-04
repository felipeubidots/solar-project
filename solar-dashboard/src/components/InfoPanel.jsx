import React from 'react';

const InfoPanel = () => {
    return (
        <div className="card" style={{ alignItems: 'flex-start', textAlign: 'left', gridColumn: 'span 2' }}>
            <div className="ds-title">Understanding Solar Data</div>
            <div className="ds-body" style={{ marginBottom: '1rem' }}>
                <strong>The Kp Index:</strong> A global indicator of geomagnetic storm intensity. It ranges from 0 to 9, where 0 represents calm conditions and 9 indicates extreme geomagnetic storms capable of disrupting satellites, power grids, and radio communications.
            </div>

            <div className="ds-title" style={{ fontSize: '1.25rem' }}>Solar Flares</div>
            <div className="ds-body" style={{ marginBottom: '1rem' }}>
                Intense bursts of radiation coming from the release of magnetic energy associated with sunspots. They are classified as A, B, C, M, or X, with X being the most dramatic. Lower levels pose minimal risk, while M and X flares can cause significant space weather events.
            </div>

            <div className="ds-title" style={{ fontSize: '1.25rem' }}>Geomagnetic Storms</div>
            <div className="ds-body">
                Major disturbances of Earth's magnetosphere that occur when there is a very efficient exchange of energy from the solar wind into the space environment surrounding Earth. They are often triggered by coronal mass ejections (CMEs) and are rated on a 'G' scale from 1 (minor) to 5 (extreme).
            </div>
        </div>
    );
};

export default InfoPanel;
