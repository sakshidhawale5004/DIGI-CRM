import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { X, Truck, CheckCircle2, Clock, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onViewCustomer?: (customerId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose, onViewCustomer }) => {
  const { orders, updateOrderStatus, updateOrderTracking } = useCommerce();
  const order = orders.find((o) => o.id === orderId);

  const [trackingInput, setTrackingInput] = useState(order?.trackingCode || '');
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  if (!order) return null;

  const handleStatusChange = (status: Order['status']) => {
    updateOrderStatus(order.id, status);
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderTracking(order.id, trackingInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-neutral-900">
                Order {order.orderNumber}
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvoicePrint(!showInvoicePrint)}
              className="flex items-center gap-1 text-xs text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded transition-colors"
              title="Print Order Receipt / Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{showInvoicePrint ? 'Hide Invoice' : 'Invoice'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Printable Invoice View Mode */}
          {showInvoicePrint ? (
            <div className="border border-neutral-300 rounded-lg p-6 bg-white space-y-6 shadow-xs font-sans">
              <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">COMMERCIAL INVOICE</h3>
                  <p className="text-xs text-neutral-500">WooCommerce Storefront & Fulfillment</p>
                  <p className="text-xs font-mono mt-1 text-neutral-800 font-medium">Order: {order.orderNumber}</p>
                </div>
                <div className="text-right text-xs text-neutral-600">
                  <p className="font-semibold text-neutral-900">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Payment: {order.paymentMethod.toUpperCase()}</p>
                  <p>Status: {order.paymentStatus.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-neutral-900 block mb-1">Billed & Shipped To:</span>
                  <p className="font-medium text-neutral-800">{order.shippingAddress.name}</p>
                  <p className="text-neutral-600">{order.shippingAddress.address}</p>
                  <p className="text-neutral-600">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-neutral-600">{order.shippingAddress.country}</p>
                  <p className="text-neutral-600">{order.shippingAddress.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 block mb-1">Shipping Details:</span>
                  <p className="text-neutral-700">Method: {order.shippingMethod}</p>
                  <p className="text-neutral-700 font-mono">
                    Tracking: {order.trackingCode || 'Pending Dispatch'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2 font-medium text-neutral-800">
                        {it.productName}
                        {it.selectedAttributes && Object.keys(it.selectedAttributes).length > 0 && (
                          <span className="block text-[11px] text-neutral-500 font-normal">
                            {Object.entries(it.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center text-neutral-700">{it.quantity}</td>
                      <td className="py-2 text-right text-neutral-700 font-mono">${it.price.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-medium text-neutral-900">
                        ${(it.price * it.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-neutral-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({order.couponApplied})</span>
                      <span className="font-mono">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-mono">${order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax (8%)</span>
                    <span className="font-mono">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-sm">
                    <span>Total Due</span>
                    <span className="font-mono">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Order Status & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                    Update Order Status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                      className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-300 bg-white focus:ring-1 focus:ring-neutral-900"
                    >
                      <option value="pending">Pending Payment</option>
                      <option value="processing">Processing & Packing</option>
                      <option value="completed">Completed & Shipped</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Tracking Form */}
                <form onSubmit={handleSaveTracking} className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                    Shipment Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DHL-992104"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-md border border-neutral-300 bg-white font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* Items Purchased List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Order Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                </h3>

                <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.productName}
                          className="w-12 h-12 object-cover rounded border border-neutral-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{it.productName}</p>
                          {it.selectedAttributes && (
                            <p className="text-[11px] text-neutral-500">
                              {Object.entries(it.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-500">Qty: {it.quantity} × ${it.price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="font-mono text-xs font-semibold text-neutral-900">
                        ${(it.price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-200 p-4 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                      Customer Details
                    </h4>
                    {onViewCustomer && order.customerId && (
                      <button
                        onClick={() => {
                          onClose();
                          onViewCustomer(order.customerId);
                        }}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Open CRM</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="font-medium text-neutral-900">{order.customerName}</p>
                  <p className="text-neutral-500">{order.customerEmail}</p>
                  <p className="text-neutral-500">{order.shippingAddress.phone}</p>
                </div>

                <div className="border border-neutral-200 p-4 rounded-lg space-y-1.5 text-xs">
                  <h4 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Shipping Destination
                  </h4>
                  <p className="text-neutral-700">{order.shippingAddress.address}</p>
                  <p className="text-neutral-700">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-neutral-700">{order.shippingAddress.country}</p>
                  <p className="text-neutral-500 text-[11px] pt-1">
                    Via: {order.shippingMethod}
                  </p>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount {order.couponApplied ? `(${order.couponApplied})` : ''}</span>
                      <span className="font-mono">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-mono">
                      {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Estimated Tax</span>
                    <span className="font-mono">${order.tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-300 pt-2 text-sm">
                    <span>Total Paid</span>
                    <span className="font-mono">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-200 bg-neutral-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
