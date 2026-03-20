'use client';

import { useCart } from '@/context/CartContext';
import { useCountry } from '@/context/CountryContext';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { currency } = useCountry();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven&apos;t added any items yet. Browse our listings to find something you love.
        </p>
        <Link
          href="/listings"
          className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors shadow-md"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart <span className="text-sky-500 text-lg font-semibold">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map(({ listing, quantity }) => {
            const img = listing.productImages?.[0]?.cdnUrl ?? listing.images?.[0] ?? null;
            const itemPrice = listing.currency === currency
              ? formatCurrency(listing.price * quantity, listing.currency)
              : formatCurrency(listing.price * quantity, listing.currency);

            return (
              <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <Link href={`/listings/${listing.id}`} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {img ? (
                    <Image src={img} alt={listing.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🏷️</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/listings/${listing.id}`} className="font-semibold text-gray-900 hover:text-sky-600 transition-colors line-clamp-2 text-sm">
                    {listing.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{listing.condition} · {listing.location}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(listing.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-bold transition-colors"
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(listing.id, quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-bold transition-colors"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sky-700 text-sm">{itemPrice}</span>
                      <button
                        onClick={() => removeFromCart(listing.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {items.map(({ listing, quantity }) => (
              <div key={listing.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{listing.title} ×{quantity}</span>
                <span className="font-medium text-gray-900 whitespace-nowrap">
                  {formatCurrency(listing.price * quantity, listing.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-sky-600">
                {formatCurrency(totalPrice, items[0]?.listing.currency ?? 'AED')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Taxes and shipping calculated at checkout</p>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg"
          >
            Proceed to Checkout →
          </button>

          <Link
            href="/listings"
            className="block text-center mt-3 text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
