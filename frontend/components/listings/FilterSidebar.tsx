'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCountry } from '@/context/CountryContext';
import { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({ categories, isOpen = false, onClose }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { country, locations } = useCountry();

  const update = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    router.push(`/listings?${newParams.toString()}`);
  };

  const content = (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-5">
      {/* Close button – mobile only */}
      {onClose && (
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 md:hidden">
          <h2 className="font-bold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
        <select
          value={params.get('category') || ''}
          onChange={(e) => update('category', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
        <select
          value={params.get('location') || ''}
          onChange={(e) => update('location', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Condition</h3>
        <div className="space-y-1">
          {['', 'NEW', 'USED'].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={c}
                checked={params.get('condition') === c || (!params.get('condition') && c === '')}
                onChange={() => update('condition', c)}
                className="accent-sky-500"
              />
              {c === '' ? 'Any' : c === 'NEW' ? 'New' : 'Used'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={params.get('priceMin') || ''}
            onChange={(e) => update('priceMin', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={params.get('priceMax') || ''}
            onChange={(e) => update('priceMax', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Sort By</h3>
        <select
          value={params.get('sort') || 'createdAt'}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="createdAt">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="views">Most Popular</option>
        </select>
      </div>

      <button
        onClick={() => { router.push(`/listings?country=${country}`); onClose?.(); }}
        className="w-full text-sm text-gray-500 hover:text-sky-600 underline text-center"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden overflow-y-auto">
            <div className="min-h-full p-4">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  );
}
