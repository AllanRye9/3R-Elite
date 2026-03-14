'use client';

import Link from 'next/link';

interface EliteCategory {
  label: string;
  href: string;
}

const eliteCategories: EliteCategory[] = [
  { label: 'Fine Timepieces', href: '/listings?q=watches' },
  { label: 'Designer Apparel', href: '/listings?q=fashion' },
  { label: 'Tech Innovations', href: '/listings?q=electronics' },
  { label: 'Bespoke Home', href: '/listings?q=home' },
  { label: 'Luxury Vehicles', href: '/listings?q=vehicles' },
];

function EliteVault() {
  return (
    <div className="hidden lg:flex flex-col justify-center absolute top-0 bottom-0 z-10 w-[20%] px-3 left-0">
      <div className="bg-elite-cream/95 backdrop-blur-sm rounded-xl p-4 border border-elite-gold/20 shadow-lg">
        <h3 className="text-xs font-bold text-elite-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-elite-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Elite Vault
        </h3>
        <div className="space-y-1">
          {eliteCategories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-elite-navy/80 hover:text-elite-navy hover:bg-elite-gold/10 transition-all duration-200 interactive group"
            >
              <svg className="w-3 h-3 text-elite-gold/60 group-hover:text-elite-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span className="truncate">{cat.label}</span>
            </Link>
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
