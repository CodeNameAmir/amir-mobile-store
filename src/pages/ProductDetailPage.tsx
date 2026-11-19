import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Calculator,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Heart,
  Minus,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  ShieldPlus,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import {
  ProductBuyBoxSkeleton,
  ProductDetailSkeleton,
  ReviewCardSkeleton,
} from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { hydrateProduct } from '../data/catalog';
import { storeApi } from '../lib/authApi';
import type { CategoryId, Product, ProductReview } from '../types/store';
import {
  calculateCareInsurancePrice,
  calculateInstallmentPlan,
  formatPersianDate,
  formatToman,
  getVariantPrice,
  toPersianDigits,
} from '../utils/storeLogic';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    categories,
    productsLoading,
    upsertProduct,
    buildHref,
    handleLinkClick,
    navigate,
    navigateToCatalog,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    recentlyViewedIds,
    markProductViewed,
    stockAlerts,
    toggleStockAlert,
    showToast,
  } = useStore();

  const [liveLookup, setLiveLookup] = useState<{
    slug: string;
    product: Product | null;
    loading: boolean;
  }>({ slug: '', product: null, loading: true });

  const productFromList = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug) || null,
    [products, slug]
  );

  // Always verify live stock, price, and specs from the database when entering a product page
  useEffect(() => {
    let active = true;
    setLiveLookup({ slug, product: null, loading: true });
    storeApi
      .getProductBySlug(slug)
      .then((res) => {
        if (!active) return;
        const hydrated = hydrateProduct(res.product);
        setLiveLookup({ slug, product: hydrated, loading: false });
        upsertProduct(hydrated);
      })
      .catch(() => {
        if (!active) return;
        setLiveLookup({ slug, product: null, loading: false });
      });
    return () => {
      active = false;
    };
  }, [slug, upsertProduct]);

  const isCurrentSlugLookup = liveLookup.slug === slug;
  const liveStockChecking = !isCurrentSlugLookup || liveLookup.loading;
  const liveProduct = isCurrentSlugLookup ? liveLookup.product : null;
  // Never display stale seed data before live catalog hydration finishes
  const product = liveProduct || (!productsLoading ? productFromList : null);
  const productId = product?.id ?? null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [includeCarePlus, setIncludeCarePlus] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'review' | 'comments'>('specs');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Reset selections and fetch reviews only when switching to a different product ID
  useEffect(() => {
    if (!productId || !product) return;
    let mounted = true;
    setActiveImageIndex(0);
    setSelectedColorId(product.colors[0]?.id || 'default');
    setSelectedStorage(product.storageOptions[0]?.label || product.specs.storageDefault);
    setIncludeCarePlus(false);
    setQty(1);
    markProductViewed(productId);
    setReviews([]);
    setReviewsLoading(true);
    storeApi
      .getProductReviews(productId)
      .then((fetched) => {
        if (!mounted) return;
        setReviews(fetched);
        setReviewsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setReviewsLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, markProductViewed]);

  // Clamp chosen quantity if live DB stock turns out lower than current selection
  useEffect(() => {
    if (!product || !product.inStock) return;
    setQty((prev) => Math.max(1, Math.min(prev, product.stockCount || 1)));
  }, [product?.inStock, product?.stockCount]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || [])]
      .map((u) => u.trim())
      .filter(Boolean);
    return [...new Set(list)];
  }, [product]);

  const complementaryItems = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.inStock &&
          (p.category === 'chargers' || p.category === 'cases' || p.category === 'audio')
      )
      .slice(0, 3);
  }, [products, product]);

  const recentOtherProducts = useMemo(() => {
    if (!product) return [];
    return recentlyViewedIds
      .filter((id) => id !== product.id)
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 4);
  }, [recentlyViewedIds, products, product]);

  if (!product && (productsLoading || liveStockChecking)) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#0b1c30]">محصول مورد نظر یافت نشد</h1>
        <p className="text-sm text-[#434655]">
          ممکن است نشانی محصول تغییر کرده یا از فهرست حذف شده باشد.
        </p>
        <a
          href={buildHref('/catalog')}
          onClick={(e) => handleLinkClick(e, '/catalog')}
          className="h-11 px-6 rounded-xl bg-[#004ac6] text-white text-sm font-bold inline-flex items-center"
        >
          بازگشت به فروشگاه
        </a>
      </div>
    );
  }

  const activeColor = product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];
  const { price: variantPrice, originalPrice: variantOriginal } = getVariantPrice(
    product,
    selectedStorage
  );
  const carePlusPrice = calculateCareInsurancePrice(variantPrice, product.category);
  const effectiveUnitPrice =
    includeCarePlus && carePlusPrice > 0 ? variantPrice + carePlusPrice : variantPrice;
  const effectiveOriginalPrice =
    includeCarePlus && carePlusPrice > 0 ? variantOriginal + carePlusPrice : variantOriginal;
  const effectiveWarranty =
    includeCarePlus && carePlusPrice > 0
      ? `${product.warranty} + بیمه حوادث و شکستگی Amir Care+`
      : product.warranty;

  const installmentPreview = calculateInstallmentPlan(effectiveUnitPrice, 30, 12);

  const categoryLabel =
    categories.find((c) => c.id === product.category || c.slug === product.category)?.label ??
    'محصولات';
  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const isAlerted = stockAlerts.includes(product.id);
  const currentGalleryImg = galleryImages[activeImageIndex % Math.max(1, galleryImages.length)] || product.image;
  const formattedPriceDate = formatPersianDate(product.priceUpdatedAt || product.updatedAt);

  const handleShareProduct = async () => {
    const shareUrl = window.location.href;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: product.nameFa,
          text: `${product.nameFa} با قیمت ${formatToman(effectiveUnitPrice)} تومان در فروشگاه موبایل امیر`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if user dismissed native share or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('لینک مستقیم محصول در حافظه کپی شد و آماده اشتراک‌گذاری است.', 'success');
    } catch {
      showToast(`لینک محصول: ${shareUrl}`, 'info');
    }
  };

  const handleAddToCart = (goToCart = false) => {
    addToCart(product, {
      colorName: activeColor?.name ?? product.colorLabel,
      colorHex: activeColor?.hex ?? '#1e293b',
      storageLabel: selectedStorage,
      warranty: effectiveWarranty,
      unitPrice: effectiveUnitPrice,
      originalUnitPrice: effectiveOriginalPrice,
      qty,
    });
    if (goToCart) {
      navigate('/cart');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewAuthor.trim().length < 2 || reviewText.trim().length < 8) {
      showToast('لطفاً نام و متن دیدگاه (حداقل ۸ کاراکتر) را وارد کنید.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const savedReview = await storeApi.submitProductReview(product.id, {
        author: reviewAuthor.trim(),
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      setReviews((prev) => [savedReview, ...prev]);
      setReviewAuthor('');
      setReviewText('');
      showToast('دیدگاه شما با موفقیت ثبت شد.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت دیدگاه.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-[#434655]">
        <a
          href={buildHref('/')}
          onClick={(e) => handleLinkClick(e, '/')}
          className="hover:text-[#004ac6]"
        >
          فروشگاه موبایل امیر
        </a>
        <span>/</span>
        <a
          href={buildHref(`/catalog?cat=${encodeURIComponent(product.category)}`)}
          onClick={(e) => {
            if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              navigateToCatalog({ category: product.category as CategoryId });
            }
          }}
          className="hover:text-[#004ac6]"
        >
          {categoryLabel}
        </a>
        <span>/</span>
        <span className="font-bold text-[#0b1c30] line-clamp-1">{product.nameFa}</span>
      </nav>

      {/* Main 3-Column PDP Grid */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-5 sm:p-8 shadow-[0_14px_40px_rgba(11,28,48,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Col 1: Product Multi-Image Gallery Slider */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative aspect-square rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] overflow-hidden p-4">
            <SmartImage
              src={currentGalleryImg}
              alt={`${product.nameFa} - تصویر ${toPersianDigits(activeImageIndex + 1)}`}
              loading="eager"
              data-testid="pdp-main-image"
              className="w-full h-full object-cover rounded-xl transition-opacity duration-200"
            />
            {product.discountPercent && product.inStock && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-[#b54e00] text-white text-xs font-extrabold tabular-nums-fa shadow-sm">
                {toPersianDigits(product.discountPercent)}٪ تخفیف ویژه
              </span>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                  isWishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white text-[#434655] hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                data-testid="pdp-compare-toggle"
                onClick={() => toggleCompare(product.id)}
                aria-label="افزودن به مقایسه"
                title="مقایسه محصول"
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                  isCompared ? 'bg-[#004ac6] text-white' : 'bg-white text-[#434655] hover:text-[#004ac6]'
                }`}
              >
                <Scale className="w-5 h-5" />
              </button>
              <button
                type="button"
                data-testid="pdp-share-btn"
                onClick={handleShareProduct}
                aria-label="اشتراک‌گذاری محصول"
                title="اشتراک‌گذاری محصول"
                className="w-10 h-10 rounded-xl bg-white text-[#434655] hover:text-[#004ac6] flex items-center justify-center shadow-sm transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  data-testid="pdp-gallery-prev"
                  onClick={() =>
                    setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
                  }
                  aria-label="تصویر قبلی"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#0b1c30] shadow-md flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-testid="pdp-gallery-next"
                  onClick={() => setActiveImageIndex((i) => (i + 1) % galleryImages.length)}
                  aria-label="تصویر بعدی"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#0b1c30] shadow-md flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0b1c30]/75 text-white text-[11px] font-bold tabular-nums-fa">
                  {toPersianDigits(activeImageIndex + 1)} / {toPersianDigits(galleryImages.length)}
                </span>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1" data-testid="pdp-gallery-thumbs">
              {galleryImages.map((imgSrc, idx) => (
                <button
                  key={`${imgSrc}-${idx}`}
                  type="button"
                  data-testid={`pdp-thumb-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`نمایش تصویر ${toPersianDigits(idx + 1)}`}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-[#f8f9ff] transition-all ${
                    idx === activeImageIndex
                      ? 'border-[#004ac6] ring-2 ring-[#2563eb]/20'
                      : 'border-[#e5eeff] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SmartImage src={imgSrc} alt={`${product.nameFa} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

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
              <a
                href={buildHref(`/catalog?brand=${encodeURIComponent(product.brand)}`)}
                onClick={(e) => {
                  if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    navigateToCatalog({ brand: product.brand });
                  }
                }}
                className="text-xs font-extrabold text-[#004ac6] hover:underline uppercase tracking-wider"
              >
                {product.brand}
              </a>
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
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-xs font-bold text-emerald-700">
                ✓ {toPersianDigits(product.recommendPercent)}٪ از خریداران این کالا را پیشنهاد کرده‌اند
              </p>
              <button
                type="button"
                onClick={handleShareProduct}
                className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                اشتراک‌گذاری محصول
              </button>
            </div>
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

            {liveStockChecking ? (
              <ProductBuyBoxSkeleton />
            ) : product.inStock ? (
              <>
                <div className="space-y-1">
                  {effectiveOriginalPrice > effectiveUnitPrice && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#434655] line-through tabular-nums-fa">
                        {formatToman(effectiveOriginalPrice)} تومان
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#ffdbca] text-[#8e3c00] font-extrabold text-[11px] tabular-nums-fa">
                        سود شما: {formatToman(effectiveOriginalPrice - effectiveUnitPrice)}
                      </span>
                    </div>
                  )}
                  <p
                    data-testid="pdp-price"
                    className="text-2xl font-black text-[#0b1c30] tabular-nums-fa pt-1"
                  >
                    {formatToman(effectiveUnitPrice)}{' '}
                    <span className="text-xs font-bold text-[#434655]">تومان</span>
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700">
                    ● موجود در انبار امیر ({toPersianDigits(product.stockCount)} عدد آماده ارسال)
                  </p>
                  <p
                    data-testid="pdp-price-updated-at"
                    className="text-[11px] text-[#434655] inline-flex items-center gap-1 pt-1 tabular-nums-fa"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-[#004ac6]" />
                    آخرین به‌روزرسانی قیمت: {formattedPriceDate}
                  </p>
                </div>

                {/* Amir Care+ Screen & Accident Protection Toggle */}
                {carePlusPrice > 0 && (
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#dce9ff] cursor-pointer hover:border-[#004ac6] transition-colors">
                    <input
                      type="checkbox"
                      data-testid="pdp-care-plus-toggle"
                      checked={includeCarePlus}
                      onChange={(e) => setIncludeCarePlus(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-[#004ac6] shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-[#0b1c30]">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <ShieldPlus className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                          <span>بیمه حوادث</span>
                          <span dir="ltr">Care+</span>
                        </span>
                        <span dir="ltr" className="text-[#004ac6] tabular-nums-fa whitespace-nowrap">
                          +{formatToman(carePlusPrice)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#434655] leading-5">
                        پوشش ۱۲ ماهه شکستگی نمایشگر، آب‌خوردگی و نوسان برق
                      </p>
                    </div>
                  </label>
                )}

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

                {/* Inline Installment Preview */}
                <a
                  href={buildHref('/installments')}
                  onClick={(e) => handleLinkClick(e, '/installments')}
                  className="w-full p-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-right transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-extrabold text-[#004ac6] inline-flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" />
                      امکان خرید اقساطی ۱۲ ماهه
                    </p>
                    <p className="text-[11px] text-[#0b1c30] font-bold tabular-nums-fa">
                      ماهانه حدود {formatToman(installmentPreview.monthlyPayment)} تومان
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#004ac6] shrink-0" />
                </a>
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
                  <a
                    href={buildHref(`/product/${acc.slug}`)}
                    onClick={(e) => handleLinkClick(e, `/product/${acc.slug}`)}
                    className="text-xs font-extrabold text-[#0b1c30] hover:text-[#004ac6] line-clamp-2 text-right block"
                  >
                    {acc.nameFa}
                  </a>
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

      {/* Detailed Tabs: Specs (incl. customSpecs), Expert Review, Customer Reviews */}
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
            <div className="space-y-6">
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

              {product.customSpecs && product.customSpecs.length > 0 && (
                <div className="space-y-3 border-t border-[#eff4ff] pt-5" data-testid="pdp-custom-specs">
                  <h3 className="text-sm font-black text-[#0b1c30]">مشخصات ویژه و تخصصی محصول</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {product.customSpecs.map((spec, idx) => (
                      <div
                        key={`${spec.label}-${idx}`}
                        className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#dce9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="font-bold text-[#004ac6]">{spec.label}</span>
                        <span className="font-extrabold text-[#0b1c30]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {reviewsLoading && reviews.length === 0 ? (
                  <div className="space-y-4" aria-busy="true" aria-label="در حال بارگذاری دیدگاه‌ها">
                    <ReviewCardSkeleton />
                    <ReviewCardSkeleton />
                  </div>
                ) : (
                  reviews.map((rev) => (
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
                  ))
                )}
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
                  disabled={submittingReview}
                  className="w-full h-10 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  {submittingReview ? 'در حال ثبت دیدگاه...' : 'ارسال دیدگاه'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      {recentOtherProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-[#0b1c30]">محصولات اخیراً مشاهده‌شده</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {recentOtherProducts.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
