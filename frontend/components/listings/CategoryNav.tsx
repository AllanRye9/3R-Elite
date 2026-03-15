'use client';

import Link from 'next/link';
import { useCountry } from '@/context/CountryContext';
import { Category } from '@/lib/types';
import { useRef, useEffect } from 'react';

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
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;
    let animationId: number;
    let start: number | null = null;
    const scrollWidth = marquee.scrollWidth;
    let x = 0;
    const speed = 40; // px per second

    function step(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      x = (elapsed / 1000) * speed;
      if (x > scrollWidth) {
        start = ts;
        x = 0;
      }
      if (marquee) marquee.scrollLeft = x;
      animationId = requestAnimationFrame(step);
    }
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [categories]);

  // Duplicate categories for seamless loop
  const marqueeCategories = [...categories, ...categories];

  return (
    <div className="relative w-full overflow-x-hidden py-2 bg-gradient-to-r from-elite-navy/5 to-elite-gold/5 rounded-xl border border-elite-gold/10 shadow-sm">
      <div ref={marqueeRef} className="flex gap-3 min-w-full whitespace-nowrap overflow-x-scroll no-scrollbar animate-none" style={{scrollBehavior:'auto'}}>
        {marqueeCategories.map((cat, i) => (
          <Link
            key={cat.id + '-' + i}
            href={`/listings?category=${cat.slug}&country=${country}`}
            className="group flex flex-col items-center gap-1 xs:gap-1.5 p-1.5 xs:p-2 sm:p-3 rounded-lg xs:rounded-xl hover:bg-white border border-transparent hover:border-sky-100 hover:shadow-sm transition-all duration-200 interactive min-w-[80px] sm:min-w-[100px]"
          >
            <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-lg xs:rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200`}>
              <span className="text-base xs:text-lg sm:text-xl" aria-hidden="true">{cat.icon || '📦'}</span>
            </div>
            <span className="text-[10px] xs:text-xs sm:text-sm text-gray-700 group-hover:text-elite-gold font-semibold leading-tight text-center line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      {/* Animated gradient overlay for effect */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white/80 to-transparent z-10" />
    </div>
  );
}

