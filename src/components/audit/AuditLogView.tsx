import React, { useState } from 'react';
import { History, Search, Download, Filter, Eye } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AuditLog } from '../../types/finance';
import { formatDateTime } from '../../utils/formatters';
import { downloadCsv } from '../../utils/exportUtils';
import { Modal } from '../common/Modal';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState('all');
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.recordId.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q));

    const matchesType =
      selectedRecordType === 'all' || log.recordType === selectedRecordType;

    return matchesSearch && matchesType;
  });

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Record Type',
      'Record ID',
      'Old Value',
      'New Value',
      'Details',
    ];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.recordType,
      log.recordId,
      log.oldValue,
      log.newValue,
      log.details || '-',
    ]);
    downloadCsv(`Audit_Trail_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const recordTypes = [
    'all',
    'Invoice',
    'Payment',
    'Income',
    'Expense',
    'Customer',
    'Vendor',
    'Account',
    'Category',
    'Settings',
    'User',
  ];

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of financial actions, modifications, disbursements, and entity changes
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by user, action, record ID, or change notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedRecordType}
          onChange={(e) => setSelectedRecordType(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700 sm:w-48"
        >
          {recordTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Record Types' : type}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Authorized User</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Record Type</th>
                <th className="py-3 px-4 font-semibold">Record ID</th>
                <th className="py-3 px-4 font-semibold">Old Value</th>
                <th className="py-3 px-4 font-semibold">New Value</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {log.recordType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-700 whitespace-nowrap">
                      {log.recordId}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.oldValue}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold font-mono text-[11px] max-w-xs truncate">
                      {log.newValue}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setViewingLog(log)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                        title="View Detailed Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {viewingLog && (
        <Modal
          isOpen={!!viewingLog}
          onClose={() => setViewingLog(null)}
          title={`Audit Log Record`}
          subtitle={`Recorded on ${formatDateTime(viewingLog.timestamp)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block">User</span>
                <span className="font-semibold text-slate-900">{viewingLog.user}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Record Type</span>
                <span className="font-semibold text-slate-900">{viewingLog.recordType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Record ID</span>
                <span className="font-mono text-indigo-700 font-bold">{viewingLog.recordId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Action</span>
                <span className="font-semibold text-slate-900">{viewingLog.action}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block font-medium">Original / Old Value:</span>
                <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded text-rose-900 font-mono text-[11px] break-all">
                  {viewingLog.oldValue}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Updated / New Value:</span>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-emerald-900 font-mono text-[11px] break-all">
                  {viewingLog.newValue}
                </div>
              </div>
            </div>

            {viewingLog.details && (
              <div>
                <span className="text-slate-400 block mb-1">Audit Details / Notes</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
                  {viewingLog.details}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
