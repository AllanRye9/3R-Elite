'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
// import { CountrySelector } from '@/components/ui/CountrySelector';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter } from 'next/navigation';
import CategoryBar from '@/components/layout/CategoryBar';

export default function Header() {
  const { user } = useAuth();
  // const { country, currency } = useCountry();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // const closeMobileNav = () => setMobileNavOpen(false); // Removed unused

  return (
    <header className={`sticky top-0 z-50 shadow-sm transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' : 'bg-elite-navy'}`}>
      {/* Top utility bar - hidden on mobile */}
      <div className="hidden sm:flex justify-between items-center max-w-7xl mx-auto px-4 h-8 text-xs text-white/80 bg-elite-navy">
        <div className="flex items-center gap-4">
          <Link href="/listings/create" className="hover:text-[#0EA5E9] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Sell
          </Link>
          <Link href="/help" className="hover:text-[#0EA5E9]">Help / FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white/90 border border-elite-gold/40 rounded-xl px-3 py-2 shadow-md">
            <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-semibold text-elite-navy hover:border-elite-gold transition-colors">
              <option value="UAE" selected>🇦🇪 UAE</option>
              <option value="UGANDA">🇺🇬 Uganda</option>
            </select>
            <span className="border-l border-elite-gold/30 pl-3 text-elite-navy font-bold tracking-wide">AED</span>
          </div>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 sm:gap-4 h-16">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/20"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
            <span className={`block h-0.5 rounded-full bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}></span>
            <span className={`block h-0.5 rounded-full bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 rounded-full bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
          </div>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group hover:scale-105 active:scale-95 transition-all">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-base ${scrolled ? 'bg-elite-navy text-elite-gold' : 'bg-elite-gold/20 text-elite-gold'}`}>3R</div>
          <span className={`font-serif font-bold text-lg sm:text-xl tracking-tight whitespace-nowrap ${scrolled ? 'text-elite-navy' : 'text-white'}`}>
            <span className="font-sans font-extrabold">3R</span> <span className="italic">Elite</span>
          </span>
        </Link>

        {/* Search bar (hidden on xs) */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg mx-4">
          <div className={`flex flex-1 rounded-lg overflow-hidden ring-2 ${scrolled ? 'ring-gray-200 focus-within:ring-elite-gold/60' : 'ring-white/20 focus-within:ring-elite-gold/60'}`}> 
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands and categories"
              className={`flex-1 min-w-0 px-4 py-2 text-base focus:outline-none ${scrolled ? 'bg-white text-gray-900 placeholder:text-gray-400' : 'bg-white/10 text-white placeholder:text-white/60'}`}
            />
            <button
              type="submit"
              className={`px-4 py-2 text-base font-semibold ${scrolled ? 'bg-elite-gold text-white hover:bg-elite-gold-dark' : 'bg-elite-gold/90 text-white hover:bg-elite-gold'}`}
            >
              Search
            </button>
          </div>
        </form>

        {/* Right nav icons */}
        <nav className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Link href="/listings/create" className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${scrolled ? 'bg-elite-navy text-elite-gold hover:bg-elite-charcoal' : 'bg-elite-gold text-elite-navy hover:bg-elite-gold-light'}`}>Sell</Link>
          <Link href="/messages" className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`} aria-label="My Messages">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {user && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" aria-hidden="true" />}
          </Link>
          <Link href="/profile/favorites" className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`} aria-label="Saved Items">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </Link>
          <Link href="/help" className={`relative p-2 rounded-lg hidden sm:flex items-center justify-center ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`} aria-label="Help">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </Link>
          {user ? (
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 text-sm rounded-lg p-1.5 ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
              aria-label="My Account"
            >
              <UserAvatar user={user} size="sm" />
              <span className="hidden md:block font-medium">{user.name.split(' ')[0]}</span>
              <svg className="w-3.5 h-3.5 hidden md:block opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/auth/login" className={`text-xs font-medium px-2 py-1.5 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:text-elite-gold'}`}>Login</Link>
              <Link href="/auth/register" className={`hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-lg ${scrolled ? 'bg-elite-navy text-elite-gold hover:bg-elite-charcoal' : 'bg-elite-gold/20 text-elite-gold hover:bg-elite-gold/30 border border-elite-gold/40'}`}>Register</Link>
            </div>
          )}
        </nav>
      </div>
      {/* Mobile search bar */}
      <div className={`sm:hidden border-t px-3 py-2 ${scrolled ? 'border-gray-100 bg-white' : 'border-white/10 bg-elite-charcoal'}`}>
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
      {/* Category bar (desktop, only when not scrolled) */}
      {!scrolled && <div className="hidden sm:block"><CategoryBar /></div>}
      <div className="flex gap-4">
        <div className="bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm p-4 w-40 min-w-[8rem] text-center">
          <h3 className="text-xs font-bold text-elite-navy mb-1">Today's Visitors</h3>
          <p className="text-xl font-mono text-elite-gold">1,234</p>
        </div>
        <div className="bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm p-4 w-40 min-w-[8rem] text-center">
          <h3 className="text-xs font-bold text-elite-navy mb-1">Total Visitors</h3>
          <p className="text-xl font-mono text-elite-gold">123,456</p>
        </div>
        <div className="bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm p-4 w-40 min-w-[8rem] text-center">
          <h3 className="text-xs font-bold text-elite-navy mb-1">Served Customers</h3>
          <p className="text-xl font-mono text-elite-gold">2,345</p>
        </div>
        <div className="bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm p-4 w-40 min-w-[8rem] text-center">
          <h3 className="text-xs font-bold text-elite-navy mb-1">Avg. Rating</h3>
          <div className="flex justify-center items-center gap-1">
            <span className="text-xl font-mono text-elite-gold">4.8</span>
            <svg className="w-4 h-4 text-elite-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
        </div>
      </div>
    </header>
  );
}
