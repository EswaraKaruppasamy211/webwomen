'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { EmergencyIncident, LocationUpdate } from '../types';
import { api } from '../services/api';
import { socketClient } from '../services/socket';
import { geoService, GeoPosition, DEFAULT_COORDS } from '../services/geoService';
import { audioAlerts } from '../services/audioAlerts';
import { useAuth } from './AuthContext';

interface EmergencyContextType {
  activeIncident: EmergencyIncident | null;
  locationUpdates: LocationUpdate[];
  isSOSActive: boolean;
  currentPosition: GeoPosition;
  currentAddress: string;
  isTriggering: boolean;
  gpsAccuracy: number;
  triggerSOS: (isDemo?: boolean) => Promise<EmergencyIncident>;
  cancelSOS: (notes?: string) => Promise<void>;
  refreshLocation: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);
  const [currentPosition, setCurrentPosition] = useState<GeoPosition>(DEFAULT_COORDS);
  const [currentAddress, setCurrentAddress] = useState<string>('Obtaining current location...');
  const [isTriggering, setIsTriggering] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Obtain initial location & address
  const refreshLocation = useCallback(async () => {
    try {
      const pos = await geoService.getCurrentPosition();
      setCurrentPosition(pos);
      const addr = await geoService.reverseGeocode(pos.latitude, pos.longitude);
      setCurrentAddress(addr);
    } catch (err: any) {
      console.warn('Geolocation warning (using default location):', err.message);
      const addr = await geoService.reverseGeocode(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
      setCurrentAddress(addr);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Check if user already has an active SOS
  useEffect(() => {
    if (user) {
      api
        .getActiveIncident()
        .then((res) => {
          if (res.active && res.incident) {
            setActiveIncident(res.incident);
            if (res.locationUpdates) {
              setLocationUpdates(res.locationUpdates);
            }
            socketClient.joinIncident(res.incident.id);
          } else {
            setActiveIncident(null);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Subscribe to real-time status updates & live location sync
  useEffect(() => {
    const unsubStatus = socketClient.onStatusChange((incident) => {
      if (activeIncident && activeIncident.id === incident.id) {
        setActiveIncident(incident);
        if (['RESOLVED', 'CANCELLED'].includes(incident.status)) {
          audioAlerts.stopEmergencySiren();
        }
      }
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

    return () => {
      unsubStatus();
      unsubLoc();
    };
  }, [activeIncident]);

  // Background location streamer during active emergency
  useEffect(() => {
    if (activeIncident && ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(activeIncident.status)) {
      // Start GPS watcher
      watchIdRef.current = geoService.watchPosition(
        (pos) => {
          setCurrentPosition(pos);
        },
        (err) => console.warn('Watch position error:', err.message)
      );

      // Periodically upload coordinates every 6 seconds
      updateIntervalRef.current = setInterval(async () => {
        try {
          const pos = await geoService.getCurrentPosition().catch(() => currentPosition);
          await api.addLocationUpdate(activeIncident.id, {
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: pos.accuracy,
            speed: pos.speed,
            heading: pos.heading,
          });
        } catch {}
      }, 6000);

      return () => {
        if (watchIdRef.current !== null) {
          geoService.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      };
    }
  }, [activeIncident, currentPosition]);

  const triggerSOS = async (isDemo = false): Promise<EmergencyIncident> => {
    setIsTriggering(true);
    try {
      audioAlerts.playClick(800, 0.2);
      let pos = currentPosition;
      try {
        pos = await geoService.getCurrentPosition();
        setCurrentPosition(pos);
      } catch {}

      const addr = await geoService.reverseGeocode(pos.latitude, pos.longitude);
      setCurrentAddress(addr);

      const res = await api.createIncident({
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        address: addr,
        isDemo,
      });

      setActiveIncident(res.incident);
      setLocationUpdates([
        {
          id: `initial_${Date.now()}`,
          incidentId: res.incident.id,
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          timestamp: new Date().toISOString(),
        },
      ]);

      socketClient.joinIncident(res.incident.id);

      // Start emergency siren cue
      audioAlerts.startEmergencySiren();

      return res.incident;
    } finally {
      setIsTriggering(false);
    }
  };

  const cancelSOS = async (notes = 'User indicated false alarm / safe'): Promise<void> => {
    if (!activeIncident) return;
    try {
      const res = await api.updateIncidentStatus(activeIncident.id, 'CANCELLED', notes);
      setActiveIncident(res.incident);
      audioAlerts.stopEmergencySiren();
      audioAlerts.playClick(400, 0.1);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to cancel emergency');
    }
  };

  const isSOSActive = !!(
    activeIncident && ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(activeIncident.status)
  );

  return (
    <EmergencyContext.Provider
      value={{
        activeIncident,
        locationUpdates,
        isSOSActive,
        currentPosition,
        currentAddress,
        isTriggering,
        gpsAccuracy: currentPosition.accuracy,
        triggerSOS,
        cancelSOS,
        refreshLocation,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
