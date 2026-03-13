'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { CountrySelector } from '@/components/ui/CountrySelector';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { country } = useCountry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/listings?q=${encodeURIComponent(searchQ)}&country=${country}`);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <header className="bg-sky-500 shadow-sm sticky top-0 z-50">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger – mobile only */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden flex-shrink-0 p-1.5 rounded text-white hover:bg-sky-600 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-white shrink-0">
            3R-Elite
          </Link>

          {/* Search – hidden on small mobile, visible from sm */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories..."
              className="flex-1 min-w-0 border-0 rounded-l-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
            <button
              type="submit"
              className="bg-sky-700 text-white px-3 sm:px-4 py-1.5 rounded-r-md text-sm font-medium hover:bg-sky-800 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Country Selector – desktop only (shown in mobile menu) */}
          <div className="hidden md:block">
            <CountrySelector />
          </div>

          {/* Nav – right side */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/listings/create"
              className="bg-white text-sky-600 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium hover:bg-sky-50 transition-colors whitespace-nowrap"
            >
              + Sell
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 text-sm text-white hover:text-sky-100"
                  aria-label="User menu"
                  aria-expanded={menuOpen}
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Profile</Link>
                      <Link href="/profile/listings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Listings</Link>
                      <Link href="/profile/favorites" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Favorites</Link>
                      <Link href="/messages" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Messages</Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 text-purple-600" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-1">
                <Link href="/auth/login" className="text-xs sm:text-sm font-medium text-white hover:text-sky-100 px-1.5 sm:px-2 py-1.5">Login</Link>
                <Link href="/auth/register" className="text-xs sm:text-sm font-medium bg-white text-sky-600 hover:bg-sky-50 rounded-md px-1.5 sm:px-2 py-1.5 whitespace-nowrap">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden border-t border-sky-400 px-3 py-2">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-0 border-0 rounded-l-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
          />
          <button
            type="submit"
            className="bg-sky-700 text-white px-4 py-1.5 rounded-r-md text-sm font-medium hover:bg-sky-800 transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={closeMobileNav} aria-hidden="true" />
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50 md:hidden border-t max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {/* Country selector in mobile menu */}
              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Country</p>
                <CountrySelector />
              </div>

              <Link href="/" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>Home</Link>
              <Link href="/listings" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>Browse Listings</Link>
              <Link href="/listings?country=UAE" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>🇦🇪 UAE Market</Link>
              <Link href="/listings?country=UGANDA" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>🇺🇬 Uganda Market</Link>

              {user ? (
                <>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/profile" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>My Profile</Link>
                  <Link href="/profile/listings" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>My Listings</Link>
                  <Link href="/profile/favorites" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>Favorites</Link>
                  <Link href="/messages" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>Messages</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-3 py-2.5 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50" onClick={closeMobileNav}>Admin Panel</Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { logout(); closeMobileNav(); router.push('/'); }}
                    className="block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/auth/login" className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600" onClick={closeMobileNav}>Login</Link>
                  <Link href="/auth/register" className="block px-3 py-2.5 rounded-md text-sm font-medium text-sky-600 hover:bg-sky-50" onClick={closeMobileNav}>Register</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
