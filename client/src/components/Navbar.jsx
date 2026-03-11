import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const catMenuRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="bg-primary-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-extrabold text-white tracking-tight">3R-Elite</span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <SearchBar onSearch={handleSearch} placeholder="Search products..." className="w-full" />
          </div>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Categories dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center text-white hover:text-primary-200 font-medium text-sm transition-colors"
              >
                Categories <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {catMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setCatMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <span className="mr-2 text-base">{cat.icon}</span> {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/checkout" className="relative text-white hover:text-primary-200 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-400 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{user.name[0]}</span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-white hover:text-primary-200 font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/checkout" className="relative text-white">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar onSearch={handleSearch} placeholder="Search products..." className="w-full" />
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-700 border-t border-primary-500">
          <div className="px-4 py-3 space-y-2">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block text-white py-2 font-medium">All Products</Link>
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)} className="block text-primary-200 py-1 text-sm">
                {cat.icon} {cat.name}
              </Link>
            ))}
            <div className="border-t border-primary-500 pt-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-white py-2">Dashboard</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="block text-red-300 py-2 w-full text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-white py-2">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-white py-2">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
