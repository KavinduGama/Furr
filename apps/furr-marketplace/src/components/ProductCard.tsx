'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@furr/core';
import { RatingStars } from './RatingStars';
import { useMarketplace } from '@/context/MarketplaceContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart } = useMarketplace();
  const [isAdded, setIsAdded] = useState(false);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;

  const hasDiscount = Boolean(
    product.originalPrice && product.originalPrice > product.price
  );
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || product.stock <= 0) return;
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const imageSrc =
    product.imageUrls?.[0] ||
    'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="product-card group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-indigo-200 transition-all duration-200">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square w-full bg-stone-100 overflow-hidden block">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          unoptimized
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 shadow-xs backdrop-blur-xs">
              SAVE {discountPercent}%
            </span>
          )}
          {product.isFeatured && !hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 shadow-xs backdrop-blur-xs">
              FEATURED
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-800 bg-amber-100">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Out of Stock overlay */}
        {(!product.inStock || product.stock <= 0) && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-white text-stone-900 font-bold text-xs shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Species Tag */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-indigo-600 tracking-wide uppercase text-[11px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              {product.targetSpecies?.map((sp) => (
                <span
                  key={sp}
                  className="text-[10px] uppercase font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md"
                >
                  {sp}
                </span>
              ))}
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-[#7B61FF] transition-colors">
            <h3 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="mt-2">
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-stone-900">
                LKR {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  LKR {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-400">Sold by {product.sellerName}</p>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock || product.stock <= 0}
            className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
              isAdded
                ? 'bg-emerald-500 text-white'
                : inCartQuantity > 0
                ? 'bg-[#7B61FF] text-white hover:bg-[#5A3EE5]'
                : 'bg-stone-900 text-white hover:bg-[#7B61FF]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={inCartQuantity > 0 ? `${inCartQuantity} in cart` : 'Add to cart'}
          >
            {isAdded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}

            {inCartQuantity > 0 && !isAdded && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {inCartQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
