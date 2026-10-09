import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Product } from '../../types';
import { Plus, Search, Filter, Edit, Trash2, ExternalLink, AlertTriangle, Check, ArrowUpDown } from 'lucide-react';

interface ProductsManagerProps {
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({ onOpenAddProduct, onEditProduct }) => {
  const { products, deleteProduct, adjustStock, setViewMode } = useCommerce();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState<number>(0);

  // Categories list
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    const matchesStock =
      selectedStockFilter === 'all' ||
      (selectedStockFilter === 'instock' && p.stockQuantity > p.lowStockAmount) ||
      (selectedStockFilter === 'lowstock' && p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAmount) ||
      (selectedStockFilter === 'outofstock' && p.stockQuantity === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleSaveInlineStock = (productId: string) => {
    adjustStock(productId, inlineStockVal);
    setEditingStockId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Products Catalog</h2>
          <p className="text-xs text-neutral-500">
            Manage your store catalog, multiple product photography, SKU variants, and live pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products by title, SKU, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white"
          >
            <option value="all">All Categories</option>
            {categories
              .filter((c) => c !== 'all')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value as typeof selectedStockFilter)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white"
          >
            <option value="all">All Stock Statuses</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock (≤ threshold)</option>
            <option value="outofstock">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Stock & Quantity</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isStockEditing = editingStockId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded border border-neutral-200 overflow-hidden shrink-0 bg-neutral-100">
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 font-mono">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block hover:underline cursor-pointer" onClick={() => onEditProduct(p)}>
                              {p.name}
                            </span>
                            <span className="text-[11px] text-neutral-500 block line-clamp-1">
                              {p.shortDescription || p.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono text-neutral-600">{p.sku}</td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level & Inline Edit */}
                      <td className="py-3 px-3">
                        {isStockEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={inlineStockVal}
                              onChange={(e) => setInlineStockVal(parseInt(e.target.value, 10) || 0)}
                              className="w-16 text-xs px-1.5 py-1 rounded border border-neutral-400 font-mono"
                            />
                            <button
                              onClick={() => handleSaveInlineStock(p.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Confirm stock change"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setInlineStockVal(p.stockQuantity);
                              }}
                              className="font-mono font-semibold hover:underline"
                              title="Click to quickly edit stock"
                            >
                              <span
                                className={`${
                                  p.stockQuantity === 0
                                    ? 'text-red-600'
                                    : p.stockQuantity <= p.lowStockAmount
                                    ? 'text-amber-600'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {p.stockQuantity} in stock
                              </span>
                            </button>
                            {p.stockQuantity <= p.lowStockAmount && p.stockQuantity > 0 && (
                              <span className="text-[10px] text-amber-600 font-medium">(Low)</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-mono">
                        {p.salePrice ? (
                          <div>
                            <span className="font-semibold text-neutral-900">${p.salePrice.toFixed(2)}</span>
                            <span className="text-neutral-400 line-through ml-1.5 text-[11px]">
                              ${p.regularPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-neutral-900">${p.regularPrice.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
