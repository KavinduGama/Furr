'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { RatingStars } from '@/components/RatingStars';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { products, addToCart, setIsDrawerOpen } = useMarketplace();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🐾</div>
        <h1 className="text-2xl font-black text-stone-900">Product Not Found</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          The item you are looking for might have been retired or moved.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-full text-xs font-black text-white bg-[#7B61FF]"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const hasDiscount = Boolean(
    product.originalPrice && product.originalPrice > product.price
  );
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;

  const isOutOfStock = !product.inStock || product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop&q=60'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-[#7B61FF] capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-stone-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* ── Product Hero Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xs">
            <Image
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 shadow-xs">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#7B61FF] shadow-sm'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Card */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#7B61FF] uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full capitalize">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-2 leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-4">
              <RatingStars
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
              <span className="text-stone-300">|</span>
              <span className="text-xs font-bold text-emerald-600">
                {product.inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-stone-900">
                LKR {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base font-semibold text-stone-400 line-through">
                  LKR {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Tax included. Island-wide standard delivery: LKR 450 (Free over LKR 10,000).
            </p>
          </div>

          {/* Features Highlights */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
                Key Benefits &amp; Features
              </h3>
              <ul className="space-y-1.5">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-medium">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-6 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-900 hover:bg-[#7B61FF] text-white shadow-md'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isAdded ? (
                  <>
                    <span>✓ Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-2xl font-extrabold text-xs bg-[#7B61FF] hover:bg-[#5A3EE5] text-white shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>

          {/* Seller Trust Box */}
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80 flex items-center gap-3.5 text-xs text-stone-600">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg flex-shrink-0">
              🏪
            </div>
            <div>
              <p className="font-bold text-stone-900">Fulfilled by {product.sellerName}</p>
              <p className="text-[11px] text-stone-500">Authorized medical distributor &amp; official partner of Furr Labs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Description Tabs ────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
        <h2 className="text-lg font-black text-stone-900">Product Overview &amp; Specifications</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
          {product.description}
        </p>
      </div>

      {/* ── Related Products ─────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-xl font-black text-stone-900">Similar Recommended Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
