'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { timeAgo } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';

interface Props {
  listing: Listing;
  showFavorite?: boolean;
}

export function ListingCard({ listing, showFavorite = true }: Props) {
  const imageUrl = listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/400/300`;

  return (
    <div className="bg-white rounded shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Link href={`/listings/${listing.id}`}>
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        {listing.condition === 'NEW' && (
          <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            New
          </span>
        )}
        {listing.status === 'SOLD' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">SOLD</span>
          </div>
        )}
        {showFavorite && (
          <div className="absolute top-1 right-1">
            <FavoriteButton listingId={listing.id} />
          </div>
        )}
      </div>
      <div className="p-2">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 text-xs hover:text-sky-600 mb-0.5">
            {listing.title}
          </h3>
        </Link>
        <CurrencyDisplay amount={listing.price} currency={listing.currency} className="text-sky-600 font-bold text-sm" />
        <div className="flex items-center justify-between mt-0.5 text-[10px] text-gray-500">
          <span>📍 {listing.location}</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
