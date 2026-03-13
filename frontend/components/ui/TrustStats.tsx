'use client';

import { useEffect, useState } from 'react';

interface Stats {
  activeListings: number;
  totalUsers: number;
  totalListings: number;
  countries: number;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  return String(n);
}

export default function TrustStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stats`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  const items = [
    { value: stats ? formatNumber(stats.activeListings) : '50K+', label: 'Active Listings', icon: '📋' },
    { value: stats ? formatNumber(stats.totalUsers) : '20K+', label: 'Happy Buyers', icon: '😊' },
    { value: stats ? String(stats.countries) : '2', label: 'Countries', icon: '🌍' },
    { value: '100%', label: 'Free to List', icon: '🎁' },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-5">
        <div className="flex items-center justify-between gap-2 xs:gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
          {items.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              <span className="text-lg xs:text-xl">{stat.icon}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base xs:text-lg sm:text-xl font-extrabold text-gray-900">{stat.value}</span>
                <span className="text-[10px] xs:text-xs text-gray-500 font-medium whitespace-nowrap">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
