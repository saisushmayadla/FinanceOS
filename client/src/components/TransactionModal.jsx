import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Dividends',
  'Gift',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
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
  'Other Expense',
];

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, defaultType = 'expense' }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount !== undefined ? transaction.amount.toString() : '',
        type: transaction.type || 'expense',
        category: transaction.category || (transaction.type === 'income' ? 'Salary' : 'Food & Dining'),
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: defaultType,
        category: defaultType === 'income' ? 'Salary' : 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setError('');
  }, [transaction, defaultType, isOpen]);

  if (!isOpen) return null;

  const currentCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a descriptive title');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a valid positive number greater than 0');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.date) {
      setError('Please choose a valid transaction date');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        amount: numericAmount,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
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
              {transaction ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p className="card-subtitle">
              {transaction ? 'Update financial ledger record' : 'Add income or expense entry'}
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

            {/* Type Switcher Pill Buttons */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  backgroundColor: 'var(--bg-subtle)',
                  padding: 4,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: formData.type === 'expense' ? 'var(--primary)' : 'transparent',
                    color: formData.type === 'expense' ? '#FFFFFF' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowDownRight size={16} style={{ color: formData.type === 'expense' ? '#F87171' : 'inherit' }} />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: formData.type === 'income' ? 'var(--primary)' : 'transparent',
                    color: formData.type === 'income' ? '#FFFFFF' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowUpRight size={16} style={{ color: formData.type === 'income' ? '#34D399' : 'inherit' }} />
                  Income
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title / Payee</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Monthly Salary, Whole Foods Market, Office Rent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Amount & Date side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description / Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description / Note (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add contextual details or receipt references..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Saving...' : transaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
