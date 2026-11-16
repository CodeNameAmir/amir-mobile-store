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
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

interface CompareRow {
  key: string;
  label: string;
  render: (p: Product) => string;
}

const COMPARE_ROWS: CompareRow[] = [
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
  const { products, compareIds, toggleCompare, clearCompare, addToCart, navigate } = useStore();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const selectedProducts = useMemo(
    () => products.filter((p) => compareIds.includes(p.id)),
    [products, compareIds]
  );

  const availableToAdd = useMemo(
    () => products.filter((p) => !compareIds.includes(p.id) && p.inStock),
    [products, compareIds]
  );

  const visibleRows = useMemo(() => {
    if (!onlyDifferences || selectedProducts.length < 2) return COMPARE_ROWS;
    return COMPARE_ROWS.filter((row) => {
      const values = selectedProducts.map((p) => row.render(p));
      return new Set(values).size > 1;
    });
  }, [onlyDifferences, selectedProducts]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
            <Scale className="w-4 h-4" />
            <span>مقایسه تخصصی مشخصات فنی</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
            مقایسه کنار هم محصولات ({toPersianDigits(selectedProducts.length)} از ۳)
          </h1>
          <p className="text-xs sm:text-sm text-[#434655]">
            مشخصات نمایشگر، تراشه، دوربین، باتری و قیمت گوشی‌ها و گجت‌ها را به‌صورت دقیق مقایسه کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedProducts.length >= 2 && (
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs font-bold text-[#0b1c30] cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className="w-4 h-4 accent-[#004ac6]"
              />
              <span>فقط نمایش تفاوت‌ها</span>
            </label>
          )}
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک کردن لیست</span>
            </button>
          )}
        </div>
      </div>

      {/* Add product selector if slots remain */}
      {selectedProducts.length < 3 && (
        <div className="bg-[#eff4ff] rounded-2xl border border-[#dce9ff] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#0b1c30] inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#004ac6]" />
            افزودن محصول برای مقایسه ({toPersianDigits(3 - selectedProducts.length)} جایگاه خالی):
          </span>
          <select
            aria-label="افزودن محصول به مقایسه"
            value=""
            onChange={(e) => {
              if (e.target.value) toggleCompare(e.target.value);
            }}
            className="h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#0b1c30] sm:w-80 focus:outline-none focus:border-[#004ac6]"
          >
            <option value="">انتخاب یک گوشی یا گجت...</option>
            {availableToAdd.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameFa} — {formatToman(p.price)} تومان
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5eeff] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
            <Scale className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-[#0b1c30]">هنوز محصولی برای مقایسه انتخاب نشده است</h2>
          <p className="text-xs sm:text-sm text-[#434655] max-w-md mx-auto">
            از منوی بالا محصولات مورد نظر خود را انتخاب کنید یا در صفحه فروشگاه روی دکمه مقایسه کلیک نمایید.
          </p>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="h-11 px-6 rounded-xl bg-[#004ac6] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2"
          >
            <span>مشاهده محصولات فروشگاه</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e5eeff] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right border-collapse">
              <thead>
                <tr className="border-b border-[#eff4ff] bg-[#f8f9ff]">
                  <th className="w-44 p-5 text-xs font-extrabold text-[#434655] align-top">
                    مشخصات فنی
                  </th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="p-5 align-top min-w-[210px]">
                      <div className="bg-white rounded-2xl border border-[#e5eeff] p-4 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => toggleCompare(product.id)}
                          aria-label={`حذف ${product.nameFa}`}
                          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-[#f8f9ff] hover:bg-rose-50 text-[#434655] hover:text-rose-600 flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="aspect-[4/3] rounded-xl bg-[#f8f9ff] overflow-hidden">
                          <SmartImage
                            src={product.image}
                            alt={product.nameFa}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/product/${product.slug}`)}
                          className="text-xs font-extrabold text-[#0b1c30] hover:text-[#004ac6] text-right line-clamp-2 leading-5 min-h-[40px]"
                        >
                          {product.nameFa}
                        </button>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 font-bold text-[#0b1c30] tabular-nums-fa">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {toPersianDigits(product.rating)}
                          </span>
                          <span className="font-black text-[#004ac6] tabular-nums-fa">
                            {formatToman(product.price)} تومان
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => addToCart(product)}
                          className="w-full h-9 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{product.inStock ? 'افزودن به سبد' : 'ناموجود'}</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] text-xs">
                {visibleRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[#f8f9ff]/60">
                    <td className="p-4 font-extrabold text-[#434655] bg-[#f8f9ff]/50">
                      {row.label}
                    </td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-[#0b1c30] tabular-nums-fa leading-6">
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
