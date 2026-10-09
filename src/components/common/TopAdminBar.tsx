import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Store, LayoutDashboard, Plus, RotateCcw, AlertTriangle, ShoppingBag, Eye } from 'lucide-react';

export const TopAdminBar: React.FC<{ onOpenAddProduct: () => void }> = ({ onOpenAddProduct }) => {
  const { viewMode, setViewMode, adminTab, setAdminTab, products, orders, cartCount, resetAllData } = useCommerce();

  const lowStockCount = products.filter(
    (p) => p.manageStock && (p.stockStatus === 'lowstock' || p.stockStatus === 'outofstock')
  ).length;

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  return (
    <aside aria-label="WooCommerce Admin Bar" className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4 border-b border-neutral-800 z-50 sticky top-0 flex flex-wrap items-center justify-between gap-2 shadow-sm font-sans select-none">
      <div className="flex items-center gap-4">
        {/* WordPress / WooCommerce Logo Icon & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center font-bold text-white text-[11px] tracking-tighter">
            DC
          </div>
          <span className="font-semibold text-white tracking-tight">Digital Coyotes WooCommerce Hub</span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 hidden sm:inline text-[11px]">CRM & Commerce Engine</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-neutral-800 p-0.5 rounded border border-neutral-700/80">
          <button
            onClick={() => setViewMode('storefront')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              viewMode === 'storefront'
                ? 'bg-neutral-700 text-white font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              viewMode === 'admin'
                ? 'bg-neutral-700 text-white font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin & CRM</span>
          </button>
        </div>

        {/* Quick Stock & Order Alerts */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-400">
          {lowStockCount > 0 && (
            <button
              onClick={() => {
                setViewMode('admin');
                setAdminTab('inventory');
              }}
              className="flex items-center gap-1 text-amber-400 hover:underline"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{lowStockCount} inventory alert{lowStockCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {pendingOrdersCount > 0 && (
            <button
              onClick={() => {
                setViewMode('admin');
                setAdminTab('orders');
              }}
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{pendingOrdersCount} active order{pendingOrdersCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Add Product Button */}
        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-2.5 py-1 rounded border border-neutral-700 text-[11px] transition-colors"
          title="Add new product to catalog"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Product</span>
        </button>

        {/* Storefront view cart indicator */}
        {viewMode === 'admin' && (
          <button
            onClick={() => setViewMode('storefront')}
            className="flex items-center gap-1 text-neutral-400 hover:text-white px-2 py-1 text-[11px] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Store</span>
          </button>
        )}

        {/* Reset Store Demo Data */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo products, customers, and orders to initial defaults?')) {
              resetAllData();
            }
          }}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 px-2 py-1 text-[11px] transition-colors"
          title="Reset store demo data"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>
    </aside>
  );
};
