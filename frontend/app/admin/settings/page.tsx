'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Settings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCountry: string;
  itemsPerPage: number;
  maxImagesPerListing: number;
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-sky-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') {
      api.get('/admin/settings')
        .then(({ data }) => setSettings(data))
        .catch(() => setError('Failed to load settings.'))
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;
  if (!settings) return <div className="p-8 text-center text-red-500">{error || 'Failed to load settings.'}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your site configuration</p>

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm font-medium">
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              placeholder="Site name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Country</label>
            <select
              value={settings.defaultCountry}
              onChange={(e) => update('defaultCountry', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="UAE">UAE</option>
              <option value="UGANDA">UGANDA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Settings */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Maintenance Mode</p>
              <p className="text-xs text-gray-400">Take the site offline for maintenance</p>
            </div>
            <ToggleSwitch enabled={settings.maintenanceMode} onChange={(v) => update('maintenanceMode', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Allow Registration</p>
              <p className="text-xs text-gray-400">Allow new users to create accounts</p>
            </div>
            <ToggleSwitch enabled={settings.allowRegistration} onChange={(v) => update('allowRegistration', v)} />
          </div>
        </div>
      </div>

      {/* Content Settings */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
            <input
              type="number"
              min={1}
              value={settings.itemsPerPage}
              onChange={(e) => update('itemsPerPage', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Images Per Listing</label>
            <input
              type="number"
              min={1}
              value={settings.maxImagesPerListing}
              onChange={(e) => update('maxImagesPerListing', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-sky-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
