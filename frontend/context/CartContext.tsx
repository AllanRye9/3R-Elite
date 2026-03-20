'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing } from '@/lib/types';

export interface CartItem {
  listing: Listing;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (listing: Listing) => void;
  removeFromCart: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore malformed data
    }
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }, []);

  const addToCart = useCallback((listing: Listing) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      const next = existing
        ? prev.map((i) => i.listing.id === listing.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { listing, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((listingId: string) => {
    persist(items.filter((i) => i.listing.id !== listingId));
  }, [items, persist]);

  const updateQuantity = useCallback((listingId: string, quantity: number) => {
    if (quantity < 1) {
      persist(items.filter((i) => i.listing.id !== listingId));
    } else {
      persist(items.map((i) => i.listing.id === listingId ? { ...i, quantity } : i));
    }
  }, [items, persist]);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
