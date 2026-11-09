import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import StatCard from '../components/StatCard';
import { dashboardService, transactionService } from '../services/api';
import { useToast } from '../hooks/useToast';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const FinancialSummaryPage = ({ refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load financial analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const handleExportCSV = async () => {
    try {
      const res = await transactionService.getAll({ sortBy: 'date', sortOrder: 'desc' });
      const txs = res.data || [];
      if (txs.length === 0) {
        toast.info('No transactions to export.');
        return;
      }

      const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Description'];
      const rows = txs.map((t) => [
        new Date(t.date).toISOString().split('T')[0],
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `FinanceOS_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Financial ledger exported as CSV');
    } catch (err) {
      toast.error('Failed to export CSV: ' + err.message);
    }
  };

  if (loading && !data) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="status-dot animate-ping" style={{ marginBottom: 12 }} />
        <h3>Computing Financial Analytics...</h3>
      </div>
    );
  }

  const {
    summary = {},
    categoryBreakdown = [],
    monthlyTrends = [],
  } = data || {};

  const savingsRate = summary.monthlyIncome > 0
    ? Math.round(((summary.monthlySavings || 0) / summary.monthlyIncome) * 100)
    : 0;

  return (
    <div>
      {/* Page Title & Export Toolbar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Financial Health & Cash Flow Statement</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Holistic audit of revenue inflows, operational burn, and net capital preservation
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Primary Figures */}
      <div className="stat-grid">
        <StatCard
          title="Current Month Income"
          value={formatCurrency(summary.monthlyIncome)}
          subtitle="Total inflows earned this month"
          icon={TrendingUp}
          variant="green"
        />
        <StatCard
          title="Current Month Expenses"
          value={formatCurrency(summary.monthlyExpenses)}
          subtitle="Total outflow disbursed this month"
          icon={TrendingDown}
          variant="dark"
        />
        <StatCard
          title="Net Monthly Savings"
          value={formatCurrency(summary.monthlySavings)}
          subtitle={
            summary.monthlySavings >= 0
              ? `Retaining +${savingsRate}% of earnings`
              : 'Negative cash flow deficit'
          }
          icon={PiggyBank}
          variant={summary.monthlySavings >= 0 ? 'gold' : 'danger'}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          subtitle={
            savingsRate >= 20
              ? 'Excellent capital accumulation'
              : savingsRate > 0
              ? 'Moderate savings cushion'
              : 'Attention required'
          }
          icon={CheckCircle2}
          variant={savingsRate >= 20 ? 'green' : savingsRate > 0 ? 'gold' : 'warning'}
        />
      </div>

      {/* 6-Month Income vs Expense Trend Chart */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Income vs Expense Historical Trends</h3>
            <p className="card-subtitle">Monthly trajectory and net savings accumulation</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#171717" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE9E2" />
              <XAxis dataKey="shortMonth" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E8E5DF' }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E8E5DF' }} />
              <Tooltip
                formatter={(val) => formatCurrency(val)}
                contentStyle={{
                  backgroundColor: '#171717',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: '0.82rem' }} />
              <Area type="monotone" dataKey="income" name="Monthly Income" stroke="#C6A96B" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Monthly Expenses" stroke="#171717" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category-Wise Spending Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Category-Wise Spending Analysis</h3>
            <p className="card-subtitle">Comprehensive breakdown of all historical outflows</p>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total Outflow: <strong>{formatCurrency(summary.totalExpenses)}</strong>
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <p>No expense transactions recorded yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Transaction Count</th>
                  <th>Total Spent</th>
                  <th>Share of Expenses</th>
                  <th style={{ width: 220 }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item) => (
                  <tr key={item.category}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.percentage}%</td>
                    <td>
                      <div className="progress-bar-track" style={{ margin: 0 }}>
                        <div
                          className="progress-bar-fill progress-gold"
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummaryPage;
