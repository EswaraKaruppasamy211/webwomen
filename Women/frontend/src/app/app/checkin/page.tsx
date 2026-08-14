'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  MapPin,
  Users,
  Sparkles,
  Bell,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../../services/api';
import { SafetyCheckin } from '../../../types';
import { useEmergency } from '../../../contexts/EmergencyContext';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';
import { audioAlerts } from '../../../services/audioAlerts';

export default function CheckinPage() {
  const { currentPosition, currentAddress } = useEmergency();

  const [activeCheckin, setActiveCheckin] = useState<SafetyCheckin | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [destination, setDestination] = useState('Walking Home from Metro');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const fetchActiveCheckin = async () => {
    try {
      const res = await api.getActiveCheckin();
      if (res.hasActiveCheckin && res.checkin) {
        setActiveCheckin(res.checkin);
        const expires = new Date(res.checkin.expiresAt).getTime();
        const diffSec = Math.floor((expires - Date.now()) / 1000);
        setRemainingSeconds(Math.max(0, diffSec));
      } else {
        setActiveCheckin(null);
      }
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCheckin();
  }, []);

  // Countdown timer interval
  useEffect(() => {
    if (activeCheckin && remainingSeconds > 0) {
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            audioAlerts.playClick(900, 0.4);
            fetchActiveCheckin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeCheckin, remainingSeconds]);

  const handleStartTimer = async () => {
    setIsStarting(true);
    audioAlerts.playClick(700, 0.1);
    try {
      const res = await api.startCheckin({
        durationMinutes,
        destination,
        initialLat: currentPosition.latitude,
        initialLng: currentPosition.longitude,
      });

      setActiveCheckin(res.checkin);
      setRemainingSeconds(durationMinutes * 60);
    } catch (err: any) {
      alert(err.message || 'Failed to start timer');
    } finally {
      setIsStarting(false);
    }
  };

  const handleConfirmSafe = async () => {
    if (!activeCheckin) return;
    try {
      await api.confirmSafeCheckin(activeCheckin.id);
      setActiveCheckin(null);
      audioAlerts.playClick(1000, 0.2);

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      alert('Safety Confirmed! Your check-in is complete.');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm safety');
    }
  };

  const handleCancelTimer = async () => {
    if (!activeCheckin) return;
    try {
      await api.cancelCheckin(activeCheckin.id);
      setActiveCheckin(null);
      audioAlerts.playClick(400, 0.1);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel timer');
    }
  };

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4" />
          <span>Automated Guardian Check-In</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Safety Check-In Timer</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Set a safety countdown before walking home, taking a rideshare, or meeting someone. If you do not confirm
          safety before the timer expires, emergency alerts are dispatched to your guardians.
        </p>
      </div>

      {activeCheckin ? (
        /* Active Timer Countdown Card */
        <div className="bg-gradient-to-br from-safeNavy-900 to-safeNavy-950 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Safety Timer Active</span>
          </span>

          <h2 className="text-xl font-bold text-white mt-4">{activeCheckin.destination}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Expires at: {new Date(activeCheckin.expiresAt).toLocaleTimeString()}
          </p>

          {/* Large Countdown Clock */}
          <div className="my-8">
            <div className="text-6xl sm:text-7xl font-black font-mono text-amber-400 tracking-tight drop-shadow-lg">
              {formatCountdown(remainingSeconds)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Minutes : Seconds Remaining</p>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleConfirmSafe}
              className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>I Have Arrived Safely</span>
            </button>

            <button
              onClick={handleCancelTimer}
              className="w-full sm:w-auto bg-safeNavy-800 hover:bg-safeNavy-700 text-slate-300 border border-slate-700 font-semibold py-4 px-6 rounded-2xl text-xs transition-colors"
            >
              Cancel Timer
            </button>
          </div>
        </div>
      ) : (
        /* Configuration Card */
        <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-safeTeal-400" />
            <span>Schedule New Safety Check-In</span>
          </h2>

          <div className="space-y-6">
            {/* Duration Selector Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Check-In Duration:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '15 Minutes', mins: 15 },
                  { label: '30 Minutes', mins: 30 },
                  { label: '45 Minutes', mins: 45 },
                  { label: '60 Minutes', mins: 60 },
                ].map((item) => (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(item.mins);
                      audioAlerts.playClick(600, 0.05);
                    }}
                    className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
                      durationMinutes === item.mins
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-safeNavy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destination or Purpose:
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Walking home from library, Uber ride to apartment"
                className="w-full bg-safeNavy-950 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* What happens on expiry preview card */}
            <div className="bg-safeNavy-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs">
                <Bell className="w-4 h-4" />
                <span>Auto-Escalation Protocol:</span>
              </div>
              <p className="leading-relaxed">
                If safety is not confirmed within <strong className="text-white">{durationMinutes} minutes</strong>,
                an escalation warning is generated and emergency contacts are notified automatically.
              </p>
            </div>

            {/* Start Button */}
            <button
              type="button"
              disabled={isStarting || !destination.trim()}
              onClick={handleStartTimer}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black py-4 rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start {durationMinutes}-Minute Safety Check-In</span>
            </button>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
