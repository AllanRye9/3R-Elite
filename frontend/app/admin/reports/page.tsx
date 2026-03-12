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

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Reporter</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Listing</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Reason</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{r.reporter.name} <span className="text-gray-400">({r.reporter.email})</span></td>
                  <td className="px-6 py-4">
                    <Link href={`/listings/${r.listing.id}`} className="hover:text-orange-600">{r.listing.title}</Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.reason}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
