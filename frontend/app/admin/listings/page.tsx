'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchListings = useCallback(async (query: string, status: string) => {
    try {
      setFetching(true);
      const params: Record<string, string> = {};
      if (query) params.search = query;
      if (status) params.status = status;
      const { data } = await api.get('/admin/listings', { params });
      setListings(data.listings);
      setTotal(data.pagination.total);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchListings(search, statusFilter), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, statusFilter, user, fetchListings]);

  const updateStatus = async (listingId: string, status: string) => {
    await api.put(`/admin/listings/${listingId}`, { status });
    setListings((prev) => prev.map((l) => l.id === listingId ? { ...l, status: status as Listing['status'] } : l));
  };

  const deleteListing = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/listings/${listingId}`);
      await fetchListings(search, statusFilter);
    } catch {
      // ignore
    }
  };

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Listings</h1>
      <p className="text-gray-500 mb-6">{total} total listings</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="HIDDEN">Hidden</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Seller</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Posted</th>
              <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-3">
                  <Link href={`/listings/${l.id}`} className="hover:text-sky-600 line-clamp-1 font-medium">
                    {l.title}
                  </Link>
                </td>
                <td className="px-3 sm:px-4 py-3 text-gray-500">{l.user?.name}</td>
                <td className="px-3 sm:px-4 py-3"><CurrencyDisplay amount={l.price} currency={l.currency} /></td>
                <td className="px-3 sm:px-4 py-3 text-gray-500">{l.category?.name}</td>
                <td className="px-3 sm:px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    l.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    l.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                    l.status === 'HIDDEN' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{l.status}</span>
                </td>
                <td className="px-3 sm:px-4 py-3 text-gray-500">{formatDate(l.createdAt)}</td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1.5"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="HIDDEN">Hidden</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                    <button
                      onClick={() => deleteListing(l.id, l.title)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                      title="Delete listing"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
