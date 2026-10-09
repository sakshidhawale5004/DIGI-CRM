import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { ShoppingBag, Search, Eye, Printer, Truck, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';
import { Order } from '../../types';
import { exportOrdersToCSV } from '../../utils/csvExport';

interface OrdersManagerProps {
  onOpenOrder: (orderId: string) => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ onOpenOrder }) => {
  const { orders, updateOrderStatus, showToast } = useCommerce();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportOrders = () => {
    exportOrdersToCSV(filteredOrders);
    showToast(`Exported ${filteredOrders.length} order history records to CSV.`);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <span>Orders & Fulfillment</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Track customer checkouts, shipping fulfillment, automated invoice generation, and courier tracking.
          </p>
        </div>

        <button
          onClick={handleExportOrders}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-md text-xs font-medium shadow-xs transition-colors"
          title="Export order history to CSV spreadsheet"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>Export Orders CSV ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order number, customer name, email, or tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs overflow-x-auto">
          {(['all', 'pending', 'processing', 'completed', 'refunded', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded capitalize transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white shadow-xs font-semibold text-neutral-900'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items Purchased</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No orders matching your query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Order # */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenOrder(o.id)}
                        className="font-mono font-semibold text-neutral-900 hover:underline text-left block"
                      >
                        {o.orderNumber}
                      </button>
                      {o.trackingCode && (
                        <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                          <Truck className="w-3 h-3 text-neutral-500" />
                          <span>{o.trackingCode}</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-neutral-600">
                      <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-neutral-400">
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-neutral-900">{o.customerName}</div>
                      <div className="text-[11px] text-neutral-500">{o.customerEmail}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3">
                      <div className="flex items-center -space-x-1.5">
                        {o.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt={item.productName}
                            title={`${item.quantity}x ${item.productName}`}
                            className="w-7 h-7 rounded-full object-cover border-2 border-white"
                          />
                        ))}
                        {o.items.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                            +{o.items.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        {o.items.reduce((acc, it) => acc + it.quantity, 0)} units
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] uppercase bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">
                        {o.paymentMethod}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900">
                      ${o.total.toFixed(2)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                        className={`text-xs px-2 py-1 rounded font-medium border border-neutral-300 capitalize ${getStatusBadge(
                          o.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="refunded">Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenOrder(o.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
