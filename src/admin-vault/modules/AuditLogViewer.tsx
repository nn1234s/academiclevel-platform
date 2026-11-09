import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { AuditLogEntry } from '../../core/types';
import { ShieldCheck, AlertTriangle, Info, Search, RefreshCw } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() =>
    StorageRLSLayer.getAuditLogsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [search, setSearch] = useState('');

  const refreshLogs = () => {
    setLogs(StorageRLSLayer.getAuditLogsAdmin(SUPER_ADMIN_EMAIL));
  };

  const filtered = logs.filter(
    l =>
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Immutable Platform Security Audit Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic ledger tracking administrative approvals, revocations, and security anomaly events.
          </p>
        </div>

        <button
          onClick={refreshLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white">Recorded Audit Entries ({filtered.length})</span>
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono sticky top-0">
              <tr>
                <th className="p-3">Severity & Type</th>
                <th className="p-3">Actor / Principal</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">UTC Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                        entry.severity === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : entry.severity === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {entry.severity === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                      {entry.severity === 'INFO' && <Info className="w-3 h-3" />}
                      <span>{entry.actionType}</span>
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-semibold">{entry.actorEmail}</td>
                  <td className="p-3 text-indigo-300">{entry.targetId}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{entry.details}</td>
                  <td className="p-3 text-right text-slate-500">
                    {new Date(entry.timestampUtc).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
