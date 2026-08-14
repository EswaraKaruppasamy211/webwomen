'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Shield, ShieldAlert, Building, Phone, Clock, Sparkles } from 'lucide-react';
import { api } from '../../../services/api';
import { SafetyZone, SafetyZoneType } from '../../../types';
import SafetyMap from '../../../components/map/SafetyMap';
import { audioAlerts } from '../../../services/audioAlerts';

export default function AdminSafetyZonesPage() {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<SafetyZoneType>('POLICE_STATION');
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [radiusMeters, setRadiusMeters] = useState('300');
  const [safetyScore, setSafetyScore] = useState('98');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await api.getSafePlaces();
      setZones(res.safePlaces);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createSafetyZone({
        name,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseFloat(radiusMeters),
        safetyScore: parseFloat(safetyScore),
        address,
        phone,
        description,
      });

      setModalOpen(false);
      setName('');
      setAddress('');
      setPhone('');
      setDescription('');
      audioAlerts.playClick(800, 0.1);
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to create safety zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Safe Havens & Hazard Zones Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define verified 24/7 Police Stations, Trauma Centers, and Crisis Hubs used by the AI Navigation Scorer.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Safe Haven / Zone</span>
        </button>
      </div>

      {/* Map Overview */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-5 shadow-2xl h-[360px] flex flex-col">
        <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
          Spatial GIS Distribution ({zones.length} Zones)
        </h2>
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
          <SafetyMap center={[37.7749, -122.4194]} zoom={13} safeZones={zones} />
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-safeNavy-900 border border-slate-800 p-5 rounded-3xl shadow-lg space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-white">{zone.name}</h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono mt-1 inline-block">
                  {zone.type.replace('_', ' ')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                  {zone.safetyScore}/100
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{zone.description || 'Verified safe shelter'}</p>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{zone.address}</span>
              </div>
              {zone.phone && (
                <div className="flex items-center gap-1 font-mono text-indigo-300">
                  <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{zone.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-safeNavy-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-1">Create Safety Haven / Zone</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add verified safety zones to enhance real-time navigation and routing calculations.
            </p>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Civic Center Police Kiosk"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Zone Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SafetyZoneType)}
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="POLICE_STATION">Police Station</option>
                    <option value="HOSPITAL">Hospital / Trauma Center</option>
                    <option value="SAFE_SHELTER">Women Safe Shelter</option>
                    <option value="VERIFIED_SAFE_HAVEN">24/7 Verified Safe Haven</option>
                    <option value="HIGH_RISK_ZONE">High-Risk / Caution Zone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Safety Rating (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 850 Bryant St, Civic Center"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Phone / Access</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 911 / (415) 553-0123"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Creating...' : 'Save Safety Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
