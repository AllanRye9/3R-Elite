'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ProductImage } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

function getApiErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    'An error occurred'
  );
}

export default function AdminImagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState<ProductImage[]>([]);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('PENDING');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null); // single image id or 'bulk'

  const fetchImages = useCallback(async () => {
    try {
      setFetching(true);
      const { data } = await api.get('/admin/images', { params: { status, page, limit } });
      setImages(data.images);
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
    if (user?.role === 'ADMIN') fetchImages();
  }, [user, fetchImages]);

  // Clear selection when status filter changes
  useEffect(() => {
    setSelected(new Set());
    setPage(1);
  }, [status]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(images.map((img) => img.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/images/${id}/approve`);
      await fetchImages();
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
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
      if (rejectTarget === 'bulk') {
        await api.put('/admin/images/bulk', {
          ids: Array.from(selected),
          action: 'reject',
          reason: rejectReason || undefined,
        });
        setSelected(new Set());
      } else {
        await api.put(`/admin/images/${rejectTarget}/reject`, { reason: rejectReason || undefined });
        setSelected((prev) => { const n = new Set(prev); n.delete(rejectTarget); return n; });
      }
      await fetchImages();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading('bulk');
    try {
      await api.put('/admin/images/bulk', { ids: Array.from(selected), action: 'approve' });
      setSelected(new Set());
      await fetchImages();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const pages = Math.ceil(total / limit);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Image Moderation</h1>
      <p className="text-gray-500 mb-5">
        Review seller-uploaded images before they appear on product listings.
        {status === 'PENDING' && total > 0 && (
          <span className="ml-1 font-medium text-amber-600">({total} pending)</span>
        )}
      </p>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              status === s
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600'
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {status === 'PENDING' && images.length > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
          <input
            type="checkbox"
            checked={selected.size === images.length && images.length > 0}
            onChange={selected.size === images.length ? clearSelection : selectAll}
            className="w-4 h-4 rounded accent-sky-500"
            aria-label="Select all"
          />
          <span className="text-sm text-gray-500">
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </span>
          {selected.size > 0 && (
            <>
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading !== null}
                className="ml-auto px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Approve {selected.size}
              </button>
              <button
                onClick={() => setRejectTarget('bulk')}
                disabled={actionLoading !== null}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Reject {selected.size}
              </button>
            </>
          )}
        </div>
      )}

      {/* Images grid */}
      {fetching ? (
        <div className="p-12 text-center text-gray-400">Loading images…</div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-gray-500">No {status.toLowerCase()} images to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                selected.has(img.id) ? 'border-sky-500 ring-2 ring-sky-200' : 'border-gray-100'
              }`}
            >
              {/* Image thumbnail */}
              <div
                className="aspect-[4/3] relative bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => status === 'PENDING' && toggleSelect(img.id)}
              >
                {img.previewUrl ? (
                  <Image
                    src={img.previewUrl}
                    alt="Product image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>
                )}

                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      img.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : img.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {img.status}
                  </span>
                </div>

                {/* Selection checkbox */}
                {status === 'PENDING' && (
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={selected.has(img.id)}
                      onChange={() => toggleSelect(img.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-sky-500"
                      aria-label="Select image"
                    />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                  {img.listing?.title || <span className="text-gray-400 italic">No listing yet</span>}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  by {img.seller?.name || 'Unknown'} · {formatDate(img.uploadedAt)}
                </p>
                {img.rejectionReason && (
                  <p className="text-[10px] text-red-500 mt-1 line-clamp-2">
                    Reason: {img.rejectionReason}
                  </p>
                )}
                {img.status === 'APPROVED' && img.cdnUrl && (
                  <p className="text-[10px] text-green-600 mt-1 truncate">
                    CDN: {img.cdnUrl}
                  </p>
                )}

                {/* Action buttons – only for pending */}
                {status === 'PENDING' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(img.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === img.id ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectTarget(img.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Rejection modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reject Image</h2>
            <p className="text-sm text-gray-500 mb-4">
              {rejectTarget === 'bulk'
                ? `Reject ${selected.size} selected image(s)? This cannot be undone.`
                : 'This image will be removed from the listing. This cannot be undone.'}
            </p>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Rejection reason <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Image contains prohibited content…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading !== null}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
