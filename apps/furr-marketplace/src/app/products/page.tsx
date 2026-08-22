'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplace, type SortOption } from '@/context/MarketplaceContext';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChip } from '@/components/CategoryChip';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@furr/core';

function ProductsContent() {
  const searchParams = useSearchParams();
  const {
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSpecies,
    setSelectedSpecies,
    sortBy,
    setSortBy,
  } = useMarketplace();

  // Sync with URL query parameters on initial load
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && (PRODUCT_CATEGORIES.some((c) => c.id === cat) || cat === 'all')) {
      setSelectedCategory(cat as ProductCategory | 'all');
    }
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
    const sp = searchParams.get('species');
    if (sp && (sp === 'dog' || sp === 'cat' || sp === 'all')) {
      setSelectedSpecies(sp as 'dog' | 'cat' | 'all');
    }
  }, [searchParams, setSelectedCategory, setSearchQuery, setSelectedSpecies]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSpecies !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSpecies('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Pet Care Catalogue
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Browse our complete collection of verified pet supplies, food, and medicines.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="sort-select" className="text-xs font-bold text-stone-500">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none focus:border-[#7B61FF] cursor-pointer"
          >
            <option value="featured">Featured / Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Sidebar Filters ────────────────────────────────────── */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-stone-200/90 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-stone-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#7B61FF] hover:underline cursor-pointer"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Search in Catalog */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#7B61FF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Species */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <label className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Pet Species
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Pets' },
                { id: 'dog', label: '🐶 Dogs' },
                { id: 'cat', label: '🐱 Cats' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpecies(sp.id as 'all' | 'dog' | 'cat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedSpecies === sp.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <label className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Categories
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex justify-between items-center ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-50 text-[#7B61FF]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-50 text-[#7B61FF]'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Products Grid ───────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Chips & Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip
                id="all"
                label="All Categories"
                isSelected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              {PRODUCT_CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  id={cat.id}
                  label={cat.label}
                  isSelected={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-stone-500 whitespace-nowrap">
              Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-stone-100 rounded-2xl animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 text-2xl flex items-center justify-center mx-auto">
                🔍
              </div>
              <h3 className="text-lg font-black text-stone-900">No products found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your selected filters or search query.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-full text-xs font-black text-white bg-[#7B61FF] hover:bg-[#5A3EE5] transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-[#7B61FF] rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
