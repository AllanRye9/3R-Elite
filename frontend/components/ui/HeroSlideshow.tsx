'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Slide {
  image: string;
  alt: string;
}

const defaultSlides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=600&fit=crop',
    alt: 'Luxury watch collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
    alt: 'Premium boutique storefront',
  },
  {
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=600&fit=crop',
    alt: 'Designer footwear',
  },
  {
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&h=600&fit=crop',
    alt: 'Premium technology products',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=600&fit=crop',
    alt: 'Luxury living spaces',
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

  const goBack = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div className="absolute inset-0 overflow-hidden mx-[3%] w-[94%]" role="region" aria-label="Image slideshow">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {failedImages.has(i) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-elite-navy via-elite-charcoal to-black" />
          ) : (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="94vw"
              onError={() => handleImageError(i)}
            />
          )}
        </div>
      ))}
      {/* Dark overlay for moody gradient feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/70 via-[#0B132B]/50 to-[#0B132B]/80" />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Navigation arrows */}
      <button
        onClick={goBack}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-[#0EA5E9]/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={advance}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-[#0EA5E9]/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-[#0EA5E9]'
                : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
