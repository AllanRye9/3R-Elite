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
    <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row gap-1 ${className}`}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands..."
        className="flex-1 border-0 rounded-lg sm:rounded-l-md sm:rounded-r-none px-3 py-2.5 xs:py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
      />
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
