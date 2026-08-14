'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { useDemo } from '../../contexts/DemoContext';
import { audioAlerts } from '../../services/audioAlerts';

export default function HoldSOSButton() {
  const router = useRouter();
  const { triggerSOS, isSOSActive, isTriggering } = useEmergency();
  const { isDemoMode } = useDemo();

  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // If already active SOS, clicking takes user to active emergency screen
  const handleQuickClick = () => {
    if (isSOSActive) {
      router.push('/app/sos');
      return;
    }
  };

  const startHold = () => {
    if (isSOSActive) return;
    setIsHolding(true);
    setHoldProgress(0);
    audioAlerts.playClick(500, 0.1);

    const startTime = Date.now();
    const duration = 2000; // 2.0 seconds hold

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        activateSOS();
      }
    }, 30);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const activateSOS = async () => {
    try {
      setIsHolding(false);
      setHoldProgress(0);
      audioAlerts.playClick(900, 0.3);
      const incident = await triggerSOS(isDemoMode);
      router.push(`/app/sos?incidentId=${incident.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to activate SOS');
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      {/* Huge Glowing SOS Hold Button */}
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Waves when Emergency is Active or when Holding */}
        {(isHolding || isSOSActive) && (
          <div className="absolute inset-0 rounded-full animate-ping bg-red-600/40 pointer-events-none scale-125"></div>
        )}
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse"></div>

        {/* Circular SVG Progress Ring */}
        <svg className="w-56 h-56 -rotate-90 pointer-events-none absolute z-20">
          <circle
            cx="112"
            cy="112"
            r="104"
            className="stroke-red-950/40 fill-transparent stroke-[8]"
          />
          <circle
            cx="112"
            cy="112"
            r="104"
            className="stroke-red-500 fill-transparent stroke-[8] transition-all duration-75"
            strokeDasharray={2 * Math.PI * 104}
            strokeDashoffset={2 * Math.PI * 104 * (1 - holdProgress / 100)}
            strokeLinecap="round"
          />
        </svg>

        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onClick={handleQuickClick}
          disabled={isTriggering}
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center select-none shadow-2xl transition-all active:scale-95 ${
            isSOSActive
              ? 'bg-gradient-to-b from-red-600 to-red-800 border-4 border-red-400 text-white animate-pulse'
              : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-4 border-red-400/80 text-white shadow-red-600/50'
          }`}
          style={{ touchAction: 'none' }}
        >
          <AlertCircle className="w-14 h-14 mb-1 text-white animate-pulse" />
          <span className="font-extrabold text-2xl tracking-wider text-white uppercase drop-shadow-md">
            {isSOSActive ? 'SOS ACTIVE' : "I'M IN DANGER"}
          </span>
          <span className="text-[11px] font-semibold text-red-100 uppercase tracking-widest mt-1">
            {isSOSActive ? 'VIEW LIVE STREAM' : isHolding ? 'HOLDING...' : 'HOLD 2 SECONDS'}
          </span>
        </button>
      </div>

      {/* Instructional helper text */}
      <div className="mt-4 max-w-xs">
        {isHolding ? (
          <p className="text-xs font-bold text-red-400 animate-pulse">
            🚨 Releasing will cancel activation. Hold until full...
          </p>
        ) : isSOSActive ? (
          <p className="text-xs font-bold text-red-400">
            🚨 Emergency active! Live location streaming to dispatchers.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Press and hold for 2 seconds to activate immediate emergency dispatch. Prevents accidental taps.
          </p>
        )}

        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] text-amber-300 font-medium mt-2">
            <Sparkles className="w-3 h-3" />
            <span>Demo Mode Active: SOS is simulated</span>
          </div>
        )}
      </div>
    </div>
  );
}
