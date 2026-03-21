'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import AuthColorBlend from '@/components/ui/AuthColorBlend';

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
    <AuthColorBlend>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/30 dark:border-white/20 bg-white/95 dark:bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="inline-flex rounded-full bg-sky-50 dark:bg-sky-500/20 border border-sky-100 dark:border-sky-300/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
            Account support
          </span>
          <Link href="/auth/login" className="text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-200 transition-colors">
            ← Back to sign in
          </Link>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Forgot password?
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
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
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
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-600 via-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-glow disabled:opacity-60"
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

            <div className="mt-6 flex flex-wrap gap-3" />
          </>
        )}
      </div>
    </AuthColorBlend>
  );
}
