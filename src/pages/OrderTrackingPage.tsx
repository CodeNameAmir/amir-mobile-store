import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  MapPin,
  MessageSquareText,
  Navigation,
  Package,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { TrackingPageSkeleton } from '../components/Skeleton';
import { useStore } from '../context/StoreContext';
import type { OrderLookupResult, OrderRecord, OrderStatus } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

interface OrderTrackingPageProps {
  initialCode?: string;
}

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending_payment: 0,
  paid: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'در انتظار پرداخت',
  paid: 'پرداخت موفق',
  preparing: 'در حال آماده‌سازی در انبار',
  shipped: 'تحویل به پیک / پست',
  delivered: 'تحویل‌شده به خریدار',
  cancelled: 'لغو شده',
};

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialCode }) => {
  const {
    orders,
    lookupOrder,
    verifyGuestOrder,
    cancelCustomerOrder,
    buildHref,
    handleLinkClick,
    showToast,
  } = useStore();
  const defaultCode = initialCode || orders[0]?.orderCode || '';
  const [searchCode, setSearchCode] = useState(defaultCode);
  const [lookup, setLookup] = useState<OrderLookupResult | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(defaultCode));
  const [verifyPhone, setVerifyPhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    let active = true;
    const target = (initialCode || orders[0]?.orderCode || '').trim().toUpperCase();
    setSearchCode(target);
    setVerifyError(null);
    if (!target) {
      setOrder(null);
      setLookup(null);
      setNotFoundCode(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    lookupOrder(target)
      .then((res) => {
        if (!active) return;
        setLookup(res);
        if (!res.found) {
          setOrder(null);
          setNotFoundCode(target);
        } else {
          setOrder(res.order);
          setNotFoundCode(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLookup(null);
        setOrder(null);
        setNotFoundCode(target);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialCode, orders, lookupOrder]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchCode.trim().toUpperCase().replace(/^#/, '');
    if (!cleaned) return;
    setLoading(true);
    setVerifyError(null);
    try {
      const res = await lookupOrder(cleaned);
      setLookup(res);
      if (!res.found) {
        setOrder(null);
        setNotFoundCode(cleaned);
      } else {
        setOrder(res.order);
        setNotFoundCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = (lookup?.summary?.orderCode || searchCode).trim().toUpperCase();
    if (!code) return;
    setVerifyError(null);
    setVerifying(true);
    try {
      const verified = await verifyGuestOrder(code, verifyPhone);
      setOrder(verified);
      setLookup({
        found: true,
        authorized: true,
        requiresVerification: false,
        isGuestOrder: true,
        order: verified,
      });
      showToast('اطلاعات سفارش تایید و نمایش داده شد.', 'success');
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'شماره موبایل تایید نشد.');
    } finally {
      setVerifying(false);
    }
  };

  const currentStage = order ? STATUS_INDEX[order.status] ?? 1 : 1;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Lookup Bar */}
      <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
              پیگیری لحظه‌ای وضعیت سفارش
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
              شماره سفارش خود را برای مشاهده موقعیت مرسوله و آخرین وضعیت ثبت‌شده در پایگاه داده وارد کنید.
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
                className="w-full h-11 pr-3 pl-9 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-sm font-medium font-mono text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
              />
              <Search className="w-4 h-4 text-[#576071] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shrink-0 transition-colors"
            >
              {loading ? 'در حال جستجو...' : 'جستجو'}
            </button>
          </form>
        </div>
      </section>

      {loading ? (
        <TrackingPageSkeleton />
      ) : notFoundCode ? (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-3">
          <p className="text-base font-semibold text-[#11161E]">
            سفارشی با شماره <span dir="ltr">{notFoundCode}</span> پیدا نشد
          </p>
          <p className="text-xs text-[#4A5464]">
            لطفاً شماره سفارش را دقیقاً مطابق رسید ثبت سفارش وارد کنید.
          </p>
        </div>
      ) : !order && lookup?.requiresVerification && lookup.summary ? (
        <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3 border-b border-[#E4E8EE] pb-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#11161E]">
                سفارش <span dir="ltr">{lookup.summary.orderCode}</span> —{' '}
                {STATUS_LABELS[lookup.summary.status]}
              </h2>
              <p className="text-xs text-[#4A5464] mt-0.5 tabular-nums-fa">
                تاریخ ثبت: {toPersianDigits(lookup.summary.createdAt)} · ارسال{' '}
                {lookup.summary.deliverySlot === 'express' ? 'اکسپرس' : 'پیشتاز'}
              </p>
            </div>
          </div>

          {lookup.isGuestOrder ? (
            <form onSubmit={handleVerifyGuest} className="space-y-4">
              <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
                برای مشاهده آدرس، کد تحویل و جزئیات کامل این سفارش مهمان، شماره موبایل ثبت‌شده هنگام خرید را وارد کنید:
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="tel"
                  dir="ltr"
                  value={verifyPhone}
                  onChange={(e) => setVerifyPhone(e.target.value)}
                  placeholder="09123456789"
                  aria-label="شماره موبایل تایید سفارش"
                  className="flex-1 h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  data-testid="verify-guest-order-btn"
                  className="h-11 px-6 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shrink-0 transition-colors"
                >
                  {verifying ? 'در حال بررسی...' : 'تایید و مشاهده جزئیات'}
                </button>
              </div>
              {verifyError && <p className="text-xs font-medium text-[#B42318]">{verifyError}</p>}
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
                این سفارش متعلق به یک حساب کاربری ثبت‌شده است. برای حفظ حریم خصوصی و مشاهده جزئیات کامل، لطفاً وارد حساب کاربری خود شوید.
              </p>
              <a
                href={buildHref('/account')}
                onClick={(e) => handleLinkClick(e, '/account')}
                className="h-11 px-6 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center transition-colors"
              >
                ورود به حساب کاربری
              </a>
            </div>
          )}
        </section>
      ) : !order ? (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-3">
          <p className="text-base font-semibold text-[#11161E]">
            شماره سفارش خود را در کادر بالا وارد کنید
          </p>
          <p className="text-xs text-[#4A5464]">
            پس از ثبت خرید، کد پیگیری با پیشوند <span dir="ltr" className="font-mono font-semibold text-[#11161E]">AMIR-</span> صادر می‌شود و وضعیت لحظه‌ای مرسوله از این بخش قابل مشاهده است.
          </p>
        </div>
      ) : order ? (
        <>
          {/* Status Summary + Progress */}
          <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E8EE] pb-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-[#1453D6] font-mono">
                  شماره مرسوله: <span dir="ltr">{order.orderCode}</span>
                </span>
                <h2 className="text-lg font-semibold text-[#11161E] tabular-nums-fa">
                  تحویل‌گیرنده: {order.customerName} — مبلغ کل: {formatToman(order.totalAmount)} تومان
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {order.status === 'cancelled' ? (
                  <div className="px-4 py-2 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-semibold inline-flex items-center gap-2">
                    <XCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span>سفارش لغو شده است</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-semibold inline-flex items-center gap-2 tabular-nums-fa">
                    <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                    <span>پین تحویل امن به پیک: {toPersianDigits(order.deliveryPin)}</span>
                  </div>
                )}

                {(order.status === 'pending_payment' ||
                  order.status === 'paid' ||
                  order.status === 'preparing') &&
                  (!cancelConfirmOpen ? (
                    <button
                      type="button"
                      onClick={() => setCancelConfirmOpen(true)}
                      data-testid="tracking-cancel-order-btn"
                      className="px-3.5 py-2 rounded-lg bg-[#FEF3F2] hover:bg-[#FEE4E2] border border-[#FECDCA] text-[#B42318] text-xs font-semibold transition-colors"
                    >
                      لغو سفارش
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA]">
                      <span className="text-[11px] font-medium text-[#B42318]">لغو شود؟</span>
                      <button
                        type="button"
                        disabled={cancellingOrder}
                        onClick={async () => {
                          setCancellingOrder(true);
                          try {
                            const updated = await cancelCustomerOrder(order.orderCode);
                            setOrder(updated);
                            setCancelConfirmOpen(false);
                          } catch (err) {
                            showToast(
                              err instanceof Error ? err.message : 'لغو سفارش امکان‌پذیر نیست.',
                              'error'
                            );
                          } finally {
                            setCancellingOrder(false);
                          }
                        }}
                        data-testid="tracking-confirm-cancel-btn"
                        className="px-2.5 py-1 rounded bg-[#B42318] text-white text-[11px] font-semibold disabled:opacity-60"
                      >
                        {cancellingOrder ? '...' : 'تایید لغو'}
                      </button>
                      <button
                        type="button"
                        disabled={cancellingOrder}
                        onClick={() => setCancelConfirmOpen(false)}
                        className="px-2 py-1 rounded bg-white border border-[#E4E8EE] text-[#4A5464] text-[11px]"
                      >
                        انصراف
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {order.adminNote && (
              <div className="p-3.5 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-xs font-medium text-[#11161E] flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-[#1453D6] shrink-0" strokeWidth={1.5} />
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
                    className={`p-4 rounded-xl border ${
                      active
                        ? 'bg-[#EEF3FC] border-[#1453D6]'
                        : done
                        ? 'bg-[#F7F8FA] border-[#D4E2FC]'
                        : 'bg-[#F7F8FA] border-[#E4E8EE] opacity-70'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#11161E] flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          active || done ? 'text-[#1453D6]' : 'text-[#576071]'
                        }`}
                        strokeWidth={1.5}
                      />
                      <span>
                        {toPersianDigits(idx + 1)}. {st.title}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#4A5464] mt-1">{st.sub}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Route Illustration + IMEI Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Schematic Tehran Route Map + Courier */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#1453D6]" strokeWidth={1.5} />
                  <span>مسیر ناوگان اکسپرس امیر</span>
                </h3>
                <span className="text-xs font-medium text-[#4A5464]">پیک اختصاصی: پیمان صالحی</span>
              </div>

              <div className="relative h-56 rounded-xl bg-[#F3F5F8] border border-[#E4E8EE] overflow-hidden p-5 flex flex-col justify-between">
                {/* Clean RTL schematic vector grid (Origin right -> Courier mid -> Destination left) */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-55"
                  viewBox="0 0 600 220"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M0 55 H600 M0 110 H600 M0 165 H600" stroke="#DCE1E8" strokeWidth="1" />
                  <path d="M120 0 V220 M280 0 V220 M440 0 V220" stroke="#DCE1E8" strokeWidth="1" />
                  <path
                    d="M510 65 C420 65, 390 105, 300 95 C210 85, 175 155, 90 155"
                    stroke="#1453D6"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  <circle cx="510" cy="65" r="7" fill="#13171F" />
                  <circle cx="300" cy="95" r="9" fill="#1453D6" />
                  <circle cx="90" cy="155" r="7" fill="#A84500" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-white border border-[#E4E8EE] text-[#11161E] text-xs font-medium">
                    مبدا: انبار مرکزی پایتخت
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#1453D6] text-white text-xs font-semibold inline-flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>
                      {order.status === 'delivered'
                        ? 'تحویل داده شده'
                        : order.status === 'shipped'
                        ? 'در مسیر ارسال'
                        : 'آماده بارگیری'}
                    </span>
                  </span>
                </div>

                <div className="relative z-10 bg-white rounded-lg p-3 border border-[#E4E8EE] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-[#A84500] shrink-0" strokeWidth={1.5} />
                    <p className="text-xs font-medium text-[#11161E] truncate">
                      مقصد: {order.city ? `${order.city}، ` : ''}
                      {order.shippingAddress}
                    </p>
                  </div>
                  <a
                    href={buildHref(`/order-confirmed/${order.orderCode}`)}
                    onClick={(e) => handleLinkClick(e, `/order-confirmed/${order.orderCode}`)}
                    className="text-xs font-semibold text-[#1453D6] hover:underline shrink-0"
                  >
                    مشاهده فاکتور
                  </a>
                </div>
              </div>
            </div>

            {/* IMEI & Timeline */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
              <div className="p-4 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1453D6]">
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  <span>گواهی رجیستری و اصالت سامانه همتا</span>
                </div>
                <p className="text-xs text-[#11161E] leading-6">
                  شناسه دستگاه (IMEI):{' '}
                  <span dir="ltr" className="font-semibold font-mono text-[#1453D6] tabular-nums-fa">
                    {toPersianDigits(order.imeiSample)}
                  </span>
                </p>
                <p className="text-[11px] text-[#4A5464]">
                  کد فعال‌سازی رجیستری به محض تحویل بسته به شماره {toPersianDigits(order.customerPhone)} پیامک می‌شود.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#11161E] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#1453D6]" strokeWidth={1.5} />
                  <span>رویدادهای مرسوله</span>
                </h3>
                <ul className="space-y-2.5 text-xs">
                  <li className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] flex items-center justify-between">
                    <span className="font-medium text-[#11161E]">تخصیص بسته به مرکز کنترل کیفیت امیر</span>
                    <span className="text-[#4A5464]">تایید شده</span>
                  </li>
                  <li className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] flex items-center justify-between">
                    <span className="font-medium text-[#11161E]">ثبت سفارش و صدور پیش‌فاکتور</span>
                    <span className="text-[#4A5464] tabular-nums-fa">{toPersianDigits(order.createdAt)}</span>
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
