'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // added for optimized images
// import { SearchBar } from '@/components/listings/SearchBar';

// ProgressCarousel import removed (unused)
import { CategoryNav } from '@/components/listings/CategoryNav';
import { ListingGrid } from '@/components/listings/ListingGrid';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import HeroSideCards from '@/components/ui/HeroSideCards';
import TrustStats from '@/components/ui/TrustStats';
import FeaturedCategories from '@/components/ui/FeaturedCategories';
import FlashDeals from '@/components/ui/FlashDeals';
import PromoBanners from '@/components/ui/PromoBanners';
import CategoryPills from '@/components/ui/CategoryPills';
import FeaturedProductCard from '@/components/ui/FeaturedProductCard';
import QuickActions from '@/components/ui/QuickActions';

import TestimonialSection from '@/components/ui/TestimonialSection';
import ReviewPortalCTA from '@/components/ui/ReviewPortalCTA';
import type { Category } from '@/lib/types';


function FeaturedDealCarousel({ initialCards }: { initialCards: React.ReactNode[] }) {
  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        if (prev.length <= 1) return prev;
        // Rotate: move first card to the end
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto scrollable-x">
      <style jsx>{`
        .scrollable-x {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .scrollable-x::-webkit-scrollbar {
          height: 6px;
        }
        .scrollable-x::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 20px;
        }
        .scrollable-x::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .scrollable-x::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="flex gap-4 w-[900px] max-w-full">
        {cards}
      </div>
    </div>
  );
}

async function getHomeData() {
  try {
    const [catRes, listingRes, flashRes, featuredRes, latestCollRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=createdAt`, { next: { revalidate: 60 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings?limit=8&sort=views`, { next: { revalidate: 120 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings/featured-deal`, { next: { revalidate: 30 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listings/latest-collections`, { next: { revalidate: 30 } }),
    ]);
    const categories: Category[] = catRes.ok ? await catRes.json() : [];
    const listingData = listingRes.ok ? await listingRes.json() : { listings: [] };
    const flashData = flashRes.ok ? await flashRes.json() : { listings: [] };
    const featuredDeal = featuredRes.ok ? await featuredRes.json() : null;
    const latestCollData = latestCollRes.ok ? await latestCollRes.json() : { listings: [] };
    return {
      categories,
      listings: listingData.listings || [],
      flashListings: flashData.listings || [],
      featuredDeal,
      latestCollections: latestCollData.listings || [],
    };
  } catch {
    return { categories: [], listings: [], flashListings: [], featuredDeal: null, latestCollections: [] };
  }
}

const features = [
  {
    icon: '🔒',
    title: 'Trusted & Verified',
    desc: 'Every seller is vetted. Secure transactions and verified authenticity.',
    color: 'from-[#0B132B] to-[#1C2541]',
  },
  {
    icon: '✦',
    title: 'Curated Selection',
    desc: 'Only the finest listings. Quality over quantity, always.',
    color: 'from-[#0B132B] to-[#1C2541]',
  },
  {
    icon: '💎',
    title: 'Exclusive Pricing',
    desc: 'Member-only deals and exclusive access to premium collections.',
    color: 'from-[#0B132B] to-[#1C2541]',
  },
  {
    icon: '🌍',
    title: 'Global Reach',
    desc: 'Connect with elite buyers and sellers across UAE and Uganda.',
    color: 'from-[#0B132B] to-[#1C2541]',
  },
];

const heroQuickLinks = ['Fine Timepieces', 'Designer Apparel', 'Tech Innovations', 'Bespoke Home', 'Luxury Vehicles'] as const;

export default async function HomePage() {
  const { categories, listings, flashListings, featuredDeal, latestCollections } = await getHomeData();

  // Prepare cards for the rotating carousel
  const featuredCards: React.ReactNode[] = [];

  // 1. Real or fallback featured deal
  if (featuredDeal && featuredDeal.id) {
    featuredCards.push(
      <FeaturedProductCard
        key={featuredDeal.id}
        storeName={featuredDeal.user?.name || '3R Elite Store'}
        title={featuredDeal.title}
        discountedPrice={`${featuredDeal.currency} ${featuredDeal.price?.toLocaleString()}`}
        imageUrl={featuredDeal.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
        href={`/listings/${featuredDeal.id}`}
        isHandpicked
        className="w-40 min-w-[10rem] max-w-xs"
      />
    );
  } else {
    featuredCards.push(
      <FeaturedProductCard
        key="fallback-featured"
        storeName="3R Elite Store"
        title="Premium Wireless Headphones"
        discountedPrice="AED 449"
        imageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
        href="/listings"
        className="w-40 min-w-[10rem] max-w-xs"
      />
    );
  }

  // 2. Add 7 beautiful placeholder cards (total 8)
  const placeholderImages = [
    { id: 'watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=375&fit=crop&auto=format', title: 'Minimalist Chronograph — Edition 2025' },
    { id: 'sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=375&fit=crop&auto=format', title: 'AirFlow Running Shoes — Breathable mesh' },
    { id: 'backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=375&fit=crop&auto=format', title: 'Vintage Leather Backpack — Handcrafted' },
    { id: 'sunglasses', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=375&fit=crop&auto=format', title: 'Polarized Aviator — 100% UV protection' },
    { id: 'mug', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=375&fit=crop&auto=format', title: 'Minimalist Ceramic Mug — 350ml' },
    { id: 'camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=375&fit=crop&auto=format', title: 'Vintage Rangefinder — Leather edition' },
    { id: 'speaker', url: 'https://images.unsplash.com/photo-1545454677-3538b9c7a5b8?w=500&h=375&fit=crop&auto=format', title: 'Portable Wooden Speaker — Deep bass' },
  ];

  // Removed unused 'index' parameter
  placeholderImages.forEach((img) => {
    featuredCards.push(
      <FeaturedProductCard
        key={`placeholder-${img.id}`}
        storeName="3R Elite Store"
        title={img.title}
        discountedPrice="AED 449"
        imageUrl={img.url}
        href="/listings"
        className="w-40 min-w-[10rem] max-w-xs"
      />
    );
  });

  // ---------- LARGE PLACEHOLDER DATASET FOR LATEST COLLECTIONS (24 items, all working Unsplash URLs) ----------
  const latestPlaceholders = [
    { id: 'ph1', title: 'Premium Wireless Headphones', price: 'AED 449', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph2', title: 'Minimalist Chronograph — Edition 2025', price: 'AED 449', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph3', title: 'AirFlow Running Shoes', price: 'AED 449', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph4', title: 'Vintage Leather Backpack', price: 'AED 449', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph5', title: 'Polarized Aviator Sunglasses', price: 'AED 449', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph6', title: 'Minimalist Ceramic Mug', price: 'AED 449', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph7', title: 'Vintage Rangefinder Camera', price: 'AED 449', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph8', title: 'Wooden Bluetooth Speaker', price: 'AED 449', img: 'https://images.unsplash.com/photo-1545454677-3538b9c7a5b8?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph9', title: 'Ultra-Slim Laptop Stand', price: 'AED 249', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph10', title: 'Mechanical Keyboard – Cherry MX', price: 'AED 599', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph11', title: 'Noise-Cancelling Earbuds', price: 'AED 399', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph12', title: 'Smart Watch – Fitness Edition', price: 'AED 799', img: 'https://images.unsplash.com/photo-1546868871-0f936fb4f870?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph13', title: 'Leather Messenger Bag', price: 'AED 649', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph14', title: 'Aviator Sunglasses – Gold', price: 'AED 529', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph15', title: 'Espresso Machine – Silver', price: 'AED 1,299', img: 'https://images.unsplash.com/photo-1522012189487-2f7b3b8f5b2a?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph16', title: 'Yoga Mat – Premium Grip', price: 'AED 189', img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph17', title: 'Desk Lamp – Adjustable', price: 'AED 279', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph18', title: 'Stainless Steel Water Bottle', price: 'AED 149', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph19', title: 'Leather Wallet – RFID Blocking', price: 'AED 329', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph20', title: 'Portable Power Bank – 20,000mAh', price: 'AED 219', img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph21', title: 'Fitness Tracker – Heart Rate', price: 'AED 349', img: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph22', title: 'Wireless Charging Pad', price: 'AED 189', img: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph23', title: 'Leather Journal – A5', price: 'AED 159', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&h=375&fit=crop&auto=format' },
    { id: 'ph24', title: 'Ceramic Vase – Minimalist', price: 'AED 229', img: 'https://images.unsplash.com/photo-1612196808214-b7e239f5c5e8?w=500&h=375&fit=crop&auto=format' },
  ];

  return (
    <div className="animate-fade-in">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[320px] xs:min-h-[360px] sm:min-h-[400px] flex items-center justify-center">
        <div className="relative max-w-7xl mx-auto w-full flex items-stretch mt-[-2.5rem] sm:mt-[-3.5rem]" style={{ minHeight: '340px' }}>
          {/* Left Table/EliteVault */}
          <div className="hidden lg:flex flex-col justify-center" style={{ width: '20%', marginLeft: '3%' }}>
            <HeroSideCards />
          </div>
          {/* Center Slideshow and Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="relative w-[108%] max-w-[112%] left-[-4%] aspect-[2.5/1] rounded-2xl overflow-hidden shadow-lg mb-3">
              <HeroSlideshow />
            </div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-elite-gold/20 backdrop-blur-sm text-elite-gold text-[10px] xs:text-xs font-semibold px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full mb-2 xs:mb-2 border border-elite-gold/30">
              <span className="w-1.5 h-1.5 bg-elite-gold rounded-full animate-pulse" />
              Refined. Rare. Remarkable.
            </div>
            {/* Removed The 3R Signature Series, description, and price as requested */}
            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 mt-2 xs:mt-3 px-2">
              {heroQuickLinks.map((cat) => (
                <Link
                  key={cat}
                  href={`/listings?q=${cat.toLowerCase()}`}
                  className="text-[10px] xs:text-xs text-white/70 hover:text-elite-gold bg-white/5 hover:bg-elite-gold/10 border border-white/10 hover:border-elite-gold/30 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-all interactive"
                >
                  {cat}
                </Link>
              ))}
              <Link
                href="/listings/create"
                className="text-[10px] xs:text-xs font-bold text-elite-navy bg-elite-gold hover:bg-elite-gold-light px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full transition-all interactive shadow-sm"
              >
                Discover More →
              </Link>
            </div>
          </div>
          {/* Right Table/MembershipEvents */}
          <div className="hidden lg:flex flex-col justify-center" style={{ width: '20%', marginRight: '3%' }}>
            {/* You can create a MembershipEvents component or use a listings table here */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-elite-gold/20 shadow-lg">
              <h3 className="text-xs font-bold text-elite-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                Offerings
              </h3>
              <ul className="space-y-1 text-xs text-elite-navy/80">
                {listings.slice(0, 8).map((item: { id: string; title: string }) => (
                  <li key={item.id} className="truncate border-b border-elite-gold/10 py-1 last:border-0">
                    <Link href={`/listings/${item.id}`} className="hover:text-elite-gold transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ENHANCED TRAFFIC STATS (formerly Elite Downloads) ═══ */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow max-w-7xl mx-auto my-8 px-2 py-4">
        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            gap: 0.5rem;
            width: fit-content;
            animation: marquee-left 30s linear infinite;
          }
          @keyframes circular-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-circular {
            animation: circular-rotate 20s linear infinite;
            transform-origin: center center;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0% { text-shadow: 0 0 0px rgba(251, 191, 36, 0.2); }
            50% { text-shadow: 0 0 8px rgba(251, 191, 36, 0.6); }
            100% { text-shadow: 0 0 0px rgba(251, 191, 36, 0.2); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }
          .card-pattern {
            background-image: radial-gradient(circle at 10px 10px, rgba(251,191,36,0.05) 2px, transparent 2px);
            background-size: 20px 20px;
          }
          .stat-card {
            min-width: 10rem;
            width: 10rem;
          }
          .stat-card svg {
            width: 40px;
            height: 40px;
          }
          .stat-main-value {
            font-size: 1.25rem;
            font-weight: 800;
            line-height: 1.2;
            color: #0f172a;
          }
          .stat-label {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #334155;
          }
          .bg-elite-gold { background-color: #fbbf24; }
          .text-elite-navy { color: #1e293b; }
          .border-elite-gold\\/30 { border-color: rgba(251, 191, 36, 0.3); }
          .hover\\:bg-elite-gold-dark:hover { background-color: #f59e0b; }
        `}</style>

        <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy mb-2 text-center">📈 Elite Traffic Stats</h2>

        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <button className="w-8 h-8 rounded-full bg-elite-gold text-elite-navy font-bold flex items-center justify-center shadow hover:bg-elite-gold-dark transition-all" aria-label="Previous">←</button>

            <div className="marquee-wrapper overflow-hidden">
              <div className="marquee-track">
                {/* CARD 1 – TOTAL VISITORS */}
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48" className="block">
                    <circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                    <circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none"
                      strokeDasharray="135.088" strokeDashoffset="13.5088" strokeLinecap="round" />
                    <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9"
                      fontFamily="JetBrains Mono, monospace" fontWeight="700">90%</text>
                  </svg>
                  <div className="mt-1 w-full text-center">
                    <div className="font-mono text-elite-navy text-xs font-semibold truncate">TOTAL VISITORS</div>
                    <div className="stat-main-value animate-pulse-glow">1.28M</div>
                    <div className="stat-label">all time</div>
                  </div>
                </div>

                {/* CARD 2 – UNIQUE VISITORS */}
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48" className="block">
                    <circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                    <circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none"
                      strokeDasharray="135.088" strokeDashoffset="27.0176" strokeLinecap="round" />
                    <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9"
                      fontFamily="JetBrains Mono, monospace" fontWeight="700">80%</text>
                  </svg>
                  <div className="mt-1 w-full text-center">
                    <div className="font-mono text-elite-navy text-xs font-semibold truncate">UNIQUE VISITORS</div>
                    <div className="stat-main-value animate-pulse-glow">468K</div>
                    <div className="stat-label">this month</div>
                  </div>
                </div>

                {/* CARD 3 – TODAY'S VISITORS */}
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48" className="block">
                    <circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                    <circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none"
                      strokeDasharray="135.088" strokeDashoffset="54.0352" strokeLinecap="round" />
                    <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9"
                      fontFamily="JetBrains Mono, monospace" fontWeight="700">60%</text>
                  </svg>
                  <div className="mt-1 w-full text-center">
                    <div className="font-mono text-elite-navy text-xs font-semibold truncate">
                      TODAY&#39;S VISITORS
                    </div>
                    <div className="stat-main-value animate-pulse-glow">8,432</div>
                    <div className="stat-label">so far today</div>
                  </div>
                </div>

                {/* DUPLICATES FOR SEAMLESS LOOP */}
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" /><circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none" strokeDasharray="135.088" strokeDashoffset="13.5088" /><text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9" fontWeight="700">90%</text></svg>
                  <div className="mt-1 w-full text-center"><div className="font-mono text-elite-navy text-xs font-semibold truncate">TOTAL VISITORS</div><div className="stat-main-value animate-pulse-glow">1.28M</div><div className="stat-label">all time</div></div>
                </div>
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" /><circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none" strokeDasharray="135.088" strokeDashoffset="27.0176" /><text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9" fontWeight="700">80%</text></svg>
                  <div className="mt-1 w-full text-center"><div className="font-mono text-elite-navy text-xs font-semibold truncate">UNIQUE VISITORS</div><div className="stat-main-value animate-pulse-glow">468K</div><div className="stat-label">this month</div></div>
                </div>
                <div className="stat-card bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-2 mx-1 animate-circular animate-float card-pattern">
                  <svg width="40" height="40" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.5" stroke="#e5e7eb" strokeWidth="5" fill="none" /><circle cx="24" cy="24" r="21.5" stroke="#0EA5E9" strokeWidth="5" fill="none" strokeDasharray="135.088" strokeDashoffset="54.0352" /><text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="#0EA5E9" fontWeight="700">60%</text></svg>
                  <div className="mt-1 w-full text-center">
                    <div className="font-mono text-elite-navy text-xs font-semibold truncate">
                      TODAY&apos;S VISITORS
                    </div>
                    <div className="stat-main-value animate-pulse-glow">8,432</div>
                    <div className="stat-label">so far today</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-8 h-8 rounded-full bg-elite-gold text-elite-navy font-bold flex items-center justify-center shadow hover:bg-elite-gold-dark transition-all" aria-label="Next">→</button>
          </div>

          <div className="flex gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-elite-gold animate-pulse-glow"></span>
            <span className="w-2 h-2 rounded-full bg-elite-navy/20"></span>
            <span className="w-2 h-2 rounded-full bg-elite-navy/20"></span>
            <span className="w-2 h-2 rounded-full bg-elite-navy/20"></span>
            <span className="w-2 h-2 rounded-full bg-elite-navy/20"></span>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STATS ═══ */}
      <TrustStats />

      {/* ═══ CATEGORY PILLS ═══ */}
      <CategoryPills />

      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-4 xs:py-6 space-y-6 xs:space-y-8 sm:space-y-10">

        {/* ═══ FEATURED CATEGORIES (Dubizzle-inspired large tiles) ═══ */}
        <FeaturedCategories />

        {/* ═══ FEATURED DEAL — AUTO‑ROTATING CAROUSEL (8 cards, rotates every 30s) ═══ */}
        <section className="animate-fade-up">
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy">Featured Deal</h2>
              <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Handpicked for you</p>
            </div>
          </div>
          <FeaturedDealCarousel initialCards={featuredCards} />
        </section>

        {/* ═══ ELITE DROPS (Premium countdown section) ═══ */}
        <FlashDeals listings={flashListings} />

        {/* ═══ BROWSE ALL CATEGORIES ═══ */}
        {categories.length > 0 && (
          <section className="animate-fade-up">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <div>
                <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy">Browse Categories</h2>
                <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Explore curated collections</p>
              </div>
              <Link href="/listings" className="text-xs xs:text-sm font-semibold text-elite-gold hover:text-elite-gold-dark flex items-center gap-1 interactive">
                All categories
                <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <CategoryNav categories={categories} />
          </section>
        )}

        {/* ═══ LATEST LISTINGS (Jiji-style trending feed) — with 24 beautiful placeholders (6 per row) ═══ */}
        <section>
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div>
              <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy">Latest Collections</h2>
              <p className="text-xs xs:text-sm text-gray-500 mt-0.5">Recently curated premium items</p>
            </div>
            <Link href="/listings" className="text-xs xs:text-sm font-semibold text-elite-gold hover:text-elite-gold-dark flex items-center gap-1 interactive">
              View all
              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {(latestCollections.length > 0 ? latestCollections : listings).length > 0 ? (
            <ListingGrid listings={latestCollections.length > 0 ? latestCollections : listings} />
          ) : (
            /* 24 placeholders – now 6 per row on large screens */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {latestPlaceholders.map((item) => (
                <Link key={item.id} href="/listings" className="block group">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={500}
                        height={375}
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">3R Elite Store</p>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-xs">AED 899</span>
                        <span className="text-[#0EA5E9] font-extrabold text-base">{item.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ═══ MARKET CTAs (Promo banners) ═══ */}
        <PromoBanners />

        {/* ═══ QUICK ACTIONS ═══ */}
        <QuickActions />

        {/* ═══ SAFETY BANNER ═══ */}
        <section className="bg-elite-cream border border-elite-gold/15 rounded-xl p-4 xs:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 xs:gap-4">
          <div className="shrink-0 w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-elite-gold/10 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-elite-navy text-sm xs:text-base mb-0.5">Community Safety Comes First</h3>
            <p className="text-gray-600 text-xs xs:text-sm">
              Always meet in a public place, never pay in advance without inspecting, and report suspicious listings.
              Together, we build a safer marketplace.
            </p>
          </div>
          <Link
            href="/safety"
            className="shrink-0 text-xs font-semibold text-elite-navy bg-elite-gold/10 hover:bg-elite-gold/20 border border-elite-gold/20 px-3 py-1.5 rounded-lg transition-colors interactive"
          >
            Safety Tips →
          </Link>
        </section>

        {/* ═══ GET VERIFIED CTA ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-r from-elite-navy to-elite-charcoal rounded-xl px-4 xs:px-6 py-6 xs:py-8 sm:px-10 text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-elite-gold/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-elite-gold/5 rounded-full blur-2xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="shrink-0 w-14 h-14 xs:w-16 xs:h-16 bg-elite-gold/15 rounded-2xl flex items-center justify-center text-3xl">
              ✅
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-lg xs:text-xl font-extrabold mb-1">Join the Inner Circle — Unlock Exclusive Access</h2>
              <p className="text-white/60 text-xs xs:text-sm max-w-md">
                Verified members get early access to limited drops,
                exclusive pricing, and a trust badge on every listing.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 xs:mt-3 text-xs text-white/60">
                <span className="flex items-center gap-1"><span className="text-elite-gold">✓</span> Priority access</span>
                <span className="flex items-center gap-1"><span className="text-elite-gold">✓</span> Verified badge</span>
                <span className="flex items-center gap-1"><span className="text-elite-gold">✓</span> Member pricing</span>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="shrink-0 bg-elite-gold text-elite-navy font-bold px-5 py-2.5 rounded-xl hover:bg-elite-gold-light transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm whitespace-nowrap"
            >
              Join Now
            </Link>
          </div>
        </section>

        {/* ═══ WHY 3R-ELITE ═══ */}
        <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 xs:p-6 sm:p-8">
          <div className="text-center mb-4 xs:mb-6">
            <h2 className="text-lg xs:text-xl font-extrabold text-elite-navy">Why Choose 3R-Elite?</h2>
            <p className="text-gray-500 text-xs xs:text-sm mt-1">The refined way to buy and sell</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 stagger-children">
            {features.map((f) => (
              <div key={f.title} className="text-center group">
                <div className={`w-10 h-10 xs:w-12 xs:h-12 mx-auto mb-2 xs:mb-3 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-xl xs:text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 border border-elite-gold/20`}>
                  <span className="text-elite-gold">{f.icon}</span>
                </div>
                <h3 className="font-bold text-elite-navy text-xs xs:text-sm mb-0.5 xs:mb-1">{f.title}</h3>
                <p className="text-[10px] xs:text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ POST AD CTA ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-r from-elite-navy to-elite-charcoal rounded-lg px-4 xs:px-6 py-6 xs:py-8 sm:px-10 text-white text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-24 xs:w-32 h-24 xs:h-32 bg-elite-gold/5 rounded-full blur-xl" />
            <div className="absolute bottom-0 right-1/4 w-32 xs:w-40 h-32 xs:h-40 bg-elite-gold/5 rounded-full blur-xl" />
          </div>
          <div className="relative">
            <p className="text-3xl xs:text-4xl mb-2 xs:mb-3">✦</p>
            <h2 className="text-xl xs:text-2xl font-extrabold mb-1.5 xs:mb-2">Ready to List?</h2>
            <p className="text-white/50 text-xs xs:text-sm mb-4 xs:mb-5 max-w-sm mx-auto">
              Showcase your premium items to discerning buyers across UAE and Uganda.
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 bg-elite-gold text-elite-navy font-bold px-6 py-3 rounded-lg hover:bg-elite-gold-light transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-elite-gold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create Listing
            </Link>
          </div>
        </section>

      </div>
      {/* Testimonials */}
      <TestimonialSection />
      {/* Review Portal CTA */}
      <ReviewPortalCTA />
    </div>
  );
}