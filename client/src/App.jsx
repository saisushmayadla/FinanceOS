import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import FinancialSummaryPage from './pages/FinancialSummaryPage';
import TransactionModal from './components/TransactionModal';
import ConfirmModal from './components/ConfirmModal';
import { ToastProvider, useToast } from './hooks/useToast';
import { dashboardService, transactionService } from './services/api';

const MainLayout = () => {
  const location = useLocation();
  const toast = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleGlobalTransactionSave = async (formData) => {
    await transactionService.create(formData);
    toast.success('Transaction recorded successfully');
    triggerRefresh();
  };

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await dashboardService.seedData(true);
      toast.success('Sample dataset loaded successfully!');
      setIsSeedConfirmOpen(false);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to populate demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.info('Data refreshed from MongoDB');
    }, 400);
  };

  // Dynamic header titles based on route
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Executive Financial Dashboard',
          subtitle: 'Real-time overview of cash flow, balance, and budget utilization',
        };
      case '/transactions':
        return {
          title: 'Transaction Management',
          subtitle: 'Audit, search, filter, and organize income and expense operations',
        };
      case '/budgets':
        return {
          title: 'Budget Controls',
          subtitle: 'Establish monthly category spending caps with overage alerts',
        };
      case '/summary':
        return {
          title: 'Financial Health & Analysis',
          subtitle: 'In-depth capital retention, savings rate, and historical cash flow',
        };
      default:
        return {
          title: 'FinanceOS',
          subtitle: 'Personal Finance Management System',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenTransactionModal={() => setIsTxModalOpen(true)}
          onSeedData={() => setIsSeedConfirmOpen(true)}
          isSeeding={isSeeding}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="content-body">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenTransactionModal={() => setIsTxModalOpen(true)}
                  refreshTrigger={refreshTrigger}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  refreshTrigger={refreshTrigger}
                  onTriggerRefresh={triggerRefresh}
                />
              }
            />
            <Route
              path="/budgets"
              element={
                <BudgetsPage
                  refreshTrigger={refreshTrigger}
                  onTriggerRefresh={triggerRefresh}
                />
              }
            />
            <Route
              path="/summary"
              element={<FinancialSummaryPage refreshTrigger={refreshTrigger} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleGlobalTransactionSave}
      />

      {/* Confirm Seed Demo Data Modal */}
      <ConfirmModal
        isOpen={isSeedConfirmOpen}
        title="Load Realistic Sample Data"
        message="This will populate your MongoDB database with realistic income and expense transactions, across multiple months and categories, alongside targeted monthly budgets for instant demonstration. Existing data will be reset. Proceed?"
        confirmText="Populate Demo Data"
        isDanger={false}
        onConfirm={handleSeedData}
        onCancel={() => setIsSeedConfirmOpen(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
