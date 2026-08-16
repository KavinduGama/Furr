import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductCategory, CartItem, Order, OrderAddress } from '@furr/core';
import { subscribeToProducts, subscribeToOrders, createOrder as firebaseCreateOrder, INITIAL_PRODUCTS } from '@furr/firebase';
import { useAuth } from './auth';

interface MarketplaceContextType {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  orders: Order[];
  placeOrder: (shippingAddress: OrderAddress, paymentMethod: 'card' | 'cod' | 'wallet') => Promise<Order | null>;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  discountAmount: number;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Subscribe to products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prods) => {
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's orders
  useEffect(() => {
    if (!firebaseUser) {
      setOrders([]);
      return;
    }
    const unsubscribe = subscribeToOrders(firebaseUser.uid, (newOrders) => {
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Client-side search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const applyCoupon = useCallback((code: string) => {
    if (code.toUpperCase() === 'FURR10') {
      setAppliedCoupon('FURR10');
      return true;
    }
    return false;
  }, []);

  const discountAmount = useMemo(() => {
    if (appliedCoupon === 'FURR10') {
      return Math.round(subtotal * 0.1);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const cartTotal = useMemo(() => {
    const delivery = subtotal > 0 ? 350 : 0;
    return subtotal + delivery - discountAmount;
  }, [subtotal, discountAmount]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const placeOrder = useCallback(
    async (
      shippingAddress: OrderAddress,
      paymentMethod: 'card' | 'cod' | 'wallet'
    ): Promise<Order | null> => {
      if (cart.length === 0) return null;
      const ownerUid = firebaseUser?.uid || 'guest-user';
      const order = await firebaseCreateOrder({
        ownerUid,
        items: [...cart],
        subtotal,
        deliveryFee: 350,
        discount: discountAmount,
        total: cartTotal,
        status: 'placed',
        shippingAddress,
        paymentMethod,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });

      // Update local state in case Firestore listener is offline
      setOrders((prev) => [order, ...prev]);
      clearCart();
      return order;
    },
    [cart, firebaseUser, subtotal, discountAmount, cartTotal, clearCart]
  );

  const value = useMemo(
    () => ({
      products,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      filteredProducts,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      orders,
      placeOrder,
      appliedCoupon,
      applyCoupon,
      discountAmount,
    }),
    [
      products,
      selectedCategory,
      searchQuery,
      filteredProducts,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      orders,
      placeOrder,
      appliedCoupon,
      applyCoupon,
      discountAmount,
    ]
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
