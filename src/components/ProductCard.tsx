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
    buildHref,
    handleLinkClick,
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

  const productPath = `/product/${product.slug}`;
  const productHref = buildHref(productPath);

  const badge = !product.inStock
    ? { label: 'ناموجود', style: 'bg-[#13171F] text-white border border-[#13171F]' }
    : product.discountPercent && product.discountPercent > 0
    ? { label: `${toPersianDigits(product.discountPercent)}٪ تخفیف`, style: 'bg-[#FDF1E8] text-[#A84500] border border-[#F5D6BE]' }
    : product.badgeText
    ? { label: product.badgeText, style: 'bg-[#EEF3FC] text-[#1453D6] border border-[#D4E2FA]' }
    : null;

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group bg-white rounded-xl border border-[#E4E8EE] hover:border-[#C5CEDB] hover:shadow-xs transition-colors flex flex-col overflow-hidden"
    >
      {/* Studio neutral image stage */}
      <div className="relative bg-[#F3F5F8] p-4 aspect-[4/3] overflow-hidden">
        <a
          href={productHref}
          onClick={(e) => handleLinkClick(e, productPath)}
          className="w-full h-full block rounded-lg overflow-hidden focus:outline-none"
          aria-label={`مشاهده ${product.nameFa}`}
        >
          <SmartImage
            src={product.image}
            alt={product.nameFa}
            className="w-full h-full object-cover"
          />
        </a>

        {badge && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.style}`}
          >
            {badge.label}
          </span>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              isWishlisted
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : 'bg-white/95 border-[#E4E8EE] text-[#4A5464] hover:text-[#B42318]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            data-testid={`compare-toggle-${product.slug}`}
            onClick={() => toggleCompare(product.id)}
            aria-label={isCompared ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
            title={isCompared ? 'در لیست مقایسه' : 'مقایسه محصول'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              isCompared
                ? 'bg-[#1453D6] border-[#1453D6] text-white'
                : 'bg-white/95 border-[#E4E8EE] text-[#4A5464] hover:text-[#1453D6]'
            }`}
          >
            <Scale className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 flex flex-col ${compact ? 'p-4' : 'p-5'} gap-2.5`}>
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#6E7889]">
          <span className="font-medium text-[#4A5464]">{product.brand}</span>
          <span className="inline-flex items-center gap-1 font-medium text-[#4A5464] tabular-nums-fa">
            <Star className="w-3.5 h-3.5 text-[#A84500] fill-[#A84500]" strokeWidth={1.5} />
            {toPersianDigits(product.rating)} ({toPersianDigits(product.reviewCount)})
          </span>
        </div>

        <a
          href={productHref}
          onClick={(e) => handleLinkClick(e, productPath)}
          className="text-right font-semibold text-sm text-[#11161E] hover:text-[#1453D6] transition-colors line-clamp-2 leading-6 min-h-[48px]"
        >
          {product.nameFa}
        </a>

        <div className="flex items-center justify-between gap-2 text-xs text-[#6E7889]">
          <span className="line-clamp-1">
            {product.specs.storageDefault} · {product.specs.ram} رم · {product.colorLabel}
          </span>
          {product.inStock && product.stockCount <= 3 && (
            <span className="text-[#A84500] font-medium shrink-0 tabular-nums-fa">
              تنها {toPersianDigits(product.stockCount)} عدد
            </span>
          )}
        </div>

        {/* Price + Action */}
        <div className="mt-auto pt-3 border-t border-[#E4E8EE] flex items-end justify-between gap-2">
          <div>
            {product.originalPrice && product.originalPrice > product.price && product.inStock && (
              <p className="text-[11px] text-[#6E7889] line-through tabular-nums-fa">
                {formatToman(product.originalPrice)} تومان
              </p>
            )}
            <p className="text-sm md:text-base font-semibold text-[#11161E] tabular-nums-fa">
              {product.inStock ? (
                <>
                  {formatToman(product.price)}{' '}
                  <span className="text-[11px] font-normal text-[#4A5464]">تومان</span>
                </>
              ) : (
                <span className="text-xs font-medium text-[#6E7889]">اتمام موجودی انبار</span>
              )}
            </p>
          </div>

          {product.inStock ? (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="h-9 px-3 rounded-lg bg-[#F1F3F6] hover:bg-[#1453D6] text-[#11161E] hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
              aria-label={`افزودن ${product.nameFa} به سبد خرید`}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              <span>خرید</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleStockAlert(product.id)}
              className={`h-9 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 ${
                isAlerted
                  ? 'bg-[#13171F] text-white'
                  : 'bg-[#F1F3F6] hover:bg-[#EAECEF] text-[#4A5464]'
              }`}
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              <span>{isAlerted ? 'اطلاع می‌دهیم' : 'خبرم کن'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
