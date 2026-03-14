'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', country: 'UAE' as 'UAE' | 'UGANDA' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) setForm({ name: user.name, phone: user.phone || '', country: user.country });
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      updateUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const [avatarError, setAvatarError] = useState('');

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAvatarError('');
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG, WEBP, or GIF images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const { data: uploadData } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (uploadData.urls && uploadData.urls.length > 0) {
        const { data: userData } = await api.put('/users/me', { avatar: uploadData.urls[0] });
        updateUser(userData);
      }
    } catch {
      setAvatarError('Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarError('');
    setUploadingAvatar(true);
    try {
      const { data: userData } = await api.put('/users/me', { avatar: null });
      updateUser(userData);
    } catch {
      setAvatarError('Failed to remove photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 shimmer rounded-full w-1/3" />
        <div className="bg-white rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shimmer rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-5 shimmer rounded-full w-1/2" />
              <div className="h-4 shimmer rounded-full w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Profile</h1>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-brand-600 to-sky-400" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <div className="ring-4 ring-white rounded-full shadow-lg overflow-hidden">
                <UserAvatar user={user} size="lg" />
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Upload profile photo"
              >
                {uploadingAvatar ? (
                  <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleAvatarUpload(e.target.files)}
              />
              {user.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                  aria-label="Remove profile photo"
                  title="Remove photo"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="pb-1">
              <p className="text-xl font-extrabold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="ml-auto pb-1">
              <span className={`badge text-xs ${user.isVerified ? 'badge-new' : 'bg-amber-100 text-amber-700'}`}>
                {user.isVerified ? '✓ Verified' : '⚡ Unverified'}
              </span>
            </div>
          </div>
          {avatarError && (
            <p className="text-xs text-red-500 mt-2">{avatarError}</p>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit Profile
        </h2>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3.5 text-sm mb-4 animate-scale-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+971 50 000 0000"
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value as 'UAE' | 'UGANDA' })}
              className="input-premium"
            >
              <option value="UAE">🇦🇪 UAE</option>
              <option value="UGANDA">🇺🇬 Uganda</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/profile/listings', icon: '📋', label: 'My Listings', desc: 'Manage your ads' },
          { href: '/profile/favorites', icon: '❤️', label: 'Favorites', desc: 'Saved items' },
          { href: '/messages', icon: '💬', label: 'Messages', desc: 'Chat with buyers' },
          { href: '/listings/create', icon: '➕', label: 'Post Ad', desc: 'Sell something' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-sky-200 hover:shadow-md transition-all group interactive"
          >
            <p className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">{item.icon}</p>
            <p className="font-bold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
