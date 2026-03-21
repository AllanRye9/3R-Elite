'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-12 sm:py-16 min-h-screen">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Account support
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-elite-navy sm:text-4xl">
          Forgot your password?
        </h1>

        {submitted ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-base font-semibold text-emerald-800 mb-2">Check your inbox!</p>
              <p className="text-sm text-emerald-700 leading-relaxed">
                If <span className="font-semibold">{email}</span> is registered, you&apos;ll receive a password reset link shortly.
              </p>
            </div>
            <p className="mt-6 text-sm text-slate-500 text-center">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-sky-600 hover:text-sky-700 font-semibold"
              >
                try again
              </button>
              .
            </p>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <p>Still having trouble? Email us at{' '}
                <a href="mailto:support@3relite.com" className="text-sky-600 font-semibold hover:underline">
                  support@3relite.com
                </a>
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Enter the email address tied to your account and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-elite-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                Prefer manual support? Email us at{' '}
                <a href="mailto:support@3relite.com?subject=Password%20reset%20help" className="text-sky-600 font-semibold hover:underline">
                  support@3relite.com
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
