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
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/listings?category=${cat.slug}&country=${country}`}
          className="flex flex-col items-center gap-0.5 p-2 bg-white rounded hover:bg-sky-50 hover:border-sky-300 border border-gray-100 transition-colors group text-center"
        >
          <span className="text-xl">{cat.icon || '📦'}</span>
          <span className="text-[10px] text-gray-600 group-hover:text-sky-600 font-medium leading-tight">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
