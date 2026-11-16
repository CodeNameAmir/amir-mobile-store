import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  Cpu,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { CATEGORY_ITEMS } from '../data/catalog';
import { storeRepository } from '../lib/supabase';
import type { ProductReview } from '../types/store';
import { formatToman, getVariantPrice, toPersianDigits } from '../utils/storeLogic';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    navigate,
    navigateToCatalog,
    addToCart,
    wishlist,
    toggleWishlist,
    stockAlerts,
    toggleStockAlert,
    showToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug) || null,
    [products, slug]
  );

  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'review' | 'comments'>('specs');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!product) return;
    setSelectedColorId(product.colors[0]?.id || 'default');
    setSelectedStorage(product.storageOptions[0]?.label || product.specs.storageDefault);
    setQty(1);
    setReviews(storeRepository.loadReviews(product.id));
  }, [product]);

  const complementaryItems = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.inStock && (p.category === 'chargers' || p.category === 'cases' || p.category === 'audio'))
      .slice(0, 3);
  }, [products, product]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#0b1c30]">محصول مورد نظر یافت نشد</h1>
        <p className="text-sm text-[#434655]">ممکن است نشانی محصول تغییر کرده یا از فهرست حذف شده باشد.</p>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="h-11 px-6 rounded-xl bg-[#004ac6] text-white text-sm font-bold"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  const activeColor = product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];
  const { price: variantPrice, originalPrice: variantOriginal } = getVariantPrice(
    product,
    selectedStorage
  );
  const categoryLabel =
    CATEGORY_ITEMS.find((c) => c.id === product.category)?.label ?? 'محصولات';
  const isWishlisted = wishlist.includes(product.id);
  const isAlerted = stockAlerts.includes(product.id);

  const handleAddToCart = (goToCart = false) => {
    addToCart(product, {
      colorName: activeColor?.name ?? product.colorLabel,
      colorHex: activeColor?.hex ?? '#1e293b',
      storageLabel: selectedStorage,
      unitPrice: variantPrice,
      originalUnitPrice: variantOriginal,
      qty,
    });
    if (goToCart) {
      navigate('/cart');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewAuthor.trim().length < 2 || reviewText.trim().length < 8) {
      showToast('لطفاً نام و متن دیدگاه (حداقل ۸ کاراکتر) را وارد کنید.', 'error');
      return;
    }
    const nextReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim(),
      dateLabel: 'هم‌اکنون',
      rating: reviewRating,
      comment: reviewText.trim(),
      verified: true,
    };
    const updated = storeRepository.addReview(product.id, nextReview);
    setReviews(updated);
    setReviewAuthor('');
    setReviewText('');
    showToast('دیدگاه شما با موفقیت ثبت شد.', 'success');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-[#434655]">
        <button type="button" onClick={() => navigate('/')} className="hover:text-[#004ac6]">
          فروشگاه موبایل امیر
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => navigateToCatalog({ category: product.category })}
          className="hover:text-[#004ac6]"
        >
          {categoryLabel}
        </button>
        <span>/</span>
        <span className="font-bold text-[#0b1c30] line-clamp-1">{product.nameFa}</span>
      </nav>

      {/* Main 3-Column PDP Grid */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 sm:p-8 shadow-[0_14px_40px_rgba(11,28,48,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Col 1: Product Visual Gallery */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative aspect-square rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] overflow-hidden p-4">
            <SmartImage
              src={product.image}
              alt={product.nameFa}
              loading="eager"
              className="w-full h-full object-cover rounded-xl"
            />
            {product.discountPercent && product.inStock && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-[#b54e00] text-white text-xs font-extrabold tabular-nums-fa shadow-sm">
                {toPersianDigits(product.discountPercent)}٪ تخفیف ویژه
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="افزودن به علاقه‌مندی‌ها"
              className={`absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                isWishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white text-[#434655] hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#eff4ff] text-[#004ac6] font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>کد رجیستری همتا</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f8f9ff] text-[#0b1c30] font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#004ac6] shrink-0" />
              <span>بسته‌بندی پلمپ ضدضربه</span>
            </div>
          </div>
        </div>

        {/* Col 2: Title, Variant Configurator, Quick Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-[#eff4ff] pb-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#004ac6] uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b1c30] tabular-nums-fa">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {toPersianDigits(product.rating)} از ۵ ({toPersianDigits(reviews.length)} دیدگاه)
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-[#0b1c30] leading-9">
              {product.nameFa}
            </h1>
            <p className="text-xs text-[#434655] font-medium" dir="ltr">
              {product.nameEn}
            </p>
            <p className="text-xs font-bold text-emerald-700 pt-1">
              ✓ {toPersianDigits(product.recommendPercent)}٪ از خریداران این کالا را پیشنهاد کرده‌اند
            </p>
          </div>

          {/* Color Picker */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#0b1c30]">
              رنگ انتخابی: <span className="text-[#004ac6]">{activeColor?.name}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => {
                const selected = color.id === activeColor?.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-all ${
                      selected
                        ? 'border-[#004ac6] bg-[#eff4ff] text-[#004ac6]'
                        : 'border-[#e5eeff] bg-white text-[#434655] hover:border-[#2563eb]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage / Variant Selector */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#0b1c30]">ظرفیت و نسخه:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {product.storageOptions.map((opt) => {
                const selected = opt.label === selectedStorage;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    data-testid={`variant-storage-${opt.label}`}
                    onClick={() => setSelectedStorage(opt.label)}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      selected
                        ? 'border-[#004ac6] bg-[#eff4ff] text-[#004ac6] shadow-sm'
                        : 'border-[#e5eeff] bg-white text-[#0b1c30] hover:border-[#2563eb]'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{opt.label}</p>
                    <p className="text-[11px] text-[#434655] mt-0.5">{opt.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Hardware Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#434655]">
                <Smartphone className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>نمایشگر</span>
              </div>
              <p className="text-xs font-extrabold text-[#0b1c30]">{product.specs.display}</p>
              <p className="text-[11px] text-[#434655]">{product.specs.displayDetails}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#434655]">
                <Cpu className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>پردازنده</span>
              </div>
              <p className="text-xs font-extrabold text-[#0b1c30]">{product.specs.chipset}</p>
              <p className="text-[11px] text-[#434655]">{product.specs.chipsetDetails}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#434655]">
                <Camera className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>دوربین / قابلیت</span>
              </div>
              <p className="text-xs font-extrabold text-[#0b1c30]">{product.specs.camera}</p>
              <p className="text-[11px] text-[#434655]">{product.specs.cameraDetails}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#434655]">
                <Zap className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>باتری و شارژ</span>
              </div>
              <p className="text-xs font-extrabold text-[#0b1c30]">{product.specs.battery}</p>
              <p className="text-[11px] text-[#434655]">{product.specs.batteryDetails}</p>
            </div>
          </div>
        </div>

        {/* Col 3: Sticky Buy Box */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] p-5 space-y-5 sticky top-28">
            <div className="space-y-2 border-b border-[#dce9ff] pb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#434655]">فروشنده:</span>
                <span className="font-extrabold text-[#0b1c30]">فروشگاه موبایل امیر</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#0b1c30] bg-white p-3 rounded-xl border border-[#e5eeff]">
                <ShieldCheck className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                <span className="font-semibold leading-5">{product.warranty}</span>
              </div>
            </div>

            {product.inStock ? (
              <>
                <div className="space-y-1">
                  {variantOriginal > variantPrice && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#434655] line-through tabular-nums-fa">
                        {formatToman(variantOriginal)} تومان
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#ffdbca] text-[#8e3c00] font-extrabold text-[11px] tabular-nums-fa">
                        سود شما: {formatToman(variantOriginal - variantPrice)}
                      </span>
                    </div>
                  )}
                  <p
                    data-testid="pdp-price"
                    className="text-2xl font-black text-[#0b1c30] tabular-nums-fa pt-1"
                  >
                    {formatToman(variantPrice)}{' '}
                    <span className="text-xs font-bold text-[#434655]">تومان</span>
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700">
                    ● موجود در انبار امیر ({toPersianDigits(product.stockCount)} عدد آماده ارسال)
                  </p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center justify-between bg-white rounded-xl border border-[#e5eeff] p-2">
                  <span className="text-xs font-bold text-[#434655] pr-2">تعداد:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="کاهش تعداد"
                      className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center hover:bg-[#dce9ff]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-extrabold tabular-nums-fa">
                      {toPersianDigits(qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.stockCount || 5, q + 1))}
                      aria-label="افزایش تعداد"
                      className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center hover:bg-[#dce9ff]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    data-testid="pdp-add-to-cart"
                    onClick={() => handleAddToCart(false)}
                    className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>افزودن به سبد خرید</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    className="w-full h-11 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#004ac6] text-[#004ac6] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>خرید فوری و مشاهده سبد</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-extrabold text-[#0b1c30]">این کالا فعلاً ناموجود است</p>
                <p className="text-xs text-[#434655] leading-6">
                  به محض شارژ مجدد انبار، از طریق دکمه زیر به شما اطلاع‌رسانی می‌کنیم.
                </p>
                <button
                  type="button"
                  onClick={() => toggleStockAlert(product.id)}
                  className={`w-full h-12 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors ${
                    isAlerted
                      ? 'bg-[#213145] text-white'
                      : 'bg-[#004ac6] hover:bg-[#2563eb] text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>{isAlerted ? 'اطلاع‌رسانی فعال شد' : 'موجود شد خبرم کن'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complementary Accessories */}
      {complementaryItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-[#0b1c30]">
            لوازم جانبی پیشنهادی همراه این کالا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complementaryItems.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-[#e5eeff] p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-xl bg-[#f8f9ff] overflow-hidden shrink-0">
                  <SmartImage src={acc.image} alt={acc.nameFa} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${acc.slug}`)}
                    className="text-xs font-extrabold text-[#0b1c30] hover:text-[#004ac6] line-clamp-2 text-right"
                  >
                    {acc.nameFa}
                  </button>
                  <p className="text-xs font-extrabold text-[#004ac6] tabular-nums-fa">
                    {formatToman(acc.price)} تومان
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(acc)}
                  className="px-3 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-bold shrink-0 transition-colors"
                >
                  + افزودن
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Tabs: Specs, Expert Review, Customer Reviews */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#eff4ff] px-5 pt-4 overflow-x-auto">
          {(
            [
              { id: 'specs', label: 'مشخصات فنی تخصصی' },
              { id: 'review', label: 'بررسی تخصصی کارشناسی' },
              { id: 'comments', label: `نظرات خریداران (${toPersianDigits(reviews.length)})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {[
                { k: 'نمایشگر و پنل', v: `${product.specs.display} — ${product.specs.displayDetails}` },
                { k: 'تراشه و پردازنده', v: `${product.specs.chipset} — ${product.specs.chipsetDetails}` },
                { k: 'سیستم دوربین', v: `${product.specs.camera} — ${product.specs.cameraDetails}` },
                { k: 'باتری و توان شارژ', v: `${product.specs.battery} — ${product.specs.batteryDetails}` },
                { k: 'حافظه رم و داخلی', v: `${product.specs.ram} رم / ${selectedStorage}` },
                { k: 'سیستم‌عامل و ضمانت', v: `${product.specs.os} · ${product.warranty}` },
              ].map((row) => (
                <div
                  key={row.k}
                  className="p-4 rounded-xl bg-[#f8f9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <span className="font-bold text-[#434655]">{row.k}</span>
                  <span className="font-extrabold text-[#0b1c30]">{row.v}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-4 text-sm text-[#0b1c30] leading-8 max-w-3xl">
              <h3 className="text-base font-black">تحلیل تیم فنی فروشگاه موبایل امیر</h3>
              <p className="text-[#434655]">
                محصول <strong className="text-[#0b1c30]">{product.nameFa}</strong> یکی از ارزشمندترین گزینه‌های رده خود در بازار ایران است. واحد کنترل کیفیت ۱۸ مرحله‌ای امیر پیش از پلمپ و ارسال نهایی، اصالت پارت‌نامبر، سلامت بسته‌بندی و وضعیت استعلام در سامانه همتا را تایید می‌کند.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 space-y-1">
                  <p className="font-extrabold text-xs">نقاط قوت کلیدی</p>
                  <p className="text-xs leading-6">
                    کیفیت ساخت پریمیوم، پایداری نرم‌افزاری طولانی‌مدت، گارانتی ۱۸ ماهه امیر سرویس و ارزش خرید بالا.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] space-y-1">
                  <p className="font-extrabold text-xs">پیشنهاد کارشناسان</p>
                  <p className="text-xs leading-6">
                    برای حفظ سلامت باتری در بلندمدت حتماً از آداپتورهای استاندارد GaN انکر یا اپل استفاده نمایید.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#0b1c30]">{rev.author}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            خریدار تاییدشده
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#434655]">{rev.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-[#0b1c30] leading-6">{rev.comment}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="lg:col-span-5 p-5 rounded-2xl bg-[#eff4ff] space-y-4 self-start"
              >
                <h3 className="text-sm font-extrabold text-[#0b1c30]">ثبت دیدگاه جدید</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0b1c30] block">نام شما</label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="مثال: علی حسینی"
                    className="w-full h-10 px-3 rounded-xl bg-white text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0b1c30] block">امتیاز شما</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none"
                  >
                    <option value={5}>۵ ستاره — عالی</option>
                    <option value={4}>۴ ستاره — خوب</option>
                    <option value={3}>۳ ستاره — متوسط</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0b1c30] block">متن دیدگاه</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="تجربه کاربری یا نظر خود درباره کیفیت و ارسال..."
                    className="w-full p-3 rounded-xl bg-white text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold transition-colors"
                >
                  ارسال دیدگاه
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
