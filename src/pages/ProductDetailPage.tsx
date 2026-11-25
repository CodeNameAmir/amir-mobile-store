import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Calculator,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Heart,
  Maximize2,
  MessageSquareMore,
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
  X,
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
import type { CategoryId, Product, ProductQuestion, ProductReview } from '../types/store';
import { UI_EASE } from '../utils/motionHelpers';
import { useTemporarilyAdded } from '../utils/useTemporarilyAdded';
import {
  calculateCareInsurancePrice,
  calculateInstallmentPlan,
  formatPersianDate,
  formatToman,
  getVariantPrice,
  toPersianDigits,
} from '../utils/storeLogic';
import {
  applyDocumentSeoMeta,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildRouteSeoMetadata,
  removeJsonLdScript,
  SITE_ORIGIN,
  upsertJsonLdScript,
} from '../utils/seo';

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
    user,
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
  const product = liveProduct || (!productsLoading ? productFromList : null);
  const productId = product?.id ?? null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [includeCarePlus, setIncludeCarePlus] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'review' | 'comments' | 'qa'>('specs');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState(user?.fullName || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [useReviewUsername, setUseReviewUsername] = useState(true);
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionAuthor, setQuestionAuthor] = useState(user?.fullName || '');
  const [questionText, setQuestionText] = useState('');
  const [guestAlertEmail, setGuestAlertEmail] = useState('');
  const { recentlyAdded, triggerAdded } = useTemporarilyAdded(2000);

  useEffect(() => {
    if (user?.fullName && !reviewAuthor.trim()) {
      setReviewAuthor(user.fullName);
    }
    if (user?.fullName && !questionAuthor.trim()) {
      setQuestionAuthor(user.fullName);
    }
  }, [user?.fullName]);

  useEffect(() => {
    if (!productId || !product) return;
    let mounted = true;
    setActiveImageIndex(0);
    setLightboxOpen(false);
    setSelectedColorId(product.colors?.[0]?.id || 'default');
    setSelectedStorage(product.storageOptions?.[0]?.label || product.specs?.storageDefault || '');
    setIncludeCarePlus(false);
    setQty(1);
    markProductViewed(productId);
    setReviews([]);
    setReviewsLoading(true);
    setQuestions([]);
    setQuestionsLoading(true);
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
    storeApi
      .getProductQuestions(productId)
      .then((fetched) => {
        if (!mounted) return;
        setQuestions(fetched);
        setQuestionsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setQuestionsLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, markProductViewed]);

  useEffect(() => {
    if (!product || !product.inStock) return;
    setQty((prev) => Math.max(1, Math.min(prev, product.stockCount || 1)));
  }, [product?.inStock, product?.stockCount]);

  useEffect(() => {
    if (!product) {
      removeJsonLdScript('product-jsonld');
      removeJsonLdScript('product-breadcrumb-jsonld');
      return;
    }

    const activeCat = categories.find(
      (c) => c.slug === product.category || c.id === product.category
    );
    const liveReviewCount = reviews.length > 0 ? Math.max(reviews.length, product.reviewCount) : product.reviewCount;
    const seoMeta = buildRouteSeoMetadata({
      route: { page: 'product', slug: product.slug },
      categories,
      products: [product],
      origin: SITE_ORIGIN,
    });
    applyDocumentSeoMeta(seoMeta);

    upsertJsonLdScript(
      'product-jsonld',
      buildProductJsonLd(product, {
        siteOrigin: SITE_ORIGIN,
        reviewCount: liveReviewCount,
        ratingValue: product.rating,
      })
    );
    upsertJsonLdScript(
      'product-breadcrumb-jsonld',
      buildBreadcrumbJsonLd(
        [
          { name: 'فروشگاه موبایل امیر', url: '/' },
          {
            name: activeCat?.label || 'کاتالوگ محصولات',
            url: activeCat ? `/catalog?cat=${encodeURIComponent(activeCat.slug)}` : '/catalog',
          },
          { name: product.nameFa, url: `/product/${encodeURIComponent(product.slug)}` },
        ],
        SITE_ORIGIN
      )
    );

    return () => {
      removeJsonLdScript('product-jsonld');
      removeJsonLdScript('product-breadcrumb-jsonld');
    };
  }, [categories, product, reviews.length]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
      .filter((u): u is string => typeof u === 'string')
      .map((u) => u.trim())
      .filter(Boolean);
    return [...new Set(list)];
  }, [product]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (galleryImages.length > 1 && e.key === 'ArrowLeft') {
        setActiveImageIndex((i) => (i + 1) % galleryImages.length);
      } else if (galleryImages.length > 1 && e.key === 'ArrowRight') {
        setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, galleryImages.length]);

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

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .sort((a, b) => Number(b.inStock) - Number(a.inStock))
      .slice(0, 4);
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
        <h1 className="text-2xl font-semibold text-[#11161E]">محصول مورد نظر یافت نشد</h1>
        <p className="text-sm text-[#4A5464]">
          ممکن است نشانی محصول تغییر کرده یا از فهرست حذف شده باشد.
        </p>
        <a
          href={buildHref('/catalog')}
          onClick={(e) => handleLinkClick(e, '/catalog')}
          className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-sm font-semibold inline-flex items-center transition-colors"
        >
          بازگشت به فروشگاه
        </a>
      </div>
    );
  }

  const productColors = Array.isArray(product.colors) ? product.colors : [];
  const activeColor = productColors.find((c) => c.id === selectedColorId) ?? productColors[0];

  const activeVariant = (() => {
    if (!product.variants || product.variants.length === 0) return null;
    const colorHexLow = (activeColor?.hex || '').toLowerCase();
    const colorName = activeColor?.name || '';
    const exact = product.variants.find(
      (v) =>
        (!v.storage || v.storage === selectedStorage) &&
        (v.colorId === activeColor?.id ||
          v.colorNameFa === colorName ||
          (v.colorHex || '').toLowerCase() === colorHexLow)
    );
    if (exact) return exact;
    return product.variants.find((v) => v.storage === selectedStorage) || null;
  })();

  const fallbackPricing = getVariantPrice(product, selectedStorage);
  const variantPrice = activeVariant ? activeVariant.priceToman : fallbackPricing.price;
  const variantOriginal = activeVariant
    ? activeVariant.originalPriceToman ?? activeVariant.priceToman
    : fallbackPricing.originalPrice;
  const effectiveStockCount =
    typeof activeVariant?.availableStock === 'number'
      ? activeVariant.availableStock
      : product.stockCount;
  const effectiveInStock = product.inStock && effectiveStockCount > 0;
  const baseWarranty = activeVariant?.warrantyName || product.warranty;

  const carePlusPrice = calculateCareInsurancePrice(variantPrice, product.category);
  const effectiveUnitPrice =
    includeCarePlus && carePlusPrice > 0 ? variantPrice + carePlusPrice : variantPrice;
  const effectiveOriginalPrice =
    includeCarePlus && carePlusPrice > 0 ? variantOriginal + carePlusPrice : variantOriginal;
  const effectiveWarranty =
    includeCarePlus && carePlusPrice > 0
      ? `${baseWarranty} + بیمه حوادث و شکستگی Amir Care+`
      : baseWarranty;

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
        // Fallback to clipboard copy
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
      variantId: activeVariant?.id,
      sku: activeVariant?.sku,
      partNumber: activeVariant?.partNumber || undefined,
      simType: activeVariant?.simType || undefined,
      colorName: activeColor?.name ?? product.colorLabel,
      colorHex: activeColor?.hex ?? '#1e293b',
      storageLabel: selectedStorage,
      warranty: effectiveWarranty,
      unitPrice: effectiveUnitPrice,
      originalUnitPrice: effectiveOriginalPrice,
      stockCount: effectiveStockCount,
      qty,
    });
    if (!goToCart) {
      triggerAdded();
    } else {
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
        useUsername: Boolean(user?.username && useReviewUsername),
      });
      if (savedReview.isApproved) {
        setReviews((prev) => [savedReview, ...prev]);
        showToast('دیدگاه شما با موفقیت ثبت و منتشر شد.', 'success');
      } else {
        showToast('دیدگاه شما ثبت شد و پس از تایید مدیر منتشر می‌شود.', 'success');
      }
      setReviewAuthor(user?.fullName || '');
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت دیدگاه.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questionAuthor.trim().length < 2 || questionText.trim().length < 8) {
      showToast('لطفاً نام و متن پرسش (حداقل ۸ کاراکتر) را وارد کنید.', 'error');
      return;
    }
    setSubmittingQuestion(true);
    try {
      const created = await storeApi.submitProductQuestion(product.id, {
        authorName: questionAuthor.trim(),
        question: questionText.trim(),
      });
      setQuestions((prev) => [created, ...prev]);
      setQuestionText('');
      setQuestionAuthor(user?.fullName || '');
      showToast('پرسش شما ثبت شد و به زودی توسط کارشناسان پاسخ داده می‌شود.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت پرسش.', 'error');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleStockAlertClick = async () => {
    if (!user && !isAlerted) {
      const trimmedEmail = guestAlertEmail.trim();
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        showToast('لطفاً ایمیل معتبر خود را برای اطلاع‌رسانی موجودی وارد کنید.', 'error');
        return;
      }
      await toggleStockAlert(product.id, {
        email: trimmedEmail,
        variantId: activeVariant?.id ?? null,
      });
      return;
    }
    await toggleStockAlert(product.id, {
      email: !user && guestAlertEmail.trim() ? guestAlertEmail.trim() : undefined,
      variantId: activeVariant?.id ?? null,
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-[#576071]">
        <a
          href={buildHref('/')}
          onClick={(e) => handleLinkClick(e, '/')}
          className="hover:text-[#11161E]"
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
          className="hover:text-[#11161E]"
        >
          {categoryLabel}
        </a>
        <span>/</span>
        <span className="font-medium text-[#11161E] line-clamp-1">{product.nameFa}</span>
      </nav>

      {/* Main 3-Column PDP Grid */}
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Col 1: Product Multi-Image Gallery Slider */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative aspect-square rounded-xl bg-[#F3F5F8] border border-[#E4E8EE] overflow-hidden p-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                type="button"
                key={currentGalleryImg}
                initial={{ opacity: 0.35, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.35, scale: 0.985 }}
                transition={{ duration: 0.2, ease: UI_EASE }}
                onClick={() => setLightboxOpen(true)}
                aria-label="بزرگ‌نمایی تصویر محصول"
                className="w-full h-full block cursor-zoom-in focus:outline-none"
              >
                <SmartImage
                  src={currentGalleryImg}
                  alt={`${product.nameFa} - تصویر ${toPersianDigits(activeImageIndex + 1)}`}
                  loading="eager"
                  fetchPriority="high"
                  optimizeWidth={800}
                  width={640}
                  height={640}
                  data-testid="pdp-main-image"
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.button>
            </AnimatePresence>
            {product.discountPercent && product.inStock && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-[#FDF1E8] border border-[#F5D6BE] text-[#A84500] text-xs font-medium tabular-nums-fa">
                {toPersianDigits(product.discountPercent)}٪ تخفیف ویژه
              </span>
            )}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => toggleWishlist(product.id)}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                    : 'bg-white border-[#E4E8EE] text-[#4A5464] hover:text-[#B42318]'
                }`}
              >
                <motion.span
                  key={isWishlisted ? 'liked' : 'unliked'}
                  initial={isWishlisted ? { scale: 0.55 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 18 }}
                  className="inline-flex items-center justify-center"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
                </motion.span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                data-testid="pdp-compare-toggle"
                onClick={() => toggleCompare(product.id)}
                aria-label="افزودن به مقایسه"
                title="مقایسه محصول"
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  isCompared
                    ? 'bg-[#1453D6] border-[#1453D6] text-white'
                    : 'bg-white border-[#E4E8EE] text-[#4A5464] hover:text-[#1453D6]'
                }`}
              >
                <Scale className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                data-testid="pdp-share-btn"
                onClick={handleShareProduct}
                aria-label="اشتراک‌گذاری محصول"
                title="اشتراک‌گذاری محصول"
                className="w-9 h-9 rounded-lg bg-white border border-[#E4E8EE] text-[#4A5464] hover:text-[#1453D6] flex items-center justify-center transition-colors"
              >
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              data-testid="pdp-open-lightbox-btn"
              onClick={() => setLightboxOpen(true)}
              aria-label="بزرگ‌نمایی گالری تصاویر"
              title="بزرگ‌نمایی تصویر"
              className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-lg bg-white/95 hover:bg-white border border-[#E4E8EE] text-[#4A5464] hover:text-[#1453D6] flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  data-testid="pdp-gallery-prev"
                  onClick={() =>
                    setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
                  }
                  aria-label="تصویر قبلی"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/95 hover:bg-white border border-[#E4E8EE] text-[#11161E] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  data-testid="pdp-gallery-next"
                  onClick={() => setActiveImageIndex((i) => (i + 1) % galleryImages.length)}
                  aria-label="تصویر بعدی"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/95 hover:bg-white border border-[#E4E8EE] text-[#11161E] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span
                  dir="ltr"
                  className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#13171F]/85 text-white text-[11px] font-medium tabular-nums-fa"
                >
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
                  className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 bg-[#F3F5F8] transition-colors ${
                    idx === activeImageIndex
                      ? 'border-[#1453D6] ring-2 ring-[#1453D6]/20'
                      : 'border-[#E4E8EE] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SmartImage
                    src={imgSrc}
                    alt={`${product.nameFa} ${idx + 1}`}
                    optimizeWidth={160}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-[#11161E] font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A5464] shrink-0" strokeWidth={1.5} />
              <span>کد رجیستری همتا</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-[#11161E] font-medium flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#4A5464] shrink-0" strokeWidth={1.5} />
              <span>بسته‌بندی پلمپ ضدضربه</span>
            </div>
          </div>
        </div>

        {/* Col 2: Title, Variant Configurator, Quick Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-[#E4E8EE] pb-5">
            <div className="flex items-center justify-between gap-2">
              <a
                href={buildHref(`/catalog?brand=${encodeURIComponent(product.brand)}`)}
                onClick={(e) => {
                  if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    navigateToCatalog({ brand: product.brand });
                  }
                }}
                className="text-xs font-medium text-[#1453D6] hover:underline"
              >
                {product.brand}
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#11161E] tabular-nums-fa">
                <Star className="w-4 h-4 text-[#A84500] fill-[#A84500]" strokeWidth={1.5} />
                {toPersianDigits(product.rating)} از ۵ ({toPersianDigits(reviews.length)} دیدگاه)
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-semibold text-[#11161E] leading-9">
              {product.nameFa}
            </h1>
            <p className="text-xs text-[#576071] font-normal" dir="ltr">
              {product.nameEn}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-xs font-medium text-[#067647]">
                {toPersianDigits(product.recommendPercent)}٪ از خریداران این کالا را پیشنهاد کرده‌اند
              </p>
              <button
                type="button"
                onClick={handleShareProduct}
                className="text-xs font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                اشتراک‌گذاری محصول
              </button>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#11161E]">
              رنگ انتخابی <span className="text-[#1453D6] font-medium">{activeColor?.name}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const selected = color.id === activeColor?.id;
                return (
                  <motion.button
                    key={color.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColorId(color.id)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-2 transition-colors ${
                      selected
                        ? 'border-[#1453D6] bg-[#EEF3FC] text-[#1453D6] ring-1 ring-[#1453D6]/20'
                        : 'border-[#E4E8EE] bg-white text-[#4A5464] hover:border-[#C5CEDB]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Storage / Variant Selector */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#11161E]">ظرفیت و نسخه</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {product.storageOptions.map((opt) => {
                const selected = opt.label === selectedStorage;
                return (
                  <motion.button
                    key={opt.label}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    data-testid={`variant-storage-${opt.label}`}
                    onClick={() => setSelectedStorage(opt.label)}
                    className={`p-3 rounded-lg border text-right transition-colors ${
                      selected
                        ? 'border-[#1453D6] bg-[#EEF3FC] text-[#1453D6] ring-1 ring-[#1453D6]/20'
                        : 'border-[#E4E8EE] bg-white text-[#11161E] hover:border-[#C5CEDB]'
                    }`}
                  >
                    <p className="text-xs font-semibold">{opt.label}</p>
                    <p className="text-[11px] text-[#4A5464] mt-0.5">{opt.subtitle}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Variant (SKU / Part Number / SIM) Metadata */}
          {activeVariant && (
            <div
              data-testid="pdp-variant-meta"
              className="rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <p className="text-[11px] text-[#576071] font-normal">کد تنوع (SKU)</p>
                <p
                  data-testid="pdp-variant-sku"
                  dir="ltr"
                  className="font-mono font-medium text-[#11161E] text-[11px] text-right truncate"
                >
                  {activeVariant.sku}
                </p>
              </div>
              {activeVariant.partNumber && (
                <div className="space-y-0.5">
                  <p className="text-[11px] text-[#576071] font-normal">پارت‌نامبر / ریجن</p>
                  <p
                    data-testid="pdp-variant-part"
                    dir="ltr"
                    className="font-mono font-medium text-[#1453D6] text-right"
                  >
                    {activeVariant.partNumber}
                  </p>
                </div>
              )}
              {activeVariant.simType && (
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-[#576071] font-normal">پشتیبانی سیم‌کارت</p>
                  <p className="font-medium text-[#11161E]">{activeVariant.simType}</p>
                </div>
              )}
            </div>
          )}

          {/* 4 Hardware Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#576071]">
                <Smartphone className="w-3.5 h-3.5 text-[#4A5464]" strokeWidth={1.5} />
                <span>نمایشگر</span>
              </div>
              <p className="text-xs font-semibold text-[#11161E]">{product.specs.display}</p>
              <p className="text-[11px] text-[#4A5464]">{product.specs.displayDetails}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#576071]">
                <Cpu className="w-3.5 h-3.5 text-[#4A5464]" strokeWidth={1.5} />
                <span>پردازنده</span>
              </div>
              <p className="text-xs font-semibold text-[#11161E]">{product.specs.chipset}</p>
              <p className="text-[11px] text-[#4A5464]">{product.specs.chipsetDetails}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#576071]">
                <Camera className="w-3.5 h-3.5 text-[#4A5464]" strokeWidth={1.5} />
                <span>دوربین / قابلیت</span>
              </div>
              <p className="text-xs font-semibold text-[#11161E]">{product.specs.camera}</p>
              <p className="text-[11px] text-[#4A5464]">{product.specs.cameraDetails}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#576071]">
                <Zap className="w-3.5 h-3.5 text-[#4A5464]" strokeWidth={1.5} />
                <span>باتری و شارژ</span>
              </div>
              <p className="text-xs font-semibold text-[#11161E]">{product.specs.battery}</p>
              <p className="text-[11px] text-[#4A5464]">{product.specs.batteryDetails}</p>
            </div>
          </div>
        </div>

        {/* Col 3: Sticky Buy Box */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] p-5 space-y-5 sticky top-28">
            <div className="space-y-2 border-b border-[#E4E8EE] pb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#4A5464]">فروشنده</span>
                <span className="font-semibold text-[#11161E]">فروشگاه موبایل امیر</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#11161E] bg-white p-3 rounded-lg border border-[#E4E8EE]">
                <ShieldCheck className="w-4 h-4 text-[#4A5464] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="space-y-1">
                  <span className="font-medium leading-5 block">{baseWarranty}</span>
                  {activeVariant?.warrantyCoverageFa && (
                    <span className="text-[11px] text-[#4A5464] leading-5 block">
                      {activeVariant.warrantyCoverageFa}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {liveStockChecking ? (
              <ProductBuyBoxSkeleton />
            ) : effectiveInStock ? (
              <>
                <div className="space-y-1">
                  {effectiveOriginalPrice > effectiveUnitPrice && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#576071] line-through tabular-nums-fa">
                        {formatToman(effectiveOriginalPrice)} تومان
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FDF1E8] border border-[#F5D6BE] text-[#A84500] font-medium text-[11px] tabular-nums-fa">
                        سود شما: {formatToman(effectiveOriginalPrice - effectiveUnitPrice)}
                      </span>
                    </div>
                  )}
                  <p
                    data-testid="pdp-price"
                    className="text-2xl font-semibold text-[#11161E] tabular-nums-fa pt-1"
                  >
                    {formatToman(effectiveUnitPrice)}{' '}
                    <span className="text-xs font-normal text-[#4A5464]">تومان</span>
                  </p>
                  <p className="text-[11px] font-medium text-[#067647]">
                    موجود در انبار امیر ({toPersianDigits(effectiveStockCount)} عدد آماده ارسال)
                  </p>
                  <p
                    data-testid="pdp-price-updated-at"
                    className="text-[11px] text-[#576071] inline-flex items-center gap-1 pt-1 tabular-nums-fa"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-[#576071]" strokeWidth={1.5} />
                    آخرین به‌روزرسانی قیمت: {formattedPriceDate}
                  </p>
                </div>

                {/* Amir Care+ Toggle */}
                {carePlusPrice > 0 && (
                  <label className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#E4E8EE] cursor-pointer hover:border-[#1453D6] transition-colors">
                    <input
                      type="checkbox"
                      data-testid="pdp-care-plus-toggle"
                      checked={includeCarePlus}
                      onChange={(e) => setIncludeCarePlus(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-[#1453D6] shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#11161E]">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <ShieldPlus className="w-3.5 h-3.5 text-[#4A5464] shrink-0" strokeWidth={1.5} />
                          <span>بیمه حوادث</span>
                          <span dir="ltr">Care+</span>
                        </span>
                        <span dir="ltr" className="text-[#1453D6] tabular-nums-fa whitespace-nowrap">
                          +{formatToman(carePlusPrice)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A5464] leading-5">
                        پوشش ۱۲ ماهه شکستگی نمایشگر، آب‌خوردگی و نوسان برق
                      </p>
                    </div>
                  </label>
                )}

                {/* Quantity stepper */}
                <div className="flex items-center justify-between bg-white rounded-lg border border-[#E4E8EE] p-2">
                  <span className="text-xs font-medium text-[#4A5464] pr-2">تعداد</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="کاهش تعداد"
                      className="w-8 h-8 rounded-lg bg-[#F1F3F6] text-[#11161E] flex items-center justify-center hover:bg-[#EAECEF]"
                    >
                      <Minus className="w-4 h-4" strokeWidth={1.5} />
                    </motion.button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums-fa overflow-hidden inline-flex items-center justify-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={qty}
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 8, opacity: 0 }}
                          transition={{ duration: 0.14, ease: UI_EASE }}
                        >
                          {toPersianDigits(qty)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQty((q) => Math.min(effectiveStockCount || 5, q + 1))}
                      aria-label="افزایش تعداد"
                      className="w-8 h-8 rounded-lg bg-[#F1F3F6] text-[#11161E] flex items-center justify-center hover:bg-[#EAECEF]"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    data-testid="pdp-add-to-cart"
                    data-added={recentlyAdded ? 'true' : undefined}
                    onClick={() => handleAddToCart(false)}
                    className={`w-full h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                      recentlyAdded
                        ? 'bg-[#067647] hover:bg-[#05603A] text-white'
                        : 'bg-[#1453D6] hover:bg-[#0F44B5] text-white'
                    }`}
                  >
                    {recentlyAdded ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: UI_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" strokeWidth={2} />
                        <span>به سبد اضافه شد</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0.2, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16, ease: UI_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                        <span>افزودن به سبد خرید</span>
                      </motion.span>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(true)}
                    className="w-full h-10 rounded-lg bg-white hover:bg-[#EEF3FC] border border-[#DCE1E8] text-[#1453D6] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>خرید فوری و مشاهده سبد</span>
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </div>

                {/* Inline Installment Preview */}
                <a
                  href={buildHref('/installments')}
                  onClick={(e) => handleLinkClick(e, '/installments')}
                  className="w-full p-3 rounded-lg bg-white border border-[#E4E8EE] hover:border-[#1453D6] text-right transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-[#1453D6] inline-flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" strokeWidth={1.5} />
                      امکان خرید اقساطی ۱۲ ماهه
                    </p>
                    <p className="text-[11px] text-[#11161E] font-medium tabular-nums-fa">
                      ماهانه حدود {formatToman(installmentPreview.monthlyPayment)} تومان
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#576071] shrink-0" strokeWidth={1.5} />
                </a>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[#11161E]">این کالا فعلاً ناموجود است</p>
                <p className="text-xs text-[#4A5464] leading-6">
                  به محض شارژ مجدد انبار، از طریق ایمیل و اعلان حساب کاربری به شما اطلاع‌رسانی می‌کنیم.
                </p>
                {!user && !isAlerted && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="stock-alert-email-input"
                      className="text-[11px] font-medium text-[#11161E] block"
                    >
                      ایمیل برای دریافت هشدار موجودی
                    </label>
                    <input
                      id="stock-alert-email-input"
                      data-testid="stock-alert-email-input"
                      type="email"
                      dir="ltr"
                      value={guestAlertEmail}
                      onChange={(e) => setGuestAlertEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                  </div>
                )}
                <button
                  type="button"
                  data-testid="pdp-stock-alert-btn"
                  onClick={handleStockAlertClick}
                  className={`w-full h-11 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                    isAlerted
                      ? 'bg-[#13171F] text-white'
                      : 'bg-[#1453D6] hover:bg-[#0F44B5] text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" strokeWidth={1.5} />
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
          <h2 className="text-lg sm:text-xl font-semibold text-[#11161E]">
            لوازم جانبی پیشنهادی همراه این کالا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complementaryItems.map((acc) => (
              <ComplementaryAccessoryCard
                key={acc.id}
                acc={acc}
                buildHref={buildHref}
                handleLinkClick={handleLinkClick}
                onAdd={() => addToCart(acc)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Detailed Tabs */}
      <section className="bg-white rounded-2xl border border-[#E4E8EE] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#E4E8EE] px-5 pt-4 overflow-x-auto">
          {(
            [
              { id: 'specs', label: 'مشخصات فنی تخصصی' },
              { id: 'review', label: 'بررسی تخصصی کارشناسی' },
              { id: 'comments', label: `نظرات خریداران (${toPersianDigits(reviews.length)})` },
              { id: 'qa', label: `پرسش و پاسخ (${toPersianDigits(questions.length)})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`pdp-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#1453D6]'
                  : 'text-[#4A5464] hover:text-[#11161E]'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.span
                  layoutId="pdp-active-tab-line"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#1453D6]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'specs' && (
              <motion.div
                key="tab-specs"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: UI_EASE }}
                className="space-y-6"
              >
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
                    className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="font-medium text-[#4A5464]">{row.k}</span>
                    <span className="font-semibold text-[#11161E]">{row.v}</span>
                  </div>
                ))}
              </div>

              {product.attributeValues && product.attributeValues.length > 0 && (
                <div
                  className="space-y-3 border-t border-[#E4E8EE] pt-5"
                  data-testid="pdp-structured-attributes"
                >
                  <h3 className="text-sm font-semibold text-[#11161E]">جدول ویژگی‌های فنی استاندارد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {product.attributeValues.map((attr) => (
                      <div
                        key={attr.attributeId || attr.code}
                        className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="font-medium text-[#4A5464]">{attr.nameFa}</span>
                        <span className="font-semibold text-[#11161E] tabular-nums-fa">
                          {attr.displayValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.customSpecs && product.customSpecs.length > 0 && (
                <div className="space-y-3 border-t border-[#E4E8EE] pt-5" data-testid="pdp-custom-specs">
                  <h3 className="text-sm font-semibold text-[#11161E]">مشخصات ویژه و تخصصی محصول</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {product.customSpecs.map((spec, idx) => (
                      <div
                        key={`${spec.label}-${idx}`}
                        className="p-4 rounded-xl bg-[#EEF3FC]/60 border border-[#D4E2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="font-medium text-[#1453D6]">{spec.label}</span>
                        <span className="font-semibold text-[#11161E]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="tab-review"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: UI_EASE }}
              data-testid="pdp-editorial-review"
              className="space-y-4 text-sm text-[#11161E] leading-8 max-w-3xl"
            >
              <h3 className="text-base font-semibold">تحلیل تیم فنی فروشگاه موبایل امیر</h3>
              {product.editorialReview && product.editorialReview.trim() ? (
                <div className="space-y-3 text-[#4A5464]">
                  {product.editorialReview
                    .trim()
                    .split(/\n+/)
                    .map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                </div>
              ) : (
                <p className="text-[#4A5464]">
                  محصول <span className="font-semibold text-[#11161E]">{product.nameFa}</span> یکی از ارزشمندترین گزینه‌های رده خود در بازار ایران است. واحد کنترل کیفیت ۱۸ مرحله‌ای امیر پیش از پلمپ و ارسال نهایی، اصالت پارت‌نامبر، سلامت بسته‌بندی و وضعیت استعلام در سامانه همتا را تایید می‌کند.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] space-y-1">
                  <p className="font-semibold text-xs">نقاط قوت کلیدی</p>
                  <p className="text-xs leading-6">
                    کیفیت ساخت بالا، پایداری نرم‌افزاری طولانی‌مدت، گارانتی ۱۸ ماهه امیر سرویس و ارزش خرید مناسب.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] text-[#11161E] space-y-1">
                  <p className="font-semibold text-xs">پیشنهاد کارشناسان</p>
                  <p className="text-xs leading-6 text-[#4A5464]">
                    برای حفظ سلامت باتری در بلندمدت حتماً از آداپتورهای استاندارد GaN انکر یا اپل استفاده نمایید.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div
              key="tab-comments"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: UI_EASE }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
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
                      className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[#11161E]">{rev.author}</span>
                          {rev.authorUsername && (
                            <a
                              href={buildHref(`/u/${rev.authorUsername}`)}
                              onClick={(e) => handleLinkClick(e, `/u/${rev.authorUsername}`)}
                              dir="ltr"
                              data-testid="review-author-username"
                              className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] hover:border-[#1453D6] text-[#1453D6] font-mono text-[11px] font-medium transition-colors"
                            >
                              @{rev.authorUsername}
                            </a>
                          )}
                          {rev.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF3] text-[#067647] text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                              خریدار تاییدشده
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#576071]">{rev.dateLabel}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 text-[#A84500] fill-[#A84500]" strokeWidth={1.5} />
                        ))}
                      </div>
                      <p className="text-xs text-[#11161E] leading-6">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="lg:col-span-5 p-5 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] space-y-4 self-start"
              >
                <h3 className="text-sm font-semibold text-[#11161E]">ثبت دیدگاه جدید</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#11161E] block">نام شما</label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="مثال: علی حسینی"
                    className="w-full h-10 px-3 rounded-lg bg-white text-xs text-[#11161E] border border-[#E4E8EE] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
                {user?.username && (
                  <label className="flex items-center gap-2 text-xs text-[#11161E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useReviewUsername}
                      onChange={(e) => setUseReviewUsername(e.target.checked)}
                      className="w-4 h-4 accent-[#1453D6]"
                    />
                    <span>
                      نمایش نام کاربری{' '}
                      <span dir="ltr" className="font-mono font-medium text-[#1453D6]">
                        @{user.username}
                      </span>{' '}
                      در کنار دیدگاه
                    </span>
                  </label>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#11161E] block">امتیاز شما</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    data-testid="review-rating-select"
                    className="w-full h-10 px-3 rounded-lg bg-white text-xs text-[#11161E] border border-[#E4E8EE] focus:outline-none focus:border-[#1453D6]"
                  >
                    <option value={5}>۵ ستاره — عالی</option>
                    <option value={4}>۴ ستاره — خوب</option>
                    <option value={3}>۳ ستاره — متوسط</option>
                    <option value={2}>۲ ستاره — ضعیف</option>
                    <option value={1}>۱ ستاره — بسیار ضعیف</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#11161E] block">متن دیدگاه</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="تجربه کاربری یا نظر خود درباره کیفیت و ارسال"
                    className="w-full p-3 rounded-lg bg-white text-xs text-[#11161E] border border-[#E4E8EE] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full h-10 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
                >
                  {submittingReview ? 'در حال ثبت دیدگاه...' : 'ارسال دیدگاه'}
                </button>
              </form>
            </motion.div>
          )}
          {activeTab === 'qa' && (
            <motion.div
              key="tab-qa"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: UI_EASE }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              data-testid="pdp-qa-panel"
            >
              <div className="lg:col-span-7 space-y-4">
                {questionsLoading && questions.length === 0 ? (
                  <div className="space-y-4" aria-busy="true" aria-label="در حال بارگذاری پرسش‌ها">
                    <ReviewCardSkeleton />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-2">
                    <MessageSquareMore className="w-7 h-7 text-[#576071] mx-auto" strokeWidth={1.5} />
                    <p className="text-xs sm:text-sm font-medium text-[#11161E]">
                      هنوز پرسشی برای این محصول ثبت نشده است.
                    </p>
                    <p className="text-xs text-[#576071]">
                      سوال فنی یا ابهام خود درباره رجیستری، پارت‌نامبر یا گارانتی را بپرسید تا کارشناسان پاسخ دهند.
                    </p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      data-testid="pdp-qa-item"
                      className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#576071]">
                        <span className="font-semibold text-[#11161E]">{q.authorName}</span>
                        <span className="tabular-nums-fa">{formatPersianDate(q.createdAt)}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#11161E] leading-6">
                        پرسش: {q.question}
                      </p>
                      {q.answer ? (
                        <div className="p-3 rounded-lg bg-[#ECFDF3] border border-[#ABEFC6] space-y-1">
                          <p className="text-[11px] font-semibold text-[#067647]">
                            پاسخ کارشناس فروشگاه موبایل امیر
                          </p>
                          <p className="text-xs text-[#11161E] leading-6">{q.answer}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#576071]">در انتظار پاسخ کارشناسان فروشگاه</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSubmitQuestion}
                data-testid="pdp-qa-form"
                className="lg:col-span-5 p-5 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] space-y-4 self-start"
              >
                <h3 className="text-sm font-semibold text-[#11161E]">ثبت پرسش جدید درباره کالا</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#11161E] block">نام شما</label>
                  <input
                    type="text"
                    data-testid="pdp-qa-author-input"
                    value={questionAuthor}
                    onChange={(e) => setQuestionAuthor(e.target.value)}
                    placeholder="مثال: سارا کریمی"
                    className="w-full h-10 px-3 rounded-lg bg-white text-xs text-[#11161E] border border-[#E4E8EE] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#11161E] block">متن پرسش</label>
                  <textarea
                    rows={3}
                    data-testid="pdp-qa-question-input"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="سوال خود درباره پارت‌نامبر، گارانتی، رجیستری یا لوازم جعبه را بنویسید..."
                    className="w-full p-3 rounded-lg bg-white text-xs text-[#11161E] border border-[#E4E8EE] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="pdp-qa-submit-btn"
                  disabled={submittingQuestion}
                  className="w-full h-10 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
                >
                  {submittingQuestion ? 'در حال ثبت پرسش...' : 'ارسال پرسش'}
                </button>
              </form>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-4" data-testid="pdp-similar-products">
          <h2 className="text-lg sm:text-xl font-semibold text-[#11161E]">محصولات مشابه</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentOtherProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#11161E]">محصولات اخیراً مشاهده‌شده</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {recentOtherProducts.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: UI_EASE }}
            role="dialog"
            aria-modal="true"
            aria-label={`گالری تصاویر ${product.nameFa}`}
            data-testid="pdp-lightbox"
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#13171F] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3 text-white">
                <p className="text-xs sm:text-sm font-semibold line-clamp-1">{product.nameFa}</p>
                <div className="flex items-center gap-3 shrink-0">
                  {galleryImages.length > 1 && (
                    <span dir="ltr" className="text-xs text-white/75 tabular-nums-fa">
                      {toPersianDigits(activeImageIndex + 1)} / {toPersianDigits(galleryImages.length)}
                    </span>
                  )}
                  <button
                    type="button"
                    data-testid="pdp-lightbox-close"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="بستن بزرگ‌نمایی تصویر"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="relative aspect-square sm:aspect-[16/11] bg-[#0B0E14] rounded-xl overflow-hidden flex items-center justify-center">
                <SmartImage
                  src={currentGalleryImg}
                  alt={`${product.nameFa} - تصویر بزرگ ${toPersianDigits(activeImageIndex + 1)}`}
                  loading="eager"
                  optimizeWidth={1080}
                  className="max-w-full max-h-full object-contain"
                />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      data-testid="pdp-lightbox-prev"
                      onClick={() =>
                        setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
                      }
                      aria-label="تصویر قبلی در گالری"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white/90 hover:bg-white text-[#11161E] flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      data-testid="pdp-lightbox-next"
                      onClick={() => setActiveImageIndex((i) => (i + 1) % galleryImages.length)}
                      aria-label="تصویر بعدی در گالری"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white/90 hover:bg-white text-[#11161E] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ComplementaryAccessoryCard: React.FC<{
  acc: Product;
  buildHref: (to: string) => string;
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, to: string) => void;
  onAdd: () => void;
}> = ({ acc, buildHref, handleLinkClick, onAdd }) => {
  const { recentlyAdded, triggerAdded } = useTemporarilyAdded(1400);

  return (
    <div className="card-lift bg-white rounded-xl border border-[#E4E8EE] hover:border-[#C5CEDB] hover:shadow-sm p-4 flex items-center gap-4">
      <div className="w-20 h-20 rounded-lg bg-[#F3F5F8] overflow-hidden shrink-0">
        <SmartImage src={acc.image} alt={acc.nameFa} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <a
          href={buildHref(`/product/${acc.slug}`)}
          onClick={(e) => handleLinkClick(e, `/product/${acc.slug}`)}
          className="text-xs font-semibold text-[#11161E] hover:text-[#1453D6] line-clamp-2 text-right block"
        >
          {acc.nameFa}
        </a>
        <p className="text-xs font-semibold text-[#1453D6] tabular-nums-fa">
          {formatToman(acc.price)} تومان
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          onAdd();
          triggerAdded();
        }}
        className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-colors inline-flex items-center gap-1 ${
          recentlyAdded
            ? 'bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]'
            : 'bg-[#F1F3F6] hover:bg-[#1453D6] text-[#11161E] hover:text-white'
        }`}
      >
        {recentlyAdded ? (
          <>
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            <span>اضافه شد</span>
          </>
        ) : (
          <span>افزودن</span>
        )}
      </motion.button>
    </div>
  );
};
