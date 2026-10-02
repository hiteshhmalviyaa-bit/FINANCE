import React, { useState } from 'react';
import { Wallet, Search, Plus, Eye, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Building, CreditCard } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialAccount } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { AccountModal } from './AccountModal';
import { AccountDetailModal } from './AccountDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AccountsView: React.FC = () => {
  const { accounts, deleteAccount, company, currentUser } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<FinancialAccount | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';

  const totalLiquidBalance = accounts
    .filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'gateway')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const handleDelete = () => {
    if (!deletingAccountId) return;
    const ok = deleteAccount(deletingAccountId);
    if (!ok) {
      setDeleteError('Cannot delete account that has recorded transactions.');
    } else {
      setDeletingAccountId(null);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-rose-600" />;
      case 'cash':
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wallet className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bank & Cash Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company liquidity, bank accounts, cash registers, and credit facilities
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        )}
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-xl text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-300 font-medium">Total Liquid Capital Balance</span>
          <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight mt-1 text-white">
            {formatCurrency(totalLiquidBalance, company.currencySymbol)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated across {accounts.filter((a) => a.type !== 'credit_card').length} bank & cash accounts
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/15">
          <div>
            <div className="text-slate-300">Active Accounts:</div>
            <div className="font-bold text-white text-base">
              {accounts.filter((a) => a.status === 'active').length} of {accounts.length}
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isNegative = acc.currentBalance < 0;
          return (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{acc.name}</h3>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                        {acc.type.replace('_', ' ')} {acc.accountNumber ? `· ${acc.accountNumber}` : ''}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      acc.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>

                <div className="my-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Current Balance:</span>
                    <span
                      className={`text-xl font-bold tabular-nums ${
                        isNegative ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(acc.currentBalance, company.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>Opening Balance:</span>
                    <span className="tabular-nums">
                      {formatCurrency(acc.openingBalance, company.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setViewingAccount(acc)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Ledger
                </button>

                {!isViewer && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingAccountId(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Account Modal */}
      {(isAddModalOpen || editingAccount) && (
        <AccountModal
          isOpen={isAddModalOpen || !!editingAccount}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAccount(null);
          }}
          accountToEdit={editingAccount}
        />
      )}

      {/* Account Statement Detail Modal */}
      {viewingAccount && (
        <AccountDetailModal
          isOpen={!!viewingAccount}
          onClose={() => setViewingAccount(null)}
          account={viewingAccount}
        />
      )}

      {/* Delete Confirmation */}
      {deletingAccountId && (
        <ConfirmDialog
          isOpen={!!deletingAccountId}
          onClose={() => {
            setDeletingAccountId(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
          title="Delete Account"
          message={
            deleteError ||
            'Are you sure you want to delete this account? Only accounts with zero recorded transactions can be deleted.'
          }
        />
      )}
    </div>
  );
};
