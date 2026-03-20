'use client';

import { useState, useRef, useEffect } from 'react';
import { useCountry } from '@/context/CountryContext';

const COUNTRY_OPTIONS = [
  { value: 'UAE' as const, flag: '🇦🇪', label: 'UAE', full: 'United Arab Emirates' },
  { value: 'UGANDA' as const, flag: '🇺🇬', label: 'Uganda', full: 'Uganda' },
  { value: 'KENYA' as const, flag: '🇰🇪', label: 'Kenya', full: 'Kenya' },
  { value: 'CHINA' as const, flag: '🇨🇳', label: 'China', full: 'China' },
];

export function CountrySelector() {
  const { country, setCountry } = useCountry();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_OPTIONS.find((o) => o.value === country) ?? COUNTRY_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-all"
      >
        <span className="text-base leading-none" aria-hidden="true">{selected.flag}</span>
        <span>{selected.label}</span>
        <svg
          className={`w-3 h-3 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select country"
          className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-[80] overflow-hidden animate-scale-in"
        >
          {COUNTRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === country}
              type="button"
              onClick={() => { setCountry(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                opt.value === country
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{opt.flag}</span>
              <div>
                <div className="font-semibold">{opt.label}</div>
                <div className="text-xs text-gray-400">{opt.full}</div>
              </div>
              {opt.value === country && (
                <svg className="ml-auto w-4 h-4 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
