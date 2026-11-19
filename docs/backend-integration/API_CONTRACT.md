# Amir Mobile Store — Backend API Contract & Admin Panel Integration Guide

Base API URL (Production): `https://api.codenameamir.ir`  
Storefront Origin: `https://amir-mobile-store.codenameamir.ir`  
Admin Panel Origin: `https://admin-panel-ams.codenameamir.ir`

---

## 1. Authentication, Session Cookies & CORS

- **Session Cookie**: `amir_session` (`HttpOnly`, `Path=/`, `SameSite=None`, `Secure` in HTTPS production; signed with `AUTH_SESSION_SECRET` HMAC-SHA256).
- **Important for Admin Panel Frontend (`fetch` / Axios)**:
  - Every authenticated request (including `GET /api/auth/me` and all `/api/admin/*` endpoints) MUST include `credentials: 'include'` (or `withCredentials: true` in Axios).
  - Never send or store `SUPABASE_SERVICE_ROLE_KEY` in any frontend repository (`VITE_*`).
- **CORS Allowed Origins** (configured via `CORS_ORIGIN` on Render):
  - `https://amir-mobile-store.codenameamir.ir`
  - `https://admin-panel-ams.codenameamir.ir`
  - Wildcard `*` is explicitly rejected in production (`credentials: true` requires exact origin echo).
- **Allowed Headers**: `Content-Type`, `Authorization`, `X-Order-Tracking-Token`.
- **RBAC Enforcement**:
  - `role` (`'customer' | 'admin'`) is read **strictly** from `public.app_users.role` in PostgreSQL.
  - Signup and `PATCH /api/auth/profile` ignore any client-supplied `role`.
  - Every `/api/admin/*` route executes `requireAuth` (`401` if invalid/missing session) followed by `requireAdmin` (`403` if `user.role !== 'admin'`).

---

## 2. Authentication Endpoints (`/api/auth/*`)

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Returns `{ ok, service, environment, storage: { ok, mode }, corsConfigured, resend, timestamp }` |
| `GET` | `/api/auth/status` | Public | Returns `{ authenticated, user, resendConfigured, fromAddress, usingTestSender, storageMode }` |
| `GET` | `/api/auth/me` | Public/Session | Returns `{ authenticated: boolean, user: PublicUserDTO \| null }` (includes `user.role`) |
| `POST` | `/api/auth/send-otp` | Public / Session (`change-email`) | Sends 6-digit OTP (`signup \| login \| reset-password \| change-email`) |
| `POST` | `/api/auth/verify-otp` | Public / Session | Verifies OTP and sets `amir_session` cookie |
| `POST` | `/api/auth/login-password` | Public | Email + password login (supports 2FA step if enabled) |
| `POST` | `/api/auth/verify-2fa` | Public | Completes 2FA login with `{ twoFactorToken, code }` |
| `POST` | `/api/auth/resend-2fa` | Public | Resends 2FA OTP challenge |
| `POST` | `/api/auth/logout` | Public | Clears `amir_session` cookie (`{ allDevices?: boolean }`) |
| `PATCH` | `/api/auth/profile` | Auth | Updates profile fields including `avatarUrl` (never modifies `role`) |
| `DELETE` | `/api/auth/account` | Auth | Permanently deletes user account (`{ currentPassword }` required if `hasPassword`) and clears session |
| `POST` | `/api/auth/change-password` | Auth | Updates password |
| `POST` | `/api/auth/two-factor` | Auth | Enables/disables 2FA |
| `POST/PUT/DELETE` | `/api/auth/addresses/*` | Auth | Address book management |
| `PUT/POST` | `/api/auth/wishlist*` | Auth | Persistent wishlist management |

### `PublicUserDTO` Shape
```json
{
  "id": "uuid",
  "email": "admin@codenameamir.ir",
  "fullName": "نام کاربر",
  "phone": "09123456789",
  "role": "admin",
  "avatarUrl": "data:image/jpeg;base64,... or https://...",
  "emailVerified": true,
  "twoFactorEnabled": false,
  "hasPassword": true,
  "addresses": [],
  "wishlist": [],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "lastLoginAt": "2026-01-01T00:00:00.000Z"
}
```

---

## 3. Storefront Public & Order Endpoints (`/api/*`)

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Public | Active nested category metadata (`id`, `slug`, `label`, `subtitle`, `parentId`, `isActive`, `image`, `seoTitle`, `seoDescription`, `sortOrder`) |
| `GET` | `/api/brands` | Public | Active brand directory (`id`, `name`, `labelFa`, `isActive`) |
| `GET` | `/api/store/config` | Public | Active coupon rules (`coupons`) and `store_settings` (`settings`) |
| `GET` | `/api/products` | Public | Catalog with query filters: `category`, `q`, `brand`, `inStock`, `discounted`, `express`, `minPrice`, `maxPrice`, `sort` |
| `GET` | `/api/products/:slug` | Public | Product detail (including `images[]`, `customSpecs[]`, `priceUpdatedAt`) + approved reviews `{ product, reviews }` |
| `POST` | `/api/coupons/validate` | Public | Body `{ code, subtotal }` -> `{ valid, code, discountAmount, message }` |
| `GET` | `/api/products/:id/reviews` | Public | Approved reviews `{ reviews }` |
| `POST` | `/api/products/:id/reviews` | Public (verified badge if logged in) | Body `{ author, rating, comment }` -> `201 { review }` |
| `POST` | `/api/support-tickets` | Public | Body `{ fullName, phone, department, orderCode?, message }` -> `201 { ticket, syncedToDatabase }` |
| `POST` | `/api/newsletter` | Public | Body `{ contact }` -> `201 { ok, alreadySubscribed }` |
| `GET` | `/api/orders/mine` | Auth | Returns logged-in user's own orders `{ orders }` |
| `POST` | `/api/orders` | Public (Guest or Auth) | Server computes prices, coupons, shipping from DB; validates stock (`409` if insufficient); forces `status: 'preparing'`; decrements stock; returns `201 { order, syncedToDatabase, trackingToken }` |
| `POST` | `/api/orders/:code/verify` | Public | Body `{ phone }`. For guest orders, validates phone match -> returns `{ order, trackingToken }`. For registered-user orders (when caller isn't owner/admin), returns `403 { requiresLogin: true }` |
| `GET` | `/api/orders/:code` | Owner / Admin / Guest Token | Returns full `{ order, authorized: true, requiresVerification: false }` only for owner, admin, or valid `X-Order-Tracking-Token` / `?token=` / `?phone=`. Otherwise returns `{ order: null, authorized: false, requiresVerification: true, isGuestOrder, summary }` without PII |
| `POST` | `/api/orders/notify` | Owner / Admin (`requireAuth`) | Sends email order confirmation |

---

## 4. Admin Panel Protected Endpoints (`/api/admin/*`)

All endpoints below are consumed by the dedicated Admin Panel (`https://admin-panel-ams.codenameamir.ir/#/`) and require `amir_session` cookie of an authenticated user whose `public.app_users.role = 'admin'`.
- Unauthenticated -> `401 { error: "..." }`
- Non-admin (`role = 'customer'`) -> `403 { error: "..." }`

### 4.1 Admin Identity & Dashboard Stats
- **`GET /api/admin/me`** -> `{ user: PublicUserDTO }` (`user.role === 'admin'`)
- **`GET /api/admin/stats`** -> `{ stats: { totalRevenue, totalOrders, pendingOrders, preparingOrders, shippedOrders, deliveredOrders, cancelledOrders, totalProducts, outOfStockProducts, lowStockProducts, totalCustomers, adminUsersCount, recentOrders } }`

### 4.2 Unlimited Nested Category Management
- **`GET /api/admin/categories`** -> `{ categories: CategoryDTO[] }` (includes inactive categories, sorted by `sortOrder`)
- **`POST /api/admin/categories`** -> Creates a category (`201 { category }`).
  - Body: `{ label, slug?, subtitle?, parentId?: string | null, isActive?: boolean, image?: string, seoTitle?: string, seoDescription?: string, sortOrder?: number }`
- **`PUT /api/admin/categories/:id`** / **`PATCH /api/admin/categories/:id`** -> Updates category fields (`200 { category }`).
- **`DELETE /api/admin/categories/:id`** -> Deletes category and clears `parentId` on child categories (`200 { ok: true, id }`).

### 4.3 Dynamic Brand Management (Huawei, Nothing, custom brands)
- **`GET /api/admin/brands`** -> `{ brands: BrandDTO[] }`
- **`POST /api/admin/brands`** -> Creates or updates a brand (`201 { brand }`).
  - Body: `{ name, labelFa?, id?, isActive?: boolean }`
- **`DELETE /api/admin/brands/:id`** -> Deletes a brand (`200 { ok: true, id }`).

### 4.4 Product & Inventory Management
- **`GET /api/admin/products`** — Query filters: `category`, `q`, `brand`, `inStock`, `sort`. Returns `{ products, total }`.
- **`GET /api/admin/products/:id`** — Matches `id` or `slug`. Returns `{ product }`.
- **`POST /api/admin/products`** — Creates product (`201 { product }`). Logs audit `product.create`.
  - Required fields: `nameFa` (min 2 chars), `brand` (any string — e.g. `Apple`, `Samsung`, `Huawei`, custom), `category` (any active category slug), `price` (`> 0`).
  - Optional: `id`, `slug`, `nameEn`, `originalPrice`, `discountPercent`, `inStock`, `stockCount`, `expressDelivery`, `warranty`, `badgeText`, `rating`, `reviewCount`, `recommendPercent`, `image`, **`images: string[]`** (multi-image gallery), `colorLabel`, `colors`, `storageOptions`, `specs`, **`customSpecs: Array<{ label: string; value: string }>`** (unlimited custom technical specs), **`priceUpdatedAt`**, `isFeaturedDeal`, `isPopular`, `salesRank`, `releaseOrder`.
- **`PATCH /api/admin/products/:id`** and **`PUT /api/admin/products/:id`** — Updates product fields (`{ product }`). Automatically refreshes `priceUpdatedAt` whenever `price` changes. Logs audit `product.update`.
- **`PATCH /api/admin/products/:id/inventory`** — Body `{ stockCount?: number, inStock?: boolean }`. Logs audit `product.inventory_update`. Returns `{ product }`.
- **`DELETE /api/admin/products/:id`** — Deletes product (`{ ok: true, id }`). Logs audit `product.delete`.

### 4.5 Orders Management
- **`GET /api/admin/orders`** — Optional `?status=paid|preparing|shipped|delivered|cancelled&search=...`. Returns `{ orders, total, page, limit }`.
- **`GET /api/admin/orders/:code`** — Returns `{ order }`.
- **`PATCH /api/admin/orders/:code/status`** — Body `{ status: 'paid'|'preparing'|'shipped'|'delivered'|'cancelled', adminNote?: string }`. Updates both order tracking and invoice views. Logs audit `order.status_update`. Returns `{ order }`.

### 4.6 Customers & Audit Logs
- **`GET /api/admin/customers`** / **`GET /api/admin/customers/:id`**
- **`GET /api/admin/audit-logs`** — Optional `?limit=50&offset=0` (max `200`).

---

## 5. Database Migration (Supabase PostgreSQL)
Run `docs/backend-integration/SUPABASE_MIGRATION_V2.sql` in your Supabase SQL Editor to add:
- `public.app_users.avatar_url`
- `public.categories` (nested categories + image + SEO + sort_order)
- `public.brands` (custom brands including Huawei)
- `public.products.images`, `public.products.custom_specs`, `public.products.price_updated_at`
- `public.orders.admin_note`
