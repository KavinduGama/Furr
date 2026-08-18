'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, ProductCategory, Order, OrderAddress } from '@furr/core';
import { subscribeToProducts, createOrder, INITIAL_PRODUCTS } from '@furr/firebase';
import { useAuth } from './AuthContext';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface MarketplaceContextType {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  selectedSpecies: 'all' | 'dog' | 'cat';
  setSelectedSpecies: (sp: 'all' | 'dog' | 'cat') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filteredProducts: Product[];

  // Cart
  cart: CartItem[];
  cartItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode: string;
  couponDiscount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Orders
  placeOrder: (
    shippingAddress: OrderAddress,
    paymentMethod: 'card' | 'cod' | 'wallet'
  ) => Promise<Order>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponDiscountFixed, setCouponDiscountFixed] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load products from Firestore / fallback
  useEffect(() => {
    const unsub = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Hydrate cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('furr_market_cart');
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist cart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('furr_market_cart', JSON.stringify(cart));
      } catch {
        // ignore
      }
    }
  }, [cart]);

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscountPercent(0);
    setCouponDiscountFixed(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FURR10') {
      setCouponCode(clean);
      setCouponDiscountPercent(0.1); // 10%
      setCouponDiscountFixed(0);
      return { success: true, message: '10% discount applied!' };
    } else if (clean === 'PETLOVE') {
      setCouponCode(clean);
      setCouponDiscountFixed(500); // 500 LKR
      setCouponDiscountPercent(0);
      return { success: true, message: 'LKR 500 discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try "FURR10" or "PETLOVE"' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
    setCouponDiscountFixed(0);
  };

  // Computations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 10000 || subtotal === 0 ? 0 : 450;
  const discount = Math.round(
    subtotal * couponDiscountPercent + couponDiscountFixed
  );
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    // Species filter
    if (selectedSpecies !== 'all') {
      if (!p.targetSpecies.includes(selectedSpecies) && !p.targetSpecies.includes('all')) {
        return false;
      }
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default 'featured'
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Place Order
  const placeOrder = async (
    shippingAddress: OrderAddress,
    paymentMethod: 'card' | 'cod' | 'wallet'
  ): Promise<Order> => {
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      ownerUid: user?.uid || 'guest-web-user',
      items: cart,
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'placed',
      shippingAddress,
      paymentMethod,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    const created = await createOrder(orderData);
    clearCart();
    return created;
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSpecies,
        setSelectedSpecies,
        sortBy,
        setSortBy,
        filteredProducts,
        cart,
        cartItemCount,
        subtotal,
        deliveryFee,
        discount,
        total,
        couponCode,
        couponDiscount: discount,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
