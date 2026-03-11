import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, RotateCcw, Headphones, Tag, TrendingUp, Package } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products?limit=8&sort=newest'),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Buy &amp; Sell <span className="text-secondary-400">Anything</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Discover thousands of products from trusted sellers. Find great deals or start selling today.
          </p>
          <div className="max-w-xl mx-auto mb-8">
            <SearchBar
              onSearch={(q) => navigate(`/products?search=${encodeURIComponent(q)}`)}
              placeholder="Search for products, brands, categories..."
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Browse Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center bg-secondary-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-secondary-600 transition-colors shadow-lg"
            >
              Start Selling <Tag className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:shadow-md transition-all group"
              >
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 text-center">{cat.name}</span>
                <span className="text-xs text-gray-400 mt-1">{cat.productCount} items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              See all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-500 mb-10">Getting started is easy. Here's how it works:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: <Tag className="h-8 w-8 text-primary-600" />, step: '1', title: 'List Your Item', desc: 'Create a listing in minutes. Add photos, set your price, and reach thousands of buyers.' },
              { icon: <Package className="h-8 w-8 text-secondary-500" />, step: '2', title: 'Browse & Buy', desc: 'Find exactly what you need. Filter by category, price, and condition.' },
              { icon: <Shield className="h-8 w-8 text-green-500" />, step: '3', title: 'Secure Payment', desc: 'Pay safely with Stripe. Your money is protected with buyer guarantees.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
                <div className="mb-4 p-4 bg-white rounded-full shadow-sm">{icon}</div>
                <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">{step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 px-4 bg-primary-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="h-8 w-8 text-primary-600" />, title: 'Secure Payments', desc: 'All transactions secured by Stripe' },
              { icon: <RotateCcw className="h-8 w-8 text-secondary-500" />, title: 'Easy Returns', desc: '30-day return policy on eligible items' },
              { icon: <Headphones className="h-8 w-8 text-green-600" />, title: '24/7 Support', desc: 'Our team is here whenever you need help' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center space-x-4 p-5 bg-white rounded-xl shadow-sm">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
