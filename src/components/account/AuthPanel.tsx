import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authApi, type PasswordLoginResponse, type SendOtpResponse } from '../../lib/authApi';
import type { OtpPurpose } from '../../types/store';
import {
  generateUsernameSuggestions,
  getPasswordStrength,
  isValidEmail,
  isValidOtpCode,
  normalizeEmail,
  normalizeOtpCode,
  normalizeUsername,
  validateSignupForm,
  validateUsername,
} from '../../utils/authLogic';
import { toPersianDigits } from '../../utils/storeLogic';

type AuthTab = 'password-login' | 'otp-login' | 'signup' | 'reset-password';

interface OtpPendingState {
  identifier: string;
  displayTarget: string;
  purpose: OtpPurpose;
  twoFactorToken?: string;
  provider: 'resend' | 'sandbox-preview';
  previewCode?: string;
  warning?: string;
  cooldown: number;
}

export const AuthPanel: React.FC = () => {
  const { setAuthenticatedUser, showToast } = useStore();

  const [tab, setTab] = useState<AuthTab>('password-login');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offerSignupEmail, setOfferSignupEmail] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    checkedNormalized: string;
    valid?: boolean;
    available?: boolean;
    error?: string;
    suggestions?: string[];
  }>({ checking: false, checkedNormalized: '' });

  // Reset password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  // OTP & 2FA Verification state
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
  }, [otpPending?.cooldown, otpPending?.identifier]);

  useEffect(() => {
    if (tab !== 'signup') return;
    const normalized = normalizeUsername(signupUsername);
    if (!normalized) {
      setUsernameStatus({ checking: false, checkedNormalized: '' });
      return;
    }
    const clientCheck = validateUsername(normalized);
    if (!clientCheck.valid) {
      setUsernameStatus({
        checking: false,
        checkedNormalized: normalized,
        valid: false,
        available: false,
        error: clientCheck.error,
        suggestions: generateUsernameSuggestions(signupEmail || signupName || normalized),
      });
      return;
    }

    let active = true;
    setUsernameStatus((prev) => ({ ...prev, checking: true, checkedNormalized: normalized }));
    const timer = window.setTimeout(() => {
      authApi
        .checkUsernameAvailability(normalized, signupEmail || signupName)
        .then((res) => {
          if (!active) return;
          setUsernameStatus({
            checking: false,
            checkedNormalized: res.normalized,
            valid: res.valid,
            available: res.available,
            error: res.error,
            suggestions: res.suggestions,
          });
        })
        .catch(() => {
          if (!active) return;
          setUsernameStatus({ checking: false, checkedNormalized: normalized });
        });
    }, 320);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [signupEmail, signupName, signupUsername, tab]);

  const quickUsernameSuggestions = useMemo(() => {
    if (usernameStatus.suggestions && usernameStatus.suggestions.length > 0) {
      return usernameStatus.suggestions;
    }
    if (!signupName.trim() && !signupEmail.trim()) return [];
    return generateUsernameSuggestions(signupEmail || signupName);
  }, [signupEmail, signupName, usernameStatus.suggestions]);

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setErrorMsg(null);
    setOfferSignupEmail(null);
    setFieldErrors({});
    setOtpPending(null);
    setOtpCode('');
  };

  const applyOtpResponse = (
    identifier: string,
    displayTarget: string,
    purpose: OtpPurpose,
    res: SendOtpResponse | PasswordLoginResponse,
    twoFactorToken?: string
  ) => {
    setOtpPending({
      identifier,
      displayTarget,
      purpose,
      twoFactorToken,
      provider: res.provider || 'resend',
      previewCode: res.previewCode,
      warning: res.warning,
      cooldown: res.cooldownSeconds || 60,
    });
    setOtpCode('');
    if (res.provider === 'resend') {
      showToast(
        purpose === 'login-2fa'
          ? 'کد تایید دومرحله‌ای به ایمیل شما ارسال شد.'
          : 'کد تایید ۶ رقمی به ایمیل شما ارسال شد.',
        'success'
      );
    } else {
      showToast('کد تایید موقت صادر شد.', 'info');
    }
  };

  const validateLoginIdentifier = (raw: string): { valid: boolean; value: string; isEmail: boolean; error?: string } => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { valid: false, value: '', isEmail: false, error: 'لطفاً ایمیل یا نام کاربری خود را وارد کنید.' };
    }
    if (trimmed.includes('@') && !trimmed.startsWith('@')) {
      const em = normalizeEmail(trimmed);
      if (!isValidEmail(em)) {
        return { valid: false, value: em, isEmail: true, error: 'آدرس ایمیل واردشده معتبر نیست.' };
      }
      return { valid: true, value: em, isEmail: true };
    }
    const unameCheck = validateUsername(trimmed);
    if (!unameCheck.valid) {
      return {
        valid: false,
        value: unameCheck.normalized,
        isEmail: false,
        error: unameCheck.error || 'نام کاربری یا ایمیل معتبر وارد کنید.',
      };
    }
    return { valid: true, value: unameCheck.normalized, isEmail: false };
  };

  const handleRequestOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOfferSignupEmail(null);
    const idCheck = validateLoginIdentifier(loginEmail);
    if (!idCheck.valid) {
      setFieldErrors({ loginEmail: idCheck.error || 'ایمیل یا نام کاربری معتبر وارد کنید.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({
        ...(idCheck.isEmail ? { email: idCheck.value } : {}),
        identifier: idCheck.value,
        purpose: 'login',
      });
      applyOtpResponse(
        idCheck.value,
        res.maskedEmail || (idCheck.isEmail ? idCheck.value : `@${idCheck.value}`),
        'login',
        res
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در ارسال کد تایید.';
      setErrorMsg(message);
      if (idCheck.isEmail && message.includes('ثبت نشده است')) {
        setOfferSignupEmail(idCheck.value);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOfferSignupEmail(null);
    const idCheck = validateLoginIdentifier(loginEmail);
    const nextErrors: Record<string, string> = {};
    if (!idCheck.valid) {
      nextErrors.loginEmail = idCheck.error || 'ایمیل یا نام کاربری معتبر وارد کنید.';
    }
    if (!loginPassword) {
      nextErrors.loginPassword = 'رمز عبور را وارد کنید.';
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await authApi.loginWithPassword({
        ...(idCheck.isEmail ? { email: idCheck.value } : {}),
        identifier: idCheck.value,
        password: loginPassword,
      });
      if (res.requires2FA && res.twoFactorToken) {
        applyOtpResponse(
          idCheck.value,
          res.maskedEmail || res.email || `@${idCheck.value}`,
          'login-2fa',
          res,
          res.twoFactorToken
        );
        return;
      }
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
    setOfferSignupEmail(null);
    const normalizedUsername = normalizeUsername(signupUsername);
    const errors = validateSignupForm({
      fullName: signupName,
      username: normalizedUsername || undefined,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    if (
      normalizedUsername &&
      usernameStatus.checkedNormalized === normalizedUsername &&
      usernameStatus.available === false
    ) {
      errors.username = usernameStatus.error || 'این نام کاربری قبلاً انتخاب شده است.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const email = normalizeEmail(signupEmail);
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({
        email,
        username: normalizedUsername || undefined,
        purpose: 'signup',
        fullName: signupName.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
      });
      applyOtpResponse(email, email, 'signup', res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'خطا در ارسال کد تایید ثبت‌نام.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOfferSignupEmail(null);
    const idCheck = validateLoginIdentifier(resetEmail);
    if (!idCheck.valid) {
      setFieldErrors({ resetEmail: idCheck.error || 'ایمیل یا نام کاربری معتبر وارد کنید.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await authApi.sendOtp({
        ...(idCheck.isEmail ? { email: idCheck.value } : {}),
        identifier: idCheck.value,
        purpose: 'reset-password',
      });
      applyOtpResponse(
        idCheck.value,
        res.maskedEmail || (idCheck.isEmail ? idCheck.value : `@${idCheck.value}`),
        'reset-password',
        res
      );
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
      const res =
        otpPending.purpose === 'login-2fa' && otpPending.twoFactorToken
          ? await authApi.verifyTwoFactor({
              twoFactorToken: otpPending.twoFactorToken,
              code: normalized,
            })
          : await authApi.verifyOtp({
              ...(otpPending.identifier.includes('@') && !otpPending.identifier.startsWith('@')
                ? { email: otpPending.identifier }
                : {}),
              identifier: otpPending.identifier,
              purpose: otpPending.purpose,
              code: normalized,
              newPassword:
                otpPending.purpose === 'reset-password' ? resetNewPassword : undefined,
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
      if (otpPending.purpose === 'login-2fa' && otpPending.twoFactorToken) {
        const res = await authApi.resendTwoFactor({
          twoFactorToken: otpPending.twoFactorToken,
        });
        applyOtpResponse(
          otpPending.identifier,
          otpPending.displayTarget,
          'login-2fa',
          res,
          otpPending.twoFactorToken
        );
        return;
      }

      const normalizedUsername = normalizeUsername(signupUsername);
      const isEmailTarget =
        otpPending.identifier.includes('@') && !otpPending.identifier.startsWith('@');
      const res = await authApi.sendOtp({
        ...(isEmailTarget ? { email: otpPending.identifier } : {}),
        identifier: otpPending.identifier,
        purpose: otpPending.purpose,
        ...(otpPending.purpose === 'signup'
          ? {
              username: normalizedUsername || undefined,
              fullName: signupName.trim(),
              phone: signupPhone.trim(),
              password: signupPassword,
            }
          : {}),
      });
      applyOtpResponse(
        otpPending.identifier,
        res.maskedEmail || otpPending.displayTarget,
        otpPending.purpose,
        res
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'امکان ارسال مجدد وجود ندارد.');
    } finally {
      setSubmitting(false);
    }
  };

  const signupStrength = getPasswordStrength(signupPassword);
  const resetStrength = getPasswordStrength(resetNewPassword);

  return (
    <section className="max-w-[560px] mx-auto">
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden">
        {/* Clean Branded Header Strip */}
        <div className="px-6 sm:px-8 pt-7 pb-5 bg-gradient-to-b from-[#f8f9ff] to-white border-b border-[#eff4ff] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#0b1c30]">
              حساب کاربری فروشگاه موبایل امیر
            </h1>
            <p className="text-xs text-[#434655] mt-1">
              ورود به پنل خریدار، پیگیری مرسوله‌ها و مدیریت آدرس‌های ارسال
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
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
                aria-selected={tab === 'password-login' || tab === 'reset-password'}
                onClick={() => switchTab('password-login')}
                className={`h-10 px-2.5 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                  tab === 'password-login' || tab === 'reset-password'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                ورود با رمز عبور
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'otp-login'}
                onClick={() => switchTab('otp-login')}
                className={`h-10 px-2.5 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                  tab === 'otp-login'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                ورود با کد ایمیل
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'signup'}
                onClick={() => switchTab('signup')}
                className={`h-10 px-2.5 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                  tab === 'signup'
                    ? 'bg-white text-[#004ac6] shadow-xs'
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
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-6 space-y-2"
            >
              <p>{errorMsg}</p>
              {offerSignupEmail && (
                <button
                  type="button"
                  onClick={() => {
                    const emailToCopy = offerSignupEmail;
                    switchTab('signup');
                    setSignupEmail(emailToCopy);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-[#004ac6] hover:bg-[#eff4ff] transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ساخت حساب کاربری با همین ایمیل</span>
                </button>
              )}
            </div>
          )}

          {/* OTP / 2FA Verification Step */}
          {otpPending ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {otpPending.purpose === 'login-2fa' && (
                      <ShieldCheck className="w-4 h-4 text-[#004ac6] shrink-0" />
                    )}
                    <span className="text-xs font-extrabold text-[#0b1c30]">
                      {otpPending.purpose === 'login-2fa'
                        ? 'تایید دومرحله‌ای (2FA): '
                        : 'تایید ایمیل: '}
                      <span dir="ltr" className="text-[#004ac6]">
                        {otpPending.displayTarget}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpPending(null);
                      setErrorMsg(null);
                    }}
                    className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>بازگشت</span>
                  </button>
                </div>
                <p className="text-xs text-[#434655] leading-6">
                  {otpPending.provider === 'resend'
                    ? otpPending.purpose === 'login-2fa'
                      ? 'رمز عبور شما تایید شد. کد ۶ رقمی تایید دومرحله‌ای به ایمیلتان ارسال شد؛ لطفاً صندوق ورودی یا پوشه Spam را بررسی کنید.'
                      : 'کد تایید ۶ رقمی به ایمیل شما ارسال شد. لطفاً صندوق ورودی یا پوشه Spam را بررسی کنید.'
                    : otpPending.warning}
                </p>
                {otpPending.provider === 'sandbox-preview' && otpPending.previewCode && (
                  <div className="mt-2 p-3 rounded-xl bg-white border border-[#dce9ff] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#0b1c30]">
                      کد آزمایشی:{' '}
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
                      قدرت رمز عبور:{' '}
                      <strong className="text-[#004ac6]">{resetStrength.labelFa}</strong>
                    </p>
                  )}
                  {fieldErrors.resetNewPassword && (
                    <p className="text-[11px] font-bold text-rose-600">
                      {fieldErrors.resetNewPassword}
                    </p>
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
                      : otpPending.purpose === 'login-2fa'
                      ? 'تایید کد و تکمیل ورود'
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
          ) : tab === 'password-login' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="pw-login-email" className="text-xs font-bold text-[#0b1c30] block">
                  ایمیل یا نام کاربری
                </label>
                <div className="relative">
                  <input
                    id="pw-login-email"
                    type="text"
                    dir="ltr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com یا @username"
                    data-testid="pw-login-identifier"
                    className="w-full h-11 pr-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <AtSign className="w-4 h-4 text-[#434655] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
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
                    فراموشی رمز عبور
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
                  <p className="text-[11px] font-bold text-rose-600">
                    {fieldErrors.loginPassword}
                  </p>
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
          ) : tab === 'otp-login' ? (
            <form onSubmit={handleRequestOtpLogin} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="otp-login-email" className="text-xs font-bold text-[#0b1c30] block">
                  ایمیل یا نام کاربری ثبت‌شده
                </label>
                <div className="relative">
                  <input
                    id="otp-login-email"
                    type="text"
                    dir="ltr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com یا @username"
                    data-testid="otp-login-identifier"
                    className="w-full h-11 pr-3.5 pl-10 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <Mail className="w-4 h-4 text-[#434655] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {fieldErrors.loginEmail && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.loginEmail}</p>
                )}
                <p className="text-[11px] text-[#434655] leading-5">
                  کد ۶ رقمی یک‌بارمصرف به ایمیل حساب کاربری شما ارسال می‌شود.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="send-otp-login-btn"
                className="w-full h-12 px-5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{submitting ? 'در حال ارسال کد...' : 'ارسال کد ورود به ایمیل'}</span>
              </button>
            </form>
          ) : tab === 'reset-password' ? (
            <form onSubmit={handleResetRequest} className="space-y-4" noValidate>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-[#0b1c30]">بازیابی رمز عبور</h2>
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
                  ایمیل یا نام کاربری ثبت‌شده در حساب کاربری
                </label>
                <input
                  id="reset-email-input"
                  type="text"
                  dir="ltr"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com یا @username"
                  data-testid="reset-identifier-input"
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
                  آدرس ایمیل
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="signup-username" className="text-xs font-bold text-[#0b1c30] block">
                    نام کاربری (اختیاری - با حروف انگلیسی)
                  </label>
                  {normalizeUsername(signupUsername) && (
                    <span
                      data-testid="signup-username-status"
                      className={`text-[11px] font-bold ${
                        usernameStatus.checking
                          ? 'text-[#434655]'
                          : usernameStatus.available
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {usernameStatus.checking
                        ? 'در حال بررسی...'
                        : usernameStatus.available
                        ? 'قابل انتخاب است ✓'
                        : usernameStatus.error || 'قبلاً انتخاب شده'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="signup-username"
                    type="text"
                    dir="ltr"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="amir_mobile"
                    data-testid="signup-username-input"
                    className="w-full h-11 pr-3.5 pl-9 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] font-mono text-xs sm:text-sm text-left text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                  />
                  <AtSign className="w-4 h-4 text-[#004ac6] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {fieldErrors.username && (
                  <p className="text-[11px] font-bold text-rose-600">{fieldErrors.username}</p>
                )}
                {quickUsernameSuggestions.length > 0 && !usernameStatus.available && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-[#434655] inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#004ac6]" />
                      پیشنهادها:
                    </span>
                    {quickUsernameSuggestions.slice(0, 3).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        dir="ltr"
                        onClick={() => setSignupUsername(sug)}
                        className="px-2 py-0.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] font-mono text-[11px] font-bold transition-colors"
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
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
                    <p className="text-[11px] font-bold text-rose-600">
                      {fieldErrors.confirmPassword}
                    </p>
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
                <span>{submitting ? 'در حال ارسال کد تایید...' : 'ایجاد حساب و ارسال کد تایید'}</span>
              </button>
            </form>
          )}

          {/* Subtle Footer Switch Link */}
          {!otpPending && (
            <div className="pt-4 border-t border-[#eff4ff] text-center text-xs text-[#434655]">
              {tab === 'signup' ? (
                <span>
                  قبلاً ثبت‌نام کرده‌اید؟{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('password-login')}
                    className="font-extrabold text-[#004ac6] hover:underline"
                  >
                    ورود به حساب کاربری
                  </button>
                </span>
              ) : (
                <span>
                  هنوز حساب کاربری ندارید؟{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    className="font-extrabold text-[#004ac6] hover:underline"
                  >
                    ایجاد حساب جدید
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
