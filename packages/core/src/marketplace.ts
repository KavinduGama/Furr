// ─────────────────────────────────────────────────────────────
//  @furr/core — Marketplace domain models
// ─────────────────────────────────────────────────────────────

export type ProductCategory = 
  | 'food'
  | 'medicine'
  | 'accessories'
  | 'toys'
  | 'hygiene'
  | 'beds'
  | 'clothing';

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
  { id: 'food', label: 'Pet Food', icon: 'nutrition' },
  { id: 'medicine', label: 'Medicine & Health', icon: 'medkit' },
  { id: 'toys', label: 'Toys & Fun', icon: 'baseball' },
  { id: 'accessories', label: 'Accessories', icon: 'paw' },
  { id: 'hygiene', label: 'Grooming & Hygiene', icon: 'sparkles' },
  { id: 'beds', label: 'Beds & Housing', icon: 'bed' },
  { id: 'clothing', label: 'Apparel & Wear', icon: 'shirt' },
];

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  description: string;
  features?: string[];
  stock: number;
  inStock: boolean;
  targetSpecies: ('dog' | 'cat' | 'all')[];
  targetLifeStage?: ('puppy' | 'kitten' | 'adult' | 'senior')[];
  sellerId: string;
  sellerName: string;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  ownerUid: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  shippingAddress: OrderAddress;
  paymentMethod: 'card' | 'cod' | 'wallet';
  createdAt: string;
  estimatedDelivery: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  ownerUid: string;
  ownerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
