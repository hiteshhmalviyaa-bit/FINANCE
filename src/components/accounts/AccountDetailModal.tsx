import React from 'react';
import { FinancialAccount } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Wallet, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: FinancialAccount | null;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const { transactions, company } = useFinance();

  if (!isOpen || !account) return null;

  // Filter transactions belonging to this account
  const accountTxns = transactions.filter((t) => t.accountId === account.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Account Statement: ${account.name}`}
      subtitle={`Type: ${account.type.toUpperCase()} · Number: ${account.accountNumber || 'N/A'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Balances Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Opening Balance</span>
            <div className="text-xl font-bold text-slate-700 tabular-nums mt-0.5">
              {formatCurrency(account.openingBalance, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Created on {formatDate(account.createdAt)}
            </span>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200">
            <span className="text-[11px] text-indigo-700 font-medium">Current Book Balance</span>
            <div className="text-2xl font-bold text-indigo-900 tabular-nums mt-0.5">
              {formatCurrency(account.currentBalance, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
              Synchronized with {accountTxns.length} ledger transactions
            </span>
          </div>
        </div>

        {/* Ledger Transactions for this account */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-600" /> Account Transaction Ledger
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3 text-right">Inflow / Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountTxns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No transactions recorded in this account yet.
                    </td>
                  </tr>
                ) : (
                  accountTxns.map((txn) => {
                    const isPositive = txn.amount > 0;
                    return (
                      <tr key={txn.id}>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {formatDate(txn.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {txn.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {txn.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{txn.reference || '-'}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrency(txn.amount, company.currencySymbol)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </Modal>
  );
};
