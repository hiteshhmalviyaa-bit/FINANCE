import React, { useState } from 'react';
import { Users, Search, Plus, Eye, Edit2, Trash2, Download, Building, Mail, Phone } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Customer } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { CustomerModal } from './CustomerModal';
import { CustomerProfileModal } from './CustomerProfileModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadCsv } from '../../utils/exportUtils';

export const CustomersView: React.FC = () => {
  const { customers, getCustomerMetrics, deleteCustomer, company, currentUser } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      c.companyName.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Tax ID',
      'Total Invoiced',
      'Total Paid',
      'Outstanding AR',
      'Status',
    ];
    const rows = filteredCustomers.map((c) => {
      const m = getCustomerMetrics(c.id);
      return [
        c.customerId,
        c.companyName,
        c.contactPerson,
        c.email,
        c.phone,
        c.taxId,
        m.totalInvoiced,
        m.totalPaid,
        m.outstanding,
        c.status,
      ];
    });
    downloadCsv(`Customers_Directory_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleDelete = () => {
    if (!deletingCustomerId) return;
    const ok = deleteCustomer(deletingCustomerId);
    if (!ok) {
      setDeleteError('Cannot delete customer with existing invoices. Cancel or delete the invoices first.');
    } else {
      setDeletingCustomerId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage clients, billing contacts, and lifetime receivable balances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {!isViewer && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer by name, contact, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Customer ID</th>
                <th className="py-3 px-4 font-semibold">Company / Client</th>
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Email & Phone</th>
                <th className="py-3 px-4 font-semibold text-right">Total Invoiced</th>
                <th className="py-3 px-4 font-semibold text-right">Total Paid</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding (AR)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const m = getCustomerMetrics(cust.id);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {cust.customerId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => setViewingCustomer(cust)}
                          className="hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {cust.companyName}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {cust.contactPerson}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div>{cust.email || '-'}</div>
                        <div className="text-[11px] text-slate-400">{cust.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium tabular-nums whitespace-nowrap">
                        {formatCurrency(m.totalInvoiced, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600 tabular-nums whitespace-nowrap">
                        {formatCurrency(m.totalPaid, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                        <span className={m.outstanding > 0 ? 'text-rose-600' : 'text-slate-500'}>
                          {formatCurrency(m.outstanding, company.currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            cust.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View Customer Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isViewer && (
                            <>
                              <button
                                onClick={() => setEditingCustomer(cust)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Customer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingCustomerId(cust.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <CustomerModal
          isOpen={isAddModalOpen || !!editingCustomer}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCustomer(null);
          }}
          customerToEdit={editingCustomer}
        />
      )}

      {/* Customer Profile Modal */}
      {viewingCustomer && (
        <CustomerProfileModal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          customer={viewingCustomer}
        />
      )}

      {/* Delete Confirmation */}
      {deletingCustomerId && (
        <ConfirmDialog
          isOpen={!!deletingCustomerId}
          onClose={() => {
            setDeletingCustomerId(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
          title="Delete Customer"
          message={
            deleteError ||
            'Are you sure you want to delete this customer? You cannot delete customers with existing invoices.'
          }
        />
      )}
    </div>
  );
};
