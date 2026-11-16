import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  clearOtpChallenge,
  createOtpChallenge,
  createUserAccount,
  findUserByEmail,
  hashPassword,
  issueSessionToken,
  revokeSession,
  toPublicUser,
  updateUserRecord,
  verifyOtpChallenge,
  verifyPassword,
  verifySessionToken,
  type OtpPurpose,
  type StoredAddress,
  type StoredUserRecord,
} from './server/authStore.ts';
import {
  buildOrderReceiptEmailContent,
  buildOtpEmailContent,
  buildSecurityAlertEmailContent,
  buildWelcomeEmailContent,
} from './server/emailTemplates.ts';
import { getResendProviderStatus, sendEmailWithResend } from './server/resendService.ts';

const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE_NAME = 'amir_session';
const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (ch) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)))
    .replace(/[٠-٩]/g, (ch) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
}

function normalizeEmail(raw: unknown): string {
  return toEnglishDigits(String(raw ?? '')).trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return Boolean(email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC * 1000,
    secure: process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_COOKIE !== 'true',
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

interface AuthenticatedRequest extends Request {
  authUser?: StoredUserRecord;
  authSessionId?: string;
}

function getAuthFromRequest(req: Request): { user: StoredUserRecord; sessionId: string } | null {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
    return;
  }
  req.authUser = auth.user;
  req.authSessionId = auth.sessionId;
  next();
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, resend: getResendProviderStatus() });
  });

  app.get('/api/auth/status', (req, res) => {
    const auth = getAuthFromRequest(req);
    res.json({
      ...getResendProviderStatus(),
      authenticated: Boolean(auth),
      user: auth ? toPublicUser(auth.user) : null,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      res.json({ authenticated: false, user: null });
      return;
    }
    res.json({ authenticated: true, user: toPublicUser(auth.user) });
  });

  app.post('/api/auth/send-otp', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const purpose = String(req.body?.purpose || '') as OtpPurpose;

    if (!['signup', 'login', 'reset-password', 'change-email'].includes(purpose)) {
      res.status(400).json({ error: 'نوع درخواست کد تایید معتبر نیست.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'آدرس ایمیل واردشده معتبر نیست.' });
      return;
    }

    let recipientName: string | undefined;
    let pendingUserId: string | undefined;
    let pendingSignup: { fullName: string; phone: string; passwordHash?: string } | undefined;

    if (purpose === 'signup') {
      const existing = findUserByEmail(email);
      if (existing) {
        res.status(409).json({
          error: 'حساب کاربری با این ایمیل قبلاً ثبت شده است. لطفاً از بخش ورود اقدام کنید.',
        });
        return;
      }
      const fullName = String(req.body?.fullName || '').trim();
      const phone = toEnglishDigits(String(req.body?.phone || '')).replace(/[\s-]/g, '').trim();
      const password = String(req.body?.password || '');

      if (fullName.length < 3) {
        res.status(400).json({ error: 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.' });
        return;
      }
      if (phone && !/^09\d{9}$/.test(phone)) {
        res.status(400).json({ error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.' });
        return;
      }
      if (password.length < 8 || !/\d/.test(toEnglishDigits(password))) {
        res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر و شامل عدد باشد.' });
        return;
      }

      recipientName = fullName;
      pendingSignup = {
        fullName,
        phone,
        passwordHash: hashPassword(password),
      };
    } else if (purpose === 'reset-password') {
      const existing = findUserByEmail(email);
      if (!existing) {
        res.status(404).json({ error: 'حساب کاربری با این ایمیل یافت نشد.' });
        return;
      }
      recipientName = existing.fullName;
      pendingUserId = existing.id;
    } else if (purpose === 'change-email') {
      const auth = getAuthFromRequest(req);
      if (!auth) {
        res.status(401).json({ error: 'برای تغییر ایمیل ابتدا باید وارد حساب کاربری شوید.' });
        return;
      }
      if (auth.user.email === email) {
        res.status(400).json({ error: 'ایمیل جدید با ایمیل فعلی حساب شما یکسان است.' });
        return;
      }
      const conflict = findUserByEmail(email);
      if (conflict) {
        res.status(409).json({ error: 'این ایمیل قبلاً برای حساب دیگری ثبت شده است.' });
        return;
      }
      recipientName = auth.user.fullName;
      pendingUserId = auth.user.id;
    } else if (purpose === 'login') {
      const existing = findUserByEmail(email);
      recipientName = existing?.fullName;
      pendingUserId = existing?.id;
    }

    const challengeResult = createOtpChallenge({
      email,
      purpose,
      pendingUserId,
      pendingSignup,
    });

    if (!challengeResult.ok) {
      res.status(429).json({
        error: `لطفاً ${challengeResult.retryAfterSeconds} ثانیه دیگر برای ارسال مجدد کد صبر کنید.`,
        retryAfterSeconds: challengeResult.retryAfterSeconds,
      });
      return;
    }

    const emailContent = buildOtpEmailContent({
      code: challengeResult.code,
      purpose,
      recipientName,
    });

    const delivery = await sendEmailWithResend({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      idempotencyKey: `otp-${purpose}-${challengeResult.challengeId}`,
      tags: [
        { name: 'category', value: `auth_${purpose.replace('-', '_')}` },
      ],
    });

    if (delivery.sent) {
      res.json({
        sent: true,
        provider: 'resend',
        emailId: delivery.emailId,
        cooldownSeconds: challengeResult.cooldownSeconds,
      });
      return;
    }

    if (delivery.provider === 'sandbox-preview') {
      res.json({
        sent: true,
        provider: 'sandbox-preview',
        previewCode: challengeResult.code,
        cooldownSeconds: challengeResult.cooldownSeconds,
        warning:
          'متغیر RESEND_API_KEY در سرور تنظیم نشده است؛ کد تایید به‌صورت موقت برای تست در همین صفحه نمایش داده می‌شود.',
      });
      return;
    }

    // Resend API returned an error (e.g., invalid key or unverified domain recipient)
    clearOtpChallenge(email, purpose);
    res.status(delivery.statusCode && delivery.statusCode >= 400 ? delivery.statusCode : 502).json({
      error: `خطا در ارسال ایمیل از طریق Resend: ${delivery.errorMessage || 'خطای نامشخص'}`,
    });
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const purpose = String(req.body?.purpose || '') as OtpPurpose;
    const code = toEnglishDigits(String(req.body?.code || '')).replace(/[\s\-_]/g, '').trim();

    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      res.status(400).json({ error: 'ایمیل یا کد تایید ۶ رقمی معتبر نیست.' });
      return;
    }

    const verification = verifyOtpChallenge(email, purpose, code);
    if (!verification.ok) {
      res.status(400).json({ error: verification.messageFa });
      return;
    }

    const { challenge } = verification;
    let user: StoredUserRecord | null = null;

    if (purpose === 'signup') {
      if (!challenge.pendingSignup) {
        res.status(400).json({ error: 'اطلاعات ثبت‌نام یافت نشد. لطفاً دوباره ثبت‌نام کنید.' });
        return;
      }
      const existing = findUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است.' });
        return;
      }
      user = createUserAccount({
        email,
        fullName: challenge.pendingSignup.fullName,
        phone: challenge.pendingSignup.phone,
        passwordHash: challenge.pendingSignup.passwordHash,
      });

      const welcome = buildWelcomeEmailContent({ fullName: user.fullName });
      void sendEmailWithResend({
        to: user.email,
        subject: welcome.subject,
        html: welcome.html,
        idempotencyKey: `welcome-${user.id}`,
        tags: [{ name: 'category', value: 'welcome' }],
      });
    } else if (purpose === 'login') {
      user = findUserByEmail(email);
      if (!user) {
        const defaultName = email.split('@')[0] || 'کاربر جدید';
        user = createUserAccount({
          email,
          fullName: defaultName,
          phone: '',
        });
      } else {
        user = updateUserRecord(user.id, (prev) => ({
          ...prev,
          emailVerified: true,
        }));
      }
    } else if (purpose === 'reset-password') {
      const newPassword = String(req.body?.newPassword || '');
      if (newPassword.length < 8 || !/\d/.test(toEnglishDigits(newPassword))) {
        res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل عدد باشد.' });
        return;
      }
      const existing = findUserByEmail(email);
      if (!existing) {
        res.status(404).json({ error: 'کاربر یافت نشد.' });
        return;
      }
      user = updateUserRecord(existing.id, (prev) => ({
        ...prev,
        passwordHash: hashPassword(newPassword),
        emailVerified: true,
      }));
      if (user) {
        const alert = buildSecurityAlertEmailContent({
          fullName: user.fullName,
          actionLabel: 'بازیابی و تغییر رمز عبور',
        });
        void sendEmailWithResend({
          to: user.email,
          subject: alert.subject,
          html: alert.html,
          idempotencyKey: `reset-pw-${user.id}-${Date.now()}`,
          tags: [{ name: 'category', value: 'security_alert' }],
        });
      }
    } else if (purpose === 'change-email') {
      const auth = getAuthFromRequest(req);
      if (!auth || auth.user.id !== challenge.pendingUserId) {
        res.status(401).json({ error: 'نشست کاربری نامعتبر است.' });
        return;
      }
      user = updateUserRecord(auth.user.id, (prev) => ({
        ...prev,
        email,
        emailVerified: true,
      }));
      if (user) {
        const alert = buildSecurityAlertEmailContent({
          fullName: user.fullName,
          actionLabel: `تغییر ایمیل حساب به ${email}`,
        });
        void sendEmailWithResend({
          to: user.email,
          subject: alert.subject,
          html: alert.html,
          idempotencyKey: `change-email-${user.id}-${Date.now()}`,
          tags: [{ name: 'category', value: 'security_alert' }],
        });
      }
    }

    if (!user) {
      res.status(500).json({ error: 'خطا در به‌روزرسانی اطلاعات حساب کاربری.' });
      return;
    }

    const session = issueSessionToken(user.id);
    if (!session) {
      res.status(500).json({ error: 'خطا در ایجاد نشست کاربری.' });
      return;
    }

    setSessionCookie(res, session.token);
    const freshUser = findUserByEmail(user.email) || user;
    res.json({
      authenticated: true,
      user: toPublicUser(freshUser),
    });
  });

  app.post('/api/auth/login-password', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!isValidEmail(email) || !password) {
      res.status(400).json({ error: 'ایمیل و رمز عبور را به درستی وارد کنید.' });
      return;
    }

    const user = findUserByEmail(email);
    if (!user || !user.passwordHash) {
      res.status(401).json({
        error: 'ایمیل یا رمز عبور اشتباه است. اگر با کد ایمیل ثبت‌نام کرده‌اید، از ورود با کد ایمیل استفاده کنید.',
      });
      return;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
      return;
    }

    const session = issueSessionToken(user.id);
    if (!session) {
      res.status(500).json({ error: 'خطا در صدور نشست ورود.' });
      return;
    }

    setSessionCookie(res, session.token);
    const freshUser = findUserByEmail(user.email) || user;
    res.json({
      authenticated: true,
      user: toPublicUser(freshUser),
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const auth = getAuthFromRequest(req);
    const allDevices = Boolean(req.body?.allDevices);
    if (auth) {
      revokeSession(auth.user.id, auth.sessionId, allDevices);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.patch('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const fullName = String(req.body?.fullName ?? currentUser.fullName).trim();
    const phone = toEnglishDigits(String(req.body?.phone ?? currentUser.phone))
      .replace(/[\s-]/g, '')
      .trim();
    const nationalId = toEnglishDigits(String(req.body?.nationalId ?? currentUser.nationalId ?? ''))
      .replace(/[\s-]/g, '')
      .trim();
    const birthDate = String(req.body?.birthDate ?? currentUser.birthDate ?? '').trim();
    const newsletterOptIn =
      typeof req.body?.newsletterOptIn === 'boolean'
        ? req.body.newsletterOptIn
        : currentUser.newsletterOptIn;

    if (fullName.length < 3) {
      res.status(400).json({ error: 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.' });
      return;
    }
    if (phone && !/^09\d{9}$/.test(phone)) {
      res.status(400).json({ error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.' });
      return;
    }

    const updated = updateUserRecord(currentUser.id, (prev) => ({
      ...prev,
      fullName,
      phone,
      nationalId: nationalId || undefined,
      birthDate: birthDate || undefined,
      newsletterOptIn,
    }));

    if (!updated) {
      res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
      return;
    }

    res.json({ user: toPublicUser(updated) });
  });

  app.post('/api/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (currentUser.passwordHash && !verifyPassword(currentPassword, currentUser.passwordHash)) {
      res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' });
      return;
    }
    if (newPassword.length < 8 || !/\d/.test(toEnglishDigits(newPassword))) {
      res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل عدد باشد.' });
      return;
    }

    const updated = updateUserRecord(currentUser.id, (prev) => ({
      ...prev,
      passwordHash: hashPassword(newPassword),
    }));

    if (!updated) {
      res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
      return;
    }

    const alert = buildSecurityAlertEmailContent({
      fullName: updated.fullName,
      actionLabel: currentUser.passwordHash ? 'تغییر رمز عبور' : 'تنظیم رمز عبور حساب',
    });
    void sendEmailWithResend({
      to: updated.email,
      subject: alert.subject,
      html: alert.html,
      idempotencyKey: `pw-change-${updated.id}-${Date.now()}`,
      tags: [{ name: 'category', value: 'security_alert' }],
    });

    res.json({ user: toPublicUser(updated) });
  });

  app.post('/api/auth/addresses', requireAuth, (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const label = String(req.body?.label || '').trim();
    const receiverName = String(req.body?.receiverName || '').trim();
    const phone = toEnglishDigits(String(req.body?.phone || '')).replace(/[\s-]/g, '').trim();
    const city = String(req.body?.city || '').trim();
    const address = String(req.body?.address || '').trim();
    const postalCode = toEnglishDigits(String(req.body?.postalCode || '')).replace(/[\s-]/g, '').trim();
    const setAsDefault = Boolean(req.body?.isDefault);

    if (label.length < 2 || receiverName.length < 3 || !/^09\d{9}$/.test(phone) || city.length < 2 || address.length < 10 || !/^\d{10}$/.test(postalCode)) {
      res.status(400).json({ error: 'لطفاً تمام فیلدهای آدرس را به‌صورت صحیح تکمیل کنید.' });
      return;
    }

    const newAddr: StoredAddress = {
      id: crypto.randomUUID(),
      label,
      receiverName,
      phone,
      city,
      address,
      postalCode,
      isDefault: setAsDefault || currentUser.addresses.length === 0,
    };

    const updated = updateUserRecord(currentUser.id, (prev) => {
      const list = newAddr.isDefault
        ? prev.addresses.map((a) => ({ ...a, isDefault: false }))
        : prev.addresses;
      return {
        ...prev,
        addresses: [newAddr, ...list],
      };
    });

    res.json({ user: toPublicUser(updated!) });
  });

  app.put('/api/auth/addresses/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const addrId = String(req.params.id);
    const label = String(req.body?.label || '').trim();
    const receiverName = String(req.body?.receiverName || '').trim();
    const phone = toEnglishDigits(String(req.body?.phone || '')).replace(/[\s-]/g, '').trim();
    const city = String(req.body?.city || '').trim();
    const address = String(req.body?.address || '').trim();
    const postalCode = toEnglishDigits(String(req.body?.postalCode || '')).replace(/[\s-]/g, '').trim();
    const setAsDefault = Boolean(req.body?.isDefault);

    if (label.length < 2 || receiverName.length < 3 || !/^09\d{9}$/.test(phone) || city.length < 2 || address.length < 10 || !/^\d{10}$/.test(postalCode)) {
      res.status(400).json({ error: 'اطلاعات ویرایش آدرس معتبر نیست.' });
      return;
    }

    const updated = updateUserRecord(currentUser.id, (prev) => ({
      ...prev,
      addresses: prev.addresses.map((item) => {
        if (item.id === addrId) {
          return {
            ...item,
            label,
            receiverName,
            phone,
            city,
            address,
            postalCode,
            isDefault: setAsDefault ? true : item.isDefault,
          };
        }
        return setAsDefault ? { ...item, isDefault: false } : item;
      }),
    }));

    res.json({ user: toPublicUser(updated!) });
  });

  app.post('/api/auth/addresses/:id/default', requireAuth, (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const addrId = String(req.params.id);
    const updated = updateUserRecord(currentUser.id, (prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === addrId })),
    }));
    res.json({ user: toPublicUser(updated!) });
  });

  app.delete('/api/auth/addresses/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const addrId = String(req.params.id);
    const updated = updateUserRecord(currentUser.id, (prev) => {
      const remaining = prev.addresses.filter((a) => a.id !== addrId);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return {
        ...prev,
        addresses: remaining,
      };
    });
    res.json({ user: toPublicUser(updated!) });
  });

  app.post('/api/orders/notify', requireAuth, async (req: AuthenticatedRequest, res) => {
    const currentUser = req.authUser!;
    const orderCode = String(req.body?.orderCode || '').trim();
    const totalFormatted = String(req.body?.totalFormatted || '').trim();
    const itemsCount = Number(req.body?.itemsCount || 1);

    if (!orderCode) {
      res.status(400).json({ error: 'orderCode is required' });
      return;
    }

    const emailContent = buildOrderReceiptEmailContent({
      fullName: currentUser.fullName,
      orderCode,
      totalFormatted,
      itemsCount,
    });

    const delivery = await sendEmailWithResend({
      to: currentUser.email,
      subject: emailContent.subject,
      html: emailContent.html,
      idempotencyKey: `order-receipt-${orderCode}`,
      tags: [{ name: 'category', value: 'order_receipt' }],
    });

    res.json(delivery);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Amir Mobile Store server running on http://0.0.0.0:${PORT}`);
  });
}

createApp();
