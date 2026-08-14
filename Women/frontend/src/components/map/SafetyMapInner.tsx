'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SafetyZone, SafetyReport, RouteOption, LocationUpdate } from '../../types';

// Fix Leaflet default icon URL issues in bundler
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Custom animated SVG markers
const createUserPinIcon = (isSOS: boolean) => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${
          isSOS
            ? `<div class="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-75"></div>
               <div class="relative w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xs">SOS</div>`
            : `<div class="absolute w-10 h-10 bg-blue-500 rounded-full animate-pulse opacity-40"></div>
               <div class="relative w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>`
        }
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

const createSafeZoneIcon = (type: string) => {
  let bg = 'bg-emerald-600';
  let icon = '🛡️';
  if (type === 'POLICE_STATION') {
    bg = 'bg-blue-700';
    icon = '👮';
  } else if (type === 'HOSPITAL') {
    bg = 'bg-red-600';
    icon = '🏥';
  } else if (type === 'SAFE_SHELTER') {
    bg = 'bg-purple-600';
    icon = '🏠';
  } else if (type === 'HIGH_RISK_ZONE') {
    bg = 'bg-amber-600';
    icon = '⚠️';
  }

  return L.divIcon({
    className: 'custom-safezone-marker',
    html: `
      <div class="flex items-center justify-center w-8 h-8 ${bg} text-white rounded-full shadow-md border border-white text-sm">
        ${icon}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createHazardIcon = () => {
  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div class="flex items-center justify-center w-7 h-7 bg-amber-500 text-slate-900 font-bold rounded-md shadow-md border-2 border-white text-xs">
        ⚠️
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Map Recenter Helper Component
function MapRecenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

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

export default function SafetyMapInner({
  center,
  zoom = 14,
  userPosition,
  isSOSActive = false,
  safeZones = [],
  hazardReports = [],
  routes = [],
  selectedRouteId,
  onSelectRoute,
  breadcrumbs = [],
  className = 'h-full w-full',
  onMapClick,
}: SafetyMapProps) {
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl overflow-hidden shadow-inner"
        style={{ minHeight: '320px', zIndex: 10 }}
      >
        <MapRecenter center={center} zoom={zoom} />

        {/* High Contrast Clean Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Current Position Marker */}
        {userPosition && (
          <>
            <Marker
              position={[userPosition.latitude, userPosition.longitude]}
              icon={createUserPinIcon(isSOSActive)}
            >
              <Popup>
                <div className="text-slate-900 p-1">
                  <p className="font-bold text-sm">
                    {isSOSActive ? '🚨 Active SOS Beacon' : '📍 Your Current Location'}
                  </p>
                  <p className="text-xs text-slate-600">
                    Accuracy: ±{Math.round(userPosition.accuracy || 15)}m
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* GPS Accuracy Circle */}
            <Circle
              center={[userPosition.latitude, userPosition.longitude]}
              radius={Math.max(20, userPosition.accuracy || 30)}
              pathOptions={{
                color: isSOSActive ? '#EF4444' : '#3B82F6',
                fillColor: isSOSActive ? '#EF4444' : '#3B82F6',
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
          </>
        )}

        {/* Breadcrumb Trail for Active Emergency */}
        {breadcrumbs.length > 1 && (
          <Polyline
            positions={breadcrumbs.map((b) => [b.latitude, b.longitude])}
            pathOptions={{
              color: '#DC2626',
              weight: 4,
              dashArray: '4, 8',
              opacity: 0.85,
            }}
          />
        )}

        {/* Safe Havens & Police Stations */}
        {safeZones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.latitude, zone.longitude]}
            icon={createSafeZoneIcon(zone.type)}
          >
            <Popup>
              <div className="text-slate-900 max-w-xs p-1">
                <div className="flex items-center gap-1.5 font-bold text-sm text-safeNavy-900">
                  <span>🛡️</span>
                  <span>{zone.name}</span>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                  AI Safety Rating: {zone.safetyScore}/100
                </p>
                <p className="text-xs text-slate-600 mt-1">{zone.address}</p>
                {zone.phone && (
                  <p className="text-xs font-medium text-blue-600 mt-1">📞 {zone.phone}</p>
                )}
                {zone.description && (
                  <p className="text-xs text-slate-500 mt-1 italic">{zone.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Community Hazard Reports */}
        {hazardReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createHazardIcon()}
          >
            <Popup>
              <div className="text-slate-900 max-w-xs p-1">
                <p className="font-bold text-sm text-amber-700">⚠️ {report.title}</p>
                <p className="text-xs text-slate-600 mt-1">{report.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Category: {report.category.replace('_', ' ')}</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polylines */}
        {routes.map((r) => {
          const isSelected = selectedRouteId === r.id;
          let strokeColor = '#10B981'; // Emerald for safest
          if (r.id === 'route_main_st') strokeColor = '#3B82F6';
          if (r.id === 'route_direct') strokeColor = '#F59E0B';

          return (
            <Polyline
              key={r.id}
              positions={r.coordinates}
              pathOptions={{
                color: strokeColor,
                weight: isSelected ? 6 : 3.5,
                opacity: isSelected ? 0.95 : 0.6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRoute && onSelectRoute(r.id),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
