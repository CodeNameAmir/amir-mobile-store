import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  Send,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { OrderConfirmationSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { DEMO_SAMPLE_ORDER } from '../data/catalog';
import type { OrderRecord } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

interface OrderConfirmationPageProps {
  orderCode: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderCode }) => {
  const { findOrder, navigate, showToast } = useStore();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    findOrder(orderCode).then((res) => {
      if (!active) return;
      setOrder(res || DEMO_SAMPLE_ORDER);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [orderCode, findOrder]);

  const copyText = (value: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    showToast(`${label} در حافظه کپی شد.`, 'info');
  };

  if (loading || !order) {
    return <OrderConfirmationSkeleton />;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Celebration Banner */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 text-center space-y-5 shadow-[0_14px_40px_rgba(11,28,48,0.05)]">
        <div className="w-16 h-16 rounded-full bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
          ثبت سفارش آزمایشی با موفقیت تایید شد
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-[#0b1c30]">
          سفارش شما با موفقیت ثبت شد و در حال آماده‌سازی است!
        </h1>
        <p className="text-xs sm:text-sm text-[#434655] max-w-2xl mx-auto leading-7">
          از اعتماد شما به فروشگاه موبایل امیر سپاسگزاریم. بسته شما در اولویت پردازش انبار مرکزی قرار گرفت و شناسه IMEI در مرحله بسته‌بندی ثبت می‌گردد.
        </p>

        {/* Order Code + Reference Chips */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#434655]">شماره سفارش:</span>
            <div className="flex items-center gap-2">
              <span
                data-testid="confirmed-order-code"
                dir="ltr"
                className="text-sm sm:text-base font-black text-[#004ac6]"
              >
                {order.orderCode}
              </span>
              <button
                type="button"
                onClick={() => copyText(order.orderCode, 'شماره سفارش')}
                aria-label="کپی شماره سفارش"
                className="p-1.5 rounded-lg bg-white text-[#434655] hover:text-[#004ac6] border border-[#e5eeff]"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#434655]">کد پیگیری شاپرک (دمو):</span>
            <div className="flex items-center gap-2">
              <span dir="ltr" className="text-sm sm:text-base font-black text-[#0b1c30] tabular-nums-fa">
                {toPersianDigits(order.shaparakRef)}
              </span>
              <button
                type="button"
                onClick={() => copyText(order.shaparakRef, 'کد پیگیری')}
                aria-label="کپی کد پیگیری"
                className="p-1.5 rounded-lg bg-white text-[#434655] hover:text-[#004ac6] border border-[#e5eeff]"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Fulfillment Status */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-black text-[#0b1c30]">وضعیت پردازش زنجیره تامین</h2>
          <span className="text-xs font-bold text-[#004ac6]">مرحله فعال: تخصیص انبار و IMEI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700">تکمیل شده</span>
            </div>
            <p className="text-sm font-extrabold text-[#0b1c30]">۱. ثبت و تایید سفارش</p>
            <p className="text-xs text-[#434655] tabular-nums-fa">{toPersianDigits(order.createdAt)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#eff4ff] border-2 border-[#004ac6] space-y-2">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-5 h-5 text-[#004ac6]" />
              <span className="text-[11px] font-extrabold text-[#004ac6]">در حال پردازش</span>
            </div>
            <p className="text-sm font-extrabold text-[#0b1c30]">۲. بررسی انبار و IMEI</p>
            <p className="text-xs text-[#434655]">ثبت سریال دستگاه و فعال‌سازی گارانتی امیر سرویس</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2 opacity-85">
            <div className="flex items-center justify-between">
              <PackageCheck className="w-5 h-5 text-[#434655]" />
              <span className="text-[11px] font-bold text-[#434655]">مرحله بعدی</span>
            </div>
            <p className="text-sm font-extrabold text-[#0b1c30]">۳. بسته‌بندی ضدضربه</p>
            <p className="text-xs text-[#434655]">پلمپ امنیتی و تحویل به ناوگان ارسال اکسپرس</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2 opacity-75">
            <div className="flex items-center justify-between">
              <Truck className="w-5 h-5 text-[#434655]" />
              <span className="text-[11px] font-bold text-[#434655]">پایانی</span>
            </div>
            <p className="text-sm font-extrabold text-[#0b1c30]">۴. تحویل به خریدار</p>
            <p className="text-xs text-[#434655] tabular-nums-fa">
              تحویل درب منزل با ارائه پین امنیتی ({toPersianDigits(order.deliveryPin)})
            </p>
          </div>
        </div>
      </section>

      {/* Details 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items Summary */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
            <h2 className="text-base font-black text-[#0b1c30]">
              اقلام سفارش ({toPersianDigits(order.items.length)} کالا)
            </h2>
            <span className="text-xs font-bold text-[#434655]">فاکتور رسمی الکترونیک</span>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl bg-[#f8f9ff] flex items-center gap-3.5"
              >
                <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0">
                  <SmartImage src={item.image} alt={item.nameFa} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs sm:text-sm font-extrabold text-[#0b1c30] line-clamp-1">
                    {item.nameFa}
                  </p>
                  <p className="text-[11px] text-[#434655]">
                    {item.colorName} · {item.storageLabel} · {toPersianDigits(item.qty)} عدد
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black text-[#0b1c30] tabular-nums-fa shrink-0">
                  {formatToman(item.unitPrice * item.qty)} تومان
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#eff4ff] pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-[#434655]">
              <span>جمع قیمت کالاها:</span>
              <span className="font-bold text-[#0b1c30] tabular-nums-fa">
                {formatToman(order.subtotal)} تومان
              </span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>تخفیف کد ({order.couponCode}):</span>
                <span className="tabular-nums-fa">{formatToman(order.couponDiscount)}- تومان</span>
              </div>
            )}
            <div className="flex justify-between text-[#434655]">
              <span>هزینه بسته‌بندی و ارسال:</span>
              <span className="font-bold text-[#004ac6]">
                {order.shippingCost === 0 ? 'رایگان' : `${formatToman(order.shippingCost)} تومان`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#eff4ff] text-sm sm:text-base font-black text-[#0b1c30]">
              <span>مبلغ نهایی سفارش:</span>
              <span className="text-[#004ac6] tabular-nums-fa">
                {formatToman(order.totalAmount)} تومان
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Info + Actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-black text-[#0b1c30] border-b border-[#eff4ff] pb-3">
              مشخصات تحویل‌گیرنده
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#434655]">نام و نام خانوادگی</p>
                  <p className="font-extrabold text-[#0b1c30] mt-0.5">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#434655]">شماره تماس هماهنگی</p>
                  <p dir="ltr" className="font-extrabold text-[#0b1c30] mt-0.5 tabular-nums-fa">
                    {toPersianDigits(order.customerPhone)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#434655]">نشانی تحویل</p>
                  <p className="font-bold text-[#0b1c30] mt-0.5 leading-6">
                    {order.city ? `${order.city}، ` : ''}
                    {order.shippingAddress} (کد پستی: {toPersianDigits(order.postalCode)})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-3 no-print">
            <h2 className="text-sm font-black text-[#0b1c30]">اقدامات بعدی</h2>
            <button
              type="button"
              data-testid="open-live-tracking-btn"
              onClick={() => navigate(`/tracking/${order.orderCode}`)}
              className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>پیگیری لحظه‌ای وضعیت مرسوله</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full h-11 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ رسید سفارش و فاکتور رسمی</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="w-full h-10 text-xs font-bold text-[#434655] hover:text-[#004ac6] inline-flex items-center justify-center gap-1.5"
            >
              <span>بازگشت به فروشگاه و ادامه خرید</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
