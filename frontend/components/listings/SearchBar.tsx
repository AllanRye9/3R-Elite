'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/context/CountryContext';

interface Props {
  initialQ?: string;
  initialLocation?: string;
  className?: string;
}

export function SearchBar({ initialQ = '', initialLocation = '', className = '' }: Props) {
  const { country, locations } = useCountry();
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    params.set('country', country);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What are you looking for?"
        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
