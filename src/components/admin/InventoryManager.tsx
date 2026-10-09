import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Boxes, AlertTriangle, CheckCircle2, XCircle, Plus, Minus, Search, RefreshCw } from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { products, adjustStock, updateProduct } = useCommerce();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');

  const totalUnits = products.reduce((acc, p) => acc + (p.manageStock ? p.stockQuantity : 0), 0);
  const totalStockValue = products.reduce(
    (acc, p) => acc + (p.manageStock ? p.stockQuantity * p.price : 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => p.manageStock && p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAmount
  ).length;
  const outOfStockCount = products.filter((p) => p.manageStock && p.stockQuantity === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'instock' && p.stockQuantity > p.lowStockAmount) ||
      (filterStatus === 'lowstock' && p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAmount) ||
      (filterStatus === 'outofstock' && p.stockQuantity === 0);

    return matchesSearch && matchesStatus;
  });

  const handleQuickAdd = (productId: string, current: number, delta: number) => {
    adjustStock(productId, Math.max(0, current + delta));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-neutral-800" />
            <span>WooCommerce Inventory Control</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time warehouse stock tracking, depletion levels, automated checkout deductions, and threshold alerts.
          </p>
        </div>
      </div>

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Total Units on Hand
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {totalUnits.toLocaleString()} units
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Across {products.length} catalog items</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Total Inventory Value
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            ${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">At current selling prices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-2">
            {lowStockCount} items
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">≤ Configured threshold</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
            Out of Stock
          </span>
          <div className="text-2xl font-bold font-mono text-red-600 mt-2">
            {outOfStockCount} items
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Requires immediate replenishment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded transition-colors ${
              filterStatus === 'all' ? 'bg-white shadow-xs font-semibold text-neutral-900' : 'text-neutral-600 hover:text-black'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus('lowstock')}
            className={`px-3 py-1 rounded transition-colors ${
              filterStatus === 'lowstock' ? 'bg-white shadow-xs font-semibold text-amber-700' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('outofstock')}
            className={`px-3 py-1 rounded transition-colors ${
              filterStatus === 'outofstock' ? 'bg-white shadow-xs font-semibold text-red-700' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-3">Stock Status</th>
                <th className="py-3 px-3 text-center">On-Hand Qty</th>
                <th className="py-3 px-3 text-center">Low-Stock Alert Level</th>
                <th className="py-3 px-3">Backorders</th>
                <th className="py-3 px-4 text-right">Quick Restock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockQuantity === 0;
                const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAmount;

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded border border-neutral-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          <p className="text-[11px] font-mono text-neutral-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <XCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock ({p.stockQuantity} left)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>

                    {/* On Hand Qty with direct input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={p.stockQuantity}
                        onChange={(e) => adjustStock(p.id, parseInt(e.target.value, 10) || 0)}
                        className="w-16 text-center text-xs px-1.5 py-1 rounded border border-neutral-300 font-mono font-semibold"
                      />
                    </td>

                    {/* Low Stock Threshold */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={p.lowStockAmount}
                        onChange={(e) =>
                          updateProduct(p.id, { lowStockAmount: parseInt(e.target.value, 10) || 5 })
                        }
                        className="w-14 text-center text-xs px-1.5 py-1 rounded border border-neutral-300 font-mono text-neutral-600"
                      />
                    </td>

                    {/* Backorders Toggle */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => updateProduct(p.id, { allowBackorders: !p.allowBackorders })}
                        className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                          p.allowBackorders
                            ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                            : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                        }`}
                      >
                        {p.allowBackorders ? 'Backorders Allowed' : 'No Backorders'}
                      </button>
                    </td>

                    {/* Quick Restock Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAdd(p.id, p.stockQuantity, -1)}
                          disabled={p.stockQuantity <= 0}
                          className="p-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
                          title="Decrease 1 unit"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdd(p.id, p.stockQuantity, 5)}
                          className="px-2 py-1 text-[11px] rounded border border-neutral-300 hover:bg-neutral-100 font-medium"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdd(p.id, p.stockQuantity, 25)}
                          className="px-2 py-1 text-[11px] rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium"
                          title="Add 25 units batch restock"
                        >
                          +25
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
