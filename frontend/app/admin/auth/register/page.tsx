'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuthSession } from '@/lib/authStorage';
import { useAuth } from '@/context/AuthContext';
import type { Country } from '@/lib/types';

export default function AdminRegisterPage() {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    adminSecret: '',
    country: 'UAE' as Country,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!form.adminSecret) {
      setError('Admin secret is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-register', {
        email: form.email,
        password: form.password,
        name: form.name,
        adminSecret: form.adminSecret,
        country: form.country,
      });
      setAuthSession(data.accessToken, data.refreshToken);
      updateUser(data.user);
      router.push('/admin');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🛡️</p>
          <h1 className="text-2xl font-bold text-gray-900">Admin Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new administrator account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value as Country })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            >
              <option value="UAE">🇦🇪 United Arab Emirates</option>
              <option value="UGANDA">🇺🇬 Uganda</option>
              <option value="KENYA">🇰🇪 Kenya</option>
              <option value="CHINA">🇨🇳 China</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Secret</label>
            <input
              type="password"
              value={form.adminSecret}
              onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
              required
              placeholder="Provided by system administrator"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
            <p className="text-xs text-gray-400 mt-1">Contact the system administrator for the admin secret key.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p>
            Already have an admin account?{' '}
            <Link href="/admin/auth/login" className="text-gray-900 hover:underline font-medium">
              Sign in
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
