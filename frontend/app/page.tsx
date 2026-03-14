import Link from 'next/link';
import { SearchBar } from '@/components/listings/SearchBar';
import { CategoryNav } from '@/components/listings/CategoryNav';
import { ListingGrid } from '@/components/listings/ListingGrid';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import HeroSideCards from '@/components/ui/HeroSideCards';
import TrustStats from '@/components/ui/TrustStats';
import FeaturedCategories from '@/components/ui/FeaturedCategories';
import FlashDeals from '@/components/ui/FlashDeals';
import PromoBanners from '@/components/ui/PromoBanners';
import type { Category } from '@/lib/types';

async function getHomeData() {
  try {
    const [catRes, listingRes, flashRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=createdAt`, { next: { revalidate: 60 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=views`, { next: { revalidate: 120 } }),
    ]);
    const categories: Category[] = catRes.ok ? await catRes.json() : [];
    const listingData = listingRes.ok ? await listingRes.json() : { listings: [] };
    const flashData = flashRes.ok ? await flashRes.json() : { listings: [] };
    return {
      categories,
      listings: listingData.listings || [],
      flashListings: flashData.listings || [],
    };
  } catch {
    return { categories: [], listings: [], flashListings: [] };
  }
}

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
  const { categories, listings, flashListings } = await getHomeData();

  return (
    <div className="animate-fade-in">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[320px] xs:min-h-[360px] sm:min-h-[400px]">
        {/* Slideshow background */}
        <HeroSlideshow />

        {/* Side cards - 20% width on each side */}
        <HeroSideCards />

        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 lg:px-[22%] pt-8 xs:pt-10 pb-10 xs:pb-12 sm:pt-14 sm:pb-16 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[10px] xs:text-xs font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full mb-3 xs:mb-4 border border-white/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            🌍 UAE &amp; Uganda&apos;s Premier Marketplace
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 xs:mb-3 leading-tight text-balance">
            The best place to buy your home,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">sell your car</span>
              <span className="absolute inset-x-0 bottom-0 h-2 xs:h-3 bg-sky-400/30 rounded-full -rotate-1" aria-hidden="true" />
            </span>
            {' '}or find a job
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
            {['Electronics', 'Vehicles', 'Property', 'Fashion', 'Jobs'].map((cat) => (
              <Link
                key={cat}
                href={`/listings?q=${cat.toLowerCase()}`}
                className="text-[10px] xs:text-xs text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-all interactive"
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/listings/create"
              className="text-[10px] xs:text-xs font-bold text-brand-700 bg-white hover:bg-sky-50 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-all interactive shadow-sm"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STATS ═══ */}
      <TrustStats />

      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-6 space-y-6 xs:space-y-8 sm:space-y-10">

        {/* ═══ FEATURED CATEGORIES (Dubizzle-inspired large tiles) ═══ */}
        <FeaturedCategories />

        {/* ═══ FLASH DEALS (Jumia-inspired countdown section) ═══ */}
        <FlashDeals listings={flashListings} />

        {/* ═══ BROWSE ALL CATEGORIES ═══ */}
        {categories.length > 0 && (
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
            <CategoryNav categories={categories} />
          </section>
        )}

        {/* ═══ LATEST LISTINGS (Jiji-style trending feed) ═══ */}
        <section>
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <h2 className="text-lg xs:text-xl font-extrabold text-gray-900">Trending Listings</h2>
              <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Most viewed deals near you</p>
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

        {/* ═══ MARKET CTAs (Promo banners) ═══ */}
        <PromoBanners />

        {/* ═══ SAFETY BANNER ═══ */}
        <section className="bg-amber-50 border border-amber-100 rounded-xl p-4 xs:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 xs:gap-4">
          <div className="shrink-0 w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-900 text-sm xs:text-base mb-0.5">Community Safety Comes First</h3>
            <p className="text-amber-800 text-xs xs:text-sm">
              Always meet in a public place, never pay in advance without inspecting, and report suspicious listings.
              Together, we build a safer marketplace.
            </p>
          </div>
          <Link
            href="/safety"
            className="shrink-0 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors interactive"
          >
            Safety Tips →
          </Link>
        </section>

        {/* ═══ GET VERIFIED CTA (Dubizzle inspired) ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-r from-sky-600 to-brand-700 rounded-xl px-4 xs:px-6 py-6 xs:py-8 text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="shrink-0 w-14 h-14 xs:w-16 xs:h-16 bg-white/15 rounded-2xl flex items-center justify-center text-3xl">
              ✅
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-lg xs:text-xl font-extrabold mb-1">Get Verified — Build Trust &amp; Sell More</h2>
              <p className="text-sky-100 text-xs xs:text-sm max-w-md">
                Join us in building a safer community. Verified sellers get more views,
                higher response rates, and a trust badge on every listing.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 xs:mt-3 text-xs text-sky-100">
                <span className="flex items-center gap-1"><span className="text-emerald-300">✓</span> Increased visibility</span>
                <span className="flex items-center gap-1"><span className="text-emerald-300">✓</span> Verified badge on all ads</span>
                <span className="flex items-center gap-1"><span className="text-emerald-300">✓</span> Buyer confidence boost</span>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="shrink-0 bg-white text-brand-700 font-bold px-5 py-2.5 rounded-xl hover:bg-sky-50 transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
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

