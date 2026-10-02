import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar, NavModule } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeView } from './components/income/IncomeView';
import { IncomeModal } from './components/income/IncomeModal';
import { ExpenseView } from './components/expenses/ExpenseView';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { InvoiceView } from './components/invoices/InvoiceView';
import { InvoiceModal } from './components/invoices/InvoiceModal';
import { RecordPaymentModal } from './components/invoices/RecordPaymentModal';
import { CustomersView } from './components/customers/CustomersView';
import { VendorsView } from './components/vendors/VendorsView';
import { AccountsView } from './components/accounts/AccountsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { ProfitLossView } from './components/profit-loss/ProfitLossView';
import { BalanceSheetView } from './components/balance-sheet/BalanceSheetView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { UsersView } from './components/users/UsersView';
import { AuditLogView } from './components/audit/AuditLogView';
import { LoginView } from './components/auth/LoginView';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentModule, setCurrentModule] = useState<NavModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Global Quick Action Modals
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState<boolean>(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(mod) => setCurrentModule(mod)}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
            onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          />
        );
      case 'income':
        return <IncomeView />;
      case 'expenses':
        return <ExpenseView />;
      case 'invoices':
        return <InvoiceView />;
      case 'customers':
        return <CustomersView />;
      case 'vendors':
        return <VendorsView />;
      case 'accounts':
        return <AccountsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'profit-loss':
        return <ProfitLossView />;
      case 'balance-sheet':
        return <BalanceSheetView />;
      case 'reports':
        return <ReportsView onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'settings':
        return <SettingsView />;
      case 'users':
        return <UsersView />;
      case 'audit-log':
        return <AuditLogView />;
      default:
        return (
          <DashboardView
            onNavigate={(mod) => setCurrentModule(mod)}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
            onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          currentModule={currentModule}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddIncome={() => setIsAddIncomeOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      {isAddIncomeOpen && (
        <IncomeModal
          isOpen={isAddIncomeOpen}
          onClose={() => setIsAddIncomeOpen(false)}
        />
      )}

      {isAddExpenseOpen && (
        <ExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}

      {isCreateInvoiceOpen && (
        <InvoiceModal
          isOpen={isCreateInvoiceOpen}
          onClose={() => setIsCreateInvoiceOpen(false)}
        />
      )}

      {isRecordPaymentOpen && (
        <RecordPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          invoice={null}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
