'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCountry } from '@/context/CountryContext';
import { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
}

const pricePresets = [
  { label: 'Under 65K', min: '', max: '65000' },
  { label: '65K – 270K', min: '65000', max: '270000' },
  { label: '270K – 1M', min: '270000', max: '1000000' },
  { label: 'Over 1M', min: '1000000', max: '' },
];

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

  const updateMultiple = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    newParams.set('page', '1');
    router.push(`/listings?${newParams.toString()}`);
  };

  const currentMin = params.get('priceMin') || '';
  const currentMax = params.get('priceMax') || '';

  const activePricePreset = pricePresets.find(
    (p) => p.min === currentMin && p.max === currentMax
  );

  const content = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-5">
      {/* Close button – mobile only */}
      {onClose && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 md:hidden">
          <h2 className="font-extrabold text-gray-900 text-base">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors interactive"
            aria-label="Close filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header – desktop */}
      <div className="hidden md:flex items-center justify-between pb-3 border-b border-gray-100">
        <h2 className="font-extrabold text-gray-900 text-sm">Filters</h2>
        <button
          onClick={() => { router.push(`/listings?country=${country}`); onClose?.(); }}
          className="text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors interactive"
        >
          Clear all
        </button>
      </div>

      {/* ── Verified Sellers filter ── */}
      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2.5">Trust & Safety</h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={params.get('verified') === 'true'}
              onChange={(e) => update('verified', e.target.checked ? 'true' : '')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-checked:bg-sky-500 rounded-full transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            Verified Sellers Only
          </span>
        </label>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-0">
          See only listings from identity-verified sellers
        </p>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Category</h3>
        <select
          value={params.get('category') || ''}
          onChange={(e) => update('category', e.target.value)}
          className="input-premium text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Location</h3>
        <select
          value={params.get('location') || ''}
          onChange={(e) => update('location', e.target.value)}
          className="input-premium text-sm"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2.5">Condition</h3>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Any' },
            { value: 'NEW', label: '✨ New' },
            { value: 'USED', label: '📦 Used' },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => update('condition', c.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all interactive border ${
                params.get('condition') === c.value || (!params.get('condition') && c.value === '')
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sky-200 hover:text-sky-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Price Range</h3>

        {/* Preset ranges */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {pricePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateMultiple({ priceMin: preset.min, priceMax: preset.max })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all interactive border ${
                activePricePreset?.label === preset.label
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sky-200 hover:text-sky-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Min"
              value={currentMin}
              onChange={(e) => update('priceMin', e.target.value)}
              className="input-premium text-sm pl-2 pr-2"
            />
          </div>
          <span className="flex items-center text-gray-300 font-medium">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Max"
              value={currentMax}
              onChange={(e) => update('priceMax', e.target.value)}
              className="input-premium text-sm pl-2 pr-2"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Sort By</h3>
        <select
          value={params.get('sort') || 'createdAt'}
          onChange={(e) => update('sort', e.target.value)}
          className="input-premium text-sm"
        >
          <option value="createdAt">Most Recent</option>
          <option value="price_asc">Lowest Price</option>
          <option value="price_desc">Highest Price</option>
          <option value="views">Most Popular</option>
        </select>
      </div>

      <button
        onClick={() => { router.push(`/listings?country=${country}`); onClose?.(); }}
        className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors text-center py-2 border border-dashed border-gray-200 rounded-xl hover:border-red-200 interactive"
      >
        🗑️ Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden overflow-y-auto animate-slide-down bg-gray-50">
            <div className="min-h-full p-3">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  );
}

