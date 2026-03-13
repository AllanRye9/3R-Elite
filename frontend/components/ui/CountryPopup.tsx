'use client';

import type { Country } from '@/lib/types';

interface Props {
  onSelect: (country: Country) => void;
}

export function CountryPopup({ onSelect }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Select Your Country</h2>
        <p className="text-sm text-gray-500 mb-5">
          We couldn&apos;t detect your location automatically. Please choose your country.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect('UAE')}
            className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <span className="text-xl">🇦🇪</span> United Arab Emirates
          </button>
          <button
            onClick={() => onSelect('UGANDA')}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-yellow-600 transition-colors"
          >
            <span className="text-xl">🇺🇬</span> Uganda
          </button>
        </div>
      </div>
    </div>
  );
}
