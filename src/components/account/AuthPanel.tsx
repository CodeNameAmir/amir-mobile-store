import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authApi, type SendOtpResponse } from '../../lib/authApi';
import type { OtpPurpose } from '../../types/store';
import {
  getPasswordStrength,
  isValidEmail,
  isValidOtpCode,
  normalizeEmail,
  normalizeOtpCode,
  validateSignupForm,
} from '../../utils/authLogic';
import { toPersianDigits } from '../../utils/storeLogic';

type AuthTab = 'otp-login' | 'password-login' | 'signup' | 'reset-password';

interface OtpPendingState {
  email: string;
  purpose: OtpPurpose;
  provider: 'resend' | 'sandbox-preview';
  previewCode?: string;
  warning?: string;
  cooldown: number;
}

export const AuthPanel: React.FC = () => {
  const { setAuthenticatedUser, showToast, resendStatus } = useStore();

  const [tab, setTab] = useState<AuthTab>('otp-login');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Shared / Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);

  // Reset password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  // OTP Verification state
  const [otpPending, setOtpPending] = useState<OtpPendingState | null>(null);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (!otpPending || otpPending.cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpPending((prev) =>
        prev && prev.cooldown > 0 ? { ...prev, cooldown: prev.cooldown - 1 } : prev
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpPending?.cooldown, otpPending?.email]);

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setErrorMsg(null);
    setFieldErrors({});
    setOtpPending(null);
    setOtpCode('');
  };

  const applyOtpResponse = (email: string, purpose: OtpPurpose, res: SendOtpResponse) => {
    setOtpPending({
      email,
      purpose,
      provider: res.provider,
      previewCode: res.previewCode,
      warning: res.warning,
      cooldown: res.cooldownSeconds || 60,
    });
    setOtpCode('');
    if (res.provider === 'resend') {
      showToast('کد تایید ۶ رقمی به ایمیل شما ارسال شد.', 'success');
    } else {
      showToast('کد تایید آزمایشی صادر شد (حالت پیش‌نمایش Resend).', 'info');
    }
  };

  const handleRequestOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const email = normalizeEmail(loginEmail);
    if (!isValidEmail(email)) {
      setFieldErrors({ loginEmail: 'لطفاً یک آدرس ایمیل معتبر وارد کنید.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({ email, purpose: 'login' });
      applyOtpResponse(email, 'login', res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ارسال کد تایید.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const email = normalizeEmail(loginEmail);
    const nextErrors: Record<string, string> = {};
    if (!isValidEmail(email)) {
      nextErrors.loginEmail = 'آدرس ایمیل معتبر وارد کنید.';
    }
    if (!loginPassword) {
      nextErrors.loginPassword = 'رمز عبور را وارد کنید.';
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await authApi.loginWithPassword({ email, password: loginPassword });
      if (res.user) {
        setAuthenticatedUser(res.user);
        showToast(`خوش آمدید، ${res.user.fullName}!`, 'success');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ورود به حساب کاربری.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors = validateSignupForm({
      fullName: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const email = normalizeEmail(signupEmail);
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({
        email,
        purpose: 'signup',
        fullName: signupName.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
      });
      applyOtpResponse(email, 'signup', res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ارسال کد تایید ثبت‌نام.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const email = normalizeEmail(resetEmail);
    if (!isValidEmail(email)) {
      setFieldErrors({ resetEmail: 'آدرس ایمیل معتبر وارد کنید.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({ email, purpose: 'reset-password' });
      applyOtpResponse(email, 'reset-password', res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ارسال کد بازیابی.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpPending) return;
    setErrorMsg(null);

    const normalized = normalizeOtpCode(otpCode);
    const nextErrors: Record<string, string> = {};
    if (!isValidOtpCode(normalized)) {
      nextErrors.otpCode = 'کد تایید باید دقیقاً ۶ رقم باشد.';
    }
    if (otpPending.purpose === 'reset-password') {
      const strength = getPasswordStrength(resetNewPassword);
      if (!strength.valid) {
        nextErrors.resetNewPassword = 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.';
      }
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await authApi.verifyOtp({
        email: otpPending.email,
        purpose: otpPending.purpose,
        code: normalized,
        newPassword: otpPending.purpose === 'reset-password' ? resetNewPassword : undefined,
      });
      if (res.user) {
        setAuthenticatedUser(res.user);
        setOtpPending(null);
        showToast(
          otpPending.purpose === 'signup'
            ? `ثبت‌نام با موفقیت تکمیل شد؛ خوش آمدید ${res.user.fullName}!`
            : otpPending.purpose === 'reset-password'
            ? 'رمز عبور تغییر یافت و وارد حساب کاربری شدید.'
            : `خوش آمدید، ${res.user.fullName}!`,
          'success'
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'کد تایید نامعتبر است.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpPending || otpPending.cooldown > 0) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({
        email: otpPending.email,
        purpose: otpPending.purpose,
        ...(otpPending.purpose === 'signup'
          ? {
              fullName: signupName.trim(),
              phone: signupPhone.trim(),
              password: signupPassword,
            }
          : {}),
      });
      applyOtpResponse(otpPending.email, otpPending.purpose, res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'امکان ارسال مجدد وجود ندارد.');
    } finally {
      setSubmitting(false);
    }
  };

  const signupStrength = getPasswordStrength(signupPassword);
  const resetStrength = getPasswordStrength(resetNewPassword);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Right Column: Auth Card */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#004ac6]">ورود و عضویت امن با تایید ایمیل Resend</p>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
            حساب کاربری فروشگاه موبایل امیر
          </h1>
          <p className="text-xs sm:text-sm text-[#434655] leading-6">
            با ایمیل خود وارد شوید یا ثبت‌نام کنید تا سفارش‌ها، آدرس‌های ارسال و لیست علاقه‌مندی‌هایتان در تمام دستگاه‌ها ذخیره شود.
          </p>
        </div>

        {/* Mode Switch Tabs */}
        {!otpPending && (
          <div
            role="tablist"
            aria-label="روش احراز هویت"
            className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#eff4ff] rounded-2xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'otp-login'}
              onClick={() => switchTab('otp-login')}
              className={`h-10 px-3 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                tab === 'otp-login'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              ورود با کد ایمیل
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'password-login' || tab === 'reset-password'}
              onClick={() => switchTab('password-login')}
              className={`h-10 px-3 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                tab === 'password-login' || tab === 'reset-password'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              ورود با رمز عبور
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'signup'}
              onClick={() => switchTab('signup')}
              className={`h-10 px-3 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                tab === 'signup'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              ثبت‌نام جدید
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-6"
          >
            {errorMsg}
          </div>
        )}

        {/* OTP Verification Step */}
        {otpPending ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
            <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-[#0b1c30]">
                  تایید ایمیل: <span dir="ltr" className="text-[#004ac6]">{otpPending.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpPending(null);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>تغییر ایمیل</span>
                </button>
              </div>
              <p className="text-xs text-[#434655] leading-6">
                {otpPending.provider === 'resend'
                  ? 'کد تایید ۶ رقمی از طریق سرویس ایمیل Resend به صندوق ورودی شما ارسال شد. لطفاً پوشه Inbox یا Spam را بررسی کنید.'
                  : otpPending.warning}
              </p>
              {otpPending.provider === 'sandbox-preview' && otpPending.previewCode && (
                <div className="mt-2 p-3 rounded-xl bg-white border border-[#dce9ff] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#0b1c30]">
                    کد پیش‌نمایش آزمایشی:{' '}
                    <strong
                      dir="ltr"
                      data-testid="sandbox-otp-code"
                      className="font-mono text-base text-[#004ac6] tracking-widest"
                    >
                      {otpPending.previewCode}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(otpPending.previewCode || '')}
                    className="h-8 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold whitespace-nowrap"
                  >
                    درج خودکار کد
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-otp-code" className="text-xs font-bold text-[#0b1c30] block">
                کد تایید ۶ رقمی ارسال‌شده به ایمیل
              </label>
              <input
                id="auth-otp-code"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full h-12 px-4 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-center font-mono text-lg tracking-[0.45em] text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
              {fieldErrors.otpCode && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.otpCode}</p>
              )}
            </div>

            {otpPending.purpose === 'reset-password' && (
              <div className="space-y-1.5">
                <label htmlFor="reset-new-pw" className="text-xs font-bold text-[#0b1c30] block">
                  رمز عبور جدید (حداقل ۸ کاراکتر شامل حرف و عدد)
                </label>
                <div className="relative">
                  <input
                    id="reset-new-pw"
                    type={showResetPw ? 'text' : 'password'}
                    dir="ltr"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    aria-label={showResetPw ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#0b1c30]"
                  >
                    {showResetPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetNewPassword && (
                  <p className="text-[11px] text-[#434655]">
                    قدرت رمز عبور: <strong className="text-[#004ac6]">{resetStrength.labelFa}</strong>
                  </p>
                )}
                {fieldErrors.resetNewPassword && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.resetNewPassword}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                data-testid="verify-otp-submit"
                className="flex-1 h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'در حال بررسی...'
                    : otpPending.purpose === 'signup'
                    ? 'تایید ایمیل و تکمیل ثبت‌نام'
                    : otpPending.purpose === 'reset-password'
                    ? 'تغییر رمز عبور و ورود'
                    : 'تایید کد و ورود به حساب'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={submitting || otpPending.cooldown > 0}
                className="h-12 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] disabled:opacity-60 text-[#004ac6] text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {otpPending.cooldown > 0
                    ? `ارسال مجدد (${toPersianDigits(otpPending.cooldown)} ثانیه)`
                    : 'ارسال مجدد کد'}
                </span>
              </button>
            </div>
          </form>
        ) : tab === 'otp-login' ? (
          <form onSubmit={handleRequestOtpLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="otp-login-email" className="text-xs font-bold text-[#0b1c30] block">
                آدرس ایمیل شما
              </label>
              <div className="relative">
                <input
                  id="otp-login-email"
                  type="email"
                  dir="ltr"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pr-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                <Mail className="w-4 h-4 text-[#434655] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {fieldErrors.loginEmail && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.loginEmail}</p>
              )}
              <p className="text-[11px] text-[#434655] leading-5">
                کد ۶ رقمی یک‌بارمصرف بدون نیاز به رمز عبور از طریق Resend به ایمیل شما ارسال می‌شود.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="send-otp-login-btn"
              className="w-full h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{submitting ? 'در حال ارسال کد...' : 'ارسال کد ورود با ایمیل'}</span>
            </button>
          </form>
        ) : tab === 'password-login' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="pw-login-email" className="text-xs font-bold text-[#0b1c30] block">
                آدرس ایمیل
              </label>
              <input
                id="pw-login-email"
                type="email"
                dir="ltr"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
              {fieldErrors.loginEmail && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.loginEmail}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pw-login-password" className="text-xs font-bold text-[#0b1c30]">
                  رمز عبور
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail);
                    switchTab('reset-password');
                  }}
                  className="text-[11px] font-bold text-[#004ac6] hover:underline"
                >
                  رمز عبور خود را فراموش کرده‌اید؟
                </button>
              </div>
              <div className="relative">
                <input
                  id="pw-login-password"
                  type={showLoginPw ? 'text' : 'password'}
                  dir="ltr"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw((v) => !v)}
                  aria-label={showLoginPw ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#0b1c30]"
                >
                  {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.loginPassword && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.loginPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="login-password-submit"
              className="w-full h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'در حال ورود...' : 'ورود به حساب کاربری'}</span>
            </button>
          </form>
        ) : tab === 'reset-password' ? (
          <form onSubmit={handleResetRequest} className="space-y-4" noValidate>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0b1c30]">بازیابی رمز عبور با ایمیل</h2>
              <button
                type="button"
                onClick={() => switchTab('password-login')}
                className="text-xs font-bold text-[#004ac6] hover:underline"
              >
                بازگشت به ورود
              </button>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reset-email-input" className="text-xs font-bold text-[#0b1c30] block">
                ایمیل ثبت‌شده در حساب کاربری
              </label>
              <input
                id="reset-email-input"
                type="email"
                dir="ltr"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
              {fieldErrors.resetEmail && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.resetEmail}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'در حال ارسال...' : 'ارسال کد بازیابی رمز عبور'}</span>
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-fullname" className="text-xs font-bold text-[#0b1c30] block">
                  نام و نام خانوادگی
                </label>
                <input
                  id="signup-fullname"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="مثال: امیرحسین کریمی"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-phone" className="text-xs font-bold text-[#0b1c30] block">
                  شماره موبایل (اختیاری)
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  dir="ltr"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-bold text-[#0b1c30] block">
                آدرس ایمیل (کد تایید به این ایمیل ارسال می‌شود)
              </label>
              <input
                id="signup-email"
                type="email"
                dir="ltr"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-bold text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-xs font-bold text-[#0b1c30] block">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showSignupPw ? 'text' : 'password'}
                    dir="ltr"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="حداقل ۸ کاراکتر"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPw((v) => !v)}
                    aria-label={showSignupPw ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#0b1c30]"
                  >
                    {showSignupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`h-1 rounded-full ${
                            signupStrength.score >= step
                              ? signupStrength.score >= 3
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                              : 'bg-[#e5eeff]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-[#434655]">
                      قدرت رمز عبور: <strong>{signupStrength.labelFa}</strong>
                    </p>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-confirm-pw" className="text-xs font-bold text-[#0b1c30] block">
                  تکرار رمز عبور
                </label>
                <input
                  id="signup-confirm-pw"
                  type={showSignupPw ? 'text' : 'password'}
                  dir="ltr"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز عبور"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="signup-submit-btn"
              className="w-full h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'در حال ارسال کد تایید...' : 'ایجاد حساب و ارسال کد تایید ایمیل'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Left Column: Account Benefits & Resend Email Delivery Info */}
      <aside className="lg:col-span-5 bg-[#0b1c30] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-[#93c5fd] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">مزایای عضویت در فروشگاه امیر</h2>
              <p className="text-xs text-[#d6e3ff]">احراز هویت ایمن با کد یک‌بارمصرف ایمیل</p>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-[#d6e3ff] leading-6">
            <li className="border-b border-white/10 pb-3">
              <strong className="text-white block mb-0.5">تکمیل خودکار آدرس و تحویل سریع‌تر</strong>
              <span>ذخیره چند نشانی (منزل، محل کار) و انتخاب یک‌کلیکی در صفحه تسویه حساب.</span>
            </li>
            <li className="border-b border-white/10 pb-3">
              <strong className="text-white block mb-0.5">پیگیری لحظه‌ای سفارش‌ها و فاکتور رسمی</strong>
              <span>دسترسی همیشگی به سوابق خرید، کد رجیستری همتا و پین تحویل امن.</span>
            </li>
            <li>
              <strong className="text-white block mb-0.5">امنیت حساب با تایید دو مرحله‌ای ایمیل</strong>
              <span>دریافت کد ورود یک‌بارمصرف، بازیابی رمز عبور و هشدار تغییر اطلاعات از طریق Resend.</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
          <p className="font-extrabold text-white">وضعیت درگاه ایمیل Resend</p>
          {resendStatus ? (
            resendStatus.resendConfigured ? (
              <p className="text-[#93c5fd] leading-5">
                متصل و آماده ارسال · فرستنده:{' '}
                <span dir="ltr" className="text-white font-mono">
                  {resendStatus.fromAddress}
                </span>
              </p>
            ) : (
              <p className="text-[#ffdbca] leading-5">
                کلید <code dir="ltr" className="font-mono text-white">RESEND_API_KEY</code> در متغیرهای محیطی سرور تنظیم نشده است؛ در این حالت کد تایید به‌صورت پیش‌نمایش آزمایشی نمایش داده می‌شود.
              </p>
            )
          ) : (
            <p className="text-[#d6e3ff]">در حال بررسی وضعیت سرویس ایمیل...</p>
          )}
        </div>
      </aside>
    </section>
  );
};
