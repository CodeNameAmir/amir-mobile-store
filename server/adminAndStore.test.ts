import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerApp } from '../server.ts';
import { resolveApiBaseUrl } from '../src/lib/authApi.ts';
import {
  createMemoryAuthStorage,
  createSupabaseAuthStorage,
  hashPassword,
} from './authStore.ts';
import { parseCorsOrigins, resolveCorsConfig } from './config.ts';
import {
  calculateOrderTotalsServer,
  DEFAULT_DEV_PRODUCTS,
  sanitizeAuditDetails,
} from './storeData.ts';

const TEST_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';
const STOREFRONT_ORIGIN = 'https://amir-mobile-store.codenameamir.ir';
const ADMIN_ORIGIN = 'https://admin-panel-ams.codenameamir.ir';

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
  };
}

test('CORS wildcard stripping, multi-origin support, GitHub Pages resolution, and server pricing/sanitization', () => {
  assert.deepEqual(
    parseCorsOrigins(`*, ${STOREFRONT_ORIGIN}/ , ${ADMIN_ORIGIN}/ `),
    [STOREFRONT_ORIGIN, ADMIN_ORIGIN]
  );

  assert.throws(
    () => resolveCorsConfig({ NODE_ENV: 'production', CORS_ORIGIN: '*' }),
    /CORS_ORIGIN/
  );

  const cors = resolveCorsConfig({
    NODE_ENV: 'production',
    CORS_ORIGIN: `${STOREFRONT_ORIGIN},${ADMIN_ORIGIN}`,
  });
  assert.deepEqual(cors.allowedOrigins, [STOREFRONT_ORIGIN, ADMIN_ORIGIN]);

  assert.equal(
    resolveApiBaseUrl('', 'amir-mobile-store.github.io'),
    'https://api.codenameamir.ir'
  );
  assert.equal(
    resolveApiBaseUrl('https://api.codenameamir.ir', 'localhost'),
    ''
  );
  assert.equal(
    resolveApiBaseUrl('http://localhost:3001/', '127.0.0.1'),
    'http://localhost:3001'
  );

  // Server-side pricing calculation ignores external numbers and checks stock
  const computed = calculateOrderTotalsServer({
    items: [
      {
        productId: 'iphone-16-pro-max',
        storageLabel: '۵۱۲ گیگابایت',
        warranty: '۱۸ ماهه + Amir Care+',
        qty: 1,
      },
    ],
    products: DEFAULT_DEV_PRODUCTS,
    couponCode: 'VIP-10',
  });
  assert.equal(computed.ok, true);
  if (computed.ok) {
    assert.equal(computed.couponCode, 'VIP-10');
    assert.equal(computed.couponDiscount, 2_000_000); // VIP-10 capped at 2M
    assert.equal(computed.shippingCost, 0);
    assert.ok(computed.totalAmount > 94_200_000);
  }

  const outOfStock = calculateOrderTotalsServer({
    items: [{ productId: 'iphone-15-pro-blue-oos', qty: 1 }],
    products: DEFAULT_DEV_PRODUCTS,
  });
  assert.equal(outOfStock.ok, false);
  if (!outOfStock.ok) {
    assert.equal(outOfStock.statusCode, 409);
  }

  const sanitized = sanitizeAuditDetails({
    price: 1000,
    password: 'secret',
    authToken: 'tok',
    service_role_key: 'srk',
    nested: { otp: '123456', note: 'ok' },
  });
  assert.deepEqual(sanitized, {
    price: 1000,
    nested: { note: 'ok' },
  });
});

test('Full HTTP RBAC, Admin Panel APIs, Storefront APIs, and Order Security', async () => {
  const storage = createMemoryAuthStorage();
  const issuedOtps = new Map<string, string>();

  // Pre-seed an admin user in DB storage (simulating SQL role = 'admin')
  const adminPassword = 'AdminSecret2026!';
  await storage.createUser({
    email: 'admin@codenameamir.ir',
    fullName: 'مدیر کل فروشگاه',
    phone: '09120009999',
    passwordHash: hashPassword(adminPassword),
    role: 'admin',
  });

  const app = await createServerApp({
    env: {
      NODE_ENV: 'production',
      AUTH_SESSION_SECRET: TEST_SECRET,
      CORS_ORIGIN: `${STOREFRONT_ORIGIN},${ADMIN_ORIGIN}`,
    },
    storage,
    disableVite: true,
    onOtpIssued: ({ email, purpose, code }) => {
      issuedOtps.set(`${purpose}::${email}`, code);
    },
    sendEmail: async () => ({
      sent: true,
      provider: 'resend',
      emailId: 'mock_email_1',
    }),
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createClientSession = () => {
    const jar = createCookieJar();
    return async (
      path: string,
      init: RequestInit = {},
      origin: string | null = STOREFRONT_ORIGIN
    ) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
        ...(init.headers as Record<string, string> | undefined),
      };
      if (origin) headers.Origin = origin;
      const cookieHeader = jar.header();
      if (cookieHeader) headers.Cookie = cookieHeader;

      const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
      jar.capture(res);
      const body = await res.json().catch(() => null);
      return { res, body };
    };
  };

  const guestFetch = createClientSession();
  const customerFetch = createClientSession();
  const secondCustomerFetch = createClientSession();
  const adminFetch = createClientSession();

  try {
    // 1. Multi-origin CORS check for Admin Panel & unauthorized origin
    const adminCorsPreflight = await fetch(`${baseUrl}/api/admin/me`, {
      method: 'OPTIONS',
      headers: { Origin: ADMIN_ORIGIN },
    });
    assert.equal(adminCorsPreflight.status, 204);
    assert.equal(adminCorsPreflight.headers.get('access-control-allow-origin'), ADMIN_ORIGIN);
    assert.equal(adminCorsPreflight.headers.get('access-control-allow-credentials'), 'true');

    const badOrigin = await guestFetch('/api/products', { method: 'GET' }, 'https://evil.example.com');
    assert.equal(badOrigin.res.status, 403);

    // 2. Unauthenticated requests to /api/admin/* must fail with 401
    for (const adminPath of [
      '/api/admin/me',
      '/api/admin/stats',
      '/api/admin/products',
      '/api/admin/orders',
      '/api/admin/customers',
      '/api/admin/audit-logs',
    ]) {
      const unauth = await guestFetch(adminPath, { method: 'GET' }, ADMIN_ORIGIN);
      assert.equal(unauth.res.status, 401, `Expected 401 for unauth ${adminPath}`);
    }

    // 3. Customer signup attempting role escalation -> must stay 'customer'
    const custEmail = 'customer-rbac@codenameamir.ir';
    const custPw = 'CustomerPass2026!';
    await customerFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: custEmail,
        purpose: 'signup',
        fullName: 'مشتری عادی',
        phone: '09121112233',
        password: custPw,
        role: 'admin',
      }),
    });
    const custOtp = issuedOtps.get(`signup::${custEmail}`);
    assert.ok(custOtp);

    const verifyCust = await customerFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: custEmail,
        purpose: 'signup',
        code: custOtp,
        role: 'admin',
      }),
    });
    assert.equal(verifyCust.res.status, 200);
    assert.equal(verifyCust.body.user.role, 'customer');

    // Attempt privilege escalation via PATCH /api/auth/profile
    const patchProfile = await customerFetch('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName: 'مشتری ارتقایافته', role: 'admin' }),
    });
    assert.equal(patchProfile.res.status, 200);
    assert.equal(patchProfile.body.user.role, 'customer');

    // Customer blocked with 403 on /api/admin/*
    const custAdminMe = await customerFetch('/api/admin/me', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(custAdminMe.res.status, 403);
    const custCreateProd = await customerFetch(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          nameFa: 'تست غیرمجاز',
          brand: 'Apple',
          category: 'phones',
          price: 1000000,
          stockCount: 1,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(custCreateProd.res.status, 403);

    // 4. Admin login exposes role === 'admin' and grants access to /api/admin/*
    const adminLogin = await adminFetch(
      '/api/auth/login-password',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@codenameamir.ir', password: adminPassword }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(adminLogin.res.status, 200);
    assert.equal(adminLogin.body.authenticated, true);
    assert.equal(adminLogin.body.user.role, 'admin');

    const adminMe = await adminFetch('/api/admin/me', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(adminMe.res.status, 200);
    assert.equal(adminMe.body.user.role, 'admin');

    const adminStatus = await adminFetch('/api/auth/status', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(adminStatus.body.user.role, 'admin');

    // 5. Public Storefront APIs
    const cats = await guestFetch('/api/categories', { method: 'GET' });
    assert.equal(cats.res.status, 200);
    assert.ok(Array.isArray(cats.body.categories) && cats.body.categories.length >= 7);

    const configRes = await guestFetch('/api/store/config', { method: 'GET' });
    assert.equal(configRes.res.status, 200);
    assert.ok(configRes.body.settings.freeShippingThreshold > 0);
    assert.ok(Array.isArray(configRes.body.coupons) && configRes.body.coupons.length >= 2);

    const prodsRes = await guestFetch('/api/products?category=phones&sort=cheapest', { method: 'GET' });
    assert.equal(prodsRes.res.status, 200);
    assert.ok(prodsRes.body.products.length > 0);
    for (let i = 1; i < prodsRes.body.products.length; i++) {
      assert.ok(prodsRes.body.products[i - 1].price <= prodsRes.body.products[i].price);
    }

    const pdpRes = await guestFetch('/api/products/iphone-16-pro-max', { method: 'GET' });
    assert.equal(pdpRes.res.status, 200);
    assert.equal(pdpRes.body.product.slug, 'iphone-16-pro-max');

    const couponOk = await guestFetch('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'AMIR-OFF', subtotal: 5_000_000 }),
    });
    assert.equal(couponOk.res.status, 200);
    assert.equal(couponOk.body.valid, true);
    assert.equal(couponOk.body.discountAmount, 500_000);

    const reviewPost = await customerFetch('/api/products/iphone-16-pro-max/reviews', {
      method: 'POST',
      body: JSON.stringify({
        author: 'خریدار واقعی',
        rating: 5,
        comment: 'کیفیت گوشی عالی و تحویل بسیار سریع بود.',
      }),
    });
    assert.equal(reviewPost.res.status, 201);
    assert.equal(reviewPost.body.review.verified, true);

    const ticketPost = await guestFetch('/api/support-tickets', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'علی رضایی',
        phone: '09123456789',
        department: 'پشتیبانی فنی',
        message: 'لطفاً وضعیت گارانتی دستگاه را بررسی بفرمایید.',
      }),
    });
    assert.equal(ticketPost.res.status, 201);
    assert.match(ticketPost.body.ticket.ticketCode, /^TKT-/);

    const news1 = await guestFetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ contact: 'news@codenameamir.ir' }),
    });
    assert.equal(news1.res.status, 201);
    assert.equal(news1.body.alreadySubscribed, false);

    const news2 = await guestFetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ contact: 'news@codenameamir.ir' }),
    });
    assert.equal(news2.res.status, 201);
    assert.equal(news2.body.alreadySubscribed, true);

    // 6. Admin Product CRUD + Inventory + Audit Logs
    const createdProd = await adminFetch(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'pixel-9-pro',
          slug: 'pixel-9-pro',
          nameFa: 'گوشی گوگل پیکسل ۹ پرو',
          nameEn: 'Google Pixel 9 Pro 256GB',
          brand: 'Google',
          category: 'phones',
          price: 55_000_000,
          originalPrice: 59_000_000,
          stockCount: 4,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(createdProd.res.status, 201);
    assert.equal(createdProd.body.product.id, 'pixel-9-pro');

    // Public storefront immediately sees created product
    const pdpPixel = await guestFetch('/api/products/pixel-9-pro', { method: 'GET' });
    assert.equal(pdpPixel.res.status, 200);
    assert.equal(pdpPixel.body.product.price, 55_000_000);

    const patchedProd = await adminFetch(
      '/api/admin/products/pixel-9-pro',
      {
        method: 'PATCH',
        body: JSON.stringify({ price: 54_000_000 }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(patchedProd.res.status, 200);
    assert.equal(patchedProd.body.product.price, 54_000_000);

    const invUpdate = await adminFetch(
      '/api/admin/products/pixel-9-pro/inventory',
      {
        method: 'PATCH',
        body: JSON.stringify({ stockCount: 2 }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(invUpdate.res.status, 200);
    assert.equal(invUpdate.body.product.stockCount, 2);

    // 7. Hardened Order Creation: rejects tampered totals/status & decrements stock
    const guestOrderRes = await guestFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار مهمان',
        customerPhone: '09127778899',
        city: 'تهران',
        shippingAddress: 'خیابان شریعتی، کوچه دهم، پلاک ۵',
        postalCode: '1939512345',
        deliverySlot: 'express',
        couponCode: 'AMIR-OFF',
        subtotal: 1, // tampered!
        totalAmount: 1, // tampered!
        shippingCost: 0,
        status: 'delivered', // tampered!
        items: [{ productId: 'pixel-9-pro', qty: 1 }],
      }),
    });
    assert.equal(guestOrderRes.res.status, 201);
    assert.equal(guestOrderRes.body.order.totalAmount, 53_500_000); // 54M - 500k AMIR-OFF
    assert.equal(guestOrderRes.body.order.status, 'preparing');
    assert.ok(guestOrderRes.body.trackingToken);

    const guestOrderCode = guestOrderRes.body.order.orderCode as string;
    const guestTrackingToken = guestOrderRes.body.trackingToken as string;

    // Stock should have decremented from 2 -> 1; ordering 2 more must return 409
    const overStockRes = await guestFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار دوم',
        customerPhone: '09127770000',
        city: 'تهران',
        shippingAddress: 'خیابان شریعتی، کوچه یازدهم، پلاک ۶',
        postalCode: '1939512346',
        items: [{ productId: 'pixel-9-pro', qty: 2 }],
      }),
    });
    assert.equal(overStockRes.res.status, 409);

    // 8. Guest Order Privacy & Phone Verification
    const unauthLookup = await guestFetch(`/api/orders/${guestOrderCode}`, { method: 'GET' });
    assert.equal(unauthLookup.res.status, 200);
    assert.equal(unauthLookup.body.authorized, false);
    assert.equal(unauthLookup.body.requiresVerification, true);
    assert.equal(unauthLookup.body.isGuestOrder, true);
    assert.equal(unauthLookup.body.order, null);
    assert.equal(unauthLookup.body.summary.orderCode, guestOrderCode);
    assert.equal(unauthLookup.body.summary.customerPhone, undefined);

    const tokenLookup = await guestFetch(`/api/orders/${guestOrderCode}`, {
      method: 'GET',
      headers: { 'X-Order-Tracking-Token': guestTrackingToken },
    });
    assert.equal(tokenLookup.res.status, 200);
    assert.equal(tokenLookup.body.authorized, true);
    assert.equal(tokenLookup.body.order.customerPhone, '09127778899');

    const wrongVerify = await guestFetch(`/api/orders/${guestOrderCode}/verify`, {
      method: 'POST',
      body: JSON.stringify({ phone: '09120000000' }),
    });
    assert.equal(wrongVerify.res.status, 403);

    const rightVerify = await guestFetch(`/api/orders/${guestOrderCode}/verify`, {
      method: 'POST',
      body: JSON.stringify({ phone: '09127778899' }),
    });
    assert.equal(rightVerify.res.status, 200);
    assert.equal(rightVerify.body.order.orderCode, guestOrderCode);
    assert.ok(rightVerify.body.trackingToken);

    // 9. Registered Order Ownership Protection
    const custOrderRes = await customerFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'مشتری عادی',
        customerPhone: '09121112233',
        city: 'شیراز',
        shippingAddress: 'بلوار چمران، ساختمان نگین، واحد ۴',
        postalCode: '7194612345',
        items: [{ productId: 'anker-gan-65w-charger', qty: 1 }],
      }),
    });
    assert.equal(custOrderRes.res.status, 201);
    const custOrderCode = custOrderRes.body.order.orderCode as string;

    // Sign up a second customer and ensure they cannot read customer 1's order
    const otherEmail = 'other-cust@codenameamir.ir';
    await secondCustomerFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: otherEmail,
        purpose: 'signup',
        fullName: 'مشتری دیگر',
        phone: '09129998877',
        password: 'OtherUser2026!',
      }),
    });
    await secondCustomerFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: otherEmail,
        purpose: 'signup',
        code: issuedOtps.get(`signup::${otherEmail}`),
      }),
    });

    const otherLookup = await secondCustomerFetch(`/api/orders/${custOrderCode}`, { method: 'GET' });
    assert.equal(otherLookup.res.status, 200);
    assert.equal(otherLookup.body.authorized, false);
    assert.equal(otherLookup.body.order, null);
    assert.equal(otherLookup.body.isGuestOrder, false);

    const otherVerify = await secondCustomerFetch(`/api/orders/${custOrderCode}/verify`, {
      method: 'POST',
      body: JSON.stringify({ phone: '09121112233' }),
    });
    assert.equal(otherVerify.res.status, 403);
    assert.equal(otherVerify.body.requiresLogin, true);

    const ownerLookup = await customerFetch(`/api/orders/${custOrderCode}`, { method: 'GET' });
    assert.equal(ownerLookup.res.status, 200);
    assert.equal(ownerLookup.body.authorized, true);
    assert.equal(ownerLookup.body.order.orderCode, custOrderCode);

    // 10. Admin Orders Management, Cancelled Revenue Exclusion, Customers (PII-safe), Stats, Audit Logs, Product Delete
    const adminOrders = await adminFetch('/api/admin/orders', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(adminOrders.res.status, 200);
    assert.equal(adminOrders.body.total, 2);

    const adminOrderDetail = await adminFetch(
      `/api/admin/orders/${custOrderCode}`,
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(adminOrderDetail.res.status, 200);
    assert.equal(adminOrderDetail.body.order.orderCode, custOrderCode);

    const cancelOrder = await adminFetch(
      `/api/admin/orders/${guestOrderCode}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled', adminNote: 'لغو به درخواست مشتری' }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(cancelOrder.res.status, 200);
    assert.equal(cancelOrder.body.order.status, 'cancelled');
    assert.equal(cancelOrder.body.order.adminNote, 'لغو به درخواست مشتری');

    const statsRes = await adminFetch('/api/admin/stats', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(statsRes.res.status, 200);
    assert.equal(statsRes.body.stats.totalOrders, 2);
    assert.equal(statsRes.body.stats.cancelledOrders, 1);
    assert.equal(statsRes.body.stats.preparingOrders, 1);
    // Revenue excludes the cancelled 53.5M guest order and counts only customer's 2.89M charger
    assert.equal(statsRes.body.stats.totalRevenue, 2_890_000);
    assert.equal(statsRes.body.stats.adminUsersCount, 1);

    const customersRes = await adminFetch('/api/admin/customers', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(customersRes.res.status, 200);
    assert.equal(customersRes.body.customers.length, 3);
    for (const c of customersRes.body.customers) {
      assert.equal(c.passwordHash, undefined);
      assert.equal(c.activeSessionIds, undefined);
    }

    const custRecord = customersRes.body.customers.find((c: { email: string }) => c.email === custEmail);
    assert.ok(custRecord);
    const customerDetail = await adminFetch(
      `/api/admin/customers/${custRecord.id}`,
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(customerDetail.res.status, 200);
    assert.equal(customerDetail.body.orders.length, 1);
    assert.equal(customerDetail.body.customer.passwordHash, undefined);

    const deleteProd = await adminFetch('/api/admin/products/pixel-9-pro', { method: 'DELETE' }, ADMIN_ORIGIN);
    assert.equal(deleteProd.res.status, 200);
    assert.equal(deleteProd.body.ok, true);

    const auditLogsRes = await adminFetch('/api/admin/audit-logs', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(auditLogsRes.res.status, 200);
    const actions = auditLogsRes.body.logs.map((l: { action: string }) => l.action);
    assert.ok(actions.includes('product.create'));
    assert.ok(actions.includes('product.update'));
    assert.ok(actions.includes('product.inventory_update'));
    assert.ok(actions.includes('order.status_update'));
    assert.ok(actions.includes('product.delete'));
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
});

test('Supabase adapter handles app_users.role, products CRUD, orders status update, and admin_audit_logs fallback', async () => {
  const userRows = new Map<string, Record<string, unknown>>([
    [
      'admin-uuid-1',
      {
        id: 'admin-uuid-1',
        email: 'owner@codenameamir.ir',
        full_name: 'Amir Admin',
        phone: '09120001111',
        role: 'admin',
        newsletter_opt_in: true,
        email_verified: true,
        two_factor_enabled: false,
        addresses: [],
        wishlist: [],
        active_session_ids: [],
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      },
    ],
  ]);
  const productRows = new Map<string, Record<string, unknown>>();
  const orderRows = new Map<string, Record<string, unknown>>([
    [
      'AMIR-55555',
      {
        order_code: 'AMIR-55555',
        user_id: 'admin-uuid-1',
        customer_name: 'Amir Admin',
        customer_phone: '09120001111',
        city: 'تهران',
        shipping_address: 'تهران',
        postal_code: '1234567890',
        delivery_slot: 'express',
        total_amount: 10_000_000,
        status: 'preparing',
        items: [],
        created_at: new Date().toISOString(),
      },
    ],
  ]);
  const auditRows: Array<Record<string, unknown>> = [];

  const mockSupabase = {
    from(table: string) {
      if (table === 'app_users') {
        return {
          select() {
            return {
              order: async () => ({ data: [...userRows.values()], error: null }),
              eq(field: string, value: string) {
                return {
                  maybeSingle: async () => ({
                    data: [...userRows.values()].find((r) => r[field] === value) || null,
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }

      if (table === 'products') {
        return {
          select() {
            return {
              order: async () => ({ data: [...productRows.values()], error: null }),
              eq(field: string, value: string) {
                return {
                  maybeSingle: async () => ({
                    data: [...productRows.values()].find((r) => r[field] === value) || null,
                    error: null,
                  }),
                };
              },
            };
          },
          insert(row: Record<string, unknown>) {
            productRows.set(String(row.id), row);
            return {
              select: () => ({ single: async () => ({ data: row, error: null }) }),
            };
          },
          update(patch: Record<string, unknown>) {
            return {
              eq(field: string, value: string) {
                const existing = [...productRows.values()].find((r) => r[field] === value);
                const updated = existing ? { ...existing, ...patch } : null;
                if (updated) productRows.set(String(updated.id), updated);
                return {
                  select: () => ({ single: async () => ({ data: updated, error: null }) }),
                };
              },
            };
          },
          delete() {
            return {
              eq: async (field: string, value: string) => {
                for (const [k, v] of productRows.entries()) {
                  if (v[field] === value) productRows.delete(k);
                }
                return { error: null };
              },
            };
          },
        };
      }

      if (table === 'orders') {
        return {
          select() {
            return {
              order: async () => ({ data: [...orderRows.values()], error: null }),
              eq(field: string, value: string) {
                const matched = [...orderRows.values()].filter((r) => r[field] === value);
                return {
                  maybeSingle: async () => ({ data: matched[0] || null, error: null }),
                };
              },
            };
          },
          update(patch: Record<string, unknown>) {
            return {
              eq(field: string, value: string) {
                const existing = [...orderRows.values()].find((r) => r[field] === value);
                const updated = existing ? { ...existing, ...patch } : null;
                if (updated) orderRows.set(String(updated.order_code), updated);
                return {
                  select: () => ({ maybeSingle: async () => ({ data: updated, error: null }) }),
                };
              },
            };
          },
        };
      }

      if (table === 'admin_audit_logs') {
        return {
          insert(row: Record<string, unknown>) {
            // Simulate schema where actor_id/resource_type/metadata exist instead of admin_user_id
            if ('admin_user_id' in row) {
              return {
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: { code: 'PGRST204', message: 'Could not find column admin_user_id' },
                  }),
                }),
              };
            }
            const saved = { id: 'audit-1', created_at: new Date().toISOString(), ...row };
            auditRows.push(saved);
            return {
              select: () => ({ single: async () => ({ data: saved, error: null }) }),
            };
          },
          select() {
            return {
              order: async () => ({ data: auditRows, error: null }),
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;

  const adapter = createSupabaseAuthStorage(mockSupabase);

  const adminUser = await adapter.findUserByEmail('owner@codenameamir.ir');
  assert.equal(adminUser?.role, 'admin');

  const created = await adapter.createProduct({
    ...DEFAULT_DEV_PRODUCTS[0],
    id: 'supa-test-phone',
    slug: 'supa-test-phone',
    stockCount: 5,
  });
  assert.equal(created.id, 'supa-test-phone');

  const inv = await adapter.updateProductInventory('supa-test-phone', 0, false);
  assert.equal(inv?.inStock, false);
  assert.equal(inv?.stockCount, 0);

  const ordUpdated = await adapter.updateOrderStatus('AMIR-55555', 'shipped', 'ارسال با تیپاکس');
  assert.equal(ordUpdated?.status, 'shipped');
  assert.equal(ordUpdated?.adminNote, 'ارسال با تیپاکس');

  const audit = await adapter.createAuditLog({
    adminUserId: 'admin-uuid-1',
    adminEmail: 'owner@codenameamir.ir',
    action: 'order.status_update',
    entityType: 'order',
    entityId: 'AMIR-55555',
    details: { newStatus: 'shipped', token: 'must-be-stripped' },
  });
  assert.equal(audit.action, 'order.status_update');
  assert.equal(audit.details.token, undefined);

  const listedLogs = await adapter.listAuditLogs();
  assert.equal(listedLogs.total, 1);
  assert.equal(listedLogs.logs[0]?.adminEmail, 'owner@codenameamir.ir');

  const deleted = await adapter.deleteProduct('supa-test-phone');
  assert.equal(deleted, true);
});
