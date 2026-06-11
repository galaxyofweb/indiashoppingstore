// ─────────────────────────────────────────────
// Core Types for IndiaShoppingStore
// ─────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
export type PaymentProvider = 'RAZORPAY' | 'STRIPE' | 'CASHFREE' | 'UPI' | 'COD'
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED'

// ─── Product Types ───────────────────────────

export interface ProductImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface ProductVariantOption {
  name: string      // e.g., "Color", "Size"
  values: string[]  // e.g., ["Red", "Blue", "Green"]
}

export interface ProductVariant {
  id: string
  sku: string
  price?: number
  stock: number
  image?: string
  attributes: Record<string, string>
  isDefault: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  currency: string
  stock: number
  images: string[]
  thumbnail?: string
  category: Category
  brand?: Brand
  variants: ProductVariant[]
  tags: string[]
  status: ProductStatus
  isFeatured: boolean
  isBestseller: boolean
  isNewArrival: boolean
  isTrending: boolean
  gstRate: number
  rating: number
  reviewCount: number
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  thumbnail?: string
  images: string[]
  rating: number
  reviewCount: number
  isBestseller: boolean
  isNewArrival: boolean
  isTrending: boolean
  stock: number
  brand?: { name: string; slug: string }
  category: { name: string; slug: string }
}

// ─── Category & Brand ────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  banner?: string
  icon?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  level: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
}

// ─── Cart Types ──────────────────────────────

export interface CartItem {
  id: string
  product: ProductListItem
  variant?: ProductVariant
  quantity: number
  price: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  itemCount: number
}

// ─── Order Types ─────────────────────────────

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  name: string
  image?: string
  sku: string
  quantity: number
  price: number
  total: number
  gstRate: number
  gstAmount: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  items: OrderItem[]
  address: Address
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
  couponDiscount: number
  trackingNumber?: string
  trackingUrl?: string
  createdAt: string
  updatedAt: string
}

// ─── Address Types ───────────────────────────

export interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING'
  isDefault: boolean
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  landmark?: string
}

// ─── Review Types ────────────────────────────

export interface Review {
  id: string
  productId: string
  userId: string
  user: { name?: string; image?: string }
  rating: number
  title?: string
  body?: string
  images: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
}

// ─── Filter & Search Types ───────────────────

export interface ProductFilters {
  category?: string
  brand?: string[]
  priceMin?: number
  priceMax?: number
  rating?: number
  inStock?: boolean
  tags?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating' | 'relevance'
}

export interface SearchResult {
  products: ProductListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  facets: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ id: string; name: string; count: number }>
    priceRange: { min: number; max: number }
    ratings: Array<{ rating: number; count: number }>
  }
}

// ─── Checkout Types ──────────────────────────

export interface CheckoutState {
  step: 'address' | 'shipping' | 'payment' | 'review'
  address?: Address
  shippingMethod?: string
  paymentMethod?: PaymentProvider
  couponCode?: string
  notes?: string
}

export interface CheckoutSummary {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  couponDiscount: number
  total: number
  items: CartItem[]
}

// ─── Payment Types ───────────────────────────

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
}

export interface PaymentResult {
  success: boolean
  orderId?: string
  paymentId?: string
  error?: string
}

// ─── API Response Types ──────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ─── User Types ──────────────────────────────

export interface UserProfile {
  id: string
  name?: string
  email?: string
  phone?: string
  image?: string
  role: UserRole
  loyaltyPoints: number
  referralCode?: string
  createdAt: string
}

// ─── Notification Types ──────────────────────

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

// ─── Coupon Types ────────────────────────────

export interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'BUY_X_GET_Y'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  description?: string
  expiresAt?: string
}

export interface CouponValidation {
  valid: boolean
  coupon?: Coupon
  discountAmount?: number
  error?: string
}

// ─── Analytics Types ─────────────────────────

export interface DashboardStats {
  revenue: { total: number; change: number }
  orders: { total: number; change: number }
  customers: { total: number; change: number }
  products: { total: number; lowStock: number }
  recentOrders: Order[]
  topProducts: Array<ProductListItem & { salesCount: number }>
  revenueChart: Array<{ date: string; revenue: number; orders: number }>
}

// ─── GST Types ───────────────────────────────

export interface GSTDetails {
  hsnCode?: string
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
}
