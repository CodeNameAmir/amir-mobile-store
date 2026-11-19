import React, { useEffect, useMemo, useRef, useState } from 'react';
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
              href={buildHref('/contact')}
              onClick={(e) => handleLinkClick(e, '/contact')}
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
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
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
                placeholder="جستجوی هوشمند مدل، برند (مثلاً هواوی، اپل) یا دسته..."
                aria-label="جستجوی محصولات"
                data-testid="navbar-search-input"
                className="w-full h-11 pr-11 pl-10 rounded-xl bg-[#eff4ff] text-sm text-[#0b1c30] placeholder:text-[#434655]/70 border border-transparent focus:border-[#2563eb] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                aria-label="جستجو"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#004ac6] transition-colors"
              >
                <Search className="w-4 h-4" />
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {showRecentPanel && (
              <div
                data-testid="recent-searches-dropdown"
                className="absolute top-12 right-0 left-0 bg-white rounded-2xl border border-[#dce9ff] shadow-xl overflow-hidden z-50 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#434655]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#004ac6]" />
                    تاریخچه جستجوهای اخیر
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={clearRecentSearches}
                      className="text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      پاک کردن همه
                    </button>
                  )}
                </div>

                {recentSearches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q) => (
                      <div
                        key={q}
                        className="inline-flex items-center rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden"
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchValue(q);
                            setSearchFocused(false);
                            navigateToCatalog({ category: 'all', searchQuery: q });
                          }}
                          className="px-3 py-1.5 hover:bg-[#dce9ff] text-xs font-semibold text-[#0b1c30] transition-colors"
                        >
                          {q}
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${q} از تاریخچه`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => removeRecentSearch(q)}
                          className="pl-2 pr-1 py-1.5 text-[#434655] hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#434655]">
                    هنوز عبارتی جستجو نکرده‌اید. پس از اولین جستجو، تاریخچه شما اینجا نمایش داده می‌شود.
                  </p>
                )}

                <div className="pt-2 border-t border-[#eff4ff] space-y-2">
                  <p className="text-[11px] font-bold text-[#434655]">جستجوهای پرطرفدار:</p>
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
                        className="px-2.5 py-1 rounded-lg bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#e5eeff] text-[11px] font-semibold text-[#004ac6] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showSuggestionsPanel && (
              <div
                data-testid="live-search-dropdown"
                className="absolute top-12 right-0 left-0 bg-white rounded-2xl border border-[#dce9ff] shadow-xl overflow-hidden z-50"
              >
                {(suggestions.brands.length > 0 || suggestions.categories.length > 0) && (
                  <div className="p-2.5 bg-[#f8f9ff] border-b border-[#eff4ff] flex flex-wrap gap-2">
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
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#dce9ff] text-[11px] font-bold text-[#004ac6] hover:bg-[#004ac6] hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <Tag className="w-3 h-3" />
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
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#dce9ff] text-[11px] font-bold text-[#0b1c30] hover:border-[#2563eb] inline-flex items-center gap-1 transition-colors"
                      >
                        <Layers className="w-3 h-3 text-[#2563eb]" />
                        دسته {cat.label}
                      </a>
                    ))}
                  </div>
                )}

                {hasSuggestionResults ? (
                  suggestions.products.length > 0 && (
                    <div className="divide-y divide-[#eff4ff]">
                      {suggestions.products.map((item) => (
                        <a
                          key={item.id}
                          href={buildHref(`/product/${item.slug}`)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            addRecentSearch(searchValue.trim() || item.nameFa);
                            handleLinkClick(e, `/product/${item.slug}`, () => setSearchFocused(false));
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
                        </a>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="p-3 text-xs text-[#434655]">
                    پیشنهاد سریع مستقیمی یافت نشد؛ برای جستجوی هوشمند کامل روی دکمه زیر کلیک کنید.
                  </p>
                )}

                {recentSearches.length > 0 && (
                  <div className="px-3 py-2 bg-[#f8f9ff] border-t border-[#eff4ff] flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#434655] inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#004ac6]" />
                      اخیر:
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
                        className="px-2 py-0.5 rounded-md bg-white border border-[#dce9ff] text-[11px] font-semibold text-[#0b1c30] hover:border-[#2563eb]"
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
                  className="w-full py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-xs font-extrabold text-[#004ac6] transition-colors"
                >
                  مشاهده همه نتایج برای «{searchValue}»
                </button>
              </div>
            )}
          </div>

          {/* Left side: External Admin Panel (if admin), Tracking, Account & Cart CTA */}
          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            {user?.role === 'admin' && (
              <a
                href="https://admin-panel-ams.codenameamir.ir/#/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="nav-admin-link"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#ffdbca]/60 hover:bg-[#ffdbca] text-[#8e3c00] text-xs font-bold transition-colors whitespace-nowrap shrink-0"
              >
                <Settings className="w-4 h-4" />
                <span>پنل مدیریت</span>
              </a>
            )}

            <a
              href={buildHref('/tracking')}
              onClick={(e) => handleLinkClick(e, '/tracking')}
              className="hidden xl:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold text-[#434655] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors whitespace-nowrap shrink-0"
            >
              <PackageSearch className="w-4 h-4" />
              پیگیری مرسوله
            </a>

            <a
              href={buildHref('/account')}
              onClick={(e) => handleLinkClick(e, '/account')}
              data-testid="navbar-account-link"
              className="inline-flex items-center gap-2 h-10 px-3 md:px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-[#004ac6]/30"
                />
              ) : (
                <User className="w-4 h-4 text-[#004ac6]" />
              )}
              <span className="hidden sm:inline">{user ? user.fullName : 'حساب کاربری'}</span>
              {user?.username && (
                <span
                  dir="ltr"
                  data-testid="navbar-username-badge"
                  className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-white/80 text-[#004ac6] font-mono text-[11px] font-bold border border-[#dce9ff]"
                >
                  @{user.username}
                </span>
              )}
            </a>

            <a
              href={buildHref('/cart')}
              onClick={(e) => handleLinkClick(e, '/cart')}
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
            </a>
          </div>
        </div>

        {/* Desktop Category Strip */}
        <nav
          aria-label="دسته‌بندی محصولات"
          className="hidden lg:block border-t border-[#eff4ff] bg-white"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-11 flex items-center justify-between gap-4">
            <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {navLinks.map((item) => {
                const active = isNavItemActive(item);
                return (
                  <li key={item.key} className="shrink-0">
                    <a
                      href={buildHref(item.href)}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                        active
                          ? 'bg-[#eff4ff] text-[#004ac6]'
                          : item.accent
                          ? 'text-[#b54e00] hover:bg-[#ffdbca]/40'
                          : 'text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      {item.icon === 'compare' && <Scale className="w-3.5 h-3.5" />}
                      {item.icon === 'installments' && <Calculator className="w-3.5 h-3.5" />}
                      <span>{item.label}</span>
                      {item.icon === 'compare' && compareIds.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-[#004ac6] text-white text-[10px] font-bold tabular-nums-fa">
                          {toPersianDigits(compareIds.length)}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 text-xs font-medium text-[#434655] shrink-0">
              <a
                href={buildHref('/tracking')}
                onClick={(e) => handleLinkClick(e, '/tracking')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                پیگیری سفارش
              </a>
              <a
                href={buildHref('/about')}
                onClick={(e) => handleLinkClick(e, '/about')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                درباره ما
              </a>
              <a
                href={buildHref('/contact')}
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="hover:text-[#004ac6] transition-colors whitespace-nowrap"
              >
                تماس با ما
              </a>
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
                placeholder="جستجوی موبایل، برند یا لوازم جانبی..."
                className="w-full h-10 pr-10 pl-3 rounded-xl bg-[#eff4ff] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
              <Search className="w-4 h-4 text-[#434655] absolute right-3 top-1/2 -translate-y-1/2" />
            </form>

            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#434655]">اخیر:</span>
                {recentSearches.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateToCatalog({ category: 'all', searchQuery: q });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[11px] font-semibold text-[#0b1c30]"
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
                  className={`text-right px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isNavItemActive(item)
                      ? 'bg-[#004ac6] text-white'
                      : item.accent
                      ? 'bg-[#ffdbca]/40 text-[#8e3c00]'
                      : 'bg-[#f8f9ff] text-[#0b1c30]'
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
                  className="text-right px-3 py-2.5 rounded-xl text-xs font-bold bg-[#ffdbca]/60 text-[#8e3c00] col-span-2"
                >
                  پنل مدیریت فروشگاه
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs font-semibold text-[#434655]">
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
          </div>
        )}
      </header>
    </>
  );
};
