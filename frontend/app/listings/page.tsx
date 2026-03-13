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

  const currentPage = parseInt(params.get('page') || '1');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryString = params.toString() || '';
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
    const newParams = new URLSearchParams(params.toString());
    newParams.set('page', String(page));
    router.push(`/listings?${newParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <SearchBar
          initialQ={params.get('q') || ''}
          initialLocation={params.get('location') || ''}
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-3 md:hidden">
        <p className="text-gray-600 text-sm">{total} listings found</p>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          categories={categories}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />
        <div className="flex-1 min-w-0">
          <div className="hidden md:flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm">{total} listings found</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ListingGrid listings={listings} />
              {pages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium ${
                        p === currentPage
                          ? 'bg-sky-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
