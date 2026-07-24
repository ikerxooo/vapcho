export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "newest"
  | "featured";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "stripe" | "bank_transfer" | "bizum" | "paypal";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type DiscountType = "percentage" | "fixed";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription: string;
  features: string[];
  specifications: Record<string, string>;
  price: number;
  categoryId: string | null;
  categoryName: string;
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  enabled: boolean;
  sold: number;
  views: number;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceAdjustion: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  invoiceNumber: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorEmail?: string;
}

export interface Invite {
  id: string;
  token: string;
  email: string | null;
  used: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface Analytics {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  bestSellingProducts: { name: string; sold: number; revenue: number }[];
  mostViewedProducts: { name: string; views: number }[];
  activeCustomers: number;
  lowStockProducts: { name: string; stock: number }[];
}
