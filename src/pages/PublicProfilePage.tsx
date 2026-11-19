import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Share2,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  UserX,
} from 'lucide-react';
import { SkeletonBox } from '../components/Skeleton';
import { useStore } from '../context/StoreContext';
import { authApi } from '../lib/authApi';
import type { PublicUserProfile } from '../types/store';
import { normalizeUsername, validateUsername } from '../utils/authLogic';
import { formatPersianDate } from '../utils/storeLogic';

interface PublicProfilePageProps {
  username: string;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ username }) => {
  const { user, buildHref, handleLinkClick, showToast } = useStore();
  const normalized = normalizeUsername(username);
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'username' | 'link' | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg(null);
    setProfile(null);

    const validation = validateUsername(normalized);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'فرمت نام کاربری معتبر نیست.');
      setLoading(false);
      return;
    }

    authApi
      .getPublicProfile(validation.normalized)
      .then((res) => {
        if (!active) return;
        setProfile(res.profile);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err instanceof Error ? err.message : 'پروفایل مورد نظر یافت نشد.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [normalized]);

  const isOwnProfile = Boolean(user?.username && profile && user.username === profile.username);

  const handleCopy = async (type: 'username' | 'link') => {
    if (!profile) return;
    const text =
      type === 'username'
        ? `@${profile.username}`
        : `${window.location.origin}/u/${profile.username}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      showToast(
        type === 'username' ? 'نام کاربری در حافظه کپی شد.' : 'لینک پروفایل عمومی در حافظه کپی شد.',
        'success'
      );
      window.setTimeout(() => setCopiedType(null), 2200);
    } catch {
      showToast(text, 'info');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12" aria-busy="true">
        <div className="bg-white rounded-3xl border border-[#e5eeff] p-8 space-y-6">
          <div className="flex items-center gap-5">
            <SkeletonBox className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="space-y-3 flex-1">
              <SkeletonBox className="h-6 w-48 rounded-lg" />
              <SkeletonBox className="h-4 w-32 rounded-lg" />
            </div>
          </div>
          <SkeletonBox className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile || errorMsg) {
    return (
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-16">
        <div
          data-testid="public-profile-not-found"
          className="bg-white rounded-3xl border border-[#e5eeff] p-8 sm:p-10 text-center space-y-5 shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <UserX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              پروفایل کاربری یافت نشد
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] leading-6">
              {errorMsg || `کاربری با شناسه @${normalized} در فروشگاه موبایل امیر ثبت نشده است.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="h-11 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>مشاهده محصولات فروشگاه</span>
            </a>
            <a
              href={buildHref('/')}
              onClick={(e) => handleLinkClick(e, '/')}
              className="h-11 px-5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const joinedLabel = formatPersianDate(profile.memberSince);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10 space-y-6">
      <section
        data-testid="public-profile-card"
        className="bg-white rounded-3xl border border-[#e5eeff] overflow-hidden shadow-xs"
      >
        <div className="h-24 sm:h-28 bg-gradient-to-l from-[#004ac6] via-[#1d4ed8] to-[#213145]" />
        <div className="px-6 sm:px-8 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="-mt-14 sm:-mt-16 w-24 h-24 rounded-3xl bg-white p-1.5 shadow-md border border-[#dce9ff] shrink-0">
                <div className="w-full h-full rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck className="w-10 h-10" />
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile.role === 'admin' ? 'مدیر فروشگاه امیر' : 'عضو تاییدشده'}
                  </span>
                </div>
                <p
                  dir="ltr"
                  data-testid="public-profile-username"
                  className="text-sm font-mono font-bold text-[#004ac6] text-right"
                >
                  @{profile.username}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy('username')}
                className="h-10 px-3.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                {copiedType === 'username' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>کپی نام کاربری</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy('link')}
                className="h-10 px-3.5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                {copiedType === 'link' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>اشتراک‌گذاری پروفایل</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#eff4ff]">
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <p className="text-[11px] font-bold text-[#434655] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>تاریخ عضویت</span>
              </p>
              <p className="text-sm font-extrabold text-[#0b1c30] tabular-nums-fa">
                {joinedLabel || 'عضو فروشگاه'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-1">
              <p className="text-[11px] font-bold text-[#434655]">حریم خصوصی پروفایل عمومی</p>
              <p className="text-xs text-[#0b1c30] leading-6">
                اطلاعات تماس، ایمیل، نشانی‌ها و سوابق سفارش در صفحه عمومی نمایش داده نمی‌شوند.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="h-10 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center justify-center gap-1.5 w-full sm:w-auto transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ورود به کاتالوگ محصولات</span>
            </a>

            {isOwnProfile && (
              <a
                href={buildHref('/account')}
                onClick={(e) => handleLinkClick(e, '/account')}
                className="h-10 px-4 rounded-xl bg-[#213145] hover:bg-[#004ac6] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 w-full sm:w-auto transition-colors"
              >
                <span>مدیریت نام کاربری در پنل حساب</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
