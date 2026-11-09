import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Layers,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/api';
import { useToast } from '../hooks/useToast';

const PIE_COLORS = [
  '#C6A96B', // champagne gold
  '#171717', // deep black
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
  '#14B8A6', // teal
  '#F97316', // orange
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const DashboardPage = ({ onOpenTransactionModal, refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve dashboard figures');
      toast.error('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  if (loading && !data) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="status-dot animate-ping" style={{ width: 14, height: 14, marginBottom: 16 }} />
        <h3>Loading Financial Ledger...</h3>
        <p>Aggregating income, expenses, and budget usage from MongoDB.</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <AlertTriangle size={24} />
        </div>
        <h3>Failed to Connect to Database</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboard}>
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    summary = {},
    budgetOverview = [],
    categoryBreakdown = [],
    monthlyTrends = [],
    recentTransactions = [],
  } = data || {};

  const totalBudgetRemaining = Math.max(0, (summary.totalBudget || 0) - (summary.totalBudgetSpent || 0));
  const budgetSpentPct = summary.totalBudget > 0
    ? Math.round(((summary.totalBudgetSpent || 0) / summary.totalBudget) * 100)
    : 0;

  const hasData = recentTransactions.length > 0 || (summary.totalIncome > 0 || summary.totalExpenses > 0);

  // Check for any budget category exceeding 100%
  const exceededBudgets = budgetOverview.filter((b) => b.isExceeded);

  return (
    <div>
      {/* Exceeded Budget Alert Banner */}
      {exceededBudgets.length > 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700 }}>Budget Alert: Spending Limit Exceeded</div>
            <div style={{ fontSize: '0.84rem', marginTop: 2 }}>
              {exceededBudgets.map((b) => b.category).join(', ')} has surpassed its allocated monthly cap. Consider reallocating funds.
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          subtitle={`This Month: ${formatCurrency(summary.monthlyIncome)}`}
          icon={ArrowUpRight}
          variant="green"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          subtitle={`This Month: ${formatCurrency(summary.monthlyExpenses)}`}
          icon={ArrowDownRight}
          variant="dark"
        />
        <StatCard
          title="Current Balance"
          value={formatCurrency(summary.currentBalance)}
          subtitle={
            summary.currentBalance >= 0
              ? `Healthy Surplus (${summary.savingsRate || 0}% Savings Rate)`
              : 'Deficit Warning'
          }
          icon={Wallet}
          variant="gold"
        />
        <StatCard
          title="Active Monthly Budget"
          value={formatCurrency(summary.totalBudget)}
          subtitle={
            summary.totalBudget > 0
              ? `${formatCurrency(totalBudgetRemaining)} remaining (${budgetSpentPct}% utilized)`
              : 'No budget established'
          }
          icon={Target}
          variant={budgetSpentPct > 100 ? 'warning' : 'gold'}
        />
      </div>

      {!hasData ? (
        <div className="card empty-state" style={{ padding: 48, marginTop: 20 }}>
          <div className="empty-icon">
            <Layers size={28} />
          </div>
          <h3>Welcome to FinanceOS</h3>
          <p>
            Your database currently has no records. You can either record your first transaction or click the <strong>Demo Data</strong> button in the top bar to load realistic financial history.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-accent" onClick={onOpenTransactionModal}>
              <Plus size={16} /> Record Transaction
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="charts-grid">
            {/* Monthly Cash Flow Trends */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Monthly Cash Flow</h3>
                  <p className="card-subtitle">Income vs Expenses over the past 6 months</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE9E2" />
                    <XAxis dataKey="shortMonth" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E8E5DF' }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E8E5DF' }} />
                    <Tooltip
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#262626',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 12, fontSize: '0.82rem' }} />
                    <Bar dataKey="income" name="Income" fill="#C6A96B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#171717" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Allocation Donut */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Expense Breakdown</h3>
                  <p className="card-subtitle">Spending distribution by category</p>
                </div>
              </div>
              {categoryBreakdown.length === 0 ? (
                <div className="empty-state" style={{ height: 260 }}>
                  <p>No expense data recorded yet.</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={{
                          backgroundColor: '#171717',
                          borderRadius: '8px',
                          color: '#FFF',
                          fontSize: '0.82rem',
                          border: 'none',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Category Legend Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: -20, maxHeight: 60, overflowY: 'auto' }}>
                    {categoryBreakdown.slice(0, 5).map((cat, idx) => (
                      <span key={cat.category} style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        {cat.category} ({cat.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lower Grid: Budget Usage & Recent Transactions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>
            {/* Budget Overview Widget */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Budget Overview</h3>
                  <p className="card-subtitle">Monthly limits and real-time consumption</p>
                </div>
                <Link to="/budgets" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  Manage
                </Link>
              </div>

              {budgetOverview.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>No budgets configured for this month.</p>
                  <Link to="/budgets" className="btn btn-secondary btn-sm">
                    Create Budget
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {budgetOverview.slice(0, 5).map((item) => {
                    let progressClass = 'progress-gold';
                    if (item.percentage >= 100) progressClass = 'progress-danger';
                    else if (item.percentage >= 80) progressClass = 'progress-warning';

                    return (
                      <div key={item._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{item.category}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                            <strong>{formatCurrency(item.spent)}</strong> / {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="progress-bar-track">
                          <div
                            className={`progress-bar-fill ${progressClass}`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          <span>
                            {item.isExceeded ? (
                              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                Overspent by {formatCurrency(Math.abs(item.remaining))}
                              </span>
                            ) : (
                              `${formatCurrency(item.remaining)} remaining`
                            )}
                          </span>
                          <span style={{ fontWeight: 600 }}>{item.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Transactions Widget */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent Transactions</h3>
                  <p className="card-subtitle">Latest additions to your account</p>
                </div>
                <Link to="/transactions" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>No recent transactions to display.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{tx.title}</div>
                            {tx.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {tx.description.substring(0, 36)}...
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-category">{tx.category}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={tx.type === 'income' ? 'amount-income' : 'amount-expense'}>
                              {tx.type === 'income' ? '+' : '-'}
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
