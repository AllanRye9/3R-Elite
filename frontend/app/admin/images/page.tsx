'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ProductImage } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED';
type SortOrder = 'newest' | 'oldest';

const REJECT_REASONS = ['Blurry / low quality', 'Inappropriate content', 'Wrong product', 'Duplicate image', 'Other'];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function useLocalToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
  }, []);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return { toasts, show, dismiss };
}

const statusColors: Record<Toast['type'], string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

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

  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectReason, setRejectReason] = useState('');
  const [rejectChip, setRejectChip] = useState(''); // tracks the selected preset chip
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const [modalImage, setModalImage] = useState<ProductImage | null>(null);

  const { toasts, show: showToast, dismiss } = useLocalToast();

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

  useEffect(() => {
    setSelected(new Set());
    setPage(1);
    setSearch('');
    setSellerFilter('');
  }, [status]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filteredImages.map((img) => img.id)));
  const clearSelection = () => setSelected(new Set());

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/images/${id}/approve`);
      await fetchImages();
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      showToast('Image approved successfully', 'success');
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), 'error');
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
        showToast(`${selected.size} image(s) rejected`, 'info');
        setSelected(new Set());
      } else {
        await api.put(`/admin/images/${rejectTarget}/reject`, { reason: rejectReason || undefined });
        setSelected((prev) => { const n = new Set(prev); n.delete(rejectTarget); return n; });
        showToast('Image rejected', 'info');
      }
      await fetchImages();
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
      setRejectReason('');
      setRejectChip('');
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading('bulk');
    try {
      await api.put('/admin/images/bulk', { ids: Array.from(selected), action: 'approve' });
      showToast(`${selected.size} image(s) approved`, 'success');
      setSelected(new Set());
      await fetchImages();
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Client-side filtering and sorting
  const filteredImages = images
    .filter((img) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        img.listing?.title?.toLowerCase().includes(q) ||
        img.seller?.name?.toLowerCase().includes(q) ||
        img.seller?.email?.toLowerCase().includes(q) ||
        img.id.toLowerCase().includes(q);
      const matchesSeller = !sellerFilter ||
        img.seller?.name?.toLowerCase().includes(sellerFilter.toLowerCase()) ||
        img.seller?.email?.toLowerCase().includes(sellerFilter.toLowerCase());
      return matchesSearch && matchesSeller;
    })
    .sort((a, b) => {
      const diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sort === 'newest' ? -diff : diff;
    });

  const pages = Math.ceil(total / limit);

  // Unique sellers for the filter dropdown
  const sellerOptions = Array.from(
    new Map(
      images
        .filter((img) => img.seller?.id)
        .map((img) => [img.seller!.id, img.seller!] as [string, { id: string; name: string; email: string }])
    ).values()
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="relative">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 bg-white border rounded-xl shadow-lg px-4 py-3 min-w-[260px] max-w-[360px] animate-slide-down`}
          >
            <div className={`w-1 self-stretch rounded-full ${statusColors[t.type]}`} />
            <p className="text-sm text-gray-700 font-medium flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Dismiss">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between mb-1 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Image Moderation</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Review seller-uploaded images before they appear on product listings.
            {status === 'PENDING' && total > 0 && (
              <span className="ml-1 font-medium text-amber-600">({total} pending)</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchImages}
          disabled={fetching}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mt-4 mb-4 flex-wrap">
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

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, seller, or image ID…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        {/* Seller filter */}
        {sellerOptions.length > 0 && (
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          >
            <option value="">All sellers</option>
            {sellerOptions.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        )}
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {status === 'PENDING' && filteredImages.length > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
          <input
            type="checkbox"
            checked={selected.size === filteredImages.length && filteredImages.length > 0}
            onChange={selected.size === filteredImages.length ? clearSelection : selectAll}
            className="w-4 h-4 rounded accent-sky-500"
            aria-label="Select all"
          />
          <span className="text-sm text-gray-500">
            {selected.size > 0
              ? `${selected.size} selected`
              : (search || sellerFilter) ? 'Select visible' : 'Select all'}
          </span>
          {selected.size > 0 && (
            <>
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading !== null}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Approve {selected.size}
              </button>
              <button
                onClick={() => setRejectTarget('bulk')}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject {selected.size}
              </button>
            </>
          )}
        </div>
      )}

      {/* Images grid */}
      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-gray-500">
            {search || sellerFilter
              ? 'No images match your search.'
              : `No ${status.toLowerCase()} images to review.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                selected.has(img.id) ? 'border-sky-500 ring-2 ring-sky-200' : 'border-gray-100'
              }`}
            >
              {/* Image thumbnail */}
              <div
                className="aspect-[4/3] relative bg-gray-100 overflow-hidden cursor-pointer group"
                onClick={() => status === 'PENDING' ? toggleSelect(img.id) : setModalImage(img)}
              >
                {img.previewUrl ? (
                  <Image
                    src={img.previewUrl}
                    alt="Product image"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>
                )}

                {/* Zoom overlay for non-pending */}
                {status !== 'PENDING' && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
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

                {/* Selection checkbox – pending only */}
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

                {/* View details icon for non-pending */}
                {status !== 'PENDING' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalImage(img); }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-colors"
                    aria-label="View details"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
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
                  <p className="text-[10px] text-green-600 mt-1 truncate" title={img.cdnUrl}>
                    ✓ On CDN
                  </p>
                )}

                {/* Action buttons – only for pending */}
                {status === 'PENDING' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(img.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === img.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectTarget(img.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
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
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
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
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    if (r === 'Other') {
                      setRejectChip('Other');
                      setRejectReason('');
                    } else {
                      setRejectChip(r);
                      setRejectReason(r);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    rejectChip === r
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              placeholder="Or describe the issue…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setRejectTarget(null); setRejectReason(''); setRejectChip(''); }}
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

      {/* Image details modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image preview */}
            <div className="relative aspect-[16/9] bg-gray-900">
              {modalImage.previewUrl ? (
                <Image
                  src={modalImage.previewUrl}
                  alt="Full image preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">📷</div>
              )}
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Metadata */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {modalImage.listing?.title || <span className="text-gray-400 italic">No listing</span>}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Uploaded by <span className="font-medium text-gray-700">{modalImage.seller?.name || 'Unknown'}</span>
                    {modalImage.seller?.email && <span className="text-gray-400"> ({modalImage.seller.email})</span>}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    modalImage.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : modalImage.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {modalImage.status}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Image ID</dt>
                  <dd className="text-gray-700 font-mono text-xs truncate">{modalImage.id}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Uploaded</dt>
                  <dd className="text-gray-700 text-xs">{formatDate(modalImage.uploadedAt)}</dd>
                </div>
                {modalImage.reviewedAt && (
                  <div>
                    <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Reviewed</dt>
                    <dd className="text-gray-700 text-xs">{formatDate(modalImage.reviewedAt)}</dd>
                  </div>
                )}
                {modalImage.cdnUrl && (
                  <div className="col-span-2">
                    <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">CDN URL</dt>
                    <dd className="text-green-700 text-xs truncate">{modalImage.cdnUrl}</dd>
                  </div>
                )}
                {modalImage.rejectionReason && (
                  <div className="col-span-2">
                    <dt className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Rejection reason</dt>
                    <dd className="text-red-600 text-xs">{modalImage.rejectionReason}</dd>
                  </div>
                )}
              </dl>
              {/* Quick actions inside modal for pending */}
              {modalImage.status === 'PENDING' && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => { handleApprove(modalImage.id); setModalImage(null); }}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(modalImage.id); setModalImage(null); }}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

