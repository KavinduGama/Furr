'use client';

import React from 'react';
import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@furr/core';

export function Footer() {
  return (
    <footer className="bg-[#111827] text-white pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#5A3EE5] flex items-center justify-center text-white font-black text-base shadow-md">
                🐾
              </div>
              <span className="font-black text-xl tracking-tight text-white flex items-center">
                FURR <span className="text-[#7B61FF] ml-1 font-extrabold text-sm tracking-wider uppercase">MARKET</span>
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Sri Lanka&apos;s premier online pet pharmacy, nutrition store, and wellness ecosystem.
              Delivering verified veterinary supplies and premium care items straight to your doorstep.
            </p>
            <div className="pt-2 flex items-center gap-3 text-stone-400 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SLVC Certified Products
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {PRODUCT_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.id}`} className="hover:text-white transition">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  Track Orders
                </Link>
              </li>
              <li>
                <a href="https://furr-labs.com" className="hover:text-white transition">
                  Furr Pet SuperApp
                </a>
              </li>
              <li>
                <a href="https://vet.furr-labs.com" className="hover:text-white transition">
                  Furr Clinic Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Colombo Hotline: +94 11 234 5678</li>
              <li>Email: support@furr-labs.com</li>
              <li>Delivery Info: 2-3 Business Days</li>
              <li>Returns: 30-Day Money Back</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Furr Labs (Pvt) Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
