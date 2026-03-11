'use client';

import Link from 'next/link';
import { useCountry } from '@/context/CountryContext';
import { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

export function CategoryNav({ categories }: Props) {
  const { country } = useCountry();

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/listings?category=${cat.slug}&country=${country}`}
          className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg hover:bg-orange-50 hover:border-orange-300 border border-gray-100 transition-colors group text-center"
        >
          <span className="text-2xl">{cat.icon || '📦'}</span>
          <span className="text-xs text-gray-600 group-hover:text-orange-600 font-medium leading-tight">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
