# فروشگاه موبایل امیر | Amir Mobile Store

فروشگاه اینترنتی مدرن و راست‌چین (**RTL**) برای فروش گوشی‌های هوشمند پرچمدار، تبلت، ساعت هوشمند، گجت‌های صوتی و لوازم جانبی اورجینال با رابط کاربری **فارسی** و واحد پول **تومان**.  
این پروژه با معماری استاتیک (**Vite + React 19 + TypeScript + Tailwind CSS v4**) طراحی شده تا به‌صورت رایگان روی **GitHub Pages** بیلد شود، پشت **CDN ابرآروان (ArvanCloud)** قرار بگیرد و از **Supabase PostgreSQL** به‌عنوان دیتابیس ابری استفاده کند.

---

## قابلیت‌ها و صفحات فروشگاه

### ۱. ویترین و کشف محصول
- **صفحه اصلی (`#/`)**: بنر پرچمدار آیفون ۱۶ پرو مکس، شلف پیشنهادات شگفت‌انگیز، دسته‌بندی‌های ۷گانه، فیلتر سریع برند (اپل، سامسونگ، شیائومی)، بنر اکوسیستم شارژ GaN انکر، بنر اقساط و معاوضه، **بازدیدهای اخیر شما**، مجله تخصصی موبایل و نظرات خریداران.
- **جستجوی زنده (Live Search Autocomplete)**: جستجوی آنی در نام فارسی، نام انگلیسی، برند و پردازنده از نوار بالای سایت و نمایش مستقیم نتایج با قیمت و تصویر.
- **کاتالوگ هوشمند (`#/catalog`)**: فیلتر هم‌زمان بر اساس دسته‌بندی، برند، بازه قیمت، موجودی انبار، ارسال اکسپرس، تخفیف‌دارها، حافظه داخلی، رم، رنگ و مرتب‌سازی (جدیدترین، پرفروش‌ترین، محبوب‌ترین، ارزان‌ترین، گران‌ترین).

### ۲. صفحه تخصصی کالا (`#/product/:slug`)
- انتخاب تعاملی **رنگ** و **ظرفیت / نسخه** با به‌روزرسانی لحظه‌ای قیمت و موجودی انبار.
- **بیمه حوادث و شکستگی Amir Care+**: محاسبه خودکار هزینه پوشش حوادث (۴٪ ارزش کالا در بازه ۴۹۰ هزار تا ۳.۲ میلیون تومان) و افزودن مستقیم به عنوان ویژگی سبد خرید.
- **پیش‌نمایش قسط ماهانه**: محاسبه فوری اقساط ۱۲ماهه با لینک به صفحه اقساط.
- مقایسه محصول، علاقه‌مندی‌ها، اطلاع‌رسانی موجودی («موجود شد خبرم کن»)، لوازم جانبی پیشنهادی، مشخصات فنی، بررسی کارشناسی و **نظرات خریداران متصل به Supabase** (`product_reviews`).
- نمایش ردیف **بازدیدهای اخیر شما** در پایین صفحه کالا.

### ۳. مقایسه تخصصی (`#/compare`) و نوار مقایسه شناور
- مقایسه هم‌زمان تا **۳ محصول** در کنار هم (نمایشگر، تراشه، دوربین، باتری، رم، حافظه، گارانتی، وضعیت ارسال، قیمت).
- دکمه **«فقط نمایش تفاوت‌ها»** برای تمرکز سریع روی اختلاف‌های فنی بین گوشی‌ها.
- امکان افزودن محصول مستقیم از صفحه مقایسه یا حذف تکی و کلی.

### ۴. خرید اقساطی و تعویض گوشی کارکرده (`#/installments`)
- **محاسبه‌گر آنلاین اقساط**: انتخاب محصول هدف، تنظیم درصد پیش‌پرداخت (۲۰٪ تا ۵۰٪) و دوره بازپرداخت (۶، ۹، ۱۲ یا ۱۸ ماهه) با نمایش مبلغ پیش‌پرداخت، قسط ماهانه و جمع نهایی.
- **طرح معاوضه هوشمند (Trade-In)**: کسر ارزش تخمینی گوشی کارکرده قبلی از مبلغ کل دستگاه جدید.

### ۵. سبد خرید، تسویه حساب دمو و پیگیری سفارش
- **سبد خرید و تسویه حساب (`#/cart`, `#/checkout`)**: پشتیبانی از کدهای تخفیف پویا از دیتابیس Supabase (نمونه‌های فعال: `AMIR-OFF` و `VIP-10`)، ارسال رایگان بالای سقف تعریف‌شده، انتخاب بازه ارسال و اعتبارسنجی فرم فارسی (کد پستی ۱۰ رقمی، شماره موبایل `09...`).
- **فاکتور رسمی و تایید سفارش (`#/order-confirmed/:code`)**: صدور شماره سفارش اختصاصی (`AMIR-XXXXX`)، شناسه پیگیری شاپرک آزمایشی، کد رجیستری همتا (IMEI)، پین تحویل امن و قابلیت چاپ فاکتور.
- **رهگیری لحظه‌ای سفارش (`#/tracking` و `#/tracking/:code`)**: مشاهده ۴ مرحله زنجیره تامین، پین تحویل و **یادداشت اختصاصی ادمین** به‌صورت زنده از دیتابیس Supabase (نمونه آماده تست: `AMIR-10492`).

### ۶. صفحات تکمیلی و ابزارهای وضعیت
- **حساب کاربری (`#/account`)**: ورود آزمایشی، تاریخچه سفارش‌ها و مدیریت علاقه‌مندی‌ها.
- **پشتیبانی و تیکت (`#/contact`)**: ثبت تیکت پشتیبانی با ذخیره در جدول `support_tickets`.
- **وضعیت زیرساخت و دیتابیس (`#/status`)**: تست زنده اتصال Supabase، اندازه‌گیری تاخیر (ms) و نمایش تعداد رکوردها.

---

## پشته فنی (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)، طراحی RTL و اعداد فارسی (`tabular-nums`)
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL + REST API + Row Level Security)
- **Hosting & CDN**: GitHub Pages (GitHub Actions) + ArvanCloud CDN

---

## اجرای محلی و تست (Local Development)

### پیش‌نیازها
- Node.js 20+
- npm

### نصب و اجرا
```bash
npm install
npm run dev
```
سایت روی آدرس `http://localhost:3000` در دسترس خواهد بود.

### تست‌های واحد و بیلد تولیدی
```bash
# اجرای تست‌های منطق فروشگاه (سبد خرید، کوپن، بیمه Amir Care+، اقساط، فیلترها)
npx --yes tsx --test src/utils/storeLogic.test.ts

# بررسی بیلد استاتیک تولیدی
npm run build
```

---

## راه‌اندازی دیتابیس Supabase (رایگان)

1. در پنل [Supabase](https://supabase.com) یک پروژه جدید بسازید.
2. وارد بخش **SQL Editor** شوید و کل محتوای فایل [`supabase/schema.sql`](supabase/schema.sql) را اجرا کنید.
   > این فایل به‌صورت **Idempotent** نوشته شده است؛ یعنی اگر قبلاً نسخه اولیه جداول را ساخته‌اید، با اجرای مجدد آن بدون از دست رفتن داده‌های قبلی، ستون‌ها و جداول جدید (کوپن‌ها، دیدگاه‌ها، تنظیمات فروشگاه و ستون‌های ادمین) اضافه می‌شوند.
3. *(اختیاری — توصیه‌شده برای پنل ادمین)*: برای واردکردن کاتالوگ اولیه محصولات داخل جدول `public.products` تا در پنل ادمین قابل ویرایش باشند، فایل [`supabase/seed_products.sql`](supabase/seed_products.sql) را نیز در SQL Editor اجرا کنید.
4. از مسیر **Project Settings → API** مقادیر زیر را کپی کنید:
   - `Project URL` (`VITE_SUPABASE_URL`)
   - `anon public key` (`VITE_SUPABASE_ANON_KEY`)

---

## اتصال به پنل ادمین جداگانه (معماری دو مخزن گیت‌هاب)

این پروژه به‌طور خاص طوری طراحی شده که **فروشگاه (این مخزن)** و **پنل ادمین (مخزن دوم گیت‌هاب در آینده)** به **یک دیتابیس واحد Supabase** متصل شوند:

| جدول | دسترسی فروشگاه (`anon`) | دسترسی پنل ادمین آینده (`authenticated` با Supabase Auth) |
|---|---|---|
| `public.products` | خواندن (`SELECT`) | دسترسی کامل (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| `public.orders` | ثبت سفارش و پیگیری با کد (`INSERT`, `SELECT`) | تغییر وضعیت (`status`: `paid` \| `preparing` \| `shipped` \| `delivered`) و ثبت `admin_note` |
| `public.coupons` | خواندن کوپن‌های فعال (`is_active = true`) | ساخت، ویرایش و غیرفعال‌سازی کدهای تخفیف (به‌صورت خودکار در سبد خرید فروشگاه اعمال می‌شوند) |
| `public.product_reviews` | نمایش نظرات تاییدشده + ثبت نظر جدید | تایید/رد (`is_approved`) یا حذف دیدگاه‌ها |
| `public.support_tickets` | ثبت تیکت جدید (`INSERT`) | مشاهده، تغییر `status` و ثبت `admin_reply` |
| `public.store_settings` | خواندن بنر اطلاع‌رسانی، سقف ارسال رایگان و تلفن پشتیبانی | ویرایش لحظه‌ای بنر بالای سایت، شماره تماس و سقف ارسال رایگان |
| `public.newsletter_subscribers` | ثبت عضویت جدید (`INSERT`) | مشاهده لیست اعضای خبرنامه (`SELECT`) |

### راهنمای سریع ساخت مخزن دوم (Admin Panel Repo)
برای اتصال پنل ادمین آینده به همین دیتابیس:
1. در داشبورد Supabase، بخش **Authentication → Users** یک حساب مدیر (Email + Password) ایجاد کنید (و در صورت نیاز ثبت‌نام عمومی را ببندید تا فقط خودتان دسترسی ورود داشته باشید).
2. در پروژه پنل ادمین، از همان `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` استفاده کرده و با `supabase.auth.signInWithPassword(...)` وارد شوید.
3. پس از ورود، تمام Policyهای `to authenticated` تعریف‌شده در [`supabase/schema.sql`](supabase/schema.sql) برای نشست شما فعال می‌شوند و تغییرات شما (مثل افزودن محصول جدید، تغییر قیمت، تغییر وضعیت سفارش، ساخت کوپن یا تغییر متن بنر بالای سایت) بلافاصله بدون نیاز به بیلد مجدد، روی همین فروشگاه نمایش داده می‌شوند.

---

## استقرار واقعی (معماری دوگانه Frontend + Backend)

این پروژه برای اجرای واقعی به شکل زیر طراحی شده است:
- **Frontend (فروشگاه استاتیک)**: روی **GitHub Pages** پشت **CDN ابرآروان** با دامنه `https://amir-mobile-store.codenameamir.ir`
- **Backend API (احراز هویت، کوکی HttpOnly و ارسال ایمیل Resend)**: روی **Render** با دامنه `https://api.codenameamir.ir`
- **Database**: **Supabase PostgreSQL** (جداول فروشگاه + جداول امن `app_users` و `auth_otp_challenges`)

---

### ۱. راه‌اندازی دیتابیس Supabase
1. در پنل [Supabase](https://supabase.com) وارد **SQL Editor** شوید و کل فایل [`supabase/schema.sql`](supabase/schema.sql) را اجرا کنید.
   > علاوه بر جداول کاتالوگ و سفارش‌ها، جداول `public.app_users` و `public.auth_otp_challenges` با RLS فعال (بدون دسترسی عمومی `anon`) ساخته می‌شوند تا اطلاعات کاربران و OTPها به‌صورت پایدار فقط از طریق سرور Express ذخیره شوند.
2. از **Project Settings → API** مقادیر زیر را بردارید:
   - `Project URL` (برای `VITE_SUPABASE_URL` و `SUPABASE_URL`)
   - `anon public key` (برای `VITE_SUPABASE_ANON_KEY`)
   - `service_role secret` (فقط برای Backend روی Render در متغیر `SUPABASE_SERVICE_ROLE_KEY`)

---

### ۲. استقرار Backend Express روی Render (`https://api.codenameamir.ir`)
فایل [`render.yaml`](render.yaml) و [`.node-version`](.node-version) (`22.23.2`) در مخزن آماده هستند:
- **Runtime**: Node.js `22.23.2`
- **Build Command**:
  ```bash
  if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
  ```
- **Start Command**:
  ```bash
  npm start
  ```
  (اجرای مستقیم `node server.ts` با Node 22)
- **Health Check Path**: `/api/health`

متغیرهای محیطی الزامی در Render (**Environment**):
| متغیر | مقدار نمونه |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22.23.2` |
| `CORS_ORIGIN` | `https://amir-mobile-store.codenameamir.ir` |
| `AUTH_SESSION_SECRET` | رشته تصادفی امن حداقل ۳۲ کاراکتر (`openssl rand -hex 32`) |
| `SUPABASE_URL` | آدرس پروژه Supabase شما |
| `SUPABASE_SERVICE_ROLE_KEY` | کلید `service_role` پروژه Supabase |
| `RESEND_API_KEY` | کلید API سرویس Resend |
| `RESEND_FROM_EMAIL` | `Amir Mobile <auth@codenameamir.ir>` (با دامنه تاییدشده در Resend) |

---

### ۳. تنظیم GitHub Actions و GitHub Pages (`https://amir-mobile-store.codenameamir.ir`)
فایل ورک‌فلو در [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) آماده است:
1. در **Settings → Secrets and variables → Actions**:
   - در تب **Secrets** مقادیر `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را ثبت کنید.
   - در تب **Variables** متغیر `VITE_API_URL` را با مقدار `https://api.codenameamir.ir` (بدون اسلش انتهایی) ثبت کنید.
   - **مهم**: هرگز `RESEND_API_KEY`، `SUPABASE_SERVICE_ROLE_KEY` یا `AUTH_SESSION_SECRET` را در گیت‌هاب یا کد فرانت‌اند قرار ندهید.
2. در **Settings → Pages** گزینه **Source** را روی **GitHub Actions** قرار دهید.

---

### ۴. تنظیمات DNS و CDN ابرآروان
- **`amir-mobile-store.codenameamir.ir` (Frontend - GitHub Pages)**:
  - رکورد `CNAME` به آدرس GitHub Pages شما (`<username>.github.io`) با ابر نارنجی (Proxy/CDN ابرآروان) و SSL روی **Full (Strict)**.
- **`api.codenameamir.ir` (Backend - Render)**:
  - در داشبورد Render بخش **Settings → Custom Domains** دامنه `api.codenameamir.ir` را اضافه کنید.
  - در پنل DNS ابرآروان رکورد `CNAME` برای `api` را به آدرس Render ارائه‌شده (مثل `<service>.onrender.com`) تنظیم کنید.
  - **توصیه مهم**: برای دامنه `api.codenameamir.ir` حالت Proxy ابرآروان را خاموش (DNS Only / ابر خاکستری) بگذارید تا گواهی SSL مستقیم Render و هدرهای `Set-Cookie` (`SameSite=None; Secure; HttpOnly`) بدون تداخل کش عمل کنند.

---

## تست‌های خودکار و کدهای نمونه
```bash
# تست منطق فروشگاه و سبد خرید
npx --yes tsx --test src/utils/storeLogic.test.ts

# تست قوانین اعتبارسنجی فرم‌های حساب کاربری
npx --yes tsx --test src/utils/authLogic.test.ts

# تست یکپارچه ثبت‌نام، OTP، ورود با رمز، بازیابی رمز، تغییر ایمیل، نشست، کوکی HTTPS و CORS
npx --yes tsx --test server/authFlow.test.ts
```

- **کدهای تخفیف فعال دمو**: `AMIR-OFF` و `VIP-10`
- **کد پیگیری سفارش نمونه**: `AMIR-10492`
- **صفحه عیب‌یابی اتصال دیتابیس**: `#/status`

