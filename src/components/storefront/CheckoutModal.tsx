import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Product, Order } from '../../types';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem?: {
    product: Product;
    quantity: number;
    selectedAttributes?: Record<string, string>;
  } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directBuyItem,
}) => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    createOrder,
    theme,
    setViewMode,
    setAdminTab,
    setSelectedOrderIdForDetail,
  } = useCommerce();

  // If direct buy, use that single item; otherwise use cart
  const checkoutItems = directBuyItem
    ? [directBuyItem]
    : cart.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        selectedAttributes: i.selectedAttributes,
      }));

  // Step 1: Contact & Address
  const [name, setName] = useState('Sophia Laurent');
  const [email, setEmail] = useState('sophia.laurent@example.com');
  const [phone, setPhone] = useState('+1 (555) 782-9901');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Portland');
  const [postalCode, setPostalCode] = useState('97201');
  const [country, setCountry] = useState('United States');

  // Step 2: Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cod' | 'klarna'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardholderName, setCardholderName] = useState('Sophia Laurent');

  // Order Bump Upsell
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const ORDER_BUMP_PRICE = 6.5;

  // Order Placement State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Financial calculations
  const itemsSubtotal = checkoutItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (itemsSubtotal * appliedCoupon.amount) / 100;
    } else {
      discount = Math.min(itemsSubtotal, appliedCoupon.amount);
    }
  }

  // Shipping calculation
  const shippingCost =
    shippingMethod === 'standard'
      ? itemsSubtotal >= 120
        ? 0
        : 9.0
      : shippingMethod === 'express'
      ? 15.0
      : 26.0;

  const bumpTotal = includeOrderBump ? ORDER_BUMP_PRICE : 0;
  const taxableAmount = Math.max(0, itemsSubtotal - discount + bumpTotal);
  const estimatedTax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const finalTotal = Math.round((taxableAmount + shippingCost + estimatedTax) * 100) / 100;

  const handleAutofillDemoUser = () => {
    setName('Marcus Sterling');
    setEmail('marcus.sterling@studio.io');
    setPhone('+1 (555) 304-8910');
    setAddress('88 Townsend Street, Suite 400');
    setCity('San Francisco');
    setPostalCode('94107');
    setCountry('United States');
  };

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const order = createOrder({
        customerInfo: {
          name,
          email,
          phone,
          address,
          city,
          postalCode,
          country,
        },
        items: checkoutItems,
        shippingMethod:
          shippingMethod === 'standard'
            ? 'Standard Ground (3-5 days)'
            : shippingMethod === 'express'
            ? 'Express Priority (1-2 days)'
            : 'Next-Day Air Overnight',
        shippingCost,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      setIsSubmitting(false);
      setPlacedOrder(order);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              {placedOrder ? 'Order Confirmed' : 'WooCommerce Seamless Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {placedOrder ? (
          /* Confirmation Receipt View */
          <div className="p-8 overflow-y-auto text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3
                className="text-2xl font-bold tracking-tight text-neutral-900"
                style={{ fontFamily: theme.fontHeading }}
              >
                Thank you for your order, {placedOrder.shippingAddress.name}!
              </h3>
              <p className="text-xs text-neutral-500">
                Order confirmation and tracking details sent to <strong className="text-neutral-800">{placedOrder.customerEmail}</strong>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="max-w-md mx-auto bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Order Reference:</span>
                <span className="font-mono font-bold text-neutral-900">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Tracking Number:</span>
                <span className="font-mono text-emerald-700 font-semibold">{placedOrder.trackingCode}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Fulfillment Method:</span>
                <span className="text-neutral-800">{placedOrder.shippingMethod}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Inventory Status:</span>
                <span className="text-emerald-700 font-semibold">Stock Automatically Deducted in Real-Time</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-neutral-900">
                <span>Total Paid:</span>
                <span className="font-mono">${placedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  setViewMode('admin');
                  setAdminTab('orders');
                  setSelectedOrderIdForDetail(placedOrder.id);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Inspect in WooCommerce CRM</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-md text-xs font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Section One-Page Checkout Form */
          <form onSubmit={handleProcessOrder} className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Left Column: Details & Payment (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-6">
                {/* 1. Customer & Shipping info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>1. Customer & Shipping Details</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAutofillDemoUser}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      title="Quick autofill with demo customer"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Autofill Demo Shopper</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Phone *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Country *</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-neutral-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-neutral-200" />

                {/* 2. Shipping Options */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. Delivery Speed & Carrier</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <label
                      onClick={() => setShippingMethod('standard')}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        shippingMethod === 'standard'
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="text-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">Standard Ground Delivery</p>
                          <p className="text-[11px] text-neutral-500">Estimated 3 to 5 business days</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-neutral-900">
                        {itemsSubtotal >= 120 ? 'Free' : '$9.00'}
                      </span>
                    </label>

                    <label
                      onClick={() => setShippingMethod('express')}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        shippingMethod === 'express'
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="text-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">Express Priority Courier</p>
                          <p className="text-[11px] text-neutral-500">Estimated 1 to 2 business days</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-neutral-900">$15.00</span>
                    </label>

                    <label
                      onClick={() => setShippingMethod('overnight')}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        shippingMethod === 'overnight'
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'overnight'}
                          onChange={() => setShippingMethod('overnight')}
                          className="text-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">Next-Day Air Overnight</p>
                          <p className="text-[11px] text-neutral-500">Arrives by 10:30 AM tomorrow</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-neutral-900">$26.00</span>
                    </label>
                  </div>
                </div>

                <hr className="border-neutral-200" />

                {/* 3. Payment Method */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. Payment Method</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 px-3 text-xs rounded-md border font-medium transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-2 px-3 text-xs rounded-md border font-medium transition-colors ${
                        paymentMethod === 'apple_pay'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      Apple / G-Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`py-2 px-3 text-xs rounded-md border font-medium transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      Cash on Delivery
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-medium text-neutral-700">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono bg-white"
                          />
                          <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-medium text-neutral-700">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-medium text-neutral-700">CVC Code</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. One-Click Order Bump Upsell */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOrderBump}
                      onChange={(e) => setIncludeOrderBump(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        Exclusive Studio Add-on: Organic Linen Care Pouch (+$6.50)
                      </span>
                      <p className="text-[11px] text-neutral-600">
                        Handmade protective storage dustbag for your goods. Highly recommended by 94% of customers.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-neutral-50/80 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Order Summary ({checkoutItems.reduce((a, b) => a + b.quantity, 0)} items)
                  </h3>

                  {/* Items list */}
                  <div className="divide-y divide-neutral-200 max-h-56 overflow-y-auto pr-1">
                    {checkoutItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-11 h-11 object-cover rounded border border-neutral-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-neutral-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-neutral-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {includeOrderBump && (
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-amber-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Organic Linen Care Pouch</span>
                        </div>
                        <span className="font-mono font-semibold text-neutral-900">${ORDER_BUMP_PRICE.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 border-t border-neutral-200 pt-3 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-mono text-neutral-900">${itemsSubtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Coupon Discount</span>
                        <span className="font-mono">-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-mono">
                        {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Estimated Tax (8%)</span>
                      <span className="font-mono">${estimatedTax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-300 pt-3">
                      <span>Total Due</span>
                      <span className="font-mono">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || checkoutItems.length === 0}
                    className="w-full py-3 px-4 rounded-md text-xs font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {isSubmitting ? (
                      <span>Processing Transaction & Decrementing Inventory...</span>
                    ) : (
                      <>
                        <span>Complete Order (${finalTotal.toFixed(2)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit encrypted checkout · Syncs with WooCommerce Inventory</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
