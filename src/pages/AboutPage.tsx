import React from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { STORE_ASSETS } from '../data/assets';

export const AboutPage: React.FC = () => {
  const { navigate } = useStore();

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-12">
      {/* Story Hero */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center shadow-sm">
        <div className="lg:col-span-6 p-7 sm:p-12 space-y-5">
          <span className="inline-block px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
            داستان فروشگاه موبایل امیر
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0b1c30] leading-snug">
            تعریف دوباره خرید مطمئن موبایل و تکنولوژی در ایران
          </h1>
          <p className="text-sm text-[#434655] leading-7">
            فروشگاه موبایل امیر با تمرکز بر اصالت صددرصدی، شفافیت کامل رجیستری همتا، تست فنی ۱۸ مرحله‌ای و خدمات پس از فروش واقعی شکل گرفته تا تجربه خرید آنلاین پرچمداران اپل، سامسونگ و شیائومی بدون هیچ نگرانی باشد.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <span>مشاهده محصولات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="h-11 px-5 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs sm:text-sm font-bold"
            >
              ارتباط با کارشناسان
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 h-72 lg:h-[420px] bg-[#f8f9ff]">
          <SmartImage
            src={STORE_ASSETS.aboutLab}
            alt="آزمایشگاه کنترل کیفیت فروشگاه موبایل امیر"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 4 Key Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: '+۴۵٬۰۰۰', label: 'دستگاه تحویل‌شده با کد همتا' },
          { value: '۹۸.۴٪', label: 'رضایت مشتریان از بسته‌بندی و ارسال' },
          { value: '۱۸ مرحله', label: 'بازرسی کیفی پارت‌نامبر و اصالت' },
          { value: '۳ ساعته', label: 'میانگین تحویل اکسپرس در تهران' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-[#e5eeff] p-6 text-center space-y-1.5"
          >
            <p className="text-2xl sm:text-3xl font-black text-[#004ac6] tabular-nums-fa">
              {stat.value}
            </p>
            <p className="text-xs font-bold text-[#434655]">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 4 Organizational Pillars */}
      <section className="space-y-5">
        <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">ارکان کیفیت در موبایل امیر</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: 'ضمانت ۱۸ ماهه امیر سرویس',
              desc: 'پوشش کامل قطعات اصلی، ارائه گوشی جایگزین و شفافیت کامل در خدمات تعمیرات.',
            },
            {
              icon: <Cpu className="w-5 h-5" />,
              title: 'تست پارت‌نامبر و اصالت',
              desc: 'تطبیق شماره سریال، پلمپ کارخانه و سلامت لوازم جانبی پیش از ارسال.',
            },
            {
              icon: <Truck className="w-5 h-5" />,
              title: 'لجستیک امن ضدضربه',
              desc: 'بسته‌بندی سه لایه همراه با بیمه کامل مرسوله و پین تحویل امن خریدار.',
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: 'مشاوره بی‌طرفانه خرید',
              desc: 'مقایسه دقیق نیاز شما با پردازنده، دوربین و باتری گوشی‌ها پیش از ثبت سفارش.',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
                {pillar.icon}
              </div>
              <h3 className="text-sm font-extrabold text-[#0b1c30]">{pillar.title}</h3>
              <p className="text-xs text-[#434655] leading-6">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lab Showcase + Accreditations */}
      <section className="bg-[#eff4ff] rounded-3xl border border-[#dce9ff] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
            پروتکل بازرسی ۱۸ مرحله‌ای پیش از ارسال
          </h2>
          <p className="text-xs sm:text-sm text-[#434655] leading-7">
            هیچ دستگاهی بدون ثبت شناسه IMEI در فاکتور رسمی و بررسی اصالت لیبل پلمپ از انبار خارج نمی‌شود. کارشناسان ما پارت‌نامبرهای منطقه‌ای (ZAA، CH، گارانتی شرکتی سامسونگ و پک گلوبال شیائومی) را دقیقاً مطابق صفحه محصول تطبیق می‌دهند.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-[#0b1c30]">
            {[
              'تطبیق IMEI روی جعبه با سامانه همتا',
              'کنترل لیبل پلمپ کارخانه (Apple / Samsung)',
              'ثبت کد رهگیری گارانتی ۱۸ ماهه در فاکتور',
              'بسته‌بندی حباب‌دار و پلمپ امنیتی مرسوله',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-white p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#004ac6] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#004ac6] font-extrabold text-sm">
            <Award className="w-5 h-5" />
            <span>تاییدیه‌ها و استانداردهای فنی</span>
          </div>
          <p className="text-xs text-[#434655] leading-6">
            طراحی این پلتفرم به‌صورت استاتیک، سبک و سریع انجام شده تا ضمن میزبانی در GitHub Pages و توزیع از طریق شبکه CDN ابراروان، داده‌های محصولات و سفارش‌ها را از طریق PostgreSQL/Supabase مدیریت کند.
          </p>
          <button
            type="button"
            onClick={() => navigate('/status')}
            className="w-full h-10 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-extrabold transition-colors"
          >
            مشاهده وضعیت زیرساخت فنی
          </button>
        </div>
      </section>
    </div>
  );
};
