'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  flag: string;
  logo: string;
  verified: boolean;
  listingsCount: number;
  rating: number;
}

const FEATURED_STORES: Store[] = [
  { id: '1', name: 'Dubai Luxury Hub', description: 'Premium watches, jewelry and designer goods from Dubai\'s finest boutiques.', category: 'Luxury', country: 'UAE', flag: '🇦🇪', logo: '💎', verified: true, listingsCount: 245, rating: 4.9 },
  { id: '2', name: 'Kampala Tech Store', description: 'The latest electronics, smartphones and accessories shipped across Uganda.', category: 'Electronics', country: 'Uganda', flag: '🇺🇬', logo: '📱', verified: true, listingsCount: 178, rating: 4.7 },
  { id: '3', name: 'Nairobi Motors', description: 'Quality used and new vehicles for sale. Best deals in Nairobi and beyond.', category: 'Vehicles', country: 'Kenya', flag: '🇰🇪', logo: '🚗', verified: true, listingsCount: 320, rating: 4.8 },
  { id: '4', name: 'Shanghai Electronics Co.', description: 'Wholesale and retail electronics direct from Chinese manufacturers.', category: 'Electronics', country: 'China', flag: '🇨🇳', logo: '⚡', verified: true, listingsCount: 1240, rating: 4.6 },
  { id: '5', name: 'Abu Dhabi Real Estate', description: 'Find your dream property in Abu Dhabi. Apartments, villas and commercial spaces.', category: 'Real Estate', country: 'UAE', flag: '🇦🇪', logo: '🏠', verified: true, listingsCount: 89, rating: 4.8 },
  { id: '6', name: 'Mombasa Spice Market', description: 'Authentic Kenyan spices, teas and artisan crafts delivered nationwide.', category: 'Home & Garden', country: 'Kenya', flag: '🇰🇪', logo: '🌿', verified: false, listingsCount: 56, rating: 4.5 },
  { id: '7', name: 'Beijing Fashion House', description: 'Trendy fashion and accessories from China\'s top designers and brands.', category: 'Fashion', country: 'China', flag: '🇨🇳', logo: '👗', verified: true, listingsCount: 789, rating: 4.7 },
  { id: '8', name: 'Entebbe Fresh Produce', description: 'Direct farm-to-table fresh produce and organic foods from Uganda\'s fertile lands.', category: 'Food & Grocery', country: 'Uganda', flag: '🇺🇬', logo: '🥬', verified: false, listingsCount: 34, rating: 4.4 },
];

const CATEGORIES = ['All', 'Luxury', 'Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Home & Garden', 'Food & Grocery'];
const COUNTRIES = ['All Countries', '🇦🇪 UAE', '🇺🇬 Uganda', '🇰🇪 Kenya', '🇨🇳 China'];

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');

  const filtered = FEATURED_STORES.filter((store) => {
    const matchSearch = store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || store.category === selectedCategory;
    const matchCountry = selectedCountry === 'All Countries' ||
      selectedCountry.includes(store.country);
    return matchSearch && matchCategory && matchCountry;
  });

  return (
    <div>
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 py-16 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff22 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ffffff15 0%, transparent 40%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-5">
            🏪 Shop by Store
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Discover Trusted Stores
          </h1>
          <p className="text-sky-100 text-lg max-w-2xl mx-auto mb-8">
            Browse curated stores from verified companies and individual sellers across UAE, Uganda, Kenya and China.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search stores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white text-gray-700"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advertise CTA */}
        <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">📢 Advertise Your Business</h2>
              <p className="text-white/80 text-sm">
                Create a company store portal and reach thousands of customers across 4 countries.
              </p>
            </div>
            <Link
              href="/listings/create"
              className="flex-shrink-0 px-6 py-3 rounded-xl bg-white text-purple-700 font-bold hover:bg-purple-50 transition-colors shadow-md whitespace-nowrap"
            >
              Open Your Store →
            </Link>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🏪</div>
            <p className="font-semibold">No stores found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((store) => (
              <div key={store.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                {/* Store header */}
                <div className="h-24 bg-gradient-to-br from-sky-400 to-blue-600 relative flex items-center justify-center">
                  <span className="text-5xl">{store.logo}</span>
                  <span className="absolute top-3 right-3 text-xl">{store.flag}</span>
                  {store.verified && (
                    <span className="absolute top-3 left-3 bg-white/90 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors text-sm leading-snug mb-1">
                    {store.name}
                  </h3>
                  <span className="inline-block bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium mb-2">
                    {store.category}
                  </span>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{store.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>📦 {store.listingsCount} listings</span>
                    <span>⭐ {store.rating}</span>
                  </div>

                  <Link
                    href={`/listings?q=${encodeURIComponent(store.name)}`}
                    className="block w-full text-center py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How Store Advertising Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '🖊️', title: 'Register Your Store', desc: 'Sign up as a seller and create your store profile with logo, description and contact info.' },
              { step: '2', icon: '📦', title: 'List Your Products', desc: 'Add your products with photos, prices and descriptions. Get verified for extra trust badges.' },
              { step: '3', icon: '🚀', title: 'Reach Customers', desc: 'Your products appear in searches and category pages, reaching buyers across 4 countries.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-2xl mx-auto mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/listings/create"
              className="inline-block px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors shadow-md"
            >
              Start Selling Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
