import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductCategory, CartItem, Order, OrderAddress, PaymentProvider } from '@furr/core';
import {
  subscribeToProducts,
  subscribeToOrders,
  createOrder as firebaseCreateOrder,
  createPaymentIntent,
  confirmPayment,
  INITIAL_PRODUCTS,
} from '@furr/firebase';
import { useAuth } from './auth';

interface MarketplaceContextType {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (category: ProductCategory | 'all') => void;
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
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  discountAmount: number;
  placeOrder: (
    shippingAddress: OrderAddress,
    paymentMethod: 'card' | 'cod' | 'wallet'
  ) => Promise<Order | null>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Subscribe to live products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((list) => {
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user orders
  useEffect(() => {
    if (!firebaseUser) {
      setOrders([]);
      return;
    }
    const unsubscribe = subscribeToOrders(firebaseUser.uid, (list) => {
      setOrders(list);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
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
      const ownerUid = firebaseUser?.uid || profile?.uid || 'guest-user';
      const provider: PaymentProvider =
        paymentMethod === 'card'
          ? 'stripe'
          : paymentMethod === 'wallet'
          ? 'payhere'
          : 'cash_on_delivery';

      // 1. Create PaymentIntent
      const intent = await createPaymentIntent({
        amount: cartTotal,
        currency: 'LKR',
        purpose: 'marketplace_order',
        customerUid: ownerUid,
        customerName: shippingAddress.fullName,
        customerPhone: shippingAddress.phone,
        provider,
        metadata: {
          itemCount: cart.length,
          discount: discountAmount,
        },
      });

      // 2. Confirm Payment
      await confirmPayment(
        intent.id,
        `tx_order_${Date.now()}`,
        provider
      );

      // 3. Create Order
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
    [cart, firebaseUser?.uid, profile?.uid, subtotal, discountAmount, cartTotal, clearCart]
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
      appliedCoupon,
      applyCoupon,
      discountAmount,
      placeOrder,
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
      appliedCoupon,
      applyCoupon,
      discountAmount,
      placeOrder,
    ]
  );

  return (
    <MarketplaceContext.Provider value={value}>
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
