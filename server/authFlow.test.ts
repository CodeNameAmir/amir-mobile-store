import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerApp } from '../server.ts';
import {
  createMemoryAuthStorage,
  createSupabaseAuthStorage,
  type OtpPurpose,
} from './authStore.ts';
import {
  getSessionCookieOptions,
  isOriginAllowed,
  resolveCorsConfig,
  resolveSessionSecret,
  resolveSupabaseAdminConfig,
} from './config.ts';

const TEST_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';
const ALLOWED_ORIGIN = 'https://amir-mobile-store.codenameamir.ir';

function createCookieJar() {
  const cookies = new Map<string, string>();
  return {
    capture(res: Response) {
      const setCookies =
        typeof res.headers.getSetCookie === 'function'
          ? res.headers.getSetCookie()
          : res.headers.get('set-cookie')
          ? [res.headers.get('set-cookie')!]
          : [];
      for (const raw of setCookies) {
        const firstPart = raw.split(';')[0] || '';
        const eqIdx = firstPart.indexOf('=');
        if (eqIdx <= 0) continue;
        const name = firstPart.slice(0, eqIdx).trim();
        const value = firstPart.slice(eqIdx + 1).trim();
        if (!value || raw.toLowerCase().includes('max-age=0')) {
          cookies.delete(name);
        } else {
          cookies.set(name, value);
        }
      }
      return setCookies;
    },
    header(): string {
      return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    get(name: string) {
      return cookies.get(name);
    },
  };
}

test('Production config guards reject missing secrets, CORS_ORIGIN, and Supabase service role', () => {
  assert.throws(
    () => resolveSessionSecret({ NODE_ENV: 'production', AUTH_SESSION_SECRET: 'short' }),
    /AUTH_SESSION_SECRET/
  );
  assert.throws(
    () => resolveSessionSecret({ NODE_ENV: 'production' }),
    /AUTH_SESSION_SECRET/
  );
  assert.equal(
    resolveSessionSecret({ NODE_ENV: 'production', AUTH_SESSION_SECRET: TEST_SECRET }),
    TEST_SECRET
  );

  // Dev mode uses deterministic secret across restarts
  const dev1 = resolveSessionSecret({ NODE_ENV: 'development' });
  const dev2 = resolveSessionSecret({ NODE_ENV: 'development' });
  assert.equal(dev1, dev2);

  assert.throws(
    () => resolveCorsConfig({ NODE_ENV: 'production' }),
    /CORS_ORIGIN/
  );
  const cors = resolveCorsConfig({
    NODE_ENV: 'production',
    CORS_ORIGIN: 'https://amir-mobile-store.codenameamir.ir/',
  });
  assert.deepEqual(cors.allowedOrigins, ['https://amir-mobile-store.codenameamir.ir']);
  assert.equal(isOriginAllowed('https://amir-mobile-store.codenameamir.ir', cors.allowedOrigins, true), true);
  assert.equal(isOriginAllowed('https://evil.example.com', cors.allowedOrigins, true), false);

  assert.throws(
    () =>
      resolveSupabaseAdminConfig({
        NODE_ENV: 'production',
        SUPABASE_URL: 'https://demo.supabase.co',
      }),
    /SUPABASE_SERVICE_ROLE_KEY/
  );
  const supa = resolveSupabaseAdminConfig({
    NODE_ENV: 'production',
    SUPABASE_URL: 'https://demo.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret-key',
  });
  assert.equal(supa.configured, true);

  const prodCookie = getSessionCookieOptions({
    isProd: true,
    isHttpsRequest: true,
    maxAgeMs: 60_000,
  });
  assert.equal(prodCookie.httpOnly, true);
  assert.equal(prodCookie.sameSite, 'none');
  assert.equal(prodCookie.secure, true);
  assert.equal(prodCookie.path, '/');

  const devCookie = getSessionCookieOptions({
    isProd: false,
    isHttpsRequest: false,
    maxAgeMs: 60_000,
  });
  assert.equal(devCookie.httpOnly, true);
  assert.equal(devCookie.sameSite, 'lax');
  assert.equal(devCookie.secure, false);
});

test('Supabase auth storage adapter persists users & OTP challenges to PostgreSQL tables', async () => {
  const userRows = new Map<string, Record<string, unknown>>();
  const otpRows = new Map<string, Record<string, unknown>>();

  const mockSupabase = {
    from(table: string) {
      if (table === 'app_users') {
        return {
          select(_cols?: string, opts?: { count?: string; head?: boolean }) {
            if (opts?.head) {
              return Promise.resolve({ count: userRows.size, error: null });
            }
            return {
              eq(field: string, value: string) {
                return {
                  maybeSingle: async () => {
                    const found = [...userRows.values()].find((r) => r[field] === value) || null;
                    return { data: found, error: null };
                  },
                };
              },
            };
          },
          insert(row: Record<string, unknown>) {
            userRows.set(String(row.id), row);
            return {
              select() {
                return {
                  single: async () => ({ data: row, error: null }),
                };
              },
            };
          },
          update(patch: Record<string, unknown>) {
            return {
              eq(field: string, value: string) {
                const existing = [...userRows.values()].find((r) => r[field] === value);
                const updated = existing ? { ...existing, ...patch } : null;
                if (updated) {
                  userRows.set(String(updated.id), updated);
                }
                return {
                  select() {
                    return {
                      single: async () => ({ data: updated, error: null }),
                    };
                  },
                };
              },
            };
          },
        };
      }

      if (table === 'auth_otp_challenges') {
        return {
          select() {
            return {
              eq(field: string, value: string) {
                return {
                  maybeSingle: async () => {
                    const found = [...otpRows.values()].find((r) => r[field] === value) || null;
                    return { data: found, error: null };
                  },
                };
              },
            };
          },
          upsert: async (row: Record<string, unknown>) => {
            otpRows.set(String(row.challenge_key), row);
            return { error: null };
          },
          delete() {
            return {
              eq: async (field: string, value: string) => {
                for (const [k, v] of otpRows.entries()) {
                  if (v[field] === value) otpRows.delete(k);
                }
                return { error: null };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;

  const adapter = createSupabaseAuthStorage(mockSupabase);
  const health = await adapter.checkHealth();
  assert.equal(health.ok, true);
  assert.equal(health.mode, 'supabase');

  const created = await adapter.createUser({
    email: 'buyer@codenameamir.ir',
    fullName: 'امیرحسین رضایی',
    phone: '09121234567',
    passwordHash: 'salt:hash',
  });
  assert.equal(created.email, 'buyer@codenameamir.ir');

  const fetched = await adapter.findUserByEmail('buyer@codenameamir.ir');
  assert.equal(fetched?.id, created.id);

  await adapter.upsertOtpChallenge({
    challengeKey: 'login::buyer@codenameamir.ir',
    id: '11111111-1111-1111-1111-111111111111',
    email: 'buyer@codenameamir.ir',
    purpose: 'login',
    codeHash: 'abc123',
    expiresAt: Date.now() + 60_000,
    resendAvailableAt: Date.now() + 30_000,
    attempts: 0,
  });
  const challenge = await adapter.getOtpChallenge('login::buyer@codenameamir.ir');
  assert.equal(challenge?.codeHash, 'abc123');
  await adapter.deleteOtpChallenge('login::buyer@codenameamir.ir');
  assert.equal(await adapter.getOtpChallenge('login::buyer@codenameamir.ir'), null);
});

test('Full HTTP production auth flow: CORS, signup, OTP login, password login, reset, email change, session & logout', async () => {
  const issuedOtps = new Map<string, string>();
  const sentEmails: Array<{ to: string; subject: string }> = [];

  const app = await createServerApp({
    env: {
      NODE_ENV: 'production',
      AUTH_SESSION_SECRET: TEST_SECRET,
      CORS_ORIGIN: ALLOWED_ORIGIN,
    },
    storage: createMemoryAuthStorage(),
    disableVite: true,
    onOtpIssued: ({ email, purpose, code }) => {
      issuedOtps.set(`${purpose}::${email}`, code);
    },
    sendEmail: async (input) => {
      sentEmails.push({ to: input.to, subject: input.subject });
      return {
        sent: true,
        provider: 'resend',
        emailId: `mock_resend_${sentEmails.length}`,
      };
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const jar = createCookieJar();

  const apiFetch = async (
    path: string,
    init: RequestInit = {},
    origin: string | null = ALLOWED_ORIGIN
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Forwarded-Proto': 'https',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (origin) {
      headers.Origin = origin;
    }
    const cookieHeader = jar.header();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });
    const setCookies = jar.capture(res);
    const body = await res.json().catch(() => null);
    return { res, body, setCookies };
  };

  try {
    // 1. Health check
    const health = await apiFetch('/api/health', { method: 'GET' }, null);
    assert.equal(health.res.status, 200);
    assert.equal(health.body.ok, true);
    assert.equal(health.body.corsConfigured, true);

    // 2. CORS preflight + blocked origin
    const preflight = await fetch(`${baseUrl}/api/auth/status`, {
      method: 'OPTIONS',
      headers: { Origin: ALLOWED_ORIGIN },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), ALLOWED_ORIGIN);
    assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');

    const evilCors = await apiFetch('/api/auth/me', { method: 'GET' }, 'https://evil.example.com');
    assert.equal(evilCors.res.status, 403);

    // 3. Signup with OTP + HttpOnly cross-site cookie check
    const email1 = 'customer@codenameamir.ir';
    const initialPw = 'AmirStore2026!';

    const signupOtp = await apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email1,
        purpose: 'signup',
        fullName: 'امیرحسین کریمی',
        phone: '09123456789',
        password: initialPw,
      }),
    });
    assert.equal(signupOtp.res.status, 200);
    assert.equal(signupOtp.body.sent, true);
    assert.equal(signupOtp.body.provider, 'resend');
    assert.equal(signupOtp.body.previewCode, undefined);

    const signupCode = issuedOtps.get(`signup::${email1}`);
    assert.ok(signupCode && /^\d{6}$/.test(signupCode));

    const verifySignup = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email1,
        purpose: 'signup',
        code: signupCode,
      }),
    });
    assert.equal(verifySignup.res.status, 200);
    assert.equal(verifySignup.body.authenticated, true);
    assert.equal(verifySignup.body.user.email, email1);

    const cookieLine = verifySignup.setCookies.find((c) => c.startsWith('amir_session='));
    assert.ok(cookieLine, 'Expected amir_session Set-Cookie header');
    assert.match(cookieLine, /HttpOnly/i);
    assert.match(cookieLine, /SameSite=None/i);
    assert.match(cookieLine, /Secure/i);

    // 4. Session persistence across refresh (/api/auth/me)
    const me1 = await apiFetch('/api/auth/me', { method: 'GET' });
    assert.equal(me1.res.status, 200);
    assert.equal(me1.body.authenticated, true);
    assert.equal(me1.body.user.fullName, 'امیرحسین کریمی');

    // 5. Logout & verify session revoked
    const logout1 = await apiFetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ allDevices: false }),
    });
    assert.equal(logout1.res.status, 200);
    assert.equal(jar.get('amir_session'), undefined);

    const meAfterLogout = await apiFetch('/api/auth/me', { method: 'GET' });
    assert.equal(meAfterLogout.body.authenticated, false);

    // 6. Password login
    const badPw = await apiFetch('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email: email1, password: 'WrongPassword1' }),
    });
    assert.equal(badPw.res.status, 401);

    const pwLogin = await apiFetch('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email: email1, password: initialPw }),
    });
    assert.equal(pwLogin.res.status, 200);
    assert.equal(pwLogin.body.authenticated, true);

    // 7. Logout then Login with Email OTP
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });

    const loginOtpReq = await apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email1, purpose: 'login' }),
    });
    assert.equal(loginOtpReq.res.status, 200);
    const loginOtpCode = issuedOtps.get(`login::${email1}`);
    assert.ok(loginOtpCode);

    const loginOtpVerify = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email1,
        purpose: 'login',
        code: loginOtpCode,
      }),
    });
    assert.equal(loginOtpVerify.res.status, 200);
    assert.equal(loginOtpVerify.body.authenticated, true);

    // 8. Email change (authenticated)
    const email2 = 'updated@codenameamir.ir';
    const changeEmailReq = await apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email2, purpose: 'change-email' }),
    });
    assert.equal(changeEmailReq.res.status, 200);
    const changeEmailCode = issuedOtps.get(`change-email::${email2}`);
    assert.ok(changeEmailCode);

    const changeEmailVerify = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email2,
        purpose: 'change-email',
        code: changeEmailCode,
      }),
    });
    assert.equal(changeEmailVerify.res.status, 200);
    assert.equal(changeEmailVerify.body.user.email, email2);

    const meAfterEmailChange = await apiFetch('/api/auth/me', { method: 'GET' });
    assert.equal(meAfterEmailChange.body.user.email, email2);

    // 9. Password reset on updated email
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });

    const resetReq = await apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email2, purpose: 'reset-password' }),
    });
    assert.equal(resetReq.res.status, 200);
    const resetCode = issuedOtps.get(`reset-password::${email2}`);
    assert.ok(resetCode);

    const newPw = 'NewAmirStore99!';
    const resetVerify = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email2,
        purpose: 'reset-password',
        code: resetCode,
        newPassword: newPw,
      }),
    });
    assert.equal(resetVerify.res.status, 200);
    assert.equal(resetVerify.body.authenticated, true);

    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });

    const loginOldPw = await apiFetch('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email: email2, password: initialPw }),
    });
    assert.equal(loginOldPw.res.status, 401);

    const loginNewPw = await apiFetch('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email: email2, password: newPw }),
    });
    assert.equal(loginNewPw.res.status, 200);
    assert.equal(loginNewPw.body.authenticated, true);
    assert.equal(loginNewPw.body.user.email, email2);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
});
