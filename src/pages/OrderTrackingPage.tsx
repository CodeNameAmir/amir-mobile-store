import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  MapPin,
  MessageSquareText,
  Navigation,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DEMO_SAMPLE_ORDER } from '../data/catalog';
import type { OrderRecord } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

interface OrderTrackingPageProps {
  initialCode?: string;
}

const STATUS_INDEX: Record<OrderRecord['status'], number> = {
  paid: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
};

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialCode }) => {
  const { orders, findOrder, navigate } = useStore();
  const defaultCode = initialCode || orders[0]?.orderCode || DEMO_SAMPLE_ORDER.orderCode;
  const [searchCode, setSearchCode] = useState(defaultCode);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const target = initialCode || orders[0]?.orderCode || DEMO_SAMPLE_ORDER.orderCode;
    setSearchCode(target);
    findOrder(target).then((res) => {
      if (!active) return;
      if (res) {
        setOrder(res);
        setNotFoundCode(null);
      } else {
        setOrder(null);
        setNotFoundCode(target);
      }
    });
    return () => {
      active = false;
    };
  }, [initialCode, orders, findOrder]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchCode.trim().toUpperCase();
    if (!cleaned) return;
    const res = await findOrder(cleaned);
    if (res) {
      setOrder(res);
      setNotFoundCode(null);
    } else {
      setOrder(null);
      setNotFoundCode(cleaned);
    }
  };

  const currentStage = order ? STATUS_INDEX[order.status] ?? 1 : 1;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Lookup Bar */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              پیگیری لحظه‌ای وضعیت سفارش
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              شماره سفارش خود (مثال:{' '}
              <button
                type="button"
                onClick={() => setSearchCode(DEMO_SAMPLE_ORDER.orderCode)}
                className="font-extrabold text-[#004ac6] underline"
                dir="ltr"
              >
                {DEMO_SAMPLE_ORDER.orderCode}
              </button>
              ) را برای مشاهده موقعیت مرسوله و آخرین وضعیت ثبت‌شده در پایگاه داده وارد کنید.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                dir="ltr"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="AMIR-10492"
                aria-label="شماره سفارش"
                className="w-full h-11 pr-3 pl-9 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-sm font-bold text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
              <Search className="w-4 h-4 text-[#434655] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold shrink-0 transition-colors"
            >
              جستجو
            </button>
          </form>
        </div>
      </section>

      {notFoundCode ? (
        <div className="bg-white rounded-3xl border border-[#e5eeff] p-10 text-center space-y-3">
          <p className="text-base font-extrabold text-[#0b1c30]">
            سفارشی با شماره <span dir="ltr">{notFoundCode}</span> پیدا نشد
          </p>
          <p className="text-xs text-[#434655]">
            لطفاً شماره سفارش را بررسی کنید یا از کد نمونه <span dir="ltr" className="font-bold">AMIR-10492</span> استفاده نمایید.
          </p>
        </div>
      ) : order ? (
        <>
          {/* Status Summary + Progress */}
          <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eff4ff] pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#004ac6]">شماره مرسوله: {order.orderCode}</span>
                <h2 className="text-lg font-black text-[#0b1c30]">
                  تحویل‌گیرنده: {order.customerName} — مبلغ کل: {formatToman(order.totalAmount)} تومان
                </h2>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold inline-flex items-center gap-2 tabular-nums-fa">
                <KeyRound className="w-4 h-4" />
                <span>پین تحویل امن به پیک: {toPersianDigits(order.deliveryPin)}</span>
              </div>
            </div>

            {order.adminNote && (
              <div className="p-3.5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-bold text-[#0b1c30] flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-[#004ac6] shrink-0" />
                <span>یادداشت واحد ارسال: {order.adminNote}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { title: 'ثبت و تایید سفارش', sub: toPersianDigits(order.createdAt) },
                { title: 'ثبت IMEI و کنترل کیفیت', sub: 'پردازش انبار مرکزی' },
                { title: 'تحویل به سفیر اکسپرس', sub: 'در مسیر ارسال به مقصد' },
                { title: 'تحویل نهایی به خریدار', sub: `نشانی: ${order.city || 'تهران'}` },
              ].map((st, idx) => {
                const done = idx < currentStage;
                const active = idx === currentStage;
                return (
                  <div
                    key={st.title}
                    className={`p-4 rounded-2xl border ${
                      active
                        ? 'bg-[#eff4ff] border-[#004ac6]'
                        : done
                        ? 'bg-[#f8f9ff] border-[#dce9ff]'
                        : 'bg-[#f8f9ff] border-[#eff4ff] opacity-70'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-[#0b1c30] flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          active || done ? 'text-[#004ac6]' : 'text-[#434655]/40'
                        }`}
                      />
                      <span>
                        {toPersianDigits(idx + 1)}. {st.title}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#434655] mt-1">{st.sub}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Route Illustration + IMEI Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Simulated Tehran Route Map + Courier */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#0b1c30] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#004ac6]" />
                  مسیر ناوگان اکسپرس امیر
                </h3>
                <span className="text-xs font-bold text-[#434655]">پیک اختصاصی: پیمان صالحی</span>
              </div>

              <div className="relative h-56 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden p-5 flex flex-col justify-between">
                {/* Clean RTL schematic vector grid (Origin right -> Courier mid -> Destination left) */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-40"
                  viewBox="0 0 600 220"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M0 55 H600 M0 110 H600 M0 165 H600" stroke="#93c5fd" strokeWidth="1" />
                  <path d="M120 0 V220 M280 0 V220 M440 0 V220" stroke="#93c5fd" strokeWidth="1" />
                  <path
                    d="M510 65 C420 65, 390 105, 300 95 C210 85, 175 155, 90 155"
                    stroke="#004ac6"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  <circle cx="510" cy="65" r="8" fill="#213145" />
                  <circle cx="300" cy="95" r="10" fill="#004ac6" />
                  <circle cx="90" cy="155" r="8" fill="#b54e00" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-white text-[#0b1c30] text-xs font-extrabold shadow-sm">
                    مبدا: انبار مرکزی پایتخت
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-[#004ac6] text-white text-xs font-extrabold shadow-sm inline-flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    {order.status === 'delivered'
                      ? 'تحویل داده شده'
                      : order.status === 'shipped'
                      ? 'در مسیر ارسال'
                      : 'آماده بارگیری'}
                  </span>
                </div>

                <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-[#dce9ff] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-[#b54e00] shrink-0" />
                    <p className="text-xs font-bold text-[#0b1c30] truncate">
                      مقصد: {order.city ? `${order.city}، ` : ''}
                      {order.shippingAddress}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/order-confirmed/${order.orderCode}`)}
                    className="text-xs font-extrabold text-[#004ac6] hover:underline shrink-0"
                  >
                    مشاهده فاکتور
                  </button>
                </div>
              </div>
            </div>

            {/* IMEI & Timeline */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#004ac6]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>گواهی رجیستری و اصالت سامانه همتا</span>
                </div>
                <p className="text-xs text-[#0b1c30] leading-6">
                  شناسه دستگاه (IMEI):{' '}
                  <span dir="ltr" className="font-black text-[#004ac6] tabular-nums-fa">
                    {toPersianDigits(order.imeiSample)}
                  </span>
                </p>
                <p className="text-[11px] text-[#434655]">
                  کد فعال‌سازی رجیستری به محض تحویل بسته به شماره {toPersianDigits(order.customerPhone)} پیامک می‌شود.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-[#0b1c30] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#004ac6]" />
                  رویدادهای مرسوله
                </h3>
                <ul className="space-y-2.5 text-xs">
                  <li className="p-3 rounded-xl bg-[#f8f9ff] flex items-center justify-between">
                    <span className="font-bold text-[#0b1c30]">تخصیص بسته به مرکز کنترل کیفیت امیر</span>
                    <span className="text-[#434655]">تایید شده</span>
                  </li>
                  <li className="p-3 rounded-xl bg-[#f8f9ff] flex items-center justify-between">
                    <span className="font-bold text-[#0b1c30]">ثبت سفارش آزمایشی و صدور پیش‌فاکتور</span>
                    <span className="text-[#434655] tabular-nums-fa">{toPersianDigits(order.createdAt)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
