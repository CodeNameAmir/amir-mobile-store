import crypto from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { resolveSessionSecret, resolveSupabaseAdminConfig } from './config.ts';
import {
  DEFAULT_DEV_COUPONS,
  DEFAULT_DEV_PRODUCTS,
  DEFAULT_DEV_REVIEWS,
  DEFAULT_DEV_SETTINGS,
  filterAndSortProducts,
  normalizeOrderStatus,
  normalizePhone,
  normalizeRole,
  sanitizeAuditDetails,
  type AdminAuditLogDTO,
  type AdminCustomerDTO,
  type AdminStatsDTO,
  type CouponRuleDTO,
  type OrderStatus,
  type ProductCategory,
  type ProductColorDTO,
  type ProductDTO,
  type ProductQueryParams,
  type ProductReviewDTO,
  type ProductSpecsDTO,
  type StorageVariantDTO,
  type StoreSettingsDTO,
  type SupportTicketDTO,
  type UserRole,
} from './storeData.ts';

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
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
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
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
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
  findUserById(userId: string): Promise<StoredUserRecord | null>;
  createUser(params: {
    email: string;
    fullName: string;
    phone: string;
    passwordHash?: string;
    role?: UserRole;
  }): Promise<StoredUserRecord>;
  updateUser(
    userId: string,
    updater: (user: StoredUserRecord) => StoredUserRecord
  ): Promise<StoredUserRecord | null>;
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
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: normalizeRole(user.role),
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

function mapSupabaseOrderRow(row: Record<string, unknown>): StoredOrderRecord {
  const status = normalizeOrderStatus(row.status);
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
    items: Array.isArray(row.items) ? (row.items as StoredOrderItem[]) : [],
    createdAt: formatPersianTimestamp(row.created_at),
  };
}

function mapSupabaseUserRow(row: Record<string, unknown>): StoredUserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name || ''),
    phone: String(row.phone || ''),
    role: normalizeRole(row.role),
    nationalId: row.national_id ? String(row.national_id) : undefined,
    birthDate: row.birth_date ? String(row.birth_date) : undefined,
    newsletterOptIn: row.newsletter_opt_in !== false,
    emailVerified: row.email_verified !== false,
    twoFactorEnabled: row.two_factor_enabled === true,
    passwordHash: row.password_hash ? String(row.password_hash) : undefined,
    addresses: Array.isArray(row.addresses) ? (row.addresses as StoredAddress[]) : [],
    wishlist: Array.isArray(row.wishlist)
      ? Array.from(new Set(row.wishlist.map((item) => String(item).trim()).filter(Boolean)))
      : [],
    activeSessionIds: Array.isArray(row.active_session_ids)
      ? (row.active_session_ids as string[])
      : [],
    createdAt: String(row.created_at || new Date().toISOString()),
    lastLoginAt: String(row.last_login_at || new Date().toISOString()),
  };
}

function mapSupabaseOtpRow(row: Record<string, unknown>): OtpChallengeRecord {
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
      row.pending_signup && typeof row.pending_signup === 'object'
        ? (row.pending_signup as OtpChallengeRecord['pendingSignup'])
        : undefined,
  };
}

function mapSupabaseProductRow(row: Record<string, unknown>): ProductDTO {
  const rawSpecs = (row.specs && typeof row.specs === 'object' ? row.specs : {}) as Partial<ProductSpecsDTO>;
  const rawColors = Array.isArray(row.colors) ? (row.colors as ProductColorDTO[]) : [];
  const rawStorage = Array.isArray(row.storage_options)
    ? (row.storage_options as StorageVariantDTO[])
    : [];

  return {
    id: String(row.id || row.slug),
    slug: String(row.slug || row.id),
    nameFa: String(row.name_fa || ''),
    nameEn: String(row.name_en || ''),
    brand: String(row.brand || 'Apple'),
    category: (String(row.category || 'phones') as ProductCategory),
    price: Number(row.price || 0),
    originalPrice:
      row.original_price !== null && row.original_price !== undefined
        ? Number(row.original_price)
        : undefined,
    discountPercent:
      row.discount_percent !== null && row.discount_percent !== undefined
        ? Number(row.discount_percent)
        : undefined,
    inStock: typeof row.in_stock === 'boolean' ? row.in_stock : Number(row.stock_count ?? 0) > 0,
    stockCount: Number(row.stock_count ?? 0),
    expressDelivery: row.express_delivery !== false,
    warranty: String(row.warranty || '۱۸ ماهه امیر سرویس + کد رجیستری همتا'),
    badgeText:
      typeof row.badge_text === 'string' && row.badge_text.trim() ? row.badge_text : undefined,
    rating: Number(row.rating ?? 4.8),
    reviewCount: Number(row.review_count ?? 0),
    recommendPercent: Number(row.recommend_percent ?? 95),
    image: typeof row.image_url === 'string' && row.image_url.trim() ? row.image_url.trim() : '',
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
    isFeaturedDeal: row.is_featured_deal === true,
    isPopular: row.is_popular === true,
    salesRank: Number(row.sales_rank ?? 100),
    releaseOrder: Number(row.release_order ?? 100),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function toSupabaseProductRow(p: ProductDTO): Record<string, unknown> {
  return {
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
    image_url: p.image || null,
    color_label: p.colorLabel,
    colors: p.colors,
    storage_options: p.storageOptions,
    specs: p.specs,
    is_featured_deal: Boolean(p.isFeaturedDeal),
    is_popular: Boolean(p.isPopular),
    sales_rank: p.salesRank,
    release_order: p.releaseOrder,
    updated_at: new Date().toISOString(),
  };
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

export function createSupabaseAuthStorage(supabase: SupabaseClient): AuthStorageAdapter {
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
      return data ? mapSupabaseUserRow(data as Record<string, unknown>) : null;
    },

    async findUserById(userId: string) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error(`Supabase user lookup failed: ${error.message}`);
      return data ? mapSupabaseUserRow(data as Record<string, unknown>) : null;
    },

    async createUser(params) {
      const nowIso = new Date().toISOString();
      const row = {
        id: crypto.randomUUID(),
        email: params.email,
        full_name: params.fullName.trim(),
        phone: params.phone.trim(),
        role: 'customer',
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
      const { data, error } = await supabase.from('app_users').insert(row).select('*').single();
      if (error || !data) {
        throw new Error(`Supabase create user failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseUserRow(data as Record<string, unknown>);
    },

    async updateUser(userId, updater) {
      const current = await this.findUserById(userId);
      if (!current) return null;
      const next = updater(current);

      const { data, error } = await supabase
        .from('app_users')
        .update({
          email: next.email,
          full_name: next.fullName,
          phone: next.phone,
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
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(`Supabase update user failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseUserRow(data as Record<string, unknown>);
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
      const row = toSupabaseProductRow(product);
      const { data, error } = await supabase.from('products').insert(row).select('*').single();
      if (error || !data) {
        throw new Error(`Supabase create product failed: ${error?.message || 'no row returned'}`);
      }
      return mapSupabaseProductRow(data as Record<string, unknown>);
    },

    async updateProduct(id: string, patch: Partial<ProductDTO>) {
      const current = await this.findProductByIdOrSlug(id);
      if (!current) return null;
      const merged: ProductDTO = {
        ...current,
        ...patch,
        id: current.id,
        specs: patch.specs ? { ...current.specs, ...patch.specs } : current.specs,
        colors: patch.colors ?? current.colors,
        storageOptions: patch.storageOptions ?? current.storageOptions,
      };
      if (typeof patch.stockCount === 'number' && patch.inStock === undefined) {
        merged.inStock = patch.stockCount > 0;
      }
      const row = toSupabaseProductRow(merged);
      const { data, error } = await supabase
        .from('products')
        .update(row)
        .eq('id', current.id)
        .select('*')
        .single();
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
        dateLabel: formatPersianTimestamp(row.created_at),
        rating: Number(row.rating || 5),
        comment: String(row.comment || ''),
        verified: Boolean(row.verified),
        isApproved: row.is_approved !== false,
        createdAt: String(row.created_at || new Date().toISOString()),
      }));
    },

    async createProductReview(review: ProductReviewDTO) {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: review.productId,
          author: review.author,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified,
          is_approved: review.isApproved,
        })
        .select('*')
        .single();
      if (error || !data) {
        throw new Error(`Supabase create review failed: ${error?.message || 'no row returned'}`);
      }
      return {
        id: String(data.id),
        productId: String(data.product_id),
        author: String(data.author),
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

      let customers = (usersRes.data || [])
        .map((row) => mapSupabaseUserRow(row as Record<string, unknown>))
        .map((u) => toAdminCustomer(u, statsMap.get(u.id)));

      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        customers = customers.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
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
  }));
  const coupons: CouponRuleDTO[] = DEFAULT_DEV_COUPONS.map((c) => ({ ...c }));
  const settings: StoreSettingsDTO = { ...DEFAULT_DEV_SETTINGS };
  const reviewsByProduct = new Map<string, ProductReviewDTO[]>();
  const tickets: SupportTicketDTO[] = [];
  const newsletter = new Set<string>();
  const auditLogs: AdminAuditLogDTO[] = [];

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
      const nowIso = new Date().toISOString();
      const record: StoredUserRecord = {
        id: crypto.randomUUID(),
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
      users.set(userId, updated);
      return {
        ...updated,
        addresses: [...updated.addresses],
        wishlist: [...updated.wishlist],
        activeSessionIds: [...updated.activeSessionIds],
      };
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
        })),
        query
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
          }
        : null;
    },

    async createProduct(product: ProductDTO) {
      const copy: ProductDTO = {
        ...product,
        colors: product.colors.map((c) => ({ ...c })),
        storageOptions: product.storageOptions.map((s) => ({ ...s })),
        specs: { ...product.specs },
      };
      products.push(copy);
      return copy;
    },

    async updateProduct(id: string, patch: Partial<ProductDTO>) {
      const idx = products.findIndex((p) => p.id === id || p.slug === id);
      if (idx < 0) return null;
      const current = products[idx];
      const next: ProductDTO = {
        ...current,
        ...patch,
        id: current.id,
        specs: patch.specs ? { ...current.specs, ...patch.specs } : current.specs,
        colors: patch.colors ?? current.colors,
        storageOptions: patch.storageOptions ?? current.storageOptions,
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
        const q = params.search.trim().toLowerCase();
        list = list.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
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

  findUserById(userId: string) {
    return this.storage.findUserById(userId);
  }

  createUserAccount(params: {
    email: string;
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
