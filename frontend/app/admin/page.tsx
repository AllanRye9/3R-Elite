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

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') {
      api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !stats) return <div className="p-8 text-center">Loading...</div>;

  const maxListingCount = Math.max(...Object.values(stats.listingsByStatus), 1);
  const maxCountryCount = Math.max(...Object.values(stats.usersByCountry), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your platform activity</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-2xl font-extrabold">{stats.users.toLocaleString()}</div>
          <div className="text-sky-100 text-xs mt-0.5">Total Users</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-2xl font-extrabold">{stats.listings.toLocaleString()}</div>
          <div className="text-purple-100 text-xs mt-0.5">Total Listings</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-extrabold">{stats.activeListings.toLocaleString()}</div>
          <div className="text-emerald-100 text-xs mt-0.5">Active Listings</div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-2xl font-extrabold">{stats.pendingListings.toLocaleString()}</div>
          <div className="text-amber-100 text-xs mt-0.5">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">🚩</div>
          <div className="text-2xl font-extrabold">{stats.reports.toLocaleString()}</div>
          <div className="text-red-100 text-xs mt-0.5">Reports</div>
        </div>
        <div className="bg-gradient-to-br from-[#0284c7] to-[#0369a1] rounded-xl p-4 text-white shadow-sm">
          <div className="text-2xl mb-1">🆕</div>
          <div className="text-2xl font-extrabold">{stats.newUsersThisMonth.toLocaleString()}</div>
          <div className="text-sky-100 text-xs mt-0.5">New Users / Month</div>
        </div>
      </div>

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
                  <th className="px-3 sm:px-5 py-3 font-semibold">Name</th>
                  <th className="px-3 sm:px-5 py-3 font-semibold">Email</th>
                  <th className="px-3 sm:px-5 py-3 font-semibold">Role</th>
                  <th className="px-3 sm:px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <tr key={u.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="px-3 sm:px-5 py-3 font-semibold text-gray-900">{u.name}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentUsers.length === 0 && (
                  <tr><td colSpan={4} className="px-3 sm:px-5 py-6 text-center text-gray-400 text-sm">No users yet</td></tr>
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
                  <th className="px-3 sm:px-5 py-3 font-semibold">Title</th>
                  <th className="px-3 sm:px-5 py-3 font-semibold">Status</th>
                  <th className="px-3 sm:px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentListings.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-3 sm:px-5 py-3 font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{l.title}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        statusColors[l.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-gray-400 text-xs">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentListings.length === 0 && (
                  <tr><td colSpan={3} className="px-3 sm:px-5 py-6 text-center text-gray-400 text-sm">No listings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
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
                  <span className="text-gray-700 font-semibold">{status}</span>
                  <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      status === 'ACTIVE' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      status === 'PENDING' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      status === 'SOLD' ? 'bg-gradient-to-r from-sky-400 to-sky-500' :
                      status === 'REJECTED' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      'bg-gray-400'
                    }`}
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
                    {country === 'UAE' ? '🇦🇪 ' : country === 'UGANDA' ? '🇺🇬 ' : ''}{country}
                  </span>
                  <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-[#0284c7] to-[#0EA5E9] transition-all duration-500"
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
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 text-sky-700 rounded-xl text-sm font-semibold hover:bg-sky-100 border border-sky-100 hover:border-sky-200 transition-colors"
          >
            📊 View Analytics
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 border border-purple-100 hover:border-purple-200 transition-colors"
          >
            🏷️ Manage Categories
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 border border-amber-100 hover:border-amber-200 transition-colors"
          >
            ⚙️ Site Settings
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 transition-colors"
          >
            👥 Manage Users
          </Link>
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f0f9ff] text-[#0284c7] rounded-xl text-sm font-semibold hover:bg-sky-100 border border-sky-100 hover:border-sky-200 transition-colors"
          >
            📋 Manage Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
