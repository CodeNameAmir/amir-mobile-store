import type {
  CartItem,
  CheckoutFormData,
  ContactFormData,
  FilterState,
  Product,
} from '../types/store';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const FREE_SHIPPING_THRESHOLD = 1_000_000;
export const STANDARD_SHIPPING_FEE = 150_000;

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

export function filterAndSortProducts(products: Product[], filters: FilterState): Product[] {
  const normalizedQuery = toEnglishDigits(filters.searchQuery.trim().toLowerCase());

  const filtered = products.filter((p) => {
    if (filters.category === 'offers') {
      if (!p.discountPercent || p.discountPercent <= 0) return false;
    } else if (filters.category !== 'all' && p.category !== filters.category) {
      return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
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

    if (p.price < filters.minPrice || p.price > filters.maxPrice) {
      return false;
    }

    if (filters.storage) {
      const hasStorage =
        p.specs.storageDefault === filters.storage ||
        p.storageOptions.some((s) => s.label === filters.storage);
      if (!hasStorage) return false;
    }

    if (filters.ram && p.specs.ram !== filters.ram) {
      return false;
    }

    if (filters.colorId) {
      const hasColor = p.colors.some((c) => c.id === filters.colorId);
      if (!hasColor) return false;
    }

    if (normalizedQuery) {
      const haystack = toEnglishDigits(
        `${p.nameFa} ${p.nameEn} ${p.brand} ${p.specs.chipset} ${p.specs.storageDefault}`
      ).toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
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
      sorted.sort((a, b) => a.releaseOrder - b.releaseOrder);
      break;
  }

  return sorted;
}

export interface CouponEvaluation {
  valid: boolean;
  code: string | null;
  discountAmount: number;
  message: string;
}

export function evaluateCoupon(codeRaw: string, netSubtotal: number): CouponEvaluation {
  const code = toEnglishDigits(codeRaw).trim().toUpperCase();
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
  if (code === 'AMIR-OFF' || code === 'CNA-OFF' || code === 'تخفیف') {
    const discountAmount = Math.min(500_000, netSubtotal);
    return {
      valid: true,
      code: 'AMIR-OFF',
      discountAmount,
      message: `کد تخفیف AMIR-OFF اعمال شد (${formatToman(discountAmount)} تومان کسر گردید).`,
    };
  }
  if (code === 'VIP-10') {
    const discountAmount = Math.min(2_000_000, Math.round(netSubtotal * 0.1));
    return {
      valid: true,
      code: 'VIP-10',
      discountAmount,
      message: `کد تخفیف ۱۰ درصدی VIP-10 اعمال شد (${formatToman(discountAmount)} تومان کسر گردید).`,
    };
  }
  return {
    valid: false,
    code: null,
    discountAmount: 0,
    message: 'کد تخفیف وارد شده معتبر نیست یا منقضی شده است.',
  };
}

export interface CartSummary {
  itemCount: number;
  originalSubtotal: number;
  netSubtotal: number;
  productDiscount: number;
  couponDiscount: number;
  shippingCost: number;
  freeShippingEligible: boolean;
  totalPayable: number;
  totalSavings: number;
}

export function calculateCartSummary(items: CartItem[], couponCode: string | null): CartSummary {
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
    ? evaluateCoupon(couponCode, netSubtotal)
    : { valid: false, code: null, discountAmount: 0, message: '' };
  const couponDiscount = couponEval.valid ? couponEval.discountAmount : 0;

  const afterDiscounts = Math.max(0, netSubtotal - couponDiscount);
  const freeShippingEligible = afterDiscounts >= FREE_SHIPPING_THRESHOLD || items.length === 0;
  const shippingCost = items.length === 0 || freeShippingEligible ? 0 : STANDARD_SHIPPING_FEE;
  const totalPayable = afterDiscounts + shippingCost;
  const totalSavings = productDiscount + couponDiscount;

  return {
    itemCount,
    originalSubtotal,
    netSubtotal,
    productDiscount,
    couponDiscount,
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
