import { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

interface Props {
  listings: Listing[];
  showFavorite?: boolean;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg xs:rounded-xl border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-1.5 xs:p-2.5 space-y-2">
        <div className="h-3 shimmer rounded-full" />
        <div className="h-3 shimmer rounded-full w-3/4" />
        <div className="h-4 shimmer rounded-full w-1/2 mt-1" />
        <div className="flex justify-between mt-2">
          <div className="h-2.5 shimmer rounded-full w-1/3" />
          <div className="h-2.5 shimmer rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ListingGrid({ listings, showFavorite = true, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-3">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-10 xs:py-16 px-4">
        <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gray-100 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
          <svg className="w-8 h-8 xs:w-10 xs:h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-base xs:text-lg font-bold text-gray-700 mb-1">No listings found</p>
        <p className="text-xs xs:text-sm text-gray-400">Try adjusting your search or filters to find what you&apos;re looking for.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-3 stagger-children">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} showFavorite={showFavorite} />
      ))}
    </div>
  );
}

