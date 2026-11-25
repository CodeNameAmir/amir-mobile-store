import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lock,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Phone,
  Printer,
  Send,
  ShieldCheck,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { OrderConfirmationSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import type { OrderLookupResult, OrderRecord } from '../types/store';
import { formatToman, getOrderFlowStage, toPersianDigits } from '../utils/storeLogic';

interface OrderConfirmationPageProps {
  orderCode: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderCode }) => {
  const {
    lookupOrder,
    verifyGuestOrder,
    cancelCustomerOrder,
    buildHref,
    handleLinkClick,
    showToast,
  } = useStore();
  const [lookup, setLookup] = useState<OrderLookupResult | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyPhone, setVerifyPhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setVerifyError(null);
    lookupOrder(orderCode)
      .then((res) => {
        if (!active) return;
        setLookup(res);
        setOrder(res.order);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLookup(null);
        setOrder(null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderCode, lookupOrder]);

  const handleVerifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifying(true);
    try {
      const verifiedOrder = await verifyGuestOrder(orderCode, verifyPhone);
      setOrder(verifiedOrder);
      setLookup({
        found: true,
        authorized: true,
        requiresVerification: false,
        isGuestOrder: true,
        order: verifiedOrder,
      });
      showToast('هویت سفارش تایید شد.', 'success');
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'خطا در تایید شماره موبایل سفارش.');
    } finally {
      setVerifying(false);
    }
  };

  const copyText = (value: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    showToast(`${label} در حافظه کپی شد.`, 'info');
  };

  if (loading) {
    return <OrderConfirmationSkeleton />;
  }

  if (!order && lookup?.requiresVerification) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-7 sm:p-9 space-y-5 text-center">
          <div className="w-14 h-14 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">
              تایید دسترسی به فاکتور سفارش <span dir="ltr">{orderCode}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
              {lookup.isGuestOrder
                ? 'برای حفاظت از اطلاعات شخصی، جهت مشاهده جزئیات و فاکتور این سفارش مهمان، شماره موبایل ثبت‌شده را وارد کنید.'
                : 'این سفارش متعلق به یک حساب کاربری ثبت‌شده است. برای مشاهده فاکتور، ابتدا وارد حساب کاربری خود شوید.'}
            </p>
          </div>

          {lookup.isGuestOrder ? (
            <form onSubmit={handleVerifyGuest} className="space-y-3 text-right">
              <label htmlFor="confirm-verify-phone" className="text-xs font-medium text-[#11161E] block">
                شماره موبایل ثبت‌شده در سفارش
              </label>
              <input
                id="confirm-verify-phone"
                type="tel"
                dir="ltr"
                value={verifyPhone}
                onChange={(e) => setVerifyPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
              />
              {verifyError && <p className="text-xs font-medium text-[#B42318]">{verifyError}</p>}
              <button
                type="submit"
                disabled={verifying}
                className="w-full h-11 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                {verifying ? 'در حال بررسی...' : 'تایید و نمایش فاکتور'}
              </button>
            </form>
          ) : (
            <a
              href={buildHref('/account')}
              onClick={(e) => handleLinkClick(e, '/account')}
              className="w-full h-11 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center transition-colors"
            >
              ورود به حساب کاربری
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold text-[#11161E]">
            سفارشی با شماره <span dir="ltr">{orderCode}</span> یافت نشد
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5464] leading-6">
            ممکن است شماره سفارش اشتباه وارد شده باشد یا سفارش در پایگاه داده ثبت نشده باشد.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={buildHref('/tracking')}
              onClick={(e) => handleLinkClick(e, '/tracking')}
              className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center transition-colors"
            >
              پیگیری سفارش دیگر
            </a>
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="h-10 px-5 rounded-lg bg-[#F1F3F6] hover:bg-[#E4E8EE] text-[#11161E] text-xs font-medium inline-flex items-center transition-colors"
            >
              بازگشت به فروشگاه
            </a>
          </div>
        </div>
      </div>
    );
  }

  const flow = getOrderFlowStage(order.status);

  const stages = [
    {
      title: '۱. ثبت و تایید پرداخت',
      desc: toPersianDigits(order.createdAt),
      icon: CheckCircle2,
    },
    {
      title: '۲. بررسی انبار و IMEI',
      desc: 'ثبت سریال دستگاه و فعال‌سازی گارانتی امیر سرویس',
      icon: ShieldCheck,
    },
    {
      title: '۳. بسته‌بندی و ارسال',
      desc: 'پلمپ امنیتی و تحویل به ناوگان ارسال اکسپرس',
      icon: PackageCheck,
    },
    {
      title: '۴. تحویل به خریدار',
      desc: `تحویل درب منزل با ارائه پین امنیتی (${toPersianDigits(order.deliveryPin)})`,
      icon: Truck,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Dynamic Status Header Banner */}
      <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 text-center space-y-5">
        <div
          className={`w-14 h-14 rounded-xl border flex items-center justify-center mx-auto ${
            flow.isCancelled
              ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
              : flow.isDelivered
              ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]'
              : 'bg-[#EEF3FC] border-[#D4E2FC] text-[#1453D6]'
          }`}
        >
          {flow.isCancelled ? (
            <XCircle className="w-7 h-7" strokeWidth={1.5} />
          ) : flow.isDelivered ? (
            <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
          ) : (
            <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
          )}
        </div>
        <span
          data-testid="invoice-status-badge"
          className={`inline-block px-3 py-1 rounded-lg border text-xs font-medium ${
            flow.isCancelled
              ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
              : flow.isDelivered
              ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]'
              : 'bg-[#EEF3FC] border-[#D4E2FC] text-[#1453D6]'
          }`}
        >
          وضعیت فعلی فاکتور: {flow.badgeLabel}
        </span>
        <h1 className="text-xl sm:text-3xl font-semibold text-[#11161E]">{flow.headlineText}</h1>
        <p className="text-xs sm:text-sm text-[#4A5464] max-w-2xl mx-auto leading-7">
          {flow.summaryText}
        </p>

        {/* Order Code + Reference Chips */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#4A5464]">شماره سفارش:</span>
            <div className="flex items-center gap-2">
              <span
                data-testid="confirmed-order-code"
                dir="ltr"
                className="text-sm sm:text-base font-semibold font-mono text-[#1453D6]"
              >
                {order.orderCode}
              </span>
              <button
                type="button"
                onClick={() => copyText(order.orderCode, 'شماره سفارش')}
                aria-label="کپی شماره سفارش"
                className="p-1.5 rounded-lg bg-white text-[#4A5464] hover:text-[#1453D6] border border-[#E4E8EE] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#4A5464]">کد رهگیری پرداخت:</span>
            <div className="flex items-center gap-2">
              <span dir="ltr" className="text-sm sm:text-base font-semibold text-[#11161E] tabular-nums-fa">
                {toPersianDigits(order.shaparakRef)}
              </span>
              <button
                type="button"
                onClick={() => copyText(order.shaparakRef, 'کد پیگیری')}
                aria-label="کپی کد پیگیری"
                className="p-1.5 rounded-lg bg-white text-[#4A5464] hover:text-[#1453D6] border border-[#E4E8EE] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic 4-Stage Fulfillment Status */}
      <section
        data-testid="invoice-fulfillment-section"
        className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#11161E]">وضعیت پردازش زنجیره تامین</h2>
          <span
            data-testid="invoice-active-stage-label"
            className={`text-xs font-medium ${
              flow.isCancelled
                ? 'text-[#B42318]'
                : flow.isDelivered
                ? 'text-[#067647]'
                : 'text-[#1453D6]'
            }`}
          >
            وضعیت فعلی: {flow.badgeLabel}
          </span>
        </div>

        {order.adminNote && (
          <div className="p-3.5 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-xs font-medium text-[#11161E] flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-[#1453D6] shrink-0" strokeWidth={1.5} />
            <span>یادداشت واحد ارسال: {order.adminNote}</span>
          </div>
        )}

        {flow.isCancelled ? (
          <div className="p-5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] flex items-start gap-3 text-[#B42318]">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-semibold">این سفارش لغو شده است</p>
              <p className="text-xs leading-6">
                پردازش ارسال متوقف گردیده است. در صورت نیاز به راهنمایی بیشتر می‌توانید شماره سفارش خود را با پشتیبانی مطرح کنید.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stage, idx) => {
              const IconComp = stage.icon;
              const isCompleted =
                idx < flow.activeStageIndex || (flow.isDelivered && idx === flow.activeStageIndex);
              const isActive = !flow.isDelivered && idx === flow.activeStageIndex;
              const statusText = isCompleted
                ? 'تکمیل شده'
                : isActive
                ? 'مرحله فعلی'
                : 'در انتظار';

              return (
                <div
                  key={stage.title}
                  data-testid={`invoice-stage-${idx}`}
                  data-stage-state={isCompleted ? 'completed' : isActive ? 'active' : 'pending'}
                  className={`p-4 rounded-xl space-y-2 transition-colors ${
                    isActive
                      ? 'bg-[#EEF3FC] border-2 border-[#1453D6]'
                      : isCompleted
                      ? 'bg-[#ECFDF3] border border-[#ABEFC6]'
                      : 'bg-[#F7F8FA] border border-[#E4E8EE] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconComp
                      className={`w-5 h-5 ${
                        isCompleted
                          ? 'text-[#067647]'
                          : isActive
                          ? 'text-[#1453D6]'
                          : 'text-[#576071]'
                      }`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        isCompleted
                          ? 'text-[#067647]'
                          : isActive
                          ? 'text-[#1453D6] font-semibold'
                          : 'text-[#576071]'
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#11161E]">{stage.title}</p>
                  <p className="text-xs text-[#4A5464] tabular-nums-fa">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Details 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items Summary */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E8EE] pb-3">
            <h2 className="text-base font-semibold text-[#11161E]">
              اقلام سفارش ({toPersianDigits(order.items.length)} کالا)
            </h2>
            <span className="text-xs font-medium text-[#4A5464]">فاکتور رسمی الکترونیک</span>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center gap-3.5"
              >
                <div className="w-16 h-16 rounded-lg bg-[#F3F5F8] border border-[#E4E8EE] overflow-hidden shrink-0">
                  <SmartImage src={item.image} alt={item.nameFa} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <a
                    href={buildHref(`/product/${item.slug}`)}
                    onClick={(e) => handleLinkClick(e, `/product/${item.slug}`)}
                    className="text-xs sm:text-sm font-semibold text-[#11161E] hover:text-[#1453D6] line-clamp-1 transition-colors"
                  >
                    {item.nameFa}
                  </a>
                  <p className="text-[11px] text-[#4A5464]">
                    {item.colorName} · {item.storageLabel} · {toPersianDigits(item.qty)} عدد
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#11161E] tabular-nums-fa shrink-0">
                  {formatToman(item.unitPrice * item.qty)} تومان
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E4E8EE] pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-[#4A5464]">
              <span>
                {(order.productDiscount ?? 0) > 0
                  ? 'قیمت اولیه کالاها:'
                  : 'جمع قیمت کالاها:'}
              </span>
              <span className="font-medium text-[#11161E] tabular-nums-fa">
                {formatToman(order.subtotal + (order.productDiscount || 0))} تومان
              </span>
            </div>
            {(order.productDiscount ?? 0) > 0 && (
              <div className="flex justify-between text-[#067647] font-medium">
                <span>تخفیف شگفت‌انگیز کالاها:</span>
                <span data-testid="invoice-product-discount" className="tabular-nums-fa">
                  {formatToman(order.productDiscount || 0)}- تومان
                </span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-[#067647] font-medium">
                <span>تخفیف کد ({order.couponCode || 'تخفیف'}):</span>
                <span data-testid="invoice-coupon-discount" className="tabular-nums-fa">
                  {formatToman(order.couponDiscount)}- تومان
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#4A5464]">
              <span>هزینه بسته‌بندی و ارسال:</span>
              <span className="font-medium text-[#1453D6]">
                {order.shippingCost === 0 ? 'رایگان' : `${formatToman(order.shippingCost)} تومان`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#E4E8EE] text-sm sm:text-base font-semibold text-[#11161E]">
              <span>مبلغ نهایی سفارش:</span>
              <span className="text-[#1453D6] tabular-nums-fa">
                {formatToman(order.totalAmount)} تومان
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Info + Actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#11161E] border-b border-[#E4E8EE] pb-3">
              مشخصات تحویل‌گیرنده
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#1453D6] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">نام و نام خانوادگی</p>
                  <p className="font-semibold text-[#11161E] mt-0.5">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#1453D6] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">شماره تماس هماهنگی</p>
                  <p dir="ltr" className="font-semibold text-[#11161E] mt-0.5 tabular-nums-fa">
                    {toPersianDigits(order.customerPhone)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1453D6] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">نشانی تحویل</p>
                  <p className="font-medium text-[#11161E] mt-0.5 leading-6">
                    {order.city ? `${order.city}، ` : ''}
                    {order.shippingAddress} (کد پستی: {toPersianDigits(order.postalCode)})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-3 no-print">
            <h2 className="text-sm font-semibold text-[#11161E]">اقدامات بعدی</h2>
            <a
              href={buildHref(`/tracking/${order.orderCode}`)}
              onClick={(e) => handleLinkClick(e, `/tracking/${order.orderCode}`)}
              data-testid="open-live-tracking-btn"
              className="w-full h-11 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              <span>پیگیری لحظه‌ای وضعیت مرسوله</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full h-10 rounded-lg bg-[#F1F3F6] hover:bg-[#E4E8EE] text-[#11161E] text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" strokeWidth={1.5} />
              <span>چاپ رسید سفارش و فاکتور رسمی</span>
            </button>

            {(order.status === 'pending_payment' ||
              order.status === 'paid' ||
              order.status === 'preparing') &&
              (!cancelConfirmOpen ? (
                <button
                  type="button"
                  onClick={() => setCancelConfirmOpen(true)}
                  data-testid="cancel-order-btn"
                  className="w-full h-10 rounded-lg bg-[#FEF3F2] hover:bg-[#FEE4E2] border border-[#FECDCA] text-[#B42318] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>لغو سفارش</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] space-y-2.5">
                  <p className="text-xs font-medium text-[#B42318]">
                    آیا از لغو این سفارش مطمئن هستید؟ موجودی کالاها به انبار بازگردانده می‌شود.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={cancelling}
                      data-testid="confirm-cancel-order-btn"
                      onClick={async () => {
                        setCancelling(true);
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
                          setCancelling(false);
                        }
                      }}
                      className="flex-1 h-9 rounded-lg bg-[#B42318] hover:bg-[#912018] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
                    >
                      {cancelling ? 'در حال لغو...' : 'تایید لغو سفارش'}
                    </button>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => setCancelConfirmOpen(false)}
                      className="px-4 h-9 rounded-lg bg-white border border-[#E4E8EE] text-[#4A5464] text-xs font-medium"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ))}

            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="w-full h-10 text-xs font-medium text-[#4A5464] hover:text-[#1453D6] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>بازگشت به فروشگاه و ادامه خرید</span>
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
