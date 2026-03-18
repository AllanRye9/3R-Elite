'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const REASONS = [
  'Fraud or scam',
  'Duplicate listing',
  'Misleading information',
  'Prohibited item',
  'Spam or abuse',
  'Other',
];

function CreateReportPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get('listingId') || '';
  const listingTitle = searchParams?.get('title') || 'this listing';
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/reports/create?listingId=${listingId}&title=${listingTitle}`)}`);
    }
  }, [listingId, listingTitle, loading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listingId) {
      setError('Missing listing reference. Please start reporting from a listing page.');
      return;
    }

    const composedReason = details.trim() ? `${reason}: ${details.trim()}` : reason;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reports', { listingId, reason: composedReason });
      setSuccess(true);
      setDetails('');
    } catch {
      setError('Unable to submit the report right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
        <Link href={listingId ? `/listings/${listingId}` : '/listings'} className="text-sm font-medium text-sky-700 hover:text-sky-800 transition-colors">
          Back to listing
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Report Listing</h1>
        <p className="text-sm text-gray-600 mt-2">
          Submit a report for <span className="font-semibold text-gray-900">{listingTitle}</span>. This page is the frontend sample for the report submission API.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Report submitted successfully. Our moderation team will review it.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Reason</label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            >
              {REASONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Additional details</label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={5}
              placeholder="Explain what is wrong with the listing"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={listingId ? `/listings/${listingId}` : '/listings'} className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-elite-gold px-4 py-2 text-sm font-semibold text-white hover:bg-elite-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateReportPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading report form…</div>}>
      <CreateReportPageContent />
    </Suspense>
  );
}