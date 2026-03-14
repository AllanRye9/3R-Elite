'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/context/CountryContext';

interface Props {
  initialQ?: string;
  initialLocation?: string;
  className?: string;
}

const popularSuggestions = [
  'iPhone 12', 'Toyota Corolla', '2 bedroom apartment', 'Samsung Galaxy',
  'MacBook Pro', 'Honda CRV', 'Web Developer', 'Sofa', 'Refrigerator',
];

export function SearchBar({ initialQ = '', initialLocation = '', className = '' }: Props) {
  const { country, locations } = useCountry();
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const filtered = popularSuggestions.filter((s) =>
        s.toLowerCase().includes(lower)
      );
      setSuggestions(filtered.slice(0, 6));
    }, 180);
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    params.set('country', country);
    router.push(`/listings?${params.toString()}`);
  };

  const selectSuggestion = (s: string) => {
    setQ(s);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set('q', s);
    if (location) params.set('location', location);
    params.set('country', country);
    router.push(`/listings?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row gap-1 ${className}`}>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setShowSuggestions(true); setActiveSuggestion(-1); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search for anything..."
          autoComplete="off"
          className="w-full border-0 rounded-lg sm:rounded-l-md sm:rounded-r-none px-3 py-2.5 xs:py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden mt-1">
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    i === activeSuggestion ? 'bg-sky-50 text-sky-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border-0 border-l border-gray-200 rounded-lg sm:rounded-none px-3 py-2.5 xs:py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-sky-700 text-white px-6 py-2.5 xs:py-2 rounded-lg sm:rounded-l-none sm:rounded-r-md text-sm font-semibold hover:bg-sky-800 transition-colors min-h-[44px] sm:min-h-0"
      >
        Search
      </button>
    </form>
  );
}
