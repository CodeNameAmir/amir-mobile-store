import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Scale,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { ComparePageSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

interface CompareRow {
  key: string;
  label: string;
  render: (p: Product) => string;
}

const CORE_COMPARE_ROWS: CompareRow[] = [
  { key: 'brand', label: 'برند سازنده', render: (p) => p.brand },
  {
    key: 'price',
    label: 'قیمت نقدی',
    render: (p) => (p.inStock ? `${formatToman(p.price)} تومان` : 'ناموجود'),
  },
  { key: 'display', label: 'صفحه‌نمایش', render: (p) => `${p.specs.display} (${p.specs.displayDetails})` },
  { key: 'chipset', label: 'تراشه و پردازنده', render: (p) => `${p.specs.chipset} (${p.specs.chipsetDetails})` },
  { key: 'camera', label: 'دوربین / سنسور', render: (p) => `${p.specs.camera} · ${p.specs.cameraDetails}` },
  { key: 'battery', label: 'باتری و شارژ', render: (p) => `${p.specs.battery} · ${p.specs.batteryDetails}` },
  { key: 'ram', label: 'حافظه رم (RAM)', render: (p) => p.specs.ram },
  { key: 'storage', label: 'حافظه پایه', render: (p) => p.specs.storageDefault },
  { key: 'os', label: 'سیستم‌عامل', render: (p) => p.specs.os },
  { key: 'warranty', label: 'گارانتی و خدمات', render: (p) => p.warranty },
];

export const ComparePage: React.FC = () => {
  const {
    products,
    productsLoading,
    compareIds,
    toggleCompare,
    clearCompare,
    addToCart,
    buildHref,
    handleLinkClick,
  } = useStore();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const selectedProducts = useMemo(
    () => products.filter((p) => compareIds.includes(p.id)),
    [products, compareIds]
  );

  const availableToAdd = useMemo(
    () => products.filter((p) => !compareIds.includes(p.id) && p.inStock),
    [products, compareIds]
  );

  const allRows = useMemo(() => {
    const customLabels: string[] = [];
    const seen = new Set<string>();
    for (const p of selectedProducts) {
      for (const spec of p.customSpecs || []) {
        const lbl = spec.label.trim();
        if (lbl && !seen.has(lbl)) {
          seen.add(lbl);
          customLabels.push(lbl);
        }
      }
    }
    const customRows: CompareRow[] = customLabels.map((lbl, idx) => ({
      key: `custom-${idx}-${lbl}`,
      label: lbl,
      render: (p) => p.customSpecs?.find((s) => s.label.trim() === lbl)?.value || '—',
    }));
    return [...CORE_COMPARE_ROWS, ...customRows];
  }, [selectedProducts]);

  const visibleRows = useMemo(() => {
    if (!onlyDifferences || selectedProducts.length < 2) return allRows;
    return allRows.filter((row) => {
      const values = selectedProducts.map((p) => row.render(p));
      return new Set(values).size > 1;
    });
  }, [allRows, onlyDifferences, selectedProducts]);

  if (productsLoading) {
    return <ComparePageSkeleton />;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
            <Scale className="w-4 h-4" strokeWidth={1.5} />
            <span>مقایسه تخصصی مشخصات فنی</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
            مقایسه کنار هم محصولات ({toPersianDigits(selectedProducts.length)} از ۳)
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5464]">
            مشخصات نمایشگر، تراشه، دوربین، باتری، مشخصات ویژه و قیمت گوشی‌ها را به‌صورت دقیق مقایسه کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedProducts.length >= 2 && (
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs font-medium text-[#11161E] cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className="w-4 h-4 accent-[#1453D6]"
              />
              <span>فقط نمایش تفاوت‌ها</span>
            </label>
          )}
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="h-10 px-4 rounded-lg bg-[#FEF3F2] hover:bg-[#FEE4E2] text-[#B42318] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              <span>پاک کردن لیست</span>
            </button>
          )}
        </div>
      </div>

      {/* Add product selector if slots remain */}
      {selectedProducts.length < 3 && (
        <div className="bg-[#F1F3F6] rounded-xl border border-[#E4E8EE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#11161E] inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#4A5464]" strokeWidth={1.5} />
            افزودن محصول برای مقایسه ({toPersianDigits(3 - selectedProducts.length)} جایگاه خالی)
          </span>
          <select
            aria-label="افزودن محصول به مقایسه"
            value=""
            onChange={(e) => {
              if (e.target.value) toggleCompare(e.target.value);
            }}
            className="h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#11161E] sm:w-80 focus:outline-none focus:border-[#1453D6]"
          >
            <option value="">انتخاب یک گوشی یا گجت</option>
            {availableToAdd.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameFa} — {formatToman(p.price)} تومان
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-[#F1F3F6] text-[#4A5464] flex items-center justify-center mx-auto">
            <Scale className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-[#11161E]">هنوز محصولی برای مقایسه انتخاب نشده است</h2>
          <p className="text-xs sm:text-sm text-[#4A5464] max-w-md mx-auto">
            از منوی بالا محصولات مورد نظر خود را انتخاب کنید یا در صفحه فروشگاه روی دکمه مقایسه کلیک نمایید.
          </p>
          <a
            href={buildHref('/catalog')}
            onClick={(e) => handleLinkClick(e, '/catalog')}
            className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <span>مشاهده محصولات فروشگاه</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E4E8EE] bg-[#F7F8FA]">
                  <th className="w-44 p-5 text-xs font-semibold text-[#4A5464] align-top">
                    مشخصات فنی
                  </th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="p-5 align-top min-w-[210px]">
                      <div className="bg-white rounded-xl border border-[#E4E8EE] p-4 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => toggleCompare(product.id)}
                          aria-label={`حذف ${product.nameFa}`}
                          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-[#F1F3F6] hover:bg-[#FEF3F2] text-[#4A5464] hover:text-[#B42318] flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <div className="aspect-[4/3] rounded-lg bg-[#F3F5F8] overflow-hidden">
                          <SmartImage
                            src={product.image}
                            alt={product.nameFa}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <a
                          href={buildHref(`/product/${product.slug}`)}
                          onClick={(e) => handleLinkClick(e, `/product/${product.slug}`)}
                          className="text-xs font-semibold text-[#11161E] hover:text-[#1453D6] text-right line-clamp-2 leading-5 min-h-[40px] block"
                        >
                          {product.nameFa}
                        </a>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 font-medium text-[#11161E] tabular-nums-fa">
                            <Star className="w-3.5 h-3.5 text-[#A84500] fill-[#A84500]" strokeWidth={1.5} />
                            {toPersianDigits(product.rating)}
                          </span>
                          <span className="font-semibold text-[#1453D6] tabular-nums-fa">
                            {formatToman(product.price)} تومان
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => addToCart(product)}
                          className="w-full h-9 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-50 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{product.inStock ? 'افزودن به سبد' : 'ناموجود'}</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8EE] text-xs">
                {visibleRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[#F7F8FA]">
                    <td className="p-4 font-medium text-[#4A5464] bg-[#F7F8FA]/60">
                      {row.label}
                    </td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-medium text-[#11161E] tabular-nums-fa leading-6">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
