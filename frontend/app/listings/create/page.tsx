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
    if (!loading && !user) router.push('/auth/login?redirect=/listings/create');
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, [user, loading, router]);

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
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-8">Post a Listing</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. iPhone 15 Pro Max 256GB"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Describe your item in detail..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency}) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="USED">Used</option>
              <option value="NEW">New</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <CategoryPicker
            categories={categories}
            value={form.categoryId}
            onChange={(id) => setForm({ ...form, categoryId: id })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
          <p className="text-xs text-gray-500 mb-3">Upload up to 10 images. JPEG, PNG, or GIF. Max 10 MB each.</p>

          {/* Uploaded count notice */}
          {uploadedCount > 0 && (
            <div className="flex items-start gap-2 mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-700">
                <span className="font-semibold">{uploadedCount} image{uploadedCount !== 1 ? 's' : ''} received</span> — awaiting admin approval before becoming publicly visible.
              </p>
            </div>
          )}

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
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
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-sky-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingImages ? (
              <p className="text-sm text-gray-500">Uploading...</p>
            ) : (
              <>
                <p className="text-3xl mb-1">📷</p>
                <p className="text-sm text-gray-600 font-medium">Click to upload photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10 MB</p>
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
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingImages}
          className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}
