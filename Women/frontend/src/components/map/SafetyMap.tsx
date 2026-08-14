'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { SafetyZone, SafetyReport, RouteOption, LocationUpdate } from '../../types';

interface SafetyMapProps {
  center: [number, number];
  zoom?: number;
  userPosition?: { latitude: number; longitude: number; accuracy?: number };
  isSOSActive?: boolean;
  safeZones?: SafetyZone[];
  hazardReports?: SafetyReport[];
  routes?: RouteOption[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  breadcrumbs?: LocationUpdate[];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const DynamicMap = dynamic(() => import('./SafetyMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[320px] bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 animate-pulse">
      <div className="w-10 h-10 border-4 border-safeTeal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Initializing Safe Navigation & Emergency Map...</p>
      <p className="text-xs text-slate-500 mt-1">Connecting to live GIS telemetry</p>
    </div>
  ),
});

export default function SafetyMap(props: SafetyMapProps) {
  return <DynamicMap {...props} />;
}
