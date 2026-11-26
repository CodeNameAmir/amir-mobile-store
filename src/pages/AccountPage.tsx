import React, { Suspense } from 'react';
import { Heart, Package } from 'lucide-react';
import { AccountPageSkeleton, AuthPageSkeleton } from '../components/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

const AccountDashboard = lazyWithRetry(() =>
  import('../components/account/AccountDashboard').then((m) => ({ default: m.AccountDashboard }))
);
const AuthPanel = lazyWithRetry(() =>
  import('../components/account/AuthPanel').then((m) => ({ default: m.AuthPanel }))
);

export const AccountPage: React.FC = () => {
  const { user, authLoading, orders, wishlist, products, buildHref, handleLinkClick } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (authLoading && !user) {
    return <AuthPageSkeleton />;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {user ? (
        <Suspense fallback={<AccountPageSkeleton />}>
          <AccountDashboard user={user} />
        </Suspense>
      ) : (
        <>
          <Suspense fallback={<AuthPageSkeleton />}>
            <AuthPanel />
          </Suspense>

          {/* Guest Local Orders & Wishlist Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 min-w-0 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
                <span>سفارش‌های این مرورگر ({toPersianDigits(orders.length)})</span>
              </h2>
              {orders.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                  <p className="text-xs text-[#4A5464] leading-6">
                    در این مرورگر هنوز سفارشی ثبت نشده است. پس از ورود به حساب کاربری، سفارش‌های ثبت‌شده در حساب شما نمایش داده می‌شوند.
                  </p>
                  <a
                    href={buildHref('/tracking')}
                    onClick={(e) => handleLinkClick(e, '/tracking')}
                    className="h-9 px-4 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                  >
                    پیگیری با کد سفارش
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderCode}
                      className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-[#4A5464]">
                          <span dir="ltr" className="text-sm font-semibold font-mono text-[#1453D6]">
                            {ord.orderCode}
                          </span>{' '}
                          · {ord.createdAt}
                        </p>
                        <p className="text-xs text-[#4A5464] tabular-nums-fa">
                          تحویل‌گیرنده: {ord.customerName} ·{' '}
                          <strong className="text-[#11161E] font-semibold">
                            {formatToman(ord.totalAmount)} تومان
                          </strong>
                        </p>
                      </div>
                      <a
                        href={buildHref(`/tracking/${ord.orderCode}`)}
                        onClick={(e) => handleLinkClick(e, `/tracking/${ord.orderCode}`)}
                        className="px-3.5 py-2 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold self-start sm:self-auto inline-flex items-center transition-colors"
                      >
                        رهگیری مرسوله
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="lg:col-span-5 min-w-0 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#B42318]" strokeWidth={1.5} />
                <span>علاقه‌مندی‌های این مرورگر ({toPersianDigits(wishlistProducts.length)})</span>
              </h2>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {wishlistProducts.slice(0, 2).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                  <p className="text-xs text-[#4A5464]">
                    هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.
                  </p>
                  <a
                    href={buildHref('/catalog')}
                    onClick={(e) => handleLinkClick(e, '/catalog')}
                    className="h-9 px-4 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                  >
                    مشاهده فروشگاه
                  </a>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};
