'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bot, Users, AlertCircle, Clock, FileText } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { isSOSActive } = useEmergency();

  const navItems = [
    { label: 'Home', href: '/app', icon: Home },
    { label: 'Navigate', href: '/app/navigate', icon: Compass },
    { label: 'SafeAI', href: '/app/safe-ai', icon: Bot },
    { label: 'Contacts', href: '/app/contacts', icon: Users },
    { label: 'Check-In', href: '/app/checkin', icon: Clock },
    { label: 'Reports', href: '/app/reports', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-safeNavy-900/95 backdrop-blur-xl border-t border-safeNavy-800/80 px-2 py-2 md:hidden shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-rose-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-400 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-rose-400 mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
