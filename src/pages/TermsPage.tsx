import React, { useState } from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const SECTIONS = [
  {
    id: 'general',
    title: '۱. قوانین عمومی و نحوه استفاده از فروشگاه',
    body: 'تمامی فعالیت‌های فروشگاه موبایل امیر در چارچوب قوانین تجارت الکترونیک جمهوری اسلامی ایران انجام می‌شود. ثبت سفارش در سایت به معنای مطالعه و پذیرش شرایط مندرج در این صفحه است.',
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
    body: 'طراحی رابط کاربری، محتوای تخصصی و مستندات فنی مجله موبایل امیر متعلق به فروشگاه موبایل امیر بوده و هرگونه استفاده تجاری یا بازنشر بدون مجوز کتبی ممنوع است.',
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
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium">
          <BookOpen className="w-4 h-4" strokeWidth={1.5} />
          <span>مستندات حقوقی و ضمانت مشتریان</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#11161E]">
          قوانین و مقررات، شرایط گارانتی و حریم خصوصی
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5464]">
          آخرین به‌روزرسانی: آبان ۱۴۰۴ · منطبق با استاندارد خدمات مشتریان فروشگاه موبایل امیر
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table of contents */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-[#E4E8EE] p-5 space-y-2 sticky top-28">
          <p className="text-xs font-semibold text-[#4A5464] pb-2 border-b border-[#E4E8EE]">
            فهرست بخش‌ها
          </p>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => jumpTo(sec.id)}
              className={`w-full text-right px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                activeId === sec.id
                  ? 'bg-[#EEF3FC] text-[#1453D6] font-semibold'
                  : 'text-[#4A5464] hover:bg-[#F7F8FA] hover:text-[#11161E]'
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
              className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-3 scroll-mt-28"
            >
              <h2 className="text-base sm:text-lg font-semibold text-[#11161E] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
                <span>{sec.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5464] leading-8">{sec.body}</p>
            </article>
          ))}

          <div className="bg-[#F1F3F6] rounded-xl border border-[#E4E8EE] p-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-medium text-[#11161E]">
              پرسشی درباره شرایط گارانتی یا مرجوعی کالا دارید؟
            </p>
            <a
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center transition-colors"
            >
              گفتگو با پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
