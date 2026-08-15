'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  MapPin,
  RefreshCw,
  Users,
  Compass,
  AlertTriangle,
  Bot,
  Clock,
  Phone,
  Radio,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmergency } from '../../contexts/EmergencyContext';
import HoldSOSButton from '../../components/sos/HoldSOSButton';
import SafetyMap from '../../components/map/SafetyMap';
import DisclaimerBanner from '../../components/ui/DisclaimerBanner';
import { api } from '../../services/api';
import { SafetyZone, EmergencyContact, SafetyReport } from '../../types';

export default function UserHomePage() {
  const { user } = useAuth();
  const {
    currentPosition,
    currentAddress,
    refreshLocation,
    isSOSActive,
    activeIncident,
    gpsAccuracy,
  } = useEmergency();

  const [safePlaces, setSafePlaces] = useState<SafetyZone[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [hazards, setHazards] = useState<SafetyReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch nearby safe places & emergency contacts
    api
      .getSafePlaces()
      .then((res) => setSafePlaces(res.safePlaces))
      .catch(() => {});

    api
      .getContacts()
      .then((res) => setContacts(res.contacts))
      .catch(() => {});

    api
      .getHazards()
      .then((res) => setHazards(res.hazards))
      .catch(() => {});
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLocation();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Safety Status Bar */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Hi, {user?.name.split(' ')[0] || 'Member'} 👋
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected</span>
            </span>
          </div>

          {/* Current Address & GPS Telemetry */}
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium truncate max-w-md">{currentAddress}</span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
              title="Refresh GPS location"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            Coordinates: {currentPosition.latitude.toFixed(5)}, {currentPosition.longitude.toFixed(5)} • Accuracy: ±{Math.round(gpsAccuracy)}m
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            href="/app/navigate"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4 text-safeTeal-400" />
            <span>Safe Route</span>
          </Link>

          <Link
            href="/app/checkin"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Safety Timer</span>
          </Link>

          <Link
            href="/app/safe-ai"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>SafeAI</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: SOS Hold Button + Interactive Safety Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Huge Deliberate SOS Button */}
        <div className="lg:col-span-5 bg-gradient-to-b from-safeNavy-900 to-safeNavy-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[420px]">
          <div className="text-center mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
              Immediate Emergency Response
            </span>
          </div>

          <HoldSOSButton />

          {/* Direct Dial Fallback */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
            <span>Direct Call:</span>
            <a href="tel:9344869645">
              <Phone className="w-3.5 h-3.5" />
              <span>Call Police 9344869645</span>
            </a>
          </div>
        </div>

        {/* Right Column: Live Map with Safe Havens */}
        <div className="lg:col-span-7 bg-safeNavy-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-safeTeal-400" />
              <h2 className="font-bold text-sm text-white">Live Safety Map</h2>
            </div>
            <span className="text-[11px] text-slate-400">
              {safePlaces.length} Safe Havens • {hazards.length} Community Hazards
            </span>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
            <SafetyMap
              center={[currentPosition.latitude, currentPosition.longitude]}
              zoom={14}
              userPosition={currentPosition}
              isSOSActive={isSOSActive}
              safeZones={safePlaces}
              hazardReports={hazards}
            />
          </div>
        </div>
      </div>

      {/* Nearby Safe Places & Emergency Contacts Horizontal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nearby Safe Places */}
        <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Nearby Verified Safe Havens</h2>
            </div>
            <Link
              href="/app/navigate"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {safePlaces.slice(0, 3).map((zone) => (
              <div
                key={zone.id}
                className="bg-safeNavy-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{zone.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      {zone.safetyScore}/100 Safe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{zone.address}</p>
                </div>

                {zone.phone && (
                  <a
                    href={`tel:${zone.phone}`}
                    className="p-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl transition-colors shrink-0"
                    title={`Call ${zone.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configured Emergency Contacts Quick Bar */}
        <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm text-white">Emergency Contacts ({contacts.length})</h2>
            </div>
            <Link
              href="/app/contacts"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-safeNavy-950 rounded-2xl border border-slate-800">
                <p>No emergency contacts configured yet.</p>
                <Link
                  href="/app/contacts"
                  className="inline-block mt-2 text-rose-400 font-bold hover:underline"
                >
                  + Add Emergency Contact
                </Link>
              </div>
            ) : (
              contacts.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="bg-safeNavy-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{c.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {c.relationship}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{c.phone}</p>
                  </div>

                  <a
                    href={`tel:${c.phone}`}
                    className="p-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl transition-colors shrink-0"
                    title={`Call ${c.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
