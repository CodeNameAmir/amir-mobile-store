import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { DualPriceRangeSlider } from '../components/DualPriceRangeSlider';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, SkeletonBox } from '../components/Skeleton';
import { useStore } from '../context/StoreContext';
import type { BrandId, CategoryId, CategoryItem, SortOption } from '../types/store';
import {
  computeCatalogMaxPrice,
  extractAvailableBrands,
  extractAvailableColors,
  filterAndSortProducts,
  formatToman,
  paginateItems,
  toEnglishDigits,
  toPersianDigits,
} from '../utils/storeLogic';

const STORAGE_CHIPS = ['۱۲۸ گیگابایت', '۲۵۶ گیگابایت', '۵۱۲ گیگابایت'];
const RAM_CHIPS = ['۸ گیگ', '۱۲ گیگ', '۱۶ گیگ'];
const PAGE_SIZE = 6;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'جدیدترین' },
  { id: 'bestselling', label: 'پرفروش‌ترین' },
  { id: 'cheapest', label: 'ارزان‌ترین' },
  { id: 'expensive', label: 'گران‌ترین' },
  { id: 'popular', label: 'محبوب‌ترین' },
];

export const CatalogPage: React.FC = () => {
  const {
    products,
    productsLoading,
    categories,
    brands,
    filters,
    setFilters,
    resetFilters,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    buildHref,
    handleLinkClick,
  } = useStore();
  const [brandSearch, setBrandSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [extraVisibleCount, setExtraVisibleCount] = useState(0);
  const [localSearch, setLocalSearch] = useState(filters.searchQuery || '');

  useEffect(() => {
    setLocalSearch(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Record typed catalog queries into recent search history after user pauses typing
  useEffect(() => {
    const trimmed = localSearch.trim();
    if (trimmed.length < 2) return;
    const timer = window.setTimeout(() => {
      addRecentSearch(trimmed);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [addRecentSearch, localSearch]);

  // Reset pagination whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setExtraVisibleCount(0);
  }, [filters]);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const nestedCategories = useMemo(() => {
    const roots = activeCategories.filter((c) => !c.parentId);
    const childrenByParent = new Map<string, CategoryItem[]>();
    for (const c of activeCategories) {
      if (c.parentId) {
        const list = childrenByParent.get(c.parentId) ?? [];
        list.push(c);
        childrenByParent.set(c.parentId, list);
      }
    }
    const items: Array<{ cat: CategoryItem; depth: number }> = [];
    const appendTree = (cat: CategoryItem, depth: number) => {
      items.push({ cat, depth });
      const kids = childrenByParent.get(cat.id) || childrenByParent.get(cat.slug) || [];
      for (const kid of kids) {
        appendTree(kid, depth + 1);
      }
    };
    for (const root of roots) {
      appendTree(root, 0);
    }
    // Append any orphan categories whose parent wasn't active/found
    const included = new Set(items.map((x) => x.cat.id));
    for (const c of activeCategories) {
      if (!included.has(c.id)) {
        items.push({ cat: c, depth: 0 });
      }
    }
    return items;
  }, [activeCategories]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters, categories),
    [products, filters, categories]
  );

  const effectivePageSize = PAGE_SIZE + extraVisibleCount;
  const paginated = useMemo(
    () => paginateItems(filteredProducts, currentPage, effectivePageSize),
    [filteredProducts, currentPage, effectivePageSize]
  );

  const categoryTitle = useMemo(() => {
    if (filters.category === 'all') return 'همه محصولات فروشگاه امیر';
    if (filters.category === 'offers') return 'پیشنهادات طلایی و تخفیف‌دار';
    return (
      categories.find((c) => c.slug === filters.category || c.id === filters.category)?.label ??
      'فهرست محصولات'
    );
  }, [categories, filters.category]);

  const catalogMaxPrice = useMemo(() => computeCatalogMaxPrice(products), [products]);
  const sliderMinPrice = Math.max(0, Math.min(filters.minPrice || 0, catalogMaxPrice));
  const sliderMaxPrice = Number.isFinite(filters.maxPrice)
    ? Math.max(sliderMinPrice, Math.min(filters.maxPrice, catalogMaxPrice))
    : catalogMaxPrice;
  const isMinPriceFiltered = sliderMinPrice > 0;
  const isMaxPriceFiltered = Number.isFinite(filters.maxPrice) && filters.maxPrice < catalogMaxPrice;
  const isPriceFiltered = isMinPriceFiltered || isMaxPriceFiltered;

  const availableColors = useMemo(() => extractAvailableColors(products), [products]);

  const allBrands = useMemo(() => {
    const names = extractAvailableBrands(products, brands);
    return names.map((name) => {
      const found = brands.find((b) => b.name.toLowerCase() === name.toLowerCase());
      return {
        id: name as BrandId,
        label: found?.labelFa ? `${found.labelFa} (${name})` : name,
      };
    });
  }, [brands, products]);

  const visibleBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter(
      (b) => b.label.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    );
  }, [allBrands, brandSearch]);

  const toggleBrand = (brand: BrandId) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.brands.length > 0 ||
    filters.inStockOnly ||
    filters.discountedOnly ||
    filters.expressOnly ||
    isPriceFiltered ||
    Boolean(filters.storage) ||
    Boolean(filters.ram) ||
    Boolean(filters.colorId) ||
    Boolean(filters.searchQuery.trim());

  const handleCatalogSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      addRecentSearch(localSearch.trim());
    }
    setFilters((p) => ({ ...p, searchQuery: localSearch }));
  };

  const handlePriceInput = (kind: 'min' | 'max', rawVal: string) => {
    const digits = Number(toEnglishDigits(rawVal).replace(/[^\d]/g, ''));
    const safeVal = Number.isFinite(digits) ? Math.max(0, Math.min(digits, catalogMaxPrice)) : 0;
    if (kind === 'min') {
      setFilters((p) => ({
        ...p,
        minPrice: safeVal,
        maxPrice:
          Number.isFinite(p.maxPrice) && p.maxPrice < safeVal ? safeVal : p.maxPrice,
      }));
    } else {
      setFilters((p) => ({
        ...p,
        maxPrice: safeVal === 0 || safeVal >= catalogMaxPrice ? Infinity : Math.max(safeVal, p.minPrice),
      }));
    }
  };

  const filterSidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#004ac6]" />
          <h2 className="text-sm font-extrabold text-[#0b1c30]">فیلترهای تخصصی</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            data-testid="clear-all-filters-sidebar"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#b54e00] hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            پاک کردن همه
          </button>
        )}
      </div>

      {/* Nested Category Selector */}
      <div className="space-y-2 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">دسته‌بندی (تو در تو)</p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-right text-xs font-semibold transition-colors ${
              filters.category === 'all'
                ? 'bg-[#004ac6] text-white'
                : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
            }`}
          >
            همه دسته‌بندی‌ها
          </button>
          {nestedCategories.map(({ cat, depth }) => {
            const active = filters.category === cat.slug || filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilters((p) => ({ ...p, category: cat.slug as CategoryId }))}
                style={{ paddingRight: `${12 + depth * 14}px` }}
                className={`py-1.5 pl-3 rounded-lg text-right text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#004ac6] text-white'
                    : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
                }`}
              >
                {depth > 0 && <span className="opacity-60">↳</span>}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability & Express Toggles */}
      <div className="space-y-3 border-t border-[#eff4ff] pt-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-semibold text-[#0b1c30]">فقط کالاهای موجود</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#004ac6] rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-semibold text-[#0b1c30]">فقط کالاهای تخفیف‌دار</span>
          <input
            type="checkbox"
            checked={filters.discountedOnly}
            onChange={(e) => setFilters((p) => ({ ...p, discountedOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#004ac6] rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-semibold text-[#0b1c30]">ارسال اکسپرس ۳ ساعته</span>
          <input
            type="checkbox"
            checked={filters.expressOnly}
            onChange={(e) => setFilters((p) => ({ ...p, expressOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#004ac6] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Brands */}
      <div className="space-y-3 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">برند سازنده</p>
        <div className="relative">
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="جستجوی برند (مثلاً Huawei)..."
            className="w-full h-9 pr-8 pl-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30] focus:outline-none focus:border-[#2563eb]"
          />
          <Search className="w-3.5 h-3.5 text-[#434655] absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
          {visibleBrands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center justify-between gap-2 cursor-pointer text-xs text-[#0b1c30]"
            >
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 accent-[#004ac6] rounded cursor-pointer"
                />
                {brand.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dual Min / Max Price Range Filter */}
      <div className="space-y-3 border-t border-[#eff4ff] pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0b1c30]">محدوده قیمت (تومان)</p>
          {isPriceFiltered && (
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: Infinity }))}
              className="text-[11px] font-bold text-[#004ac6] hover:underline"
            >
              بازنشانی
            </button>
          )}
        </div>

        <DualPriceRangeSlider
          min={0}
          max={catalogMaxPrice}
          step={1_000_000}
          minValue={sliderMinPrice}
          maxValue={sliderMaxPrice}
          onChange={(nextMin, nextMax) => {
            setFilters((p) => ({
              ...p,
              minPrice: nextMin,
              maxPrice: nextMax >= catalogMaxPrice ? Infinity : nextMax,
            }));
          }}
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label htmlFor="min-price-input" className="text-[10px] font-bold text-[#434655] block mb-1">
              از (تومان)
            </label>
            <input
              id="min-price-input"
              type="text"
              dir="ltr"
              value={sliderMinPrice > 0 ? String(sliderMinPrice) : ''}
              placeholder="0"
              onChange={(e) => handlePriceInput('min', e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#f8f9ff] border border-[#dce9ff] text-[11px] font-bold text-[#0b1c30]"
            />
          </div>
          <div>
            <label htmlFor="max-price-input" className="text-[10px] font-bold text-[#434655] block mb-1">
              تا (تومان)
            </label>
            <input
              id="max-price-input"
              type="text"
              dir="ltr"
              value={isMaxPriceFiltered ? String(sliderMaxPrice) : ''}
              placeholder={String(catalogMaxPrice)}
              onChange={(e) => handlePriceInput('max', e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#f8f9ff] border border-[#dce9ff] text-[11px] font-bold text-[#0b1c30]"
            />
          </div>
        </div>
      </div>

      {/* Storage Capacity */}
      <div className="space-y-2.5 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">ظرفیت حافظه داخلی</p>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_CHIPS.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() =>
                setFilters((p) => ({ ...p, storage: p.storage === cap ? null : cap }))
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filters.storage === cap
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* RAM Capacity */}
      <div className="space-y-2.5 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">حافظه رم (RAM)</p>
        <div className="flex flex-wrap gap-1.5">
          {RAM_CHIPS.map((ram) => (
            <button
              key={ram}
              type="button"
              onClick={() => setFilters((p) => ({ ...p, ram: p.ram === ram ? null : ram }))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filters.ram === ram
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
              }`}
            >
              {ram}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Available Color Swatches */}
      <div className="space-y-2.5 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">رنگ بدنه (رنگ‌های موجود)</p>
        <div className="flex flex-wrap gap-2" data-testid="dynamic-color-filters">
          {productsLoading && availableColors.length === 0 ? (
            <>
              <SkeletonBox className="h-7 w-20 rounded-xl" />
              <SkeletonBox className="h-7 w-24 rounded-xl" />
              <SkeletonBox className="h-7 w-16 rounded-xl" />
            </>
          ) : (
            availableColors.map((c) => {
              const active = filters.colorId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  title={`${c.label} (${toPersianDigits(c.count)} کالا)`}
                  aria-label={c.label}
                  onClick={() =>
                    setFilters((p) => ({ ...p, colorId: p.colorId === c.id ? null : c.id }))
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
                    active
                      ? 'border-[#004ac6] bg-[#eff4ff] text-[#004ac6]'
                      : 'border-[#dce9ff] bg-white text-[#434655] hover:border-[#2563eb]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Breadcrumb + Header */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#434655]">
            <a
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
              className="hover:text-[#004ac6]"
            >
              فروشگاه موبایل امیر
            </a>
            <span>/</span>
            <span className="font-bold text-[#004ac6]">{categoryTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">{categoryTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          {productsLoading ? (
            <SkeletonBox className="h-8 w-24 rounded-xl" />
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold tabular-nums-fa">
              {toPersianDigits(filteredProducts.length)} کالا یافت شد
            </span>
          )}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold"
          >
            <Filter className="w-4 h-4" />
            فیلترها
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-[#e5eeff] p-5 sticky top-32">
          {filterSidebarContent}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden bg-white rounded-2xl border border-[#e5eeff] p-5">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30]"
                aria-label="بستن فیلترها"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {filterSidebarContent}
          </div>
        )}

        {/* Product Results Column */}
        <div className="lg:col-span-9 space-y-5">
          {/* Smart Search + Recent Searches + Sort Bar */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <form onSubmit={handleCatalogSearchSubmit} className="relative flex-1 max-w-md">
                <input
                  type="search"
                  data-testid="catalog-search-input"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setFilters((p) => ({ ...p, searchQuery: e.target.value }));
                  }}
                  placeholder="جستجوی هوشمند مدل یا برند (تحمل غلط املایی: مثلاً ifone یا هواوی)..."
                  className="w-full h-10 pr-9 pl-3 rounded-xl bg-[#eff4ff] text-xs text-[#0b1c30] focus:bg-white border border-transparent focus:border-[#2563eb] focus:outline-none transition-all"
                />
                <Search className="w-4 h-4 text-[#434655] absolute right-3 top-1/2 -translate-y-1/2" />
              </form>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-[#434655] shrink-0">مرتب‌سازی:</span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, sortBy: opt.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      filters.sortBy === opt.id
                        ? 'bg-[#eff4ff] text-[#004ac6]'
                        : 'text-[#434655] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#eff4ff] text-[11px]">
                <span className="font-bold text-[#434655] inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#004ac6]" />
                  جستجوهای اخیر:
                </span>
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center rounded-lg bg-[#f8f9ff] border border-[#e5eeff] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch(item);
                        setFilters((p) => ({ ...p, searchQuery: item }));
                      }}
                      className="px-2.5 py-1 hover:bg-[#eff4ff] font-semibold text-[#0b1c30]"
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف ${item} از تاریخچه`}
                      onClick={() => removeRecentSearch(item)}
                      className="pl-1.5 pr-1 py-1 text-[#434655] hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-rose-600 font-bold hover:underline mr-auto"
                >
                  پاک کردن تاریخچه
                </button>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div
              data-testid="catalog-active-filters"
              className="flex flex-wrap items-center gap-2 px-1"
            >
              <span className="text-[11px] font-bold text-[#434655]">فیلترهای فعال:</span>
              {filters.category !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>{categoryTitle}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>برند: {brand}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
              {filters.inStockOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, inStockOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>فقط موجود</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.discountedOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, discountedOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffdbca]/60 hover:bg-[#ffdbca] text-[#8e3c00] text-xs font-bold transition-colors"
                >
                  <span>دارای تخفیف</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.expressOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, expressOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>ارسال اکسپرس</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {isPriceFiltered && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: Infinity }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold tabular-nums-fa transition-colors"
                >
                  <span>
                    قیمت: {formatToman(sliderMinPrice)} تا {formatToman(sliderMaxPrice)} تومان
                  </span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.storage && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, storage: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>حافظه: {filters.storage}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.ram && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, ram: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>رم: {filters.ram}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.colorId && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, colorId: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>
                    رنگ: {availableColors.find((c) => c.id === filters.colorId)?.label ?? filters.colorId}
                  </span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setFilters((p) => ({ ...p, searchQuery: '' }));
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold transition-colors"
                >
                  <span>عبارت: {filters.searchQuery}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                data-testid="clear-all-filters-btn"
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#b54e00] hover:underline mr-1"
              >
                حذف همه فیلترها
              </button>
            </div>
          )}

          {/* Product Grid + Pagination / Progressive Load More */}
          {productsLoading ? (
            <div
              role="status"
              aria-busy="true"
              aria-label="در حال بارگذاری محصولات از انبار"
              data-testid="catalog-products-skeleton"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5"
            >
              {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : paginated.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {paginated.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {(paginated.totalPages > 1 || paginated.items.length < filteredProducts.length) && (
                <div
                  data-testid="catalog-pagination"
                  className="bg-white rounded-2xl border border-[#e5eeff] p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <p className="text-xs font-bold text-[#434655] tabular-nums-fa">
                    نمایش {toPersianDigits(paginated.items.length)} از {toPersianDigits(filteredProducts.length)} کالا · صفحه{' '}
                    {toPersianDigits(paginated.page)} از {toPersianDigits(paginated.totalPages)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {paginated.page === 1 && paginated.items.length < filteredProducts.length && (
                      <button
                        type="button"
                        data-testid="catalog-load-more-btn"
                        onClick={() => setExtraVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="h-9 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-extrabold transition-colors"
                      >
                        نمایش {toPersianDigits(Math.min(PAGE_SIZE, filteredProducts.length - paginated.items.length))} کالای بیشتر
                      </button>
                    )}

                    {paginated.totalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={paginated.page <= 1}
                          onClick={() => {
                            setCurrentPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 140, behavior: 'smooth' });
                          }}
                          className="h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] disabled:opacity-40 text-xs font-bold text-[#0b1c30]"
                        >
                          قبلی
                        </button>
                        {Array.from({ length: paginated.totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            data-testid={`catalog-page-${pageNum}`}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 140, behavior: 'smooth' });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-extrabold tabular-nums-fa transition-colors ${
                              paginated.page === pageNum
                                ? 'bg-[#004ac6] text-white'
                                : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={paginated.page >= paginated.totalPages}
                          onClick={() => {
                            setCurrentPage((p) => Math.min(paginated.totalPages, p + 1));
                            window.scrollTo({ top: 140, behavior: 'smooth' });
                          }}
                          className="h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] disabled:opacity-40 text-xs font-bold text-[#0b1c30]"
                        >
                          بعدی
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-[#e5eeff] p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-extrabold text-[#0b1c30]">
                کالایی با این فیلترها پیدا نشد
              </h2>
              <p className="text-xs sm:text-sm text-[#434655] max-w-md mx-auto">
                می‌توانید برخی از فیلترها مانند بازه قیمت یا حافظه داخلی را بازنشانی کنید تا تمام کالاهای مشابه نمایش داده شوند.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بازنشانی تمام فیلترها</span>
              </button>
            </div>
          )}

          {/* Category Buying Guide FAQ */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-extrabold text-[#0b1c30]">
              پرسش‌های متداول پیش از خرید از فروشگاه موبایل امیر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f8f9ff] space-y-1.5">
                <p className="text-xs font-bold text-[#0b1c30] flex items-center justify-between">
                  آیا تمام گوشی‌ها با کد رجیستری همتا ارسال می‌شوند؟
                  <ChevronDown className="w-4 h-4 text-[#004ac6]" />
                </p>
                <p className="text-xs text-[#434655] leading-6">
                  بله؛ تمامی گوشی‌های هوشمند فروشگاه با پلمپ کارخانه و کد رجیستری رسمی سامانه همتا عرضه می‌شوند و هنگام تحویل به نام خریدار فعال می‌گردد.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#f8f9ff] space-y-1.5">
                <p className="text-xs font-bold text-[#0b1c30] flex items-center justify-between">
                  تفاوت گارانتی ۱۸ ماهه امیر سرویس چیست؟
                  <ChevronDown className="w-4 h-4 text-[#004ac6]" />
                </p>
                <p className="text-xs text-[#434655] leading-6">
                  شامل ۷ روز ضمانت تعویض بی‌قید و شرط در صورت مغایرت فنی، پوشش قطعات اصلی و ارائه گوشی جایگزین در زمان تعمیرات تخصصی است.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
