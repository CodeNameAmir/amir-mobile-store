import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { hydrateProduct } from '../data/catalog';
import { storeApi } from '../lib/authApi';
import type {
  AttributeDefinition,
  BrandId,
  CategoryId,
  CategoryItem,
  Product,
  SortOption,
} from '../types/store';
import { UI_EASE } from '../utils/motionHelpers';
import {
  computeCatalogMaxPrice,
  extractAvailableBrands,
  extractAvailableColors,
  extractAvailableRamOptions,
  extractAvailableStorageOptions,
  filterAndSortProducts,
  formatToman,
  paginateItems,
  toEnglishDigits,
  toPersianDigits,
} from '../utils/storeLogic';

const PAGE_SIZE = 6;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'جدیدترین' },
  { id: 'bestselling', label: 'پرفروش‌ترین' },
  { id: 'cheapest', label: 'ارزان‌ترین' },
  { id: 'expensive', label: 'گران‌ترین' },
  { id: 'popular', label: 'محبوب‌ترین' },
  { id: 'biggest_discount', label: 'بیشترین تخفیف' },
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
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);
  const [dynamicAttributes, setDynamicAttributes] = useState<AttributeDefinition[]>([]);
  const [serverPageState, setServerPageState] = useState<{
    items: Product[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    ready: boolean;
    failed: boolean;
  }>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: true,
    ready: false,
    failed: false,
  });

  useEffect(() => {
    setLocalSearch(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Fetch dynamic EAV attributes for active category
  useEffect(() => {
    let active = true;
    const catParam =
      filters.category !== 'all' && filters.category !== 'offers' ? filters.category : undefined;
    storeApi
      .getAttributes(catParam)
      .then((attrs) => {
        if (!active) return;
        setDynamicAttributes(attrs.filter((a) => a.isFilterable));
      })
      .catch(() => {
        if (!active) return;
        setDynamicAttributes([]);
      });
    return () => {
      active = false;
    };
  }, [filters.category]);

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

  // Server-side catalog query with pagination & dynamic filters
  useEffect(() => {
    let active = true;
    const requestPage = currentPage === 1 && extraVisibleCount > 0 ? 1 : currentPage;
    const requestLimit =
      currentPage === 1 && extraVisibleCount > 0 ? PAGE_SIZE + extraVisibleCount : PAGE_SIZE;

    setServerPageState((prev) => ({ ...prev, loading: true, failed: false }));

    const timer = window.setTimeout(() => {
      storeApi
        .getProductsPaginated({
          category: filters.category !== 'all' ? filters.category : undefined,
          q: filters.searchQuery.trim() || undefined,
          brand: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
          inStock: filters.inStockOnly || undefined,
          discounted: filters.discountedOnly || undefined,
          express: filters.expressOnly || undefined,
          minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
          maxPrice: Number.isFinite(filters.maxPrice) ? filters.maxPrice : undefined,
          storage: filters.storage || undefined,
          ram: filters.ram || undefined,
          colorId: filters.colorId || undefined,
          attributeFilters: filters.attributeFilters,
          sort: filters.sortBy,
          page: requestPage,
          limit: requestLimit,
        })
        .then((res) => {
          if (!active) return;
          setServerPageState({
            items: res.products.map(hydrateProduct),
            total: res.total,
            page: res.page,
            totalPages: res.totalPages,
            loading: false,
            ready: true,
            failed: false,
          });
        })
        .catch(() => {
          if (!active) return;
          setServerPageState((prev) => ({
            ...prev,
            loading: false,
            failed: true,
          }));
        });
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    currentPage,
    extraVisibleCount,
    filters.attributeFilters,
    filters.brands,
    filters.category,
    filters.colorId,
    filters.discountedOnly,
    filters.expressOnly,
    filters.inStockOnly,
    filters.maxPrice,
    filters.minPrice,
    filters.ram,
    filters.searchQuery,
    filters.sortBy,
    filters.storage,
  ]);

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
    const included = new Set(items.map((x) => x.cat.id));
    for (const c of activeCategories) {
      if (!included.has(c.id)) {
        items.push({ cat: c, depth: 0 });
      }
    }
    return items;
  }, [activeCategories]);

  const fallbackFilteredProducts = useMemo(
    () => filterAndSortProducts(products, filters, categories),
    [products, filters, categories]
  );

  const effectivePageSize = PAGE_SIZE + extraVisibleCount;
  const fallbackPaginated = useMemo(
    () => paginateItems(fallbackFilteredProducts, currentPage, effectivePageSize),
    [fallbackFilteredProducts, currentPage, effectivePageSize]
  );

  const useServerPagination = serverPageState.ready && !serverPageState.failed;
  const displayItems = useServerPagination ? serverPageState.items : fallbackPaginated.items;
  const totalMatchingCount = useServerPagination
    ? serverPageState.total
    : fallbackPaginated.totalItems;
  const activePageNumber = useServerPagination ? serverPageState.page : fallbackPaginated.page;
  const activeTotalPages = useServerPagination
    ? serverPageState.totalPages
    : fallbackPaginated.totalPages;
  const gridLoading =
    (productsLoading && !serverPageState.ready) ||
    (serverPageState.loading && displayItems.length === 0);

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
  const availableStorageChips = useMemo(
    () => extractAvailableStorageOptions(products),
    [products]
  );
  const availableRamChips = useMemo(() => extractAvailableRamOptions(products), [products]);

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

  const activeAttributeEntries = useMemo(
    () =>
      Object.entries(filters.attributeFilters || {}).filter(
        ([, v]) => typeof v === 'string' && v.trim().length > 0
      ),
    [filters.attributeFilters]
  );

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
    activeAttributeEntries.length > 0 ||
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
          <SlidersHorizontal className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-[#11161E]">فیلترهای تخصصی</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            data-testid="clear-all-filters-sidebar"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#A84500] hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            پاک کردن همه
          </button>
        )}
      </div>

      {/* Nested Category Selector */}
      <div className="space-y-2 border-t border-[#E4E8EE] pt-4">
        <p className="text-xs font-semibold text-[#11161E]">دسته‌بندی (تو در تو)</p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-right text-xs font-medium transition-colors ${
              filters.category === 'all'
                ? 'bg-[#1453D6] text-white'
                : 'bg-[#F7F8FA] text-[#4A5464] hover:bg-[#F1F3F6] hover:text-[#11161E]'
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
                className={`py-1.5 pl-3 rounded-lg text-right text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1453D6] text-white'
                    : 'bg-[#F7F8FA] text-[#4A5464] hover:bg-[#F1F3F6] hover:text-[#11161E]'
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
      <div className="space-y-3 border-t border-[#E4E8EE] pt-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-medium text-[#11161E]">فقط کالاهای موجود</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#1453D6] rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-medium text-[#11161E]">فقط کالاهای تخفیف‌دار</span>
          <input
            type="checkbox"
            checked={filters.discountedOnly}
            onChange={(e) => setFilters((p) => ({ ...p, discountedOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#1453D6] rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-medium text-[#11161E]">ارسال اکسپرس ۳ ساعته</span>
          <input
            type="checkbox"
            checked={filters.expressOnly}
            onChange={(e) => setFilters((p) => ({ ...p, expressOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#1453D6] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Brands */}
      <div className="space-y-3 border-t border-[#E4E8EE] pt-4">
        <p className="text-xs font-semibold text-[#11161E]">برند سازنده</p>
        <div className="relative">
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="جستجوی برند (مثلاً Huawei)"
            className="w-full h-9 pr-8 pl-3 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-xs text-[#11161E] placeholder:text-[#6E7889] focus:bg-white focus:outline-none focus:border-[#1453D6]"
          />
          <Search className="w-3.5 h-3.5 text-[#6E7889] absolute right-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
          {visibleBrands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center justify-between gap-2 cursor-pointer text-xs text-[#11161E]"
            >
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 accent-[#1453D6] rounded cursor-pointer"
                />
                {brand.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dual Min / Max Price Range Filter */}
      <div className="space-y-3 border-t border-[#E4E8EE] pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#11161E]">محدوده قیمت (تومان)</p>
          {isPriceFiltered && (
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: Infinity }))}
              className="text-[11px] font-medium text-[#1453D6] hover:underline"
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
            <label htmlFor="min-price-input" className="text-[11px] font-medium text-[#4A5464] block mb-1">
              از (تومان)
            </label>
            <input
              id="min-price-input"
              type="text"
              dir="ltr"
              value={sliderMinPrice > 0 ? String(sliderMinPrice) : ''}
              placeholder="0"
              onChange={(e) => handlePriceInput('min', e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-[11px] font-mono font-medium text-[#11161E] focus:bg-white focus:border-[#1453D6] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="max-price-input" className="text-[11px] font-medium text-[#4A5464] block mb-1">
              تا (تومان)
            </label>
            <input
              id="max-price-input"
              type="text"
              dir="ltr"
              value={isMaxPriceFiltered ? String(sliderMaxPrice) : ''}
              placeholder={String(catalogMaxPrice)}
              onChange={(e) => handlePriceInput('max', e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-[11px] font-mono font-medium text-[#11161E] focus:bg-white focus:border-[#1453D6] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Storage Capacity */}
      {availableStorageChips.length > 0 && (
        <div className="space-y-2.5 border-t border-[#E4E8EE] pt-4" data-testid="dynamic-storage-filters">
          <p className="text-xs font-semibold text-[#11161E]">ظرفیت حافظه داخلی</p>
          <div className="flex flex-wrap gap-1.5">
            {availableStorageChips.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() =>
                  setFilters((p) => ({ ...p, storage: p.storage === cap ? null : cap }))
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.storage === cap
                    ? 'bg-[#1453D6] text-white'
                    : 'bg-[#F1F3F6] text-[#4A5464] hover:bg-[#EAECEF] hover:text-[#11161E]'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic RAM Capacity */}
      {availableRamChips.length > 0 && (
        <div className="space-y-2.5 border-t border-[#E4E8EE] pt-4" data-testid="dynamic-ram-filters">
          <p className="text-xs font-semibold text-[#11161E]">حافظه رم (RAM)</p>
          <div className="flex flex-wrap gap-1.5">
            {availableRamChips.map((ram) => (
              <button
                key={ram}
                type="button"
                onClick={() => setFilters((p) => ({ ...p, ram: p.ram === ram ? null : ram }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.ram === ram
                    ? 'bg-[#1453D6] text-white'
                    : 'bg-[#F1F3F6] text-[#4A5464] hover:bg-[#EAECEF] hover:text-[#11161E]'
                }`}
              >
                {ram}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Available Color Swatches */}
      <div className="space-y-2.5 border-t border-[#E4E8EE] pt-4">
        <p className="text-xs font-semibold text-[#11161E]">رنگ بدنه</p>
        <div className="flex flex-wrap gap-2" data-testid="dynamic-color-filters">
          {productsLoading && availableColors.length === 0 ? (
            <>
              <SkeletonBox className="h-7 w-20 rounded-lg" />
              <SkeletonBox className="h-7 w-24 rounded-lg" />
              <SkeletonBox className="h-7 w-16 rounded-lg" />
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-[#1453D6] bg-[#EEF3FC] text-[#1453D6]'
                      : 'border-[#E4E8EE] bg-white text-[#4A5464] hover:border-[#C5CEDB]'
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

      {/* Dynamic Attribute Filters (EAV) */}
      {dynamicAttributes.length > 0 && (
        <div className="space-y-3 border-t border-[#E4E8EE] pt-4" data-testid="dynamic-attribute-filters">
          <p className="text-xs font-semibold text-[#11161E]">ویژگی‌های فنی</p>
          <div className="space-y-2.5">
            {dynamicAttributes.map((attr) => {
              const currentVal = filters.attributeFilters?.[attr.code] || '';
              if (attr.dataType === 'boolean') {
                const isChecked = currentVal === 'true';
                return (
                  <label
                    key={attr.id}
                    className="flex items-center justify-between gap-2 cursor-pointer text-xs text-[#11161E]"
                  >
                    <span>{attr.nameFa}</span>
                    <input
                      type="checkbox"
                      data-testid={`attr-filter-${attr.code}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const nextChecked = e.target.checked;
                        setFilters((prev) => {
                          const nextAttrs = { ...(prev.attributeFilters || {}) };
                          if (nextChecked) {
                            nextAttrs[attr.code] = 'true';
                          } else {
                            delete nextAttrs[attr.code];
                          }
                          return { ...prev, attributeFilters: nextAttrs };
                        });
                      }}
                      className="w-4 h-4 accent-[#1453D6] rounded cursor-pointer"
                    />
                  </label>
                );
              }
              return (
                <div key={attr.id} className="space-y-1">
                  <label
                    htmlFor={`attr-input-${attr.code}`}
                    className="text-[11px] font-medium text-[#4A5464] flex items-center justify-between"
                  >
                    <span>{attr.nameFa}</span>
                    {attr.unit && <span className="text-[10px] text-[#6E7889]">{attr.unit}</span>}
                  </label>
                  <input
                    id={`attr-input-${attr.code}`}
                    data-testid={`attr-filter-${attr.code}`}
                    type="text"
                    value={currentVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((prev) => {
                        const nextAttrs = { ...(prev.attributeFilters || {}) };
                        if (val.trim()) {
                          nextAttrs[attr.code] = val;
                        } else {
                          delete nextAttrs[attr.code];
                        }
                        return { ...prev, attributeFilters: nextAttrs };
                      });
                    }}
                    placeholder={attr.unit ? `مثلاً ${attr.unit}` : 'فیلتر مقدار...'}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#F1F3F6] border border-[#E4E8EE] text-[11px] text-[#11161E] placeholder:text-[#6E7889] focus:bg-white focus:border-[#1453D6] focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Breadcrumb + Header */}
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#6E7889]">
            <a
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
              className="hover:text-[#11161E]"
            >
              فروشگاه موبایل امیر
            </a>
            <span>/</span>
            <span className="font-medium text-[#1453D6]">{categoryTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">{categoryTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          {gridLoading ? (
            <SkeletonBox className="h-8 w-24 rounded-lg" />
          ) : (
            <span
              data-testid="catalog-total-count"
              className="px-3.5 py-2 rounded-lg bg-[#F1F3F6] text-[#11161E] text-xs font-medium tabular-nums-fa"
            >
              {toPersianDigits(totalMatchingCount)} کالا یافت شد
            </span>
          )}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1453D6] text-white text-xs font-medium"
          >
            <Filter className="w-4 h-4" strokeWidth={1.5} />
            فیلترها
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-[#E4E8EE] p-5 sticky top-32">
          {filterSidebarContent}
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: UI_EASE }}
              className="lg:hidden bg-white rounded-2xl border border-[#E4E8EE] p-5"
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg bg-[#F1F3F6] text-[#11161E]"
                  aria-label="بستن فیلترها"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              {filterSidebarContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Results Column */}
        <div className="lg:col-span-9 space-y-5">
          {/* Smart Search + Recent Searches + Sort Bar */}
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-4 space-y-3">
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
                  placeholder="جستجوی مدل یا برند در فهرست"
                  className="w-full h-10 pr-9 pl-3 rounded-lg bg-[#F1F3F6] text-xs text-[#11161E] placeholder:text-[#6E7889] focus:bg-white border border-transparent focus:border-[#1453D6] focus:outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-[#6E7889] absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-medium text-[#4A5464] shrink-0">مرتب‌سازی</span>
                {SORT_OPTIONS.map((opt) => {
                  const active = filters.sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFilters((p) => ({ ...p, sortBy: opt.id }))}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'text-[#1453D6]'
                          : 'text-[#4A5464] hover:bg-[#F1F3F6] hover:text-[#11161E]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="catalog-sort-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-lg bg-[#EEF3FC]"
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E8EE] text-[11px]">
                <span className="font-medium text-[#4A5464] inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6E7889]" strokeWidth={1.5} />
                  جستجوهای اخیر
                </span>
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch(item);
                        setFilters((p) => ({ ...p, searchQuery: item }));
                      }}
                      className="px-2.5 py-1 hover:bg-[#EAECEF] font-medium text-[#11161E]"
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف ${item} از تاریخچه`}
                      onClick={() => removeRecentSearch(item)}
                      className="pl-1.5 pr-1 py-1 text-[#6E7889] hover:text-[#B42318]"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[#B42318] font-medium hover:underline mr-auto"
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
              <span className="text-[11px] font-medium text-[#4A5464]">فیلترهای فعال</span>
              {filters.category !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>{categoryTitle}</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>برند: {brand}</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              ))}
              {filters.inStockOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, inStockOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>فقط موجود</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.discountedOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, discountedOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FDF1E8] hover:bg-[#FAE3D1] text-[#A84500] text-xs font-medium transition-colors"
                >
                  <span>دارای تخفیف</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.expressOnly && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, expressOnly: false }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>ارسال اکسپرس</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {isPriceFiltered && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: Infinity }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium tabular-nums-fa transition-colors"
                >
                  <span>
                    قیمت: {formatToman(sliderMinPrice)} تا {formatToman(sliderMaxPrice)} تومان
                  </span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.storage && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, storage: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>حافظه: {filters.storage}</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.ram && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, ram: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>رم: {filters.ram}</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.colorId && (
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, colorId: null }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>
                    رنگ: {availableColors.find((c) => c.id === filters.colorId)?.label ?? filters.colorId}
                  </span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {filters.searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setFilters((p) => ({ ...p, searchQuery: '' }));
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                >
                  <span>عبارت: {filters.searchQuery}</span>
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {activeAttributeEntries.map(([code, val]) => {
                const attrDef = dynamicAttributes.find((a) => a.code === code);
                const label = attrDef?.nameFa || code;
                const displayVal = val === 'true' ? 'دارد' : val;
                return (
                  <button
                    key={`attr-pill-${code}`}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => {
                        const nextAttrs = { ...(prev.attributeFilters || {}) };
                        delete nextAttrs[code];
                        return { ...prev, attributeFilters: nextAttrs };
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium transition-colors"
                  >
                    <span>
                      {label}: {displayVal}
                    </span>
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                );
              })}
              <button
                type="button"
                data-testid="clear-all-filters-btn"
                onClick={resetFilters}
                className="text-[11px] font-medium text-[#A84500] hover:underline mr-1"
              >
                حذف همه فیلترها
              </button>
            </div>
          )}

          {/* Product Grid + Pagination */}
          {gridLoading ? (
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
          ) : displayItems.length > 0 ? (
            <>
              <div
                data-testid="catalog-products-grid"
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 transition-opacity ${
                  serverPageState.loading ? 'opacity-65' : 'opacity-100'
                }`}
              >
                {displayItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {(activeTotalPages > 1 || displayItems.length < totalMatchingCount) && (
                <div
                  data-testid="catalog-pagination"
                  className="bg-white rounded-xl border border-[#E4E8EE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <p className="text-xs font-medium text-[#4A5464] tabular-nums-fa">
                    نمایش {toPersianDigits(displayItems.length)} از {toPersianDigits(totalMatchingCount)} کالا · صفحه{' '}
                    {toPersianDigits(activePageNumber)} از {toPersianDigits(activeTotalPages)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {activePageNumber === 1 && displayItems.length < totalMatchingCount && (
                      <button
                        type="button"
                        data-testid="catalog-load-more-btn"
                        onClick={() => setExtraVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="h-9 px-4 rounded-lg bg-[#EEF3FC] hover:bg-[#1453D6] text-[#1453D6] hover:text-white text-xs font-semibold transition-colors"
                      >
                        نمایش {toPersianDigits(Math.min(PAGE_SIZE, totalMatchingCount - displayItems.length))} کالای بیشتر
                      </button>
                    )}

                    {activeTotalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={activePageNumber <= 1}
                          onClick={() => {
                            setExtraVisibleCount(0);
                            setCurrentPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 140, behavior: 'smooth' });
                          }}
                          className="h-9 px-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] disabled:opacity-40 text-xs font-medium text-[#11161E]"
                        >
                          قبلی
                        </button>
                        {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            data-testid={`catalog-page-${pageNum}`}
                            onClick={() => {
                              setExtraVisibleCount(0);
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 140, behavior: 'smooth' });
                            }}
                            className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums-fa transition-colors ${
                              activePageNumber === pageNum
                                ? 'bg-[#1453D6] text-white'
                                : 'bg-[#F7F8FA] text-[#4A5464] hover:bg-[#F1F3F6]'
                            }`}
                          >
                            {toPersianDigits(pageNum)}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={activePageNumber >= activeTotalPages}
                          onClick={() => {
                            setExtraVisibleCount(0);
                            setCurrentPage((p) => Math.min(activeTotalPages, p + 1));
                            window.scrollTo({ top: 140, behavior: 'smooth' });
                          }}
                          className="h-9 px-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] disabled:opacity-40 text-xs font-medium text-[#11161E]"
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
            <div className="bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-[#11161E]">
                کالایی با این فیلترها پیدا نشد
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5464] max-w-md mx-auto">
                می‌توانید برخی از فیلترها مانند بازه قیمت یا حافظه داخلی را بازنشانی کنید تا تمام کالاهای مشابه نمایش داده شوند.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                <span>بازنشانی تمام فیلترها</span>
              </button>
            </div>
          )}

          {/* Category Buying Guide FAQ */}
          <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#11161E]">
              پرسش‌های متداول پیش از خرید از فروشگاه موبایل امیر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {[
                {
                  q: 'آیا تمام گوشی‌ها با کد رجیستری همتا ارسال می‌شوند؟',
                  a: 'بله؛ تمامی گوشی‌های هوشمند فروشگاه با پلمپ کارخانه و کد رجیستری رسمی سامانه همتا عرضه می‌شوند و هنگام تحویل به نام خریدار فعال می‌گردد.',
                },
                {
                  q: 'تفاوت گارانتی ۱۸ ماهه امیر سرویس چیست؟',
                  a: 'شامل ۷ روز ضمانت تعویض بی‌قید و شرط در صورت مغایرت فنی، پوشش قطعات اصلی و ارائه گوشی جایگزین در زمان تعمیرات تخصصی است.',
                },
              ].map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaqIndices((prev) =>
                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                        )
                      }
                      className="w-full p-4 text-xs font-semibold text-[#11161E] flex items-center justify-between gap-3 text-right hover:bg-[#F1F3F6]/70 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: UI_EASE }}
                        className="shrink-0 text-[#6E7889]"
                      >
                        <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
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
                          <p className="px-4 pb-4 text-xs text-[#4A5464] leading-6">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
