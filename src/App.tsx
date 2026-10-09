import React, { useState } from 'react';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { TopAdminBar } from './components/common/TopAdminBar';
import { ToastContainer } from './components/common/ToastContainer';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductsManager } from './components/admin/ProductsManager';
import { InventoryManager } from './components/admin/InventoryManager';
import { OrdersManager } from './components/admin/OrdersManager';
import { CustomersCrm } from './components/admin/CustomersCrm';
import { CouponsManager } from './components/admin/CouponsManager';
import { ThemeCustomizer } from './components/admin/ThemeCustomizer';
import { ProductModal } from './components/admin/ProductModal';
import { CustomerDetailModal } from './components/admin/CustomerDetailModal';
import { OrderDetailModal } from './components/admin/OrderDetailModal';
import { StoreHeader } from './components/storefront/StoreHeader';
import { StoreHero } from './components/storefront/StoreHero';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { Product } from './types';
import { ArrowUp, Heart, Shield, RefreshCw, PackageCheck } from 'lucide-react';

const StorefrontFooter: React.FC = () => {
  const { theme, setViewMode, setAdminTab } = useCommerce();

  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-600 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <span
              className="text-lg font-bold text-neutral-900 uppercase tracking-tight block"
              style={{ fontFamily: theme.fontHeading }}
            >
              {theme.storeName}
            </span>
            <p className="text-neutral-500 leading-relaxed text-[11px]">
              {theme.storeTagline || 'Handcrafted goods made with intentional craftsmanship, durable materials, and honest utility.'}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <span>Powered by WooCommerce CRM Studio</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Collections
            </h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li><a href="#catalog-section" className="hover:text-black">Living & Home</a></li>
              <li><a href="#catalog-section" className="hover:text-black">Apparel & Textiles</a></li>
              <li><a href="#catalog-section" className="hover:text-black">Desk & Electronics</a></li>
              <li><a href="#catalog-section" className="hover:text-black">Artisan Accessories</a></li>
            </ul>
          </div>

          {/* Merchant Shortcuts */}
          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Merchant Administration
            </h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li>
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setAdminTab('products');
                  }}
                  className="hover:text-black text-left"
                >
                  Manage Product Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setAdminTab('inventory');
                  }}
                  className="hover:text-black text-left"
                >
                  Inventory Stock Monitor
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setAdminTab('customers');
                  }}
                  className="hover:text-black text-left"
                >
                  Customer Relationship CRM
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setAdminTab('themes');
                  }}
                  className="hover:text-black text-left"
                >
                  Theme Customizer Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Studio Gazette
            </h4>
            <p className="text-neutral-500 text-[11px]">
              Receive early invitations to limited batch productions and journal entries.
            </p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 text-xs px-3 py-1.5 rounded border border-neutral-300 focus:outline-hidden"
              />
              <button
                type="button"
                className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} {theme.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const MainAppContent: React.FC = () => {
  const {
    viewMode,
    adminTab,
    selectedCustomerIdForDetail,
    setSelectedCustomerIdForDetail,
    selectedOrderIdForDetail,
    setSelectedOrderIdForDetail,
  } = useCommerce();

  // Modals & Navigation
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Cart & Checkout
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState<{
    product: Product;
    quantity: number;
    selectedAttributes?: Record<string, string>;
  } | null>(null);

  // Storefront search & category filter
  const [storeSearch, setStoreSearch] = useState('');
  const [storeCategory, setStoreCategory] = useState('All');

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleInstantBuy = (
    product: Product,
    quantity: number,
    selectedAttributes: Record<string, string>
  ) => {
    setSelectedProductForDetail(null);
    setDirectBuyItem({ product, quantity, selectedAttributes });
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckoutFromCart = () => {
    setDirectBuyItem(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/60 font-sans text-neutral-900">
      {/* 1. Global WordPress Admin Bar at top */}
      <TopAdminBar onOpenAddProduct={handleOpenAddProduct} />

      {/* 2. Main Content Mode Switcher */}
      {viewMode === 'storefront' ? (
        /* Storefront View Mode */
        <main className="flex-1 bg-white">
          <StoreHeader
            onOpenCart={() => setIsCartOpen(true)}
            searchQuery={storeSearch}
            setSearchQuery={setStoreSearch}
            activeCategory={storeCategory}
            setActiveCategory={setStoreCategory}
          />

          <StoreHero onScrollToCatalog={scrollToCatalog} />

          <ProductGrid
            onOpenDetail={(product) => setSelectedProductForDetail(product)}
            searchQuery={storeSearch}
            activeCategory={storeCategory}
          />

          <StorefrontFooter />
        </main>
      ) : (
        /* WooCommerce Admin & CRM Mode */
        <div className="flex-1 flex overflow-hidden">
          <AdminSidebar />

          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-100/70">
            <div className="max-w-7xl mx-auto">
              {adminTab === 'dashboard' && (
                <AdminDashboard onOpenAddProduct={handleOpenAddProduct} />
              )}
              {adminTab === 'products' && (
                <ProductsManager
                  onOpenAddProduct={handleOpenAddProduct}
                  onEditProduct={handleEditProduct}
                />
              )}
              {adminTab === 'inventory' && <InventoryManager />}
              {adminTab === 'orders' && (
                <OrdersManager onOpenOrder={(id) => setSelectedOrderIdForDetail(id)} />
              )}
              {adminTab === 'customers' && (
                <CustomersCrm onOpenCustomer={(id) => setSelectedCustomerIdForDetail(id)} />
              )}
              {adminTab === 'coupons' && <CouponsManager />}
              {adminTab === 'themes' && <ThemeCustomizer />}
            </div>
          </main>
        </div>
      )}

      {/* 3. Modals and Drawers */}
      {/* Product Add/Edit Modal */}
      {isAddProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Customer CRM Profile Modal */}
      {selectedCustomerIdForDetail && (
        <CustomerDetailModal
          customerId={selectedCustomerIdForDetail}
          onClose={() => setSelectedCustomerIdForDetail(null)}
          onOpenOrder={(orderId) => setSelectedOrderIdForDetail(orderId)}
        />
      )}

      {/* Order Detail & Invoice Modal */}
      {selectedOrderIdForDetail && (
        <OrderDetailModal
          orderId={selectedOrderIdForDetail}
          onClose={() => setSelectedOrderIdForDetail(null)}
          onViewCustomer={(customerId) => setSelectedCustomerIdForDetail(customerId)}
        />
      )}

      {/* Product Quick View / Detail Modal on Storefront */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onInstantBuy={handleInstantBuy}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckoutFromCart}
      />

      {/* Seamless Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
        directBuyItem={directBuyItem}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CommerceProvider>
      <MainAppContent />
    </CommerceProvider>
  );
}
