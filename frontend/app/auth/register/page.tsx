'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Country } from '@/lib/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', country: 'UAE' as Country,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      router.push('/profile');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Array<{ msg: string }> } } };
      setError(
        axiosErr.response?.data?.errors?.[0]?.msg ||
        axiosErr.response?.data?.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[70vh] overflow-hidden px-4 py-10 sm:py-14">
      <div className="absolute inset-0 bg-gradient-to-br from-elite-navy via-sky-500 to-sky-300 opacity-90" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-white/30 bg-white/96 shadow-2xl backdrop-blur p-7 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Link href="/" className="w-12 h-12 bg-gradient-to-br from-sky-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-glow hover:scale-105 transition-transform" aria-label="Go to homepage">
              <span className="text-white font-black text-lg">3R</span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-950 mb-1 text-center">Create Account</h1>
          <p className="text-sm text-slate-600 text-center mb-5">Join thousands of buyers and sellers</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm mb-4 animate-scale-in">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Phone <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+971 50 000 0000"
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Country <span className="text-red-500">*</span></label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value as Country })}
                className="input-premium"
              >
                <option value="UAE">🇦🇪 United Arab Emirates</option>
                <option value="UGANDA">🇺🇬 Uganda</option>
                <option value="KENYA">🇰🇪 Kenya</option>
                <option value="CHINA">🇨🇳 China</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-bold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                </span>
              ) : 'Create Free Account'}
            </button>

            <p className="text-center text-xs text-slate-500 mt-1">
              By registering, you agree to our{' '}
              <Link href="/terms" className="text-sky-600 hover:underline">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
            </p>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-500 font-medium">OR</span></div>
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/90">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">🆓 Free to Register</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">🔒 Secure & Private</span>
        </div>
      </div>
    </div>
  );
}

