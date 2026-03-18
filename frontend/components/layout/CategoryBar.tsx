'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { Suspense } from 'react';

const MENU_CLOSE_DELAY_MS = 150;

interface MegaMenuColumn {
  heading: string;
  links: { label: string; href: string }[];
}

interface TopCategory {
  label: string;
  icon: string;
  href: string;
  megaMenu?: MegaMenuColumn[];
}

const topCategories: TopCategory[] = [
  {
    label: 'Motors',
    icon: '🚗',
    href: '/listings?q=motors',
    megaMenu: [
      {
        heading: 'Cars',
        links: [
          { label: 'Used Cars', href: '/listings?q=used+cars' },
          { label: 'New Cars', href: '/listings?q=new+cars' },
          { label: 'Classic Cars', href: '/listings?q=classic+cars' },
        ],
      },
      {
        heading: 'Other Vehicles',
        links: [
          { label: 'Motorcycles', href: '/listings?q=motorcycles' },
          { label: 'Trucks & Buses', href: '/listings?q=trucks' },
          { label: 'Boats', href: '/listings?q=boats' },
        ],
      },
      {
        heading: 'Parts & Accessories',
        links: [
          { label: 'Car Parts', href: '/listings?q=car+parts' },
          { label: 'Tyres & Wheels', href: '/listings?q=tyres' },
          { label: 'Car Accessories', href: '/listings?q=car+accessories' },
        ],
      },
    ],
  },
  {
    label: 'Property',
    icon: '🏠',
    href: '/listings?q=property',
    megaMenu: [
      {
        heading: 'For Rent',
        links: [
          { label: 'Apartments for Rent', href: '/listings?q=apartments+rent' },
          { label: 'Houses for Rent', href: '/listings?q=houses+rent' },
          { label: 'Rooms for Rent', href: '/listings?q=rooms+rent' },
        ],
      },
      {
        heading: 'For Sale',
        links: [
          { label: 'Apartments for Sale', href: '/listings?q=apartments+sale' },
          { label: 'Houses for Sale', href: '/listings?q=houses+sale' },
          { label: 'Land & Plots', href: '/listings?q=land' },
        ],
      },
      {
        heading: 'Commercial',
        links: [
          { label: 'Office Space', href: '/listings?q=office+space' },
          { label: 'Shops & Retail', href: '/listings?q=shops' },
          { label: 'Warehouses', href: '/listings?q=warehouses' },
        ],
      },
    ],
  },
  {
    label: 'Jobs',
    icon: '💼',
    href: '/listings?q=jobs',
    megaMenu: [
      {
        heading: 'Job Types',
        links: [
          { label: 'Full Time', href: '/listings?q=full+time+jobs' },
          { label: 'Part Time', href: '/listings?q=part+time+jobs' },
          { label: 'Freelance', href: '/listings?q=freelance' },
        ],
      },
      {
        heading: 'Industries',
        links: [
          { label: 'Technology', href: '/listings?q=tech+jobs' },
          { label: 'Healthcare', href: '/listings?q=healthcare+jobs' },
          { label: 'Finance', href: '/listings?q=finance+jobs' },
        ],
      },
    ],
  },
  { label: 'Classifieds', icon: '📋', href: '/listings?q=classifieds' },
  { label: 'Electronics', icon: '💻', href: '/listings?q=electronics' },
  { label: 'Fashion', icon: '👗', href: '/listings?q=fashion' },
  { label: 'Furniture & Garden', icon: '🛋️', href: '/listings?q=furniture' },
  { label: 'Services', icon: '🔧', href: '/listings?q=services' },
];

function CategoryBarInner() {
  const params = useSearchParams();
  const currentQ = params ? params.get('q') || '' : '';
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), MENU_CLOSE_DELAY_MS);
  };

  const activeCategory = openMenu ? topCategories.find((c) => c.label === openMenu) : null;

  return (
    /* Outer wrapper is the positioning context for mega menus so they escape the overflow container */
    <div className="relative">
      {/* Scrollable category links row */}
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
          const hasMega = Boolean(cat.megaMenu);

          return (
            <div
              key={cat.label}
              onMouseEnter={() => hasMega && handleMouseEnter(cat.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={cat.href}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all interactive ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
                {hasMega && (
                  <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Mega Menu — rendered outside the overflow container so it is never clipped */}
      {activeCategory?.megaMenu && (
        <div
          className="absolute left-0 top-full pt-1 z-[60]"
          onMouseEnter={() => handleMouseEnter(activeCategory.label)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-5 flex gap-8 min-w-[480px] animate-scale-in">
            {activeCategory.megaMenu.map((col) => (
              <div key={col.heading} className="flex-1 min-w-[140px]">
                <h4 className="text-xs font-extrabold text-gray-900 mb-3 uppercase tracking-wider">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-elite-gold hover:font-medium transition-colors block py-0.5"
                        onClick={() => setOpenMenu(null)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryBar() {
  return (
    <div className="w-full border-t border-white/5 bg-elite-charcoal/50 backdrop-blur-sm">
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
