-- =============================================================================
-- Amir Mobile Store — Supabase PostgreSQL Schema Migration (V2)
-- Safe & Idempotent: Run this script in Supabase SQL Editor.
-- =============================================================================

-- 1. User Profile Avatar support on public.app_users
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Extended Product Gallery, Custom Specs, and Last Price Update Date
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_specs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill price_updated_at for existing rows
UPDATE public.products
SET price_updated_at = COALESCE(updated_at, created_at, now())
WHERE price_updated_at IS NULL;

-- 3. Order Admin Note (for invoice + tracking sync)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- 4. Unlimited Nested Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Seed default categories (idempotent)
INSERT INTO public.categories (id, slug, label, subtitle, parent_id, is_active, sort_order, seo_title, seo_description)
VALUES
  ('phones', 'phones', 'گوشی موبایل', 'اپل، سامسونگ، شیائومی، هواوی', NULL, true, 1, 'خرید گوشی موبایل اصل با رجیستری همتا | فروشگاه موبایل امیر', 'مقایسه و خرید آنلاین گوشی‌های پرچمدار اپل، سامسونگ، شیائومی و هواوی با گارانتی ۱۸ ماهه.'),
  ('flagship-phones', 'flagship-phones', 'پرچمداران عکاسی و پرو', 'آیفون پرو، اولترا و پیورا', 'phones', true, 2, 'گوشی‌های پرچمدار عکاسی | فروشگاه موبایل امیر', 'برترین گوشی‌های پرچمدار بازار با دوربین‌های حرفه‌ای و گارانتی رسمی.'),
  ('tablets', 'tablets', 'تبلت', 'آیپد و گلکسی تب', NULL, true, 3, 'خرید تبلت و آیپد اورجینال | فروشگاه موبایل امیر', 'فروش تخصصی آیپد پرو، گلکسی تب و تبلت‌های دانشجویی و طراحی.'),
  ('smartwatches', 'smartwatches', 'ساعت هوشمند', 'اپل واچ و گلکسی واچ', NULL, true, 4, 'خرید ساعت هوشمند اورجینال | فروشگاه موبایل امیر', 'جدیدترین ساعت‌های هوشمند اپل، سامسونگ و هواوی با گارانتی معتبر.'),
  ('audio', 'audio', 'هدفون و ایرپاد', 'ایرپاد و استودیویی', NULL, true, 5, 'خرید ایرپاد و هدفون بی‌سیم | فروشگاه موبایل امیر', 'انواع ایرپاد اپل، گلکسی بادز و هدفون‌های نویز کنسلینگ اصل.'),
  ('chargers', 'chargers', 'شارژر و پاوربانک', 'فست شارژ GaN اورجینال', NULL, true, 6, 'خرید شارژر اصلی و پاوربانک انکر | فروشگاه موبایل امیر', 'شارژرهای فست GaN و پاوربانک‌های پرقدرت انکر با ضمانت اصالت.'),
  ('cases', 'cases', 'قاب و محافظ صفحه', 'ضد ضربه و کاور مگ‌سیف', NULL, true, 7, 'خرید قاب گوشی و گلس مگ‌سیف | فروشگاه موبایل امیر', 'قاب‌های ضدضربه و لوازم محافظتی اورجینال برای گوشی‌های پرچمدار.'),
  ('gaming', 'gaming', 'لوازم گیمینگ', 'دسته بازی و خنک‌کننده', NULL, true, 8, 'خرید لوازم گیمینگ موبایل | فروشگاه موبایل امیر', 'دسته بازی موبایل، فن خنک‌کننده و تجهیزات حرفه‌ای گیمینگ.')
ON CONFLICT (id) DO NOTHING;

-- 5. Dynamic Brands table (supports Apple, Samsung, Xiaomi, Huawei, Honor, Anker, custom brands)
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  label_fa TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default brands including Huawei (idempotent)
INSERT INTO public.brands (id, name, label_fa, is_active, sort_order)
VALUES
  ('apple', 'Apple', 'اپل', true, 1),
  ('samsung', 'Samsung', 'سامسونگ', true, 2),
  ('xiaomi', 'Xiaomi', 'شیائومی', true, 3),
  ('huawei', 'Huawei', 'هواوی', true, 4),
  ('honor', 'Honor', 'آنر', true, 5),
  ('anker', 'Anker', 'انکر', true, 6),
  ('sony', 'Sony', 'سونی', true, 7)
ON CONFLICT (id) DO NOTHING;

-- 6. Reload PostgREST schema cache so Supabase API immediately sees new columns/tables
NOTIFY pgrst, 'reload schema';
