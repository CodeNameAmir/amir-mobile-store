import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSearchSuggestions,
  calculateCartSummary,
  calculateInstallmentPlan,
  computeCatalogMaxPrice,
  computeCompareWinners,
  evaluateCoupon,
  extractAvailableBrands,
  extractAvailableColors,
  extractAvailableRamOptions,
  extractAvailableStorageOptions,
  extractFirstNumericSpec,
  filterAndSortProducts,
  formatToman,
  getDescendantCategoryIds,
  getOrderFlowStage,
  getPaymentStatusLabel,
  getVariantPrice,
  isTehranCity,
  matchesProductSearch,
  NATIONAL_POST_SHIPPING_FEE,
  paginateItems,
  resolveDeliverySlot,
  TEHRAN_EXPRESS_SHIPPING_FEE,
  toEnglishDigits,
  toPersianDigits,
  validateCheckoutForm,
  validateContactForm,
} from './storeLogic';
import type { BrandItem, CartItem, CategoryItem, CouponRule, FilterState, Product } from '../types/store';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    slug: 'iphone-16-pro-max',
    nameFa: 'گوشی موبایل اپل مدل iPhone 16 Pro Max',
    nameEn: 'iPhone 16 Pro Max 256GB',
    brand: 'Apple',
    category: 'phones',
    price: 94_200_000,
    originalPrice: 98_000_000,
    discountPercent: 4,
    inStock: true,
    stockCount: 5,
    expressDelivery: true,
    warranty: '۱۸ ماهه امیر سرویس',
    rating: 4.9,
    reviewCount: 142,
    recommendPercent: 96,
    image: '',
    colorLabel: 'تیتانیوم کویری',
    colors: [{ id: 'desert', name: 'تیتانیوم کویری', hex: '#C5B4A0' }],
    storageOptions: [
      { label: '۲۵۶ گیگابایت', subtitle: 'استاندارد', priceDelta: 0 },
      { label: '۵۱۲ گیگابایت', subtitle: 'حرفه‌ای', priceDelta: 12_300_000 },
    ],
    specs: {
      display: '۶.۹ اینچ OLED',
      displayDetails: '120Hz',
      chipset: 'Apple A18 Pro',
      chipsetDetails: '3nm',
      camera: '۴۸ + ۴۸ + ۱۲ MP',
      cameraDetails: '5x',
      battery: '۴۶۸۵ میلی‌آمپر',
      batteryDetails: 'MagSafe',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۸ گیگ',
      os: 'iOS 18',
    },
    salesRank: 1,
    releaseOrder: 1,
  },
  {
    id: 'p2',
    slug: 'galaxy-s24-ultra',
    nameFa: 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra',
    nameEn: 'Galaxy S24 Ultra 256GB',
    brand: 'Samsung',
    category: 'phones',
    price: 63_800_000,
    originalPrice: 68_500_000,
    discountPercent: 7,
    inStock: true,
    stockCount: 3,
    expressDelivery: false,
    warranty: '۱۸ ماهه هماهنگ',
    rating: 4.8,
    reviewCount: 98,
    recommendPercent: 94,
    image: '',
    colorLabel: 'خاکستری تیتانیوم',
    colors: [{ id: 'titanium', name: 'خاکستری تیتانیوم', hex: '#9c9589' }],
    storageOptions: [{ label: '۲۵۶ گیگابایت', subtitle: 'استاندارد', priceDelta: 0 }],
    specs: {
      display: '۶.۸ اینچ AMOLED',
      displayDetails: '120Hz',
      chipset: 'Snapdragon 8 Gen 3',
      chipsetDetails: '4nm',
      camera: '۲۰۰ مگاپیکسل',
      cameraDetails: '5x',
      battery: '۵۰۰۰ میلی‌آمپر',
      batteryDetails: '45W',
      storageDefault: '۲۵۶ گیگابایت',
      ram: '۱۲ گیگ',
      os: 'Android 14',
    },
    salesRank: 2,
    releaseOrder: 2,
  },
  {
    id: 'p3',
    slug: 'iphone-15-pro',
    nameFa: 'گوشی موبایل اپل مدل iPhone 15 Pro',
    nameEn: 'iPhone 15 Pro 128GB',
    brand: 'Apple',
    category: 'phones',
    price: 64_200_000,
    inStock: false,
    stockCount: 0,
    expressDelivery: false,
    warranty: '۱۸ ماهه امیر سرویس',
    rating: 4.7,
    reviewCount: 64,
    recommendPercent: 91,
    image: '',
    colorLabel: 'آبی تیتانیوم',
    colors: [{ id: 'midnight', name: 'آبی تیره', hex: '#1e293b' }],
    storageOptions: [{ label: '۱۲۸ گیگابایت', subtitle: 'پایه', priceDelta: 0 }],
    specs: {
      display: '۶.۱ اینچ OLED',
      displayDetails: '120Hz',
      chipset: 'Apple A17 Pro',
      chipsetDetails: '3nm',
      camera: '۴۸ مگاپیکسل',
      cameraDetails: '3x',
      battery: '۳۲۷۴ میلی‌آمپر',
      batteryDetails: 'MagSafe',
      storageDefault: '۱۲۸ گیگابایت',
      ram: '۸ گیگ',
      os: 'iOS 17',
    },
    salesRank: 3,
    releaseOrder: 3,
  },
];

const defaultFilters: FilterState = {
  category: 'all',
  searchQuery: '',
  brands: [],
  inStockOnly: false,
  discountedOnly: false,
  expressOnly: false,
  minPrice: 0,
  maxPrice: 200_000_000,
  storage: null,
  ram: null,
  colorId: null,
  sortBy: 'newest',
};

test('Persian digit and Toman formatting work deterministically', () => {
  assert.equal(toPersianDigits('94200000'), '۹۴۲۰۰۰۰۰');
  assert.equal(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹'), '09123456789');
  assert.equal(formatToman(94_200_000), '۹۴٬۲۰۰٬۰۰۰');
});

test('getVariantPrice adjusts price for storage variants', () => {
  const base = getVariantPrice(sampleProducts[0], '۲۵۶ گیگابایت');
  assert.equal(base.price, 94_200_000);
  const upgraded = getVariantPrice(sampleProducts[0], '۵۱۲ گیگابایت');
  assert.equal(upgraded.price, 106_500_000);
  assert.equal(upgraded.originalPrice, 110_300_000);
});

test('filterAndSortProducts filters by brand, stock, search, and sorts by price', () => {
  const appleInStock = filterAndSortProducts(sampleProducts, {
    ...defaultFilters,
    brands: ['Apple'],
    inStockOnly: true,
  });
  assert.equal(appleInStock.length, 1);
  assert.equal(appleInStock[0].id, 'p1');

  const sortedCheapest = filterAndSortProducts(sampleProducts, {
    ...defaultFilters,
    sortBy: 'cheapest',
  });
  assert.deepEqual(
    sortedCheapest.map((p) => p.id),
    ['p2', 'p3', 'p1']
  );

  const searchResult = filterAndSortProducts(sampleProducts, {
    ...defaultFilters,
    searchQuery: 'S24',
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 'p2');

  assert.equal(matchesProductSearch(sampleProducts[0], 'آیفون'), true);
  assert.equal(matchesProductSearch(sampleProducts[1], 'گلکسی اولترا'), true);
});

test('calculateCartSummary computes discounts, coupons, and free shipping accurately', () => {
  const items: CartItem[] = [
    {
      key: 'p1-desert-256',
      productId: 'p1',
      slug: 'iphone-16-pro-max',
      nameFa: 'آیفون ۱۶ پرو مکس',
      brand: 'Apple',
      image: '',
      colorName: 'کویری',
      colorHex: '#C5B4A0',
      storageLabel: '۲۵۶ گیگابایت',
      warranty: '۱۸ ماهه',
      unitPrice: 94_200_000,
      originalUnitPrice: 98_000_000,
      qty: 1,
      stockCount: 5,
    },
  ];

  const summary = calculateCartSummary(items, 'AMIR-OFF');
  assert.equal(summary.itemCount, 1);
  assert.equal(summary.originalSubtotal, 98_000_000);
  assert.equal(summary.productDiscount, 3_800_000);
  assert.equal(summary.couponDiscount, 500_000);
  assert.equal(summary.shippingCost, 0);
  assert.equal(summary.totalPayable, 93_700_000);
  assert.equal(summary.totalSavings, 4_300_000);

  const invalidCoupon = evaluateCoupon('BADCODE', 5_000_000);
  assert.equal(invalidCoupon.valid, false);
});

test('evaluateCoupon supports dynamic admin-defined Supabase coupon rules', () => {
  const adminRules: CouponRule[] = [
    {
      code: 'ADMIN-2M',
      discountType: 'fixed',
      discountValue: 2_000_000,
      minOrderAmount: 20_000_000,
    },
  ];
  const denied = evaluateCoupon('ADMIN-2M', 10_000_000, adminRules);
  assert.equal(denied.valid, false);
  const applied = evaluateCoupon('ADMIN-2M', 30_000_000, adminRules);
  assert.equal(applied.valid, true);
  assert.equal(applied.discountAmount, 2_000_000);
});

test('calculateCartSummary applies shipping fee below threshold', () => {
  const lowItem: CartItem[] = [
    {
      key: 'cable',
      productId: 'c1',
      slug: 'anker-cable',
      nameFa: 'کابل انکر',
      brand: 'Anker',
      image: '',
      colorName: 'مشکی',
      colorHex: '#111',
      storageLabel: '۱.۸ متر',
      warranty: '۱۲ ماهه',
      unitPrice: 600_000,
      originalUnitPrice: 600_000,
      qty: 1,
      stockCount: 10,
    },
  ];
  const summary = calculateCartSummary(lowItem, null);
  assert.equal(summary.freeShippingEligible, false);
  assert.equal(summary.shippingCost, 150_000);
  assert.equal(summary.totalPayable, 750_000);
});

test('calculateInstallmentPlan returns accurate figures and getPaymentStatusLabel formats payment states honestly', () => {
  const plan = calculateInstallmentPlan(100_000_000, 30, 12, 2);
  assert.equal(plan.downPaymentAmount, 30_000_000);
  assert.equal(plan.financedAmount, 70_000_000);
  // 2% * 12 = 24% fee on 70M = 16.8M => total installments 86.8M
  assert.equal(plan.totalInstallmentsAmount, 86_800_000);
  assert.equal(plan.totalPayableWithPlan, 116_800_000);

  assert.match(getPaymentStatusLabel('unpaid'), /پرداخت‌نشده/);
  assert.equal(getPaymentStatusLabel('paid'), 'پرداخت‌شده');
  assert.equal(getPaymentStatusLabel('pending_gateway'), 'در انتظار پرداخت آنلاین');
  assert.equal(getPaymentStatusLabel('not_required'), 'نیاز به پرداخت آنلاین ندارد');
});

test('evaluateCoupon enforces isActive, startsAt, expiresAt, and usageLimit lifecycle rules', () => {
  const now = new Date('2026-11-27T12:00:00Z');
  const rules: CouponRule[] = [
    {
      code: 'INACTIVE-1',
      discountType: 'fixed',
      discountValue: 500_000,
      isActive: false,
    },
    {
      code: 'FUTURE-1',
      discountType: 'fixed',
      discountValue: 500_000,
      isActive: true,
      startsAt: '2026-12-01T00:00:00Z',
    },
    {
      code: 'EXPIRED-1',
      discountType: 'fixed',
      discountValue: 500_000,
      isActive: true,
      expiresAt: '2026-11-20T00:00:00Z',
    },
    {
      code: 'MAXED-1',
      discountType: 'fixed',
      discountValue: 500_000,
      isActive: true,
      usageLimit: 5,
      usedCount: 5,
    },
    {
      code: 'LIVE-1',
      discountType: 'percent',
      discountValue: 10,
      maxDiscount: 1_500_000,
      isActive: true,
      startsAt: '2026-11-01T00:00:00Z',
      expiresAt: '2026-12-10T00:00:00Z',
      usageLimit: 5,
      usedCount: 2,
    },
  ];

  assert.equal(evaluateCoupon('INACTIVE-1', 10_000_000, rules, now).valid, false);
  assert.equal(evaluateCoupon('FUTURE-1', 10_000_000, rules, now).valid, false);
  assert.equal(evaluateCoupon('EXPIRED-1', 10_000_000, rules, now).valid, false);
  assert.equal(evaluateCoupon('MAXED-1', 10_000_000, rules, now).valid, false);

  const ok = evaluateCoupon('LIVE-1', 10_000_000, rules, now);
  assert.equal(ok.valid, true);
  assert.equal(ok.discountAmount, 1_000_000);
});

test('validateCheckoutForm and validateContactForm catch invalid inputs', () => {
  const checkoutErrors = validateCheckoutForm({
    fullName: 'عل',
    phone: '1234',
    city: '',
    address: 'تهران',
    postalCode: '123',
    deliverySlot: 'express',
  });
  assert.ok(checkoutErrors.fullName);
  assert.ok(checkoutErrors.phone);
  assert.ok(checkoutErrors.city);
  assert.ok(checkoutErrors.address);
  assert.ok(checkoutErrors.postalCode);

  const validCheckout = validateCheckoutForm({
    fullName: 'علیرضا محمدی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    city: 'تهران',
    address: 'زعفرانیه، خیابان مقدس اردبیلی، پلاک ۸۴، واحد ۱۲',
    postalCode: '۱۹۸۸۲۳۳۱۴۵',
    deliverySlot: 'express',
  });
  assert.deepEqual(validCheckout, {});

  const contactErrors = validateContactForm({
    fullName: 'آ',
    phone: '021',
    department: 'tech',
    orderCode: '',
    message: 'کوتاه',
  });
  assert.ok(contactErrors.fullName);
  assert.ok(contactErrors.phone);
  assert.ok(contactErrors.message);
});

test('high-priced newly added DB products (>150M) are not hidden and sort first in newest', () => {
  const iphone17: Product = {
    ...sampleProducts[0],
    id: 'apple-iphone-17-pro-max',
    slug: 'apple-iphone-17-pro-max',
    nameFa: 'گوشی موبایل ایفون 17 پرومکس',
    nameEn: 'Apple Iphone 17 PRO MAX',
    price: 300_000_000,
    originalPrice: 325_500_000,
    discountPercent: 8,
    releaseOrder: 100,
    createdAt: '2026-11-18 19:40:56.264447+00',
  };

  assert.equal(computeCatalogMaxPrice(sampleProducts), 150_000_000);
  assert.equal(computeCatalogMaxPrice([...sampleProducts, iphone17]), 300_000_000);

  const results = filterAndSortProducts([...sampleProducts, iphone17], {
    ...defaultFilters,
    maxPrice: Infinity,
    sortBy: 'newest',
  });
  assert.equal(results[0]?.id, 'apple-iphone-17-pro-max');

  assert.equal(matchesProductSearch(iphone17, 'ایفون 17 پرومکس'), true);
  assert.equal(matchesProductSearch(iphone17, 'آیفون ۱۷ پرومکس'), true);
});

test('typo-tolerant search, nested category filtering, dual price range, dynamic colors/brands, suggestions, pagination, and order stages', () => {
  const huaweiProd: Product = {
    ...sampleProducts[1],
    id: 'huawei-pura-70',
    slug: 'huawei-pura-70',
    nameFa: 'گوشی موبایل هواوی مدل Pura 70 Ultra',
    nameEn: 'Huawei Pura 70 Ultra 512GB',
    brand: 'Huawei',
    category: 'flagship-phones',
    price: 78_000_000,
    colors: [{ id: 'chanson-green', name: 'سبز زمردی', hex: '#2D6A4F' }],
    customSpecs: [{ label: 'دوربین جمع‌شونده', value: 'Retractable 1-inch' }],
  };
  const extended = [...sampleProducts, huaweiProd];

  // Typo-tolerant and alias matching
  assert.equal(matchesProductSearch(sampleProducts[0], 'ifone 16'), true);
  assert.equal(matchesProductSearch(huaweiProd, 'هواوی پورا'), true);
  assert.equal(matchesProductSearch(huaweiProd, 'Retractable'), true);

  // Nested category descendants
  const nestedCats: CategoryItem[] = [
    { id: 'phones', slug: 'phones', label: 'گوشی', subtitle: '', parentId: null, isActive: true, image: '', seoTitle: '', seoDescription: '', sortOrder: 1 },
    { id: 'flagship-phones', slug: 'flagship-phones', label: 'پرچمدار', subtitle: '', parentId: 'phones', isActive: true, image: '', seoTitle: '', seoDescription: '', sortOrder: 2 },
  ];
  const descendants = getDescendantCategoryIds(nestedCats, 'phones');
  assert.equal(descendants.has('flagship-phones'), true);

  const phonesIncludingFlagships = filterAndSortProducts(
    extended,
    { ...defaultFilters, category: 'phones' },
    nestedCats
  );
  assert.equal(phonesIncludingFlagships.some((p) => p.id === 'huawei-pura-70'), true);

  // Dual min/max price filtering
  const midPriced = filterAndSortProducts(extended, {
    ...defaultFilters,
    minPrice: 70_000_000,
    maxPrice: 85_000_000,
  });
  assert.deepEqual(midPriced.map((p) => p.id), ['huawei-pura-70']);

  // Dynamic colors and brands
  const availColors = extractAvailableColors(extended);
  assert.equal(availColors.some((c) => c.id === 'chanson-green'), true);
  const customBrands: BrandItem[] = [{ id: 'huawei', name: 'Huawei', labelFa: 'هواوی', isActive: true }];
  const availBrands = extractAvailableBrands(extended, customBrands);
  assert.equal(availBrands.includes('Huawei'), true);

  // Suggestions + pagination
  const suggestions = buildSearchSuggestions('هواوی', extended, nestedCats, customBrands);
  assert.equal(suggestions.products[0]?.id, 'huawei-pura-70');
  assert.equal(suggestions.brands[0]?.name, 'Huawei');

  const page1 = paginateItems(extended, 1, 2);
  const page2 = paginateItems(extended, 2, 2);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.totalPages, 2);
  assert.equal(page2.items.length, 2);

  // Invoice / Tracking status stage calculation
  assert.equal(getOrderFlowStage('pending_payment').activeStageIndex, 0);
  assert.equal(getOrderFlowStage('pending_payment').isCancelled, false);
  assert.equal(getOrderFlowStage('paid').activeStageIndex, 0);
  assert.equal(getOrderFlowStage('preparing').activeStageIndex, 1);
  assert.equal(getOrderFlowStage('shipped').activeStageIndex, 2);
  assert.equal(getOrderFlowStage('delivered').isDelivered, true);
  assert.equal(getOrderFlowStage('delivered').activeStageIndex, 3);
  assert.equal(getOrderFlowStage('cancelled').isCancelled, true);
  assert.equal(getOrderFlowStage('cancelled').activeStageIndex, -1);
});

test('city-based shipping differentiates Tehran express vs National Post and auto-falls back outside Tehran', () => {
  assert.equal(isTehranCity('تهران'), true);
  assert.equal(isTehranCity('تهران / شمیرانات'), true);
  assert.equal(isTehranCity('Tehran'), true);
  assert.equal(isTehranCity('شیراز'), false);
  assert.equal(isTehranCity('اصفهان'), false);

  assert.equal(resolveDeliverySlot('تهران', 'express'), 'express');
  assert.equal(resolveDeliverySlot('شیراز', 'express'), 'standard');

  const lowCart: CartItem[] = [
    {
      key: 'cable',
      productId: 'c1',
      slug: 'cable',
      nameFa: 'کابل',
      brand: 'Anker',
      image: '',
      colorName: 'مشکی',
      colorHex: '#111',
      storageLabel: '۱.۸ متر',
      warranty: '۱۲ ماهه',
      unitPrice: 600_000,
      originalUnitPrice: 600_000,
      qty: 1,
      stockCount: 10,
    },
  ];

  const tehranExpress = calculateCartSummary(lowCart, null, undefined, 1_000_000, {
    city: 'تهران',
    deliverySlot: 'express',
  });
  assert.equal(tehranExpress.shippingCost, TEHRAN_EXPRESS_SHIPPING_FEE);

  const shirazForcedStandard = calculateCartSummary(lowCart, null, undefined, 1_000_000, {
    city: 'شیراز',
    deliverySlot: 'express',
  });
  assert.equal(shirazForcedStandard.shippingCost, NATIONAL_POST_SHIPPING_FEE);

  const tehranStandard = calculateCartSummary(lowCart, null, undefined, 1_000_000, {
    city: 'تهران',
    deliverySlot: 'standard',
  });
  assert.equal(tehranStandard.shippingCost, NATIONAL_POST_SHIPPING_FEE);
});

test('validateCheckoutForm validates optional guest receipt email only when provided', () => {
  const invalidEmailErrors = validateCheckoutForm({
    fullName: 'علیرضا محمدی',
    phone: '09123456789',
    email: 'invalid-email',
    city: 'تهران',
    address: 'زعفرانیه، خیابان مقدس اردبیلی، پلاک ۸۴',
    postalCode: '1988233145',
    deliverySlot: 'express',
  });
  assert.ok(invalidEmailErrors.email);

  const validEmailErrors = validateCheckoutForm({
    fullName: 'علیرضا محمدی',
    phone: '09123456789',
    email: 'guest@codenameamir.ir',
    city: 'شیراز',
    address: 'بلوار چمران، پلاک ۱۰، واحد ۲',
    postalCode: '7194612345',
    deliverySlot: 'standard',
  });
  assert.deepEqual(validEmailErrors, {});
});

test('Phase 3: biggest_discount sort, OOS-last natural order, dynamic storage/RAM chips, attribute filtering & compare winners', () => {
  const highDiscountInStock: Product = {
    ...sampleProducts[1],
    id: 'p-big-discount',
    slug: 'p-big-discount',
    price: 40_000_000,
    originalPrice: 50_000_000,
    discountPercent: 20,
    inStock: true,
    stockCount: 4,
    specs: { ...sampleProducts[1].specs, ram: '۱۶ گیگ', storageDefault: '۱ ترابایت' },
    storageOptions: [{ label: '۱ ترابایت', subtitle: 'حرفه‌ای', priceDelta: 0 }],
    attributeValues: [
      { attributeId: 'a1', productId: 'p-big-discount', code: 'screen_hz', nameFa: 'نرخ نوسازی', nameEn: 'Refresh Rate', dataType: 'number', valueNumber: 144, displayValue: '۱۴۴ Hz' },
      { attributeId: 'a2', productId: 'p-big-discount', code: 'battery_mah', nameFa: 'ظرفیت باتری', nameEn: 'Battery', dataType: 'number', valueNumber: 5500, displayValue: '۵۵۰۰ mAh' },
      { attributeId: 'a3', productId: 'p-big-discount', code: 'nfc', nameFa: 'NFC', nameEn: 'NFC', dataType: 'boolean', valueBoolean: true, displayValue: 'دارد' },
    ],
  };
  const oosHighDiscount: Product = {
    ...sampleProducts[2],
    id: 'p-oos-discount',
    slug: 'p-oos-discount',
    price: 30_000_000,
    originalPrice: 60_000_000,
    discountPercent: 50,
    inStock: false,
    stockCount: 0,
    attributeValues: [
      { attributeId: 'a1', productId: 'p-oos-discount', code: 'screen_hz', nameFa: 'نرخ نوسازی', nameEn: 'Refresh Rate', dataType: 'number', valueNumber: 120, displayValue: '۱۲۰ Hz' },
      { attributeId: 'a2', productId: 'p-oos-discount', code: 'battery_mah', nameFa: 'ظرفیت باتری', nameEn: 'Battery', dataType: 'number', valueNumber: 4000, displayValue: '۴۰۰۰ mAh' },
    ],
  };

  const catalog = [...sampleProducts, highDiscountInStock, oosHighDiscount];

  // biggest_discount keeps in-stock before out-of-stock, then descending discount %
  const byDiscount = filterAndSortProducts(catalog, {
    ...defaultFilters,
    sortBy: 'biggest_discount',
  });
  assert.equal(byDiscount[0]?.id, 'p-big-discount');
  assert.equal(byDiscount[byDiscount.length - 1]?.inStock, false);

  // cheapest stays pure ascending price
  const byCheapest = filterAndSortProducts(catalog, {
    ...defaultFilters,
    sortBy: 'cheapest',
  });
  assert.equal(byCheapest[0]?.id, 'p-oos-discount');

  // Dynamic attribute filtering
  const filteredByHz = filterAndSortProducts(catalog, {
    ...defaultFilters,
    attributeFilters: { screen_hz: '144', nfc: 'true' },
  });
  assert.deepEqual(
    filteredByHz.map((p) => p.id),
    ['p-big-discount']
  );

  // Dynamic storage & RAM extraction
  const storages = extractAvailableStorageOptions(catalog);
  assert.ok(storages.includes('۱۲۸ گیگابایت'));
  assert.ok(storages.includes('۲۵۶ گیگابایت'));
  assert.ok(storages.includes('۵۱۲ گیگابایت'));
  assert.ok(storages.includes('۱ ترابایت'));

  const rams = extractAvailableRamOptions([
    ...catalog,
    {
      ...sampleProducts[0],
      id: 'charger-no-ram',
      specs: { ...sampleProducts[0].specs, ram: 'ندارد', storageDefault: 'ندارد' },
    },
  ]);
  assert.ok(rams.includes('۸ گیگ'));
  assert.ok(rams.includes('۱۲ گیگ'));
  assert.ok(rams.includes('۱۶ گیگ'));
  assert.equal(rams.includes('ندارد'), false);

  // Numeric parser & compare winners
  assert.equal(extractFirstNumericSpec('۵٬۰۰۰ میلی‌آمپر'), 5000);
  assert.equal(extractFirstNumericSpec('ندارد'), null);

  const sampleWithBatteryAttr: Product = {
    ...sampleProducts[0],
    attributeValues: [
      {
        attributeId: 'a2',
        productId: 'p1',
        code: 'battery_mah',
        nameFa: 'ظرفیت باتری',
        nameEn: 'Battery',
        dataType: 'number',
        valueNumber: 4685,
        displayValue: '۴۶۸۵ mAh',
      },
    ],
  };
  const winners = computeCompareWinners([sampleWithBatteryAttr, highDiscountInStock]);
  assert.equal(winners.price, 'p-big-discount');
  assert.equal(winners.ram, 'p-big-discount');
  assert.equal(winners.battery, 'p-big-discount');
  assert.equal(winners['attr:battery_mah'], 'p-big-discount');
});

test('extractAvailableColors, extractAvailableStorageOptions, extractAvailableRamOptions deduplicate equivalent variants and filterAndSortProducts matches them', () => {
  const dupCatalog: Product[] = [
    {
      ...sampleProducts[0],
      id: 'dup-1',
      colors: [
        { id: 'blue-1', name: 'آبی', hex: '#0000FF' },
        { id: 'black-1', name: 'مشکی', hex: '#000000' },
        { id: 'navy-1', name: 'سرمه ای', hex: '#002171' },
      ],
      specs: { ...sampleProducts[0].specs, storageDefault: '۵۱۲ گیگ', ram: '۸ گیگ' },
      storageOptions: [{ label: '۵۱۲ گیگ', subtitle: 'پایه', priceDelta: 0 }],
    },
    {
      ...sampleProducts[1],
      id: 'dup-2',
      colors: [
        { id: 'blue-4', name: 'آبی', hex: '#0000FF' },
        { id: 'midnight', name: 'مشکی', hex: '#1e293b' },
        { id: 'navy-3', name: 'سرمه‌ای', hex: '#002171' },
      ],
      specs: { ...sampleProducts[1].specs, storageDefault: '۵۱۲ گیگابایت', ram: '۸ گیگابایت' },
      storageOptions: [{ label: '۵۱۲ گیگابایت', subtitle: 'استاندارد', priceDelta: 0 }],
    },
    {
      ...sampleProducts[2],
      id: 'dup-3',
      colors: [{ id: 'blue-2', name: 'آبی', hex: '#0000FF' }],
      specs: { ...sampleProducts[2].specs, storageDefault: '۲۵۶ گیگابایت', ram: '۱۲ گیگ' },
      storageOptions: [{ label: '۲۵۶ گیگابایت', subtitle: 'استاندارد', priceDelta: 0 }],
    },
  ];

  const colors = extractAvailableColors(dupCatalog);
  assert.equal(colors.filter((c) => c.label === 'آبی').length, 1);
  assert.equal(colors.find((c) => c.label === 'آبی')?.count, 3);
  assert.equal(colors.filter((c) => c.label === 'مشکی').length, 1);
  assert.equal(colors.find((c) => c.label === 'مشکی')?.count, 2);
  assert.equal(colors.filter((c) => c.label.replace(/\s+/g, '') === 'سرمهای').length, 1);

  const storages = extractAvailableStorageOptions(dupCatalog);
  assert.deepEqual(storages, ['۲۵۶ گیگابایت', '۵۱۲ گیگابایت']);

  const rams = extractAvailableRamOptions(dupCatalog);
  assert.deepEqual(rams, ['۸ گیگابایت', '۱۲ گیگ']);

  const blueFiltered = filterAndSortProducts(dupCatalog, { ...defaultFilters, colorId: 'آبی' });
  assert.equal(blueFiltered.length, 3);

  const blackFiltered = filterAndSortProducts(dupCatalog, { ...defaultFilters, colorId: 'مشکی' });
  assert.equal(blackFiltered.length, 2);

  const storageFiltered = filterAndSortProducts(dupCatalog, {
    ...defaultFilters,
    storage: '۵۱۲ گیگابایت',
  });
  assert.equal(storageFiltered.length, 2);

  const ramFiltered = filterAndSortProducts(dupCatalog, {
    ...defaultFilters,
    ram: '۸ گیگابایت',
  });
  assert.equal(ramFiltered.length, 2);
});
