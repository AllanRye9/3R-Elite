'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
  listing: { id: string; title: string };
}

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') {
      api.get('/admin/reports')
        .then(({ data }) => setReports(data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  const dismissReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to dismiss this report?')) return;
    try {
      await api.delete(`/admin/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      // silently ignore
    }
  };

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">{reports.length} total reports</p>
        </div>
      </div>
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-500">No reports to review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Reporter</th>
                <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Listing</th>
                <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Reason</th>
                <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">{r.reporter.name} <span className="text-gray-400">({r.reporter.email})</span></td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <Link href={`/listings/${r.listing.id}`} className="hover:text-sky-600">{r.listing.title}</Link>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 max-w-[150px] sm:max-w-[300px] truncate">{r.reason}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500">{formatDate(r.createdAt)}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      onClick={() => dismissReport(r.id)}
                      className="text-xs px-3 py-1.5 rounded font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
