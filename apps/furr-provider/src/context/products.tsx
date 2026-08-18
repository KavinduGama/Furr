import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product, Order } from '@furr/core';
import {
  subscribeToProviderProducts,
  addProviderProduct as dbAddProduct,
  updateProviderProduct as dbUpdateProduct,
  deleteProviderProduct as dbDeleteProduct,
  subscribeToSellerOrders,
  updateSellerOrderStatus as dbUpdateOrderStatus,
  INITIAL_PRODUCTS,
  MOCK_SELLER_ORDERS,
} from '@furr/firebase';
import { useProviderAuth } from './auth';

interface ProductsContextType {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, delta: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => Promise<void>;
  totalInventoryCount: number;
  lowStockCount: number;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProviderProductsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_SELLER_ORDERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const unsubProducts = subscribeToProviderProducts(user.uid, (prods) => {
      setProducts(prods);
      setIsLoading(false);
    });

    const unsubOrders = subscribeToSellerOrders(user.uid, (ords) => {
      setOrders(ords);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  const addProduct = async (p: Omit<Product, 'id' | 'createdAt'>) => {
    const created = await dbAddProduct(p);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await dbUpdateProduct(id, updates);
    setProducts((prev) => prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod)));
  };

  const deleteProduct = async (id: string) => {
    await dbDeleteProduct(id);
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const updateStock = async (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    await updateProduct(id, { stock: newStock, inStock: newStock > 0 });
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    trackingNumber?: string
  ) => {
    await dbUpdateOrderStatus(orderId, status, trackingNumber);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(trackingNumber ? { trackingNumber } : {}),
            }
          : o
      )
    );
  };

  const totalInventoryCount = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <ProductsContext.Provider
      value={{
        products,
        orders,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        updateOrderStatus,
        totalInventoryCount,
        lowStockCount,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProviderProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProviderProducts must be used within a ProviderProductsProvider');
  }
  return context;
}
