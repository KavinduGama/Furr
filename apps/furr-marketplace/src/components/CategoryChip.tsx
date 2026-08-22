'use client';

import React from 'react';
import type { ProductCategory } from '@furr/core';

interface CategoryChipProps {
  id: ProductCategory | 'all';
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
}

export function CategoryChip({
  label,
  isSelected,
  onClick,
  count,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
        isSelected
          ? 'bg-[#7B61FF] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 hover:border-stone-300'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
