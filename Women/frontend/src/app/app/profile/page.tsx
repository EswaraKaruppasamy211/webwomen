'use client';

import React from 'react';
import { User, Phone, Mail, Shield, LogOut, HeartHandshake, PhoneCall, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-xl shadow-rose-500/20">
          {user?.name.charAt(0) || 'U'}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
              Role: {user?.role}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              GPS Telemetry Active
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Helplines Directory */}
      <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <PhoneCall className="w-5 h-5 text-rose-400" />
          <h2 className="font-bold text-base text-white">Emergency Helplines & Crisis Contacts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Emergency Services (Police / Fire / EMS)</p>
              <p className="text-slate-400 text-[11px]">Direct 24/7 Dispatch</p>
            </div>
            <a href="tel:911" className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg">
              911 / 112
            </a>
          </div>

          <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Women Safety Helpline</p>
              <p className="text-slate-400 text-[11px]">24/7 Toll-Free Support</p>
            </div>
            <a href="tel:1091" className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg">
              1091
            </a>
          </div>

          <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">National Domestic Violence Hotline</p>
              <p className="text-slate-400 text-[11px]">Confidential Crisis Support</p>
            </div>
            <a href="tel:18007997233" className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg">
              1-800-799-7233
            </a>
          </div>

          <div className="bg-safeNavy-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Crisis Text Support</p>
              <p className="text-slate-400 text-[11px]">Free, 24/7 Text Support</p>
            </div>
            <span className="font-mono text-slate-300 font-bold bg-slate-800 px-3 py-1.5 rounded-lg">
              Text HOME to 741741
            </span>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
