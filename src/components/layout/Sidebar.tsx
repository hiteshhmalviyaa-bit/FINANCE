import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Building2,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Scale,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export type NavModule =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'invoices'
  | 'customers'
  | 'vendors'
  | 'accounts'
  | 'transactions'
  | 'profit-loss'
  | 'balance-sheet'
  | 'reports'
  | 'settings'
  | 'users'
  | 'audit-log';

interface SidebarProps {
  currentModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const { company, calculateMetrics, currentUser } = useFinance();
  const metrics = calculateMetrics();

  const navItems: {
    id: NavModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      badge: metrics.accountsPayable > 0 ? 'AP' : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      badge: metrics.overdueInvoicesCount > 0 ? `${metrics.overdueInvoicesCount} overdue` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'profit-loss', label: 'Profit & Loss', icon: PieChart },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: Scale },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'users', label: 'Users & Permissions', icon: ShieldCheck },
    { id: 'audit-log', label: 'Audit Log', icon: History },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate tracking-tight">
                {company.name}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Internal Finance MVP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Core Modules
          </div>
          {navItems.slice(0, 8).map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Financial Statements
          </div>
          {navItems.slice(8, 11).map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Administration
          </div>
          {navItems.slice(11).map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info: Active User role info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Currency:</span>
            <span className="font-semibold text-slate-200">
              {company.currency} ({company.currencySymbol})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Single Source:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Synchronized
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
