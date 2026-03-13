import { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

interface Props {
  listings: Listing[];
  showFavorite?: boolean;
}

export function ListingGrid({ listings, showFavorite = true }: Props) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg font-medium">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your search filters</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} showFavorite={showFavorite} />
      ))}
    </div>
  );
}
