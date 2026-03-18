'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ProductReview, ReviewStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { formatDate, timeAgo } from '@/lib/utils';

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

function getApiErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    'An error occurred'
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

function statusBadge(status: ReviewStatus) {
  const styles: Record<ReviewStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminReviewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('PENDING');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setFetching(true);
      const { data } = await api.get('/admin/reviews', { params: { status, page, limit } });
      setReviews(data.reviews);
      setTotal(data.pagination.total);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, [status, page]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchReviews();
  }, [user, fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/reviews/${id}/approve`);
      await fetchReviews();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      await api.put(`/admin/reviews/${rejectTarget}/reject`, { reason: rejectReason || undefined });
      await fetchReviews();
      setRejectTarget(null);
      setRejectReason('');
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading || fetching) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review Moderation</h1>
      <p className="text-gray-500 mb-6">
        Approve or reject customer product reviews.
        {status === 'PENDING' && total > 0 && (
          <span className="ml-1 font-medium text-yellow-600">({total} pending)</span>
        )}
      </p>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
            {status === s && total > 0 && <span className="ml-1.5 opacity-80">({total})</span>}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">No {status.toLowerCase()} reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{review.user?.name}</span>
                    <span className="text-gray-400 text-xs">{review.user?.email ?? ''}</span>
                    {statusBadge(review.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs text-gray-400">{timeAgo(review.createdAt)} · {formatDate(review.createdAt)}</span>
                  </div>
                  {review.listing && (
                    <p className="text-xs text-gray-500">
                      Listing: <span className="font-medium text-gray-700">{review.listing.title}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === review.id ? null : review.id)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
                  >
                    {expanded === review.id ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>

              {/* Preview snippet */}
              {review.title && (
                <p className="mt-2 text-sm font-semibold text-gray-800">&ldquo;{review.title}&rdquo;</p>
              )}
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{review.content}</p>

              {/* Expanded full content */}
              {expanded === review.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.content}</p>
                  {review.rejectionReason && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      <span className="font-semibold">Rejection reason:</span> {review.rejectionReason}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                    <span>Helpful votes: {review.helpfulCount}</span>
                    {review.verifiedPurchase && <span className="text-emerald-600 font-medium">✓ Verified Buyer</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reject Review</h2>
            <p className="text-sm text-gray-500 mb-4">Optionally provide a reason for rejecting this review.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection (optional)"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Reject Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
