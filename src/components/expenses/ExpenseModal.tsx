import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, PaymentMethod } from '../../types/finance';
import { Modal } from '../common/Modal';
import { AttachmentUploader } from '../common/AttachmentUploader';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { vendors, categories, accounts, addExpense, updateExpense, company } = useFinance();

  const activeExpenseCategories = categories.filter(
    (c) => c.type === 'expense' && c.status === 'active'
  );
  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const activeVendors = vendors.filter((v) => v.status === 'active');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendorId, setVendorId] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [accountId, setAccountId] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setVendorId(expenseToEdit.vendorId);
      setVendorName(expenseToEdit.vendorName);
      setDescription(expenseToEdit.description);
      setCategoryId(expenseToEdit.categoryId);
      setCategoryName(expenseToEdit.categoryName);
      setAmount(expenseToEdit.amount);
      setTax(expenseToEdit.tax || 0);
      setAccountId(expenseToEdit.accountId);
      setAccountName(expenseToEdit.accountName);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setReferenceNumber(expenseToEdit.referenceNumber);
      setNotes(expenseToEdit.notes || '');
      setAttachment(expenseToEdit.attachment);
      setIsPaid(expenseToEdit.isPaid);
      setDueDate(expenseToEdit.dueDate || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      if (activeVendors.length > 0) {
        setVendorId(activeVendors[0].id);
        setVendorName(activeVendors[0].companyName);
      }
      if (activeExpenseCategories.length > 0) {
        setCategoryId(activeExpenseCategories[0].id);
        setCategoryName(activeExpenseCategories[0].name);
      }
      if (activeAccounts.length > 0) {
        setAccountId(activeAccounts[0].id);
        setAccountName(activeAccounts[0].name);
      }
      setDescription('');
      setAmount(0);
      setTax(0);
      setPaymentMethod('Bank Transfer');
      setReferenceNumber(`EXP-REF-${Math.floor(100000 + Math.random() * 900000)}`);
      setNotes('');
      setAttachment(undefined);
      setIsPaid(true);

      const due = new Date();
      due.setDate(due.getDate() + 15);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [expenseToEdit, isOpen]);

  const totalAmount = Number((Number(amount) + Number(tax)).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      alert('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!description.trim()) {
      alert('Please enter an expense description');
      return;
    }

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        date,
        vendorId,
        vendorName,
        description,
        categoryId,
        categoryName,
        amount: Number(amount),
        tax: Number(tax),
        totalAmount,
        accountId,
        accountName,
        paymentMethod,
        referenceNumber,
        notes,
        attachment,
        isPaid,
        dueDate: !isPaid ? dueDate : undefined,
      });
    } else {
      addExpense({
        date,
        vendorId,
        vendorName,
        description,
        categoryId,
        categoryName,
        amount: Number(amount),
        tax: Number(tax),
        totalAmount,
        accountId,
        accountName,
        paymentMethod,
        referenceNumber,
        notes,
        attachment,
        isPaid,
        dueDate: !isPaid ? dueDate : undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? `Edit Expense (${expenseToEdit.expenseId})` : 'Record Company Expense'}
      subtitle="Log vendor bills, operational spending, supplies, or rent"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Payment Status Switcher (Paid Now vs Accounts Payable) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-800 block">Payment Settlement</span>
            <span className="text-[11px] text-slate-500">
              {isPaid
                ? 'Paid immediately (Deducts from account balance now)'
                : 'Unpaid / On credit (Recorded in Accounts Payable)'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIsPaid(true)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                isPaid
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Now
            </button>
            <button
              type="button"
              onClick={() => setIsPaid(false)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                !isPaid
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid (Add to AP)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Expense Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Vendor / Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                const v = vendors.find((vend) => vend.id === e.target.value);
                if (v) setVendorName(v.companyName);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName} ({v.vendorId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AWS Cloud Hosting or Office Rent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                const cat = categories.find((c) => c.id === e.target.value);
                if (cat) setCategoryName(cat.name);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {activeExpenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="Card">Corporate Card</option>
              <option value="Cash">Cash / Petty Cash</option>
              <option value="UPI">UPI</option>
              <option value="PayPal">PayPal</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Account & Reference / Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {isPaid ? 'Payment Account' : 'Default Settlement Account'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                const acc = accounts.find((a) => a.id === e.target.value);
                if (acc) setAccountName(acc.name);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({company.currencySymbol}{a.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            {isPaid ? (
              <>
                <label className="block font-medium text-slate-700 mb-1">
                  Reference / Transaction #
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-881920"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </>
            ) : (
              <>
                <label className="block font-medium text-slate-700 mb-1">
                  Payment Due Date (AP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Amount, Tax, Total Amount Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Amount ({company.currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tax / GST ({company.currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={tax || ''}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Total Expense Amount
            </label>
            <div className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-bold text-sm tabular-nums">
              {company.currencySymbol}
              {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Attachment */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Attachment (Bill, receipt, tax invoice)
          </label>
          <AttachmentUploader value={attachment} onChange={setAttachment} />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            rows={2}
            placeholder="Cost center, project code, or vendor notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
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
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
          >
            {expenseToEdit ? 'Save Changes' : 'Record Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
