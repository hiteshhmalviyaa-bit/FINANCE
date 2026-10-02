import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Scale,
  TrendingUp,
  TrendingDown,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadCsv, triggerPrint } from '../../utils/exportUtils';
import { NavModule } from '../layout/Sidebar';

type ReportType =
  | 'pnl'
  | 'balance_sheet'
  | 'income'
  | 'expenses'
  | 'invoices'
  | 'receivables'
  | 'payables'
  | 'transactions';

interface ReportsViewProps {
  onNavigate: (module: NavModule) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const {
    income,
    expenses,
    invoices,
    accounts,
    customers,
    vendors,
    transactions,
    calculateMetrics,
    company,
  } = useFinance();

  const [activeReport, setActiveReport] = useState<ReportType>('income');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Filter helper
  const isInDateRange = (dateStr?: string) => {
    if (!dateStr) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  const reportItems: {
    id: ReportType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'pnl',
      title: '1. Profit & Loss Statement',
      description: 'Operating revenues, operating expenses, and net profit',
      icon: PieChart,
    },
    {
      id: 'balance_sheet',
      title: '2. Balance Sheet',
      description: 'Assets, liabilities, and shareholder equity verification',
      icon: Scale,
    },
    {
      id: 'income',
      title: '3. Income Report',
      description: 'Detailed analysis of all company revenues and customer inflows',
      icon: TrendingUp,
    },
    {
      id: 'expenses',
      title: '4. Expense Report',
      description: 'Comprehensive disbursement records by vendor and category',
      icon: TrendingDown,
    },
    {
      id: 'invoices',
      title: '5. Invoice Report',
      description: 'All generated customer invoices, statuses, and collections',
      icon: FileText,
    },
    {
      id: 'receivables',
      title: '6. Accounts Receivable (AR)',
      description: 'Unpaid customer balances and overdue payment tracking',
      icon: ArrowDownLeft,
    },
    {
      id: 'payables',
      title: '7. Accounts Payable (AP)',
      description: 'Outstanding vendor liabilities and scheduled payment obligations',
      icon: ArrowUpRight,
    },
    {
      id: 'transactions',
      title: '8. Account Transactions',
      description: 'Full ledger statement across all company bank and cash accounts',
      icon: ArrowLeftRight,
    },
  ];

  // Export current active report to CSV
  const handleExportCurrent = () => {
    const today = new Date().toISOString().split('T')[0];

    if (activeReport === 'income') {
      const filtered = income.filter((i) => isInDateRange(i.date));
      const headers = ['Date', 'Income ID', 'Customer', 'Category', 'Account', 'Amount', 'Tax', 'Total Amount', 'Reference'];
      const rows = filtered.map((i) => [
        i.date,
        i.incomeId,
        i.customerName,
        i.categoryName,
        i.accountName,
        i.amount,
        i.tax,
        i.totalAmount,
        i.referenceNumber,
      ]);
      downloadCsv(`Income_Report_${today}`, headers, rows);
    } else if (activeReport === 'expenses') {
      const filtered = expenses.filter((e) => isInDateRange(e.date));
      const headers = ['Date', 'Expense ID', 'Vendor', 'Category', 'Account', 'Amount', 'Tax', 'Total Amount', 'Status', 'Reference'];
      const rows = filtered.map((e) => [
        e.date,
        e.expenseId,
        e.vendorName,
        e.categoryName,
        e.accountName,
        e.amount,
        e.tax,
        e.totalAmount,
        e.isPaid ? 'Paid' : 'Unpaid (AP)',
        e.referenceNumber,
      ]);
      downloadCsv(`Expenses_Report_${today}`, headers, rows);
    } else if (activeReport === 'invoices') {
      const filtered = invoices.filter((i) => isInDateRange(i.invoiceDate));
      const headers = ['Invoice #', 'Date', 'Due Date', 'Customer', 'Subtotal', 'Tax', 'Total', 'Paid', 'Outstanding', 'Status'];
      const rows = filtered.map((i) => {
        const paid = i.payments.reduce((s, p) => s + p.amount, 0);
        return [
          i.invoiceNumber,
          i.invoiceDate,
          i.dueDate,
          i.customerName,
          i.subtotal,
          i.totalTax,
          i.total,
          paid,
          Math.max(0, i.total - paid),
          i.status,
        ];
      });
      downloadCsv(`Invoices_Report_${today}`, headers, rows);
    } else if (activeReport === 'receivables') {
      const unpaidInvoices = invoices.filter((i) => {
        const paid = i.payments.reduce((s, p) => s + p.amount, 0);
        return i.status !== 'cancelled' && i.total - paid > 0.01;
      });
      const headers = ['Customer', 'Invoice #', 'Invoice Date', 'Due Date', 'Total Amount', 'Paid So Far', 'Outstanding Due'];
      const rows = unpaidInvoices.map((i) => {
        const paid = i.payments.reduce((s, p) => s + p.amount, 0);
        return [
          i.customerName,
          i.invoiceNumber,
          i.invoiceDate,
          i.dueDate,
          i.total,
          paid,
          i.total - paid,
        ];
      });
      downloadCsv(`Accounts_Receivable_Report_${today}`, headers, rows);
    } else if (activeReport === 'payables') {
      const unpaidExpenses = expenses.filter((e) => !e.isPaid);
      const headers = ['Vendor', 'Expense ID', 'Date', 'Due Date', 'Description', 'Category', 'Outstanding Payable'];
      const rows = unpaidExpenses.map((e) => [
        e.vendorName,
        e.expenseId,
        e.date,
        e.dueDate || '-',
        e.description,
        e.categoryName,
        e.totalAmount,
      ]);
      downloadCsv(`Accounts_Payable_Report_${today}`, headers, rows);
    } else if (activeReport === 'transactions') {
      const filtered = transactions.filter((t) => isInDateRange(t.date));
      const headers = ['Txn ID', 'Date', 'Type', 'Description', 'Category', 'Account', 'Amount', 'Reference'];
      const rows = filtered.map((t) => [
        t.transactionId,
        t.date,
        t.type,
        t.description,
        t.category,
        t.accountName,
        t.amount,
        t.reference,
      ]);
      downloadCsv(`Transactions_Ledger_Report_${today}`, headers, rows);
    } else if (activeReport === 'pnl') {
      onNavigate('profit-loss');
    } else if (activeReport === 'balance_sheet') {
      onNavigate('balance-sheet');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Reports & Exports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download and inspect all 8 company financial statements with customizable date intervals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-slate-700 focus:outline-hidden text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-slate-700 focus:outline-hidden text-xs"
            />
          </div>

          <button
            onClick={handleExportCurrent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Selected (CSV)
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        {reportItems.map((r) => {
          const Icon = r.icon;
          const isSelected = activeReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                if (r.id === 'pnl') onNavigate('profit-loss');
                else if (r.id === 'balance_sheet') onNavigate('balance-sheet');
                else setActiveReport(r.id);
              }}
              className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">{r.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                <span>View Details</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Active Report Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Active Report Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {reportItems.find((r) => r.id === activeReport)?.title}
            </h3>
            <p className="text-xs text-slate-500">
              Date Filter: {startDate} to {endDate}
            </p>
          </div>
          <button
            onClick={triggerPrint}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Accounts Receivable Report */}
        {activeReport === 'receivables' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Invoice Date</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4 text-right">Invoice Total</th>
                  <th className="py-2.5 px-4 text-right">Paid So Far</th>
                  <th className="py-2.5 px-4 text-right font-bold text-rose-600">
                    Outstanding (AR)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices
                  .filter((i) => {
                    const paid = i.payments.reduce((s, p) => s + p.amount, 0);
                    return i.status !== 'cancelled' && i.total - paid > 0.01;
                  })
                  .map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                    const outstanding = inv.total - paid;
                    return (
                      <tr key={inv.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {inv.customerName}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          {formatCurrency(inv.total, company.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-emerald-600 font-medium">
                          {formatCurrency(paid, company.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-rose-600">
                          {formatCurrency(outstanding, company.currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Accounts Payable Report */}
        {activeReport === 'payables' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Expense ID</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right font-bold text-amber-700">
                    Outstanding Payable (AP)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses
                  .filter((e) => !e.isPaid)
                  .map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-3 px-4 font-semibold text-slate-900">{exp.vendorName}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {exp.expenseId}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {exp.dueDate ? formatDate(exp.dueDate) : '-'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                        {exp.description}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{exp.categoryName}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-800">
                        {formatCurrency(exp.totalAmount, company.currencySymbol)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Income Report */}
        {activeReport === 'income' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Income ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4 text-right font-bold text-emerald-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {income
                  .filter((i) => isInDateRange(i.date))
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 text-slate-600">{formatDate(item.date)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {item.incomeId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.customerName}</td>
                      <td className="py-3 px-4 text-slate-600">{item.categoryName}</td>
                      <td className="py-3 px-4 text-slate-600">{item.accountName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.referenceNumber}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-600">
                        {formatCurrency(item.totalAmount, company.currencySymbol)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Expenses Report */}
        {activeReport === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Expense ID</th>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right font-bold text-rose-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses
                  .filter((e) => isInDateRange(e.date))
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 text-slate-600">{formatDate(item.date)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {item.expenseId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.vendorName}</td>
                      <td className="py-3 px-4 text-slate-600">{item.categoryName}</td>
                      <td className="py-3 px-4 text-slate-600">{item.accountName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.isPaid
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.isPaid ? 'Paid' : 'Unpaid (AP)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-rose-600">
                        {formatCurrency(item.totalAmount, company.currencySymbol)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Invoices Report */}
        {activeReport === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Paid</th>
                  <th className="py-2.5 px-4 text-right">Outstanding</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices
                  .filter((i) => isInDateRange(i.invoiceDate))
                  .map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                    const rem = Math.max(0, inv.total - paid);
                    return (
                      <tr key={inv.id}>
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{inv.customerName}</td>
                        <td className="py-3 px-4 text-right tabular-nums font-semibold">
                          {formatCurrency(inv.total, company.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-emerald-600 font-medium">
                          {formatCurrency(paid, company.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-rose-600 font-bold">
                          {formatCurrency(rem, company.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Account Transactions Report */}
        {activeReport === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Txn ID</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions
                  .filter((t) => isInDateRange(t.date))
                  .map((t) => (
                    <tr key={t.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {t.transactionId}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(t.date)}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-500">
                        {t.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{t.description}</td>
                      <td className="py-3 px-4 text-slate-600">{t.accountName}</td>
                      <td
                        className={`py-3 px-4 text-right font-bold tabular-nums ${
                          t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.amount > 0 ? '+' : ''}
                        {formatCurrency(t.amount, company.currencySymbol)}
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
