'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useMarketplace();

  const [inputCode, setInputCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyCoupon(inputCode);
    setCouponMsg({ success: res.success, text: res.message });
  };

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-lg font-black text-stone-900">Your Cart</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#7B61FF]">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl mb-4">
                  🛒
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mb-6">
                  Explore our curated catalogue of top-tier pet nutrition, wellness, and accessories!
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    router.push('/products');
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-black text-white bg-[#7B61FF] hover:bg-[#5A3EE5] transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-white hover:border-stone-200 transition"
                >
                  {/* Image */}
                  <div className="relative w-18 h-18 rounded-xl bg-white overflow-hidden border border-stone-200 flex-shrink-0">
                    <Image
                      src={
                        product.imageUrls?.[0] ||
                        'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-xs font-bold text-stone-900 hover:text-[#7B61FF] line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-300 hover:text-rose-500 transition cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        {product.brand}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-extrabold text-stone-900">
                        LKR {(product.price * quantity).toLocaleString()}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/70 space-y-4">
              {/* Promo code */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo (e.g. FURR10)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs uppercase font-bold outline-none focus:border-[#7B61FF]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-[#7B61FF] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponCode && (
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span>Code &apos;{couponCode}&apos; active</span>
                  <button onClick={removeCoupon} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
                    Remove
                  </button>
                </div>
              )}

              {couponMsg && !couponCode && (
                <p className={`text-xs font-semibold ${couponMsg.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">LKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>- LKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold uppercase">Free</strong> : `LKR ${deliveryFee}`}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-base text-[#7B61FF]">LKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
