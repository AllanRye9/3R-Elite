'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing, ProductReview, ReviewAggregate } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { ContactSellerModal } from '@/components/listings/ContactSellerModal';
import { formatDate, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleMainImgError = (index: number) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [aggregate, setAggregate] = useState<ReviewAggregate | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Helpful vote tracking
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const { data } = await api.get(`/reviews/listing/${id}`, {
        params: { sort: reviewSort, page: reviewPage, limit: 10 },
      });
      setReviews(data.reviews);
      setAggregate(data.aggregate);
      setReviewTotalPages(data.pagination.pages);
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  }, [id, reviewSort, reviewPage]);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRating) { setFormError('Please select a rating.'); return; }
    if (!formContent.trim()) { setFormError('Please write your review.'); return; }
    setFormError('');
    setFormSubmitting(true);
    try {
      await api.post(`/reviews/listing/${id}`, {
        rating: formRating,
        title: formTitle || undefined,
        content: formContent,
      });
      setFormSuccess('Thank you! Your review has been submitted and is awaiting moderation.');
      setShowForm(false);
      setFormRating(0);
      setFormTitle('');
      setFormContent('');
      fetchReviews();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Failed to submit review. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;
    setHelpfulLoading(reviewId);
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch {
      // ignore
    } finally {
      setHelpfulLoading(null);
    }
  };

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

  const images = (() => {
    // Prefer approved CDN images from the productImages relation
    const approvedCdnUrls = (listing.productImages || [])
      .filter((pi) => pi.cdnUrl)
      .map((pi) => pi.cdnUrl as string);
    if (approvedCdnUrls.length > 0) return approvedCdnUrls;
    // Fall back to listing.images[] (may include temp preview URLs)
    if (listing.images.length > 0) return listing.images;
    return [`https://picsum.photos/seed/${listing.id}/800/600`];
  })();

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
              src={failedImages.has(activeImage) ? `https://picsum.photos/seed/${listing.id}-${activeImage}/800/600` : images[activeImage]}
              alt={listing.title}
              fill
              className="object-contain transition-all duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              onError={() => handleMainImgError(activeImage)}
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
                  <Image
                    src={failedImages.has(i) ? `https://picsum.photos/seed/${listing.id}-${i}/72/72` : img}
                    alt=""
                    width={72}
                    height={72}
                    className="object-cover w-full h-full"
                    onError={() => handleMainImgError(i)}
                  />
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

          {/* Contact / Add to Cart */}
          {listing.status === 'ACTIVE' && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              {listing.user.role === 'ADMIN' ? (
                <>
                  <h2 className="font-bold text-gray-900 mb-3 text-sm">Purchase</h2>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white transition-colors interactive shadow-sm"
                    onClick={() => alert('Add to Cart feature coming soon!')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
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
                </>
              ) : (
                <>
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
                </>
              )}
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

      {/* ── Reviews Section ─────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Customer Reviews
        </h2>

        {/* Aggregated Rating Summary */}
        {aggregate && aggregate.total > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Average score */}
              <div className="text-center shrink-0">
                <div className="text-5xl font-extrabold text-gray-900">{aggregate.averageRating.toFixed(1)}</div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className={`w-4 h-4 ${s <= Math.round(aggregate.averageRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">{aggregate.total} review{aggregate.total !== 1 ? 's' : ''}</div>
              </div>

              {/* Star breakdown bars */}
              <div className="flex-1 w-full space-y-1.5">
                {[5,4,3,2,1].map((s) => {
                  const info = aggregate.breakdown[s] || { count: 0, pct: 0 };
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-3 text-right">{s}</span>
                      <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${info.pct}%` }} />
                      </div>
                      <span className="text-gray-400 w-8 text-right">{info.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Write a Review prompt / success */}
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm">
            {formSuccess}
          </div>
        )}

        {user && !formSuccess && (
          <div className="mb-5">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors interactive shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Write a Review
              </button>
            ) : (
              <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-900">Write Your Review</h3>

                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setFormHoverRating(s)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        onClick={() => setFormRating(s)}
                        className="p-0.5 interactive"
                        aria-label={`${s} star${s !== 1 ? 's' : ''}`}
                      >
                        <svg className={`w-7 h-7 transition-colors ${s <= (formHoverRating || formRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                    {formRating > 0 && (
                      <span className="ml-2 text-sm text-gray-500 self-center">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Review Title <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    maxLength={150}
                    placeholder="Summarize your experience"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Review <span className="text-red-500">*</span></label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Share your experience with this listing..."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 resize-none"
                    required
                  />
                  <div className="text-right text-[10px] text-gray-400 mt-0.5">{formContent.length}/2000</div>
                </div>

                {formError && <p className="text-xs text-red-600">{formError}</p>}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(''); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors interactive"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors disabled:opacity-50 interactive"
                  >
                    {formSubmitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!user && (
          <p className="text-sm text-gray-500 mb-5">
            <Link href="/auth/login" className="text-sky-600 hover:underline font-medium">Sign in</Link> to write a review.
          </p>
        )}

        {/* Sort Controls */}
        {aggregate && aggregate.total > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort by:</span>
            {(['recent', 'helpful', 'highest', 'lowest'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setReviewSort(s); setReviewPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors interactive ${
                  reviewSort === s
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'recent' ? 'Most Recent' : s === 'helpful' ? 'Most Helpful' : s === 'highest' ? 'Highest Rated' : 'Lowest Rated'}
              </button>
            ))}
          </div>
        )}

        {/* Review List */}
        {reviewsLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 shimmer rounded w-1/4" />
                    <div className="h-2.5 shimmer rounded w-1/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-full" />
                  <div className="h-3 shimmer rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this listing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <UserAvatar user={review.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{review.user.name}</span>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{review.title}</h4>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>

                {/* Helpful button */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={!user || helpfulLoading === review.id}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-sky-600 transition-colors disabled:opacity-50 interactive"
                    title={user ? 'Mark as helpful' : 'Sign in to vote'}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful ({review.helpfulCount})
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {reviewTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  disabled={reviewPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors interactive"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-500">Page {reviewPage} of {reviewTotalPages}</span>
                <button
                  onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                  disabled={reviewPage === reviewTotalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors interactive"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
