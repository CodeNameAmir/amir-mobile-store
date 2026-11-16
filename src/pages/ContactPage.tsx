import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  PhoneCall,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { storeRepository } from '../lib/supabase';
import type { ContactFormData, SupportTicket } from '../types/store';
import { validateContactForm } from '../utils/storeLogic';

export const ContactPage: React.FC = () => {
  const { navigate, showToast } = useStore();
  const [form, setForm] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    department: 'فروش و مشاوره تخصصی',
    orderCode: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSending(true);
    try {
      const ticket: SupportTicket = {
        ticketCode: `TKT-${Math.floor(1000 + Math.random() * 8999)}`,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        department: form.department,
        orderCode: form.orderCode.trim(),
        message: form.message.trim(),
        createdAt: 'هم‌اکنون',
      };
      const saved = await storeRepository.submitSupportTicket(ticket);
      setSubmittedTicket(saved);
      setForm({
        fullName: '',
        phone: '',
        department: 'فروش و مشاوره تخصصی',
        orderCode: '',
        message: '',
      });
      showToast(`تیکت پشتیبانی ${saved.ticketCode} با موفقیت ثبت شد.`, 'success');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 space-y-3">
        <span className="inline-block px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
          مرکز ارتباط و پشتیبانی مشتریان
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0b1c30]">
          همیشه در دسترس برای مشاوره خرید و پیگیری سفارش شما
        </h1>
        <p className="text-xs sm:text-sm text-[#434655] max-w-2xl leading-7">
          اگر پیش از خرید نیاز به راهنمایی درباره پارت‌نامبر، کد رجیستری همتا یا شرایط گارانتی ۱۸ ماهه امیر سرویس دارید، از طریق فرم زیر یا تماس تلفنی با ما در ارتباط باشید.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Support Ticket Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-[#0b1c30]">ارسال پیام و ثبت تیکت پشتیبانی</h2>

          {submittedTicket && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <p className="text-sm font-extrabold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                پیام شما با کد رهگیری <span dir="ltr">{submittedTicket.ticketCode}</span> ثبت شد!
              </p>
              <p className="text-xs leading-6">
                کارشناسان دپارتمان {submittedTicket.department} در کوتاه‌ترین زمان با شماره{' '}
                <span dir="ltr">{submittedTicket.phone}</span> تماس می‌گیرند.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cnt-name" className="text-xs font-bold text-[#0b1c30] block">
                  نام و نام خانوادگی
                </label>
                <input
                  id="cnt-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="نام خود را بنویسید"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm focus:outline-none focus:border-[#004ac6]"
                />
                {errors.fullName && (
                  <p className="text-[11px] font-bold text-rose-600">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-phone" className="text-xs font-bold text-[#0b1c30] block">
                  شماره موبایل تماس
                </label>
                <input
                  id="cnt-phone"
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="09123456789"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left focus:outline-none focus:border-[#004ac6]"
                />
                {errors.phone && (
                  <p className="text-[11px] font-bold text-rose-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cnt-dept" className="text-xs font-bold text-[#0b1c30] block">
                  بخش مربوطه
                </label>
                <select
                  id="cnt-dept"
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm focus:outline-none"
                >
                  <option value="فروش و مشاوره تخصصی">فروش و مشاوره تخصصی</option>
                  <option value="پیگیری سفارش و ارسال">پیگیری سفارش و ارسال</option>
                  <option value="خدمات گارانتی امیر سرویس">خدمات گارانتی امیر سرویس</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-order" className="text-xs font-bold text-[#0b1c30] block">
                  شماره سفارش (اختیاری)
                </label>
                <input
                  id="cnt-order"
                  type="text"
                  dir="ltr"
                  value={form.orderCode}
                  onChange={(e) => setForm((p) => ({ ...p, orderCode: e.target.value }))}
                  placeholder="AMIR-10492"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cnt-msg" className="text-xs font-bold text-[#0b1c30] block">
                شرح پیام یا درخواست
              </label>
              <textarea
                id="cnt-msg"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="سوال یا توضیحات خود را اینجا بنویسید..."
                className="w-full p-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm focus:outline-none focus:border-[#004ac6]"
              />
              {errors.message && (
                <p className="text-[11px] font-bold text-rose-600">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="h-12 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'در حال ثبت...' : 'ثبت و ارسال پیام'}</span>
            </button>
          </form>
        </div>

        {/* Direct Contact & Store Location */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-black text-[#0b1c30]">راه‌های ارتباط مستقیم</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8f9ff] flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-[#004ac6] shrink-0" />
                <div>
                  <p className="text-[#434655]">خط ویژه پشتیبانی و مشاوره</p>
                  <p className="font-extrabold text-[#0b1c30] tabular-nums-fa mt-0.5">۰۲۱-۸۸۸۸۹۹۹۹</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f9ff] flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#004ac6] shrink-0" />
                <div>
                  <p className="text-[#434655]">پست الکترونیک</p>
                  <p dir="ltr" className="font-extrabold text-[#0b1c30] mt-0.5">
                    info@amirmobile.ir
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f9ff] flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#004ac6] shrink-0" />
                <div>
                  <p className="text-[#434655]">ساعات پاسخگویی</p>
                  <p className="font-extrabold text-[#0b1c30] mt-0.5">شنبه تا پنجشنبه · ۹:۰۰ الی ۲۱:۰۰</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f9ff] flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#434655]">دفتر مرکزی و مرکز تحویل حضوری</p>
                  <p className="font-bold text-[#0b1c30] mt-0.5 leading-6">
                    تهران، خیابان میرداماد، مجتمع کامپیوتر پایتخت، طبقه همکف، واحد ۱۰۴
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#eff4ff] rounded-3xl border border-[#dce9ff] p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-black text-[#0b1c30]">
              <Headphones className="w-5 h-5 text-[#004ac6]" />
              <span>دسترسی سریع خدمات</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/tracking')}
                className="p-3 rounded-xl bg-white hover:bg-[#004ac6] text-[#0b1c30] hover:text-white text-xs font-bold transition-colors"
              >
                رهگیری مرسوله
              </button>
              <button
                type="button"
                onClick={() => navigate('/terms')}
                className="p-3 rounded-xl bg-white hover:bg-[#004ac6] text-[#0b1c30] hover:text-white text-xs font-bold transition-colors"
              >
                شرایط گارانتی و مرجوعی
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
