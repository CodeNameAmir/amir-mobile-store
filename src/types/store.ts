export type CategoryId = 'all' | 'offers' | (string & {});

export type BrandId =
  | 'Apple'
  | 'Samsung'
  | 'Xiaomi'
  | 'Huawei'
  | 'Honor'
  | 'Anker'
  | 'Motorola'
  | (string & {});

export type SortOption = 'newest' | 'bestselling' | 'cheapest' | 'expensive' | 'popular';

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface StorageVariant {
  label: string;
  subtitle: string;
  priceDelta: number;
}

export interface CustomSpecItem {
  label: string;
  value: string;
}

export interface ProductSpecs {
  display: string;
  displayDetails: string;
  chipset: string;
  chipsetDetails: string;
  camera: string;
  cameraDetails: string;
  battery: string;
  batteryDetails: string;
  storageDefault: string;
  ram: string;
  os: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  label: string;
  subtitle: string;
  parentId: string | null;
  isActive: boolean;
  image: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
}

export interface BrandItem {
  id: string;
  name: string;
  labelFa?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: BrandId;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  inStock: boolean;
  stockCount: number;
  expressDelivery: boolean;
  warranty: string;
  badgeText?: string;
  rating: number;
  reviewCount: number;
  recommendPercent: number;
  image: string;
  images?: string[];
  colorLabel: string;
  colors: ProductColor[];
  storageOptions: StorageVariant[];
  specs: ProductSpecs;
  customSpecs?: CustomSpecItem[];
  priceUpdatedAt?: string;
  isFeaturedDeal?: boolean;
  isPopular?: boolean;
  salesRank: number;
  releaseOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  nameFa: string;
  brand: BrandId;
  image: string;
  colorName: string;
  colorHex: string;
  storageLabel: string;
  warranty: string;
  unitPrice: number;
  originalUnitPrice: number;
  qty: number;
  stockCount: number;
}

export interface FilterState {
  category: CategoryId;
  searchQuery: string;
  brands: BrandId[];
  inStockOnly: boolean;
  discountedOnly: boolean;
  expressOnly: boolean;
  minPrice: number;
  maxPrice: number;
  storage: string | null;
  ram: string | null;
  colorId: string | null;
  sortBy: SortOption;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  deliverySlot: 'express' | 'standard';
}

export type OrderStatus = 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderRecord {
  orderCode: string;
  shaparakRef: string;
  customerName: string;
  customerPhone: string;
  city: string;
  shippingAddress: string;
  postalCode: string;
  deliverySlot: 'express' | 'standard';
  couponCode: string | null;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryPin: string;
  imeiSample: string;
  adminNote?: string;
  items: CartItem[];
  createdAt: string;
}

export interface OrderSummary {
  orderCode: string;
  status: OrderStatus;
  deliverySlot: 'express' | 'standard';
  createdAt: string;
  requiresVerification: true;
  isGuestOrder: boolean;
}

export interface OrderLookupResult {
  found: boolean;
  authorized: boolean;
  requiresVerification: boolean;
  isGuestOrder: boolean;
  order: OrderRecord | null;
  summary?: OrderSummary;
  error?: string;
}

export interface ContactFormData {
  fullName: string;
  phone: string;
  department: string;
  orderCode: string;
  message: string;
}

export interface SupportTicket {
  ticketCode: string;
  fullName: string;
  phone: string;
  department: string;
  orderCode: string;
  message: string;
  status?: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export type UserRole = 'customer' | 'admin';

export interface DemoUser {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  role?: UserRole;
  avatarUrl?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  hasPassword?: boolean;
  nationalId?: string;
  birthDate?: string;
  newsletterOptIn?: boolean;
  addresses?: UserAddress[];
  wishlist?: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

export type OtpPurpose = 'signup' | 'login' | 'login-2fa' | 'reset-password' | 'change-email';

export interface ResendServiceStatus {
  resendConfigured: boolean;
  fromAddress: string;
  usingTestSender: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  dateLabel: string;
  rating: number;
  comment: string;
  verified: boolean;
}

export interface CouponRule {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  descriptionFa?: string;
}

export interface InstallmentPlan {
  totalPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  financedAmount: number;
  months: number;
  monthlyRatePercent: number;
  monthlyPayment: number;
  totalInstallmentsAmount: number;
  totalPayableWithPlan: number;
}

export interface StoreSettings {
  announcementText: string;
  freeShippingThreshold: number;
  supportPhone: string;
}
