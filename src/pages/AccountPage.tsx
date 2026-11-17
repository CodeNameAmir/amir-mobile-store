import React from 'react';
import { Heart, Package } from 'lucide-react';
import { AccountDashboard } from '../components/account/AccountDashboard';
import { AuthPanel } from '../components/account/AuthPanel';
import { AccountPageSkeleton } from '../components/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

export const AccountPage: React.FC = () => {
  const { user, authLoading, orders, wishlist, products, navigate } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (authLoading && !user) {
    return <AccountPageSkeleton />;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {user ? (
        <AccountDashboard user={user} />
      ) : (
        <>
          <AuthPanel />

          {/* Guest Local Orders & Wishlist Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-black text-[#0b1c30] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#004ac6]" />
                <span>سفارش‌های این مرورگر ({toPersianDigits(orders.length)})</span>
              </h2>
              {orders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#f8f9ff] text-center space-y-3">
                  <p className="text-xs text-[#434655] leading-6">
                    در این مرورگر هنوز سفارشی ثبت نشده است. پس از ورود به حساب کاربری، سفارش‌های ثبت‌شده در حساب شما نمایش داده می‌شوند.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/tracking')}
                    className="h-9 px-4 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold"
                  >
                    پیگیری با کد سفارش
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderCode}
                      className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-[#434655]">
                          <span dir="ltr" className="text-sm font-black text-[#004ac6]">
                            {ord.orderCode}
                          </span>{' '}
                          · {ord.createdAt}
                        </p>
                        <p className="text-xs text-[#434655] tabular-nums-fa">
                          تحویل‌گیرنده: {ord.customerName} ·{' '}
                          <strong className="text-[#0b1c30]">
                            {formatToman(ord.totalAmount)} تومان
                          </strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/tracking/${ord.orderCode}`)}
                        className="px-3.5 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold self-start sm:self-auto"
                      >
                        رهگیری مرسوله
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-black text-[#0b1c30] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>علاقه‌مندی‌های این مرورگر ({toPersianDigits(wishlistProducts.length)})</span>
              </h2>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {wishlistProducts.slice(0, 2).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#f8f9ff] text-center space-y-3">
                  <p className="text-xs text-[#434655]">
                    هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/catalog')}
                    className="h-9 px-4 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold"
                  >
                    مشاهده فروشگاه
                  </button>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};
