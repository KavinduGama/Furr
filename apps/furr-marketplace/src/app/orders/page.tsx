'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { subscribeToOrders } from '@furr/firebase';
import type { Order, CartItem } from '@furr/core';

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const getStatusBadge = (status: Order['status']) => {
    const statusMap: Record<Order['status'], { label: string; bg: string; text: string }> = {
      placed: { label: 'Order Placed', bg: 'bg-indigo-50 border-indigo-200', text: 'text-[#7B61FF]' },
      confirmed: { label: 'Confirmed', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      processing: { label: 'Packing', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
      shipped: { label: 'In Transit', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
      out_for_delivery: { label: 'Out for Delivery', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
      delivered: { label: 'Delivered', bg: 'bg-stone-100 border-stone-200', text: 'text-stone-700' },
      cancelled: { label: 'Cancelled', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    };
    const s = statusMap[status] || statusMap.placed;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black border ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Track packages, view receipts, and monitor active pet nutrition and pharmacy deliveries.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-3xl animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 text-2xl flex items-center justify-center mx-auto">
            📦
          </div>
          <h3 className="text-lg font-black text-stone-900">No Orders Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            You haven&apos;t placed any orders yet. Explore our curated selection of pet food and veterinary products!
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 rounded-full text-xs font-black text-white bg-[#7B61FF] hover:bg-[#5A3EE5] transition shadow-md shadow-indigo-500/20"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition"
            >
              {/* Card Header */}
              <div className="p-5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order</span>
                    <span className="text-xs font-black font-mono text-stone-900">#{order.id}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-sm font-black text-[#7B61FF]">
                    LKR {order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 space-y-3 divide-y divide-stone-100">
                {order.items.map((item: CartItem, idx: number) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0">
                      <Image
                        src={
                          item.product.imageUrls?.[0] ||
                          'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop&q=60'
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Qty: {item.quantity} × LKR {item.product.price.toLocaleString()}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-stone-800">
                      LKR {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="px-5 py-3.5 bg-stone-50/50 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                <span>
                  Delivering to: <strong className="text-stone-800">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city})
                </span>
                <span>
                  Est. Delivery: <strong className="text-stone-800">{order.estimatedDelivery}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGate
      fallbackTitle="Sign in to View Your Orders"
      fallbackSubtitle="Sign in to your Furr account to track packages, see delivery updates, and download invoices."
    >
      <OrdersContent />
    </AuthGate>
  );
}
