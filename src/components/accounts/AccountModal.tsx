import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType, FinancialAccount } from '../../types/finance';
import { Modal } from '../common/Modal';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: FinancialAccount | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, updateAccount, company } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBankName(accountToEdit.bankName || '');
      setAccountNumber(accountToEdit.accountNumber || '');
      setOpeningBalance(accountToEdit.openingBalance);
      setStatus(accountToEdit.status);
    } else {
      setName('');
      setType('bank');
      setBankName('');
      setAccountNumber('');
      setOpeningBalance(0);
      setStatus('active');
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an account name');
      return;
    }

    if (accountToEdit) {
      updateAccount(accountToEdit.id, {
        name,
        type,
        bankName,
        accountNumber,
        status,
      });
    } else {
      addAccount({
        name,
        type,
        bankName,
        accountNumber,
        currency: company.currency,
        openingBalance: Number(openingBalance),
        status,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account' : 'Add Bank or Cash Account'}
      subtitle="Configure money accounts to store, receive and disburse funds"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Account Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HDFC Operating Current A/C"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Account Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="bank">Bank Account</option>
              <option value="cash">Cash / Petty Cash</option>
              <option value="gateway">Payment Gateway</option>
              <option value="credit_card">Corporate Credit Card</option>
              <option value="other">Other Asset / Liability</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bank / Institution</label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank Ltd"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Account / Masked Number</label>
            <input
              type="text"
              placeholder="e.g. •••• 4145"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Opening Balance ({company.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              disabled={!!accountToEdit}
              placeholder="0.00"
              value={openingBalance || ''}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
          >
            {accountToEdit ? 'Save Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
