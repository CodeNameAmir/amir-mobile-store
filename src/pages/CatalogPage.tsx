import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { CATEGORY_ITEMS } from '../data/catalog';
import type { BrandId, CategoryId, SortOption } from '../types/store';
import { filterAndSortProducts, formatToman, toPersianDigits } from '../utils/storeLogic';

const ALL_BRANDS: { id: BrandId; label: string }[] = [
  { id: 'Apple', label: 'اپل (Apple)' },
  { id: 'Samsung', label: 'سامسونگ (Samsung)' },
  { id: 'Xiaomi', label: 'شیائومی (Xiaomi)' },
  { id: 'Anker', label: 'انکر (Anker)' },
];

const STORAGE_CHIPS = ['۱۲۸ گیگابایت', '۲۵۶ گیگابایت', '۵۱۲ گیگابایت'];
const RAM_CHIPS = ['۸ گیگ', '۱۲ گیگ', '۱۶ گیگ'];
const COLOR_OPTIONS = [
  { id: 'midnight', label: 'مشکی / سرمه‌ای', hex: '#1e293b' },
  { id: 'silver', label: 'سفید / نقره‌ای', hex: '#e2e8f0' },
  { id: 'titanium', label: 'تیتانیوم طبیعی', hex: '#9c9589' },
  { id: 'desert', label: 'کویری / طلایی', hex: '#C5B4A0' },
  { id: 'purple', label: 'یاسی / بنفش', hex: '#a855f7' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'جدیدترین' },
  { id: 'bestselling', label: 'پرفروش‌ترین' },
  { id: 'cheapest', label: 'ارزان‌ترین' },
  { id: 'expensive', label: 'گران‌ترین' },
  { id: 'popular', label: 'محبوب‌ترین' },
];

export const CatalogPage: React.FC = () => {
  const { products, filters, setFilters, resetFilters, navigate } = useStore();
  const [brandSearch, setBrandSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  const categoryTitle = useMemo(() => {
    if (filters.category === 'all') return 'همه محصولات فروشگاه امیر';
    if (filters.category === 'offers') return 'پیشنهادات طلایی و تخفیف‌دار';
    return CATEGORY_ITEMS.find((c) => c.id === filters.category)?.label ?? 'فهرست محصولات';
  }, [filters.category]);

  const visibleBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return ALL_BRANDS;
    return ALL_BRANDS.filter(
      (b) => b.label.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    );
  }, [brandSearch]);

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
    filters.maxPrice < 150_000_000 ||
    Boolean(filters.storage) ||
    Boolean(filters.ram) ||
    Boolean(filters.colorId) ||
    Boolean(filters.searchQuery.trim());

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
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#b54e00] hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            پاک کردن همه
          </button>
        )}
      </div>

      {/* Category quick selector */}
      <div className="space-y-2 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">دسته‌بندی</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filters.category === 'all'
                ? 'bg-[#004ac6] text-white'
                : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
            }`}
          >
            همه
          </button>
          {CATEGORY_ITEMS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilters((p) => ({ ...p, category: cat.id as CategoryId }))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filters.category === cat.id
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]'
              }`}
            >
              {cat.label}
            </button>
          ))}
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
            placeholder="جستجوی برند..."
            className="w-full h-9 pr-8 pl-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30] focus:outline-none focus:border-[#2563eb]"
          />
          <Search className="w-3.5 h-3.5 text-[#434655] absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
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

      {/* Max Price Slider */}
      <div className="space-y-3 border-t border-[#eff4ff] pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0b1c30]">سقف قیمت</p>
          <span className="text-xs font-extrabold text-[#004ac6] tabular-nums-fa">
            تا {formatToman(filters.maxPrice)} تومان
          </span>
        </div>
        <input
          type="range"
          min={3_000_000}
          max={150_000_000}
          step={1_000_000}
          value={filters.maxPrice}
          onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
          aria-label="حداکثر قیمت به تومان"
          className="w-full accent-[#004ac6] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#434655] tabular-nums-fa">
          <span>۳ میلیون</span>
          <span>۱۵۰ میلیون</span>
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

      {/* Color Swatches */}
      <div className="space-y-2.5 border-t border-[#eff4ff] pt-4">
        <p className="text-xs font-bold text-[#0b1c30]">رنگ بدنه</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => {
            const active = filters.colorId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                title={c.label}
                aria-label={c.label}
                onClick={() =>
                  setFilters((p) => ({ ...p, colorId: p.colorId === c.id ? null : c.id }))
                }
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  active ? 'border-[#004ac6] scale-110 ring-2 ring-[#2563eb]/30' : 'border-[#dce9ff]'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
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
            <button type="button" onClick={() => navigate('/')} className="hover:text-[#004ac6]">
              فروشگاه موبایل امیر
            </button>
            <span>/</span>
            <span className="font-bold text-[#004ac6]">{categoryTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">{categoryTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-2 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold tabular-nums-fa">
            {toPersianDigits(filteredProducts.length)} کالا یافت شد
          </span>
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
          {/* Search + Sort Bar */}
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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

            {filters.searchQuery.trim() && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] text-xs font-bold text-[#004ac6] shrink-0">
                <span>جستجو: «{filters.searchQuery}»</span>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                  aria-label="حذف عبارت جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
