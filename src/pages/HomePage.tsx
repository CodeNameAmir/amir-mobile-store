import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  Quote,
  Shield,
  ShieldCheck,
  Smartphone,
  Tablet,
  Tag,
  Truck,
  Watch,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
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
  phones: <Smartphone className="w-5 h-5" strokeWidth={1.5} />,
  tablets: <Tablet className="w-5 h-5" strokeWidth={1.5} />,
  smartwatches: <Watch className="w-5 h-5" strokeWidth={1.5} />,
  audio: <Headphones className="w-5 h-5" strokeWidth={1.5} />,
  chargers: <BatteryCharging className="w-5 h-5" strokeWidth={1.5} />,
  cases: <Shield className="w-5 h-5" strokeWidth={1.5} />,
  gaming: <Gamepad2 className="w-5 h-5" strokeWidth={1.5} />,
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
    productsLoading,
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
        badge: 'پرچمدار جدید اپل · رجیستری رسمی همتا',
        title: 'آیفون ۱۶ پرو مکس تیتانیوم با رجیستری رسمی همتا',
        subtitle:
          'تراشه ۳ نانومتری A18 Pro، دکمه اختصاصی Camera Control و نمایشگر ۶.۹ اینچی با ۱۸ ماه گارانتی طلایی امیر سرویس.',
        ctaLabel: 'خرید iPhone 16 Pro Max',
        ctaHref: flagshipIphone ? `/product/${flagshipIphone.slug}` : '/product/iphone-16-pro-max',
        secondaryLabel: 'مشاهده تمام گوشی‌ها',
        secondaryHref: '/catalog?cat=phones',
        image: STORE_ASSETS.heroIphone,
        discountBadge: '۴٪ تخفیف',
        captionTitle: 'تضمین پلمپ و کد همتا',
        captionSub: flagshipIphone ? `شروع از ${formatToman(flagshipIphone.price)} تومان` : '',
      },
      {
        id: 'flagship-camera-promo',
        badge: 'عکاسی موبایل · هواوی، سامسونگ و شیائومی',
        title: 'پرچمداران عکاسی با سنسورهای لایکا و XMAGE',
        subtitle:
          'گوشی‌های Huawei Pura 70 Ultra و سری اولترا با زوم اپتیکال حرفه‌ای، رجیستری قطعی و ارسال اکسپرس.',
        ctaLabel: 'مشاهده Huawei Pura 70 Ultra',
        ctaHref: '/product/huawei-pura-70-ultra',
        secondaryLabel: 'فیلتر برند هواوی',
        secondaryHref: '/catalog?brand=Huawei',
        image: STORE_ASSETS.promoShowcase,
        discountBadge: 'موجودی جدید',
        captionTitle: 'پوشش کامل برندهای روز',
        captionSub: 'اپل، سامسونگ، شیائومی و هواوی',
      },
      {
        id: 'anker-power-promo',
        badge: 'تجهیزات انرژی اورجینال · گارانتی تعویض ۱۸ ماهه',
        title: 'آداپتورهای فست GaN و پاوربانک‌های انکر',
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
      {/* Promotional Banner Slider */}
      <section
        className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 md:pt-8"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        <div
          data-testid="home-promo-slider"
          className="relative rounded-2xl overflow-hidden bg-[#13171F] border border-[#232936] text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-10 lg:p-12">
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-[#CBD5E1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] shrink-0" />
                <span>{currentSlide.badge}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-semibold leading-[1.4]">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-[#A3B0C2] max-w-xl leading-7 font-normal">
                {currentSlide.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={buildHref(currentSlide.ctaHref)}
                  onClick={(e) => handleLinkClick(e, currentSlide.ctaHref)}
                  className="w-full sm:w-auto justify-center h-11 px-6 rounded-lg bg-white hover:bg-[#F1F3F6] text-[#11161E] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>{currentSlide.ctaLabel}</span>
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href={buildHref(currentSlide.secondaryHref)}
                  onClick={(e) => handleLinkClick(e, currentSlide.secondaryHref)}
                  className="w-full sm:w-auto justify-center h-11 px-5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/15 inline-flex items-center transition-colors"
                >
                  {currentSlide.secondaryLabel}
                </a>
              </div>

              {/* Slider Navigation Controls */}
              <div className="flex items-center justify-between pt-4 max-w-lg border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="promo-slider-prev"
                    onClick={() =>
                      setActiveSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)
                    }
                    aria-label="اسلاید قبلی"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    data-testid="promo-slider-next"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % promoSlides.length)}
                    aria-label="اسلاید بعدی"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span dir="ltr" className="text-xs font-medium text-[#94A3B8] mr-2 tabular-nums-fa inline-block">
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
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                        idx === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/55'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[440px] rounded-xl overflow-hidden bg-[#1B212C] border border-white/10">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <SmartImage
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3.5 bg-[#161B24] border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{currentSlide.captionTitle}</p>
                    {currentSlide.captionSub && (
                      <p className="text-[11px] text-[#94A3B8] tabular-nums-fa mt-0.5 truncate">
                        {currentSlide.captionSub}
                      </p>
                    )}
                  </div>
                  {currentSlide.discountBadge && (
                    <span className="px-2.5 py-1 rounded-md bg-[#A84500] text-white text-[11px] font-medium tabular-nums-fa shrink-0">
                      {currentSlide.discountBadge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Special Discounts Strip */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div
          data-testid="special-discounts-banner"
          className="rounded-2xl bg-white border border-[#E4E8EE] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FDF1E8] border border-[#F5D6BE] text-[#A84500] text-xs font-medium">
              <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>تخفیف‌های فصلی فروشگاه امیر</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold text-[#11161E] leading-snug">
              تا ۱۵٪ تخفیف نقدی + ۵۰۰ هزار تومان هدیه کد خرید اول{' '}
              <span dir="ltr" className="font-mono text-base sm:text-xl text-[#1453D6] inline-block whitespace-nowrap">
                AMIR-OFF
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
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
              className="h-11 px-5 rounded-lg bg-[#13171F] hover:bg-[#1453D6] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>مشاهده لیست تخفیف‌های ویژه</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </section>

      {/* Amazing Deals Shelf */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="rounded-2xl bg-[#F1F3F6] border border-[#E4E8EE] p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FDF1E8] border border-[#F5D6BE] text-[#A84500] flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-[#11161E]">
                  پیشنهادات شگفت‌انگیز امیر
                </h2>
                <p className="text-xs sm:text-sm text-[#4A5464] mt-0.5">
                  تخفیف‌های محدود روی گوشی‌های پرچمدار و تجهیزات جانبی اورجینال
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
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E4E8EE] hover:border-[#1453D6] text-[#11161E] hover:text-[#1453D6] text-xs sm:text-sm font-medium transition-colors"
            >
              <span>مشاهده همه تخفیف‌ها</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>

          <div
            data-testid={productsLoading ? 'home-deals-skeleton' : undefined}
            aria-busy={productsLoading || undefined}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            {productsLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} compact />
                ))
              : amazingDeals.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
          </div>
        </div>
      </section>

      {/* Dynamic Category Grid */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
              دسته‌بندی‌های تخصصی فروشگاه
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
              دسترسی سریع به اکوسیستم کامل موبایل و گجت‌های هوشمند
            </p>
          </div>
          <a
            href={buildHref('/catalog')}
            onClick={(e) => handleLinkClick(e, '/catalog')}
            className="text-xs sm:text-sm font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1"
          >
            <span>همه محصولات</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
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
              className="group bg-white rounded-xl border border-[#E4E8EE] hover:border-[#C5CEDB] p-4 text-center flex flex-col items-center gap-3 transition-colors"
            >
              {cat.image ? (
                <div className="w-14 h-14 rounded-lg bg-[#F3F5F8] overflow-hidden border border-[#E4E8EE] shrink-0">
                  <SmartImage
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#F3F5F8] group-hover:bg-[#1453D6] text-[#4A5464] group-hover:text-white flex items-center justify-center transition-colors">
                  {CATEGORY_ICONS[cat.slug] ?? <Smartphone className="w-5 h-5" strokeWidth={1.5} />}
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#11161E]">{cat.label}</p>
                <p className="text-[11px] text-[#6E7889] mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newest Arrivals Shelf */}
      {(productsLoading || newestProducts.length > 0) && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
                جدیدترین محصولات فروشگاه امیر
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
                تازه‌ترین کالاهای اضافه‌شده و موجود در انبار با گارانتی رسمی
              </p>
            </div>
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="text-xs sm:text-sm font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>مشاهده همه کالاها</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>

          <div
            aria-busy={productsLoading || undefined}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            {productsLoading
              ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : newestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </section>
      )}

      {/* Popular Smartphones with dynamic Brand Filter */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
              پرطرفدارترین گوشی‌های هوشمند
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
              پرفروش‌ترین مدل‌های اپل، سامسونگ، شیائومی و هواوی با رجیستری قطعی
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setPopularBrand('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                popularBrand === 'ALL'
                  ? 'bg-[#1453D6] text-white'
                  : 'bg-white border border-[#E4E8EE] text-[#4A5464] hover:border-[#C5CEDB] hover:text-[#11161E]'
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
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    popularBrand === bName
                      ? 'bg-[#1453D6] text-white'
                      : 'bg-white border border-[#E4E8EE] text-[#4A5464] hover:border-[#C5CEDB] hover:text-[#11161E]'
                  }`}
                >
                  {bObj?.labelFa ? `${bObj.labelFa} (${bName})` : bName}
                </button>
              );
            })}
          </div>
        </div>

        <div
          aria-busy={productsLoading || undefined}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {productsLoading
            ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
            : popularPhones.map((phone) => <ProductCard key={phone.id} product={phone} />)}
        </div>
      </section>

      {/* Anker GaN Accessories Promo Banner */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#E4E8EE] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-4 flex flex-col justify-center">
            <div className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              <span>اکوسیستم انرژی و فست شارژ انکر (Anker GaNPrime)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E] leading-snug">
              حفاظت از سلامت باتری گوشی پرچمدار با شارژرهای استاندارد
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5464] leading-7 max-w-xl">
              مجموعه کامل آداپتورهای ۶۵ وات GaN و پاوربانک‌های ۱۴۰ واتی انکر با گارانتی ۱۸ ماهه تعویض و تاییدیه MFi اپل آماده ارسال است.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={buildHref('/product/anker-prime-powerbank-24000')}
                onClick={(e) => handleLinkClick(e, '/product/anker-prime-powerbank-24000')}
                className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>مشاهده پاوربانک ۲۴۰۰۰ انکر</span>
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href={buildHref('/catalog?cat=chargers')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=chargers')}
                className="h-10 px-5 rounded-lg bg-[#F1F3F6] hover:bg-[#EAECEF] text-[#11161E] text-xs sm:text-sm font-medium inline-flex items-center transition-colors"
              >
                همه شارژرها و پاوربانک‌ها
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 h-64 lg:h-auto min-h-[280px] bg-[#F3F5F8] border-t lg:border-t-0 lg:border-r border-[#E4E8EE]">
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
        <div className="rounded-2xl bg-[#F1F3F6] border border-[#E4E8EE] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-[#1453D6]">
              ابزارهای برنامه‌ریزی خرید در فروشگاه موبایل امیر
            </p>
            <h2 className="text-lg sm:text-2xl font-semibold text-[#11161E]">
              خرید اقساطی منعطف، معاوضه گوشی کارکرده و مقایسه فنی دقیق
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
              پیش از انتخاب نهایی، مشخصات فنی تا ۳ محصول را کنار هم مقایسه کنید یا قسط ماهانه و مبلغ کسرشده از طرح تعویض گوشی قبلی خود را آنلاین محاسبه نمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildHref('/installments')}
              onClick={(e) => handleLinkClick(e, '/installments')}
              className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <span>محاسبه‌گر اقساط و تعویض</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a
              href={buildHref('/compare')}
              onClick={(e) => handleLinkClick(e, '/compare')}
              className="h-10 px-5 rounded-lg bg-white hover:bg-[#EEF3FC] border border-[#DCE1E8] text-[#11161E] hover:text-[#1453D6] text-xs sm:text-sm font-medium inline-flex items-center transition-colors"
            >
              مقایسه تخصصی موبایل‌ها
            </a>
          </div>
        </div>
      </section>

      {/* Why Amir Mobile */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        <div className="bg-white rounded-xl border border-[#E4E8EE] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-[#11161E]">استعلام آنی رجیستری و همتا</h3>
          <p className="text-xs text-[#4A5464] leading-6">
            پیش از تحویل کالا، شناسه IMEI در فاکتور رسمی درج شده و انتقال مالکیت در سامانه همتا به شماره خریدار انجام می‌شود.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E8EE] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center">
            <Truck className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-[#11161E]">ناوگان ارسال اختصاصی تهران</h3>
          <p className="text-xs text-[#4A5464] leading-6">
            سفارش‌های پایتخت با بسته‌بندی ضدضربه و پلمپ امنیتی در بازه ۳ ساعته با پین تحویل اختصاصی تحویل می‌شوند.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E8EE] p-6 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center">
            <Award className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-[#11161E]">کد تخفیف خوش‌آمدگویی دمو</h3>
          <p className="text-xs text-[#4A5464] leading-6">
            برای تست سبد خرید می‌توانید از کد <span className="font-mono font-medium text-[#1453D6]" dir="ltr">AMIR-OFF</span> (۵۰۰ هزار تومان) یا <span className="font-mono font-medium text-[#1453D6]" dir="ltr">VIP-10</span> (۱۰٪ تخفیف) استفاده کنید.
          </p>
        </div>
      </section>

      {/* Recently Viewed Products Shelf */}
      <RecentlyViewedHomeStrip />

      {/* Tech Magazine Articles */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">مجله تخصصی موبایل امیر</h2>
            <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
              نقد و بررسی پرچمداران و راهنمای خرید دقیق
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TECH_ARTICLES.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-xl border border-[#E4E8EE] overflow-hidden flex flex-col hover:border-[#C5CEDB] transition-colors"
            >
              <a
                href={buildHref(`/product/${art.targetSlug}`)}
                onClick={(e) => handleLinkClick(e, `/product/${art.targetSlug}`)}
                className="aspect-[16/9] bg-[#F3F5F8] overflow-hidden block"
              >
                <SmartImage
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#6E7889]">
                  <span className="px-2 py-0.5 rounded-md bg-[#EEF3FC] text-[#1453D6] font-medium">
                    {art.tag}
                  </span>
                  <span>{art.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#11161E] leading-6">{art.title}</h3>
                <p className="text-xs text-[#4A5464] leading-6 flex-1">{art.excerpt}</p>
                <a
                  href={buildHref(`/product/${art.targetSlug}`)}
                  onClick={(e) => handleLinkClick(e, `/product/${art.targetSlug}`)}
                  className="self-start text-xs font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>بررسی محصول مرتبط</span>
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">تجربه خرید مشتریان ما</h2>
          <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
            دیدگاه خریداران واقعی درباره اصالت کالا، سرعت ارسال و پشتیبانی پس از فروش
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CUSTOMER_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E4E8EE] p-6 space-y-4 flex flex-col"
            >
              <Quote className="w-5 h-5 text-[#6E7889]" strokeWidth={1.5} />
              <p className="text-xs sm:text-sm text-[#11161E] leading-7 flex-1">{item.quote}</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#E4E8EE]">
                <div className="w-10 h-10 rounded-full bg-[#F1F3F6] text-[#11161E] font-semibold text-xs flex items-center justify-center shrink-0">
                  {item.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#11161E]">{item.name}</p>
                  <p className="text-[11px] text-[#6E7889]">{item.role}</p>
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
          <h2 className="text-xl sm:text-2xl font-semibold text-[#11161E]">بازدیدهای اخیر شما</h2>
          <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
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
