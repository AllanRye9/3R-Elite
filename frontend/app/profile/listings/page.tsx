'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      api.get(`/listings?userId=${user.id}&limit=50`)
        .then(({ data }) => setListings(data.listings || []))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Listings</h1>
        <Link href="/listings/create" className="bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition-colors">
          + Post New
        </Link>
      </div>
      <ListingGrid listings={listings} showFavorite={false} />
    </div>
  );
}
