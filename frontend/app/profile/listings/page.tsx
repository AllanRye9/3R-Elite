'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';

function getStatusClasses(status: Listing['status']) {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'SOLD') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      api.get('/listings?mine=true&limit=50')
        .then(({ data }) => setListings(data.listings || []))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-elite-navy via-sky-600 to-sky-400 px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              Seller Products
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight">My Products</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
              Manage everything you have posted, track review status, and confirm each product is sitting in the right marketplace category.
            </p>
          </div>
          <Link href="/listings/create" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-elite-navy transition-colors hover:bg-sky-50">
            + Post New Product
          </Link>
        </div>
      </section>

      <div className="mt-6 rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product section</h2>
            <p className="mt-1 text-sm text-slate-500">Each product keeps its own status, price, location, and assigned category.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{listings.length}</span> product{listings.length === 1 ? '' : 's'}
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <h3 className="text-lg font-bold text-slate-900">No products posted yet</h3>
            <p className="mt-2 text-sm text-slate-500">Start by creating a product and placing it in its correct category.</p>
            <Link href="/listings/create" className="mt-5 inline-flex rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600">
              Post Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {listings.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 w-full bg-slate-100 sm:h-auto sm:w-44">
                    {listing.images?.[0] ? (
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(listing.status)}`}>
                        {listing.status}
                      </span>
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                        {listing.category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">{listing.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{listing.description}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Price</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatCurrency(listing.price, listing.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Location</p>
                        <p className="mt-1 font-semibold text-slate-900">{listing.location}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Condition</p>
                        <p className="mt-1 font-semibold text-slate-900">{listing.condition}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Posted</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatDate(listing.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/listings/${listing.id}`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        View Product
                      </Link>
                      <Link href="/listings/create" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600">
                        Post Another
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
