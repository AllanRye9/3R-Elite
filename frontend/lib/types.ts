export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type Country = 'UAE' | 'UGANDA';
export type Currency = 'AED' | 'UGX';
export type Condition = 'NEW' | 'USED';
export type ListingStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'EXPIRED' | 'HIDDEN' | 'REJECTED';
export type Placement = 'NONE' | 'LATEST_COLLECTIONS' | 'FEATURED_DEAL';
export type ImageStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

export interface ProductImage {
  id: string;
  listingId?: string | null;
  sellerId: string;
  seller?: { id: string; name: string; email: string };
  listing?: { id: string; title: string } | null;
  tempPath: string;
  status: ImageStatus;
  cdnUrl?: string | null;
  previewUrl?: string;
  uploadedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
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
  placement?: Placement;
  placementExpiresAt?: string;
  userId: string;
  user: { id: string; name: string; avatar?: string; phone?: string; isVerified?: boolean; role?: Role };
  category: Category;
  categoryId: string;
  productImages?: { id: string; cdnUrl: string | null; uploadedAt: string }[];
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

export interface ProductReview {
  id: string;
  listingId: string;
  userId: string;
  user: { id: string; name: string; avatar?: string; email?: string };
  rating: number;
  title?: string | null;
  content: string;
  status: ReviewStatus;
  helpfulCount: number;
  verifiedPurchase: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: { id: string; title: string };
}

export interface ReviewAggregate {
  averageRating: number;
  total: number;
  breakdown: Record<number, { count: number; pct: number }>;
}

export interface PaginatedResponse<T> {
  listings?: T[];
  users?: T[];
  pagination: { total: number; page: number; limit: number; pages?: number };
}
