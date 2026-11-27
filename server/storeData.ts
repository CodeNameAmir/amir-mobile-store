import { DIGIKALA_EXTRA_BRANDS, DIGIKALA_EXTRA_PRODUCTS } from '../src/data/digikalaProducts.ts';

export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending_gateway' | 'paid' | 'not_required';

export type CategoryId = 'all' | 'offers' | (string & {});

export type ProductCategory = string;

export interface ProductColorDTO {
  id: string;
  name: string;
  hex: string;
}

export interface StorageVariantDTO {
  label: string;
  subtitle: string;
  priceDelta: number;
}

export interface CustomSpecItemDTO {
  label: string;
  value: string;
}

export interface CategoryDTO {
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

export interface BrandDTO {
  id: string;
  name: string;
  labelFa?: string;
  slug?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isFeatured?: boolean;
  isActive: boolean;
}

export interface AuthRoleDTO {
  id: string;
  name: string;
  titleFa: string;
  description?: string;
  isSystem: boolean;
  createdAt?: string;
}

export interface WarrantyDTO {
  id: string;
  providerName: string;
  durationMonths: number;
  coverageFa: string;
  termsUrl?: string | null;
  isActive: boolean;
}

export type AttributeDataType = 'text' | 'number' | 'boolean' | 'select';

export interface AttributeDefinitionDTO {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  dataType: AttributeDataType;
  unit?: string | null;
  isFilterable: boolean;
  sortOrder: number;
  categoryIds?: string[];
}

export interface ProductAttributeValueDTO {
  id?: string;
  productId: string;
  attributeId: string;
  code: string;
  nameFa: string;
  nameEn: string;
  dataType: AttributeDataType;
  unit?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  displayValue: string;
}

export interface ProductImageDTO {
  id: string;
  productId: string;
  imageUrl: string;
  altTextFa?: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface ProductVariantDTO {
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
  costPriceToman?: number | null;
  availableStock?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PublicProductVariantDTO = Omit<ProductVariantDTO, 'costPriceToman'>;

export interface WarehouseDTO {
  id: string;
  code: string;
  nameFa: string;
  city: string;
  addressFa?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface WarehouseStockDTO {
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

export type StockMovementType =
  | 'opening_balance'
  | 'purchase_inflow'
  | 'order_sale'
  | 'customer_return'
  | 'transfer_out'
  | 'transfer_in'
  | 'inventory_adjustment';

export interface StockMovementDTO {
  id: string;
  warehouseId: string;
  variantId: string;
  movementType: StockMovementType;
  quantityChange: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  noteFa?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface StockMovementInput {
  warehouseId: string;
  variantId: string;
  movementType: StockMovementType;
  quantityChange: number;
  referenceType?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  noteFa?: string | null;
  createdBy?: string | null;
  shelfLocation?: string | null;
  minStockAlert?: number;
}

export interface ProductSpecsDTO {
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

export interface ProductDTO {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  modelName?: string;
  descriptionFa?: string;
  editorialReview?: string;
  brand: string;
  category: ProductCategory;
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
  colors: ProductColorDTO[];
  storageOptions: StorageVariantDTO[];
  specs: ProductSpecsDTO;
  customSpecs?: CustomSpecItemDTO[];
  variants?: ProductVariantDTO[];
  attributeValues?: ProductAttributeValueDTO[];
  priceUpdatedAt?: string;
  isPublished?: boolean;
  isFeaturedDeal?: boolean;
  isPopular?: boolean;
  salesRank: number;
  releaseOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponRuleDTO {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usedCount?: number;
  descriptionFa?: string;
}

export interface StoreSettingsDTO {
  announcementText: string;
  freeShippingThreshold: number;
  supportPhone: string;
}

export interface ProductReviewDTO {
  id: string;
  productId: string;
  userId?: string | null;
  author: string;
  authorUsername?: string;
  dateLabel: string;
  rating: number;
  comment: string;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface SupportTicketDTO {
  id?: string;
  userId?: string | null;
  ticketCode: string;
  fullName: string;
  phone: string;
  department: string;
  orderCode: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface StockAlertDTO {
  id: string;
  userId?: string | null;
  email: string;
  productId: string;
  variantId?: string | null;
  notifiedAt?: string | null;
  createdAt: string;
}

export interface UserNotificationDTO {
  id: string;
  userId: string;
  type: 'back_in_stock' | 'order_update' | 'ticket_reply' | 'system' | string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ProductQuestionDTO {
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

export interface BlogPostDTO {
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

export interface OrderSummaryDTO {
  orderCode: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliverySlot: 'express' | 'standard';
  createdAt: string;
  requiresVerification: true;
  isGuestOrder: boolean;
}

export interface CatalogFacetBrandDTO {
  name: string;
  count: number;
}

export interface CatalogFacetColorDTO {
  id: string;
  label: string;
  hex: string;
  count: number;
}

export interface CatalogFacetsDTO {
  brands: CatalogFacetBrandDTO[];
  colors: CatalogFacetColorDTO[];
  storages: string[];
  rams: string[];
  minPrice: number;
  maxPrice: number;
}

export interface AdminAuditLogDTO {
  id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface AdminCustomerDTO {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  newsletterOptIn: boolean;
  addressesCount: number;
  wishlistCount: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminStatsDTO {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  adminUsersCount: number;
  recentOrders: Array<{
    orderCode: string;
    customerName: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
  }>;
}

export const FREE_SHIPPING_THRESHOLD_DEFAULT = 1_000_000;
export const TEHRAN_EXPRESS_SHIPPING_FEE_DEFAULT = 150_000;
export const NATIONAL_POST_SHIPPING_FEE_DEFAULT = 95_000;
export const STANDARD_SHIPPING_FEE_DEFAULT = TEHRAN_EXPRESS_SHIPPING_FEE_DEFAULT;

export function isTehranCityServer(city?: string): boolean {
  const clean = toEnglishDigitsServer(String(city ?? '')).trim().toLowerCase();
  if (!clean) return false;
  return (
    clean === 'تهران' ||
    clean === 'tehran' ||
    clean === 'استان تهران' ||
    clean === 'تهران بزرگ' ||
    /^تهران(\s|[-،,]|$)/.test(clean)
  );
}

export function resolveShippingServer(
  afterDiscounts: number,
  freeShippingThreshold: number,
  city?: string,
  deliverySlot?: 'express' | 'standard'
): { deliverySlot: 'express' | 'standard'; shippingCost: number } {
  const resolvedSlot: 'express' | 'standard' =
    isTehranCityServer(city) && deliverySlot !== 'standard' ? 'express' : 'standard';
  if (afterDiscounts >= freeShippingThreshold) {
    return { deliverySlot: resolvedSlot, shippingCost: 0 };
  }
  const shippingCost =
    resolvedSlot === 'express'
      ? TEHRAN_EXPRESS_SHIPPING_FEE_DEFAULT
      : NATIONAL_POST_SHIPPING_FEE_DEFAULT;
  return { deliverySlot: resolvedSlot, shippingCost };
}

export const DEFAULT_DEV_CATEGORIES: CategoryDTO[] = [
  {
    id: 'phones',
    slug: 'phones',
    label: 'گوشی موبایل',
    subtitle: 'اپل، سامسونگ، شیائومی، هواوی',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید گوشی موبایل اصل با گارانتی و رجیستری | فروشگاه موبایل امیر',
    seoDescription: 'جدیدترین گوشی‌های آیفون، سامسونگ، شیائومی و هواوی با گارانتی ۱۸ ماهه امیر سرویس و کد رجیستری همتا.',
    sortOrder: 1,
  },
  {
    id: 'flagship-phones',
    slug: 'flagship-phones',
    label: 'پرچمداران عکاسی و پرو',
    subtitle: 'مدل‌های Ultra و Pro Max',
    parentId: 'phones',
    isActive: true,
    image: '',
    seoTitle: 'گوشی‌های پرچمدار و حرفه‌ای | فروشگاه موبایل امیر',
    seoDescription: 'بررسی و خرید پرچمداران اپل، سامسونگ، شیائومی لایکا و هواوی پورا با ارسال اکسپرس.',
    sortOrder: 2,
  },
  {
    id: 'tablets',
    slug: 'tablets',
    label: 'تبلت',
    subtitle: 'آیپد و گلکسی تب',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید تبلت و آیپد پرو M4 | فروشگاه موبایل امیر',
    seoDescription: 'تبلت‌های حرفه‌ای اپل و سامسونگ با گارانتی معتبر و ارسال سریع به سراسر ایران.',
    sortOrder: 3,
  },
  {
    id: 'smartwatches',
    slug: 'smartwatches',
    label: 'ساعت هوشمند',
    subtitle: 'اپل واچ و گلکسی واچ',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید ساعت هوشمند اورجینال | فروشگاه موبایل امیر',
    seoDescription: 'اپل واچ اولترا ۲ و ساعت‌های هوشمند ورزشی با ضمانت اصالت.',
    sortOrder: 4,
  },
  {
    id: 'audio',
    slug: 'audio',
    label: 'هدفون و ایرپاد',
    subtitle: 'ایرپاد و استودیویی',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید هندزفری بی‌سیم و ایرپاد اصل | فروشگاه موبایل امیر',
    seoDescription: 'انواع ایرپاد پرو و هندزفری‌های حذف نویز فعال با گارانتی اصلی.',
    sortOrder: 5,
  },
  {
    id: 'chargers',
    slug: 'chargers',
    label: 'شارژر و پاوربانک',
    subtitle: 'فست شارژ GaN اورجینال',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید شارژر فست GaN و پاوربانک انکر | فروشگاه موبایل امیر',
    seoDescription: 'آداپتورهای اورجینال اپل، سامسونگ و پاوربانک‌های پرقدرت انکر.',
    sortOrder: 6,
  },
  {
    id: 'cases',
    slug: 'cases',
    label: 'قاب و محافظ صفحه',
    subtitle: 'ضد ضربه و کاور مگ‌سیف',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید قاب مگ‌سیف و گلس محافظ | فروشگاه موبایل امیر',
    seoDescription: 'قاب‌های اورجینال و ضدضربه برای آیفون و گوشی‌های پرچمدار.',
    sortOrder: 7,
  },
  {
    id: 'gaming',
    slug: 'gaming',
    label: 'لوازم گیمینگ',
    subtitle: 'دسته بازی و خنک‌کننده',
    parentId: null,
    isActive: true,
    image: '',
    seoTitle: 'خرید تجهیزات گیمینگ موبایل | فروشگاه موبایل امیر',
    seoDescription: 'فن خنک‌کننده مغناطیسی، تریگر و لوازم حرفه‌ای موبایل گیمینگ.',
    sortOrder: 8,
  },
];

export const CATEGORY_ITEMS = DEFAULT_DEV_CATEGORIES;

export const DEFAULT_DEV_BRANDS: BrandDTO[] = [
  { id: 'apple', name: 'Apple', labelFa: 'اپل', isActive: true },
  { id: 'samsung', name: 'Samsung', labelFa: 'سامسونگ', isActive: true },
  { id: 'xiaomi', name: 'Xiaomi', labelFa: 'شیائومی', isActive: true },
  { id: 'huawei', name: 'Huawei', labelFa: 'هواوی', isActive: true },
  { id: 'honor', name: 'Honor', labelFa: 'آنر', isActive: true },
  { id: 'anker', name: 'Anker', labelFa: 'انکر', isActive: true },
  { id: 'motorola', name: 'Motorola', labelFa: 'موتورولا', isActive: true },
  ...DIGIKALA_EXTRA_BRANDS,
];

export const DEFAULT_DEV_COUPONS: CouponRuleDTO[] = [
  {
    code: 'AMIR-OFF',
    discountType: 'fixed',
    discountValue: 500_000,
    maxDiscount: 500_000,
    minOrderAmount: 0,
    isActive: true,
    descriptionFa: 'کد تخفیف خوش‌آمدگویی ۵۰۰ هزار تومانی',
  },
  {
    code: 'VIP-10',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 2_000_000,
    minOrderAmount: 1_000_000,
    isActive: true,
    descriptionFa: 'تخفیف ۱۰ درصدی ویژه تا سقف ۲ میلیون تومان',
  },
];

export const DEFAULT_DEV_SETTINGS: StoreSettingsDTO = {
  announcementText: 'ارسال رایگان برای خریدهای بالای ۱ میلیون تومان به سراسر ایران',
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD_DEFAULT,
  supportPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
};

export const DEFAULT_DEV_REVIEWS: ProductReviewDTO[] = [
  {
    id: 'r1',
    productId: 'default',
    author: 'مهرداد رضایی',
    dateLabel: '۲ روز پیش',
    rating: 5,
    comment:
      'گوشی از نظر رجیستری و پلمپ کاملاً رسمی بود. رنگ تیتانیوم کویری در واقعیت بسیار شیک‌تر از تصاویر است. بسته‌بندی و ارسال اکسپرس فروشگاه موبایل امیر عالی بود.',
    verified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: 'r2',
    productId: 'default',
    author: 'سارا میرزایی',
    dateLabel: 'هفته پیش',
    rating: 4,
    comment:
      'دوربین فوق‌العاده‌ست به‌خصوص برای فیلمبرداری. کلید کمرا کنترل خیلی روان کار می‌کنه و ارسال در تهران دقیقاً ظرف ۳ ساعت انجام شد.',
    verified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
  },
];

export const DEFAULT_DEV_PRODUCTS: ProductDTO[] = [
  {
    id: 'iphone-16-pro-max',
    slug: 'iphone-16-pro-max',
    nameFa: 'گوشی موبایل اپل مدل iPhone 16 Pro Max دو سیم‌کارت',
    nameEn: 'Apple iPhone 16 Pro Max Dual SIM 5G - Titanium Edition',
    brand: 'Apple',
    category: 'phones',
    price: 94_200_000,
    originalPrice: 98_000_000,
    discountPercent: 4,
    inStock: true,
    stockCount: 5,
    expressDelivery: true,
    warranty: '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا',
    badgeText: '۴٪ تخفیف',
    rating: 4.9,
    reviewCount: 142,
    recommendPercent: 96,
    image: '',
    colorLabel: 'تیتانیوم کویری',
    colors: [
      { id: 'desert', name: 'تیتانیوم کویری (Desert Titanium)', hex: '#C5B4A0' },
      { id: 'midnight', name: 'تیتانیوم مشکی (Black Titanium)', hex: '#2A2B2D' },
      { id: 'silver', name: 'تیتانیوم سفید (White Titanium)', hex: '#E3E4E5' },
      { id: 'titanium', name: 'تیتانیوم طبیعی (Natural Titanium)', hex: '#8E8B82' },
    ],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'نسخه استاندارد', priceDelta: 0 },
      { label: '۵۱۲ گیگابایت', subtitle: 'پیشنهاد ادیتورها', priceDelta: 12_300_000 },
      { label: '۱ ترابایت', subtitle: 'فیلمبرداری ProRes', priceDelta: 25_600_000 },
    ],
    specs: {
      display: '۶.۹ اینچ OLED',
      displayDetails: '۱۲۰Hz ProMotion · ۲۰۰۰ نیت',
      chipset: 'Apple A18 Pro',
      chipsetDetails: 'معماری ۳ نانومتری',
      camera: '۴۸ + ۴۸ + ۱۲ MP',
      cameraDetails: 'زوم اپتیکال ۵ برابری',
      battery: '۴۶۸۵ میلی‌آمپر',
      batteryDetails: 'شارژ بی‌سیم مگ‌سیف',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۸ گیگ',
      os: 'iOS 18',
    },
    isFeaturedDeal: false,
    isPopular: true,
    salesRank: 1,
    releaseOrder: 1,
    customSpecs: [
      { label: 'دکمه کنترل دوربین', value: 'Camera Control لمسی و فشاری' },
      { label: 'جنس فریم', value: 'تیتانیوم گرید ۵ · گواهی IP68' },
      { label: 'فیلمبرداری حرفه‌ای', value: '4K Dolby Vision 120fps · ProRes Log' },
    ],
    priceUpdatedAt: '2026-11-18T10:30:00.000Z',
  },
  {
    id: 'huawei-pura-70-ultra',
    slug: 'huawei-pura-70-ultra',
    nameFa: 'گوشی موبایل هواوی مدل Pura 70 Ultra ظرفیت ۵۱۲ گیگابایت',
    nameEn: 'Huawei Pura 70 Ultra 512GB XMAGE Retractable Lens',
    brand: 'Huawei',
    category: 'phones',
    price: 61_500_000,
    originalPrice: 65_000_000,
    discountPercent: 5,
    inStock: true,
    stockCount: 4,
    expressDelivery: true,
    warranty: '۱۸ ماهه امیر سرویس + کد رجیستری همتا',
    badgeText: 'لنز تلسکوپی XMAGE',
    rating: 4.9,
    reviewCount: 44,
    recommendPercent: 95,
    image: '',
    colorLabel: 'سفید مرواریدی',
    colors: [
      { id: 'silver', name: 'سفید مرواریدی', hex: '#f1f5f9' },
      { id: 'midnight', name: 'مشکی چرمی', hex: '#1e293b' },
    ],
    storageOptions: [
      { label: '۵۱۲ گیگابایت', subtitle: 'رم ۱۶ گیگابایت', priceDelta: 0 },
    ],
    specs: {
      display: '۶.۸ اینچ LTPO OLED',
      displayDetails: '۱۲۰Hz · محافظ Kunlun Glass',
      chipset: 'Kirin 9010',
      chipsetDetails: 'معماری اختصاصی ۸ هسته‌ای',
      camera: '۵۰ + ۵۰ + ۴۰ MP XMAGE',
      cameraDetails: 'سنسور ۱ اینچی جمع‌شونده مکانیکی',
      battery: '۵۲۰۰ میلی‌آمپر',
      batteryDetails: 'فست شارژ ۱۰۰ وات سیمی · ۸۰ وات بی‌سیم',
      storageDefault: '۵۱۲ گیگابایت',
      ram: '۱۶ گیگ',
      os: 'EMUI 14.2 گلوبال',
    },
    customSpecs: [
      { label: 'دیافراگم متغیر', value: 'f/1.6 تا f/4.0 مکانیکی' },
      { label: 'شیشه محافظ', value: 'Basalt Tempered Kunlun Glass' },
    ],
    priceUpdatedAt: '2026-11-18T11:00:00.000Z',
    isFeaturedDeal: false,
    isPopular: true,
    salesRank: 3,
    releaseOrder: 2,
  },
  {
    id: 'galaxy-s24-ultra',
    slug: 'galaxy-s24-ultra',
    nameFa: 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra 5G',
    nameEn: 'Samsung Galaxy S24 Ultra 5G Titanium Gray',
    brand: 'Samsung',
    category: 'phones',
    price: 63_800_000,
    originalPrice: 68_500_000,
    discountPercent: 7,
    inStock: true,
    stockCount: 3,
    expressDelivery: true,
    warranty: '۱۸ ماهه هماهنگ + رجیستری رسمی',
    badgeText: '۷٪ تخفیف',
    rating: 4.8,
    reviewCount: 118,
    recommendPercent: 95,
    image: '',
    colorLabel: 'خاکستری تیتانیوم',
    colors: [
      { id: 'titanium', name: 'خاکستری تیتانیوم', hex: '#9c9589' },
      { id: 'midnight', name: 'مشکی تیتانیوم', hex: '#1e293b' },
      { id: 'purple', name: 'بنفش تیتانیوم', hex: '#581c87' },
    ],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'رم ۱۲ گیگابایت', priceDelta: 0 },
      { label: '۵۱۲ گیگابایت', subtitle: 'رم ۱۲ گیگابایت', priceDelta: 7_400_000 },
    ],
    specs: {
      display: '۶.۸ اینچ Dynamic AMOLED 2X',
      displayDetails: '۱۲۰Hz · قلم S-Pen',
      chipset: 'Snapdragon 8 Gen 3',
      chipsetDetails: 'نسخه اختصاصی Galaxy',
      camera: '۲۰۰ + ۵۰ + ۱۲ + ۱۰ MP',
      cameraDetails: 'زوم ۱۰۰ برابری Space Zoom',
      battery: '۵۰۰۰ میلی‌آمپر',
      batteryDetails: 'فست شارژ ۴۵ وات',
      storageDefault: '۵۱۲ گیگابایت',
      ram: '۱۲ گیگ',
      os: 'Android 14 · Galaxy AI',
    },
    isFeaturedDeal: true,
    isPopular: true,
    salesRank: 2,
    releaseOrder: 2,
  },
  {
    id: 'xiaomi-14-ultra',
    slug: 'xiaomi-14-ultra',
    nameFa: 'گوشی موبایل شیائومی مدل Xiaomi 14 Ultra دوربین لایکا',
    nameEn: 'Xiaomi 14 Ultra 5G Leica Optics - 512GB',
    brand: 'Xiaomi',
    category: 'phones',
    price: 57_900_000,
    originalPrice: 61_500_000,
    discountPercent: 6,
    inStock: true,
    stockCount: 4,
    expressDelivery: true,
    warranty: '۱۸ ماهه تسکو + کد همتا',
    badgeText: 'ویژه عکاسی',
    rating: 4.9,
    reviewCount: 68,
    recommendPercent: 94,
    image: '',
    colorLabel: 'مشکی چرمی',
    colors: [
      { id: 'midnight', name: 'مشکی چرمی', hex: '#1f2937' },
      { id: 'silver', name: 'سفید سرامیکی', hex: '#e2e8f0' },
    ],
    storageOptions: [{ label: '۵۱۲ گیگابایت', subtitle: 'رم ۱۶ گیگابایت', priceDelta: 0 }],
    specs: {
      display: '۶.۷۳ اینچ LTPO AMOLED',
      displayDetails: '۱۲۰Hz · Dolby Vision',
      chipset: 'Snapdragon 8 Gen 3',
      chipsetDetails: 'سیستم خنک‌کننده IceLoop',
      camera: '۵۰ MP چهارگانه لایکا',
      cameraDetails: 'لنز Summilux متغیر',
      battery: '۵۰۰۰ میلی‌آمپر',
      batteryDetails: 'فست شارژ ۹۰ وات',
      storageDefault: '۵۱۲ گیگابایت',
      ram: '۱۶ گیگ',
      os: 'HyperOS',
    },
    isFeaturedDeal: false,
    isPopular: true,
    salesRank: 4,
    releaseOrder: 3,
  },
  {
    id: 'iphone-15-pro',
    slug: 'iphone-15-pro',
    nameFa: 'گوشی موبایل اپل مدل iPhone 15 Pro تیتانیوم',
    nameEn: 'Apple iPhone 15 Pro 256GB ZAA Dual SIM',
    brand: 'Apple',
    category: 'phones',
    price: 78_500_000,
    originalPrice: 82_000_000,
    discountPercent: 4,
    inStock: true,
    stockCount: 6,
    expressDelivery: true,
    warranty: '۱۸ ماهه امیر سرویس',
    badgeText: 'پرفروش',
    rating: 4.8,
    reviewCount: 190,
    recommendPercent: 95,
    image: '',
    colorLabel: 'تیتانیوم طبیعی',
    colors: [
      { id: 'titanium', name: 'تیتانیوم طبیعی', hex: '#9c9589' },
      { id: 'midnight', name: 'آبی تیتانیوم', hex: '#1e293b' },
    ],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'دو سیم‌کارت ZAA', priceDelta: 0 },
      { label: '۱۲۸ گیگابایت', subtitle: 'نسخه پایه', priceDelta: -8_000_000 },
    ],
    specs: {
      display: '۶.۱ اینچ Super Retina XDR',
      displayDetails: '۱۲۰Hz ProMotion',
      chipset: 'Apple A17 Pro',
      chipsetDetails: 'پردازنده ۶ هسته‌ای',
      camera: '۴۸ + ۱۲ + ۱۲ MP',
      cameraDetails: 'زوم اپتیکال ۳ برابری',
      battery: '۳۲۷۴ میلی‌آمپر',
      batteryDetails: 'پورت Type-C',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۸ گیگ',
      os: 'iOS 18',
    },
    isPopular: true,
    salesRank: 3,
    releaseOrder: 4,
  },
  {
    id: 'galaxy-a55-5g',
    slug: 'galaxy-a55-5g',
    nameFa: 'گوشی موبایل سامسونگ مدل Galaxy A55 5G دو سیم‌کارت',
    nameEn: 'Samsung Galaxy A55 5G 256GB',
    brand: 'Samsung',
    category: 'phones',
    price: 20_600_000,
    originalPrice: 21_800_000,
    discountPercent: 5,
    inStock: true,
    stockCount: 14,
    expressDelivery: true,
    warranty: '۱۸ ماهه داریا همراه',
    badgeText: '۵٪ تخفیف',
    rating: 4.7,
    reviewCount: 210,
    recommendPercent: 93,
    image: '',
    colorLabel: 'یاسی روشن',
    colors: [
      { id: 'purple', name: 'یاسی روشن', hex: '#a855f7' },
      { id: 'midnight', name: 'سرمه‌ای تیره', hex: '#1e293b' },
    ],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'رم ۸ گیگابایت', priceDelta: 0 },
      { label: '۱۲۸ گیگابایت', subtitle: 'رم ۸ گیگابایت', priceDelta: -1_900_000 },
    ],
    specs: {
      display: '۶.۶ اینچ Super AMOLED',
      displayDetails: '۱۲۰Hz · گوریلا گلس ویکتوس',
      chipset: 'Exynos 1480',
      chipsetDetails: 'معماری ۴ نانومتری',
      camera: '۵۰ + ۱۲ + ۵ MP',
      cameraDetails: 'لرزشگیر اپتیکال OIS',
      battery: '۵۰۰۰ میلی‌آمپر',
      batteryDetails: 'شارژ سریع ۲۵ وات',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۸ گیگ',
      os: 'Android 14',
    },
    isPopular: true,
    salesRank: 5,
    releaseOrder: 5,
  },
  {
    id: 'poco-x6-pro-5g',
    slug: 'poco-x6-pro-5g',
    nameFa: 'گوشی موبایل شیائومی مدل POCO X6 Pro 5G ظرفیت ۵۱۲',
    nameEn: 'Xiaomi Poco X6 Pro 5G 512GB RAM 12',
    brand: 'Xiaomi',
    category: 'phones',
    price: 18_900_000,
    originalPrice: 19_700_000,
    discountPercent: 4,
    inStock: true,
    stockCount: 9,
    expressDelivery: true,
    warranty: '۱۸ ماهه شرکتی',
    badgeText: 'گیمینگ اقتصادی',
    rating: 4.8,
    reviewCount: 84,
    recommendPercent: 92,
    image: '',
    colorLabel: 'مشکی اسپرت',
    colors: [
      { id: 'midnight', name: 'مشکی اسپرت', hex: '#1e293b' },
      { id: 'gold', name: 'زرد ریسینگ', hex: '#d4af37' },
    ],
    storageOptions: [{ label: '۵۱۲ گیگابایت', subtitle: 'رم ۱۲ گیگابایت', priceDelta: 0 }],
    specs: {
      display: '۶.۶۷ اینچ Flow AMOLED',
      displayDetails: '۱۲۰Hz · رزولوشن 1.5K',
      chipset: 'Dimensity 8300 Ultra',
      chipsetDetails: 'مناسب بازی‌های سنگین',
      camera: '۶۴ + ۸ + ۲ MP',
      cameraDetails: 'لرزشگیر OIS',
      battery: '۵۰۰۰ میلی‌آمپر',
      batteryDetails: 'شارژر ۶۷ وات توربو داخل جعبه',
      storageDefault: '۵۱۲ گیگابایت',
      ram: '۱۲ گیگ',
      os: 'HyperOS',
    },
    isPopular: true,
    salesRank: 6,
    releaseOrder: 6,
  },
  {
    id: 'airpods-pro-2-usbc',
    slug: 'airpods-pro-2-usbc',
    nameFa: 'هندزفری بی‌سیم اپل مدل AirPods Pro 2 نسل جدید تایپ‌سی',
    nameEn: 'Apple AirPods Pro (2nd Gen) MagSafe USB-C',
    brand: 'Apple',
    category: 'audio',
    price: 10_850_000,
    originalPrice: 14_200_000,
    discountPercent: 24,
    inStock: true,
    stockCount: 11,
    expressDelivery: true,
    warranty: '۱۲ ماهه طلایی امیر سرویس',
    badgeText: '۲۴٪ تخفیف',
    rating: 4.9,
    reviewCount: 175,
    recommendPercent: 97,
    image: '',
    colorLabel: 'سفید',
    colors: [{ id: 'silver', name: 'سفید', hex: '#f1f5f9' }],
    storageOptions: [{ label: 'نسخه USB-C', subtitle: 'پشتیبانی MagSafe', priceDelta: 0 }],
    specs: {
      display: 'محفظه شارژ هوشمند',
      displayDetails: 'اسپیکر داخلی Find My',
      chipset: 'Apple H2',
      chipsetDetails: 'حذف نویز فعال ۲ برابری',
      camera: 'حسگر لمسی دقیق',
      cameraDetails: 'تنظیم صدا با سوایپ',
      battery: '۳۰ ساعت شارژدهی',
      batteryDetails: 'شارژ USB-C و مگ‌سیف',
      storageDefault: 'پورت Type-C',
      ram: '۸ گیگ',
      os: 'سازگار با iOS و اندروید',
    },
    isFeaturedDeal: true,
    salesRank: 7,
    releaseOrder: 7,
  },
  {
    id: 'apple-watch-ultra-2',
    slug: 'apple-watch-ultra-2',
    nameFa: 'ساعت هوشمند اپل واچ اولترا ۲ بدنه تیتانیوم',
    nameEn: 'Apple Watch Ultra 2 Titanium 49mm',
    brand: 'Apple',
    category: 'smartwatches',
    price: 43_200_000,
    originalPrice: 48_000_000,
    discountPercent: 10,
    inStock: true,
    stockCount: 2,
    expressDelivery: true,
    warranty: '۱۸ ماهه امیر سرویس',
    badgeText: '۱۰٪ تخفیف',
    rating: 4.9,
    reviewCount: 53,
    recommendPercent: 98,
    image: '',
    colorLabel: 'تیتانیوم طبیعی',
    colors: [{ id: 'titanium', name: 'تیتانیوم طبیعی', hex: '#9c9589' }],
    storageOptions: [{ label: '۴۹ میلی‌متر', subtitle: 'بند آلپاین / تریل', priceDelta: 0 }],
    specs: {
      display: '۴۹ میلی‌متر Retina OLED',
      displayDetails: 'روشنایی ۳۰۰۰ نیت',
      chipset: 'Apple S9 SiP',
      chipsetDetails: 'کنترل با ژست Double Tap',
      camera: 'سنسور اکسیژن و ECG',
      cameraDetails: 'GPS دوفرکانسه دقیق',
      battery: 'تا ۷۲ ساعت شارژدهی',
      batteryDetails: 'مقاوم تا عمق ۱۰۰ متر',
      storageDefault: '۶۴ گیگابایت',
      ram: '۸ گیگ',
      os: 'watchOS 11',
    },
    isFeaturedDeal: true,
    salesRank: 8,
    releaseOrder: 8,
  },
  {
    id: 'anker-prime-powerbank-24000',
    slug: 'anker-prime-powerbank-24000',
    nameFa: 'پاوربانک ۲۴۰۰۰ انکر مدل Prime با توان خروجی 140W',
    nameEn: 'Anker 737 Power Bank (PowerCore 24K) 140W GaN',
    brand: 'Anker',
    category: 'chargers',
    price: 6_970_000,
    originalPrice: 8_500_000,
    discountPercent: 18,
    inStock: true,
    stockCount: 5,
    expressDelivery: true,
    warranty: '۱۸ ماهه گارانتی تعویض انکر',
    badgeText: '۱۸٪ تخفیف',
    rating: 4.9,
    reviewCount: 92,
    recommendPercent: 96,
    image: '',
    colorLabel: 'خاکستری متالیک',
    colors: [{ id: 'midnight', name: 'خاکستری متالیک', hex: '#334155' }],
    storageOptions: [{ label: '۲۴۰۰۰ میلی‌آمپر', subtitle: 'نمایشگر دیجیتال', priceDelta: 0 }],
    specs: {
      display: 'نمایشگر دیجیتال هوشمند',
      displayDetails: 'نمایش لحظه‌ای توان وات',
      chipset: 'PowerIQ 3.0 + PD 3.1',
      chipsetDetails: 'پشتیبانی شارژ مک‌بوک',
      camera: '۲ پورت USB-C + ۱ USB-A',
      cameraDetails: 'توزیع هوشمند انرژی',
      battery: '۲۴۰۰۰ میلی‌آمپر',
      batteryDetails: 'توان خروجی ۱۴۰ وات',
      storageDefault: '۲۴۰۰۰ میلی‌آمپر',
      ram: '۸ گیگ',
      os: 'ActiveShield 2.0',
    },
    isFeaturedDeal: true,
    salesRank: 9,
    releaseOrder: 9,
  },
  {
    id: 'anker-gan-65w-charger',
    slug: 'anker-gan-65w-charger',
    nameFa: 'آداپتور شارژ سریع ۶۵ وات انکر سری GaNPrime',
    nameEn: 'Anker Nano II 65W GaN Fast Charger USB-C',
    brand: 'Anker',
    category: 'chargers',
    price: 2_890_000,
    originalPrice: 3_200_000,
    discountPercent: 10,
    inStock: true,
    stockCount: 20,
    expressDelivery: true,
    warranty: '۱۸ ماهه گارانتی رسمی',
    badgeText: 'تاییدیه MFi',
    rating: 4.8,
    reviewCount: 130,
    recommendPercent: 97,
    image: '',
    colorLabel: 'سرمه‌ای متالیک',
    colors: [{ id: 'midnight', name: 'سرمه‌ای متالیک', hex: '#1e293b' }],
    storageOptions: [{ label: '۶۵ وات', subtitle: 'تکنولوژی GaN', priceDelta: 0 }],
    specs: {
      display: 'ابعاد فوق‌العاده جمع‌وجور',
      displayDetails: 'پلاگ تاشو',
      chipset: 'تراشه GaN II',
      chipsetDetails: 'کاهش حرارت ۳۰ درصدی',
      camera: 'پورت Type-C پرسرعت',
      cameraDetails: 'سازگار با آیفون، سامسونگ و لپ‌تاپ',
      battery: 'توان خروجی ۶۵ وات',
      batteryDetails: 'محافظت نوسان برق',
      storageDefault: '۶۵ وات',
      ram: '۸ گیگ',
      os: 'PowerIQ 4.0',
    },
    salesRank: 10,
    releaseOrder: 10,
  },
  {
    id: 'ipad-pro-m4-11',
    slug: 'ipad-pro-m4-11',
    nameFa: 'تبلت اپل مدل iPad Pro M4 2024 ظرفیت ۲۵۶ گیگابایت',
    nameEn: 'Apple iPad Pro 11-inch M4 Tandem OLED 256GB',
    brand: 'Apple',
    category: 'tablets',
    price: 68_400_000,
    originalPrice: 71_000_000,
    discountPercent: 4,
    inStock: true,
    stockCount: 4,
    expressDelivery: true,
    warranty: '۱۸ ماهه امیر سرویس',
    badgeText: 'تراشه M4',
    rating: 4.9,
    reviewCount: 34,
    recommendPercent: 98,
    image: '',
    colorLabel: 'مشکی فضایی',
    colors: [
      { id: 'midnight', name: 'مشکی فضایی', hex: '#1e293b' },
      { id: 'silver', name: 'نقره‌ای', hex: '#e2e8f0' },
    ],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'Wi-Fi', priceDelta: 0 },
      { label: '۵۱۲ گیگابایت', subtitle: 'Wi-Fi', priceDelta: 11_000_000 },
    ],
    specs: {
      display: '۱۱ اینچ Tandem OLED',
      displayDetails: '۱۲۰Hz Ultra Retina XDR',
      chipset: 'Apple M4',
      chipsetDetails: 'موتور عصبی قدرتمند',
      camera: '۱۲ مگاپیکسل + LiDAR',
      cameraDetails: 'فیلمبرداری ProRes',
      battery: '۱۰ ساعت کار مداوم',
      batteryDetails: 'ضخامت ۵.۳ میلی‌متر',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۸ گیگ',
      os: 'iPadOS 18',
    },
    salesRank: 11,
    releaseOrder: 11,
  },
  {
    id: 'magsafe-clear-case-16pm',
    slug: 'magsafe-clear-case-16pm',
    nameFa: 'قاب محافظ شفاف مگ‌سیف اصل آیفون ۱۶ پرو مکس',
    nameEn: 'Apple Clear Case with MagSafe for iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'cases',
    price: 3_250_000,
    originalPrice: 3_500_000,
    discountPercent: 7,
    inStock: true,
    stockCount: 18,
    expressDelivery: true,
    warranty: 'تضمین اصالت اورجینال',
    badgeText: 'اورجینال',
    rating: 4.7,
    reviewCount: 41,
    recommendPercent: 91,
    image: '',
    colorLabel: 'شفاف کریستالی',
    colors: [{ id: 'silver', name: 'شفاف کریستالی', hex: '#f8fafc' }],
    storageOptions: [{ label: 'آیفون ۱۶ پرو مکس', subtitle: 'سازگار با Camera Control', priceDelta: 0 }],
    specs: {
      display: 'پلی‌کربنات مقاوم در برابر زردشدگی',
      displayDetails: 'پوشش ضد خش',
      chipset: 'حلقه آهنربایی MagSafe',
      chipsetDetails: 'شارژ بی‌سیم ۱۵ وات',
      camera: 'لبه برجسته محافظ لنز',
      cameraDetails: 'پوشش یاقوت روی دکمه دوربین',
      battery: 'طراحی فوق باریک',
      batteryDetails: 'نصب آسان',
      storageDefault: '۱۲۸ گیگابایت',
      ram: '۸ گیگ',
      os: 'لوازم جانبی اپل',
    },
    salesRank: 12,
    releaseOrder: 12,
  },
  {
    id: 'poco-cooler-gaming-kit',
    slug: 'poco-cooler-gaming-kit',
    nameFa: 'فن خنک‌کننده مغناطیسی موبایل و تریگر گیمینگ حرفه‌ای',
    nameEn: 'Magnetic Peltier Phone Cooler + Pro Gaming Triggers',
    brand: 'Xiaomi',
    category: 'gaming',
    price: 2_450_000,
    originalPrice: 2_900_000,
    discountPercent: 15,
    inStock: true,
    stockCount: 8,
    expressDelivery: true,
    warranty: '۱۲ ماهه امیر سرویس',
    badgeText: '۱۵٪ تخفیف',
    rating: 4.8,
    reviewCount: 29,
    recommendPercent: 93,
    image: '',
    colorLabel: 'مشکی مات',
    colors: [{ id: 'midnight', name: 'مشکی مات', hex: '#0f172a' }],
    storageOptions: [{ label: 'نسخه Pro مگنتی', subtitle: 'نمایشگر دما', priceDelta: 0 }],
    specs: {
      display: 'نمایشگر دیجیتال دما',
      displayDetails: 'کاهش دما تا ۱۸ درجه',
      chipset: 'تراشه خنک‌کننده TEC Peltier',
      chipsetDetails: 'کم‌صدا زیر ۲۸ دسی‌بل',
      camera: 'پشتیبانی مگ‌سیف و گیره',
      cameraDetails: 'نورپردازی RGB قابل تنظیم',
      battery: 'تغذیه USB-C مستقیم',
      batteryDetails: 'توان ۱۵ وات',
      storageDefault: '۱۲۸ گیگابایت',
      ram: '۸ گیگ',
      os: 'مناسب آیفون و اندروید',
    },
    salesRank: 13,
    releaseOrder: 13,
  },
  {
    id: 'iphone-15-pro-blue-oos',
    slug: 'iphone-15-pro-blue-oos',
    nameFa: 'گوشی موبایل اپل مدل iPhone 15 Pro تیتانیوم آبی ۱۲۸ گیگابایت',
    nameEn: 'Apple iPhone 15 Pro 128GB Blue Titanium',
    brand: 'Apple',
    category: 'phones',
    price: 64_200_000,
    inStock: false,
    stockCount: 0,
    expressDelivery: false,
    warranty: '۱۸ ماهه امیر سرویس',
    badgeText: 'ناموجود در انبار',
    rating: 4.8,
    reviewCount: 87,
    recommendPercent: 94,
    image: '',
    colorLabel: 'آبی تیتانیوم',
    colors: [{ id: 'midnight', name: 'آبی تیتانیوم', hex: '#1e293b' }],
    storageOptions: [{ label: '۱۲۸ گیگابایت', subtitle: 'تک سیم‌کارت', priceDelta: 0 }],
    specs: {
      display: '۶.۱ اینچ Super Retina XDR',
      displayDetails: '۱۲۰Hz ProMotion',
      chipset: 'Apple A17 Pro',
      chipsetDetails: '۳ نانومتری',
      camera: '۴۸ + ۱۲ + ۱۲ MP',
      cameraDetails: 'زوم اپتیکال ۳x',
      battery: '۳۲۷۴ میلی‌آمپر',
      batteryDetails: 'MagSafe',
      storageDefault: '۱۲۸ گیگابایت',
      ram: '۸ گیگ',
      os: 'iOS 18',
    },
    salesRank: 14,
    releaseOrder: 14,
  },
  ...DIGIKALA_EXTRA_PRODUCTS,
];

export const VALID_STOCK_MOVEMENT_TYPES: StockMovementType[] = [
  'opening_balance',
  'purchase_inflow',
  'order_sale',
  'customer_return',
  'transfer_out',
  'transfer_in',
  'inventory_adjustment',
];

export const DEFAULT_DEV_ROLES: AuthRoleDTO[] = [
  {
    id: 'role-customer',
    name: 'customer',
    titleFa: 'مشتری فروشگاه',
    description: 'دسترسی استاندارد خریدار برای سفارش، آدرس‌ها و علاقه‌مندی‌ها',
    isSystem: true,
  },
  {
    id: 'role-admin',
    name: 'admin',
    titleFa: 'مدیر کل فروشگاه',
    description: 'دسترسی کامل به محصولات، انبارها، سفارش‌ها، کاربران و گزارش‌های ممیزی',
    isSystem: true,
  },
  {
    id: 'role-warehouse',
    name: 'warehouse_manager',
    titleFa: 'مدیر انبار و موجودی',
    description: 'ثبت ورود/خروج کالا، حواله‌های انبار و مدیریت موجودی تنوع‌ها (SKU)',
    isSystem: true,
  },
  {
    id: 'role-sales',
    name: 'sales_operator',
    titleFa: 'اپراتور فروش و پیگیری سفارش',
    description: 'بررسی سفارش‌ها، تغییر وضعیت ارسال و پاسخگویی به تیکت‌ها',
    isSystem: true,
  },
  {
    id: 'role-content',
    name: 'content_editor',
    titleFa: 'کارشناس محتوا و کاتالوگ',
    description: 'ویرایش مشخصات فنی، تصاویر، دسته‌بندی‌ها و برندها',
    isSystem: true,
  },
];

export const DEFAULT_DEV_WARRANTIES: WarrantyDTO[] = [
  {
    id: 'w-amir-18',
    providerName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    durationMonths: 18,
    coverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    termsUrl: null,
    isActive: true,
  },
  {
    id: 'w-hamahang-18',
    providerName: 'هماهنگ (۱۸ ماهه رسمی)',
    durationMonths: 18,
    coverageFa: '۱۸ ماه گارانتی هماهنگ با پوشش قطعات اصلی و رجیستری قانونی همتا',
    termsUrl: null,
    isActive: true,
  },
  {
    id: 'w-daria-18',
    providerName: 'داریا همراه پایتخت (۱۸ ماهه)',
    durationMonths: 18,
    coverageFa: '۱۸ ماه گارانتی معتبر داریا همراه با شبکه خدمات پس از فروش سراسری',
    termsUrl: null,
    isActive: true,
  },
  {
    id: 'w-tesco-18',
    providerName: 'تسکو / حامی (۱۸ ماهه)',
    durationMonths: 18,
    coverageFa: '۱۸ ماه گارانتی رسمی قطعات و خدمات تخصصی شیائومی و لوازم جانبی',
    termsUrl: null,
    isActive: true,
  },
  {
    id: 'w-amir-12',
    providerName: 'امیر سرویس (۱۲ ماهه طلایی لوازم جانبی)',
    durationMonths: 12,
    coverageFa: '۱۲ ماه ضمانت تعویض و اصالت برای ایرپاد، شارژر GaN و پاوربانک‌های اورجینال',
    termsUrl: null,
    isActive: true,
  },
  {
    id: 'w-original',
    providerName: 'تضمین اصالت اورجینال فروشگاه امیر',
    durationMonths: 6,
    coverageFa: 'ضمانت اصالت و سلامت فیزیکی کالا در زمان تحویل برای قاب و محافظ صفحه',
    termsUrl: null,
    isActive: true,
  },
];

export const DEFAULT_DEV_ATTRIBUTES: AttributeDefinitionDTO[] = [
  { id: 'attr-screen-size', code: 'screen_size', nameFa: 'اندازه نمایشگر', nameEn: 'Screen Size', dataType: 'number', unit: 'اینچ', isFilterable: true, sortOrder: 1, categoryIds: ['phones', 'flagship-phones', 'tablets'] },
  { id: 'attr-refresh-rate', code: 'refresh_rate', nameFa: 'نرخ نوسازی نمایشگر', nameEn: 'Refresh Rate', dataType: 'number', unit: 'Hz', isFilterable: true, sortOrder: 2, categoryIds: ['phones', 'flagship-phones', 'tablets'] },
  { id: 'attr-chipset', code: 'chipset', nameFa: 'تراشه مرکزی', nameEn: 'Chipset', dataType: 'text', unit: null, isFilterable: true, sortOrder: 3, categoryIds: ['phones', 'flagship-phones', 'tablets'] },
  { id: 'attr-main-cam', code: 'main_camera_mp', nameFa: 'رزولوشن دوربین اصلی', nameEn: 'Main Camera', dataType: 'number', unit: 'مگاپیکسل', isFilterable: true, sortOrder: 4, categoryIds: ['phones', 'flagship-phones'] },
  { id: 'attr-battery', code: 'battery_mah', nameFa: 'ظرفیت باتری', nameEn: 'Battery Capacity', dataType: 'number', unit: 'میلی‌آمپر', isFilterable: true, sortOrder: 5, categoryIds: ['phones', 'flagship-phones'] },
  { id: 'attr-fast-charge', code: 'fast_charge_w', nameFa: 'توان شارژ سریع', nameEn: 'Fast Charging', dataType: 'number', unit: 'وات', isFilterable: true, sortOrder: 6, categoryIds: ['phones', 'flagship-phones', 'chargers'] },
  { id: 'attr-5g', code: 'network_5g', nameFa: 'پشتیبانی از شبکه 5G', nameEn: '5G Support', dataType: 'boolean', unit: null, isFilterable: true, sortOrder: 7, categoryIds: ['phones', 'flagship-phones'] },
  { id: 'attr-sim', code: 'sim_type', nameFa: 'نوع سیم‌کارت', nameEn: 'SIM Configuration', dataType: 'select', unit: null, isFilterable: true, sortOrder: 8, categoryIds: ['phones', 'flagship-phones'] },
  { id: 'attr-os', code: 'os', nameFa: 'سیستم‌عامل', nameEn: 'Operating System', dataType: 'select', unit: null, isFilterable: true, sortOrder: 9, categoryIds: ['phones', 'flagship-phones', 'tablets'] },
  { id: 'attr-ip', code: 'water_resistance', nameFa: 'گواهی مقاومت در برابر آب', nameEn: 'Water Resistance', dataType: 'text', unit: null, isFilterable: false, sortOrder: 10, categoryIds: ['phones', 'flagship-phones', 'smartwatches'] },
];

export const DEFAULT_DEV_WAREHOUSES: WarehouseDTO[] = [
  {
    id: 'wh-thr-central',
    code: 'WH-THR-CENTRAL',
    nameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)',
    city: 'تهران',
    addressFa: 'تهران، خیابان جمهوری، مرکز توزیع اکسپرس موبایل امیر',
    isActive: true,
  },
  {
    id: 'wh-isf-hub',
    code: 'WH-ISF-HUB',
    nameFa: 'انبار منطقه‌ای اصفهان',
    city: 'اصفهان',
    addressFa: 'اصفهان، خیابان فردوسی، مرکز لجستیک موبایل امیر',
    isActive: true,
  },
];

export const DEFAULT_DEV_VARIANTS: ProductVariantDTO[] = [
  // iPhone 16 Pro Max
  {
    id: 'var-16pm-desert-256',
    productId: 'iphone-16-pro-max',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'APL-16PM-256-DSRT-ZAA',
    barcode: '0195949722103',
    partNumber: 'ZA/A',
    colorId: 'desert',
    colorNameFa: 'تیتانیوم کویری (Desert Titanium)',
    colorNameEn: 'Desert Titanium',
    colorHex: '#C5B4A0',
    storage: '۲۵۶ گیگابایت',
    ram: '۸ گیگ',
    simType: 'دو سیم‌کارت فیزیکی (Dual Nano-SIM)',
    priceToman: 94_200_000,
    originalPriceToman: 98_000_000,
    costPriceToman: 88_500_000,
    availableStock: 3,
    isPublished: true,
  },
  {
    id: 'var-16pm-black-256',
    productId: 'iphone-16-pro-max',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'APL-16PM-256-BLK-ZAA',
    barcode: '0195949722110',
    partNumber: 'ZA/A',
    colorId: 'midnight',
    colorNameFa: 'تیتانیوم مشکی (Black Titanium)',
    colorNameEn: 'Black Titanium',
    colorHex: '#2A2B2D',
    storage: '۲۵۶ گیگابایت',
    ram: '۸ گیگ',
    simType: 'دو سیم‌کارت فیزیکی (Dual Nano-SIM)',
    priceToman: 94_200_000,
    originalPriceToman: 98_000_000,
    costPriceToman: 88_500_000,
    availableStock: 2,
    isPublished: true,
  },
  {
    id: 'var-16pm-desert-512',
    productId: 'iphone-16-pro-max',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'APL-16PM-512-DSRT-ZAA',
    barcode: '0195949722127',
    partNumber: 'ZA/A',
    colorId: 'desert',
    colorNameFa: 'تیتانیوم کویری (Desert Titanium)',
    colorNameEn: 'Desert Titanium',
    colorHex: '#C5B4A0',
    storage: '۵۱۲ گیگابایت',
    ram: '۸ گیگ',
    simType: 'دو سیم‌کارت فیزیکی (Dual Nano-SIM)',
    priceToman: 106_500_000,
    originalPriceToman: 110_300_000,
    costPriceToman: 100_200_000,
    availableStock: 2,
    isPublished: true,
  },
  {
    id: 'var-16pm-natural-1tb',
    productId: 'iphone-16-pro-max',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'APL-16PM-1TB-NAT-ZAA',
    barcode: '0195949722134',
    partNumber: 'ZA/A',
    colorId: 'titanium',
    colorNameFa: 'تیتانیوم طبیعی (Natural Titanium)',
    colorNameEn: 'Natural Titanium',
    colorHex: '#8E8B82',
    storage: '۱ ترابایت',
    ram: '۸ گیگ',
    simType: 'دو سیم‌کارت فیزیکی (Dual Nano-SIM)',
    priceToman: 119_800_000,
    originalPriceToman: 123_600_000,
    costPriceToman: 112_900_000,
    availableStock: 1,
    isPublished: true,
  },
  // Galaxy S24 Ultra
  {
    id: 'var-s24u-gray-256',
    productId: 'galaxy-s24-ultra',
    warrantyId: 'w-hamahang-18',
    warrantyName: 'هماهنگ (۱۸ ماهه رسمی)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی هماهنگ با پوشش قطعات اصلی و رجیستری قانونی همتا',
    sku: 'SAM-S24U-256-GRY-VN',
    barcode: '8806095306780',
    partNumber: 'Vietnam · SM-S928B',
    colorId: 'titanium',
    colorNameFa: 'خاکستری تیتانیوم',
    colorNameEn: 'Titanium Gray',
    colorHex: '#9c9589',
    storage: '۲۵۶ گیگابایت',
    ram: '۱۲ گیگ',
    simType: 'دو سیم‌کارت + eSIM',
    priceToman: 63_800_000,
    originalPriceToman: 68_500_000,
    costPriceToman: 59_100_000,
    availableStock: 2,
    isPublished: true,
  },
  {
    id: 'var-s24u-black-512',
    productId: 'galaxy-s24-ultra',
    warrantyId: 'w-hamahang-18',
    warrantyName: 'هماهنگ (۱۸ ماهه رسمی)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی هماهنگ با پوشش قطعات اصلی و رجیستری قانونی همتا',
    sku: 'SAM-S24U-512-BLK-VN',
    barcode: '8806095306797',
    partNumber: 'Vietnam · SM-S928B',
    colorId: 'midnight',
    colorNameFa: 'مشکی تیتانیوم',
    colorNameEn: 'Titanium Black',
    colorHex: '#1e293b',
    storage: '۵۱۲ گیگابایت',
    ram: '۱۲ گیگ',
    simType: 'دو سیم‌کارت + eSIM',
    priceToman: 71_200_000,
    originalPriceToman: 75_900_000,
    costPriceToman: 66_400_000,
    availableStock: 1,
    isPublished: true,
  },
  // Huawei Pura 70 Ultra
  {
    id: 'var-pura70u-white-512',
    productId: 'huawei-pura-70-ultra',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'HUA-P70U-512-WHT-GLB',
    barcode: '6942103121104',
    partNumber: 'Global · HBP-LX9',
    colorId: 'silver',
    colorNameFa: 'سفید مرواریدی',
    colorNameEn: 'Pearl White',
    colorHex: '#f1f5f9',
    storage: '۵۱۲ گیگابایت',
    ram: '۱۶ گیگ',
    simType: 'دو سیم‌کارت 5G',
    priceToman: 61_500_000,
    originalPriceToman: 65_000_000,
    costPriceToman: 56_800_000,
    availableStock: 4,
    isPublished: true,
  },
  // Xiaomi 14 Ultra
  {
    id: 'var-x14u-black-512',
    productId: 'xiaomi-14-ultra',
    warrantyId: 'w-tesco-18',
    warrantyName: 'تسکو / حامی (۱۸ ماهه)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی قطعات و خدمات تخصصی شیائومی و لوازم جانبی',
    sku: 'XIA-14U-512-BLK-GLB',
    barcode: '6941812771020',
    partNumber: 'Global · 24030PN60G',
    colorId: 'midnight',
    colorNameFa: 'مشکی چرمی',
    colorNameEn: 'Black Vegan Leather',
    colorHex: '#1f2937',
    storage: '۵۱۲ گیگابایت',
    ram: '۱۶ گیگ',
    simType: 'دو سیم‌کارت 5G',
    priceToman: 57_900_000,
    originalPriceToman: 61_500_000,
    costPriceToman: 53_200_000,
    availableStock: 4,
    isPublished: true,
  },
  // iPhone 15 Pro
  {
    id: 'var-15p-natural-256',
    productId: 'iphone-15-pro',
    warrantyId: 'w-amir-18',
    warrantyName: 'امیر سرویس (۱۸ ماهه جامع + کد همتا)',
    warrantyDurationMonths: 18,
    warrantyCoverageFa: '۱۸ ماه گارانتی رسمی شرکتی + تضمین اصالت و کد رجیستری سامانه همتا + ۷ روز ضمانت تعویض سخت‌افزاری',
    sku: 'APL-15P-256-NAT-ZAA',
    barcode: '0195949019807',
    partNumber: 'ZA/A',
    colorId: 'titanium',
    colorNameFa: 'تیتانیوم طبیعی',
    colorNameEn: 'Natural Titanium',
    colorHex: '#9c9589',
    storage: '۲۵۶ گیگابایت',
    ram: '۸ گیگ',
    simType: 'دو سیم‌کارت فیزیکی (Dual Nano-SIM)',
    priceToman: 78_500_000,
    originalPriceToman: 82_000_000,
    costPriceToman: 73_900_000,
    availableStock: 6,
    isPublished: true,
  },
];

export const DEFAULT_DEV_WAREHOUSE_STOCK: WarehouseStockDTO[] = [
  { id: 'ws-1', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-16pm-desert-256', productId: 'iphone-16-pro-max', sku: 'APL-16PM-256-DSRT-ZAA', shelfLocation: 'A-01-01', quantityOnHand: 3, reservedQty: 0, availableQty: 3, minStockAlert: 2, isLowStock: false },
  { id: 'ws-2', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-16pm-black-256', productId: 'iphone-16-pro-max', sku: 'APL-16PM-256-BLK-ZAA', shelfLocation: 'A-01-02', quantityOnHand: 2, reservedQty: 0, availableQty: 2, minStockAlert: 2, isLowStock: true },
  { id: 'ws-3', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-16pm-desert-512', productId: 'iphone-16-pro-max', sku: 'APL-16PM-512-DSRT-ZAA', shelfLocation: 'A-01-03', quantityOnHand: 2, reservedQty: 0, availableQty: 2, minStockAlert: 1, isLowStock: false },
  { id: 'ws-4', warehouseId: 'wh-isf-hub', warehouseCode: 'WH-ISF-HUB', warehouseNameFa: 'انبار منطقه‌ای اصفهان', variantId: 'var-16pm-natural-1tb', productId: 'iphone-16-pro-max', sku: 'APL-16PM-1TB-NAT-ZAA', shelfLocation: 'B-02-01', quantityOnHand: 1, reservedQty: 0, availableQty: 1, minStockAlert: 1, isLowStock: true },
  { id: 'ws-5', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-s24u-gray-256', productId: 'galaxy-s24-ultra', sku: 'SAM-S24U-256-GRY-VN', shelfLocation: 'A-02-01', quantityOnHand: 2, reservedQty: 0, availableQty: 2, minStockAlert: 2, isLowStock: true },
  { id: 'ws-6', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-s24u-black-512', productId: 'galaxy-s24-ultra', sku: 'SAM-S24U-512-BLK-VN', shelfLocation: 'A-02-02', quantityOnHand: 1, reservedQty: 0, availableQty: 1, minStockAlert: 1, isLowStock: true },
  { id: 'ws-7', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-pura70u-white-512', productId: 'huawei-pura-70-ultra', sku: 'HUA-P70U-512-WHT-GLB', shelfLocation: 'A-03-01', quantityOnHand: 4, reservedQty: 0, availableQty: 4, minStockAlert: 2, isLowStock: false },
  { id: 'ws-8', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-x14u-black-512', productId: 'xiaomi-14-ultra', sku: 'XIA-14U-512-BLK-GLB', shelfLocation: 'A-03-02', quantityOnHand: 4, reservedQty: 0, availableQty: 4, minStockAlert: 2, isLowStock: false },
  { id: 'ws-9', warehouseId: 'wh-thr-central', warehouseCode: 'WH-THR-CENTRAL', warehouseNameFa: 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', variantId: 'var-15p-natural-256', productId: 'iphone-15-pro', sku: 'APL-15P-256-NAT-ZAA', shelfLocation: 'A-01-05', quantityOnHand: 6, reservedQty: 0, availableQty: 6, minStockAlert: 2, isLowStock: false },
];

export const DEFAULT_DEV_PRODUCT_ATTRIBUTES: Record<
  string,
  Array<{ code: string; valueText?: string | null; valueNumber?: number | null; valueBoolean?: boolean | null }>
> = {
  'iphone-16-pro-max': [
    { code: 'screen_size', valueNumber: 6.9 },
    { code: 'refresh_rate', valueNumber: 120 },
    { code: 'chipset', valueText: 'Apple A18 Pro (3nm)' },
    { code: 'main_camera_mp', valueNumber: 48 },
    { code: 'battery_mah', valueNumber: 4685 },
    { code: 'fast_charge_w', valueNumber: 45 },
    { code: 'network_5g', valueBoolean: true },
    { code: 'sim_type', valueText: 'دو سیم‌کارت فیزیکی (ZA/A)' },
    { code: 'os', valueText: 'iOS 18' },
    { code: 'water_resistance', valueText: 'IP68 (عمق ۶ متر تا ۳۰ دقیقه)' },
  ],
  'galaxy-s24-ultra': [
    { code: 'screen_size', valueNumber: 6.8 },
    { code: 'refresh_rate', valueNumber: 120 },
    { code: 'chipset', valueText: 'Snapdragon 8 Gen 3 for Galaxy' },
    { code: 'main_camera_mp', valueNumber: 200 },
    { code: 'battery_mah', valueNumber: 5000 },
    { code: 'fast_charge_w', valueNumber: 45 },
    { code: 'network_5g', valueBoolean: true },
    { code: 'sim_type', valueText: 'دو سیم‌کارت + eSIM' },
    { code: 'os', valueText: 'Android 14 · One UI 6.1' },
    { code: 'water_resistance', valueText: 'IP68' },
  ],
  'huawei-pura-70-ultra': [
    { code: 'screen_size', valueNumber: 6.8 },
    { code: 'refresh_rate', valueNumber: 120 },
    { code: 'chipset', valueText: 'Kirin 9010' },
    { code: 'main_camera_mp', valueNumber: 50 },
    { code: 'battery_mah', valueNumber: 5200 },
    { code: 'fast_charge_w', valueNumber: 100 },
    { code: 'network_5g', valueBoolean: true },
    { code: 'sim_type', valueText: 'دو سیم‌کارت 5G' },
    { code: 'os', valueText: 'EMUI 14.2 گلوبال' },
    { code: 'water_resistance', valueText: 'IP68' },
  ],
  'xiaomi-14-ultra': [
    { code: 'screen_size', valueNumber: 6.73 },
    { code: 'refresh_rate', valueNumber: 120 },
    { code: 'chipset', valueText: 'Snapdragon 8 Gen 3' },
    { code: 'main_camera_mp', valueNumber: 50 },
    { code: 'battery_mah', valueNumber: 5000 },
    { code: 'fast_charge_w', valueNumber: 90 },
    { code: 'network_5g', valueBoolean: true },
    { code: 'sim_type', valueText: 'دو سیم‌کارت 5G' },
    { code: 'os', valueText: 'HyperOS' },
    { code: 'water_resistance', valueText: 'IP68' },
  ],
  'iphone-15-pro': [
    { code: 'screen_size', valueNumber: 6.1 },
    { code: 'refresh_rate', valueNumber: 120 },
    { code: 'chipset', valueText: 'Apple A17 Pro (3nm)' },
    { code: 'main_camera_mp', valueNumber: 48 },
    { code: 'battery_mah', valueNumber: 3274 },
    { code: 'fast_charge_w', valueNumber: 27 },
    { code: 'network_5g', valueBoolean: true },
    { code: 'sim_type', valueText: 'دو سیم‌کارت فیزیکی (ZA/A)' },
    { code: 'os', valueText: 'iOS 18' },
    { code: 'water_resistance', valueText: 'IP68' },
  ],
};

export function stripPrivateVariantFields(v: ProductVariantDTO): PublicProductVariantDTO {
  const { costPriceToman: _omitted, ...publicVariant } = v;
  return publicVariant;
}

export function formatAttributeDisplayValue(
  attr: Pick<AttributeDefinitionDTO, 'dataType' | 'unit'>,
  val: { valueText?: string | null; valueNumber?: number | null; valueBoolean?: boolean | null }
): string {
  if (attr.dataType === 'boolean' && typeof val.valueBoolean === 'boolean') {
    return val.valueBoolean ? 'دارد' : 'ندارد';
  }
  if (attr.dataType === 'number' && typeof val.valueNumber === 'number' && Number.isFinite(val.valueNumber)) {
    const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(val.valueNumber);
    return attr.unit ? `${formatted} ${attr.unit}` : formatted;
  }
  const text = String(val.valueText ?? '').trim();
  if (text) {
    return attr.unit && !text.includes(attr.unit) ? `${text} ${attr.unit}` : text;
  }
  if (typeof val.valueNumber === 'number' && Number.isFinite(val.valueNumber)) {
    const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(val.valueNumber);
    return attr.unit ? `${formatted} ${attr.unit}` : formatted;
  }
  if (typeof val.valueBoolean === 'boolean') {
    return val.valueBoolean ? 'دارد' : 'ندارد';
  }
  return '—';
}

export function applyStockMovementDelta(
  currentOnHand: number,
  reservedQty: number,
  quantityChange: number
): { ok: true; balanceAfter: number } | { ok: false; statusCode: number; error: string } {
  const delta = Math.trunc(Number(quantityChange));
  if (!Number.isFinite(delta) || delta === 0) {
    return {
      ok: false,
      statusCode: 400,
      error: 'مقدار تغییر موجودی (quantityChange) باید عدد صحیح غیرصفر باشد.',
    };
  }
  const safeCurrent = Math.max(0, Math.trunc(Number(currentOnHand) || 0));
  const safeReserved = Math.max(0, Math.trunc(Number(reservedQty) || 0));
  const balanceAfter = safeCurrent + delta;
  if (balanceAfter < 0) {
    return {
      ok: false,
      statusCode: 409,
      error: `موجودی انبار کافی نیست (موجودی فعلی: ${safeCurrent} عدد، تغییر درخواستی: ${delta}).`,
    };
  }
  if (balanceAfter < safeReserved) {
    return {
      ok: false,
      statusCode: 409,
      error: `موجودی پس از کسر (${balanceAfter}) نمی‌تواند کمتر از تعداد رزروشده (${safeReserved}) باشد.`,
    };
  }
  return { ok: true, balanceAfter };
}

export function toEnglishDigitsServer(input: unknown): string {
  return String(input ?? '')
    .replace(/[۰-۹]/g, (ch) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)))
    .replace(/[٠-٩]/g, (ch) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
}

export function normalizeRole(raw: unknown): UserRole {
  return String(raw ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer';
}

export function normalizeOrderStatus(raw: unknown): OrderStatus {
  const s = String(raw ?? '').trim().toLowerCase();
  if (
    s === 'pending_payment' ||
    s === 'paid' ||
    s === 'preparing' ||
    s === 'shipped' ||
    s === 'delivered' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return 'pending_payment';
}

export function normalizePaymentStatus(raw: unknown): PaymentStatus {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'unpaid' || s === 'pending_gateway' || s === 'paid' || s === 'not_required') {
    return s;
  }
  return 'unpaid';
}

export function normalizePhone(raw: unknown): string {
  return toEnglishDigitsServer(raw).replace(/[\s\-().]/g, '').trim();
}

const PERSIAN_SEARCH_ALIASES: Record<string, string> = {
  آیفون: 'iphone',
  ایفون: 'iphone',
  اپل: 'apple',
  آیپد: 'ipad',
  ایپد: 'ipad',
  ایرپاد: 'airpods',
  واچ: 'watch',
  سامسونگ: 'samsung',
  گلکسی: 'galaxy',
  شیائومی: 'xiaomi',
  شیامی: 'xiaomi',
  هواوی: 'huawei',
  هوآوی: 'huawei',
  پورا: 'pura',
  میت: 'mate',
  انر: 'honor',
  آنر: 'honor',
  موتورولا: 'motorola',
  انکر: 'anker',
  اولترا: 'ultra',
  پرو: 'pro',
  مکس: 'max',
  پرومکس: 'pro max',
  پرمکس: 'pro max',
  پاوربانک: 'power bank',
  شارژر: 'charger',
};

function levenshteinDistanceServer(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) dp[j] = j;
  for (let i = 1; i <= m; i += 1) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[n];
}

function fuzzyWordMatchServer(token: string, haystack: string, words: string[]): boolean {
  if (haystack.includes(token)) return true;
  const alias = PERSIAN_SEARCH_ALIASES[token];
  if (alias && haystack.includes(alias)) return true;

  const candidates = [token, ...(alias ? alias.split(/\s+/) : [])];
  for (const cand of candidates) {
    if (cand.length < 3) continue;
    const maxDist = cand.length <= 4 ? 1 : 2;
    for (const w of words) {
      if (Math.abs(w.length - cand.length) > maxDist) continue;
      if (levenshteinDistanceServer(cand, w) <= maxDist) return true;
    }
  }
  return false;
}

export function getDescendantCategoryIdsServer(
  categories: CategoryDTO[],
  targetSlugOrId: string
): Set<string> {
  const clean = targetSlugOrId.trim().toLowerCase();
  const result = new Set<string>([clean]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      const idLow = c.id.toLowerCase();
      const slugLow = c.slug.toLowerCase();
      const parentLow = c.parentId ? c.parentId.toLowerCase() : '';
      if (parentLow && result.has(parentLow)) {
        if (!result.has(idLow)) {
          result.add(idLow);
          added = true;
        }
        if (!result.has(slugLow)) {
          result.add(slugLow);
          added = true;
        }
      }
    }
  }
  return result;
}

function parseTimestampMsServer(raw?: string): number {
  if (!raw) return NaN;
  const normalized = raw
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
    .replace(/(\.\d{3})\d+/, '$1')
    .replace(/([+-]\d{2})$/, '$1:00');
  const ms = Date.parse(normalized);
  return Number.isFinite(ms) ? ms : NaN;
}

function compareNewestProductsServer(a: ProductDTO, b: ProductDTO): number {
  const timeA = parseTimestampMsServer(a.createdAt);
  const timeB = parseTimestampMsServer(b.createdAt);
  const hasA = Number.isFinite(timeA);
  const hasB = Number.isFinite(timeB);
  if (hasA && !hasB) return -1;
  if (!hasA && hasB) return 1;
  if (hasA && hasB && Math.abs(timeB - timeA) > 60_000) {
    return timeB - timeA;
  }
  return a.releaseOrder - b.releaseOrder;
}

export interface ProductQueryParams {
  category?: string;
  q?: string;
  brand?: string;
  inStock?: boolean;
  discounted?: boolean;
  express?: boolean;
  minPrice?: number;
  maxPrice?: number;
  storage?: string;
  ram?: string;
  colorId?: string;
  attributes?: Record<string, string>;
  productAttributesMap?: Map<string, ProductAttributeValueDTO[]>;
  sort?: string;
  categories?: CategoryDTO[];
}

function matchesServerAttributeFilter(
  productAttrs: ProductAttributeValueDTO[] | undefined,
  code: string,
  expectedRaw: string
): boolean {
  const expected = toEnglishDigitsServer(expectedRaw).trim().toLowerCase();
  if (!expected) return true;
  if (!productAttrs || productAttrs.length === 0) return false;
  const match = productAttrs.find((a) => a.code.toLowerCase() === code.toLowerCase());
  if (!match) return false;
  const candidates = [
    match.displayValue,
    match.valueText ?? '',
    match.valueNumber !== null && match.valueNumber !== undefined ? String(match.valueNumber) : '',
    typeof match.valueBoolean === 'boolean'
      ? match.valueBoolean
        ? 'true دارد بله'
        : 'false ندارد خیر'
      : '',
  ]
    .map((v) => toEnglishDigitsServer(String(v)).trim().toLowerCase())
    .filter(Boolean);
  return candidates.some((c) => c === expected || c.includes(expected));
}

function normalizeCapacityKeyServer(raw?: string | null): string {
  return toEnglishDigitsServer(String(raw || ''))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s\u200c]+/g, '')
    .toLowerCase()
    .replace(/گیگابایت/g, 'gb')
    .replace(/گیگ/g, 'gb')
    .replace(/ترابایت/g, 'tb');
}

function normalizeColorKeyServer(raw?: string | null): string {
  return String(raw || '')
    .split('(')[0]
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s\u200c]+/g, '')
    .trim()
    .toLowerCase();
}

export function filterAndSortProducts(
  products: ProductDTO[],
  query: ProductQueryParams = {}
): ProductDTO[] {
  const category = (query.category || 'all').trim().toLowerCase();
  const allowedCategories =
    category && category !== 'all' && category !== 'offers'
      ? getDescendantCategoryIdsServer(query.categories ?? DEFAULT_DEV_CATEGORIES, category)
      : null;
  const searchRaw = toEnglishDigitsServer(query.q || '').trim().toLowerCase();
  const brandFilter = (query.brand || '')
    .split(',')
    .map((b) => b.trim().toLowerCase())
    .filter(Boolean);
  const storageFilter = query.storage ? normalizeCapacityKeyServer(query.storage) : '';
  const ramFilter = query.ram ? normalizeCapacityKeyServer(query.ram) : '';
  const colorFilter = query.colorId ? query.colorId.trim().toLowerCase() : '';
  const colorFilterNorm = query.colorId ? normalizeColorKeyServer(query.colorId) : '';
  const attrEntries = query.attributes
    ? Object.entries(query.attributes).filter(([, val]) => String(val || '').trim().length > 0)
    : [];

  const filtered = products.filter((p) => {
    const prodCategory = String(p.category || '').trim().toLowerCase();
    if (category === 'offers') {
      if (!p.discountPercent || p.discountPercent <= 0) return false;
    } else if (allowedCategories && !allowedCategories.has(prodCategory)) {
      return false;
    }

    if (brandFilter.length > 0 && !brandFilter.includes(String(p.brand || '').trim().toLowerCase())) {
      return false;
    }

    if (query.inStock && (!p.inStock || p.stockCount <= 0)) {
      return false;
    }

    if (query.discounted && (!p.discountPercent || p.discountPercent <= 0)) {
      return false;
    }

    if (query.express && !p.expressDelivery) {
      return false;
    }

    if (typeof query.minPrice === 'number' && Number.isFinite(query.minPrice) && p.price < query.minPrice) {
      return false;
    }

    if (typeof query.maxPrice === 'number' && Number.isFinite(query.maxPrice) && p.price > query.maxPrice) {
      return false;
    }

    if (storageFilter) {
      const defStorage = normalizeCapacityKeyServer(p.specs.storageDefault);
      const optMatch = (p.storageOptions || []).some(
        (s) => normalizeCapacityKeyServer(s.label) === storageFilter
      );
      if (defStorage !== storageFilter && !optMatch) {
        return false;
      }
    }

    if (ramFilter) {
      const prodRam = normalizeCapacityKeyServer(p.specs.ram);
      if (prodRam !== ramFilter) {
        return false;
      }
    }

    if (colorFilter) {
      const hasColor = (p.colors || []).some(
        (c) =>
          c.id.toLowerCase() === colorFilter ||
          c.hex.toLowerCase() === colorFilter ||
          c.name.toLowerCase() === colorFilter ||
          (colorFilterNorm.length > 0 && normalizeColorKeyServer(c.name) === colorFilterNorm)
      );
      if (!hasColor) return false;
    }

    if (attrEntries.length > 0) {
      const prodAttrs = p.attributeValues ?? query.productAttributesMap?.get(p.id);
      for (const [code, val] of attrEntries) {
        if (!matchesServerAttributeFilter(prodAttrs, code, val)) {
          return false;
        }
      }
    }

    if (searchRaw) {
      const customText = (p.customSpecs || []).map((s) => `${s.label} ${s.value}`).join(' ');
      const haystack = toEnglishDigitsServer(
        `${p.nameFa} ${p.nameEn} ${p.slug} ${p.brand} ${p.category} ${p.specs.chipset} ${p.specs.storageDefault} ${customText}`
      ).toLowerCase();
      if (!haystack.includes(searchRaw)) {
        const words = haystack.split(/[\s\-_/.,·،()]+/).filter(Boolean);
        const tokens = searchRaw.split(/\s+/).filter(Boolean);
        const allMatch = tokens.every((token) => fuzzyWordMatchServer(token, haystack, words));
        if (!allMatch) return false;
      }
    }

    return true;
  });

  const stockOrder = (p: ProductDTO) => (p.inStock && p.stockCount > 0 ? 0 : 1);
  const discountMagnitude = (p: ProductDTO) => {
    const pct = p.discountPercent ?? 0;
    if (pct > 0) return pct;
    if (p.originalPrice && p.originalPrice > p.price) {
      return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    }
    return 0;
  };

  const sorted = [...filtered];
  switch (query.sort) {
    case 'cheapest':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'expensive':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'bestselling':
      sorted.sort((a, b) => stockOrder(a) - stockOrder(b) || a.salesRank - b.salesRank);
      break;
    case 'popular':
      sorted.sort(
        (a, b) => stockOrder(a) - stockOrder(b) || b.rating - a.rating || b.reviewCount - a.reviewCount
      );
      break;
    case 'biggest_discount':
      sorted.sort(
        (a, b) =>
          stockOrder(a) - stockOrder(b) ||
          discountMagnitude(b) - discountMagnitude(a) ||
          compareNewestProductsServer(a, b)
      );
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => stockOrder(a) - stockOrder(b) || compareNewestProductsServer(a, b));
      break;
  }

  return sorted;
}

function normalizeColorLabelServer(raw?: string | null): string {
  return String(raw || '')
    .split('(')[0]
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCatalogFacetsServer(products: ProductDTO[]): CatalogFacetsDTO {
  const brandCounts = new Map<string, { name: string; count: number }>();
  const colorCounts = new Map<string, CatalogFacetColorDTO>();
  const storageMap = new Map<string, { label: string; gbScore: number }>();
  const ramMap = new Map<string, { label: string; gbScore: number }>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    if (Number.isFinite(p.price) && p.price > 0) {
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }

    const brandName = String(p.brand || '').trim();
    if (brandName) {
      const key = brandName.toLowerCase();
      const prev = brandCounts.get(key);
      if (prev) prev.count += 1;
      else brandCounts.set(key, { name: brandName, count: 1 });
    }

    const seenColors = new Set<string>();
    for (const c of p.colors || []) {
      const cleanLabel = normalizeColorLabelServer(c.name) || String(c.id || c.hex || '').trim();
      const key = normalizeColorKeyServer(c.name) || String(c.id || c.hex || '').trim().toLowerCase();
      if (!key || seenColors.has(key)) continue;
      seenColors.add(key);
      const prev = colorCounts.get(key);
      if (prev) prev.count += 1;
      else {
        colorCounts.set(key, {
          id: String(c.id || key).trim(),
          label: cleanLabel,
          hex: c.hex || '#1e293b',
          count: 1,
        });
      }
    }

    const registerStorage = (raw?: string | null) => {
      const label = String(raw || '').trim();
      if (!label || label === 'ندارد' || label === '-' || label === '—') return;
      if (!/(گیگ|ترابایت|gb|tb)/i.test(label)) return;
      const norm = normalizeCapacityKeyServer(label);
      const numMatch = toEnglishDigitsServer(label).match(/(\d+(?:\.\d+)?)/);
      let score = numMatch ? Number(numMatch[1]) : 0;
      if (/ترابایت|tb/i.test(label)) score *= 1024;
      const prev = storageMap.get(norm);
      if (!prev) storageMap.set(norm, { label, gbScore: score });
      else if (/گیگابایت|ترابایت/.test(label) && !/گیگابایت|ترابایت/.test(prev.label)) {
        storageMap.set(norm, { label, gbScore: score });
      }
    };
    registerStorage(p.specs?.storageDefault);
    for (const s of p.storageOptions || []) registerStorage(s.label);
    for (const v of p.variants || []) registerStorage(v.storage);

    const registerRam = (raw?: string | null) => {
      const label = String(raw || '').trim();
      if (!label || label === 'ندارد' || label === '-' || label === '—') return;
      if (!/(گیگ|gb)/i.test(label)) return;
      const norm = normalizeCapacityKeyServer(label);
      const numMatch = toEnglishDigitsServer(label).match(/(\d+(?:\.\d+)?)/);
      const score = numMatch ? Number(numMatch[1]) : 0;
      const prev = ramMap.get(norm);
      if (!prev) ramMap.set(norm, { label, gbScore: score });
      else if (/گیگابایت/.test(label) && !/گیگابایت/.test(prev.label)) {
        ramMap.set(norm, { label, gbScore: score });
      }
    };
    registerRam(p.specs?.ram);
    for (const v of p.variants || []) registerRam(v.ram);
  }

  return {
    brands: [...brandCounts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    colors: [...colorCounts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fa')),
    storages: [...storageMap.values()]
      .sort((a, b) => a.gbScore - b.gbScore || a.label.localeCompare(b.label, 'fa'))
      .map((x) => x.label),
    rams: [...ramMap.values()]
      .sort((a, b) => a.gbScore - b.gbScore || a.label.localeCompare(b.label, 'fa'))
      .map((x) => x.label),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
  };
}

export interface CouponEvaluationContext {
  now?: Date;
  userRedemptionCountByCode?: Record<string, number>;
}

export function evaluateCouponServer(
  codeRaw: string,
  netSubtotal: number,
  rules: CouponRuleDTO[] = DEFAULT_DEV_COUPONS,
  ctx?: CouponEvaluationContext
): {
  valid: boolean;
  code: string | null;
  discountAmount: number;
  message: string;
} {
  let code = toEnglishDigitsServer(codeRaw).trim().toUpperCase();
  if (code === 'CNA-OFF' || code === 'تخفیف') {
    code = 'AMIR-OFF';
  }
  if (!code) {
    return { valid: false, code: null, discountAmount: 0, message: 'لطفاً کد تخفیف را وارد نمایید.' };
  }
  if (netSubtotal <= 0) {
    return { valid: false, code: null, discountAmount: 0, message: 'سبد خرید شما خالی است.' };
  }
  const rule = rules.find((r) => r.isActive !== false && r.code.toUpperCase() === code);
  if (!rule) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: 'کد تخفیف وارد شده معتبر نیست یا غیرفعال شده است.',
    };
  }

  const nowMs = (ctx?.now ?? new Date()).getTime();
  if (rule.startsAt) {
    const startMs = Date.parse(rule.startsAt);
    if (Number.isFinite(startMs) && nowMs < startMs) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: `مهلت استفاده از کد تخفیف ${rule.code} هنوز آغاز نشده است.`,
      };
    }
  }
  if (rule.expiresAt) {
    const endMs = Date.parse(rule.expiresAt);
    if (Number.isFinite(endMs) && nowMs > endMs) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: `مهلت استفاده از کد تخفیف ${rule.code} به پایان رسیده است.`,
      };
    }
  }
  if (
    typeof rule.usageLimit === 'number' &&
    Number.isFinite(rule.usageLimit) &&
    rule.usageLimit >= 0 &&
    Number(rule.usedCount ?? 0) >= rule.usageLimit
  ) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: `سقف مجاز استفاده از کد تخفیف ${rule.code} تکمیل شده است.`,
    };
  }
  if (
    typeof rule.perUserLimit === 'number' &&
    Number.isFinite(rule.perUserLimit) &&
    rule.perUserLimit >= 0
  ) {
    const usedByUser = Number(ctx?.userRedemptionCountByCode?.[rule.code.toUpperCase()] ?? 0);
    if (usedByUser >= rule.perUserLimit) {
      return {
        valid: false,
        code: null,
        discountAmount: 0,
        message: `شما پیش‌تر به حداکثر دفعات مجاز از کد تخفیف ${rule.code} استفاده کرده‌اید.`,
      };
    }
  }

  if (rule.minOrderAmount && netSubtotal < rule.minOrderAmount) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: `حداقل مبلغ سفارش برای کد ${rule.code} برابر ${rule.minOrderAmount.toLocaleString('en-US')} تومان است.`,
    };
  }
  let discountAmount =
    rule.discountType === 'fixed'
      ? rule.discountValue
      : Math.round((netSubtotal * rule.discountValue) / 100);
  if (rule.maxDiscount && rule.maxDiscount > 0) {
    discountAmount = Math.min(rule.maxDiscount, discountAmount);
  }
  discountAmount = Math.min(netSubtotal, Math.max(0, discountAmount));
  return {
    valid: true,
    code: rule.code,
    discountAmount,
    message: `کد تخفیف ${rule.code} اعمال شد.`,
  };
}

export interface OrderItemInput {
  key?: unknown;
  productId?: unknown;
  slug?: unknown;
  variantId?: unknown;
  sku?: unknown;
  colorName?: unknown;
  colorHex?: unknown;
  storageLabel?: unknown;
  warranty?: unknown;
  qty?: unknown;
}

export interface ComputedOrderItem {
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

export function calculateOrderTotalsServer(params: {
  items: OrderItemInput[];
  products: ProductDTO[];
  couponCode?: string | null;
  couponRules?: CouponRuleDTO[];
  couponContext?: CouponEvaluationContext;
  strictCouponValidation?: boolean;
  freeShippingThreshold?: number;
  city?: string;
  deliverySlot?: 'express' | 'standard';
}):
  | {
      ok: true;
      items: ComputedOrderItem[];
      couponCode: string | null;
      deliverySlot: 'express' | 'standard';
      subtotal: number;
      productDiscount: number;
      couponDiscount: number;
      shippingCost: number;
      totalAmount: number;
      stockDecrements: Array<{ productId: string; variantId?: string; qty: number }>;
    }
  | { ok: false; statusCode: number; error: string } {
  if (!Array.isArray(params.items) || params.items.length === 0) {
    return { ok: false, statusCode: 400, error: 'سبد خرید نمی‌تواند خالی باشد.' };
  }

  const byId = new Map<string, ProductDTO>();
  const bySlug = new Map<string, ProductDTO>();
  for (const p of params.products) {
    byId.set(p.id, p);
    bySlug.set(p.slug, p);
  }

  const requestedQtyPerProduct = new Map<string, number>();
  const requestedQtyPerVariant = new Map<string, { productId: string; variantId: string; qty: number }>();
  const computedItems: ComputedOrderItem[] = [];

  for (const rawItem of params.items) {
    const prodId = String(rawItem?.productId || '').trim();
    const slug = String(rawItem?.slug || '').trim();
    const product = byId.get(prodId) || bySlug.get(slug);
    if (!product) {
      return {
        ok: false,
        statusCode: 400,
        error: `محصول مورد نظر (${prodId || slug || 'نامشخص'}) در کاتالوگ فروشگاه یافت نشد.`,
      };
    }

    const qty = Math.floor(Number(rawItem?.qty || 0));
    if (!Number.isFinite(qty) || qty < 1 || qty > 50) {
      return { ok: false, statusCode: 400, error: 'تعداد سفارش هر کالا باید بین ۱ تا ۵۰ عدد باشد.' };
    }

    const rawVariantId = String(rawItem?.variantId || '').trim();
    const rawSku = String(rawItem?.sku || '').trim().toUpperCase();
    const matchedProductVariant = (product.variants || []).find(
      (v) =>
        v.isPublished !== false &&
        ((rawVariantId && v.id === rawVariantId) || (rawSku && v.sku.toUpperCase() === rawSku))
    );

    if (matchedProductVariant) {
      const prevVar = requestedQtyPerVariant.get(matchedProductVariant.id);
      const nextVarQty = (prevVar?.qty || 0) + qty;
      requestedQtyPerVariant.set(matchedProductVariant.id, {
        productId: product.id,
        variantId: matchedProductVariant.id,
        qty: nextVarQty,
      });

      if (
        typeof matchedProductVariant.availableStock === 'number' &&
        matchedProductVariant.availableStock < nextVarQty
      ) {
        return {
          ok: false,
          statusCode: 409,
          error: `موجودی تنوع «${matchedProductVariant.sku}» کافی نیست (موجودی فعلی: ${matchedProductVariant.availableStock} عدد).`,
        };
      }
    }

    const totalForProduct = (requestedQtyPerProduct.get(product.id) || 0) + qty;
    requestedQtyPerProduct.set(product.id, totalForProduct);

    if (!matchedProductVariant && (!product.inStock || product.stockCount < totalForProduct)) {
      return {
        ok: false,
        statusCode: 409,
        error: `موجودی کالای «${product.nameFa}» کافی نیست (موجودی فعلی: ${product.stockCount} عدد).`,
      };
    }

    const storageLabel =
      matchedProductVariant?.storage ||
      String(rawItem?.storageLabel || '').trim() ||
      product.storageOptions[0]?.label ||
      product.specs.storageDefault;
    const storageOpt = product.storageOptions.find((v) => v.label === storageLabel);
    const delta = storageOpt ? storageOpt.priceDelta : 0;

    const unitPrice = matchedProductVariant
      ? Math.max(0, matchedProductVariant.priceToman)
      : Math.max(0, product.price + delta);
    const originalUnitPrice = matchedProductVariant
      ? Math.max(unitPrice, matchedProductVariant.originalPriceToman ?? matchedProductVariant.priceToman)
      : Math.max(unitPrice, (product.originalPrice ?? product.price) + delta);

    const colorName =
      matchedProductVariant?.colorNameFa ||
      String(rawItem?.colorName || '').trim() ||
      product.colors[0]?.name ||
      product.colorLabel;
    const matchedColor = product.colors.find((c) => c.name === colorName) || product.colors[0];
    const colorHex =
      matchedProductVariant?.colorHex ||
      String(rawItem?.colorHex || '').trim() ||
      matchedColor?.hex ||
      '#1e293b';
    const warranty = matchedProductVariant?.warrantyName || product.warranty;

    const key = `${product.id}__${matchedProductVariant?.id || colorName}__${storageLabel}__${warranty}`;

    computedItems.push({
      key,
      productId: product.id,
      ...(matchedProductVariant
        ? {
            variantId: matchedProductVariant.id,
            sku: matchedProductVariant.sku,
            partNumber: matchedProductVariant.partNumber || undefined,
            simType: matchedProductVariant.simType || undefined,
          }
        : {}),
      slug: product.slug,
      nameFa: product.nameFa,
      brand: product.brand,
      image: product.image,
      colorName,
      colorHex,
      storageLabel,
      warranty,
      unitPrice,
      originalUnitPrice,
      qty,
      stockCount:
        typeof matchedProductVariant?.availableStock === 'number'
          ? matchedProductVariant.availableStock
          : product.stockCount,
    });
  }

  let originalSubtotal = 0;
  let subtotal = 0;
  for (const item of computedItems) {
    originalSubtotal += item.originalUnitPrice * item.qty;
    subtotal += item.unitPrice * item.qty;
  }

  const productDiscount = Math.max(0, originalSubtotal - subtotal);
  const rules = params.couponRules || DEFAULT_DEV_COUPONS;
  const rawCoupon = params.couponCode ? String(params.couponCode).trim() : '';
  let couponCode: string | null = null;
  let couponDiscount = 0;

  if (rawCoupon) {
    const evalRes = evaluateCouponServer(rawCoupon, subtotal, rules, params.couponContext);
    if (evalRes.valid && evalRes.code) {
      couponCode = evalRes.code;
      couponDiscount = evalRes.discountAmount;
    } else if (params.strictCouponValidation) {
      return { ok: false, statusCode: 400, error: evalRes.message };
    }
  }

  const threshold = params.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD_DEFAULT;
  const afterDiscounts = Math.max(0, subtotal - couponDiscount);
  const { deliverySlot, shippingCost } = resolveShippingServer(
    afterDiscounts,
    threshold,
    params.city ?? 'تهران',
    params.deliverySlot ?? 'express'
  );
  const totalAmount = afterDiscounts + shippingCost;

  const stockDecrements: Array<{ productId: string; variantId?: string; qty: number }> = [];
  const variantCoveredQtyByProduct = new Map<string, number>();
  for (const vEntry of requestedQtyPerVariant.values()) {
    stockDecrements.push({
      productId: vEntry.productId,
      variantId: vEntry.variantId,
      qty: vEntry.qty,
    });
    variantCoveredQtyByProduct.set(
      vEntry.productId,
      (variantCoveredQtyByProduct.get(vEntry.productId) || 0) + vEntry.qty
    );
  }
  for (const [productId, totalQty] of requestedQtyPerProduct.entries()) {
    const remaining = totalQty - (variantCoveredQtyByProduct.get(productId) || 0);
    if (remaining > 0) {
      stockDecrements.push({ productId, qty: remaining });
    }
  }

  return {
    ok: true,
    items: computedItems,
    couponCode,
    deliverySlot,
    subtotal,
    productDiscount,
    couponDiscount,
    shippingCost,
    totalAmount,
    stockDecrements,
  };
}

const SENSITIVE_KEY_RE = /password|otp|token|secret|hash|session|cookie|service_?role/i;

export function sanitizeAuditDetails(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }
  const redact = (val: unknown, depth = 0): unknown => {
    if (depth > 4) return '[TRUNCATED]';
    if (Array.isArray(val)) {
      return val.slice(0, 20).map((item) => redact(item, depth + 1));
    }
    if (val && typeof val === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (SENSITIVE_KEY_RE.test(k)) {
          continue;
        }
        out[k] = redact(v, depth + 1);
      }
      return out;
    }
    if (typeof val === 'string' && val.length > 500) {
      return `${val.slice(0, 500)}…`;
    }
    return val;
  };
  return redact(input, 0) as Record<string, unknown>;
}

export function toSummaryOrderDTO(
  order: {
    orderCode: string;
    status: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliverySlot: 'express' | 'standard';
    createdAt: string;
  },
  isGuestOrder: boolean
): OrderSummaryDTO {
  return {
    orderCode: order.orderCode,
    status: order.status,
    ...(order.paymentStatus ? { paymentStatus: order.paymentStatus } : {}),
    deliverySlot: order.deliverySlot,
    createdAt: order.createdAt,
    requiresVerification: true,
    isGuestOrder,
  };
}

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'help',
  'api',
  'auth',
  'account',
  'profile',
  'user',
  'users',
  'u',
  'catalog',
  'cart',
  'checkout',
  'tracking',
  'orders',
  'order',
  'about',
  'contact',
  'terms',
  'status',
  'compare',
  'installments',
  'amirmobile',
  'amir_mobile',
  'amir.mobile',
  'staff',
  'moderator',
  'mod',
  'official',
  'verify',
  'security',
  'login',
  'signup',
  'register',
  'reset',
  'null',
  'undefined',
  'me',
  'www',
  'mail',
  'noreply',
]);

export function normalizeUsernameServer(raw: unknown): string {
  return toEnglishDigitsServer(String(raw ?? ''))
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

export function validateUsernameServer(raw: unknown): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  const normalized = normalizeUsernameServer(raw);
  if (!normalized) {
    return { valid: false, normalized, error: 'لطفاً نام کاربری را وارد کنید.' };
  }
  if (normalized.length < 3) {
    return { valid: false, normalized, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' };
  }
  if (normalized.length > 24) {
    return { valid: false, normalized, error: 'نام کاربری نمی‌تواند بیشتر از ۲۴ کاراکتر باشد.' };
  }
  if (!/^[a-z]/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری باید با حروف انگلیسی (a-z) شروع شود.',
    };
  }
  if (!/^[a-z0-9_.]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد، نقطه (.) و خط زیر (_) باشد.',
    };
  }
  if (!/[a-z0-9]$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری باید با حرف یا عدد انگلیسی پایان یابد.',
    };
  }
  if (/[._]{2}/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'استفاده از دو نقطه یا خط زیر پشت‌سرهم مجاز نیست.',
    };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'این نام کاربری رزرو شده است و قابل انتخاب نیست.',
    };
  }
  return { valid: true, normalized };
}

export function buildUsernameCandidateListServer(baseRaw: string): string[] {
  const emailLocal = String(baseRaw || '').includes('@')
    ? String(baseRaw).split('@')[0]
    : String(baseRaw || '');
  let seed = normalizeUsernameServer(emailLocal)
    .replace(/[^a-z0-9_.]/g, '_')
    .replace(/[._]{2,}/g, '_')
    .replace(/^[._0-9]+/, '')
    .replace(/[._]+$/, '');

  if (seed.length < 3) {
    seed = seed ? `amir_${seed}` : 'amir_user';
  }
  if (seed.length > 18) {
    seed = seed.slice(0, 18).replace(/[._]+$/, '');
  }

  const rawCandidates = [
    seed,
    `${seed}_ir`,
    `${seed}98`,
    `${seed}_shop`,
    `${seed}2026`,
    `amir_${seed}`.slice(0, 24),
    `${seed}_1`,
    `${seed}_2`,
    `${seed}_7`,
  ];

  const unique: string[] = [];
  for (const cand of rawCandidates) {
    const clean = cand.slice(0, 24).replace(/[._]+$/, '');
    if (validateUsernameServer(clean).valid && !unique.includes(clean)) {
      unique.push(clean);
    }
  }
  return unique;
}

export function maskEmailServer(email: string): string {
  const clean = String(email || '').trim().toLowerCase();
  const atIdx = clean.indexOf('@');
  if (atIdx <= 0) return clean;
  const local = clean.slice(0, atIdx);
  const domain = clean.slice(atIdx + 1);
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
}

const BLOG_NOW = Date.now();
const blogDaysAgo = (days: number) => new Date(BLOG_NOW - days * 86_400_000).toISOString();

export const DEFAULT_DEV_BLOG_POSTS: BlogPostDTO[] = [
  {
    id: 'blog-post-1',
    slug: 'iphone-16-pro-max-vs-s24-ultra-camera',
    title: 'مقایسه دوربین پرچمداران: آیفون ۱۶ پرو مکس در برابر گلکسی S24 اولترا',
    excerpt:
      'کدام گوشی در شب عکس‌های طبیعی‌تری ثبت می‌کند؟ بررسی دقیق سنسورهای پریسکوپی، داینامیک رنج و قدرت پردازش هوش مصنوعی.',
    content: [
      'انتخاب بین دو غول دنیای عکاسی موبایل یعنی آیفون ۱۶ پرو مکس و گلکسی S24 اولترا، بیش از هر زمان دیگری به سبک عکاسی و نیاز فیلم‌برداری شما وابسته است. در آزمایش‌های میدانی تحریریه موبایل امیر، هر دو دستگاه را در شرایط نوری سخت، عکاسی پرتره و زوم اپتیکال ۵ برابری زیر ذره‌بین قرار دادیم.',
      '## عملکرد در نور روز و بازتولید رنگ',
      'اپل با نسل جدید پردازش تصویر Photonic Engine و پروفایل‌های رنگی جدید، جزئیات سایه‌ها را بدون اغراق در کنتراست حفظ می‌کند و رنگ پوست را بسیار نزدیک به واقعیت ثبت می‌کند. در مقابل، گلکسی S24 اولترا با سنسور ۲۰۰ مگاپیکسلی اصلی خود، وضوح لبه‌ها و شفافیت بافت‌ها را در ثبت مناظر شهری و معماری به اوج می‌رساند.',
      '## عکاسی در شب و زوم تله‌فوتو',
      'هر دو گوشی به لنز تله‌فوتو پریسکوپی ۵ برابر مجهز هستند. در محیط‌های کم‌نور، آیفون به دلیل گشودگی دیافراگم مناسب‌تر و زمان نوردهی هوشمند، نویز کمتری ایجاد می‌کند؛ اما سامسونگ با قابلیت زوم ۱۰ و ۱۰۰ برابری دیجیتال مبتنی بر هوش مصنوعی، در فواصل بسیار دور دست بالا را دارد.',
      '## فیلم‌برداری و جمع‌بندی خرید',
      'اگر تولید محتوای ویدیویی، پشتیبانی از فرمت ProRes 4K با نرخ ۱۲۰ فریم بر ثانیه و کلید اختصاصی Camera Control برایتان اولویت دارد، آیفون ۱۶ پرو مکس انتخاب بی‌رقیب است. اما برای کاربرانی که نمایشگر ضدبازتاب، قلم S-Pen و زوم برد بلند می‌خواهند، گلکسی S24 اولترا ارزش خرید فوق‌العاده‌ای دارد.',
    ].join('\n\n'),
    coverImage: 'asset:iphoneCamera',
    category: 'مقایسه تخصصی',
    tags: ['آیفون ۱۶ پرو مکس', 'گلکسی S24 اولترا', 'مقایسه دوربین'],
    authorName: 'امیرحسین مرادی',
    readingTimeMinutes: 7,
    isPublished: true,
    publishedAt: blogDaysAgo(2),
    createdAt: blogDaysAgo(2),
    updatedAt: blogDaysAgo(2),
  },
  {
    id: 'blog-post-2',
    slug: 'fast-charging-gan-cable-buying-guide',
    title: 'راهنمای جامع خرید آداپتور و کابل فست شارژ؛ تشخیص شارژر اصلی از تقلبی',
    excerpt:
      'معرفی استانداردهای PD و PPS و نحوه تشخیص شارژرهای تقلبی که سلامت باتری گوشی گران‌قیمت شما را به خطر می‌اندازند.',
    content: [
      'بسیاری از کاربران پس از خرید گوشی‌های پرچمدار، برای تهیه آداپتور شارژ سریع با نمونه‌های غیر‌اصلی و مشابه روبه‌رو می‌شوند که نه‌تنها سرعت واقعی شارژ را ارائه نمی‌دهند، بلکه در درازمدت به مدار تغذیه (IC شارژ) و سلامت باتری آسیب جدی می‌زنند.',
      '## فناوری GaN چیست و چه تفاوتی ایجاد می‌کند؟',
      'شارژرهای مبتنی بر نیترید گالیوم (GaN) در مقایسه با نمونه‌های سیلیکونی قدیمی، حرارت بسیار کمتری تولید می‌کنند و در ابعادی کوچک‌تر، توان خروجی بالا مانند ۴۵ تا ۶۵ وات را به صورت پایدار تحویل می‌دهند. برندهایی نظیر انکر (Anker) و آداپتورهای رسمی اپل و سامسونگ از محافظ‌های چندلایه نوسان برق و کنترل دمای لحظه‌ای بهره می‌برند.',
      '## استانداردهای PD و PPS را بشناسید',
      'برای گوشی‌های آیفون سری ۱۵ و ۱۶، پشتیبانی آداپتور از پروتکل USB Power Delivery (PD 3.0) حیاتی است. در سوی دیگر، پرچمداران سامسونگ برای دستیابی به شارژ فوق‌سریع ۴۵ واتی نیازمند پروتکل PPS (تنظیم هوشمند ولتاژ و جریان) هستند تا دمای باتری در حین شارژ تحت کنترل بماند.',
      '## چطور شارژر اصل را تشخیص دهیم؟',
      'وزن متناسب و غیرعادی سبک نبودن بدنه، کیفیت چاپ لیزری شماره سریال، بسته‌بندی پلمپ با هولوگرام اصالت و خرید از فروشگاه دارای گارانتی تعویض واقعی، مهم‌ترین معیارها برای اطمینان از اصالت آداپتور و کابل Type-C هستند.',
    ].join('\n\n'),
    coverImage: 'asset:ankerCharger',
    category: 'راهنمای خرید',
    tags: ['فست شارژ', 'فناوری GaN', 'شارژر انکر', 'سلامت باتری'],
    authorName: 'سارا کاظمی',
    readingTimeMinutes: 5,
    isPublished: true,
    publishedAt: blogDaysAgo(4),
    createdAt: blogDaysAgo(4),
    updatedAt: blogDaysAgo(4),
  },
  {
    id: 'blog-post-3',
    slug: 'best-smartwatches-fitness-health-guide',
    title: 'بهترین ساعت‌های هوشمند برای پایش سلامت و ورزش در سال ۱۴۰۳',
    excerpt:
      'تحلیل دقت سنسورهای ضربان قلب، نوار قلب ECG و دوام باتری در ساعت‌های هوشمند اپل و سامسونگ برای استفاده روزمره و حرفه‌ای.',
    content: [
      'ساعت‌های هوشمند امروزی فراتر از نمایش اعلان‌های گوشی عمل می‌کنند و به یک دستیار دقیق پایش سلامت، کیفیت خواب و تحلیل تمرینات ورزشی تبدیل شده‌اند. در این راهنما معیارهای کلیدی انتخاب بهترین ساعت هوشمند متناسب با گوشی شما را بررسی می‌کنیم.',
      '## سازگاری اکوسیستم؛ اولین شرط انتخاب',
      'پیش از هر چیز باید توجه داشت که اپل واچ‌ها تنها با گوشی‌های آیفون جفت می‌شوند و بهترین هماهنگی را با iOS دارند. اگر از گوشی‌های اندرویدی استفاده می‌کنید، سری گلکسی واچ سامسونگ یا ساعت‌های مجهز به Wear OS امکانات کامل‌تری در پاسخ به پیام‌ها و پایش بدن ارائه می‌دهند.',
      '## دقت سنسورها و پایداری GPS',
      'برای ورزشکاران فضای باز، دوچرخه‌سواران و کوهنوردان، پشتیبانی از GPS دوفرکانسه (L1+L5) در مدل‌هایی مانند اپل واچ اولترا ۲ دقت ثبت مسیر را به شکل چشمگیری افزایش می‌دهد. همچنین وجود سنسور اکسیژن خون، نوار قلب و تشخیص سقوط می‌تواند در شرایط اضطراری بسیار کاربردی باشد.',
      '## باتری و مقاومت بدنه',
      'بسته به سبک استفاده، اگر دوام باتری چندروزه و بدنه تیتانیومی مقاوم در برابر ضربه و عمق آب برایتان مهم است، مدل‌های اولترا بهترین گزینه‌اند؛ در حالی که سری‌های استاندارد وزن سبک‌تر و راحتی بیشتری برای پایش خواب شبانه دارند.',
    ].join('\n\n'),
    coverImage: 'asset:audioWearables',
    category: 'بررسی گجت',
    tags: ['ساعت هوشمند', 'اپل واچ اولترا ۲', 'پایش سلامت'],
    authorName: 'کیوان رستگار',
    readingTimeMinutes: 8,
    isPublished: true,
    publishedAt: blogDaysAgo(7),
    createdAt: blogDaysAgo(7),
    updatedAt: blogDaysAgo(7),
  },
  {
    id: 'blog-post-4',
    slug: 'hamta-registry-and-original-seal-checklist',
    title: 'راهنمای کامل استعلام رجیستری همتا و تشخیص پلمپ اصلی پیش از خرید موبایل',
    excerpt:
      'چک‌لیست گام‌به‌گام برای اطمینان از آکبند بودن دستگاه، تطابق IMEI روی جعبه با سامانه همتا و نکات مهم فعال‌سازی.',
    content: [
      'یکی از دغدغه‌های اصلی هنگام خرید گوشی موبایل آنلاین یا حضوری، اطمینان از پلمپ کارخانه‌ای دستگاه و قانونی بودن رجیستری آن در شبکه ارتباطی کشور است. رعایت چند نکته ساده پیش از باز کردن پلمپ جعبه، ریسک خرید را به صفر می‌رساند.',
      '## تطابق شناسه IMEI روی جعبه و استعلام همتا',
      'پیش از باز کردن پلمپ، کد ۱۵ رقمی IMEI درج‌شده پشت جعبه را در سامانه همتا (از طریق کد دستوری #۷۷۷۷* یا اپلیکیشن همتا) استعلام بگیرید. در وضعیت قانونی باید مدل دقیق دستگاه و نام شرکت واردکننده رسمی نمایش داده شود.',
      '## بررسی پلمپ کارخانه و شماره سریال برند',
      'در آیفون‌های جدید، اپل به جای سلفون پلاستیکی از نوار کاغذی کشیدنی با برچسب امنیتی ماوراءبنفش استفاده می‌کند. همچنین شماره سریال روی جعبه را می‌توانید پیش از فعال‌سازی در وب‌سایت رسمی اپل یا سامسونگ بررسی کنید تا مطمئن شوید دستگاه قبلاً اکتیو نشده است.',
      '## انتقال مالکیت قانونی پس از تحویل',
      'در فروشگاه موبایل امیر، تمامی گوشی‌ها همراه با کد فعال‌سازی معتبر روی فاکتور رسمی و گارانتی ۱۸ ماهه امیر سرویس ارسال می‌شوند تا پس از دریافت بسته، بلافاصله دستگاه را به نام سیم‌کارت خود فعال کنید.',
    ].join('\n\n'),
    coverImage: 'asset:promoShowcase',
    category: 'آموزش و رجیستری',
    tags: ['رجیستری همتا', 'تشخیص پلمپ', 'خرید امن موبایل'],
    authorName: 'تحریریه موبایل امیر',
    readingTimeMinutes: 6,
    isPublished: true,
    publishedAt: blogDaysAgo(10),
    createdAt: blogDaysAgo(10),
    updatedAt: blogDaysAgo(10),
  },
];


