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
      <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
          <Calculator className="w-4 h-4" strokeWidth={1.5} />
          <span>طرح خرید اقساطی و تعویض گوشی کارکرده امیر</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#11161E]">
          محاسبه‌گر هوشمند خرید اقساطی و طرح تعویض
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5464] max-w-2xl leading-7">
          گوشی پرچمدار دلخواه خود را با پیش‌پرداخت ۲۰ تا ۵۰ درصد و اقساط ۶ تا ۱۸ ماهه انتخاب کنید یا گوشی فعلی خود را به‌عنوان پیش‌پرداخت تحویل دهید.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calculator Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="inst-product" className="text-xs font-semibold text-[#11161E] block">
              ۱. انتخاب محصول مورد نظر برای خرید اقساطی
            </label>
            <select
              id="inst-product"
              value={selectedProduct?.id || ''}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm font-medium text-[#11161E] focus:bg-white focus:outline-none focus:border-[#1453D6]"
            >
              {eligibleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameFa} — {formatToman(p.price)} تومان
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#11161E]">۲. درصد پیش‌پرداخت اولیه</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPercent(pct)}
                  className={`h-11 rounded-lg text-xs font-medium transition-colors tabular-nums-fa ${
                    downPercent === pct
                      ? 'bg-[#1453D6] text-white'
                      : 'bg-[#F7F8FA] text-[#11161E] border border-[#E4E8EE] hover:border-[#C5CEDB]'
                  }`}
                >
                  {toPersianDigits(pct)}٪ پیش‌پرداخت
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#11161E]">۳. مدت زمان بازپرداخت اقساط</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[6, 9, 12, 18].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`h-11 rounded-lg text-xs font-medium transition-colors tabular-nums-fa ${
                    months === m
                      ? 'bg-[#1453D6] text-white'
                      : 'bg-[#F7F8FA] text-[#11161E] border border-[#E4E8EE] hover:border-[#C5CEDB]'
                  }`}
                >
                  {toPersianDigits(m)} ماهه
                </button>
              ))}
            </div>
          </div>

          {/* Trade-In Estimator Box */}
          <div className="p-5 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-[#11161E] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
                طرح تعویض گوشی کارکرده (اختیاری)
              </p>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1453D6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTradeIn}
                  onChange={(e) => setApplyTradeIn(e.target.checked)}
                  className="w-4 h-4 accent-[#1453D6]"
                />
                <span>اعمال مبلغ تعویض در محاسبه</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#4A5464] block">مدل گوشی فعلی شما</label>
                <select
                  value={oldModel}
                  onChange={(e) => setOldModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#11161E]"
                >
                  <option value="iphone-14-pro">iPhone 14 Pro (۲۵۶ گیگ)</option>
                  <option value="iphone-13">iPhone 13 (۱۲۸ گیگ)</option>
                  <option value="s23-ultra">Galaxy S23 Ultra</option>
                  <option value="a54-5g">Galaxy A54 5G</option>
                  <option value="xiaomi-13t">Xiaomi 13T Pro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#4A5464] block">سلامت ظاهری و باتری</label>
                <select
                  value={conditionMultiplier}
                  onChange={(e) => setConditionMultiplier(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#11161E]"
                >
                  <option value={1}>در حد نو بدون خط‌وخش (باتری بالای ۹۰٪)</option>
                  <option value={0.88}>تمیز و سالم با کارکرد عادی</option>
                  <option value={0.74}>دارای خط‌وخش جزئی یا باتری تعویض</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#E4E8EE] flex items-center justify-between text-xs">
              <span className="font-medium text-[#4A5464]">ارزش برآوردی تعویض</span>
              <span className="font-semibold text-[#067647] tabular-nums-fa">
                {formatToman(tradeInValue)} تومان
              </span>
            </div>
          </div>
        </div>

        {/* Results Summary Card */}
        <aside className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5 sticky top-28">
          <div className="flex items-center justify-between border-b border-[#E4E8EE] pb-4">
            <h2 className="text-base font-semibold text-[#11161E]">خلاصه اقساط ماهانه شما</h2>
            <span className="px-2.5 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-[11px] font-medium tabular-nums-fa">
              کارمزد ماهانه {toPersianDigits(plan.monthlyRatePercent)}٪
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[#13171F] border border-[#232936] text-white space-y-1">
            <p className="text-xs text-[#94A3B8]">مبلغ هر قسط ({toPersianDigits(plan.months)} قسط)</p>
            <p
              data-testid="installment-monthly-payment"
              className="text-2xl sm:text-3xl font-semibold tabular-nums-fa"
            >
              {formatToman(plan.monthlyPayment)}{' '}
              <span className="text-xs font-normal text-[#A3B0C2]">تومان / ماه</span>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#4A5464]">
              <span>قیمت نقدی کالا</span>
              <span className="font-medium text-[#11161E] tabular-nums-fa">
                {formatToman(basePrice)} تومان
              </span>
            </div>
            {applyTradeIn && (
              <div className="flex justify-between text-[#067647] font-medium">
                <span>کسر بابت گوشی کارکرده</span>
                <span className="tabular-nums-fa">{formatToman(tradeInValue)}- تومان</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A5464]">
              <span>پیش‌پرداخت نقدی ({toPersianDigits(plan.downPaymentPercent)}٪)</span>
              <span className="font-semibold text-[#1453D6] tabular-nums-fa">
                {formatToman(plan.downPaymentAmount)} تومان
              </span>
            </div>
            <div className="flex justify-between text-[#4A5464]">
              <span>مبلغ تسهیلات باقی‌مانده</span>
              <span className="font-medium text-[#11161E] tabular-nums-fa">
                {formatToman(plan.financedAmount)} تومان
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E4E8EE] text-sm font-semibold text-[#11161E]">
              <span>جمع کل پرداختی با اقساط</span>
              <span className="tabular-nums-fa">{formatToman(plan.totalPayableWithPlan)} تومان</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-xs text-[#4A5464] space-y-1.5 leading-6">
            <p className="font-semibold text-[#11161E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
              مدارک مورد نیاز خرید اقساطی
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#067647] shrink-0" strokeWidth={1.5} />
              چک صیادی بنفش یا اعتبارسنجی بانکی آنلاین
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#067647] shrink-0" strokeWidth={1.5} />
              تحویل فوری دستگاه هم‌زمان با تایید اعتبار
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {selectedProduct && (
              <a
                href={buildHref(`/product/${selectedProduct.slug}`)}
                onClick={(e) => handleLinkClick(e, `/product/${selectedProduct.slug}`)}
                className="h-10 rounded-lg bg-[#F1F3F6] hover:bg-[#EAECEF] text-[#11161E] text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-4 h-4" strokeWidth={1.5} />
                <span>مشاهده محصول</span>
              </a>
            )}
            <a
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="h-10 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>درخواست مشاوره</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
