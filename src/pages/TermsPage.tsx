import React, { useState } from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const SECTIONS = [
  {
    id: 'general',
    title: '۱. قوانین عمومی و نحوه استفاده از فروشگاه',
    body: 'تمامی فعالیت‌های فروشگاه موبایل امیر در چارچوب قوانین تجارت الکترونیک جمهوری اسلامی ایران انجام می‌شود. ثبت سفارش در سایت به معنای مطالعه و پذیرش شرایط مندرج در این صفحه است. در نسخه فعلی نمونه‌کار، فرآیند پرداخت صرفاً به‌صورت آزمایشی شبیه‌سازی شده و هیچ وجه بانکی کسر نمی‌گردد.',
  },
  {
    id: 'warranty',
    title: '۲. ضمانت اصالت و رجیستری امیر سرویس',
    body: 'تمامی گوشی‌های هوشمند عرضه‌شده در فروشگاه موبایل امیر دارای پلمپ اصلی کارخانه، گارانتی ۱۸ ماهه امیر سرویس (یا شرکت‌های معتبر واردکننده) و کد رجیستری رسمی سامانه همتا هستند. شناسه IMEI دستگاه پیش از ارسال روی فاکتور ثبت شده و مالکیت سیم‌کارت به نام خریدار منتقل می‌گردد.',
  },
  {
    id: 'return',
    title: '۳. شرایط ۷ روز مهلت بازگشت و تعویض کالا',
    body: 'مشتریان گرامی تا ۷ روز تقویمی پس از تحویل کالا، در صورت وجود هرگونه مغایرت فنی، ایراد سخت‌افزاری کارخانه‌ای یا عدم تطابق پارت‌نامبر با مشخصات سفارش، حق بازگشت و تعویض بی‌قیدوشرط دارند. حفظ بسته‌بندی اصلی و عدم آسیب فیزیکی برای استفاده از این ضمانت الزامی است.',
  },
  {
    id: 'privacy',
    title: '۴. حریم خصوصی و امنیت داده‌های کاربران',
    body: 'اطلاعات تماس، نشانی پستی و سوابق سفارش خریداران صرفاً برای پردازش سفارش و ارسال مرسوله نگهداری شده و تحت هیچ شرایطی در اختیار اشخاص ثالث قرار نمی‌گیرد. زیرساخت داده‌ای این فروشگاه با استانداردهای امنیتی Supabase و توزیع محتوای ابراروان سازگار است.',
  },
  {
    id: 'ip',
    title: '۵. حقوق مالکیت فکری و فنی',
    body: 'طراحی رابط کاربری، کدهای منبع و محتوای تخصصی مجله موبایل امیر متعلق به این مجموعه بوده و به‌عنوان نمونه‌کار مهندسی فرانت‌اند و فول‌استک منتشر شده است.',
  },
];

export const TermsPage: React.FC = () => {
  const { buildHref, handleLinkClick } = useStore();
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const jumpTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(`terms-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
          <BookOpen className="w-4 h-4" />
          <span>مستندات حقوقی و ضمانت مشتریان</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0b1c30]">
          قوانین و مقررات، شرایط گارانتی و حریم خصوصی
        </h1>
        <p className="text-xs sm:text-sm text-[#434655]">
          آخرین به‌روزرسانی: آبان ۱۴۰۴ · منطبق با استاندارد خدمات مشتریان فروشگاه موبایل امیر
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table of contents */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-[#e5eeff] p-5 space-y-2 sticky top-28">
          <p className="text-xs font-extrabold text-[#434655] pb-2 border-b border-[#eff4ff]">
            فهرست بخش‌ها
          </p>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => jumpTo(sec.id)}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeId === sec.id
                  ? 'bg-[#eff4ff] text-[#004ac6]'
                  : 'text-[#434655] hover:bg-[#f8f9ff]'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </aside>

        {/* Sections content */}
        <div className="lg:col-span-8 space-y-4">
          {SECTIONS.map((sec) => (
            <article
              key={sec.id}
              id={`terms-${sec.id}`}
              className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-3 scroll-mt-28"
            >
              <h2 className="text-base sm:text-lg font-black text-[#0b1c30] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#004ac6] shrink-0" />
                <span>{sec.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#434655] leading-8">{sec.body}</p>
            </article>
          ))}

          <div className="bg-[#eff4ff] rounded-2xl border border-[#dce9ff] p-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-bold text-[#0b1c30]">
              پرسشی درباره شرایط گارانتی یا مرجوعی کالا دارید؟
            </p>
            <a
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="h-10 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-bold inline-flex items-center"
            >
              گفتگو با پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
