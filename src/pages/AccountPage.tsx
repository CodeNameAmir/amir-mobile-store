import React, { useState } from 'react';
import { Heart, LogOut, Package, User, UserCheck } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { formatToman, toPersianDigits } from '../utils/storeLogic';

export const AccountPage: React.FC = () => {
  const { user, loginDemoUser, logoutDemoUser, orders, wishlist, products, navigate } = useStore();
  const [fullName, setFullName] = useState('امیرحسین کریمی');
  const [phone, setPhone] = useState('09123456789');
  const [email, setEmail] = useState('amir@example.ir');

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) return;
    loginDemoUser({
      fullName: fullName.trim(),
      phone: phone.trim() || '09123456789',
      email: email.trim() || 'user@amirmobile.ir',
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* User Profile / Demo Login Card */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">{user.fullName}</h1>
                <p className="text-xs text-[#434655] mt-1 tabular-nums-fa">
                  موبایل: {toPersianDigits(user.phone)} · ایمیل: <span dir="ltr">{user.email}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logoutDemoUser}
              className="self-start sm:self-auto h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب دمو</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#004ac6] text-xs font-extrabold">
                <User className="w-4 h-4" />
                <span>ورود سریع (حالت دمو رزومه‌ای)</span>
              </div>
              <h1 className="text-xl font-black text-[#0b1c30]">پروفایل کاربری شما</h1>
              <p className="text-xs text-[#434655]">
                با ورود آزمایشی می‌توانید مشخصات را برای تکمیل سریع‌تر فرم تسویه حساب ذخیره کنید.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                className="h-11 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
              />
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="h-11 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
              />
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.ir"
                className="h-11 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-extrabold"
              >
                ورود به پروفایل
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Orders History */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#0b1c30] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#004ac6]" />
            <span>سفارش‌های ثبت‌شده ({toPersianDigits(orders.length)})</span>
          </h2>
        </div>

        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.orderCode}
              className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span dir="ltr" className="text-sm font-black text-[#004ac6]">
                    {ord.orderCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white text-[11px] font-bold text-[#0b1c30]">
                    {ord.createdAt}
                  </span>
                </div>
                <p className="text-xs text-[#434655]">
                  تحویل‌گیرنده: {ord.customerName} · {toPersianDigits(ord.items.length)} کالا ·{' '}
                  <strong className="text-[#0b1c30] tabular-nums-fa">
                    {formatToman(ord.totalAmount)} تومان
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/order-confirmed/${ord.orderCode}`)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#0b1c30] hover:border-[#004ac6]"
                >
                  مشاهده فاکتور
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/tracking/${ord.orderCode}`)}
                  className="px-3.5 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold"
                >
                  رهگیری مرسوله
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wishlist */}
      <section className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-[#0b1c30] flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <span>لیست علاقه‌مندی‌ها ({toPersianDigits(wishlistProducts.length)})</span>
        </h2>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-8 text-center space-y-3">
            <p className="text-xs sm:text-sm text-[#434655]">
              هنوز محصولی به لیست علاقه‌مندی‌های خود اضافه نکرده‌اید.
            </p>
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="h-10 px-5 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold"
            >
              گشت‌وگذار در فروشگاه
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
