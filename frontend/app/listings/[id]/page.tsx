'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { ContactSellerModal } from '@/components/listings/ContactSellerModal';
import { formatDate } from '@/lib/utils';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-xl font-semibold text-gray-700">Listing not found</p>
        <Link href="/listings" className="mt-4 text-sky-600 hover:underline">Browse other listings</Link>
      </div>
    );
  }

  const images = listing.images.length > 0
    ? listing.images
    : [`https://picsum.photos/seed/${listing.id}/800/600`];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-sky-600">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-sky-600">Listings</Link>
        <span>/</span>
        <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-sky-600">{listing.category.name}</Link>
        <span>/</span>
        <span className="text-gray-700 line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-[1fr_340px] gap-8">
        {/* Left: Images + Details */}
        <div className="space-y-6">
          {/* Main image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={images[activeImage]}
              alt={listing.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
            {listing.status === 'SOLD' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-500 text-white text-2xl font-bold px-6 py-2 rounded-lg">SOLD</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-sky-500' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Details</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{listing.category.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Condition</dt>
                <dd className="font-medium">{listing.condition}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{listing.location}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Country</dt>
                <dd className="font-medium">{listing.country}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Views</dt>
                <dd className="font-medium">{listing.views}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Posted</dt>
                <dd className="font-medium">{formatDate(listing.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right: Price, Seller, Contact */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <CurrencyDisplay
                amount={listing.price}
                currency={listing.currency}
                className="text-3xl font-bold text-sky-600"
              />
              <FavoriteButton listingId={listing.id} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-2">{listing.title}</h1>
            <p className="text-gray-500 text-sm mt-1">📍 {listing.location}, {listing.country}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              listing.condition === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {listing.condition}
            </span>
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold mb-4">Seller Information</h2>
            <div className="flex items-center gap-3">
              <UserAvatar user={listing.user} size="md" />
              <div>
                <p className="font-semibold">{listing.user.name}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(listing.createdAt)}</p>
              </div>
            </div>
            <Link
              href={`/profile/${listing.userId}`}
              className="mt-3 text-sm text-sky-600 hover:underline block"
            >
              View all listings by this seller →
            </Link>
          </div>

          {/* Contact */}
          {listing.status === 'ACTIVE' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-bold mb-4">Contact Seller</h2>
              <ContactSellerModal listing={listing} />
            </div>
          )}

          {/* Report */}
          <button
            className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => {
              const reason = prompt('Please describe the issue with this listing:');
              if (reason) {
                api.post('/reports', { listingId: listing.id, reason })
                  .then(() => alert('Report submitted. Thank you.'))
                  .catch(() => alert('Please login to report listings.'));
              }
            }}
          >
            🚩 Report this listing
          </button>
        </div>
      </div>
    </div>
  );
}
