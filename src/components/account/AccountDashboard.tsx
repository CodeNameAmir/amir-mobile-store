import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authApi } from '../../lib/authApi';
import type { DemoUser, OrderRecord, UserAddress } from '../../types/store';
import {
  getPasswordStrength,
  isValidEmail,
  isValidOtpCode,
  normalizeEmail,
  normalizeOtpCode,
  validateAddressForm,
  validateProfileForm,
} from '../../utils/authLogic';
import { formatToman, toPersianDigits } from '../../utils/storeLogic';
import { ProductCard } from '../ProductCard';

type DashboardTab = 'overview' | 'profile' | 'addresses' | 'orders' | 'wishlist' | 'security';

const STATUS_LABELS: Record<OrderRecord['status'], string> = {
  paid: 'پرداخت موفق',
  preparing: 'در حال آماده‌سازی',
  shipped: 'تحویل به پیک / پست',
  delivered: 'تحویل‌شده',
};

const EMPTY_ADDRESS_FORM = {
  label: '',
  receiverName: '',
  phone: '',
  city: 'تهران',
  address: '',
  postalCode: '',
  isDefault: false,
};

export const AccountDashboard: React.FC<{ user: DemoUser }> = ({ user }) => {
  const {
    orders,
    wishlist,
    stockAlerts,
    toggleStockAlert,
    products,
    navigate,
    logoutDemoUser,
    updateUserProfile,
    addUserAddress,
    updateUserAddress,
    setDefaultUserAddress,
    deleteUserAddress,
    setAuthenticatedUser,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Profile form state
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || '');
  const [nationalId, setNationalId] = useState(user.nationalId || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(user.newsletterOptIn ?? true);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Email change flow
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailChangePending, setEmailChangePending] = useState<{
    email: string;
    provider: 'resend' | 'sandbox-preview';
    previewCode?: string;
  } | null>(null);
  const [emailChangeOtp, setEmailChangeOtp] = useState('');
  const [emailChangeBusy, setEmailChangeBusy] = useState(false);
  const [emailChangeErr, setEmailChangeErr] = useState<string | null>(null);

  // Address Book state
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderRecord['status']>('all');

  // Security / Password change & 2FA
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [twoFactorPw, setTwoFactorPw] = useState('');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorErr, setTwoFactorErr] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setNationalId(user.nationalId || '');
    setBirthDate(user.birthDate || '');
    setNewsletterOptIn(user.newsletterOptIn ?? true);
  }, [user.id, user.fullName, user.phone, user.nationalId, user.birthDate, user.newsletterOptIn]);

  const addresses = user.addresses ?? [];
  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [products, wishlist]
  );
  const alertProducts = useMemo(
    () => products.filter((p) => stockAlerts.includes(p.id)),
    [products, stockAlerts]
  );
  const filteredOrders = useMemo(
    () =>
      orderStatusFilter === 'all'
        ? orders
        : orders.filter((o) => o.status === orderStatusFilter),
    [orderStatusFilter, orders]
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfileForm({ fullName, phone, nationalId });
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingProfile(true);
    try {
      await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        birthDate: birthDate.trim(),
        newsletterOptIn,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره پروفایل.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendEmailChangeOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeErr(null);
    const email = normalizeEmail(newEmailInput);
    if (!isValidEmail(email)) {
      setEmailChangeErr('آدرس ایمیل جدید معتبر نیست.');
      return;
    }
    setEmailChangeBusy(true);
    try {
      const res = await authApi.sendOtp({ email, purpose: 'change-email' });
      setEmailChangePending({
        email,
        provider: res.provider,
        previewCode: res.previewCode,
      });
      setEmailChangeOtp('');
      showToast('کد تایید به ایمیل جدید ارسال شد.', 'success');
    } catch (err) {
      setEmailChangeErr(err instanceof Error ? err.message : 'خطا در ارسال کد تغییر ایمیل.');
    } finally {
      setEmailChangeBusy(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailChangePending) return;
    setEmailChangeErr(null);
    const code = normalizeOtpCode(emailChangeOtp);
    if (!isValidOtpCode(code)) {
      setEmailChangeErr('کد تایید باید ۶ رقم باشد.');
      return;
    }
    setEmailChangeBusy(true);
    try {
      const res = await authApi.verifyOtp({
        email: emailChangePending.email,
        purpose: 'change-email',
        code,
      });
      if (res.user) {
        setAuthenticatedUser(res.user);
        setEmailChangePending(null);
        setNewEmailInput('');
        showToast('ایمیل حساب کاربری با موفقیت تغییر یافت.', 'success');
      }
    } catch (err) {
      setEmailChangeErr(err instanceof Error ? err.message : 'کد تایید نامعتبر است.');
    } finally {
      setEmailChangeBusy(false);
    }
  };

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      receiverName: user.fullName,
      phone: user.phone || '',
      isDefault: addresses.length === 0,
    });
    setAddressErrors({});
    setAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      receiverName: addr.receiverName,
      phone: addr.phone,
      city: addr.city,
      address: addr.address,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setAddressErrors({});
    setAddressFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAddressForm(addressForm);
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await updateUserAddress(editingAddressId, addressForm);
      } else {
        await addUserAddress(addressForm);
      }
      setAddressFormOpen(false);
      setEditingAddressId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره آدرس.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    const strength = getPasswordStrength(newPassword);
    if (!strength.valid) {
      setPasswordError('رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('تکرار رمز عبور جدید با رمز عبور یکسان نیست.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: user.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setAuthenticatedUser(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('رمز عبور حساب کاربری با موفقیت به‌روزرسانی شد.', 'success');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'خطا در تغییر رمز عبور.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorErr(null);
    const nextEnabled = !user.twoFactorEnabled;

    if (nextEnabled && !user.hasPassword) {
      setTwoFactorErr('ابتدا از بخش تغییر رمز عبور، یک رمز عبور برای حساب خود تنظیم کنید.');
      return;
    }
    if (user.hasPassword && !twoFactorPw) {
      setTwoFactorErr('برای تایید تغییر وضعیت تایید دومرحله‌ای، رمز عبور فعلی خود را وارد کنید.');
      return;
    }

    setTwoFactorBusy(true);
    try {
      const res = await authApi.toggleTwoFactor({
        enabled: nextEnabled,
        currentPassword: twoFactorPw,
      });
      setAuthenticatedUser(res.user);
      setTwoFactorPw('');
      showToast(
        nextEnabled
          ? 'تایید دومرحله‌ای (2FA) با موفقیت فعال شد.'
          : 'تایید دومرحله‌ای (2FA) غیرفعال شد.',
        'success'
      );
    } catch (err) {
      setTwoFactorErr(err instanceof Error ? err.message : 'خطا در تغییر تنظیمات تایید دومرحله‌ای.');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const navItems: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'نمای کلی حساب', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'اطلاعات فردی و ایمیل', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'addresses', label: 'دفترچه آدرس‌ها', icon: <MapPin className="w-4 h-4" /> },
    { id: 'orders', label: 'سفارش‌های من', icon: <Package className="w-4 h-4" /> },
    { id: 'wishlist', label: 'علاقه‌مندی‌ها و اعلان‌ها', icon: <Heart className="w-4 h-4" /> },
    { id: 'security', label: 'امنیت و رمز عبور', icon: <Shield className="w-4 h-4" /> },
  ];

  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 bg-white rounded-3xl border border-[#e5eeff] p-5 space-y-5 lg:sticky lg:top-28">
        <div className="flex items-center gap-3 pb-4 border-b border-[#eff4ff]">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#0b1c30] truncate">{user.fullName}</p>
            <p dir="ltr" className="text-xs text-[#434655] truncate text-right">
              {user.email}
            </p>
            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
              ایمیل تاییدشده
            </p>
          </div>
        </div>

        <nav aria-label="بخش‌های حساب کاربری" className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-1.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap text-right ${
                  active
                    ? 'bg-[#004ac6] text-white'
                    : 'bg-[#f8f9ff] lg:bg-transparent text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-[#eff4ff]">
          <button
            type="button"
            onClick={() => logoutDemoUser(false)}
            data-testid="account-logout-btn"
            className="w-full h-10 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب کاربری</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                    سلام {user.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#434655] mt-1">
                    نشانی ایمیل <span dir="ltr" className="font-semibold text-[#0b1c30]">{user.email}</span>
                    {user.phone ? ` · موبایل ${toPersianDigits(user.phone)}` : ' · شماره موبایل ثبت نشده'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="h-10 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold whitespace-nowrap"
                  >
                    ویرایش اطلاعات
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/catalog')}
                    className="h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold whitespace-nowrap"
                  >
                    مشاهده فروشگاه
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-2xl bg-[#f8f9ff] hover:bg-[#eff4ff] text-right transition-colors"
                >
                  <p className="text-xs text-[#434655]">سفارش‌های ثبت‌شده</p>
                  <p className="text-2xl font-black text-[#0b1c30] mt-1 tabular-nums-fa">
                    {toPersianDigits(orders.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className="p-4 rounded-2xl bg-[#f8f9ff] hover:bg-[#eff4ff] text-right transition-colors"
                >
                  <p className="text-xs text-[#434655]">آدرس‌های ذخیره‌شده</p>
                  <p className="text-2xl font-black text-[#0b1c30] mt-1 tabular-nums-fa">
                    {toPersianDigits(addresses.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('wishlist')}
                  className="p-4 rounded-2xl bg-[#f8f9ff] hover:bg-[#eff4ff] text-right transition-colors"
                >
                  <p className="text-xs text-[#434655]">علاقه‌مندی‌ها</p>
                  <p className="text-2xl font-black text-[#0b1c30] mt-1 tabular-nums-fa">
                    {toPersianDigits(wishlistProducts.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('wishlist')}
                  className="p-4 rounded-2xl bg-[#f8f9ff] hover:bg-[#eff4ff] text-right transition-colors"
                >
                  <p className="text-xs text-[#434655]">اعلان موجودی</p>
                  <p className="text-2xl font-black text-[#0b1c30] mt-1 tabular-nums-fa">
                    {toPersianDigits(alertProducts.length)}
                  </p>
                </button>
              </div>
            </section>

            {/* Recent Order Snapshot */}
            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#0b1c30]">آخرین سفارش‌ها</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#004ac6] hover:underline"
                >
                  مشاهده همه
                </button>
              </div>
              {orders.slice(0, 2).map((ord) => (
                <div
                  key={ord.orderCode}
                  className="p-4 rounded-2xl bg-[#f8f9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-[#434655]">
                      <strong dir="ltr" className="text-sm text-[#004ac6] font-black">
                        {ord.orderCode}
                      </strong>{' '}
                      · {STATUS_LABELS[ord.status]} · {ord.createdAt}
                    </p>
                    <p className="text-xs text-[#0b1c30] tabular-nums-fa">
                      {ord.customerName} · {toPersianDigits(ord.items.length)} کالا ·{' '}
                      <strong>{formatToman(ord.totalAmount)} تومان</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form
              onSubmit={handleSaveProfile}
              noValidate
              className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-5"
            >
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">اطلاعات فردی و تماس</h1>
                <p className="text-xs text-[#434655] mt-1">
                  این مشخصات برای صدور فاکتور رسمی و رجیستری قانونی همتا استفاده می‌شوند.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="prof-fullname" className="text-xs font-bold text-[#0b1c30] block">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="prof-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  {profileErrors.fullName && (
                    <p className="text-[11px] font-bold text-rose-600">{profileErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-phone" className="text-xs font-bold text-[#0b1c30] block">
                    شماره موبایل
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  {profileErrors.phone && (
                    <p className="text-[11px] font-bold text-rose-600">{profileErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-national-id" className="text-xs font-bold text-[#0b1c30] block">
                    کد ملی (اختیاری - جهت صدور فاکتور رسمی)
                  </label>
                  <input
                    id="prof-national-id"
                    type="text"
                    dir="ltr"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="0499370899"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  {profileErrors.nationalId && (
                    <p className="text-[11px] font-bold text-rose-600">{profileErrors.nationalId}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-birthdate" className="text-xs font-bold text-[#0b1c30] block">
                    تاریخ تولد (اختیاری)
                  </label>
                  <input
                    id="prof-birthdate"
                    type="text"
                    dir="ltr"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="1376/04/18"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#0b1c30] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span>اطلاع‌رسانی جشنواره‌ها و پیشنهادات طلایی از طریق ایمیل</span>
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  data-testid="save-profile-btn"
                  className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold"
                >
                  {savingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات پروفایل'}
                </button>
              </div>
            </form>

            {/* Change Email with Resend Verification */}
            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="text-base font-black text-[#0b1c30]">تغییر آدرس ایمیل حساب</h2>
                <p className="text-xs text-[#434655] mt-1">
                  ایمیل فعلی: <span dir="ltr" className="font-bold text-[#0b1c30]">{user.email}</span> · برای تغییر ایمیل، کد تایید ۶ رقمی از طریق Resend به نشانی جدید ارسال می‌شود.
                </p>
              </div>

              {emailChangeErr && (
                <p className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                  {emailChangeErr}
                </p>
              )}

              {!emailChangePending ? (
                <form onSubmit={handleSendEmailChangeOtp} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    dir="ltr"
                    aria-label="آدرس ایمیل جدید"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="new-email@example.com"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <button
                    type="submit"
                    disabled={emailChangeBusy}
                    className="h-11 px-5 rounded-xl bg-[#213145] hover:bg-[#004ac6] text-white text-xs font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{emailChangeBusy ? 'در حال ارسال...' : 'ارسال کد تایید به ایمیل جدید'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-3">
                  {emailChangePending.provider === 'sandbox-preview' && emailChangePending.previewCode && (
                    <p className="text-xs text-[#004ac6] font-bold">
                      کد پیش‌نمایش تغییر ایمیل:{' '}
                      <span dir="ltr" className="font-mono">
                        {emailChangePending.previewCode}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={6}
                      aria-label="کد تایید تغییر ایمیل"
                      value={emailChangeOtp}
                      onChange={(e) => setEmailChangeOtp(e.target.value)}
                      placeholder="کد ۶ رقمی"
                      className="flex-1 h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-center font-mono text-sm tracking-widest text-[#0b1c30]"
                    />
                    <button
                      type="submit"
                      disabled={emailChangeBusy}
                      className="h-11 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-bold whitespace-nowrap"
                    >
                      تایید و ثبت ایمیل جدید
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailChangePending(null)}
                      className="h-11 px-4 rounded-xl bg-[#eff4ff] text-[#434655] text-xs font-bold whitespace-nowrap"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}

        {activeTab === 'addresses' && (
          <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">دفترچه آدرس‌های ارسال</h1>
                <p className="text-xs text-[#434655] mt-1">
                  آدرس پیش‌فرض شما به‌صورت خودکار در فرم تسویه حساب انتخاب می‌شود.
                </p>
              </div>
              {!addressFormOpen && (
                <button
                  type="button"
                  onClick={openNewAddressForm}
                  data-testid="open-new-address-btn"
                  className="h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن آدرس جدید</span>
                </button>
              )}
            </div>

            {addressFormOpen && (
              <form
                onSubmit={handleSaveAddress}
                noValidate
                className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-[#0b1c30]">
                    {editingAddressId ? 'ویرایش آدرس' : 'ثبت آدرس جدید'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="text-xs font-bold text-[#434655] hover:text-[#0b1c30]"
                  >
                    بستن
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="addr-label" className="text-xs font-bold text-[#0b1c30] block">
                      عنوان آدرس (مثال: منزل، محل کار)
                    </label>
                    <input
                      id="addr-label"
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                      placeholder="منزل"
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-[#0b1c30]"
                    />
                    {addressErrors.label && (
                      <p className="text-[11px] font-bold text-rose-600">{addressErrors.label}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-receiver" className="text-xs font-bold text-[#0b1c30] block">
                      نام و نام خانوادگی تحویل‌گیرنده
                    </label>
                    <input
                      id="addr-receiver"
                      type="text"
                      value={addressForm.receiverName}
                      onChange={(e) => setAddressForm((p) => ({ ...p, receiverName: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-[#0b1c30]"
                    />
                    {addressErrors.receiverName && (
                      <p className="text-[11px] font-bold text-rose-600">{addressErrors.receiverName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-phone" className="text-xs font-bold text-[#0b1c30] block">
                      شماره موبایل تحویل‌گیرنده
                    </label>
                    <input
                      id="addr-phone"
                      type="tel"
                      dir="ltr"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="09123456789"
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                    />
                    {addressErrors.phone && (
                      <p className="text-[11px] font-bold text-rose-600">{addressErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-city" className="text-xs font-bold text-[#0b1c30] block">
                      استان / شهر
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-[#0b1c30]"
                    />
                    {addressErrors.city && (
                      <p className="text-[11px] font-bold text-rose-600">{addressErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-postal" className="text-xs font-bold text-[#0b1c30] block">
                      کد پستی ۱۰ رقمی
                    </label>
                    <input
                      id="addr-postal"
                      type="text"
                      dir="ltr"
                      maxLength={10}
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="1988233145"
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                    />
                    {addressErrors.postalCode && (
                      <p className="text-[11px] font-bold text-rose-600">{addressErrors.postalCode}</p>
                    )}
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#0b1c30] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                        className="w-4 h-4 accent-[#004ac6]"
                      />
                      <span>تنظیم به عنوان آدرس پیش‌فرض</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="addr-full" className="text-xs font-bold text-[#0b1c30] block">
                    نشانی کامل پستی
                  </label>
                  <textarea
                    id="addr-full"
                    rows={2}
                    value={addressForm.address}
                    onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="خیابان، کوچه، پلاک، طبقه و واحد..."
                    className="w-full p-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-[#0b1c30]"
                  />
                  {addressErrors.address && (
                    <p className="text-[11px] font-bold text-rose-600">{addressErrors.address}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="h-10 px-4 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#434655]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    data-testid="save-address-btn"
                    className="h-10 px-5 rounded-xl bg-[#004ac6] text-white text-xs font-extrabold"
                  >
                    {savingAddress ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#f8f9ff] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#434655]">
                  هنوز آدرسی در دفترچه حساب خود ثبت نکرده‌اید.
                </p>
                {!addressFormOpen && (
                  <button
                    type="button"
                    onClick={openNewAddressForm}
                    className="h-10 px-4 rounded-xl bg-[#eff4ff] text-[#004ac6] text-xs font-bold"
                  >
                    ثبت اولین آدرس
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      addr.isDefault
                        ? 'bg-[#eff4ff]/50 border-[#2563eb]'
                        : 'bg-[#f8f9ff] border-[#e5eeff]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-[#0b1c30]">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="mr-2 text-[11px] font-bold text-[#004ac6]">
                            · پیش‌فرض
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditAddressForm(addr)}
                          aria-label={`ویرایش آدرس ${addr.label}`}
                          className="p-1.5 rounded-lg bg-white text-[#434655] hover:text-[#004ac6]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUserAddress(addr.id)}
                          aria-label={`حذف آدرس ${addr.label}`}
                          className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#0b1c30] leading-6">
                      {addr.city}، {addr.address}
                    </p>
                    <p className="text-[11px] text-[#434655] tabular-nums-fa">
                      تحویل‌گیرنده: {addr.receiverName} · {toPersianDigits(addr.phone)} · کد پستی:{' '}
                      {toPersianDigits(addr.postalCode)}
                    </p>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultUserAddress(addr.id)}
                        className="text-xs font-bold text-[#004ac6] hover:underline"
                      >
                        تنظیم به عنوان پیش‌فرض
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">
                سفارش‌های ثبت‌شده ({toPersianDigits(filteredOrders.length)})
              </h1>
              <div className="flex items-center gap-1 p-1 bg-[#eff4ff] rounded-xl overflow-x-auto">
                {(
                  [
                    { id: 'all', label: 'همه' },
                    { id: 'preparing', label: 'در حال آماده‌سازی' },
                    { id: 'shipped', label: 'ارسال‌شده' },
                    { id: 'delivered', label: 'تحویل‌شده' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      orderStatusFilter === f.id
                        ? 'bg-white text-[#004ac6] shadow-sm'
                        : 'text-[#434655] hover:text-[#0b1c30]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#f8f9ff] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#434655]">
                  سفارشی با این وضعیت یافت نشد.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.orderCode}
                    className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#434655]">
                        <span dir="ltr" className="text-sm font-black text-[#004ac6]">
                          {ord.orderCode}
                        </span>{' '}
                        · {STATUS_LABELS[ord.status]} · {ord.createdAt}
                      </p>
                      <p className="text-xs text-[#434655]">
                        تحویل‌گیرنده: {ord.customerName} · {toPersianDigits(ord.items.length)} کالا ·{' '}
                        <strong className="text-[#0b1c30] tabular-nums-fa">
                          {formatToman(ord.totalAmount)} تومان
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
            )}
          </section>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <h1 className="text-lg font-black text-[#0b1c30]">
                لیست علاقه‌مندی‌ها ({toPersianDigits(wishlistProducts.length)})
              </h1>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#f8f9ff] text-center space-y-3">
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

            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-black text-[#0b1c30] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#004ac6]" />
                <span>اعلان‌های موجودی کالا ({toPersianDigits(alertProducts.length)})</span>
              </h2>
              {alertProducts.length === 0 ? (
                <p className="text-xs text-[#434655]">
                  برای هیچ کالای ناموجودی درخواست اطلاع‌رسانی ثبت نکرده‌اید.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {alertProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-[#f8f9ff] flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${p.slug}`)}
                        className="text-xs font-bold text-[#0b1c30] hover:text-[#004ac6] text-right"
                      >
                        {p.nameFa}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStockAlert(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold text-rose-600 shrink-0"
                      >
                        لغو اعلان
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form
              onSubmit={handlePasswordChange}
              noValidate
              className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4"
            >
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0b1c30] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#004ac6]" />
                  <span>{user.hasPassword ? 'تغییر رمز عبور' : 'تنظیم رمز عبور برای حساب'}</span>
                </h1>
                <p className="text-xs text-[#434655] mt-1">
                  {user.hasPassword
                    ? 'پس از تغییر رمز عبور، ایمیل اطلاع‌رسانی امنیتی از طریق Resend برایتان ارسال می‌شود.'
                    : 'شما با کد تایید ایمیل وارد شده‌اید؛ در صورت تمایل می‌توانید یک رمز عبور نیز برای ورود سریع‌تر تنظیم کنید.'}
                </p>
              </div>

              {passwordError && (
                <p className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                  {passwordError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {user.hasPassword && (
                  <div className="space-y-1.5">
                    <label htmlFor="sec-cur-pw" className="text-xs font-bold text-[#0b1c30] block">
                      رمز عبور فعلی
                    </label>
                    <input
                      id="sec-cur-pw"
                      type="password"
                      dir="ltr"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="sec-new-pw" className="text-xs font-bold text-[#0b1c30] block">
                    رمز عبور جدید
                  </label>
                  <input
                    id="sec-new-pw"
                    type="password"
                    dir="ltr"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                  />
                  {newPassword && (
                    <p className="text-[11px] text-[#434655]">
                      قدرت: <strong>{pwStrength.labelFa}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sec-confirm-pw" className="text-xs font-bold text-[#0b1c30] block">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    id="sec-confirm-pw"
                    type="password"
                    dir="ltr"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-extrabold"
                >
                  {savingPassword ? 'در حال ثبت...' : 'ذخیره رمز عبور'}
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication (2FA) */}
            <form
              onSubmit={handleToggleTwoFactor}
              noValidate
              className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0b1c30] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#004ac6]" />
                    <span>تایید دومرحله‌ای (2FA) با ایمیل</span>
                  </h2>
                  <p className="text-xs text-[#434655] mt-1 leading-6">
                    با فعال‌سازی این گزینه، هنگام ورود به حساب ابتدا رمز عبور شما بررسی می‌شود و سپس کد تایید ۶ رقمی به ایمیلتان ارسال خواهد شد.
                  </p>
                </div>
                <span
                  data-testid="two-factor-status-badge"
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap ${
                    user.twoFactorEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#f8f9ff] text-[#434655] border border-[#dce9ff]'
                  }`}
                >
                  {user.twoFactorEnabled ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {twoFactorErr && (
                <p className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                  {twoFactorErr}
                </p>
              )}

              {!user.hasPassword ? (
                <p className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs text-[#0b1c30] leading-6">
                  برای فعال‌سازی تایید دومرحله‌ای، ابتدا باید از فرم «تنظیم رمز عبور برای حساب» در بالا یک رمز عبور ثبت کنید.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label htmlFor="two-factor-pw" className="text-xs font-bold text-[#0b1c30] block">
                      رمز عبور فعلی برای تایید
                    </label>
                    <input
                      id="two-factor-pw"
                      type="password"
                      dir="ltr"
                      value={twoFactorPw}
                      onChange={(e) => setTwoFactorPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left text-[#0b1c30]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={twoFactorBusy}
                    data-testid="toggle-two-factor-btn"
                    className={`h-11 px-5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
                      user.twoFactorEnabled
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        : 'bg-[#004ac6] hover:bg-[#2563eb] text-white'
                    }`}
                  >
                    {twoFactorBusy
                      ? 'در حال اعمال...'
                      : user.twoFactorEnabled
                      ? 'غیرفعال‌سازی تایید دومرحله‌ای'
                      : 'فعال‌سازی تایید دومرحله‌ای'}
                  </button>
                </div>
              )}
            </form>

            <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-black text-[#0b1c30] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>مدیریت نشست‌های فعال</span>
                </h2>
                <p className="text-xs text-[#434655]">
                  اگر در دستگاه دیگری وارد حساب خود شده‌اید، می‌توانید همه نشست‌های فعال را یکجا ببندید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => logoutDemoUser(true)}
                className="h-11 px-5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold whitespace-nowrap shrink-0"
              >
                خروج از همه دستگاه‌ها
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
