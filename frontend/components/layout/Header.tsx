'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter, usePathname } from 'next/navigation';
import CategoryBar from '@/components/layout/CategoryBar';

export default function Header() {
  const { user, logout } = useAuth();
  const { country } = useCountry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when navigating
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQ)}&country=${country}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  const headerBg = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm'
    : 'bg-sky-600 shadow-md';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      {/* Top utility bar — desktop only */}
      <div className={`hidden sm:flex justify-between items-center max-w-7xl mx-auto px-4 h-8 text-xs transition-colors duration-300 ${scrolled ? 'text-sky-700 bg-sky-50 border-b border-sky-100' : 'text-white/80 bg-sky-700'}`}>
        <div className="flex items-center gap-4">
          <Link href="/listings/create" className="hover:text-elite-gold flex items-center gap-1 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Sell
          </Link>
          <Link href="/help" className="hover:text-elite-gold transition-colors">Help / FAQ</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-70">UAE &amp; Uganda Marketplace</span>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 sm:gap-4 h-16">

        {/* Mobile hamburger button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-sky-600 hover:bg-sky-50' : 'text-white hover:bg-white/20'}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMenuOpen((p) => !p)}
        >
          <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
            <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-sky-600' : 'bg-white'} ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-sky-600' : 'bg-white'} ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-sky-600' : 'bg-white'} ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </div>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group hover:scale-105 active:scale-95 transition-all">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-base transition-colors ${scrolled ? 'bg-sky-500 text-white' : 'bg-white/20 text-white'}`}>3R</div>
          <span className={`font-bold text-lg sm:text-xl tracking-tight whitespace-nowrap transition-colors ${scrolled ? 'text-sky-700' : 'text-white'}`}>
            <span className="font-extrabold">3R</span> <span className="font-serif italic">Elite</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-4">
          <div className={`flex flex-1 rounded-xl overflow-hidden ring-2 transition-all ${scrolled ? 'ring-sky-200 focus-within:ring-sky-400' : 'ring-white/30 focus-within:ring-white/70'}`}>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories…"
              className={`flex-1 min-w-0 px-4 py-2.5 text-sm focus:outline-none ${scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/15 text-white placeholder:text-white/70'}`}
            />
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${scrolled ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-white/20 text-white hover:bg-white/35'}`}
            >
              Search
            </button>
          </div>
        </form>

        {/* Desktop nav actions */}
        <nav className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Sell button */}
          <Link
            href="/listings/create"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scrolled ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-white text-sky-600 hover:bg-sky-50'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Sell
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
            aria-label="Messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {user && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" aria-hidden="true" />}
          </Link>

          {/* Saved */}
          <Link
            href="/profile/favorites"
            className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
            aria-label="Saved Items"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          {/* User area — desktop */}
          {user ? (
            <div ref={dropdownRef} className="relative hidden md:flex">
              <button
                onClick={() => setUserDropdownOpen((p) => !p)}
                className={`flex items-center gap-1.5 text-sm rounded-xl px-2 py-1.5 transition-colors ${scrolled ? 'text-gray-700 hover:bg-sky-50' : 'text-white hover:bg-white/20'}`}
                aria-label="My Account"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <UserAvatar user={user} size="sm" />
                <span className="font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <svg
                  className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Desktop user dropdown */}
              {userDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sky-100 py-1.5 z-50 animate-scale-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {[
                    { href: '/profile', label: 'My Profile', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { href: '/profile/listings', label: 'My Listings', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { href: '/profile/favorites', label: 'Saved Items', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                    { href: '/messages', label: 'Messages', path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                      <svg className="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.path} />
                      </svg>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/auth/login" className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:text-white'}`}>
                Login
              </Link>
              <Link href="/auth/register" className={`hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${scrolled ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-white text-sky-600 hover:bg-sky-50'}`}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile: show avatar link if logged in */}
          {user && (
            <Link href="/profile" className="md:hidden ml-1">
              <UserAvatar user={user} size="sm" />
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile search bar */}
      <div className={`sm:hidden border-t px-3 py-2 transition-colors duration-300 ${scrolled ? 'border-sky-100 bg-white' : 'border-white/10 bg-sky-700'}`}>
        <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search products, brands…"
            className={`flex-1 min-w-0 px-3 py-2.5 text-sm focus:outline-none ${scrolled ? 'bg-sky-50 text-gray-900 placeholder:text-gray-400' : 'bg-white/15 text-white placeholder:text-white/60'}`}
          />
          <button
            type="submit"
            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${scrolled ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-white/25 text-white hover:bg-white/35'}`}
          >
            Search
          </button>
        </form>
      </div>

      {/* Category bar — desktop only when not scrolled */}
      {!scrolled && <div className="hidden sm:block"><CategoryBar /></div>}

      {/* ── MOBILE MENU PANEL ─────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-nav-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-sky-100 shadow-2xl z-50 animate-slide-down max-h-[80vh] overflow-y-auto"
        >
          {/* User section */}
          {user ? (
            <div className="flex items-center gap-3 px-4 py-4 bg-sky-50 border-b border-sky-100">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 px-4 py-3 bg-sky-50 border-b border-sky-100">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl border-2 border-sky-300 text-sky-600 font-semibold text-sm hover:bg-sky-50 transition-colors">
                Login
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors">
                Register
              </Link>
            </div>
          )}

          {/* Navigation links */}
          <nav className="py-1">
            {[
              { href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { href: '/listings', label: 'Browse Listings', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
              { href: '/listings/create', label: 'Sell Now', icon: 'M12 4v16m8-8H4', badge: 'Free' },
              { href: '/messages', label: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { href: user ? '/profile' : '/auth/login', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { href: '/profile/favorites', label: 'Saved Items', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { href: '/help', label: 'Help / FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
                )}
              </Link>
            ))}

            {user && (
              <>
                <div className="mx-4 border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            )}
          </nav>

          {/* Category quick-links */}
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Browse by Category</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Motors', emoji: '🚗' },
                { label: 'Property', emoji: '🏠' },
                { label: 'Electronics', emoji: '💻' },
                { label: 'Fashion', emoji: '👗' },
                { label: 'Furniture', emoji: '🛋️' },
                { label: 'Jobs', emoji: '💼' },
                { label: 'Services', emoji: '🔧' },
              ].map(({ label, emoji }) => (
                <Link
                  key={label}
                  href={`/listings?q=${encodeURIComponent(label.toLowerCase())}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-xs px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full font-medium hover:bg-sky-100 transition-colors"
                >
                  {emoji} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}