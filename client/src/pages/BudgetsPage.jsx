import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { budgetService } from '../services/api';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import StatCard from '../components/StatCard';
import { useToast } from '../hooks/useToast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const BudgetsPage = ({ refreshTrigger, onTriggerRefresh }) => {
  const current = new Date();
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(current.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toast = useToast();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getAll({ month: selectedMonth, year: selectedYear });
      setBudgets(res.data || []);
      setTotalAllocated(res.totalAllocated || 0);
      setTotalSpent(res.totalSpent || 0);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch budget targets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingBudget) {
      await budgetService.update(editingBudget._id, formData);
      toast.success('Budget cap updated');
    } else {
      await budgetService.create(formData);
      toast.success('Budget target created');
    }
    fetchBudgets();
    if (onTriggerRefresh) onTriggerRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await budgetService.delete(deleteTarget._id);
      toast.success('Budget target removed');
      setDeleteTarget(null);
      fetchBudgets();
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget target');
    }
  };

  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const isOverallExceeded = totalSpent > totalAllocated;

  const exceededBudgets = budgets.filter((b) => b.isExceeded);

  return (
    <div>
      {/* Month & Year Navigation Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Budget Plan
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Comparing established thresholds with actual MongoDB expense records
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            >
              {[current.getFullYear() - 1, current.getFullYear(), current.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              className="btn btn-accent btn-sm"
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Create Budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warnings Banner if any budget exceeded */}
      {exceededBudgets.length > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 24 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700 }}>
              {exceededBudgets.length} Budget {exceededBudgets.length === 1 ? 'Category Has' : 'Categories Have'} Exceeded Their Limit
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
              {exceededBudgets.map((b) => `${b.category} (${b.percentage}% spent)`).join(', ')}. Immediate budget discipline recommended.
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard
          title="Total Budget Cap"
          value={formatCurrency(totalAllocated)}
          subtitle={`${budgets.length} established categories`}
          icon={Target}
          variant="gold"
        />
        <StatCard
          title="Actual Spent"
          value={formatCurrency(totalSpent)}
          subtitle={`${overallPercentage}% of total budget consumed`}
          icon={AlertTriangle}
          variant={isOverallExceeded ? 'warning' : 'dark'}
        />
        <StatCard
          title="Remaining Balance"
          value={formatCurrency(totalRemaining)}
          subtitle={
            isOverallExceeded
              ? `Deficit of ${formatCurrency(totalSpent - totalAllocated)}`
              : 'Within healthy limits'
          }
          icon={CheckCircle2}
          variant={isOverallExceeded ? 'danger' : 'green'}
        />
      </div>

      {/* Budgets Grid */}
      {loading && budgets.length === 0 ? (
        <div className="empty-state" style={{ minHeight: 280 }}>
          <div className="status-dot animate-ping" style={{ marginBottom: 12 }} />
          <h3>Calculating budget consumption...</h3>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48 }}>
          <div className="empty-icon">
            <Target size={26} />
          </div>
          <h3>No Budgets Set for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h3>
          <p>
            Create category limits to keep your expenses organized and receive real-time warnings whenever spending spikes.
          </p>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Establish First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {budgets.map((b) => {
            let progressClass = 'progress-gold';
            if (b.percentage >= 100) progressClass = 'progress-danger';
            else if (b.percentage >= 80) progressClass = 'progress-warning';

            return (
              <div
                key={b._id}
                className="card"
                style={{
                  borderLeft: b.isExceeded ? '4px solid var(--danger)' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{b.category}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Cap: {formatCurrency(b.amount)} / month
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 7px' }}
                      title="Edit Budget Limit"
                      onClick={() => {
                        setEditingBudget(b);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 7px' }}
                      title="Delete Budget"
                      onClick={() => setDeleteTarget(b)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ margin: '14px 0 10px 0' }}>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${progressClass}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Spent: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(b.spent)}</strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {b.isExceeded ? 'Exceeded by: ' : 'Left: '}
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: b.isExceeded ? 'var(--danger)' : 'var(--text-primary)',
                      }}
                    >
                      {formatCurrency(Math.abs(b.remaining))}
                    </strong>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Usage Status
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: b.isExceeded
                        ? 'var(--danger-bg)'
                        : b.percentage >= 80
                        ? 'var(--warning-bg)'
                        : 'var(--success-bg)',
                      color: b.isExceeded
                        ? 'var(--danger)'
                        : b.percentage >= 80
                        ? 'var(--warning)'
                        : 'var(--success)',
                      borderColor: b.isExceeded
                        ? 'var(--danger-border)'
                        : b.percentage >= 80
                        ? 'var(--warning-border)'
                        : 'var(--success-border)',
                    }}
                  >
                    {b.isExceeded
                      ? `Over Budget (${b.percentage}%)`
                      : b.percentage >= 80
                      ? `Near Limit (${b.percentage}%)`
                      : `On Track (${b.percentage}%)`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        budget={editingBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Budget Target"
        message={`Remove the monthly budget of ${formatCurrency(deleteTarget?.amount)} for "${deleteTarget?.category}"? This will not delete your actual recorded transactions.`}
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default BudgetsPage;

