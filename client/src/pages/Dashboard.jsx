import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, ShoppingBag, User, Plus, Trash2, Edit, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export default function Dashboard() {
  const { user, loading, updateProfile } = useAuth();
  const [tab, setTab] = useState('listings');

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {[
          { key: 'listings', icon: <Package className="h-4 w-4" />, label: 'My Listings' },
          { key: 'orders', icon: <ShoppingBag className="h-4 w-4" />, label: 'My Orders' },
          { key: 'profile', icon: <User className="h-4 w-4" />, label: 'My Profile' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {icon}<span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'listings' && <ListingsTab user={user} />}
      {tab === 'orders' && <OrdersTab />}
      {tab === 'profile' && <ProfileTab user={user} updateProfile={updateProfile} />}
    </div>
  );
}

function ListingsTab({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '1', condition: 'new', categoryId: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/products?sellerId=${user.id}&limit=50`)
      .then((res) => {
        // Filter client-side since backend doesn't have sellerId filter
        // Instead use seller profile endpoint
        return api.get(`/sellers/${user.id}`);
      })
      .then((res) => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      for (const img of images) formData.append('images', img);

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowForm(false);
      setEditProduct(null);
      setForm({ title: '', description: '', price: '', stock: '1', condition: 'new', categoryId: '' });
      setImages([]);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const startEdit = (product) => {
    setEditProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      condition: product.condition,
      categoryId: product.categoryId,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Listings ({products.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditProduct(null); setForm({ title: '', description: '', price: '', stock: '1', condition: 'new', categoryId: '' }); }}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /><span>New Listing</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editProduct ? 'Edit Listing' : 'Create New Listing'}</h3>
            <button onClick={() => { setShowForm(false); setEditProduct(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" min="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100" />
            </div>
            {error && <p className="sm:col-span-2 text-red-600 text-sm">{error}</p>}
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium disabled:opacity-60 transition-colors">
                {submitting ? 'Saving...' : editProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>You haven't listed any products yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center space-x-4">
              <img
                src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/80/80`}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">{product.title}</Link>
                <p className="text-sm text-gray-500">{formatPrice(product.price)} · {product.stock} in stock · {product.condition}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading orders...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">My Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1.5 text-sm">
                    <img src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.productId}/40/40`} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="text-gray-700">{item.product?.title || 'Product'}</span>
                    <span className="text-gray-400">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, updateProfile }) {
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'location', label: 'Location', type: 'text' },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Tell buyers about yourself..."
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Profile updated successfully!</p>}
        <button type="submit" disabled={saving} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
