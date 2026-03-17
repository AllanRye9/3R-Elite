'use client';

import { useState, useRef, useEffect } from 'react';
import { Category } from '@/lib/types';

interface CategoryPickerProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

function findSelected(categories: Category[], id: string): string {
  for (const cat of categories) {
    if (cat.id === id) return cat.name;
    if (cat.children) {
      for (const sub of cat.children) {
        if (sub.id === id) return `${cat.name} › ${sub.name}`;
      }
    }
  }
  return '';
}

export default function CategoryPicker({ categories, value, onChange, className = '' }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = value ? findSelected(categories, value) : '';
  const activeParent = categories.find((c) => c.id === hoveredParent);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setHoveredParent(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-left focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors hover:border-sky-400"
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabel || 'Select a category'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 flex shadow-xl rounded-xl border border-gray-100 bg-white animate-scale-in overflow-hidden min-w-[220px]">
          {/* Parent categories (left column) */}
          <ul className="py-1 min-w-[200px] max-h-64 overflow-y-auto">
            {categories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isParentSelected = cat.id === value;
              const isChildSelected = cat.children?.some((c) => c.id === value);
              return (
                <li
                  key={cat.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                    hoveredParent === cat.id || isChildSelected
                      ? 'bg-sky-50 text-sky-700'
                      : isParentSelected
                      ? 'bg-sky-100 text-sky-800 font-semibold'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => { hasChildren ? setHoveredParent(cat.id) : setHoveredParent(null); }}
                  onClick={() => !hasChildren && handleSelect(cat.id)}
                >
                  <span className="flex items-center gap-2">
                    {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                    {cat.name}
                  </span>
                  {hasChildren && (
                    <svg className="w-3.5 h-3.5 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Subcategories (right column) — shown when a parent with children is hovered */}
          {activeParent && activeParent.children && activeParent.children.length > 0 && (
            <ul className="py-1 min-w-[180px] max-h-64 overflow-y-auto border-l border-gray-100 bg-gray-50">
              {/* Option to select the parent category itself */}
              <li
                className={`px-3 py-2 cursor-pointer text-sm transition-colors font-medium ${
                  activeParent.id === value ? 'bg-sky-100 text-sky-800' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
                onClick={() => handleSelect(activeParent.id)}
              >
                All in {activeParent.name}
              </li>
              <li className="border-t border-gray-200 my-0.5" />
              {activeParent.children.map((sub) => (
                <li
                  key={sub.id}
                  className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                    sub.id === value ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-gray-700 hover:bg-white hover:text-sky-700'
                  }`}
                  onClick={() => handleSelect(sub.id)}
                >
                  {sub.icon && <span className="mr-1.5" aria-hidden="true">{sub.icon}</span>}
                  {sub.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
