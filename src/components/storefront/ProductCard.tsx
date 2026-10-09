import React, { useState } from 'react';
import { Product } from '../../types';
import { useCommerce } from '../../context/CommerceContext';
import { ShoppingBag, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { theme, addToCart } = useCommerce();
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const isOutOfStock = product.manageStock && product.stockQuantity === 0;
  const isLowStock = product.manageStock && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockAmount;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (product.attributes && product.attributes.length > 0) {
      // Open detail so user can choose variation options
      onOpenDetail(product);
      return;
    }
    addToCart(product, 1);
  };

  const discountPercent =
    product.salePrice && product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : null;

  return (
    <div
      onClick={() => onOpenDetail(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col justify-between bg-white rounded-lg border border-neutral-200/90 hover:border-neutral-400 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={isHovered && product.images.length > 1 ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2.5 left-2.5 bg-amber-600/90 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
            Only {product.stockQuantity} Left
          </span>
        ) : null}

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2 rounded text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors ${
              isOutOfStock
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-black'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : product.attributes && product.attributes.length > 0
                ? 'Choose Options'
                : 'Add to Bag'}
            </span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
            <span>{product.category}</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono text-neutral-700 font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & SKU */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="font-mono text-sm">
            {product.salePrice ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900">${product.salePrice.toFixed(2)}</span>
                <span className="text-neutral-400 line-through text-xs">${product.regularPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-neutral-900">${product.regularPrice.toFixed(2)}</span>
            )}
          </div>

          <span className="text-[11px] font-mono text-neutral-400">{product.sku}</span>
        </div>
      </div>
    </div>
  );
};
