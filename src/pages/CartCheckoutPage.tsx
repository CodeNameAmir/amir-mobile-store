import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import type { CheckoutFormData, Product } from '../types/store';
import { UI_EASE } from '../utils/motionHelpers';
import {
  calculateCartSummary,
  formatToman,
  isTehranCity,
  NATIONAL_POST_SHIPPING_FEE,
  resolveDeliverySlot,
  TEHRAN_EXPRESS_SHIPPING_FEE,
  toPersianDigits,
  validateCheckoutForm,
} from '../utils/storeLogic';
import { useTemporarilyAdded } from '../utils/useTemporarilyAdded';

interface CrossSellCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const CrossSellCard: React.FC<CrossSellCardProps> = ({ product, onAdd }) => {
  const { recentlyAdded, triggerAdded } = useTemporarilyAdded(1400);

  return (
    <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
        <SmartImage src={product.image} alt={product.nameFa} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#11161E] line-clamp-1">{product.nameFa}</p>
        <p className="text-xs font-semibold text-[#1453D6] tabular-nums-fa mt-0.5">
          {formatToman(product.price)} تومان
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        data-added={recentlyAdded ? 'true' : undefined}
        onClick={() => {
          onAdd(product);
          triggerAdded();
        }}
        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0 min-w-[72px] inline-flex items-center justify-center gap-1 ${
          recentlyAdded
            ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]'
            : 'bg-white border-[#E4E8EE] hover:bg-[#1453D6] hover:text-white hover:border-[#1453D6]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {recentlyAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15, ease: UI_EASE }}
              className="inline-flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              <span>اضافه شد</span>
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.14, ease: UI_EASE }}
            >
              افزودن
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

interface CartCheckoutPageProps {
  mode: 'cart' | 'checkout';
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({ mode }) => {
  const {
    cart,
    cartSummary,
    products,
    couponRules,
    storeSettings,
    addToCart,
    updateCartQty,
    removeCartItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    createDemoOrder,
    navigate,
    buildHref,
    handleLinkClick,
    user,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState(appliedCoupon || '');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ valid: boolean; message: string } | null>(
    null
  );

  const savedAddresses = user?.addresses ?? [];
  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  const initialCity = defaultAddress?.city || 'تهران';

  const [form, setForm] = useState<CheckoutFormData>({
    fullName: defaultAddress?.receiverName || user?.fullName || '',
    phone: defaultAddress?.phone || user?.phone || '',
    email: user?.email || '',
    city: initialCity,
    address: defaultAddress?.address || '',
    postalCode: defaultAddress?.postalCode || '',
    deliverySlot: isTehranCity(initialCity) ? 'express' : 'standard',
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (appliedCoupon) {
      setCouponInput(appliedCoupon);
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (!user) return;
    const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    setForm((prev) => {
      const nextCity = prev.address.trim() || prev.postalCode.trim() ? prev.city : def?.city || prev.city || 'تهران';
      const nextSlot = isTehranCity(nextCity) ? prev.deliverySlot : 'standard';
      if (prev.address.trim() || prev.postalCode.trim()) {
        return {
          ...prev,
          email: prev.email || user.email || '',
          deliverySlot: nextSlot,
        };
      }
      return {
        ...prev,
        fullName: prev.fullName || def?.receiverName || user.fullName || '',
        phone: prev.phone || def?.phone || user.phone || '',
        email: prev.email || user.email || '',
        city: nextCity,
        address: def?.address || prev.address,
        postalCode: def?.postalCode || prev.postalCode,
        deliverySlot: nextSlot,
      };
    });
    if (def && !selectedAddressId) {
      setSelectedAddressId(def.id);
    }
  }, [user, selectedAddressId]);

  const tehranAllowed = isTehranCity(form.city);
  const resolvedSlot = resolveDeliverySlot(form.city, form.deliverySlot);
  const displaySummary =
    mode === 'checkout'
      ? calculateCartSummary(
          cart,
          appliedCoupon,
          couponRules,
          storeSettings.freeShippingThreshold,
          { city: form.city, deliverySlot: resolvedSlot }
        )
      : cartSummary;

  const crossSellProducts = products
    .filter(
      (p) =>
        p.inStock &&
        (p.category === 'chargers' || p.category === 'cases') &&
        !cart.some((c) => c.productId === p.id)
    )
    .slice(0, 2);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponBusy(true);
    try {
      const res = await applyCoupon(couponInput);
      setCouponFeedback(res);
    } finally {
      setCouponBusy(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedForm: CheckoutFormData = {
      ...form,
      deliverySlot: resolveDeliverySlot(form.city, form.deliverySlot),
    };
    const validationErrors = validateCheckoutForm(normalizedForm);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const order = await createDemoOrder(normalizedForm);
      navigate(`/order-confirmed/${order.orderCode}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'ثبت سفارش با خطا مواجه شد. لطفاً مجدداً تلاش کنید.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-xl bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-[#11161E]">سبد خرید شما در حال حاضر خالی است</h1>
          <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
            می‌توانید جدیدترین گوشی‌های پرچمدار و لوازم جانبی اورجینال را در فروشگاه مشاهده کنید و به سبد خرید خود بیفزایید.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center"
            >
              مشاهده فروشگاه و محصولات
            </a>
            <a
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
              className="h-10 px-5 rounded-lg bg-[#F1F3F6] hover:bg-[#EAECEF] text-[#11161E] text-xs sm:text-sm font-medium inline-flex items-center transition-colors"
            >
              صفحه اصلی
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6">
      {/* 3-Step Stepper */}
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={buildHref('/cart')}
              onClick={(e) => handleLinkClick(e, '/cart')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                mode === 'cart'
                  ? 'bg-[#1453D6] text-white'
                  : 'bg-[#EEF3FC] text-[#1453D6]'
              }`}
            >
              <span>۱. سبد خرید ({toPersianDigits(cartSummary.itemCount)})</span>
            </a>
            <span className="text-[#DCE1E8]">—</span>
            <a
              href={buildHref('/checkout')}
              onClick={(e) => handleLinkClick(e, '/checkout')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                mode === 'checkout'
                  ? 'bg-[#1453D6] text-white'
                  : 'bg-[#F1F3F6] text-[#4A5464]'
              }`}
            >
              <span>۲. مشخصات ارسال و تایید نهایی</span>
            </a>
            <span className="text-[#DCE1E8] hidden sm:inline">—</span>
            <span className="hidden sm:inline-flex px-3.5 py-2 rounded-lg bg-[#F1F3F6] text-[#4A5464] text-xs font-medium">
              ۳. صدور کد رهگیری
            </span>
          </div>

          <a
            href={buildHref('/catalog')}
            onClick={(e) => handleLinkClick(e, '/catalog')}
            className="text-xs font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>ادامه خرید از فروشگاه</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column */}
        <div className="lg:col-span-8 space-y-5">
          {mode === 'cart' ? (
            <>
              <div className="bg-white rounded-2xl border border-[#E4E8EE] divide-y divide-[#E4E8EE] overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <h1 className="text-lg font-semibold text-[#11161E]">اقلام سبد خرید شما</h1>
                  <span className="text-xs font-medium text-[#4A5464] tabular-nums-fa">
                    {toPersianDigits(cartSummary.itemCount)} کالا
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {cart.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: UI_EASE }}
                      data-testid={`cart-item-${item.slug}`}
                      className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="w-24 h-24 rounded-xl bg-[#F3F5F8] border border-[#E4E8EE] overflow-hidden shrink-0">
                        <SmartImage
                          src={item.image}
                          alt={item.nameFa}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <a
                          href={buildHref(`/product/${item.slug}`)}
                          onClick={(e) => handleLinkClick(e, `/product/${item.slug}`)}
                          className="text-sm font-semibold text-[#11161E] hover:text-[#1453D6] text-right line-clamp-2 block"
                        >
                          {item.nameFa}
                        </a>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#4A5464]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F3F6] font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            {item.colorName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#F1F3F6] font-medium">
                            {item.storageLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#1453D6] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {item.warranty}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E4E8EE] rounded-lg p-1">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartQty(item.key, -1)}
                            aria-label="کاهش تعداد"
                            className="w-7 h-7 rounded-md bg-white text-[#11161E] flex items-center justify-center hover:bg-[#F1F3F6] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </motion.button>
                          <span
                            data-testid={`cart-qty-${item.slug}`}
                            className="w-6 text-center text-xs font-semibold tabular-nums-fa overflow-hidden inline-flex items-center justify-center"
                          >
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={item.qty}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.16, ease: UI_EASE }}
                                className="inline-block"
                              >
                                {toPersianDigits(item.qty)}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartQty(item.key, 1)}
                            aria-label="افزایش تعداد"
                            className="w-7 h-7 rounded-md bg-white text-[#11161E] flex items-center justify-center hover:bg-[#F1F3F6] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </motion.button>
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-semibold text-[#11161E] tabular-nums-fa">
                            {formatToman(item.unitPrice * item.qty)}{' '}
                            <span className="text-[11px] font-normal text-[#4A5464]">تومان</span>
                          </p>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => removeCartItem(item.key)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B42318] hover:underline mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>حذف</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {crossSellProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E4E8EE] p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-[#11161E]">
                    تکمیل خرید با لوازم جانبی اورجینال
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {crossSellProducts.map((acc) => (
                      <CrossSellCard
                        key={acc.id}
                        product={acc}
                        onAdd={(prod) => addToCart(prod)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Checkout Form */
            <form
              id="checkout-form"
              onSubmit={handleCheckoutSubmit}
              noValidate
              className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#E4E8EE] pb-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">
                    اطلاعات تحویل‌گیرنده و تکمیل سفارش
                  </h1>
                  <p className="text-xs text-[#4A5464] mt-1">
                    مشخصات ارسال، شماره تماس هماهنگی پیک و نشانی دقیق تحویل خود را بررسی و ثبت نهایی را تایید کنید.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-[11px] font-medium shrink-0">
                  ثبت امن سفارش
                </span>
              </div>

              {savedAddresses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#11161E] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
                      <span>انتخاب از آدرس‌های ذخیره‌شده حساب شما</span>
                    </p>
                    <a
                      href={buildHref('/account')}
                      onClick={(e) => handleLinkClick(e, '/account')}
                      className="text-[11px] font-medium text-[#1453D6] hover:underline"
                    >
                      مدیریت آدرس‌ها
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => {
                      const active = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setForm((prev) => ({
                              ...prev,
                              fullName: addr.receiverName,
                              phone: addr.phone,
                              city: addr.city,
                              address: addr.address,
                              postalCode: addr.postalCode,
                              deliverySlot: isTehranCity(addr.city) ? prev.deliverySlot : 'standard',
                            }));
                            setErrors({});
                          }}
                          className={`p-3.5 rounded-xl border text-right transition-colors ${
                            active
                              ? 'border-[#1453D6] bg-[#EEF3FC]'
                              : 'border-[#E4E8EE] bg-[#F7F8FA] hover:border-[#C5CEDB]'
                          }`}
                        >
                          <p className="text-xs font-semibold text-[#11161E]">
                            {addr.label} · {addr.city}
                          </p>
                          <p className="text-[11px] text-[#4A5464] line-clamp-1 mt-1">
                            {addr.address}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="chk-fullname" className="text-xs font-medium text-[#11161E] block">
                    نام و نام خانوادگی تحویل‌گیرنده
                  </label>
                  <input
                    id="chk-fullname"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="مثال: علیرضا محمدی"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:bg-white focus:outline-none focus:border-[#1453D6]"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-medium text-[#B42318]">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-phone" className="text-xs font-medium text-[#11161E] block">
                    شماره موبایل (جهت هماهنگی پیک و کد همتا)
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="09123456789"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] text-left focus:bg-white focus:outline-none focus:border-[#1453D6]"
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-medium text-[#B42318]">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-city" className="text-xs font-medium text-[#11161E] block">
                    استان / شهر
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => {
                      const nextCity = e.target.value;
                      setForm((p) => ({
                        ...p,
                        city: nextCity,
                        deliverySlot: isTehranCity(nextCity) ? p.deliverySlot : 'standard',
                      }));
                    }}
                    placeholder="تهران"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:bg-white focus:outline-none focus:border-[#1453D6]"
                  />
                  {errors.city && (
                    <p className="text-[11px] font-medium text-[#B42318]">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-postal" className="text-xs font-medium text-[#11161E] block">
                    کد پستی ۱۰ رقمی
                  </label>
                  <input
                    id="chk-postal"
                    type="text"
                    dir="ltr"
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="1988233145"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] text-left focus:bg-white focus:outline-none focus:border-[#1453D6]"
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] font-medium text-[#B42318]">{errors.postalCode}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="chk-email" className="text-xs font-medium text-[#11161E] block">
                    ایمیل جهت دریافت رسید سفارش و شماره پیگیری (اختیاری)
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    dir="ltr"
                    value={form.email || ''}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="customer@example.com"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] text-left focus:bg-white focus:outline-none focus:border-[#1453D6]"
                  />
                  {errors.email && (
                    <p className="text-[11px] font-medium text-[#B42318]">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="chk-address" className="text-xs font-medium text-[#11161E] block">
                  نشانی کامل پستی
                </label>
                <textarea
                  id="chk-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="خیابان، کوچه، پلاک و واحد"
                  className="w-full p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:bg-white focus:outline-none focus:border-[#1453D6]"
                />
                {errors.address && (
                  <p className="text-[11px] font-medium text-[#B42318]">{errors.address}</p>
                )}
              </div>

              {/* Delivery Slot */}
              <div className="space-y-2.5 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#11161E]">انتخاب شیوه و بازه ارسال</p>
                  {!tehranAllowed && (
                    <span className="text-[11px] font-medium text-[#B42318]">
                      ارسال پیک ۳ ساعته فقط برای شهر تهران فعال است
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    data-testid="shipping-express-option"
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                      !tehranAllowed
                        ? 'border-[#E4E8EE] bg-[#F1F3F6] opacity-60 cursor-not-allowed'
                        : resolvedSlot === 'express'
                        ? 'border-[#1453D6] bg-[#EEF3FC] cursor-pointer'
                        : 'border-[#E4E8EE] bg-[#F7F8FA] cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliverySlot"
                      disabled={!tehranAllowed}
                      checked={resolvedSlot === 'express'}
                      onChange={() => {
                        if (!tehranAllowed) return;
                        setForm((p) => ({ ...p, deliverySlot: 'express' }));
                      }}
                      className="mt-1 accent-[#1453D6]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#11161E]">
                        پیک اکسپرس اختصاصی امیر (تهران)
                      </p>
                      <p className="text-[11px] text-[#4A5464] mt-0.5 tabular-nums-fa">
                        {tehranAllowed
                          ? `تحویل امروز (حداکثر ۳ ساعت در تهران) · ${formatToman(TEHRAN_EXPRESS_SHIPPING_FEE)} تومان (رایگان بالای سقف)`
                          : 'فقط ویژه آدرس‌های شهر تهران — برای سایر شهرها پست پیشتاز انتخاب می‌شود'}
                      </p>
                    </div>
                  </label>

                  <label
                    data-testid="shipping-standard-option"
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      resolvedSlot === 'standard'
                        ? 'border-[#1453D6] bg-[#EEF3FC]'
                        : 'border-[#E4E8EE] bg-[#F7F8FA]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={resolvedSlot === 'standard'}
                      onChange={() => setForm((p) => ({ ...p, deliverySlot: 'standard' }))}
                      className="mt-1 accent-[#1453D6]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#11161E]">پست پیشتاز ویژه بیمه شده</p>
                      <p className="text-[11px] text-[#4A5464] mt-0.5 tabular-nums-fa">
                        ارسال ۱ تا ۲ روز کاری به سراسر ایران · {formatToman(NATIONAL_POST_SHIPPING_FEE)} تومان (رایگان بالای سقف)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] flex items-center gap-3 text-xs text-[#11161E]">
                <ShieldCheck className="w-5 h-5 text-[#4A5464] shrink-0" strokeWidth={1.5} />
                <p className="leading-6">
                  با کلیک روی «ثبت نهایی و تایید سفارش»، سفارش شما ثبت شده و به صفحه فاکتور رسمی و کد رهگیری منتقل می‌شوید.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right / Sticky Order Summary Sidebar */}
        <aside className="lg:col-span-4 space-y-4 sticky top-28">
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
            <h2 className="text-base font-semibold text-[#11161E] border-b border-[#E4E8EE] pb-3">
              خلاصه صورت‌حساب
            </h2>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="coupon-input" className="text-xs font-medium text-[#11161E] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
                <span>کد تخفیف دارید؟</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  dir="ltr"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="AMIR-OFF"
                  className="flex-1 h-10 px-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs font-mono font-medium text-left text-[#11161E] focus:bg-white focus:outline-none focus:border-[#1453D6]"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                      setCouponFeedback(null);
                    }}
                    className="h-10 px-3 rounded-lg bg-[#FEF3F2] text-[#B42318] text-xs font-medium shrink-0"
                  >
                    حذف
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={couponBusy}
                    data-testid="apply-coupon-btn"
                    className="h-10 px-4 rounded-lg bg-[#13171F] hover:bg-[#1453D6] disabled:opacity-60 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    {couponBusy ? 'بررسی...' : 'اعمال'}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#4A5464]">
                کد تخفیف فعال: <button type="button" onClick={() => setCouponInput('AMIR-OFF')} className="font-mono font-medium text-[#1453D6] underline" dir="ltr">AMIR-OFF</button> یا{' '}
                <button type="button" onClick={() => setCouponInput('VIP-10')} className="font-mono font-medium text-[#1453D6] underline" dir="ltr">VIP-10</button>
              </p>
              {couponFeedback && (
                <p
                  className={`text-[11px] font-medium ${
                    couponFeedback.valid ? 'text-[#067647]' : 'text-[#B42318]'
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </form>

            {/* Numbers Breakdown */}
            <div className="space-y-3 text-xs border-t border-[#E4E8EE] pt-4">
              <div className="flex items-center justify-between text-[#4A5464]">
                <span>قیمت کالاها ({toPersianDigits(displaySummary.itemCount)} عدد)</span>
                <span className="font-medium text-[#11161E] tabular-nums-fa">
                  {formatToman(displaySummary.originalSubtotal)} تومان
                </span>
              </div>

              {displaySummary.productDiscount > 0 && (
                <div className="flex items-center justify-between text-[#067647] font-medium">
                  <span>تخفیف شگفت‌انگیز کالاها</span>
                  <span className="tabular-nums-fa">
                    {formatToman(displaySummary.productDiscount)}- تومان
                  </span>
                </div>
              )}

              {displaySummary.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-[#067647] font-medium">
                  <span>تخفیف کد ({appliedCoupon})</span>
                  <span data-testid="coupon-discount-amount" className="tabular-nums-fa">
                    {formatToman(displaySummary.couponDiscount)}- تومان
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#4A5464]">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#576071]" strokeWidth={1.5} />
                  هزینه بسته‌بندی و ارسال
                </span>
                <span
                  data-testid="checkout-shipping-cost"
                  className="font-medium text-[#1453D6] tabular-nums-fa"
                >
                  {displaySummary.shippingCost === 0
                    ? 'رایگان'
                    : `${formatToman(displaySummary.shippingCost)} تومان`}
                </span>
              </div>
            </div>

            {/* Final Total */}
            <div className="border-t border-[#E4E8EE] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#11161E]">مبلغ قابل پرداخت</span>
                <span
                  data-testid="cart-total-payable"
                  className="text-xl font-semibold text-[#1453D6] tabular-nums-fa"
                >
                  {formatToman(displaySummary.totalPayable)}{' '}
                  <span className="text-xs font-normal text-[#4A5464]">تومان</span>
                </span>
              </div>

              {displaySummary.totalSavings > 0 && (
                <div className="p-2.5 rounded-lg bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] text-xs font-medium flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    مجموع سود شما از این خرید
                  </span>
                  <span className="tabular-nums-fa">{formatToman(displaySummary.totalSavings)} تومان</span>
                </div>
              )}

              {mode === 'cart' ? (
                <a
                  href={buildHref('/checkout')}
                  onClick={(e) => handleLinkClick(e, '/checkout')}
                  data-testid="proceed-to-checkout-btn"
                  className="w-full h-11 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>ادامه و ثبت مشخصات ارسال</span>
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  data-testid="submit-demo-order-btn"
                  className="w-full h-11 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{submitting ? 'در حال ثبت سفارش...' : 'ثبت نهایی و تایید سفارش'}</span>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
