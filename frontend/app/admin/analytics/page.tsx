'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface GrowthPoint {
  date: string;
  count: number;
}

interface CategoryCount {
  name: string;
  count: number;
}

interface RevenueCategory {
  name: string;
  total: number;
}

interface AnalyticsData {
  userGrowth: GrowthPoint[];
  listingGrowth: GrowthPoint[];
  topCategories: CategoryCount[];
  listingsByCountry: Record<string, number>;
  revenueByCategory: RevenueCategory[];
}

function BarChart({
  data,
  label,
  color,
}: {
  data: GrowthPoint[];
  label: string;
  color: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{label}</h2>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-1 min-w-[400px] h-48">
          {data.map((point, i) => (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="text-[10px] text-gray-500 mb-1">
                {point.count > 0 ? point.count : ''}
              </span>
              <div
                className={`w-full rounded-t ${color} min-h-[2px]`}
                style={{
                  height: `${(point.count / maxCount) * 100}%`,
                }}
              />
              {i % 5 === 0 ? (
                <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-[10px] mt-1">&nbsp;</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({
  items,
  label,
  color,
  formatValue,
}: {
  items: { name: string; value: number }[];
  label: string;
  color: string;
  formatValue?: (v: number) => string;
}) {
  const maxVal = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{label}</h2>
      <div className="overflow-y-auto max-h-72 space-y-3">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{item.name}</span>
              <span className="text-gray-500">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`${color} h-2.5 rounded-full transition-all`}
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/auth/login');
      return;
    }
    if (user?.role === 'ADMIN') {
      api
        .get('/admin/analytics')
        .then(({ data }) => setData(data))
        .catch(() => setError('Failed to load analytics data.'))
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return <div className="p-8 text-center text-gray-500">Loading…</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || 'No data available.'}</div>;
  }

  const countryEntries = Object.entries(data.listingsByCountry);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={data.userGrowth.slice(-30)}
          label="User Growth (Last 30 Days)"
          color="bg-sky-500"
        />
        <BarChart
          data={data.listingGrowth.slice(-30)}
          label="Listing Growth (Last 30 Days)"
          color="bg-emerald-500"
        />
      </div>

      {/* Categories & Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          items={data.topCategories.map((c) => ({ name: c.name, value: c.count }))}
          label="Top Categories"
          color="bg-sky-500"
        />

        {/* Listings by Country */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Listings by Country
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            {countryEntries.map(([country, count]) => (
              <div
                key={country}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 mt-1">{country}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Category */}
      <HorizontalBarChart
        items={data.revenueByCategory.map((r) => ({ name: r.name, value: r.total }))}
        label="Revenue by Category"
        color="bg-amber-500"
        formatValue={(v) =>
          v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
        }
      />
    </div>
  );
}
