import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Customer } from '../../types';
import { Users, Search, Plus, Mail, Phone, MapPin, DollarSign, Calendar, MessageSquare, Shield, X, Check, Download } from 'lucide-react';
import { exportCustomersToCSV } from '../../utils/csvExport';

interface CustomersCrmProps {
  onOpenCustomer: (customerId: string) => void;
}

export const CustomersCrm: React.FC<CustomersCrmProps> = ({ onOpenCustomer }) => {
  const { customers, addCustomer, showToast } = useCommerce();

  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | Customer['segment']>('all');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // New customer form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newSegment, setNewSegment] = useState<Customer['segment']>('New');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    const matchesSegment = segmentFilter === 'all' || c.segment === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  const totalCrmLtv = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.segment === 'VIP').length;
  const atRiskCount = customers.filter((c) => c.segment === 'At-Risk').length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addCustomer({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      city: newCity.trim(),
      postalCode: newPostalCode.trim(),
      country: newCountry.trim(),
      segment: newSegment,
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewCity('');
    setNewPostalCode('');
    setShowAddCustomerModal(false);
  };

  const getSegmentBadge = (seg: Customer['segment']) => {
    switch (seg) {
      case 'VIP':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Regular':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'At-Risk':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-800" />
            <span>Customer Relationship Management (CRM)</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Track customer lifetime values (LTV), order frequency, segment VIP buyers, and keep staff notes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              exportCustomersToCSV(filteredCustomers);
              showToast(`Exported ${filteredCustomers.length} customer records to CSV.`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-md text-xs font-medium shadow-xs transition-colors"
            title="Export customer list to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export Customers CSV ({filteredCustomers.length})</span>
          </button>

          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Customer Profile</span>
          </button>
        </div>
      </div>

      {/* CRM Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Combined Customer LTV
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            ${totalCrmLtv.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Cumulative customer spend</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Total CRM Profiles
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {customers.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Registered store accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            VIP Clients ($500+ Spend)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-2">
            {vipCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">High lifetime value cohort</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            At-Risk Accounts
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-2">
            {atRiskCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Require re-engagement coupon</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs">
          {(['all', 'VIP', 'Regular', 'New', 'At-Risk'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                segmentFilter === seg
                  ? 'bg-white shadow-xs font-semibold text-neutral-900'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Segment</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3 text-right">Lifetime Value</th>
                <th className="py-3 px-3">Last Purchase</th>
                <th className="py-3 px-3 text-center">Internal Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No customers found matching this segment or query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onOpenCustomer(c.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-300 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-neutral-900 block hover:underline">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getSegmentBadge(
                          c.segment
                        )}`}
                      >
                        {c.segment}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 text-neutral-600">
                      <div>{c.city}</div>
                      <div className="text-[10px] text-neutral-400">{c.country}</div>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-neutral-800">
                      {c.orderCount}
                    </td>

                    {/* LTV */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-900">
                      ${c.totalSpent.toFixed(2)}
                    </td>

                    {/* Last Purchase */}
                    <td className="py-3 px-3 text-neutral-600">
                      {c.lastOrderAt ? (
                        <div>{new Date(c.lastOrderAt).toLocaleDateString()}</div>
                      ) : (
                        <span className="text-neutral-400 italic">Never</span>
                      )}
                    </td>

                    {/* Notes count */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        <MessageSquare className="w-3 h-3 text-neutral-400" />
                        <span>{c.notes.length}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCustomer(c.id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                      >
                        Open CRM File
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
              <h3 className="text-sm font-semibold text-neutral-900">New Customer Profile</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Anderson"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="liam@example.com"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-neutral-700">Phone</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-700">Street Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="123 Market Street"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-700">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-neutral-700">Postal Code</label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="94103"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-neutral-700">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-700">CRM Segment Tier</label>
                <select
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value as Customer['segment'])}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white"
                >
                  <option value="New">New Customer</option>
                  <option value="Regular">Regular Buyer</option>
                  <option value="VIP">VIP Client</option>
                  <option value="At-Risk">At-Risk</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-black rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
