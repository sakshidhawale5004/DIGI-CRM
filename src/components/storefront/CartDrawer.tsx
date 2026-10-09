import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    theme,
  } = useCommerce();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 120;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCouponCode(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-3 bg-neutral-100/70 border-b border-neutral-200 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1 font-medium text-neutral-700">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-neutral-500" />
              {amountRemaining === 0 ? (
                <span className="text-emerald-700 font-semibold">You unlocked Free Standard Shipping!</span>
              ) : (
                <span>
                  Add <strong className="font-mono text-neutral-900">${amountRemaining.toFixed(2)}</strong> for Free Shipping
                </span>
              )}
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Body: Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-neutral-400">
              <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">Your shopping bag is empty</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Explore our catalog to add handcrafted items and essentials to your cart.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="pt-4 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md border border-neutral-200 bg-neutral-50 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-neutral-900 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedAttributes && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-neutral-500 hover:text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-[11px] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-neutral-500 hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-mono font-semibold text-neutral-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Coupon, Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-neutral-50/70 space-y-4">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Tag className="w-3 h-3" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[11px] font-sans">
                      ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.amount}% off` : `$${appliedCoupon.amount} off`})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded border border-neutral-300 uppercase font-mono bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-neutral-800 text-white rounded text-xs font-medium hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-neutral-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Discount</span>
                  <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>Taxes & Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-200 pt-2">
                <span>Estimated Total</span>
                <span className="font-mono">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 px-4 rounded-md text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
