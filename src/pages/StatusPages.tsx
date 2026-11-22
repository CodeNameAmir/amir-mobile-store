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
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-8 sm:p-12 text-center space-y-6">
        <p className="text-6xl font-semibold text-[#1453D6] tabular-nums-fa">۴۰۴</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
          صفحه مورد نظر در فروشگاه موبایل امیر یافت نشد
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5464] leading-7">
          مسیر{' '}
          <code dir="ltr" className="px-2 py-0.5 rounded bg-[#EEF3FC] text-[#1453D6] font-mono">
            {missingPath}
          </code>{' '}
          وجود ندارد یا جابه‌جا شده است. می‌توانید محصول مورد نظر خود را مستقیماً جستجو کنید.
        </p>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی آیفون، گلکسی، شارژر"
              className="w-full h-11 pr-10 pl-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:outline-none focus:border-[#1453D6]"
            />
            <Search className="w-4 h-4 text-[#6E7889] absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          </div>
          <button
            type="submit"
            className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold shrink-0 transition-colors"
          >
            جستجو
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <a
            href={buildHref('/')}
            onClick={(e) => handleLinkClick(e, '/')}
            className="px-4 py-2 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
          >
            بازگشت به صفحه اصلی
          </a>
          <a
            href={buildHref('/catalog?cat=phones')}
            onClick={(e) => handleLinkClick(e, '/catalog?cat=phones', () => navigateToCatalog({ category: 'phones' }))}
            className="px-4 py-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-[#11161E] text-xs font-medium inline-flex items-center transition-colors"
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
            className="px-4 py-2 rounded-lg bg-[#FDF1E8] border border-[#F5D6BE] text-[#A84500] text-xs font-medium inline-flex items-center transition-colors"
          >
            پیشنهادات ویژه
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E8EE] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">
                وضعیت زیرساخت، Backend API و دیتابیس Supabase
              </h1>
              <p className="text-xs text-[#4A5464] mt-0.5 tabular-nums-fa">
                آخرین بررسی زنده: {checkedAt ? toPersianDigits(checkedAt) : 'در حال بررسی...'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runCheck}
            disabled={checking}
            className="h-10 px-4 rounded-lg bg-[#F1F3F6] hover:bg-[#E4E8EE] text-[#11161E] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            <span>تست مجدد اتصال</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
              <CheckCircle2 className="w-4 h-4 text-[#067647]" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold text-[#11161E]">History API Clean Routing</p>
            <p className="text-[11px] text-[#4A5464] leading-5">
              مسیریابی History API فعال است؛ ارتباط با دیتابیس به‌طور انحصاری از طریق Backend انجام می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2">
            <div className="flex items-center justify-between">
              <Cloud className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
              {checking ? (
                <RefreshCw className="w-4 h-4 text-[#1453D6] animate-spin" strokeWidth={1.5} />
              ) : health ? (
                <CheckCircle2 className="w-4 h-4 text-[#067647]" strokeWidth={1.5} />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#A84500]" strokeWidth={1.5} />
              )}
            </div>
            <p className="text-xs font-semibold text-[#11161E]">Backend Express API</p>
            <p className="text-[11px] text-[#4A5464] leading-5">
              {checking
                ? 'در حال بررسی پاسخ سرویس /api/health...'
                : health
                ? `متصل و فعال (${toPersianDigits(latencyMs ?? 0)} میلی‌ثانیه)`
                : 'سرویس Backend در دسترس نیست.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
              {checking ? (
                <RefreshCw className="w-4 h-4 text-[#1453D6] animate-spin" strokeWidth={1.5} />
              ) : isHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-[#067647]" strokeWidth={1.5} />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#A84500]" strokeWidth={1.5} />
              )}
            </div>
            <p className="text-xs font-semibold text-[#11161E]">Database & Auth Storage</p>
            <p className="text-[11px] text-[#4A5464] leading-5">
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
            className={`p-5 rounded-xl border space-y-3 ${
              isHealthy ? 'bg-[#ECFDF3] border-[#ABEFC6]' : 'bg-[#EEF3FC] border-[#D4E2FC]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-[#11161E]">
                گزارش سلامت Backend API و اتصال Supabase
              </p>
              {health?.service && (
                <code dir="ltr" className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E4E8EE] font-mono text-[#1453D6]">
                  {health.service} ({health.environment})
                </code>
              )}
            </div>

            {health ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-[#E4E8EE] flex items-center justify-between gap-2">
                  <span className="text-[#4A5464]">حالت ذخیره‌سازی:</span>
                  <strong className="text-[#11161E] font-mono" dir="ltr">
                    {health.storage.mode}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E4E8EE] flex items-center justify-between gap-2">
                  <span className="text-[#4A5464]">سرویس ایمیل Resend:</span>
                  <strong className="text-[#11161E]">
                    {health.resend.resendConfigured ? 'پیکربندی شده' : 'حالت پیش‌نمایش'}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E4E8EE] flex items-center justify-between gap-2">
                  <span className="text-[#4A5464]">زمان پاسخ سرور:</span>
                  <strong dir="ltr" className="text-[#067647] tabular-nums-fa font-mono">
                    {toPersianDigits(latencyMs ?? 0)} ms
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#4A5464] leading-6">{errorMessage}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <a
            href={buildHref('/')}
            onClick={(e) => handleLinkClick(e, '/')}
            className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
};
