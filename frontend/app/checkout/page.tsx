'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

type Step = 'details' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: '',
    city: '',
    country: 'UAE',
    notes: '',
  });

  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPayment((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [paymentError, setPaymentError] = useState('');

  const handlePlaceOrder = async () => {
    setPaymentError('');
    // Basic payment validation before proceeding
    if (payment.method === 'card') {
      if (!payment.cardName || !payment.cardNumber || !payment.expiry || !payment.cvv) {
        setPaymentError('Please fill in all card details.');
        return;
      }
    }
    setSubmitting(true);
    // Simulate order placement delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    setStep('confirmation');
    setSubmitting(false);
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/listings" className="px-8 py-3 rounded-xl bg-sky-500 text-white font-semibold">Browse Listings</Link>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 max-w-md mb-2">
          Thank you, <strong>{form.name || user?.name}</strong>! Your order has been received and is being processed.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation will be sent to <strong>{form.email || user?.email}</strong>
        </p>
        <div className="flex gap-4">
          <Link href="/listings" className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors">
            Continue Shopping
          </Link>
          <Link href="/profile/listings" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currency = items[0]?.listing.currency ?? 'AED';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['details', 'payment'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</div>
            <span className={`text-sm font-medium capitalize ${step === s ? 'text-sky-600' : 'text-gray-400'}`}>
              {s === 'details' ? 'Delivery Details' : 'Payment'}
            </span>
            {i === 0 && <span className="text-gray-300 mx-1">→</span>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: form */}
        <div>
          {step === 'details' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Delivery Details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleFormChange} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select name="country" value={form.country} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white">
                    <option value="UAE">🇦🇪 United Arab Emirates</option>
                    <option value="UGANDA">🇺🇬 Uganda</option>
                    <option value="KENYA">🇰🇪 Kenya</option>
                    <option value="CHINA">🇨🇳 China</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <input name="address" value={form.address} onChange={handleFormChange} required
                    placeholder="Street address, building, apartment..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input name="city" value={form.city} onChange={handleFormChange} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={3}
                  placeholder="Any special instructions for delivery..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" />
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={!form.name || !form.email || !form.address || !form.city}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep('details')} className="text-sky-500 hover:text-sky-700 text-sm font-medium">
                  ← Back
                </button>
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>

              {/* Payment method selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', label: 'Credit Card', icon: '💳' },
                  { id: 'mobile', label: 'Mobile Money', icon: '📱' },
                  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment((p) => ({ ...p, method: m.id }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                      payment.method === m.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-gray-200 text-gray-600 hover:border-sky-200'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <input name="cardName" value={payment.cardName} onChange={handlePaymentChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input name="cardNumber" value={payment.cardNumber} onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input name="expiry" value={payment.expiry} onChange={handlePaymentChange}
                        placeholder="MM/YY" maxLength={5}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input name="cvv" value={payment.cvv} onChange={handlePaymentChange}
                        placeholder="123" maxLength={4} type="password"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                    </div>
                  </div>
                </div>
              )}

              {payment.method === 'mobile' && (
                <div className="bg-sky-50 rounded-xl p-4 text-sm text-sky-800">
                  <p className="font-semibold mb-1">Mobile Money Instructions</p>
                  <p>Send payment to <strong>+254 700 000 000</strong> (M-Pesa / MTN / Airtel) and include your order number in the reference.</p>
                </div>
              )}

              {payment.method === 'bank' && (
                <div className="bg-sky-50 rounded-xl p-4 text-sm text-sky-800 space-y-1">
                  <p className="font-semibold mb-1">Bank Transfer Details</p>
                  <p>Bank: <strong>3R Elite Bank</strong></p>
                  <p>Account: <strong>1234-5678-9012</strong></p>
                  <p>Reference: <strong>Your name + order number</strong></p>
                </div>
              )}

              {paymentError && (
                <p className="text-red-600 text-sm font-medium bg-red-50 rounded-xl px-4 py-2">{paymentError}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-all shadow-md"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  `✓ Place Order · ${formatCurrency(totalPrice, currency)}`
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map(({ listing, quantity }) => {
              const img = listing.productImages?.[0]?.cdnUrl ?? listing.images?.[0] ?? null;
              return (
                <div key={listing.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {img ? (
                      <Image src={img} alt={listing.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏷️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-gray-500">×{quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(listing.price * quantity, listing.currency)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-sky-600">{formatCurrency(totalPrice, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
