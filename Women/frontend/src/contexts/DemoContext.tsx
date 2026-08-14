'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useEmergency } from './EmergencyContext';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  isSimulating: boolean;
  simulateSOSWalkthrough: () => Promise<void>;
  stopSimulation: () => void;
  resetDemoData: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const movementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { triggerSOS } = useEmergency();

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const simulateSOSWalkthrough = async () => {
    setIsSimulating(true);
    try {
      // 1. Trigger SOS with demo flag
      const incident = await triggerSOS(true);

      // 2. Start simulating GPS coordinate movement every 4 seconds
      if (movementTimerRef.current) clearInterval(movementTimerRef.current);
      movementTimerRef.current = setInterval(async () => {
        try {
          await api.simulateMovement(incident.id);
        } catch {}
      }, 4000);
    } catch (err) {
      console.error('Demo simulation error:', err);
      setIsSimulating(false);
    }
  };

  const stopSimulation = () => {
    if (movementTimerRef.current) {
      clearInterval(movementTimerRef.current);
      movementTimerRef.current = null;
    }
    setIsSimulating(false);
  };

  const resetDemoData = async () => {
    stopSimulation();
    await api.resetDemo();
  };

  useEffect(() => {
    return () => {
      if (movementTimerRef.current) clearInterval(movementTimerRef.current);
    };
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        setDemoMode: setIsDemoMode,
        toggleDemoMode,
        isSimulating,
        simulateSOSWalkthrough,
        stopSimulation,
        resetDemoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
