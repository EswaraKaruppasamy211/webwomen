'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Radio,
  FileText,
  Users,
  MapPin,
  BarChart3,
  Lock,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  Compass,
  Sliders,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { socketClient } from '../../services/socket';
import { audioAlerts } from '../../services/audioAlerts';
import { EmergencyIncident } from '../../types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeSOSAlert, setActiveSOSAlert] = useState<EmergencyIncident | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login?role=admin');
    }
  }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      socketClient.connect();
      socketClient.joinAdminRoom();

      const unsubNew = socketClient.onEmergencyNew((data) => {
        setActiveSOSAlert(data.incident);
        if (soundEnabled) {
          audioAlerts.startEmergencySiren();
        }
      });

      return () => {
        unsubNew();
      };
    }
  }, [isAdmin, soundEnabled]);

  const dismissAlarm = () => {
    setActiveSOSAlert(null);
    audioAlerts.stopEmergencySiren();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { label: 'Overview', href: '/admin', icon: Sliders },
    { label: 'Live Emergencies', href: '/admin/live', icon: Radio, alert: !!activeSOSAlert },
    { label: 'Reports Moderation', href: '/admin/reports', icon: FileText },
    { label: 'Safety Zones', href: '/admin/zones', icon: MapPin },
    { label: 'Safety Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Security Audit Logs', href: '/admin/audit', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-safeNavy-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header Branding */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-base text-white tracking-tight">SafeHer AI</h1>
                <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-bold">
                  Command Center
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="w-full flex items-center justify-between bg-safeNavy-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Audible Alarm</span>
            </span>
            <span className={`font-mono text-[10px] font-bold ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {soundEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>

          {/* User App Switch */}
          <Link
            href="/app"
            className="w-full flex items-center justify-center gap-1.5 bg-safeNavy-800 hover:bg-safeNavy-700 text-slate-300 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Switch to User View</span>
          </Link>

          {/* Admin User Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Command Center Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
        {/* Top Emergency Pop-up Toast if active SOS alert arrives */}
        {activeSOSAlert && (
          <div className="bg-red-600 text-white p-4 flex items-center justify-between shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 animate-ping" />
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wider">
                  🚨 CRITICAL INCOMING SOS EMERGENCY: {activeSOSAlert.userName}
                </p>
                <p className="text-xs text-red-100 font-mono">
                  Location: {activeSOSAlert.address} • Started: {new Date(activeSOSAlert.startedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/live"
                onClick={dismissAlarm}
                className="bg-white text-red-700 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-slate-100 transition-colors"
              >
                Open Live Map
              </Link>
              <button
                onClick={dismissAlarm}
                className="bg-red-800 hover:bg-red-900 text-white text-xs px-3 py-2 rounded-xl"
              >
                Mute Siren
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
