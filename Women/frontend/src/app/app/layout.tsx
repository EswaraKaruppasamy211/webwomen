'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/ui/Navbar';
import BottomNav from '../../components/ui/BottomNav';

export default function UserAppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-safeNavy-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Securing connection to SafeHer AI network...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-safeNavy-950 flex flex-col pb-20 md:pb-8">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
      <BottomNav />
    </div>
  );
}
