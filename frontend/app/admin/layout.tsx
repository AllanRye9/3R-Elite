'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📥' },
  { href: '/admin/images', label: 'Image Moderation', icon: '🖼️' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/listings', label: 'Listings', icon: '📋' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/reports', label: 'Reports', icon: '🚩' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  // Mobile: sidebar drawer open/closed
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop: sidebar collapsed (icon-only) or expanded
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auth pages render without sidebar
  if (pathname && pathname.startsWith('/admin/auth')) {
    return <>{children}</>;
  }

  const sidebarWidth = collapsed ? 'md:w-16' : 'md:w-64';
  const mainMargin = collapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="flex min-h-full font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white
          transition-all duration-300 ease-in-out
          w-64 ${sidebarWidth}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">🛡️</span>
            {!collapsed && (
              <span className="text-base font-semibold tracking-tight truncate">
                Admin Panel
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Desktop collapse/expand toggle */}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                )}
              </svg>
            </button>
            {/* Mobile close (X) button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname ? isNavActive(pathname, href) : false;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-colors duration-150
                      ${collapsed ? 'justify-center px-0' : ''}
                      ${
                        active
                          ? 'bg-sky-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg leading-none shrink-0">{icon}</span>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin user info + Back to Site */}
        <div className="border-t border-gray-800 px-2 py-3 space-y-1 shrink-0">
          {/* Admin user chip */}
          {user && !collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60">
              <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <span className="inline-block text-[10px] font-bold bg-sky-600/30 text-sky-300 px-1.5 py-0.5 rounded-full leading-none mt-0.5">
                  ADMIN
                </span>
              </div>
            </div>
          )}
          {user && collapsed && (
            <div className="flex justify-center py-1">
              <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <Link
            href="/"
            title={collapsed ? 'Back to Site' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors duration-150 hover:bg-gray-800 hover:text-white ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!collapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${mainMargin}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <span className="md:hidden ml-2 text-sm font-semibold text-gray-800">Admin Panel</span>

          {/* Desktop breadcrumb/title placeholder */}
          <div className="hidden md:block" />

          {/* Right side: admin badge + site link */}
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
              </div>
            )}
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              ← View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
