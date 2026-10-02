import React, { useState } from 'react';
import {
  Building2,
  Tags,
  Database,
  Plus,
  Edit2,
  Ban,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';

export const SettingsView: React.FC = () => {
  const {
    company,
    updateCompany,
    categories,
    addCategory,
    updateCategory,
    toggleCategoryStatus,
    resetToDemoData,
    exportDatabaseJson,
    importDatabaseJson,
    currentUser,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'company' | 'categories' | 'backup'>('company');

  // Company Profile State
  const [name, setName] = useState(company.name);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);
  const [website, setWebsite] = useState(company.website);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);
  const [state, setState] = useState(company.state);
  const [country, setCountry] = useState(company.country);
  const [postalCode, setPostalCode] = useState(company.postalCode);
  const [taxId, setTaxId] = useState(company.taxId);
  const [currencySymbol, setCurrencySymbol] = useState(company.currencySymbol);
  const [currency, setCurrency] = useState(company.currency);
  const [invoicePrefix, setInvoicePrefix] = useState(company.invoicePrefix);
  const [invoiceNotes, setInvoiceNotes] = useState(company.invoiceNotes);
  const [paymentInstructions, setPaymentInstructions] = useState(company.paymentInstructions);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');

  // JSON Import
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';
  const isAdmin = currentUser.role === 'admin';

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      alert('Viewers cannot update company settings.');
      return;
    }

    updateCompany({
      name,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      currency,
      currencySymbol,
      invoicePrefix,
      invoiceNotes,
      paymentInstructions,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, newCatName.trim());
    } else {
      addCategory({
        name: newCatName.trim(),
        type: newCatType,
        status: 'active',
      });
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setNewCatName('');
  };

  const handleExportDownload = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinanceFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Admin can restore or import database backups.');
      return;
    }
    const success = importDatabaseJson(importJsonText);
    if (success) {
      setImportStatus('Database successfully imported and restored!');
      setImportJsonText('');
    } else {
      setImportStatus('Invalid JSON format. Please verify the backup file.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings & Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure company identity, invoice defaults, chart of categories, and system data
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors cursor-pointer border-b-2 px-1 ${
            activeTab === 'company'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Company Profile
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors cursor-pointer border-b-2 px-1 ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tags className="w-4 h-4" />
          Categories Management
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors cursor-pointer border-b-2 px-1 ${
            activeTab === 'backup'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Backup & Reset
        </button>
      </div>

      {/* TAB 1: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              Company profile and invoice settings saved successfully!
            </div>
          )}

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  disabled={isViewer}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tax / GSTIN / VAT Number</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Finance / Billing Email</label>
                <input
                  type="email"
                  disabled={isViewer}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Address Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block font-medium text-slate-700 mb-1">Office Street Address</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Currency & Invoicing Defaults</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Default Currency Code</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Default Invoice Notes</label>
                <textarea
                  rows={2}
                  disabled={isViewer}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Default Payment Instructions</label>
                <textarea
                  rows={2}
                  disabled={isViewer}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {!isViewer && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Categories group revenues and expenses for the P&L and financial reports. You can disable
              unused categories without breaking historical transaction records.
            </p>
            {!isViewer && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCatName('');
                  setNewCatType('expense');
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                <span>Income Categories</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {categories.filter((c) => c.type === 'income').length} total
                </span>
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {categories
                  .filter((c) => c.type === 'income')
                  .map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            cat.status === 'active' ? 'text-slate-800' : 'text-slate-400 line-through'
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>

                      {!isViewer && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setNewCatName(cat.name);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleCategoryStatus(cat.id)}
                            className={`p-1 rounded text-xs transition-colors ${
                              cat.status === 'active'
                                ? 'text-slate-400 hover:text-amber-600'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={cat.status === 'active' ? 'Disable Category' : 'Enable Category'}
                          >
                            {cat.status === 'active' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                <span>Expense Categories</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {categories.filter((c) => c.type === 'expense').length} total
                </span>
              </h3>
              <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto pr-1">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cat.status === 'active' ? 'bg-rose-500' : 'bg-slate-300'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            cat.status === 'active' ? 'text-slate-800' : 'text-slate-400 line-through'
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>

                      {!isViewer && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setNewCatName(cat.name);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleCategoryStatus(cat.id)}
                            className={`p-1 rounded text-xs transition-colors ${
                              cat.status === 'active'
                                ? 'text-slate-400 hover:text-amber-600'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={cat.status === 'active' ? 'Disable Category' : 'Enable Category'}
                          >
                            {cat.status === 'active' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & DATA RESET */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Download Financial Database Backup</h3>
            <p className="text-slate-600">
              Export all companies, customers, vendors, accounts, invoices, income, expenses,
              transactions, and audit trails to an offline portable JSON backup.
            </p>
            <button
              onClick={handleExportDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download JSON Database
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Restore Database from JSON</h3>
            <p className="text-slate-600">
              Paste a previously exported JSON backup to completely restore application state.
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={4}
                placeholder="Paste backup JSON content here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-hidden"
              />
              {importStatus && (
                <div
                  className={`p-2.5 rounded text-xs font-semibold ${
                    importStatus.includes('success')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importStatus}
                </div>
              )}
              <button
                type="submit"
                disabled={!importJsonText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Restore JSON Data
              </button>
            </form>
          </div>

          <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-200 space-y-3 text-xs">
            <h3 className="font-bold text-rose-900 text-sm">Factory Reset Demo Dataset</h3>
            <p className="text-rose-700">
              Clear all customized records and restore the initial pre-populated enterprise scenario
              (Acme Digital Solutions Pvt Ltd).
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all financial data back to initial seed state?')) {
                  resetToDemoData();
                  alert('Reset complete.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Dataset
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Legal & Professional Fees"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden"
              />
            </div>

            {!editingCategory && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden"
                >
                  <option value="expense">Expense Category</option>
                  <option value="income">Income Category</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
