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
    <div className="group bg-white rounded-lg xs:rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-sky-100">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <Link href={`/listings/${listing.id}`} className="block h-full" tabIndex={-1}>
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 374px) 50vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-1.5 xs:top-2 left-1.5 xs:left-2 flex flex-col gap-1">
          {listing.condition === 'NEW' && (
            <span className="badge badge-new text-[9px] xs:text-[10px] shadow-sm"><span aria-hidden="true">✦</span> New</span>
          )}
          {listing.user?.isVerified && (
            <span className="badge text-[9px] xs:text-[10px] shadow-sm bg-sky-500 text-white">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* SOLD overlay */}
        {listing.status === 'SOLD' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] xs:text-xs font-bold px-2.5 xs:px-3 py-0.5 xs:py-1 rounded-lg shadow tracking-wider uppercase">Sold</span>
          </div>
        )}

        {/* Favorite button */}
        {showFavorite && (
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FavoriteButton listingId={listing.id} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-1.5 xs:p-2.5">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-[11px] xs:text-xs leading-tight hover:text-sky-600 transition-colors mb-1 xs:mb-1.5">
            {listing.title}
          </h3>
        </Link>

        <CurrencyDisplay
          amount={listing.price}
          currency={listing.currency}
          className="text-sky-600 font-extrabold text-xs xs:text-sm"
        />

        <div className="flex items-center justify-between mt-1 xs:mt-1.5 text-[9px] xs:text-[10px] text-gray-400">
          <span className="flex items-center gap-0.5 truncate">
            <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{listing.location}</span>
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            {listing.views > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}
              </span>
            )}
            <span className="flex-shrink-0">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

