"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export interface Testimonial {
  name: string;
  avatarUrl?: string;
  text: string;
  rating?: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Aisha K.',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    text: '3R-Elite made selling my designer bag so easy! The process was smooth and I got a great price.',
    rating: 5,
  },
  {
    name: 'Omar S.',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'I found a rare watch I had been searching for. The platform feels safe and premium.',
    rating: 5,
  },
  {
    name: 'Grace N.',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Excellent support and fast listing approval. Highly recommend for luxury items.',
    rating: 4,
  },
];

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);
  const goBack = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);
  useEffect(() => {
    const timer = setInterval(advance, 6000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <section className="bg-white border-t border-gray-100 py-10 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-2xl font-extrabold text-elite-navy mb-2">What Our Users Say</h2>
        <p className="text-gray-500 text-sm">Real stories from our trusted community</p>
      </div>
      <div className="relative max-w-2xl mx-auto min-h-[220px]">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
            aria-hidden={i !== current}
          >
            <div className="flex flex-col items-center bg-white/80 rounded-xl shadow-lg border border-elite-gold/10 px-8 py-6 mx-2">
              {t.avatarUrl && (
                <Image src={t.avatarUrl} alt={t.name} width={56} height={56} className="w-14 h-14 rounded-full mb-3 border-2 border-elite-gold object-cover" />
              )}
              <p className="text-gray-700 text-base mb-3 max-w-xl text-center">“{t.text}”</p>
              <div className="flex gap-1 mb-2">
                {[...Array(t.rating || 5)].map((_, j) => (
                  <span key={j} className="text-elite-gold text-lg">★</span>
                ))}
                {[...Array(5 - (t.rating || 5))].map((_, j) => (
                  <span key={j} className="text-gray-300 text-lg">★</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-elite-navy">{t.name}</span>
            </div>
          </div>
        ))}
        {/* Navigation arrows */}
        <button
          onClick={goBack}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-elite-gold/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Previous testimonial"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={advance}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-elite-gold/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Next testimonial"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Avatar navigation — witnesses at the bottom */}
      <div className="flex justify-center gap-4 mt-6">
        {testimonials.map((t, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`View testimonial from ${t.name}`}
            className={`relative rounded-full transition-all duration-300 focus:outline-none ${
              i === current
                ? 'ring-2 ring-elite-gold ring-offset-2 scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
            }`}
          >
            {t.avatarUrl ? (
              <Image
                src={t.avatarUrl}
                alt={t.name}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div aria-label={`${t.name}'s avatar`} className="w-11 h-11 rounded-full bg-elite-navy/20 flex items-center justify-center text-elite-navy font-bold text-sm">
                {t.name.charAt(0)}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
