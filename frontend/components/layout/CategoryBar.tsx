'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const topCategories = [
  { label: 'Vehicles', icon: '🚗', href: '/listings?q=vehicles' },
  { label: 'Real Estate', icon: '🏠', href: '/listings?q=real+estate' },
  { label: 'Electronics', icon: '💻', href: '/listings?q=electronics' },
  { label: 'Fashion', icon: '👗', href: '/listings?q=fashion' },
  { label: 'Jobs', icon: '💼', href: '/listings?q=jobs' },
  { label: 'Services', icon: '🔧', href: '/listings?q=services' },
  { label: 'Home & Garden', icon: '🛋️', href: '/listings?q=home' },
  { label: 'Kids & Baby', icon: '🧸', href: '/listings?q=kids' },
];

function CategoryBarInner() {
  const params = useSearchParams();
  const currentQ = params.get('q') || '';

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
      <Link
        href="/listings"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all interactive ${
          !currentQ
            ? 'bg-white/20 text-white'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        All
      </Link>
      {topCategories.map((cat) => {
        const catQ = new URL(cat.href, 'http://x').searchParams.get('q') || '';
        const isActive = catQ.toLowerCase() === currentQ.toLowerCase() && catQ !== '';
        return (
          <Link
            key={cat.label}
            href={cat.href}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all interactive ${
              isActive
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoryBar() {
  return (
    <div className="w-full border-t border-white/10 bg-brand-800/30 backdrop-blur-sm">
      <div className="w-full px-3 sm:px-6 py-1">
        <Suspense
          fallback={
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {topCategories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap text-white/80"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </div>
              ))}
            </div>
          }
        >
          <CategoryBarInner />
        </Suspense>
      </div>
    </div>
  );
}
