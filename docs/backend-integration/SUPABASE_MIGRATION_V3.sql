-- =============================================================================
-- Amir Mobile Store (فروشگاه موبایل امیر) — Supabase PostgreSQL Schema Migration (V3)
-- Enterprise Mobile Store Architecture:
--   • RBAC Roles (auth_roles, auth_user_roles) + Admin Audit Logs
--   • Extended Categories & Brands metadata (self-contained even if V2 was skipped)
--   • Normalized Warranties (warranties)
--   • Dynamic Filterable Attributes (attribute_definitions, category_attributes, product_attribute_values)
--   • Normalized Product Images (product_images) & Product Variants (product_variants with SKU/PartNumber/SIM/Cost)
--   • Multi-Warehouse Inventory & Immutable Ledger (warehouses, warehouse_stock, stock_movements)
--   • Normalized Order Line Items (order_items) + Available Stock Views
-- Safe & Idempotent: Run this script in Supabase Dashboard -> SQL Editor.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. RBAC Roles, User-Role Mapping & Admin Audit Logs
-- =============================================================================
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.auth_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL UNIQUE,
  title_fa VARCHAR(120) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_roles
  ADD COLUMN IF NOT EXISTS title_fa VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

INSERT INTO public.auth_roles (name, title_fa, description, is_system)
VALUES
  ('customer', 'مشتری فروشگاه', 'کاربر عادی فروشگاه با دسترسی به سفارش‌ها، آدرس‌ها و علاقه‌مندی‌ها', true),
  ('admin', 'مدیر کل سیستم', 'دسترسی کامل به تمامی بخش‌های پنل مدیریت، محصولات، انبار و سفارش‌ها', true),
  ('warehouse_manager', 'مدیر انبار و موجودی', 'مدیریت انبارها، قفسه‌بندی، حواله‌های ورود و خروج کالا و موجودی تنوع‌ها', true),
  ('sales_operator', 'کارشناس فروش و سفارش‌ها', 'بررسی، پردازش، تغییر وضعیت سفارش‌ها و پاسخ‌گویی به تیکت‌ها', true),
  ('content_editor', 'ویراستار محتوا و کاتالوگ', 'مدیریت محصولات، تصاویر، دسته‌بندی‌ها، برندها و ویژگی‌های فنی', true)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.auth_user_roles (
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.auth_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_auth_user_roles_role_id ON public.auth_user_roles(role_id);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if public.admin_audit_logs was created by an earlier schema version
ALTER TABLE public.admin_audit_logs
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS entity_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);

-- =============================================================================
-- 2. Extended Categories & Brands Metadata
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(160) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description_fa TEXT,
  ADD COLUMN IF NOT EXISTS icon_name VARCHAR(64) NOT NULL DEFAULT 'Folder',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.categories SET slug = id WHERE slug IS NULL OR slug = '';

UPDATE public.categories SET title_en = 'Mobile Phones', icon_name = 'Smartphone' WHERE id = 'phones' AND title_en = '';
UPDATE public.categories SET title_en = 'Flagship & Pro Phones', icon_name = 'Camera' WHERE id = 'flagship-phones' AND title_en = '';
UPDATE public.categories SET title_en = 'Tablets', icon_name = 'Tablet' WHERE id = 'tablets' AND title_en = '';
UPDATE public.categories SET title_en = 'Smartwatches', icon_name = 'Watch' WHERE id = 'smartwatches' AND title_en = '';
UPDATE public.categories SET title_en = 'Audio & AirPods', icon_name = 'Headphones' WHERE id = 'audio' AND title_en = '';
UPDATE public.categories SET title_en = 'Chargers & Power Banks', icon_name = 'Zap' WHERE id = 'chargers' AND title_en = '';
UPDATE public.categories SET title_en = 'Cases & Protectors', icon_name = 'Shield' WHERE id = 'cases' AND title_en = '';
UPDATE public.categories SET title_en = 'Mobile Gaming', icon_name = 'Gamepad2' WHERE id = 'gaming' AND title_en = '';

CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label_fa TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS label_fa TEXT,
  ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.brands
SET slug = lower(regexp_replace(COALESCE(NULLIF(id, ''), NULLIF(name, ''), 'brand'), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_slug_unique ON public.brands(slug) WHERE slug IS NOT NULL;

UPDATE public.brands SET is_featured = true WHERE id IN ('apple', 'samsung', 'xiaomi', 'huawei');

-- =============================================================================
-- 3. Warranties Directory
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE,
  provider_name VARCHAR(160) NOT NULL UNIQUE,
  duration_months INTEGER NOT NULL DEFAULT 18 CHECK (duration_months >= 0),
  coverage_fa TEXT NOT NULL,
  terms_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warranties
  ADD COLUMN IF NOT EXISTS code VARCHAR(64),
  ADD COLUMN IF NOT EXISTS provider_name VARCHAR(160),
  ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS coverage_fa TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_warranties_code_unique ON public.warranties(code) WHERE code IS NOT NULL;

INSERT INTO public.warranties (code, provider_name, duration_months, coverage_fa, is_active)
VALUES
  ('amir-18m', '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا', 18, 'گارانتی رسمی تعمیرات و تعویض سخت‌افزار به همراه انتقال مالکیت قطعی در سامانه همتا', true),
  ('amir-12m-gold', '۱۲ ماهه طلایی امیر سرویس', 12, 'ضمانت اصالت و سلامت فیزیکی ویژه لوازم جانبی و گجت‌های پوشیدنی', true),
  ('hamahang-18m', '۱۸ ماهه هماهنگ + رجیستری رسمی', 18, 'گارانتی رسمی شرکتی هماهنگ با پوشش سراسری و رجیستری قانونی همتا', true),
  ('daria-18m', '۱۸ ماهه داریا همراه', 18, 'گارانتی رسمی داریا همراه ویژه گوشی‌های سامسونگ و شیائومی', true),
  ('tesko-18m', '۱۸ ماهه تسکو + کد همتا', 18, 'گارانتی رسمی تسکو همراه با خدمات پس از فروش تخصصی و کد فعال‌سازی همتا', true),
  ('anker-18m', '۱۸ ماهه گارانتی تعویض انکر', 18, 'ضمانت تعویض بی‌قیدوشرط آداپتورها و پاوربانک‌های اورجینال انکر', true)
ON CONFLICT (provider_name) DO NOTHING;

-- =============================================================================
-- 4. Dynamic Filterable Attributes System
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.attribute_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name_fa VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  data_type VARCHAR(24) NOT NULL DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'boolean', 'select')),
  unit VARCHAR(40),
  is_filterable BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.attribute_definitions
  ADD COLUMN IF NOT EXISTS code VARCHAR(80),
  ADD COLUMN IF NOT EXISTS name_fa VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS data_type VARCHAR(24) NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS unit VARCHAR(40),
  ADD COLUMN IF NOT EXISTS is_filterable BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.category_attributes (
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attribute_definitions(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (category_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attribute_definitions(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  UNIQUE (product_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_product_attr_values_product ON public.product_attribute_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attr_values_attr ON public.product_attribute_values(attribute_id);

INSERT INTO public.attribute_definitions (code, name_fa, name_en, data_type, unit, is_filterable, sort_order)
VALUES
  ('screen_size', 'اندازه نمایشگر', 'Screen Size', 'number', 'اینچ', true, 1),
  ('refresh_rate', 'نرخ نوسازی تصویر', 'Refresh Rate', 'number', 'هرتز', true, 2),
  ('chipset', 'تراشه پردازنده', 'Chipset', 'text', NULL, true, 3),
  ('main_camera_mp', 'دوربین اصلی', 'Main Camera', 'number', 'مگاپیکسل', true, 4),
  ('battery_mah', 'ظرفیت باتری', 'Battery Capacity', 'number', 'میلی‌آمپر', true, 5),
  ('fast_charge_w', 'حداکثر توان شارژ', 'Fast Charging', 'number', 'وات', true, 6),
  ('network_5g', 'پشتیبانی شبکه 5G', '5G Support', 'boolean', NULL, true, 7),
  ('sim_type', 'نوع سیم‌کارت', 'SIM Type', 'text', NULL, true, 8),
  ('os', 'سیستم‌عامل', 'Operating System', 'text', NULL, true, 9),
  ('water_resistance', 'استاندارد مقاومت در برابر آب', 'Water Resistance', 'text', NULL, false, 10)
ON CONFLICT (code) DO NOTHING;

-- Bind core smartphone attributes to 'phones' and 'flagship-phones' categories
INSERT INTO public.category_attributes (category_id, attribute_id, is_required)
SELECT c.id, a.id, (a.code IN ('screen_size', 'chipset', 'battery_mah'))
FROM public.categories c
CROSS JOIN public.attribute_definitions a
WHERE c.id IN ('phones', 'flagship-phones')
ON CONFLICT (category_id, attribute_id) DO NOTHING;

-- =============================================================================
-- 5. Enhanced Products, Normalized Product Images & Product Variants
-- =============================================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS model_name VARCHAR(180),
  ADD COLUMN IF NOT EXISTS description_fa TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS warranty_id UUID REFERENCES public.warranties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.products
SET model_name = COALESCE(NULLIF(model_name, ''), name_en, name_fa)
WHERE model_name IS NULL OR model_name = '';

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL AND (lower(p.category) = lower(c.id) OR lower(p.category) = lower(c.slug));

UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE p.brand_id IS NULL AND (lower(p.brand) = lower(b.name) OR lower(p.brand) = lower(b.id));

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text_fa VARCHAR(240),
  is_cover BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS alt_text_fa VARCHAR(240),
  ADD COLUMN IF NOT EXISTS is_cover BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, sort_order);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warranty_id UUID REFERENCES public.warranties(id) ON DELETE SET NULL,
  sku VARCHAR(96) NOT NULL UNIQUE,
  barcode VARCHAR(96),
  part_number VARCHAR(64) DEFAULT NULL,
  color_name_fa VARCHAR(100) NOT NULL,
  color_name_en VARCHAR(100) DEFAULT '',
  color_hex VARCHAR(24) NOT NULL DEFAULT '#1e293b',
  storage VARCHAR(64),
  ram VARCHAR(48),
  sim_type VARCHAR(80) DEFAULT 'Dual SIM (Physical)',
  price_toman BIGINT NOT NULL CHECK (price_toman > 0),
  original_price_toman BIGINT,
  cost_price_toman BIGINT DEFAULT 0 CHECK (cost_price_toman IS NULL OR cost_price_toman >= 0),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS warranty_id UUID REFERENCES public.warranties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS barcode VARCHAR(96),
  ADD COLUMN IF NOT EXISTS part_number VARCHAR(64),
  ADD COLUMN IF NOT EXISTS color_name_en VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS color_hex VARCHAR(24) NOT NULL DEFAULT '#1e293b',
  ADD COLUMN IF NOT EXISTS storage VARCHAR(64),
  ADD COLUMN IF NOT EXISTS ram VARCHAR(48),
  ADD COLUMN IF NOT EXISTS sim_type VARCHAR(80) DEFAULT 'Dual SIM (Physical)',
  ADD COLUMN IF NOT EXISTS original_price_toman BIGINT,
  ADD COLUMN IF NOT EXISTS cost_price_toman BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- =============================================================================
-- 6. Multi-Warehouse Inventory & Immutable Stock Movements Ledger
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(48) NOT NULL UNIQUE,
  name_fa VARCHAR(140) NOT NULL,
  city VARCHAR(80) NOT NULL DEFAULT 'تهران',
  address_fa TEXT,
  address TEXT NOT NULL DEFAULT '',
  postal_code VARCHAR(20),
  phone VARCHAR(32),
  manager_name VARCHAR(120),
  is_central BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS city VARCHAR(80) NOT NULL DEFAULT 'تهران',
  ADD COLUMN IF NOT EXISTS address_fa TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(32),
  ADD COLUMN IF NOT EXISTS manager_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS is_central BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

INSERT INTO public.warehouses (code, name_fa, city, address_fa, address, postal_code, phone, manager_name, is_central, is_active)
VALUES
  ('WH-THR-CENTRAL', 'انبار مرکزی تهران (پاساژ علاءالدین / چارسو)', 'تهران', 'تهران، تقاطع خیابان جمهوری و حافظ، مرکز پردازش و انبار مرکزی امیر موبایل', 'تهران، تقاطع خیابان جمهوری و حافظ، مرکز پردازش و انبار مرکزی امیر موبایل', '1135714111', '021-88889999', 'مهندس امیرحسین کریمی', true, true),
  ('WH-ISF-HUB', 'هاب توزیع و انبار اصفهان', 'اصفهان', 'اصفهان، خیابان چهارباغ بالا، مجتمع تجاری پارسیان، انبار منطقه‌ای ۲', 'اصفهان، خیابان چهارباغ بالا، مجتمع تجاری پارسیان، انبار منطقه‌ای ۲', '8163614521', '031-36661122', 'سعید مرادی', false, true)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  shelf_location VARCHAR(64) NOT NULL DEFAULT 'UNASSIGNED',
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reserved_qty INTEGER NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  min_stock_alert INTEGER NOT NULL DEFAULT 5 CHECK (min_stock_alert >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, variant_id)
);

ALTER TABLE public.warehouse_stock
  ADD COLUMN IF NOT EXISTS shelf_location VARCHAR(64) NOT NULL DEFAULT 'UNASSIGNED',
  ADD COLUMN IF NOT EXISTS quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reserved_qty INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock_alert INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_warehouse_stock_variant ON public.warehouse_stock(variant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_warehouse ON public.warehouse_stock(warehouse_id);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity_change INTEGER NOT NULL CHECK (quantity_change <> 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  movement_type VARCHAR(40) NOT NULL CHECK (
    movement_type IN (
      'opening_balance',
      'purchase_inflow',
      'order_sale',
      'customer_return',
      'transfer_out',
      'transfer_in',
      'inventory_adjustment'
    )
  ),
  shelf_location VARCHAR(64) DEFAULT NULL,
  reference_type VARCHAR(48) DEFAULT NULL,
  reference_id TEXT DEFAULT NULL,
  created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  note_fa TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  idempotency_key VARCHAR(160) UNIQUE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS balance_after INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shelf_location VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reference_type VARCHAR(48),
  ADD COLUMN IF NOT EXISTS reference_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS note_fa TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(160),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_idempotency_key
  ON public.stock_movements(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_created ON public.stock_movements(variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_created ON public.stock_movements(warehouse_id, created_at DESC);

-- =============================================================================
-- 7. Normalized Order Line Items (links Orders to exact SKU / Variant / Cost / IMEI)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  sku VARCHAR(96),
  part_number VARCHAR(64),
  product_title_fa TEXT NOT NULL,
  color_name_fa VARCHAR(100),
  storage VARCHAR(64),
  warranty_title TEXT,
  warranty_name TEXT,
  unit_price_toman BIGINT NOT NULL CHECK (unit_price_toman >= 0),
  original_unit_price_toman BIGINT,
  original_price_toman BIGINT,
  line_total_toman BIGINT NOT NULL DEFAULT 0,
  cost_price_toman BIGINT NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  assigned_imei VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sku VARCHAR(96),
  ADD COLUMN IF NOT EXISTS part_number VARCHAR(64),
  ADD COLUMN IF NOT EXISTS color_name_fa VARCHAR(100),
  ADD COLUMN IF NOT EXISTS storage VARCHAR(64),
  ADD COLUMN IF NOT EXISTS warranty_title TEXT,
  ADD COLUMN IF NOT EXISTS warranty_name TEXT,
  ADD COLUMN IF NOT EXISTS original_unit_price_toman BIGINT,
  ADD COLUMN IF NOT EXISTS original_price_toman BIGINT,
  ADD COLUMN IF NOT EXISTS line_total_toman BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_price_toman BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assigned_imei VARCHAR(32),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);

-- =============================================================================
-- 8. Aggregated Availability Views
-- =============================================================================
CREATE OR REPLACE VIEW public.v_variant_available_stock AS
SELECT
  pv.id AS variant_id,
  pv.product_id,
  pv.sku,
  COALESCE(SUM(ws.quantity_on_hand), 0)::INTEGER AS total_on_hand,
  COALESCE(SUM(ws.reserved_qty), 0)::INTEGER AS total_reserved,
  GREATEST(0, COALESCE(SUM(ws.quantity_on_hand - ws.reserved_qty), 0))::INTEGER AS available_qty,
  BOOL_OR(ws.quantity_on_hand <= ws.min_stock_alert) AS is_low_stock
FROM public.product_variants pv
LEFT JOIN public.warehouse_stock ws ON ws.variant_id = pv.id
GROUP BY pv.id, pv.product_id, pv.sku;

-- =============================================================================
-- 9. Row Level Security (RLS) Policies
-- =============================================================================
ALTER TABLE public.auth_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public read-only policies for storefront catalog metadata (no cost prices or warehouse internal tables)
DROP POLICY IF EXISTS "Public can view active warranties" ON public.warranties;
CREATE POLICY "Public can view active warranties"
  ON public.warranties FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view attribute definitions" ON public.attribute_definitions;
CREATE POLICY "Public can view attribute definitions"
  ON public.attribute_definitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view category attributes" ON public.category_attributes;
CREATE POLICY "Public can view category attributes"
  ON public.category_attributes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view product attribute values" ON public.product_attribute_values;
CREATE POLICY "Public can view product attribute values"
  ON public.product_attribute_values FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

-- Note: product_variants, warehouses, warehouse_stock, stock_movements, auth_roles,
-- auth_user_roles, admin_audit_logs, and order_items are intentionally locked down
-- from anonymous client queries (accessed through Backend Express API with service role
-- so cost_price_toman, shelf_location, created_by, and audit logs never leak to anon clients).

-- Reload PostgREST schema cache so Supabase API immediately sees all V3 tables/columns
NOTIFY pgrst, 'reload schema';
