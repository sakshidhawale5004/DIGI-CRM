import React, { useState } from 'react';
import { Product } from '../../types';
import { useCommerce } from '../../context/CommerceContext';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Check, Minus, Plus, Zap } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onInstantBuy: (product: Product, quantity: number, selectedAttributes: Record<string, string>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuy,
}) => {
  const { theme, addToCart } = useCommerce();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Initialize selected attributes with first available options
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.attributes) {
      product.attributes.forEach((attr) => {
        if (attr.options.length > 0) {
          initial[attr.name] = attr.options[0];
        }
      });
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const isOutOfStock = product.manageStock && product.stockQuantity === 0;
  const isLowStock = product.manageStock && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockAmount;

  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedAttributes);
    onClose();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onInstantBuy(product, quantity, selectedAttributes);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>{product.category}</span>
            <span>/</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Multi-Image Gallery */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded shadow-md">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Buy Box */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Rating & Stock */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-mono font-medium text-neutral-800">{product.rating.toFixed(1)}</span>
                    <span className="text-neutral-400">({product.reviewCount} reviews)</span>
                  </div>

                  {/* Stock status indicator */}
                  {isOutOfStock ? (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Low Stock: Only {product.stockQuantity} left
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      In Stock ({product.stockQuantity} available)
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <div>
                  <h1
                    className="text-2xl font-bold tracking-tight text-neutral-900 leading-snug"
                    style={{ fontFamily: theme.fontHeading }}
                  >
                    {product.name}
                  </h1>

                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    {product.salePrice ? (
                      <>
                        <span className="text-2xl font-bold text-neutral-900">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-neutral-400 line-through">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-sans font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded ml-1">
                          Save ${(product.regularPrice - product.salePrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-neutral-900">
                        ${product.regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Attributes / Variations Selector */}
                {product.attributes && product.attributes.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-neutral-100">
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider block">
                          {attr.name}: <span className="font-normal text-neutral-600">{selectedAttributes[attr.name]}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {attr.options.map((opt) => {
                            const isSelected = selectedAttributes[attr.name] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleAttributeChange(attr.name, opt)}
                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                  isSelected
                                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-2 text-neutral-600 hover:text-black disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-xs font-semibold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) =>
                            product.manageStock && !product.allowBackorders
                              ? Math.min(product.stockQuantity, q + 1)
                              : q + 1
                          )
                        }
                        disabled={
                          isOutOfStock ||
                          (product.manageStock && !product.allowBackorders && quantity >= product.stockQuantity)
                        }
                        className="p-2 text-neutral-600 hover:text-black disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] text-neutral-400">
                      Total: ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                      isOutOfStock
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Bag'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 py-3 px-4 rounded-md text-xs font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now (Express)</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Worldwide Tracked Shipping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>30-Day Guaranteed Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Description & Reviews */}
          <div className="mt-10 border-t border-neutral-200 pt-6 space-y-4">
            <div className="flex items-center gap-4 border-b border-neutral-200 text-xs">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'desc'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Shopper Reviews ({product.reviewCount})
              </button>
            </div>

            {activeTab === 'desc' ? (
              <div className="text-xs text-neutral-600 leading-relaxed max-w-2xl space-y-2">
                <p>{product.description}</p>
                <div className="pt-2">
                  <span className="font-semibold text-neutral-800 block mb-1">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((t, i) => (
                      <span key={i} className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs max-w-2xl">
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Verified Buyer</span>
                    <span className="text-[11px] text-neutral-400">2 weeks ago</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-600">
                    Outstanding craftsmanship and premium feel. Arrived very well protected and exceeding expectations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
