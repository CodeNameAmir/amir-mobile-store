import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  PhoneCall,
  Send,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { storeApi } from '../lib/authApi';
import type { ContactFormData, SupportTicket } from '../types/store';
import { validateContactForm } from '../utils/storeLogic';

export const ContactPage: React.FC = () => {
  const { buildHref, handleLinkClick, showToast } = useStore();
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
      const res = await storeApi.submitSupportTicket({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        department: form.department,
        orderCode: form.orderCode.trim(),
        message: form.message.trim(),
      });
      setSubmittedTicket(res.ticket);
      setForm({
        fullName: '',
        phone: '',
        department: 'فروش و مشاوره تخصصی',
        orderCode: '',
        message: '',
      });
      showToast(`تیکت پشتیبانی ${res.ticket.ticketCode} با موفقیت ثبت شد.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت پیام پشتیبانی.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-3">
        <span className="inline-block px-3 py-1 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium">
          مرکز ارتباط و پشتیبانی مشتریان
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#11161E]">
          همیشه در دسترس برای مشاوره خرید و پیگیری سفارش شما
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5464] max-w-2xl leading-7">
          اگر پیش از خرید نیاز به راهنمایی درباره پارت‌نامبر، کد رجیستری همتا یا شرایط گارانتی ۱۸ ماهه امیر سرویس دارید، از طریق فرم زیر یا تماس تلفنی با ما در ارتباط باشید.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Support Ticket Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-[#11161E]">ارسال پیام و ثبت تیکت پشتیبانی</h2>

          {submittedTicket && (
            <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] space-y-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#067647]" strokeWidth={1.5} />
                <span>
                  پیام شما با کد رهگیری <span dir="ltr" className="font-mono">{submittedTicket.ticketCode}</span> ثبت شد.
                </span>
              </p>
              <p className="text-xs leading-6 text-[#11161E]">
                کارشناسان دپارتمان {submittedTicket.department} در کوتاه‌ترین زمان با شماره{' '}
                <span dir="ltr" className="font-mono">{submittedTicket.phone}</span> تماس می‌گیرند.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cnt-name" className="text-xs font-medium text-[#11161E] block">
                  نام و نام خانوادگی
                </label>
                <input
                  id="cnt-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="نام خود را بنویسید"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                />
                {errors.fullName && (
                  <p className="text-[11px] font-medium text-[#B42318]">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-phone" className="text-xs font-medium text-[#11161E] block">
                  شماره موبایل تماس
                </label>
                <input
                  id="cnt-phone"
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="09123456789"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                />
                {errors.phone && (
                  <p className="text-[11px] font-medium text-[#B42318]">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cnt-dept" className="text-xs font-medium text-[#11161E] block">
                  بخش مربوطه
                </label>
                <select
                  id="cnt-dept"
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                >
                  <option value="فروش و مشاوره تخصصی">فروش و مشاوره تخصصی</option>
                  <option value="پیگیری سفارش و ارسال">پیگیری سفارش و ارسال</option>
                  <option value="خدمات گارانتی امیر سرویس">خدمات گارانتی امیر سرویس</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-order" className="text-xs font-medium text-[#11161E] block">
                  شماره سفارش (اختیاری)
                </label>
                <input
                  id="cnt-order"
                  type="text"
                  dir="ltr"
                  value={form.orderCode}
                  onChange={(e) => setForm((p) => ({ ...p, orderCode: e.target.value }))}
                  placeholder="AMIR-10492"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cnt-msg" className="text-xs font-medium text-[#11161E] block">
                شرح پیام یا درخواست
              </label>
              <textarea
                id="cnt-msg"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="سوال یا توضیحات خود را اینجا بنویسید"
                className="w-full p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:outline-none focus:border-[#1453D6]"
              />
              {errors.message && (
                <p className="text-[11px] font-medium text-[#B42318]">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="h-11 px-6 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              <span>{sending ? 'در حال ثبت...' : 'ثبت و ارسال پیام'}</span>
            </button>
          </form>
        </div>

        {/* Direct Contact & Store Location */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#11161E]">راه‌های ارتباط مستقیم</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">خط ویژه پشتیبانی و مشاوره</p>
                  <p className="font-semibold text-[#11161E] tabular-nums-fa mt-0.5">۰۲۱-۸۸۸۸۹۹۹۹</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">پست الکترونیک</p>
                  <p dir="ltr" className="font-semibold font-mono text-[#11161E] mt-0.5">
                    info@amirmobile.ir
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">ساعات پاسخگویی</p>
                  <p className="font-semibold text-[#11161E] mt-0.5">شنبه تا پنجشنبه · ۹:۰۰ الی ۲۱:۰۰</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1453D6] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[#4A5464]">دفتر مرکزی و مرکز تحویل حضوری</p>
                  <p className="font-medium text-[#11161E] mt-0.5 leading-6">
                    تهران، خیابان میرداماد، مجتمع کامپیوتر پایتخت، طبقه همکف، واحد ۱۰۴
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F1F3F6] rounded-2xl border border-[#E4E8EE] p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#11161E]">
              <Headphones className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
              <span>دسترسی سریع خدمات</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={buildHref('/tracking')}
                onClick={(e) => handleLinkClick(e, '/tracking')}
                className="p-3 rounded-lg bg-white border border-[#E4E8EE] hover:bg-[#1453D6] hover:border-[#1453D6] text-[#11161E] hover:text-white text-xs font-medium transition-colors text-center"
              >
                رهگیری مرسوله
              </a>
              <a
                href={buildHref('/terms')}
                onClick={(e) => handleLinkClick(e, '/terms')}
                className="p-3 rounded-lg bg-white border border-[#E4E8EE] hover:bg-[#1453D6] hover:border-[#1453D6] text-[#11161E] hover:text-white text-xs font-medium transition-colors text-center"
              >
                شرایط گارانتی و مرجوعی
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
