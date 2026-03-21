'use client';

import { useEffect, useState } from 'react';

interface Stats {
  activeListings: number;
  totalUsers: number;
  totalListings: number;
  countries: number;
}

const SUPPORTED_COUNTRIES_COUNT = 4;

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  return String(n);
}

const statColors = [
  'bg-gradient-to-br from-sky-500 to-cyan-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-500',
];

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
    { value: stats ? formatNumber(stats.totalUsers) : '20K+', label: 'Elite Members', icon: '✦' },
    { value: stats ? String(stats.countries) : String(SUPPORTED_COUNTRIES_COUNT), label: 'Countries', icon: '🌍' },
    { value: '100%', label: 'Authenticated', icon: '🔒' },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
          {items.map((stat, i) => (
            <div key={stat.label} className={`${statColors[i]} rounded-xl p-3 xs:p-4 text-white text-center shadow-sm`}>
              <div className="text-2xl xs:text-3xl mb-1">{stat.icon}</div>
              <div className="text-lg xs:text-xl sm:text-2xl font-extrabold">{stat.value}</div>
              <div className="text-white/80 text-[10px] xs:text-xs font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
