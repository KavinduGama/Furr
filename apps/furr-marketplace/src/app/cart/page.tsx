'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import type { OrderAddress, Order } from '@furr/core';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    placeOrder,
  } = useMarketplace();

  // Delivery state
  const [fullName, setFullName] = useState(user?.displayName || 'Pet Parent');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [streetAddress, setStreetAddress] = useState('No. 45, Flower Road');
  const [city, setCity] = useState('Colombo 07');
  const [postalCode, setPostalCode] = useState('00700');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');

  // Coupon state
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    setPromoMsg({ success: res.success, text: res.message });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      alert('Please fill in all delivery address details.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const address: OrderAddress = {
        fullName,
        phone,
        streetAddress,
        city,
        postalCode,
      };
      const order = await placeOrder(address, paymentMethod);
      setPlacedOrder(order);
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Could not complete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-md">
          🎉
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Order Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Thank you for choosing Furr Market. Your order{' '}
          <strong className="text-stone-900 font-mono font-bold">#{placedOrder.id}</strong> has been received and is being prepared for dispatch.
        </p>

        <div className="p-6 bg-white rounded-3xl border border-stone-200 text-left space-y-3 shadow-xs">
          <div className="flex justify-between text-xs">
            <span className="text-stone-500 font-semibold">Estimated Delivery:</span>
            <span className="font-bold text-stone-900">{placedOrder.estimatedDelivery}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-500 font-semibold">Payment Method:</span>
            <span className="font-bold text-stone-900 uppercase">{placedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-500 font-semibold">Delivery Address:</span>
            <span className="font-bold text-stone-900">
              {placedOrder.shippingAddress.streetAddress}, {placedOrder.shippingAddress.city}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-black">
            <span>Total Paid:</span>
            <span className="text-[#7B61FF]">LKR {placedOrder.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/orders"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-xs transition shadow-lg shadow-indigo-500/25"
          >
            Track in My Orders
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-extrabold text-xs hover:bg-stone-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-4xl mx-auto">
          🛒
        </div>
        <h1 className="text-2xl font-black text-stone-900">Your Cart is Empty</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our store to discover prescription veterinary diets, natural supplements, toys, and luxury pet bedding.
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-xs transition shadow-md shadow-indigo-500/20"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Shopping Cart &amp; Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review your items, enter delivery location, and confirm your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Items & Address Form ──────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Item Cards */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
            <h2 className="font-extrabold text-sm text-stone-900 flex items-center justify-between">
              <span>Selected Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="text-xs text-stone-400 font-semibold">Subtotal: LKR {subtotal.toLocaleString()}</span>
            </h2>

            <div className="space-y-3 divide-y divide-stone-100">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 first:pt-0 flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0">
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

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs font-bold text-stone-900 hover:text-[#7B61FF] truncate block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
                      {product.brand} · LKR {product.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-bold text-stone-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs font-extrabold text-stone-900 min-w-[70px] text-right">
                    LKR {(product.price * quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-stone-300 hover:text-rose-500 transition cursor-pointer p-1"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Form */}
          <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <span className="text-lg">📍</span>
              <h2 className="font-extrabold text-sm text-stone-900">Delivery Address &amp; Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Street Address *</label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House / Apartment / Street Name"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">City / District *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700">Payment Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa / Mastercard / Frimi' },
                  { id: 'wallet', label: 'Furr Balance', desc: 'Instant 1-Click Pay' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as 'cod' | 'card' | 'wallet')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-[#7B61FF] bg-indigo-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-stone-900">{pm.label}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{pm.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm &amp; Place Order (LKR {total.toLocaleString()})</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Right Column: Order Summary ────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-5 shadow-xs sticky top-24">
            <h2 className="font-extrabold text-sm text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Promo code form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#7B61FF]"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-[#7B61FF] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </form>

            {couponCode && (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                <span>Code &apos;{couponCode}&apos; Applied</span>
                <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                  Remove
                </button>
              </div>
            )}

            {promoMsg && !couponCode && (
              <p className={`text-xs font-semibold ${promoMsg.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {promoMsg.text}
              </p>
            )}

            {/* Line items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-900">LKR {subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Discount</span>
                  <span>- LKR {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Standard Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold uppercase">Free</strong> : `LKR ${deliveryFee}`}</span>
              </div>

              {subtotal < 10000 && (
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg font-semibold">
                  💡 Add LKR {(10000 - subtotal).toLocaleString()} more to qualify for Free Delivery!
                </p>
              )}

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                <span className="text-sm font-black">Estimated Total</span>
                <span className="text-xl font-black text-[#7B61FF]">
                  LKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Direct veterinary warranty &amp; batch guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Fast 48-hour delivery across Western Province</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
