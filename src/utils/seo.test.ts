import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildRouteSeoMetadata,
  resolveAbsoluteAssetUrl,
  resolveCanonicalUrl,
  SITE_ORIGIN,
} from './seo';
import type { BlogPostItem, Product } from '../types/store';

const SAMPLE_PRODUCT: Product = {
  id: 'iphone-16-pro-max',
  slug: 'iphone-16-pro-max',
  nameFa: 'گوشی موبایل اپل مدل iPhone 16 Pro Max',
  nameEn: 'Apple iPhone 16 Pro Max',
  descriptionFa: 'پرچمدار اپل با بدنه تیتانیومی و تراشه A18 Pro',
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
  reviewCount: 12,
  recommendPercent: 96,
  image: '/assets/iphone.jpg',
  images: ['/assets/iphone.jpg', '/assets/iphone-2.jpg'],
  colorLabel: 'تیتانیوم',
  colors: [{ id: 'desert', name: 'کویری', hex: '#C5B4A0' }],
  storageOptions: [{ label: '۲۵۶ گیگابایت', subtitle: 'ZA/A', priceDelta: 0 }],
  specs: {
    display: '6.9 OLED',
    displayDetails: '120Hz',
    chipset: 'A18 Pro',
    chipsetDetails: '3nm',
    camera: '48MP',
    cameraDetails: '5x Telephoto',
    battery: '4685mAh',
    batteryDetails: 'Fast charge',
    storageDefault: '۲۵۶ گیگابایت',
    ram: '۸ گیگابایت',
    os: 'iOS 18',
  },
  salesRank: 1,
  releaseOrder: 1,
};

test('resolveCanonicalUrl normalizes trailing slashes and queries', () => {
  assert.equal(resolveCanonicalUrl('/'), `${SITE_ORIGIN}/`);
  assert.equal(resolveCanonicalUrl('/catalog/?cat=phones'), `${SITE_ORIGIN}/catalog`);
  assert.equal(resolveCanonicalUrl('blog/my-post/'), `${SITE_ORIGIN}/blog/my-post`);
});

test('resolveAbsoluteAssetUrl handles relative, absolute, and asset: tokens', () => {
  assert.equal(resolveAbsoluteAssetUrl('/images/p1.jpg'), `${SITE_ORIGIN}/images/p1.jpg`);
  assert.equal(resolveAbsoluteAssetUrl('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
  assert.equal(resolveAbsoluteAssetUrl('asset:iphoneCamera'), `${SITE_ORIGIN}/icons/icon-512.png`);
});

test('buildRouteSeoMetadata covers blog, blog-detail, product, and faq routes', () => {
  const blogMeta = buildRouteSeoMetadata({ route: { page: 'blog' } });
  assert.match(blogMeta.title, /مجله تخصصی/);
  assert.equal(blogMeta.canonicalUrl, `${SITE_ORIGIN}/blog`);

  const faqMeta = buildRouteSeoMetadata({ route: { page: 'faq' } });
  assert.equal(faqMeta.canonicalUrl, `${SITE_ORIGIN}/faq`);

  const prodMeta = buildRouteSeoMetadata({
    route: { page: 'product', slug: 'iphone-16-pro-max' },
    products: [SAMPLE_PRODUCT],
  });
  assert.match(prodMeta.title, /iPhone 16 Pro Max/);
  assert.equal(prodMeta.ogType, 'product');
  assert.equal(prodMeta.ogImage, `${SITE_ORIGIN}/assets/iphone.jpg`);
});

test('buildProductJsonLd produces valid Schema.org Product with IRR price and conditional AggregateRating', () => {
  const withRating = buildProductJsonLd(SAMPLE_PRODUCT);
  assert.equal(withRating['@type'], 'Product');
  assert.equal((withRating.brand as Record<string, unknown>).name, 'Apple');
  const offer = withRating.offers as Record<string, unknown>;
  assert.equal(offer.priceCurrency, 'IRR');
  assert.equal(offer.price, 942_000_000);
  assert.equal(offer.availability, 'https://schema.org/InStock');
  assert.equal((withRating.aggregateRating as Record<string, unknown>).reviewCount, 12);

  const noRating = buildProductJsonLd({
    ...SAMPLE_PRODUCT,
    inStock: false,
    stockCount: 0,
    reviewCount: 0,
    rating: 0,
  });
  assert.equal((noRating.offers as Record<string, unknown>).availability, 'https://schema.org/OutOfStock');
  assert.equal(noRating.aggregateRating, undefined);
});

test('buildBreadcrumbJsonLd and buildBlogPostingJsonLd structure items properly', () => {
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'خانه', url: '/' },
    { name: 'گوشی موبایل', url: '/catalog?cat=phones' },
  ]);
  const list = breadcrumb.itemListElement as Array<Record<string, unknown>>;
  assert.equal(list.length, 2);
  assert.equal(list[0].position, 1);
  assert.equal(list[1].item, `${SITE_ORIGIN}/catalog`);

  const post: BlogPostItem = {
    id: 'b1',
    slug: 'test-post',
    title: 'عنوان آزمایشی',
    excerpt: 'خلاصه مقاله',
    content: 'متن کامل مقاله',
    coverImage: 'asset:heroIphone',
    category: 'راهنمای خرید',
    tags: ['تست'],
    authorName: 'امیر',
    readingTimeMinutes: 4,
    isPublished: true,
    publishedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const articleSchema = buildBlogPostingJsonLd(post);
  assert.equal(articleSchema['@type'], 'BlogPosting');
  assert.equal(articleSchema.headline, 'عنوان آزمایشی');
});
