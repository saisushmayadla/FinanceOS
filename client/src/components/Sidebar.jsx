import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  BarChart3, 
  Wallet, 
  Sparkles,
  Database,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Financial Summary', path: '/summary', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="brand-badge" onClick={onClose}>
            <div className="brand-icon">
              <Wallet size={20} strokeWidth={2.2} />
            </div>
            <div className="brand-text">
              <h1>FinanceOS</h1>
              <p>Personal Finance</p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ color: '#9CA3AF' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', padding: '0 12px 8px 12px', fontWeight: 600 }}>
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.78rem' }}>System Operational</div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>MongoDB REST API Connected</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
