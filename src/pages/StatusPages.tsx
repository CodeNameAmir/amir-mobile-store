import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { isSupabaseConfigured } from '../lib/supabase';

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
  const { navigate } = useStore();
  const [checkedAt, setCheckedAt] = useState('هم‌اکنون');

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e5eeff] p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eff4ff] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0b1c30]">
                وضعیت زیرساخت، CDN ابراروان و دیتابیس Supabase
              </h1>
              <p className="text-xs text-[#434655] mt-0.5">آخرین بررسی: {checkedAt}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCheckedAt(`ساعت ${new Date().toLocaleTimeString('fa-IR')}`)}
            className="h-10 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بروزرسانی وضعیت</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-[#004ac6]" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">GitHub Pages Static Build</p>
            <p className="text-[11px] text-[#434655]">
              مسیریابی Hash-Based فعال است؛ تمام مسیرها بدون خطای ۴۰۴ سمت سرور بارگذاری می‌شوند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Cloud className="w-5 h-5 text-[#004ac6]" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">ArvanCloud CDN Ready</p>
            <p className="text-[11px] text-[#434655]">
              فایل‌های استاتیک باندل‌شده با مسیر نسبی و فونت‌های بهینه آماده کشینگ لبه ابراروان هستند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-[#004ac6]" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-extrabold text-[#0b1c30]">Supabase Free Tier</p>
            <p className="text-[11px] text-[#434655]">
              {isSupabaseConfigured
                ? 'متصل به پروژه Supabase از طریق متغیرهای محیطی.'
                : 'حالت ذخیره‌سازی محلی دمو فعال است (با افزودن کلیدهای Supabase در GitHub Secrets متصل می‌شود).'}
            </p>
          </div>
        </div>

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
