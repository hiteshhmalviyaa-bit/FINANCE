import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  UserCheck,
  RotateCcw,
  ChevronDown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavModule } from './Sidebar';
import { UserRole } from '../../types/finance';

interface NavbarProps {
  currentModule: NavModule;
  onOpenSidebar: () => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenCreateInvoice: () => void;
  onOpenRecordPayment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onOpenSidebar,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenCreateInvoice,
  onOpenRecordPayment,
}) => {
  const { currentUser, setCurrentUser, users, resetToDemoData, company } = useFinance();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModuleTitle = () => {
    switch (currentModule) {
      case 'dashboard':
        return 'Financial Overview';
      case 'income':
        return 'Income Management';
      case 'expenses':
        return 'Expense Management';
      case 'invoices':
        return 'Customer Invoices';
      case 'customers':
        return 'Customer Directory';
      case 'vendors':
        return 'Vendor Directory';
      case 'accounts':
        return 'Bank & Cash Accounts';
      case 'transactions':
        return 'Central Transaction Ledger';
      case 'profit-loss':
        return 'Profit & Loss Statement';
      case 'balance-sheet':
        return 'Company Balance Sheet';
      case 'reports':
        return 'Financial Reports & Exports';
      case 'settings':
        return 'Company & Application Settings';
      case 'users':
        return 'Users & Access Control';
      case 'audit-log':
        return 'Financial Audit Trail';
      default:
        return 'FinanceFlow';
    }
  };

  const handleRoleSwitch = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
    } else {
      setCurrentUser({
        ...currentUser,
        role,
        name: role === 'admin' ? 'Aditi Rao' : role === 'finance' ? 'Kunal Sharma' : 'Priya Nair',
      });
    }
    setShowUserMenu(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="text-[10px] uppercase font-semibold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Admin</span>;
      case 'finance':
        return <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Finance</span>;
      case 'viewer':
        return <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Viewer</span>;
    }
  };

  const isViewer = currentUser.role === 'viewer';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left title and mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getModuleTitle()}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>{company.name}</span>
            <span aria-hidden="true">·</span>
            <span>FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button with Dropdown */}
        {!isViewer && (
          <div className="relative" ref={quickMenuRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenAddIncome();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Record Income</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenAddExpense();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Record Expense</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenCreateInvoice();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenRecordPayment();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Record Invoice Payment</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo reset button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all financial data back to initial demo dataset?')) {
              resetToDemoData();
            }
          }}
          title="Reset to initial demo data"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
              </div>

              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role (MVP Testing)
              </div>

              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  currentUser.role === 'admin' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                }`}
              >
                <div>
                  <div>Admin</div>
                  <div className="text-[10px] text-slate-400">Full system & financial control</div>
                </div>
                {currentUser.role === 'admin' && <span className="text-indigo-600 font-bold">✓</span>}
              </button>

              <button
                onClick={() => handleRoleSwitch('finance')}
                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  currentUser.role === 'finance' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                }`}
              >
                <div>
                  <div>Finance User</div>
                  <div className="text-[10px] text-slate-400">Can add/edit transactions, no admin settings</div>
                </div>
                {currentUser.role === 'finance' && <span className="text-indigo-600 font-bold">✓</span>}
              </button>

              <button
                onClick={() => handleRoleSwitch('viewer')}
                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  currentUser.role === 'viewer' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                }`}
              >
                <div>
                  <div>Viewer</div>
                  <div className="text-[10px] text-slate-400">Read-only view of finances and reports</div>
                </div>
                {currentUser.role === 'viewer' && <span className="text-indigo-600 font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
