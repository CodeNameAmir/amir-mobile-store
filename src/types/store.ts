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

export type SortOption =
  | 'newest'
  | 'bestselling'
  | 'cheapest'
  | 'expensive'
  | 'popular'
  | 'biggest_discount';

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
  titleEn?: string;
  subtitle: string;
  descriptionFa?: string;
  iconName?: string;
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
  slug?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isFeatured?: boolean;
  isActive: boolean;
}

export interface WarrantyItem {
  id: string;
  providerName: string;
  durationMonths: number;
  coverageFa: string;
  termsUrl?: string | null;
  isActive: boolean;
}

export interface AttributeDefinition {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  dataType: 'text' | 'number' | 'boolean' | 'select';
  unit?: string | null;
  isFilterable: boolean;
  sortOrder: number;
  categoryIds?: string[];
}

export interface ProductAttributeValue {
  id?: string;
  productId: string;
  attributeId: string;
  code: string;
  nameFa: string;
  nameEn: string;
  dataType: 'text' | 'number' | 'boolean' | 'select';
  unit?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  displayValue: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  warrantyId?: string | null;
  warrantyName?: string;
  warrantyDurationMonths?: number;
  warrantyCoverageFa?: string;
  sku: string;
  barcode?: string | null;
  partNumber?: string | null;
  colorId?: string;
  colorNameFa: string;
  colorNameEn?: string | null;
  colorHex: string;
  storage?: string | null;
  ram?: string | null;
  simType?: string | null;
  priceToman: number;
  originalPriceToman?: number | null;
  availableStock?: number;
  isPublished: boolean;
}

export interface WarehouseItem {
  id: string;
  code: string;
  nameFa: string;
  city: string;
  addressFa?: string | null;
  isActive: boolean;
}

export interface WarehouseStockItem {
  id: string;
  warehouseId: string;
  warehouseCode?: string;
  warehouseNameFa?: string;
  variantId: string;
  productId?: string;
  sku?: string;
  shelfLocation?: string | null;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  minStockAlert: number;
  isLowStock: boolean;
  updatedAt?: string;
}

export interface StockMovementItem {
  id: string;
  warehouseId: string;
  variantId: string;
  movementType:
    | 'opening_balance'
    | 'purchase_inflow'
    | 'order_sale'
    | 'customer_return'
    | 'transfer_out'
    | 'transfer_in'
    | 'inventory_adjustment';
  quantityChange: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  noteFa?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  modelName?: string;
  descriptionFa?: string;
  editorialReview?: string;
  brand: BrandId;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  inStock: boolean;
  stockCount: number;
  expressDelivery: boolean;
  warranty: string;
  warrantyId?: string | null;
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
  variants?: ProductVariant[];
  attributeValues?: ProductAttributeValue[];
  priceUpdatedAt?: string;
  isPublished?: boolean;
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
  variantId?: string;
  sku?: string;
  partNumber?: string;
  simType?: string;
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
  attributeFilters?: Record<string, string>;
  sortBy: SortOption;
}

export interface CatalogFacetBrand {
  name: string;
  count: number;
}

export interface CatalogFacetColor {
  id: string;
  label: string;
  hex: string;
  count: number;
}

export interface CatalogFacets {
  brands: CatalogFacetBrand[];
  colors: CatalogFacetColor[];
  storages: string[];
  rams: string[];
  minPrice: number;
  maxPrice: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: CatalogFacets;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  postalCode: string;
  deliverySlot: 'express' | 'standard';
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending_gateway' | 'paid' | 'not_required';

export interface OrderRecord {
  orderCode: string;
  shaparakRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
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
  paymentStatus?: PaymentStatus;
  idempotencyKey?: string;
  deliveryPin: string;
  imeiSample: string;
  adminNote?: string;
  items: CartItem[];
  createdAt: string;
}

export interface OrderSummary {
  orderCode: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
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
  id?: string;
  userId?: string | null;
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

export interface StockAlertItem {
  id: string;
  userId?: string | null;
  email: string;
  productId: string;
  variantId?: string | null;
  notifiedAt?: string | null;
  createdAt: string;
}

export interface UserNotificationItem {
  id: string;
  userId: string;
  type: 'back_in_stock' | 'order_update' | 'ticket_reply' | 'system' | string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type UserNotification = UserNotificationItem;

export interface ProductQuestionItem {
  id: string;
  productId: string;
  userId?: string | null;
  authorName: string;
  question: string;
  answer?: string | null;
  answeredAt?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export type ProductQuestion = ProductQuestionItem;

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
  username?: string;
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

export interface PublicUserProfile {
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  memberSince: string;
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
  authorUsername?: string;
  dateLabel: string;
  rating: number;
  comment: string;
  verified: boolean;
  isApproved?: boolean;
}

export interface CouponRule {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  descriptionFa?: string;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usedCount?: number;
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

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  readingTimeMinutes: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: BlogPostItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: string[];
}

