import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'gold' }) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className={`stat-icon ${variant}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-sub">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
