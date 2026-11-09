import React from 'react';
import { Menu, Plus, Database, RefreshCw } from 'lucide-react';

const Header = ({ 
  title, 
  subtitle, 
  onMenuToggle, 
  onOpenTransactionModal, 
  onSeedData, 
  isSeeding = false,
  onRefresh,
  isRefreshing = false 
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-title">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions">
        {onRefresh && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data from Server"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden-mobile">Refresh</span>
          </button>
        )}

        {onSeedData && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onSeedData}
            disabled={isSeeding}
            title="Seed realistic sample transactions & budgets"
          >
            <Database size={15} />
            <span className="hidden-mobile">{isSeeding ? 'Seeding...' : 'Demo Data'}</span>
          </button>
        )}

        {onOpenTransactionModal && (
          <button
            className="btn btn-accent btn-sm"
            onClick={onOpenTransactionModal}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Transaction</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

