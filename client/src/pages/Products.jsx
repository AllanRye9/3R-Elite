import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const condition = searchParams.get('condition') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (page) params.set('page', page);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (condition) params.set('condition', condition);
      if (categoryId) params.set('categoryId', categoryId);

      // Handle category slug from URL
      if (slug) {
        const cat = categories.find((c) => c.slug === slug);
        if (cat) params.set('categoryId', cat.id);
      }

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page, minPrice, maxPrice, condition, categoryId, slug, categories]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (priceMin) params.set('minPrice', priceMin);
    else params.delete('minPrice');
    if (priceMax) params.set('maxPrice', priceMax);
    else params.delete('maxPrice');
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSearchParams(search ? { search } : {});
  };

  const currentCategory = slug
    ? categories.find((c) => c.slug === slug)
    : categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentCategory ? `${currentCategory.icon} ${currentCategory.name}` : search ? `Results for "${search}"` : 'All Products'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{total} products found</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`w-64 flex-shrink-0 hidden lg:block`}>
          <SidebarFilters
            categories={categories}
            categoryId={categoryId}
            slug={slug}
            condition={condition}
            priceMin={priceMin}
            priceMax={priceMax}
            setPriceMin={setPriceMin}
            setPriceMax={setPriceMax}
            onCategory={(id) => updateParam('categoryId', id)}
            onCondition={(v) => updateParam('condition', v)}
            onApplyPrice={applyPriceFilter}
            onClear={clearFilters}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center space-x-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg"
            >
              <SlidersHorizontal className="h-4 w-4" /> <span>Filters</span>
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Mobile filters */}
          {sidebarOpen && (
            <div className="lg:hidden mb-4 p-4 bg-white border border-gray-200 rounded-xl">
              <SidebarFilters
                categories={categories}
                categoryId={categoryId}
                slug={slug}
                condition={condition}
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                onCategory={(id) => updateParam('categoryId', id)}
                onCondition={(v) => updateParam('condition', v)}
                onApplyPrice={applyPriceFilter}
                onClear={clearFilters}
              />
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
              <button onClick={clearFilters} className="mt-4 text-primary-600 hover:underline text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-primary-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarFilters({ categories, categoryId, slug, condition, priceMin, priceMax, setPriceMin, setPriceMax, onCategory, onCondition, onApplyPrice, onClear }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategory('')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!categoryId && !slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onCategory(cat.id)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  categoryId === cat.id || slug === cat.slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span><span>{cat.name}</span>
                <span className="ml-auto text-xs text-gray-400">{cat.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          {['', 'new', 'used'].map((c) => (
            <label key={c} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={c}
                checked={condition === c}
                onChange={() => onCondition(c)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{c === '' ? 'Any' : c === 'new' ? 'New' : 'Used'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <button
          onClick={onApplyPrice}
          className="mt-2 w-full text-sm bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Apply
        </button>
      </div>

      <button onClick={onClear} className="w-full text-sm text-gray-500 hover:text-red-600 transition-colors">
        Clear all filters
      </button>
    </div>
  );
}
