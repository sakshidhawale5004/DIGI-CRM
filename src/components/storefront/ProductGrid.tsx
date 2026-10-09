import React, { useState } from 'react';
import { Product } from '../../types';
import { useCommerce } from '../../context/CommerceContext';
import { ProductCard } from './ProductCard';
import { ArrowUpDown, SlidersHorizontal, Check } from 'lucide-react';

interface ProductGridProps {
  onOpenDetail: (product: Product) => void;
  searchQuery: string;
  activeCategory: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onOpenDetail,
  searchQuery,
  activeCategory,
}) => {
  const { products, theme } = useCommerce();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = !inStockOnly || !p.manageStock || p.stockQuantity > 0;
      return matchCat && matchQuery && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  const gridColsClass =
    theme.gridColumns === 4
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Controls & Counts Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight text-neutral-900"
            style={{ fontFamily: theme.fontHeading }}
          >
            {activeCategory === 'All' ? 'Complete Catalog' : `${activeCategory} Collection`}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Showing {filtered.length} curated product{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Sort & Stock Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600 select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-neutral-900 w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1 text-xs text-neutral-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white focus:outline-hidden"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Releases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-800">No products found</p>
          <p className="text-xs text-neutral-500">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-6 pt-6`}>
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}
    </section>
  );
};
