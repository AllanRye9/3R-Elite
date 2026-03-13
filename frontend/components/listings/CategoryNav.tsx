'use client';

import Link from 'next/link';
import { useCountry } from '@/context/CountryContext';
import { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

// Assign gradient colors to categories by index
const gradients = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-violet-400 to-purple-600',
  'from-sky-400 to-cyan-500',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-purple-500',
  'from-teal-400 to-emerald-600',
  'from-red-400 to-rose-600',
  'from-indigo-400 to-blue-600',
];

export function CategoryNav({ categories }: Props) {
  const { country } = useCountry();

  return (
    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 xs:gap-2 sm:gap-3">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/listings?category=${cat.slug}&country=${country}`}
          className="group flex flex-col items-center gap-1 xs:gap-1.5 p-1.5 xs:p-2 sm:p-3 rounded-lg xs:rounded-xl hover:bg-white border border-transparent hover:border-sky-100 hover:shadow-sm transition-all duration-200 interactive"
        >
          <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-lg xs:rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200`}>
            <span className="text-base xs:text-lg sm:text-xl" aria-hidden="true">{cat.icon || '📦'}</span>
          </div>
          <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 group-hover:text-sky-700 font-semibold leading-tight text-center line-clamp-2">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

