'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Slide {
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    title: 'Electronics & Gadgets',
    subtitle: 'Latest phones, laptops & accessories at great prices',
    href: '/listings?q=electronics',
    gradient: 'from-indigo-500 to-purple-600',
    emoji: '📱',
  },
  {
    title: 'Vehicles & Motors',
    subtitle: 'Cars, bikes & parts across UAE & Uganda',
    href: '/listings?q=vehicles',
    gradient: 'from-red-500 to-orange-500',
    emoji: '🚗',
  },
  {
    title: 'Real Estate',
    subtitle: 'Apartments, houses & land for sale or rent',
    href: '/listings?q=real+estate',
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '🏠',
  },
  {
    title: 'Fashion & Beauty',
    subtitle: 'Trending clothing, shoes & beauty products',
    href: '/listings?q=fashion',
    gradient: 'from-pink-500 to-rose-500',
    emoji: '👗',
  },
  {
    title: 'Home & Garden',
    subtitle: 'Furniture, appliances & home essentials',
    href: '/listings?q=home',
    gradient: 'from-amber-500 to-yellow-500',
    emoji: '🛋️',
  },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full max-w-2xl mx-auto mt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={slide.href} className="block">
        <div
          className={`bg-gradient-to-r ${slide.gradient} rounded-lg p-6 text-white text-center transition-all duration-500 ease-in-out cursor-pointer hover:opacity-90`}
        >
          <div className="text-4xl mb-2">{slide.emoji}</div>
          <h3 className="text-lg font-bold">{slide.title}</h3>
          <p className="text-sm opacity-90">{slide.subtitle}</p>
        </div>
      </Link>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
