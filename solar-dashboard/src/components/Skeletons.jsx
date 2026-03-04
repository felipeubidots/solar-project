import React from 'react';
import './Skeletons.css';

export const SkeletonText = ({ width = '100%', baseHeight = '1.5rem', style = {}, className = '' }) => (
  <div 
    className={`skeleton ${className}`} 
    style={{ width, height: baseHeight, ...style }} 
  />
);

export const SkeletonValue = ({ width = '50%', style = {}, className = '' }) => (
  <div 
    className={`skeleton skeleton-value ${className}`} 
    style={{ width, ...style }} 
  />
);

export const SkeletonGauge = ({ style = {}, className = '' }) => (
  <div 
    className={`skeleton skeleton-gauge ${className}`} 
    style={{ ...style }} 
  />
);

export const CardSkeleton = () => {
    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>
            <SkeletonText width="40%" style={{ margin: '0 auto 0.5rem auto' }} />
            <SkeletonValue />
            <SkeletonText width="30%" baseHeight="1rem" style={{ margin: '0 auto' }} />
            <SkeletonGauge />
        </div>
    )
}
