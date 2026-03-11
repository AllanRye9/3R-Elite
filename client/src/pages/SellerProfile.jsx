import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Package, Star } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sellers/${id}`)
      .then((res) => setSeller(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="flex items-start space-x-6 mb-10">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return <div className="text-center py-20 text-gray-500">Seller not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex-shrink-0">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary-600">
                {seller.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
            {seller.bio && <p className="text-gray-500 mt-1 text-sm">{seller.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {seller.location && (
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary-400" />{seller.location}</span>
              )}
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-primary-400" />
                Member since {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-primary-600">{seller.stats.totalProducts}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-yellow-500 flex items-center sm:justify-end">
                {seller.stats.avgRating.toFixed(1)}
                <Star className="h-5 w-5 ml-1 fill-yellow-400 text-yellow-400" />
              </p>
              <p className="text-xs text-gray-500">{seller.stats.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Package className="h-5 w-5 mr-2 text-primary-600" /> Listings ({seller.products.length})
      </h2>
      {seller.products.length === 0 ? (
        <p className="text-gray-500">This seller has no active listings.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {seller.products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
