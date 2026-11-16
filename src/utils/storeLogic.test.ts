import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  evaluateCoupon,
  filterAndSortProducts,
  formatToman,
  getVariantPrice,
  toEnglishDigits,
  toPersianDigits,
  validateCheckoutForm,
  validateContactForm,
} from './storeLogic';
import type { CartItem, FilterState, Product } from '../types/store';

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
