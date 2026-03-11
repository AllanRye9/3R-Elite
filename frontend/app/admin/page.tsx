'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  users: number;
  listings: number;
  reports: number;
  activeListings: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/');
    if (user?.role === 'ADMIN') {
      api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !stats) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <AdminStatsCard title="Total Users" value={stats.users} icon="👥" color="bg-blue-500" />
        <AdminStatsCard title="Total Listings" value={stats.listings} icon="📋" color="bg-purple-500" />
        <AdminStatsCard title="Active Listings" value={stats.activeListings} icon="✅" color="bg-green-500" />
        <AdminStatsCard title="Reports" value={stats.reports} icon="🚩" color="bg-red-500" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
          <p className="text-3xl mb-2">👥</p>
          <p className="font-bold text-lg">Manage Users</p>
          <p className="text-sm text-gray-500 mt-1">View, ban, and verify users</p>
        </Link>
        <Link href="/admin/listings" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-bold text-lg">Manage Listings</p>
          <p className="text-sm text-gray-500 mt-1">Review and moderate listings</p>
        </Link>
        <Link href="/admin/reports" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
          <p className="text-3xl mb-2">🚩</p>
          <p className="font-bold text-lg">View Reports</p>
          <p className="text-sm text-gray-500 mt-1">Handle user reports</p>
        </Link>
      </div>
    </div>
  );
}
