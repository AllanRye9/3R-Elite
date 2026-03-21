'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center mt-6">
        <p className="text-base font-semibold text-red-800 mb-2">Invalid reset link</p>
        <p className="text-sm text-red-700">
          Please use the link from the password reset email, or{' '}
          <Link href="/auth/forgot-password" className="font-semibold underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      {success ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center mt-6">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-base font-semibold text-emerald-800 mb-2">Password updated!</p>
          <p className="text-sm text-emerald-700">
            Redirecting you to sign in…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= i * 2
                      ? form.password.length < 6 ? 'bg-amber-400' : 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`} />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Confirm new password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-elite-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? 'Updating password…' : 'Set new password'}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          ← Back to sign in
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-12 sm:py-16 min-h-screen">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Account security
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-elite-navy sm:text-4xl">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter a new password for your account below.
        </p>
        <Suspense fallback={<div className="mt-6 text-slate-500 text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
