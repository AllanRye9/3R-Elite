import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export default function Checkout() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError('');
    setCheckoutLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      const res = await api.post('/payments/create-checkout-session', { items });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Order Items ({cart.length})</h2>
          {cart.map((item) => (
            <div key={item.product.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center space-x-4">
              <img
                src={item.product.images?.[0] || `https://picsum.photos/seed/${item.product.id}/80/80`}
                alt={item.product.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1 text-sm">
                  {item.product.title}
                </Link>
                <p className="text-sm text-primary-600 font-semibold mt-0.5">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold">−</button>
                  <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold">+</button>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.product.title} ×{item.quantity}</span>
                  <span className="flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              <CreditCard className="h-5 w-5" />
              <span>{checkoutLoading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}</span>
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center space-x-1">
              <span>🔒</span><span>Secured by Stripe</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
