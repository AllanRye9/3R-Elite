'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', country: 'UAE' as 'UAE' | 'UGANDA' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b">
          <UserAvatar user={user} size="lg" />
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
              user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user.isVerified ? '✓ Verified' : 'Not Verified'}
            </span>
          </div>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">Profile updated successfully!</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value as 'UAE' | 'UGANDA' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="UAE">🇦🇪 UAE</option>
              <option value="UGANDA">🇺🇬 Uganda</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <a href="/profile/listings" className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-semibold">My Listings</p>
        </a>
        <a href="/profile/favorites" className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-3xl mb-2">❤️</p>
          <p className="font-semibold">Favorites</p>
        </a>
      </div>
    </div>
  );
}
