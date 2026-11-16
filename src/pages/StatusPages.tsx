import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Play,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DEMO_SAMPLE_ORDER } from '../data/catalog';
import {
  storeRepository,
  type SupabaseDiagnosticResult,
} from '../lib/supabase';
import { toPersianDigits } from '../utils/storeLogic';

interface NotFoundPageProps {
  missingPath: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ missingPath }) => {
  const { navigate, navigateToCatalog } = useStore();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToCatalog({ category: 'all', searchQuery: query });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#e5eeff] p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <p className="text-6xl font-black text-[#004ac6] tracking-tight tabular-nums-fa">۴۰۴</p>
        <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
          صفحه مورد نظر در فروشگاه موبایل امیر یافت نشد
        </h1>
        <p className="text-xs sm:text-sm text-[#434655] leading-7">
          مسیر <code dir="ltr" className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6]">{missingPath}</code> وجود ندارد یا جابه‌جا شده است. می‌توانید محصول مورد نظر خود را مستقیماً جستجو کنید.
        </p>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی آیفون، گلکسی، شارژر..."
              className="w-full h-11 pr-10 pl-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm focus:outline-none focus:border-[#004ac6]"
            />
            <Search className="w-4 h-4 text-[#434655] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-[#004ac6] text-white text-xs sm:text-sm font-bold shrink-0"
          >
            جستجو
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold"
          >
            بازگشت به صفحه اصلی
          </button>
          <button
            type="button"
            onClick={() => navigateToCatalog({ category: 'phones' })}
            className="px-4 py-2 rounded-xl bg-[#f8f9ff] text-[#0b1c30] text-xs font-bold"
          >
            گوشی‌های موبایل
          </button>
          <button
            type="button"
            onClick={() => navigateToCatalog({ category: 'offers', discountedOnly: true })}
            className="px-4 py-2 rounded-xl bg-[#ffdbca]/50 text-[#8e3c00] text-xs font-bold"
          >
            پیشنهادات طلایی
          </button>
        </div>
      </div>
    </div>
  );
};

export const ServerStatusPage: React.FC = () => {
  const { navigate, showToast } = useStore();
  const [diag, setDiag] = useState<SupabaseDiagnosticResult | null>(null);
  const [checking, setChecking] = useState(true);
  const [writeTestStatus, setWriteTestStatus] = useState<{
    running: boolean;
    result: string | null;
    ok: boolean | null;
  }>({ running: false, result: null, ok: null });

  const runCheck = useCallback(async () => {
    setChecking(true);
    const res = await storeRepository.checkSupabaseConnection();
    setDiag(res);
    setChecking(false);
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const runWriteTest = async () => {
    setWriteTestStatus({ running: true, result: null, ok: null });
    const testCode = `TEST-${Math.floor(10000 + Math.random() * 89999)}`;
    const saved = await storeRepository.createOrder({
      ...DEMO_SAMPLE_ORDER,
      orderCode: testCode,
      customerName: 'تست اتصال دیتابیس امیر',
      createdAt: 'تست خودکار وضعیت زیرساخت',
    });

    if (saved.syncedToSupabase) {
      setWriteTestStatus({
        running: false,
        ok: true,
        result: `سفارش آزمایشی ${testCode} با موفقیت در جدول orders دیتابیس Supabase ثبت و ذخیره شد.`,
      });
      showToast(`ثبت آزمایشی ${testCode} در Supabase موفق بود.`, 'success');
      runCheck();
    } else {
      setWriteTestStatus({
        running: false,
        ok: false,
        result: saved.syncError
          ? `خطا در ذخیره در Supabase: ${saved.syncError}`
          : 'کلیدهای Supabase در این بیلد تزریق نشده‌اند؛ سفارش به‌صورت محلی ذخیره شد.',
      });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eff4ff] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">
                وضعیت زیرساخت، CDN ابراروان و دیتابیس Supabase
              </h1>
              <p className="text-xs text-[#434655] mt-0.5 tabular-nums-fa">
                آخرین بررسی زنده: {diag ? toPersianDigits(diag.checkedAt) : 'در حال بررسی...'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runCheck}
            disabled={checking}
            className="h-10 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>تست مجدد اتصال</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-[#004ac6]" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">GitHub Pages Static Build</p>
            <p className="text-[11px] text-[#434655] leading-5">
              مسیریابی Hash-Based فعال است؛ تمام مسیرها بدون خطای ۴۰۴ سمت سرور بارگذاری می‌شوند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Cloud className="w-5 h-5 text-[#004ac6]" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">ArvanCloud CDN Ready</p>
            <p className="text-[11px] text-[#434655] leading-5">
              فایل‌های استاتیک باندل‌شده با مسیر نسبی و فونت‌های بهینه روی CDN ابراروان کش می‌شوند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-[#004ac6]" />
              {diag?.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">Supabase Free Tier</p>
            <p className="text-[11px] text-[#434655] leading-5">
              {checking
                ? 'در حال بررسی ارتباط زنده با سرور Supabase...'
                : diag?.connected
                ? `متصل و سالم (${toPersianDigits(diag.latencyMs ?? 0)} میلی‌ثانیه)`
                : diag?.configured
                ? 'کلیدها تنظیم شده‌اند اما کوئری با خطا مواجه شد.'
                : 'حالت دمو محلی فعال است (متغیرهای Supabase در این پیش‌نمایش تزریق نشده‌اند).'}
            </p>
          </div>
        </div>

        {/* Live Supabase Diagnostic Details */}
        {diag && (
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              diag.connected
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-extrabold text-[#0b1c30]">
                گزارش تست زنده ارتباط با پایگاه داده Supabase
              </p>
              {diag.host && (
                <code dir="ltr" className="text-[11px] px-2 py-0.5 rounded bg-white text-[#004ac6]">
                  {diag.host}
                </code>
              )}
            </div>

            {diag.connected ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white">
                  <span className="text-[#434655]">جدول products:</span>{' '}
                  <strong className="text-[#0b1c30] tabular-nums-fa">
                    {toPersianDigits(diag.productsCount ?? 0)} ردیف
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white">
                  <span className="text-[#434655]">جدول orders:</span>{' '}
                  <strong className="text-[#0b1c30] tabular-nums-fa">
                    {toPersianDigits(diag.ordersCount ?? 0)} ردیف
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white">
                  <span className="text-[#434655]">زمان پاسخ:</span>{' '}
                  <strong className="text-emerald-700 tabular-nums-fa">
                    {toPersianDigits(diag.latencyMs ?? 0)} ms
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#434655] leading-6">{diag.errorMessage}</p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runWriteTest}
                disabled={writeTestStatus.running}
                className="h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {writeTestStatus.running
                    ? 'در حال ارسال سفارش آزمایشی...'
                    : 'تست ثبت رکورد آزمایشی در جدول orders'}
                </span>
              </button>

              {writeTestStatus.result && (
                <span
                  className={`text-xs font-bold ${
                    writeTestStatus.ok ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {writeTestStatus.result}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-11 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
