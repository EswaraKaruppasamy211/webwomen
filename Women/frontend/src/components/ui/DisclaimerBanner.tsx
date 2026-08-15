import React from 'react';
import { ShieldAlert, Phone } from 'lucide-react';

export default function DisclaimerBanner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-slate-300 text-xs shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] text-slate-300">
          <strong className="text-amber-300 font-semibold">Safety Disclaimer:</strong> SafeHer AI is a
          safety-support and navigation system. AI safety scores and location information are estimates and do not
          guarantee personal safety or emergency response. In an immediate emergency, contact your local emergency
          services.
        </p>
      </div>

      <a
        href="tel:9344869645"
        className="shrink-0 flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      >
        <Phone className="w-3.5 h-3.5" />
        <span>Dial 9344869645</span>
      </a>
    </div>
  );
}
