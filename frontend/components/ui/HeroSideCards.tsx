'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EliteCategory {
  label: string;
  href: string;
}

const eliteCategories: EliteCategory[] = [
  { label: 'Fine Timepieces', href: '/listings?q=watches' },
  { label: 'Designer Apparel', href: '/listings?q=fashion' },
  { label: 'Tech Innovations', href: '/listings?q=electronics' },
  { label: 'Bespoke Home', href: '/listings?q=home' },
  { label: 'Luxury Vehicles', href: '/listings?q=vehicles' },
];

function EliteVault() {
  const [open, setOpen] = useState(true);

  return (
    <div className="hidden lg:flex flex-col justify-center absolute top-0 bottom-0 z-10 w-[20%] px-3 left-0">
      <div className="bg-elite-cream/95 backdrop-blur-sm rounded-xl border border-elite-gold/20 shadow-lg overflow-hidden">
        {/* Clickable header — toggles dropdown */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-elite-navy uppercase tracking-wider hover:bg-elite-gold/10 transition-colors duration-200"
          aria-expanded={open}
        >
          <svg className="w-3.5 h-3.5 text-elite-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Elite Vault</span>
          {/* Animated chevron */}
          <svg
            className="w-3.5 h-3.5 text-elite-gold ml-auto shrink-0 transition-transform duration-300"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Expandable category list */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? '300px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className="space-y-0.5 px-2 pb-3">
            {eliteCategories.map((cat, i) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-elite-navy/80 hover:text-elite-navy hover:bg-elite-gold/10 transition-all duration-200 interactive group"
                style={{
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <svg className="w-3 h-3 text-elite-gold/50 group-hover:text-elite-gold transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <span className="truncate">{cat.label}</span>
                {/* Hover slide-in arrow */}
                <svg className="w-2.5 h-2.5 text-elite-gold ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembershipEvents() {
  return (
    <>
      {/* Inline keyframe styles */}
      <style>{`
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer-sweep { animation: shimmer-sweep 2.8s ease-in-out infinite; }

        @keyframes fire-pulse {
          0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 2px rgba(234,179,8,0.35)); }
          50%       { transform: scale(1.22); filter: drop-shadow(0 0 7px rgba(234,179,8,0.85)); }
        }
        .animate-fire { animation: fire-pulse 1.6s ease-in-out infinite; }

        @keyframes text-breathe {
          0%, 100% { opacity: 0.65; }
          50%       { opacity: 1; }
        }
        .animate-breathe { animation: text-breathe 2.4s ease-in-out infinite; }

        @keyframes ping-slow {
          0%   { transform: scale(1);   opacity: 0.3; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
      `}</style>

      <div className="hidden lg:flex flex-col gap-3 justify-center absolute top-0 bottom-0 z-10 w-[20%] px-3 right-0">
        {/* Join the Inner Circle */}
        <Link
          href="/auth/register"
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-elite-gold/20 shadow-lg hover:shadow-xl transition-all duration-200 interactive group"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-elite-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            <span className="text-xs font-bold text-elite-navy">Join the Inner Circle</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-snug">Exclusive access to limited drops &amp; member pricing</p>
        </Link>

        {/* Limited Drops — animated */}
        <div className="relative overflow-hidden bg-elite-navy rounded-xl p-4 border border-elite-gold/30 shadow-lg">
          {/* Shimmer sweep overlay */}
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer-sweep pointer-events-none" />

          {/* Corner glow rings */}
          <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full border border-elite-gold/40 animate-ping-slow pointer-events-none" />
          <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full border border-elite-gold/20 animate-ping-slow pointer-events-none" style={{ animationDelay: '0.8s' }} />

          <div className="flex items-center gap-1.5 mb-1.5 relative">
            {/* Animated fire icon */}
            <svg className="w-4 h-4 text-elite-gold animate-fire shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            </svg>
            <span className="text-xs font-bold text-white">Limited Drops</span>
            {/* Pulsing NEW badge */}
            <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500 text-white animate-bounce leading-none">
              NEW
            </span>
          </div>

          <p className="text-[10px] text-white/70 leading-snug animate-breathe relative">
            New exclusive items every week. First come, first served.
          </p>

          {/* Animated dot trail */}
          <div className="flex items-center gap-1 mt-2.5 relative">
            <span className="w-1.5 h-1.5 rounded-full bg-elite-gold animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-elite-gold/60 animate-pulse" style={{ animationDelay: '250ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-elite-gold/30 animate-pulse" style={{ animationDelay: '500ms' }} />
            <span className="text-[9px] text-white/40 ml-auto tracking-wide">This week</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HeroSideCards() {
  return (
    <>
      <EliteVault />
      <MembershipEvents />
    </>
  );
}
