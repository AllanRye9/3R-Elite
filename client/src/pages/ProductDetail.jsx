import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, MapPin, Calendar, Star } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImage(0);
        if (res.data.categoryId) {
          api.get(`/products?categoryId=${res.data.categoryId}&limit=4`)
            .then((r) => setRelated((r.data.products || []).filter((p) => p.id !== id)))
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', { productId: id, ...reviewForm });
      setProduct((prev) => ({
        ...prev,
        reviews: [res.data, ...(prev.reviews || [])],
      }));
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-2xl aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found.</div>;
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [`https://picsum.photos/seed/${product.id}/800/600`];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image gallery */}
        <div>
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-3">
            <img
              src={images[activeImage]}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/800/600`; }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === activeImage ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.category && (
            <Link to={`/category/${product.category.slug}`} className="text-sm font-medium text-primary-600 hover:underline">
              {product.category.icon} {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3">{product.title}</h1>

          <div className="flex items-center space-x-3 mb-4">
            <StarRating rating={product.avgRating} size="md" />
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {product.condition === 'new' ? 'New' : 'Used'}
            </span>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-6">{formatPrice(product.price)}</div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-gray-700 font-bold">−</button>
              <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-gray-700 font-bold">+</button>
            </div>
            <span className="text-sm text-gray-500">{product.stock} in stock</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-4"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>

          {/* Seller info */}
          {product.seller && (
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sold by</h3>
              <Link to={`/seller/${product.seller.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden flex-shrink-0">
                  {product.seller.avatar ? (
                    <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold">
                      {product.seller.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.seller.name}</p>
                  {product.seller.location && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />{product.seller.location}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

        {user && user.id !== product.sellerId && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Rating</label>
              <StarRating
                rating={reviewForm.rating}
                interactive
                size="lg"
                onChange={(r) => setReviewForm((prev) => ({ ...prev, rating: r }))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Share your experience..."
                required
              />
            </div>
            {reviewError && <p className="text-red-600 text-sm mb-3">{reviewError}</p>}
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-60"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold text-sm">
                        {review.user?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm">{review.user?.name || 'Anonymous'}</p>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
