'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, AlertTriangle, User as UserIcon, LogOut, PhoneCall, Sparkles, Sliders } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmergency } from '../../contexts/EmergencyContext';
import { useDemo } from '../../contexts/DemoContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { isSOSActive } = useEmergency();
  const { isDemoMode, toggleDemoMode } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-safeNavy-900/90 backdrop-blur-md border-b border-safeNavy-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/app" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">SafeHer</span>
              <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent font-extrabold text-sm">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Safety & Emergency Response
            </p>
          </div>
        </Link>

        {/* Live Safety Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-safeNavy-800/90 border border-slate-700/60 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
          {isSOSActive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-red-400 font-bold tracking-wide">🚨 ACTIVE EMERGENCY SOS</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300">Live GPS Protected</span>
            </>
          )}
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isDemoMode
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-safeNavy-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Demo Presentation Simulation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Demo Mode:</span>
            <span>{isDemoMode ? 'ON (Simulated)' : 'OFF'}</span>
          </button>

          {/* Quick Admin Switch Link */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
          )}

          {/* User Account Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-white rounded-full pl-2 pr-3 py-1.5 transition-colors text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-safeNavy-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono text-[10px]">
                      Role: {user.role}
                    </span>
                  </div>

                  <Link
                    href="/app/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Profile & Preferences</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-indigo-300 hover:bg-indigo-950/60 rounded-lg transition-colors"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Admin Command Center</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-full transition-all shadow-md shadow-rose-600/30"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
