import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  Menu,
  PackageSearch,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { CategoryId } from '../types/store';
import {
  formatToman,
  matchesProductSearch,
  toEnglishDigits,
  toPersianDigits,
} from '../utils/storeLogic';
import { SmartImage } from './SmartImage';

const NAV_LINKS: { label: string; category?: CategoryId; path?: string; accent?: boolean }[] = [
  { label: 'صفحه اصلی', path: '/' },
  { label: 'گوشی موبایل', category: 'phones' },
  { label: 'تبلت', category: 'tablets' },
  { label: 'ساعت هوشمند', category: 'smartwatches' },
  { label: 'هندزفری', category: 'audio' },
  { label: 'پاوربانک و شارژر', category: 'chargers' },
  { label: 'قاب و محافظ', category: 'cases' },
  { label: 'پیشنهادات طلایی', category: 'offers', accent: true },
  { label: 'خرید اقساطی', path: '/installments' },
  { label: 'مقایسه', path: '/compare' },
];

export const Navbar: React.FC = () => {
  const {
    route,
    navigate,
    navigateToCatalog,
    products,
    cartSummary,
    compareIds,
    storeSettings,
    user,
    filters,
  } = useStore();
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const blurTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSearchValue(filters.searchQuery || '');
  }, [filters.searchQuery]);

  const liveSuggestions = useMemo(() => {
    const q = toEnglishDigits(searchValue.trim().toLowerCase());
    if (q.length < 2) return [];
    return products.filter((p) => matchesProductSearch(p, q)).slice(0, 5);
  }, [products, searchValue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    navigateToCatalog({ category: 'all', searchQuery: searchValue });
    setMobileMenuOpen(false);
  };

  const handleNavClick = (item: (typeof NAV_LINKS)[number]) => {
    setMobileMenuOpen(false);
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (item.category) {
      navigateToCatalog({
        category: item.category,
        discountedOnly: item.category === 'offers',
      });
    }
  };

  const isNavItemActive = (item: (typeof NAV_LINKS)[number]) => {
    if (item.path === '/' && route.page === 'home') return true;
    if (item.path === '/installments' && route.page === 'installments') return true;
    if (item.path === '/compare' && route.page === 'compare') return true;
    if (item.category && route.page === 'catalog' && filters.category === item.category) return true;
    return false;
  };

  return (
    <>
      {/* Top utility announcement bar */}
      <div className="bg-[#213145] text-[#d6e3ff] text-xs py-2 hidden md:block no-print">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#ffdbca]" />
              {storeSettings.announcementText}
            </span>
          </div>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#93c5fd]" />
              ضمانت اصالت ۱۰۰٪ و کد رجیستری همتا
            </span>
            <a
              href="#/contact"
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
              className="hover:text-white transition-colors tabular-nums-fa"
            >
              پشتیبانی: {toPersianDigits(storeSettings.supportPhone)}
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_2px_14px_rgba(11,28,48,0.04)] no-print">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-3 md:gap-6">
          {/* Right side: Mobile menu toggle + Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
              aria-label="باز کردن منو"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm md:text-lg font-extrabold text-[#0b1c30] tracking-tight whitespace-nowrap">
                  فروشگاه موبایل امیر
                </span>
                <span className="text-[10px] font-semibold text-[#434655] tracking-wider hidden sm:block">
                  AMIR MOBILE STORE
                </span>
              </div>
            </a>
          </div>

          {/* Center: Search bar with live autocomplete dropdown on desktop */}
          <div className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} role="search">
              <input
                type="search"
                value={searchValue}
                onFocus={() => {
                  if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
                  setSearchFocused(true);
                }}
                onBlur={() => {
                  blurTimerRef.current = window.setTimeout(() => setSearchFocused(false), 180);
                }}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchFocused(false);
                  }
                }}
                placeholder="جستجوی گوشی، ساعت هوشمند، شارژر، ایرپاد..."
                aria-label="جستجوی محصولات"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-[#eff4ff] text-sm text-[#0b1c30] placeholder:text-[#434655]/70 border border-transparent focus:border-[#2563eb] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                aria-label="جستجو"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#004ac6] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {searchFocused && liveSuggestions.length > 0 && (
              <div
                data-testid="live-search-dropdown"
                className="absolute top-12 right-0 left-0 bg-white rounded-2xl border border-[#dce9ff] shadow-xl overflow-hidden z-50"
              >
                <div className="divide-y divide-[#eff4ff]">
                  {liveSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchFocused(false);
                        navigate(`/product/${item.slug}`);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-[#f8f9ff] text-right transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#eff4ff] overflow-hidden shrink-0">
                        <SmartImage src={item.image} alt={item.nameFa} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-[#0b1c30] truncate">{item.nameFa}</p>
                        <p className="text-[11px] text-[#434655] mt-0.5">
                          {item.brand} · {item.specs.storageDefault}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#004ac6] tabular-nums-fa shrink-0">
                        {item.inStock ? `${formatToman(item.price)} تومان` : 'ناموجود'}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchFocused(false);
                    navigateToCatalog({ category: 'all', searchQuery: searchValue });
                  }}
                  className="w-full py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-xs font-extrabold text-[#004ac6] transition-colors"
                >
                  مشاهده همه نتایج برای «{searchValue}»
                </button>
              </div>
            )}
          </div>

          {/* Left side: Tracking, Account & Cart CTA */}
          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/tracking')}
              className="hidden xl:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold text-[#434655] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors whitespace-nowrap shrink-0"
            >
              <PackageSearch className="w-4 h-4" />
              پیگیری مرسوله
            </button>

            <button
              type="button"
              onClick={() => navigate('/account')}
              className="inline-flex items-center gap-2 h-10 px-3 md:px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 text-[#004ac6]" />
              <span className="hidden sm:inline">{user ? user.fullName : 'حساب کاربری'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/cart')}
              data-testid="nav-cart-btn"
              className="inline-flex items-center gap-2 h-10 px-3.5 md:px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs md:text-sm font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سبد خرید</span>
              <span
                data-testid="cart-badge-count"
                className="min-w-[20px] h-5 px-1.5 rounded-md bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center tabular-nums-fa"
              >
                {toPersianDigits(cartSummary.itemCount)}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Category Strip */}
        <nav
          aria-label="دسته‌بندی محصولات"
          className="hidden lg:block border-t border-[#eff4ff] bg-white"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-11 flex items-center justify-between gap-4">
            <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {NAV_LINKS.map((item) => {
                const active = isNavItemActive(item);
                return (
                  <li key={item.label} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                        active
                          ? 'bg-[#eff4ff] text-[#004ac6]'
                          : item.accent
                          ? 'text-[#b54e00] hover:bg-[#ffdbca]/40'
                          : 'text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      {item.path === '/compare' && <Scale className="w-3.5 h-3.5" />}
                      {item.path === '/installments' && <Calculator className="w-3.5 h-3.5" />}
                      <span>{item.label}</span>
                      {item.path === '/compare' && compareIds.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-[#004ac6] text-white text-[10px] font-bold tabular-nums-fa">
                          {toPersianDigits(compareIds.length)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 text-xs font-medium text-[#434655] shrink-0">
              <button
                type="button"
                onClick={() => navigate('/tracking')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                پیگیری سفارش
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                درباره ما
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                تماس با ما
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e5eeff] bg-white px-4 py-4 space-y-4 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="جستجوی موبایل یا لوازم جانبی..."
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-[#eff4ff] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
              <Search className="w-4 h-4 text-[#434655] absolute right-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`text-right px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isNavItemActive(item)
                      ? 'bg-[#004ac6] text-white'
                      : item.accent
                      ? 'bg-[#ffdbca]/40 text-[#8e3c00]'
                      : 'bg-[#f8f9ff] text-[#0b1c30]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs font-semibold text-[#434655]">
              <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/tracking'); }}>
                رهگیری سفارش
              </button>
              <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/about'); }}>
                درباره فروشگاه
              </button>
              <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/contact'); }}>
                پشتیبانی و تماس
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
