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
  applyStockMovementDelta,
  calculateOrderTotalsServer,
  DEFAULT_DEV_PRODUCTS,
  DEFAULT_DEV_VARIANTS,
  formatAttributeDisplayValue,
  sanitizeAuditDetails,
  stripPrivateVariantFields,
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

  // Server-side pricing calculation ignores external numbers, legacy Care+ strings, and checks stock
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
    assert.equal(computed.items[0].warranty.includes('Care+'), false);
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
    assert.equal(reviewPost.body.pendingApproval, true);
    assert.equal(reviewPost.body.review.verified, false);
    assert.equal(reviewPost.body.review.isApproved, false);

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
    assert.equal(guestOrderRes.body.order.status, 'pending_payment');
    assert.equal(guestOrderRes.body.order.paymentStatus, 'unpaid');
    assert.equal(guestOrderRes.body.order.shaparakRef, '');
    assert.equal(guestOrderRes.body.order.imeiSample, '');
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
    assert.equal(statsRes.body.stats.preparingOrders, 0);
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

    // 11. Unlimited Nested Categories, Custom Brands (Huawei), Product Multi-Image & Custom Specs, Avatar & Account Deletion
    const createCat = await adminFetch(
      '/api/admin/categories',
      {
        method: 'POST',
        body: JSON.stringify({
          label: 'گوشی‌های تاشو',
          slug: 'foldables',
          subtitle: 'پرچمداران تاشو',
          parentId: 'phones',
          isActive: true,
          image: '/assets/fold.jpg',
          seoTitle: 'خرید گوشی تاشو | موبایل امیر',
          seoDescription: 'جدیدترین گوشی‌های تاشو',
          sortOrder: 4,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(createCat.res.status, 201);
    assert.equal(createCat.body.category.parentId, 'phones');
    assert.equal(createCat.body.category.seoTitle, 'خرید گوشی تاشو | موبایل امیر');

    const disableCat = await adminFetch(
      '/api/admin/categories/foldables',
      {
        method: 'PATCH',
        body: JSON.stringify({
          label: 'گوشی‌های تاشو',
          slug: 'foldables',
          isActive: false,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(disableCat.res.status, 200);
    assert.equal(disableCat.body.category.isActive, false);

    const publicCats = await guestFetch('/api/categories', { method: 'GET' });
    assert.equal(
      publicCats.body.categories.some((c: { slug: string }) => c.slug === 'foldables'),
      false
    );

    const createBrand = await adminFetch(
      '/api/admin/brands',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Honor', labelFa: 'آنر', isActive: true }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(createBrand.res.status, 201);
    assert.equal(createBrand.body.brand.name, 'Honor');

    const customSpecProd = await adminFetch(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'honor-magic6-pro',
          slug: 'honor-magic6-pro',
          nameFa: 'گوشی آنر Magic 6 Pro',
          nameEn: 'Honor Magic 6 Pro',
          brand: 'Honor',
          category: 'phones',
          price: 58_000_000,
          stockCount: 3,
          image: '/img1.jpg',
          images: ['/img1.jpg', '/img2.jpg'],
          customSpecs: [{ label: 'باتری سیلیکون کربن', value: '۵۶۰۰ میلی‌آمپر' }],
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(customSpecProd.res.status, 201);
    assert.equal(customSpecProd.body.product.images.length, 2);
    assert.equal(customSpecProd.body.product.customSpecs[0].label, 'باتری سیلیکون کربن');
    assert.ok(customSpecProd.body.product.priceUpdatedAt);

    // Profile avatar update & customer account deletion
    const avatarRes = await secondCustomerFetch('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: 'مشتری دیگر',
        phone: '09129998877',
        avatarUrl: 'data:image/jpeg;base64,abc123',
      }),
    });
    assert.equal(avatarRes.res.status, 200);
    assert.equal(avatarRes.body.user.avatarUrl, 'data:image/jpeg;base64,abc123');

    const badDelete = await secondCustomerFetch('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ currentPassword: 'WrongPassword1' }),
    });
    assert.equal(badDelete.res.status, 400);

    const goodDelete = await secondCustomerFetch('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ currentPassword: 'OtherUser2026!' }),
    });
    assert.equal(goodDelete.res.status, 200);
    assert.equal(goodDelete.body.ok, true);

    const afterDeleteMe = await secondCustomerFetch('/api/auth/me', { method: 'GET' });
    assert.equal(afterDeleteMe.body.authenticated, false);

    const auditLogsRes = await adminFetch('/api/admin/audit-logs', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(auditLogsRes.res.status, 200);
    const actions = auditLogsRes.body.logs.map((l: { action: string }) => l.action);
    assert.ok(actions.includes('product.create'));
    assert.ok(actions.includes('product.update'));
    assert.ok(actions.includes('product.inventory_update'));
    assert.ok(actions.includes('order.status_update'));
    assert.ok(actions.includes('product.delete'));
    assert.ok(actions.includes('category.create'));
    assert.ok(actions.includes('brand.upsert'));
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

  // Regression: direct Supabase row with stringified JSON fields, string rating, 300M price, and release_order 100
  productRows.set('old-seed-phone', {
    id: 'old-seed-phone',
    slug: 'old-seed-phone',
    name_fa: 'گوشی قدیمی',
    name_en: 'Old Phone',
    brand: 'Apple',
    category: 'phones',
    price: 90_000_000,
    in_stock: true,
    stock_count: 3,
    release_order: 1,
    created_at: '2026-11-01 10:00:00+00',
  });
  productRows.set('apple-iphone-17-pro-max', {
    id: 'apple-iphone-17-pro-max',
    slug: 'apple-iphone-17-pro-max',
    name_fa: 'گوشی موبایل ایفون 17 پرومکس',
    name_en: 'Apple Iphone 17 PRO MAX',
    brand: 'Apple',
    category: 'phones',
    price: 300000000,
    original_price: 325500000,
    discount_percent: 8,
    in_stock: true,
    stock_count: 10,
    express_delivery: true,
    warranty: '۱۸ ماهه امیر سرویس + کد رجیستری همتا',
    rating: '4.8',
    review_count: 0,
    specs:
      '{"os": "نسخه رسمی گلوبال", "ram": "۸ گیگ", "camera": "دوربین حرفهای", "battery": "۵۰۰۰ میلیآمپر", "chipset": "پردازنده پرچمدار", "display": "OLED 120Hz", "cameraDetails": "لرزشگیر اپتیکال", "batteryDetails": "فست شارژ", "chipsetDetails": "نسل جدید", "displayDetails": "کیفیت پرچمدار", "storageDefault": "۲۵۶ گیگابایت"}',
    storage_options: '[{"label": "۲۵۶ گیگابایت", "subtitle": "نسخه استاندارد", "priceDelta": 0}]',
    colors: '[{"id": "midnight", "hex": "#1e293b", "name": "مشکی"}]',
    created_at: '2026-11-18 19:40:56.264447+00',
    image_url:
      'https://dkstatics-public.digikala.com/digikala-products/ec57ce03f2a92834058f502174b1a2aeffc9a580_1759666637.jpg',
    color_label: 'مشکی',
    badge_text: '۸٪ تخفیف . پرفروش',
    recommend_percent: 95,
    is_featured_deal: false,
    is_popular: false,
    sales_rank: 100,
    release_order: 100,
  });

  const listed = await adapter.listProducts({ sort: 'newest' });
  assert.equal(listed[0]?.id, 'apple-iphone-17-pro-max');
  assert.equal(listed[0]?.price, 300_000_000);
  assert.equal(listed[0]?.rating, 4.8);
  assert.equal(listed[0]?.specs.os, 'نسخه رسمی گلوبال');
  assert.equal(listed[0]?.specs.ram, '۸ گیگ');
  assert.equal(listed[0]?.colors[0]?.name, 'مشکی');
  assert.equal(listed[0]?.storageOptions[0]?.label, '۲۵۶ گیگابایت');

  const deleted = await adapter.deleteProduct('supa-test-phone');
  assert.equal(deleted, true);
});

test('Supabase storage persists avatarUrl via store_settings fallback when app_users.avatar_url column is missing', async () => {
  const userRows = new Map<string, Record<string, unknown>>([
    [
      'user-avatar-1',
      {
        id: 'user-avatar-1',
        email: 'avatar@codenameamir.ir',
        role: 'customer',
        password_hash: 'hash',
        full_name: 'کاربر آواتار',
        phone: '09120000001',
        is_email_verified: true,
        totp_enabled: false,
        two_factor_method: 'none',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]);
  const settingsRows = new Map<string, Record<string, unknown>>();

  const mockSupabase = {
    from(table: string) {
      if (table === 'app_users') {
        return {
          select() {
            return {
              eq(field: string, value: string) {
                const match = [...userRows.values()].find((r) => r[field] === value) || null;
                return {
                  maybeSingle: async () => ({ data: match, error: null }),
                };
              },
            };
          },
          update(patch: Record<string, unknown>) {
            return {
              eq(field: string, value: string) {
                if ('avatar_url' in patch) {
                  return {
                    select: () => ({
                      single: async () => ({
                        data: null,
                        error: { code: 'PGRST204', message: "Could not find the 'avatar_url' column of 'app_users'" },
                      }),
                    }),
                  };
                }
                const existing = [...userRows.values()].find((r) => r[field] === value);
                const updated = existing ? { ...existing, ...patch } : null;
                if (updated) userRows.set(String(updated.id), updated);
                return {
                  select: () => ({
                    single: async () => ({ data: updated, error: null }),
                  }),
                };
              },
            };
          },
        };
      }

      if (table === 'store_settings') {
        return {
          select() {
            return {
              eq(field: string, value: string) {
                const match = [...settingsRows.values()].find((r) => r[field] === value) || null;
                return {
                  maybeSingle: async () => ({ data: match, error: null }),
                };
              },
            };
          },
          upsert: async (row: Record<string, unknown>) => {
            settingsRows.set(String(row.key), row);
            return { error: null };
          },
          delete() {
            return {
              eq: async (field: string, value: string) => {
                for (const [k, v] of settingsRows.entries()) {
                  if (v[field] === value) settingsRows.delete(k);
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
  const sampleAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const updated = await adapter.updateUser('user-avatar-1', (user) => ({
    ...user,
    avatarUrl: sampleAvatar,
  }));
  assert.equal(updated?.avatarUrl, sampleAvatar);

  // Simulate full browser reload (Ctrl+Shift+R -> fresh GET /api/auth/me -> findUserById)
  const reloaded = await adapter.findUserById('user-avatar-1');
  assert.equal(reloaded?.avatarUrl, sampleAvatar);

  const byEmail = await adapter.findUserByEmail('avatar@codenameamir.ir');
  assert.equal(byEmail?.avatarUrl, sampleAvatar);

  // Removing avatar clears fallback entry
  const cleared = await adapter.updateUser('user-avatar-1', (user) => ({
    ...user,
    avatarUrl: undefined,
  }));
  assert.equal(cleared?.avatarUrl, undefined);
  const afterClear = await adapter.findUserById('user-avatar-1');
  assert.equal(afterClear?.avatarUrl, undefined);
});

test('V3 pure logic: stock movement delta validation, variant privacy stripping, attribute formatting, and variant-aware checkout totals', () => {
  // 1. Stock movement delta checks
  const zeroDelta = applyStockMovementDelta(10, 0, 0);
  assert.equal(zeroDelta.ok, false);
  if (!zeroDelta.ok) assert.equal(zeroDelta.statusCode, 400);

  const negativeStock = applyStockMovementDelta(2, 0, -5);
  assert.equal(negativeStock.ok, false);
  if (!negativeStock.ok) assert.equal(negativeStock.statusCode, 409);

  const belowReserved = applyStockMovementDelta(5, 3, -3);
  assert.equal(belowReserved.ok, false);
  if (!belowReserved.ok) assert.equal(belowReserved.statusCode, 409);

  const validInflow = applyStockMovementDelta(4, 1, 6);
  assert.equal(validInflow.ok, true);
  if (validInflow.ok) assert.equal(validInflow.balanceAfter, 10);

  const validOutflow = applyStockMovementDelta(5, 2, -3);
  assert.equal(validOutflow.ok, true);
  if (validOutflow.ok) assert.equal(validOutflow.balanceAfter, 2);

  // 2. Strip private costPriceToman before exposing variant publicly
  const sampleVariant = DEFAULT_DEV_VARIANTS[0];
  assert.ok(sampleVariant.costPriceToman && sampleVariant.costPriceToman > 0);
  const publicVariant = stripPrivateVariantFields(sampleVariant);
  assert.equal('costPriceToman' in publicVariant, false);
  assert.equal(publicVariant.sku, sampleVariant.sku);
  assert.equal(publicVariant.partNumber, sampleVariant.partNumber);

  // 3. Attribute display formatting
  assert.equal(
    formatAttributeDisplayValue({ dataType: 'number', unit: 'Hz' }, { valueNumber: 120 }),
    '۱۲۰ Hz'
  );
  assert.equal(
    formatAttributeDisplayValue({ dataType: 'boolean' }, { valueBoolean: true }),
    'دارد'
  );
  assert.equal(
    formatAttributeDisplayValue({ dataType: 'text' }, { valueText: 'Apple A18 Pro' }),
    'Apple A18 Pro'
  );

  // 4. Variant-aware order totals resolution
  const variant512 = DEFAULT_DEV_VARIANTS.find((v) => v.id === 'var-16pm-desert-512');
  assert.ok(variant512);
  const productWithVariants = DEFAULT_DEV_PRODUCTS.map((p) =>
    p.id === 'iphone-16-pro-max'
      ? {
          ...p,
          variants: DEFAULT_DEV_VARIANTS.filter((v) => v.productId === 'iphone-16-pro-max').map(
            (v) => ({ ...v, availableStock: 3 })
          ),
        }
      : p
  );

  const computed = calculateOrderTotalsServer({
    items: [
      {
        productId: 'iphone-16-pro-max',
        variantId: variant512.id,
        qty: 2,
      },
    ],
    products: productWithVariants,
  });
  assert.equal(computed.ok, true);
  if (computed.ok) {
    assert.equal(computed.items[0].unitPrice, variant512.priceToman);
    assert.equal(computed.items[0].sku, variant512.sku);
    assert.equal(computed.items[0].partNumber, variant512.partNumber);
    assert.equal(computed.items[0].simType, variant512.simType);
    assert.equal(computed.stockDecrements[0].variantId, variant512.id);
    assert.equal(computed.subtotal, variant512.priceToman * 2);
  }

  const exceededVariantStock = calculateOrderTotalsServer({
    items: [
      {
        productId: 'iphone-16-pro-max',
        sku: variant512.sku,
        qty: 4,
      },
    ],
    products: productWithVariants,
  });
  assert.equal(exceededVariantStock.ok, false);
  if (!exceededVariantStock.ok) assert.equal(exceededVariantStock.statusCode, 409);
});

test('V3 HTTP Integration: public warranties/attributes/variants privacy, RBAC admin CRUD, idempotent stock ledger, and variant checkout stock deduction', async () => {
  const storage = createMemoryAuthStorage();
  const adminPassword = 'V3AdminPassword2026!';
  await storage.createUser({
    email: 'v3-admin@codenameamir.ir',
    fullName: 'مدیر انبار و کاتالوگ',
    phone: '09123334455',
    passwordHash: hashPassword(adminPassword),
    role: 'admin',
  });
  await storage.createUser({
    email: 'v3-customer@codenameamir.ir',
    fullName: 'مشتری تست V3',
    phone: '09126667788',
    passwordHash: hashPassword('V3CustomerPass2026!'),
    role: 'customer',
  });

  const app = await createServerApp({
    env: {
      NODE_ENV: 'production',
      AUTH_SESSION_SECRET: TEST_SECRET,
      CORS_ORIGIN: `${STOREFRONT_ORIGIN},${ADMIN_ORIGIN}`,
    },
    storage,
    disableVite: true,
    sendEmail: async () => ({ sent: true, provider: 'resend', emailId: 'mock_v3' }),
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createSession = () => {
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

  const guest = createSession();
  const customer = createSession();
  const admin = createSession();

  try {
    // 1. Public warranties, attributes, and enriched PDP (no costPriceToman leak!)
    const warrantiesRes = await guest('/api/warranties', { method: 'GET' });
    assert.equal(warrantiesRes.res.status, 200);
    assert.ok(Array.isArray(warrantiesRes.body.warranties) && warrantiesRes.body.warranties.length >= 4);

    const attrsRes = await guest('/api/attributes?category=phones', { method: 'GET' });
    assert.equal(attrsRes.res.status, 200);
    assert.ok(Array.isArray(attrsRes.body.attributes) && attrsRes.body.attributes.length >= 5);

    const pdpRes = await guest('/api/products/iphone-16-pro-max', { method: 'GET' });
    assert.equal(pdpRes.res.status, 200);
    assert.ok(Array.isArray(pdpRes.body.product.variants) && pdpRes.body.product.variants.length >= 2);
    assert.ok(Array.isArray(pdpRes.body.product.attributeValues) && pdpRes.body.product.attributeValues.length >= 5);
    for (const v of pdpRes.body.product.variants) {
      assert.equal(v.costPriceToman, undefined, 'costPriceToman must never be exposed on public PDP');
      assert.ok(v.sku);
      assert.ok(v.partNumber);
    }

    // 2. RBAC enforcement on V3 admin endpoints
    for (const protectedPath of [
      '/api/admin/roles',
      '/api/admin/warranties',
      '/api/admin/attributes',
      '/api/admin/warehouses',
      '/api/admin/warehouse-stock',
      '/api/admin/stock-movements',
    ]) {
      const unauth = await guest(protectedPath, { method: 'GET' }, ADMIN_ORIGIN);
      assert.equal(unauth.res.status, 401, `Expected 401 on ${protectedPath}`);
    }

    const custLogin = await customer('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'v3-customer@codenameamir.ir', password: 'V3CustomerPass2026!' }),
    });
    assert.equal(custLogin.res.status, 200);

    const custWh = await customer('/api/admin/warehouses', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(custWh.res.status, 403);
    const custMove = await customer('/api/admin/stock-movements', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(custMove.res.status, 403);

    // 3. Admin login & V3 management endpoints
    const adminLogin = await admin(
      '/api/auth/login-password',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'v3-admin@codenameamir.ir', password: adminPassword }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(adminLogin.res.status, 200);

    const rolesRes = await admin('/api/admin/roles', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(rolesRes.res.status, 200);
    assert.ok(rolesRes.body.roles.some((r: { name: string }) => r.name === 'warehouse_manager'));

    // Warranty CRUD
    const newWarranty = await admin(
      '/api/admin/warranties',
      {
        method: 'POST',
        body: JSON.stringify({
          providerName: 'گارانتی تست الماس',
          durationMonths: 24,
          coverageFa: 'پوشش ۲۴ ماهه سخت‌افزار و نرم‌افزار',
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(newWarranty.res.status, 201);
    const createdWarrantyId = newWarranty.body.warranty.id as string;

    const patchWarranty = await admin(
      `/api/admin/warranties/${createdWarrantyId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ durationMonths: 36 }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(patchWarranty.res.status, 200);
    assert.equal(patchWarranty.body.warranty.durationMonths, 36);

    // Attribute create & product attribute assignment
    const newAttr = await admin(
      '/api/admin/attributes',
      {
        method: 'POST',
        body: JSON.stringify({
          code: 'usb_port',
          nameFa: 'درگاه اتصال',
          nameEn: 'USB Port',
          dataType: 'text',
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(newAttr.res.status, 201);
    const createdAttrId = newAttr.body.attribute.id as string;

    const setAttrs = await admin(
      '/api/admin/products/iphone-16-pro-max/attributes',
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [
            { attributeId: 'attr-chipset', valueText: 'Apple A18 Pro (3nm)' },
            { attributeId: createdAttrId, valueText: 'USB-C 3.2 Gen 2' },
          ],
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(setAttrs.res.status, 200);
    assert.equal(setAttrs.body.attributeValues.length, 2);

    // Admin variant create (costPriceToman visible to admin, hidden on public PDP)
    const createVariant = await admin(
      '/api/admin/products/iphone-16-pro-max/variants',
      {
        method: 'POST',
        body: JSON.stringify({
          sku: 'APL-16PM-1TB-WHT-ZAA',
          colorNameFa: 'تیتانیوم سفید',
          colorHex: '#f1f5f9',
          storage: '۱ ترابایت',
          ram: '۸ گیگابایت',
          partNumber: 'ZA/A',
          simType: 'دو سیم‌کارت فیزیکی (CH/ZA)',
          warrantyId: createdWarrantyId,
          priceToman: 124_000_000,
          costPriceToman: 112_000_000,
          isPublished: true,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(createVariant.res.status, 201);
    assert.equal(createVariant.body.variant.costPriceToman, 112_000_000);
    const createdVariantId = createVariant.body.variant.id as string;

    const adminProdDetail = await admin('/api/admin/products/iphone-16-pro-max', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(adminProdDetail.res.status, 200);
    const adminCreatedVar = adminProdDetail.body.product.variants.find(
      (v: { id: string }) => v.id === createdVariantId
    );
    assert.equal(adminCreatedVar.costPriceToman, 112_000_000);

    // Public PDP sees the new variant but without costPriceToman
    const publicPdpAfter = await guest('/api/products/iphone-16-pro-max', { method: 'GET' });
    const pubCreatedVar = publicPdpAfter.body.product.variants.find(
      (v: { id: string }) => v.id === createdVariantId
    );
    assert.ok(pubCreatedVar);
    assert.equal(pubCreatedVar.costPriceToman, undefined);

    // 4. Warehouses & idempotent Stock Movement Ledger
    const whRes = await admin('/api/admin/warehouses', { method: 'GET' }, ADMIN_ORIGIN);
    assert.equal(whRes.res.status, 200);
    assert.ok(whRes.body.warehouses.some((w: { code: string }) => w.code === 'WH-THR-CENTRAL'));

    const inflow1 = await admin(
      '/api/admin/stock-movements',
      {
        method: 'POST',
        body: JSON.stringify({
          warehouseId: 'wh-thr-central',
          variantId: createdVariantId,
          movementType: 'purchase_inflow',
          quantityChange: 5,
          referenceType: 'purchase_order',
          referenceId: 'PO-2026-001',
          noteFa: 'ورود محموله اولیه ۱ ترابایت',
          idempotencyKey: 'po-2026-001-1tb',
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(inflow1.res.status, 201);
    assert.equal(inflow1.body.deduplicated, false);
    assert.equal(inflow1.body.stock.quantityOnHand, 5);
    assert.equal(inflow1.body.movement.balanceAfter, 5);

    // Duplicate idempotencyKey -> 200 deduplicated without double-applying!
    const inflowDup = await admin(
      '/api/admin/stock-movements',
      {
        method: 'POST',
        body: JSON.stringify({
          warehouseId: 'wh-thr-central',
          variantId: createdVariantId,
          movementType: 'purchase_inflow',
          quantityChange: 5,
          idempotencyKey: 'po-2026-001-1tb',
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(inflowDup.res.status, 200);
    assert.equal(inflowDup.body.deduplicated, true);
    assert.equal(inflowDup.body.stock.quantityOnHand, 5);

    // Excessive outflow -> 409 Conflict without mutating stock
    const badOutflow = await admin(
      '/api/admin/stock-movements',
      {
        method: 'POST',
        body: JSON.stringify({
          warehouseId: 'wh-thr-central',
          variantId: createdVariantId,
          movementType: 'inventory_adjustment',
          quantityChange: -999,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(badOutflow.res.status, 409);

    const stockCheck = await admin(
      `/api/admin/warehouse-stock?variantId=${createdVariantId}`,
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(stockCheck.res.status, 200);
    assert.equal(stockCheck.body.stock[0].quantityOnHand, 5);

    // 5. Checkout integration with variantId deducts warehouse_stock & writes order_sale movement
    const stockBeforeOrder = await admin(
      '/api/admin/warehouse-stock?warehouseId=wh-thr-central&variantId=var-16pm-desert-256',
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(stockBeforeOrder.res.status, 200);
    const qtyBefore = stockBeforeOrder.body.stock[0].quantityOnHand as number;

    const variantOrder = await guest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار نسخه ZA/A',
        customerPhone: '09128889900',
        city: 'تهران',
        shippingAddress: 'خیابان ولیعصر، نبش پارک ساعی، پلاک ۱۲',
        postalCode: '1511912345',
        deliverySlot: 'express',
        items: [
          {
            productId: 'iphone-16-pro-max',
            variantId: 'var-16pm-desert-256',
            qty: 1,
          },
        ],
      }),
    });
    assert.equal(variantOrder.res.status, 201);
    assert.equal(variantOrder.body.order.items[0].sku, 'APL-16PM-256-DSRT-ZAA');
    assert.equal(variantOrder.body.order.items[0].partNumber, 'ZA/A');
    const orderCode = variantOrder.body.order.orderCode as string;

    const stockAfterOrder = await admin(
      '/api/admin/warehouse-stock?warehouseId=wh-thr-central&variantId=var-16pm-desert-256',
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(stockAfterOrder.body.stock[0].quantityOnHand, qtyBefore - 1);

    const movementsAfter = await admin(
      '/api/admin/stock-movements?variantId=var-16pm-desert-256',
      { method: 'GET' },
      ADMIN_ORIGIN
    );
    assert.equal(movementsAfter.res.status, 200);
    assert.ok(
      movementsAfter.body.movements.some(
        (m: { movementType: string; referenceId?: string; quantityChange: number }) =>
          m.movementType === 'order_sale' &&
          m.referenceId === orderCode &&
          m.quantityChange === -1
      )
    );

    // Cleanup delete checks
    const delVar = await admin(`/api/admin/variants/${createdVariantId}`, { method: 'DELETE' }, ADMIN_ORIGIN);
    assert.equal(delVar.res.status, 200);
    const delAttr = await admin(`/api/admin/attributes/${createdAttrId}`, { method: 'DELETE' }, ADMIN_ORIGIN);
    assert.equal(delAttr.res.status, 200);
    const delWar = await admin(`/api/admin/warranties/${createdWarrantyId}`, { method: 'DELETE' }, ADMIN_ORIGIN);
    assert.equal(delWar.res.status, 200);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
});

test('Phase 2: trust proxy IP rate limit isolation, city shipping, server cart, verified/moderated reviews, and order cancel', async () => {
  const storage = createMemoryAuthStorage();
  const issuedOtps = new Map<string, string>();
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
      emailId: 'mock_email_phase2',
    }),
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createClient = () => {
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

  try {
    const guest = createClient();
    const customer = createClient();
    const otherCustomer = createClient();
    const admin = createClient();

    const adminLogin = await admin(
      '/api/auth/login-password',
      {
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.100.1' },
        body: JSON.stringify({ email: 'admin@codenameamir.ir', password: adminPassword }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(adminLogin.res.status, 200);

    // Sign up two distinct customers
    const signupCust = async (client: ReturnType<typeof createClient>, email: string, name: string, ip: string) => {
      const otp = await client('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'X-Forwarded-For': ip },
        body: JSON.stringify({
          email,
          purpose: 'signup',
          fullName: name,
          phone: '09121112233',
          password: 'UserPass#2026',
        }),
      });
      assert.equal(otp.res.status, 200);
      const code = issuedOtps.get(`signup::${email}`);
      assert.ok(code);
      const verify = await client('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'X-Forwarded-For': ip },
        body: JSON.stringify({
          email,
          purpose: 'signup',
          code,
        }),
      });
      assert.equal(verify.res.status, 200);
    };

    await signupCust(customer, 'phase2cust1@codenameamir.ir', 'مشتری فاز دو', '198.51.100.2');
    await signupCust(otherCustomer, 'phase2cust2@codenameamir.ir', 'مشتری دوم', '198.51.100.3');

    // 1. Trust proxy IP isolation check on strict rate-limited route
    const authProbe = createClient();
    for (let i = 0; i < 10; i++) {
      const attempt = await authProbe('/api/auth/login-password', {
        method: 'POST',
        headers: { 'X-Forwarded-For': '203.0.113.55' },
        body: JSON.stringify({ email: 'phase2cust1@codenameamir.ir', password: 'WrongPassword#1' }),
      });
      assert.equal(attempt.res.status, 401);
    }
    const blocked11th = await authProbe('/api/auth/login-password', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.55' },
      body: JSON.stringify({ email: 'phase2cust1@codenameamir.ir', password: 'WrongPassword#1' }),
    });
    assert.equal(blocked11th.res.status, 429);

    const differentIpAttempt = await authProbe('/api/auth/login-password', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.99' },
      body: JSON.stringify({ email: 'phase2cust1@codenameamir.ir', password: 'UserPass#2026' }),
    });
    assert.equal(differentIpAttempt.res.status, 200);

    // 2. City-based shipping fees & separate discount breakdown
    const lowProdRes = await admin(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'low-fee-cable',
          slug: 'low-fee-cable',
          nameFa: 'کابل تست ارسال',
          nameEn: 'Shipping Test Cable',
          brand: 'Anker',
          category: 'chargers',
          price: 400_000,
          originalPrice: 500_000,
          stockCount: 10,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(lowProdRes.res.status, 201);

    // Non-Tehran address requesting 'express' -> auto-forced to 'standard' (95,000 fee)
    const shirazOrder = await customer('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار شیراز',
        customerPhone: '09171112233',
        city: 'شیراز',
        shippingAddress: 'خیابان زند، کوچه چهارم، پلاک ۱۱',
        postalCode: '7135712345',
        deliverySlot: 'express',
        items: [{ productId: 'low-fee-cable', qty: 1 }],
      }),
    });
    assert.equal(shirazOrder.res.status, 201);
    assert.equal(shirazOrder.body.order.deliverySlot, 'standard');
    assert.equal(shirazOrder.body.order.shippingCost, 95_000);
    assert.equal(shirazOrder.body.order.productDiscount, 100_000);
    assert.equal(shirazOrder.body.order.couponDiscount, 0);
    assert.equal(shirazOrder.body.order.totalAmount, 495_000);

    // Tehran express below threshold -> 150,000 fee
    const tehranOrder = await guest('/api/orders', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.100.7' },
      body: JSON.stringify({
        customerName: 'مهمان تهران',
        customerPhone: '09128881122',
        email: 'guest.receipt@codenameamir.ir',
        city: 'تهران',
        shippingAddress: 'خیابان شریعتی، کوچه پنجم، پلاک ۸',
        postalCode: '1939511223',
        deliverySlot: 'express',
        items: [{ productId: 'low-fee-cable', qty: 1 }],
      }),
    });
    assert.equal(tehranOrder.res.status, 201);
    assert.equal(tehranOrder.body.order.deliverySlot, 'express');
    assert.equal(tehranOrder.body.order.shippingCost, 150_000);
    assert.equal(tehranOrder.body.order.customerEmail, 'guest.receipt@codenameamir.ir');
    const guestCancelCode = tehranOrder.body.order.orderCode as string;
    const guestToken = tehranOrder.body.trackingToken as string;

    // Invalid guest email rejected cleanly
    const badEmailOrder = await guest('/api/orders', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.100.8' },
      body: JSON.stringify({
        customerName: 'مهمان ایمیل نامعتبر',
        customerPhone: '09128881123',
        email: 'not-an-email',
        city: 'تهران',
        shippingAddress: 'خیابان ولیعصر، پلاک ۴۰، واحد ۳',
        postalCode: '1511912346',
        items: [{ productId: 'low-fee-cable', qty: 1 }],
      }),
    });
    assert.equal(badEmailOrder.res.status, 400);

    // 3. Server-side cart persistence & merge
    const putCart = await customer('/api/auth/cart', {
      method: 'PUT',
      body: JSON.stringify({
        items: [{ productId: 'low-fee-cable', qty: 2, colorName: 'مشکی', storageLabel: '۱.۸ متر' }],
      }),
    });
    assert.equal(putCart.res.status, 200);
    assert.equal(putCart.body.items.length, 1);
    assert.equal(putCart.body.items[0].qty, 2);

    const mergeCart = await customer('/api/auth/cart/merge', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            key: putCart.body.items[0].key,
            productId: 'low-fee-cable',
            qty: 1,
            colorName: 'مشکی',
            storageLabel: '۱.۸ متر',
          },
          {
            productId: 'iphone-16-pro-max',
            qty: 1,
          },
        ],
      }),
    });
    assert.equal(mergeCart.res.status, 200);
    assert.equal(mergeCart.body.items.length, 2);
    const mergedCable = mergeCart.body.items.find((i: { productId: string }) => i.productId === 'low-fee-cable');
    assert.equal(mergedCable.qty, 3);

    // 4. Verified buyer review + moderation + rating recalculation
    const shirazOrderCode = shirazOrder.body.order.orderCode as string;
    const deliverRes = await admin(
      `/api/admin/orders/${shirazOrderCode}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'delivered' }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(deliverRes.res.status, 200);

    const verifiedReviewRes = await customer('/api/products/low-fee-cable/reviews', {
      method: 'POST',
      body: JSON.stringify({
        author: 'مشتری تحویل گرفته',
        rating: 2,
        comment: 'کابل خوب است ولی کمی سفت است و بسته‌بندی متوسط بود.',
      }),
    });
    assert.equal(verifiedReviewRes.res.status, 201);
    assert.equal(verifiedReviewRes.body.review.verified, true);
    assert.equal(verifiedReviewRes.body.review.isApproved, false);
    const revId = verifiedReviewRes.body.review.id as string;

    // Hidden publicly until approved
    const pubBeforeApprove = await guest('/api/products/low-fee-cable', { method: 'GET' });
    assert.equal(
      pubBeforeApprove.body.reviews.some((r: { id: string }) => r.id === revId),
      false
    );

    const approveRes = await admin(
      `/api/admin/reviews/${revId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isApproved: true }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(approveRes.res.status, 200);
    assert.equal(approveRes.body.review.isApproved, true);

    const pubAfterApprove = await guest('/api/products/low-fee-cable', { method: 'GET' });
    assert.equal(
      pubAfterApprove.body.reviews.some((r: { id: string }) => r.id === revId),
      true
    );
    assert.equal(pubAfterApprove.body.product.reviewCount, 1);
    assert.equal(pubAfterApprove.body.product.rating, 2);

    // 5. Customer & guest order cancellation rules
    // Delivered order cannot be cancelled
    const cancelDelivered = await customer(`/api/orders/${shirazOrderCode}/cancel`, {
      method: 'POST',
    });
    assert.equal(cancelDelivered.res.status, 409);

    // Unauthorized customer cannot cancel guest order
    const forbiddenCancel = await otherCustomer(`/api/orders/${guestCancelCode}/cancel`, {
      method: 'POST',
    });
    assert.equal(forbiddenCancel.res.status, 403);

    // Guest with valid tracking token cancels preparing order and restores stock
    const validGuestCancel = await guest(`/api/orders/${guestCancelCode}/cancel`, {
      method: 'POST',
      headers: { 'X-Order-Tracking-Token': guestToken },
    });
    assert.equal(validGuestCancel.res.status, 200);
    assert.equal(validGuestCancel.body.order.status, 'cancelled');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }
});

test('Phase 3: Server pagination, dynamic attributes, back-in-stock alerts + restock trigger, notifications, support ticket history & Q&A', async () => {
  const storage = createMemoryAuthStorage();
  const issuedOtps = new Map<string, string>();
  const sentEmails: Array<{ to: string; subject: string; html?: string; text?: string }> = [];

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
    sendEmail: async (payload) => {
      sentEmails.push({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      return {
        sent: true,
        provider: 'resend',
        emailId: `mock_email_p3_${sentEmails.length}`,
      };
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createClient = () => {
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

  try {
    const guest = createClient();
    const customer = createClient();
    const otherCustomer = createClient();
    const admin = createClient();

    const adminLogin = await admin(
      '/api/auth/login-password',
      {
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.101.1' },
        body: JSON.stringify({ email: 'admin@codenameamir.ir', password: adminPassword }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(adminLogin.res.status, 200);

    const signupCust = async (
      client: ReturnType<typeof createClient>,
      email: string,
      name: string,
      phone: string,
      ip: string
    ) => {
      const otp = await client('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'X-Forwarded-For': ip },
        body: JSON.stringify({
          email,
          purpose: 'signup',
          fullName: name,
          phone,
          password: 'Phase3User#2026',
        }),
      });
      assert.equal(otp.res.status, 200);
      const code = issuedOtps.get(`signup::${email}`);
      assert.ok(code);
      const verify = await client('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'X-Forwarded-For': ip },
        body: JSON.stringify({ email, purpose: 'signup', code }),
      });
      assert.equal(verify.res.status, 200);
    };

    await signupCust(customer, 'phase3.user1@codenameamir.ir', 'کاربر اول فاز سه', '09123334455', '198.51.101.2');
    await signupCust(otherCustomer, 'phase3.user2@codenameamir.ir', 'کاربر دوم فاز سه', '09123334466', '198.51.101.3');

    // 1. Server-side pagination + backward-compatible unpaginated response + biggest_discount + editorialReview + attr filter
    const allUnpaginated = await guest('/api/products', { method: 'GET' });
    assert.equal(allUnpaginated.res.status, 200);
    assert.equal(allUnpaginated.body.page, undefined);
    assert.ok(allUnpaginated.body.total >= 5);

    const page1 = await guest('/api/products?page=1&limit=3&sort=biggest_discount', { method: 'GET' });
    assert.equal(page1.res.status, 200);
    assert.equal(page1.body.products.length, 3);
    assert.equal(page1.body.page, 1);
    assert.equal(page1.body.limit, 3);
    assert.ok(page1.body.totalPages >= 2);

    const page2 = await guest('/api/products?page=2&limit=3&sort=biggest_discount', { method: 'GET' });
    assert.equal(page2.res.status, 200);
    assert.equal(page2.body.page, 2);
    assert.notEqual(page2.body.products[0]?.id, page1.body.products[0]?.id);

    // Create out-of-stock product with editorialReview & attributes to test dynamic filter + stock alert trigger
    const oosProd = await admin(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'p3-restock-phone',
          slug: 'p3-restock-phone',
          nameFa: 'گوشی تست شارژ موجودی فاز ۳',
          nameEn: 'Phase3 Restock Phone',
          brand: 'Nothing',
          category: 'phones',
          price: 38_000_000,
          originalPrice: 42_000_000,
          stockCount: 0,
          inStock: false,
          editorialReview: 'پاراگراف اول نقد تخصصی\nپاراگراف دوم بررسی باتری',
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(oosProd.res.status, 201);
    assert.match(oosProd.body.product.editorialReview, /نقد تخصصی/);

    // Set structured attribute values on the product so attr_ filter can match it
    const attrsRes = await guest('/api/attributes', { method: 'GET' });
    assert.equal(attrsRes.res.status, 200);
    const hzAttr = attrsRes.body.attributes.find((a: { code: string }) => a.code === 'refresh_rate');
    assert.ok(hzAttr);
    const setAttrs = await admin(
      '/api/admin/products/p3-restock-phone/attributes',
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [{ attributeId: hzAttr.id, valueNumber: 165 }],
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(setAttrs.res.status, 200);

    const attrFiltered = await guest('/api/products?attr_refresh_rate=165&page=1&limit=10', { method: 'GET' });
    assert.equal(attrFiltered.res.status, 200);
    assert.deepEqual(
      attrFiltered.body.products.map((p: { id: string }) => p.id),
      ['p3-restock-phone']
    );

    // 2. Back-in-stock alerts (authenticated + guest) & restock trigger
    const custAlert = await customer('/api/stock-alerts', {
      method: 'POST',
      body: JSON.stringify({ productId: 'p3-restock-phone' }),
    });
    assert.equal(custAlert.res.status, 201);

    const guestAlert = await guest('/api/stock-alerts', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.101.9' },
      body: JSON.stringify({
        productId: 'p3-restock-phone',
        email: 'guest.alert@codenameamir.ir',
      }),
    });
    assert.equal(guestAlert.res.status, 201);

    const myAlertsBefore = await customer('/api/stock-alerts', { method: 'GET' });
    assert.equal(myAlertsBefore.res.status, 200);
    assert.ok(myAlertsBefore.body.productIds.includes('p3-restock-phone'));

    // Restock 0 -> 5 via Admin inventory endpoint triggers email + in-app notification!
    sentEmails.length = 0;
    const restockRes = await admin(
      '/api/admin/products/p3-restock-phone/inventory',
      {
        method: 'PATCH',
        body: JSON.stringify({ stockCount: 5, inStock: true }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(restockRes.res.status, 200);
    assert.equal(restockRes.body.product.stockCount, 5);

    const backInStockEmails = sentEmails.filter((e) => e.subject.includes('موجود شد'));
    assert.equal(backInStockEmails.length, 2);
    assert.ok(backInStockEmails.some((e) => e.to === 'phase3.user1@codenameamir.ir'));
    assert.ok(backInStockEmails.some((e) => e.to === 'guest.alert@codenameamir.ir'));

    // Notification Center checks & cross-user ownership isolation
    const notifsRes = await customer('/api/notifications', { method: 'GET' });
    assert.equal(notifsRes.res.status, 200);
    assert.equal(notifsRes.body.unreadCount, 1);
    assert.equal(notifsRes.body.notifications[0].type, 'stock_alert');
    assert.equal(notifsRes.body.notifications[0].link, '/product/p3-restock-phone');
    const notifId = notifsRes.body.notifications[0].id as string;

    const otherMarkRead = await otherCustomer(`/api/notifications/${notifId}/read`, {
      method: 'PATCH',
    });
    assert.equal(otherMarkRead.res.status, 404);

    const markOneRead = await customer(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
    assert.equal(markOneRead.res.status, 200);
    assert.equal(markOneRead.body.notification.isRead, true);

    const deleteNotif = await customer(`/api/notifications/${notifId}`, { method: 'DELETE' });
    assert.equal(deleteNotif.res.status, 200);

    // 3. Support ticket history linked to authenticated customer
    const ticketRes = await customer('/api/support-tickets', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'کاربر اول فاز سه',
        phone: '09123334455',
        department: 'پشتیبانی فنی',
        orderCode: 'AMIR-12345',
        message: 'لطفاً وضعیت فعال‌سازی گارانتی دستگاه را بررسی بفرمایید.',
      }),
    });
    assert.equal(ticketRes.res.status, 201);

    const myTickets = await customer('/api/support-tickets/mine', { method: 'GET' });
    assert.equal(myTickets.res.status, 200);
    assert.equal(myTickets.body.tickets.length, 1);
    assert.equal(myTickets.body.tickets[0].ticketCode, ticketRes.body.ticket.ticketCode);
    assert.equal(myTickets.body.tickets[0].status, 'open');

    const otherTickets = await otherCustomer('/api/support-tickets/mine', { method: 'GET' });
    assert.equal(otherTickets.res.status, 200);
    assert.equal(otherTickets.body.tickets.length, 0);

    // 4. Product Q&A create (hidden pending moderation) + admin approve & answer
    const qPost = await customer('/api/products/p3-restock-phone/questions', {
      method: 'POST',
      body: JSON.stringify({
        authorName: 'کاربر اول فاز سه',
        question: 'آیا این مدل با رجیستری رسمی همتا و آداپتور اورجینال عرضه می‌شود؟',
      }),
    });
    assert.equal(qPost.res.status, 201);
    assert.equal(qPost.body.pendingApproval, true);
    assert.equal(qPost.body.question.isApproved, false);
    const qId = qPost.body.question.id as string;

    const qListBeforeApprove = await guest('/api/products/p3-restock-phone/questions', { method: 'GET' });
    assert.equal(qListBeforeApprove.res.status, 200);
    assert.equal(qListBeforeApprove.body.questions.length, 0);

    const qAnswer = await admin(
      `/api/admin/questions/${qId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          answer: 'بله، تمامی دستگاه‌ها دارای کد رجیستری همتا و پلمپ رسمی هستند.',
          isApproved: true,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(qAnswer.res.status, 200);
    assert.match(qAnswer.body.question.answer, /همتا/);

    const qList = await guest('/api/products/p3-restock-phone/questions', { method: 'GET' });
    assert.equal(qList.res.status, 200);
    assert.equal(qList.body.questions.length, 1);
    assert.match(qList.body.questions[0].answer, /همتا/);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }
});

test('Phase 4 HTTP Integration: Blog list filtering, search, pagination, and detail with related posts', async () => {
  const storage = createMemoryAuthStorage();
  const app = await createServerApp({
    env: {
      NODE_ENV: 'production',
      AUTH_SESSION_SECRET: TEST_SECRET,
      CORS_ORIGIN: `${STOREFRONT_ORIGIN},${ADMIN_ORIGIN}`,
    },
    storage,
    disableVite: true,
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Default paginated list returns 4 seeded articles & categories
    const listRes = await fetch(`${baseUrl}/api/blog?page=1&limit=2`);
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.total, 4);
    assert.equal(listBody.totalPages, 2);
    assert.equal(listBody.posts.length, 2);
    assert.ok(Array.isArray(listBody.categories) && listBody.categories.length >= 3);

    // 2. Category filter + search query
    const catRes = await fetch(
      `${baseUrl}/api/blog?category=${encodeURIComponent('راهنمای خرید')}`
    );
    assert.equal(catRes.status, 200);
    const catBody = await catRes.json();
    assert.equal(catBody.posts.length, 1);
    assert.equal(catBody.posts[0].slug, 'fast-charging-gan-cable-buying-guide');

    const qRes = await fetch(`${baseUrl}/api/blog?q=${encodeURIComponent('همتا')}`);
    assert.equal(qRes.status, 200);
    const qBody = await qRes.json();
    assert.ok(qBody.posts.some((p: { slug: string }) => p.slug === 'hamta-registry-and-original-seal-checklist'));

    // 3. Detail endpoint returns article & related posts
    const detailRes = await fetch(
      `${baseUrl}/api/blog/iphone-16-pro-max-vs-s24-ultra-camera`
    );
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.post.slug, 'iphone-16-pro-max-vs-s24-ultra-camera');
    assert.ok(Array.isArray(detailBody.relatedPosts));
    assert.ok(detailBody.relatedPosts.length >= 1 && detailBody.relatedPosts.length <= 3);
    assert.equal(
      detailBody.relatedPosts.some((r: { slug: string }) => r.slug === detailBody.post.slug),
      false
    );

    // 4. Unknown slug returns 404
    const missingRes = await fetch(`${baseUrl}/api/blog/non-existent-slug`);
    assert.equal(missingRes.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }
});

test('Storefront hardening: atomic checkout race, idempotency, cancel rollback, coupons, duplicate reviews, newsletter, facets, sitemap & CSRF', async () => {
  const storage = createMemoryAuthStorage({
    seedCoupons: [
      {
        code: 'EXPIRED-TEST',
        discountType: 'fixed',
        discountValue: 500_000,
        isActive: true,
        expiresAt: '2020-01-01T00:00:00Z',
      },
      {
        code: 'FUTURE-TEST',
        discountType: 'fixed',
        discountValue: 500_000,
        isActive: true,
        startsAt: '2099-01-01T00:00:00Z',
      },
      {
        code: 'ONCE-PER-USER',
        discountType: 'fixed',
        discountValue: 300_000,
        isActive: true,
        usageLimit: 5,
        perUserLimit: 1,
      },
    ],
  });
  const issuedOtps = new Map<string, string>();
  const adminPassword = 'HardeningAdmin2026!';
  await storage.createUser({
    email: 'hardening-admin@codenameamir.ir',
    fullName: 'مدیر تست سخت‌سازی',
    phone: '09120007777',
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
      emailId: 'mock_hardening_email',
    }),
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createClient = () => {
    const jar = createCookieJar();
    return async (
      path: string,
      init: RequestInit = {},
      origin: string | null = STOREFRONT_ORIGIN
    ) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
        'X-Requested-With': 'XMLHttpRequest',
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

  try {
    const guest = createClient();
    const customer = createClient();
    const admin = createClient();

    const adminLogin = await admin(
      '/api/auth/login-password',
      {
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.110.1' },
        body: JSON.stringify({ email: 'hardening-admin@codenameamir.ir', password: adminPassword }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(adminLogin.res.status, 200);

    // Signup authenticated customer
    const custEmail = 'hardening-cust@codenameamir.ir';
    const otpReq = await customer('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.2' },
      body: JSON.stringify({
        email: custEmail,
        purpose: 'signup',
        fullName: 'خریدار تست سخت‌سازی',
        phone: '09124445566',
        password: 'HardeningUser#2026',
      }),
    });
    assert.equal(otpReq.res.status, 200);
    const code = issuedOtps.get(`signup::${custEmail}`);
    assert.ok(code);
    const otpVerify = await customer('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.2' },
      body: JSON.stringify({ email: custEmail, purpose: 'signup', code }),
    });
    assert.equal(otpVerify.res.status, 200);

    // Seed limited-stock product (stock=1) & healthy-stock product (stock=5)
    const p1 = await admin(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'race-phone-1',
          slug: 'race-phone-1',
          nameFa: 'گوشی تست رقابت موجودی',
          nameEn: 'Race Phone 1',
          brand: 'Samsung',
          category: 'phones',
          price: 25_000_000,
          stockCount: 1,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(p1.res.status, 201);

    const p2 = await admin(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'rollback-cable-2',
          slug: 'rollback-cable-2',
          nameFa: 'کابل تست بازگشت موجودی',
          nameEn: 'Rollback Cable 2',
          brand: 'Anker',
          category: 'chargers',
          price: 1_500_000,
          stockCount: 5,
        }),
      },
      ADMIN_ORIGIN
    );
    assert.equal(p2.res.status, 201);

    // 1. Multi-item partial failure: rollback-cable-2 must remain at stock 5 if race-phone-1 qty 2 exceeds stock 1
    const multiFail = await guest('/api/orders', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.10' },
      body: JSON.stringify({
        customerName: 'خریدار تست رول‌بک',
        customerPhone: '09125550001',
        city: 'تهران',
        shippingAddress: 'خیابان آزادی، پلاک ۱۵، واحد ۱',
        postalCode: '1311111111',
        items: [
          { productId: 'rollback-cable-2', qty: 2 },
          { productId: 'race-phone-1', qty: 2 },
        ],
      }),
    });
    assert.equal(multiFail.res.status, 409);
    const cableAfterFail = await guest('/api/products/rollback-cable-2', { method: 'GET' });
    assert.equal(cableAfterFail.body.product.stockCount, 5);

    // 2. Concurrent checkout race on stock=1 product: 1 succeeds (201), 1 fails (409), stock ends at 0
    const racePayload = (phone: string) =>
      JSON.stringify({
        customerName: 'خریدار همزمان',
        customerPhone: phone,
        city: 'تهران',
        shippingAddress: 'خیابان انقلاب، پلاک ۲۰، واحد ۴',
        postalCode: '1311111112',
        items: [{ productId: 'race-phone-1', qty: 1 }],
      });
    const [raceA, raceB] = await Promise.all([
      guest('/api/orders', {
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.110.11' },
        body: racePayload('09125550002'),
      }),
      guest('/api/orders', {
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.110.12' },
        body: racePayload('09125550003'),
      }),
    ]);
    const statuses = [raceA.res.status, raceB.res.status].sort();
    assert.deepEqual(statuses, [201, 409]);
    const winner = raceA.res.status === 201 ? raceA : raceB;
    const raceProdAfter = await guest('/api/products/race-phone-1', { method: 'GET' });
    assert.equal(raceProdAfter.body.product.stockCount, 0);
    assert.equal(raceProdAfter.body.product.inStock, false);

    // 3. Cancel order restores stock atomically; repeat cancel returns 409
    const winnerCode = winner.body.order.orderCode as string;
    const winnerToken = winner.body.trackingToken as string;
    const cancel1 = await guest(`/api/orders/${winnerCode}/cancel`, {
      method: 'POST',
      headers: { 'X-Order-Tracking-Token': winnerToken },
    });
    assert.equal(cancel1.res.status, 200);
    assert.equal(cancel1.body.order.status, 'cancelled');

    const raceProdRestored = await guest('/api/products/race-phone-1', { method: 'GET' });
    assert.equal(raceProdRestored.body.product.stockCount, 1);
    assert.equal(raceProdRestored.body.product.inStock, true);

    const cancel2 = await guest(`/api/orders/${winnerCode}/cancel`, {
      method: 'POST',
      headers: { 'X-Order-Tracking-Token': winnerToken },
    });
    assert.equal(cancel2.res.status, 409);

    // 4. Idempotency-Key prevents duplicate orders and double stock deduction
    const idempKey = 'idemp-checkout-hardening-001';
    const idempBody = JSON.stringify({
      customerName: 'خریدار تکرارپذیر',
      customerPhone: '09124445566',
      city: 'تهران',
      shippingAddress: 'خیابان نیاوران، پلاک ۸۸، واحد ۵',
      postalCode: '1978811111',
      items: [{ productId: 'rollback-cable-2', qty: 1 }],
    });
    const order1 = await customer('/api/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempKey },
      body: idempBody,
    });
    assert.equal(order1.res.status, 201);
    assert.equal(order1.body.deduplicated, false);

    const order2 = await customer('/api/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempKey },
      body: idempBody,
    });
    assert.equal(order2.res.status, 200);
    assert.equal(order2.body.deduplicated, true);
    assert.equal(order2.body.order.orderCode, order1.body.order.orderCode);

    const cableAfterIdemp = await guest('/api/products/rollback-cable-2', { method: 'GET' });
    assert.equal(cableAfterIdemp.body.product.stockCount, 4); // deducted once (5 -> 4)

    // 5. Coupon lifecycle & per-user redemption limits + restoration on cancel

    const expiredEval = await customer('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'EXPIRED-TEST', subtotal: 5_000_000 }),
    });
    assert.equal(expiredEval.body.valid, false);

    const futureEval = await customer('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'FUTURE-TEST', subtotal: 5_000_000 }),
    });
    assert.equal(futureEval.body.valid, false);

    const couponOrder1 = await customer('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار کوپن یک‌بار',
        customerPhone: '09124445566',
        city: 'تهران',
        shippingAddress: 'خیابان نیاوران، پلاک ۸۸، واحد ۵',
        postalCode: '1978811111',
        couponCode: 'ONCE-PER-USER',
        items: [{ productId: 'rollback-cable-2', qty: 1 }],
      }),
    });
    assert.equal(couponOrder1.res.status, 201);
    assert.equal(couponOrder1.body.order.couponDiscount, 300_000);

    // Same user trying to reuse ONCE-PER-USER must be blocked (400)
    const couponOrder2 = await customer('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار کوپن یک‌بار',
        customerPhone: '09124445566',
        city: 'تهران',
        shippingAddress: 'خیابان نیاوران، پلاک ۸۸، واحد ۵',
        postalCode: '1978811111',
        couponCode: 'ONCE-PER-USER',
        items: [{ productId: 'rollback-cable-2', qty: 1 }],
      }),
    });
    assert.equal(couponOrder2.res.status, 400);

    // Cancelling couponOrder1 restores user redemption eligibility
    const cancelCouponOrd = await customer(`/api/orders/${couponOrder1.body.order.orderCode}/cancel`, {
      method: 'POST',
    });
    assert.equal(cancelCouponOrd.res.status, 200);

    const couponOrderAfterCancel = await customer('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'خریدار کوپن یک‌بار',
        customerPhone: '09124445566',
        city: 'تهران',
        shippingAddress: 'خیابان نیاوران، پلاک ۸۸، واحد ۵',
        postalCode: '1978811111',
        couponCode: 'ONCE-PER-USER',
        items: [{ productId: 'rollback-cable-2', qty: 1 }],
      }),
    });
    assert.equal(couponOrderAfterCancel.res.status, 201);

    // 6. Duplicate review by same authenticated user returns 409 Conflict
    const rev1 = await customer('/api/products/rollback-cable-2/reviews', {
      method: 'POST',
      body: JSON.stringify({
        author: 'خریدار تست',
        rating: 5,
        comment: 'کابل باکیفیت و شارژ سریع واقعی دارد.',
      }),
    });
    assert.equal(rev1.res.status, 201);
    const revDup = await customer('/api/products/rollback-cable-2/reviews', {
      method: 'POST',
      body: JSON.stringify({
        author: 'خریدار تست',
        rating: 4,
        comment: 'تلاش برای ثبت دیدگاه تکراری توسط همین کاربر.',
      }),
    });
    assert.equal(revDup.res.status, 409);

    // 7. Strict newsletter validation + unsubscribe
    const badNews = await guest('/api/newsletter', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.20' },
      body: JSON.stringify({ contact: 'aaaaa' }),
    });
    assert.equal(badNews.res.status, 400);

    const phoneNews = await guest('/api/newsletter', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.21' },
      body: JSON.stringify({ contact: '۰۹۱۲۳۳۳۴۴۵۵' }),
    });
    assert.equal(phoneNews.res.status, 201);
    assert.equal(phoneNews.body.contactType, 'phone');
    assert.ok(phoneNews.body.unsubscribeToken);

    const unsubRes = await guest('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'X-Forwarded-For': '198.51.110.22' },
      body: JSON.stringify({ contact: '09123334455' }),
    });
    assert.equal(unsubRes.res.status, 200);
    assert.equal(unsubRes.body.unsubscribed, true);

    // 8. Facets on /api/products & dynamic /sitemap.xml
    const facetsRes = await guest('/api/products?page=1&limit=4', { method: 'GET' });
    assert.equal(facetsRes.res.status, 200);
    assert.ok(facetsRes.body.facets);
    assert.ok(Array.isArray(facetsRes.body.facets.brands) && facetsRes.body.facets.brands.length > 0);
    assert.ok(Array.isArray(facetsRes.body.facets.colors));
    assert.ok(typeof facetsRes.body.facets.maxPrice === 'number' && facetsRes.body.facets.maxPrice > 0);

    const sitemapRaw = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(sitemapRaw.status, 200);
    assert.match(sitemapRaw.headers.get('content-type') || '', /application\/xml/);
    const sitemapXml = await sitemapRaw.text();
    assert.match(sitemapXml, /<urlset/);
    assert.match(sitemapXml, /\/product\/race-phone-1/);
    assert.match(sitemapXml, /\/blog\/iphone-16-pro-max-vs-s24-ultra-camera/);
    assert.equal(sitemapXml.includes('/#/'), false);

    // 9. CSRF protection blocks authenticated cookie-bearing form POST lacking Origin/Referer/XMLHttpRequest
    const csrfRawRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: 'amir_session=forged-or-ambient-cookie',
      },
      body: 'allDevices=false',
    });
    assert.equal(csrfRawRes.status, 403);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err?: Error) => (err ? reject(err) : resolve()))
    );
  }
});






