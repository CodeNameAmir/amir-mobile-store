import React from 'react';
import { Bell, Heart, Scale, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';
import { formatToman, toPersianDigits } from '../utils/storeLogic';
import { SmartImage } from './SmartImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    navigate,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    stockAlerts,
    toggleStockAlert,
  } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const isAlerted = stockAlerts.includes(product.id);

  const openProduct = () => navigate(`/product/${product.slug}`);

  // Max 1 status badge per card to keep visual discipline clean
  const badge = !product.inStock
    ? { label: 'ناموجود', style: 'bg-[#213145] text-white' }
    : product.discountPercent && product.discountPercent > 0
    ? { label: `${toPersianDigits(product.discountPercent)}٪ تخفیف`, style: 'bg-[#b54e00] text-white' }
    : product.badgeText
    ? { label: product.badgeText, style: 'bg-[#004ac6] text-white' }
    : null;

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group bg-white rounded-2xl border border-[#e5eeff] hover:border-[#2563eb]/40 hover:shadow-[0_14px_34px_rgba(11,28,48,0.08)] transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Image stage */}
      <div className="relative bg-[#f8f9ff] p-4 aspect-[4/3] overflow-hidden">
        <button
          type="button"
          onClick={openProduct}
          className="w-full h-full block rounded-xl overflow-hidden focus:outline-none"
          aria-label={`مشاهده ${product.nameFa}`}
        >
          <SmartImage
            src={product.image}
            alt={product.nameFa}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </button>

        {badge && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm ${badge.style}`}
          >
            {badge.label}
          </span>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 text-[#434655] hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            data-testid={`compare-toggle-${product.slug}`}
            onClick={() => toggleCompare(product.id)}
            aria-label={isCompared ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
            title={isCompared ? 'در لیست مقایسه' : 'مقایسه محصول'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
              isCompared
                ? 'bg-[#004ac6] text-white'
                : 'bg-white/90 text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 flex flex-col ${compact ? 'p-3.5' : 'p-4'} gap-2.5`}>
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#434655]">
          <span className="font-bold uppercase tracking-wide text-[#004ac6]">{product.brand}</span>
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums-fa">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {toPersianDigits(product.rating)} ({toPersianDigits(product.reviewCount)})
          </span>
        </div>

        <button
          type="button"
          onClick={openProduct}
          className="text-right font-bold text-sm text-[#0b1c30] hover:text-[#004ac6] transition-colors line-clamp-2 leading-6 min-h-[48px]"
        >
          {product.nameFa}
        </button>

        <div className="flex items-center justify-between gap-2 text-[11px] text-[#434655]">
          <span className="line-clamp-1">
            {product.specs.storageDefault} · {product.specs.ram} رم · {product.colorLabel}
          </span>
          {product.inStock && product.stockCount <= 3 && (
            <span className="text-[#b54e00] font-bold shrink-0 tabular-nums-fa">
              تنها {toPersianDigits(product.stockCount)} عدد
            </span>
          )}
        </div>

        {/* Price + Action */}
        <div className="mt-auto pt-3 border-t border-[#eff4ff] flex items-end justify-between gap-2">
          <div>
            {product.originalPrice && product.originalPrice > product.price && product.inStock && (
              <p className="text-[11px] text-[#434655]/70 line-through tabular-nums-fa">
                {formatToman(product.originalPrice)} تومان
              </p>
            )}
            <p className="text-sm md:text-base font-extrabold text-[#0b1c30] tabular-nums-fa">
              {product.inStock ? (
                <>
                  {formatToman(product.price)}{' '}
                  <span className="text-[11px] font-semibold text-[#434655]">تومان</span>
                </>
              ) : (
                <span className="text-xs font-bold text-[#434655]">اتمام موجودی انبار</span>
              )}
            </p>
          </div>

          {product.inStock ? (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="h-9 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
              aria-label={`افزودن ${product.nameFa} به سبد خرید`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>خرید</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleStockAlert(product.id)}
              className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
                isAlerted
                  ? 'bg-[#213145] text-white'
                  : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#434655]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isAlerted ? 'اطلاع می‌دهیم' : 'خبرم کن'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
