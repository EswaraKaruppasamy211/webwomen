'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useEmergency } from '../../../contexts/EmergencyContext';
import { useDemo } from '../../../contexts/DemoContext';
import SafetyMap from '../../../components/map/SafetyMap';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';
import { audioAlerts } from '../../../services/audioAlerts';

function SOSContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeIncident,
    locationUpdates,
    isSOSActive,
    cancelSOS,
    currentPosition,
    triggerSOS,
  } = useEmergency();
  const { isDemoMode, simulateSOSWalkthrough, isSimulating } = useDemo();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('Accidental trigger / User is safe');
  const [isCancelling, setIsCancelling] = useState(false);

  // Timer ticker during active emergency
  useEffect(() => {
    if (activeIncident && ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(activeIncident.status)) {
      const startTime = new Date(activeIncident.startedAt).getTime();
      const interval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSec(Math.max(0, diff));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeIncident]);

  const handleCancelEmergency = async () => {
    setIsCancelling(true);
    try {
      await cancelSOS(cancelNotes);
      setCancelModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel emergency');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleManualTrigger = async () => {
    await triggerSOS(isDemoMode);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {isDemoMode && (
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Mode Active</span>
            </span>

            {!isSOSActive && (
              <button
                onClick={simulateSOSWalkthrough}
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all"
              >
                Simulate SOS Incident
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Status Header Card */}
      <div
        className={`rounded-3xl p-6 border shadow-2xl transition-all ${
          isSOSActive
            ? 'bg-gradient-to-br from-red-950/80 via-safeNavy-900 to-safeNavy-950 border-red-500/60 shadow-red-500/10'
            : activeIncident?.status === 'CANCELLED'
            ? 'bg-safeNavy-900 border-slate-700'
            : 'bg-emerald-950/40 border-emerald-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                isSOSActive
                  ? 'bg-red-600 animate-pulse'
                  : activeIncident?.status === 'CANCELLED'
                  ? 'bg-slate-700'
                  : 'bg-emerald-600'
              }`}
            >
              {isSOSActive ? (
                <Radio className="w-8 h-8 animate-ping" />
              ) : activeIncident?.status === 'CANCELLED' ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    isSOSActive
                      ? 'bg-red-500 text-white animate-pulse'
                      : activeIncident?.status === 'CANCELLED'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  Status: {activeIncident?.status || 'STANDBY'}
                </span>

                {isSOSActive && (
                  <span className="text-xs text-red-300 font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Elapsed: {formatTimer(elapsedSec)}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black text-white mt-1.5">
                {isSOSActive
                  ? 'Emergency Alert Broadcast Active'
                  : activeIncident?.status === 'CANCELLED'
                  ? 'Emergency Incident Cancelled'
                  : activeIncident?.status === 'RESOLVED'
                  ? 'Emergency Incident Resolved'
                  : 'Emergency Response Standby'}
              </h1>

              <p className="text-xs text-slate-300 mt-1">
                Incident ID:{' '}
                <span className="font-mono text-rose-300 font-bold">
                  {activeIncident?.id || 'N/A'}
                </span>{' '}
                • Started:{' '}
                {activeIncident
                  ? new Date(activeIncident.startedAt).toLocaleTimeString()
                  : 'Not active'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isSOSActive ? (
              <>
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-5 py-3 rounded-2xl text-xs font-bold transition-all"
                >
                  Cancel Emergency
                </button>

                <a
                  href="tel:9344869645"
                  className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 animate-bounce"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial 9344869645 Now</span>
                </a>
              </>
            ) : (
              <button
                onClick={handleManualTrigger}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-xl shadow-red-600/40 text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Trigger New SOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Map & Breadcrumb Trail */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Live Location Stream & Breadcrumb Trail</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live coordinates streaming every 6 seconds • GPS accuracy: ±
              {Math.round(currentPosition.accuracy)}m
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {locationUpdates.length} Location Waypoints Recorded
          </div>
        </div>

        <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-800">
          <SafetyMap
            center={[currentPosition.latitude, currentPosition.longitude]}
            zoom={15}
            userPosition={currentPosition}
            isSOSActive={isSOSActive}
            breadcrumbs={locationUpdates}
          />
        </div>
      </div>

      {/* Verified Emergency Contact Delivery Proofs */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-sm text-white">Emergency Contacts Notification Logs</h2>
          </div>
          <span className="text-xs text-slate-400">
            {activeIncident?.contactNotifications?.length || 0} Contacts Notified
          </span>
        </div>

        {activeIncident?.contactNotifications && activeIncident.contactNotifications.length > 0 ? (
          <div className="space-y-3">
            {activeIncident.contactNotifications.map((notif, idx) => (
              <div
                key={idx}
                className="bg-safeNavy-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{notif.contactName}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{notif.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {notif.deliveryId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-mono">{notif.destination}</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                    &ldquo;{notif.messagePreview}&rdquo;
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs bg-safeNavy-950 rounded-2xl border border-slate-800">
            <p>No emergency contact dispatch logs yet.</p>
          </div>
        )}
      </div>

      {/* Safety Disclaimer */}
      <DisclaimerBanner />

      {/* Cancel Emergency Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-safeNavy-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-center">Confirm Emergency Cancellation</h3>
            <p className="text-xs text-slate-300 text-center mt-2 leading-relaxed">
              Are you sure you are safe and want to stand down the emergency alert? This status change will be
              recorded in the audit log.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reason / Notes</label>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                rows={2}
                className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 bg-safeNavy-800 hover:bg-safeNavy-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Keep SOS Active
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelEmergency}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-red-600/30"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, I Am Safe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SOSActivePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading Emergency Status...
        </div>
      }
    >
      <SOSContent />
    </Suspense>
  );
}
