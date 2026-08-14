'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Compass,
  AlertTriangle,
  Radio,
  Lock,
  PhoneCall,
  Clock,
  Sparkles,
  Users,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import SafetyMap from '../components/map/SafetyMap';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-safeNavy-950 text-slate-100 flex flex-col selection:bg-rose-500">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-safeNavy-900/90 backdrop-blur-md border-b border-safeNavy-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-white tracking-tight">SafeHer</span>
                <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent font-extrabold text-base">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Women Safety Navigation & Response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login?role=admin"
              className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-950/40 px-3.5 py-2 rounded-xl transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>

            <Link
              href="/login"
              className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-rose-600/20 via-indigo-600/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-safeNavy-800/90 border border-rose-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-rose-300 mb-6 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>Next-Gen Emergency Dispatch & AI Navigation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Your safety, connected in{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              real time.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SafeHer AI combines real-time GPS emergency dispatch, AI-powered route safety risk scoring, verified Safe Haven
            navigation, and 24/7 guardian check-ins designed specifically for women.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-rose-600/40 transition-all flex items-center gap-2 text-sm sm:text-base group"
            >
              <Shield className="w-5 h-5" />
              <span>Get Started Free</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login?demo=true"
              className="bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-2xl transition-all text-sm sm:text-base flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Try Live Demo</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-safeNavy-900/80 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl font-black text-rose-400">0.4s</p>
              <p className="text-xs text-slate-400 mt-0.5">Emergency Socket Alert Latency</p>
            </div>
            <div className="bg-safeNavy-900/80 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified Contact Delivery Proof</p>
            </div>
            <div className="bg-safeNavy-900/80 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl font-black text-indigo-400">AI-Scored</p>
              <p className="text-xs text-slate-400 mt-0.5">Lighting & Safety Risk Corridors</p>
            </div>
            <div className="bg-safeNavy-900/80 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl font-black text-amber-400">24/7</p>
              <p className="text-xs text-slate-400 mt-0.5">Safe Havens & Police Posts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="py-12 px-6 bg-safeNavy-900/60 border-y border-safeNavy-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-safeTeal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4" />
                <span>Live Interactive Safety Map</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Intelligent routing avoiding dark & isolated areas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Our dynamic map plots 24/7 safe shelters, trauma hospitals, police posts, and crowdsourced community hazards.
            </p>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl relative">
            <SafetyMap
              center={[37.7749, -122.4194]}
              zoom={14}
              userPosition={{ latitude: 37.7749, longitude: -122.4194, accuracy: 12 }}
              safeZones={[
                {
                  id: 'z1',
                  name: 'Metropolitan Central Police Station',
                  type: 'POLICE_STATION',
                  latitude: 37.7749,
                  longitude: -122.4194,
                  radiusMeters: 300,
                  safetyScore: 98,
                  address: '850 Bryant St',
                  phone: '911',
                },
                {
                  id: 'z2',
                  name: 'General Hospital Emergency Center',
                  type: 'HOSPITAL',
                  latitude: 37.7833,
                  longitude: -122.4167,
                  radiusMeters: 250,
                  safetyScore: 96,
                  address: '1001 Potrero Ave',
                },
                {
                  id: 'z3',
                  name: 'SafeHaven Women Crisis Support',
                  type: 'SAFE_SHELTER',
                  latitude: 37.7699,
                  longitude: -122.4469,
                  radiusMeters: 200,
                  safetyScore: 95,
                  address: '350 Parnassus Ave',
                },
              ]}
              hazardReports={[
                {
                  id: 'h1',
                  userId: 'u1',
                  userName: 'Community Member',
                  category: 'POOR_LIGHTING',
                  title: 'Broken street lamps along 4th Street',
                  description: 'Unlit alleyway after 8 PM',
                  latitude: 37.7791,
                  longitude: -122.4112,
                  address: '4th St & Elm',
                  status: 'APPROVED',
                  severity: 'MEDIUM',
                  createdAt: new Date().toISOString(),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built specifically for immediate protection & peace of mind
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              Every feature is engineered to remove friction during high-stress situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-rose-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Deliberate Hold SOS Trigger</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                2-second circular hold mechanism prevents accidental triggers while enabling fast 1-tap activation in critical emergencies.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-5">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Dispatch Feeds</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                WebSocket integration streams live GPS breadcrumbs to the Admin Command Center and verifies contact SMS/email delivery receipts.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Route Safety Risk Scorer</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Evaluates street illumination density, time-of-day risk, nearby open safe havens, and historical hazard reports (0–100 score).
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-amber-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Safety Check-In Timers</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Set a timer when walking home or taking a cab. If you don&apos;t confirm safety before expiry, emergency contacts are automatically notified.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-purple-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">SafeAI Companion & Triage</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                24/7 AI companion offering simulated fake phone calls, immediate de-escalation tips, legal rights, and emergency triage.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-safeNavy-900/90 border border-slate-800 hover:border-teal-500/40 p-6 rounded-3xl transition-all shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Privacy & Security Fortress</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                End-to-end bcrypt hashing, JWT authentication, RBAC admin segregation, and immutable audit logs with zero credential leakage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Safety Notice */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <DisclaimerBanner />
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-safeNavy-900 border-t border-safeNavy-800 py-8 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-white">SafeHer AI</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              User Login
            </Link>
            <Link href="/login?role=admin" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
            <Link href="/login?demo=true" className="text-amber-400 hover:text-amber-300 font-semibold">
              Live Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
