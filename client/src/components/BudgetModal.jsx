import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign } from 'lucide-react';

const BUDGET_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Personal Care',
  'Savings & Investments',
  'Other Expense',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetModal = ({ isOpen, onClose, onSave, budget = null, selectedMonth = null, selectedYear = null }) => {
  const current = new Date();
  const defaultMonth = selectedMonth || current.getMonth() + 1;
  const defaultYear = selectedYear || current.getFullYear();

  const [formData, setFormData] = useState({
    category: 'Housing',
    amount: '',
    month: defaultMonth,
    year: defaultYear,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || 'Housing',
        amount: budget.amount !== undefined ? budget.amount.toString() : '',
        month: budget.month || defaultMonth,
        year: budget.year || defaultYear,
      });
    } else {
      setFormData({
        category: 'Housing',
        amount: '',
        month: defaultMonth,
        year: defaultYear,
      });
    }
    setError('');
  }, [budget, defaultMonth, defaultYear, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category.trim()) {
      setError('Please provide or select a category');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Budget limit must be a positive number greater than 0');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        category: formData.category.trim(),
        amount: numericAmount,
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {budget ? 'Edit Budget Target' : 'Create Monthly Budget'}
            </h3>
            <p className="card-subtitle">
              Set spending thresholds to maintain disciplined finances
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" style={{ padding: '10px 14px', marginBottom: 16 }}>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Expense Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={!!budget} // When editing existing category, keep category fixed to avoid accidental collision
              >
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Budget Cap ($)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="e.g. 500.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Month</label>
                <select
                  className="form-select"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  disabled={!!budget}
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  className="form-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  disabled={!!budget}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Saving...' : budget ? 'Update Budget' : 'Establish Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;

