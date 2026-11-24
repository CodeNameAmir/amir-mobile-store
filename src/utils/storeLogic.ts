import type {
  BrandId,
  BrandItem,
  CartItem,
  CategoryItem,
  CheckoutFormData,
  ContactFormData,
  CouponRule,
  FilterState,
  InstallmentPlan,
  OrderStatus,
  Product,
} from '../types/store';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const FREE_SHIPPING_THRESHOLD = 1_000_000;
export const TEHRAN_EXPRESS_SHIPPING_FEE = 150_000;
export const NATIONAL_POST_SHIPPING_FEE = 95_000;
export const STANDARD_SHIPPING_FEE = TEHRAN_EXPRESS_SHIPPING_FEE;
export const DEFAULT_MONTHLY_INSTALLMENT_RATE = 2.2; // 2.2% monthly fee

export function isTehranCity(city?: string): boolean {
  const clean = toEnglishDigits(String(city ?? '')).trim().toLowerCase();
  if (!clean) return false;
  return (
    clean === 'تهران' ||
    clean === 'tehran' ||
    clean === 'استان تهران' ||
    clean === 'تهران بزرگ' ||
    /^تهران(\s|[-،,]|$)/.test(clean)
  );
}

export function resolveDeliverySlot(
  city?: string,
  deliverySlot?: 'express' | 'standard'
): 'express' | 'standard' {
  return isTehranCity(city) && deliverySlot !== 'standard' ? 'express' : 'standard';
}

export function resolveShippingOption(
  afterDiscounts: number,
  freeShippingThreshold: number,
  city?: string,
  deliverySlot?: 'express' | 'standard',
  hasItems = true
): {
  deliverySlot: 'express' | 'standard';
  shippingCost: number;
  freeShippingEligible: boolean;
} {
  const resolvedSlot = resolveDeliverySlot(city, deliverySlot);
  const freeShippingEligible = !hasItems || afterDiscounts >= freeShippingThreshold;
  if (!hasItems || freeShippingEligible) {
    return {
      deliverySlot: resolvedSlot,
      shippingCost: 0,
      freeShippingEligible: true,
    };
  }
  const shippingCost =
    resolvedSlot === 'express' ? TEHRAN_EXPRESS_SHIPPING_FEE : NATIONAL_POST_SHIPPING_FEE;
  return {
    deliverySlot: resolvedSlot,
    shippingCost,
    freeShippingEligible: false,
  };
}

export const DEFAULT_COUPON_RULES: CouponRule[] = [
  {
    code: 'AMIR-OFF',
    discountType: 'fixed',
    discountValue: 500_000,
    maxDiscount: 500_000,
    minOrderAmount: 0,
    descriptionFa: 'تخفیف ۵۰۰ هزار تومانی خرید اول',
  },
  {
    code: 'VIP-10',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 2_000_000,
    minOrderAmount: 1_000_000,
    descriptionFa: 'تخفیف ۱۰ درصدی ویژه تا سقف ۲ میلیون تومان',
  },
];

export function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (ch) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)))
    .replace(/[٠-٩]/g, (ch) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
}

export function formatToman(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  const withCommas = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return toPersianDigits(withCommas);
}

export function getVariantPrice(product: Product, storageLabel?: string): {
  price: number;
  originalPrice: number;
} {
  const variant = product.storageOptions.find((s) => s.label === storageLabel);
  const delta = variant ? variant.priceDelta : 0;
  const price = product.price + delta;
  const originalPrice = (product.originalPrice ?? product.price) + delta;
  return { price, originalPrice };
}

export function calculateCareInsurancePrice(unitPrice: number, category: Product['category']): number {
  if (category !== 'phones' && category !== 'tablets' && category !== 'smartwatches') {
    return 0;
  }
  const fourPercent = Math.round((unitPrice * 0.04) / 10_000) * 10_000;
  return Math.max(490_000, Math.min(3_200_000, fourPercent));
}

export function calculateInstallmentPlan(
  totalPrice: number,
  downPaymentPercent: number,
  months: number,
  monthlyRatePercent = DEFAULT_MONTHLY_INSTALLMENT_RATE
): InstallmentPlan {
  const safePrice = Math.max(0, Math.round(totalPrice));
  const safeDownPct = Math.min(80, Math.max(10, downPaymentPercent));
  const safeMonths = Math.max(3, Math.min(36, Math.round(months)));

  const downPaymentAmount = Math.round((safePrice * safeDownPct) / 100);
  const financedAmount = Math.max(0, safePrice - downPaymentAmount);
  const totalFee = Math.round(financedAmount * (monthlyRatePercent / 100) * safeMonths);
  const totalInstallmentsAmount = financedAmount + totalFee;
  const monthlyPayment = Math.round(totalInstallmentsAmount / safeMonths);
  const totalPayableWithPlan = downPaymentAmount + totalInstallmentsAmount;

  return {
    totalPrice: safePrice,
    downPaymentPercent: safeDownPct,
    downPaymentAmount,
    financedAmount,
    months: safeMonths,
    monthlyRatePercent,
    monthlyPayment,
    totalInstallmentsAmount,
    totalPayableWithPlan,
  };
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

export function levenshteinDistance(a: string, b: string): number {
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

function fuzzyWordMatch(token: string, haystack: string, words: string[]): boolean {
  if (haystack.includes(token)) return true;
  const alias = PERSIAN_SEARCH_ALIASES[token];
  if (alias && haystack.includes(alias)) return true;

  const candidates = [token, ...(alias ? alias.split(/\s+/) : [])];
  for (const cand of candidates) {
    if (cand.length < 3) continue;
    const maxDist = cand.length <= 4 ? 1 : 2;
    for (const w of words) {
      if (Math.abs(w.length - cand.length) > maxDist) continue;
      if (levenshteinDistance(cand, w) <= maxDist) return true;
    }
  }
  return false;
}

export function getDescendantCategoryIds(
  categories: CategoryItem[],
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

export const BASE_CATALOG_MAX_PRICE = 150_000_000;

export function computeCatalogMaxPrice(products: Array<Pick<Product, 'price'>>): number {
  const highest = products.reduce(
    (max, p) => (Number.isFinite(p.price) && p.price > max ? p.price : max),
    0
  );
  if (highest <= BASE_CATALOG_MAX_PRICE) return BASE_CATALOG_MAX_PRICE;
  return Math.ceil(highest / 50_000_000) * 50_000_000;
}

function parseTimestampMs(raw?: string): number {
  if (!raw) return NaN;
  const normalized = raw
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
    .replace(/(\.\d{3})\d+/, '$1')
    .replace(/([+-]\d{2})$/, '$1:00');
  const ms = Date.parse(normalized);
  return Number.isFinite(ms) ? ms : NaN;
}

export function formatPersianDate(raw?: string): string {
  if (!raw) return 'به‌روزرسانی امروز';
  const ms = parseTimestampMs(raw);
  if (!Number.isFinite(ms)) return raw;
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(ms));
  } catch {
    return raw;
  }
}

function compareNewestProducts(a: Product, b: Product): number {
  const timeA = parseTimestampMs(a.createdAt);
  const timeB = parseTimestampMs(b.createdAt);
  const hasA = Number.isFinite(timeA);
  const hasB = Number.isFinite(timeB);
  if (hasA && !hasB) return -1;
  if (!hasA && hasB) return 1;
  if (hasA && hasB && Math.abs(timeB - timeA) > 60_000) {
    return timeB - timeA;
  }
  return a.releaseOrder - b.releaseOrder;
}

export function matchesProductSearch(product: Product, queryRaw: string): boolean {
  const normalizedQuery = toEnglishDigits(queryRaw.trim().toLowerCase());
  if (!normalizedQuery) return true;

  const customText = (product.customSpecs || []).map((s) => `${s.label} ${s.value}`).join(' ');
  const haystack = toEnglishDigits(
    `${product.nameFa} ${product.nameEn} ${product.slug} ${product.brand} ${product.category} ${product.specs.chipset} ${product.specs.storageDefault} ${customText}`
  ).toLowerCase();

  if (haystack.includes(normalizedQuery)) return true;

  const words = haystack.split(/[\s\-_/.,·،()]+/).filter(Boolean);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  return tokens.every((token) => fuzzyWordMatch(token, haystack, words));
}

export function filterAndSortProducts(
  products: Product[],
  filters: FilterState,
  categories: CategoryItem[] = []
): Product[] {
  const allowedCategories =
    filters.category !== 'all' && filters.category !== 'offers'
      ? categories.length > 0
        ? getDescendantCategoryIds(categories, filters.category)
        : new Set([String(filters.category).toLowerCase()])
      : null;

  const filtered = products.filter((p) => {
    if (filters.category === 'offers') {
      if (!p.discountPercent || p.discountPercent <= 0) return false;
    } else if (allowedCategories && !allowedCategories.has(String(p.category).toLowerCase())) {
      return false;
    }

    if (
      filters.brands.length > 0 &&
      !filters.brands.some((b) => b.toLowerCase() === String(p.brand).toLowerCase())
    ) {
      return false;
    }

    if (filters.inStockOnly && !p.inStock) {
      return false;
    }

    if (filters.discountedOnly && (!p.discountPercent || p.discountPercent <= 0)) {
      return false;
    }

    if (filters.expressOnly && !p.expressDelivery) {
      return false;
    }

    if (
      p.price < filters.minPrice ||
      (Number.isFinite(filters.maxPrice) && p.price > filters.maxPrice)
    ) {
      return false;
    }

    if (filters.storage) {
      const targetStorage = normalizeCapacityKey(filters.storage);
      const hasStorage =
        normalizeCapacityKey(p.specs.storageDefault) === targetStorage ||
        p.storageOptions.some((s) => normalizeCapacityKey(s.label) === targetStorage);
      if (!hasStorage) return false;
    }

    if (filters.ram && normalizeCapacityKey(p.specs.ram) !== normalizeCapacityKey(filters.ram)) {
      return false;
    }

    if (filters.colorId) {
      const colorFilterLower = filters.colorId.trim().toLowerCase();
      const colorFilterNorm = normalizeColorKey(filters.colorId);
      const hasColor = p.colors.some(
        (c) =>
          c.id.toLowerCase() === colorFilterLower ||
          c.hex.toLowerCase() === colorFilterLower ||
          c.name.toLowerCase() === colorFilterLower ||
          (colorFilterNorm.length > 0 && normalizeColorKey(c.name) === colorFilterNorm)
      );
      if (!hasColor) return false;
    }

    if (filters.attributeFilters && Object.keys(filters.attributeFilters).length > 0) {
      const attrs = p.attributeValues || [];
      for (const [code, expectedRaw] of Object.entries(filters.attributeFilters)) {
        const expected = toEnglishDigits(String(expectedRaw || '')).trim().toLowerCase();
        if (!expected) continue;
        const match = attrs.find((a) => a.code.toLowerCase() === code.toLowerCase());
        if (!match) return false;
        const valCandidates = [
          match.displayValue,
          match.valueText ?? '',
          match.valueNumber !== null && match.valueNumber !== undefined ? String(match.valueNumber) : '',
          typeof match.valueBoolean === 'boolean'
            ? match.valueBoolean
              ? 'true دارد بله'
              : 'false ندارد خیر'
            : '',
        ]
          .map((v) => toEnglishDigits(String(v)).trim().toLowerCase())
          .filter(Boolean);
        if (!valCandidates.some((c) => c === expected || c.includes(expected))) {
          return false;
        }
      }
    }

    if (filters.searchQuery.trim() && !matchesProductSearch(p, filters.searchQuery)) {
      return false;
    }

    return true;
  });

  const stockOrder = (p: Product) => (p.inStock && p.stockCount > 0 ? 0 : 1);
  const discountMagnitude = (p: Product) => {
    const pct = p.discountPercent ?? 0;
    if (pct > 0) return pct;
    if (p.originalPrice && p.originalPrice > p.price) {
      return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    }
    return 0;
  };

  const sorted = [...filtered];
  switch (filters.sortBy) {
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
          compareNewestProducts(a, b)
      );
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => stockOrder(a) - stockOrder(b) || compareNewestProducts(a, b));
      break;
  }

  return sorted;
}

export interface AvailableColorOption {
  id: string;
  label: string;
  hex: string;
  count: number;
}

export function normalizeColorLabel(rawName: string): string {
  return String(rawName || '')
    .split('(')[0]
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeColorKey(rawName: string): string {
  return normalizeColorLabel(rawName).replace(/\s+/g, '').toLowerCase();
}

export function extractAvailableColors(products: Product[]): AvailableColorOption[] {
  const byKey = new Map<string, AvailableColorOption>();
  for (const p of products) {
    const seenInProd = new Set<string>();
    for (const c of p.colors || []) {
      const cleanLabel = normalizeColorLabel(c.name) || String(c.id || c.hex || '').trim();
      const key = normalizeColorKey(c.name) || String(c.id || c.hex || '').trim().toLowerCase();
      if (!key || seenInProd.has(key)) continue;
      seenInProd.add(key);
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byKey.set(key, {
          id: String(c.id || key).trim(),
          label: cleanLabel,
          hex: c.hex || '#1e293b',
          count: 1,
        });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fa'));
}

export function extractAvailableBrands(products: Product[], configuredBrands: BrandItem[] = []): BrandId[] {
  const map = new Map<string, BrandId>();
  for (const b of configuredBrands) {
    if (b.isActive !== false && b.name.trim()) {
      map.set(b.name.trim().toLowerCase(), b.name.trim());
    }
  }
  for (const p of products) {
    const name = String(p.brand || '').trim();
    if (name && !map.has(name.toLowerCase())) {
      map.set(name.toLowerCase(), name);
    }
  }
  return [...map.values()];
}

export interface SearchSuggestionsResult {
  products: Product[];
  brands: BrandItem[];
  categories: CategoryItem[];
}

export function buildSearchSuggestions(
  queryRaw: string,
  products: Product[],
  categories: CategoryItem[] = [],
  brands: BrandItem[] = []
): SearchSuggestionsResult {
  const clean = toEnglishDigits(queryRaw.trim().toLowerCase());
  if (!clean) {
    return { products: [], brands: [], categories: [] };
  }

  const matchedProducts = products.filter((p) => matchesProductSearch(p, clean)).slice(0, 5);

  const tokens = clean.split(/\s+/).filter(Boolean);
  const matchedBrands = brands
    .filter((b) => {
      if (b.isActive === false) return false;
      const hay = `${b.name} ${b.labelFa || ''}`.toLowerCase();
      const words = hay.split(/\s+/).filter(Boolean);
      return tokens.some((t) => fuzzyWordMatch(t, hay, words));
    })
    .slice(0, 3);

  const matchedCategories = categories
    .filter((c) => {
      if (c.isActive === false) return false;
      const hay = `${c.label} ${c.subtitle} ${c.slug}`.toLowerCase();
      return hay.includes(clean) || tokens.some((t) => hay.includes(t));
    })
    .slice(0, 3);

  return {
    products: matchedProducts,
    brands: matchedBrands,
    categories: matchedCategories,
  };
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; page: number; totalPages: number; totalItems: number } {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(totalPages, Math.max(1, Math.floor(page)));
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    page: safePage,
    totalPages,
    totalItems,
  };
}

export interface OrderStageDisplay {
  activeStageIndex: number; // 0..3 (-1 if cancelled)
  isCancelled: boolean;
  isDelivered: boolean;
  badgeLabel: string;
  headlineText: string;
  summaryText: string;
}

export function getOrderFlowStage(status: OrderStatus): OrderStageDisplay {
  switch (status) {
    case 'pending_payment':
      return {
        activeStageIndex: 0,
        isCancelled: false,
        isDelivered: false,
        badgeLabel: 'در انتظار پرداخت',
        headlineText: 'سفارش شما ثبت شده و در انتظار تکمیل پرداخت است',
        summaryText: 'پس از تایید پرداخت، سفارش وارد مرحله بررسی انبار و آماده‌سازی می‌شود.',
      };
    case 'paid':
      return {
        activeStageIndex: 0,
        isCancelled: false,
        isDelivered: false,
        badgeLabel: 'تایید پرداخت موفق',
        headlineText: 'سفارش شما ثبت و پرداخت با موفقیت تایید شد',
        summaryText: 'سفارش در صف تایید انبار و شروع فرآیند آماده‌سازی قرار گرفته است.',
      };
    case 'preparing':
      return {
        activeStageIndex: 1,
        isCancelled: false,
        isDelivered: false,
        badgeLabel: 'در حال پردازش و بسته‌بندی',
        headlineText: 'سفارش شما با موفقیت ثبت شد و در حال آماده‌سازی است',
        summaryText: 'کارشناسان انبار در حال کنترل پلمپ، ثبت شناسه IMEI و بسته‌بندی ایمن مرسوله هستند.',
      };
    case 'shipped':
      return {
        activeStageIndex: 2,
        isCancelled: false,
        isDelivered: false,
        badgeLabel: 'تحویل به پیک / در مسیر ارسال',
        headlineText: 'مرسوله شما ارسال شده و در مسیر تحویل به شماست',
        summaryText: 'بسته تحویل ناوگان ارسال شده و به‌زودی با کد تحویل اختصاصی به دست شما می‌رسد.',
      };
    case 'delivered':
      return {
        activeStageIndex: 3,
        isCancelled: false,
        isDelivered: true,
        badgeLabel: 'تحویل‌شده به مشتری',
        headlineText: 'مرسوله شما با موفقیت تحویل داده شد',
        summaryText: 'این سفارش با موفقیت تحویل خریدار گردیده و گارانتی ۱۸ ماهه امیر سرویس فعال است.',
      };
    case 'cancelled':
      return {
        activeStageIndex: -1,
        isCancelled: true,
        isDelivered: false,
        badgeLabel: 'سفارش لغو شده است',
        headlineText: 'این سفارش لغو شده است',
        summaryText: 'در صورت کسر وجه، استرداد مبلغ به حساب مبدا انجام شده یا در حال پیگیری مالی است.',
      };
    default:
      return {
        activeStageIndex: 1,
        isCancelled: false,
        isDelivered: false,
        badgeLabel: 'در حال پردازش',
        headlineText: 'سفارش شما ثبت شد و در حال آماده‌سازی است',
        summaryText: 'همکاران ما در حال پردازش سفارش شما هستند.',
      };
  }
}

export interface CouponEvaluation {
  valid: boolean;
  code: string | null;
  discountAmount: number;
  message: string;
}

export function evaluateCoupon(
  codeRaw: string,
  netSubtotal: number,
  customRules: CouponRule[] = DEFAULT_COUPON_RULES
): CouponEvaluation {
  let code = toEnglishDigits(codeRaw).trim().toUpperCase();
  if (code === 'CNA-OFF' || code === 'تخفیف') {
    code = 'AMIR-OFF';
  }

  if (!code) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: 'لطفاً کد تخفیف را وارد نمایید.',
    };
  }
  if (netSubtotal <= 0) {
    return {
      valid: false,
      code: null,
      discountAmount: 0,
      message: 'سبد خرید شما خالی است.',
    };
  }

  const rule = customRules.find((r) => r.code.toUpperCase() === code);
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
      message: `حداقل مبلغ سفارش برای کد ${rule.code} برابر ${formatToman(rule.minOrderAmount)} تومان است.`,
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
    message: `کد تخفیف ${rule.code} اعمال شد (${formatToman(discountAmount)} تومان کسر گردید).`,
  };
}

export interface CartSummary {
  itemCount: number;
  originalSubtotal: number;
  netSubtotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliverySlot: 'express' | 'standard';
  shippingCost: number;
  freeShippingEligible: boolean;
  totalPayable: number;
  totalSavings: number;
}

export function calculateCartSummary(
  items: CartItem[],
  couponCode: string | null,
  customRules: CouponRule[] = DEFAULT_COUPON_RULES,
  freeShippingThreshold: number = FREE_SHIPPING_THRESHOLD,
  shippingOptions?: { city?: string; deliverySlot?: 'express' | 'standard' }
): CartSummary {
  let itemCount = 0;
  let originalSubtotal = 0;
  let netSubtotal = 0;

  for (const item of items) {
    const safeQty = Math.max(1, item.qty);
    itemCount += safeQty;
    originalSubtotal += item.originalUnitPrice * safeQty;
    netSubtotal += item.unitPrice * safeQty;
  }

  const productDiscount = Math.max(0, originalSubtotal - netSubtotal);
  const couponEval = couponCode
    ? evaluateCoupon(couponCode, netSubtotal, customRules)
    : { valid: false, code: null, discountAmount: 0, message: '' };
  const couponDiscount = couponEval.valid ? couponEval.discountAmount : 0;

  const afterDiscounts = Math.max(0, netSubtotal - couponDiscount);
  const cityForShipping = shippingOptions?.city ?? 'تهران';
  const slotForShipping = shippingOptions?.deliverySlot ?? 'express';
  const { deliverySlot, shippingCost, freeShippingEligible } = resolveShippingOption(
    afterDiscounts,
    freeShippingThreshold,
    cityForShipping,
    slotForShipping,
    items.length > 0
  );
  const totalPayable = afterDiscounts + shippingCost;
  const totalSavings = productDiscount + couponDiscount;

  return {
    itemCount,
    originalSubtotal,
    netSubtotal,
    productDiscount,
    couponDiscount,
    deliverySlot,
    shippingCost,
    freeShippingEligible,
    totalPayable,
    totalSavings,
  };
}

export function validateCheckoutForm(data: CheckoutFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.fullName.trim().length < 3) {
    errors.fullName = 'نام و نام خانوادگی تحویل‌گیرنده باید حداقل ۳ حرف باشد.';
  }
  const phoneEn = toEnglishDigits(data.phone.trim()).replace(/[\s-]/g, '');
  if (!/^09\d{9}$/.test(phoneEn)) {
    errors.phone = 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).';
  }
  const emailTrimmed = toEnglishDigits(String(data.email ?? '')).trim();
  if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)) {
    errors.email = 'فرمت ایمیل وارد شده معتبر نیست.';
  }
  if (data.city.trim().length < 2) {
    errors.city = 'نام شهر یا استان را وارد کنید.';
  }
  if (data.address.trim().length < 10) {
    errors.address = 'نشانی کامل پستی (حداقل ۱۰ کاراکتر) را وارد کنید.';
  }
  const postalEn = toEnglishDigits(data.postalCode.trim()).replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(postalEn)) {
    errors.postalCode = 'کد پستی باید دقیقاً ۱۰ رقم باشد.';
  }
  return errors;
}

export function validateContactForm(data: ContactFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.fullName.trim().length < 3) {
    errors.fullName = 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
  }
  const phoneEn = toEnglishDigits(data.phone.trim()).replace(/[\s-]/g, '');
  if (!/^09\d{9}$/.test(phoneEn)) {
    errors.phone = 'شماره تماس همراه باید ۱۱ رقم و با ۰۹ شروع شود.';
  }
  if (data.message.trim().length < 10) {
    errors.message = 'متن پیام باید حداقل ۱۰ کاراکتر باشد.';
  }
  return errors;
}

export function generateOrderCode(seed?: number): string {
  const num = seed ?? Math.floor(10000 + Math.random() * 89999);
  return `AMIR-${num}`;
}

export function normalizeCapacityKey(raw?: string | null): string {
  const clean = toEnglishDigits(String(raw || ''))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s\u200c]+/g, '')
    .toLowerCase();
  return clean
    .replace(/گیگابایت/g, 'gb')
    .replace(/گیگ/g, 'gb')
    .replace(/ترابایت/g, 'tb');
}

export function extractAvailableStorageOptions(products: Product[]): string[] {
  const seen = new Map<string, { label: string; gbScore: number }>();
  const register = (raw?: string | null) => {
    const label = String(raw || '').trim();
    if (!label || label === 'ندارد' || label === '-' || label === '—') return;
    if (!/(گیگ|ترابایت|gb|tb)/i.test(label)) return;
    const norm = normalizeCapacityKey(label);
    const numMatch = toEnglishDigits(label).match(/(\d+(?:\.\d+)?)/);
    let score = numMatch ? Number(numMatch[1]) : 0;
    if (/ترابایت|tb/i.test(label)) score *= 1024;
    const existing = seen.get(norm);
    if (!existing) {
      seen.set(norm, { label, gbScore: score });
    } else if (/گیگابایت|ترابایت/.test(label) && !/گیگابایت|ترابایت/.test(existing.label)) {
      seen.set(norm, { label, gbScore: score });
    }
  };
  for (const p of products) {
    register(p.specs?.storageDefault);
    for (const s of p.storageOptions || []) {
      register(s.label);
    }
    for (const v of p.variants || []) {
      register(v.storage);
    }
  }
  return [...seen.values()]
    .sort((a, b) => a.gbScore - b.gbScore || a.label.localeCompare(b.label, 'fa'))
    .map((x) => x.label);
}

export function extractAvailableRamOptions(products: Product[]): string[] {
  const seen = new Map<string, { label: string; gbScore: number }>();
  const register = (raw?: string | null) => {
    const label = String(raw || '').trim();
    if (!label || label === 'ندارد' || label === '-' || label === '—') return;
    if (!/(گیگ|gb)/i.test(label)) return;
    const norm = normalizeCapacityKey(label);
    const numMatch = toEnglishDigits(label).match(/(\d+(?:\.\d+)?)/);
    const score = numMatch ? Number(numMatch[1]) : 0;
    const existing = seen.get(norm);
    if (!existing) {
      seen.set(norm, { label, gbScore: score });
    } else if (/گیگابایت/.test(label) && !/گیگابایت/.test(existing.label)) {
      seen.set(norm, { label, gbScore: score });
    }
  };
  for (const p of products) {
    register(p.specs?.ram);
    for (const v of p.variants || []) {
      register(v.ram);
    }
  }
  return [...seen.values()]
    .sort((a, b) => a.gbScore - b.gbScore || a.label.localeCompare(b.label, 'fa'))
    .map((x) => x.label);
}

export function extractFirstNumericSpec(raw?: string | null): number | null {
  if (!raw) return null;
  const normalized = toEnglishDigits(String(raw))
    .replace(/[,٬،\u066C]/g, '')
    .replace(/[٫\u066B]/g, '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const val = Number(match[1]);
  return Number.isFinite(val) ? val : null;
}

export function computeCompareWinners(products: Product[]): Record<string, string | null> {
  if (products.length < 2) return {};
  const pickWinner = (
    values: Array<{ id: string; score: number | null }>,
    mode: 'min' | 'max'
  ): string | null => {
    const valid = values.filter((v): v is { id: string; score: number } => v.score !== null);
    if (valid.length < 2) return null;
    const uniqueScores = new Set(valid.map((v) => v.score));
    if (uniqueScores.size <= 1) return null;
    valid.sort((a, b) => (mode === 'min' ? a.score - b.score : b.score - a.score));
    // Require strict single winner (not tied at top)
    if (valid[0].score === valid[1].score) return null;
    return valid[0].id;
  };

  const winners: Record<string, string | null> = {};
  winners.price = pickWinner(
    products.map((p) => ({
      id: p.id,
      score: p.inStock && p.price > 0 ? p.price : null,
    })),
    'min'
  );
  winners.ram = pickWinner(
    products.map((p) => ({
      id: p.id,
      score: extractFirstNumericSpec(p.specs?.ram),
    })),
    'max'
  );
  winners.battery = pickWinner(
    products.map((p) => {
      const attr = p.attributeValues?.find((a) => a.code === 'battery_mah')?.valueNumber;
      return {
        id: p.id,
        score: typeof attr === 'number' ? attr : extractFirstNumericSpec(p.specs?.battery),
      };
    }),
    'max'
  );

  // Also check structured numeric attributes (e.g. battery_mah, fast_charge_w, screen_hz, camera_mp, screen_size)
  const attrCodes = new Set<string>();
  for (const p of products) {
    for (const a of p.attributeValues || []) {
      if (a.dataType === 'number' && typeof a.valueNumber === 'number') {
        attrCodes.add(a.code);
      }
    }
  }
  for (const code of attrCodes) {
    const mode: 'min' | 'max' = code === 'weight_g' ? 'min' : 'max';
    winners[`attr:${code}`] = pickWinner(
      products.map((p) => {
        const match = p.attributeValues?.find((a) => a.code === code);
        return {
          id: p.id,
          score: typeof match?.valueNumber === 'number' ? match.valueNumber : null,
        };
      }),
      mode
    );
  }

  return winners;
}
