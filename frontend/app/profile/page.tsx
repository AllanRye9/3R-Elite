'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import AvatarCropper from '@/components/ui/AvatarCropper';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ListingSummary {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  images: string[];
  createdAt: string;
}

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', country: 'UAE' as import('@/lib/types').Country });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [myListings, setMyListings] = useState<ListingSummary[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      setForm({ name: user.name, phone: user.phone || '', country: user.country });
      setListingsLoading(true);
      api.get('/listings?limit=6&sort=createdAt&mine=true')
        .then(({ data }) => setMyListings(data.listings || []))
        .catch(() => setMyListings([]))
        .finally(() => setListingsLoading(false));
    }
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
    // Show cropper with the selected image
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedUpload = async (blob: Blob) => {
    setCropSrc(null);
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('images', blob, 'avatar.jpg');
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
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
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
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-elite-navy text-white text-sm font-semibold rounded-xl hover:bg-elite-charcoal transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Visit Marketplace
        </Link>
      </div>

      {/* Avatar cropper modal */}
      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onCropComplete={handleCroppedUpload}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {/* Banner with gold gradient */}
        <div className="h-24 bg-gradient-to-r from-elite-navy via-[#0369a1] to-elite-gold" />
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
            <div className="relative group">
              <div className="ring-4 ring-white rounded-full shadow-lg overflow-hidden w-24 h-24 border-2 border-elite-gold/30">
                <UserAvatar user={user} size="lg" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleAvatarUpload(e.target.files)}
              />
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <p className="text-xl font-extrabold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-semibold hover:bg-[#0284c7] transition-colors disabled:opacity-50"
                  aria-label="Upload profile photo"
                >
                  {uploadingAvatar ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                  Upload Photo
                </button>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Remove profile photo"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="sm:ml-auto pb-1">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
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
              onChange={(e) => setForm({ ...form, country: e.target.value as import('@/lib/types').Country })}
              className="input-premium"
            >
              <option value="UAE">🇦🇪 UAE</option>
              <option value="UGANDA">🇺🇬 Uganda</option>
              <option value="KENYA">🇰🇪 Kenya</option>
              <option value="CHINA">🇨🇳 China</option>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/profile/listings', icon: '📋', label: 'My Listings', desc: 'Manage your ads', accent: 'border-sky-200 hover:border-[#0EA5E9]' },
          { href: '/profile/favorites', icon: '❤️', label: 'Favorites', desc: 'Saved items', accent: 'border-pink-200 hover:border-pink-400' },
          { href: '/messages', icon: '💬', label: 'Messages', desc: 'Chat with buyers', accent: 'border-green-200 hover:border-green-400' },
          { href: '/listings/create', icon: '➕', label: 'Post Ad', desc: 'Sell something', accent: 'border-elite-gold/40 hover:border-elite-gold' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bg-white rounded-2xl border ${item.accent} p-4 hover:shadow-md transition-all group interactive`}
          >
            <p className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">{item.icon}</p>
            <p className="font-bold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* My Listed Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-elite-gold rounded-full inline-block" />
            My Listed Items
          </h2>
          <Link
            href="/profile/listings"
            className="text-xs font-semibold text-elite-navy hover:text-elite-charcoal flex items-center gap-1 transition-colors"
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-2 shimmer" />
                <div className="h-3 bg-gray-100 rounded shimmer mb-1" />
                <div className="h-3 bg-gray-100 rounded shimmer w-2/3" />
              </div>
            ))}
          </div>
        ) : myListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {myListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="group block">
                <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100 mb-2">
                  {listing.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🖼️</div>
                  )}
                  <span className={`absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 line-clamp-1">{listing.title}</p>
                <p className="text-xs text-elite-charcoal font-semibold">{listing.currency} {listing.price?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-14 h-14 bg-elite-gold/10 rounded-full flex items-center justify-center text-3xl mb-3">📦</div>
            <p className="font-semibold text-gray-700 mb-1">No listings yet</p>
            <p className="text-xs text-gray-400 mb-4">Start selling on 3R Elite marketplace</p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-elite-navy text-white text-xs font-bold rounded-xl hover:bg-elite-charcoal transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Post Your First Ad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
