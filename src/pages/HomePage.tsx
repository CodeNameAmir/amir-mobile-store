import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gamepad2,
  Headphones,
  Quote,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Truck,
  Watch,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SmartImage } from '../components/SmartImage';
import { DEFAULT_FILTERS, useStore } from '../context/StoreContext';
import { STORE_ASSETS } from '../data/assets';
import { CUSTOMER_TESTIMONIALS, TECH_ARTICLES } from '../data/catalog';
import type { BrandId, CategoryId } from '../types/store';
import {
  extractAvailableBrands,
  filterAndSortProducts,
  formatToman,
  toPersianDigits,
} from '../utils/storeLogic';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  phones: <Smartphone className="w-6 h-6" />,
  tablets: <Tablet className="w-6 h-6" />,
  smartwatches: <Watch className="w-6 h-6" />,
  audio: <Headphones className="w-6 h-6" />,
  chargers: <BatteryCharging className="w-6 h-6" />,
  cases: <Shield className="w-6 h-6" />,
  gaming: <Gamepad2 className="w-6 h-6" />,
};

interface PromoSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
  discountBadge?: string;
  captionTitle: string;
  captionSub: string;
}

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    brands,
    buildHref,
    handleLinkClick,
    navigateToCatalog,
  } = useStore();
  const [popularBrand, setPopularBrand] = useState<'ALL' | BrandId>('ALL');
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  const flagshipIphone = useMemo(
    () => products.find((p) => p.slug === 'iphone-16-pro-max') || products[0],
    [products]
  );

  const promoSlides = useMemo<PromoSlide[]>(
    () => [
      {
        id: 'iphone-16-hero',
        badge: 'پرچمدار جدید اپل موجود شد · رجیستری رسمی همتا',
        title: 'آیفون ۱۶ پرو مکس تیتانیوم؛ قدرت بی‌رقیب، تحویل فوری',
        subtitle:
          'تراشه ۳ نانومتری A18 Pro، دکمه اختصاصی Camera Control و نمایشگر ۶.۹ اینچی با ۱۸ ماه گارانتی طلایی امیر سرویس.',
        ctaLabel: 'خرید iPhone 16 Pro Max',
        ctaHref: `/product/${flagshipIphone.slug}`,
        secondaryLabel: 'مشاهده تمام گوشی‌ها',
        secondaryHref: '/catalog?cat=phones',
        image: STORE_ASSETS.heroIphone,
        discountBadge: '۴٪ تخفیف',
        captionTitle: 'تضمین پلمپ و کد همتا',
        captionSub: `شروع از ${formatToman(flagshipIphone.price)} تومان`,
      },
      {
        id: 'flagship-camera-promo',
        badge: 'کمپین عکاسی موبایل · هواوی، سامسونگ و شیائومی',
        title: 'دنیای پرچمداران عکاسی با سنسورهای لایکا و XMAGE',
        subtitle:
          'گوشی‌های Huawei Pura 70 Ultra و سری اولترا با زوم اپتیکال حرفه‌ای، رجیستری قطعی و ارسال اکسپرس.',
        ctaLabel: 'مشاهده Huawei Pura 70 Ultra',
        ctaHref: '/product/huawei-pura-70-ultra',
        secondaryLabel: 'فیلتر برند هواوی',
        secondaryHref: '/catalog?brand=Huawei',
        image: STORE_ASSETS.promoShowcase,
        discountBadge: 'جدیدترین موجودی',
        captionTitle: 'پوشش کامل برندهای روز',
        captionSub: 'اپل، سامسونگ، شیائومی و هواوی',
      },
      {
        id: 'anker-power-promo',
        badge: 'جشنواره انرژی اورجینال · گارانتی تعویض ۱۸ ماهه',
        title: 'آداپتورهای فست GaN و پاوربانک‌های پرقدرت انکر',
        subtitle:
          'محافظت هوشمند از سلامت باتری گوشی و لپ‌تاپ با فناوری ActiveShield و پشتیبانی از شارژ ۱۴۰ واتی.',
        ctaLabel: 'مشاهده پاوربانک‌های انکر',
        ctaHref: '/catalog?cat=chargers',
        secondaryLabel: 'تخفیف‌های ویژه',
        secondaryHref: '/catalog?cat=offers',
        image: STORE_ASSETS.ankerCharger,
        discountBadge: 'تا ۱۸٪ تخفیف',
        captionTitle: 'ضمانت اصالت انکر',
        captionSub: 'ارسال رایگان بالای ۱ میلیون تومان',
      },
    ],
    [flagshipIphone]
  );

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || sliderPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [promoSlides.length, sliderPaused]);

  const currentSlide = promoSlides[activeSlide % promoSlides.length];

  const activeCategories = useMemo(
    () =>
      categories
        .filter((c) => c.isActive !== false && !c.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const phoneBrands = useMemo(() => {
    const phones = products.filter((p) => p.category === 'phones' && p.inStock);
    return extractAvailableBrands(phones, brands).slice(0, 6);
  }, [brands, products]);

  const amazingDeals = useMemo(
    () => products.filter((p) => (p.isFeaturedDeal || (p.discountPercent ?? 0) > 0) && p.inStock).slice(0, 4),
    [products]
  );

  const newestProducts = useMemo(
    () =>
      filterAndSortProducts(
        products,
        {
          ...DEFAULT_FILTERS,
          inStockOnly: true,
          sortBy: 'newest',
        },
        categories
      ).slice(0, 4),
    [categories, products]
  );

  const popularPhones = useMemo(() => {
    const phones = [...products.filter((p) => p.category === 'phones' && p.inStock)].sort(
      (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || a.salesRank - b.salesRank
    );
    if (popularBrand === 'ALL') return phones.slice(0, 4);
    return phones.filter((p) => p.brand === popularBrand).slice(0, 4);
  }, [products, popularBrand]);

  return (
    <div className="space-y-12 md:space-y-16 pb-4">
      {/* Promotional Banner Slider (اسلایدر بنرهای تبلیغاتی) */}
      <section
        className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 md:pt-8"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        <div
          data-testid="home-promo-slider"
          className="relative rounded-3xl overflow-hidden bg-gradient-to-bl from-[#0b1c30] via-[#132945] to-[#004ac6] text-white shadow-[0_24px_60px_rgba(11,28,48,0.18)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-10 lg:p-14">
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold text-[#ffdbca]">
                <Sparkles className="w-4 h-4 text-[#ffdbca]" />
                <span>{currentSlide.badge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black leading-[1.35] tracking-tight">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-[#d6e3ff] max-w-xl leading-7">
                {currentSlide.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={buildHref(currentSlide.ctaHref)}
                  onClick={(e) => handleLinkClick(e, currentSlide.ctaHref)}
                  className="w-full sm:w-auto justify-center h-12 px-6 rounded-xl bg-white hover:bg-[#eff4ff] text-[#004ac6] font-extrabold text-sm inline-flex items-center gap-2 shadow-lg transition-colors"
                >
                  <span>{currentSlide.ctaLabel}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
                <a
                  href={buildHref(currentSlide.secondaryHref)}
                  onClick={(e) => handleLinkClick(e, currentSlide.secondaryHref)}
                  className="w-full sm:w-auto justify-center h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 inline-flex items-center transition-colors"
                >
                  {currentSlide.secondaryLabel}
                </a>
              </div>

              {/* Slider Navigation Controls */}
              <div className="flex items-center justify-between pt-3 max-w-lg border-t border-white/15">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="promo-slider-prev"
                    onClick={() =>
                      setActiveSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)
                    }
                    aria-label="اسلاید قبلی"
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    data-testid="promo-slider-next"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % promoSlides.length)}
                    aria-label="اسلاید بعدی"
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-[#93c5fd] mr-2 tabular-nums-fa">
                    {toPersianDigits(activeSlide + 1)} / {toPersianDigits(promoSlides.length)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {promoSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`نمایش بنر ${toPersianDigits(idx + 1)}`}
                      className={`h-2 rounded-full transition-all ${
                        idx === activeSlide ? 'w-7 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/15 shadow-2xl">
                <SmartImage
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  loading="eager"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute bottom-3 right-3 left-3 p-3 rounded-xl bg-[#0b1c30]/85 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{currentSlide.captionTitle}</p>
                    <p className="text-[11px] text-[#93c5fd] tabular-nums-fa">{currentSlide.captionSub}</p>
                  </div>
                  {currentSlide.discountBadge && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#b54e00] text-white text-xs font-extrabold tabular-nums-fa">
                      {currentSlide.discountBadge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Special Discounts Banner (بنر تخفیف‌های ویژه) */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div
          data-testid="special-discounts-banner"
          className="rounded-3xl bg-gradient-to-l from-[#b54e00] via-[#9c4100] to-[#0b1c30] text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_14px_34px_rgba(181,78,0,0.18)]"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/15 text-[#ffdbca] text-xs font-extrabold">
              <Flame className="w-4 h-4" />
              <span>بنر تخفیف‌های ویژه فصل فروشگاه امیر</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              تا ۱۵٪ تخفیف نقدی + ۵۰۰ هزار تومان هدیه کد خرید اول{' '}
              <span dir="ltr" className="inline-block whitespace-nowrap">(AMIR-OFF)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#ffedd5] leading-6">
              تمامی محصولات دارای برچسب پیشنهاد شگفت‌انگیز با ارسال رایگان، گارانتی ۱۸ ماهه و تضمین کمترین قیمت عرضه می‌شوند.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildHref('/catalog?cat=offers')}
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  navigateToCatalog({ category: 'offers', discountedOnly: true });
                }
              }}
              className="h-12 px-6 rounded-xl bg-white hover:bg-[#ffdbca] text-[#8e3c00] font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-colors"
            >
              <span>مشاهده لیست تخفیف‌های ویژه</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Amazing Deals Shelf */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="rounded-3xl bg-[#eff4ff] border border-[#dce9ff] p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#b54e00] text-white flex items-center justify-center shadow-sm shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-[#0b1c30]">
                  پیشنهادات شگفت‌انگیز امیر
                </h2>
                <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
                  تخفیف‌های ویژه محدود روی گوشی‌های پرچمدار و اکسسوری اورجینال
                </p>
              </div>
            </div>

            <a
              href={buildHref('/catalog?cat=offers')}
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  navigateToCatalog({ category: 'offers', discountedOnly: true });
                }
              }}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <span>مشاهده همه تخفیف‌ها</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {amazingDeals.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Category Grid */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              دسته‌بندی‌های تخصصی فروشگاه
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              دسترسی سریع به اکوسیستم کامل موبایل و گجت‌های هوشمند
            </p>
          </div>
          <a
            href={buildHref('/catalog')}
            onClick={(e) => handleLinkClick(e, '/catalog')}
            className="text-xs sm:text-sm font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1"
          >
            <span>همه محصولات</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {activeCategories.map((cat) => (
            <a
              key={cat.id}
              href={buildHref(`/catalog?cat=${encodeURIComponent(cat.slug)}`)}
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  navigateToCatalog({ category: cat.slug as CategoryId });
                }
              }}
              className="group bg-white rounded-2xl border border-[#e5eeff] hover:border-[#2563eb] hover:shadow-[0_12px_28px_rgba(0,74,198,0.08)] p-4 text-center flex flex-col items-center gap-3 transition-all"
            >
              {cat.image ? (
                <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] overflow-hidden border border-[#dce9ff] shrink-0">
                  <SmartImage
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] group-hover:bg-[#004ac6] text-[#004ac6] group-hover:text-white flex items-center justify-center transition-colors">
                  {CATEGORY_ICONS[cat.slug] ?? <Smartphone className="w-6 h-6" />}
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0b1c30]">{cat.label}</p>
                <p className="text-[11px] text-[#434655] mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newest Arrivals Shelf */}
      {newestProducts.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                جدیدترین محصولات فروشگاه امیر
              </h2>
              <p className="text-xs sm:text-sm text-[#434655] mt-1">
                تازه‌ترین کالاهای اضافه‌شده و موجود در انبار با گارانتی رسمی
              </p>
            </div>
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="text-xs sm:text-sm font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>مشاهده همه کالاها</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Smartphones with dynamic Brand Filter */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              پرطرفدارترین گوشی‌های هوشمند
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              پرفروش‌ترین مدل‌های اپل، سامسونگ، شیائومی و هواوی با رجیستری قطعی
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setPopularBrand('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                popularBrand === 'ALL'
                  ? 'bg-[#004ac6] text-white shadow-sm'
                  : 'bg-white border border-[#e5eeff] text-[#434655] hover:border-[#2563eb]'
              }`}
            >
              همه برندها
            </button>
            {phoneBrands.map((bName) => {
              const bObj = brands.find((b) => b.name.toLowerCase() === bName.toLowerCase());
              return (
                <button
                  key={bName}
                  type="button"
                  onClick={() => setPopularBrand(bName)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    popularBrand === bName
                      ? 'bg-[#004ac6] text-white shadow-sm'
                      : 'bg-white border border-[#e5eeff] text-[#434655] hover:border-[#2563eb]'
                  }`}
                >
                  {bObj?.labelFa ? `${bObj.labelFa} (${bName})` : bName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {popularPhones.map((phone) => (
            <ProductCard key={phone.id} product={phone} />
          ))}
        </div>
      </section>

      {/* Anker GaN Accessories Promo Banner */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#e5eeff] overflow-hidden shadow-[0_12px_36px_rgba(11,28,48,0.05)] grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-bold">
              <Zap className="w-4 h-4" />
              <span>اکوسیستم انرژی و فست شارژ انکر (Anker GaNPrime)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[#0b1c30] leading-snug">
              سلامت باتری گوشی پرچمدار خود را با شارژرهای اصلی تضمین کنید
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] leading-7 max-w-xl">
              مجموعه کامل آداپتورهای ۶۵ وات GaN و پاوربانک‌های ۱۴۰ واتی انکر با گارانتی ۱۸ ماهه تعویض و تاییدیه MFi اپل آماده ارسال است.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={buildHref('/product/anker-prime-powerbank-24000')}
                onClick={(e) => handleLinkClick(e, '/product/anker-prime-powerbank-24000')}
                className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <span>مشاهده پاوربانک ۲۴۰۰۰ انکر</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
              <a
                href={buildHref('/catalog?cat=chargers')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=chargers')}
                className="h-11 px-5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs sm:text-sm font-bold inline-flex items-center transition-colors"
              >
                همه شارژرها و پاوربانک‌ها
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 h-64 lg:h-full min-h-[260px] bg-[#f8f9ff]">
            <SmartImage
              src={STORE_ASSETS.ankerCharger}
              alt="شارژر و پاوربانک انکر سری GaN"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Installments, Trade-In & Comparison Services Banner */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-l from-[#eff4ff] via-white to-[#f8f9ff] border border-[#dce9ff] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-extrabold text-[#004ac6]">
              امکانات پیشرفته خرید هوشمند در فروشگاه موبایل امیر
            </p>
            <h2 className="text-lg sm:text-2xl font-black text-[#0b1c30]">
              خرید اقساطی منعطف، معاوضه گوشی کارکرده و مقایسه فنی دقیق
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] leading-6">
              پیش از انتخاب نهایی، مشخصات فنی تا ۳ محصول را کنار هم مقایسه کنید یا قسط ماهانه و مبلغ کسرشده از طرح تعویض گوشی قبلی خود را آنلاین محاسبه نمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildHref('/installments')}
              onClick={(e) => handleLinkClick(e, '/installments')}
              className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>محاسبه‌گر اقساط و تعویض</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
            <a
              href={buildHref('/compare')}
              onClick={(e) => handleLinkClick(e, '/compare')}
              className="h-11 px-5 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#004ac6] text-[#004ac6] text-xs sm:text-sm font-bold inline-flex items-center transition-colors"
            >
              مقایسه تخصصی موبایل‌ها
            </a>
          </div>
        </div>
      </section>

      {/* Why Amir Mobile */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#0b1c30]">استعلام آنی رجیستری و همتا</h3>
          <p className="text-xs text-[#434655] leading-6">
            پیش از تحویل کالا، شناسه IMEI در فاکتور رسمی درج شده و انتقال مالکیت در سامانه همتا به شماره خریدار انجام می‌شود.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#0b1c30]">ناوگان ارسال اختصاصی تهران</h3>
          <p className="text-xs text-[#434655] leading-6">
            سفارش‌های پایتخت با بسته‌بندی ضدضربه و پلمپ امنیتی در بازه ۳ ساعته با پین تحویل اختصاصی تحویل می‌شوند.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#0b1c30]">کد تخفیف خوش‌آمدگویی دمو</h3>
          <p className="text-xs text-[#434655] leading-6">
            برای تست سبد خرید می‌توانید از کد <span className="font-bold text-[#004ac6]" dir="ltr">AMIR-OFF</span> (۵۰۰ هزار تومان) یا <span className="font-bold text-[#004ac6]" dir="ltr">VIP-10</span> (۱۰٪ تخفیف) استفاده کنید.
          </p>
        </div>
      </section>

      {/* Recently Viewed Products Shelf */}
      <RecentlyViewedHomeStrip />

      {/* Tech Magazine Articles */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">مجله تخصصی موبایل امیر</h2>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              نقد و بررسی پرچمداران و راهنمای خرید هوشمندانه
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TECH_ARTICLES.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <a
                href={buildHref(`/product/${art.targetSlug}`)}
                onClick={(e) => handleLinkClick(e, `/product/${art.targetSlug}`)}
                className="aspect-[16/9] bg-[#f8f9ff] overflow-hidden block"
              >
                <SmartImage
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </a>
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#434655]">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#eff4ff] text-[#004ac6] font-bold">
                    {art.tag}
                  </span>
                  <span>{art.date}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#0b1c30] leading-6">{art.title}</h3>
                <p className="text-xs text-[#434655] leading-6 flex-1">{art.excerpt}</p>
                <a
                  href={buildHref(`/product/${art.targetSlug}`)}
                  onClick={(e) => handleLinkClick(e, `/product/${art.targetSlug}`)}
                  className="self-start text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>بررسی محصول مرتبط</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">تجربه خرید مشتریان ما</h2>
          <p className="text-xs sm:text-sm text-[#434655] mt-1">
            رضایت خریداران واقعی از اصالت کالا، سرعت ارسال و پشتیبانی پس از فروش
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CUSTOMER_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-4 flex flex-col"
            >
              <Quote className="w-6 h-6 text-[#004ac6]/30" />
              <p className="text-xs sm:text-sm text-[#0b1c30] leading-7 flex-1">{item.quote}</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#eff4ff]">
                <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#004ac6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  {item.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">{item.name}</p>
                  <p className="text-[11px] text-[#434655]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const RecentlyViewedHomeStrip: React.FC = () => {
  const { recentlyViewedIds, products } = useStore();
  const recentProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .slice(0, 4),
    [recentlyViewedIds, products]
  );

  if (recentProducts.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">بازدیدهای اخیر شما</h2>
          <p className="text-xs sm:text-sm text-[#434655] mt-1">
            بازگشت سریع به محصولاتی که اخیراً بررسی کرده‌اید
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {recentProducts.map((item) => (
          <ProductCard key={item.id} product={item} compact />
        ))}
      </div>
    </section>
  );
};
