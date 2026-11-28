-- ============================================================================
-- Amir Mobile Store (فروشگاه موبایل امیر) — Complete Storefront + Admin Schema
-- Safe to run multiple times (idempotent) in Supabase Dashboard -> SQL Editor.
-- Designed for two separate GitHub repositories sharing one Supabase project:
--   1) Storefront Repo (GitHub Pages + ArvanCloud CDN)
--   2) Future Admin Panel Repo (Supabase Auth + Full CRUD)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Products Catalog Table
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name_fa text not null,
  name_en text not null,
  brand text not null,
  category text not null,
  price bigint not null,
  original_price bigint,
  discount_percent integer default 0,
  in_stock boolean default true,
  stock_count integer default 10,
  express_delivery boolean default true,
  warranty text not null default '۱۸ ماهه امیر سرویس + کد رجیستری همتا',
  rating numeric(2,1) default 4.8,
  review_count integer default 0,
  specs jsonb default '{}'::jsonb,
  storage_options jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists color_label text default 'مشکی';
alter table public.products add column if not exists badge_text text;
alter table public.products add column if not exists recommend_percent integer default 95;
alter table public.products add column if not exists is_featured_deal boolean default false;
alter table public.products add column if not exists is_popular boolean default false;
alter table public.products add column if not exists sales_rank integer default 100;
alter table public.products add column if not exists release_order integer default 100;
alter table public.products add column if not exists updated_at timestamptz default now();

-- 2. Orders Table (Shared by Storefront Checkout/Tracking & Future Admin Panel)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  postal_code text not null,
  coupon_code text,
  subtotal bigint not null,
  discount_total bigint default 0,
  product_discount bigint default 0,
  coupon_discount bigint default 0,
  shipping_cost bigint default 0,
  total_amount bigint not null,
  status text not null default 'preparing',
  delivery_pin text not null,
  imei_sample text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

alter table public.orders add column if not exists city text default 'تهران';
alter table public.orders add column if not exists delivery_slot text default 'express';
alter table public.orders add column if not exists shaparak_ref text;
alter table public.orders add column if not exists admin_note text;
alter table public.orders add column if not exists product_discount bigint default 0;
alter table public.orders add column if not exists coupon_discount bigint default 0;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists updated_at timestamptz default now();

-- 3. Support Tickets Table
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null,
  full_name text not null,
  phone text not null,
  department text not null,
  order_code text,
  message text not null,
  created_at timestamptz default now()
);

alter table public.support_tickets add column if not exists status text default 'open';
alter table public.support_tickets add column if not exists admin_reply text;
alter table public.support_tickets add column if not exists updated_at timestamptz default now();

-- 4. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  contact text unique not null,
  created_at timestamptz default now()
);

-- 5. Dynamic Coupons Table (Manageable from Future Admin Panel)
create table if not exists public.coupons (
  code text primary key,
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value bigint not null,
  max_discount bigint,
  min_order_amount bigint default 0,
  is_active boolean default true,
  description_fa text,
  created_at timestamptz default now()
);

insert into public.coupons (code, discount_type, discount_value, max_discount, min_order_amount, is_active, description_fa)
values
  ('AMIR-OFF', 'fixed', 500000, 500000, 0, true, 'کد تخفیف خوش‌آمدگویی ۵۰۰ هزار تومانی'),
  ('VIP-10', 'percent', 10, 2000000, 1000000, true, 'تخفیف ۱۰ درصدی ویژه تا سقف ۲ میلیون تومان')
on conflict (code) do nothing;

-- 6. Product Reviews Table (Submitted on PDP, Moderated in Admin Panel)
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified boolean default false,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- 7. Storefront Global Settings (Configurable from Future Admin Panel)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into public.store_settings (key, value)
values
  ('announcement_text', '"ارسال رایگان برای خریدهای بالای ۱ میلیون تومان به سراسر ایران"'::jsonb),
  ('free_shipping_threshold', '1000000'::jsonb),
  ('support_phone', '"۰۲۱-۸۸۸۸۹۹۹۹"'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
-- Row Level Security (RLS)
-- All database mutations & sensitive reads go exclusively through the Express
-- Backend API using SUPABASE_SERVICE_ROLE_KEY. Default-deny anon access on
-- orders, support_tickets, newsletter_subscribers, and product_reviews.
-- ============================================================================
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.support_tickets enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.coupons enable row level security;
alter table public.product_reviews enable row level security;
alter table public.store_settings enable row level security;

-- Public Catalog Metadata Policies (read-only)
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

-- Default-deny anon access on sensitive/user-submitted tables (Backend service_role only)
drop policy if exists "Anyone can create demo orders" on public.orders;
drop policy if exists "Anyone can view orders by code" on public.orders;
drop policy if exists "Anyone can create support tickets" on public.support_tickets;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Public can view approved reviews" on public.product_reviews;
drop policy if exists "Anyone can submit product review" on public.product_reviews;

revoke all on table
  public.orders,
  public.support_tickets,
  public.newsletter_subscribers,
  public.product_reviews
from anon;

drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons"
  on public.coupons for select
  using (is_active = true);

drop policy if exists "Public can view store settings" on public.store_settings;
create policy "Public can view store settings"
  on public.store_settings for select
  using (true);

-- Authenticated Admin Panel Policies (for your future separate Admin Repo using Supabase Auth)
drop policy if exists "Authenticated admin full access products" on public.products;
create policy "Authenticated admin full access products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin update orders" on public.orders;
create policy "Authenticated admin update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin full access tickets" on public.support_tickets;
create policy "Authenticated admin full access tickets"
  on public.support_tickets for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin full access coupons" on public.coupons;
create policy "Authenticated admin full access coupons"
  on public.coupons for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin full access reviews" on public.product_reviews;
create policy "Authenticated admin full access reviews"
  on public.product_reviews for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin full access settings" on public.store_settings;
create policy "Authenticated admin full access settings"
  on public.store_settings for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin view newsletter" on public.newsletter_subscribers;
create policy "Authenticated admin view newsletter"
  on public.newsletter_subscribers for select
  to authenticated
  using (true);

-- ============================================================================
-- 8. Storefront Customer Accounts & Auth OTP Challenges (Backend Service Role)
-- Accessed exclusively by the Express API server using SUPABASE_SERVICE_ROLE_KEY.
-- RLS is enabled with NO public anon policies so password hashes and OTPs
-- are never exposed to client-side anon queries.
-- ============================================================================
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  phone text default '',
  national_id text,
  birth_date text,
  newsletter_opt_in boolean default true,
  email_verified boolean default true,
  two_factor_enabled boolean default false,
  password_hash text,
  addresses jsonb default '[]'::jsonb,
  wishlist jsonb default '[]'::jsonb,
  active_session_ids jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  last_login_at timestamptz default now()
);

alter table public.app_users
  add column if not exists two_factor_enabled boolean default false;
alter table public.app_users
  add column if not exists wishlist jsonb default '[]'::jsonb;

alter table public.orders
  add column if not exists user_id uuid references public.app_users(id) on delete set null;
create index if not exists idx_orders_user_id on public.orders (user_id);

create index if not exists idx_app_users_email on public.app_users (email);

create table if not exists public.auth_otp_challenges (
  challenge_key text primary key,
  id uuid not null,
  email text not null,
  purpose text not null check (purpose in ('signup', 'login', 'login-2fa', 'reset-password', 'change-email')),
  code_hash text not null,
  expires_at timestamptz not null,
  resend_available_at timestamptz not null,
  attempts integer default 0,
  pending_user_id uuid,
  pending_signup jsonb,
  created_at timestamptz default now()
);

alter table public.auth_otp_challenges
  drop constraint if exists auth_otp_challenges_purpose_check;
alter table public.auth_otp_challenges
  add constraint auth_otp_challenges_purpose_check
  check (purpose in ('signup', 'login', 'login-2fa', 'reset-password', 'change-email'));

create index if not exists idx_auth_otp_expires_at on public.auth_otp_challenges (expires_at);

alter table public.app_users enable row level security;
alter table public.auth_otp_challenges enable row level security;

-- 9. Extended Profile Avatar, Unlimited Nested Categories & Custom Brands
alter table public.app_users
  add column if not exists avatar_url text;

create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  label text not null,
  subtitle text default '',
  parent_id text references public.categories(id) on delete set null,
  is_active boolean default true,
  image text default '',
  seo_title text default '',
  seo_description text default '',
  sort_order integer default 100,
  created_at timestamptz default now()
);

create table if not exists public.brands (
  id text primary key,
  name text unique not null,
  label_fa text default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.brands enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
  on public.categories for select
  using (is_active = true);

drop policy if exists "Authenticated admin full access categories" on public.categories;
create policy "Authenticated admin full access categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can view active brands" on public.brands;
create policy "Public can view active brands"
  on public.brands for select
  using (is_active = true);

drop policy if exists "Authenticated admin full access brands" on public.brands;
create policy "Authenticated admin full access brands"
  on public.brands for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- 10. V3 Enterprise Mobile Store Extensions
--     RBAC Roles, Audit Logs, Warranties, Dynamic Attributes, Product Images,
--     Product Variants (SKU/PartNumber/SIM/Cost), Warehouses, Stock & Ledger
-- ============================================================================
alter table public.app_users
  add column if not exists role text not null default 'customer',
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.auth_roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(64) not null unique,
  title_fa varchar(120) not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.auth_roles
  add column if not exists title_fa varchar(120) not null default '',
  add column if not exists description text,
  add column if not exists is_system boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

insert into public.auth_roles (name, title_fa, description, is_system)
values
  ('customer', 'مشتری فروشگاه', 'کاربر عادی فروشگاه با دسترسی به سفارش‌ها، آدرس‌ها و علاقه‌مندی‌ها', true),
  ('admin', 'مدیر کل سیستم', 'دسترسی کامل به تمامی بخش‌های پنل مدیریت، محصولات، انبار و سفارش‌ها', true),
  ('warehouse_manager', 'مدیر انبار و موجودی', 'مدیریت انبارها، قفسه‌بندی، حواله‌های ورود و خروج کالا و موجودی تنوع‌ها', true),
  ('sales_operator', 'کارشناس فروش و سفارش‌ها', 'بررسی، پردازش، تغییر وضعیت سفارش‌ها و پاسخ‌گویی به تیکت‌ها', true),
  ('content_editor', 'ویراستار محتوا و کاتالوگ', 'مدیریت محصولات، تصاویر، دسته‌بندی‌ها، برندها و ویژگی‌های فنی', true)
on conflict (name) do nothing;

create table if not exists public.auth_user_roles (
  user_id uuid not null references public.app_users(id) on delete cascade,
  role_id uuid not null references public.auth_roles(id) on delete cascade,
  assigned_by uuid references public.app_users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.app_users(id) on delete set null,
  admin_email text not null default '',
  action text not null,
  entity_type text not null default '',
  entity_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs
  add column if not exists admin_user_id uuid references public.app_users(id) on delete set null,
  add column if not exists admin_email text not null default '',
  add column if not exists entity_type text not null default '',
  add column if not exists entity_id text not null default '',
  add column if not exists details jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);
create index if not exists idx_admin_audit_logs_entity on public.admin_audit_logs(entity_type, entity_id);

alter table public.categories
  add column if not exists title_en varchar(160) not null default '',
  add column if not exists description_fa text,
  add column if not exists icon_name varchar(64) not null default 'Folder',
  add column if not exists updated_at timestamptz not null default now();

alter table public.brands
  add column if not exists slug varchar(120),
  add column if not exists logo_url text,
  add column if not exists website_url text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 100,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  code varchar(64) unique,
  provider_name varchar(160) not null unique,
  duration_months integer not null default 18 check (duration_months >= 0),
  coverage_fa text not null,
  terms_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.warranties
  add column if not exists code varchar(64),
  add column if not exists provider_name varchar(160),
  add column if not exists duration_months integer not null default 18,
  add column if not exists coverage_fa text not null default '',
  add column if not exists terms_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

insert into public.warranties (code, provider_name, duration_months, coverage_fa, is_active)
values
  ('amir-18m', '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا', 18, 'گارانتی رسمی تعمیرات و تعویض سخت‌افزار به همراه انتقال مالکیت قطعی در سامانه همتا', true),
  ('amir-12m-gold', '۱۲ ماهه طلایی امیر سرویس', 12, 'ضمانت اصالت و سلامت فیزیکی ویژه لوازم جانبی و گجت‌های پوشیدنی', true),
  ('hamahang-18m', '۱۸ ماهه هماهنگ + رجیستری رسمی', 18, 'گارانتی رسمی شرکتی هماهنگ با پوشش سراسری و رجیستری قانونی همتا', true),
  ('daria-18m', '۱۸ ماهه داریا همراه', 18, 'گارانتی رسمی داریا همراه ویژه گوشی‌های سامسونگ و شیائومی', true),
  ('tesko-18m', '۱۸ ماهه تسکو + کد همتا', 18, 'گارانتی رسمی تسکو همراه با خدمات پس از فروش تخصصی و کد فعال‌سازی همتا', true),
  ('anker-18m', '۱۸ ماهه گارانتی تعویض انکر', 18, 'ضمانت تعویض بی‌قیدوشرط آداپتورها و پاوربانک‌های اورجینال انکر', true)
on conflict (provider_name) do nothing;

create table if not exists public.attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  name_fa varchar(120) not null,
  name_en varchar(120) not null,
  data_type varchar(24) not null default 'text' check (data_type in ('text', 'number', 'boolean', 'select')),
  unit varchar(40),
  is_filterable boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.category_attributes (
  category_id text not null references public.categories(id) on delete cascade,
  attribute_id uuid not null references public.attribute_definitions(id) on delete cascade,
  is_required boolean not null default false,
  primary key (category_id, attribute_id)
);

create table if not exists public.product_attribute_values (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  attribute_id uuid not null references public.attribute_definitions(id) on delete cascade,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  unique (product_id, attribute_id)
);

alter table public.products
  add column if not exists model_name varchar(180),
  add column if not exists description_fa text,
  add column if not exists is_published boolean not null default true,
  add column if not exists is_featured boolean not null default false,
  add column if not exists warranty_id uuid references public.warranties(id) on delete set null,
  add column if not exists brand_id text references public.brands(id) on delete set null,
  add column if not exists category_id text references public.categories(id) on delete set null,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists custom_specs jsonb not null default '[]'::jsonb,
  add column if not exists price_updated_at timestamptz not null default now();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text_fa varchar(240),
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  warranty_id uuid references public.warranties(id) on delete set null,
  sku varchar(96) not null unique,
  barcode varchar(96),
  part_number varchar(64) default null,
  color_name_fa varchar(100) not null,
  color_name_en varchar(100) default '',
  color_hex varchar(24) not null default '#1e293b',
  storage varchar(64),
  ram varchar(48),
  sim_type varchar(80) default 'Dual SIM (Physical)',
  price_toman bigint not null check (price_toman > 0),
  original_price_toman bigint,
  cost_price_toman bigint default 0 check (cost_price_toman is null or cost_price_toman >= 0),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code varchar(48) not null unique,
  name_fa varchar(140) not null,
  city varchar(80) not null default 'تهران',
  address_fa text,
  address text not null default '',
  postal_code varchar(20),
  phone varchar(32),
  manager_name varchar(120),
  is_central boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.warehouses
  add column if not exists city varchar(80) not null default 'تهران',
  add column if not exists address_fa text,
  add column if not exists address text not null default '',
  add column if not exists postal_code varchar(20),
  add column if not exists phone varchar(32),
  add column if not exists manager_name varchar(120),
  add column if not exists is_central boolean not null default false,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.warehouse_stock (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  shelf_location varchar(64) not null default 'UNASSIGNED',
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  reserved_qty integer not null default 0 check (reserved_qty >= 0),
  min_stock_alert integer not null default 5 check (min_stock_alert >= 0),
  updated_at timestamptz not null default now(),
  unique (warehouse_id, variant_id)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity_change integer not null check (quantity_change <> 0),
  balance_after integer not null check (balance_after >= 0),
  movement_type varchar(40) not null check (
    movement_type in (
      'opening_balance',
      'purchase_inflow',
      'order_sale',
      'customer_return',
      'transfer_out',
      'transfer_in',
      'inventory_adjustment'
    )
  ),
  shelf_location varchar(64) default null,
  reference_type varchar(48) default null,
  reference_id text default null,
  created_by uuid references public.app_users(id) on delete set null,
  operator_id uuid references public.app_users(id) on delete set null,
  note_fa text default null,
  notes text default null,
  idempotency_key varchar(160) unique default null,
  created_at timestamptz not null default now()
);

alter table public.stock_movements
  add column if not exists balance_after integer not null default 0,
  add column if not exists shelf_location varchar(64),
  add column if not exists reference_type varchar(48),
  add column if not exists reference_id text,
  add column if not exists created_by uuid references public.app_users(id) on delete set null,
  add column if not exists operator_id uuid references public.app_users(id) on delete set null,
  add column if not exists note_fa text,
  add column if not exists notes text,
  add column if not exists idempotency_key varchar(160),
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  sku varchar(96),
  part_number varchar(64),
  product_title_fa text not null,
  color_name_fa varchar(100),
  storage varchar(64),
  warranty_title text,
  warranty_name text,
  unit_price_toman bigint not null check (unit_price_toman >= 0),
  original_unit_price_toman bigint,
  original_price_toman bigint,
  line_total_toman bigint not null default 0,
  cost_price_toman bigint not null default 0,
  quantity integer not null check (quantity > 0),
  assigned_imei varchar(32),
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists sku varchar(96),
  add column if not exists part_number varchar(64),
  add column if not exists color_name_fa varchar(100),
  add column if not exists storage varchar(64),
  add column if not exists warranty_title text,
  add column if not exists warranty_name text,
  add column if not exists original_unit_price_toman bigint,
  add column if not exists original_price_toman bigint,
  add column if not exists line_total_toman bigint not null default 0,
  add column if not exists cost_price_toman bigint not null default 0,
  add column if not exists assigned_imei varchar(32),
  add column if not exists created_at timestamptz not null default now();

create or replace view public.v_variant_available_stock as
select
  pv.id as variant_id,
  pv.product_id,
  pv.sku,
  coalesce(sum(ws.quantity_on_hand), 0)::integer as total_on_hand,
  coalesce(sum(ws.reserved_qty), 0)::integer as total_reserved,
  greatest(0, coalesce(sum(ws.quantity_on_hand - ws.reserved_qty), 0))::integer as available_qty,
  bool_or(ws.quantity_on_hand <= ws.min_stock_alert) as is_low_stock
from public.product_variants pv
left join public.warehouse_stock ws on ws.variant_id = pv.id
group by pv.id, pv.product_id, pv.sku;

alter table public.auth_roles enable row level security;
alter table public.auth_user_roles enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.warranties enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.category_attributes enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.warehouses enable row level security;
alter table public.warehouse_stock enable row level security;
alter table public.stock_movements enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active warranties" on public.warranties;
create policy "Public can view active warranties" on public.warranties for select using (is_active = true);

drop policy if exists "Public can view attribute definitions" on public.attribute_definitions;
create policy "Public can view attribute definitions" on public.attribute_definitions for select using (true);

drop policy if exists "Public can view category attributes" on public.category_attributes;
create policy "Public can view category attributes" on public.category_attributes for select using (true);

drop policy if exists "Public can view product attribute values" on public.product_attribute_values;
create policy "Public can view product attribute values" on public.product_attribute_values for select using (true);

drop policy if exists "Public can view product images" on public.product_images;
create policy "Public can view product images" on public.product_images for select using (true);

-- 11. Unique Usernames & Review Attribution
alter table public.app_users
  add column if not exists username text;

create unique index if not exists idx_app_users_username_lower
  on public.app_users (lower(username))
  where username is not null;

alter table public.product_reviews
  add column if not exists author_username text;

alter table public.product_reviews
  alter column verified set default false;

alter table public.product_reviews
  alter column is_approved set default false;

-- 12. Persistent Server-Side User Cart Items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  item_key text not null,
  product_id text not null,
  variant_id text,
  sku text,
  color text not null default '',
  color_hex text default '#1e293b',
  storage text not null default '',
  warranty text not null default '',
  quantity integer not null check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_cart_items_user_item_key
  on public.cart_items (user_id, item_key);
create index if not exists idx_cart_items_user_id
  on public.cart_items (user_id);

alter table public.cart_items enable row level security;
revoke all on table public.cart_items from anon;

-- 13. Phase 3: Editorial Review, Support Ticket User Link, Stock Alerts, Notifications & Product Q&A
alter table public.products
  add column if not exists editorial_review text;

alter table public.support_tickets
  add column if not exists user_id uuid references public.app_users(id) on delete set null;

create index if not exists idx_support_tickets_user_id
  on public.support_tickets (user_id);

create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  email text not null,
  product_id text not null,
  variant_id uuid,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_alerts_product_pending
  on public.stock_alerts (product_id)
  where notified_at is null;
create index if not exists idx_stock_alerts_user_id
  on public.stock_alerts (user_id);

alter table public.stock_alerts enable row level security;
revoke all on table public.stock_alerts from anon;

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifications_user_created
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;
revoke all on table public.user_notifications from anon;

create table if not exists public.product_questions (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid references public.app_users(id) on delete set null,
  author_name text not null,
  question text not null,
  answer text,
  answered_at timestamptz,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_questions_product_created
  on public.product_questions (product_id, created_at desc);

alter table public.product_questions enable row level security;
revoke all on table public.product_questions from anon;

-- 14. Phase 4: Blog Module (blog_posts)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_image text not null default '',
  category text not null default 'راهنمای خرید',
  tags text[] not null default '{}',
  author_name text not null default 'تحریریه موبایل امیر',
  reading_time_minutes integer not null default 5,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);
create index if not exists idx_blog_posts_published_at
  on public.blog_posts (is_published, published_at desc);
create index if not exists idx_blog_posts_category
  on public.blog_posts (category);

alter table public.blog_posts enable row level security;
revoke all on table public.blog_posts from anon;

insert into public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  cover_image,
  category,
  tags,
  author_name,
  reading_time_minutes,
  is_published,
  published_at
)
values
(
  'iphone-16-pro-max-vs-s24-ultra-camera',
  'مقایسه دوربین پرچمداران: آیفون ۱۶ پرو مکس در برابر گلکسی S24 اولترا',
  'کدام گوشی در شب عکس‌های طبیعی‌تری ثبت می‌کند؟ بررسی دقیق سنسورهای پریسکوپی، داینامیک رنج و قدرت پردازش هوش مصنوعی.',
  E'انتخاب بین دو غول دنیای عکاسی موبایل یعنی آیفون ۱۶ پرو مکس و گلکسی S24 اولترا، بیش از هر زمان دیگری به سبک عکاسی و نیاز فیلم‌برداری شما وابسته است. در آزمایش‌های میدانی تحریریه موبایل امیر، هر دو دستگاه را در شرایط نوری سخت، عکاسی پرتره و زوم اپتیکال ۵ برابری زیر ذره‌بین قرار دادیم.\n\n## عملکرد در نور روز و بازتولید رنگ\nاپل با نسل جدید پردازش تصویر Photonic Engine و پروفایل‌های رنگی جدید، جزئیات سایه‌ها را بدون اغراق در کنتراست حفظ می‌کند و رنگ پوست را بسیار نزدیک به واقعیت ثبت می‌کند. در مقابل، گلکسی S24 اولترا با سنسور ۲۰۰ مگاپیکسلی اصلی خود، وضوح لبه‌ها و شفافیت بافت‌ها را در ثبت مناظر شهری و معماری به اوج می‌رساند.\n\n## عکاسی در شب و زوم تله‌فوتو\nهر دو گوشی به لنز تله‌فوتو پریسکوپی ۵ برابر مجهز هستند. در محیط‌های کم‌نور، آیفون به دلیل گشودگی دیافراگم مناسب‌تر و زمان نوردهی هوشمند، نویز کمتری ایجاد می‌کند؛ اما سامسونگ با قابلیت زوم ۱۰ و ۱۰۰ برابری دیجیتال مبتنی بر هوش مصنوعی، در فواصل بسیار دور دست بالا را دارد.\n\n## فیلم‌برداری و جمع‌بندی خرید\nاگر تولید محتوای ویدیویی، پشتیبانی از فرمت ProRes 4K با نرخ ۱۲۰ فریم بر ثانیه و کلید اختصاصی Camera Control برایتان اولویت دارد، آیفون ۱۶ پرو مکس انتخاب بی‌رقیب است. اما برای کاربرانی که نمایشگر ضدبازتاب، قلم S-Pen و زوم برد بلند می‌خواهند، گلکسی S24 اولترا ارزش خرید فوق‌العاده‌ای دارد.',
  'asset:iphoneCamera',
  'مقایسه تخصصی',
  array['آیفون ۱۶ پرو مکس', 'گلکسی S24 اولترا', 'مقایسه دوربین'],
  'امیرحسین مرادی',
  7,
  true,
  now() - interval '2 days'
),
(
  'fast-charging-gan-cable-buying-guide',
  'راهنمای جامع خرید آداپتور و کابل فست شارژ؛ تشخیص شارژر اصلی از تقلبی',
  'معرفی استانداردهای PD و PPS و نحوه تشخیص شارژرهای تقلبی که سلامت باتری گوشی گران‌قیمت شما را به خطر می‌اندازند.',
  E'بسیاری از کاربران پس از خرید گوشی‌های پرچمدار، برای تهیه آداپتور شارژ سریع با نمونه‌های غیر‌اصلی و مشابه روبه‌رو می‌شوند که نه‌تنها سرعت واقعی شارژ را ارائه نمی‌دهند، بلکه در درازمدت به مدار تغذیه (IC شارژ) و سلامت باتری آسیب جدی می‌زنند.\n\n## فناوری GaN چیست و چه تفاوتی ایجاد می‌کند؟\nشارژرهای مبتنی بر نیترید گالیوم (GaN) در مقایسه با نمونه‌های سیلیکونی قدیمی، حرارت بسیار کمتری تولید می‌کنند و در ابعادی کوچک‌تر، توان خروجی بالا مانند ۴۵ تا ۶۵ وات را به صورت پایدار تحویل می‌دهند. برندهایی نظیر انکر (Anker) و آداپتورهای رسمی اپل و سامسونگ از محافظ‌های چندلایه نوسان برق و کنترل دمای لحظه‌ای بهره می‌برند.\n\n## استانداردهای PD و PPS را بشناسید\nبرای گوشی‌های آیفون سری ۱۵ و ۱۶، پشتیبانی آداپتور از پروتکل USB Power Delivery (PD 3.0) حیاتی است. در سوی دیگر، پرچمداران سامسونگ برای دستیابی به شارژ فوق‌سریع ۴۵ واتی نیازمند پروتکل PPS (تنظیم هوشمند ولتاژ و جریان) هستند تا دمای باتری در حین شارژ تحت کنترل بماند.\n\n## چطور شارژر اصل را تشخیص دهیم؟\nوزن متناسب و غیرعادی سبک نبودن بدنه، کیفیت چاپ لیزری شماره سریال، بسته‌بندی پلمپ با هولوگرام اصالت و خرید از فروشگاه دارای گارانتی تعویض واقعی، مهم‌ترین معیارها برای اطمینان از اصالت آداپتور و کابل Type-C هستند.',
  'asset:ankerCharger',
  'راهنمای خرید',
  array['فست شارژ', 'فناوری GaN', 'شارژر انکر', 'سلامت باتری'],
  'سارا کاظمی',
  5,
  true,
  now() - interval '4 days'
),
(
  'best-smartwatches-fitness-health-guide',
  'بهترین ساعت‌های هوشمند برای پایش سلامت و ورزش در سال ۱۴۰۳',
  'تحلیل دقت سنسورهای ضربان قلب، نوار قلب ECG و دوام باتری در ساعت‌های هوشمند اپل و سامسونگ برای استفاده روزمره و حرفه‌ای.',
  E'ساعت‌های هوشمند امروزی فراتر از نمایش اعلان‌های گوشی عمل می‌کنند و به یک دستیار دقیق پایش سلامت، کیفیت خواب و تحلیل تمرینات ورزشی تبدیل شده‌اند. در این راهنما معیارهای کلیدی انتخاب بهترین ساعت هوشمند متناسب با گوشی شما را بررسی می‌کنیم.\n\n## سازگاری اکوسیستم؛ اولین شرط انتخاب\nپیش از هر چیز باید توجه داشت که اپل واچ‌ها تنها با گوشی‌های آیفون جفت می‌شوند و بهترین هماهنگی را با iOS دارند. اگر از گوشی‌های اندرویدی استفاده می‌کنید، سری گلکسی واچ سامسونگ یا ساعت‌های مجهز به Wear OS امکانات کامل‌تری در پاسخ به پیام‌ها و پایش بدن ارائه می‌دهند.\n\n## دقت سنسورها و پایداری GPS\nبرای ورزشکاران فضای باز، دوچرخه‌سواران و کوهنوردان، پشتیبانی از GPS دوفرکانسه (L1+L5) در مدل‌هایی مانند اپل واچ اولترا ۲ دقت ثبت مسیر را به شکل چشمگیری افزایش می‌دهد. همچنین وجود سنسور اکسیژن خون، نوار قلب و تشخیص سقوط می‌تواند در شرایط اضطراری بسیار کاربردی باشد.\n\n## باتری و مقاومت بدنه\nبسته به سبک استفاده، اگر دوام باتری چندروزه و بدنه تیتانیومی مقاوم در برابر ضربه و عمق آب برایتان مهم است، مدل‌های اولترا بهترین گزینه‌اند؛ در حالی که سری‌های استاندارد وزن سبک‌تر و راحتی بیشتری برای پایش خواب شبانه دارند.',
  'asset:audioWearables',
  'بررسی گجت',
  array['ساعت هوشمند', 'اپل واچ اولترا ۲', 'پایش سلامت'],
  'کیوان رستگار',
  8,
  true,
  now() - interval '7 days'
),
(
  'hamta-registry-and-original-seal-checklist',
  'راهنمای کامل استعلام رجیستری همتا و تشخیص پلمپ اصلی پیش از خرید موبایل',
  'چک‌لیست گام‌به‌گام برای اطمینان از آکبند بودن دستگاه، تطابق IMEI روی جعبه با سامانه همتا و نکات مهم فعال‌سازی.',
  E'یکی از دغدغه‌های اصلی هنگام خرید گوشی موبایل آنلاین یا حضوری، اطمینان از پلمپ کارخانه‌ای دستگاه و قانونی بودن رجیستری آن در شبکه ارتباطی کشور است. رعایت چند نکته ساده پیش از باز کردن پلمپ جعبه، ریسک خرید را به صفر می‌رساند.\n\n## تطابق شناسه IMEI روی جعبه و استعلام همتا\nپیش از باز کردن پلمپ، کد ۱۵ رقمی IMEI درج‌شده پشت جعبه را در سامانه همتا (از طریق کد دستوری #۷۷۷۷* یا اپلیکیشن همتا) استعلام بگیرید. در وضعیت قانونی باید مدل دقیق دستگاه و نام شرکت واردکننده رسمی نمایش داده شود.\n\n## بررسی پلمپ کارخانه و شماره سریال برند\nدر آیفون‌های جدید، اپل به جای سلفون پلاستیکی از نوار کاغذی کشیدنی با برچسب امنیتی ماوراءبنفش استفاده می‌کند. همچنین شماره سریال روی جعبه را می‌توانید پیش از فعال‌سازی در وب‌سایت رسمی اپل یا سامسونگ بررسی کنید تا مطمئن شوید دستگاه قبلاً اکتیو نشده است.\n\n## انتقال مالکیت قانونی پس از تحویل\nدر فروشگاه موبایل امیر، تمامی گوشی‌ها همراه با کد فعال‌سازی معتبر روی فاکتور رسمی و گارانتی ۱۸ ماهه امیر سرویس ارسال می‌شوند تا پس از دریافت بسته، بلافاصله دستگاه را به نام سیم‌کارت خود فعال کنید.',
  'asset:promoShowcase',
  'آموزش و رجیستری',
  array['رجیستری همتا', 'تشخیص پلمپ', 'خرید امن موبایل'],
  'تحریریه موبایل امیر',
  6,
  true,
  now() - interval '10 days'
)
on conflict (slug) do nothing;

-- ============================================================================
-- 15. Storefront Hardening: Payment Status, Order Idempotency, Coupon Limits,
--     Q&A Moderation Default, Duplicate Review Guard, Newsletter Unsubscribe,
--     and Atomic Order Placement / Cancellation RPCs
-- ============================================================================
alter table public.orders
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists idempotency_key text,
  add column if not exists stock_restored boolean not null default false;

alter table public.orders
  alter column status set default 'pending_payment';

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'pending_gateway', 'paid', 'not_required'));

create unique index if not exists idx_orders_idempotency_key
  on public.orders (idempotency_key)
  where idempotency_key is not null;

alter table public.coupons
  add column if not exists starts_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists usage_limit integer,
  add column if not exists per_user_limit integer,
  add column if not exists used_count integer not null default 0;

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_code text not null,
  order_code text not null,
  user_id uuid references public.app_users(id) on delete set null,
  customer_phone text,
  status text not null default 'applied' check (status in ('applied', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (coupon_code, order_code)
);

create index if not exists idx_coupon_redemptions_code_user
  on public.coupon_redemptions (coupon_code, user_id);
create index if not exists idx_coupon_redemptions_code_phone
  on public.coupon_redemptions (coupon_code, customer_phone);
create index if not exists idx_coupon_redemptions_order_code
  on public.coupon_redemptions (order_code);

alter table public.coupon_redemptions enable row level security;
revoke all on table public.coupon_redemptions from anon;

alter table public.product_questions
  alter column is_approved set default false;

alter table public.product_reviews
  add column if not exists user_id uuid references public.app_users(id) on delete set null;

create unique index if not exists idx_product_reviews_product_user_unique
  on public.product_reviews (product_id, user_id)
  where user_id is not null;

alter table public.newsletter_subscribers
  add column if not exists contact_type text,
  add column if not exists status text not null default 'active',
  add column if not exists unsubscribe_token text,
  add column if not exists unsubscribed_at timestamptz;

alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_status_check;

alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_status_check
  check (status in ('active', 'unsubscribed'));

create unique index if not exists idx_newsletter_unsubscribe_token
  on public.newsletter_subscribers (unsubscribe_token)
  where unsubscribe_token is not null;

-- ============================================================================
-- 16. 30-Minute Order Expiration (Additive & Non-Destructive)
-- ============================================================================
alter table public.orders
  add column if not exists expires_at timestamptz,
  add column if not exists expired_at timestamptz;

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (
    status in (
      'pending_payment',
      'paid',
      'preparing',
      'shipped',
      'delivered',
      'cancelled',
      'expired'
    )
  );

create index if not exists idx_orders_pending_expiration
  on public.orders (expires_at asc)
  where status = 'pending_payment'
    and payment_status = 'unpaid'
    and expires_at is not null;

do $$
declare
  v_constraint_name text;
begin
  for v_constraint_name in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'coupon_redemptions'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format('alter table public.coupon_redemptions drop constraint if exists %I', v_constraint_name);
  end loop;
end $$;

alter table public.coupon_redemptions
  add constraint coupon_redemptions_status_check
  check (status in ('applied', 'cancelled', 'expired'));

