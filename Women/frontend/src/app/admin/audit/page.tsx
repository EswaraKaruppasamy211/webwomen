'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Shield, Search, RefreshCw, Clock, Filter, User } from 'lucide-react';
import { api } from '../../../services/api';
import { AuditLog } from '../../../types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs(150);
      setLogs(res.logs);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Immutable Security Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Security Audit Log Stream</h1>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-1.5 bg-safeNavy-900 hover:bg-safeNavy-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit logs by action, actor, or keyword..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-safeNavy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Incident / Ref</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-safeNavy-850/60 transition-colors">
                    <td className="p-3 text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-white">{log.actorName}</span>
                      <span className="text-[10px] text-indigo-400 block font-normal">
                        ({log.actorRole})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-rose-400 font-bold">{log.incidentId || '—'}</td>
                    <td className="p-3 text-slate-300 font-sans max-w-sm leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
