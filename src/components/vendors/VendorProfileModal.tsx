import React from 'react';
import { Vendor } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Building, Mail, Phone, MapPin, Receipt, Clock, CheckCircle2 } from 'lucide-react';

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export const VendorProfileModal: React.FC<VendorProfileModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  const { getVendorMetrics, company } = useFinance();

  if (!isOpen || !vendor) return null;

  const metrics = getVendorMetrics(vendor.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vendor Profile: ${vendor.companyName}`}
      subtitle={`Vendor ID: ${vendor.vendorId} · Added ${formatDate(vendor.createdAt)}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Billed Expenses</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {formatCurrency(metrics.totalExpenses, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {metrics.expenses.length} bills recorded
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-medium">Total Disbursed / Paid</span>
            <div className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
              {formatCurrency(metrics.totalPaid, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-emerald-600 mt-1 block">Settled payments</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
            <span className="text-[11px] text-amber-800 font-medium">Outstanding Payable (AP)</span>
            <div className="text-lg font-bold text-amber-700 tabular-nums mt-0.5">
              {formatCurrency(metrics.outstanding, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-amber-600 mt-1 block">Pending payment</span>
          </div>
        </div>

        {/* Vendor Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Building className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Contact:</strong> {vendor.contactPerson || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Email:</strong> {vendor.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Phone:</strong> {vendor.phone || 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Address:</strong> {vendor.address || 'N/A'},{' '}
                {vendor.country}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tax / GST Number:</span>{' '}
              <span className="font-mono text-slate-800">{vendor.taxId || 'N/A'}</span>
            </div>
            {vendor.notes && (
              <p className="text-[11px] text-slate-500 italic mt-1">{vendor.notes}</p>
            )}
          </div>
        </div>

        {/* Expense History */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-rose-600" /> Expense & Bill History
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Expense ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      No expense records found for this vendor.
                    </td>
                  </tr>
                ) : (
                  metrics.expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {exp.expenseId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{formatDate(exp.date)}</td>
                      <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-800">
                        {exp.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{exp.categoryName}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums text-rose-600">
                        {formatCurrency(exp.totalAmount, company.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {exp.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> Unpaid (AP)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
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
            Close Profile
          </button>
        </div>
      </div>
    </Modal>
  );
};
