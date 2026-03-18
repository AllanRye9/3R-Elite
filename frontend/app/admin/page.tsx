'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface RecentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface RecentListing {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Stats {
  users: number;
  listings: number;
  reports: number;
  activeListings: number;
  pendingListings: number;
  newUsersThisMonth: number;
  newListingsThisMonth: number;
  recentUsers: RecentUser[];
  recentListings: RecentListing[];
  listingsByStatus: Record<string, number>;
  usersByCountry: Record<string, number>;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  SOLD: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-700',
};

const statusBarColors: Record<string, string> = {
  ACTIVE: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  PENDING: 'bg-gradient-to-r from-amber-400 to-amber-500',
  SOLD: 'bg-gradient-to-r from-sky-400 to-sky-500',
  REJECTED: 'bg-gradient-to-r from-red-400 to-red-500',
  EXPIRED: 'bg-gray-400',
};

function StatCard({
  emoji,
  value,
  label,
  gradient,
  sub,
  href,
}: {
  emoji: string;
  value: string | number;
  label: string;
  gradient: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className={`${gradient} rounded-xl p-4 text-white shadow-sm h-full flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <span className="text-2xl">{emoji}</span>
        {href && (
          <svg className="w-4 h-4 opacity-60" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-2xl font-extrabold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-white/80 text-xs mt-0.5">{label}</div>
        {sub && <div className="text-white/60 text-[10px] mt-1">{sub}</div>}
      </div>
    </div>
  );
  if (href) return <Link href={href} className="block h-full hover:opacity-90 transition-opacity">{inner}</Link>;
  return inner;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [now] = useState(() => new Date());

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') {
      api.get('/admin/stats')
        .then(({ data }) => setStats(data))
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [user, loading, router]);

  if (loading || statsLoading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-live="polite">
        <span className="sr-only">Loading dashboard...</span>
        <div className="h-10 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxListingCount = Math.max(...Object.values(stats.listingsByStatus), 1);
  const maxCountryCount = Math.max(...Object.values(stats.usersByCountry), 1);
  const approvalRate = stats.listings > 0
    ? Math.round((stats.activeListings / stats.listings) * 100)
    : 0;

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 min-h-[calc(100vh-3.5rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium">System Live</span>
          </div>
          <Link
            href="/admin/settings"
            className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            ⚙️ <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          emoji="👥"
          value={stats.users}
          label="Total Users"
          gradient="bg-gradient-to-br from-sky-500 to-sky-600"
          sub={`+${stats.newUsersThisMonth} this month`}
          href="/admin/users"
        />
        <StatCard
          emoji="📋"
          value={stats.listings}
          label="Total Listings"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          sub={`+${stats.newListingsThisMonth} this month`}
          href="/admin/listings"
        />
        <StatCard
          emoji="✅"
          value={stats.activeListings}
          label="Active Listings"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          sub={`${approvalRate}% approval rate`}
          href="/admin/listings"
        />
        <StatCard
          emoji="⏳"
          value={stats.pendingListings}
          label="Pending Review"
          gradient="bg-gradient-to-br from-amber-400 to-amber-500"
          sub="Awaiting approval"
          href="/admin/submissions"
        />
        <StatCard
          emoji="🚩"
          value={stats.reports}
          label="Open Reports"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          sub="Needs attention"
          href="/admin/reports"
        />
        <StatCard
          emoji="🆕"
          value={stats.newUsersThisMonth}
          label="New Users/Month"
          gradient="bg-gradient-to-br from-[#0284c7] to-[#0369a1]"
        />
      </div>

      {/* Alert banner for pending items */}
      {stats.pendingListings > 0 && (
        <div role="alert" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {stats.pendingListings} listing{stats.pendingListings !== 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-amber-600">Review and approve or reject pending submissions</p>
            </div>
          </div>
          <Link
            href="/admin/submissions"
            className="shrink-0 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Recent Users & Listings */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#f0f9ff] to-white">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-sky-500 rounded-full" />
              Recent Users
            </h2>
            <Link href="/admin/users" className="text-sm text-sky-600 hover:text-sky-700 font-semibold">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <tr key={u.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[80px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentUsers.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#f5f3ff] to-white">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-purple-500 rounded-full" />
              Recent Listings
            </h2>
            <Link href="/admin/listings" className="text-sm text-sky-600 hover:text-sky-700 font-semibold">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentListings.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-[200px]">{l.title}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        statusColors[l.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentListings.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">No listings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Listings by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            Listings by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.listingsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                      {status}
                    </span>
                  </div>
                  <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {count} ({stats.listings > 0 ? Math.round((count / stats.listings) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${statusBarColors[status] || 'bg-gray-400'}`}
                    style={{ width: `${(count / maxListingCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.listingsByStatus).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data available</p>
            )}
          </div>
        </div>

        {/* Users by Country */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#C5A059] rounded-full" />
            Users by Country
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.usersByCountry).map(([country, count]) => (
              <div key={country}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-semibold">
                    {country === 'UAE' ? '🇦🇪 ' : country === 'UGANDA' ? '🇺🇬 ' : '🌍 '}{country}
                  </span>
                  <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {count} ({stats.users > 0 ? Math.round((count / stats.users) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#0284c7] to-[#0EA5E9] transition-all duration-700"
                    style={{ width: `${(count / maxCountryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.usersByCountry).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#C5A059] rounded-full" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: '/admin/analytics', icon: '📊', label: 'Analytics', color: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200' },
            { href: '/admin/submissions', icon: '📥', label: 'Submissions', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200' },
            { href: '/admin/categories', icon: '🏷️', label: 'Categories', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200' },
            { href: '/admin/users', icon: '👥', label: 'Manage Users', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200' },
            { href: '/admin/listings', icon: '📋', label: 'Manage Listings', color: 'bg-[#f0f9ff] text-[#0284c7] border-sky-100 hover:bg-sky-100 hover:border-sky-200' },
          ].map(({ href, icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl text-sm font-semibold border transition-colors ${color}`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
