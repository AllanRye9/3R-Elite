'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface SubItem {
  label: string;
  href: string;
}

interface EliteCategory {
  label: string;
  href: string;
  subItems: SubItem[];
}

const eliteCategories: EliteCategory[] = [
  {
    label: 'Fine Timepieces',
    href: '/listings?q=watches',
    subItems: [
      { label: 'Rolex Collections', href: '/listings?q=rolex' },
      { label: 'Omega Watches', href: '/listings?q=omega' },
      { label: 'Patek Philippe', href: '/listings?q=patek+philippe' },
      { label: 'Audemars Piguet', href: '/listings?q=audemars+piguet' },
      { label: 'Tag Heuer', href: '/listings?q=tag+heuer' },
    ],
  },
  {
    label: 'Designer Apparel',
    href: '/listings?q=fashion',
    subItems: [
      { label: 'Louis Vuitton', href: '/listings?q=louis+vuitton' },
      { label: 'Gucci', href: '/listings?q=gucci' },
      { label: 'Prada', href: '/listings?q=prada' },
      { label: 'Chanel', href: '/listings?q=chanel' },
      { label: 'Hermès', href: '/listings?q=hermes' },
    ],
  },
  {
    label: 'Tech Innovations',
    href: '/listings?q=electronics',
    subItems: [
      { label: 'Latest iPhones', href: '/listings?q=iphone' },
      { label: 'MacBook Pro', href: '/listings?q=macbook' },
      { label: 'DJI Drones', href: '/listings?q=dji' },
      { label: 'Smart Watches', href: '/listings?q=smart+watch' },
      { label: 'Premium Audio', href: '/listings?q=headphones' },
    ],
  },
  {
    label: 'Bespoke Home',
    href: '/listings?q=home',
    subItems: [
      { label: 'Luxury Furniture', href: '/listings?q=furniture' },
      { label: 'Fine Art', href: '/listings?q=art' },
      { label: 'Premium Decor', href: '/listings?q=decor' },
      { label: 'Rare Antiques', href: '/listings?q=antiques' },
      { label: 'Crystal & China', href: '/listings?q=crystal' },
    ],
  },
  {
    label: 'Luxury Vehicles',
    href: '/listings?q=vehicles',
    subItems: [
      { label: 'Bentley', href: '/listings?q=bentley' },
      { label: 'Lamborghini', href: '/listings?q=lamborghini' },
      { label: 'Ferrari', href: '/listings?q=ferrari' },
      { label: 'Rolls-Royce', href: '/listings?q=rolls+royce' },
      { label: 'Porsche', href: '/listings?q=porsche' },
    ],
  },
];

function EliteVault() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4]);

  // Periodically swap two adjacent items to create the "swinging interchange" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * (next.length - 1));
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const displayedCategories = order.map((i) => eliteCategories[i]);

  return (
    <div className="hidden lg:flex flex-col justify-center absolute top-0 bottom-0 z-20 w-[20%] px-3 left-0">
      <div className="bg-elite-cream/95 backdrop-blur-sm rounded-xl p-4 border border-elite-gold/20 shadow-lg">
        <h3 className="text-xs font-bold text-elite-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-elite-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Elite Vault
        </h3>
        <div className="space-y-1">
          {displayedCategories.map((cat, displayIdx) => (
            <div
              key={cat.label}
              className="relative animate-swing"
              style={{ animationDelay: `${displayIdx * 0.4}s` }}
              onMouseEnter={() => setActiveIndex(displayIdx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <Link
                href={cat.href}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 interactive group ${
                  activeIndex === displayIdx
                    ? 'text-elite-navy bg-elite-gold/15 translate-x-1'
                    : 'text-elite-navy/80 hover:text-elite-navy hover:bg-elite-gold/10'
                }`}
              >
                <svg
                  className={`w-3 h-3 transition-all duration-300 ${
                    activeIndex === displayIdx
                      ? 'text-elite-gold rotate-90'
                      : 'text-elite-gold/60 group-hover:text-elite-gold'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <span className="truncate">{cat.label}</span>
              </Link>

              {/* Side panel showing sub-items on hover */}
              {activeIndex === displayIdx && (
                <div className="absolute left-full top-0 ml-2 z-50 w-48 bg-white/98 backdrop-blur-sm rounded-xl border border-elite-gold/30 shadow-2xl p-3 animate-scale-in">
                  <p className="text-[10px] font-bold text-elite-navy uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-100">
                    {cat.label}
                  </p>
                  <div className="space-y-0.5">
                    {cat.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-700 hover:text-elite-navy hover:bg-elite-gold/10 transition-all duration-150 group/sub"
                      >
                        <span className="w-1 h-1 rounded-full bg-elite-gold/60 group-hover/sub:bg-elite-gold transition-colors flex-shrink-0" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={cat.href}
                    className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-elite-navy hover:text-elite-gold transition-colors pt-2 border-t border-gray-100"
                  >
                    View all →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembershipEvents() {
  return (
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

      {/* Limited Drops */}
      <div className="bg-elite-navy rounded-xl p-4 border border-elite-gold/30 shadow-lg">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-4 h-4 text-elite-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          </svg>
          <span className="text-xs font-bold text-white">Limited Drops</span>
        </div>
        <p className="text-[10px] text-white/70 leading-snug">New exclusive items every week. First come, first served.</p>
      </div>
    </div>
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
