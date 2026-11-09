import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from 'lucide-react';
import { transactionService } from '../services/api';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';

const ALL_CATEGORIES = [
  'All',
  'Salary',
  'Freelance',
  'Investments',
  'Business',
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
  'Other',
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const TransactionsPage = ({ refreshTrigger, onTriggerRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' for all, 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toast = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const res = await transactionService.getAll(params);
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder, refreshTrigger]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleCreateOrUpdate = async (formData) => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction._id, formData);
      toast.success('Transaction updated successfully');
    } else {
      await transactionService.create(formData);
      toast.success('New transaction recorded');
    }
    fetchTransactions();
    if (onTriggerRefresh) onTriggerRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transactionService.delete(deleteTarget._id);
      toast.success('Transaction removed successfully');
      setDeleteTarget(null);
      fetchTransactions();
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  const openAddModal = (type = 'expense') => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  // Compute summary for current filtered view
  const filteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      {/* Top Controls Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={17}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by title, description, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Quick Filter Buttons & Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {/* Type selector */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>

            {/* Category selector */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>

            {/* Reset Filters */}
            {(search || typeFilter || categoryFilter !== 'All' || startDate || endDate) && (
              <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} title="Reset all filters">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button className="btn btn-accent btn-sm" onClick={() => openAddModal('expense')}>
              <Plus size={16} />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Date Range Sub-Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date Window:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: '0.82rem' }}>
            <span>
              Showing: <strong>{transactions.length}</strong> items
            </span>
            <span style={{ color: 'var(--success)' }}>
              Inflow: <strong>+{formatCurrency(filteredIncome)}</strong>
            </span>
            <span style={{ color: 'var(--text-primary)' }}>
              Outflow: <strong>-{formatCurrency(filteredExpense)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && transactions.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 280 }}>
            <div className="status-dot animate-ping" style={{ marginBottom: 12 }} />
            <h3>Fetching records...</h3>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 280 }}>
            <div className="empty-icon">
              <Layers size={24} />
            </div>
            <h3>No Transactions Found</h3>
            <p>
              {search || typeFilter || categoryFilter !== 'All' || startDate || endDate
                ? 'No transactions matched the active filters.'
                : 'You have not added any transactions to your ledger yet.'}
            </p>
            {search || typeFilter || categoryFilter !== 'All' || startDate || endDate ? (
              <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                Clear Active Filters
              </button>
            ) : (
              <button className="btn btn-accent btn-sm" onClick={() => openAddModal('expense')}>
                <Plus size={16} /> Record First Transaction
              </button>
            )}
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.title}</div>
                      {tx.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-category">{tx.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={tx.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Edit Transaction"
                          onClick={() => openEditModal(tx)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Delete Transaction"
                          onClick={() => setDeleteTarget(tx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        transaction={editingTransaction}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Transaction"
        message={`Are you certain you want to delete "${deleteTarget?.title}" (${formatCurrency(deleteTarget?.amount)})? This action cannot be reversed.`}
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TransactionsPage;
