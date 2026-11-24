import { toEnglishDigits } from './storeLogic';

export function normalizeEmail(raw: string): string {
  return toEnglishDigits(raw).trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'help',
  'api',
  'auth',
  'account',
  'profile',
  'user',
  'users',
  'u',
  'catalog',
  'cart',
  'checkout',
  'tracking',
  'orders',
  'order',
  'about',
  'contact',
  'terms',
  'status',
  'compare',
  'installments',
  'amirmobile',
  'amir_mobile',
  'amir.mobile',
  'staff',
  'moderator',
  'mod',
  'official',
  'verify',
  'security',
  'login',
  'signup',
  'register',
  'reset',
  'null',
  'undefined',
  'me',
  'www',
  'mail',
  'noreply',
]);

export function normalizeUsername(raw: string): string {
  return toEnglishDigits(String(raw ?? ''))
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

export interface UsernameValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function validateUsername(raw: string): UsernameValidationResult {
  const normalized = normalizeUsername(raw);
  if (!normalized) {
    return { valid: false, normalized, error: 'لطفاً نام کاربری را وارد کنید.' };
  }
  if (normalized.length < 3) {
    return { valid: false, normalized, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' };
  }
  if (normalized.length > 24) {
    return { valid: false, normalized, error: 'نام کاربری نمی‌تواند بیشتر از ۲۴ کاراکتر باشد.' };
  }
  if (!/^[a-z]/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری باید با حروف انگلیسی (a-z) شروع شود.',
    };
  }
  if (!/^[a-z0-9_.]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد، نقطه (.) و خط زیر (_) باشد.',
    };
  }
  if (!/[a-z0-9]$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'نام کاربری باید با حرف یا عدد انگلیسی پایان یابد.',
    };
  }
  if (/[._]{2}/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'استفاده از دو نقطه یا خط زیر پشت‌سرهم مجاز نیست.',
    };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'این نام کاربری رزرو شده است و قابل انتخاب نیست.',
    };
  }
  return { valid: true, normalized };
}

export function isValidUsername(raw: string): boolean {
  return validateUsername(raw).valid;
}

export function generateUsernameSuggestions(
  baseRaw: string,
  isTaken?: (candidate: string) => boolean
): string[] {
  const emailLocal = String(baseRaw || '').includes('@')
    ? String(baseRaw).split('@')[0]
    : String(baseRaw || '');
  let seed = normalizeUsername(emailLocal)
    .replace(/[^a-z0-9_.]/g, '_')
    .replace(/[._]{2,}/g, '_')
    .replace(/^[._0-9]+/, '')
    .replace(/[._]+$/, '');

  if (seed.length < 3) {
    seed = seed ? `amir_${seed}` : 'amir_user';
  }
  if (seed.length > 18) {
    seed = seed.slice(0, 18).replace(/[._]+$/, '');
  }

  const rawCandidates = [
    seed,
    `${seed}_ir`,
    `${seed}98`,
    `${seed}_shop`,
    `${seed}2026`,
    `amir_${seed}`.slice(0, 24),
    `${seed}_1`,
    `${seed}_2`,
    `${seed}_7`,
  ];

  const out: string[] = [];
  for (const cand of rawCandidates) {
    const clean = cand.slice(0, 24).replace(/[._]+$/, '');
    if (!validateUsername(clean).valid) continue;
    if (isTaken && isTaken(clean)) continue;
    if (!out.includes(clean)) {
      out.push(clean);
    }
    if (out.length >= 4) break;
  }
  return out;
}

export function normalizeOtpCode(raw: string): string {
  return toEnglishDigits(raw).replace(/[\s\-_]/g, '').trim();
}

export function isValidOtpCode(raw: string): boolean {
  const code = normalizeOtpCode(raw);
  return /^\d{6}$/.test(code);
}

export function isValidIranMobile(raw: string): boolean {
  const phone = toEnglishDigits(raw).replace(/[\s-]/g, '').trim();
  return /^09\d{9}$/.test(phone);
}

export function isValidNationalId(raw: string): boolean {
  const code = toEnglishDigits(raw).replace(/[\s-]/g, '').trim();
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(code[i]) * (10 - i);
  }
  const rem = sum % 11;
  return (rem < 2 && check === rem) || (rem >= 2 && check === 11 - rem);
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  labelFa: string;
  valid: boolean;
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSymbolOrUpper: boolean;
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  const normalizedDigits = toEnglishDigits(password);
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(normalizedDigits);
  const hasNumber = /\d/.test(normalizedDigits);
  const hasSymbolOrUpper = /[A-Z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const count = [minLength, hasLetter, hasNumber, hasSymbolOrUpper].filter(Boolean).length as
    | 0
    | 1
    | 2
    | 3
    | 4;

  const labels: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: 'بسیار ضعیف',
    1: 'ضعیف',
    2: 'متوسط',
    3: 'خوب',
    4: 'قوی',
  };

  return {
    score: count,
    labelFa: labels[count],
    valid: minLength && hasLetter && hasNumber,
    checks: {
      minLength,
      hasLetter,
      hasNumber,
      hasSymbolOrUpper,
    },
  };
}

export interface SignupFormInput {
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function validateSignupForm(data: SignupFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.fullName.trim().length < 3) {
    errors.fullName = 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.';
  }
  if (data.username !== undefined && data.username.trim().length > 0) {
    const uCheck = validateUsername(data.username);
    if (!uCheck.valid && uCheck.error) {
      errors.username = uCheck.error;
    }
  }
  if (!isValidEmail(data.email)) {
    errors.email = 'لطفاً یک آدرس ایمیل معتبر وارد کنید (مثال: name@domain.com).';
  }
  if (data.phone.trim() && !isValidIranMobile(data.phone)) {
    errors.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
  }
  const strength = getPasswordStrength(data.password);
  if (!strength.valid) {
    errors.password = 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.';
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'تکرار رمز عبور با رمز عبور یکسان نیست.';
  }
  return errors;
}

export interface ProfileFormInput {
  fullName: string;
  username?: string;
  phone: string;
  nationalId?: string;
}

export function validateProfileForm(data: ProfileFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.fullName.trim().length < 3) {
    errors.fullName = 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.';
  }
  if (data.username !== undefined && data.username.trim().length > 0) {
    const uCheck = validateUsername(data.username);
    if (!uCheck.valid && uCheck.error) {
      errors.username = uCheck.error;
    }
  }
  if (data.phone.trim() && !isValidIranMobile(data.phone)) {
    errors.phone = 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).';
  }
  if (data.nationalId && data.nationalId.trim() && !isValidNationalId(data.nationalId)) {
    errors.nationalId = 'کد ملی واردشده معتبر نیست.';
  }
  return errors;
}

export interface AddressFormInput {
  label: string;
  receiverName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
}

export function validateAddressForm(data: AddressFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.label.trim().length < 2) {
    errors.label = 'عنوان آدرس را وارد کنید (مثال: منزل یا محل کار).';
  }
  if (data.receiverName.trim().length < 3) {
    errors.receiverName = 'نام تحویل‌گیرنده باید حداقل ۳ حرف باشد.';
  }
  if (!isValidIranMobile(data.phone)) {
    errors.phone = 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).';
  }
  if (data.city.trim().length < 2) {
    errors.city = 'نام استان یا شهر را وارد کنید.';
  }
  if (data.address.trim().length < 10) {
    errors.address = 'نشانی کامل پستی (حداقل ۱۰ کاراکتر) را وارد کنید.';
  }
  const postal = toEnglishDigits(data.postalCode).replace(/[\s-]/g, '').trim();
  if (!/^\d{10}$/.test(postal)) {
    errors.postalCode = 'کد پستی باید دقیقاً ۱۰ رقم باشد.';
  }
  return errors;
}
