'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Sparkles,
  Sliders,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DisclaimerBanner from '../../components/ui/DisclaimerBanner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user, isAdmin } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Email format / Gmail check state
  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com');
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/app');
      }
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegisterMode(true);
    }
    if (searchParams.get('role') === 'admin') {
      fillDemoAdmin();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail) {
      setError('Please enter a valid Gmail / Email address (e.g. user@gmail.com).');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register({ name, email, phone, password });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('sarah@safeher.ai');
    setPassword('User@SafeHer2026!');
    setIsRegisterMode(false);
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail('admin@safeher.ai');
    setPassword('');
    setIsRegisterMode(false);
    setError(null);
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/20 mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {isRegisterMode ? 'Create SafeHer Account' : 'Sign in to SafeHer AI'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isRegisterMode
            ? 'Join the AI-assisted women safety and response network'
            : 'Secure access to your personal safety dashboard'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="grid grid-cols-2 gap-1 bg-safeNavy-950 p-1 rounded-xl mb-6 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setError(null);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            !isRegisterMode
              ? 'bg-safeNavy-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setError(null);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            isRegisterMode
              ? 'bg-safeNavy-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegisterMode && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 014-8832"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Email Address (Gmail Verified)</label>
            {email.length > 3 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isValidEmail
                    ? isGmail
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {isValidEmail ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{isGmail ? 'Verified Gmail' : 'Valid Email'}</span>
                  </>
                ) : (
                  <span>Invalid Email</span>
                )}
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-600/30 text-xs sm:text-sm flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{isRegisterMode ? 'Verify & Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 1-Click Demo Evaluation Fillers */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Quick-Fill System Roles:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillDemoUser}
            className="bg-safeNavy-800 hover:bg-safeNavy-700 border border-slate-700 text-slate-200 p-2.5 rounded-xl text-left transition-colors"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
              <Sparkles className="w-3 h-3" />
              <span>Sarah (User)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">User Role (SOS Tester)</p>
          </button>

          <button
            type="button"
            onClick={fillDemoAdmin}
            className="bg-safeNavy-800 hover:bg-safeNavy-700 border border-indigo-500/40 text-slate-200 p-2.5 rounded-xl text-left transition-colors shadow-sm"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
              <Sliders className="w-3 h-3" />
              <span>Admin Block</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Secure Dispatcher Portal</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-safeNavy-950 flex flex-col justify-between p-4 sm:p-6 selection:bg-rose-500">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight">SafeHer AI</span>
        </Link>

        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
          &larr; Back to Home
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading authentication...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>

      <div className="max-w-md w-full mx-auto">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
