import crypto from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { resolveSessionSecret, resolveSupabaseAdminConfig } from './config.ts';
import {
  applyStockMovementDelta,
  DEFAULT_DEV_ATTRIBUTES,
  DEFAULT_DEV_BRANDS,
  DEFAULT_DEV_CATEGORIES,
  DEFAULT_DEV_COUPONS,
  DEFAULT_DEV_PRODUCT_ATTRIBUTES,
  DEFAULT_DEV_PRODUCTS,
  DEFAULT_DEV_REVIEWS,
  DEFAULT_DEV_ROLES,
  DEFAULT_DEV_SETTINGS,
  DEFAULT_DEV_VARIANTS,
  DEFAULT_DEV_WAREHOUSE_STOCK,
  DEFAULT_DEV_WAREHOUSES,
  DEFAULT_DEV_WARRANTIES,
  filterAndSortProducts,
  formatAttributeDisplayValue,
  normalizeOrderStatus,
  normalizePhone,
  normalizeRole,
  normalizeUsernameServer,
  sanitizeAuditDetails,
  type AdminAuditLogDTO,
  type AdminCustomerDTO,
  type AdminStatsDTO,
  type AttributeDefinitionDTO,
  type AuthRoleDTO,
  type BrandDTO,
  type CategoryDTO,
  type CouponRuleDTO,
  type CustomSpecItemDTO,
  type OrderStatus,
  type ProductAttributeValueDTO,
  type ProductCategory,
  type ProductColorDTO,
  type ProductDTO,
  type ProductQueryParams,
  type ProductReviewDTO,
  type ProductSpecsDTO,
  type ProductVariantDTO,
  type StockMovementDTO,
  type StockMovementInput,
  type StockMovementType,
  type StorageVariantDTO,
  type StoreSettingsDTO,
  type SupportTicketDTO,
  type UserRole,
  type WarehouseDTO,
  type WarehouseStockDTO,
  type WarrantyDTO,
} from './storeData.ts';

export class StockMovementError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'StockMovementError';
    this.statusCode = statusCode;
  }
}

export type OtpPurpose = 'signup' | 'login' | 'login-2fa' | 'reset-password' | 'change-email';

export interface StoredAddress {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export interface StoredOrderItem {
  key: string;
  productId: string;
  variantId?: string;
  sku?: string;
  partNumber?: string;
  simType?: string;
  slug: string;
  nameFa: string;
  brand: string;
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

export interface StoredOrderRecord {
  orderCode: string;
  userId?: string | null;
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
  items: StoredOrderItem[];
  createdAt: string;
}

export interface StoredUserRecord {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  nationalId?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  passwordHash?: string;
  addresses: StoredAddress[];
  wishlist: string[];
  activeSessionIds: string[];
  createdAt: string;
  lastLoginAt: string;
}

export interface PublicUserDTO {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  nationalId?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  hasPassword: boolean;
  addresses: StoredAddress[];
  wishlist: string[];
  createdAt: string;
  lastLoginAt: string;
}

export interface OtpChallengeRecord {
  challengeKey: string;
  id: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
  pendingUserId?: string;
  pendingSignup?: {
    fullName: string;
    username?: string;
    phone: string;
    passwordHash?: string;
  };
}

export interface AuditLogInput {
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
}

export interface AuthStorageAdapter {
  mode: 'supabase' | 'dev-memory';
  checkHealth(): Promise<{ ok: boolean; mode: 'supabase' | 'dev-memory'; detail?: string }>;
  findUserByEmail(email: string): Promise<StoredUserRecord | null>;
  findUserByUsername(username: string): Promise<StoredUserRecord | null>;
  findUserById(userId: string): Promise<StoredUserRecord | null>;
  createUser(params: {
    email: string;
    username?: string;
    fullName: string;
    phone: string;
    passwordHash?: string;
    role?: UserRole;
  }): Promise<StoredUserRecord>;
  updateUser(
    userId: string,
    updater: (user: StoredUserRecord) => StoredUserRecord
  ): Promise<StoredUserRecord | null>;
  deleteUser(userId: string): Promise<boolean>;
  getOtpChallenge(challengeKey: string): Promise<OtpChallengeRecord | null>;
  upsertOtpChallenge(challenge: OtpChallengeRecord): Promise<void>;
  deleteOtpChallenge(challengeKey: string): Promise<void>;
  listUserOrders(userId: string): Promise<StoredOrderRecord[]>;
  createOrder(userId: string | null, order: StoredOrderRecord): Promise<StoredOrderRecord>;
  findOrderByCode(orderCode: string): Promise<StoredOrderRecord | null>;
  listAllOrders(params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: StoredOrderRecord[]; total: number }>;
  updateOrderStatus(
    orderCode: string,
    status: OrderStatus,
    adminNote?: string
  ): Promise<StoredOrderRecord | null>;
  listProducts(query?: ProductQueryParams): Promise<ProductDTO[]>;
  findProductByIdOrSlug(idOrSlug: string): Promise<ProductDTO | null>;
  createProduct(product: ProductDTO): Promise<ProductDTO>;
  updateProduct(id: string, patch: Partial<ProductDTO>): Promise<ProductDTO | null>;
  updateProductInventory(
    id: string,
    stockCount: number,
    inStock?: boolean
  ): Promise<ProductDTO | null>;
  deleteProduct(id: string): Promise<boolean>;
  decrementProductStock(productId: string, qty: number): Promise<void>;
  listCategories(includeInactive?: boolean): Promise<CategoryDTO[]>;
  upsertCategory(category: CategoryDTO): Promise<CategoryDTO>;
  deleteCategory(idOrSlug: string): Promise<boolean>;
  listBrands(): Promise<BrandDTO[]>;
  upsertBrand(brand: BrandDTO): Promise<BrandDTO>;
  deleteBrand(idOrName: string): Promise<boolean>;
  listActiveCoupons(): Promise<CouponRuleDTO[]>;
  getStoreSettings(): Promise<StoreSettingsDTO>;
  listProductReviews(productId: string): Promise<ProductReviewDTO[]>;
  createProductReview(review: ProductReviewDTO): Promise<ProductReviewDTO>;
  createSupportTicket(ticket: SupportTicketDTO): Promise<SupportTicketDTO>;
  subscribeNewsletter(contact: string): Promise<{ alreadySubscribed: boolean }>;
  listCustomers(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ customers: AdminCustomerDTO[]; total: number }>;
  getCustomerByIdWithOrders(
    userId: string
  ): Promise<{ customer: AdminCustomerDTO; orders: StoredOrderRecord[] } | null>;
  createAuditLog(entry: AuditLogInput): Promise<AdminAuditLogDTO>;
  listAuditLogs(params?: {
    action?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AdminAuditLogDTO[]; total: number }>;
  getDashboardStats(): Promise<AdminStatsDTO>;
  listRoles(): Promise<AuthRoleDTO[]>;
  listWarranties(includeInactive?: boolean): Promise<WarrantyDTO[]>;
  upsertWarranty(warranty: WarrantyDTO): Promise<WarrantyDTO>;
  deleteWarranty(id: string): Promise<boolean>;
  listAttributes(categoryId?: string): Promise<AttributeDefinitionDTO[]>;
  upsertAttribute(attr: AttributeDefinitionDTO): Promise<AttributeDefinitionDTO>;
  deleteAttribute(idOrCode: string): Promise<boolean>;
  listProductAttributes(productId: string): Promise<ProductAttributeValueDTO[]>;
  setProductAttributes(
    productId: string,
    values: Array<{
      attributeCode?: string;
      attributeId?: string;
      valueText?: string | null;
      valueNumber?: number | null;
      valueBoolean?: boolean | null;
    }>
  ): Promise<ProductAttributeValueDTO[]>;
  listProductVariants(productId: string, includeUnpublished?: boolean): Promise<ProductVariantDTO[]>;
  findVariantByIdOrSku(idOrSku: string): Promise<ProductVariantDTO | null>;
  upsertProductVariant(variant: ProductVariantDTO): Promise<ProductVariantDTO>;
  deleteProductVariant(variantId: string): Promise<boolean>;
  listWarehouses(includeInactive?: boolean): Promise<WarehouseDTO[]>;
  upsertWarehouse(warehouse: WarehouseDTO): Promise<WarehouseDTO>;
  listWarehouseStock(filters?: {
    warehouseId?: string;
    variantId?: string;
    productId?: string;
    lowStockOnly?: boolean;
  }): Promise<WarehouseStockDTO[]>;
  recordStockMovement(input: StockMovementInput): Promise<{
    movement: StockMovementDTO;
    stock: WarehouseStockDTO;
    deduplicated: boolean;
  }>;
  listStockMovements(filters?: {
    warehouseId?: string;
    variantId?: string;
    movementType?: string;
    limit?: number;
  }): Promise<StockMovementDTO[]>;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hexKey] = storedHash.split(':');
  if (!salt || !hexKey) return false;
  const expectedBuf = Buffer.from(hexKey, 'hex');
  const actualBuf = crypto.scryptSync(password, salt, 64);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function hashOtpCode(code: string, email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${email}:${code}`).digest('hex');
}

export function toPublicUser(user: StoredUserRecord): PublicUserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: normalizeRole(user.role),
    avatarUrl: user.avatarUrl,
    nationalId: user.nationalId,
    birthDate: user.birthDate,
    newsletterOptIn: user.newsletterOptIn,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    hasPassword: Boolean(user.passwordHash),
    addresses: user.addresses,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function otpKey(email: string, purpose: OtpPurpose): string {
  return `${purpose}::${email}`;
}

function formatPersianTimestamp(raw: unknown): string {
  if (!raw) return 'ثبت‌شده در حساب کاربری';
  const dt = new Date(String(raw));
  if (Number.isNaN(dt.getTime())) return String(raw);
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(dt);
  } catch {
    return dt.toISOString();
  }
}

function parseJsonValue<T>(raw: unknown, fallback: T): T {
  let current: unknown = raw;
  for (let i = 0; i < 2; i += 1) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (!trimmed) return fallback;
      try {
        current = JSON.parse(trimmed);
        continue;
      } catch {
        return fallback;
      }
    }
    break;
  }
  return current !== null && current !== undefined ? (current as T) : fallback;
}

function parseBooleanFlag(raw: unknown, fallback = false): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 't') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'f') return false;
  }
  if (typeof raw === 'number') return raw !== 0;
  return fallback;
}

function mapSupabaseOrderRow(row: Record<string, unknown>): StoredOrderRecord {
  const status = normalizeOrderStatus(row.status);
  const parsedItems = parseJsonValue<unknown>(row.items, []);
  return {
    orderCode: String(row.order_code || ''),
    userId: row.user_id ? String(row.user_id) : null,
    shaparakRef: String(row.shaparak_ref || '84729104'),
    customerName: String(row.customer_name || ''),
    customerPhone: String(row.customer_phone || ''),
    city: String(row.city || ''),
    shippingAddress: String(row.shipping_address || ''),
    postalCode: String(row.postal_code || ''),
    deliverySlot: row.delivery_slot === 'standard' ? 'standard' : 'express',
    couponCode: row.coupon_code ? String(row.coupon_code) : null,
    subtotal: Number(row.subtotal || 0),
    productDiscount: Number(row.discount_total || 0),
    couponDiscount: 0,
    shippingCost: Number(row.shipping_cost || 0),
    totalAmount: Number(row.total_amount || 0),
    status,
    deliveryPin: String(row.delivery_pin || ''),
    imeiSample: String(row.imei_sample || ''),
    adminNote: row.admin_note ? String(row.admin_note) : undefined,
    items: Array.isArray(parsedItems) ? (parsedItems as StoredOrderItem[]) : [],
    createdAt: formatPersianTimestamp(row.created_at),
  };
}

function mapSupabaseUserRow(row: Record<string, unknown>): StoredUserRecord {
  const parsedAddresses = parseJsonValue<unknown>(row.addresses, []);
  const parsedWishlist = parseJsonValue<unknown>(row.wishlist, []);
  const parsedSessions = parseJsonValue<unknown>(row.active_session_ids, []);
  const rawUsername = typeof row.username === 'string' ? normalizeUsernameServer(row.username) : '';

  return {
    id: String(row.id),
    username: rawUsername || undefined,
    email: String(row.email),
    fullName: String(row.full_name || ''),
    phone: String(row.phone || ''),
    role: normalizeRole(row.role),
    avatarUrl: typeof row.avatar_url === 'string' && row.avatar_url.trim() ? row.avatar_url.trim() : undefined,
    nationalId: row.national_id ? String(row.national_id) : undefined,
    birthDate: row.birth_date ? String(row.birth_date) : undefined,
    newsletterOptIn: row.newsletter_opt_in !== false,
    emailVerified: row.email_verified !== false,
    twoFactorEnabled: row.two_factor_enabled === true,
    passwordHash: row.password_hash ? String(row.password_hash) : undefined,
    addresses: Array.isArray(parsedAddresses) ? (parsedAddresses as StoredAddress[]) : [],
    wishlist: Array.isArray(parsedWishlist)
      ? Array.from(new Set(parsedWishlist.map((item) => String(item).trim()).filter(Boolean)))
      : [],
    activeSessionIds: Array.isArray(parsedSessions) ? (parsedSessions as string[]) : [],
    createdAt: String(row.created_at || new Date().toISOString()),
    lastLoginAt: String(row.last_login_at || new Date().toISOString()),
  };
}

function mapSupabaseOtpRow(row: Record<string, unknown>): OtpChallengeRecord {
  const parsedPending = parseJsonValue<unknown>(row.pending_signup, undefined);
  return {
    challengeKey: String(row.challenge_key),
    id: String(row.id),
    email: String(row.email),
    purpose: String(row.purpose) as OtpPurpose,
    codeHash: String(row.code_hash),
    expiresAt: new Date(String(row.expires_at)).getTime(),
    resendAvailableAt: new Date(String(row.resend_available_at)).getTime(),
    attempts: Number(row.attempts || 0),
    pendingUserId: row.pending_user_id ? String(row.pending_user_id) : undefined,
    pendingSignup:
      parsedPending && typeof parsedPending === 'object'
        ? (parsedPending as OtpChallengeRecord['pendingSignup'])
        : undefined,
  };
}

function mapSupabaseProductRow(row: Record<string, unknown>): ProductDTO {
  const parsedSpecs = parseJsonValue<unknown>(row.specs, {});
  const rawSpecs = (
    parsedSpecs && typeof parsedSpecs === 'object' && !Array.isArray(parsedSpecs) ? parsedSpecs : {}
  ) as Partial<ProductSpecsDTO> & {
    __images?: unknown;
    __customSpecs?: unknown;
    __priceUpdatedAt?: unknown;
  };
  const parsedColors = parseJsonValue<unknown>(row.colors, []);
  const rawColors = Array.isArray(parsedColors) ? (parsedColors as ProductColorDTO[]) : [];
  const parsedStorage = parseJsonValue<unknown>(row.storage_options, []);
  const rawStorage = Array.isArray(parsedStorage) ? (parsedStorage as StorageVariantDTO[]) : [];

  const mainImage = typeof row.image_url === 'string' && row.image_url.trim() ? row.image_url.trim() : '';
  const colImages = parseJsonValue<unknown>(row.images, []);
  const dedicatedImages = Array.isArray(colImages)
    ? colImages.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  const embeddedImages = Array.isArray(rawSpecs.__images)
    ? rawSpecs.__images.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  const imagesList = Array.from(
    new Set([mainImage, ...(dedicatedImages.length > 0 ? dedicatedImages : embeddedImages)].filter(Boolean))
  );

  const colCustomSpecs = parseJsonValue<unknown>(row.custom_specs, []);
  const rawCustomSpecsSource =
    Array.isArray(colCustomSpecs) && colCustomSpecs.length > 0
      ? colCustomSpecs
      : Array.isArray(rawSpecs.__customSpecs)
      ? rawSpecs.__customSpecs
      : [];
  const customSpecs = (rawCustomSpecsSource as Array<{ label?: unknown; value?: unknown }>)
    .map((s) => ({ label: String(s?.label || '').trim(), value: String(s?.value || '').trim() }))
    .filter((s) => s.label && s.value);

  const priceUpdatedAt =
    row.price_updated_at
      ? String(row.price_updated_at)
      : typeof rawSpecs.__priceUpdatedAt === 'string' && rawSpecs.__priceUpdatedAt.trim()
      ? rawSpecs.__priceUpdatedAt.trim()
      : row.updated_at
      ? String(row.updated_at)
      : row.created_at
      ? String(row.created_at)
      : undefined;

  const stockCount = Math.max(0, Number(row.stock_count ?? 0) || 0);
  const inStock = parseBooleanFlag(row.in_stock, stockCount > 0);
  const ratingNum = Number(row.rating);

  return {
    id: String(row.id || row.slug),
    slug: String(row.slug || row.id),
    nameFa: String(row.name_fa || ''),
    nameEn: String(row.name_en || ''),
    modelName: row.model_name ? String(row.model_name) : undefined,
    descriptionFa: row.description_fa ? String(row.description_fa) : undefined,
    brand: String(row.brand || 'Apple').trim(),
    category: String(row.category || 'phones').trim().toLowerCase() as ProductCategory,
    price: Number(row.price || 0),
    originalPrice:
      row.original_price !== null && row.original_price !== undefined
        ? Number(row.original_price)
        : undefined,
    discountPercent:
      row.discount_percent !== null && row.discount_percent !== undefined
        ? Number(row.discount_percent)
        : undefined,
    inStock,
    stockCount,
    expressDelivery: row.express_delivery !== false && String(row.express_delivery) !== 'false',
    warranty: String(row.warranty || '۱۸ ماهه امیر سرویس + کد رجیستری همتا'),
    warrantyId: row.warranty_id ? String(row.warranty_id) : undefined,
    badgeText:
      typeof row.badge_text === 'string' && row.badge_text.trim() ? row.badge_text : undefined,
    rating: Number.isFinite(ratingNum) ? ratingNum : 4.8,
    reviewCount: Number(row.review_count ?? 0),
    recommendPercent: Number(row.recommend_percent ?? 95),
    image: mainImage,
    images: imagesList.length > 0 ? imagesList : undefined,
    colorLabel: String(row.color_label || rawColors[0]?.name || 'مشکی'),
    colors:
      rawColors.length > 0 ? rawColors : [{ id: 'midnight', name: 'مشکی', hex: '#1e293b' }],
    storageOptions:
      rawStorage.length > 0
        ? rawStorage
        : [{ label: '۲۵۶ گیگابایت', subtitle: 'استاندارد', priceDelta: 0 }],
    specs: {
      display: rawSpecs.display || 'OLED 120Hz',
      displayDetails: rawSpecs.displayDetails || 'کیفیت پرچمدار',
      chipset: rawSpecs.chipset || 'پردازنده پرچمدار',
      chipsetDetails: rawSpecs.chipsetDetails || 'نسل جدید',
      camera: rawSpecs.camera || 'دوربین سه‌گانه حرفه‌ای',
      cameraDetails: rawSpecs.cameraDetails || 'لرزشگیر اپتیکال',
      battery: rawSpecs.battery || '۵۰۰۰ میلی‌آمپر',
      batteryDetails: rawSpecs.batteryDetails || 'شارژ سریع',
      storageDefault: rawSpecs.storageDefault || '۲۵۶ گیگابایت',
      ram: rawSpecs.ram || '۸ گیگ',
      os: rawSpecs.os || 'نسخه رسمی گلوبال',
    },
    customSpecs: customSpecs.length > 0 ? customSpecs : undefined,
    priceUpdatedAt,
    isPublished: row.is_published !== false,
    isFeaturedDeal: parseBooleanFlag(row.is_featured_deal, false),
    isPopular: parseBooleanFlag(row.is_popular, false),
    salesRank: Number(row.sales_rank ?? 100),
    releaseOrder: Number(row.release_order ?? 100),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function toSupabaseProductRow(p: ProductDTO, includeExtendedColumns = false): Record<string, unknown> {
  const cleanImages = Array.isArray(p.images)
    ? Array.from(new Set([p.image, ...p.images].map((u) => String(u || '').trim()).filter(Boolean)))
    : [];
  const cleanCustomSpecs: CustomSpecItemDTO[] = Array.isArray(p.customSpecs)
    ? p.customSpecs
        .map((s) => ({ label: String(s?.label || '').trim(), value: String(s?.value || '').trim() }))
        .filter((s) => s.label && s.value)
    : [];

  const specsPayload: Record<string, unknown> = { ...p.specs };
  if (cleanImages.length > 0) specsPayload.__images = cleanImages;
  if (cleanCustomSpecs.length > 0) specsPayload.__customSpecs = cleanCustomSpecs;
  if (p.priceUpdatedAt) specsPayload.__priceUpdatedAt = p.priceUpdatedAt;

  const baseRow: Record<string, unknown> = {
    id: p.id,
    slug: p.slug,
    name_fa: p.nameFa,
    name_en: p.nameEn,
    brand: p.brand,
    category: p.category,
    price: Math.round(p.price),
    original_price: p.originalPrice ? Math.round(p.originalPrice) : null,
    discount_percent: p.discountPercent ?? 0,
    in_stock: p.inStock,
    stock_count: Math.max(0, Math.floor(p.stockCount)),
    express_delivery: p.expressDelivery,
    warranty: p.warranty,
    badge_text: p.badgeText ?? null,
    rating: p.rating,
    review_count: p.reviewCount,
    recommend_percent: p.recommendPercent,
    image_url: p.image || cleanImages[0] || null,
    color_label: p.colorLabel,
    colors: p.colors,
    storage_options: p.storageOptions,
    specs: specsPayload,
    is_featured_deal: Boolean(p.isFeaturedDeal),
    is_popular: Boolean(p.isPopular),
    sales_rank: p.salesRank,
    release_order: p.releaseOrder,
    updated_at: new Date().toISOString(),
  };

  if (includeExtendedColumns) {
    baseRow.images = cleanImages;
    baseRow.custom_specs = cleanCustomSpecs;
    baseRow.price_updated_at = p.priceUpdatedAt || new Date().toISOString();
  }

  return baseRow;
}

function mapSupabaseAuditRow(row: Record<string, unknown>): AdminAuditLogDTO {
  const detailsRaw = row.details ?? row.metadata ?? row.payload ?? {};
  const detailsObj =
    detailsRaw && typeof detailsRaw === 'object' && !Array.isArray(detailsRaw)
      ? (detailsRaw as Record<string, unknown>)
      : {};

  return {
    id: String(row.id || crypto.randomUUID()),
    adminUserId: String(
      row.admin_user_id ?? row.actor_id ?? row.actor_user_id ?? row.user_id ?? row.admin_id ?? ''
    ),
    adminEmail: String(
      row.admin_email ?? row.actor_email ?? row.email ?? detailsObj.adminEmail ?? ''
    ),
    action: String(row.action || ''),
    entityType: String(
      row.entity_type ?? row.resource_type ?? row.target_type ?? detailsObj.entityType ?? ''
    ),
    entityId: String(
      row.entity_id ?? row.resource_id ?? row.target_id ?? detailsObj.entityId ?? ''
    ),
    details: sanitizeAuditDetails(detailsObj),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function buildCustomerStatsMap(
  orders: StoredOrderRecord[]
): Map<string, { count: number; totalSpent: number }> {
  const stats = new Map<string, { count: number; totalSpent: number }>();
  for (const ord of orders) {
    if (!ord.userId) continue;
    const prev = stats.get(ord.userId) || { count: 0, totalSpent: 0 };
    prev.count += 1;
    if (ord.status !== 'cancelled') {
      prev.totalSpent += ord.totalAmount;
    }
    stats.set(ord.userId, prev);
  }
  return stats;
}

function toAdminCustomer(
  user: StoredUserRecord,
  stats?: { count: number; totalSpent: number }
): AdminCustomerDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: normalizeRole(user.role),
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    newsletterOptIn: user.newsletterOptIn,
    addressesCount: user.addresses.length,
    wishlistCount: user.wishlist.length,
    ordersCount: stats?.count ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function isSchemaColumnMismatch(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return (
    err.code === 'PGRST204' ||
    err.code === '42703' ||
    err.code === '23502' ||
    /column/i.test(err.message || '')
  );
}

function isMissingRelationError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    /does not exist|Could not find the table|relation/i.test(err.message || '')
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val: string | null | undefined): boolean {
  return Boolean(val && UUID_RE.test(val.trim()));
}

export function createSupabaseAuthStorage(supabase: SupabaseClient): AuthStorageAdapter {
  const avatarSettingKey = (userId: string) => `user_avatar:${userId}`;
  const usernameSettingKey = (userId: string) => `user_username:${userId}`;
  const usernameLookupKey = (username: string) =>
    `user_username_lookup:${normalizeUsernameServer(username)}`;

  const hydrateUserExtrasFallback = async (
    rawRow: Record<string, unknown>,
    mapped: StoredUserRecord
  ): Promise<StoredUserRecord> => {
    let next = mapped;
    if (!next.avatarUrl && !('avatar_url' in rawRow)) {
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', avatarSettingKey(next.id))
          .maybeSingle();
        const val = data?.value as { avatarUrl?: unknown } | string | null | undefined;
        const storedUrl =
          typeof val === 'string'
            ? val.trim()
            : val && typeof val === 'object' && typeof val.avatarUrl === 'string'
            ? val.avatarUrl.trim()
            : '';
        if (storedUrl) {
          next = { ...next, avatarUrl: storedUrl };
        }
      } catch {
        // Ignore if store_settings is unavailable in mock tests
      }
    }

    if (!next.username) {
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', usernameSettingKey(next.id))
          .maybeSingle();
        const val = data?.value as { username?: unknown } | string | null | undefined;
        const storedUsername =
          typeof val === 'string'
            ? normalizeUsernameServer(val)
            : val && typeof val === 'object' && typeof val.username === 'string'
            ? normalizeUsernameServer(val.username)
            : '';
        if (storedUsername) {
          next = { ...next, username: storedUsername };
        }
      } catch {
        // Ignore if store_settings is unavailable in mock tests
      }
    }
    return next;
  };

  const persistAvatarFallback = async (userId: string, avatarUrl?: string): Promise<void> => {
    try {
      if (avatarUrl) {
        await supabase.from('store_settings').upsert({
          key: avatarSettingKey(userId),
          value: { avatarUrl },
          updated_at: new Date().toISOString(),
        });
      } else {
        await supabase.from('store_settings').delete().eq('key', avatarSettingKey(userId));
      }
    } catch {
      // Ignore if store_settings is unavailable
    }
  };

  const persistUsernameFallback = async (
    userId: string,
    nextUsername?: string,
    previousUsername?: string
  ): Promise<void> => {
    try {
      const cleanPrev = previousUsername ? normalizeUsernameServer(previousUsername) : '';
      const cleanNext = nextUsername ? normalizeUsernameServer(nextUsername) : '';
      if (cleanPrev && cleanPrev !== cleanNext) {
        await supabase.from('store_settings').delete().eq('key', usernameLookupKey(cleanPrev));
      }
      if (cleanNext) {
        const updatedAt = new Date().toISOString();
        await supabase.from('store_settings').upsert({
          key: usernameSettingKey(userId),
          value: { username: cleanNext },
          updated_at: updatedAt,
        });
        await supabase.from('store_settings').upsert({
          key: usernameLookupKey(cleanNext),
          value: { userId },
          updated_at: updatedAt,
        });
      } else {
        await supabase.from('store_settings').delete().eq('key', usernameSettingKey(userId));
      }
    } catch {
      // Ignore if store_settings is unavailable
    }
  };

  return {
    mode: 'supabase',

    async checkHealth() {
      const { error } = await supabase
        .from('app_users')
        .select('id', { count: 'exact', head: true });
      if (error) {
        return { ok: false, mode: 'supabase', detail: error.message };
      }
      return { ok: true, mode: 'supabase' };
    },

    async findUserByEmail(email: string) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) throw new Error(`Supabase user lookup failed: ${error.message}`);
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return hydrateUserExtrasFallback(row, mapSupabaseUserRow(row));
    },

    async findUserByUsername(username: string) {
      const normalized = normalizeUsernameServer(username);
      if (!normalized) return null;
      try {
        const selector = supabase.from('app_users').select('*') as unknown as {
          ilike?: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown; error: { code?: string; message?: string } | null }> };
          eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown; error: { code?: string; message?: string } | null }> };
        };
        const { data, error } =
          typeof selector.ilike === 'function'
            ? await selector.ilike('username', normalized).maybeSingle()
            : await selector.eq('username', normalized).maybeSingle();
        if (!error && data) {
          const row = data as Record<string, unknown>;
          return hydrateUserExtrasFallback(row, mapSupabaseUserRow(row));
        }
        if (error && !isSchemaColumnMismatch(error)) {
          throw new Error(`Supabase username lookup failed: ${error.message}`);
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('Supabase username lookup failed:')) {
          throw err;
        }
      }

      try {
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', usernameLookupKey(normalized))
          .maybeSingle();
        const val = data?.value as { userId?: unknown } | string | null | undefined;
        const userId =
          typeof val === 'string'
            ? val.trim()
            : val && typeof val === 'object' && typeof val.userId === 'string'
            ? val.userId.trim()
            : '';
        if (userId) {
          const found = await this.findUserById(userId);
          if (found && (!found.username || normalizeUsernameServer(found.username) === normalized)) {
            return { ...found, username: normalized };
          }
        }
      } catch {
        // Ignore if store_settings is unavailable
      }
      return null;
    },

    async findUserById(userId: string) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error(`Supabase user lookup failed: ${error.message}`);
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return hydrateUserExtrasFallback(row, mapSupabaseUserRow(row));
    },

    async createUser(params) {
      const nowIso = new Date().toISOString();
      const cleanUsername = params.username ? normalizeUsernameServer(params.username) : undefined;
      const baseRow: Record<string, unknown> = {
        id: crypto.randomUUID(),
        email: params.email,
        full_name: params.fullName.trim(),
        phone: params.phone.trim(),
        role: params.role ? normalizeRole(params.role) : 'customer',
        newsletter_opt_in: true,
        email_verified: true,
        two_factor_enabled: false,
        password_hash: params.passwordHash ?? null,
        addresses: [],
        wishlist: [],
        active_session_ids: [],
        created_at: nowIso,
        last_login_at: nowIso,
      };
      const withUsernameRow = cleanUsername ? { ...baseRow, username: cleanUsername } : baseRow;
      let usedUsernameFallback = false;
      let { data, error } = await supabase
        .from('app_users')
        .insert(withUsernameRow)
        .select('*')
        .single();

      if (error && cleanUsername && isSchemaColumnMismatch(error)) {
        usedUsernameFallback = true;
        const fb = await supabase.from('app_users').insert(baseRow).select('*').single();
        data = fb.data;
        error = fb.error;
      }

      if (error || !data) {
        throw new Error(`Supabase create user failed: ${error?.message || 'no row returned'}`);
      }
      const mapped = mapSupabaseUserRow(data as Record<string, unknown>);
      if (usedUsernameFallback && cleanUsername) {
        await persistUsernameFallback(mapped.id, cleanUsername);
        return { ...mapped, username: cleanUsername };
      }
      return mapped;
    },

    async updateUser(userId, updater) {
      const current = await this.findUserById(userId);
      if (!current) return null;
      const next = updater(current);
      const nextUsername = next.username ? normalizeUsernameServer(next.username) : undefined;

      const basePayload: Record<string, unknown> = {
        email: next.email,
        full_name: next.fullName,
        phone: next.phone,
        role: normalizeRole(next.role),
        national_id: next.nationalId ?? null,
        birth_date: next.birthDate ?? null,
        newsletter_opt_in: next.newsletterOptIn,
        email_verified: next.emailVerified,
        two_factor_enabled: next.twoFactorEnabled,
        password_hash: next.passwordHash ?? null,
        addresses: next.addresses,
        wishlist: next.wishlist,
        active_session_ids: next.activeSessionIds,
        last_login_at: next.lastLoginAt,
      };

      const withAvatar = { ...basePayload, avatar_url: next.avatarUrl ?? null };
      const withAllExtras = { ...withAvatar, username: nextUsername ?? null };
      let usedAvatarFallback = false;
      let usedUsernameFallback = false;

      let { data, error } = await supabase
        .from('app_users')
        .update(withAllExtras)
        .eq('id', userId)
        .select('*')
        .single();

      if (error && isSchemaColumnMismatch(error)) {
        usedUsernameFallback = true;
        const avatarTry = await supabase
          .from('app_users')
          .update(withAvatar)
          .eq('id', userId)
          .select('*')
          .single();
        data = avatarTry.data;
        error = avatarTry.error;

        if (error && isSchemaColumnMismatch(error)) {
          usedAvatarFallback = true;
          const baseTry = await supabase
            .from('app_users')
            .update(basePayload)
            .eq('id', userId)
            .select('*')
            .single();
          data = baseTry.data;
          error = baseTry.error;
        }
      }

      if (error || !data) {
        throw new Error(`Supabase update user failed: ${error?.message || 'no row returned'}`);
      }

      let mapped = mapSupabaseUserRow(data as Record<string, unknown>);
      if (usedAvatarFallback) {
        await persistAvatarFallback(userId, next.avatarUrl);
        mapped = { ...mapped, avatarUrl: next.avatarUrl };
      }
      if (usedUsernameFallback || nextUsername !== current.username) {
        if (usedUsernameFallback) {
          await persistUsernameFallback(userId, nextUsername, current.username);
          mapped = { ...mapped, username: nextUsername };
        } else if (current.username && nextUsername !== current.username) {
          await persistUsernameFallback(userId, undefined, current.username);
        }
      }

      return mapped;
    },

    async deleteUser(userId: string) {
      const existing = await this.findUserById(userId).catch(() => null);
      const { error } = await supabase.from('app_users').delete().eq('id', userId);
      if (error) {
        throw new Error(`Supabase delete user failed: ${error.message}`);
      }
      await persistAvatarFallback(userId, undefined);
      await persistUsernameFallback(userId, undefined, existing?.username);
      return true;
    },

    async getOtpChallenge(challengeKey: string) {
      const { data, error } = await supabase
        .from('auth_otp_challenges')
        .select('*')
        .eq('challenge_key', challengeKey)
        .maybeSingle();
      if (error) throw new Error(`Supabase OTP lookup failed: ${error.message}`);
      return data ? mapSupabaseOtpRow(data as Record<string, unknown>) : null;
    },

    async upsertOtpChallenge(challenge: OtpChallengeRecord) {
      const { error } = await supabase.from('auth_otp_challenges').upsert({
        challenge_key: challenge.challengeKey,
        id: challenge.id,
        email: challenge.email,
        purpose: challenge.purpose,
        code_hash: challenge.codeHash,
        expires_at: new Date(challenge.expiresAt).toISOString(),
        resend_available_at: new Date(challenge.resendAvailableAt).toISOString(),
        attempts: challenge.attempts,
        pending_user_id: challenge.pendingUserId ?? null,
        pending_signup: challenge.pendingSignup ?? null,
      });
      if (error) throw new Error(`Supabase OTP upsert failed: ${error.message}`);
    },

    async deleteOtpChallenge(challengeKey: string) {
      const { error } = await supabase
        .from('auth_otp_challenges')
        .delete()
        .eq('challenge_key', challengeKey);
      if (error) throw new Error(`Supabase OTP delete failed: ${error.message}`);
    },

    async listUserOrders(userId: string) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase list user orders failed: ${error.message}`);
      return (data || []).map((row) => mapSupabaseOrderRow(row as Record<string, unknown>));
    },

    async createOrder(userId: string | null, order: StoredOrderRecord) {
      const normalizedAddress =
        order.city && !order.shippingAddress.startsWith(order.city)
          ? `${order.city}، ${order.shippingAddress}`
          : order.shippingAddress;
      const payload = {
        order_code: order.orderCode,
        user_id: userId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        city: order.city,
        shipping_address: normalizedAddress,
        postal_code: order.postalCode,
        delivery_slot: order.deliverySlot,
        shaparak_ref: order.shaparakRef,
        coupon_code: order.couponCode,
        subtotal: order.subtotal,
        discount_total: order.productDiscount + order.couponDiscount,
        shipping_cost: order.shippingCost,
        total_amount: order.totalAmount,
        status: order.status,
        delivery_pin: order.deliveryPin,
        imei_sample: order.imeiSample,
        items: order.items,
      };
      const { data, error } = await supabase.from('orders').insert(payload).select('*').single();
      if (error || !data) {
        throw new Error(`Supabase create order failed: ${error?.message || 'no row returned'}`);
      }
      // Best-effort normalized V3 order_items sync (never fails if V3 migration hasn't run yet)
      try {
        const orderId = String((data as Record<string, unknown>).id || '');
        if (orderId && order.items.length > 0) {
          const rows = order.items.map((item) => ({
            order_id: orderId,
            product_id: item.productId,
            variant_id: isUuid(item.variantId) ? item.variantId : null,
            sku: item.sku || null,
            part_number: item.partNumber || null,
            product_title_fa: item.nameFa,
            color_name_fa: item.colorName,
            storage: item.storageLabel,
            warranty_title: item.warranty,
            quantity: item.qty,
            unit_price_toman: item.unitPrice,
            original_unit_price_toman: item.originalUnitPrice,
            line_total_toman: item.unitPrice * item.qty,
          }));
          await supabase.from('order_items').insert(rows);
        }
      } catch {
        // Ignore if order_items table is not migrated yet
      }
      return mapSupabaseOrderRow(data as Record<string, unknown>);
    },

    async findOrderByCode(orderCode: string) {
      const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', normalized)
        .maybeSingle();
      if (error) throw new Error(`Supabase order lookup failed: ${error.message}`);
      return data ? mapSupabaseOrderRow(data as Record<string, unknown>) : null;
    },

    async listAllOrders(params = {}) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase list orders failed: ${error.message}`);
      let mapped = (data || []).map((row) => mapSupabaseOrderRow(row as Record<string, unknown>));

      if (params.status && params.status !== 'all') {
        mapped = mapped.filter((o) => o.status === params.status);
      }
      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        mapped = mapped.filter(
          (o) =>
            o.orderCode.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            normalizePhone(o.customerPhone).includes(normalizePhone(q))
        );
      }

      const total = mapped.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { orders: mapped.slice(offset, offset + limit), total };
    },

    async updateOrderStatus(orderCode: string, status: OrderStatus, adminNote?: string) {
      const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
      const patch: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminNote !== undefined) {
        patch.admin_note = adminNote;
      }
      const { data, error } = await supabase
        .from('orders')
        .update(patch)
        .eq('order_code', normalized)
        .select('*')
        .maybeSingle();
      if (error) throw new Error(`Supabase update order failed: ${error.message}`);
      return data ? mapSupabaseOrderRow(data as Record<string, unknown>) : null;
    },

    async listProducts(query = {}) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('release_order', { ascending: true });
      if (error) throw new Error(`Supabase list products failed: ${error.message}`);
      const mapped = (data || []).map((row) => mapSupabaseProductRow(row as Record<string, unknown>));
      return filterAndSortProducts(mapped, query);
    },

    async findProductByIdOrSlug(idOrSlug: string) {
      const clean = idOrSlug.trim();
      const bySlug = await supabase.from('products').select('*').eq('slug', clean).maybeSingle();
      if (bySlug.error) throw new Error(`Supabase product lookup failed: ${bySlug.error.message}`);
      if (bySlug.data) return mapSupabaseProductRow(bySlug.data as Record<string, unknown>);

      const byId = await supabase.from('products').select('*').eq('id', clean).maybeSingle();
      if (byId.error) throw new Error(`Supabase product lookup failed: ${byId.error.message}`);
      return byId.data ? mapSupabaseProductRow(byId.data as Record<string, unknown>) : null;
    },

    async createProduct(product: ProductDTO) {
      const nowIso = new Date().toISOString();
      const target = {
        ...product,
        priceUpdatedAt: product.priceUpdatedAt || nowIso,
      };
      let { data, error } = await supabase
        .from('products')
        .insert(toSupabaseProductRow(target, true))
        .select('*')
        .single();
      if (error && isSchemaColumnMismatch(error)) {
        const fallback = await supabase
          .from('products')
          .insert(toSupabaseProductRow(target, false))
          .select('*')
          .single();
        data = fallback.data;
        error = fallback.error;
      }
      if (error || !data) {
        throw new Error(`Supabase create product failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseProductRow(data as Record<string, unknown>);
    },

    async updateProduct(id: string, patch: Partial<ProductDTO>) {
      const current = await this.findProductByIdOrSlug(id);
      if (!current) return null;
      const priceChanged = typeof patch.price === 'number' && patch.price !== current.price;
      const merged: ProductDTO = {
        ...current,
        ...patch,
        id: current.id,
        specs: patch.specs ? { ...current.specs, ...patch.specs } : current.specs,
        colors: patch.colors ?? current.colors,
        storageOptions: patch.storageOptions ?? current.storageOptions,
        images: patch.images !== undefined ? patch.images : current.images,
        customSpecs: patch.customSpecs !== undefined ? patch.customSpecs : current.customSpecs,
        priceUpdatedAt: priceChanged
          ? new Date().toISOString()
          : patch.priceUpdatedAt ?? current.priceUpdatedAt,
      };
      if (typeof patch.stockCount === 'number' && patch.inStock === undefined) {
        merged.inStock = patch.stockCount > 0;
      }
      let { data, error } = await supabase
        .from('products')
        .update(toSupabaseProductRow(merged, true))
        .eq('id', current.id)
        .select('*')
        .single();
      if (error && isSchemaColumnMismatch(error)) {
        const fallback = await supabase
          .from('products')
          .update(toSupabaseProductRow(merged, false))
          .eq('id', current.id)
          .select('*')
          .single();
        data = fallback.data;
        error = fallback.error;
      }
      if (error || !data) {
        throw new Error(`Supabase update product failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseProductRow(data as Record<string, unknown>);
    },

    async updateProductInventory(id: string, stockCount: number, inStock?: boolean) {
      const current = await this.findProductByIdOrSlug(id);
      if (!current) return null;
      const safeStock = Math.max(0, Math.floor(stockCount));
      const nextInStock = typeof inStock === 'boolean' ? inStock : safeStock > 0;
      const { data, error } = await supabase
        .from('products')
        .update({
          stock_count: safeStock,
          in_stock: nextInStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id)
        .select('*')
        .single();
      if (error || !data) {
        throw new Error(`Supabase update inventory failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseProductRow(data as Record<string, unknown>);
    },

    async deleteProduct(id: string) {
      const current = await this.findProductByIdOrSlug(id);
      if (!current) return false;
      const { error } = await supabase.from('products').delete().eq('id', current.id);
      if (error) throw new Error(`Supabase delete product failed: ${error.message}`);
      return true;
    },

    async decrementProductStock(productId: string, qty: number) {
      const current = await this.findProductByIdOrSlug(productId);
      if (!current) return;
      const nextStock = Math.max(0, current.stockCount - Math.max(0, Math.floor(qty)));
      await supabase
        .from('products')
        .update({
          stock_count: nextStock,
          in_stock: nextStock > 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id);
    },

    async listCategories(includeInactive = false) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: CategoryDTO[] = data.map((row: Record<string, unknown>) => ({
            id: String(row.id || row.slug),
            slug: String(row.slug || row.id),
            label: String(row.label || ''),
            titleEn: row.title_en ? String(row.title_en) : undefined,
            subtitle: String(row.subtitle || ''),
            descriptionFa: row.description_fa ? String(row.description_fa) : undefined,
            iconName: row.icon_name ? String(row.icon_name) : undefined,
            parentId: row.parent_id ? String(row.parent_id) : null,
            isActive: row.is_active !== false,
            image: String(row.image || ''),
            seoTitle: String(row.seo_title || ''),
            seoDescription: String(row.seo_description || ''),
            sortOrder: Number(row.sort_order ?? 100),
          }));
          mapped.sort((a, b) => a.sortOrder - b.sortOrder);
          return includeInactive ? mapped : mapped.filter((c) => c.isActive);
        }
      } catch {
        // Fallback to store_settings or defaults below
      }
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'catalog_categories')
          .maybeSingle();
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          const list = (data.value as CategoryDTO[]).slice().sort((a, b) => a.sortOrder - b.sortOrder);
          return includeInactive ? list : list.filter((c) => c.isActive);
        }
      } catch {
        // Ignore if store_settings missing in isolated tests
      }
      const fallback = DEFAULT_DEV_CATEGORIES.map((c) => ({ ...c })).sort((a, b) => a.sortOrder - b.sortOrder);
      return includeInactive ? fallback : fallback.filter((c) => c.isActive);
    },

    async upsertCategory(category: CategoryDTO) {
      try {
        const basePayload: Record<string, unknown> = {
          id: category.id,
          slug: category.slug,
          label: category.label,
          subtitle: category.subtitle,
          parent_id: category.parentId || null,
          is_active: category.isActive,
          image: category.image,
          seo_title: category.seoTitle,
          seo_description: category.seoDescription,
          sort_order: category.sortOrder,
        };
        const extPayload: Record<string, unknown> = {
          ...basePayload,
          title_en: category.titleEn || null,
          description_fa: category.descriptionFa || null,
          icon_name: category.iconName || 'Folder',
        };
        let { data, error } = await supabase.from('categories').upsert(extPayload).select('*').single();
        if (error && isSchemaColumnMismatch(error)) {
          const fb = await supabase.from('categories').upsert(basePayload).select('*').single();
          data = fb.data;
          error = fb.error;
        }
        if (!error && data) {
          return {
            id: String(data.id),
            slug: String(data.slug),
            label: String(data.label),
            titleEn: data.title_en ? String(data.title_en) : undefined,
            subtitle: String(data.subtitle || ''),
            descriptionFa: data.description_fa ? String(data.description_fa) : undefined,
            iconName: data.icon_name ? String(data.icon_name) : undefined,
            parentId: data.parent_id ? String(data.parent_id) : null,
            isActive: data.is_active !== false,
            image: String(data.image || ''),
            seoTitle: String(data.seo_title || ''),
            seoDescription: String(data.seo_description || ''),
            sortOrder: Number(data.sort_order ?? 100),
          };
        }
      } catch {
        // Fallback to store_settings
      }
      const existing = await this.listCategories(true);
      const next = [...existing.filter((c) => c.id !== category.id && c.slug !== category.slug), category].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      await supabase.from('store_settings').upsert({
        key: 'catalog_categories',
        value: next,
        updated_at: new Date().toISOString(),
      });
      return category;
    },

    async deleteCategory(idOrSlug: string) {
      const clean = idOrSlug.trim().toLowerCase();
      try {
        const { error } = await supabase.from('categories').delete().or(`id.eq.${clean},slug.eq.${clean}`);
        if (!error) return true;
      } catch {
        // Fallback to store_settings
      }
      const existing = await this.listCategories(true);
      const filtered = existing
        .filter((c) => c.id.toLowerCase() !== clean && c.slug.toLowerCase() !== clean)
        .map((c) => (c.parentId?.toLowerCase() === clean ? { ...c, parentId: null } : c));
      if (filtered.length === existing.length) return false;
      await supabase.from('store_settings').upsert({
        key: 'catalog_categories',
        value: filtered,
        updated_at: new Date().toISOString(),
      });
      return true;
    },

    async listBrands() {
      try {
        const { data, error } = await supabase.from('brands').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row: Record<string, unknown>) => ({
            id: String(row.id || row.name),
            name: String(row.name || ''),
            labelFa: row.label_fa ? String(row.label_fa) : undefined,
            slug: row.slug ? String(row.slug) : String(row.id || '').toLowerCase(),
            logoUrl: row.logo_url ? String(row.logo_url) : undefined,
            websiteUrl: row.website_url ? String(row.website_url) : undefined,
            isFeatured: Boolean(row.is_featured),
            isActive: row.is_active !== false,
          }));
        }
      } catch {
        // Fallback to store_settings
      }
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'catalog_brands')
          .maybeSingle();
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          return data.value as BrandDTO[];
        }
      } catch {
        // Ignore
      }
      return DEFAULT_DEV_BRANDS.map((b) => ({ ...b }));
    },

    async upsertBrand(brand: BrandDTO) {
      try {
        const basePayload: Record<string, unknown> = {
          id: brand.id,
          name: brand.name,
          label_fa: brand.labelFa ?? '',
          is_active: brand.isActive,
        };
        const extPayload: Record<string, unknown> = {
          ...basePayload,
          slug: brand.slug || brand.id.toLowerCase(),
          logo_url: brand.logoUrl || null,
          website_url: brand.websiteUrl || null,
          is_featured: Boolean(brand.isFeatured),
        };
        let { data, error } = await supabase.from('brands').upsert(extPayload).select('*').single();
        if (error && isSchemaColumnMismatch(error)) {
          const fb = await supabase.from('brands').upsert(basePayload).select('*').single();
          data = fb.data;
          error = fb.error;
        }
        if (!error && data) {
          return {
            id: String(data.id),
            name: String(data.name),
            labelFa: data.label_fa ? String(data.label_fa) : undefined,
            slug: data.slug ? String(data.slug) : undefined,
            logoUrl: data.logo_url ? String(data.logo_url) : undefined,
            websiteUrl: data.website_url ? String(data.website_url) : undefined,
            isFeatured: Boolean(data.is_featured),
            isActive: data.is_active !== false,
          };
        }
      } catch {
        // Fallback
      }
      const existing = await this.listBrands();
      const next = [
        ...existing.filter(
          (b) => b.id.toLowerCase() !== brand.id.toLowerCase() && b.name.toLowerCase() !== brand.name.toLowerCase()
        ),
        brand,
      ];
      await supabase.from('store_settings').upsert({
        key: 'catalog_brands',
        value: next,
        updated_at: new Date().toISOString(),
      });
      return brand;
    },

    async deleteBrand(idOrName: string) {
      const clean = idOrName.trim().toLowerCase();
      try {
        const { error } = await supabase.from('brands').delete().or(`id.eq.${clean},name.ilike.${clean}`);
        if (!error) return true;
      } catch {
        // Fallback
      }
      const existing = await this.listBrands();
      const next = existing.filter(
        (b) => b.id.toLowerCase() !== clean && b.name.toLowerCase() !== clean
      );
      if (next.length === existing.length) return false;
      await supabase.from('store_settings').upsert({
        key: 'catalog_brands',
        value: next,
        updated_at: new Date().toISOString(),
      });
      return true;
    },

    async listActiveCoupons() {
      const { data, error } = await supabase.from('coupons').select('*').eq('is_active', true);
      if (error) throw new Error(`Supabase list coupons failed: ${error.message}`);
      return (data || []).map((row) => ({
        code: String(row.code),
        discountType: (row.discount_type === 'percent' ? 'percent' : 'fixed') as 'fixed' | 'percent',
        discountValue: Number(row.discount_value || 0),
        maxDiscount: row.max_discount ? Number(row.max_discount) : undefined,
        minOrderAmount: row.min_order_amount ? Number(row.min_order_amount) : 0,
        isActive: row.is_active !== false,
        descriptionFa: row.description_fa ? String(row.description_fa) : undefined,
      }));
    },

    async getStoreSettings() {
      const { data, error } = await supabase.from('store_settings').select('key, value');
      if (error) throw new Error(`Supabase settings failed: ${error.message}`);
      const map = new Map((data || []).map((r) => [String(r.key), r.value]));
      const ann = map.get('announcement_text');
      const threshold = map.get('free_shipping_threshold');
      const phone = map.get('support_phone');
      return {
        announcementText: typeof ann === 'string' ? ann : DEFAULT_DEV_SETTINGS.announcementText,
        freeShippingThreshold:
          typeof threshold === 'number' && threshold > 0
            ? threshold
            : DEFAULT_DEV_SETTINGS.freeShippingThreshold,
        supportPhone: typeof phone === 'string' ? phone : DEFAULT_DEV_SETTINGS.supportPhone,
      };
    },

    async listProductReviews(productId: string) {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase reviews failed: ${error.message}`);
      return (data || []).map((row) => ({
        id: String(row.id),
        productId: String(row.product_id || productId),
        author: String(row.author || ''),
        authorUsername: row.author_username ? normalizeUsernameServer(row.author_username) : undefined,
        dateLabel: formatPersianTimestamp(row.created_at),
        rating: Number(row.rating || 5),
        comment: String(row.comment || ''),
        verified: Boolean(row.verified),
        isApproved: row.is_approved !== false,
        createdAt: String(row.created_at || new Date().toISOString()),
      }));
    },

    async createProductReview(review: ProductReviewDTO) {
      const baseInsert = {
        product_id: review.productId,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        verified: review.verified,
        is_approved: review.isApproved,
      };
      const extInsert = review.authorUsername
        ? { ...baseInsert, author_username: normalizeUsernameServer(review.authorUsername) }
        : baseInsert;

      let { data, error } = await supabase
        .from('product_reviews')
        .insert(extInsert)
        .select('*')
        .single();
      if (error && review.authorUsername && isSchemaColumnMismatch(error)) {
        const fb = await supabase
          .from('product_reviews')
          .insert(baseInsert)
          .select('*')
          .single();
        data = fb.data;
        error = fb.error;
      }
      if (error || !data) {
        throw new Error(`Supabase create review failed: ${error?.message || 'no row returned'}`);
      }
      return {
        id: String(data.id),
        productId: String(data.product_id),
        author: String(data.author),
        authorUsername: data.author_username
          ? normalizeUsernameServer(data.author_username)
          : review.authorUsername,
        dateLabel: 'هم‌اکنون',
        rating: Number(data.rating),
        comment: String(data.comment),
        verified: Boolean(data.verified),
        isApproved: data.is_approved !== false,
        createdAt: String(data.created_at || review.createdAt),
      };
    },

    async createSupportTicket(ticket: SupportTicketDTO) {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_code: ticket.ticketCode,
          full_name: ticket.fullName,
          phone: ticket.phone,
          department: ticket.department,
          order_code: ticket.orderCode || null,
          message: ticket.message,
          status: ticket.status,
        })
        .select('*')
        .single();
      if (error || !data) {
        throw new Error(`Supabase support ticket failed: ${error?.message || 'no row returned'}`);
      }
      return {
        id: String(data.id),
        ticketCode: String(data.ticket_code),
        fullName: String(data.full_name),
        phone: String(data.phone),
        department: String(data.department),
        orderCode: data.order_code ? String(data.order_code) : '',
        message: String(data.message),
        status: (data.status as SupportTicketDTO['status']) || 'open',
        createdAt: formatPersianTimestamp(data.created_at),
      };
    },

    async subscribeNewsletter(contact: string) {
      const { error } = await supabase.from('newsletter_subscribers').insert({ contact });
      if (error) {
        if (error.code === '23505') {
          return { alreadySubscribed: true };
        }
        throw new Error(`Supabase newsletter subscribe failed: ${error.message}`);
      }
      return { alreadySubscribed: false };
    },

    async listCustomers(params = {}) {
      const [usersRes, ordersRes] = await Promise.all([
        supabase.from('app_users').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('order_code, user_id, total_amount, status'),
      ]);
      if (usersRes.error) {
        throw new Error(`Supabase list customers failed: ${usersRes.error.message}`);
      }
      if (ordersRes.error) {
        throw new Error(`Supabase list customer orders failed: ${ordersRes.error.message}`);
      }

      const ordersMapped = (ordersRes.data || []).map((row) =>
        mapSupabaseOrderRow(row as Record<string, unknown>)
      );
      const statsMap = buildCustomerStatsMap(ordersMapped);

      let customers = (
        await Promise.all(
          (usersRes.data || []).map((row) =>
            hydrateUserExtrasFallback(
              row as Record<string, unknown>,
              mapSupabaseUserRow(row as Record<string, unknown>)
            )
          )
        )
      ).map((u) => toAdminCustomer(u, statsMap.get(u.id)));

      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase().replace(/^@+/, '');
        customers = customers.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
            (c.username && c.username.toLowerCase().includes(q)) ||
            c.fullName.toLowerCase().includes(q) ||
            normalizePhone(c.phone).includes(normalizePhone(q))
        );
      }

      const total = customers.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { customers: customers.slice(offset, offset + limit), total };
    },

    async getCustomerByIdWithOrders(userId: string) {
      const user = await this.findUserById(userId);
      if (!user) return null;
      const orders = await this.listUserOrders(userId);
      const totalSpent = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return {
        customer: toAdminCustomer(user, { count: orders.length, totalSpent }),
        orders,
      };
    },

    async createAuditLog(entry: AuditLogInput) {
      const safeDetails = sanitizeAuditDetails(entry.details);
      const nowIso = new Date().toISOString();

      const candidatePayloads: Array<Record<string, unknown>> = [
        {
          admin_user_id: entry.adminUserId,
          admin_email: entry.adminEmail,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          details: safeDetails,
        },
        {
          actor_id: entry.adminUserId,
          actor_email: entry.adminEmail,
          action: entry.action,
          resource_type: entry.entityType,
          resource_id: entry.entityId,
          metadata: safeDetails,
        },
        {
          user_id: entry.adminUserId,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          details: { adminEmail: entry.adminEmail, ...safeDetails },
        },
        {
          admin_id: entry.adminUserId,
          action: entry.action,
          target_type: entry.entityType,
          target_id: entry.entityId,
          details: { adminEmail: entry.adminEmail, ...safeDetails },
        },
      ];

      let lastErr: { code?: string; message?: string } | null = null;
      for (const payload of candidatePayloads) {
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .insert(payload)
          .select('*')
          .single();
        if (!error && data) {
          return mapSupabaseAuditRow(data as Record<string, unknown>);
        }
        lastErr = error;
        if (!isSchemaColumnMismatch(error)) {
          break;
        }
      }

      // Never crash primary admin action if audit schema differs unexpectedly, but surface detail in logs
      console.error('[AuditLog Insert Warning]', lastErr?.message || 'unknown audit log error');
      return {
        id: crypto.randomUUID(),
        adminUserId: entry.adminUserId,
        adminEmail: entry.adminEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: safeDetails,
        createdAt: nowIso,
      };
    },

    async listAuditLogs(params = {}) {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase list audit logs failed: ${error.message}`);

      let logs = (data || []).map((row) => mapSupabaseAuditRow(row as Record<string, unknown>));
      if (params.action && params.action.trim()) {
        const act = params.action.trim().toLowerCase();
        logs = logs.filter((l) => l.action.toLowerCase().includes(act));
      }
      if (params.entityType && params.entityType.trim()) {
        const et = params.entityType.trim().toLowerCase();
        logs = logs.filter((l) => l.entityType.toLowerCase() === et);
      }

      const total = logs.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { logs: logs.slice(offset, offset + limit), total };
    },

    async getDashboardStats() {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('id, in_stock, stock_count'),
        supabase
          .from('orders')
          .select('order_code, customer_name, total_amount, status, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('app_users').select('id, role'),
      ]);

      if (productsRes.error) throw new Error(`Supabase stats products failed: ${productsRes.error.message}`);
      if (ordersRes.error) throw new Error(`Supabase stats orders failed: ${ordersRes.error.message}`);
      if (usersRes.error) throw new Error(`Supabase stats users failed: ${usersRes.error.message}`);

      const productsRows = productsRes.data || [];
      const ordersRows = ordersRes.data || [];
      const usersRows = usersRes.data || [];

      let totalRevenue = 0;
      let pendingOrders = 0;
      let preparingOrders = 0;
      let shippedOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;

      for (const row of ordersRows) {
        const status = normalizeOrderStatus(row.status);
        if (status !== 'cancelled') {
          totalRevenue += Number(row.total_amount || 0);
        }
        if (status === 'paid') pendingOrders += 1;
        if (status === 'preparing') preparingOrders += 1;
        if (status === 'shipped') shippedOrders += 1;
        if (status === 'delivered') deliveredOrders += 1;
        if (status === 'cancelled') cancelledOrders += 1;
      }

      let outOfStockProducts = 0;
      let lowStockProducts = 0;
      for (const row of productsRows) {
        const stock = Number(row.stock_count ?? 0);
        const inStock = row.in_stock === true && stock > 0;
        if (!inStock) outOfStockProducts += 1;
        else if (stock <= 3) lowStockProducts += 1;
      }

      let adminUsersCount = 0;
      for (const row of usersRows) {
        if (normalizeRole(row.role) === 'admin') adminUsersCount += 1;
      }

      return {
        totalRevenue,
        totalOrders: ordersRows.length,
        pendingOrders,
        preparingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts: productsRows.length,
        outOfStockProducts,
        lowStockProducts,
        totalCustomers: usersRows.length,
        adminUsersCount,
        recentOrders: ordersRows.slice(0, 5).map((row) => ({
          orderCode: String(row.order_code || ''),
          customerName: String(row.customer_name || ''),
          totalAmount: Number(row.total_amount || 0),
          status: normalizeOrderStatus(row.status),
          createdAt: formatPersianTimestamp(row.created_at),
        })),
      };
    },

    async listRoles() {
      try {
        const { data, error } = await supabase
          .from('auth_roles')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            name: String(r.name),
            titleFa: String(r.title_fa || r.name),
            description: r.description ? String(r.description) : undefined,
            isSystem: r.is_system !== false,
            createdAt: r.created_at ? String(r.created_at) : undefined,
          }));
        }
      } catch {
        // Fallback below
      }
      return DEFAULT_DEV_ROLES.map((r) => ({ ...r }));
    },

    async listWarranties(includeInactive = false) {
      try {
        const q = supabase.from('warranties').select('*').order('duration_months', { ascending: false });
        const { data, error } = includeInactive ? await q : await q.eq('is_active', true);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            providerName: String(r.provider_name || ''),
            durationMonths: Number(r.duration_months ?? 18),
            coverageFa: String(r.coverage_fa || ''),
            termsUrl: r.terms_url ? String(r.terms_url) : null,
            isActive: r.is_active !== false,
          }));
        }
      } catch {
        // Fallback below
      }
      return DEFAULT_DEV_WARRANTIES.filter((w) => includeInactive || w.isActive).map((w) => ({ ...w }));
    },

    async upsertWarranty(warranty: WarrantyDTO) {
      const payload: Record<string, unknown> = {
        provider_name: warranty.providerName,
        duration_months: warranty.durationMonths,
        coverage_fa: warranty.coverageFa,
        terms_url: warranty.termsUrl ?? null,
        is_active: warranty.isActive,
      };
      if (isUuid(warranty.id)) {
        payload.id = warranty.id;
      }
      const { data, error } = await supabase
        .from('warranties')
        .upsert(payload, { onConflict: isUuid(warranty.id) ? 'id' : 'provider_name' })
        .select('*')
        .single();
      if (error) {
        if (isMissingRelationError(error)) {
          return { ...warranty, id: warranty.id || crypto.randomUUID() };
        }
        throw new Error(`Supabase upsert warranty failed: ${error.message}`);
      }
      return {
        id: String(data.id),
        providerName: String(data.provider_name),
        durationMonths: Number(data.duration_months ?? 18),
        coverageFa: String(data.coverage_fa || ''),
        termsUrl: data.terms_url ? String(data.terms_url) : null,
        isActive: data.is_active !== false,
      };
    },

    async deleteWarranty(id: string) {
      const { error } = await supabase.from('warranties').delete().eq('id', id);
      if (error) {
        if (isMissingRelationError(error)) return false;
        throw new Error(`Supabase delete warranty failed: ${error.message}`);
      }
      return true;
    },

    async listAttributes(categoryId?: string) {
      try {
        const [attrRes, catAttrRes] = await Promise.all([
          supabase.from('attribute_definitions').select('*').order('sort_order', { ascending: true }),
          supabase.from('category_attributes').select('category_id, attribute_id'),
        ]);
        if (!attrRes.error && Array.isArray(attrRes.data) && attrRes.data.length > 0) {
          const catMap = new Map<string, string[]>();
          if (!catAttrRes.error && Array.isArray(catAttrRes.data)) {
            for (const row of catAttrRes.data as Array<{ category_id?: unknown; attribute_id?: unknown }>) {
              const aid = String(row.attribute_id || '');
              const cid = String(row.category_id || '');
              if (aid && cid) {
                const arr = catMap.get(aid) || [];
                arr.push(cid);
                catMap.set(aid, arr);
              }
            }
          }
          let mapped: AttributeDefinitionDTO[] = attrRes.data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            code: String(r.code),
            nameFa: String(r.name_fa || ''),
            nameEn: String(r.name_en || ''),
            dataType: (r.data_type as AttributeDefinitionDTO['dataType']) || 'text',
            unit: r.unit ? String(r.unit) : null,
            isFilterable: r.is_filterable !== false,
            sortOrder: Number(r.sort_order ?? 0),
            categoryIds: catMap.get(String(r.id)) || [],
          }));
          if (categoryId && categoryId.trim()) {
            const cleanCat = categoryId.trim().toLowerCase();
            mapped = mapped.filter(
              (a) => !a.categoryIds || a.categoryIds.length === 0 || a.categoryIds.some((c) => c.toLowerCase() === cleanCat)
            );
          }
          return mapped;
        }
      } catch {
        // Fallback below
      }
      const fallback = DEFAULT_DEV_ATTRIBUTES.map((a) => ({
        ...a,
        categoryIds: a.categoryIds ? [...a.categoryIds] : [],
      }));
      if (categoryId && categoryId.trim()) {
        const cleanCat = categoryId.trim().toLowerCase();
        return fallback.filter((a) => a.categoryIds?.some((c) => c.toLowerCase() === cleanCat));
      }
      return fallback;
    },

    async upsertAttribute(attr: AttributeDefinitionDTO) {
      const payload: Record<string, unknown> = {
        code: attr.code,
        name_fa: attr.nameFa,
        name_en: attr.nameEn,
        data_type: attr.dataType,
        unit: attr.unit ?? null,
        is_filterable: attr.isFilterable,
        sort_order: attr.sortOrder,
      };
      if (isUuid(attr.id)) {
        payload.id = attr.id;
      }
      const { data, error } = await supabase
        .from('attribute_definitions')
        .upsert(payload, { onConflict: isUuid(attr.id) ? 'id' : 'code' })
        .select('*')
        .single();
      if (error) {
        if (isMissingRelationError(error)) return { ...attr, id: attr.id || crypto.randomUUID() };
        throw new Error(`Supabase upsert attribute failed: ${error.message}`);
      }
      const savedId = String(data.id);
      if (Array.isArray(attr.categoryIds)) {
        await supabase.from('category_attributes').delete().eq('attribute_id', savedId);
        if (attr.categoryIds.length > 0) {
          await supabase.from('category_attributes').insert(
            attr.categoryIds.map((cid) => ({ category_id: cid, attribute_id: savedId, is_required: false }))
          );
        }
      }
      return {
        id: savedId,
        code: String(data.code),
        nameFa: String(data.name_fa),
        nameEn: String(data.name_en),
        dataType: (data.data_type as AttributeDefinitionDTO['dataType']) || 'text',
        unit: data.unit ? String(data.unit) : null,
        isFilterable: data.is_filterable !== false,
        sortOrder: Number(data.sort_order ?? 0),
        categoryIds: attr.categoryIds || [],
      };
    },

    async deleteAttribute(idOrCode: string) {
      const clean = idOrCode.trim();
      const q = isUuid(clean)
        ? supabase.from('attribute_definitions').delete().eq('id', clean)
        : supabase.from('attribute_definitions').delete().eq('code', clean);
      const { error } = await q;
      if (error) {
        if (isMissingRelationError(error)) return false;
        throw new Error(`Supabase delete attribute failed: ${error.message}`);
      }
      return true;
    },

    async listProductAttributes(productId: string) {
      try {
        const [valsRes, defs] = await Promise.all([
          supabase.from('product_attribute_values').select('*').eq('product_id', productId),
          this.listAttributes(),
        ]);
        if (!valsRes.error && Array.isArray(valsRes.data) && valsRes.data.length > 0) {
          const defById = new Map(defs.map((d) => [d.id, d]));
          const mapped: ProductAttributeValueDTO[] = [];
          for (const row of valsRes.data as Array<Record<string, unknown>>) {
            const def = defById.get(String(row.attribute_id || ''));
            if (!def) continue;
            const valueText = row.value_text !== null && row.value_text !== undefined ? String(row.value_text) : null;
            const valueNumber =
              row.value_number !== null && row.value_number !== undefined ? Number(row.value_number) : null;
            const valueBoolean =
              typeof row.value_boolean === 'boolean' ? row.value_boolean : null;
            mapped.push({
              id: String(row.id),
              productId,
              attributeId: def.id,
              code: def.code,
              nameFa: def.nameFa,
              nameEn: def.nameEn,
              dataType: def.dataType,
              unit: def.unit,
              valueText,
              valueNumber,
              valueBoolean,
              displayValue: formatAttributeDisplayValue(def, { valueText, valueNumber, valueBoolean }),
            });
          }
          mapped.sort((a, b) => {
            const da = defById.get(a.attributeId)?.sortOrder ?? 99;
            const db = defById.get(b.attributeId)?.sortOrder ?? 99;
            return da - db;
          });
          return mapped;
        }
      } catch {
        // Fallback to seeded attributes if table missing or empty
      }
      const seeded = DEFAULT_DEV_PRODUCT_ATTRIBUTES[productId] || [];
      if (seeded.length === 0) return [];
      const defsByCode = new Map(DEFAULT_DEV_ATTRIBUTES.map((d) => [d.code, d]));
      return seeded
        .map((entry) => {
          const def = defsByCode.get(entry.code);
          if (!def) return null;
          return {
            productId,
            attributeId: def.id,
            code: def.code,
            nameFa: def.nameFa,
            nameEn: def.nameEn,
            dataType: def.dataType,
            unit: def.unit,
            valueText: entry.valueText ?? null,
            valueNumber: entry.valueNumber ?? null,
            valueBoolean: entry.valueBoolean ?? null,
            displayValue: formatAttributeDisplayValue(def, entry),
          } as ProductAttributeValueDTO;
        })
        .filter((x): x is ProductAttributeValueDTO => Boolean(x));
    },

    async setProductAttributes(productId, values) {
      const defs = await this.listAttributes();
      const byId = new Map(defs.map((d) => [d.id, d]));
      const byCode = new Map(defs.map((d) => [d.code.toLowerCase(), d]));
      const rows: Array<Record<string, unknown>> = [];
      for (const item of values) {
        const def =
          (item.attributeId ? byId.get(item.attributeId) : undefined) ||
          (item.attributeCode ? byCode.get(item.attributeCode.trim().toLowerCase()) : undefined);
        if (!def) continue;
        rows.push({
          product_id: productId,
          attribute_id: def.id,
          value_text: item.valueText ?? null,
          value_number:
            typeof item.valueNumber === 'number' && Number.isFinite(item.valueNumber) ? item.valueNumber : null,
          value_boolean: typeof item.valueBoolean === 'boolean' ? item.valueBoolean : null,
        });
      }
      const delRes = await supabase.from('product_attribute_values').delete().eq('product_id', productId);
      if (delRes.error && !isMissingRelationError(delRes.error)) {
        throw new Error(`Supabase clear product attributes failed: ${delRes.error.message}`);
      }
      if (rows.length > 0) {
        const insRes = await supabase.from('product_attribute_values').insert(rows);
        if (insRes.error && !isMissingRelationError(insRes.error)) {
          throw new Error(`Supabase insert product attributes failed: ${insRes.error.message}`);
        }
      }
      return this.listProductAttributes(productId);
    },

    async listProductVariants(productId: string, includeUnpublished = false) {
      try {
        const q = supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('price_toman', { ascending: true });
        const { data, error } = includeUnpublished ? await q : await q.eq('is_published', true);
        if (!error && Array.isArray(data) && data.length > 0) {
          const [warranties, stockRows] = await Promise.all([
            this.listWarranties(true),
            supabase
              .from('warehouse_stock')
              .select('variant_id, quantity_on_hand, reserved_qty')
              .in(
                'variant_id',
                data.map((r: Record<string, unknown>) => String(r.id))
              ),
          ]);
          const wMap = new Map(warranties.map((w) => [w.id, w]));
          const stockMap = new Map<string, number>();
          if (!stockRows.error && Array.isArray(stockRows.data)) {
            for (const s of stockRows.data as Array<Record<string, unknown>>) {
              const vid = String(s.variant_id || '');
              const avail = Math.max(0, Number(s.quantity_on_hand ?? 0) - Number(s.reserved_qty ?? 0));
              stockMap.set(vid, (stockMap.get(vid) || 0) + avail);
            }
          }
          return data.map((row: Record<string, unknown>) => {
            const wid = row.warranty_id ? String(row.warranty_id) : null;
            const w = wid ? wMap.get(wid) : undefined;
            const id = String(row.id);
            return {
              id,
              productId: String(row.product_id),
              warrantyId: wid,
              warrantyName: w?.providerName,
              warrantyDurationMonths: w?.durationMonths,
              warrantyCoverageFa: w?.coverageFa,
              sku: String(row.sku),
              barcode: row.barcode ? String(row.barcode) : null,
              partNumber: row.part_number ? String(row.part_number) : null,
              colorNameFa: String(row.color_name_fa || ''),
              colorNameEn: row.color_name_en ? String(row.color_name_en) : null,
              colorHex: String(row.color_hex || '#1e293b'),
              storage: row.storage ? String(row.storage) : null,
              ram: row.ram ? String(row.ram) : null,
              simType: row.sim_type ? String(row.sim_type) : null,
              priceToman: Number(row.price_toman || 0),
              originalPriceToman:
                row.original_price_toman !== null && row.original_price_toman !== undefined
                  ? Number(row.original_price_toman)
                  : null,
              costPriceToman:
                row.cost_price_toman !== null && row.cost_price_toman !== undefined
                  ? Number(row.cost_price_toman)
                  : null,
              availableStock: stockMap.has(id) ? stockMap.get(id) : undefined,
              isPublished: row.is_published !== false,
              createdAt: row.created_at ? String(row.created_at) : undefined,
              updatedAt: row.updated_at ? String(row.updated_at) : undefined,
            };
          });
        }
      } catch {
        // Fallback below
      }
      return DEFAULT_DEV_VARIANTS.filter(
        (v) => v.productId === productId && (includeUnpublished || v.isPublished)
      ).map((v) => ({ ...v }));
    },

    async findVariantByIdOrSku(idOrSku: string) {
      const clean = idOrSku.trim();
      try {
        const q = isUuid(clean)
          ? supabase.from('product_variants').select('*').eq('id', clean).maybeSingle()
          : supabase.from('product_variants').select('*').ilike('sku', clean).maybeSingle();
        const { data, error } = await q;
        if (!error && data) {
          const list = await this.listProductVariants(String(data.product_id), true);
          return list.find((v) => v.id === String(data.id)) || null;
        }
      } catch {
        // Fallback below
      }
      const match = DEFAULT_DEV_VARIANTS.find(
        (v) => v.id === clean || v.sku.toLowerCase() === clean.toLowerCase()
      );
      return match ? { ...match } : null;
    },

    async upsertProductVariant(variant: ProductVariantDTO) {
      const payload: Record<string, unknown> = {
        product_id: variant.productId,
        warranty_id: isUuid(variant.warrantyId) ? variant.warrantyId : null,
        sku: variant.sku.trim().toUpperCase(),
        barcode: variant.barcode ?? null,
        part_number: variant.partNumber ?? null,
        color_name_fa: variant.colorNameFa,
        color_name_en: variant.colorNameEn ?? null,
        color_hex: variant.colorHex || '#1e293b',
        storage: variant.storage ?? null,
        ram: variant.ram ?? null,
        sim_type: variant.simType ?? null,
        price_toman: Math.round(variant.priceToman),
        original_price_toman: variant.originalPriceToman ? Math.round(variant.originalPriceToman) : null,
        cost_price_toman: variant.costPriceToman ? Math.round(variant.costPriceToman) : null,
        is_published: variant.isPublished !== false,
        updated_at: new Date().toISOString(),
      };
      if (isUuid(variant.id)) {
        payload.id = variant.id;
      }
      const { data, error } = await supabase
        .from('product_variants')
        .upsert(payload, { onConflict: isUuid(variant.id) ? 'id' : 'sku' })
        .select('*')
        .single();
      if (error) {
        if (isMissingRelationError(error)) {
          return { ...variant, id: variant.id || crypto.randomUUID() };
        }
        throw new Error(`Supabase upsert variant failed: ${error.message}`);
      }
      const list = await this.listProductVariants(String(data.product_id), true);
      return list.find((v) => v.id === String(data.id)) || { ...variant, id: String(data.id) };
    },

    async deleteProductVariant(variantId: string) {
      const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
      if (error) {
        if (isMissingRelationError(error)) return false;
        throw new Error(`Supabase delete variant failed: ${error.message}`);
      }
      return true;
    },

    async listWarehouses(includeInactive = false) {
      try {
        const q = supabase.from('warehouses').select('*').order('created_at', { ascending: true });
        const { data, error } = includeInactive ? await q : await q.eq('is_active', true);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            code: String(r.code),
            nameFa: String(r.name_fa || ''),
            city: String(r.city || 'تهران'),
            addressFa: r.address_fa ? String(r.address_fa) : null,
            isActive: r.is_active !== false,
            createdAt: r.created_at ? String(r.created_at) : undefined,
          }));
        }
      } catch {
        // Fallback below
      }
      return DEFAULT_DEV_WAREHOUSES.filter((w) => includeInactive || w.isActive).map((w) => ({ ...w }));
    },

    async upsertWarehouse(warehouse: WarehouseDTO) {
      const payload: Record<string, unknown> = {
        code: warehouse.code.trim().toUpperCase(),
        name_fa: warehouse.nameFa,
        city: warehouse.city,
        address_fa: warehouse.addressFa ?? null,
        is_active: warehouse.isActive,
      };
      if (isUuid(warehouse.id)) {
        payload.id = warehouse.id;
      }
      const { data, error } = await supabase
        .from('warehouses')
        .upsert(payload, { onConflict: isUuid(warehouse.id) ? 'id' : 'code' })
        .select('*')
        .single();
      if (error) {
        if (isMissingRelationError(error)) {
          return { ...warehouse, id: warehouse.id || crypto.randomUUID() };
        }
        throw new Error(`Supabase upsert warehouse failed: ${error.message}`);
      }
      return {
        id: String(data.id),
        code: String(data.code),
        nameFa: String(data.name_fa),
        city: String(data.city),
        addressFa: data.address_fa ? String(data.address_fa) : null,
        isActive: data.is_active !== false,
        createdAt: data.created_at ? String(data.created_at) : undefined,
      };
    },

    async listWarehouseStock(filters = {}) {
      try {
        let q = supabase.from('warehouse_stock').select('*');
        if (filters.warehouseId) q = q.eq('warehouse_id', filters.warehouseId);
        if (filters.variantId) q = q.eq('variant_id', filters.variantId);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          const [warehouses, variantsRes] = await Promise.all([
            this.listWarehouses(true),
            supabase.from('product_variants').select('id, product_id, sku'),
          ]);
          const whMap = new Map(warehouses.map((w) => [w.id, w]));
          const varMap = new Map<string, { productId: string; sku: string }>();
          if (!variantsRes.error && Array.isArray(variantsRes.data)) {
            for (const v of variantsRes.data as Array<Record<string, unknown>>) {
              varMap.set(String(v.id), { productId: String(v.product_id), sku: String(v.sku) });
            }
          }
          let mapped: WarehouseStockDTO[] = data.map((row: Record<string, unknown>) => {
            const wh = whMap.get(String(row.warehouse_id));
            const vr = varMap.get(String(row.variant_id));
            const onHand = Number(row.quantity_on_hand ?? 0);
            const reserved = Number(row.reserved_qty ?? 0);
            const available = Math.max(0, onHand - reserved);
            const minAlert = Number(row.min_stock_alert ?? 3);
            return {
              id: String(row.id),
              warehouseId: String(row.warehouse_id),
              warehouseCode: wh?.code,
              warehouseNameFa: wh?.nameFa,
              variantId: String(row.variant_id),
              productId: vr?.productId,
              sku: vr?.sku,
              shelfLocation: row.shelf_location ? String(row.shelf_location) : null,
              quantityOnHand: onHand,
              reservedQty: reserved,
              availableQty: available,
              minStockAlert: minAlert,
              isLowStock: available <= minAlert,
              updatedAt: row.updated_at ? String(row.updated_at) : undefined,
            };
          });
          if (filters.productId) {
            mapped = mapped.filter((s) => s.productId === filters.productId);
          }
          if (filters.lowStockOnly) {
            mapped = mapped.filter((s) => s.isLowStock);
          }
          return mapped;
        }
      } catch {
        // Fallback below
      }
      return [];
    },

    async recordStockMovement(input: StockMovementInput) {
      if (input.idempotencyKey && input.idempotencyKey.trim()) {
        const { data: existingMov } = await supabase
          .from('stock_movements')
          .select('*')
          .eq('idempotency_key', input.idempotencyKey.trim())
          .maybeSingle();
        if (existingMov) {
          const stocks = await this.listWarehouseStock({
            warehouseId: String(existingMov.warehouse_id),
            variantId: String(existingMov.variant_id),
          });
          const stock = stocks[0] || {
            id: '',
            warehouseId: String(existingMov.warehouse_id),
            variantId: String(existingMov.variant_id),
            quantityOnHand: Number(existingMov.balance_after ?? 0),
            reservedQty: 0,
            availableQty: Number(existingMov.balance_after ?? 0),
            minStockAlert: 3,
            isLowStock: false,
          };
          return {
            movement: {
              id: String(existingMov.id),
              warehouseId: String(existingMov.warehouse_id),
              variantId: String(existingMov.variant_id),
              movementType: existingMov.movement_type as StockMovementType,
              quantityChange: Number(existingMov.quantity_change),
              balanceAfter: Number(existingMov.balance_after),
              referenceType: existingMov.reference_type ? String(existingMov.reference_type) : null,
              referenceId: existingMov.reference_id ? String(existingMov.reference_id) : null,
              idempotencyKey: existingMov.idempotency_key ? String(existingMov.idempotency_key) : null,
              noteFa: existingMov.note_fa ? String(existingMov.note_fa) : null,
              createdBy: existingMov.created_by ? String(existingMov.created_by) : null,
              createdAt: String(existingMov.created_at),
            },
            stock,
            deduplicated: true,
          };
        }
      }

      const { data: existingStock, error: fetchErr } = await supabase
        .from('warehouse_stock')
        .select('*')
        .eq('warehouse_id', input.warehouseId)
        .eq('variant_id', input.variantId)
        .maybeSingle();
      if (fetchErr) {
        throw new Error(`Supabase stock lookup failed: ${fetchErr.message}`);
      }

      const currentOnHand = existingStock ? Number(existingStock.quantity_on_hand ?? 0) : 0;
      const reservedQty = existingStock ? Number(existingStock.reserved_qty ?? 0) : 0;
      const calc = applyStockMovementDelta(currentOnHand, reservedQty, input.quantityChange);
      if (!calc.ok) {
        throw new StockMovementError(calc.error, calc.statusCode);
      }

      const { data: savedStock, error: upsertErr } = await supabase
        .from('warehouse_stock')
        .upsert(
          {
            ...(existingStock?.id ? { id: existingStock.id } : {}),
            warehouse_id: input.warehouseId,
            variant_id: input.variantId,
            shelf_location:
              input.shelfLocation !== undefined
                ? input.shelfLocation
                : existingStock?.shelf_location ?? null,
            quantity_on_hand: calc.balanceAfter,
            reserved_qty: reservedQty,
            min_stock_alert:
              typeof input.minStockAlert === 'number'
                ? input.minStockAlert
                : Number(existingStock?.min_stock_alert ?? 3),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'warehouse_id,variant_id' }
        )
        .select('*')
        .single();
      if (upsertErr || !savedStock) {
        throw new Error(`Supabase warehouse_stock update failed: ${upsertErr?.message || 'no row'}`);
      }

      const { data: savedMov, error: movErr } = await supabase
        .from('stock_movements')
        .insert({
          warehouse_id: input.warehouseId,
          variant_id: input.variantId,
          movement_type: input.movementType,
          quantity_change: Math.trunc(input.quantityChange),
          balance_after: calc.balanceAfter,
          reference_type: input.referenceType ?? null,
          reference_id: input.referenceId ?? null,
          idempotency_key: input.idempotencyKey?.trim() || null,
          note_fa: input.noteFa ?? null,
          created_by: isUuid(input.createdBy) ? input.createdBy : null,
        })
        .select('*')
        .single();
      if (movErr || !savedMov) {
        throw new Error(`Supabase stock_movements insert failed: ${movErr?.message || 'no row'}`);
      }

      // Sync aggregate stock back to parent products.stock_count
      try {
        const variant = await this.findVariantByIdOrSku(input.variantId);
        if (variant) {
          const allStocks = await this.listWarehouseStock({ productId: variant.productId });
          const totalAvail = allStocks.reduce((acc, s) => acc + s.availableQty, 0);
          await this.updateProductInventory(variant.productId, totalAvail, totalAvail > 0);
        }
      } catch {
        // Non-fatal sync
      }

      const onHand = Number(savedStock.quantity_on_hand ?? 0);
      const resQty = Number(savedStock.reserved_qty ?? 0);
      const avail = Math.max(0, onHand - resQty);
      const minAlert = Number(savedStock.min_stock_alert ?? 3);

      return {
        movement: {
          id: String(savedMov.id),
          warehouseId: String(savedMov.warehouse_id),
          variantId: String(savedMov.variant_id),
          movementType: savedMov.movement_type as StockMovementType,
          quantityChange: Number(savedMov.quantity_change),
          balanceAfter: Number(savedMov.balance_after),
          referenceType: savedMov.reference_type ? String(savedMov.reference_type) : null,
          referenceId: savedMov.reference_id ? String(savedMov.reference_id) : null,
          idempotencyKey: savedMov.idempotency_key ? String(savedMov.idempotency_key) : null,
          noteFa: savedMov.note_fa ? String(savedMov.note_fa) : null,
          createdBy: savedMov.created_by ? String(savedMov.created_by) : null,
          createdAt: String(savedMov.created_at),
        },
        stock: {
          id: String(savedStock.id),
          warehouseId: String(savedStock.warehouse_id),
          variantId: String(savedStock.variant_id),
          shelfLocation: savedStock.shelf_location ? String(savedStock.shelf_location) : null,
          quantityOnHand: onHand,
          reservedQty: resQty,
          availableQty: avail,
          minStockAlert: minAlert,
          isLowStock: avail <= minAlert,
          updatedAt: savedStock.updated_at ? String(savedStock.updated_at) : undefined,
        },
        deduplicated: false,
      };
    },

    async listStockMovements(filters = {}) {
      try {
        let q = supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
        if (filters.warehouseId) q = q.eq('warehouse_id', filters.warehouseId);
        if (filters.variantId) q = q.eq('variant_id', filters.variantId);
        if (filters.movementType) q = q.eq('movement_type', filters.movementType);
        q = q.limit(Math.min(200, Math.max(1, Number(filters.limit || 50))));
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            warehouseId: String(r.warehouse_id),
            variantId: String(r.variant_id),
            movementType: r.movement_type as StockMovementType,
            quantityChange: Number(r.quantity_change),
            balanceAfter: Number(r.balance_after),
            referenceType: r.reference_type ? String(r.reference_type) : null,
            referenceId: r.reference_id ? String(r.reference_id) : null,
            idempotencyKey: r.idempotency_key ? String(r.idempotency_key) : null,
            noteFa: r.note_fa ? String(r.note_fa) : null,
            createdBy: r.created_by ? String(r.created_by) : null,
            createdAt: String(r.created_at),
          }));
        }
      } catch {
        // Fallback below
      }
      return [];
    },
  };
}

export function createMemoryAuthStorage(options?: {
  seedProducts?: ProductDTO[];
}): AuthStorageAdapter {
  const users = new Map<string, StoredUserRecord>();
  const otps = new Map<string, OtpChallengeRecord>();
  const orders: Array<{ userId: string | null; order: StoredOrderRecord }> = [];
  const products: ProductDTO[] = (options?.seedProducts ?? DEFAULT_DEV_PRODUCTS).map((p) => ({
    ...p,
    colors: p.colors.map((c) => ({ ...c })),
    storageOptions: p.storageOptions.map((s) => ({ ...s })),
    specs: { ...p.specs },
    images: p.images ? [...p.images] : undefined,
    customSpecs: p.customSpecs ? p.customSpecs.map((cs) => ({ ...cs })) : undefined,
  }));
  const categories: CategoryDTO[] = DEFAULT_DEV_CATEGORIES.map((c) => ({ ...c }));
  const brands: BrandDTO[] = DEFAULT_DEV_BRANDS.map((b) => ({ ...b }));
  const coupons: CouponRuleDTO[] = DEFAULT_DEV_COUPONS.map((c) => ({ ...c }));
  const settings: StoreSettingsDTO = { ...DEFAULT_DEV_SETTINGS };
  const reviewsByProduct = new Map<string, ProductReviewDTO[]>();
  const tickets: SupportTicketDTO[] = [];
  const newsletter = new Set<string>();
  const auditLogs: AdminAuditLogDTO[] = [];
  const roles: AuthRoleDTO[] = DEFAULT_DEV_ROLES.map((r) => ({ ...r }));
  const warranties: WarrantyDTO[] = DEFAULT_DEV_WARRANTIES.map((w) => ({ ...w }));
  const attributes: AttributeDefinitionDTO[] = DEFAULT_DEV_ATTRIBUTES.map((a) => ({
    ...a,
    categoryIds: a.categoryIds ? [...a.categoryIds] : [],
  }));
  const productAttributes = new Map<
    string,
    Array<{ attributeId: string; valueText?: string | null; valueNumber?: number | null; valueBoolean?: boolean | null }>
  >();
  for (const [prodId, entries] of Object.entries(DEFAULT_DEV_PRODUCT_ATTRIBUTES)) {
    const mapped = entries
      .map((entry) => {
        const def = attributes.find((a) => a.code === entry.code);
        return def
          ? {
              attributeId: def.id,
              valueText: entry.valueText ?? null,
              valueNumber: entry.valueNumber ?? null,
              valueBoolean: entry.valueBoolean ?? null,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    productAttributes.set(prodId, mapped);
  }
  const variants: ProductVariantDTO[] = DEFAULT_DEV_VARIANTS.map((v) => ({ ...v }));
  const warehouses: WarehouseDTO[] = DEFAULT_DEV_WAREHOUSES.map((w) => ({ ...w }));
  const warehouseStocks: WarehouseStockDTO[] = DEFAULT_DEV_WAREHOUSE_STOCK.map((s) => ({ ...s }));
  const stockMovements: StockMovementDTO[] = [];

  return {
    mode: 'dev-memory',

    async checkHealth() {
      return {
        ok: true,
        mode: 'dev-memory',
        detail: 'In-memory dev/test adapter (non-production only)',
      };
    },

    async findUserByEmail(email: string) {
      for (const user of users.values()) {
        if (user.email === email) {
          return {
            ...user,
            addresses: [...user.addresses],
            wishlist: [...user.wishlist],
            activeSessionIds: [...user.activeSessionIds],
          };
        }
      }
      return null;
    },

    async findUserByUsername(username: string) {
      const normalized = normalizeUsernameServer(username);
      if (!normalized) return null;
      for (const user of users.values()) {
        if (user.username && normalizeUsernameServer(user.username) === normalized) {
          return {
            ...user,
            addresses: [...user.addresses],
            wishlist: [...user.wishlist],
            activeSessionIds: [...user.activeSessionIds],
          };
        }
      }
      return null;
    },

    async findUserById(userId: string) {
      const user = users.get(userId);
      return user
        ? {
            ...user,
            addresses: [...user.addresses],
            wishlist: [...user.wishlist],
            activeSessionIds: [...user.activeSessionIds],
          }
        : null;
    },

    async createUser(params) {
      const cleanUsername = params.username ? normalizeUsernameServer(params.username) : undefined;
      if (cleanUsername) {
        for (const existing of users.values()) {
          if (existing.username && normalizeUsernameServer(existing.username) === cleanUsername) {
            throw new Error('این نام کاربری قبلاً استفاده شده است.');
          }
        }
      }
      const nowIso = new Date().toISOString();
      const record: StoredUserRecord = {
        id: crypto.randomUUID(),
        username: cleanUsername,
        email: params.email,
        fullName: params.fullName.trim(),
        phone: params.phone.trim(),
        role: params.role ? normalizeRole(params.role) : 'customer',
        newsletterOptIn: true,
        emailVerified: true,
        twoFactorEnabled: false,
        passwordHash: params.passwordHash,
        addresses: [],
        wishlist: [],
        activeSessionIds: [],
        createdAt: nowIso,
        lastLoginAt: nowIso,
      };
      users.set(record.id, record);
      return { ...record, addresses: [], wishlist: [], activeSessionIds: [] };
    },

    async updateUser(userId, updater) {
      const existing = users.get(userId);
      if (!existing) return null;
      const updated = updater({
        ...existing,
        addresses: [...existing.addresses],
        wishlist: [...existing.wishlist],
        activeSessionIds: [...existing.activeSessionIds],
      });
      const cleanUsername = updated.username ? normalizeUsernameServer(updated.username) : undefined;
      if (cleanUsername) {
        for (const other of users.values()) {
          if (other.id !== userId && other.username && normalizeUsernameServer(other.username) === cleanUsername) {
            throw new Error('این نام کاربری قبلاً استفاده شده است.');
          }
        }
      }
      updated.username = cleanUsername;
      users.set(userId, updated);
      return {
        ...updated,
        addresses: [...updated.addresses],
        wishlist: [...updated.wishlist],
        activeSessionIds: [...updated.activeSessionIds],
      };
    },

    async deleteUser(userId: string) {
      return users.delete(userId);
    },

    async getOtpChallenge(challengeKey: string) {
      const item = otps.get(challengeKey);
      return item ? { ...item } : null;
    },

    async upsertOtpChallenge(challenge: OtpChallengeRecord) {
      otps.set(challenge.challengeKey, { ...challenge });
    },

    async deleteOtpChallenge(challengeKey: string) {
      otps.delete(challengeKey);
    },

    async listUserOrders(userId: string) {
      return orders.filter((entry) => entry.userId === userId).map((entry) => ({ ...entry.order }));
    },

    async createOrder(userId: string | null, order: StoredOrderRecord) {
      const copy: StoredOrderRecord = {
        ...order,
        userId,
        createdAt: formatPersianTimestamp(order.createdAt),
        items: order.items.map((item) => ({ ...item })),
      };
      orders.unshift({ userId, order: copy });
      return copy;
    },

    async findOrderByCode(orderCode: string) {
      const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
      const match = orders.find((entry) => entry.order.orderCode.toUpperCase() === normalized);
      return match ? { ...match.order, userId: match.userId } : null;
    },

    async listAllOrders(params = {}) {
      let list = orders.map((entry) => ({ ...entry.order, userId: entry.userId }));
      if (params.status && params.status !== 'all') {
        list = list.filter((o) => o.status === params.status);
      }
      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.orderCode.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            normalizePhone(o.customerPhone).includes(normalizePhone(q))
        );
      }
      const total = list.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { orders: list.slice(offset, offset + limit), total };
    },

    async updateOrderStatus(orderCode: string, status: OrderStatus, adminNote?: string) {
      const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
      const match = orders.find((entry) => entry.order.orderCode.toUpperCase() === normalized);
      if (!match) return null;
      match.order = {
        ...match.order,
        status,
        adminNote: adminNote !== undefined ? adminNote : match.order.adminNote,
      };
      return { ...match.order, userId: match.userId };
    },

    async listProducts(query = {}) {
      return filterAndSortProducts(
        products.map((p) => ({
          ...p,
          colors: p.colors.map((c) => ({ ...c })),
          storageOptions: p.storageOptions.map((s) => ({ ...s })),
          specs: { ...p.specs },
          images: p.images ? [...p.images] : undefined,
          customSpecs: p.customSpecs ? p.customSpecs.map((cs) => ({ ...cs })) : undefined,
        })),
        { ...query, categories: query.categories ?? categories }
      );
    },

    async findProductByIdOrSlug(idOrSlug: string) {
      const clean = idOrSlug.trim();
      const found = products.find((p) => p.slug === clean || p.id === clean);
      return found
        ? {
            ...found,
            colors: found.colors.map((c) => ({ ...c })),
            storageOptions: found.storageOptions.map((s) => ({ ...s })),
            specs: { ...found.specs },
            images: found.images ? [...found.images] : undefined,
            customSpecs: found.customSpecs ? found.customSpecs.map((cs) => ({ ...cs })) : undefined,
          }
        : null;
    },

    async createProduct(product: ProductDTO) {
      const nowIso = new Date().toISOString();
      const copy: ProductDTO = {
        ...product,
        createdAt: product.createdAt || nowIso,
        updatedAt: product.updatedAt || nowIso,
        priceUpdatedAt: product.priceUpdatedAt || nowIso,
        colors: product.colors.map((c) => ({ ...c })),
        storageOptions: product.storageOptions.map((s) => ({ ...s })),
        specs: { ...product.specs },
        images: product.images ? [...product.images] : undefined,
        customSpecs: product.customSpecs ? product.customSpecs.map((cs) => ({ ...cs })) : undefined,
      };
      products.push(copy);
      return copy;
    },

    async updateProduct(id: string, patch: Partial<ProductDTO>) {
      const idx = products.findIndex((p) => p.id === id || p.slug === id);
      if (idx < 0) return null;
      const current = products[idx];
      const nowIso = new Date().toISOString();
      const priceChanged = typeof patch.price === 'number' && patch.price !== current.price;
      const next: ProductDTO = {
        ...current,
        ...patch,
        id: current.id,
        specs: patch.specs ? { ...current.specs, ...patch.specs } : current.specs,
        colors: patch.colors ?? current.colors,
        storageOptions: patch.storageOptions ?? current.storageOptions,
        images: patch.images !== undefined ? patch.images : current.images,
        customSpecs: patch.customSpecs !== undefined ? patch.customSpecs : current.customSpecs,
        priceUpdatedAt: priceChanged
          ? nowIso
          : patch.priceUpdatedAt ?? current.priceUpdatedAt,
        updatedAt: nowIso,
      };
      if (typeof patch.stockCount === 'number' && patch.inStock === undefined) {
        next.inStock = patch.stockCount > 0;
      }
      products[idx] = next;
      return { ...next };
    },

    async updateProductInventory(id: string, stockCount: number, inStock?: boolean) {
      const idx = products.findIndex((p) => p.id === id || p.slug === id);
      if (idx < 0) return null;
      const safeStock = Math.max(0, Math.floor(stockCount));
      const nextInStock = typeof inStock === 'boolean' ? inStock : safeStock > 0;
      products[idx] = {
        ...products[idx],
        stockCount: safeStock,
        inStock: nextInStock,
      };
      return { ...products[idx] };
    },

    async deleteProduct(id: string) {
      const idx = products.findIndex((p) => p.id === id || p.slug === id);
      if (idx < 0) return false;
      products.splice(idx, 1);
      return true;
    },

    async decrementProductStock(productId: string, qty: number) {
      const idx = products.findIndex((p) => p.id === productId || p.slug === productId);
      if (idx < 0) return;
      const nextStock = Math.max(0, products[idx].stockCount - Math.max(0, Math.floor(qty)));
      products[idx] = {
        ...products[idx],
        stockCount: nextStock,
        inStock: nextStock > 0,
      };
    },

    async listCategories(includeInactive = false) {
      const list = categories.map((c) => ({ ...c })).sort((a, b) => a.sortOrder - b.sortOrder);
      return includeInactive ? list : list.filter((c) => c.isActive);
    },

    async upsertCategory(category: CategoryDTO) {
      const idx = categories.findIndex((c) => c.id === category.id || c.slug === category.slug);
      const copy = { ...category };
      if (idx >= 0) {
        categories[idx] = copy;
      } else {
        categories.push(copy);
      }
      return { ...copy };
    },

    async deleteCategory(idOrSlug: string) {
      const clean = idOrSlug.trim().toLowerCase();
      const idx = categories.findIndex((c) => c.id.toLowerCase() === clean || c.slug.toLowerCase() === clean);
      if (idx < 0) return false;
      const removed = categories[idx];
      categories.splice(idx, 1);
      for (let i = 0; i < categories.length; i += 1) {
        if (categories[i].parentId === removed.id || categories[i].parentId === removed.slug) {
          categories[i] = { ...categories[i], parentId: null };
        }
      }
      return true;
    },

    async listBrands() {
      return brands.map((b) => ({ ...b }));
    },

    async upsertBrand(brand: BrandDTO) {
      const idx = brands.findIndex(
        (b) => b.id.toLowerCase() === brand.id.toLowerCase() || b.name.toLowerCase() === brand.name.toLowerCase()
      );
      const copy = { ...brand };
      if (idx >= 0) {
        brands[idx] = copy;
      } else {
        brands.push(copy);
      }
      return { ...copy };
    },

    async deleteBrand(idOrName: string) {
      const clean = idOrName.trim().toLowerCase();
      const idx = brands.findIndex(
        (b) => b.id.toLowerCase() === clean || b.name.toLowerCase() === clean
      );
      if (idx < 0) return false;
      brands.splice(idx, 1);
      return true;
    },

    async listActiveCoupons() {
      return coupons.filter((c) => c.isActive !== false).map((c) => ({ ...c }));
    },

    async getStoreSettings() {
      return { ...settings };
    },

    async listProductReviews(productId: string) {
      const saved = reviewsByProduct.get(productId) || [];
      return [
        ...saved,
        ...DEFAULT_DEV_REVIEWS.map((r) => ({ ...r, productId })),
      ];
    },

    async createProductReview(review: ProductReviewDTO) {
      const existing = reviewsByProduct.get(review.productId) || [];
      const created = { ...review, id: review.id || crypto.randomUUID() };
      reviewsByProduct.set(review.productId, [created, ...existing]);
      return created;
    },

    async createSupportTicket(ticket: SupportTicketDTO) {
      const created = { ...ticket, id: crypto.randomUUID() };
      tickets.unshift(created);
      return created;
    },

    async subscribeNewsletter(contact: string) {
      const alreadySubscribed = newsletter.has(contact);
      newsletter.add(contact);
      return { alreadySubscribed };
    },

    async listCustomers(params = {}) {
      const statsMap = buildCustomerStatsMap(orders.map((o) => ({ ...o.order, userId: o.userId })));
      let list = [...users.values()].map((u) => toAdminCustomer(u, statsMap.get(u.id)));
      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase().replace(/^@+/, '');
        list = list.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
            (c.username && c.username.toLowerCase().includes(q)) ||
            c.fullName.toLowerCase().includes(q) ||
            normalizePhone(c.phone).includes(normalizePhone(q))
        );
      }
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const total = list.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { customers: list.slice(offset, offset + limit), total };
    },

    async getCustomerByIdWithOrders(userId: string) {
      const user = users.get(userId);
      if (!user) return null;
      const userOrders = orders
        .filter((o) => o.userId === userId)
        .map((o) => ({ ...o.order, userId: o.userId }));
      const totalSpent = userOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return {
        customer: toAdminCustomer(user, { count: userOrders.length, totalSpent }),
        orders: userOrders,
      };
    },

    async createAuditLog(entry: AuditLogInput) {
      const log: AdminAuditLogDTO = {
        id: crypto.randomUUID(),
        adminUserId: entry.adminUserId,
        adminEmail: entry.adminEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: sanitizeAuditDetails(entry.details),
        createdAt: new Date().toISOString(),
      };
      auditLogs.unshift(log);
      return log;
    },

    async listAuditLogs(params = {}) {
      let logs = [...auditLogs];
      if (params.action && params.action.trim()) {
        const act = params.action.trim().toLowerCase();
        logs = logs.filter((l) => l.action.toLowerCase().includes(act));
      }
      if (params.entityType && params.entityType.trim()) {
        const et = params.entityType.trim().toLowerCase();
        logs = logs.filter((l) => l.entityType.toLowerCase() === et);
      }
      const total = logs.length;
      const offset = Math.max(0, Number(params.offset || 0));
      const limit = Math.min(200, Math.max(1, Number(params.limit || 50)));
      return { logs: logs.slice(offset, offset + limit), total };
    },

    async getDashboardStats() {
      let totalRevenue = 0;
      let pendingOrders = 0;
      let preparingOrders = 0;
      let shippedOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;

      for (const entry of orders) {
        const s = entry.order.status;
        if (s !== 'cancelled') totalRevenue += entry.order.totalAmount;
        if (s === 'paid') pendingOrders += 1;
        if (s === 'preparing') preparingOrders += 1;
        if (s === 'shipped') shippedOrders += 1;
        if (s === 'delivered') deliveredOrders += 1;
        if (s === 'cancelled') cancelledOrders += 1;
      }

      let outOfStockProducts = 0;
      let lowStockProducts = 0;
      for (const p of products) {
        if (!p.inStock || p.stockCount <= 0) outOfStockProducts += 1;
        else if (p.stockCount <= 3) lowStockProducts += 1;
      }

      let adminUsersCount = 0;
      for (const u of users.values()) {
        if (normalizeRole(u.role) === 'admin') adminUsersCount += 1;
      }

      return {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        preparingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts: products.length,
        outOfStockProducts,
        lowStockProducts,
        totalCustomers: users.size,
        adminUsersCount,
        recentOrders: orders.slice(0, 5).map((entry) => ({
          orderCode: entry.order.orderCode,
          customerName: entry.order.customerName,
          totalAmount: entry.order.totalAmount,
          status: entry.order.status,
          createdAt: entry.order.createdAt,
        })),
      };
    },

    async listRoles() {
      return roles.map((r) => ({ ...r }));
    },

    async listWarranties(includeInactive = false) {
      return warranties.filter((w) => includeInactive || w.isActive).map((w) => ({ ...w }));
    },

    async upsertWarranty(warranty: WarrantyDTO) {
      const id = warranty.id || crypto.randomUUID();
      const idx = warranties.findIndex(
        (w) => w.id === id || w.providerName.toLowerCase() === warranty.providerName.toLowerCase()
      );
      const copy: WarrantyDTO = { ...warranty, id };
      if (idx >= 0) {
        warranties[idx] = { ...copy, id: warranties[idx].id };
        return { ...warranties[idx] };
      }
      warranties.push(copy);
      return { ...copy };
    },

    async deleteWarranty(id: string) {
      const idx = warranties.findIndex((w) => w.id === id);
      if (idx < 0) return false;
      warranties.splice(idx, 1);
      return true;
    },

    async listAttributes(categoryId?: string) {
      const sorted = attributes
        .map((a) => ({ ...a, categoryIds: a.categoryIds ? [...a.categoryIds] : [] }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (categoryId && categoryId.trim()) {
        const clean = categoryId.trim().toLowerCase();
        return sorted.filter(
          (a) => !a.categoryIds || a.categoryIds.length === 0 || a.categoryIds.some((c) => c.toLowerCase() === clean)
        );
      }
      return sorted;
    },

    async upsertAttribute(attr: AttributeDefinitionDTO) {
      const id = attr.id || crypto.randomUUID();
      const idx = attributes.findIndex(
        (a) => a.id === id || a.code.toLowerCase() === attr.code.toLowerCase()
      );
      const copy: AttributeDefinitionDTO = {
        ...attr,
        id,
        categoryIds: attr.categoryIds ? [...attr.categoryIds] : [],
      };
      if (idx >= 0) {
        attributes[idx] = { ...copy, id: attributes[idx].id };
        return { ...attributes[idx] };
      }
      attributes.push(copy);
      return { ...copy };
    },

    async deleteAttribute(idOrCode: string) {
      const clean = idOrCode.trim().toLowerCase();
      const idx = attributes.findIndex(
        (a) => a.id.toLowerCase() === clean || a.code.toLowerCase() === clean
      );
      if (idx < 0) return false;
      const removed = attributes[idx];
      attributes.splice(idx, 1);
      for (const [pid, list] of productAttributes.entries()) {
        productAttributes.set(
          pid,
          list.filter((item) => item.attributeId !== removed.id)
        );
      }
      return true;
    },

    async listProductAttributes(productId: string) {
      const entries = productAttributes.get(productId) || [];
      const defMap = new Map(attributes.map((a) => [a.id, a]));
      const out: ProductAttributeValueDTO[] = [];
      for (const entry of entries) {
        const def = defMap.get(entry.attributeId);
        if (!def) continue;
        out.push({
          productId,
          attributeId: def.id,
          code: def.code,
          nameFa: def.nameFa,
          nameEn: def.nameEn,
          dataType: def.dataType,
          unit: def.unit,
          valueText: entry.valueText ?? null,
          valueNumber: entry.valueNumber ?? null,
          valueBoolean: entry.valueBoolean ?? null,
          displayValue: formatAttributeDisplayValue(def, entry),
        });
      }
      out.sort((a, b) => {
        const da = defMap.get(a.attributeId)?.sortOrder ?? 99;
        const db = defMap.get(b.attributeId)?.sortOrder ?? 99;
        return da - db;
      });
      return out;
    },

    async setProductAttributes(productId, values) {
      const next: Array<{
        attributeId: string;
        valueText?: string | null;
        valueNumber?: number | null;
        valueBoolean?: boolean | null;
      }> = [];
      for (const item of values) {
        const def =
          (item.attributeId ? attributes.find((a) => a.id === item.attributeId) : undefined) ||
          (item.attributeCode
            ? attributes.find((a) => a.code.toLowerCase() === item.attributeCode!.trim().toLowerCase())
            : undefined);
        if (!def) continue;
        next.push({
          attributeId: def.id,
          valueText: item.valueText ?? null,
          valueNumber:
            typeof item.valueNumber === 'number' && Number.isFinite(item.valueNumber) ? item.valueNumber : null,
          valueBoolean: typeof item.valueBoolean === 'boolean' ? item.valueBoolean : null,
        });
      }
      productAttributes.set(productId, next);
      return this.listProductAttributes(productId);
    },

    async listProductVariants(productId: string, includeUnpublished = false) {
      return variants
        .filter((v) => v.productId === productId && (includeUnpublished || v.isPublished))
        .map((v) => {
          const w = v.warrantyId ? warranties.find((item) => item.id === v.warrantyId) : undefined;
          const matchingStocks = warehouseStocks.filter((s) => s.variantId === v.id);
          const availableStock =
            matchingStocks.length > 0
              ? matchingStocks.reduce((acc, s) => acc + s.availableQty, 0)
              : v.availableStock;
          return {
            ...v,
            warrantyName: w?.providerName ?? v.warrantyName,
            warrantyDurationMonths: w?.durationMonths ?? v.warrantyDurationMonths,
            warrantyCoverageFa: w?.coverageFa ?? v.warrantyCoverageFa,
            availableStock,
          };
        })
        .sort((a, b) => a.priceToman - b.priceToman);
    },

    async findVariantByIdOrSku(idOrSku: string) {
      const clean = idOrSku.trim().toLowerCase();
      const match = variants.find((v) => v.id.toLowerCase() === clean || v.sku.toLowerCase() === clean);
      if (!match) return null;
      const list = await this.listProductVariants(match.productId, true);
      return list.find((v) => v.id === match.id) || null;
    },

    async upsertProductVariant(variant: ProductVariantDTO) {
      const id = variant.id || crypto.randomUUID();
      const skuUpper = variant.sku.trim().toUpperCase();
      const idx = variants.findIndex((v) => v.id === id || v.sku.toUpperCase() === skuUpper);
      const w = variant.warrantyId ? warranties.find((item) => item.id === variant.warrantyId) : undefined;
      const copy: ProductVariantDTO = {
        ...variant,
        id: idx >= 0 ? variants[idx].id : id,
        sku: skuUpper,
        warrantyName: w?.providerName ?? variant.warrantyName,
        warrantyDurationMonths: w?.durationMonths ?? variant.warrantyDurationMonths,
        warrantyCoverageFa: w?.coverageFa ?? variant.warrantyCoverageFa,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        variants[idx] = copy;
      } else {
        copy.createdAt = new Date().toISOString();
        variants.push(copy);
      }
      return (await this.findVariantByIdOrSku(copy.id)) || { ...copy };
    },

    async deleteProductVariant(variantId: string) {
      const idx = variants.findIndex((v) => v.id === variantId);
      if (idx < 0) return false;
      variants.splice(idx, 1);
      for (let i = warehouseStocks.length - 1; i >= 0; i -= 1) {
        if (warehouseStocks[i].variantId === variantId) {
          warehouseStocks.splice(i, 1);
        }
      }
      return true;
    },

    async listWarehouses(includeInactive = false) {
      return warehouses.filter((w) => includeInactive || w.isActive).map((w) => ({ ...w }));
    },

    async upsertWarehouse(warehouse: WarehouseDTO) {
      const id = warehouse.id || crypto.randomUUID();
      const codeUpper = warehouse.code.trim().toUpperCase();
      const idx = warehouses.findIndex((w) => w.id === id || w.code.toUpperCase() === codeUpper);
      const copy: WarehouseDTO = {
        ...warehouse,
        id: idx >= 0 ? warehouses[idx].id : id,
        code: codeUpper,
      };
      if (idx >= 0) {
        warehouses[idx] = copy;
      } else {
        copy.createdAt = new Date().toISOString();
        warehouses.push(copy);
      }
      return { ...copy };
    },

    async listWarehouseStock(filters = {}) {
      let list = warehouseStocks.map((s) => {
        const wh = warehouses.find((w) => w.id === s.warehouseId);
        const vr = variants.find((v) => v.id === s.variantId);
        const availableQty = Math.max(0, s.quantityOnHand - s.reservedQty);
        return {
          ...s,
          warehouseCode: wh?.code ?? s.warehouseCode,
          warehouseNameFa: wh?.nameFa ?? s.warehouseNameFa,
          productId: vr?.productId ?? s.productId,
          sku: vr?.sku ?? s.sku,
          availableQty,
          isLowStock: availableQty <= s.minStockAlert,
        };
      });
      if (filters.warehouseId) list = list.filter((s) => s.warehouseId === filters.warehouseId);
      if (filters.variantId) list = list.filter((s) => s.variantId === filters.variantId);
      if (filters.productId) list = list.filter((s) => s.productId === filters.productId);
      if (filters.lowStockOnly) list = list.filter((s) => s.isLowStock);
      return list;
    },

    async recordStockMovement(input: StockMovementInput) {
      const idempKey = input.idempotencyKey?.trim() || null;
      if (idempKey) {
        const existingMov = stockMovements.find((m) => m.idempotencyKey === idempKey);
        if (existingMov) {
          const matchingStock = (
            await this.listWarehouseStock({
              warehouseId: existingMov.warehouseId,
              variantId: existingMov.variantId,
            })
          )[0];
          return {
            movement: { ...existingMov },
            stock: matchingStock || {
              id: '',
              warehouseId: existingMov.warehouseId,
              variantId: existingMov.variantId,
              quantityOnHand: existingMov.balanceAfter,
              reservedQty: 0,
              availableQty: existingMov.balanceAfter,
              minStockAlert: 3,
              isLowStock: false,
            },
            deduplicated: true,
          };
        }
      }

      const wh = warehouses.find((w) => w.id === input.warehouseId || w.code === input.warehouseId);
      if (!wh) {
        throw new StockMovementError('انبار مورد نظر یافت نشد.', 404);
      }
      const vr = variants.find((v) => v.id === input.variantId || v.sku === input.variantId);
      if (!vr) {
        throw new StockMovementError('تنوع کالا (SKU) مورد نظر یافت نشد.', 404);
      }

      const idx = warehouseStocks.findIndex(
        (s) => s.warehouseId === wh.id && s.variantId === vr.id
      );
      const currentOnHand = idx >= 0 ? warehouseStocks[idx].quantityOnHand : 0;
      const reservedQty = idx >= 0 ? warehouseStocks[idx].reservedQty : 0;

      const calc = applyStockMovementDelta(currentOnHand, reservedQty, input.quantityChange);
      if (!calc.ok) {
        throw new StockMovementError(calc.error, calc.statusCode);
      }

      const minAlert =
        typeof input.minStockAlert === 'number'
          ? Math.max(0, Math.floor(input.minStockAlert))
          : idx >= 0
          ? warehouseStocks[idx].minStockAlert
          : 3;
      const availableQty = Math.max(0, calc.balanceAfter - reservedQty);
      const nowIso = new Date().toISOString();

      const updatedStock: WarehouseStockDTO = {
        id: idx >= 0 ? warehouseStocks[idx].id : crypto.randomUUID(),
        warehouseId: wh.id,
        warehouseCode: wh.code,
        warehouseNameFa: wh.nameFa,
        variantId: vr.id,
        productId: vr.productId,
        sku: vr.sku,
        shelfLocation:
          input.shelfLocation !== undefined
            ? input.shelfLocation
            : idx >= 0
            ? warehouseStocks[idx].shelfLocation ?? null
            : null,
        quantityOnHand: calc.balanceAfter,
        reservedQty,
        availableQty,
        minStockAlert: minAlert,
        isLowStock: availableQty <= minAlert,
        updatedAt: nowIso,
      };
      if (idx >= 0) {
        warehouseStocks[idx] = updatedStock;
      } else {
        warehouseStocks.push(updatedStock);
      }

      const movement: StockMovementDTO = {
        id: crypto.randomUUID(),
        warehouseId: wh.id,
        variantId: vr.id,
        movementType: input.movementType,
        quantityChange: Math.trunc(input.quantityChange),
        balanceAfter: calc.balanceAfter,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        idempotencyKey: idempKey,
        noteFa: input.noteFa ?? null,
        createdBy: input.createdBy ?? null,
        createdAt: nowIso,
      };
      stockMovements.unshift(movement);

      // Sync parent product stock_count across all variants/warehouses
      const prodVariants = variants.filter((v) => v.productId === vr.productId);
      const prodVarIds = new Set(prodVariants.map((v) => v.id));
      const totalProdAvail = warehouseStocks
        .filter((s) => prodVarIds.has(s.variantId))
        .reduce((acc, s) => acc + Math.max(0, s.quantityOnHand - s.reservedQty), 0);
      await this.updateProductInventory(vr.productId, totalProdAvail, totalProdAvail > 0);

      return {
        movement: { ...movement },
        stock: { ...updatedStock },
        deduplicated: false,
      };
    },

    async listStockMovements(filters = {}) {
      let list = [...stockMovements];
      if (filters.warehouseId) list = list.filter((m) => m.warehouseId === filters.warehouseId);
      if (filters.variantId) list = list.filter((m) => m.variantId === filters.variantId);
      if (filters.movementType) list = list.filter((m) => m.movementType === filters.movementType);
      const limit = Math.min(200, Math.max(1, Number(filters.limit || 50)));
      return list.slice(0, limit).map((m) => ({ ...m }));
    },
  };
}

export function createDefaultAuthStorage(env: NodeJS.ProcessEnv = process.env): AuthStorageAdapter {
  const supaCfg = resolveSupabaseAdminConfig(env);
  if (supaCfg.configured && supaCfg.url && supaCfg.serviceRoleKey) {
    const client = createClient(supaCfg.url, supaCfg.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return createSupabaseAuthStorage(client);
  }
  return createMemoryAuthStorage();
}

export class AuthService {
  private readonly storage: AuthStorageAdapter;
  private readonly sessionSecret: string;

  constructor(storage: AuthStorageAdapter, sessionSecret?: string) {
    this.storage = storage;
    this.sessionSecret = sessionSecret || resolveSessionSecret();
  }

  get storageMode() {
    return this.storage.mode;
  }

  checkHealth() {
    return this.storage.checkHealth();
  }

  findUserByEmail(email: string) {
    return this.storage.findUserByEmail(email);
  }

  findUserByUsername(username: string) {
    return this.storage.findUserByUsername(username);
  }

  findUserById(userId: string) {
    return this.storage.findUserById(userId);
  }

  createUserAccount(params: {
    email: string;
    username?: string;
    fullName: string;
    phone: string;
    passwordHash?: string;
    role?: UserRole;
  }) {
    return this.storage.createUser({ ...params, role: 'customer' });
  }

  updateUserRecord(userId: string, updater: (user: StoredUserRecord) => StoredUserRecord) {
    return this.storage.updateUser(userId, updater);
  }

  deleteUserAccount(userId: string) {
    return this.storage.deleteUser(userId);
  }

  listUserOrders(userId: string) {
    return this.storage.listUserOrders(userId);
  }

  createOrder(userId: string | null, order: StoredOrderRecord) {
    return this.storage.createOrder(userId, order);
  }

  findOrderByCode(orderCode: string) {
    return this.storage.findOrderByCode(orderCode);
  }

  async createOtpChallenge(params: {
    email: string;
    purpose: OtpPurpose;
    pendingUserId?: string;
    pendingSignup?: {
      fullName: string;
      username?: string;
      phone: string;
      passwordHash?: string;
    };
  }): Promise<
    | { ok: true; code: string; challengeId: string; cooldownSeconds: number }
    | { ok: false; retryAfterSeconds: number }
  > {
    const key = otpKey(params.email, params.purpose);
    const existing = await this.storage.getOtpChallenge(key);
    const now = Date.now();

    if (existing && existing.resendAvailableAt > now) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resendAvailableAt - now) / 1000)),
      };
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const challengeId = crypto.randomUUID();

    await this.storage.upsertOtpChallenge({
      challengeKey: key,
      id: challengeId,
      email: params.email,
      purpose: params.purpose,
      codeHash: hashOtpCode(code, params.email, this.sessionSecret),
      expiresAt: now + 10 * 60 * 1000,
      resendAvailableAt: now + 60 * 1000,
      attempts: 0,
      pendingUserId: params.pendingUserId,
      pendingSignup: params.pendingSignup,
    });

    return { ok: true, code, challengeId, cooldownSeconds: 60 };
  }

  async clearOtpChallenge(email: string, purpose: OtpPurpose): Promise<void> {
    await this.storage.deleteOtpChallenge(otpKey(email, purpose));
  }

  async verifyOtpChallenge(
    email: string,
    purpose: OtpPurpose,
    code: string
  ): Promise<
    | { ok: true; challenge: OtpChallengeRecord }
    | { ok: false; messageFa: string }
  > {
    const key = otpKey(email, purpose);
    const challenge = await this.storage.getOtpChallenge(key);

    if (!challenge) {
      return {
        ok: false,
        messageFa: 'کد تاییدی برای این ایمیل صادر نشده یا منقضی شده است. لطفاً دوباره درخواست کد دهید.',
      };
    }

    if (Date.now() > challenge.expiresAt) {
      await this.storage.deleteOtpChallenge(key);
      return {
        ok: false,
        messageFa: 'مدت اعتبار کد تایید (۱۰ دقیقه) به پایان رسیده است. لطفاً کد جدید دریافت کنید.',
      };
    }

    if (challenge.attempts >= 5) {
      await this.storage.deleteOtpChallenge(key);
      return {
        ok: false,
        messageFa: 'تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً کد جدید دریافت کنید.',
      };
    }

    const candidateHash = hashOtpCode(code, email, this.sessionSecret);
    const a = Buffer.from(candidateHash, 'hex');
    const b = Buffer.from(challenge.codeHash, 'hex');

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      const nextAttempts = challenge.attempts + 1;
      await this.storage.upsertOtpChallenge({
        ...challenge,
        attempts: nextAttempts,
      });
      return {
        ok: false,
        messageFa: `کد تایید نادرست است (${5 - nextAttempts} تلاش باقی‌مانده).`,
      };
    }

    await this.storage.deleteOtpChallenge(key);
    return { ok: true, challenge };
  }

  async issueSessionToken(userId: string): Promise<{ token: string; sessionId: string } | null> {
    const sessionId = crypto.randomUUID();
    const issuedAt = Date.now();
    const updated = await this.storage.updateUser(userId, (user) => ({
      ...user,
      lastLoginAt: new Date().toISOString(),
      activeSessionIds: [...user.activeSessionIds.slice(-9), sessionId],
    }));
    if (!updated) return null;

    const payload = `${sessionId}.${userId}.${issuedAt}`;
    const signature = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(payload)
      .digest('hex');

    return {
      token: `${payload}.${signature}`,
      sessionId,
    };
  }

  async verifySessionToken(
    token: string | undefined
  ): Promise<{ user: StoredUserRecord; sessionId: string } | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 4) return null;

    const [sessionId, userId, issuedAtStr, signature] = parts;
    if (!sessionId || !userId || !issuedAtStr || !signature) return null;

    const issuedAt = Number(issuedAtStr);
    if (!Number.isFinite(issuedAt)) return null;

    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - issuedAt > maxAgeMs) return null;

    const payload = `${sessionId}.${userId}.${issuedAtStr}`;
    const expectedSig = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const user = await this.storage.findUserById(userId);
    if (!user || !user.activeSessionIds.includes(sessionId)) {
      return null;
    }
    return { user, sessionId };
  }

  async revokeSession(userId: string, sessionId: string, allDevices = false): Promise<void> {
    await this.storage.updateUser(userId, (user) => ({
      ...user,
      activeSessionIds: allDevices
        ? []
        : user.activeSessionIds.filter((id) => id !== sessionId),
    }));
  }

  issueTwoFactorToken(userId: string, email: string): string {
    const payloadObj = {
      nonce: crypto.randomUUID(),
      userId,
      email,
      issuedAt: Date.now(),
    };
    const encoded = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(`2fa.${encoded}`)
      .digest('hex');
    return `${encoded}.${signature}`;
  }

  verifyTwoFactorToken(
    token: string | undefined
  ): { userId: string; email: string } | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    if (!encoded || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(`2fa.${encoded}`)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    try {
      const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
        userId?: string;
        email?: string;
        issuedAt?: number;
      };
      if (!parsed.userId || !parsed.email || typeof parsed.issuedAt !== 'number') {
        return null;
      }
      const maxAgeMs = 10 * 60 * 1000;
      if (Date.now() - parsed.issuedAt > maxAgeMs) {
        return null;
      }
      return { userId: parsed.userId, email: parsed.email };
    } catch {
      return null;
    }
  }
}
