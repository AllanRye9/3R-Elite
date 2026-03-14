'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';

interface Props {
  listings: Listing[];
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      // Always count down to the end of the current day (23:59:59)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm text-white text-xs xs:text-sm font-mono font-bold px-2 xs:px-2.5 py-0.5 xs:py-1 rounded min-w-[1.75rem] xs:min-w-[2rem] text-center border border-white/30">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[7px] xs:text-[8px] text-red-100 mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function FlashDeals({ listings }: Props) {
  const { hours, minutes, seconds } = useCountdown();

  if (listings.length === 0) return null;

  return (
    <section className="rounded-lg xs:rounded-xl overflow-hidden border border-red-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <span className="text-lg xs:text-xl animate-bounce-subtle" aria-hidden="true">⚡</span>
          <div>
            <h2 className="text-sm xs:text-base font-extrabold text-white leading-tight">Flash Deals</h2>
            <p className="text-[9px] xs:text-[10px] text-red-100 leading-tight">Hottest listings right now</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1 xs:gap-1.5">
          <span className="text-[8px] xs:text-[9px] text-red-100 font-semibold mr-0.5 xs:mr-1 hidden xs:block">Ends in</span>
          <TimeUnit value={hours} label="hrs" />
          <span className="text-white font-bold text-xs pb-3.5" aria-hidden="true">:</span>
          <TimeUnit value={minutes} label="min" />
          <span className="text-white font-bold text-xs pb-3.5" aria-hidden="true">:</span>
          <TimeUnit value={seconds} label="sec" />
        </div>
      </div>

      {/* Listing strip */}
      <div className="bg-white flex gap-2 xs:gap-3 overflow-x-auto no-scrollbar p-2.5 xs:p-3 sm:p-4">
        {listings.slice(0, 8).map((listing) => {
          const imageUrl = listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/200/200`;
          return (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="flex-shrink-0 w-24 xs:w-28 sm:w-32 group"
            >
              <div className="relative rounded-lg overflow-hidden bg-gray-50 aspect-square mb-1.5">
                <Image
                  src={imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="128px"
                />
                <div className="absolute top-1 left-1">
                  <span className="bg-red-500 text-white text-[7px] xs:text-[8px] font-bold px-1 xs:px-1.5 py-0.5 rounded-sm leading-none">
                    🔥 HOT
                  </span>
                </div>
                {listing.condition === 'NEW' && (
                  <div className="absolute bottom-1 right-1">
                    <span className="bg-emerald-500 text-white text-[7px] xs:text-[8px] font-bold px-1 xs:px-1.5 py-0.5 rounded-sm leading-none">
                      NEW
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[9px] xs:text-[10px] font-medium text-gray-800 line-clamp-2 leading-tight mb-0.5 xs:mb-1">
                {listing.title}
              </p>
              <CurrencyDisplay
                amount={listing.price}
                currency={listing.currency}
                className="text-red-500 font-extrabold text-[10px] xs:text-xs"
              />
            </Link>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="bg-white px-2.5 xs:px-3 pb-2.5 xs:pb-3 border-t border-gray-50">
        <Link
          href="/listings"
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 hover:text-red-700 text-xs font-semibold transition-colors interactive"
        >
          See All Deals
          <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
