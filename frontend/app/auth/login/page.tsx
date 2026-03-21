'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import AuthColorBlend from '@/components/ui/AuthColorBlend';

function LoginForm() {
  const { login, user, loading: authLoading } = useAuth();
  const { success } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams ? searchParams.get('redirect') || '/' : '/';
  const submitLockRef = useRef(false);
  const toastShownRef = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === 'ADMIN' ? '/admin' : redirect);
    }
  }, [user, authLoading, router, redirect]);

  useEffect(() => {
    if (!searchParams || toastShownRef.current || searchParams.get('registered') !== '1') return;

    toastShownRef.current = true;
    success('Successfully registered. Please sign in to continue.');

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('registered');
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `/auth/login?${nextQuery}` : '/auth/login');
  }, [router, searchParams, success]);

  // Don't render the form while auth state is loading or user is already authenticated
  if (authLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || submitLockRef.current) return;

    submitLockRef.current = true;
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        // Admin accounts must use the dedicated admin portal
        setError('Admin accounts must sign in via the Admin Portal. Redirecting…');
        setTimeout(() => router.push('/admin/auth/login'), 1500);
        return;
      }
      router.push(redirect);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      setError(
        axiosErr.response?.status === 429
          ? 'Too many sign-in attempts. Wait a short moment before trying again.'
          : axiosErr.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  return (
    <AuthColorBlend className="flex items-center justify-center">
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-white/30 dark:border-white/20 bg-white/95 dark:bg-slate-900/85 shadow-2xl backdrop-blur-xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <Link href="/" className="w-11 h-11 bg-gradient-to-br from-fuchsia-500 via-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow hover:scale-105 transition-transform" aria-label="Go to homepage">
              <span className="text-white font-black text-lg">3R</span>
            </Link>
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-200 bg-sky-50 dark:bg-sky-500/20 border border-sky-100 dark:border-sky-300/20 rounded-full px-2.5 py-1">Secure sign in</span>
          </div>

          <h1 className="text-[1.65rem] leading-tight font-extrabold text-slate-950 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign in to continue to your account.</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm mb-5 animate-scale-in">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-premium"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-premium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 interactive transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-sky-600 to-indigo-600 text-white text-sm font-bold shadow-glow hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
              Create one free →
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-white/95">
          <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1">🔒 Secure</span>
          <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1">🛡️ Protected</span>
        </div>
      </div>
    </AuthColorBlend>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md animate-pulse">
          <div className="bg-white rounded-2xl p-8 space-y-4">
            <div className="h-12 w-12 shimmer rounded-2xl mx-auto" />
            <div className="h-8 shimmer rounded-full w-2/3 mx-auto" />
            <div className="h-10 shimmer rounded-xl" />
            <div className="h-10 shimmer rounded-xl" />
            <div className="h-12 shimmer rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
