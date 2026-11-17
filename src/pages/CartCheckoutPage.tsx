import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import type { CheckoutFormData } from '../types/store';
import {
  formatToman,
  toPersianDigits,
  validateCheckoutForm,
} from '../utils/storeLogic';

interface CartCheckoutPageProps {
  mode: 'cart' | 'checkout';
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({ mode }) => {
  const {
    cart,
    cartSummary,
    products,
    addToCart,
    updateCartQty,
    removeCartItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    createDemoOrder,
    navigate,
    user,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState(appliedCoupon || '');
  const [couponFeedback, setCouponFeedback] = useState<{ valid: boolean; message: string } | null>(
    null
  );

  const savedAddresses = user?.addresses ?? [];
  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [form, setForm] = useState<CheckoutFormData>({
    fullName: defaultAddress?.receiverName || user?.fullName || '',
    phone: defaultAddress?.phone || user?.phone || '',
    city: defaultAddress?.city || 'تهران',
    address: defaultAddress?.address || '',
    postalCode: defaultAddress?.postalCode || '',
    deliverySlot: 'express',
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    setForm((prev) => {
      if (prev.address.trim() || prev.postalCode.trim()) return prev;
      return {
        ...prev,
        fullName: prev.fullName || def?.receiverName || user.fullName || '',
        phone: prev.phone || def?.phone || user.phone || '',
        city: def?.city || prev.city || 'تهران',
        address: def?.address || prev.address,
        postalCode: def?.postalCode || prev.postalCode,
      };
    });
    if (def && !selectedAddressId) {
      setSelectedAddressId(def.id);
    }
  }, [user, selectedAddressId]);

  const crossSellProducts = products
    .filter(
      (p) =>
        p.inStock &&
        (p.category === 'chargers' || p.category === 'cases') &&
        !cart.some((c) => c.productId === p.id)
    )
    .slice(0, 2);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const order = await createDemoOrder(form);
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
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#e5eeff] p-10 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#0b1c30]">سبد خرید شما در حال حاضر خالی است</h1>
          <p className="text-xs sm:text-sm text-[#434655] leading-6">
            می‌توانید جدیدترین گوشی‌های پرچمدار و لوازم جانبی اورجینال را در فروشگاه مشاهده کنید و به سبد خرید خود بیفزایید.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold transition-colors"
            >
              مشاهده فروشگاه و محصولات
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-11 px-5 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs sm:text-sm font-bold"
            >
              صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6">
      {/* 3-Step Stepper */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 ${
                mode === 'cart'
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#eff4ff] text-[#004ac6]'
              }`}
            >
              <span>۱. سبد خرید ({toPersianDigits(cartSummary.itemCount)})</span>
            </button>
            <span className="text-[#dce9ff]">—</span>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 ${
                mode === 'checkout'
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#f8f9ff] text-[#434655]'
              }`}
            >
              <span>۲. مشخصات ارسال و تایید آزمایشی</span>
            </button>
            <span className="text-[#dce9ff] hidden sm:inline">—</span>
            <span className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-[#f8f9ff] text-[#434655] text-xs font-bold">
              ۳. صدور کد رهگیری
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>ادامه خرید از فروشگاه</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column */}
        <div className="lg:col-span-8 space-y-5">
          {mode === 'cart' ? (
            <>
              <div className="bg-white rounded-3xl border border-[#e5eeff] divide-y divide-[#eff4ff] overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <h1 className="text-lg font-black text-[#0b1c30]">اقلام سبد خرید شما</h1>
                  <span className="text-xs font-bold text-[#434655] tabular-nums-fa">
                    {toPersianDigits(cartSummary.itemCount)} کالا
                  </span>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.key}
                    data-testid={`cart-item-${item.slug}`}
                    className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] overflow-hidden shrink-0">
                      <SmartImage
                        src={item.image}
                        alt={item.nameFa}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${item.slug}`)}
                        className="text-sm font-extrabold text-[#0b1c30] hover:text-[#004ac6] text-right line-clamp-2"
                      >
                        {item.nameFa}
                      </button>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#434655]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f8f9ff] font-semibold">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/15"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          {item.colorName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#f8f9ff] font-semibold">
                          {item.storageLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#004ac6] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {item.warranty}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2 bg-[#f8f9ff] border border-[#e5eeff] rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.key, -1)}
                          aria-label="کاهش تعداد"
                          className="w-7 h-7 rounded-lg bg-white text-[#0b1c30] flex items-center justify-center hover:bg-[#eff4ff]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          data-testid={`cart-qty-${item.slug}`}
                          className="w-6 text-center text-xs font-extrabold tabular-nums-fa"
                        >
                          {toPersianDigits(item.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.key, 1)}
                          aria-label="افزایش تعداد"
                          className="w-7 h-7 rounded-lg bg-white text-[#0b1c30] flex items-center justify-center hover:bg-[#eff4ff]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-black text-[#0b1c30] tabular-nums-fa">
                          {formatToman(item.unitPrice * item.qty)}{' '}
                          <span className="text-[11px] font-semibold text-[#434655]">تومان</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.key)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {crossSellProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 space-y-3">
                  <h2 className="text-sm font-extrabold text-[#0b1c30]">
                    تکمیل خرید با لوازم جانبی اورجینال
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {crossSellProducts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-3 rounded-xl bg-[#f8f9ff] flex items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0">
                          <SmartImage src={acc.image} alt={acc.nameFa} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0b1c30] line-clamp-1">{acc.nameFa}</p>
                          <p className="text-xs font-extrabold text-[#004ac6] tabular-nums-fa mt-0.5">
                            {formatToman(acc.price)} تومان
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(acc)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#dce9ff] hover:bg-[#004ac6] hover:text-white text-xs font-bold transition-colors shrink-0"
                        >
                          + افزودن
                        </button>
                      </div>
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
              className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#eff4ff] pb-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">
                    اطلاعات تحویل‌گیرنده و ثبت سفارش آزمایشی
                  </h1>
                  <p className="text-xs text-[#434655] mt-1">
                    این سفارش در حالت نمونه‌کار ثبت می‌شود و هیچ تراکنش بانکی واقعی انجام نخواهد شد.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-[11px] font-bold shrink-0">
                  حالت دمو
                </span>
              </div>

              {savedAddresses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#004ac6]" />
                      <span>انتخاب از آدرس‌های ذخیره‌شده حساب شما</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/account')}
                      className="text-[11px] font-bold text-[#004ac6] hover:underline"
                    >
                      مدیریت آدرس‌ها
                    </button>
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
                            }));
                            setErrors({});
                          }}
                          className={`p-3.5 rounded-2xl border text-right transition-colors ${
                            active
                              ? 'border-[#004ac6] bg-[#eff4ff]'
                              : 'border-[#e5eeff] bg-[#f8f9ff] hover:border-[#2563eb]'
                          }`}
                        >
                          <p className="text-xs font-extrabold text-[#0b1c30]">
                            {addr.label} · {addr.city}
                          </p>
                          <p className="text-[11px] text-[#434655] line-clamp-1 mt-1">
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
                  <label htmlFor="chk-fullname" className="text-xs font-bold text-[#0b1c30] block">
                    نام و نام خانوادگی تحویل‌گیرنده
                  </label>
                  <input
                    id="chk-fullname"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="مثال: علیرضا محمدی"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-bold text-rose-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-phone" className="text-xs font-bold text-[#0b1c30] block">
                    شماره موبایل (جهت هماهنگی پیک و کد همتا)
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="09123456789"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] text-left focus:outline-none focus:border-[#004ac6]"
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-bold text-rose-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-city" className="text-xs font-bold text-[#0b1c30] block">
                    استان / شهر
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="تهران"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  {errors.city && (
                    <p className="text-[11px] font-bold text-rose-600">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chk-postal" className="text-xs font-bold text-[#0b1c30] block">
                    کد پستی ۱۰ رقمی
                  </label>
                  <input
                    id="chk-postal"
                    type="text"
                    dir="ltr"
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="1988233145"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] text-left focus:outline-none focus:border-[#004ac6]"
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] font-bold text-rose-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="chk-address" className="text-xs font-bold text-[#0b1c30] block">
                  نشانی کامل پستی
                </label>
                <textarea
                  id="chk-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="خیابان، کوچه، پلاک و واحد..."
                  className="w-full p-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                {errors.address && (
                  <p className="text-[11px] font-bold text-rose-600">{errors.address}</p>
                )}
              </div>

              {/* Delivery Slot */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold text-[#0b1c30]">انتخاب شیوه و بازه ارسال</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      form.deliverySlot === 'express'
                        ? 'border-[#004ac6] bg-[#eff4ff]'
                        : 'border-[#e5eeff] bg-[#f8f9ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={form.deliverySlot === 'express'}
                      onChange={() => setForm((p) => ({ ...p, deliverySlot: 'express' }))}
                      className="mt-1 accent-[#004ac6]"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#0b1c30]">پیک اکسپرس اختصاصی امیر</p>
                      <p className="text-[11px] text-[#434655] mt-0.5">
                        تحویل امروز (حداکثر ۳ ساعت در تهران) · رایگان بالای ۱ میلیون
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      form.deliverySlot === 'standard'
                        ? 'border-[#004ac6] bg-[#eff4ff]'
                        : 'border-[#e5eeff] bg-[#f8f9ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={form.deliverySlot === 'standard'}
                      onChange={() => setForm((p) => ({ ...p, deliverySlot: 'standard' }))}
                      className="mt-1 accent-[#004ac6]"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#0b1c30]">پست پیشتاز ویژه بیمه شده</p>
                      <p className="text-[11px] text-[#434655] mt-0.5">
                        ارسال ۱ تا ۲ روز کاری به سراسر ایران با بسته‌بندی ضدضربه
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-3 text-xs text-[#0b1c30]">
                <Sparkles className="w-5 h-5 text-[#004ac6] shrink-0" />
                <p className="leading-6">
                  با کلیک روی «ثبت نهایی سفارش آزمایشی»، سفارش شما در پایگاه‌داده ثبت شده و به صفحه فاکتور و کد رهگیری منتقل می‌شوید.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right / Sticky Order Summary Sidebar */}
        <aside className="lg:col-span-4 space-y-4 sticky top-28">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-black text-[#0b1c30] border-b border-[#eff4ff] pb-3">
              خلاصه صورت‌حساب
            </h2>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="coupon-input" className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#004ac6]" />
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
                  className="flex-1 h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs font-bold text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                      setCouponFeedback(null);
                    }}
                    className="h-10 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold shrink-0"
                  >
                    حذف
                  </button>
                ) : (
                  <button
                    type="submit"
                    data-testid="apply-coupon-btn"
                    className="h-10 px-4 rounded-xl bg-[#213145] hover:bg-[#004ac6] text-white text-xs font-bold transition-colors shrink-0"
                  >
                    اعمال
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#434655]">
                کد تست: <button type="button" onClick={() => setCouponInput('AMIR-OFF')} className="font-bold text-[#004ac6] underline" dir="ltr">AMIR-OFF</button> یا{' '}
                <button type="button" onClick={() => setCouponInput('VIP-10')} className="font-bold text-[#004ac6] underline" dir="ltr">VIP-10</button>
              </p>
              {couponFeedback && (
                <p
                  className={`text-[11px] font-bold ${
                    couponFeedback.valid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </form>

            {/* Numbers Breakdown */}
            <div className="space-y-3 text-xs border-t border-[#eff4ff] pt-4">
              <div className="flex items-center justify-between text-[#434655]">
                <span>قیمت کالاها ({toPersianDigits(cartSummary.itemCount)} عدد)</span>
                <span className="font-bold text-[#0b1c30] tabular-nums-fa">
                  {formatToman(cartSummary.originalSubtotal)} تومان
                </span>
              </div>

              {cartSummary.productDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>تخفیف شگفت‌انگیز کالاها</span>
                  <span className="tabular-nums-fa">
                    {formatToman(cartSummary.productDiscount)}- تومان
                  </span>
                </div>
              )}

              {cartSummary.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>تخفیف کد ({appliedCoupon})</span>
                  <span data-testid="coupon-discount-amount" className="tabular-nums-fa">
                    {formatToman(cartSummary.couponDiscount)}- تومان
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#434655]">
                <span className="inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#004ac6]" />
                  هزینه بسته‌بندی و ارسال
                </span>
                <span className="font-bold text-[#004ac6] tabular-nums-fa">
                  {cartSummary.shippingCost === 0
                    ? 'رایگان'
                    : `${formatToman(cartSummary.shippingCost)} تومان`}
                </span>
              </div>
            </div>

            {/* Final Total */}
            <div className="border-t border-[#eff4ff] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#0b1c30]">مبلغ قابل پرداخت:</span>
                <span
                  data-testid="cart-total-payable"
                  className="text-xl font-black text-[#004ac6] tabular-nums-fa"
                >
                  {formatToman(cartSummary.totalPayable)}{' '}
                  <span className="text-xs font-bold text-[#434655]">تومان</span>
                </span>
              </div>

              {cartSummary.totalSavings > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    مجموع سود شما از این خرید:
                  </span>
                  <span className="tabular-nums-fa">{formatToman(cartSummary.totalSavings)} تومان</span>
                </div>
              )}

              {mode === 'cart' ? (
                <button
                  type="button"
                  data-testid="proceed-to-checkout-btn"
                  onClick={() => navigate('/checkout')}
                  className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>ادامه و ثبت مشخصات ارسال</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  data-testid="submit-demo-order-btn"
                  className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>{submitting ? 'در حال ثبت سفارش...' : 'ثبت نهایی سفارش آزمایشی'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
