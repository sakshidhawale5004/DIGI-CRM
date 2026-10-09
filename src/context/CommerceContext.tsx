import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Order, Coupon, ThemeSettings, CartItem, CustomerNote } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_COUPONS, INITIAL_THEME, THEME_PRESETS } from '../data/mockData';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface CommerceContextType {
  // Navigation & View
  viewMode: 'storefront' | 'admin';
  setViewMode: (mode: 'storefront' | 'admin') => void;
  adminTab: 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'coupons' | 'themes' | 'settings';
  setAdminTab: (tab: 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'coupons' | 'themes' | 'settings') => void;
  selectedCustomerIdForDetail: string | null;
  setSelectedCustomerIdForDetail: (id: string | null) => void;
  selectedOrderIdForDetail: string | null;
  setSelectedOrderIdForDetail: (id: string | null) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  bulkAddProducts: (newProducts: Omit<Product, 'id' | 'createdAt'>[]) => number;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, newQuantity: number) => void;

  // Customers & CRM
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredAt' | 'totalSpent' | 'orderCount' | 'notes'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addCustomerNote: (customerId: string, noteContent: string, author?: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerInfo: { name: string; email: string; phone: string; address: string; city: string; postalCode: string; country: string };
    items: { product: Product; quantity: number; selectedAttributes?: Record<string, string> }[];
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: 'card' | 'apple_pay' | 'cod' | 'klarna';
    couponCode?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderTracking: (orderId: string, trackingCode: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  deleteCoupon: (id: string) => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Theme Settings
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  applyThemePreset: (presetKey: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedAttributes?: Record<string, string>) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;

  // Notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;

  // System
  resetAllData: () => void;
}

const STORAGE_KEY = 'woocommerce_crm_suite_v2';

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'coupons' | 'themes' | 'settings'>('dashboard');
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string | null>(null);
  const [selectedOrderIdForDetail, setSelectedOrderIdForDetail] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_coupons`);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName === 'AURA & CO.') {
          parsed.storeName = 'Digital Coyotes';
          parsed.storeTagline = 'WooCommerce Hub & Curated Goods';
        }
        return parsed;
      }
      return INITIAL_THEME;
    } catch {
      return INITIAL_THEME;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cart`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_coupons`, JSON.stringify(coupons));
      localStorage.setItem(`${STORAGE_KEY}_theme`, JSON.stringify(theme));
      localStorage.setItem(`${STORAGE_KEY}_cart`, JSON.stringify(cart));
    } catch {
      // safe fallback
    }
  }, [products, customers, orders, coupons, theme, cart]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Products management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to catalog.`);
    return newProduct;
  };

  const bulkAddProducts = (newProductsData: Omit<Product, 'id' | 'createdAt'>[]): number => {
    if (newProductsData.length === 0) return 0;
    const now = new Date().toISOString();
    const created: Product[] = newProductsData.map((data, idx) => ({
      ...data,
      id: `prod-${Date.now()}-${idx}`,
      createdAt: now,
    }));
    setProducts((prev) => [...created, ...prev]);
    showToast(`Bulk imported ${created.length} products to Digital Coyotes catalog.`);
    return created.length;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        // sync stockStatus if stockQuantity changed
        if (typeof updates.stockQuantity === 'number') {
          if (updated.stockQuantity <= 0) {
            updated.stockStatus = 'outofstock';
          } else if (updated.stockQuantity <= (updated.lowStockAmount || 5)) {
            updated.stockStatus = 'lowstock';
          } else {
            updated.stockStatus = 'instock';
          }
        }
        return updated;
      })
    );
    showToast('Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast(`Product "${prod?.name || 'Item'}" deleted.`);
  };

  const adjustStock = (id: string, newQuantity: number) => {
    const qty = Math.max(0, newQuantity);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        let status: Product['stockStatus'] = 'instock';
        if (qty === 0) status = 'outofstock';
        else if (qty <= (p.lowStockAmount || 5)) status = 'lowstock';
        return {
          ...p,
          stockQuantity: qty,
          stockStatus: status,
        };
      })
    );
    showToast(`Inventory updated to ${qty} units.`);
  };

  // Customers Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'registeredAt' | 'totalSpent' | 'orderCount' | 'notes'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      totalSpent: 0,
      orderCount: 0,
      notes: [],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer ${newCustomer.name} added to CRM.`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Customer record updated.');
  };

  const addCustomerNote = (customerId: string, noteContent: string, author: string = 'Staff Admin') => {
    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      content: noteContent,
      date: new Date().toISOString().split('T')[0],
      author,
    };
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return { ...c, notes: [newNote, ...c.notes] };
      })
    );
    showToast('Internal note logged on customer profile.');
  };

  // Orders & Checkout
  const createOrder = ({
    customerInfo,
    items,
    shippingMethod,
    shippingCost,
    paymentMethod,
    couponCode,
  }: {
    customerInfo: { name: string; email: string; phone: string; address: string; city: string; postalCode: string; country: string };
    items: { product: Product; quantity: number; selectedAttributes?: Record<string, string> }[];
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: 'card' | 'apple_pay' | 'cod' | 'klarna';
    couponCode?: string;
  }): Order => {
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (subtotal * appliedCoupon.amount) / 100;
      } else {
        discount = Math.min(subtotal, appliedCoupon.amount);
      }
    }

    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount + shippingCost + tax) * 100) / 100);

    // 1. Decrement inventory for each item purchased
    setProducts((prev) =>
      prev.map((prod) => {
        const itemBought = items.find((i) => i.product.id === prod.id);
        if (!itemBought || !prod.manageStock) return prod;

        const newQty = Math.max(0, prod.stockQuantity - itemBought.quantity);
        let stockStatus: Product['stockStatus'] = 'instock';
        if (newQty === 0) stockStatus = 'outofstock';
        else if (newQty <= (prod.lowStockAmount || 5)) stockStatus = 'lowstock';

        return {
          ...prod,
          stockQuantity: newQty,
          stockStatus,
        };
      })
    );

    // 2. Find or create customer in CRM and update LTV
    let customerId = '';
    setCustomers((prev) => {
      const existing = prev.find((c) => c.email.toLowerCase() === customerInfo.email.toLowerCase());
      if (existing) {
        customerId = existing.id;
        const newTotalSpent = Math.round((existing.totalSpent + total) * 100) / 100;
        const newOrderCount = existing.orderCount + 1;
        let segment = existing.segment;
        if (newTotalSpent >= 500) segment = 'VIP';
        else if (newOrderCount > 1) segment = 'Regular';

        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalSpent: newTotalSpent,
                orderCount: newOrderCount,
                segment,
                lastOrderAt: new Date().toISOString(),
                phone: customerInfo.phone || c.phone,
                address: customerInfo.address || c.address,
                city: customerInfo.city || c.city,
                postalCode: customerInfo.postalCode || c.postalCode,
                country: customerInfo.country || c.country,
              }
            : c
        );
      } else {
        customerId = `cust-${Date.now()}`;
        const newCust: Customer = {
          id: customerId,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
          totalSpent: total,
          orderCount: 1,
          segment: total >= 500 ? 'VIP' : 'New',
          registeredAt: new Date().toISOString(),
          lastOrderAt: new Date().toISOString(),
          notes: [
            {
              id: `note-${Date.now()}`,
              content: `First purchase placed via Storefront: $${total.toFixed(2)}`,
              date: new Date().toISOString().split('T')[0],
              author: 'WooCommerce System',
            },
          ],
        };
        return [newCust, ...prev];
      }
    });

    // 3. Create the Order object
    const orderNumber = `#WOO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      shippingAddress: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode,
        country: customerInfo.country,
      },
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images[0] || '',
        selectedAttributes: i.selectedAttributes,
      })),
      subtotal,
      discount,
      couponApplied: couponCode || appliedCoupon?.code,
      shippingCost,
      shippingMethod,
      tax,
      total,
      status: 'processing',
      paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      trackingCode: `TRACK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update coupon usage count if used
    if (appliedCoupon) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === appliedCoupon.id ? { ...c, usageCount: c.usageCount + 1 } : c))
      );
    }

    // Clear cart
    setCart([]);
    setAppliedCoupon(null);
    showToast(`Order ${orderNumber} created successfully! Inventory deducted.`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order status updated to "${status}".`);
  };

  const updateOrderTracking = (orderId: string, trackingCode: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, trackingCode } : o))
    );
    showToast(`Tracking number added: ${trackingCode}`);
  };

  // Coupons
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      code: couponData.code.toUpperCase().trim(),
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created.`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon removed.');
  };

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.toUpperCase().trim();
    const found = coupons.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Minimum order of $${found.minSpend.toFixed(2)} required for coupon ${cleanCode}.`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon "${cleanCode}" applied! ${
        found.discountType === 'percentage' ? `${found.amount}% off` : `$${found.amount} off`
      }`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.');
  };

  // Theme Studio
  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    showToast('Theme styles updated.');
  };

  const applyThemePreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setTheme((prev) => ({ ...prev, ...preset }));
      showToast(`Applied "${presetKey.toUpperCase()}" theme preset.`);
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedAttributes?: Record<string, string>) => {
    // Check stock availability
    if (product.manageStock && product.stockQuantity <= 0 && !product.allowBackorders) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`, 'warning');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedAttributes || {}) === JSON.stringify(selectedAttributes || {})
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        if (product.manageStock && !product.allowBackorders && newQty > product.stockQuantity) {
          showToast(`Cannot add more than available stock (${product.stockQuantity}).`, 'warning');
          return prev;
        }
        next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        return next;
      } else {
        return [...prev, { product, quantity, selectedAttributes }];
      }
    });

    showToast(`Added ${quantity}x "${product.name}" to cart.`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        if (item.product.manageStock && !item.product.allowBackorders && quantity > item.product.stockQuantity) {
          showToast(`Max available stock is ${item.product.stockQuantity}.`, 'warning');
          return { ...item, quantity: item.product.stockQuantity };
        }
        return { ...item, quantity };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Cart calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.amount) / 100;
    } else {
      cartDiscount = Math.min(cartSubtotal, appliedCoupon.amount);
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Reset to initial
  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setTheme(INITIAL_THEME);
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_coupons`);
    localStorage.removeItem(`${STORAGE_KEY}_theme`);
    localStorage.removeItem(`${STORAGE_KEY}_cart`);
    showToast('Store reset to demo state.');
  };

  return (
    <CommerceContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        selectedCustomerIdForDetail,
        setSelectedCustomerIdForDetail,
        selectedOrderIdForDetail,
        setSelectedOrderIdForDetail,
        products,
        addProduct,
        bulkAddProducts,
        updateProduct,
        deleteProduct,
        adjustStock,
        customers,
        addCustomer,
        updateCustomer,
        addCustomerNote,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderTracking,
        coupons,
        addCoupon,
        deleteCoupon,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        theme,
        updateTheme,
        applyThemePreset,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        toasts,
        showToast,
        dismissToast,
        resetAllData,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
