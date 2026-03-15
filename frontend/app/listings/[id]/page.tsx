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

function SkeletonDetail() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 shimmer rounded-full w-1/3 mb-6" />
      <div className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="aspect-[4/3] shimmer rounded-2xl" />
          <div className="h-32 shimmer rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-40 shimmer rounded-xl" />
          <div className="h-32 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail />;

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">😕</div>
        <p className="text-xl font-bold text-gray-800 mb-2">Listing not found</p>
        <p className="text-gray-500 text-sm mb-6">This listing may have been removed or is no longer available.</p>
        <Link href="/listings" className="btn-primary inline-flex">Browse other listings</Link>
      </div>
    );
  }

  const images = listing.images.length > 0
    ? listing.images
    : [`https://picsum.photos/seed/${listing.id}/800/600`];

  const detailItems = [
    { label: 'Category', value: listing.category.name },
    { label: 'Condition', value: listing.condition },
    { label: 'Location', value: listing.location },
    { label: 'Country', value: listing.country },
    { label: 'Views', value: listing.views?.toString() || '0' },
    { label: 'Posted', value: formatDate(listing.createdAt) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href="/listings" className="hover:text-sky-600 transition-colors">Listings</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-sky-600 transition-colors">{listing.category.name}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-600 line-clamp-1 max-w-[120px] sm:max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-[1fr_340px] gap-4 sm:gap-5 lg:gap-7">
        {/* Left: Images + Details */}
        <div className="space-y-4 order-2 md:order-1">
          {/* Main image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group cursor-zoom-in">
            <Image
              src={images[activeImage]}
              alt={listing.title}
              fill
              className="object-contain transition-all duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
            {listing.status === 'SOLD' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-500 text-white text-2xl font-black px-8 py-2 rounded-xl shadow-xl -rotate-6">SOLD</span>
              </div>
            )}
            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {activeImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all interactive ${
                    i === activeImage
                      ? 'border-sky-500 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'
                  }`}
                >
                  <Image src={img} alt="" width={72} height={72} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <h2 className="font-extrabold text-gray-900 text-base mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              Description
            </h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </div>

          {/* Details grid */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <h2 className="font-extrabold text-gray-900 text-base mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Listing Details
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              {detailItems.map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Right: Price, Seller, Contact */}
        <div className="space-y-4 order-1 md:order-2">
          {/* Price card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <CurrencyDisplay
                  amount={listing.price}
                  currency={listing.currency}
                  className="text-3xl font-extrabold text-sky-600"
                />
              </div>
              <FavoriteButton listingId={listing.id} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-2 leading-tight">{listing.title}</h1>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {listing.location}, {listing.country}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`badge text-[10px] ${listing.condition === 'NEW' ? 'badge-new' : 'badge-used'}`}>
                {listing.condition === 'NEW' ? '✦ New' : 'Used'}
              </span>
              {listing.status === 'ACTIVE' && (
                <span className="badge text-[10px] bg-emerald-100 text-emerald-700">● Active</span>
              )}
            </div>
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">Seller Information</h2>
            <div className="flex items-center gap-3">
              <UserAvatar user={listing.user} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm truncate">{listing.user.name}</p>
                  {listing.user.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Seller
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Member since {formatDate(listing.createdAt)}</p>
              </div>
            </div>
            <Link
              href={`/profile/${listing.userId}`}
              className="mt-3 flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors interactive"
            >
              View all listings by this seller
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Contact */}
          {listing.status === 'ACTIVE' && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">Contact Seller</h2>
              <ContactSellerModal listing={listing} />
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 border-brand-600 text-brand-600 hover:bg-brand-50 transition-colors interactive"
                  onClick={() => alert('Make Offer feature coming soon!')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Make Offer
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-rose-300 hover:text-rose-500 transition-colors interactive"
                  onClick={() => alert('Add to Wishlist feature coming soon!')}
                  aria-label="Add to Wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Safety tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Safety Tips
            </h3>
            <ul className="text-[10px] text-amber-700 space-y-1">
              <li>• Meet in a safe, public location</li>
              <li>• Never pay in advance without inspecting</li>
              <li>• Trust your instincts</li>
            </ul>
          </div>

          {/* Report */}
          <button
            className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 py-2 interactive"
            onClick={() => {
              const reason = prompt('Please describe the issue with this listing:');
              if (reason) {
                api.post('/reports', { listingId: listing.id, reason })
                  .then(() => alert('Report submitted. Thank you.'))
                  .catch(() => alert('Please login to report listings.'));
              }
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            Report this listing
          </button>
        </div>
      </div>
    </div>
  );
}
