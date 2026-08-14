'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  MapPin,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import { useEmergency } from '../../../contexts/EmergencyContext';
import SafetyMap from '../../../components/map/SafetyMap';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';
import { api } from '../../../services/api';
import { RouteOption, SafetyZone, SafetyReport } from '../../../types';
import { audioAlerts } from '../../../services/audioAlerts';

export default function NavigatePage() {
  const { currentPosition, currentAddress } = useEmergency();

  const [destinationQuery, setDestinationQuery] = useState('Market St Station');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7879,
    lng: -122.4075,
  });

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_safest');
  const [safeZones, setSafeZones] = useState<SafetyZone[]>([]);
  const [hazards, setHazards] = useState<SafetyReport[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Preset destination recommendations
  const presetDestinations = [
    { name: 'Union Square Safe Hub', lat: 37.7879, lng: -122.4075 },
    { name: 'St. Jude General Hospital', lat: 37.7833, lng: -122.4167 },
    { name: 'SafeHaven Crisis Shelter', lat: 37.7699, lng: -122.4469 },
    { name: 'Civic Center Metro', lat: 37.7795, lng: -122.4137 },
  ];

  const handleCalculateRoutes = async (destLat?: number, destLng?: number, destName?: string) => {
    setIsCalculating(true);
    audioAlerts.playClick(600, 0.08);

    const targetLat = destLat || destCoords.lat;
    const targetLng = destLng || destCoords.lng;

    try {
      const res = await api.calculateRoutes({
        startLat: currentPosition.latitude,
        startLng: currentPosition.longitude,
        destLat: targetLat,
        destLng: targetLng,
        destinationName: destName || destinationQuery,
      });

      setRoutes(res.routes);
      if (res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to calculate safe routes');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    // Initial fetch of safe places and calculate default route
    api.getSafePlaces().then((res) => setSafeZones(res.safePlaces)).catch(() => {});
    api.getHazards().then((res) => setHazards(res.hazards)).catch(() => {});
    handleCalculateRoutes();
  }, [currentPosition]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-safeTeal-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Safe Route Navigation Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">AI-Assisted Safe Route Calculator</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Calculates multiple walking corridors weighted by verified Safe Havens, continuous street lighting,
          and historical community hazard reports.
        </p>

        {/* Search Input Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              placeholder="Search destination or select quick Safe Haven below..."
              className="w-full bg-safeNavy-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-safeTeal-500"
            />
          </div>

          <button
            onClick={() => handleCalculateRoutes()}
            disabled={isCalculating}
            className="sm:col-span-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Calculate Safe Routes</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Destination Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Quick Destinations:</span>
          {presetDestinations.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDestinationQuery(p.name);
                setDestCoords({ lat: p.lat, lng: p.lng });
                handleCalculateRoutes(p.lat, p.lng, p.name);
              }}
              className="text-xs bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Interactive Route Map + Route Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 bg-safeNavy-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-safeTeal-400" />
              <h2 className="font-bold text-sm text-white">Route Safety Visualizer</h2>
            </div>
            {selectedRoute && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                AI Score: {selectedRoute.aiSafetyScore}/100
              </span>
            )}
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
            <SafetyMap
              center={[currentPosition.latitude, currentPosition.longitude]}
              zoom={14}
              userPosition={currentPosition}
              safeZones={safeZones}
              hazardReports={hazards}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          </div>
        </div>

        {/* Right Column: Route Candidates & AI Score Details */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compare AI Route Safety Options ({routes.length})</span>
          </h2>

          {routes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            let scoreBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            if (route.safetyRating === 'SAFE') scoreBg = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
            if (route.safetyRating === 'CAUTION') scoreBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

            return (
              <div
                key={route.id}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  audioAlerts.playClick(600, 0.05);
                }}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all ${
                  isSelected
                    ? 'bg-safeNavy-850 border-rose-500/80 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/50'
                    : 'bg-safeNavy-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{route.name}</span>
                      {route.isRecommended && (
                        <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{route.summary}</p>
                  </div>

                  {/* AI Safety Score Badge */}
                  <div className={`px-2.5 py-1 rounded-xl border text-center font-bold text-xs shrink-0 ${scoreBg}`}>
                    <div>{route.aiSafetyScore}/100</div>
                    <div className="text-[9px] font-semibold uppercase">{route.safetyRating.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Distance</span>
                    <p className="font-bold text-slate-200">{route.distanceKm} km</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Est. Time</span>
                    <p className="font-bold text-slate-200">{route.durationMins} mins</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Street Lighting</span>
                    <p className="font-bold text-slate-200">{route.wellLitPercentage}% Lit</p>
                  </div>
                </div>

                {/* AI Safety Explanation */}
                <div className="mt-3 bg-safeNavy-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>AI Safety Rationale:</span>
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                    {route.safetyReasons.slice(0, 2).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  {route.riskFactors && route.riskFactors.length > 0 && (
                    <div className="text-[10px] text-amber-400/90 pt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{route.riskFactors[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Start Turn-by-Turn Navigation CTA */}
          {selectedRoute && (
            <button
              onClick={() => {
                setIsNavigating((prev) => !prev);
                audioAlerts.playClick(800, 0.1);
              }}
              className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                isNavigating
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/30'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{isNavigating ? 'Turn-by-Turn Navigation Active (Safe Route)' : 'Start Safe Route Guidance'}</span>
            </button>
          )}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
