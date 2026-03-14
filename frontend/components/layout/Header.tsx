'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { CountrySelector } from '@/components/ui/CountrySelector';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter } from 'next/navigation';
import CategoryBar from '@/components/layout/CategoryBar';

export default function Header() {
  const { user, logout } = useAuth();
  const { country, currency } = useCountry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/listings?q=${encodeURIComponent(searchQ)}&country=${country}`);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Top utility bar ── */}
      <div className="hidden sm:block bg-elite-navy text-white/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <Link href="/listings/create" className="hover:text-[#0EA5E9] transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Sell on Our Site
            </Link>
            <Link href="/help" className="hover:text-[#0EA5E9] transition-colors">Help / FAQ</Link>
          </div>
          <div className="relative flex items-center gap-3">
            <div className="relative group">
              <button
                className="flex items-center gap-1 border border-white/20 rounded px-2 py-0.5 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors"
                aria-label="Language and currency"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span>English | {currency}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-50" role="menu">
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-xs transition-colors">English</button>
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-xs transition-colors">العربية</button>
                <hr className="my-1 border-gray-100" />
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-xs transition-colors">AED</button>
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-xs transition-colors">UGX</button>
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] text-xs transition-colors">USD</button>
              </div>
            </div>
            <CountrySelector />
          </div>
        </div>
      </div>

      {/* ── Main header row ── */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-elite-navy'
        }`}
      >
        <div className="w-full px-3 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger – mobile only */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={`md:hidden flex-shrink-0 p-1.5 rounded-lg transition-all interactive ${
                scrolled
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-700' : 'bg-white'} ${mobileNavOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-700' : 'bg-white'} ${mobileNavOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-700' : 'bg-white'} ${mobileNavOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                scrolled ? 'bg-elite-navy text-elite-gold' : 'bg-elite-gold/20 text-elite-gold'
              }`}>
                3R
              </div>
              <span className={`font-serif font-bold text-base sm:text-lg tracking-tight transition-colors whitespace-nowrap ${scrolled ? 'text-elite-navy' : 'text-white'}`}>
                <span className="font-sans font-extrabold">3R</span>{' '}
                <span className="italic">Elite</span>
              </span>
            </Link>

            {/* Search – visible from sm */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl">
              <div className={`flex flex-1 rounded-lg overflow-hidden ring-2 transition-all ${
                scrolled ? 'ring-gray-200 focus-within:ring-elite-gold/60' : 'ring-white/20 focus-within:ring-elite-gold/60'
              }`}>
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search products, brands and categories"
                  className={`flex-1 min-w-0 px-3 py-1.5 text-sm focus:outline-none transition-colors ${
                    scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/10 text-white placeholder:text-white/60'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-3 sm:px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors interactive ${
                    scrolled
                      ? 'bg-elite-gold text-white hover:bg-elite-gold-dark'
                      : 'bg-elite-gold/90 text-white hover:bg-elite-gold'
                  }`}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Spacer on mobile */}
            <div className="flex-1 sm:hidden" />

            {/* Right nav icons */}
            <nav className="flex items-center gap-0.5 sm:gap-1">
              {/* Sell button */}
              <Link
                href="/listings/create"
                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all interactive ${
                  scrolled
                    ? 'bg-elite-navy text-elite-gold hover:bg-elite-charcoal shadow-sm'
                    : 'bg-elite-gold text-elite-navy hover:bg-elite-gold-light'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Sell
              </Link>

              {/* Messages icon with badge */}
              <Link
                href="/messages"
                className={`relative p-2 rounded-lg transition-all interactive hidden sm:flex items-center justify-center ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                }`}
                aria-label="My Messages"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {user && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" aria-hidden="true" />
                )}
              </Link>

              {/* Help icon */}
              <Link
                href="/help"
                className={`relative p-2 rounded-lg transition-all interactive hidden sm:flex items-center justify-center ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Help"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Saved items icon with badge */}
              <Link
                href="/profile/favorites"
                className={`relative p-2 rounded-lg transition-all interactive hidden sm:flex items-center justify-center ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Saved Items"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart icon */}
              <Link
                href="/listings"
                className={`relative p-2 rounded-lg transition-all interactive hidden sm:flex items-center justify-center ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex items-center gap-1.5 text-sm rounded-lg p-1.5 transition-all interactive ${
                      scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                    }`}
                    aria-label="My Account"
                    aria-expanded={menuOpen}
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="hidden md:block font-medium">{user.name.split(' ')[0]}</span>
                    <svg className="w-3.5 h-3.5 hidden md:block opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-scale-in">
                        <div className="px-3 py-2 border-b border-gray-50 mb-1">
                          <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          My Account
                        </Link>
                        <Link href="/profile/listings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          My Listings
                        </Link>
                        <Link href="/profile/favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          Saved Items
                        </Link>
                        <Link href="/messages" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          My Messages
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors" onClick={() => setMenuOpen(false)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/auth/login"
                    className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-lg transition-colors interactive ${
                      scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:text-elite-gold'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className={`hidden sm:flex text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all interactive ${
                      scrolled
                        ? 'bg-elite-navy text-elite-gold hover:bg-elite-charcoal'
                        : 'bg-elite-gold/20 text-elite-gold hover:bg-elite-gold/30 border border-elite-gold/40'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={`sm:hidden border-t px-3 py-2 transition-colors ${
          scrolled ? 'border-gray-100 bg-white' : 'border-white/10 bg-elite-charcoal'
        }`}>
          <form onSubmit={handleSearch} className={`flex rounded-lg overflow-hidden ring-2 transition-colors ${
            scrolled ? 'ring-gray-200' : 'ring-white/20'
          }`}>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories"
              className={`flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none transition-colors ${
                scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/10 text-white placeholder:text-white/60'
              }`}
            />
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap interactive transition-colors ${
                scrolled ? 'bg-elite-gold text-white hover:bg-elite-gold-dark' : 'bg-elite-gold/90 text-white hover:bg-elite-gold'
              }`}
            >
              Search
            </button>
          </form>
        </div>

        {/* Category bar – only when not scrolled (gradient state) */}
        {!scrolled && (
          <div className="hidden sm:block">
            <CategoryBar />
          </div>
        )}
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in" onClick={closeMobileNav} aria-hidden="true" />
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl z-50 md:hidden border-t border-gray-100 max-h-[80vh] overflow-y-auto animate-slide-down">
            <div className="px-4 py-3">
              {/* Country selector in mobile menu */}
              <div className="pb-3 mb-3 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Select Country</p>
                <CountrySelector />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-3 py-1">Navigation</p>
                {[
                  { href: '/', label: '🏠 Home' },
                  { href: '/listings', label: '🔍 Browse Listings' },
                  { href: '/listings?q=motors', label: '🚗 Motors' },
                  { href: '/listings?q=property', label: '🏠 Property' },
                  { href: '/listings?q=jobs', label: '💼 Jobs' },
                  { href: '/listings?q=electronics', label: '💻 Electronics' },
                  { href: '/listings/create', label: '➕ Post Free Ad' },
                  { href: '/help', label: '❓ Help / FAQ' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors interactive"
                    onClick={closeMobileNav}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {user ? (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-3 py-1">Account</p>
                  <div className="space-y-0.5">
                    {[
                      { href: '/profile', label: '👤 My Account' },
                      { href: '/profile/listings', label: '📋 My Listings' },
                      { href: '/profile/favorites', label: '❤️ Saved Items' },
                      { href: '/messages', label: '💬 My Messages' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors interactive"
                        onClick={closeMobileNav}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors interactive" onClick={closeMobileNav}>
                        🛡️ Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); closeMobileNav(); router.push('/'); }}
                      className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors interactive"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <Link href="/auth/login" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 interactive transition-colors" onClick={closeMobileNav}>Login</Link>
                  <Link href="/auth/register" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 interactive transition-colors" onClick={closeMobileNav}>Register</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
