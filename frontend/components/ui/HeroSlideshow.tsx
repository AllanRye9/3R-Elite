'use client';

import { useState, useEffect, useCallback } from 'react';

interface Slide {
  gradient: string;
  alt: string;
}

const defaultSlides: Slide[] = [
  {
    gradient: 'from-brand-900 via-brand-700 to-sky-600',
    alt: 'Online shopping marketplace',
  },
  {
    gradient: 'from-indigo-900 via-brand-800 to-brand-600',
    alt: 'Shop storefront',
  },
  {
    gradient: 'from-brand-900 via-sky-800 to-indigo-700',
    alt: 'Marketplace trading',
  },
  {
    gradient: 'from-sky-900 via-brand-700 to-brand-800',
    alt: 'Ecommerce deals',
  },
  {
    gradient: 'from-brand-800 via-indigo-800 to-sky-700',
    alt: 'Shopping bags and products',
  },
];

interface HeroSlideshowProps {
  slides?: Slide[];
  interval?: number;
}

export default function HeroSlideshow({ slides = defaultSlides, interval = 3000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden" role="presentation">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ease-in-out`}
          style={{ opacity: i === current ? 1 : 0 }}
          aria-label={slide.alt}
        />
      ))}
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Slide indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
