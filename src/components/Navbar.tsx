import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calculator,
  Clock,
  Layers,
  Menu,
  PackageSearch,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { CategoryId } from '../types/store';
import { UI_EASE } from '../utils/motionHelpers';
import {
  buildSearchSuggestions,
  formatToman,
  toPersianDigits,
} from '../utils/storeLogic';
import { SmartImage } from './SmartImage';

interface NavEntry {
  key: string;
  label: string;
  href: string;
  category?: CategoryId;
  accent?: boolean;
  icon?: 'compare' | 'installments';
}

export const Navbar: React.FC = () => {
  const {
    route,
    buildHref,
    handleLinkClick,
    navigate,
    navigateToCatalog,
    products,
    categories,
    brands,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    cartSummary,
    cartPulseTick,
    compareIds,
    storeSettings,
    user,
    filters,
  } = useStore();
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartPulsing, setCartPulsing] = useState(false);
  const blurTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSearchValue(filters.searchQuery || '');
  }, [filters.searchQuery]);

  useEffect(() => {
    if (cartPulseTick <= 0) return;
    setCartPulsing(true);
    const timer = window.setTimeout(() => setCartPulsing(false), 450);
    return () => window.clearTimeout(timer);
  }, [cartPulseTick]);

  const navLinks = useMemo<NavEntry[]>(() => {
    const activeRoots = categories
      .filter((c) => c.isActive !== false && !c.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return [
      { key: 'home', label: 'صفحه اصلی', href: '/' },
      ...activeRoots.slice(0, 8).map((cat) => ({
        key: `cat-${cat.id}`,
        label: cat.label,
        href: `/catalog?cat=${encodeURIComponent(cat.slug)}`,
        category: cat.slug as CategoryId,
      })),
      {
        key: 'offers',
        label: 'پیشنهادات طلایی',
        href: '/catalog?cat=offers',
        category: 'offers' as CategoryId,
        accent: true,
      },
      { key: 'installments', label: 'خرید اقساطی', href: '/installments', icon: 'installments' },
      { key: 'compare', label: 'مقایسه', href: '/compare', icon: 'compare' },
    ];
  }, [categories]);

  const suggestions = useMemo(() => {
    const q = searchValue.trim();
    if (q.length < 2) {
      return { products: [], brands: [], categories: [] };
    }
    return buildSearchSuggestions(q, products, categories, brands);
  }, [brands, categories, products, searchValue]);

  const hasSuggestionResults =
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.categories.length > 0;

  const showRecentPanel = searchFocused && searchValue.trim().length < 2;
  const showSuggestionsPanel = searchFocused && searchValue.trim().length >= 2;

  const POPULAR_SEARCHES = ['آیفون ۱۶', 'هواوی', 'سامسونگ', 'پاوربانک انکر'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed.length >= 2) {
      addRecentSearch(trimmed);
    }
    setSearchFocused(false);
    navigateToCatalog({ category: 'all', searchQuery: trimmed });
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavEntry) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    if (item.category) {
      navigateToCatalog({
        category: item.category,
        discountedOnly: item.category === 'offers',
      });
      return;
    }
    navigate(item.href);
  };

  const isNavItemActive = (item: NavEntry) => {
    if (item.href === '/' && route.page === 'home') return true;
    if (item.href === '/installments' && route.page === 'installments') return true;
    if (item.href === '/compare' && route.page === 'compare') return true;
    if (item.category && route.page === 'catalog' && filters.category === item.category) return true;
    return false;
  };

  return (
    <>
      {/* Top quiet utility strip */}
      <div className="bg-[#F1F3F6] border-b border-[#E4E8EE] text-[#4A5464] text-xs py-2 hidden md:block no-print">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6E7889]" strokeWidth={1.5} />
              {storeSettings.announcementText}
            </span>
          </div>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6E7889]" strokeWidth={1.5} />
              ضمانت اصالت ۱۰۰٪ و کد رجیستری همتا
            </span>
            <a
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="hover:text-[#11161E] transition-colors tabular-nums-fa"
            >
              پشتیبانی: {toPersianDigits(storeSettings.supportPhone)}
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E4E8EE] no-print">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-3 md:gap-6">
          {/* Right side: Mobile menu toggle + Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg bg-[#F1F3F6] text-[#11161E] hover:bg-[#EAECEF] transition-colors"
              aria-label="باز کردن منو"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>

            <a
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
              className="flex items-center gap-2.5 shrink-0"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#13171F] text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm md:text-base font-semibold text-[#11161E] whitespace-nowrap">
                  فروشگاه موبایل امیر
                </span>
                <span className="text-[11px] font-normal text-[#6E7889] hidden sm:block">
                  تخصصی موبایل و تجهیزات شارژ
                </span>
              </div>
            </a>
          </div>

          {/* Center: Search bar with smart autocomplete & recent searches */}
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
                placeholder="جستجوی مدل، برند یا دسته‌بندی"
                aria-label="جستجوی محصولات"
                data-testid="navbar-search-input"
                className="w-full h-11 pr-10 pl-10 rounded-lg bg-[#F1F3F6] text-sm text-[#11161E] placeholder:text-[#6E7889] border border-transparent focus:border-[#1453D6] focus:bg-white focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="جستجو"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E7889] hover:text-[#1453D6] transition-colors"
              >
                <Search className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {searchValue.trim().length > 0 && (
                <button
                  type="button"
                  aria-label="پاک کردن متن جستجو"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchValue('');
                    setSearchFocused(true);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7889] hover:text-[#B42318] transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </form>

            <AnimatePresence>
              {showRecentPanel && (
                <motion.div
                  data-testid="recent-searches-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.985 }}
                  transition={{ duration: 0.16, ease: UI_EASE }}
                  className="absolute top-12 right-0 left-0 bg-white rounded-xl border border-[#E4E8EE] shadow-md overflow-hidden z-50 p-4 space-y-3"
                >
                <div className="flex items-center justify-between text-xs font-medium text-[#4A5464]">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#6E7889]" strokeWidth={1.5} />
                    تاریخچه جستجوهای اخیر
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={clearRecentSearches}
                      className="text-[11px] font-medium text-[#B42318] hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      پاک کردن همه
                    </button>
                  )}
                </div>

                {recentSearches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q) => (
                      <div
                        key={q}
                        className="inline-flex items-center rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] overflow-hidden"
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchValue(q);
                            setSearchFocused(false);
                            navigateToCatalog({ category: 'all', searchQuery: q });
                          }}
                          className="px-3 py-1.5 hover:bg-[#EAECEF] text-xs font-medium text-[#11161E] transition-colors"
                        >
                          {q}
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${q} از تاریخچه`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => removeRecentSearch(q)}
                          className="pl-2 pr-1 py-1.5 text-[#6E7889] hover:text-[#B42318] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6E7889]">
                    پس از اولین جستجو، عبارت‌های اخیر در این بخش نمایش داده می‌شوند.
                  </p>
                )}

                <div className="pt-2.5 border-t border-[#E4E8EE] space-y-2">
                  <p className="text-[11px] font-medium text-[#4A5464]">جستجوهای پرکاربرد</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          addRecentSearch(term);
                          setSearchValue(term);
                          setSearchFocused(false);
                          navigateToCatalog({ category: 'all', searchQuery: term });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF3FC] border border-[#E4E8EE] text-[11px] font-medium text-[#1453D6] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSuggestionsPanel && (
                <motion.div
                  data-testid="live-search-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.985 }}
                  transition={{ duration: 0.16, ease: UI_EASE }}
                  className="absolute top-12 right-0 left-0 bg-white rounded-xl border border-[#E4E8EE] shadow-md overflow-hidden z-50"
                >
                {(suggestions.brands.length > 0 || suggestions.categories.length > 0) && (
                  <div className="p-2.5 bg-[#F7F8FA] border-b border-[#E4E8EE] flex flex-wrap gap-2">
                    {suggestions.brands.map((brand) => (
                      <a
                        key={`brand-${brand.id}`}
                        href={buildHref(`/catalog?brand=${encodeURIComponent(brand.name)}`)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          addRecentSearch(searchValue.trim() || brand.labelFa || brand.name);
                          if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            setSearchFocused(false);
                            navigateToCatalog({ brand: brand.name });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E8EE] text-[11px] font-medium text-[#1453D6] hover:bg-[#1453D6] hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
                        برند {brand.labelFa || brand.name}
                      </a>
                    ))}
                    {suggestions.categories.map((cat) => (
                      <a
                        key={`cat-${cat.id}`}
                        href={buildHref(`/catalog?cat=${encodeURIComponent(cat.slug)}`)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          addRecentSearch(searchValue.trim() || cat.label);
                          if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            setSearchFocused(false);
                            navigateToCatalog({ category: cat.slug as CategoryId });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E8EE] text-[11px] font-medium text-[#11161E] hover:border-[#1453D6] inline-flex items-center gap-1 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#6E7889]" strokeWidth={1.5} />
                        دسته {cat.label}
                      </a>
                    ))}
                  </div>
                )}

                {hasSuggestionResults ? (
                  suggestions.products.length > 0 && (
                    <div className="divide-y divide-[#E4E8EE]">
                      {suggestions.products.map((item) => (
                        <a
                          key={item.id}
                          href={buildHref(`/product/${item.slug}`)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            addRecentSearch(searchValue.trim() || item.nameFa);
                            handleLinkClick(e, `/product/${item.slug}`, () => setSearchFocused(false));
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-[#F7F8FA] text-right transition-colors"
                        >
                          <div className="w-11 h-11 rounded-lg bg-[#F3F5F8] overflow-hidden shrink-0">
                            <SmartImage src={item.image} alt={item.nameFa} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#11161E] truncate">{item.nameFa}</p>
                            <p className="text-[11px] text-[#4A5464] mt-0.5">
                              {item.brand} · {item.specs.storageDefault}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-[#1453D6] tabular-nums-fa shrink-0">
                            {item.inStock ? `${formatToman(item.price)} تومان` : 'ناموجود'}
                          </span>
                        </a>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="p-3 text-xs text-[#4A5464]">
                    پیشنهاد مستقیمی یافت نشد؛ برای جستجوی کامل روی دکمه زیر کلیک کنید.
                  </p>
                )}

                {recentSearches.length > 0 && (
                  <div className="px-3 py-2 bg-[#F7F8FA] border-t border-[#E4E8EE] flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#4A5464] inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#6E7889]" strokeWidth={1.5} />
                      اخیر
                    </span>
                    {recentSearches.slice(0, 4).map((q) => (
                      <button
                        key={`live-recent-${q}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearchValue(q);
                          setSearchFocused(false);
                          navigateToCatalog({ category: 'all', searchQuery: q });
                        }}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] text-[11px] font-medium text-[#11161E] hover:border-[#1453D6]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const trimmed = searchValue.trim();
                    if (trimmed.length >= 2) addRecentSearch(trimmed);
                    setSearchFocused(false);
                    navigateToCatalog({ category: 'all', searchQuery: trimmed });
                  }}
                  className="w-full py-2.5 bg-[#F1F3F6] hover:bg-[#EAECEF] text-xs font-semibold text-[#1453D6] transition-colors"
                >
                  مشاهده همه نتایج برای «{searchValue}»
                </button>
              </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Left side: Admin Link, Tracking, Account & Cart CTA */}
          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            {user?.role === 'admin' && (
              <a
                href="https://admin-panel-ams.codenameamir.ir/#/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="nav-admin-link"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-[#FDF1E8] hover:bg-[#FAE3D1] text-[#A84500] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                <span>پنل مدیریت</span>
              </a>
            )}

            <a
              href={buildHref('/tracking')}
              onClick={(e) => handleLinkClick(e, '/tracking')}
              className="hidden xl:inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-xs font-medium text-[#4A5464] hover:text-[#11161E] hover:bg-[#F1F3F6] transition-colors whitespace-nowrap shrink-0"
            >
              <PackageSearch className="w-4 h-4" strokeWidth={1.5} />
              پیگیری مرسوله
            </a>

            <a
              href={buildHref('/account')}
              onClick={(e) => handleLinkClick(e, '/account')}
              data-testid="navbar-account-link"
              className="inline-flex items-center gap-2 h-10 px-3 md:px-3.5 rounded-lg bg-[#F1F3F6] hover:bg-[#EAECEF] text-[#11161E] text-xs md:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-[#DCE1E8]"
                />
              ) : (
                <User className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
              )}
              <span className="hidden sm:inline">{user ? user.fullName : 'حساب کاربری'}</span>
              {user?.username && (
                <span
                  dir="ltr"
                  data-testid="navbar-username-badge"
                  className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-white text-[#1453D6] font-mono text-[11px] font-medium border border-[#E4E8EE]"
                >
                  @{user.username}
                </span>
              )}
            </a>

            <motion.a
              href={buildHref('/cart')}
              onClick={(e) => handleLinkClick(e, '/cart')}
              data-testid="nav-cart-btn"
              animate={
                cartPulsing
                  ? { scale: [1, 1.08, 0.97, 1] }
                  : { scale: 1 }
              }
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.36, ease: UI_EASE }}
              className={`relative inline-flex items-center gap-2 h-10 px-3.5 md:px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                cartPulsing ? 'ring-4 ring-[#1453D6]/25' : ''
              }`}
            >
              <motion.span
                animate={cartPulsing ? { rotate: [0, -14, 12, -5, 0] } : { rotate: 0 }}
                transition={{ duration: 0.4, ease: UI_EASE }}
                className="inline-flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              </motion.span>
              <span className="hidden sm:inline">سبد خرید</span>
              <span
                data-testid="cart-badge-count"
                className="min-w-[20px] h-5 px-1.5 rounded-md bg-white/15 text-white text-xs font-medium inline-flex items-center justify-center tabular-nums-fa overflow-hidden"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={cartSummary.itemCount}
                    initial={{ y: -8, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 8, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: UI_EASE }}
                    className="inline-block"
                  >
                    {toPersianDigits(cartSummary.itemCount)}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.a>
          </div>
        </div>

        {/* Desktop Category Strip */}
        <nav
          aria-label="دسته‌بندی محصولات"
          className="hidden lg:block border-t border-[#E4E8EE] bg-white"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-11 flex items-center justify-between gap-4">
            <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {navLinks.map((item) => {
                const active = isNavItemActive(item);
                return (
                  <li key={item.key} className="shrink-0 relative">
                    <a
                      href={buildHref(item.href)}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                        active
                          ? 'text-[#1453D6]'
                          : item.accent
                          ? 'text-[#A84500] hover:bg-[#FDF1E8]'
                          : 'text-[#4A5464] hover:text-[#11161E] hover:bg-[#F1F3F6]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="navbar-cat-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-lg bg-[#EEF3FC] -z-0"
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1.5">
                        {item.icon === 'compare' && <Scale className="w-4 h-4" strokeWidth={1.5} />}
                        {item.icon === 'installments' && <Calculator className="w-4 h-4" strokeWidth={1.5} />}
                        <span>{item.label}</span>
                        {item.icon === 'compare' && compareIds.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1453D6] text-white text-[10px] font-medium tabular-nums-fa">
                            {toPersianDigits(compareIds.length)}
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 text-xs font-medium text-[#4A5464] shrink-0">
              <a
                href={buildHref('/tracking')}
                onClick={(e) => handleLinkClick(e, '/tracking')}
                className="hover:text-[#11161E] transition-colors whitespace-nowrap"
              >
                پیگیری سفارش
              </a>
              <a
                href={buildHref('/about')}
                onClick={(e) => handleLinkClick(e, '/about')}
                className="hover:text-[#11161E] transition-colors whitespace-nowrap"
              >
                درباره ما
              </a>
              <a
                href={buildHref('/contact')}
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="hover:text-[#11161E] transition-colors whitespace-nowrap"
              >
                تماس با ما
              </a>
            </div>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: UI_EASE }}
              className="lg:hidden border-t border-[#E4E8EE] bg-white px-4 py-4 space-y-4 shadow-md"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="جستجوی موبایل، برند یا لوازم جانبی"
                  className="w-full h-10 pr-10 pl-3 rounded-lg bg-[#F1F3F6] text-sm text-[#11161E] placeholder:text-[#6E7889] focus:outline-none focus:ring-2 focus:ring-[#1453D6]"
                />
                <Search className="w-4 h-4 text-[#6E7889] absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              </form>

              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#4A5464]">اخیر</span>
                  {recentSearches.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToCatalog({ category: 'all', searchQuery: q });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#F1F3F6] text-[11px] font-medium text-[#11161E]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((item) => (
                  <a
                    key={item.key}
                    href={buildHref(item.href)}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`text-right px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isNavItemActive(item)
                        ? 'bg-[#1453D6] text-white'
                        : item.accent
                        ? 'bg-[#FDF1E8] text-[#A84500]'
                        : 'bg-[#F1F3F6] text-[#11161E]'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
                {user?.role === 'admin' && (
                  <a
                    href="https://admin-panel-ams.codenameamir.ir/#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-right px-3 py-2.5 rounded-lg text-xs font-medium bg-[#FDF1E8] text-[#A84500] col-span-2"
                  >
                    پنل مدیریت فروشگاه
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E8EE] text-xs font-medium text-[#4A5464]">
                <a
                  href={buildHref('/tracking')}
                  onClick={(e) => handleLinkClick(e, '/tracking', () => setMobileMenuOpen(false))}
                >
                  رهگیری سفارش
                </a>
                <a
                  href={buildHref('/about')}
                  onClick={(e) => handleLinkClick(e, '/about', () => setMobileMenuOpen(false))}
                >
                  درباره فروشگاه
                </a>
                <a
                  href={buildHref('/contact')}
                  onClick={(e) => handleLinkClick(e, '/contact', () => setMobileMenuOpen(false))}
                >
                  پشتیبانی و تماس
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
