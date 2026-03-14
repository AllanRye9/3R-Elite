'use client';

import Link from 'next/link';

interface FeaturedProductCardProps {
  storeName?: string;
  title?: string;
  originalPrice?: string;
  discountedPrice?: string;
  imageUrl?: string;
  href?: string;
}

export default function FeaturedProductCard({
  storeName = '3R Elite Store',
  title = 'Premium Wireless Headphones — Noise Cancelling Pro',
  originalPrice = 'AED 899',
  discountedPrice = 'AED 449',
  imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  href = '/listings',
}: FeaturedProductCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-[#90D5FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Limited time offer
            </span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">{storeName}</p>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-xs sm:text-sm">{originalPrice}</span>
            <span className="text-[#90D5FF] font-extrabold text-base sm:text-lg">{discountedPrice}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
