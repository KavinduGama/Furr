'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CATEGORIES } from '@furr/core';

export function Navbar() {
  const router = useRouter();
  const { cartItemCount, searchQuery, setSearchQuery, setIsDrawerOpen } = useMarketplace();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      {/* Top Banner */}
      <div className="bg-[#111827] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wider">
        <span>🐾 FREE EXPRESS DELIVERY ON ORDERS OVER LKR 10,000 · ISLAND-WIDE IN SRI LANKA</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#5A3EE5] flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              🐾
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-stone-900 flex items-center">
                FURR <span className="text-[#7B61FF] ml-1 font-extrabold text-sm tracking-wider uppercase">MARKET</span>
              </span>
              <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase block -mt-1">
                Pet Store &amp; Pharmacy
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search food, toys, medicine, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-900 placeholder-stone-400 text-sm rounded-full border border-transparent focus:border-[#7B61FF] focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              <svg
                className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-stone-700">
            <Link href="/products" className="hover:text-[#7B61FF] transition-colors">
              Explore All
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#7B61FF] transition-colors cursor-pointer py-2">
                <span>Categories</span>
                <svg className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full -left-4 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 hidden group-hover:block animate-fade-in z-50">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-[#7B61FF] transition"
                  >
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/orders" className="hover:text-[#7B61FF] transition-colors">
              My Orders
            </Link>
          </nav>

          {/* Actions: Cart & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              title="Shopping Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute 0 top-1 -right-0.5 min-w-[20px] h-5 px-1 bg-[#7B61FF] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-stone-100 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#7B61FF] font-black text-xs flex items-center justify-center">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-bold text-stone-800 hidden sm:inline max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Signed In As</p>
                      <p className="text-xs font-bold text-stone-800 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl transition"
                    >
                      Track My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-black text-white bg-stone-900 hover:bg-[#7B61FF] transition shadow-xs"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search food, toys, medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 text-stone-900 placeholder-stone-400 text-xs rounded-full border border-transparent outline-none"
              />
              <svg
                className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 space-y-2 animate-fade-in">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-800 hover:bg-stone-100"
            >
              All Products
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-stone-800 hover:bg-stone-100"
            >
              My Orders
            </Link>
            {!user && (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-[#7B61FF] hover:bg-indigo-50"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
