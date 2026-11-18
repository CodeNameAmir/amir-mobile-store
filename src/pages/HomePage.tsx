import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BatteryCharging,
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
import {
  CATEGORY_ITEMS,
  CUSTOMER_TESTIMONIALS,
  TECH_ARTICLES,
} from '../data/catalog';
import type { BrandId, CategoryId } from '../types/store';
import { filterAndSortProducts, formatToman, toPersianDigits } from '../utils/storeLogic';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  phones: <Smartphone className="w-6 h-6" />,
  tablets: <Tablet className="w-6 h-6" />,
  smartwatches: <Watch className="w-6 h-6" />,
  audio: <Headphones className="w-6 h-6" />,
  chargers: <BatteryCharging className="w-6 h-6" />,
  cases: <Shield className="w-6 h-6" />,
  gaming: <Gamepad2 className="w-6 h-6" />,
};

export const HomePage: React.FC = () => {
  const { products, navigate, navigateToCatalog } = useStore();
  const [popularBrand, setPopularBrand] = useState<'ALL' | BrandId>('ALL');

  const amazingDeals = useMemo(
    () => products.filter((p) => p.isFeaturedDeal && p.inStock).slice(0, 4),
    [products]
  );

  const newestProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        ...DEFAULT_FILTERS,
        inStockOnly: true,
        sortBy: 'newest',
      }).slice(0, 4),
    [products]
  );

  const popularPhones = useMemo(() => {
    const phones = [...products.filter((p) => p.category === 'phones' && p.inStock)].sort(
      (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || a.salesRank - b.salesRank
    );
    if (popularBrand === 'ALL') return phones.slice(0, 4);
    return phones.filter((p) => p.brand === popularBrand).slice(0, 4);
  }, [products, popularBrand]);

  const flagshipIphone = useMemo(
    () => products.find((p) => p.slug === 'iphone-16-pro-max') || products[0],
    [products]
  );

  return (
    <div className="space-y-12 md:space-y-16 pb-4">
      {/* Hero Campaign Section */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 md:pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-bl from-[#0b1c30] via-[#132945] to-[#004ac6] text-white shadow-[0_24px_60px_rgba(11,28,48,0.18)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-10 lg:p-14">
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold text-[#ffdbca]">
                <Sparkles className="w-4 h-4 text-[#ffdbca]" />
                <span>پرچمدار جدید اپل موجود شد · رجیستری رسمی همتا</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-[1.35] tracking-tight">
                آیفون ۱۶ پرو مکس تیتانیوم؛
                <br />
                <span className="text-[#93c5fd]">قدرت بی‌رقیب، تحویل فوری</span>
              </h1>

              <p className="text-sm sm:text-base text-[#d6e3ff] max-w-xl leading-7">
                تراشه ۳ نانومتری A18 Pro، دکمه اختصاصی Camera Control و نمایشگر ۶.۹ اینچی با ۱۸ ماه گارانتی طلایی امیر سرویس و ارسال اکسپرس ۳ ساعته در تهران.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/product/${flagshipIphone.slug}`)}
                  className="w-full sm:w-auto justify-center h-12 px-6 rounded-xl bg-white hover:bg-[#eff4ff] text-[#004ac6] font-extrabold text-sm inline-flex items-center gap-2 shadow-lg transition-colors"
                >
                  <span>خرید iPhone 16 Pro Max</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToCatalog({ category: 'phones' })}
                  className="w-full sm:w-auto justify-center h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors"
                >
                  مشاهده تمام گوشی‌ها
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg border-t border-white/15">
                <div>
                  <p className="text-xs text-[#93c5fd]">شروع قیمت</p>
                  <p className="text-sm sm:text-base font-extrabold tabular-nums-fa mt-0.5">
                    {formatToman(flagshipIphone.price)} تومان
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#93c5fd]">ضمانت اصالت</p>
                  <p className="text-sm sm:text-base font-extrabold mt-0.5">۱۸ ماهه امیر سرویس</p>
                </div>
                <div>
                  <p className="text-xs text-[#93c5fd]">وضعیت انبار</p>
                  <p className="text-sm sm:text-base font-extrabold mt-0.5">پلمپ شرکتی آماده ارسال</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/15 shadow-2xl">
                <SmartImage
                  src={STORE_ASSETS.heroIphone}
                  alt="آیفون ۱۶ پرو مکس تیتانیوم کویری"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 left-3 p-3 rounded-xl bg-[#0b1c30]/85 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">تضمین پلمپ و کد همتا</p>
                    <p className="text-[11px] text-[#93c5fd]">ارسال رایگان به سراسر کشور</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#b54e00] text-white text-xs font-extrabold tabular-nums-fa">
                    ۴٪ تخفیف
                  </span>
                </div>
              </div>
            </div>
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

            <button
              type="button"
              onClick={() => navigateToCatalog({ category: 'offers', discountedOnly: true })}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <span>مشاهده همه تخفیف‌ها</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {amazingDeals.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
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
          <button
            type="button"
            onClick={() => navigateToCatalog({ category: 'all' })}
            className="text-xs sm:text-sm font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1"
          >
            <span>همه محصولات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORY_ITEMS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigateToCatalog({ category: cat.id as CategoryId })}
              className="group bg-white rounded-2xl border border-[#e5eeff] hover:border-[#2563eb] hover:shadow-[0_12px_28px_rgba(0,74,198,0.08)] p-4 text-center flex flex-col items-center gap-3 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] group-hover:bg-[#004ac6] text-[#004ac6] group-hover:text-white flex items-center justify-center transition-colors">
                {CATEGORY_ICONS[cat.id]}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0b1c30]">{cat.label}</p>
                <p className="text-[11px] text-[#434655] mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
            </button>
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
            <button
              type="button"
              onClick={() => navigateToCatalog({ category: 'all' })}
              className="text-xs sm:text-sm font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>مشاهده همه کالاها</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Smartphones with interactive Brand Filter */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              پرطرفدارترین گوشی‌های هوشمند
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              پرفروش‌ترین مدل‌های اپل، سامسونگ و شیائومی با رجیستری قطعی
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: 'ALL', label: 'همه برندها' },
                { id: 'Apple', label: 'اپل (Apple)' },
                { id: 'Samsung', label: 'سامسونگ (Samsung)' },
                { id: 'Xiaomi', label: 'شیائومی (Xiaomi)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPopularBrand(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  popularBrand === tab.id
                    ? 'bg-[#004ac6] text-white shadow-sm'
                    : 'bg-white border border-[#e5eeff] text-[#434655] hover:border-[#2563eb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
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
              <button
                type="button"
                onClick={() => navigate('/product/anker-prime-powerbank-24000')}
                className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <span>مشاهده پاوربانک ۲۴۰۰۰ انکر</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateToCatalog({ category: 'chargers' })}
                className="h-11 px-5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs sm:text-sm font-bold transition-colors"
              >
                همه شارژرها و پاوربانک‌ها
              </button>
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
            <button
              type="button"
              onClick={() => navigate('/installments')}
              className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>محاسبه‌گر اقساط و تعویض</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/compare')}
              className="h-11 px-5 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#004ac6] text-[#004ac6] text-xs sm:text-sm font-bold transition-colors"
            >
              مقایسه تخصصی موبایل‌ها
            </button>
          </div>
        </div>
      </section>

      {/* Why Amir Mobile (3 concise proof cards) */}
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
              <div className="aspect-[16/9] bg-[#f8f9ff] overflow-hidden">
                <SmartImage
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#434655]">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#eff4ff] text-[#004ac6] font-bold">
                    {art.tag}
                  </span>
                  <span>{art.date}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#0b1c30] leading-6">{art.title}</h3>
                <p className="text-xs text-[#434655] leading-6 flex-1">{art.excerpt}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/product/${art.targetSlug}`)}
                  className="self-start text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>بررسی محصول مرتبط</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
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
