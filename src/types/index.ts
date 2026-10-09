export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  description: string;
  shortDescription: string;
  stockQuantity: number;
  manageStock: boolean;
  stockStatus: 'instock' | 'lowstock' | 'outofstock';
  lowStockAmount: number;
  allowBackorders: boolean;
  attributes: { name: string; options: string[] }[];
  featured?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  date: string;
  author: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  address: string;
  postalCode: string;
  avatarUrl?: string;
  totalSpent: number;
  orderCount: number;
  segment: 'VIP' | 'Regular' | 'New' | 'At-Risk';
  notes: CustomerNote[];
  registeredAt: string;
  lastOrderAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  selectedAttributes?: Record<string, string>;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponApplied?: string;
  shippingCost: number;
  shippingMethod: string;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'apple_pay' | 'cod' | 'klarna';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  trackingCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  amount: number;
  minSpend?: number;
  description: string;
  usageCount: number;
  expiresAt?: string;
}

export type ThemePreset = 'nordic' | 'minimal' | 'luxe' | 'editorial';

export interface ThemeSettings {
  preset: ThemePreset;
  storeName: string;
  storeTagline: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontHeading: 'DM Sans' | 'Playfair Display' | 'Plus Jakarta Sans';
  fontBody: 'DM Sans' | 'Plus Jakarta Sans';
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  heroHeading: string;
  heroSubheading: string;
  heroCtaText: string;
  heroImageUrl: string;
  heroStyle: 'split' | 'overlay' | 'minimal';
  announcementText: string;
  showAnnouncement: boolean;
  gridColumns: 3 | 4;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAttributes?: Record<string, string>;
}
