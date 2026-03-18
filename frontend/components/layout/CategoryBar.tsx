'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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
  const currentPath = pathname || '';
  const isListingsView = currentPath === '/' || currentPath.startsWith('/listings');

  const getLinkClasses = (isActive: boolean) => {
    if (isActive) {
      return 'bg-elite-gold text-elite-navy shadow-sm ring-1 ring-elite-gold-light/80';
    }

    return 'text-white/85 hover:text-white hover:bg-white/10';
  };

  return (
    /* Outer wrapper is the positioning context for mega menus so they escape the overflow container */
    <div className="relative">
      {/* Scrollable category links row */}
      <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
        <Link
          href="/listings"
          className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all interactive ${getLinkClasses(isListingsView && !currentQ)}`}
        >
          All
          {isListingsView && !currentQ && <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-elite-gold-light" aria-hidden="true" />}
        </Link>
        {topCategories.map((cat) => {
          const catQ = new URL(cat.href, 'http://x').searchParams.get('q') || '';
          const isActive = isListingsView && catQ.toLowerCase() === currentQ.toLowerCase() && catQ !== '';
          const hasMega = Boolean(cat.megaMenu);

          return (
            <div
              key={cat.label}
              onMouseEnter={() => hasMega && handleMouseEnter(cat.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={cat.href}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] xs:text-xs font-semibold whitespace-nowrap transition-all interactive ${getLinkClasses(isActive)}`}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
                {hasMega && (
                  <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {isActive && <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-elite-gold-light" aria-hidden="true" />}
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
    <div className="w-full border-t border-white/10 bg-elite-charcoal/80 backdrop-blur-sm">
      <div className="w-full px-3 sm:px-6 py-1">
        <Suspense
          fallback={
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              <Link
                href="/listings"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap text-white/85 hover:text-white hover:bg-white/10 transition-all interactive"
              >
                All
              </Link>
              {topCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap text-white/85 hover:text-white hover:bg-white/10 transition-all interactive"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </Link>
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
