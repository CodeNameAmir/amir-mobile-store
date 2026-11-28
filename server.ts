import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createAdminRouter } from './server/adminRoutes.ts';
import {
  AuthService,
  createDefaultAuthStorage,
  hashPassword,
  StockMovementError,
  StoreOperationError,
  toPublicUser,
  verifyPassword,
  type AuthStorageAdapter,
  type OtpPurpose,
  type StoredAddress,
  type StoredCartItemRecord,
  type StoredOrderItem,
  type StoredOrderRecord,
  type StoredUserRecord,
} from './server/authStore.ts';
import {
  getHelmetOptions,
  getSessionCookieOptions,
  isOriginAllowed,
  isValidPasswordPolicy,
  RATE_LIMIT_RULES,
  resolveCorsConfig,
  resolveInternalJobSecret,
  resolveSessionSecret,
  validateAvatarUrlServer,
  verifyInternalJobSecret,
} from './server/config.ts';
import {
  buildBackInStockEmailContent,
  buildOrderExpiredEmailContent,
  buildOrderReceiptEmailContent,
  buildOtpEmailContent,
  buildSecurityAlertEmailContent,
  buildWelcomeEmailContent,
} from './server/emailTemplates.ts';
import { getResendProviderStatus, sendEmailWithResend } from './server/resendService.ts';
import {
  buildCatalogFacetsServer,
  buildUsernameCandidateListServer,
  calculateOrderTotalsServer,
  CATEGORY_ITEMS,
  DEFAULT_DEV_BRANDS,
  evaluateCouponServer,
  maskEmailServer,
  normalizePhone,
  normalizeRole,
  normalizeUsernameServer,
  ORDER_RESERVATION_TTL_MS,
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
  const internalJobSecret = resolveInternalJobSecret(configEnv);
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
  app.use(helmet(getHelmetOptions(isProd && !isAiStudioPreview)));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));

  const rateLimitMessage = {
    error: 'تعداد درخواست‌های شما از حد مجاز فراتر رفته است. لطفاً دقایقی دیگر مجدداً تلاش کنید.',
  };

  const createStrictRateLimiter = () =>
    rateLimit({
      windowMs: RATE_LIMIT_RULES.STRICT_WINDOW_MS,
      limit: RATE_LIMIT_RULES.STRICT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: rateLimitMessage,
    });

  const createModerateRateLimiter = () =>
    rateLimit({
      windowMs: RATE_LIMIT_RULES.MODERATE_WINDOW_MS,
      limit: RATE_LIMIT_RULES.MODERATE_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: rateLimitMessage,
    });

  const loginPasswordLimiter = createStrictRateLimiter();
  const orderVerifyLimiter = createStrictRateLimiter();
  const otpLimiter = createModerateRateLimiter();
  const newsletterLimiter = createModerateRateLimiter();
  const orderCreateLimiter = createModerateRateLimiter();
  const reviewCreateLimiter = createModerateRateLimiter();
  const supportTicketLimiter = createModerateRateLimiter();
  const moderateWriteLimiter = createModerateRateLimiter();
  const internalJobLimiter = rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests' },
  });

  async function triggerBackInStockAlerts(info: {
    productId: string;
    variantId?: string | null;
    stockCount: number;
  }): Promise<void> {
    if (info.stockCount <= 0) return;
    const [product, pendingAlerts] = await Promise.all([
      storage.findProductByIdOrSlug(info.productId).catch(() => null),
      storage.findPendingStockAlerts(info.productId, info.variantId).catch(() => []),
    ]);
    if (!product || pendingAlerts.length === 0) return;

    await storage.markStockAlertsNotified(pendingAlerts.map((a) => a.id)).catch(() => undefined);

    const notifiedUsers = new Set<string>();
    const notifiedEmails = new Set<string>();
    const appOrigin =
      env.APP_URL || corsCfg.allowedOrigins[0] || 'https://codenameamir.ir';

    for (const alert of pendingAlerts) {
      if (alert.userId && !notifiedUsers.has(alert.userId)) {
        notifiedUsers.add(alert.userId);
        await storage
          .createUserNotification({
            userId: alert.userId,
            type: 'stock_alert',
            title: `موجود شدن «${product.nameFa}»`,
            message: `کالای «${product.nameFa}» با قیمت روز در انبار شارژ شد و اکنون قابل سفارش است.`,
            link: `/product/${product.slug}`,
          })
          .catch(() => undefined);
      }

      const cleanEmail = alert.email.trim().toLowerCase();
      if (cleanEmail && !notifiedEmails.has(cleanEmail)) {
        notifiedEmails.add(cleanEmail);
        const priceFormatted = new Intl.NumberFormat('fa-IR').format(product.price);
        const emailContent = buildBackInStockEmailContent({
          productName: product.nameFa,
          productSlug: product.slug,
          priceFormatted,
          siteUrl: appOrigin,
        });
        void dispatchEmail({
          to: cleanEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          idempotencyKey: `stock-alert-${alert.id}`,
          tags: [{ name: 'category', value: 'back_in_stock' }],
        });
      }
    }
  }

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
          'Content-Type, Authorization, X-Order-Tracking-Token, X-Requested-With, Idempotency-Key'
        );
      }
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // CSRF defense-in-depth for cookie-authenticated state-changing requests
    if (isApiRoute && !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
      const cookies = parseCookies(req.headers.cookie);
      const hasSessionCookie = Boolean(cookies[SESSION_COOKIE_NAME]);
      if (!origin) {
        const refererHeader = typeof req.headers.referer === 'string' ? req.headers.referer : '';
        if (refererHeader) {
          let refererOrigin = '';
          try {
            refererOrigin = new URL(refererHeader).origin;
          } catch {
            refererOrigin = '';
          }
          const refererHost = refererOrigin ? new URL(refererOrigin).host.toLowerCase() : '';
          const refererAllowed = Boolean(
            refererOrigin &&
              (((rawHost && refererHost === rawHost.toLowerCase()) ||
                (forwardedHost && refererHost === forwardedHost.toLowerCase()) ||
                (appUrlHost && refererHost === appUrlHost)) ||
                (isAiStudioRuntime &&
                  (/\.run\.app$/i.test(refererHost.split(':')[0]) ||
                    /(^|\.)aistudio\.google\.com$/i.test(refererHost.split(':')[0]) ||
                    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(refererHost))) ||
                isOriginAllowed(refererOrigin, corsCfg.allowedOrigins, isProd && !isAiStudioPreview, selfOrigin))
          );
          if (!refererAllowed) {
            res.status(403).json({ error: 'Referer not allowed by CSRF protection' });
            return;
          }
        } else if (
          hasSessionCookie &&
          isProd &&
          !isAiStudioPreview &&
          !req.is('application/json') &&
          String(req.headers['x-requested-with'] || '').toLowerCase() !== 'xmlhttprequest'
        ) {
          res.status(403).json({ error: 'Missing Origin or custom header for authenticated write request' });
          return;
        }
      }
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
      internalJobConfigured: Boolean(internalJobSecret),
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

  app.post('/api/auth/send-otp', otpLimiter, async (req, res, next) => {
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
        if (!isValidPasswordPolicy(password)) {
          res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.' });
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

  app.post('/api/auth/verify-otp', otpLimiter, async (req, res, next) => {
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
        if (!isValidPasswordPolicy(newPassword)) {
          res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.' });
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

  app.post('/api/auth/login-password', loginPasswordLimiter, async (req, res, next) => {
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

  app.post('/api/auth/verify-2fa', otpLimiter, async (req, res, next) => {
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

  app.post('/api/auth/resend-2fa', otpLimiter, async (req, res, next) => {
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
        const avatarCheck = validateAvatarUrlServer(req.body.avatarUrl);
        if (!avatarCheck.ok) {
          res.status(400).json({ error: avatarCheck.error });
          return;
        }
        nextAvatarUrl = avatarCheck.value;
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
        if (!isValidPasswordPolicy(newPassword)) {
          res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.' });
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
  // Authenticated User Cart Persistence & Merge APIs
  // ============================================================================
  function sanitizeIncomingCartItems(rawList: unknown[]): StoredCartItemRecord[] {
    const out: StoredCartItemRecord[] = [];
    for (const entry of rawList) {
      if (!entry || typeof entry !== 'object') continue;
      const item = entry as Record<string, unknown>;
      const productId = String(item.productId || item.slug || '').trim();
      if (!productId || productId.length > 120) continue;
      const colorName = String(item.colorName || item.color || 'مشکی').trim() || 'مشکی';
      const colorHex = String(item.colorHex || '#1e293b').trim() || '#1e293b';
      const storageLabel = String(item.storageLabel || item.storage || '۲۵۶ گیگابایت').trim() || '۲۵۶ گیگابایت';
      const warranty = String(item.warranty || '۱۸ ماهه امیر سرویس').trim() || '۱۸ ماهه امیر سرویس';
      const variantId = item.variantId ? String(item.variantId).trim() : null;
      const sku = item.sku ? String(item.sku).trim() : null;
      const key =
        String(item.key || item.itemKey || '').trim() ||
        `${productId}__${variantId || colorName}__${storageLabel}__${warranty}`;
      const qty = Math.min(20, Math.max(1, Math.floor(Number(item.qty ?? item.quantity ?? 1) || 1)));
      out.push({
        key,
        productId,
        variantId,
        sku,
        colorName,
        colorHex,
        storageLabel,
        warranty,
        qty,
      });
    }
    return out.slice(0, 50);
  }

  async function hydrateStoredCartItems(records: StoredCartItemRecord[]): Promise<StoredOrderItem[]> {
    if (records.length === 0) return [];
    const catalogProducts = await storage.listProducts().catch(() => []);
    const byIdOrSlug = new Map<string, (typeof catalogProducts)[number]>();
    for (const p of catalogProducts) {
      byIdOrSlug.set(p.id, p);
      byIdOrSlug.set(p.slug, p);
    }

    const hydrated: StoredOrderItem[] = [];
    const variantsCache = new Map<string, Awaited<ReturnType<typeof storage.listProductVariants>>>();

    for (const rec of records) {
      const product = byIdOrSlug.get(rec.productId);
      if (!product) continue;

      let variants = variantsCache.get(product.id);
      if (!variants) {
        variants = await storage.listProductVariants(product.id, false).catch(() => []);
        variantsCache.set(product.id, variants);
      }

      const matchedVariant =
        (rec.variantId
          ? variants.find((v) => v.id === rec.variantId)
          : undefined) ||
        (rec.sku
          ? variants.find((v) => v.sku.toLowerCase() === rec.sku!.toLowerCase())
          : undefined);

      const storageMatch =
        product.storageOptions.find((s) => s.label === rec.storageLabel) ||
        product.storageOptions[0];
      const storageDelta = matchedVariant ? 0 : storageMatch?.priceDelta || 0;
      const baseUnitPrice = (matchedVariant ? matchedVariant.priceToman : product.price) + storageDelta;
      const baseOriginalPrice = matchedVariant
        ? matchedVariant.originalPriceToman || matchedVariant.priceToman
        : (product.originalPrice || product.price) + storageDelta;

      const unitPrice = baseUnitPrice;
      const originalUnitPrice = Math.max(unitPrice, baseOriginalPrice);
      const cleanWarranty =
        (rec.warranty || '')
          .replace(/\s*\+\s*بیمه حوادث و شکستگی Amir Care\+/g, '')
          .replace(/\s*\+\s*Amir Care\+/g, '')
          .trim() ||
        matchedVariant?.warrantyName ||
        product.warranty;
      const stockCount =
        typeof matchedVariant?.availableStock === 'number'
          ? matchedVariant.availableStock
          : product.stockCount;

      hydrated.push({
        key: rec.key,
        productId: product.id,
        ...(matchedVariant
          ? {
              variantId: matchedVariant.id,
              sku: matchedVariant.sku,
              partNumber: matchedVariant.partNumber || undefined,
              simType: matchedVariant.simType || undefined,
            }
          : rec.variantId || rec.sku
          ? {
              ...(rec.variantId ? { variantId: rec.variantId } : {}),
              ...(rec.sku ? { sku: rec.sku } : {}),
            }
          : {}),
        slug: product.slug,
        nameFa: product.nameFa,
        brand: product.brand,
        image: product.image,
        colorName: matchedVariant?.colorNameFa || rec.colorName || product.colorLabel,
        colorHex: matchedVariant?.colorHex || rec.colorHex || '#1e293b',
        storageLabel: matchedVariant?.storage || rec.storageLabel || product.storageOptions[0]?.label || '',
        warranty: cleanWarranty,
        unitPrice,
        originalUnitPrice,
        qty: rec.qty,
        stockCount,
      });
    }
    return hydrated;
  }

  app.get('/api/auth/cart', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const stored = await authService.getUserCart(currentUser.id);
      const items = await hydrateStoredCartItems(stored);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/auth/cart', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const rawItems = Array.isArray(req.body?.items) ? (req.body.items as unknown[]) : null;
      if (!rawItems) {
        res.status(400).json({ error: 'لیست اقلام سبد خرید باید به‌صورت آرایه ارسال شود.' });
        return;
      }
      const sanitized = sanitizeIncomingCartItems(rawItems);
      const saved = await authService.replaceUserCart(currentUser.id, sanitized);
      const items = await hydrateStoredCartItems(saved);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/cart/merge', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const currentUser = req.authUser!;
      const rawItems = Array.isArray(req.body?.items) ? (req.body.items as unknown[]) : null;
      if (!rawItems) {
        res.status(400).json({ error: 'لیست اقلام سبد خرید باید به‌صورت آرایه ارسال شود.' });
        return;
      }
      const sanitized = sanitizeIncomingCartItems(rawItems);
      const merged = await authService.mergeUserCart(currentUser.id, sanitized);
      const items = await hydrateStoredCartItems(merged);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================================
  // Storefront Public Catalog, Reviews, Coupons, Config, Support & Newsletter APIs
  // ============================================================================
  app.get('/api/categories', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-cache');
      const categories = await storage.listCategories(false).catch(() => [...CATEGORY_ITEMS]);
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/brands', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-cache');
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
      res.setHeader('Cache-Control', 'no-cache');
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
      res.setHeader('Cache-Control', 'no-cache');
      const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
      const categoryParam = typeof req.query.category === 'string' ? req.query.category : undefined;
      const categories =
        categoryParam && categoryParam !== 'all' && categoryParam !== 'offers'
          ? await storage.listCategories(true).catch(() => [...CATEGORY_ITEMS])
          : undefined;

      const attributeFilters: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.query)) {
        if (k.startsWith('attr_') && typeof v === 'string' && v.trim()) {
          attributeFilters[k.slice(5)] = v.trim();
        }
      }

      const matchingProducts = await storage.listProducts({
        category: categoryParam,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        brand: typeof req.query.brand === 'string' ? req.query.brand : undefined,
        inStock: req.query.inStock === 'true',
        discounted: req.query.discounted === 'true',
        express: req.query.express === 'true',
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
        storage: typeof req.query.storage === 'string' && req.query.storage.trim() ? req.query.storage.trim() : undefined,
        ram: typeof req.query.ram === 'string' && req.query.ram.trim() ? req.query.ram.trim() : undefined,
        colorId: typeof req.query.colorId === 'string' && req.query.colorId.trim() ? req.query.colorId.trim() : undefined,
        attributes: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
        sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
        categories,
      });

      const includeEditorial = req.query.includeEditorial === 'true';
      const serializeProductForList = <T extends { editorialReview?: string }>(item: T) => {
        if (includeEditorial || item.editorialReview === undefined) return item;
        const { editorialReview: _omitted, ...rest } = item;
        return rest;
      };

      const facets = buildCatalogFacetsServer(matchingProducts);
      const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
      if (!hasPagination) {
        res.json({
          products: matchingProducts.map(serializeProductForList),
          total: matchingProducts.length,
          facets,
        });
        return;
      }

      const limit = Math.min(60, Math.max(1, Math.floor(Number(req.query.limit || 12))));
      const total = matchingProducts.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const requestedPage = Math.max(1, Math.floor(Number(req.query.page || 1)));
      const page = Math.min(requestedPage, totalPages);
      const offset = (page - 1) * limit;
      const pagedProducts = matchingProducts.slice(offset, offset + limit).map(serializeProductForList);

      res.json({
        products: pagedProducts,
        total,
        page,
        limit,
        totalPages,
        facets,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/warranties', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-cache');
      const warranties = await storage.listWarranties(false);
      res.json({ warranties });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/attributes', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-cache');
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const attributes = await storage.listAttributes(category);
      res.json({ attributes });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/products/:slug', async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'no-cache');
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
      const auth = await getAuthFromRequest(req);
      const code = String(req.body?.code || '').trim();
      const subtotal = Number(req.body?.subtotal || 0);
      const customerPhone = req.body?.phone ? normalizePhone(req.body.phone) : auth?.user.phone;
      const coupons = await storage.listActiveCoupons();
      const cleanUpper = code.toUpperCase();
      const redemptions = cleanUpper
        ? await storage.getCouponRedemptionCount(cleanUpper, {
            userId: auth?.user.id ?? null,
            customerPhone,
          })
        : 0;
      const evaluation = evaluateCouponServer(code, subtotal, coupons, {
        now: new Date(),
        userRedemptionCountByCode: cleanUpper ? { [cleanUpper]: redemptions } : {},
      });
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

  app.post('/api/products/:id/reviews', reviewCreateLimiter, async (req, res, next) => {
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

      let hasDeliveredOrderForProduct = false;
      if (auth) {
        const userOrders = await authService.listUserOrders(auth.user.id);
        hasDeliveredOrderForProduct = userOrders.some(
          (o) =>
            o.status === 'delivered' &&
            o.items.some((item) => item.productId === product.id || item.slug === product.slug)
        );
      }

      const review = await storage.createProductReview({
        id: crypto.randomUUID(),
        productId: product.id,
        userId: auth?.user.id ?? null,
        author,
        ...(authorUsername ? { authorUsername } : {}),
        dateLabel: 'هم‌اکنون',
        rating,
        comment,
        verified: hasDeliveredOrderForProduct,
        isApproved: false,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ review, pendingApproval: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/products/:id/questions', async (req, res, next) => {
    try {
      const id = String(req.params.id || '').trim();
      const product = await storage.findProductByIdOrSlug(id);
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const questions = await storage.listProductQuestions(product.id);
      res.json({ questions });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/products/:id/questions', moderateWriteLimiter, async (req, res, next) => {
    try {
      const id = String(req.params.id || '').trim();
      const product = await storage.findProductByIdOrSlug(id);
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const auth = await getAuthFromRequest(req);
      const authorName = String(req.body?.authorName || auth?.user.fullName || 'کاربر فروشگاه').trim();
      const question = String(req.body?.question || '').trim();
      if (authorName.length < 2 || question.length < 8) {
        res.status(400).json({ error: 'لطفاً نام و متن پرسش (حداقل ۸ کاراکتر) را وارد کنید.' });
        return;
      }
      const created = await storage.createProductQuestion({
        productId: product.id,
        userId: auth?.user.id ?? null,
        authorName,
        question,
        answer: null,
        answeredAt: null,
        isApproved: false,
      });
      res.status(201).json({ question: created, pendingApproval: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/blog', async (req, res, next) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : '';
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));

      const result = await storage.listBlogPosts({
        category: category && category !== 'all' ? category : undefined,
        q: q || undefined,
        tag: tag || undefined,
        page,
        limit,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/blog/:slug', async (req, res, next) => {
    try {
      const slug = decodeURIComponent(String(req.params.slug || '').trim());
      if (!slug) {
        res.status(404).json({ error: 'مقاله مورد نظر یافت نشد.' });
        return;
      }
      const post = await storage.findBlogPostBySlug(slug);
      if (!post) {
        res.status(404).json({ error: 'مقاله مورد نظر یافت نشد.' });
        return;
      }

      const pool = await storage.listBlogPosts({ page: 1, limit: 20 });
      const tagSet = new Set(post.tags.map((t) => t.toLowerCase()));
      const relatedPosts = pool.posts
        .filter((item) => item.slug !== post.slug)
        .map((item) => {
          const sameCategory = item.category === post.category ? 2 : 0;
          const sharedTags = item.tags.filter((t) => tagSet.has(t.toLowerCase())).length;
          return { item, score: sameCategory + sharedTags };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((entry) => entry.item);

      res.json({ post, relatedPosts });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/stock-alerts', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const alerts = await storage.listUserStockAlerts(req.authUser!.id);
      res.json({
        alerts,
        productIds: Array.from(new Set(alerts.map((a) => a.productId))),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/stock-alerts', moderateWriteLimiter, async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const productId = String(req.body?.productId || '').trim();
      const variantId = req.body?.variantId ? String(req.body.variantId).trim() : null;
      const rawEmail = auth?.user.email || req.body?.email;
      const email = normalizeEmail(rawEmail);

      if (!productId) {
        res.status(400).json({ error: 'شناسه محصول الزامی است.' });
        return;
      }
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'لطفاً یک نشانی ایمیل معتبر وارد کنید یا وارد حساب کاربری خود شوید.' });
        return;
      }
      const product = await storage.findProductByIdOrSlug(productId);
      if (!product) {
        res.status(404).json({ error: 'محصول مورد نظر یافت نشد.' });
        return;
      }

      const result = await storage.subscribeStockAlert({
        userId: auth?.user.id ?? null,
        email,
        productId: product.id,
        variantId,
      });
      res.status(result.alreadySubscribed ? 200 : 201).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/stock-alerts/:productId', async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const rawProductId = String(req.params.productId || '').trim();
      const queryEmail = normalizeEmail(req.query.email);
      if (!auth && !isValidEmail(queryEmail)) {
        res.status(401).json({ error: 'برای لغو اطلاع‌رسانی وارد حساب خود شوید یا ایمیل ثبت‌شده را ارسال کنید.' });
        return;
      }
      const product = await storage.findProductByIdOrSlug(rawProductId).catch(() => null);
      const targetId = product?.id || rawProductId;
      const removed = await storage.removeStockAlertByProduct({
        userId: auth?.user.id ?? null,
        email: auth ? auth.user.email : queryEmail,
        productId: targetId,
      });
      res.json({ ok: true, removed });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const notifications = await storage.listUserNotifications(req.authUser!.id);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      res.json({ notifications, unreadCount });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const updatedCount = await storage.markAllNotificationsRead(req.authUser!.id);
      res.json({ ok: true, updatedCount });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const notificationId = String(req.params.id || '').trim();
      const notification = await storage.markNotificationRead(req.authUser!.id, notificationId);
      if (!notification) {
        res.status(404).json({ error: 'اعلان مورد نظر یافت نشد.' });
        return;
      }
      res.json({ notification });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/notifications/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const notificationId = String(req.params.id || '').trim();
      const deleted = await storage.deleteUserNotification(req.authUser!.id, notificationId);
      if (!deleted) {
        res.status(404).json({ error: 'اعلان مورد نظر یافت نشد.' });
        return;
      }
      res.json({ ok: true, id: notificationId });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/support-tickets/mine', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = req.authUser!;
      const tickets = await storage.listUserSupportTickets(user.id, user.phone);
      res.json({ tickets });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/support-tickets', supportTicketLimiter, async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const fullName = String(req.body?.fullName || auth?.user.fullName || '').trim();
      const phone = normalizePhone(req.body?.phone || auth?.user.phone);
      const department = String(req.body?.department || 'فروش و مشاوره تخصصی').trim();
      const orderCode = String(req.body?.orderCode || '').trim().toUpperCase();
      const message = String(req.body?.message || '').trim();

      if (fullName.length < 3 || !/^09\d{9}$/.test(phone) || message.length < 10) {
        res.status(400).json({ error: 'لطفاً نام، شماره موبایل معتبر و شرح پیام (حداقل ۱۰ کاراکتر) را وارد کنید.' });
        return;
      }

      const ticket = await storage.createSupportTicket({
        userId: auth?.user.id ?? null,
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

  app.post('/api/newsletter', newsletterLimiter, async (req, res, next) => {
    try {
      const rawContact = toEnglishDigits(String(req.body?.contact || '')).trim();
      const emailCandidate = rawContact.toLowerCase();
      const phoneCandidate = normalizePhone(rawContact);
      const isEmail = isValidEmail(emailCandidate);
      const isPhone = /^09\d{9}$/.test(phoneCandidate);

      if (!isEmail && !isPhone) {
        res.status(400).json({ error: 'لطفاً یک ایمیل معتبر یا شماره موبایل ۱۱ رقمی با ۰۹ وارد کنید.' });
        return;
      }
      const normalizedContact = isEmail ? emailCandidate : phoneCandidate;
      const result = await storage.subscribeNewsletter(normalizedContact);
      res.status(201).json({
        ok: true,
        alreadySubscribed: result.alreadySubscribed,
        contactType: isEmail ? 'email' : 'phone',
        ...(result.unsubscribeToken ? { unsubscribeToken: result.unsubscribeToken } : {}),
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/newsletter/unsubscribe', newsletterLimiter, async (req, res, next) => {
    try {
      const tokenOrContact = toEnglishDigits(
        String(req.body?.token ?? req.body?.contact ?? '')
      ).trim();
      if (!tokenOrContact) {
        res.status(400).json({ error: 'توکن لغو اشتراک یا ایمیل/موبایل الزامی است.' });
        return;
      }
      const unsubscribed = await storage.unsubscribeNewsletter(tokenOrContact);
      res.json({ ok: true, unsubscribed });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/newsletter/unsubscribe', async (req, res, next) => {
    try {
      const token = String(req.query.token || '').trim();
      if (!token) {
        res.status(400).json({ error: 'توکن لغو اشتراک معتبر نیست.' });
        return;
      }
      const unsubscribed = await storage.unsubscribeNewsletter(token);
      res.json({ ok: true, unsubscribed });
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

  app.post('/api/orders', orderCreateLimiter, async (req, res, next) => {
    try {
      const auth = await getAuthFromRequest(req);
      const body = req.body || {};

      const customerName = String(body.customerName || '').trim();
      const customerPhone = normalizePhone(body.customerPhone);
      const rawEmail = String(body.customerEmail ?? body.email ?? '').trim();
      const guestEmail = rawEmail ? normalizeEmail(rawEmail) : '';
      const city = String(body.city || '').trim();
      const shippingAddress = String(body.shippingAddress || '').trim();
      const postalCode = toEnglishDigits(String(body.postalCode || '')).replace(/[\s-]/g, '').trim();
      const items = Array.isArray(body.items) ? body.items : [];

      if (guestEmail && !isValidEmail(guestEmail)) {
        res.status(400).json({ error: 'فرمت ایمیل وارد شده معتبر نیست.' });
        return;
      }

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

      const rawCouponCode = body.couponCode ? String(body.couponCode).trim() : '';
      const headerIdemp =
        typeof req.headers['idempotency-key'] === 'string' ? req.headers['idempotency-key'] : '';
      const idempotencyKeyRaw = String(headerIdemp || body.idempotencyKey || '').trim();
      const idempotencyKey = idempotencyKeyRaw ? idempotencyKeyRaw.slice(0, 128) : undefined;

      const [catalogProducts, activeCoupons, storeSettings, couponRedemptions] = await Promise.all([
        storage.listProducts(),
        storage.listActiveCoupons(),
        storage.getStoreSettings(),
        rawCouponCode
          ? storage.getCouponRedemptionCount(rawCouponCode.toUpperCase(), {
              userId: auth?.user.id ?? null,
              customerPhone,
            })
          : Promise.resolve(0),
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
        couponCode: rawCouponCode || null,
        couponRules: activeCoupons,
        couponContext: rawCouponCode
          ? {
              now: new Date(),
              userRedemptionCountByCode: {
                [rawCouponCode.toUpperCase()]: couponRedemptions,
              },
            }
          : undefined,
        strictCouponValidation: Boolean(rawCouponCode),
        freeShippingThreshold: storeSettings.freeShippingThreshold,
        city,
        deliverySlot: body.deliverySlot === 'standard' ? 'standard' : 'express',
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

      const recipientEmail = auth?.user.email || guestEmail || undefined;

      const orderPayload: StoredOrderRecord = {
        orderCode,
        userId: auth?.user.id ?? null,
        shaparakRef: '',
        customerName,
        customerPhone,
        ...(recipientEmail ? { customerEmail: recipientEmail } : {}),
        city,
        shippingAddress,
        postalCode,
        deliverySlot: totals.deliverySlot,
        couponCode: totals.couponCode,
        subtotal: totals.subtotal,
        productDiscount: totals.productDiscount,
        couponDiscount: totals.couponDiscount,
        shippingCost: totals.shippingCost,
        totalAmount: totals.totalAmount,
        status: 'pending_payment',
        paymentStatus: 'unpaid',
        ...(idempotencyKey ? { idempotencyKey } : {}),
        stockRestored: false,
        expiresAt: new Date(Date.now() + ORDER_RESERVATION_TTL_MS).toISOString(),
        expiredAt: null,
        deliveryPin: String(crypto.randomInt(1000, 9999)),
        imeiSample: '',
        items: totals.items,
        createdAt: new Date().toISOString(),
      };

      const atomicResult = await storage.placeOrderAtomic({
        userId: auth?.user.id ?? null,
        idempotencyKey: idempotencyKey ?? null,
        order: orderPayload,
        stockDecrements: totals.stockDecrements,
      });
      const saved = atomicResult.order;
      const trackingToken = issueOrderTrackingToken(saved.orderCode);

      if (recipientEmail && !atomicResult.deduplicated) {
        const totalFormatted = new Intl.NumberFormat('fa-IR').format(saved.totalAmount);
        const emailContent = buildOrderReceiptEmailContent({
          fullName: auth?.user.fullName || customerName,
          orderCode: saved.orderCode,
          totalFormatted,
          itemsCount: saved.items.length,
        });

        void dispatchEmail({
          to: recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          idempotencyKey: `order-receipt-${saved.orderCode}`,
          tags: [{ name: 'category', value: 'order_receipt' }],
        });
      }

      res.status(atomicResult.deduplicated ? 200 : 201).json({
        order: saved,
        syncedToDatabase: true,
        deduplicated: atomicResult.deduplicated,
        trackingToken,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/:code/verify', orderVerifyLimiter, async (req, res, next) => {
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

  app.post('/api/orders/:code/cancel', async (req, res, next) => {
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
      const bodyToken = typeof req.body?.trackingToken === 'string' ? req.body.trackingToken : undefined;
      const bodyPhone = typeof req.body?.phone === 'string' ? normalizePhone(req.body.phone) : '';

      const guestTokenValid =
        isGuestOrder &&
        (verifyOrderTrackingToken(order.orderCode, headerToken) ||
          verifyOrderTrackingToken(order.orderCode, bodyToken) ||
          (Boolean(bodyPhone) && bodyPhone === normalizePhone(order.customerPhone)));

      if (!isAdmin && !isOwner && !guestTokenValid) {
        res.status(403).json({ error: 'شما مجوز لغو این سفارش را ندارید.' });
        return;
      }

      if (!['pending_payment', 'paid', 'preparing'].includes(order.status)) {
        res.status(409).json({
          error:
            order.status === 'cancelled'
              ? 'این سفارش قبلاً لغو شده است.'
              : order.status === 'expired'
              ? 'مهلت ۳۰ دقیقه‌ای این سفارش به پایان رسیده و سفارش منقضی شده است.'
              : 'سفارش پس از ارسال یا تحویل قابل لغو نیست.',
        });
        return;
      }

      const cancelReason =
        typeof req.body?.reason === 'string' && req.body.reason.trim()
          ? req.body.reason.trim()
          : undefined;
      const updated = await storage.cancelOrderAtomic(
        order.orderCode,
        cancelReason ? `لغو توسط خریدار: ${cancelReason}` : order.adminNote
      );
      if (!updated) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      res.json({ order: updated });
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
  app.use(
    '/api/admin',
    requireAuth,
    requireAdmin,
    createAdminRouter(storage, { onStockRestocked: triggerBackInStockAlerts })
  );

  // ============================================================================
  // Protected Internal Scheduled Job Endpoints (Server-to-Server / Render Cron)
  // ============================================================================
  app.post('/internal/jobs/expire-pending-orders', internalJobLimiter, async (req, res, next) => {
    try {
      if (!internalJobSecret) {
        res.status(503).json({ error: 'Internal job secret is not configured.' });
        return;
      }

      const authHeader =
        typeof req.headers.authorization === 'string' ? req.headers.authorization.trim() : '';
      const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader);
      const customHeaderRaw = req.headers['x-internal-job-secret'];
      const customHeader = Array.isArray(customHeaderRaw)
        ? String(customHeaderRaw[0] || '').trim()
        : typeof customHeaderRaw === 'string'
        ? customHeaderRaw.trim()
        : '';
      const providedSecret = (bearerMatch?.[1] || customHeader || '').trim();

      if (!providedSecret || !verifyInternalJobSecret(providedSecret, internalJobSecret)) {
        console.warn(
          JSON.stringify({
            event: 'job.expire_pending_orders.unauthorized',
            timestamp: new Date().toISOString(),
          })
        );
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const rawLimit = Number(req.body?.limit ?? req.query?.limit ?? 100);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(500, Math.max(1, Math.floor(rawLimit)))
        : 100;

      const startedAt = Date.now();
      const result = await storage.expirePendingOrdersAtomic({ limit });

      let emailAttempted = 0;
      let emailSent = 0;
      let emailFailed = 0;

      for (const item of result.expiredOrders) {
        if (item.userId) {
          await storage
            .createUserNotification({
              userId: item.userId,
              type: 'order_update',
              title: `انقضای مهلت سفارش ${item.orderCode}`,
              message: `مهلت ۳۰ دقیقه‌ای تکمیل پرداخت سفارش ${item.orderCode} به پایان رسید و موجودی کالاهای سفارش به انبار بازگردانده شد.`,
              link: `/tracking/${item.orderCode}`,
            })
            .catch(() => undefined);
        }

        let recipientEmail = item.customerEmail?.trim() || '';
        if (!recipientEmail && item.userId) {
          const owner = await storage.findUserById(item.userId).catch(() => null);
          recipientEmail = owner?.email?.trim() || '';
        }

        if (recipientEmail) {
          emailAttempted += 1;
          try {
            const totalFormatted = new Intl.NumberFormat('fa-IR').format(item.totalAmount);
            const emailContent = buildOrderExpiredEmailContent({
              fullName: item.customerName,
              orderCode: item.orderCode,
              totalFormatted,
            });
            const delivery = await dispatchEmail({
              to: recipientEmail,
              subject: emailContent.subject,
              html: emailContent.html,
              idempotencyKey: `order-expired-${item.orderCode}`,
              tags: [{ name: 'category', value: 'order_expired' }],
            });
            if (delivery.sent) {
              emailSent += 1;
            } else {
              emailFailed += 1;
            }
          } catch {
            emailFailed += 1;
          }
        }
      }

      const durationMs = Date.now() - startedAt;
      console.log(
        JSON.stringify({
          event: 'job.expire_pending_orders.completed',
          processed: result.processed,
          expired: result.expired,
          emailAttempted,
          emailSent,
          emailFailed,
          durationMs,
        })
      );

      res.json({
        ok: true,
        processed: result.processed,
        expired: result.expired,
        expiredOrderCodes: result.expiredOrderCodes,
        emailSummary: {
          attempted: emailAttempted,
          sent: emailSent,
          failed: emailFailed,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const publicDir = path.resolve(process.cwd(), 'public');
  const indexPath = path.join(distDir, 'index.html');

  const serveCrawlerStaticFile = (
    routePath: string,
    fileName: string,
    contentType: string
  ) => {
    app.get(routePath, (_req, res, next) => {
      const distCandidate = path.join(distDir, fileName);
      const publicCandidate = path.join(publicDir, fileName);
      const targetFile = fs.existsSync(distCandidate)
        ? distCandidate
        : fs.existsSync(publicCandidate)
        ? publicCandidate
        : null;
      if (!targetFile) {
        next();
        return;
      }
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(targetFile);
    });
  };

  app.get('/sitemap.xml', async (_req, res, next) => {
    try {
      const siteOrigin = (
        env.VITE_SITE_URL ||
        corsCfg.allowedOrigins.find((o) => !o.includes('admin')) ||
        'https://amir-mobile-store.codenameamir.ir'
      ).replace(/\/+$/, '');
      const [products, blogRes] = await Promise.all([
        storage.listProducts({}).catch(() => []),
        storage.listBlogPosts({ page: 1, limit: 100 }).catch(() => ({ posts: [] })),
      ]);
      const staticRoutes = [
        '/',
        '/catalog',
        '/compare',
        '/installments',
        '/blog',
        '/faq',
        '/about',
        '/contact',
        '/terms',
      ];
      const xmlEscape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const urls: string[] = [];
      const today = new Date().toISOString().slice(0, 10);
      for (const route of staticRoutes) {
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}${route}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`
        );
      }
      for (const p of products) {
        if (p.isPublished === false) continue;
        const lastmod = (p.updatedAt || p.createdAt || today).slice(0, 10);
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}/product/${encodeURIComponent(p.slug)}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>`
        );
      }
      for (const post of blogRes.posts) {
        if (!post.isPublished) continue;
        const lastmod = (post.updatedAt || post.publishedAt || today).slice(0, 10);
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}/blog/${encodeURIComponent(post.slug)}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`
        );
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(xml);
    } catch {
      next();
    }
  });

  serveCrawlerStaticFile('/robots.txt', 'robots.txt', 'text/plain; charset=utf-8');
  serveCrawlerStaticFile('/sitemap.xml', 'sitemap.xml', 'application/xml; charset=utf-8');
  serveCrawlerStaticFile('/llms.txt', 'llms.txt', 'text/plain; charset=utf-8');

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
    app.use(
      express.static(distDir, {
        setHeaders(res, filePath) {
          const normalized = filePath.replace(/\\/g, '/');
          if (normalized.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (
            normalized.includes('/icons/') ||
            normalized.endsWith('/favicon.svg') ||
            normalized.endsWith('/apple-touch-icon.png')
          ) {
            res.setHeader(
              'Cache-Control',
              'public, max-age=604800, stale-while-revalidate=86400'
            );
          } else if (normalized.endsWith('/index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
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
    if (err instanceof StoreOperationError || err instanceof StockMovementError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    const hideDetails = isProd && !isAiStudioPreview;
    res.status(500).json({
      error: !hideDetails && err instanceof Error ? err.message : 'خطای داخلی سرور رخ داد.',
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
