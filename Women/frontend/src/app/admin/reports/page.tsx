'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertTriangle,
  Trash2,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { api } from '../../../services/api';
import { SafetyReport } from '../../../types';
import { audioAlerts } from '../../../services/audioAlerts';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.getReports(statusFilter);
      setReports(res.reports);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      audioAlerts.playClick(status === 'APPROVED' ? 800 : 400, 0.1);
      await api.moderateReport(id, status);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate report');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.deleteReport(id);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Community Reports Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user-submitted safety hazards and approve verified items to public navigation maps.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-safeNavy-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
            No reports found for filter &ldquo;{statusFilter}&rdquo;.
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white">{rep.title}</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      rep.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : rep.status === 'PENDING'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {rep.status}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    Severity: {rep.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {rep.address} ({rep.latitude.toFixed(4)}, {rep.longitude.toFixed(4)})
                  </span>
                  <span>Author: {rep.userName}</span>
                  <span>Date: {new Date(rep.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                {rep.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleModerate(rep.id, 'APPROVED')}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                )}

                {rep.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleModerate(rep.id, 'REJECTED')}
                    className="flex items-center gap-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rep.id)}
                  className="p-2 bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-400 rounded-xl transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
