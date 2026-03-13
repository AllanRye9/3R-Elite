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
  const [searchQ, setSearchQ] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/listings?q=${encodeURIComponent(searchQ)}&country=${country}`);
  };

  return (
    <header className="bg-sky-500 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white shrink-0">
            3R-Elite
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories..."
              className="flex-1 border-0 rounded-l-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
            <button
              type="submit"
              className="bg-sky-700 text-white px-4 py-1.5 rounded-r-md text-sm font-medium hover:bg-sky-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Country Selector */}
          <CountrySelector />

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link
              href="/listings/create"
              className="bg-white text-sky-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-sky-50 transition-colors"
            >
              + Sell
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-white hover:text-sky-100"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                </button>
                {menuOpen && (
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
                )}
              </div>
            ) : (
              <div className="flex gap-1">
                <Link href="/auth/login" className="text-sm font-medium text-white hover:text-sky-100 px-2 py-1.5">Login</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-white text-sky-600 hover:bg-sky-50 rounded-md px-2 py-1.5">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
