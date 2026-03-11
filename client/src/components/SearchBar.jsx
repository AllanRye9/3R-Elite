import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, placeholder = 'Search...', className = '', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-4 pr-10 py-2 text-sm bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent placeholder-gray-400"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
