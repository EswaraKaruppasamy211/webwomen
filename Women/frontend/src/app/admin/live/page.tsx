'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Radio,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  AlertTriangle,
  Send,
  Phone,
  RefreshCw,
  Sparkles,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { api } from '../../../services/api';
import { EmergencyIncident, LocationUpdate, SafetyZone } from '../../../types';
import { socketClient } from '../../../services/socket';
import SafetyMap from '../../../components/map/SafetyMap';
import { audioAlerts } from '../../../services/audioAlerts';

function AdminLiveContent() {
  const searchParams = useSearchParams();
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);
  const [safeZones, setSafeZones] = useState<SafetyZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await api.getAllIncidents('ALL');
      setIncidents(res.incidents);

      const preselect = searchParams.get('selected');
      if (preselect && res.incidents.some((i) => i.id === preselect)) {
        setSelectedIncidentId(preselect);
      } else if (!selectedIncidentId && res.incidents.length > 0) {
        const activeOne = res.incidents.find((i) => ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(i.status));
        setSelectedIncidentId(activeOne ? activeOne.id : res.incidents[0].id);
      }
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  const fetchIncidentDetails = async (id: string) => {
    try {
      const res = await api.getIncident(id);
      setLocationUpdates(res.locationUpdates || []);
      socketClient.joinIncident(id);
    } catch {}
  };

  useEffect(() => {
    fetchIncidents();
    api.getSafePlaces().then((res) => setSafeZones(res.safePlaces)).catch(() => {});

    // Listen for live socket events
    const unsubNew = socketClient.onEmergencyNew((data) => {
      fetchIncidents();
      setSelectedIncidentId(data.incident.id);
    });

    const unsubLoc = socketClient.onLocationUpdate((data: any) => {
      const loc = data.location || data;
      if (loc && loc.latitude && loc.longitude) {
        setLocationUpdates((prev) => {
          if (prev.some((p) => p.id === loc.id)) return prev;
          return [...prev, loc];
        });
      }
    });

    const unsubStatus = socketClient.onStatusChange(() => {
      fetchIncidents();
    });

    return () => {
      unsubNew();
      unsubLoc();
      unsubStatus();
    };
  }, []);

  useEffect(() => {
    if (selectedIncidentId) {
      fetchIncidentDetails(selectedIncidentId);
    }
  }, [selectedIncidentId]);

  const handleUpdateStatus = async (status: 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED') => {
    if (!selectedIncidentId) return;
    setIsUpdating(true);
    try {
      audioAlerts.playClick(800, 0.1);
      await api.updateIncidentStatus(selectedIncidentId, status, actionNotes);
      fetchIncidents();
      setActionNotes('');
      alert(`Incident status updated to ${status}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Live Dispatch Telemetry & Incident Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Live Emergency Command Center</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchIncidents()}
            className="flex items-center gap-1.5 bg-safeNavy-900 hover:bg-safeNavy-800 border border-slate-800 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Live Incident List + Interactive Map + Incident Triage Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incidents Queue List (4 cols) */}
        <div className="lg:col-span-4 bg-safeNavy-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-sm text-white">Incidents Feed ({incidents.length})</h2>
            <span className="text-[11px] text-slate-400">Live Socket Sync</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {incidents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No incident records found.</p>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;
                const isActive = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(inc.status);

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      audioAlerts.playClick(600, 0.05);
                    }}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-safeNavy-800 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                        : 'bg-safeNavy-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        {isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                        <span className="truncate">{inc.userName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          inc.status === 'NEW'
                            ? 'bg-red-500 text-white animate-pulse'
                            : inc.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-500 text-slate-950'
                            : inc.status === 'IN_PROGRESS'
                            ? 'bg-blue-500 text-white'
                            : inc.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 truncate mt-0.5">{inc.address}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                      <span>ID: {inc.id}</span>
                      <span>{new Date(inc.startedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live GPS Map + Action Controls Drawer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Map Box */}
          <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-white">
                  {selectedIncident
                    ? `Tracking: ${selectedIncident.userName} (${selectedIncident.id})`
                    : 'Emergency GIS Stream'}
                </span>
              </div>
              <span className="text-slate-400 font-mono">
                {locationUpdates.length} Location Trail Points
              </span>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
              <SafetyMap
                center={
                  selectedIncident
                    ? [selectedIncident.latitude, selectedIncident.longitude]
                    : [37.7749, -122.4194]
                }
                zoom={15}
                userPosition={
                  selectedIncident
                    ? {
                        latitude: selectedIncident.latitude,
                        longitude: selectedIncident.longitude,
                        accuracy: selectedIncident.accuracy,
                      }
                    : undefined
                }
                isSOSActive={
                  !!selectedIncident &&
                  ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(selectedIncident.status)
                }
                safeZones={safeZones}
                breadcrumbs={locationUpdates}
              />
            </div>
          </div>

          {/* Incident Triage & Action Drawer */}
          {selectedIncident && (
            <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">{selectedIncident.userName}</h3>
                    <span className="bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Phone: <span className="font-mono text-slate-200">{selectedIncident.userPhone}</span> •
                    Incident Ref: <span className="font-mono text-rose-300">{selectedIncident.id}</span>
                  </p>
                </div>

                <div className="text-xs text-slate-400 font-mono text-right">
                  <p>Started: {new Date(selectedIncident.startedAt).toLocaleTimeString()}</p>
                  {selectedIncident.acknowledgedAt && (
                    <p className="text-amber-400">
                      Acked: {new Date(selectedIncident.acknowledgedAt).toLocaleTimeString()}
                    </p>
                  )}
                  {selectedIncident.resolvedAt && (
                    <p className="text-emerald-400">
                      Resolved: {new Date(selectedIncident.resolvedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Coordinates and Address Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    GPS Coordinates
                  </span>
                  <p className="font-mono text-white font-bold mt-1">
                    {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Accuracy: ±{Math.round(selectedIncident.accuracy)}m
                  </p>
                </div>

                <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Reported Address
                  </span>
                  <p className="text-white font-medium mt-1 truncate">{selectedIncident.address}</p>
                  <p className="text-[11px] text-indigo-400 mt-0.5 font-semibold">
                    {selectedIncident.isDemo ? '⚠️ Simulated Demo Incident' : '🚨 Real Live Incident'}
                  </p>
                </div>
              </div>

              {/* Emergency Contacts Dispatched */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Emergency Contacts Notification Logs:
                </h4>
                {selectedIncident.contactNotifications && selectedIncident.contactNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedIncident.contactNotifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className="bg-safeNavy-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-white">{notif.contactName}</span>{' '}
                          <span className="text-slate-400 font-mono">({notif.destination})</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {notif.status} ({notif.deliveryId})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No automated contacts notified.</p>
                )}
              </div>

              {/* Status Triage Controls */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Optional dispatcher notes (e.g. Unit 4 dispatched to scene)..."
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={isUpdating || selectedIncident.status === 'ACKNOWLEDGED'}
                    onClick={() => handleUpdateStatus('ACKNOWLEDGED')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
                  >
                    1. Acknowledge Alarm
                  </button>

                  <button
                    disabled={isUpdating || selectedIncident.status === 'IN_PROGRESS'}
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
                  >
                    2. Mark In Progress / Dispatched
                  </button>

                  <button
                    disabled={isUpdating || selectedIncident.status === 'RESOLVED'}
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30"
                  >
                    3. Mark Resolved
                  </button>

                  <button
                    disabled={isUpdating || selectedIncident.status === 'CANCELLED'}
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
                  >
                    Cancel / Stand Down
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLiveEmergenciesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading Live Command Center...
        </div>
      }
    >
      <AdminLiveContent />
    </Suspense>
  );
}
