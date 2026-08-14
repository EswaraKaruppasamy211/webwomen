'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Clock,
  Shield,
  Lightbulb,
  Eye,
  CheckCircle2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useEmergency } from '../../../contexts/EmergencyContext';
import { api } from '../../../services/api';
import { SafetyReport, SafetyReportCategory } from '../../../types';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';
import { audioAlerts } from '../../../services/audioAlerts';

export default function ReportsPage() {
  const { currentPosition, currentAddress } = useEmergency();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [category, setCategory] = useState<SafetyReportCategory>('POOR_LIGHTING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [address, setAddress] = useState(currentAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchReports = async () => {
    try {
      const res = await api.getPublicReports();
      setReports(res.reports);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setAddress(currentAddress);
  }, [currentAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createReport({
        category,
        title,
        description,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        address: address || currentAddress,
        severity,
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      audioAlerts.playClick(800, 0.1);
      alert('Thank you! Your safety report has been submitted to community safety moderators.');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports =
    filterCategory === 'ALL'
      ? reports
      : reports.filter((r) => r.category === filterCategory);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Crowdsourced Community Hazard Intel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Safety Reports & Alerts</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Report unlit streets, harassment spots, isolated bottlenecks, or suspicious activities to protect other
            women navigating the area.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Safety Concern</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {[
          { label: 'All Hazards', value: 'ALL' },
          { label: 'Poor Lighting', value: 'POOR_LIGHTING' },
          { label: 'Harassment', value: 'HARASSMENT' },
          { label: 'Isolated Area', value: 'ISOLATED_AREA' },
          { label: 'Suspicious', value: 'SUSPICIOUS_ACTIVITY' },
          { label: 'Unsafe Transit', value: 'UNSAFE_TRANSIT' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterCategory(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors shrink-0 border ${
              filterCategory === tab.value
                ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                : 'bg-safeNavy-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading safety reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-white">No Active Hazard Reports for this Filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              If you notice unlit streets, broken safety infrastructure, or uncomfortable spots, feel free to file a report.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-safeNavy-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      report.severity === 'CRITICAL' || report.severity === 'HIGH'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Severity: {report.severity}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-white mt-1">{report.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">{report.description}</p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{report.address}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Report Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-safeNavy-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-1">Submit Community Safety Concern</h3>
            <p className="text-xs text-slate-400 mb-4">
              Help make neighborhood streets safer. Do not confront suspects directly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SafetyReportCategory)}
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="POOR_LIGHTING">Poor or Broken Street Lighting</option>
                  <option value="HARASSMENT">Catcalling / Harassment / Loitering</option>
                  <option value="ISOLATED_AREA">Isolated / Abandoned Bottleneck</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Behavior / Stalking</option>
                  <option value="UNSAFE_TRANSIT">Unmonitored Transit Station / Bus Stop</option>
                  <option value="ROAD_OBSTRUCTION">Pedestrian Walkway Obstruction</option>
                  <option value="OTHER">Other Safety Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline / Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight on 4th street between Elm & Pine"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe specific details (time of day, landmarks, lighting conditions) to inform other pedestrians..."
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="LOW">Low (Minor inconvenience)</option>
                    <option value="MEDIUM">Medium (Caution advised)</option>
                    <option value="HIGH">High (Substantial risk)</option>
                    <option value="CRITICAL">Critical (Immediate hazard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Current location"
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-safeNavy-800 hover:bg-safeNavy-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
