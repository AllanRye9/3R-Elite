'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import CategoryPicker from '@/components/ui/CategoryPicker';

function getCategoryLabel(categories: Category[], id: string): string {
  for (const category of categories) {
    if (category.id === id) return category.name;
    if (category.children) {
      for (const child of category.children) {
        if (child.id === id) return `${category.name} / ${child.name}`;
      }
    }
  }
  return '';
}

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const { country, locations, currency } = useCountry();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [pendingImageIds, setPendingImageIds] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'USED',
    location: '',
    categoryId: '',
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const selectedCategoryLabel = getCategoryLabel(categories, form.categoryId);
  const featuredCategories = categories.slice(0, 6);

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Show local previews immediately (blob URLs – no server round trip needed)
    const newPreviews: string[] = [];
    for (const file of Array.from(files)) {
      newPreviews.push(URL.createObjectURL(file));
    }
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Upload to server; receive imageIds for pending moderation records.
    setUploadingImages(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append('images', file);
      }
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const ids: string[] = data.imageIds || [];
      setPendingImageIds((prev) => [...prev, ...ids]);
      setUploadedCount((prev) => prev + ids.length);
    } catch {
      setError('Image upload failed. Please try again.');
      setImagePreviews((prev) => prev.slice(0, prev.length - newPreviews.length));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setPendingImageIds((prev) => prev.filter((_, i) => i !== index));
    if (uploadedCount > 0) setUploadedCount((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.price || !form.location || !form.categoryId) {
      setError('Please fill in all required fields');
      return;
    }
    if (uploadingImages) {
      setError('Please wait for images to finish uploading');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/listings', {
        ...form,
        price: parseFloat(form.price),
        country,
        currency,
        imageIds: pendingImageIds,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-elite-navy via-sky-600 to-sky-400 text-white shadow-xl">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Seller Access
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Post products after you sign in</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              Sign in or create an account to publish products, attach images, and place each item in its correct category for UAE and Uganda buyers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth/login?redirect=/listings/create"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-elite-navy transition-colors hover:bg-sky-50"
              >
                Sign In to Post
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your listing is now <span className="font-semibold text-amber-600">pending review</span>. An admin will review and approve it shortly before it goes live.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/profile/listings"
              className="px-4 py-2 text-sm font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
            >
              My Listings
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-elite-navy via-sky-600 to-sky-400 px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              Product Publishing
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Post your product in the right category</h1>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              Signed in as <span className="font-semibold text-white">{user.name}</span>. Your product will be saved under the category you choose and reviewed before it goes live.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Market</p>
              <p className="mt-2 text-lg font-bold">{country === 'UAE' ? 'United Arab Emirates' : 'Uganda'}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Currency</p>
              <p className="mt-2 text-lg font-bold">{currency}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Category</p>
              <p className="mt-2 text-sm font-semibold text-white">{selectedCategoryLabel || 'Choose one below'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.75fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm sm:p-7">
            {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Product details</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Tell buyers what you are selling</h2>
              <p className="mt-1 text-sm text-slate-500">Use a clear title, complete description, and the correct category so the product appears where buyers expect it.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  placeholder="Describe brand, model, condition, warranty, accessories, and any details a buyer should know."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Category and pricing</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Place the product where it belongs</h2>
            </div>

            <div className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {featuredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setForm({ ...form, categoryId: category.id })}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${form.categoryId === category.id ? 'border-sky-400 bg-sky-50 text-sky-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-sky-200 hover:bg-sky-50/60'}`}
                >
                  <p className="text-sm font-semibold">{category.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{category.children?.length ? `${category.children.length} subcategories` : 'Post directly here'}</p>
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                <CategoryPicker
                  categories={categories}
                  value={form.categoryId}
                  onChange={(id) => setForm({ ...form, categoryId: id })}
                />
                {selectedCategoryLabel && (
                  <p className="mt-2 text-xs font-medium text-sky-700">This product will be listed under: {selectedCategoryLabel}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price ({currency}) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Condition *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="USED">Used</option>
                    <option value="NEW">New</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Media</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Add product photos</h2>
              <p className="mt-1 text-sm text-slate-500">Upload up to 10 images. Photos are reviewed before appearing publicly.</p>
            </div>

            {uploadedCount > 0 && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">{uploadedCount} image{uploadedCount !== 1 ? 's' : ''} received</span> and attached to this product draft.
                </p>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200">
                    <Image
                      src={src}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-80 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="rounded-2xl border-2 border-dashed border-gray-300 p-5 text-center transition-colors hover:border-sky-400"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImages ? (
                <p className="text-sm text-gray-500">Uploading...</p>
              ) : (
                <>
                  <p className="mb-1 text-3xl">📷</p>
                  <p className="text-sm font-medium text-gray-700">Click to upload product photos</p>
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG, GIF up to 10 MB each</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />
          </section>

          <button
            type="submit"
            disabled={submitting || uploadingImages}
            className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Product'}
          </button>
        </form>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Publishing checklist</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-xl bg-slate-50 px-4 py-3">Choose the most accurate category before publishing.</li>
              <li className="rounded-xl bg-slate-50 px-4 py-3">Add a clear title with brand, model, or product type.</li>
              <li className="rounded-xl bg-slate-50 px-4 py-3">Include photos that match the item you are selling.</li>
              <li className="rounded-xl bg-slate-50 px-4 py-3">Products are submitted for review with status set to pending.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Posting summary</p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Seller</p>
                <p className="mt-1 font-semibold text-slate-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Selected category</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedCategoryLabel || 'No category selected yet'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Location</p>
                <p className="mt-1 font-semibold text-slate-900">{form.location || 'Choose a location'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Images attached</p>
                <p className="mt-1 font-semibold text-slate-900">{pendingImageIds.length}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
