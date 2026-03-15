'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing, Category } from '@/lib/types';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { FilterSidebar } from '@/components/listings/FilterSidebar';
import { SearchBar } from '@/components/listings/SearchBar';

function ListingsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const currentPage = parseInt(params ? params.get('page') || '1' : '1');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryString = params ? params.toString() : '';
    api.get(`/listings?${queryString}`)
      .then(({ data }) => {
        setListings(data.listings || []);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 1);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [params]);

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(params ? params.toString() : '');
    newParams.set('page', String(page));
    router.push(`/listings?${newParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Search */}
      <div className="mb-4">
        <SearchBar
          initialQ={params.get('q') || ''}
          initialLocation={params.get('location') || ''}
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-3 md:hidden">
        <p className="text-gray-500 text-sm font-medium">
          <span className="text-gray-900 font-bold">{total}</span> listings
        </p>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm interactive"
        >
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex gap-5">
        <FilterSidebar
          categories={categories}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <div className="hidden md:flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">
              <span className="text-gray-900 font-bold">{total}</span> listings found
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-top" className="text-xs text-gray-500 whitespace-nowrap">Sort by:</label>
              <select
                id="sort-top"
                value={params.get('sort') || 'createdAt'}
                onChange={(e) => {
                  const newParams = new URLSearchParams(params.toString());
                  newParams.set('sort', e.target.value);
                  newParams.set('page', '1');
                  router.push(`/listings?${newParams.toString()}`);
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white text-gray-700"
              >
                <option value="createdAt">Most Recent</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Price</option>
                <option value="views">Most Popular</option>
              </select>
            </div>
          </div>

          <ListingGrid listings={listings} loading={loading} />

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-8">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed interactive transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === pages)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="flex items-center px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all interactive ${
                        p === currentPage
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-sky-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => goToPage(Math.min(pages, currentPage + 1))}
                disabled={currentPage === pages}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed interactive transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-12 shimmer rounded-xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="aspect-[4/3] shimmer" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 shimmer rounded-full" />
                <div className="h-4 shimmer rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

