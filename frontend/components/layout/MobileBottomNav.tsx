'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/listings',
    label: 'Browse',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: '/listings/create',
    label: 'Sell',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    isSell: true,
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      <div className="bg-white border-t border-gray-100 shadow-[0_-4px_24px_0_rgb(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '/';
            const href = item.label === 'Profile' && !user ? '/auth/login' : item.href;

            if (item.isSell) {
              return (
                <Link
                  key={item.href}
                  href={href}
                  className="flex flex-col items-center justify-center py-1.5 flex-1 interactive group"
                  aria-label={item.label}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-elite-gold to-elite-gold-dark flex items-center justify-center text-white shadow-lg -mt-5 group-active:scale-95 transition-transform">
                    {item.icon(false)}
                  </div>
                  <span className="text-[10px] font-medium text-elite-gold mt-0.5">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex flex-col items-center justify-center py-2 flex-1 gap-0.5 interactive transition-colors ${
                  isActive ? 'text-elite-gold' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'bg-elite-gold/10' : ''}`}>
                  {item.icon(isActive)}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
