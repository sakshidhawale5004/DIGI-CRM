import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Palette,
  Settings,
  Store,
  AlertTriangle,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { adminTab, setAdminTab, setViewMode, products, orders } = useCommerce();

  const lowStockCount = products.filter(
    (p) => p.manageStock && (p.stockStatus === 'lowstock' || p.stockStatus === 'outofstock')
  ).length;

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      alert: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'customers', label: 'Customers (CRM)', icon: Users },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'themes', label: 'Theme Studio', icon: Palette },
  ];

  return (
    <aside aria-label="WooCommerce Navigation" className="w-64 bg-neutral-900 text-neutral-300 flex flex-col shrink-0 border-r border-neutral-800 min-h-[calc(100vh-37px)] select-none">
      {/* Brand & Store switcher */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            DC
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight uppercase">Digital Coyotes</h1>
            <p className="text-[10px] text-neutral-400">WooCommerce Hub & CRM</p>
          </div>
        </div>

        {/* Quick link to Storefront */}
        <button
          onClick={() => setViewMode('storefront')}
          className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors border border-neutral-700/60"
        >
          <Store className="w-3.5 h-3.5 text-emerald-400" />
          <span>View Live Storefront</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id as typeof adminTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.alert !== undefined ? (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {item.alert}
                </span>
              ) : item.badge !== undefined ? (
                <span className="bg-neutral-800 text-neutral-300 text-[10px] font-mono px-1.5 py-0.2 rounded">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-neutral-800 text-[11px] text-neutral-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine:</span>
          <span className="text-neutral-300 font-mono">v8.4-Studio</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Database:</span>
          <span className="text-emerald-400 font-medium">LocalSync Active</span>
        </div>
      </div>
    </aside>
  );
};
