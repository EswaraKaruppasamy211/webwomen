'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Shield,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { EmergencyIncident, SafetyReport, AuditLog } from '../../types';
import { socketClient } from '../../services/socket';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    newReportsCount: 0,
    totalUsersCount: 0,
    resolvedEmergenciesCount: 0,
    safetyZonesCount: 0,
    avgResponseTimeSec: 45,
  });

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyIncident[]>([]);
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      setStats(res.stats);
      setActiveEmergencies(res.activeEmergencies);
      setRecentReports(res.recentReports);
      setRecentLogs(res.recentAuditLogs);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();

    const unsubNew = socketClient.onEmergencyNew(() => {
      fetchOverview();
    });

    const unsubStatus = socketClient.onStatusChange(() => {
      fetchOverview();
    });

    return () => {
      unsubNew();
      unsubStatus();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Emergency Response Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident dispatch, telemetry streams, and community safety status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOverview()}
            className="p-2.5 bg-safeNavy-900 hover:bg-safeNavy-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/live"
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Open Live Incident Map</span>
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards Required by Prompt */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Emergencies */}
        <div className="bg-safeNavy-900 border border-red-500/40 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Active SOS</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-ping" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats.activeEmergencies}</p>
          <p className="text-[11px] text-red-300 mt-1 font-medium">Critical Emergencies In-Flight</p>
        </div>

        {/* New Reports */}
        <div className="bg-safeNavy-900 border border-amber-500/40 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">New Reports</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats.newReportsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending Moderation</p>
        </div>

        {/* Active Users */}
        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Active Users</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats.totalUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Registered App Members</p>
        </div>

        {/* Resolved Emergencies */}
        <div className="bg-safeNavy-900 border border-emerald-500/40 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats.resolvedEmergenciesCount}</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Successfully Resolved</p>
        </div>

        {/* Average Dispatch Time */}
        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-safeTeal-400 uppercase tracking-wider">Avg. Ack Time</span>
            <div className="w-8 h-8 rounded-xl bg-safeTeal-500/20 text-safeTeal-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats.avgResponseTimeSec}s</p>
          <p className="text-[11px] text-slate-400 mt-1">Dispatcher Response Metric</p>
        </div>
      </div>

      {/* Active Emergencies Queue Table */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-base text-white">Active Emergency Incidents Queue</h2>
          </div>
          <Link
            href="/admin/live"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <span>Live Command View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeEmergencies.length === 0 ? (
          <div className="bg-safeNavy-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">All Clear – Zero Active Emergencies</p>
            <p className="text-slate-500 mt-1">Real-time socket listener waiting for SOS triggers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-safeNavy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Started</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {activeEmergencies.map((inc) => (
                  <tr key={inc.id} className="hover:bg-safeNavy-850/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-rose-400">{inc.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-white">{inc.userName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{inc.userPhone}</p>
                    </td>
                    <td className="p-3">
                      <p className="truncate max-w-xs">{inc.address}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)} (±{Math.round(inc.accuracy)}m)
                      </p>
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(inc.startedAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/live?selected=${inc.id}`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
                      >
                        Dispatch / View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Split Grid: Recent Safety Reports + Security Audit Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Community Hazard Reports */}
        <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm text-white">Recent Safety Reports</h2>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Moderate All
            </Link>
          </div>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent safety reports.</p>
            ) : (
              recentReports.slice(0, 4).map((rep) => (
                <div
                  key={rep.id}
                  className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate max-w-xs">{rep.title}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rep.address}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Trail */}
        <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm text-white">Recent Security Audit Logs</h2>
            </div>
            <Link href="/admin/audit" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View Audit Log
            </Link>
          </div>

          <div className="space-y-2.5 font-mono text-[11px]">
            {recentLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="bg-safeNavy-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-indigo-300">[{log.action}]</span>{' '}
                  <span className="text-slate-400">{log.details}</span>
                </div>
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
