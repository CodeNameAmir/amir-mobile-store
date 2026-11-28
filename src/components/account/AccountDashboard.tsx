import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  AtSign,
  Bell,
  Camera,
  CheckCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Settings2,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authApi } from '../../lib/authApi';
import type { DemoUser, OrderRecord, SupportTicket, UserAddress } from '../../types/store';
import {
  generateUsernameSuggestions,
  getPasswordStrength,
  isValidEmail,
  isValidOtpCode,
  normalizeEmail,
  normalizeOtpCode,
  normalizeUsername,
  validateAddressForm,
  validateProfileForm,
  validateUsername,
} from '../../utils/authLogic';
import {
  formatPersianDate,
  formatToman,
  getPaymentStatusLabel,
  toPersianDigits,
} from '../../utils/storeLogic';
import { ProductCard } from '../ProductCard';
import { OrderRowSkeleton, SkeletonBox } from '../Skeleton';

type DashboardTab =
  | 'overview'
  | 'profile'
  | 'addresses'
  | 'orders'
  | 'wishlist'
  | 'notifications'
  | 'tickets'
  | 'security';

const STATUS_LABELS: Record<OrderRecord['status'], string> = {
  pending_payment: 'در انتظار پرداخت',
  paid: 'پرداخت موفق',
  preparing: 'در حال آماده‌سازی',
  shipped: 'تحویل به پیک / پست',
  delivered: 'تحویل‌شده',
  cancelled: 'لغو شده',
  expired: 'منقضی‌شده',
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

async function resizeAvatarToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن تصویر با خطا مواجه شد.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('فایل تصویر نامعتبر است.'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('فرمت تصویر قابل پردازش نیست.'));
      img.onload = () => {
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
        const width = Math.max(1, Math.round((img.width || maxDim) * scale));
        const height = Math.max(1, Math.round((img.height || maxDim) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const AccountDashboard: React.FC<{ user: DemoUser }> = ({ user }) => {
  const {
    orders,
    ordersLoading,
    wishlist,
    stockAlerts,
    toggleStockAlert,
    notifications,
    unreadNotificationCount,
    notificationsLoading,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    products,
    buildHref,
    handleLinkClick,
    navigate,
    logoutDemoUser,
    updateUserProfile,
    updateUserUsername,
    deleteUserAccount,
    addUserAddress,
    updateUserAddress,
    setDefaultUserAddress,
    deleteUserAddress,
    setAuthenticatedUser,
    cancelCustomerOrder,
    reorderFromOrder,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const workspaceRef = React.useRef<HTMLDivElement | null>(null);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Profile form state
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || '');
  const [nationalId, setNationalId] = useState(user.nationalId || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(user.newsletterOptIn ?? true);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Username management state
  const [usernameInput, setUsernameInput] = useState(user.username || '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    checkedNormalized: string;
    valid?: boolean;
    available?: boolean;
    isCurrent?: boolean;
    error?: string;
    suggestions?: string[];
  }>({ checking: false, checkedNormalized: '' });

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

  // Orders filter & actions
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderRecord['status']>('all');
  const [confirmCancelCode, setConfirmCancelCode] = useState<string | null>(null);
  const [cancellingOrderCode, setCancellingOrderCode] = useState<string | null>(null);
  const [reorderingCode, setReorderingCode] = useState<string | null>(null);

  // Security / Password change & 2FA & Account Deletion
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [twoFactorPw, setTwoFactorPw] = useState('');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorErr, setTwoFactorErr] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Support ticket history state
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'notifications') {
      void refreshNotifications();
    }
  }, [activeTab, refreshNotifications]);

  useEffect(() => {
    if (activeTab !== 'tickets') return;
    let active = true;
    setTicketsLoading(true);
    setTicketsError(null);
    authApi
      .getMySupportTickets()
      .then((res) => {
        if (!active) return;
        setMyTickets(Array.isArray(res.tickets) ? res.tickets : []);
        setTicketsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setTicketsError(err instanceof Error ? err.message : 'خطا در دریافت تیکت‌های پشتیبانی.');
        setTicketsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, user.id]);

  useEffect(() => {
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setNationalId(user.nationalId || '');
    setBirthDate(user.birthDate || '');
    setNewsletterOptIn(user.newsletterOptIn ?? true);
    setAvatarUrl(user.avatarUrl || '');
    setUsernameInput(user.username || '');
  }, [
    user.id,
    user.username,
    user.fullName,
    user.phone,
    user.nationalId,
    user.birthDate,
    user.newsletterOptIn,
    user.avatarUrl,
  ]);

  useEffect(() => {
    if (activeTab !== 'profile') return;
    const normalized = normalizeUsername(usernameInput);
    if (!normalized) {
      setUsernameCheck({ checking: false, checkedNormalized: '' });
      return;
    }
    if (user.username && normalized === user.username) {
      setUsernameCheck({
        checking: false,
        checkedNormalized: normalized,
        valid: true,
        available: true,
        isCurrent: true,
      });
      return;
    }
    const clientCheck = validateUsername(normalized);
    if (!clientCheck.valid) {
      setUsernameCheck({
        checking: false,
        checkedNormalized: normalized,
        valid: false,
        available: false,
        error: clientCheck.error,
        suggestions: generateUsernameSuggestions(user.email || user.fullName),
      });
      return;
    }

    let active = true;
    setUsernameCheck((prev) => ({ ...prev, checking: true, checkedNormalized: normalized }));
    const timer = window.setTimeout(() => {
      authApi
        .checkUsernameAvailability(normalized, user.email || user.fullName)
        .then((res) => {
          if (!active) return;
          setUsernameCheck({
            checking: false,
            checkedNormalized: res.normalized,
            valid: res.valid,
            available: res.available,
            isCurrent: res.isCurrent,
            error: res.error,
            suggestions: res.suggestions,
          });
        })
        .catch(() => {
          if (!active) return;
          setUsernameCheck({ checking: false, checkedNormalized: normalized });
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [activeTab, user.email, user.fullName, user.username, usernameInput]);

  const defaultUsernameSuggestions = useMemo(
    () =>
      usernameCheck.suggestions && usernameCheck.suggestions.length > 0
        ? usernameCheck.suggestions
        : generateUsernameSuggestions(user.email || user.fullName),
    [user.email, user.fullName, usernameCheck.suggestions]
  );

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('لطفاً فقط فایل تصویر (JPG یا PNG) انتخاب کنید.', 'error');
      return;
    }
    setAvatarBusy(true);
    try {
      const compressed = await resizeAvatarToDataUrl(file);
      if (compressed.length > 140_000) {
        showToast('حجم تصویر پس از فشرده‌سازی همچنان بالاست؛ لطفاً تصویر کوچک‌تری انتخاب کنید.', 'error');
        return;
      }
      setAvatarUrl(compressed);
      const updated = await updateUserProfile({
        fullName: fullName.trim() || user.fullName,
        phone: phone.trim() || user.phone || '',
        nationalId: nationalId.trim(),
        birthDate: birthDate.trim(),
        newsletterOptIn,
        avatarUrl: compressed,
      });
      setAvatarUrl(updated.avatarUrl || compressed);
    } catch (err) {
      setAvatarUrl(user.avatarUrl || '');
      showToast(err instanceof Error ? err.message : 'خطا در بارگذاری تصویر پروفایل.', 'error');
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarBusy(true);
    try {
      setAvatarUrl('');
      await updateUserProfile({
        fullName: fullName.trim() || user.fullName,
        phone: phone.trim() || user.phone || '',
        nationalId: nationalId.trim(),
        birthDate: birthDate.trim(),
        newsletterOptIn,
        avatarUrl: '',
      });
    } catch (err) {
      setAvatarUrl(user.avatarUrl || '');
      showToast(err instanceof Error ? err.message : 'خطا در حذف تصویر پروفایل.', 'error');
    } finally {
      setAvatarBusy(false);
    }
  };

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
        avatarUrl,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره پروفایل.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    const check = validateUsername(usernameInput);
    if (!check.valid) {
      setUsernameError(check.error || 'نام کاربری معتبر نیست.');
      return;
    }
    if (check.normalized === user.username) {
      showToast('این نام کاربری هم‌اکنون روی حساب شما ثبت شده است.', 'info');
      return;
    }
    setSavingUsername(true);
    try {
      const updated = await updateUserUsername(check.normalized);
      setUsernameInput(updated.username || check.normalized);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'خطا در ذخیره نام کاربری.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleCopyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message, 'success');
    } catch {
      showToast(text, 'info');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (user.hasPassword && !deletePassword) {
      setDeleteError('برای تایید حذف حساب کاربری، رمز عبور فعلی را وارد کنید.');
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteUserAccount(user.hasPassword ? deletePassword : undefined);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'خطا در حذف حساب کاربری.');
    } finally {
      setDeleteBusy(false);
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
    { id: 'overview', label: 'نمای کلی حساب', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'profile', label: 'اطلاعات فردی و ایمیل', icon: <UserCheck className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'addresses', label: 'دفترچه آدرس‌ها', icon: <MapPin className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'orders', label: 'سفارش‌های من', icon: <Package className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'wishlist', label: 'علاقه‌مندی‌ها و اعلان موجودی', icon: <Heart className="w-4 h-4" strokeWidth={1.5} /> },
    {
      id: 'notifications',
      label:
        unreadNotificationCount > 0
          ? `اعلان‌ها و پیام‌ها (${toPersianDigits(unreadNotificationCount)})`
          : 'اعلان‌ها و پیام‌ها',
      icon: <Bell className="w-4 h-4" strokeWidth={1.5} />,
    },
    { id: 'tickets', label: 'تیکت‌های پشتیبانی', icon: <MessageSquare className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'security', label: 'امنیت و رمز عبور', icon: <Shield className="w-4 h-4" strokeWidth={1.5} /> },
  ];

  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E8EE] p-5 space-y-5 lg:sticky lg:top-28">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E4E8EE]">
          <div className="w-12 h-12 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] flex items-center justify-center shrink-0 overflow-hidden">
            {avatarUrl || user.avatarUrl ? (
              <img
                src={avatarUrl || user.avatarUrl}
                alt={user.fullName}
                data-testid="sidebar-user-avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCheck className="w-5 h-5" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#11161E] truncate">{user.fullName}</p>
            {user.username ? (
              <a
                href={buildHref(`/u/${user.username}`)}
                onClick={(e) => handleLinkClick(e, `/u/${user.username}`)}
                dir="ltr"
                data-testid="sidebar-username-link"
                className="text-xs font-mono font-medium text-[#1453D6] hover:underline truncate block text-right"
              >
                @{user.username}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className="text-[11px] font-medium text-[#1453D6] hover:underline block"
              >
                + تنظیم نام کاربری
              </button>
            )}
            <p dir="ltr" className="text-xs text-[#4A5464] truncate text-right">
              {user.email}
            </p>
            <p className="text-[11px] font-medium text-[#067647] mt-0.5">
              {user.role === 'admin' ? 'مدیر فروشگاه · تاییدشده' : 'ایمیل تاییدشده'}
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
                onClick={() => handleTabChange(item.id)}
                data-testid={`dashboard-tab-${item.id}`}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap text-right ${
                  active
                    ? 'bg-[#1453D6] text-white font-semibold'
                    : 'bg-[#F7F8FA] lg:bg-transparent text-[#4A5464] hover:bg-[#F1F3F6] hover:text-[#11161E]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-[#E4E8EE] space-y-2">
          {user.role === 'admin' && (
            <a
              href="https://admin-panel-ams.codenameamir.ir/#/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sidebar-admin-panel-link"
              className="w-full h-10 px-3.5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Settings2 className="w-4 h-4" strokeWidth={1.5} />
              <span>ورود به پنل مدیریت</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => logoutDemoUser(false)}
            data-testid="account-logout-btn"
            className="w-full h-10 px-3.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#B42318] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>خروج از حساب کاربری</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div ref={workspaceRef} className="lg:col-span-9 space-y-6 scroll-mt-24">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
                      سلام {user.fullName}
                    </h1>
                    {user.username && (
                      <a
                        href={buildHref(`/u/${user.username}`)}
                        onClick={(e) => handleLinkClick(e, `/u/${user.username}`)}
                        dir="ltr"
                        data-testid="overview-username-badge"
                        className="px-2.5 py-0.5 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] border border-[#D4E2FC] text-[#1453D6] font-mono text-xs font-medium transition-colors"
                      >
                        @{user.username}
                      </a>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A5464] mt-1">
                    نشانی ایمیل <span dir="ltr" className="font-medium text-[#11161E]">{user.email}</span>
                    {user.phone ? ` · موبایل ${toPersianDigits(user.phone)}` : ' · شماره موبایل ثبت نشده'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {user.username && (
                    <a
                      href={buildHref(`/u/${user.username}`)}
                      onClick={(e) => handleLinkClick(e, `/u/${user.username}`)}
                      className="h-10 px-4 rounded-lg bg-[#F7F8FA] hover:bg-[#F1F3F6] border border-[#E4E8EE] text-[#11161E] text-xs font-medium whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#1453D6]" strokeWidth={1.5} />
                      <span>پروفایل عمومی</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTabChange('profile')}
                    className="h-10 px-4 rounded-lg bg-[#F1F3F6] hover:bg-[#E4E8EE] text-[#11161E] text-xs font-medium whitespace-nowrap transition-colors"
                  >
                    ویرایش اطلاعات
                  </button>
                  <a
                    href={buildHref('/catalog')}
                    onClick={(e) => handleLinkClick(e, '/catalog')}
                    className="h-10 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold whitespace-nowrap inline-flex items-center transition-colors"
                  >
                    مشاهده فروشگاه
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E4E8EE]">
                <button
                  type="button"
                  onClick={() => handleTabChange('orders')}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] hover:border-[#DCE1E8] hover:bg-[#F1F3F6] text-right transition-colors"
                >
                  <p className="text-xs text-[#4A5464]">سفارش‌های ثبت‌شده</p>
                  {ordersLoading ? (
                    <SkeletonBox className="h-8 w-12 mt-1.5 rounded-lg" />
                  ) : (
                    <p className="text-2xl font-semibold text-[#11161E] mt-1 tabular-nums-fa">
                      {toPersianDigits(orders.length)}
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('addresses')}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] hover:border-[#DCE1E8] hover:bg-[#F1F3F6] text-right transition-colors"
                >
                  <p className="text-xs text-[#4A5464]">آدرس‌های ذخیره‌شده</p>
                  <p className="text-2xl font-semibold text-[#11161E] mt-1 tabular-nums-fa">
                    {toPersianDigits(addresses.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('wishlist')}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] hover:border-[#DCE1E8] hover:bg-[#F1F3F6] text-right transition-colors"
                >
                  <p className="text-xs text-[#4A5464]">علاقه‌مندی‌ها</p>
                  <p className="text-2xl font-semibold text-[#11161E] mt-1 tabular-nums-fa">
                    {toPersianDigits(wishlistProducts.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('wishlist')}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] hover:border-[#DCE1E8] hover:bg-[#F1F3F6] text-right transition-colors"
                >
                  <p className="text-xs text-[#4A5464]">اعلان موجودی</p>
                  <p className="text-2xl font-semibold text-[#11161E] mt-1 tabular-nums-fa">
                    {toPersianDigits(alertProducts.length)}
                  </p>
                </button>
              </div>
            </section>

            {/* Recent Order Snapshot */}
            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#11161E]">آخرین سفارش‌ها</h2>
                {!ordersLoading && orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('orders')}
                    className="text-xs font-medium text-[#1453D6] hover:underline"
                  >
                    مشاهده همه
                  </button>
                )}
              </div>
              {ordersLoading ? (
                <div
                  role="status"
                  aria-busy="true"
                  aria-label="در حال دریافت سفارش‌های شما"
                  data-testid="overview-orders-skeleton"
                  className="space-y-3"
                >
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                  <p className="text-xs sm:text-sm text-[#4A5464]">
                    هنوز سفارشی در حساب کاربری شما ثبت نشده است.
                  </p>
                  <a
                    href={buildHref('/catalog')}
                    onClick={(e) => handleLinkClick(e, '/catalog')}
                    className="h-10 px-5 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                  >
                    مشاهده فروشگاه و خرید
                  </a>
                </div>
              ) : (
                orders.slice(0, 2).map((ord) => (
                  <div
                    key={ord.orderCode}
                    className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#4A5464]">
                        <strong dir="ltr" className="text-sm text-[#1453D6] font-mono font-semibold">
                          {ord.orderCode}
                        </strong>{' '}
                        · {STATUS_LABELS[ord.status]} · {getPaymentStatusLabel(ord.paymentStatus)} · {ord.createdAt}
                      </p>
                      <p className="text-xs text-[#11161E] tabular-nums-fa">
                        {ord.customerName} · {toPersianDigits(ord.items.length)} کالا ·{' '}
                        <strong className="font-semibold">{formatToman(ord.totalAmount)} تومان</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={buildHref(`/tracking/${ord.orderCode}`)}
                        onClick={(e) => handleLinkClick(e, `/tracking/${ord.orderCode}`)}
                        className="px-3.5 py-2 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center transition-colors"
                      >
                        رهگیری مرسوله
                      </a>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form
              onSubmit={handleSaveProfile}
              noValidate
              className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5"
            >
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">اطلاعات فردی و تماس</h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  این مشخصات برای صدور فاکتور رسمی و رجیستری قانونی همتا استفاده می‌شوند.
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-[#EEF3FC] border border-[#D4E2FC] overflow-hidden flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.fullName}
                        data-testid="profile-avatar-preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-6 h-6 text-[#1453D6]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#11161E]">تصویر پروفایل کاربری</p>
                    <p className="text-[11px] text-[#4A5464]">
                      فرمت‌های JPG / PNG پشتیبانی می‌شوند و تصویر به‌صورت خودکار بهینه می‌گردد.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="h-10 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" strokeWidth={1.5} />
                    <span>{avatarBusy ? 'در حال بارگذاری...' : 'انتخاب / تغییر تصویر'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={avatarBusy}
                      onChange={handleAvatarUpload}
                      data-testid="avatar-upload-input"
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      disabled={avatarBusy}
                      onClick={handleRemoveAvatar}
                      data-testid="remove-avatar-btn"
                      className="h-10 px-3.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#B42318] text-xs font-medium transition-colors"
                    >
                      حذف تصویر
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="prof-fullname" className="text-xs font-medium text-[#11161E] block">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="prof-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  {profileErrors.fullName && (
                    <p className="text-[11px] font-medium text-[#B42318]">{profileErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-phone" className="text-xs font-medium text-[#11161E] block">
                    شماره موبایل
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  {profileErrors.phone && (
                    <p className="text-[11px] font-medium text-[#B42318]">{profileErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-national-id" className="text-xs font-medium text-[#11161E] block">
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
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  {profileErrors.nationalId && (
                    <p className="text-[11px] font-medium text-[#B42318]">{profileErrors.nationalId}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prof-birthdate" className="text-xs font-medium text-[#11161E] block">
                    تاریخ تولد (اختیاری)
                  </label>
                  <input
                    id="prof-birthdate"
                    type="text"
                    dir="ltr"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="1376/04/18"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#11161E] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="w-4 h-4 accent-[#1453D6]"
                />
                <span>اطلاع‌رسانی جشنواره‌ها و پیشنهادات ویژه از طریق ایمیل</span>
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  data-testid="save-profile-btn"
                  className="h-11 px-6 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  {savingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات پروفایل'}
                </button>
              </div>
            </form>

            {/* Username & Public Profile Card */}
            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-[#1453D6]" strokeWidth={1.5} />
                    <span>نام کاربری و پروفایل عمومی</span>
                  </h2>
                  <p className="text-xs text-[#4A5464] mt-1 leading-6">
                    با ثبت نام کاربری اختصاصی، می‌توانید با{' '}
                    <span dir="ltr" className="font-mono font-medium text-[#11161E]">
                      @username
                    </span>{' '}
                    وارد حساب شوید و لینک پروفایل عمومی خود را به اشتراک بگذارید.
                  </p>
                </div>

                {user.username && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `@${user.username}`,
                          'نام کاربری در حافظه کپی شد.'
                        )
                      }
                      className="h-9 px-3 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span dir="ltr" className="font-mono">
                        @{user.username}
                      </span>
                    </button>
                    <a
                      href={buildHref(`/u/${user.username}`)}
                      onClick={(e) => handleLinkClick(e, `/u/${user.username}`)}
                      data-testid="view-public-profile-link"
                      className="h-9 px-3 rounded-lg bg-[#13171F] hover:bg-[#1453D6] text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>مشاهده صفحه عمومی</span>
                    </a>
                  </div>
                )}
              </div>

              {usernameError && (
                <p className="p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-medium">
                  {usernameError}
                </p>
              )}

              <form onSubmit={handleSaveUsername} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="prof-username" className="text-xs font-medium text-[#11161E]">
                    نام کاربری (۳ تا ۲۴ کاراکتر انگلیسی، عدد، نقطه و خط زیر)
                  </label>
                  {normalizeUsername(usernameInput) && (
                    <span
                      data-testid="profile-username-availability"
                      className={`text-[11px] font-medium ${
                        usernameCheck.checking
                          ? 'text-[#4A5464]'
                          : usernameCheck.isCurrent
                          ? 'text-[#1453D6]'
                          : usernameCheck.available
                          ? 'text-[#067647]'
                          : 'text-[#B42318]'
                      }`}
                    >
                      {usernameCheck.checking
                        ? 'در حال بررسی...'
                        : usernameCheck.isCurrent
                        ? 'نام کاربری فعلی شما'
                        : usernameCheck.available
                        ? 'قابل انتخاب است ✓'
                        : usernameCheck.error || 'قبلاً انتخاب شده'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      id="prof-username"
                      type="text"
                      dir="ltr"
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        setUsernameError(null);
                      }}
                      placeholder="amir_mobile"
                      data-testid="profile-username-input"
                      className="w-full h-11 pr-3.5 pl-9 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] font-mono text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    <AtSign className="w-4 h-4 text-[#1453D6] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  </div>
                  <button
                    type="submit"
                    disabled={savingUsername}
                    data-testid="save-username-btn"
                    className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                  >
                    <span>
                      {savingUsername
                        ? 'در حال ثبت...'
                        : user.username
                        ? 'تغییر نام کاربری'
                        : 'ثبت نام کاربری'}
                    </span>
                  </button>
                </div>

                {defaultUsernameSuggestions.length > 0 && !usernameCheck.available && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[#4A5464]">پیشنهادها:</span>
                    {defaultUsernameSuggestions.slice(0, 4).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        dir="ltr"
                        onClick={() => {
                          setUsernameInput(sug);
                          setUsernameError(null);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] font-mono text-[11px] font-medium transition-colors"
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                )}

                {user.username && (
                  <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#4A5464]">
                      نشانی صفحه عمومی شما:{' '}
                      <span dir="ltr" className="font-mono font-medium text-[#1453D6]">
                        /u/{user.username}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `${window.location.origin}/u/${user.username}`,
                          'لینک صفحه عمومی کپی شد.'
                        )
                      }
                      className="text-[11px] font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" strokeWidth={1.5} />
                      <span>کپی لینک عمومی</span>
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Change Email with Resend Verification */}
            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#11161E]">تغییر آدرس ایمیل حساب</h2>
                <p className="text-xs text-[#4A5464] mt-1">
                  ایمیل فعلی: <span dir="ltr" className="font-medium text-[#11161E]">{user.email}</span> · برای تغییر ایمیل، کد تایید ۶ رقمی از طریق Resend به نشانی جدید ارسال می‌شود.
                </p>
              </div>

              {emailChangeErr && (
                <p className="p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-medium">
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
                    className="flex-1 h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  <button
                    type="submit"
                    disabled={emailChangeBusy}
                    className="h-11 px-5 rounded-lg bg-[#13171F] hover:bg-[#1453D6] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    <span>{emailChangeBusy ? 'در حال ارسال...' : 'ارسال کد تایید به ایمیل جدید'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-3">
                  {emailChangePending.provider === 'sandbox-preview' && emailChangePending.previewCode && (
                    <p className="text-xs text-[#1453D6] font-medium">
                      کد پیش‌نمایش تغییر ایمیل:{' '}
                      <span dir="ltr" className="font-mono font-semibold">
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
                      className="flex-1 h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-center font-mono text-sm text-[#11161E]"
                    />
                    <button
                      type="submit"
                      disabled={emailChangeBusy}
                      className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold whitespace-nowrap transition-colors"
                    >
                      تایید و ثبت ایمیل جدید
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailChangePending(null)}
                      className="h-11 px-4 rounded-lg bg-[#F1F3F6] text-[#4A5464] text-xs font-medium whitespace-nowrap"
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
          <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">دفترچه آدرس‌های ارسال</h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  آدرس پیش‌فرض شما به‌صورت خودکار در فرم تسویه حساب انتخاب می‌شود.
                </p>
              </div>
              {!addressFormOpen && (
                <button
                  type="button"
                  onClick={openNewAddressForm}
                  data-testid="open-new-address-btn"
                  className="h-10 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>افزودن آدرس جدید</span>
                </button>
              )}
            </div>

            {addressFormOpen && (
              <form
                onSubmit={handleSaveAddress}
                noValidate
                className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#11161E]">
                    {editingAddressId ? 'ویرایش آدرس' : 'ثبت آدرس جدید'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="text-xs font-medium text-[#4A5464] hover:text-[#11161E]"
                  >
                    بستن
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="addr-label" className="text-xs font-medium text-[#11161E] block">
                      عنوان آدرس (مثال: منزل، محل کار)
                    </label>
                    <input
                      id="addr-label"
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                      placeholder="منزل"
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    {addressErrors.label && (
                      <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.label}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-receiver" className="text-xs font-medium text-[#11161E] block">
                      نام و نام خانوادگی تحویل‌گیرنده
                    </label>
                    <input
                      id="addr-receiver"
                      type="text"
                      value={addressForm.receiverName}
                      onChange={(e) => setAddressForm((p) => ({ ...p, receiverName: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    {addressErrors.receiverName && (
                      <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.receiverName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-phone" className="text-xs font-medium text-[#11161E] block">
                      شماره موبایل تحویل‌گیرنده
                    </label>
                    <input
                      id="addr-phone"
                      type="tel"
                      dir="ltr"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="09123456789"
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    {addressErrors.phone && (
                      <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-city" className="text-xs font-medium text-[#11161E] block">
                      استان / شهر
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    {addressErrors.city && (
                      <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="addr-postal" className="text-xs font-medium text-[#11161E] block">
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
                      className="w-full h-10 px-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                    {addressErrors.postalCode && (
                      <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.postalCode}</p>
                    )}
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-[#11161E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                        className="w-4 h-4 accent-[#1453D6]"
                      />
                      <span>تنظیم به عنوان آدرس پیش‌فرض</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="addr-full" className="text-xs font-medium text-[#11161E] block">
                    نشانی کامل پستی
                  </label>
                  <textarea
                    id="addr-full"
                    rows={2}
                    value={addressForm.address}
                    onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="خیابان، کوچه، پلاک، طبقه و واحد"
                    className="w-full p-3 rounded-lg bg-white border border-[#E4E8EE] text-xs text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  {addressErrors.address && (
                    <p className="text-[11px] font-medium text-[#B42318]">{addressErrors.address}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="h-10 px-4 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#4A5464]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    data-testid="save-address-btn"
                    className="h-10 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold transition-colors"
                  >
                    {savingAddress ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#4A5464]">
                  هنوز آدرسی در دفترچه حساب خود ثبت نکرده‌اید.
                </p>
                {!addressFormOpen && (
                  <button
                    type="button"
                    onClick={openNewAddressForm}
                    className="h-10 px-4 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium transition-colors"
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
                    className={`p-5 rounded-xl border space-y-3 ${
                      addr.isDefault
                        ? 'bg-[#EEF3FC] border-[#1453D6]'
                        : 'bg-[#F7F8FA] border-[#E4E8EE]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#11161E]">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="mr-2 text-[11px] font-medium text-[#1453D6]">
                            · پیش‌فرض
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditAddressForm(addr)}
                          aria-label={`ویرایش آدرس ${addr.label}`}
                          className="p-1.5 rounded-lg bg-white border border-[#E4E8EE] text-[#4A5464] hover:text-[#1453D6] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUserAddress(addr.id)}
                          aria-label={`حذف آدرس ${addr.label}`}
                          className="p-1.5 rounded-lg bg-white border border-[#E4E8EE] text-[#B42318] hover:bg-[#FEF3F2] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#11161E] leading-6">
                      {addr.city}، {addr.address}
                    </p>
                    <p className="text-[11px] text-[#4A5464] tabular-nums-fa">
                      تحویل‌گیرنده: {addr.receiverName} · {toPersianDigits(addr.phone)} · کد پستی:{' '}
                      {toPersianDigits(addr.postalCode)}
                    </p>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultUserAddress(addr.id)}
                        className="text-xs font-medium text-[#1453D6] hover:underline"
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
          <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg sm:text-xl font-semibold text-[#11161E]">
                {ordersLoading
                  ? 'سفارش‌های ثبت‌شده'
                  : `سفارش‌های ثبت‌شده (${toPersianDigits(filteredOrders.length)})`}
              </h1>
              <div className="flex items-center gap-1 p-1 bg-[#F1F3F6] border border-[#E4E8EE] rounded-lg overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'all', label: 'همه' },
                    { id: 'pending_payment', label: 'در انتظار پرداخت' },
                    { id: 'paid', label: 'پرداخت موفق' },
                    { id: 'preparing', label: 'در حال آماده‌سازی' },
                    { id: 'shipped', label: 'ارسال‌شده' },
                    { id: 'delivered', label: 'تحویل‌شده' },
                    { id: 'cancelled', label: 'لغو شده' },
                    { id: 'expired', label: 'منقضی‌شده' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      orderStatusFilter === f.id
                        ? 'bg-white text-[#1453D6] font-semibold border border-[#E4E8EE]'
                        : 'text-[#4A5464] hover:text-[#11161E]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div
                role="status"
                aria-busy="true"
                aria-label="در حال دریافت سفارش‌های شما"
                data-testid="orders-skeleton"
                className="space-y-3"
              >
                <OrderRowSkeleton />
                <OrderRowSkeleton />
                <OrderRowSkeleton />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#4A5464]">
                  هنوز سفارشی در حساب کاربری شما ثبت نشده است.
                </p>
                <a
                  href={buildHref('/catalog')}
                  onClick={(e) => handleLinkClick(e, '/catalog')}
                  className="h-10 px-5 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                >
                  شروع خرید از فروشگاه
                </a>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#4A5464]">
                  سفارشی با این وضعیت یافت نشد.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.orderCode}
                    className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#4A5464]">
                        <span dir="ltr" className="text-sm font-mono font-semibold text-[#1453D6]">
                          {ord.orderCode}
                        </span>{' '}
                        · {STATUS_LABELS[ord.status]} · {getPaymentStatusLabel(ord.paymentStatus)} · {ord.createdAt}
                      </p>
                      <p className="text-xs text-[#4A5464]">
                        تحویل‌گیرنده: {ord.customerName} · {toPersianDigits(ord.items.length)} کالا ·{' '}
                        <strong className="text-[#11161E] font-semibold tabular-nums-fa">
                          {formatToman(ord.totalAmount)} تومان
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={reorderingCode === ord.orderCode}
                        onClick={async () => {
                          setReorderingCode(ord.orderCode);
                          try {
                            await reorderFromOrder(ord);
                          } finally {
                            setReorderingCode(null);
                          }
                        }}
                        data-testid={`reorder-btn-${ord.orderCode}`}
                        className="px-3.5 py-2 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-xs font-medium text-[#1453D6] hover:bg-[#1453D6] hover:text-white disabled:opacity-60 inline-flex items-center transition-colors"
                      >
                        {reorderingCode === ord.orderCode ? 'در حال بررسی...' : 'تکرار خرید'}
                      </button>

                      {(ord.status === 'pending_payment' ||
                        ord.status === 'paid' ||
                        ord.status === 'preparing') &&
                        (confirmCancelCode === ord.orderCode ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FEF3F2] border border-[#FECDCA]">
                            <button
                              type="button"
                              disabled={cancellingOrderCode === ord.orderCode}
                              data-testid={`confirm-cancel-${ord.orderCode}`}
                              onClick={async () => {
                                setCancellingOrderCode(ord.orderCode);
                                try {
                                  await cancelCustomerOrder(ord.orderCode);
                                  setConfirmCancelCode(null);
                                } catch (err) {
                                  showToast(
                                    err instanceof Error
                                      ? err.message
                                      : 'لغو سفارش امکان‌پذیر نیست.',
                                    'error'
                                  );
                                } finally {
                                  setCancellingOrderCode(null);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-[#B42318] text-white text-[11px] font-semibold disabled:opacity-60"
                            >
                              {cancellingOrderCode === ord.orderCode ? '...' : 'تایید لغو'}
                            </button>
                            <button
                              type="button"
                              disabled={cancellingOrderCode === ord.orderCode}
                              onClick={() => setConfirmCancelCode(null)}
                              className="px-2 py-1 rounded bg-white border border-[#E4E8EE] text-[#4A5464] text-[11px]"
                            >
                              انصراف
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelCode(ord.orderCode)}
                            data-testid={`cancel-order-${ord.orderCode}`}
                            className="px-3.5 py-2 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs font-medium text-[#B42318] hover:bg-[#FEE4E2] inline-flex items-center transition-colors"
                          >
                            لغو سفارش
                          </button>
                        ))}

                      <a
                        href={buildHref(`/order-confirmed/${ord.orderCode}`)}
                        onClick={(e) => handleLinkClick(e, `/order-confirmed/${ord.orderCode}`)}
                        className="px-3.5 py-2 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#11161E] hover:border-[#1453D6] hover:text-[#1453D6] inline-flex items-center transition-colors"
                      >
                        مشاهده فاکتور
                      </a>
                      <a
                        href={buildHref(`/tracking/${ord.orderCode}`)}
                        onClick={(e) => handleLinkClick(e, `/tracking/${ord.orderCode}`)}
                        className="px-3.5 py-2 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center transition-colors"
                      >
                        رهگیری مرسوله
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <div>
                <h1 className="text-lg font-semibold text-[#11161E]">
                  لیست علاقه‌مندی‌ها ({toPersianDigits(wishlistProducts.length)})
                </h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  محصولات منتخب شما در حساب کاربری و پایگاه داده ذخیره می‌شوند و در همه دستگاه‌ها در دسترس هستند.
                </p>
              </div>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                  <p className="text-xs sm:text-sm text-[#4A5464]">
                    هنوز محصولی به لیست علاقه‌مندی‌های خود اضافه نکرده‌اید.
                  </p>
                  <a
                    href={buildHref('/catalog')}
                    onClick={(e) => handleLinkClick(e, '/catalog')}
                    className="h-10 px-5 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                  >
                    گشت‌وگذار در فروشگاه
                  </a>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1453D6]" strokeWidth={1.5} />
                <span>اعلان‌های موجودی کالا ({toPersianDigits(alertProducts.length)})</span>
              </h2>
              {alertProducts.length === 0 ? (
                <p className="text-xs text-[#4A5464]">
                  برای هیچ کالای ناموجودی درخواست اطلاع‌رسانی ثبت نکرده‌اید.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {alertProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] flex items-center justify-between gap-3"
                    >
                      <a
                        href={buildHref(`/product/${p.slug}`)}
                        onClick={(e) => handleLinkClick(e, `/product/${p.slug}`)}
                        className="text-xs font-medium text-[#11161E] hover:text-[#1453D6] text-right transition-colors"
                      >
                        {p.nameFa}
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleStockAlert(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#B42318] hover:bg-[#FEF3F2] shrink-0 transition-colors"
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

        {activeTab === 'notifications' && (
          <section
            data-testid="account-notifications-panel"
            className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#11161E] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
                  <span>مرکز اعلان‌ها و پیام‌ها</span>
                </h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  اطلاع‌رسانی شارژ مجدد کالاهای ناموجود، وضعیت سفارش‌ها و پیام‌های سیستم در این بخش ثبت می‌شوند.
                </p>
              </div>
              {unreadNotificationCount > 0 && (
                <button
                  type="button"
                  data-testid="account-mark-all-read-btn"
                  onClick={() => void markAllNotificationsRead()}
                  className="h-10 px-4 rounded-lg bg-[#EEF3FC] hover:bg-[#DCE7FA] text-[#1453D6] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" strokeWidth={1.5} />
                  <span>علامت‌گذاری همه به‌عنوان خوانده‌شده</span>
                </button>
              )}
            </div>

            {notificationsLoading && notifications.length === 0 ? (
              <div className="space-y-3" aria-busy="true">
                <OrderRowSkeleton />
                <OrderRowSkeleton />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-2">
                <p className="text-xs sm:text-sm text-[#4A5464]">
                  هنوز اعلانی برای حساب کاربری شما ثبت نشده است.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const safeInternalLink =
                    typeof notif.link === 'string' && notif.link.startsWith('/') ? notif.link : null;
                  return (
                    <div
                      key={notif.id}
                      data-testid={`notification-item-${notif.id}`}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        notif.isRead
                          ? 'bg-[#F7F8FA] border-[#E4E8EE]'
                          : 'bg-[#EEF3FC]/60 border-[#D4E2FC]'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#1453D6] shrink-0" />}
                          <h2 className="text-xs sm:text-sm font-semibold text-[#11161E]">
                            {notif.title}
                          </h2>
                          <span className="text-[11px] text-[#576071] tabular-nums-fa">
                            · {formatPersianDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5464] leading-6">{notif.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {safeInternalLink && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!notif.isRead) void markNotificationRead(notif.id);
                              navigate(safeInternalLink);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-medium transition-colors"
                          >
                            مشاهده
                          </button>
                        )}
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(notif.id)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#E4E8EE] hover:border-[#1453D6] text-xs font-medium text-[#11161E] transition-colors"
                          >
                            خوانده شد
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label={`حذف اعلان ${notif.title}`}
                          onClick={() => void deleteNotification(notif.id)}
                          className="p-2 rounded-lg bg-white border border-[#E4E8EE] text-[#B42318] hover:bg-[#FEF3F2] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'tickets' && (
          <section
            data-testid="account-tickets-panel"
            className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#11161E] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
                  <span>تاریخچه تیکت‌های پشتیبانی</span>
                </h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  تمام درخواست‌های ثبت‌شده با حساب کاربری یا شماره موبایل شما همراه با پاسخ کارشناسان نمایش داده می‌شوند.
                </p>
              </div>
              <a
                href={buildHref('/contact')}
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="h-10 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>ثبت تیکت جدید</span>
              </a>
            </div>

            {ticketsError && (
              <p className="p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-medium">
                {ticketsError}
              </p>
            )}

            {ticketsLoading ? (
              <div className="space-y-3" aria-busy="true">
                <OrderRowSkeleton />
                <OrderRowSkeleton />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#4A5464]">
                  هنوز تیکت پشتیبانی برای حساب شما ثبت نشده است.
                </p>
                <a
                  href={buildHref('/contact')}
                  onClick={(e) => handleLinkClick(e, '/contact')}
                  className="h-10 px-5 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-[#1453D6] text-xs font-medium inline-flex items-center transition-colors"
                >
                  ارسال اولین پیام پشتیبانی
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => {
                  const statusInfo =
                    ticket.status === 'resolved'
                      ? {
                          label: 'پاسخ‌داده‌شده / بسته',
                          cls: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
                        }
                      : ticket.status === 'in_progress'
                      ? {
                          label: 'در حال بررسی کارشناس',
                          cls: 'bg-[#EEF3FC] text-[#1453D6] border-[#D4E2FC]',
                        }
                      : {
                          label: 'باز · در صف پاسخ‌گویی',
                          cls: 'bg-[#FDF1E8] text-[#A84500] border-[#F5D6BE]',
                        };

                  return (
                    <div
                      key={ticket.ticketCode}
                      data-testid={`ticket-card-${ticket.ticketCode}`}
                      className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span dir="ltr" className="font-mono font-semibold text-[#1453D6]">
                            {ticket.ticketCode}
                          </span>
                          <span className="text-[#4A5464]">· {ticket.department}</span>
                          {ticket.orderCode && (
                            <span dir="ltr" className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-[#E4E8EE] text-[#11161E]">
                              سفارش {ticket.orderCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${statusInfo.cls}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-[11px] text-[#576071] tabular-nums-fa">
                            {formatPersianDate(ticket.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#11161E] leading-6 whitespace-pre-line">
                        {ticket.message}
                      </p>

                      {ticket.adminReply && (
                        <div className="p-3.5 rounded-lg bg-[#ECFDF3]/70 border border-[#ABEFC6] space-y-1">
                          <p className="text-[11px] font-semibold text-[#067647]">
                            پاسخ پشتیبانی فروشگاه امیر:
                          </p>
                          <p className="text-xs text-[#11161E] leading-6 whitespace-pre-line">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form
              onSubmit={handlePasswordChange}
              noValidate
              className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4"
            >
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#11161E] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
                  <span>{user.hasPassword ? 'تغییر رمز عبور' : 'تنظیم رمز عبور برای حساب'}</span>
                </h1>
                <p className="text-xs text-[#4A5464] mt-1">
                  {user.hasPassword
                    ? 'پس از تغییر رمز عبور، ایمیل اطلاع‌رسانی امنیتی از طریق Resend برایتان ارسال می‌شود.'
                    : 'شما با کد تایید ایمیل وارد شده‌اید؛ در صورت تمایل می‌توانید یک رمز عبور نیز برای ورود سریع‌تر تنظیم کنید.'}
                </p>
              </div>

              {passwordError && (
                <p className="p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-medium">
                  {passwordError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {user.hasPassword && (
                  <div className="space-y-1.5">
                    <label htmlFor="sec-cur-pw" className="text-xs font-medium text-[#11161E] block">
                      رمز عبور فعلی
                    </label>
                    <input
                      id="sec-cur-pw"
                      type="password"
                      dir="ltr"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="sec-new-pw" className="text-xs font-medium text-[#11161E] block">
                    رمز عبور جدید
                  </label>
                  <input
                    id="sec-new-pw"
                    type="password"
                    dir="ltr"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                  {newPassword && (
                    <p className="text-[11px] text-[#4A5464]">
                      قدرت: <strong className="font-semibold">{pwStrength.labelFa}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sec-confirm-pw" className="text-xs font-medium text-[#11161E] block">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    id="sec-confirm-pw"
                    type="password"
                    dir="ltr"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="h-11 px-6 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  {savingPassword ? 'در حال ثبت...' : 'ذخیره رمز عبور'}
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication (2FA) */}
            <form
              onSubmit={handleToggleTwoFactor}
              noValidate
              className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#11161E] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#1453D6]" strokeWidth={1.5} />
                    <span>تایید دومرحله‌ای (2FA) با ایمیل</span>
                  </h2>
                  <p className="text-xs text-[#4A5464] mt-1 leading-6">
                    با فعال‌سازی این گزینه، هنگام ورود به حساب ابتدا رمز عبور شما بررسی می‌شود و سپس کد تایید ۶ رقمی به ایمیلتان ارسال خواهد شد.
                  </p>
                </div>
                <span
                  data-testid="two-factor-status-badge"
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    user.twoFactorEnabled
                      ? 'bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]'
                      : 'bg-[#F7F8FA] text-[#4A5464] border border-[#E4E8EE]'
                  }`}
                >
                  {user.twoFactorEnabled ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {twoFactorErr && (
                <p className="p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-medium">
                  {twoFactorErr}
                </p>
              )}

              {!user.hasPassword ? (
                <p className="p-3.5 rounded-lg bg-[#EEF3FC] border border-[#D4E2FC] text-xs text-[#11161E] leading-6">
                  برای فعال‌سازی تایید دومرحله‌ای، ابتدا باید از فرم «تنظیم رمز عبور برای حساب» در بالا یک رمز عبور ثبت کنید.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label htmlFor="two-factor-pw" className="text-xs font-medium text-[#11161E] block">
                      رمز عبور فعلی برای تایید
                    </label>
                    <input
                      id="two-factor-pw"
                      type="password"
                      dir="ltr"
                      value={twoFactorPw}
                      onChange={(e) => setTwoFactorPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs text-left text-[#11161E] focus:outline-none focus:border-[#1453D6]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={twoFactorBusy}
                    data-testid="toggle-two-factor-btn"
                    className={`h-11 px-5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      user.twoFactorEnabled
                        ? 'bg-[#FEF3F2] border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#B42318]'
                        : 'bg-[#1453D6] hover:bg-[#0F44B5] text-white'
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

            <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-[#11161E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#067647]" strokeWidth={1.5} />
                  <span>مدیریت نشست‌های فعال</span>
                </h2>
                <p className="text-xs text-[#4A5464]">
                  اگر در دستگاه دیگری وارد حساب خود شده‌اید، می‌توانید همه نشست‌های فعال را یکجا ببندید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => logoutDemoUser(true)}
                data-testid="logout-all-devices-btn"
                className="h-11 px-5 rounded-lg bg-[#FDF1E8] hover:bg-[#FCE6D6] text-[#A84500] border border-[#F5D6BE] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
              >
                خروج از همه دستگاه‌ها
              </button>
            </section>

            {/* Delete Account Section */}
            <section className="bg-white rounded-2xl border border-[#FECDCA] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-[#B42318] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B42318]" strokeWidth={1.5} />
                    <span>حذف دائمی حساب کاربری</span>
                  </h2>
                  <p className="text-xs text-[#4A5464] leading-6">
                    با حذف حساب کاربری، اطلاعات پروفایل، آدرس‌ها، لیست علاقه‌مندی و همه نشست‌های فعال شما به‌طور دائمی پاک می‌شوند.
                  </p>
                </div>
                {!deleteConfirmOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmOpen(true);
                      setDeleteError(null);
                    }}
                    data-testid="open-delete-account-btn"
                    className="h-11 px-5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#B42318] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                  >
                    حذف حساب کاربری
                  </button>
                )}
              </div>

              {deleteConfirmOpen && (
                <form
                  onSubmit={handleDeleteAccount}
                  data-testid="delete-account-confirm-box"
                  className="p-4 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] space-y-3"
                >
                  <p className="text-xs font-medium text-[#B42318]">
                    آیا از حذف دائمی حساب خود مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                  </p>
                  {deleteError && (
                    <p className="text-xs font-medium text-[#B42318] bg-white p-2.5 rounded-lg border border-[#FECDCA]">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    {user.hasPassword && (
                      <div className="flex-1 space-y-1">
                        <label htmlFor="delete-account-pw" className="text-xs font-medium text-[#11161E] block">
                          رمز عبور فعلی برای تایید حذف
                        </label>
                        <input
                          id="delete-account-pw"
                          type="password"
                          dir="ltr"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="••••••••"
                          data-testid="delete-account-password"
                          className="w-full h-10 px-3 rounded-lg bg-white border border-[#FECDCA] text-xs text-left text-[#11161E]"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={deleteBusy}
                      data-testid="confirm-delete-account-btn"
                      className="h-10 px-5 rounded-lg bg-[#B42318] hover:bg-[#912018] text-white text-xs font-semibold whitespace-nowrap transition-colors"
                    >
                      {deleteBusy ? 'در حال حذف...' : 'تایید و حذف دائمی حساب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmOpen(false);
                        setDeletePassword('');
                        setDeleteError(null);
                      }}
                      className="h-10 px-4 rounded-lg bg-white border border-[#E4E8EE] text-xs font-medium text-[#4A5464] whitespace-nowrap"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
