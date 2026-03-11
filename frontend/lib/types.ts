export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type Country = 'UAE' | 'UGANDA';
export type Currency = 'AED' | 'UGX';
export type Condition = 'NEW' | 'USED';
export type ListingStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'EXPIRED' | 'HIDDEN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  country: Country;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  condition: Condition;
  status: ListingStatus;
  images: string[];
  location: string;
  country: Country;
  views: number;
  createdAt: string;
  expiresAt?: string;
  userId: string;
  user: { id: string; name: string; avatar?: string; phone?: string };
  category: Category;
  categoryId: string;
}

export interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  sender: { id: string; name: string; avatar?: string };
  receiver: { id: string; name: string; avatar?: string };
  listing?: { id: string; title: string; images: string[] };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerId: string;
  revieweeId: string;
  reviewer: { id: string; name: string; avatar?: string };
}

export interface PaginatedResponse<T> {
  listings?: T[];
  users?: T[];
  pagination: { total: number; page: number; limit: number; pages?: number };
}
