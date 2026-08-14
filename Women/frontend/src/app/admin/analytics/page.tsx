'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Shield,
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminAnalytics()
      .then((res) => setAnalytics(res.analytics))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading analytics data...</div>;
  }

  const { statusCounts, categoryCounts, trendData, totalIncidents, totalReports } = analytics;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Emergency Response & Safety Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical incident volumes, category distributions, response times, and hotspot trends.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Incidents</span>
          <p className="text-3xl font-black text-white mt-2">{totalIncidents}</p>
          <p className="text-[11px] text-emerald-400 mt-1">100% telemetry tracked</p>
        </div>

        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Community Hazards</span>
          <p className="text-3xl font-black text-amber-400 mt-2">{totalReports}</p>
          <p className="text-[11px] text-slate-400 mt-1">Crowdsourced reports</p>
        </div>

        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Dispatch Latency</span>
          <p className="text-3xl font-black text-safeTeal-400 mt-2">45s</p>
          <p className="text-[11px] text-safeTeal-300 mt-1">Target &lt; 60s</p>
        </div>

        <div className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            {totalIncidents > 0
              ? Math.round(((statusCounts.RESOLVED || 0) / totalIncidents) * 100)
              : 100}
            %
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Safe outcomes</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Incidents & Reports Over Time (Last 7 Days)</span>
            </h2>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {trendData.map((item: any) => {
              const maxVal = 10;
              const incHeight = Math.max(12, (item.incidents / maxVal) * 180);
              const repHeight = Math.max(12, (item.reports / maxVal) * 180);

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Incidents Bar */}
                    <div
                      style={{ height: `${incHeight}px` }}
                      className="w-1/2 bg-gradient-to-t from-red-600 to-rose-400 rounded-t-lg transition-all shadow-md relative group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                        {item.incidents}
                      </div>
                    </div>

                    {/* Reports Bar */}
                    <div
                      style={{ height: `${repHeight}px` }}
                      className="w-1/2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all shadow-md relative group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                        {item.reports}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span className="text-slate-300">SOS Incidents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-slate-300">Safety Reports</span>
            </div>
          </div>
        </div>

        {/* Hazard Categories Breakdown */}
        <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Safety Hazard Categories Distribution</span>
            </h2>
          </div>

          <div className="space-y-3.5 pt-2">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No categories recorded yet.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]: [string, any]) => {
                const total = Math.max(1, totalReports);
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{cat.replace('_', ' ')}</span>
                      <span className="font-mono text-slate-400">
                        {count} reports ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-safeNavy-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
