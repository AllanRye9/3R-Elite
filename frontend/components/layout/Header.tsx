'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { useCart } from '@/context/CartContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter, usePathname } from 'next/navigation';
import CategoryBar from '@/components/layout/CategoryBar';
import { CountrySelector } from '@/components/ui/CountrySelector';

const mobileNavItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/listings', label: 'Browse Listings', icon: '🔍' },
  { href: '/stores', label: 'Shop by Store', icon: '🏪' },
  { href: '/listings/create', label: 'Sell Something', icon: '➕' },
  { href: '/cart', label: 'My Cart', icon: '🛒' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/profile/favorites', label: 'Saved Items', icon: '❤️' },
  { href: '/help', label: 'Help / FAQ', icon: '❓' },
  { href: '/terms', label: 'Terms & Conditions', icon: '📋' },
];

// 68px = drawer header only (guest); 140px = drawer header + user-info strip (logged in)
const DRAWER_HEADER_H = '68px';
const DRAWER_HEADER_WITH_USER_H = '140px';

const MOBILE_COUNTRY_OPTIONS = [
  { value: 'UAE' as const, flag: '🇦🇪', label: 'UAE', sub: 'United Arab Emirates' },
  { value: 'UGANDA' as const, flag: '🇺🇬', label: 'Uganda', sub: 'East Africa' },
  { value: 'KENYA' as const, flag: '🇰🇪', label: 'Kenya', sub: 'East Africa' },
  { value: 'CHINA' as const, flag: '🇨🇳', label: 'China', sub: 'Asia Pacific' },
];

function MobileCountryPicker({ onClose }: { onClose: () => void }) {
  const { country, setCountry } = useCountry();
  return (
    <div className="grid grid-cols-2 gap-2">
      {MOBILE_COUNTRY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => { setCountry(opt.value); onClose(); }}
          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-semibold ${
            opt.value === country
              ? 'border-sky-500 bg-sky-50 text-sky-700'
              : 'border-gray-200 text-gray-600 hover:border-sky-200 hover:bg-sky-50/60'
          }`}
        >
          <span className="text-3xl leading-none" aria-hidden="true">{opt.flag}</span>
          <span>{opt.label}</span>
          <span className="text-[10px] font-normal text-gray-400">{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { country } = useCountry();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [browseDropOpen, setBrowseDropOpen] = useState(false);
  const [sellDropOpen, setSellDropOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const profileDropRef = useRef<HTMLDivElement>(null);
  const browseDropRef = useRef<HTMLDivElement>(null);
  const sellDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileDropOpen(false);
    setBrowseDropOpen(false);
    setSellDropOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropRef.current && !profileDropRef.current.contains(e.target as Node)) {
        setProfileDropOpen(false);
      }
      if (browseDropRef.current && !browseDropRef.current.contains(e.target as Node)) {
        setBrowseDropOpen(false);
      }
      if (sellDropRef.current && !sellDropRef.current.contains(e.target as Node)) {
        setSellDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/listings?q=${encodeURIComponent(searchQ)}&country=${country}`);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 shadow-sm transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' : 'bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700'}`}>
        {/* Top utility bar — desktop only */}
        <div className="hidden sm:flex justify-between items-center max-w-7xl mx-auto px-4 h-10 text-xs text-white/80 bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 relative z-10">
          <div className="flex items-center gap-4">
            <Link href="/listings/create" className="hover:text-white flex items-center gap-1 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Sell
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">Help / FAQ</Link>
          </div>
          {/* Country selector — allows switching between UAE and Uganda */}
          <CountrySelector />
        </div>

        {/* Main header row */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 sm:gap-4 h-16">
          {/* Hamburger toggle — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {/* 3 bars: gap-[5px] between them. When open, top/bottom rotate ±45° and
                translate by 6px (gap + bar thickness ≈ 5px+0.5px) to form an X. */}
            <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
              <span className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </div>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group hover:scale-105 active:scale-95 transition-all">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-base ${scrolled ? 'bg-elite-navy text-elite-gold' : 'bg-white/20 text-white'}`}>3R</div>
            <span className={`font-bold text-lg sm:text-xl tracking-tight whitespace-nowrap ${scrolled ? 'text-elite-navy' : 'text-white'}`}>
              <span className="font-extrabold">3R</span> <span className="italic font-serif">Elite</span>
            </span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg mx-4">
            <div className={`flex flex-1 rounded-lg overflow-hidden ring-2 transition-all ${scrolled ? 'ring-gray-200 focus-within:ring-brand-400' : 'ring-white/20 focus-within:ring-white/60'}`}>
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products, brands and categories"
                className={`flex-1 min-w-0 px-4 py-2 text-base focus:outline-none ${scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/10 text-white placeholder:text-white/60'}`}
              />
              <button
                type="submit"
                className={`px-4 py-2 text-base font-semibold transition-colors ${scrolled ? 'bg-elite-gold text-white hover:bg-elite-gold-dark' : 'bg-elite-gold/90 text-white hover:bg-elite-gold'}`}
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Home */}
            <Link
              href="/"
              className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 22V12h6v10" />
              </svg>
            </Link>

            {/* Browse dropdown */}
            <div ref={browseDropRef} className="relative hidden sm:block">
              <button
                onClick={() => { setBrowseDropOpen((p) => !p); setSellDropOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' : 'text-white hover:bg-white/20'}`}
                aria-expanded={browseDropOpen}
              >
                Browse
                <svg className={`w-3 h-3 transition-transform duration-200 ${browseDropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {browseDropOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
                  <div className="py-1.5">
                    {[
                      { href: '/listings', icon: '🔍', label: 'All Listings' },
                      { href: '/stores', icon: '🏪', label: 'Shop by Store' },
                      { href: '/listings?sort=views', icon: '🔥', label: 'Most Popular' },
                      { href: '/listings?sort=price_asc', icon: '💰', label: 'Best Deals' },
                      { href: '/listings?country=UAE', icon: '🇦🇪', label: 'UAE Listings' },
                      { href: '/listings?country=UGANDA', icon: '🇺🇬', label: 'Uganda Listings' },
                      { href: '/listings?country=KENYA', icon: '🇰🇪', label: 'Kenya Listings' },
                      { href: '/listings?country=CHINA', icon: '🇨🇳', label: 'China Listings' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setBrowseDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sell dropdown */}
            <div ref={sellDropRef} className="relative hidden sm:block">
              <button
                onClick={() => { setSellDropOpen((p) => !p); setBrowseDropOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scrolled ? 'bg-elite-navy text-elite-gold hover:bg-elite-charcoal' : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'}`}
                aria-expanded={sellDropOpen}
              >
                Sell
                <svg className={`w-3 h-3 transition-transform duration-200 ${sellDropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sellDropOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
                  <div className="py-1.5">
                    {[
                      { href: '/listings/create', icon: '➕', label: 'Post a Listing' },
                      { href: '/stores', icon: '🏪', label: 'Open Your Store' },
                      { href: '/advertising', icon: '📣', label: 'Advertise' },
                      { href: '/profile/listings', icon: '📦', label: 'My Listings' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSellDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <Link
              href="/messages"
              className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="My Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {user && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" aria-hidden="true" />}
            </Link>

            {/* Saved items */}
            <Link
              href="/profile/favorites"
              className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Saved Items"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                  aria-label={`${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Help */}
            <Link
              href="/help"
              className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Help"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>

            {/* User account — desktop with dropdown */}
            {user ? (
              <div ref={profileDropRef} className="relative hidden sm:block">
                <button
                  onClick={() => setProfileDropOpen((p) => !p)}
                  className={`flex items-center gap-1.5 text-sm rounded-lg p-1.5 transition-all ${scrolled ? 'text-gray-700 hover:bg-gray-100 ring-1 ring-gray-200' : 'text-white hover:bg-white/20'}`}
                  aria-label="My Account"
                  aria-expanded={profileDropOpen}
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                    {user.role === 'ADMIN' && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${scrolled ? 'bg-purple-100 text-purple-700' : 'bg-purple-400/30 text-purple-100'}`}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 hidden md:block opacity-60 transition-transform duration-200 ${profileDropOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile dropdown */}
                {profileDropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
                    {/* User identity strip */}
                    <div className="px-4 py-3 bg-gradient-to-r from-elite-navy to-sky-600">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-white/70 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setProfileDropOpen(false)}>
                        <svg className="w-4 h-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        My Profile
                      </Link>
                      <Link href="/profile/listings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setProfileDropOpen(false)}>
                        <svg className="w-4 h-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        My Listings
                      </Link>
                      <Link href="/profile/favorites" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setProfileDropOpen(false)}>
                        <svg className="w-4 h-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Saved Items
                      </Link>
                      <Link href="/messages" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setProfileDropOpen(false)}>
                        <svg className="w-4 h-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        Messages
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors" onClick={() => setProfileDropOpen(false)}>
                          <svg className="w-4 h-4 shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    {/* Prominent Sign Out */}
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => { logout(); setProfileDropOpen(false); }}
                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-colors border border-red-100"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/auth/login" className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' : 'text-white/90 hover:text-white hover:bg-white/10 border border-white/30'}`}>Login</Link>
                <Link href="/auth/register" className={`hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${scrolled ? 'bg-elite-gold text-white hover:bg-elite-gold-light' : 'bg-white text-elite-navy hover:bg-sky-50 border border-white/70'}`}>Register</Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile search bar */}
        <div className={`sm:hidden border-t px-3 py-2 ${scrolled ? 'border-gray-100 bg-white' : 'border-white/10 bg-blue-800/50 backdrop-blur-sm'}`}>
          <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden ring-2 ring-white/20">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories"
              className={`flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none ${scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/10 text-white placeholder:text-white/60'}`}
            />
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-semibold ${scrolled ? 'bg-elite-gold text-white hover:bg-elite-gold-dark' : 'bg-elite-gold/90 text-white hover:bg-elite-gold'}`}
            >
              Search
            </button>
          </form>
        </div>

        {/* CategoryBar — shared across all pages */}
        <div className="hidden sm:block"><CategoryBar /></div>
      </header>

      {/* Mobile menu backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Mobile side drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 md:hidden bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!menuOpen}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 text-white">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-sm bg-elite-gold/20 text-elite-gold">3R</div>
            <span className="font-extrabold text-lg">3R <span className="italic font-serif">Elite</span></span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info strip (logged in) */}
        {user && (
          <div className="px-4 py-3 bg-gradient-to-r from-elite-navy to-sky-600 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/70 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                aria-label="Sign out"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="overflow-y-auto" style={{ height: user ? `calc(100% - ${DRAWER_HEADER_WITH_USER_H})` : `calc(100% - ${DRAWER_HEADER_H})` }}>
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors font-medium text-sm border-b border-gray-50"
            >
              <span className="text-xl w-6 text-center" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Admin link */}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-purple-700 hover:bg-purple-50 transition-colors font-medium text-sm border-b border-gray-50"
            >
              <span className="text-xl w-6 text-center" aria-hidden="true">⚙️</span>
              Admin Panel
            </Link>
          )}

          {/* Login / Register (guest) */}
          {!user && (
            <div className="px-4 py-4 mt-2 border-t border-gray-100 space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-elite-navy text-white font-semibold text-sm hover:bg-elite-charcoal transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-elite-navy text-elite-navy font-semibold text-sm hover:bg-brand-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Country selector — mobile */}
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Marketplace Region</p>
            <MobileCountryPicker onClose={() => setMenuOpen(false)} />
          </div>
        </nav>
      </div>
    </>
  );
}
