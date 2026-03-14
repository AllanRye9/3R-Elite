'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async (query: string) => {
    setFetching(true);
    try {
      const params = query ? { search: query } : {};
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') fetchUsers('');
  }, [user, loading, router, fetchUsers]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(search), 300);
    return () => { if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; } };
  }, [search, user, fetchUsers]);

  const toggleBan = async (userId: string, isBanned: boolean) => {
    await api.put(`/admin/users/${userId}`, { isBanned: !isBanned });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: !isBanned } : u));
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    await api.delete(`/admin/users/${userId}`);
    await fetchUsers(search);
  };

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
      <p className="text-gray-500 mb-6">{total} total users</p>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Country</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Joined</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium">{u.name}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500">{u.email}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">{u.country}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>{u.isBanned ? 'Banned' : 'Active'}</span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  {u.role !== 'ADMIN' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleBan(u.id, u.isBanned)}
                        className={`text-xs px-3 py-1.5 rounded font-medium ${
                          u.isBanned ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'
                        } transition-colors`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id, u.name)}
                        className="text-xs px-3 py-1.5 rounded font-medium bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
