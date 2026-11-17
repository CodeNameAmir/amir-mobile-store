import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Headphones,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { storeApi } from '../lib/authApi';

export const Footer: React.FC = () => {
  const { navigate, navigateToCatalog, showToast, storeSettings } = useStore();
  const [newsletterInput, setNewsletterInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newsletterInput.trim();
    if (trimmed.length < 5) {
      showToast('لطفاً شماره موبایل یا ایمیل معتبر وارد کنید.', 'error');
      return;
    }
    try {
      await storeApi.subscribeNewsletter(trimmed);
      setSubscribed(true);
      setNewsletterInput('');
      showToast('عضویت شما در خبرنامه تخفیف‌های امیر با موفقیت ثبت شد.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در عضویت خبرنامه.', 'error');
    }
  };

  return (
    <footer className="mt-16 bg-white border-t border-[#e5eeff] no-print">
      {/* 4 Trust Pillars */}
      <div className="bg-[#eff4ff] border-b border-[#dce9ff]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#004ac6] flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">ضمانت اصالت ۱۰۰٪</p>
              <p className="text-xs text-[#434655] mt-0.5">کد رجیستری رسمی همتا و گارانتی معتبر</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#004ac6] flex items-center justify-center shadow-sm shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">تحویل فوری و اکسپرس</p>
              <p className="text-xs text-[#434655] mt-0.5">ارسال ۳ ساعته در تهران و ۱ روزه سراسر کشور</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#004ac6] flex items-center justify-center shadow-sm shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">۷ روز مهلت بازگشت</p>
              <p className="text-xs text-[#434655] mt-0.5">تضمین بازگشت وجه در صورت مغایرت فنی</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#004ac6] flex items-center justify-center shadow-sm shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">پشتیبانی تخصصی</p>
              <p className="text-xs text-[#434655] mt-0.5">مشاوره پیش از خرید و رهگیری لحظه‌ای</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Brand Description */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0b1c30]">فروشگاه موبایل امیر</h2>
              <p className="text-[11px] font-semibold text-[#434655]">AMIR MOBILE & ACCESSORIES</p>
            </div>
          </div>
          <p className="text-xs leading-6 text-[#434655]">
            مرجع تخصصی فروش گوشی‌های هوشمند پرچمدار، تبلت‌ها، ساعت‌های هوشمند و لوازم جانبی اورجینال برندهای اپل، سامسونگ، شیائومی و انکر با گارانتی ۱۸ ماهه امیر سرویس و شفافیت کامل رجیستری.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f8f9ff] text-xs font-semibold text-[#0b1c30] tabular-nums-fa">
            <PhoneCall className="w-4 h-4 text-[#004ac6]" />
            شماره تماس: {storeSettings.supportPhone} (شنبه تا پنجشنبه ۹ الی ۲۱)
          </div>
        </div>

        {/* Quick Access */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-[#0b1c30]">دسترسی سریع</h3>
          <ul className="space-y-2 text-xs text-[#434655]">
            <li>
              <button
                type="button"
                onClick={() => navigateToCatalog({ category: 'phones' })}
                className="hover:text-[#004ac6] transition-colors"
              >
                گوشی‌های پرچمدار
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateToCatalog({ category: 'chargers' })}
                className="hover:text-[#004ac6] transition-colors"
              >
                شارژر و پاوربانک GaN
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateToCatalog({ category: 'audio' })}
                className="hover:text-[#004ac6] transition-colors"
              >
                هدفون و ایرپاد
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateToCatalog({ category: 'offers', discountedOnly: true })}
                className="hover:text-[#b54e00] transition-colors"
              >
                تخفیف‌های شگفت‌انگیز
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/compare')}
                className="hover:text-[#004ac6] transition-colors"
              >
                مقایسه تخصصی موبایل‌ها
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/installments')}
                className="hover:text-[#004ac6] transition-colors"
              >
                محاسبه‌گر خرید اقساطی و تعویض
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/tracking')}
                className="hover:text-[#004ac6] transition-colors"
              >
                پیگیری سفارش‌ها
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-[#0b1c30]">خدمات مشتریان</h3>
          <ul className="space-y-2 text-xs text-[#434655]">
            <li>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="hover:text-[#004ac6] transition-colors"
              >
                درباره فروشگاه امیر
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/terms')}
                className="hover:text-[#004ac6] transition-colors"
              >
                شرایط گارانتی و حریم خصوصی
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="hover:text-[#004ac6] transition-colors"
              >
                تماس و ثبت تیکت پشتیبانی
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="hover:text-[#004ac6] transition-colors"
              >
                حساب کاربری و سفارش‌ها
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/status')}
                className="hover:text-[#004ac6] transition-colors"
              >
                وضعیت زیرساخت و شبکه
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter + Trust badges */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-[#0b1c30]">خبرنامه تخفیف‌ها</h3>
          <p className="text-xs text-[#434655] leading-6">
            از جدیدترین پیشنهادهای ویژه و کدهای تخفیف خرید اول (مانند{' '}
            <span className="font-bold text-[#004ac6]" dir="ltr">
              AMIR-OFF
            </span>
            ) مطلع شوید:
          </p>

          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <input
              type="text"
              value={newsletterInput}
              onChange={(e) => setNewsletterInput(e.target.value)}
              placeholder="شماره موبایل یا ایمیل..."
              className="flex-1 h-10 px-3 rounded-xl bg-[#eff4ff] text-xs text-[#0b1c30] placeholder:text-[#434655]/70 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold transition-colors shrink-0"
            >
              عضویت
            </button>
          </form>

          {subscribed && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              شما با موفقیت عضو خبرنامه شدید.
            </p>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <div className="px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[11px] font-bold text-[#0b1c30] inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#004ac6]" />
              نماد اعتماد الکترونیک
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[11px] font-bold text-[#0b1c30] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
              عضو اتحادیه موبایل
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#eff4ff] bg-[#f8f9ff]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#434655]">
          <p>
            © ۱۴۰۴ فروشگاه موبایل امیر (Amir Mobile) — تمامی حقوق محفوظ است. پرداخت در حالت دمو و نمونه‌کار است.
          </p>
          <p className="font-medium">
            طراحی مدرن راست‌چین · آماده میزبانی استاتیک روی GitHub Pages و CDN ابراروان + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};
