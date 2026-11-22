import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createAdminRouter } from './server/adminRoutes.ts';
import {
  AuthService,
  createDefaultAuthStorage,
  hashPassword,
  toPublicUser,
  verifyPassword,
  type AuthStorageAdapter,
  type OtpPurpose,
  type StoredAddress,
  type StoredOrderRecord,
  type StoredUserRecord,
} from './server/authStore.ts';
import {
  getSessionCookieOptions,
  isOriginAllowed,
  resolveCorsConfig,
  resolveSessionSecret,
} from './server/config.ts';
import {
  buildOrderReceiptEmailContent,
  buildOtpEmailContent,
  buildSecurityAlertEmailContent,
  buildWelcomeEmailContent,
} from './server/emailTemplates.ts';
import { getResendProviderStatus, sendEmailWithResend } from './server/resendService.ts';
import {
  buildUsernameCandidateListServer,
  calculateOrderTotalsServer,
  CATEGORY_ITEMS,
  DEFAULT_DEV_BRANDS,
  evaluateCouponServer,
  maskEmailServer,
  normalizePhone,
  normalizeRole,
  normalizeUsernameServer,
  stripPrivateVariantFields,
  toSummaryOrderDTO,
  validateUsernameServer,
} from './server/storeData.ts';

const SESSION_COOKIE_NAME = 'amir_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string') {
    return proto.split(',')[0].trim().toLowerCase() === 'https';
  }
  return false;
}

interface AuthenticatedRequest extends Request {
  authUser?: StoredUserRecord;
  authSessionId?: string;
}

export interface CreateServerAppOptions {
  env?: NodeJS.ProcessEnv;
  storage?: AuthStorageAdapter;
  disableVite?: boolean;
  sendEmail?: typeof sendEmailWithResend;
  onOtpIssued?: (info: { email: string; purpose: OtpPurpose; code: string }) => void;
}

export async function createServerApp(options: CreateServerAppOptions = {}) {
  const env = options.env || process.env;
  const isProd = env.NODE_ENV === 'production';
  const isAiStudioRuntime = Boolean(env.APPLET_ID) && !env.RENDER && !options.env;
  const isAiStudioPreview =
    isAiStudioRuntime &&
    isProd &&
    !(env.AUTH_SESSION_SECRET && env.CORS_ORIGIN && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  const configEnv: NodeJS.ProcessEnv = isAiStudioPreview
    ? { ...env, NODE_ENV: 'development' }
    : env;

  const sessionSecret = resolveSessionSecret(configEnv);
  const corsCfg = resolveCorsConfig(configEnv);
  const storage = options.storage || createDefaultAuthStorage(configEnv);
  const authService = new AuthService(storage, sessionSecret);
  const dispatchEmail = options.sendEmail || sendEmailWithResend;

  // In standalone dev-memory mode (not automated unit tests passing options.storage),
  // ensure an admin account exists when no Supabase backend is configured.
  if (!options.storage && storage.mode === 'dev-memory' && env.NODE_ENV !== 'test') {
    const devAdminEmail = normalizeEmail(env.DEV_ADMIN_EMAIL || 'admin@amirmobile.ir');
    const devAdminPassword = String(env.DEV_ADMIN_PASSWORD || 'AmirAdmin123');
    const existingAdmin = await storage.findUserByEmail(devAdminEmail);
    if (!existingAdmin) {
      await storage.createUser({
        email: devAdminEmail,
        username: 'amiradmin',
        fullName: 'مدیر فروشگاه امیر',
        phone: '09120000001',
        passwordHash: hashPassword(devAdminPassword),
        role: 'admin',
      });
    } else if (!existingAdmin.username) {
      await storage.updateUser(existingAdmin.id, (prev) => ({
        ...prev,
        username: 'amiradmin',
      }));
    }
  }

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2mb' }));

  // Strict CORS middleware for /api/* routes (never block same-origin Vite/static ES module & CSS assets behind reverse proxies)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
    const rawHost = req.get('host');
    const forwardedHostHeader = req.get('x-forwarded-host');
    const forwardedHost = forwardedHostHeader
      ? forwardedHostHeader.split(',')[0].trim()
      : undefined;
    const effectiveHost = forwardedHost || rawHost;
    const proto = isHttpsRequest(req) ? 'https' : req.protocol || 'http';
    const selfOrigin = effectiveHost ? `${proto}://${effectiveHost}` : undefined;

    let originHost = '';
    if (origin) {
      try {
        originHost = new URL(origin).host.toLowerCase();
      } catch {
        originHost = '';
      }
    }

    let appUrlHost = '';
    if (env.APP_URL) {
      try {
        appUrlHost = new URL(env.APP_URL).host.toLowerCase();
      } catch {
        appUrlHost = '';
      }
    }

    const isSameHostOrigin = Boolean(
      originHost &&
        ((rawHost && originHost === rawHost.toLowerCase()) ||
          (forwardedHost && originHost === forwardedHost.toLowerCase()) ||
          (appUrlHost && originHost === appUrlHost))
    );

    const isAiStudioProxyOrigin = Boolean(
      isAiStudioRuntime &&
        originHost &&
        (/\.run\.app$/i.test(originHost.split(':')[0]) ||
          /(^|\.)aistudio\.google\.com$/i.test(originHost.split(':')[0]) ||
          /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(originHost))
    );

    const isApiRoute = req.path === '/api' || req.path.startsWith('/api/');

    if (origin) {
      const allowed =
        isSameHostOrigin ||
        isAiStudioProxyOrigin ||
        isOriginAllowed(origin, corsCfg.allowedOrigins, isProd && !isAiStudioPreview, selfOrigin);

      if (isApiRoute && !allowed) {
        res.status(403).json({ error: 'Origin not allowed by CORS' });
        return;
      }

      if (allowed || !isApiRoute) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Order-Tracking-Token'
        );
      }
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  const setSessionCookie = (req: Request, res: Response, token: string) => {
    res.cookie(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions({
        isProd,
        isHttpsRequest: isHttpsRequest(req),
        maxAgeMs: SESSION_MAX_AGE_MS,
        cookieDomain: isAiStudioRuntime ? undefined : env.COOKIE_DOMAIN,
      })
    );
  };

  const clearSessionCookie = (req: Request, res: Response) => {
    const opts = getSessionCookieOptions({
      isProd,
      isHttpsRequest: isHttpsRequest(req),
      cookieDomain: isAiStudioRuntime ? undefined : env.COOKIE_DOMAIN,
    });
    res.clearCookie(SESSION_COOKIE_NAME, opts);
  };

  const getAuthFromRequest = async (
    req: Request
  ): Promise<{ user: StoredUserRecord; sessionId: string } | null> => {
    const cookies = parseCookies(req.headers.cookie);
    return authService.verifySessionToken(cookies[SESSION_COOKIE_NAME]);
  };

  const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = await getAuthFromRequest(req);
      if (!auth) {
        res.status(401).json({ error: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
        return;
      }
      req.authUser = auth.user;
      req.authSessionId = auth.sessionId;
      next();
    } catch (err) {
      next(err);
    }
  };

  const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.authUser) {
      res.status(401).json({ error: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
      return;
    }
    if (normalizeRole(req.authUser.role) !== 'admin') {
      res.status(403).json({ error: 'شما مجوز دسترسی به پنل مدیریت را ندارید.' });
      return;
    }
    next();
  };

  const issueOrderTrackingToken = (orderCode: string): string => {
    const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
    const sig = crypto
      .createHmac('sha256', sessionSecret)
      .update(`order-track:${normalized}`)
      .digest('hex');
    return sig;
  };

  const verifyOrderTrackingToken = (orderCode: string, candidate: unknown): boolean => {
    if (typeof candidate !== 'string' || !candidate.trim()) return false;
    const expected = issueOrderTrackingToken(orderCode);
    const a = Buffer.from(candidate.trim(), 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || a.length === 0) return false;
    return crypto.timingSafeEqual(a, b);
  };

  app.get('/api/health', async (_req, res) => {
    const storageHealth = await authService.checkHealth().catch((err) => ({
      ok: false,
      mode: authService.storageMode,
      detail: err instanceof Error ? err.message : 'Storage health check failed',
    }));

    const statusCode = storageHealth.ok ? 200 : 503;
    res.status(statusCode).json({
      ok: storageHealth.ok,
      service: 'amir-mobile-api',
      environment: isProd ? 'production' : 'development',
      storage: storageHealth,
      corsConfigured: corsCfg.configured,
      resend: getResendProviderStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/auth/status', async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      res.json({
        ...getResendProviderStatus(),
        storageMode: authService.storageMode,
        authenticated: Boolean(auth),
        user: auth ? toPublicUser(auth.user) : null,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/me', async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      if (!auth) {
        res.json({ authenticated: false, user: null });
        return;
      }
      res.json({ authenticated: true, user: toPublicUser(auth.user) });
    } catch (err) {
      next(err);
    }
  });

  const buildAvailableUsernameSuggestions = async (
    seed: string,
    excludeUserId?: string
  ): Promise<string[]> => {
    const candidates = buildUsernameCandidateListServer(seed);
    const availableList: string[] = [];
    for (const candidate of candidates) {
      const existing = await authService.findUserByUsername(candidate);
      if (!existing || (excludeUserId && existing.id === excludeUserId)) {
        availableList.push(candidate);
      }
      if (availableList.length >= 4) break;
    }
    return availableList;
  };

  const resolveUserByEmailOrUsername = async (
    rawIdentifier: unknown
  ): Promise<{ user: StoredUserRecord | null; byUsername: boolean; normalized: string }> => {
    const text = String(rawIdentifier ?? '').trim();
    if (!text) {
      return { user: null, byUsername: false, normalized: '' };
    }
    const emailCandidate = normalizeEmail(text);
    if (text.includes('@') && !text.startsWith('@') && isValidEmail(emailCandidate)) {
      const user = await authService.findUserByEmail(emailCandidate);
      return { user, byUsername: false, normalized: emailCandidate };
    }
    const uname = normalizeUsernameServer(text);
    const validation = validateUsernameServer(uname);
    if (!validation.valid) {
      return { user: null, byUsername: true, normalized: uname };
    }
    const user = await authService.findUserByUsername(validation.normalized);
    return { user, byUsername: true, normalized: validation.normalized };
  };

  app.get('/api/auth/username-available', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const rawUsername = String(req.query.username ?? '');
      const seedHint = String(req.query.seed ?? rawUsername);
      const auth = await getAuthFromRequest(req);
      const check = validateUsernameServer(rawUsername);

      if (!check.valid) {
        const suggestions = await buildAvailableUsernameSuggestions(seedHint || 'amir_user', auth?.user.id);
        res.json({
          valid: false,
          available: false,
          normalized: check.normalized,
          error: check.error,
          suggestions,
        });
        return;
      }

      const existing = await authService.findUserByUsername(check.normalized);
      const isCurrent = Boolean(auth && existing && existing.id === auth.user.id);
      const available = !existing || isCurrent;
      const suggestions = available
        ? []
        : await buildAvailableUsernameSuggestions(check.normalized, auth?.user.id);

      res.json({
        valid: true,
        available,
        isCurrent,
        normalized: check.normalized,
        ...(available
          ? {}
          : {
              error: 'این نام کاربری قبلاً انتخاب شده است.',
              suggestions,
            }),
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/users/:username', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const check = validateUsernameServer(req.params.username);
      if (!check.valid) {
        res.status(400).json({ error: check.error || 'فرمت نام کاربری معتبر نیست.' });
        return;
      }
      const user = await authService.findUserByUsername(check.normalized);
      if (!user || !user.username) {
        res.status(404).json({ error: 'کاربری با این نام کاربری یافت نشد.' });
        return;
      }
      res.json({
        profile: {
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          memberSince: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  const issueAndSendOtpChallenge = async (params: {
    email: string;
    purpose: OtpPurpose;
    recipientName?: string;
    pendingUserId?: string;
    pendingSignup?: {
      fullName: string;
      username?: string;
      phone: string;
      passwordHash?: string;
    };
  }): Promise<
    | {
        ok: true;
        provider: 'resend' | 'sandbox-preview';
        emailId?: string;
        previewCode?: string;
        cooldownSeconds: number;
        warning?: string;
      }
    | { ok: false; statusCode: number; error: string; retryAfterSeconds?: number }
  > => {
    const challengeResult = await authService.createOtpChallenge({
      email: params.email,
      purpose: params.purpose,
      pendingUserId: params.pendingUserId,
      pendingSignup: params.pendingSignup,
    });

    if (!challengeResult.ok) {
      return {
        ok: false,
        statusCode: 429,
        error: `لطفاً ${challengeResult.retryAfterSeconds} ثانیه دیگر برای ارسال مجدد کد صبر کنید.`,
        retryAfterSeconds: challengeResult.retryAfterSeconds,
      };
    }

    options.onOtpIssued?.({
      email: params.email,
      purpose: params.purpose,
      code: challengeResult.code,
    });

    const emailContent = buildOtpEmailContent({
      code: challengeResult.code,
      purpose: params.purpose,
      recipientName: params.recipientName,
    });

    const delivery = await dispatchEmail({
      to: params.email,
      subject: emailContent.subject,
      html: emailContent.html,
      idempotencyKey: `otp-${params.purpose}-${challengeResult.challengeId}`,
      tags: [{ name: 'category', value: `auth_${params.purpose.replace('-', '_')}` }],
    });

    if (delivery.sent) {
      return {
        ok: true,
        provider: 'resend',
        emailId: delivery.emailId,
        cooldownSeconds: challengeResult.cooldownSeconds,
      };
    }

    if (delivery.provider === 'sandbox-preview' && !isProd) {
      return {
        ok: true,
        provider: 'sandbox-preview',
        previewCode: challengeResult.code,
        cooldownSeconds: challengeResult.cooldownSeconds,
        warning:
          'کد تایید به‌صورت موقت برای تست در همین صفحه نمایش داده می‌شود.',
      };
    }

    await authService.clearOtpChallenge(params.email, params.purpose);
    return {
      ok: false,
      statusCode: delivery.statusCode && delivery.statusCode >= 400 ? delivery.statusCode : 502,
      error:
        delivery.provider === 'sandbox-preview'
          ? 'سرویس ارسال ایمیل (RESEND_API_KEY) در محیط Production پیکربندی نشده است.'
          : `خطا در ارسال ایمیل از طریق Resend: ${delivery.errorMessage || 'خطای نامشخص'}`,
    };
  };

  app.post('/api/auth/send-otp', async (req, res, next) => {
    try {
      const rawIdentifier = String(req.body?.identifier ?? req.body?.email ?? '').trim();
      const purpose = String(req.body?.purpose || '') as OtpPurpose;

      if (!['signup', 'login', 'reset-password', 'change-email'].includes(purpose)) {
        res.status(400).json({ error: 'نوع درخواست کد تایید معتبر نیست.' });
        return;
      }

      let email = normalizeEmail(req.body?.email ?? rawIdentifier);
      let lookupByUsername = false;
      let recipientName: string | undefined;
      let pendingUserId: string | undefined;
      let pendingSignup:
        | { fullName: string; username?: string; phone: string; passwordHash?: string }
        | undefined;

      if (purpose === 'signup') {
        if (!isValidEmail(email)) {
          res.status(400).json({ error: 'آدرس ایمیل واردشده معتبر نیست.' });
          return;
        }
        const existing = await authService.findUserByEmail(email);
        if (existing) {
          res.status(409).json({
            error: 'حساب کاربری با این ایمیل قبلاً ثبت شده است. لطفاً از بخش ورود اقدام کنید.',
          });
          return;
        }
        const fullName = String(req.body?.fullName || '').trim();
        const phone = toEnglishDigits(String(req.body?.phone || ''))
          .replace(/[\s-]/g, '')
          .trim();
        const password = String(req.body?.password || '');
        const rawUsername = req.body?.username !== undefined ? String(req.body.username).trim() : '';

        let validUsername: string | undefined;
        if (rawUsername) {
          const check = validateUsernameServer(rawUsername);
          if (!check.valid) {
            res.status(400).json({ error: check.error || 'نام کاربری معتبر نیست.' });
            return;
          }
          const usernameTaken = await authService.findUserByUsername(check.normalized);
          if (usernameTaken) {
            const suggestions = await buildAvailableUsernameSuggestions(check.normalized);
            res.status(409).json({
              error: 'این نام کاربری قبلاً انتخاب شده است.',
              suggestions,
            });
            return;
          }
          validUsername = check.normalized;
        }

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
          ...(validUsername ? { username: validUsername } : {}),
          phone,
          passwordHash: hashPassword(password),
        };
      } else if (purpose === 'reset-password') {
        const resolved = await resolveUserByEmailOrUsername(rawIdentifier);
        if (!resolved.normalized) {
          res.status(400).json({ error: 'لطفاً ایمیل یا نام کاربری معتبر وارد کنید.' });
          return;
        }
        if (!resolved.byUsername && !isValidEmail(resolved.normalized)) {
          res.status(400).json({ error: 'آدرس ایمیل واردشده معتبر نیست.' });
          return;
        }
        if (!resolved.user) {
          res.status(404).json({
            error: resolved.byUsername
              ? 'حساب کاربری با این نام کاربری یافت نشد.'
              : 'حساب کاربری با این ایمیل یافت نشد.',
          });
          return;
        }
        email = resolved.user.email;
        lookupByUsername = resolved.byUsername;
        recipientName = resolved.user.fullName;
        pendingUserId = resolved.user.id;
      } else if (purpose === 'change-email') {
        if (!isValidEmail(email)) {
          res.status(400).json({ error: 'آدرس ایمیل واردشده معتبر نیست.' });
          return;
        }
        const auth = await getAuthFromRequest(req);
        if (!auth) {
          res.status(401).json({ error: 'برای تغییر ایمیل ابتدا باید وارد حساب کاربری شوید.' });
          return;
        }
        if (auth.user.email === email) {
          res.status(400).json({ error: 'ایمیل جدید با ایمیل فعلی حساب شما یکسان است.' });
          return;
        }
        const conflict = await authService.findUserByEmail(email);
        if (conflict) {
          res.status(409).json({ error: 'این ایمیل قبلاً برای حساب دیگری ثبت شده است.' });
          return;
        }
        recipientName = auth.user.fullName;
        pendingUserId = auth.user.id;
      } else if (purpose === 'login') {
        const resolved = await resolveUserByEmailOrUsername(rawIdentifier);
        if (!resolved.normalized) {
          res.status(400).json({ error: 'لطفاً ایمیل یا نام کاربری معتبر وارد کنید.' });
          return;
        }
        if (!resolved.byUsername && !isValidEmail(resolved.normalized)) {
          res.status(400).json({ error: 'آدرس ایمیل یا نام کاربری واردشده معتبر نیست.' });
          return;
        }
        if (!resolved.user) {
          res.status(404).json({
            error: resolved.byUsername
              ? 'حساب کاربری با این نام کاربری یافت نشد. لطفاً ایمیل خود را وارد کرده یا ثبت‌نام کنید.'
              : 'حساب کاربری با این ایمیل ثبت نشده است. لطفاً ابتدا از بخش «ثبت‌نام جدید» حساب کاربری خود را ایجاد کنید.',
          });
          return;
        }
        if (resolved.user.twoFactorEnabled) {
          res.status(403).json({
            error:
              'تایید دومرحله‌ای (2FA) برای این حساب فعال است. لطفاً از بخش «ورود با رمز عبور» وارد شوید.',
          });
          return;
        }
        email = resolved.user.email;
        lookupByUsername = resolved.byUsername;
        recipientName = resolved.user.fullName;
        pendingUserId = resolved.user.id;
      }

      const otpResult = await issueAndSendOtpChallenge({
        email,
        purpose,
        recipientName,
        pendingUserId,
        pendingSignup,
      });

      if (!otpResult.ok) {
        res.status(otpResult.statusCode).json({
          error: otpResult.error,
          ...(otpResult.retryAfterSeconds ? { retryAfterSeconds: otpResult.retryAfterSeconds } : {}),
        });
        return;
      }

      res.json({
        sent: true,
        provider: otpResult.provider,
        ...(lookupByUsername ? { maskedEmail: maskEmailServer(email) } : {}),
        ...(otpResult.emailId ? { emailId: otpResult.emailId } : {}),
        ...(otpResult.previewCode ? { previewCode: otpResult.previewCode } : {}),
        cooldownSeconds: otpResult.cooldownSeconds,
        ...(otpResult.warning ? { warning: otpResult.warning } : {}),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/verify-otp', async (req, res, next) => {
    try {
      const rawIdentifier = String(req.body?.identifier ?? req.body?.email ?? '').trim();
      const purpose = String(req.body?.purpose || '') as OtpPurpose;
      const code = toEnglishDigits(String(req.body?.code || ''))
        .replace(/[\s\-_]/g, '')
        .trim();

      if (!['signup', 'login', 'reset-password', 'change-email'].includes(purpose)) {
        res.status(400).json({ error: 'نوع درخواست کد تایید معتبر نیست.' });
        return;
      }

      let email = normalizeEmail(req.body?.email ?? rawIdentifier);
      if (purpose === 'login' || purpose === 'reset-password') {
        const resolved = await resolveUserByEmailOrUsername(rawIdentifier);
        if (resolved.user) {
          email = resolved.user.email;
        }
      }

      if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
        res.status(400).json({ error: 'ایمیل، نام کاربری یا کد تایید ۶ رقمی معتبر نیست.' });
        return;
      }

      const verification = await authService.verifyOtpChallenge(email, purpose, code);
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
        const existing = await authService.findUserByEmail(email);
        if (existing) {
          res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است.' });
          return;
        }
        if (challenge.pendingSignup.username) {
          const usernameConflict = await authService.findUserByUsername(challenge.pendingSignup.username);
          if (usernameConflict) {
            const suggestions = await buildAvailableUsernameSuggestions(challenge.pendingSignup.username);
            res.status(409).json({
              error: 'نام کاربری انتخاب‌شده در این فاصله توسط کاربر دیگری ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.',
              suggestions,
            });
            return;
          }
        }
        user = await authService.createUserAccount({
          email,
          username: challenge.pendingSignup.username,
          fullName: challenge.pendingSignup.fullName,
          phone: challenge.pendingSignup.phone,
          passwordHash: challenge.pendingSignup.passwordHash,
        });

        const welcome = buildWelcomeEmailContent({ fullName: user.fullName });
        void dispatchEmail({
          to: user.email,
          subject: welcome.subject,
          html: welcome.html,
          idempotencyKey: `welcome-${user.id}`,
          tags: [{ name: 'category', value: 'welcome' }],
        });
      } else if (purpose === 'login') {
        const existing = await authService.findUserByEmail(email);
        if (!existing) {
          res.status(404).json({
            error: 'حساب کاربری با این مشخصات یافت نشد. لطفاً ابتدا ثبت‌نام کنید.',
          });
          return;
        }
        if (existing.twoFactorEnabled) {
          res.status(403).json({
            error: 'تایید دومرحله‌ای (2FA) برای این حساب فعال است. لطفاً با رمز عبور وارد شوید.',
          });
          return;
        }
        user = await authService.updateUserRecord(existing.id, (prev) => ({
          ...prev,
          emailVerified: true,
        }));
      } else if (purpose === 'reset-password') {
        const newPassword = String(req.body?.newPassword || '');
        if (newPassword.length < 8 || !/\d/.test(toEnglishDigits(newPassword))) {
          res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل عدد باشد.' });
          return;
        }
        const existing = await authService.findUserByEmail(email);
        if (!existing) {
          res.status(404).json({ error: 'کاربر یافت نشد.' });
          return;
        }
        user = await authService.updateUserRecord(existing.id, (prev) => ({
          ...prev,
          passwordHash: hashPassword(newPassword),
          emailVerified: true,
        }));
        if (user) {
          const alert = buildSecurityAlertEmailContent({
            fullName: user.fullName,
            actionLabel: 'بازیابی و تغییر رمز عبور',
          });
          void dispatchEmail({
            to: user.email,
            subject: alert.subject,
            html: alert.html,
            idempotencyKey: `reset-pw-${user.id}-${Date.now()}`,
            tags: [{ name: 'category', value: 'security_alert' }],
          });
        }
      } else if (purpose === 'change-email') {
        const auth = await getAuthFromRequest(req);
        if (!auth || auth.user.id !== challenge.pendingUserId) {
          res.status(401).json({ error: 'نشست کاربری نامعتبر است.' });
          return;
        }
        user = await authService.updateUserRecord(auth.user.id, (prev) => ({
          ...prev,
          email,
          emailVerified: true,
        }));
        if (user) {
          const alert = buildSecurityAlertEmailContent({
            fullName: user.fullName,
            actionLabel: `تغییر ایمیل حساب به ${email}`,
          });
          void dispatchEmail({
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

      const session = await authService.issueSessionToken(user.id);
      if (!session) {
        res.status(500).json({ error: 'خطا در ایجاد نشست کاربری.' });
        return;
      }

      setSessionCookie(req, res, session.token);
      const freshUser = (await authService.findUserByEmail(user.email)) || user;
      res.json({
        authenticated: true,
        user: toPublicUser(freshUser),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login-password', async (req, res, next) => {
    try {
      const rawIdentifier = String(req.body?.identifier ?? req.body?.email ?? '').trim();
      const password = String(req.body?.password || '');

      if (!rawIdentifier || !password) {
        res.status(400).json({ error: 'ایمیل (یا نام کاربری) و رمز عبور را به درستی وارد کنید.' });
        return;
      }

      const resolved = await resolveUserByEmailOrUsername(rawIdentifier);
      if (!resolved.byUsername && !isValidEmail(resolved.normalized)) {
        res.status(400).json({ error: 'ایمیل یا نام کاربری و رمز عبور را به درستی وارد کنید.' });
        return;
      }

      const user = resolved.user;
      if (!user || !user.passwordHash) {
        res.status(401).json({
          error:
            'ایمیل / نام کاربری یا رمز عبور اشتباه است. اگر با کد ایمیل ثبت‌نام کرده‌اید، از ورود با کد ایمیل استفاده کنید.',
        });
        return;
      }

      if (!verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ error: 'ایمیل / نام کاربری یا رمز عبور اشتباه است.' });
        return;
      }

      if (user.twoFactorEnabled) {
        const otpResult = await issueAndSendOtpChallenge({
          email: user.email,
          purpose: 'login-2fa',
          recipientName: user.fullName,
          pendingUserId: user.id,
        });

        if (!otpResult.ok) {
          res.status(otpResult.statusCode).json({
            error: otpResult.error,
            ...(otpResult.retryAfterSeconds
              ? { retryAfterSeconds: otpResult.retryAfterSeconds }
              : {}),
          });
          return;
        }

        const twoFactorToken = authService.issueTwoFactorToken(user.id, user.email);
        res.json({
          authenticated: false,
          requires2FA: true,
          twoFactorToken,
          ...(resolved.byUsername ? {} : { email: user.email }),
          maskedEmail: maskEmailServer(user.email),
          provider: otpResult.provider,
          ...(otpResult.emailId ? { emailId: otpResult.emailId } : {}),
          ...(otpResult.previewCode ? { previewCode: otpResult.previewCode } : {}),
          cooldownSeconds: otpResult.cooldownSeconds,
          ...(otpResult.warning ? { warning: otpResult.warning } : {}),
          user: null,
        });
        return;
      }

      const session = await authService.issueSessionToken(user.id);
      if (!session) {
        res.status(500).json({ error: 'خطا در صدور نشست ورود.' });
        return;
      }

      setSessionCookie(req, res, session.token);
      const freshUser = (await authService.findUserByEmail(user.email)) || user;
      res.json({
        authenticated: true,
        requires2FA: false,
        user: toPublicUser(freshUser),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/verify-2fa', async (req, res, next) => {
    try {
      const twoFactorToken = String(req.body?.twoFactorToken || '');
      const code = toEnglishDigits(String(req.body?.code || ''))
        .replace(/[\s\-_]/g, '')
        .trim();

      const pending2fa = authService.verifyTwoFactorToken(twoFactorToken);
      if (!pending2fa) {
        res.status(401).json({
          error: 'زمان تایید دومرحله‌ای به پایان رسیده است. لطفاً دوباره با رمز عبور وارد شوید.',
        });
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        res.status(400).json({ error: 'کد تایید باید دقیقاً ۶ رقم باشد.' });
        return;
      }

      const verification = await authService.verifyOtpChallenge(pending2fa.email, 'login-2fa', code);
      if (!verification.ok) {
        res.status(400).json({ error: verification.messageFa });
        return;
      }

      const user = await authService.findUserById(pending2fa.userId);
      if (!user) {
        res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
        return;
      }

      const session = await authService.issueSessionToken(user.id);
      if (!session) {
        res.status(500).json({ error: 'خطا در ایجاد نشست کاربری.' });
        return;
      }

      setSessionCookie(req, res, session.token);
      const freshUser = (await authService.findUserById(user.id)) || user;
      res.json({
        authenticated: true,
        user: toPublicUser(freshUser),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/resend-2fa', async (req, res, next) => {
    try {
      const twoFactorToken = String(req.body?.twoFactorToken || '');
      const pending2fa = authService.verifyTwoFactorToken(twoFactorToken);
      if (!pending2fa) {
        res.status(401).json({
          error: 'زمان تایید دومرحله‌ای به پایان رسیده است. لطفاً دوباره با رمز عبور وارد شوید.',
        });
        return;
      }

      const user = await authService.findUserById(pending2fa.userId);
      if (!user || !user.twoFactorEnabled) {
        res.status(400).json({ error: 'تایید دومرحله‌ای برای این حساب فعال نیست.' });
        return;
      }

      const otpResult = await issueAndSendOtpChallenge({
        email: user.email,
        purpose: 'login-2fa',
        recipientName: user.fullName,
        pendingUserId: user.id,
      });

      if (!otpResult.ok) {
        res.status(otpResult.statusCode).json({
          error: otpResult.error,
          ...(otpResult.retryAfterSeconds
            ? { retryAfterSeconds: otpResult.retryAfterSeconds }
            : {}),
        });
        return;
      }

      res.json({
        sent: true,
        provider: otpResult.provider,
        ...(otpResult.emailId ? { emailId: otpResult.emailId } : {}),
        ...(otpResult.previewCode ? { previewCode: otpResult.previewCode } : {}),
        cooldownSeconds: otpResult.cooldownSeconds,
        ...(otpResult.warning ? { warning: otpResult.warning } : {}),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/logout', async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const allDevices = Boolean(req.body?.allDevices);
      if (auth) {
        await authService.revokeSession(auth.user.id, auth.sessionId, allDevices);
      }
      clearSessionCookie(req, res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/auth/username', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const rawUsername = String(req.body?.username ?? '').trim();
      const check = validateUsernameServer(rawUsername);
      if (!check.valid) {
        res.status(400).json({ error: check.error || 'نام کاربری معتبر نیست.' });
        return;
      }

      if (currentUser.username === check.normalized) {
        res.json({ user: toPublicUser(currentUser) });
        return;
      }

      const conflict = await authService.findUserByUsername(check.normalized);
      if (conflict && conflict.id !== currentUser.id) {
        const suggestions = await buildAvailableUsernameSuggestions(check.normalized, currentUser.id);
        res.status(409).json({
          error: 'این نام کاربری قبلاً توسط کاربر دیگری انتخاب شده است.',
          suggestions,
        });
        return;
      }

      const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
        ...prev,
        username: check.normalized,
      }));

      if (!updated) {
        res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
        return;
      }

      const alert = buildSecurityAlertEmailContent({
        fullName: updated.fullName,
        actionLabel: `تغییر نام کاربری حساب به @${check.normalized}`,
      });
      void dispatchEmail({
        to: updated.email,
        subject: alert.subject,
        html: alert.html,
        idempotencyKey: `username-change-${updated.id}-${Date.now()}`,
        tags: [{ name: 'category', value: 'security_alert' }],
      });

      res.json({ user: toPublicUser(updated) });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/auth/profile', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const fullName = String(req.body?.fullName ?? currentUser.fullName).trim();
      const phone = toEnglishDigits(String(req.body?.phone ?? currentUser.phone))
        .replace(/[\s-]/g, '')
        .trim();
      const nationalId = toEnglishDigits(
        String(req.body?.nationalId ?? currentUser.nationalId ?? '')
      )
        .replace(/[\s-]/g, '')
        .trim();
      const birthDate = String(req.body?.birthDate ?? currentUser.birthDate ?? '').trim();
      const newsletterOptIn =
        typeof req.body?.newsletterOptIn === 'boolean'
          ? req.body.newsletterOptIn
          : currentUser.newsletterOptIn;

      let nextUsername = currentUser.username;
      if (req.body?.username !== undefined) {
        const rawUsername = String(req.body.username ?? '').trim();
        if (!rawUsername) {
          nextUsername = undefined;
        } else {
          const check = validateUsernameServer(rawUsername);
          if (!check.valid) {
            res.status(400).json({ error: check.error || 'نام کاربری معتبر نیست.' });
            return;
          }
          if (check.normalized !== currentUser.username) {
            const conflict = await authService.findUserByUsername(check.normalized);
            if (conflict && conflict.id !== currentUser.id) {
              const suggestions = await buildAvailableUsernameSuggestions(check.normalized, currentUser.id);
              res.status(409).json({
                error: 'این نام کاربری قبلاً انتخاب شده است.',
                suggestions,
              });
              return;
            }
          }
          nextUsername = check.normalized;
        }
      }

      let nextAvatarUrl = currentUser.avatarUrl;
      if (req.body?.avatarUrl !== undefined) {
        const rawAvatar = String(req.body.avatarUrl ?? '').trim();
        if (!rawAvatar) {
          nextAvatarUrl = undefined;
        } else if (rawAvatar.startsWith('data:image/')) {
          if (rawAvatar.length > 480_000) {
            res.status(400).json({ error: 'حجم تصویر پروفایل بسیار زیاد است. لطفاً تصویر کوچک‌تری انتخاب کنید.' });
            return;
          }
          nextAvatarUrl = rawAvatar;
        } else if (/^https?:\/\//i.test(rawAvatar) && rawAvatar.length <= 1024) {
          nextAvatarUrl = rawAvatar;
        } else {
          res.status(400).json({ error: 'فرمت تصویر پروفایل معتبر نیست.' });
          return;
        }
      }

      if (fullName.length < 3) {
        res.status(400).json({ error: 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.' });
        return;
      }
      if (phone && !/^09\d{9}$/.test(phone)) {
        res.status(400).json({ error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.' });
        return;
      }

      const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
        ...prev,
        username: nextUsername,
        fullName,
        phone,
        avatarUrl: nextAvatarUrl,
        nationalId: nationalId || undefined,
        birthDate: birthDate || undefined,
        newsletterOptIn,
      }));

      if (!updated) {
        res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
        return;
      }

      res.json({ user: toPublicUser(updated) });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/auth/account', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const currentPassword = String(req.body?.currentPassword || '');
      if (currentUser.passwordHash && !verifyPassword(currentPassword, currentUser.passwordHash)) {
        res.status(400).json({ error: 'برای حذف حساب کاربری، وارد کردن رمز عبور صحیح الزامی است.' });
        return;
      }
      await authService.deleteUserAccount(currentUser.id);
      clearSessionCookie(req, res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.post(
    '/api/auth/change-password',
    requireAuth,
    async (req: AuthenticatedRequest, res, next) => {
      try {
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

        const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
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
        void dispatchEmail({
          to: updated.email,
          subject: alert.subject,
          html: alert.html,
          idempotencyKey: `pw-change-${updated.id}-${Date.now()}`,
          tags: [{ name: 'category', value: 'security_alert' }],
        });

        res.json({ user: toPublicUser(updated) });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/auth/two-factor',
    requireAuth,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const currentUser = req.authUser!;
        const enabled = Boolean(req.body?.enabled);
        const currentPassword = String(req.body?.currentPassword || '');

        if (enabled && !currentUser.passwordHash) {
          res.status(400).json({
            error:
              'برای فعال‌سازی تایید دومرحله‌ای (2FA)، ابتدا باید از بخش بالا یک رمز عبور برای حساب خود تنظیم کنید.',
          });
          return;
        }

        if (currentUser.passwordHash && !verifyPassword(currentPassword, currentUser.passwordHash)) {
          res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' });
          return;
        }

        const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
          ...prev,
          twoFactorEnabled: enabled,
        }));

        if (!updated) {
          res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
          return;
        }

        const alert = buildSecurityAlertEmailContent({
          fullName: updated.fullName,
          actionLabel: enabled
            ? 'فعال‌سازی تایید دومرحله‌ای (2FA)'
            : 'غیرفعال‌سازی تایید دومرحله‌ای (2FA)',
        });
        void dispatchEmail({
          to: updated.email,
          subject: alert.subject,
          html: alert.html,
          idempotencyKey: `2fa-toggle-${updated.id}-${Date.now()}`,
          tags: [{ name: 'category', value: 'security_alert' }],
        });

        res.json({ user: toPublicUser(updated) });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post('/api/auth/addresses', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const label = String(req.body?.label || '').trim();
      const receiverName = String(req.body?.receiverName || '').trim();
      const phone = toEnglishDigits(String(req.body?.phone || ''))
        .replace(/[\s-]/g, '')
        .trim();
      const city = String(req.body?.city || '').trim();
      const address = String(req.body?.address || '').trim();
      const postalCode = toEnglishDigits(String(req.body?.postalCode || ''))
        .replace(/[\s-]/g, '')
        .trim();
      const setAsDefault = Boolean(req.body?.isDefault);

      if (
        label.length < 2 ||
        receiverName.length < 3 ||
        !/^09\d{9}$/.test(phone) ||
        city.length < 2 ||
        address.length < 10 ||
        !/^\d{10}$/.test(postalCode)
      ) {
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

      const updated = await authService.updateUserRecord(currentUser.id, (prev) => {
        const list = newAddr.isDefault
          ? prev.addresses.map((a) => ({ ...a, isDefault: false }))
          : prev.addresses;
        return {
          ...prev,
          addresses: [newAddr, ...list],
        };
      });

      res.json({ user: toPublicUser(updated!) });
    } catch (err) {
      next(err);
    }
  });

  app.put(
    '/api/auth/addresses/:id',
    requireAuth,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const currentUser = req.authUser!;
        const addrId = String(req.params.id);
        const label = String(req.body?.label || '').trim();
        const receiverName = String(req.body?.receiverName || '').trim();
        const phone = toEnglishDigits(String(req.body?.phone || ''))
          .replace(/[\s-]/g, '')
          .trim();
        const city = String(req.body?.city || '').trim();
        const address = String(req.body?.address || '').trim();
        const postalCode = toEnglishDigits(String(req.body?.postalCode || ''))
          .replace(/[\s-]/g, '')
          .trim();
        const setAsDefault = Boolean(req.body?.isDefault);

        if (
          label.length < 2 ||
          receiverName.length < 3 ||
          !/^09\d{9}$/.test(phone) ||
          city.length < 2 ||
          address.length < 10 ||
          !/^\d{10}$/.test(postalCode)
        ) {
          res.status(400).json({ error: 'اطلاعات ویرایش آدرس معتبر نیست.' });
          return;
        }

        const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
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
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/auth/addresses/:id/default',
    requireAuth,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const currentUser = req.authUser!;
        const addrId = String(req.params.id);
        const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === addrId })),
        }));
        res.json({ user: toPublicUser(updated!) });
      } catch (err) {
        next(err);
      }
    }
  );

  app.delete(
    '/api/auth/addresses/:id',
    requireAuth,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const currentUser = req.authUser!;
        const addrId = String(req.params.id);
        const updated = await authService.updateUserRecord(currentUser.id, (prev) => {
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
      } catch (err) {
        next(err);
      }
    }
  );

  app.put('/api/auth/wishlist', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const rawList = Array.isArray(req.body?.wishlist) ? (req.body.wishlist as unknown[]) : null;
      if (!rawList) {
        res.status(400).json({ error: 'لیست علاقه‌مندی‌ها باید به‌صورت آرایه ارسال شود.' });
        return;
      }

      const cleaned: string[] = Array.from(
        new Set<string>(rawList.map((item) => String(item ?? '').trim()).filter(Boolean))
      ).slice(0, 100);

      const updated = await authService.updateUserRecord(currentUser.id, (prev) => ({
        ...prev,
        wishlist: cleaned,
      }));

      if (!updated) {
        res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
        return;
      }

      res.json({ user: toPublicUser(updated), wishlist: updated.wishlist });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/wishlist/toggle', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const productId = String(req.body?.productId || '').trim();
      if (!productId || productId.length > 120) {
        res.status(400).json({ error: 'شناسه محصول معتبر نیست.' });
        return;
      }

      let added = false;
      const updated = await authService.updateUserRecord(currentUser.id, (prev) => {
        const exists = prev.wishlist.includes(productId);
        added = !exists;
        const nextWishlist = exists
          ? prev.wishlist.filter((id) => id !== productId)
          : [...prev.wishlist, productId].slice(0, 100);
        return {
          ...prev,
          wishlist: nextWishlist,
        };
      });

      if (!updated) {
        res.status(404).json({ error: 'حساب کاربری یافت نشد.' });
        return;
      }

      res.json({
        user: toPublicUser(updated),
        wishlist: updated.wishlist,
        added,
      });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================================
  // Storefront Public Catalog, Reviews, Coupons, Config, Support & Newsletter APIs
  // ============================================================================
  app.get('/api/categories', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const categories = await storage.listCategories(false).catch(() => [...CATEGORY_ITEMS]);
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/brands', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const [storedBrands, products] = await Promise.all([
        storage.listBrands().catch(() => [...DEFAULT_DEV_BRANDS]),
        storage.listProducts({}).catch(() => []),
      ]);
      const seen = new Map<string, (typeof DEFAULT_DEV_BRANDS)[number]>();
      for (const b of storedBrands) {
        if (b.isActive !== false) {
          seen.set(b.name.toLowerCase(), b);
        }
      }
      for (const p of products) {
        const name = String(p.brand || '').trim();
        if (name && !seen.has(name.toLowerCase())) {
          seen.set(name.toLowerCase(), {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            isActive: true,
          });
        }
      }
      res.json({ brands: [...seen.values()] });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/store/config', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const [coupons, settings] = await Promise.all([
        storage.listActiveCoupons(),
        storage.getStoreSettings(),
      ]);
      res.json({ coupons, settings });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/products', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
      const categoryParam = typeof req.query.category === 'string' ? req.query.category : undefined;
      const categories =
        categoryParam && categoryParam !== 'all' && categoryParam !== 'offers'
          ? await storage.listCategories(true).catch(() => [...CATEGORY_ITEMS])
          : undefined;
      const products = await storage.listProducts({
        category: categoryParam,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        brand: typeof req.query.brand === 'string' ? req.query.brand : undefined,
        inStock: req.query.inStock === 'true',
        discounted: req.query.discounted === 'true',
        express: req.query.express === 'true',
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
        sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
        categories,
      });
      res.json({ products, total: products.length });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/warranties', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const warranties = await storage.listWarranties(false);
      res.json({ warranties });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/attributes', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const attributes = await storage.listAttributes(category);
      res.json({ attributes });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/products/:slug', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const slug = String(req.params.slug || '').trim();
      const product = await storage.findProductByIdOrSlug(slug);
      if (!product) {
        res.status(404).json({ error: 'محصول مورد نظر یافت نشد.' });
        return;
      }
      const [reviews, rawVariants, attributeValues] = await Promise.all([
        storage.listProductReviews(product.id),
        storage.listProductVariants(product.id, false).catch(() => []),
        storage.listProductAttributes(product.id).catch(() => []),
      ]);
      const enrichedProduct = {
        ...product,
        variants: rawVariants.map(stripPrivateVariantFields),
        attributeValues,
      };
      res.json({ product: enrichedProduct, reviews });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/coupons/validate', async (req, res, next) => {
    try {
      const code = String(req.body?.code || '');
      const subtotal = Number(req.body?.subtotal || 0);
      const coupons = await storage.listActiveCoupons();
      const evaluation = evaluateCouponServer(code, subtotal, coupons);
      res.json(evaluation);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/products/:id/reviews', async (req, res, next) => {
    try {
      const id = String(req.params.id || '').trim();
      const product = await storage.findProductByIdOrSlug(id);
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const reviews = await storage.listProductReviews(product.id);
      res.json({ reviews });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/products/:id/reviews', async (req, res, next) => {
    try {
      const id = String(req.params.id || '').trim();
      const product = await storage.findProductByIdOrSlug(id);
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const auth = await getAuthFromRequest(req);
      const author = String(req.body?.author || auth?.user.fullName || '').trim();
      const comment = String(req.body?.comment || '').trim();
      const rating = Math.round(Number(req.body?.rating ?? 5));
      const useUsername = req.body?.useUsername !== false;
      const authorUsername =
        auth?.user.username && useUsername ? auth.user.username : undefined;

      if (author.length < 2 || comment.length < 8) {
        res.status(400).json({ error: 'لطفاً نام و متن دیدگاه (حداقل ۸ کاراکتر) را وارد کنید.' });
        return;
      }
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'امتیاز باید بین ۱ تا ۵ باشد.' });
        return;
      }

      const review = await storage.createProductReview({
        id: crypto.randomUUID(),
        productId: product.id,
        author,
        ...(authorUsername ? { authorUsername } : {}),
        dateLabel: 'هم‌اکنون',
        rating,
        comment,
        verified: Boolean(auth),
        isApproved: true,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/support-tickets', async (req, res, next) => {
    try {
      const fullName = String(req.body?.fullName || '').trim();
      const phone = normalizePhone(req.body?.phone);
      const department = String(req.body?.department || 'فروش و مشاوره تخصصی').trim();
      const orderCode = String(req.body?.orderCode || '').trim().toUpperCase();
      const message = String(req.body?.message || '').trim();

      if (fullName.length < 3 || !/^09\d{9}$/.test(phone) || message.length < 10) {
        res.status(400).json({ error: 'لطفاً نام، شماره موبایل معتبر و شرح پیام (حداقل ۱۰ کاراکتر) را وارد کنید.' });
        return;
      }

      const ticket = await storage.createSupportTicket({
        ticketCode: `TKT-${crypto.randomInt(1000, 99999)}`,
        fullName,
        phone,
        department,
        orderCode,
        message,
        status: 'open',
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ ticket, syncedToDatabase: true });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/newsletter', async (req, res, next) => {
    try {
      const contact = toEnglishDigits(String(req.body?.contact || '')).trim();
      if (contact.length < 5) {
        res.status(400).json({ error: 'لطفاً شماره موبایل یا ایمیل معتبر وارد کنید.' });
        return;
      }
      const result = await storage.subscribeNewsletter(contact);
      res.status(201).json({ ok: true, alreadySubscribed: result.alreadySubscribed });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================================
  // Orders (Server-Side Price/Stock Computation & Ownership/Verification Security)
  // ============================================================================
  app.get('/api/orders/mine', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const orders = await authService.listUserOrders(req.authUser!.id);
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders', async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const body = req.body || {};

      const customerName = String(body.customerName || '').trim();
      const customerPhone = normalizePhone(body.customerPhone);
      const city = String(body.city || '').trim();
      const shippingAddress = String(body.shippingAddress || '').trim();
      const postalCode = toEnglishDigits(String(body.postalCode || '')).replace(/[\s-]/g, '').trim();
      const items = Array.isArray(body.items) ? body.items : [];

      if (
        customerName.length < 3 ||
        !/^09\d{9}$/.test(customerPhone) ||
        city.length < 2 ||
        shippingAddress.length < 10 ||
        !/^\d{10}$/.test(postalCode) ||
        items.length === 0
      ) {
        res.status(400).json({ error: 'اطلاعات سفارش ناقص یا نامعتبر است.' });
        return;
      }

      const [catalogProducts, activeCoupons, storeSettings] = await Promise.all([
        storage.listProducts(),
        storage.listActiveCoupons(),
        storage.getStoreSettings(),
      ]);

      // Enrich referenced products with live published variants when variantId/sku is supplied
      const referencedIds = new Set<string>(
        items
          .map((item: { productId?: unknown; slug?: unknown }) => [
            String(item?.productId || '').trim(),
            String(item?.slug || '').trim(),
          ])
          .flat()
          .filter(Boolean)
      );
      const productsWithVariants = await Promise.all(
        catalogProducts.map(async (prod) => {
          if (!referencedIds.has(prod.id) && !referencedIds.has(prod.slug)) {
            return prod;
          }
          const variants = await storage.listProductVariants(prod.id, false).catch(() => []);
          return variants.length > 0 ? { ...prod, variants } : prod;
        })
      );

      const totals = calculateOrderTotalsServer({
        items,
        products: productsWithVariants,
        couponCode: body.couponCode ? String(body.couponCode) : null,
        couponRules: activeCoupons,
        freeShippingThreshold: storeSettings.freeShippingThreshold,
      });

      if (!totals.ok) {
        res.status(totals.statusCode).json({ error: totals.error });
        return;
      }

      let orderCode = String(body.orderCode || '')
        .trim()
        .toUpperCase()
        .replace(/^#/, '');
      if (!/^AMIR-[A-Z0-9]{4,12}$/.test(orderCode)) {
        orderCode = `AMIR-${crypto.randomInt(10000, 99999)}`;
      }
      const existingOrder = await authService.findOrderByCode(orderCode);
      if (existingOrder) {
        orderCode = `AMIR-${crypto.randomInt(100000, 999999)}`;
      }

      const orderPayload: StoredOrderRecord = {
        orderCode,
        userId: auth?.user.id ?? null,
        shaparakRef: String(crypto.randomInt(10000000, 99999999)),
        customerName,
        customerPhone,
        city,
        shippingAddress,
        postalCode,
        deliverySlot: body.deliverySlot === 'standard' ? 'standard' : 'express',
        couponCode: totals.couponCode,
        subtotal: totals.subtotal,
        productDiscount: totals.productDiscount,
        couponDiscount: totals.couponDiscount,
        shippingCost: totals.shippingCost,
        totalAmount: totals.totalAmount,
        status: 'preparing',
        deliveryPin: String(crypto.randomInt(1000, 9999)),
        imeiSample: `35918239${crypto.randomInt(1000000, 9999999)}`,
        items: totals.items,
        createdAt: new Date().toISOString(),
      };

      const saved = await authService.createOrder(auth?.user.id ?? null, orderPayload);

      for (const dec of totals.stockDecrements) {
        if (dec.variantId) {
          const variantStocks = await storage
            .listWarehouseStock({ variantId: dec.variantId })
            .catch(() => []);
          const bestStock = variantStocks
            .slice()
            .sort((a, b) => b.availableQty - a.availableQty)[0];
          if (bestStock && bestStock.availableQty >= dec.qty) {
            await storage.recordStockMovement({
              warehouseId: bestStock.warehouseId,
              variantId: dec.variantId,
              movementType: 'order_sale',
              quantityChange: -dec.qty,
              referenceType: 'order',
              referenceId: saved.orderCode,
              idempotencyKey: `order-sale:${saved.orderCode}:${dec.variantId}`,
              noteFa: `کسر موجودی بابت سفارش ${saved.orderCode}`,
              createdBy: auth?.user.id ?? null,
            });
            continue;
          }
        }
        await storage.decrementProductStock(dec.productId, dec.qty);
      }

      const trackingToken = issueOrderTrackingToken(saved.orderCode);

      if (auth?.user) {
        const totalFormatted = new Intl.NumberFormat('fa-IR').format(saved.totalAmount);
        const emailContent = buildOrderReceiptEmailContent({
          fullName: auth.user.fullName,
          orderCode: saved.orderCode,
          totalFormatted,
          itemsCount: saved.items.length,
        });

        void dispatchEmail({
          to: auth.user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          idempotencyKey: `order-receipt-${saved.orderCode}`,
          tags: [{ name: 'category', value: 'order_receipt' }],
        });
      }

      res.status(201).json({
        order: saved,
        syncedToDatabase: true,
        trackingToken,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/:code/verify', async (req, res, next) => {
    try {
      const code = String(req.params.code || '').trim();
      const phone = normalizePhone(req.body?.phone);
      if (!code || !/^09\d{9}$/.test(phone)) {
        res.status(400).json({ error: 'کد سفارش و شماره موبایل معتبر الزامی است.' });
        return;
      }

      const order = await authService.findOrderByCode(code);
      if (!order) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const auth = await getAuthFromRequest(req);
      const isAdmin = Boolean(auth && normalizeRole(auth.user.role) === 'admin');
      const isOwner = Boolean(auth && order.userId && auth.user.id === order.userId);

      if (order.userId && !isOwner && !isAdmin) {
        res.status(403).json({
          error: 'این سفارش متعلق به یک حساب کاربری ثبت‌شده است. لطفاً ابتدا وارد حساب خود شوید.',
          requiresLogin: true,
        });
        return;
      }

      if (!isOwner && !isAdmin && normalizePhone(order.customerPhone) !== phone) {
        res.status(403).json({ error: 'شماره موبایل با شماره ثبت‌شده در این سفارش مطابقت ندارد.' });
        return;
      }

      res.json({
        order,
        trackingToken: issueOrderTrackingToken(order.orderCode),
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/orders/:code', async (req, res, next) => {
    try {
      const code = String(req.params.code || '').trim();
      if (!code) {
        res.status(400).json({ error: 'کد سفارش الزامی است.' });
        return;
      }
      const order = await authService.findOrderByCode(code);
      if (!order) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const auth = await getAuthFromRequest(req);
      const isAdmin = Boolean(auth && normalizeRole(auth.user.role) === 'admin');
      const isOwner = Boolean(auth && order.userId && auth.user.id === order.userId);
      const isGuestOrder = !order.userId;

      const headerToken = req.headers['x-order-tracking-token'];
      const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
      const queryPhone = typeof req.query.phone === 'string' ? normalizePhone(req.query.phone) : '';

      const guestTokenValid =
        isGuestOrder &&
        (verifyOrderTrackingToken(order.orderCode, headerToken) ||
          verifyOrderTrackingToken(order.orderCode, queryToken) ||
          (Boolean(queryPhone) && queryPhone === normalizePhone(order.customerPhone)));

      if (isAdmin || isOwner || guestTokenValid) {
        res.json({
          order,
          authorized: true,
          requiresVerification: false,
        });
        return;
      }

      res.json({
        order: null,
        authorized: false,
        requiresVerification: true,
        isGuestOrder,
        summary: toSummaryOrderDTO(order, isGuestOrder),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/notify', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const orderCode = String(req.body?.orderCode || '').trim();

      if (!orderCode) {
        res.status(400).json({ error: 'orderCode is required' });
        return;
      }

      const order = await authService.findOrderByCode(orderCode);
      if (!order) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const isAdmin = normalizeRole(currentUser.role) === 'admin';
      if (order.userId && order.userId !== currentUser.id && !isAdmin) {
        res.status(403).json({ error: 'شما مجوز ارسال اعلان برای این سفارش را ندارید.' });
        return;
      }

      const totalFormatted = new Intl.NumberFormat('fa-IR').format(order.totalAmount);
      const emailContent = buildOrderReceiptEmailContent({
        fullName: currentUser.fullName,
        orderCode: order.orderCode,
        totalFormatted,
        itemsCount: order.items.length,
      });

      const delivery = await dispatchEmail({
        to: currentUser.email,
        subject: emailContent.subject,
        html: emailContent.html,
        idempotencyKey: `order-receipt-${order.orderCode}`,
        tags: [{ name: 'category', value: 'order_receipt' }],
      });

      res.json(delivery);
    } catch (err) {
      next(err);
    }
  });

  // ============================================================================
  // Admin Panel Protected APIs (/api/admin/*) — RBAC: requireAuth + requireAdmin
  // ============================================================================
  app.use('/api/admin', requireAuth, requireAdmin, createAdminRouter(storage));

  const distDir = path.resolve(process.cwd(), 'dist');
  const indexPath = path.join(distDir, 'index.html');
  if (!isProd && !options.disableVite) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(indexPath)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(indexPath);
    });
  } else if (isAiStudioPreview && !options.disableVite) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.get('/', (_req, res) => {
      res.json({
        service: 'amir-mobile-api',
        ok: true,
        health: '/api/health',
      });
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'خطای داخلی سرور رخ داد.',
    });
  });

  return app;
}

const isEntrypoint =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  const port = Number(process.env.PORT || 3000);
  createServerApp()
    .then((app) => {
      app.listen(port, '0.0.0.0', () => {
        console.log(`Amir Mobile Store server running on http://0.0.0.0:${port}`);
      });
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
