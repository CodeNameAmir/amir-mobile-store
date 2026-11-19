-- =============================================================================
-- Amir Mobile Store (فروشگاه موبایل امیر) — Supabase PostgreSQL Schema Migration (V4)
-- Admin Panel Stabilization, Query Performance Indexes & Dynamic Categories/Brands
-- Safe & Idempotent: Run this script in Supabase Dashboard -> SQL Editor.
-- =============================================================================

-- =============================================================================
-- 1. Performance Indexes for Admin Panel & Storefront Queries
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_brand
  ON public.products(category, brand);

CREATE INDEX IF NOT EXISTS idx_products_stock_count
  ON public.products(stock_count);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_code
  ON public.orders(order_code);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
  ON public.admin_audit_logs(action, created_at DESC);

-- =============================================================================
-- 2. Dynamic Categories Table (standardized + backward-compatible columns)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  name_fa TEXT NOT NULL DEFAULT '',
  name_en TEXT,
  title_en VARCHAR(160) NOT NULL DEFAULT '',
  description TEXT,
  description_fa TEXT,
  subtitle TEXT NOT NULL DEFAULT '',
  icon TEXT,
  icon_name VARCHAR(64) NOT NULL DEFAULT 'Folder',
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories
  ALTER COLUMN label SET DEFAULT '';

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS name_fa TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(160) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS description_fa TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS icon_name VARCHAR(64) NOT NULL DEFAULT 'Folder',
  ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.categories
SET
  slug = COALESCE(NULLIF(slug, ''), id),
  name_fa = COALESCE(NULLIF(name_fa, ''), NULLIF(label, ''), id),
  label = COALESCE(NULLIF(label, ''), NULLIF(name_fa, ''), id),
  name_en = COALESCE(NULLIF(name_en, ''), NULLIF(title_en, '')),
  title_en = COALESCE(NULLIF(title_en, ''), COALESCE(name_en, '')),
  description = COALESCE(NULLIF(description, ''), NULLIF(description_fa, ''), NULLIF(subtitle, '')),
  icon = COALESCE(NULLIF(icon, ''), NULLIF(icon_name, ''));

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

INSERT INTO public.categories (
  id, slug, label, name_fa, name_en, title_en, description, subtitle, icon, icon_name, sort_order, is_active
)
VALUES
  ('phones', 'phones', 'گوشی موبایل', 'گوشی موبایل', 'Mobile Phones', 'Mobile Phones', 'انواع گوشی‌های هوشمند پرچمدار و میان‌رده با گارانتی رسمی', 'اپل، سامسونگ، شیائومی، هواوی', 'Smartphone', 'Smartphone', 1, true),
  ('tablets', 'tablets', 'تبلت', 'تبلت', 'Tablets', 'Tablets', 'تبلت‌های حرفه‌ای آیپد و گلکسی تب', 'آیپد و گلکسی تب', 'Tablet', 'Tablet', 2, true),
  ('smartwatches', 'smartwatches', 'ساعت هوشمند', 'ساعت هوشمند', 'Smartwatches', 'Smartwatches', 'اپل واچ و ساعت‌های هوشمند ورزشی', 'اپل واچ و گلکسی واچ', 'Watch', 'Watch', 3, true),
  ('audio', 'audio', 'هدفون و ایرپاد', 'هدفون و ایرپاد', 'Audio & AirPods', 'Audio & AirPods', 'انواع ایرپاد و هدفون‌های بی‌سیم اورجینال', 'ایرپاد و استودیویی', 'Headphones', 'Headphones', 4, true),
  ('chargers', 'chargers', 'شارژر و پاوربانک', 'شارژر و پاوربانک', 'Chargers & Power Banks', 'Chargers & Power Banks', 'آداپتورهای فست شارژ GaN و پاوربانک‌های اصلی', 'فست شارژ GaN اورجینال', 'Zap', 'Zap', 5, true),
  ('cases', 'cases', 'قاب و محافظ صفحه', 'قاب و محافظ صفحه', 'Cases & Protectors', 'Cases & Protectors', 'قاب‌های ضدضربه، مگ‌سیف و گلس محافظ', 'ضد ضربه و کاور مگ‌سیف', 'Shield', 'Shield', 6, true),
  ('gaming', 'gaming', 'لوازم گیمینگ', 'لوازم گیمینگ', 'Mobile Gaming', 'Mobile Gaming', 'خنک‌کننده مغناطیسی، دسته بازی و تجهیزات گیمینگ', 'دسته بازی و خنک‌کننده', 'Gamepad2', 'Gamepad2', 7, true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. Dynamic Brands Table (standardized + backward-compatible columns)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  name_fa TEXT NOT NULL DEFAULT '',
  label_fa TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brands
  ALTER COLUMN name SET DEFAULT '';

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_fa TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label_fa TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.brands
SET
  name_en = COALESCE(NULLIF(name_en, ''), NULLIF(name, ''), id),
  name = COALESCE(NULLIF(name, ''), NULLIF(name_en, ''), id),
  name_fa = COALESCE(NULLIF(name_fa, ''), NULLIF(label_fa, ''), NULLIF(name, ''), id),
  label_fa = COALESCE(NULLIF(label_fa, ''), NULLIF(name_fa, ''), NULLIF(name, ''), id),
  slug = COALESCE(
    NULLIF(slug, ''),
    lower(regexp_replace(COALESCE(NULLIF(id, ''), NULLIF(name, ''), 'brand'), '[^a-zA-Z0-9]+', '-', 'g'))
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_slug_unique ON public.brands(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brands_sort_order ON public.brands(sort_order);

INSERT INTO public.brands (
  id, slug, name, name_en, name_fa, label_fa, sort_order, is_active, is_featured
)
VALUES
  ('Apple', 'apple', 'Apple', 'Apple', 'اپل', 'اپل', 1, true, true),
  ('Samsung', 'samsung', 'Samsung', 'Samsung', 'سامسونگ', 'سامسونگ', 2, true, true),
  ('Xiaomi', 'xiaomi', 'Xiaomi', 'Xiaomi', 'شیائومی', 'شیائومی', 3, true, true),
  ('Huawei', 'huawei', 'Huawei', 'Huawei', 'هواوی', 'هواوی', 4, true, true),
  ('Honor', 'honor', 'Honor', 'Honor', 'آنر', 'آنر', 5, true, false),
  ('Anker', 'anker', 'Anker', 'Anker', 'انکر', 'انکر', 6, true, false),
  ('Motorola', 'motorola', 'Motorola', 'Motorola', 'موتورولا', 'موتورولا', 7, true, false)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. RLS Policies for Categories & Brands (Storefront public active SELECT only;
--    All Admin writes go exclusively through Express API using SERVICE_ROLE_KEY)
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admin full access categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated admin full access brands" ON public.brands;
CREATE POLICY "Public can view active brands"
  ON public.brands FOR SELECT
  USING (is_active = true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
