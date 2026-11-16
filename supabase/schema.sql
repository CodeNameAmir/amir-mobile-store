-- ============================================================================
-- Amir Mobile Store (فروشگاه موبایل امیر) — Supabase Free Tier Schema
-- Run this script in Supabase Dashboard -> SQL Editor
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
  warranty text not null,
  rating numeric(2,1) default 4.8,
  review_count integer default 0,
  specs jsonb default '{}'::jsonb,
  storage_options jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. Demo Orders Table
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
  shipping_cost bigint default 0,
  total_amount bigint not null,
  status text not null default 'preparing',
  delivery_pin text not null,
  imei_sample text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

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

-- 4. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  contact text unique not null,
  created_at timestamptz default now()
);

-- Row Level Security (RLS) for Static Frontend Portfolio Demo
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.support_tickets enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read access for catalog products
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

-- Portfolio demo policies for orders, tickets, and newsletter
drop policy if exists "Anyone can create demo orders" on public.orders;
create policy "Anyone can create demo orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Anyone can view orders by code" on public.orders;
create policy "Anyone can view orders by code"
  on public.orders for select
  using (true);

drop policy if exists "Anyone can create support tickets" on public.support_tickets;
create policy "Anyone can create support tickets"
  on public.support_tickets for insert
  with check (true);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);
