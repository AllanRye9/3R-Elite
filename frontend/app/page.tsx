import Link from 'next/link';
import { SearchBar } from '@/components/listings/SearchBar';
import { CategoryNav } from '@/components/listings/CategoryNav';
import { ListingGrid } from '@/components/listings/ListingGrid';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import type { Category } from '@/lib/types';

async function getHomeData() {
  try {
    const [catRes, listingRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=createdAt`, { next: { revalidate: 60 } }),
    ]);
    const categories: Category[] = catRes.ok ? await catRes.json() : [];
    const listingData = listingRes.ok ? await listingRes.json() : { listings: [] };
    return { categories, listings: listingData.listings || [] };
  } catch {
    return { categories: [], listings: [] };
  }
}

const trustStats = [
  { value: '50K+', label: 'Active Listings', icon: '📋' },
  { value: '20K+', label: 'Happy Buyers', icon: '😊' },
  { value: '2', label: 'Countries', icon: '🌍' },
  { value: '100%', label: 'Free to List', icon: '🎁' },
];

const features = [
  {
    icon: '🔒',
    title: 'Safe & Secure',
    desc: 'Verified sellers and secure messaging to protect every transaction.',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Post your listing in under 2 minutes. Reach thousands instantly.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: '💰',
    title: 'Best Prices',
    desc: 'Compare thousands of listings to find unbeatable deals near you.',
    color: 'from-violet-400 to-purple-600',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    desc: 'Fully optimised for mobile. Buy and sell on the go, anywhere.',
    color: 'from-sky-400 to-blue-600',
  },
];

export default async function HomePage() {
  const { categories, listings } = await getHomeData();

  return (
    <div className="animate-fade-in">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[320px] xs:min-h-[360px] sm:min-h-[400px]">
        {/* Slideshow background */}
        <HeroSlideshow />

        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 pt-8 xs:pt-10 pb-10 xs:pb-12 sm:pt-14 sm:pb-16 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[10px] xs:text-xs font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full mb-3 xs:mb-4 border border-white/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            🌍 UAE &amp; Uganda&apos;s Premier Marketplace
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 xs:mb-3 leading-tight text-balance">
            Buy &amp; Sell{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Anything</span>
              <span className="absolute inset-x-0 bottom-0 h-2 xs:h-3 bg-sky-400/30 rounded-full -rotate-1" aria-hidden="true" />
            </span>
            {' '}in UAE &amp; Uganda
          </h1>
          <p className="text-sky-100 text-xs xs:text-sm sm:text-base mb-4 xs:mb-6 max-w-lg mx-auto px-2">
            Millions of listings. Verified sellers. Zero hidden fees.
            Find the best deals near you today.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto px-1 xs:px-0">
            <SearchBar className="w-full" />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 mt-4 xs:mt-5 px-2">
            {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Jobs'].map((cat) => (
              <Link
                key={cat}
                href={`/listings?q=${cat.toLowerCase()}`}
                className="text-[10px] xs:text-xs text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-all interactive"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST STATS ═══ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {trustStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl xs:text-2xl mb-0.5">{stat.icon}</div>
                <div className="text-lg xs:text-xl sm:text-2xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-[10px] xs:text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-6 space-y-6 xs:space-y-8 sm:space-y-10">

        {/* ═══ CATEGORIES ═══ */}
        <section className="animate-fade-up">
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <h2 className="text-lg xs:text-xl font-extrabold text-gray-900">Browse Categories</h2>
              <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Explore what&apos;s available near you</p>
            </div>
            <Link href="/listings" className="text-xs xs:text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 interactive">
              All categories
              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {categories.length > 0 ? (
            <CategoryNav categories={categories} />
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-28 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg shimmer" />
                  <div className="w-16 h-2.5 bg-gray-100 rounded-full shimmer" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ LATEST LISTINGS ═══ */}
        <section>
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <h2 className="text-lg xs:text-xl font-extrabold text-gray-900">Latest Listings</h2>
              <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Fresh deals just posted</p>
            </div>
            <Link href="/listings" className="text-xs xs:text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 interactive">
              View all
              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {listings.length > 0 ? (
            <ListingGrid listings={listings} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100 shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full shimmer w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full shimmer w-1/2" />
                    <div className="h-4 bg-gray-100 rounded-full shimmer w-1/3 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ MARKET CTAs ═══ */}
        <section className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
          <Link
            href="/listings?country=UAE"
            className="group relative overflow-hidden rounded-lg p-4 xs:p-6 sm:p-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 interactive"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 group-hover:to-black/20 transition-all" />
            <div className="absolute -top-10 -right-10 w-28 xs:w-40 h-28 xs:h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="text-3xl xs:text-4xl mb-2 xs:mb-3 group-hover:scale-110 transition-transform inline-block">🇦🇪</div>
              <h3 className="text-lg xs:text-xl font-extrabold mb-0.5 xs:mb-1">UAE Market</h3>
              <p className="text-emerald-100 text-xs xs:text-sm">Dubai · Abu Dhabi · Sharjah · Ajman</p>
              <div className="mt-3 xs:mt-4 inline-flex items-center gap-1.5 text-xs xs:text-sm font-semibold bg-white/20 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                Explore →
              </div>
            </div>
          </Link>

          <Link
            href="/listings?country=UGANDA"
            className="group relative overflow-hidden rounded-lg p-4 xs:p-6 sm:p-8 bg-gradient-to-br from-yellow-500 to-amber-600 text-white hover:shadow-xl transition-all duration-300 interactive"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 group-hover:to-black/20 transition-all" />
            <div className="absolute -top-10 -right-10 w-28 xs:w-40 h-28 xs:h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="text-3xl xs:text-4xl mb-2 xs:mb-3 group-hover:scale-110 transition-transform inline-block">🇺🇬</div>
              <h3 className="text-lg xs:text-xl font-extrabold mb-0.5 xs:mb-1">Uganda Market</h3>
              <p className="text-amber-100 text-xs xs:text-sm">Kampala · Jinja · Gulu · Mbarara</p>
              <div className="mt-3 xs:mt-4 inline-flex items-center gap-1.5 text-xs xs:text-sm font-semibold bg-white/20 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                Explore →
              </div>
            </div>
          </Link>
        </section>

        {/* ═══ WHY 3R-ELITE ═══ */}
        <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 xs:p-6 sm:p-8">
          <div className="text-center mb-4 xs:mb-6">
            <h2 className="text-lg xs:text-xl font-extrabold text-gray-900">Why Choose 3R-Elite?</h2>
            <p className="text-gray-500 text-xs xs:text-sm mt-1">The smart way to buy and sell</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 stagger-children">
            {features.map((f) => (
              <div key={f.title} className="text-center group">
                <div className={`w-10 h-10 xs:w-12 xs:h-12 mx-auto mb-2 xs:mb-3 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-xl xs:text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-xs xs:text-sm mb-0.5 xs:mb-1">{f.title}</h3>
                <p className="text-[10px] xs:text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ POST AD CTA ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-r from-brand-700 to-indigo-700 rounded-lg px-4 xs:px-6 py-6 xs:py-8 sm:px-10 text-white text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-24 xs:w-32 h-24 xs:h-32 bg-white/5 rounded-full blur-xl" />
            <div className="absolute bottom-0 right-1/4 w-32 xs:w-40 h-32 xs:h-40 bg-sky-400/10 rounded-full blur-xl" />
          </div>
          <div className="relative">
            <p className="text-3xl xs:text-4xl mb-2 xs:mb-3">🚀</p>
            <h2 className="text-xl xs:text-2xl font-extrabold mb-1.5 xs:mb-2">Ready to Sell?</h2>
            <p className="text-sky-200 text-xs xs:text-sm mb-4 xs:mb-5 max-w-sm mx-auto">
              List your item for free and reach thousands of buyers in UAE and Uganda today.
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-lg hover:bg-sky-50 transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Post Free Ad
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

