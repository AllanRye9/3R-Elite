'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Slide {
  image: string;
  alt: string;
}

const defaultSlides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
    alt: 'Online shopping marketplace',
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
    alt: 'Shop storefront',
  },
  {
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop',
    alt: 'Marketplace trading',
  },
  {
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop',
    alt: 'Ecommerce deals',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop',
    alt: 'Shopping bags and products',
  },
];

interface HeroSlideshowProps {
  slides?: Slide[];
  interval?: number;
}

export default function HeroSlideshow({ slides = defaultSlides, interval = 4000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div className="absolute inset-0 overflow-hidden" role="presentation">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {failedImages.has(i) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-700 to-sky-600" />
          ) : (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
              onError={() => handleImageError(i)}
            />
          )}
        </div>
      ))}
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
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
