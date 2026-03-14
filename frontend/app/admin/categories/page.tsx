'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  _count: { listings: number };
}

interface CategoryForm {
  name: string;
  slug: string;
  icon: string;
  parentId: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', icon: '', parentId: '' };

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<CategoryForm>(emptyForm);
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/admin/auth/login');
    if (user?.role === 'ADMIN') {
      fetchCategories();
    }
  }, [user, loading, router]);

  const fetchCategories = () => {
    setFetching(true);
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  const parentName = (parentId: string | null) => {
    if (!parentId) return '—';
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : '—';
  };

  // Add form handlers
  const handleAddNameChange = (name: string) => {
    setAddForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const handleAddSubmit = async () => {
    if (!addForm.name.trim() || !addForm.slug.trim()) return;
    setAddLoading(true);
    try {
      const body: Record<string, string> = { name: addForm.name, slug: addForm.slug };
      if (addForm.icon.trim()) body.icon = addForm.icon.trim();
      if (addForm.parentId) body.parentId = addForm.parentId;
      await api.post('/admin/categories', body);
      setAddForm(emptyForm);
      setShowAddForm(false);
      fetchCategories();
    } catch {
      /* silently handled */
    } finally {
      setAddLoading(false);
    }
  };

  // Edit handlers
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon ?? '',
      parentId: cat.parentId ?? '',
    });
  };

  const handleEditNameChange = (name: string) => {
    setEditForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const handleEditSubmit = async () => {
    if (!editingId || !editForm.name.trim() || !editForm.slug.trim()) return;
    setEditLoading(true);
    try {
      const body: Record<string, string | null> = { name: editForm.name, slug: editForm.slug };
      body.icon = editForm.icon.trim() || null;
      body.parentId = editForm.parentId || null;
      await api.put(`/admin/categories/${editingId}`, body);
      setEditingId(null);
      fetchCategories();
    } catch {
      /* silently handled */
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      /* silently handled */
    }
  };

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-500">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setAddForm(emptyForm); }}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => handleAddNameChange(e.target.value)}
                placeholder="Category name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={addForm.slug}
                onChange={(e) => setAddForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="category-slug"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={addForm.icon}
                onChange={(e) => setAddForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="🏷️"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                value={addForm.parentId}
                onChange={(e) => setAddForm((prev) => ({ ...prev, parentId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddSubmit}
              disabled={addLoading || !addForm.name.trim()}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addLoading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Icon</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Parent</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Listings</th>
              <th className="text-left px-3 sm:px-6 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No categories found. Add one to get started.
                </td>
              </tr>
            )}
            {categories.map((cat) =>
              editingId === cat.id ? (
                <tr key={cat.id} className="bg-sky-50">
                  <td className="px-3 sm:px-6 py-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditNameChange(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, icon: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <select
                      value={editForm.parentId}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, parentId: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">None</option>
                      {categories.filter((c) => c.id !== cat.id).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-gray-500">{cat._count.listings}</td>
                  <td className="px-3 sm:px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditSubmit}
                        disabled={editLoading || !editForm.name.trim()}
                        className="text-xs px-3 py-1.5 rounded font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1.5 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium">{cat.name}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">{cat.icon ?? '—'}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500">{parentName(cat.parentId)}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {cat._count.listings}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-xs px-3 py-1.5 rounded font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-xs px-3 py-1.5 rounded font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
