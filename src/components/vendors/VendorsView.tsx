import React, { useState } from 'react';
import { Building2, Search, Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Vendor } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { VendorModal } from './VendorModal';
import { VendorProfileModal } from './VendorProfileModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadCsv } from '../../utils/exportUtils';

export const VendorsView: React.FC = () => {
  const { vendors, getVendorMetrics, deleteVendor, company, currentUser } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';

  const filteredVendors = vendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      v.companyName.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.vendorId.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = [
      'Vendor ID',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Tax ID',
      'Total Expenses',
      'Total Paid',
      'Outstanding AP',
      'Status',
    ];
    const rows = filteredVendors.map((v) => {
      const m = getVendorMetrics(v.id);
      return [
        v.vendorId,
        v.companyName,
        v.contactPerson,
        v.email,
        v.phone,
        v.taxId,
        m.totalExpenses,
        m.totalPaid,
        m.outstanding,
        v.status,
      ];
    });
    downloadCsv(`Vendors_Directory_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleDelete = () => {
    if (!deletingVendorId) return;
    const ok = deleteVendor(deletingVendorId);
    if (!ok) {
      setDeleteError('Cannot delete vendor with existing expense records.');
    } else {
      setDeletingVendorId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Vendor Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate suppliers, consultants, service providers, and accounts payable
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
              Add Vendor
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
            placeholder="Search vendor by company, contact, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Vendor ID</th>
                <th className="py-3 px-4 font-semibold">Company / Supplier</th>
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Email & Phone</th>
                <th className="py-3 px-4 font-semibold text-right">Total Expenses</th>
                <th className="py-3 px-4 font-semibold text-right">Total Paid</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding (AP)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No vendors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vend) => {
                  const m = getVendorMetrics(vend.id);
                  return (
                    <tr key={vend.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {vend.vendorId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => setViewingVendor(vend)}
                          className="hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {vend.companyName}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {vend.contactPerson || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div>{vend.email || '-'}</div>
                        <div className="text-[11px] text-slate-400">{vend.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums whitespace-nowrap">
                        {formatCurrency(m.totalExpenses, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {formatCurrency(m.totalPaid, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                        <span className={m.outstanding > 0 ? 'text-amber-700' : 'text-slate-500'}>
                          {formatCurrency(m.outstanding, company.currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            vend.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {vend.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingVendor(vend)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View Vendor Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isViewer && (
                            <>
                              <button
                                onClick={() => setEditingVendor(vend)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Vendor"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingVendorId(vend.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Vendor"
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
      {(isAddModalOpen || editingVendor) && (
        <VendorModal
          isOpen={isAddModalOpen || !!editingVendor}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVendor(null);
          }}
          vendorToEdit={editingVendor}
        />
      )}

      {/* Vendor Profile Modal */}
      {viewingVendor && (
        <VendorProfileModal
          isOpen={!!viewingVendor}
          onClose={() => setViewingVendor(null)}
          vendor={viewingVendor}
        />
      )}

      {/* Delete Confirmation */}
      {deletingVendorId && (
        <ConfirmDialog
          isOpen={!!deletingVendorId}
          onClose={() => {
            setDeletingVendorId(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
          title="Delete Vendor"
          message={
            deleteError ||
            'Are you sure you want to delete this vendor? You cannot delete vendors with logged expenses.'
          }
        />
      )}
    </div>
  );
};
