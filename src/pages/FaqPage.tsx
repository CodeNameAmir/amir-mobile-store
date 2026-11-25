import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  CreditCard,
  Headphones,
  HelpCircle,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UI_EASE } from '../utils/motionHelpers';

type FaqCategoryId = 'all' | 'shipping' | 'warranty' | 'payment' | 'returns';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategoryId, 'all'>;
  question: string;
  answer: string;
}

const FAQ_CATEGORIES: Array<{ id: FaqCategoryId; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'همه پرسش‌ها', icon: <HelpCircle className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'shipping', label: 'ثبت سفارش و ارسال', icon: <Truck className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'warranty', label: 'رجیستری همتا و گارانتی', icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'payment', label: 'پرداخت و خرید اقساطی', icon: <CreditCard className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'returns', label: 'تعویض و بازگشت کالا', icon: <RefreshCw className="w-4 h-4" strokeWidth={1.5} /> },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'warranty',
    question: 'آیا تمامی گوشی‌های فروشگاه با رجیستری رسمی همتا عرضه می‌شوند؟',
    answer:
      'بله؛ تمامی گوشی‌های هوشمند ارائه‌شده در فروشگاه موبایل امیر دارای کد رجیستری رسمی سامانه همتا و کارت گارانتی ۱۸ ماهه امیر سرویس هستند. پس از تحویل مرسوله، انتقال مالکیت در سامانه همتا به شماره موبایل خریدار انجام می‌شود.',
  },
  {
    id: 'faq-2',
    category: 'warranty',
    question: 'بیمه حوادث Amir Care+ دقیقاً چه مواردی را پوشش می‌دهد؟',
    answer:
      'بیمه حوادث ۱۲ ماهه Amir Care+ شامل پوشش آسیب‌های فیزیکی نظیر شکستگی صفحه‌نمایش، آب‌خوردگی، نوسانات برق و سرقت با شکست حرز تا سقف ارزش فاکتور کالا است و با هزینه بسیار مقرون‌به‌صرفه در صفحه محصول قابل انتخاب می‌باشد.',
  },
  {
    id: 'faq-3',
    category: 'shipping',
    question: 'شرایط و زمان‌بندی ارسال اکسپرس ۳ ساعته چگونه است؟',
    answer:
      'ارسال اکسپرس ۳ ساعته ویژه شهر تهران و کلان‌شهرهای منتخب است. اگر شهر انتخابی شما در محدوده ارسال فوری نباشد، مرسوله به‌صورت خودکار از طریق پست پیشتاز یا تیپاکس بیمه شده ظرف ۱ تا ۳ روز کاری ارسال می‌گردد.',
  },
  {
    id: 'faq-4',
    category: 'shipping',
    question: 'سفارش‌های بالای چه مبلغی شامل ارسال رایگان می‌شوند؟',
    answer:
      'تمامی سفارش‌های بالای ۱٬۰۰۰٬۰۰۰ تومان با ارسال عادی به‌صورت رایگان به سراسر ایران ارسال می‌شوند. هزینه دقیق حمل‌ونقل پیش از نهایی شدن سفارش در سبد خرید نمایش داده می‌شود.',
  },
  {
    id: 'faq-5',
    category: 'payment',
    question: 'شرایط خرید اقساطی گوشی موبایل چگونه است؟',
    answer:
      'در بخش «محاسبه‌گر خرید اقساطی» می‌توانید مبلغ پیش‌پرداخت و بازه بازپرداخت (۶ تا ۲۴ ماهه) را محاسبه کنید. ثبت درخواست اقساط با چک صیادی یا سفته الکترونیکی و بدون نیاز به ضامن تا سقف ۱۵۰ میلیون تومان انجام می‌شود.',
  },
  {
    id: 'faq-6',
    category: 'payment',
    question: 'آیا می‌توانم از کد تخفیف و تخفیف محصولات به‌صورت هم‌زمان استفاده کنم؟',
    answer:
      'بله؛ کدهای تخفیف معتبر فروشگاه مانند کد تخفیف خرید اول، روی جمع سبد خرید پس از اعمال تخفیف‌های روی کالا محاسبه می‌شوند و تفکیک هر دو تخفیف در فاکتور رسمی درج می‌گردد.',
  },
  {
    id: 'faq-7',
    category: 'returns',
    question: 'مهلت ۷ روزه بازگشت کالا شامل چه شرایطی است؟',
    answer:
      'تمامی کالاها دارای ۷ روز ضمانت تعویض و بازگشت در صورت وجود ایراد فنی تاییدشده توسط کارشناسان امیر سرویس، مغایرت مدل یا آسیب حمل‌ونقل هستند. برای بازگشت سلیقه‌ای، پلمپ کارخانه و برچسب رجیستری نباید مخدوش شده باشد.',
  },
  {
    id: 'faq-8',
    category: 'shipping',
    question: 'چگونه وضعیت مرسوله و پین تحویل را پیگیری کنم؟',
    answer:
      'از طریق صفحه «پیگیری سفارش‌ها» با وارد کردن کد سفارش (مانند AMIR-10428) و شماره موبایل خریدار یا از داخل تب «سفارش‌های من» در حساب کاربری می‌توانید مراحل آماده‌سازی، کد رهگیری و پین تحویل حضوری را مشاهده کنید.',
  },
];

export const FaqPage: React.FC = () => {
  const { buildHref, handleLinkClick } = useStore();
  const [selectedCat, setSelectedCat] = useState<FaqCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-3']);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (selectedCat !== 'all' && item.category !== selectedCat) return false;
      if (q && !item.question.toLowerCase().includes(q) && !item.answer.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCat]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 md:py-10 space-y-8">
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>راهنمای جامع خریداران</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
            پرسش‌های متداول فروشگاه موبایل امیر
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5464] leading-7">
            پاسخ دقیق به پرتکرارترین سوالات درباره رجیستری همتا، شرایط گارانتی ۱۸ ماهه امیر سرویس، خرید اقساطی، ارسال اکسپرس و رویه‌های بازگشت کالا.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در پرسش‌ها (مثلاً همتا، اکسپرس...)"
            data-testid="faq-search-input"
            className="w-full h-11 pr-10 pl-3 rounded-xl bg-[#F1F3F6] border border-[#E4E8EE] text-xs text-[#11161E] placeholder:text-[#576071] focus:bg-white focus:border-[#1453D6] focus:outline-none transition-colors"
          />
          <Search
            className="w-4 h-4 text-[#576071] absolute right-3.5 top-1/2 -translate-y-1/2"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FAQ_CATEGORIES.map((cat) => {
          const active = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              data-testid={`faq-cat-${cat.id}`}
              className={`h-10 px-4 rounded-xl text-xs font-medium inline-flex items-center gap-2 border transition-colors ${
                active
                  ? 'bg-[#1453D6] border-[#1453D6] text-white'
                  : 'bg-white border-[#E4E8EE] text-[#4A5464] hover:border-[#1453D6] hover:text-[#11161E]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-[#11161E]">پرسشی با این عبارت یافت نشد</p>
            <p className="text-xs text-[#4A5464]">
              می‌توانید عبارت جستجو را تغییر دهید یا مستقیم از پشتیبانی تخصصی سوال بپرسید.
            </p>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = openIds.includes(item.id);
            return (
              <div
                key={item.id}
                data-testid={`faq-item-${item.id}`}
                className="bg-white rounded-2xl border border-[#E4E8EE] overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 hover:bg-[#F7F8FA]/80 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#11161E]">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: UI_EASE }}
                    className="shrink-0 text-[#576071]"
                  >
                    <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: UI_EASE }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4A5464] leading-7 border-t border-[#E4E8EE]/70">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Support CTA */}
      <div className="bg-[#13171F] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-semibold">پاسخ سوال خود را پیدا نکردید؟</h2>
          <p className="text-xs sm:text-sm text-white/75">
            تیم کارشناسان فروش و پشتیبانی امیر آماده پاسخگویی و ثبت تیکت اختصاصی شما هستند.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={buildHref('/tracking')}
            onClick={(e) => handleLinkClick(e, '/tracking')}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
          >
            <PackageSearch className="w-4 h-4" strokeWidth={1.5} />
            <span>پیگیری سفارش</span>
          </a>
          <a
            href={buildHref('/contact')}
            onClick={(e) => handleLinkClick(e, '/contact')}
            className="h-10 px-5 rounded-xl bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Headphones className="w-4 h-4" strokeWidth={1.5} />
            <span>تماس و ثبت تیکت پشتیبانی</span>
          </a>
        </div>
      </div>
    </div>
  );
};
