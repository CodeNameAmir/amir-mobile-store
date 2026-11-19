export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

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
  subtitle: string;
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
  isActive: boolean;
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
  brand: string;
  category: ProductCategory;
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
  colors: ProductColorDTO[];
  storageOptions: StorageVariantDTO[];
  specs: ProductSpecsDTO;
  customSpecs?: CustomSpecItemDTO[];
  priceUpdatedAt?: string;
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
  author: string;
  dateLabel: string;
  rating: number;
  comment: string;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface SupportTicketDTO {
  id?: string;
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

export interface OrderSummaryDTO {
  orderCode: string;
  status: OrderStatus;
  deliverySlot: 'express' | 'standard';
  createdAt: string;
  requiresVerification: true;
  isGuestOrder: boolean;
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
export const STANDARD_SHIPPING_FEE_DEFAULT = 150_000;

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
];

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
  if (s === 'paid' || s === 'preparing' || s === 'shipped' || s === 'delivered' || s === 'cancelled') {
    return s;
  }
  return 'preparing';
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
  sort?: string;
  categories?: CategoryDTO[];
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

  const sorted = [...filtered];
  switch (query.sort) {
    case 'cheapest':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'expensive':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'bestselling':
      sorted.sort((a, b) => a.salesRank - b.salesRank);
      break;
    case 'popular':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'newest':
    default:
      sorted.sort(compareNewestProductsServer);
      break;
  }

  return sorted;
}

export function evaluateCouponServer(
  codeRaw: string,
  netSubtotal: number,
  rules: CouponRuleDTO[] = DEFAULT_DEV_COUPONS
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
      message: 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است.',
    };
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

export function calculateCareInsurancePriceServer(
  unitPrice: number,
  category: ProductCategory
): number {
  if (category !== 'phones' && category !== 'tablets' && category !== 'smartwatches') {
    return 0;
  }
  const fourPercent = Math.round((unitPrice * 0.04) / 10_000) * 10_000;
  return Math.max(490_000, Math.min(3_200_000, fourPercent));
}

export interface OrderItemInput {
  key?: unknown;
  productId?: unknown;
  slug?: unknown;
  colorName?: unknown;
  colorHex?: unknown;
  storageLabel?: unknown;
  warranty?: unknown;
  qty?: unknown;
}

export interface ComputedOrderItem {
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

export function calculateOrderTotalsServer(params: {
  items: OrderItemInput[];
  products: ProductDTO[];
  couponCode?: string | null;
  couponRules?: CouponRuleDTO[];
  freeShippingThreshold?: number;
}):
  | {
      ok: true;
      items: ComputedOrderItem[];
      couponCode: string | null;
      subtotal: number;
      productDiscount: number;
      couponDiscount: number;
      shippingCost: number;
      totalAmount: number;
      stockDecrements: Array<{ productId: string; qty: number }>;
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

    const totalForProduct = (requestedQtyPerProduct.get(product.id) || 0) + qty;
    requestedQtyPerProduct.set(product.id, totalForProduct);

    if (!product.inStock || product.stockCount < totalForProduct) {
      return {
        ok: false,
        statusCode: 409,
        error: `موجودی کالای «${product.nameFa}» کافی نیست (موجودی فعلی: ${product.stockCount} عدد).`,
      };
    }

    const storageLabel =
      String(rawItem?.storageLabel || '').trim() ||
      product.storageOptions[0]?.label ||
      product.specs.storageDefault;
    const variant = product.storageOptions.find((v) => v.label === storageLabel);
    const delta = variant ? variant.priceDelta : 0;

    let unitPrice = Math.max(0, product.price + delta);
    let originalUnitPrice = Math.max(unitPrice, (product.originalPrice ?? product.price) + delta);

    const requestedWarranty = String(rawItem?.warranty || '').trim();
    const careRequested = requestedWarranty.includes('Care+');
    const carePrice = careRequested
      ? calculateCareInsurancePriceServer(unitPrice, product.category)
      : 0;

    unitPrice += carePrice;
    originalUnitPrice += carePrice;

    const colorName =
      String(rawItem?.colorName || '').trim() || product.colors[0]?.name || product.colorLabel;
    const matchedColor = product.colors.find((c) => c.name === colorName) || product.colors[0];
    const colorHex = String(rawItem?.colorHex || '').trim() || matchedColor?.hex || '#1e293b';
    const warranty =
      careRequested && carePrice > 0
        ? `${product.warranty} + بیمه حوادث و شکستگی Amir Care+`
        : product.warranty;

    const key =
      String(rawItem?.key || '').trim() ||
      `${product.id}__${colorName}__${storageLabel}__${warranty}`;

    computedItems.push({
      key,
      productId: product.id,
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
      stockCount: product.stockCount,
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
    const evalRes = evaluateCouponServer(rawCoupon, subtotal, rules);
    if (evalRes.valid && evalRes.code) {
      couponCode = evalRes.code;
      couponDiscount = evalRes.discountAmount;
    }
  }

  const threshold = params.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD_DEFAULT;
  const afterDiscounts = Math.max(0, subtotal - couponDiscount);
  const shippingCost = afterDiscounts >= threshold ? 0 : STANDARD_SHIPPING_FEE_DEFAULT;
  const totalAmount = afterDiscounts + shippingCost;

  const stockDecrements = [...requestedQtyPerProduct.entries()].map(([productId, qty]) => ({
    productId,
    qty,
  }));

  return {
    ok: true,
    items: computedItems,
    couponCode,
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
    deliverySlot: 'express' | 'standard';
    createdAt: string;
  },
  isGuestOrder: boolean
): OrderSummaryDTO {
  return {
    orderCode: order.orderCode,
    status: order.status,
    deliverySlot: order.deliverySlot,
    createdAt: order.createdAt,
    requiresVerification: true,
    isGuestOrder,
  };
}
