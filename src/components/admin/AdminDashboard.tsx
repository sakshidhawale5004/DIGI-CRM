import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, ArrowUpRight, Plus, Package, Download, FileSpreadsheet } from 'lucide-react';
import { exportCustomersToCSV, exportOrdersToCSV } from '../../utils/csvExport';

export const AdminDashboard: React.FC<{ onOpenAddProduct: () => void }> = ({ onOpenAddProduct }) => {
  const { products, orders, customers, setAdminTab, setSelectedOrderIdForDetail, setSelectedCustomerIdForDetail, showToast } = useCommerce();

  // Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00';
  const lowStockCount = products.filter(
    (p) => p.manageStock && (p.stockStatus === 'lowstock' || p.stockStatus === 'outofstock')
  ).length;

  const recentOrders = [...orders].slice(0, 5);

  const handleExportCustomers = () => {
    exportCustomersToCSV(customers);
    showToast(`Exported ${customers.length} customer profiles to CSV.`);
  };

  const handleExportOrders = () => {
    exportOrdersToCSV(orders);
    showToast(`Exported ${orders.length} order records to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Commerce & CRM Overview</h2>
          <p className="text-xs text-neutral-500">
            Real-time sales telemetry, inventory warnings, and customer relationship highlights.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* CSV Export Dropdown / Buttons */}
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-md text-xs font-medium shadow-xs transition-colors"
            title="Export all CRM customer data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Customers CSV</span>
          </button>

          <button
            onClick={handleExportOrders}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-md text-xs font-medium shadow-xs transition-colors"
            title="Export all order histories to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
            <span>Orders CSV</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>All active store channels</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Avg. Order Value: <span className="font-mono text-neutral-700 font-medium">${avgOrderValue}</span>
            </p>
          </div>
        </div>

        {/* CRM Customers */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {customers.length}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              VIP Tier: <span className="font-medium text-neutral-700">{customers.filter(c => c.segment === 'VIP').length} clients</span>
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between ${
          lowStockCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Stock Alerts</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
              {lowStockCount}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {lowStockCount > 0 ? (
                <button
                  onClick={() => setAdminTab('inventory')}
                  className="text-amber-800 font-medium hover:underline"
                >
                  Action required in inventory →
                </button>
              ) : (
                'All catalog stocks healthy'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Catalog Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Recent Orders</h3>
              <p className="text-[11px] text-neutral-500">Live order queue and shipping fulfillment statuses</p>
            </div>
            <button
              onClick={() => setAdminTab('orders')}
              className="text-xs text-neutral-600 hover:text-black font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-200 text-xs">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrderIdForDetail(ord.id)}
                className="p-3.5 hover:bg-neutral-50 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-neutral-900">{ord.orderNumber}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-800 font-medium">{ord.customerName}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {ord.items.length} item{ord.items.length > 1 ? 's' : ''} · {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono font-semibold text-neutral-900">${ord.total.toFixed(2)}</div>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded capitalize font-medium ${
                      ord.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products / Low Stock Warnings (1 col) */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Catalog Inventory</h3>
                <p className="text-[11px] text-neutral-500">Stock levels & availability</p>
              </div>
              <button
                onClick={() => setAdminTab('inventory')}
                className="text-xs text-neutral-600 hover:text-black font-medium flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-200 text-xs">
              {products.slice(0, 5).map((prod) => (
                <div key={prod.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-9 h-9 object-cover rounded border border-neutral-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-medium text-neutral-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">${prod.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        prod.stockQuantity === 0
                          ? 'text-red-600'
                          : prod.stockQuantity <= prod.lowStockAmount
                          ? 'text-amber-600'
                          : 'text-neutral-800'
                      }`}
                    >
                      {prod.stockQuantity} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-center">
            <button
              onClick={onOpenAddProduct}
              className="text-xs text-neutral-700 hover:text-black font-medium flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
