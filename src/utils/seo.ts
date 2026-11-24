import type { BlogPostItem, CategoryItem, Product } from '../types/store';

export const SITE_ORIGIN = 'https://amir-mobile-store.codenameamir.ir';
export const DEFAULT_SEO_TITLE =
  'فروشگاه موبایل امیر | خرید گوشی موبایل، تبلت و لوازم جانبی اصل';
export const DEFAULT_SEO_DESCRIPTION =
  'فروشگاه اینترنتی تخصصی موبایل و لوازم جانبی اورجینال با تضمین اصالت، رجیستری قانونی همتا و گارانتی ۱۸ ماهه امیر سرویس.';
export const DEFAULT_OG_IMAGE_PATH = '/icons/icon-512.png';

export type SeoRouteShape =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; slug: string }
  | { page: 'blog' }
  | { page: 'blog-detail'; slug: string }
  | { page: 'compare' }
  | { page: 'installments' }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'order-confirmed'; code: string }
  | { page: 'tracking'; code?: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'faq' }
  | { page: 'terms' }
  | { page: 'account' }
  | { page: 'public-profile'; username: string }
  | { page: 'status' }
  | { page: 'not-found'; path: string };

export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogType: 'website' | 'product' | 'article';
  ogUrl: string;
  ogImage: string;
}

export function getRuntimeSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return SITE_ORIGIN;
}

export function resolveCanonicalUrl(pathname: string, origin = SITE_ORIGIN): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const rawPath = (pathname || '/').split('#')[0].split('?')[0].trim() || '/';
  const withSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const normalized = withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/';
  return `${cleanOrigin}${normalized}`;
}

export function resolveAbsoluteAssetUrl(pathOrUrl: string | undefined, origin = SITE_ORIGIN): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const trimmed = String(pathOrUrl || '').trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('asset:')) {
    return `${cleanOrigin}${DEFAULT_OG_IMAGE_PATH}`;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanOrigin}${normalized}`;
}

export function buildRouteSeoMetadata(params: {
  route: SeoRouteShape;
  categories?: CategoryItem[];
  products?: Product[];
  activeCategory?: string;
  searchQuery?: string;
  origin?: string;
}): RouteSeoMeta {
  const {
    route,
    categories = [],
    products = [],
    activeCategory = 'all',
    searchQuery = '',
    origin = SITE_ORIGIN,
  } = params;

  let title = DEFAULT_SEO_TITLE;
  let description = DEFAULT_SEO_DESCRIPTION;
  let canonicalPath = '/';
  let ogType: 'website' | 'product' | 'article' = 'website';
  let ogImageSource = DEFAULT_OG_IMAGE_PATH;

  switch (route.page) {
    case 'home': {
      title = DEFAULT_SEO_TITLE;
      description = DEFAULT_SEO_DESCRIPTION;
      canonicalPath = '/';
      break;
    }
    case 'catalog': {
      canonicalPath = '/catalog';
      if (activeCategory === 'offers') {
        title = 'پیشنهادات طلایی و تخفیف‌های ویژه | فروشگاه موبایل امیر';
        description =
          'فهرست گوشی‌های پرچمدار و لوازم جانبی تخفیف‌دار با گارانتی ۱۸ ماهه امیر سرویس و ارسال اکسپرس.';
      } else if (activeCategory && activeCategory !== 'all') {
        const activeCat = categories.find(
          (c) => c.slug === activeCategory || c.id === activeCategory
        );
        if (activeCat) {
          title = activeCat.seoTitle || `${activeCat.label} | فروشگاه موبایل امیر`;
          description = activeCat.seoDescription || activeCat.subtitle || DEFAULT_SEO_DESCRIPTION;
        } else {
          title = 'کاتالوگ محصولات | فروشگاه موبایل امیر';
        }
      } else if (searchQuery.trim()) {
        title = `نتایج جستجو: ${searchQuery.trim()} | فروشگاه موبایل امیر`;
        description = `جستجو و مقایسه قیمت ${searchQuery.trim()} با گارانتی معتبر و رجیستری قانونی همتا در فروشگاه موبایل امیر.`;
      } else {
        title = 'کاتالوگ محصولات موبایل و لوازم جانبی | فروشگاه موبایل امیر';
        description =
          'مشاهده و فیلتر جدیدترین گوشی‌های آیفون، سامسونگ، شیائومی، ساعت هوشمند و شارژرهای فست GaN با قیمت لحظه‌ای.';
      }
      break;
    }
    case 'product': {
      canonicalPath = `/product/${encodeURIComponent(route.slug)}`;
      ogType = 'product';
      const prod = products.find((p) => p.slug === route.slug || p.id === route.slug);
      if (prod) {
        title = `${prod.nameFa} | فروشگاه موبایل امیر`;
        description =
          prod.descriptionFa?.trim() ||
          `خرید و بررسی مشخصات ${prod.nameFa} (${prod.brand}) با رجیستری همتا، گارانتی ${prod.warranty} و ارسال سریع.`;
        ogImageSource = prod.image || DEFAULT_OG_IMAGE_PATH;
      } else {
        title = 'مشخصات و خرید محصول | فروشگاه موبایل امیر';
        description = DEFAULT_SEO_DESCRIPTION;
      }
      break;
    }
    case 'blog': {
      canonicalPath = '/blog';
      title = 'مجله تخصصی موبایل امیر | نقد، بررسی و راهنمای خرید';
      description =
        'جدیدترین مقالات تخصصی فناوری، مقایسه پرچمداران اپل و سامسونگ، راهنمای خرید لوازم جانبی اصل و نکات رجیستری همتا.';
      break;
    }
    case 'blog-detail': {
      canonicalPath = `/blog/${encodeURIComponent(route.slug)}`;
      ogType = 'article';
      title = 'مقاله تخصصی | مجله موبایل امیر';
      description =
        'نقد و بررسی تخصصی، مقایسه پرچمداران و راهنمای خرید دقیق در مجله فروشگاه موبایل امیر.';
      break;
    }
    case 'compare': {
      canonicalPath = '/compare';
      title = 'مقایسه تخصصی مشخصات گوشی‌ها | فروشگاه موبایل امیر';
      description =
        'مقایسه فنی صفحه‌نمایش، تراشه، دوربین، باتری و قیمت روز گوشی‌های پرچمدار در کنار هم.';
      break;
    }
    case 'installments': {
      canonicalPath = '/installments';
      title = 'محاسبه‌گر خرید اقساطی موبایل | فروشگاه موبایل امیر';
      description =
        'محاسبه شفاف پیش‌پرداخت و اقساط ماهانه خرید گوشی موبایل، تبلت و گجت با شرایط ویژه فروشگاه موبایل امیر.';
      break;
    }
    case 'faq': {
      canonicalPath = '/faq';
      title = 'پرسش‌های متداول (FAQ) | فروشگاه موبایل امیر';
      description =
        'پاسخ سوالات متداول درباره اصالت کالا، رجیستری همتا، گارانتی ۱۸ ماهه امیر سرویس و زمان ارسال سفارش‌ها.';
      break;
    }
    case 'about': {
      canonicalPath = '/about';
      title = 'درباره فروشگاه موبایل امیر | تضمین اصالت و خدمات پس از فروش';
      description =
        'آشنایی با فروشگاه تخصصی موبایل امیر، استانداردهای کنترل اصالت، رجیستری قانونی همتا و گارانتی امیر سرویس.';
      break;
    }
    case 'contact': {
      canonicalPath = '/contact';
      title = 'تماس و ثبت تیکت پشتیبانی | فروشگاه موبایل امیر';
      description =
        'ارتباط مستقیم با تیم مشاوره خرید، پیگیری سفارش و پشتیبانی فنی فروشگاه موبایل امیر.';
      break;
    }
    case 'terms': {
      canonicalPath = '/terms';
      title = 'شرایط گارانتی، رویه بازگشت و حریم خصوصی | فروشگاه موبایل امیر';
      description =
        'قوانین خرید، شرایط گارانتی ۱۸ ماهه امیر سرویس، مهلت تست ۷ روزه و تعهدات حریم خصوصی کاربران.';
      break;
    }
    case 'tracking': {
      canonicalPath = route.code
        ? `/tracking/${encodeURIComponent(route.code)}`
        : '/tracking';
      title = 'پیگیری وضعیت سفارش | فروشگاه موبایل امیر';
      description =
        'رهگیری لحظه‌ای وضعیت بسته‌بندی، کد مرسوله و زمان تحویل سفارش با شماره سفارش فروشگاه موبایل امیر.';
      break;
    }
    case 'account': {
      canonicalPath = '/account';
      title = 'حساب کاربری | فروشگاه موبایل امیر';
      description = 'مدیریت سفارش‌ها، آدرس‌ها، علاقه‌مندی‌ها و تیکت‌های پشتیبانی در موبایل امیر.';
      break;
    }
    case 'cart':
    case 'checkout': {
      canonicalPath = route.page === 'checkout' ? '/checkout' : '/cart';
      title = 'سبد خرید و تکمیل سفارش | فروشگاه موبایل امیر';
      description = 'بررسی اقلام سبد خرید، اعمال کد تخفیف و ثبت سفارش آنلاین در موبایل امیر.';
      break;
    }
    case 'order-confirmed': {
      canonicalPath = `/order-confirmed/${encodeURIComponent(route.code)}`;
      title = `تایید سفارش ${route.code} | فروشگاه موبایل امیر`;
      break;
    }
    case 'public-profile': {
      canonicalPath = `/u/${encodeURIComponent(route.username)}`;
      title = `پروفایل @${route.username} | فروشگاه موبایل امیر`;
      description = `مشاهده پروفایل عمومی @${route.username} در فروشگاه موبایل امیر.`;
      break;
    }
    case 'status': {
      canonicalPath = '/status';
      title = 'وضعیت فنی سرویس‌ها | فروشگاه موبایل امیر';
      break;
    }
    case 'not-found': {
      canonicalPath = route.path || '/';
      title = 'صفحه یافت نشد (۴۰۴) | فروشگاه موبایل امیر';
      break;
    }
  }

  const canonicalUrl = resolveCanonicalUrl(canonicalPath, origin);
  const ogImage = resolveAbsoluteAssetUrl(ogImageSource, origin);

  return {
    title,
    description,
    canonicalPath,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogType,
    ogUrl: canonicalUrl,
    ogImage,
  };
}

export function buildOrganizationJsonLd(origin = SITE_ORIGIN): Record<string, unknown> {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'فروشگاه موبایل امیر | Amir Mobile Store',
    url: `${cleanOrigin}/`,
    logo: `${cleanOrigin}/icons/icon-512.png`,
    description: DEFAULT_SEO_DESCRIPTION,
  };
}

export function buildProductJsonLd(
  product: Product,
  opts?: {
    siteOrigin?: string;
    reviewCount?: number;
    ratingValue?: number;
  }
): Record<string, unknown> {
  const origin = (opts?.siteOrigin || SITE_ORIGIN).replace(/\/+$/, '');
  const productUrl = resolveCanonicalUrl(`/product/${encodeURIComponent(product.slug)}`, origin);
  const images = (
    product.images && product.images.length > 0 ? product.images : [product.image]
  ).map((img) => resolveAbsoluteAssetUrl(img, origin));

  const reviewCount = Number(opts?.reviewCount ?? product.reviewCount ?? 0);
  const ratingValue = Number(opts?.ratingValue ?? product.rating ?? 0);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameFa,
    alternateName: product.nameEn,
    description:
      product.descriptionFa?.trim() ||
      `خرید ${product.nameFa} (${product.brand}) با گارانتی ${product.warranty} و رجیستری همتا`,
    image: images,
    sku: product.variants?.[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'IRR',
      price: Math.max(0, Math.round((product.price || 0) * 10)),
      availability:
        product.inStock && product.stockCount > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (reviewCount > 0 && ratingValue > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
  siteOrigin = SITE_ORIGIN
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: /^https?:\/\//i.test(item.url)
        ? item.url
        : resolveCanonicalUrl(item.url, siteOrigin),
    })),
  };
}

export function buildBlogPostingJsonLd(
  post: BlogPostItem,
  opts?: { siteOrigin?: string; resolvedCoverImage?: string }
): Record<string, unknown> {
  const origin = (opts?.siteOrigin || SITE_ORIGIN).replace(/\/+$/, '');
  const postUrl = resolveCanonicalUrl(`/blog/${encodeURIComponent(post.slug)}`, origin);
  const coverUrl = resolveAbsoluteAssetUrl(opts?.resolvedCoverImage || post.coverImage, origin);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [coverUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authorName || 'تحریریه موبایل امیر',
    },
    publisher: {
      '@type': 'Organization',
      name: 'فروشگاه موبایل امیر',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icons/icon-512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };
}

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyDocumentSeoMeta(meta: RouteSeoMeta): void {
  if (typeof document === 'undefined') return;
  document.title = meta.title;
  upsertMetaTag('name', 'description', meta.description);
  upsertMetaTag('property', 'og:title', meta.ogTitle);
  upsertMetaTag('property', 'og:description', meta.ogDescription);
  upsertMetaTag('property', 'og:type', meta.ogType);
  upsertMetaTag('property', 'og:url', meta.ogUrl);
  upsertMetaTag('property', 'og:image', meta.ogImage);
  upsertMetaTag('name', 'twitter:title', meta.ogTitle);
  upsertMetaTag('name', 'twitter:description', meta.ogDescription);
  upsertMetaTag('name', 'twitter:image', meta.ogImage);
  upsertLinkTag('canonical', meta.canonicalUrl);
}

export function upsertJsonLdScript(id: string, data: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
}

export function removeJsonLdScript(id: string): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id);
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}
