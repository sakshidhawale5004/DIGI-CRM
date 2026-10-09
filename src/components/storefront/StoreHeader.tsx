import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { ShoppingBag, Search, LayoutDashboard, ChevronRight } from 'lucide-react';

interface StoreHeaderProps {
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  onOpenCart,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}) => {
  const { theme, cartCount, cartTotal, setViewMode, products } = useCommerce();

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-colors">
      {/* 1. Announcement Bar */}
      {theme.showAnnouncement && theme.announcementText && (
        <div
          className="text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <span>{theme.announcementText}</span>
        </div>
      )}

      {/* 2. Main Store Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveCategory('All')}>
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight select-none uppercase"
              style={{
                fontFamily: theme.fontHeading,
                color: theme.primaryColor,
              }}
            >
              {theme.storeName}
            </span>
            {theme.storeTagline && (
              <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-medium -mt-0.5">
                {theme.storeTagline}
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-full border border-neutral-200 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/60"
              />
            </div>
          </div>

          {/* Right Actions: Admin Link & Cart Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('admin')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors"
              title="Access WooCommerce Admin & CRM"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-violet-600" />
              <span>WooCommerce CRM</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-white shadow-xs transition-transform active:scale-95"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full font-mono text-[11px]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Category Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-neutral-100 text-xs no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs ${
                  isActive
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
