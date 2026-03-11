import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/400/300`; }}
        />
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${product.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {product.condition === 'new' ? 'New' : 'Used'}
        </span>
      </Link>

      <div className="p-4">
        {product.category && (
          <Link to={`/category/${product.category.slug}`} className="text-xs font-medium text-primary-600 hover:underline">
            {product.category.icon} {product.category.name}
          </Link>
        )}

        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center mt-1 space-x-1">
          <StarRating rating={product.avgRating || 0} />
          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
        </div>

        {product.seller && (
          <Link to={`/seller/${product.seller.id}`} className="text-xs text-gray-500 hover:text-primary-600 transition-colors mt-1 block">
            by {product.seller.name}
          </Link>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <div className="flex items-center space-x-1">
            <Link
              to={`/products/${product.id}`}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => addToCart(product)}
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              title="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
