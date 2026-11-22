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
  const { buildHref, handleLinkClick, showToast, storeSettings } = useStore();
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
    <footer className="mt-16 bg-white border-t border-[#E4E8EE] no-print">
      {/* 4 Trust Pillars */}
      <div className="bg-[#F1F3F6] border-b border-[#E4E8EE]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E8EE] text-[#4A5464] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#11161E]">ضمانت اصالت ۱۰۰٪</p>
              <p className="text-xs text-[#4A5464] mt-0.5">کد رجیستری رسمی همتا و گارانتی معتبر</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E8EE] text-[#4A5464] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#11161E]">تحویل فوری و اکسپرس</p>
              <p className="text-xs text-[#4A5464] mt-0.5">ارسال ۳ ساعته در تهران و ۱ روزه سراسر کشور</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E8EE] text-[#4A5464] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#11161E]">۷ روز مهلت بازگشت</p>
              <p className="text-xs text-[#4A5464] mt-0.5">تضمین بازگشت وجه در صورت مغایرت فنی</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E8EE] text-[#4A5464] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#11161E]">پشتیبانی تخصصی</p>
              <p className="text-xs text-[#4A5464] mt-0.5">مشاوره پیش از خرید و رهگیری لحظه‌ای</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Brand Description */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#13171F] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#11161E]">فروشگاه موبایل امیر</h2>
              <p className="text-xs font-normal text-[#6E7889]">فروشگاه تخصصی پرچمداران و تجهیزات شارژ</p>
            </div>
          </div>
          <p className="text-xs leading-6 text-[#4A5464]">
            مرجع تخصصی فروش گوشی‌های هوشمند پرچمدار، تبلت‌ها، ساعت‌های هوشمند و لوازم جانبی اورجینال برندهای اپل، سامسونگ، شیائومی، هواوی و انکر با گارانتی ۱۸ ماهه امیر سرویس و شفافیت کامل رجیستری.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F1F3F6] text-xs font-medium text-[#11161E] tabular-nums-fa">
            <PhoneCall className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
            شماره تماس: {storeSettings.supportPhone} (شنبه تا پنجشنبه ۹ الی ۲۱)
          </div>
        </div>

        {/* Quick Access */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-[#11161E]">دسترسی سریع</h3>
          <ul className="space-y-2 text-xs text-[#4A5464]">
            <li>
              <a
                href={buildHref('/catalog?cat=phones')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=phones')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                گوشی‌های پرچمدار
              </a>
            </li>
            <li>
              <a
                href={buildHref('/catalog?cat=chargers')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=chargers')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                شارژر و پاوربانک GaN
              </a>
            </li>
            <li>
              <a
                href={buildHref('/catalog?cat=audio')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=audio')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                هدفون و ایرپاد
              </a>
            </li>
            <li>
              <a
                href={buildHref('/catalog?cat=offers')}
                onClick={(e) => handleLinkClick(e, '/catalog?cat=offers')}
                className="hover:text-[#A84500] transition-colors inline-block"
              >
                تخفیف‌های شگفت‌انگیز
              </a>
            </li>
            <li>
              <a
                href={buildHref('/compare')}
                onClick={(e) => handleLinkClick(e, '/compare')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                مقایسه تخصصی موبایل‌ها
              </a>
            </li>
            <li>
              <a
                href={buildHref('/installments')}
                onClick={(e) => handleLinkClick(e, '/installments')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                محاسبه‌گر خرید اقساطی و تعویض
              </a>
            </li>
            <li>
              <a
                href={buildHref('/tracking')}
                onClick={(e) => handleLinkClick(e, '/tracking')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                پیگیری سفارش‌ها
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-[#11161E]">خدمات مشتریان</h3>
          <ul className="space-y-2 text-xs text-[#4A5464]">
            <li>
              <a
                href={buildHref('/about')}
                onClick={(e) => handleLinkClick(e, '/about')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                درباره فروشگاه امیر
              </a>
            </li>
            <li>
              <a
                href={buildHref('/terms')}
                onClick={(e) => handleLinkClick(e, '/terms')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                شرایط گارانتی و حریم خصوصی
              </a>
            </li>
            <li>
              <a
                href={buildHref('/contact')}
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                تماس و ثبت تیکت پشتیبانی
              </a>
            </li>
            <li>
              <a
                href={buildHref('/account')}
                onClick={(e) => handleLinkClick(e, '/account')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                حساب کاربری و سفارش‌ها
              </a>
            </li>
            <li>
              <a
                href={buildHref('/status')}
                onClick={(e) => handleLinkClick(e, '/status')}
                className="hover:text-[#1453D6] transition-colors inline-block"
              >
                وضعیت زیرساخت و شبکه
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter + Trust badges */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-semibold text-[#11161E]">خبرنامه تخفیف‌ها</h3>
          <p className="text-xs text-[#4A5464] leading-6">
            از جدیدترین پیشنهادهای ویژه و کدهای تخفیف خرید اول (مانند{' '}
            <span className="font-mono font-medium text-[#1453D6]" dir="ltr">
              AMIR-OFF
            </span>
            ) مطلع شوید
          </p>

          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <input
              type="text"
              value={newsletterInput}
              onChange={(e) => setNewsletterInput(e.target.value)}
              placeholder="شماره موبایل یا ایمیل"
              className="flex-1 h-10 px-3 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-xs text-[#11161E] placeholder:text-[#6E7889] focus:bg-white focus:border-[#1453D6] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold transition-colors shrink-0"
            >
              عضویت
            </button>
          </form>

          {subscribed && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#067647]">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
              شما با موفقیت عضو خبرنامه شدید.
            </p>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <div className="px-3 py-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-[11px] font-medium text-[#11161E] inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
              نماد اعتماد الکترونیک
            </div>
            <div className="px-3 py-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-[11px] font-medium text-[#11161E] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
              عضو اتحادیه موبایل
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#E4E8EE] bg-[#F7F8FA]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6E7889]">
          <p>
            © ۱۴۰۴ فروشگاه موبایل امیر — تمامی حقوق محفوظ است. پرداخت در حالت دمو و نمونه‌کار است.
          </p>
          <p className="font-normal">
            تضمین اصالت کالا و شفافیت قیمت‌گذاری
          </p>
        </div>
      </div>
    </footer>
  );
};
