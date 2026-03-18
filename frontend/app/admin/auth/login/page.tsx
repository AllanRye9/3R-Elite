'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuthSession } from '@/lib/authStorage';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [user, authLoading, router]);

  if (authLoading || user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading...</span>
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" aria-hidden="true" />
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
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user?.role !== 'ADMIN') {
        setError('This account does not have admin access. Regular users should sign in at /auth/login.');
        return;
      }
      setAuthSession(data.accessToken, data.refreshToken);
      updateUser(data.user);
      router.push('/admin');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      setError(
        axiosErr.response?.status === 429
          ? 'Too many sign-in attempts. Please wait a few minutes before trying again.'
          : axiosErr.response?.data?.message || 'Login failed'
      );
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🛡️</p>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your administrator account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p>
            Need an admin account?{' '}
            <Link href="/admin/auth/register" className="text-gray-900 hover:underline font-medium">
              Register
            </Link>
          </p>
          <p>
            <Link href="/" className="text-gray-400 hover:underline">
              ← Back to marketplace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
