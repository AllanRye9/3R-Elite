'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <AdminStatsCard title="Total Users" value={stats.users} icon="👥" color="bg-blue-500" />
        <AdminStatsCard title="Total Listings" value={stats.listings} icon="📋" color="bg-purple-500" />
        <AdminStatsCard title="Active Listings" value={stats.activeListings} icon="✅" color="bg-green-500" />
        <AdminStatsCard title="Pending" value={stats.pendingListings} icon="⏳" color="bg-yellow-500" />
        <AdminStatsCard title="Reports" value={stats.reports} icon="🚩" color="bg-red-500" />
        <AdminStatsCard title="New Users This Month" value={stats.newUsersThisMonth} icon="🆕" color="bg-sky-500" />
      </div>

      {/* Recent Users & Listings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50">
                  <th className="px-3 sm:px-6 py-3 font-medium">Name</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Email</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Role</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-3 sm:px-6 py-3 text-gray-600">{u.email}</td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentUsers.length === 0 && (
                  <tr><td colSpan={4} className="px-3 sm:px-6 py-4 text-center text-gray-400">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Listings</h2>
            <Link href="/admin/listings" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50">
                  <th className="px-3 sm:px-6 py-3 font-medium">Title</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Status</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentListings.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{l.title}</td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[l.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-gray-500">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentListings.length === 0 && (
                  <tr><td colSpan={3} className="px-3 sm:px-6 py-4 text-center text-gray-400">No listings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Listings by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Listings by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.listingsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{status}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'ACTIVE' ? 'bg-green-500' :
                      status === 'PENDING' ? 'bg-yellow-500' :
                      status === 'SOLD' ? 'bg-blue-500' :
                      status === 'REJECTED' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${(count / maxListingCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.listingsByStatus).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Users by Country */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Users by Country</h2>
          <div className="space-y-3">
            {Object.entries(stats.usersByCountry).map(([country, count]) => (
              <div key={country}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{country}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${(count / maxCountryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.usersByCountry).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
          >
            📊 View Analytics
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            🏷️ Manage Categories
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            ⚙️ Site Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
