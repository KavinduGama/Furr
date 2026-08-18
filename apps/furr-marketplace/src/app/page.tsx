'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChip } from '@/components/CategoryChip';
import { PRODUCT_CATEGORIES } from '@furr/core';

export default function HomePage() {
  const {
    products,
    loading,
    selectedCategory,
    setSelectedCategory,
    selectedSpecies,
    setSelectedSpecies,
  } = useMarketplace();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const foodProducts = products.filter((p) => p.category === 'food').slice(0, 4);
  const medicineProducts = products.filter((p) => p.category === 'medicine').slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="hero-gradient relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-stone-200/80 shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#7B61FF] animate-pulse"></span>
              <span className="text-xs font-bold text-stone-800 tracking-wide">
                Sri Lanka&apos;s #1 Pet Pharmacy &amp; Nutrition Hub
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08]">
              Everything your pet needs,{' '}
              <span className="bg-gradient-to-r from-[#7B61FF] via-[#5A3EE5] to-[#F59E0B] bg-clip-text text-transparent">
                delivered with love.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              Explore thousands of vet-approved nutrition formulas, prescription diets, flea &amp; tick preventatives, toys, and luxury bedding delivered right to your doorstep island-wide.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-8 py-4 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2 group"
              >
                <span>Shop All Products</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/products?category=medicine"
                className="px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-extrabold text-sm transition shadow-2xs"
              >
                💊 Vet Pharmacy Refills
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200/80">
              <div>
                <p className="text-2xl font-black text-stone-900">100%</p>
                <p className="text-xs font-semibold text-stone-500">Genuine Brands</p>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900">2-3 Days</p>
                <p className="text-xs font-semibold text-stone-500">Island Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900">4.9 ★</p>
                <p className="text-xs font-semibold text-stone-500">2,500+ Reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-indigo-100 to-amber-50">
              <Image
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80"
                alt="Happy dog and kitten receiving Furr products"
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="px-3 py-1 bg-[#7B61FF] text-white font-black text-[10px] tracking-wider uppercase rounded-full w-fit mb-2 shadow-sm">
                  Vet Verified Selection
                </span>
                <h3 className="text-xl font-extrabold">Royal Canin, Hill&apos;s, Zoetis &amp; More</h3>
                <p className="text-xs text-stone-200 mt-1">Temperature-controlled storage for all vaccines and medicines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Quick Jump ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select a category to filter our extensive inventory
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#7B61FF] hover:underline"
          >
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {PRODUCT_CATEGORIES.map((cat) => {
            const icons: Record<string, string> = {
              food: '🥣',
              medicine: '💊',
              toys: '🎾',
              accessories: '🦮',
              hygiene: '🧴',
              beds: '🛏️',
              clothing: '👕',
            };
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#7B61FF] hover:shadow-md hover:-translate-y-1 transition-all group text-center"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {icons[cat.id] || '🐾'}
                </span>
                <span className="text-xs font-bold text-stone-800 group-hover:text-[#7B61FF]">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-[#7B61FF]">
              Handpicked Deals
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Featured Products &amp; Best Sellers
            </h2>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
          >
            Explore All Products →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-80 bg-stone-100 rounded-2xl animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Promotional Banner ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#111827] via-[#1E1B4B] to-[#02202B] text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#7B61FF] text-white">
              LIMITED TIME OFFER
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Get 10% Off Your Entire Cart with code{' '}
              <span className="text-amber-400 font-mono">FURR10</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Stock up on dry food, wet food, flea &amp; tick protection, and grooming care. Free shipping on all orders over LKR 10,000.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition shadow-md"
              >
                <span>Shop With Coupon</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#7B61FF]/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── Pet Nutrition Section ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-emerald-600">
              Optimal Diet
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Veterinary Diet &amp; Premium Pet Food
            </h2>
          </div>
          <Link
            href="/products?category=food"
            className="text-xs font-bold text-[#7B61FF] hover:underline"
          >
            View all food &amp; treats →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foodProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Pharmacy & Wellness ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-rose-600">
              Health &amp; Pharmacy
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Parasite Control, Supplements &amp; Care
            </h2>
          </div>
          <Link
            href="/products?category=medicine"
            className="text-xs font-bold text-[#7B61FF] hover:underline"
          >
            View all medicines →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicineProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Why Choose Furr Market ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Why Sri Lankan Pet Parents Trust Furr
            </h2>
            <p className="text-xs text-stone-500 mt-2">
              We operate alongside accredited veterinary clinics to deliver only certified, authentic pet care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#7B61FF] text-2xl flex items-center justify-center mx-auto">
                🛡️
              </div>
              <h3 className="font-bold text-stone-900 text-sm">100% Authentic &amp; Vet-Approved</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Directly sourced from authorized distributors of Royal Canin, Hill&apos;s, NexGard, and Bravecto.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
                🚀
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Express Island-Wide Delivery</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Same-day dispatch in Colombo and Gampaha; 2-3 business days to Kandy, Galle, Jaffna, and beyond.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 text-2xl flex items-center justify-center mx-auto">
                🩺
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Direct Clinic Integration</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Seamlessly request doctor prescription refills through your pet profile or hospital visit records.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
