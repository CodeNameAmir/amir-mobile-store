import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { InstallmentsPageSkeleton } from '../components/Skeleton';
import { useStore } from '../context/StoreContext';
import {
  calculateInstallmentPlan,
  formatToman,
  toPersianDigits,
} from '../utils/storeLogic';

const TRADE_IN_BASE_VALUES: Record<string, number> = {
  'iphone-14-pro': 54_000_000,
  'iphone-13': 34_000_000,
  's23-ultra': 41_000_000,
  'a54-5g': 13_500_000,
  'xiaomi-13t': 19_000_000,
};

export const InstallmentsPage: React.FC = () => {
  const { products, productsLoading, buildHref, handleLinkClick } = useStore();
  const eligibleProducts = useMemo(
    () => products.filter((p) => p.inStock && p.price >= 10_000_000),
    [products]
  );

  const [selectedProductId, setSelectedProductId] = useState(
    eligibleProducts[0]?.id || 'iphone-16-pro-max'
  );
  const [downPercent, setDownPercent] = useState(30);
  const [months, setMonths] = useState(12);

  // Trade-in estimator state
  const [oldModel, setOldModel] = useState('iphone-14-pro');
  const [conditionMultiplier, setConditionMultiplier] = useState(1);

  const selectedProduct =
    eligibleProducts.find((p) => p.id === selectedProductId) || eligibleProducts[0];
  const basePrice = selectedProduct?.price || 60_000_000;
  const tradeInValue = Math.round((TRADE_IN_BASE_VALUES[oldModel] || 20_000_000) * conditionMultiplier);
  const [applyTradeIn, setApplyTradeIn] = useState(false);

  const effectivePrice = Math.max(5_000_000, basePrice - (applyTradeIn ? tradeInValue : 0));
  const plan = useMemo(
    () => calculateInstallmentPlan(effectivePrice, downPercent, months),
    [effectivePrice, downPercent, months]
  );

  if (productsLoading) {
    return <InstallmentsPageSkeleton />;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
          <Calculator className="w-4 h-4" />
          <span>طرح خرید اقساطی و تعویض گوشی کارکرده امیر</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0b1c30]">
          محاسبه‌گر هوشمند خرید اقساطی و طرح تعویض
        </h1>
        <p className="text-xs sm:text-sm text-[#434655] max-w-2xl leading-7">
          گوشی پرچمدار دلخواه خود را با پیش‌پرداخت ۲۰ تا ۵۰ درصد و اقساط ۶ تا ۱۸ ماهه انتخاب کنید یا گوشی فعلی خود را به‌عنوان پیش‌پرداخت تحویل دهید.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calculator Controls */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="inst-product" className="text-xs font-bold text-[#0b1c30] block">
              ۱. انتخاب محصول مورد نظر برای خرید اقساطی
            </label>
            <select
              id="inst-product"
              value={selectedProduct?.id || ''}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm font-bold text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
            >
              {eligibleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameFa} — {formatToman(p.price)} تومان
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#0b1c30]">۲. درصد پیش‌پرداخت اولیه</p>
            <div className="grid grid-cols-4 gap-2.5">
              {[20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPercent(pct)}
                  className={`h-11 rounded-xl text-xs font-extrabold transition-colors tabular-nums-fa ${
                    downPercent === pct
                      ? 'bg-[#004ac6] text-white shadow-sm'
                      : 'bg-[#f8f9ff] text-[#0b1c30] border border-[#e5eeff] hover:border-[#2563eb]'
                  }`}
                >
                  {toPersianDigits(pct)}٪ پیش‌پرداخت
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#0b1c30]">۳. مدت زمان بازپرداخت اقساط</p>
            <div className="grid grid-cols-4 gap-2.5">
              {[6, 9, 12, 18].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`h-11 rounded-xl text-xs font-extrabold transition-colors tabular-nums-fa ${
                    months === m
                      ? 'bg-[#004ac6] text-white shadow-sm'
                      : 'bg-[#f8f9ff] text-[#0b1c30] border border-[#e5eeff] hover:border-[#2563eb]'
                  }`}
                >
                  {toPersianDigits(m)} ماهه
                </button>
              ))}
            </div>
          </div>

          {/* Trade-In Estimator Box */}
          <div className="p-5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-black text-[#0b1c30] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#004ac6]" />
                طرح تعویض گوشی کارکرده (اختیاری)
              </p>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#004ac6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTradeIn}
                  onChange={(e) => setApplyTradeIn(e.target.checked)}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span>اعمال مبلغ تعویض در محاسبه</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#434655] block">مدل گوشی فعلی شما</label>
                <select
                  value={oldModel}
                  onChange={(e) => setOldModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#0b1c30]"
                >
                  <option value="iphone-14-pro">iPhone 14 Pro (۲۵۶ گیگ)</option>
                  <option value="iphone-13">iPhone 13 (۱۲۸ گیگ)</option>
                  <option value="s23-ultra">Galaxy S23 Ultra</option>
                  <option value="a54-5g">Galaxy A54 5G</option>
                  <option value="xiaomi-13t">Xiaomi 13T Pro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#434655] block">سلامت ظاهری و باتری</label>
                <select
                  value={conditionMultiplier}
                  onChange={(e) => setConditionMultiplier(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#0b1c30]"
                >
                  <option value={1}>در حد نو بدون خط‌وخش (باتری بالای ۹۰٪)</option>
                  <option value={0.88}>تمیز و سالم با کارکرد عادی</option>
                  <option value={0.74}>دارای خط‌وخش جزئی یا باتری تعویض</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white flex items-center justify-between text-xs">
              <span className="font-bold text-[#434655]">ارزش برآوردی تعویض:</span>
              <span className="font-black text-emerald-700 tabular-nums-fa">
                {formatToman(tradeInValue)} تومان
              </span>
            </div>
          </div>
        </div>

        {/* Results Summary Card */}
        <aside className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-5 shadow-sm sticky top-28">
          <div className="flex items-center justify-between border-b border-[#eff4ff] pb-4">
            <h2 className="text-base font-black text-[#0b1c30]">خلاصه اقساط ماهانه شما</h2>
            <span className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-[11px] font-extrabold tabular-nums-fa">
              کارمزد ماهانه {toPersianDigits(plan.monthlyRatePercent)}٪
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-bl from-[#0b1c30] to-[#004ac6] text-white space-y-1">
            <p className="text-xs text-[#93c5fd]">مبلغ هر قسط ({toPersianDigits(plan.months)} قسط)</p>
            <p
              data-testid="installment-monthly-payment"
              className="text-2xl sm:text-3xl font-black tabular-nums-fa"
            >
              {formatToman(plan.monthlyPayment)}{' '}
              <span className="text-xs font-bold text-[#d6e3ff]">تومان / ماه</span>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#434655]">
              <span>قیمت نقدی کالا:</span>
              <span className="font-bold text-[#0b1c30] tabular-nums-fa">
                {formatToman(basePrice)} تومان
              </span>
            </div>
            {applyTradeIn && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>کسر بابت گوشی کارکرده:</span>
                <span className="tabular-nums-fa">{formatToman(tradeInValue)}- تومان</span>
              </div>
            )}
            <div className="flex justify-between text-[#434655]">
              <span>پیش‌پرداخت نقدی ({toPersianDigits(plan.downPaymentPercent)}٪):</span>
              <span className="font-extrabold text-[#004ac6] tabular-nums-fa">
                {formatToman(plan.downPaymentAmount)} تومان
              </span>
            </div>
            <div className="flex justify-between text-[#434655]">
              <span>مبلغ تسهیلات باقی‌مانده:</span>
              <span className="font-bold text-[#0b1c30] tabular-nums-fa">
                {formatToman(plan.financedAmount)} تومان
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#eff4ff] text-sm font-black text-[#0b1c30]">
              <span>جمع کل پرداختی با اقساط:</span>
              <span className="tabular-nums-fa">{formatToman(plan.totalPayableWithPlan)} تومان</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8f9ff] text-xs text-[#434655] space-y-1.5 leading-6">
            <p className="font-extrabold text-[#0b1c30] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
              مدارک مورد نیاز (نسخه دمو رزومه‌ای):
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              چک صیادی بنفش یا اعتبارسنجی بانکی آنلاین
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              تحویل فوری دستگاه هم‌زمان با تایید اعتبار
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {selectedProduct && (
              <a
                href={buildHref(`/product/${selectedProduct.slug}`)}
                onClick={(e) => handleLinkClick(e, `/product/${selectedProduct.slug}`)}
                className="h-11 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>مشاهده محصول</span>
              </a>
            )}
            <a
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="h-11 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <span>درخواست مشاوره</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
