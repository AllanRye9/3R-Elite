'use client';

import Link from 'next/link';

const categories = [
  'Phones',
  'Electronics',
  'Vehicles',
  'Fashion',
  'Home & Garden',
  'Computing',
  'Health & Beauty',
  'Sports',
  'Baby Products',
  'Gaming',
  'Books',
  'Services',
];

export default function CategoryPills() {
  return (
    <nav aria-label="Product categories" className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/listings?q=${encodeURIComponent(cat.toLowerCase())}`}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-[#90D5FF] hover:text-white hover:border-[#90D5FF] transition-all interactive"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
