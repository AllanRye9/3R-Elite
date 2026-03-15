'use client';

import Link from 'next/link';
import Image from 'next/image';

interface FeaturedProductCardProps {
  storeName?: string;
  title?: string;
  originalPrice?: string;
  discountedPrice?: string;
  imageUrl?: string;
  href?: string;
  isHandpicked?: boolean;
  className?: string;
}

export default function FeaturedProductCard({
  storeName = '3R Elite Store',
  title = 'Premium Wireless Headphones — Noise Cancelling Pro',
  originalPrice = 'AED 899',
  discountedPrice = 'AED 449',
  imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  href = '/listings',
  isHandpicked = false,
  className = '',
}: FeaturedProductCardProps & { className?: string }) {
  return (
    <Link href={href} className={`block group ${className}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 384px"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            {isHandpicked && (
              <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Handpicked
              </span>
            )}
            <span className="bg-[#0EA5E9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Limited time offer
            </span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">{storeName}</p>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-xs sm:text-sm">{originalPrice}</span>
            <span className="text-[#0EA5E9] font-extrabold text-base sm:text-lg">{discountedPrice}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
