import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import { StatusDiagSkeleton } from '../components/Skeleton';
import { useStore } from '../context/StoreContext';
import { storeApi, type BackendHealthResponse } from '../lib/authApi';
import { toPersianDigits } from '../utils/storeLogic';

interface NotFoundPageProps {
  missingPath: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ missingPath }) => {
  const { buildHref, handleLinkClick, navigateToCatalog } = useStore();
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
          <a
            href={buildHref('/')}
            onClick={(e) => handleLinkClick(e, '/')}
            className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold inline-flex items-center"
          >
            بازگشت به صفحه اصلی
          </a>
          <a
            href={buildHref('/catalog?cat=phones')}
            onClick={(e) => handleLinkClick(e, '/catalog?cat=phones', () => navigateToCatalog({ category: 'phones' }))}
            className="px-4 py-2 rounded-xl bg-[#f8f9ff] text-[#0b1c30] text-xs font-bold inline-flex items-center"
          >
            گوشی‌های موبایل
          </a>
          <a
            href={buildHref('/catalog?cat=offers')}
            onClick={(e) =>
              handleLinkClick(e, '/catalog?cat=offers', () =>
                navigateToCatalog({ category: 'offers', discountedOnly: true })
              )
            }
            className="px-4 py-2 rounded-xl bg-[#ffdbca]/50 text-[#8e3c00] text-xs font-bold inline-flex items-center"
          >
            پیشنهادات طلایی
          </a>
        </div>
      </div>
    </div>
  );
};

export const ServerStatusPage: React.FC = () => {
  const { buildHref, handleLinkClick } = useStore();
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [checkedAt, setCheckedAt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setErrorMessage(null);
    const start = performance.now();
    try {
      const res = await storeApi.getHealth();
      setLatencyMs(Math.round(performance.now() - start));
      setHealth(res);
      setCheckedAt(new Date().toLocaleTimeString('fa-IR'));
    } catch (err) {
      setLatencyMs(Math.round(performance.now() - start));
      setHealth(null);
      setErrorMessage(
        err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرویس Backend API.'
      );
      setCheckedAt(new Date().toLocaleTimeString('fa-IR'));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const isHealthy = Boolean(health?.ok && health?.storage?.ok);

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
                وضعیت زیرساخت، Backend API و دیتابیس Supabase
              </h1>
              <p className="text-xs text-[#434655] mt-0.5 tabular-nums-fa">
                آخرین بررسی زنده: {checkedAt ? toPersianDigits(checkedAt) : 'در حال بررسی...'}
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
            <p className="text-xs font-extrabold text-[#0b1c30]">History API Clean Routing</p>
            <p className="text-[11px] text-[#434655] leading-5">
              مسیریابی History API فعال است؛ ارتباط با دیتابیس به‌طور انحصاری از طریق Backend انجام می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Cloud className="w-5 h-5 text-[#004ac6]" />
              {checking ? (
                <RefreshCw className="w-4 h-4 text-[#004ac6] animate-spin" />
              ) : health ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">Backend Express API</p>
            <p className="text-[11px] text-[#434655] leading-5">
              {checking
                ? 'در حال بررسی پاسخ سرویس /api/health...'
                : health
                ? `متصل و فعال (${toPersianDigits(latencyMs ?? 0)} میلی‌ثانیه)`
                : 'سرویس Backend در دسترس نیست.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-[#004ac6]" />
              {checking ? (
                <RefreshCw className="w-4 h-4 text-[#004ac6] animate-spin" />
              ) : isHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">Database & Auth Storage</p>
            <p className="text-[11px] text-[#434655] leading-5">
              {checking
                ? 'در حال استعلام وضعیت ذخیره‌سازی...'
                : health?.storage.mode === 'supabase'
                ? 'متصل به Supabase PostgreSQL'
                : health
                ? 'حالت توسعه حافظه‌ای (آفلاین)'
                : 'وضعیت دیتابیس در دسترس نیست.'}
            </p>
          </div>
        </div>

        {/* Live Backend Health Diagnostic Details */}
        {checking && !health ? (
          <StatusDiagSkeleton />
        ) : (
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isHealthy ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-extrabold text-[#0b1c30]">
                گزارش سلامت Backend API و اتصال Supabase
              </p>
              {health?.service && (
                <code dir="ltr" className="text-[11px] px-2 py-0.5 rounded bg-white text-[#004ac6]">
                  {health.service} ({health.environment})
                </code>
              )}
            </div>

            {health ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white flex items-center justify-between gap-2">
                  <span className="text-[#434655]">حالت ذخیره‌سازی:</span>
                  <strong className="text-[#0b1c30]" dir="ltr">
                    {health.storage.mode}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white flex items-center justify-between gap-2">
                  <span className="text-[#434655]">سرویس ایمیل Resend:</span>
                  <strong className="text-[#0b1c30]">
                    {health.resend.resendConfigured ? 'پیکربندی شده' : 'حالت پیش‌نمایش'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white flex items-center justify-between gap-2">
                  <span className="text-[#434655]">زمان پاسخ سرور:</span>
                  <strong dir="ltr" className="text-emerald-700 tabular-nums-fa">
                    {toPersianDigits(latencyMs ?? 0)} ms
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#434655] leading-6">{errorMessage}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <a
            href={buildHref('/')}
            onClick={(e) => handleLinkClick(e, '/')}
            className="h-11 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
