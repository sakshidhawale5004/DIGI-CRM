import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { X, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag, Plus, MessageSquare, ShieldCheck, Download } from 'lucide-react';
import { exportOrdersToCSV } from '../../utils/csvExport';

interface CustomerDetailModalProps {
  customerId: string;
  onClose: () => void;
  onOpenOrder: (orderId: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customerId, onClose, onOpenOrder }) => {
  const { customers, orders, addCustomerNote, updateCustomer, showToast } = useCommerce();
  const [newNote, setNewNote] = useState('');
  const [authorName, setAuthorName] = useState('Staff Agent');

  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.customerEmail.toLowerCase() === customer.email.toLowerCase()
  );

  const avgOrderValue = customer.orderCount > 0 ? (customer.totalSpent / customer.orderCount).toFixed(2) : '0.00';

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerNote(customer.id, newNote.trim(), authorName.trim() || 'Admin');
    setNewNote('');
  };

  const handleSegmentChange = (segment: typeof customer.segment) => {
    updateCustomer(customer.id, { segment });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-sm">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-900">{customer.name}</h2>
                <span className="text-[11px] text-neutral-500 font-mono">ID: {customer.id}</span>
              </div>
              <p className="text-xs text-neutral-500">{customer.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key CRM Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg">
              <span className="text-[11px] text-neutral-500 block">Lifetime Value (LTV)</span>
              <span className="text-xl font-bold font-mono text-neutral-900">
                ${customer.totalSpent.toFixed(2)}
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg">
              <span className="text-[11px] text-neutral-500 block">Completed Orders</span>
              <span className="text-xl font-bold font-mono text-neutral-900">
                {customer.orderCount}
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg">
              <span className="text-[11px] text-neutral-500 block">Avg. Order Value</span>
              <span className="text-xl font-bold font-mono text-neutral-900">
                ${avgOrderValue}
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg">
              <span className="text-[11px] text-neutral-500 block mb-1">CRM Segment</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={customer.segment}
                  onChange={(e) => handleSegmentChange(e.target.value as typeof customer.segment)}
                  className="text-xs font-semibold px-2 py-1 rounded border border-neutral-300 bg-white"
                >
                  <option value="VIP">VIP Customer</option>
                  <option value="Regular">Regular Buyer</option>
                  <option value="New">New Customer</option>
                  <option value="At-Risk">At-Risk (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details & Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50/50 p-4 rounded-lg border border-neutral-200">
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                Contact & Account Details
              </h4>
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>{customer.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Member since {new Date(customer.registeredAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                Primary Shipping Address
              </h4>
              <div className="flex items-start gap-2 text-neutral-600">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p>{customer.address || 'Street address on file'}</p>
                  <p>
                    {customer.city}
                    {customer.postalCode ? `, ${customer.postalCode}` : ''}
                  </p>
                  <p>{customer.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Orders History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Order History ({customerOrders.length})
              </h3>
              {customerOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    exportOrdersToCSV(customerOrders);
                    showToast(`Exported ${customerOrders.length} orders for ${customer.name} to CSV.`);
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition-colors"
                >
                  <Download className="w-3 h-3 text-neutral-500" />
                  <span>Export History CSV</span>
                </button>
              )}
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-200">
                No purchases recorded yet for this customer profile.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 hover:bg-neutral-50 transition-colors flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenOrder(ord.id);
                          }}
                          className="font-mono font-semibold text-neutral-900 hover:underline"
                        >
                          {ord.orderNumber}
                        </button>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-500">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span
                          className={`capitalize font-medium ${
                            ord.status === 'completed'
                              ? 'text-emerald-600'
                              : ord.status === 'processing'
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-semibold text-neutral-900">
                        ${ord.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenOrder(ord.id);
                        }}
                        className="block text-[11px] text-neutral-600 hover:text-black font-medium mt-0.5"
                      >
                        View Order →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CRM Internal Staff Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Internal CRM Notes & Log ({customer.notes.length})
            </h3>
            <p className="text-[11px] text-neutral-500">
              Private staff notes regarding customer preferences, support conversations, and VIP handling.
            </p>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Add a new note about this customer..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 bg-white"
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-28 text-xs px-2.5 py-2 rounded-md border border-neutral-300 focus:outline-hidden bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>
            </form>

            {/* Notes Timeline */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customer.notes.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No notes logged yet.</p>
              ) : (
                customer.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-white border border-neutral-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="font-semibold text-neutral-800">{note.author}</span>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-neutral-700">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
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
