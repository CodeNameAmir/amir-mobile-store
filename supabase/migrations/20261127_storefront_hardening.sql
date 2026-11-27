-- ============================================================================
-- Migration: 20261127_storefront_hardening.sql
-- Purpose:
--   1. Separate payment_status from order status & default new orders to pending_payment / unpaid
--   2. Order idempotency_key + stock_restored tracking
--   3. Coupon lifecycle windows (starts_at, expires_at) & usage/per-user limits + coupon_redemptions
--   4. Product Q&A moderation default (is_approved = false)
--   5. Prevent duplicate product reviews per authenticated user
--   6. Newsletter validation metadata, active/unsubscribed status & unsubscribe token
--   7. Transactional PostgreSQL RPCs (place_order_atomic, cancel_order_atomic) with row locks
-- Idempotent: Safe to execute multiple times in Supabase SQL Editor.
-- ============================================================================

-- 1. Orders: payment_status, idempotency_key, stock_restored, pending_payment default
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

-- 2. Coupons: lifecycle windows, usage_limit, per_user_limit, used_count & redemptions
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

-- 3. Product Q&A: default new questions to pending moderation (is_approved = false)
alter table public.product_questions
  alter column is_approved set default false;

-- 4. Product Reviews: associate user_id and prevent duplicate review per user per product
alter table public.product_reviews
  add column if not exists user_id uuid references public.app_users(id) on delete set null;

create unique index if not exists idx_product_reviews_product_user_unique
  on public.product_reviews (product_id, user_id)
  where user_id is not null;

-- 5. Newsletter Subscribers: contact_type, status, unsubscribe_token, unsubscribed_at
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

-- 6. Transactional Order Placement RPC (prevents race-condition overselling, partial decrement, coupon abuse & duplicates)
create or replace function public.place_order_atomic(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_idemp_key text := nullif(trim(coalesce(p_payload->>'idempotency_key', '')), '');
  v_order_code text := upper(trim(both '#' from coalesce(p_payload->>'order_code', '')));
  v_user_id uuid := case
    when nullif(trim(coalesce(p_payload->>'user_id', '')), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then (p_payload->>'user_id')::uuid
    else null
  end;
  v_customer_phone text := coalesce(p_payload->>'customer_phone', '');
  v_coupon_code text := nullif(upper(trim(coalesce(p_payload->>'coupon_code', ''))), '');
  v_existing public.orders%rowtype;
  v_inserted public.orders%rowtype;
  v_coupon public.coupons%rowtype;
  v_user_redemptions integer := 0;
  v_dec jsonb;
  v_prod public.products%rowtype;
  v_ws public.warehouse_stock%rowtype;
  v_item jsonb;
  v_variant_id uuid;
  v_product_id text;
  v_qty integer;
  v_new_balance integer;
  v_total_var_avail integer;
  v_user_items jsonb := coalesce(p_payload->'items', '[]'::jsonb);
begin
  if v_idemp_key is not null then
    perform pg_advisory_xact_lock(hashtext('order-idemp:' || v_idemp_key));
    select * into v_existing from public.orders where idempotency_key = v_idemp_key limit 1;
    if found then
      return jsonb_build_object(
        'ok', true,
        'deduplicated', true,
        'order', to_jsonb(v_existing)
      );
    end if;
  end if;

  if v_order_code = '' then
    raise exception 'INVALID_ORDER_CODE' using errcode = 'P0001';
  end if;

  -- Lock & decrement stock deterministically sorted by product_id, variant_id to avoid deadlocks
  for v_dec in
    select elem
    from jsonb_array_elements(coalesce(p_payload->'stock_decrements', '[]'::jsonb)) as elem
    order by coalesce(elem->>'productId', ''), coalesce(elem->>'variantId', '')
  loop
    v_product_id := trim(coalesce(v_dec->>'productId', ''));
    v_qty := greatest(0, coalesce((v_dec->>'qty')::integer, 0));
    if v_product_id = '' or v_qty <= 0 then
      continue;
    end if;

    v_variant_id := case
      when nullif(trim(coalesce(v_dec->>'variantId', '')), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (v_dec->>'variantId')::uuid
      else null
    end;

    -- Always lock parent product row
    select * into v_prod from public.products where id = v_product_id for update;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND:%', v_product_id using errcode = 'P0001';
    end if;

    if v_variant_id is not null then
      select * into v_ws
      from public.warehouse_stock
      where variant_id = v_variant_id
      order by (quantity_on_hand - reserved_qty) desc
      limit 1
      for update;

      if found then
        if (v_ws.quantity_on_hand - v_ws.reserved_qty) < v_qty then
          raise exception 'INSUFFICIENT_VARIANT_STOCK:%', v_variant_id using errcode = 'P0001';
        end if;
        v_new_balance := v_ws.quantity_on_hand - v_qty;
        update public.warehouse_stock
          set quantity_on_hand = v_new_balance, updated_at = now()
          where id = v_ws.id;

        insert into public.stock_movements (
          warehouse_id,
          variant_id,
          quantity_change,
          balance_after,
          movement_type,
          reference_type,
          reference_id,
          created_by,
          note_fa,
          idempotency_key
        ) values (
          v_ws.warehouse_id,
          v_variant_id,
          -v_qty,
          v_new_balance,
          'order_sale',
          'order',
          v_order_code,
          v_user_id,
          'کسر موجودی بابت سفارش ' || v_order_code,
          'order-sale:' || v_order_code || ':' || v_variant_id::text
        ) on conflict (idempotency_key) do nothing;

        select coalesce(sum(greatest(0, ws.quantity_on_hand - ws.reserved_qty)), 0)::integer
          into v_total_var_avail
          from public.warehouse_stock ws
          join public.product_variants pv on pv.id = ws.variant_id
          where pv.product_id = v_product_id;

        update public.products
          set stock_count = greatest(0, coalesce(v_total_var_avail, 0)),
              in_stock = coalesce(v_total_var_avail, 0) > 0,
              updated_at = now()
          where id = v_product_id;
        continue;
      end if;
    end if;

    -- Product-level stock fallback when variant does not have warehouse_stock row
    if not coalesce(v_prod.in_stock, false) or coalesce(v_prod.stock_count, 0) < v_qty then
      raise exception 'INSUFFICIENT_PRODUCT_STOCK:%', v_prod.name_fa using errcode = 'P0001';
    end if;

    update public.products
      set stock_count = stock_count - v_qty,
          in_stock = (stock_count - v_qty) > 0,
          updated_at = now()
      where id = v_product_id;
  end loop;

  -- Lock & validate coupon limits
  if v_coupon_code is not null then
    select * into v_coupon from public.coupons where upper(code) = v_coupon_code for update;
    if not found or not coalesce(v_coupon.is_active, true) then
      raise exception 'COUPON_INVALID' using errcode = 'P0001';
    end if;
    if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
      raise exception 'COUPON_NOT_STARTED' using errcode = 'P0001';
    end if;
    if v_coupon.expires_at is not null and now() > v_coupon.expires_at then
      raise exception 'COUPON_EXPIRED' using errcode = 'P0001';
    end if;
    if v_coupon.usage_limit is not null and coalesce(v_coupon.used_count, 0) >= v_coupon.usage_limit then
      raise exception 'COUPON_USAGE_LIMIT' using errcode = 'P0001';
    end if;
    if v_coupon.per_user_limit is not null then
      select count(*)::integer into v_user_redemptions
      from public.coupon_redemptions
      where upper(coupon_code) = upper(v_coupon.code)
        and status = 'applied'
        and (
          (v_user_id is not null and user_id = v_user_id)
          or (v_customer_phone <> '' and customer_phone = v_customer_phone)
        );
      if v_user_redemptions >= v_coupon.per_user_limit then
        raise exception 'COUPON_USER_LIMIT' using errcode = 'P0001';
      end if;
    end if;

    update public.coupons
      set used_count = coalesce(used_count, 0) + 1
      where code = v_coupon.code;

    insert into public.coupon_redemptions (
      coupon_code,
      order_code,
      user_id,
      customer_phone,
      status
    ) values (
      v_coupon.code,
      v_order_code,
      v_user_id,
      nullif(v_customer_phone, ''),
      'applied'
    ) on conflict (coupon_code, order_code) do nothing;
  end if;

  insert into public.orders (
    order_code,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    city,
    shipping_address,
    postal_code,
    delivery_slot,
    shaparak_ref,
    coupon_code,
    subtotal,
    discount_total,
    product_discount,
    coupon_discount,
    shipping_cost,
    total_amount,
    status,
    payment_status,
    delivery_pin,
    imei_sample,
    idempotency_key,
    stock_restored,
    items
  ) values (
    v_order_code,
    v_user_id,
    coalesce(p_payload->>'customer_name', ''),
    v_customer_phone,
    nullif(trim(coalesce(p_payload->>'customer_email', '')), ''),
    coalesce(p_payload->>'city', 'تهران'),
    coalesce(p_payload->>'shipping_address', ''),
    coalesce(p_payload->>'postal_code', ''),
    coalesce(p_payload->>'delivery_slot', 'express'),
    coalesce(p_payload->>'shaparak_ref', ''),
    v_coupon_code,
    coalesce((p_payload->>'subtotal')::bigint, 0),
    coalesce((p_payload->>'discount_total')::bigint, 0),
    coalesce((p_payload->>'product_discount')::bigint, 0),
    coalesce((p_payload->>'coupon_discount')::bigint, 0),
    coalesce((p_payload->>'shipping_cost')::bigint, 0),
    coalesce((p_payload->>'total_amount')::bigint, 0),
    coalesce(nullif(p_payload->>'status', ''), 'pending_payment'),
    coalesce(nullif(p_payload->>'payment_status', ''), 'unpaid'),
    coalesce(p_payload->>'delivery_pin', ''),
    coalesce(p_payload->>'imei_sample', ''),
    v_idemp_key,
    false,
    v_user_items
  )
  returning * into v_inserted;

  for v_item in select * from jsonb_array_elements(v_user_items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      sku,
      part_number,
      product_title_fa,
      color_name_fa,
      storage,
      warranty_title,
      quantity,
      unit_price_toman,
      original_unit_price_toman,
      line_total_toman
    ) values (
      v_inserted.id,
      v_item->>'productId',
      case
        when nullif(trim(coalesce(v_item->>'variantId', '')), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then (v_item->>'variantId')::uuid
        else null
      end,
      nullif(v_item->>'sku', ''),
      nullif(v_item->>'partNumber', ''),
      coalesce(v_item->>'nameFa', ''),
      nullif(v_item->>'colorName', ''),
      nullif(v_item->>'storageLabel', ''),
      nullif(v_item->>'warranty', ''),
      greatest(1, coalesce((v_item->>'qty')::integer, 1)),
      greatest(0, coalesce((v_item->>'unitPrice')::bigint, 0)),
      greatest(0, coalesce((v_item->>'originalUnitPrice')::bigint, 0)),
      greatest(0, coalesce((v_item->>'unitPrice')::bigint, 0)) * greatest(1, coalesce((v_item->>'qty')::integer, 1))
    );
  end loop;

  return jsonb_build_object(
    'ok', true,
    'deduplicated', false,
    'order', to_jsonb(v_inserted)
  );
end;
$$;

-- 7. Transactional Order Cancellation & Stock Restoration RPC
create or replace function public.cancel_order_atomic(
  p_order_code text,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(both '#' from coalesce(p_order_code, '')));
  v_order public.orders%rowtype;
  v_updated public.orders%rowtype;
  v_item jsonb;
  v_product_id text;
  v_variant_id uuid;
  v_qty integer;
  v_mov public.stock_movements%rowtype;
  v_ws public.warehouse_stock%rowtype;
  v_new_balance integer;
  v_total_var_avail integer;
  v_redemp_count integer := 0;
begin
  select * into v_order
  from public.orders
  where upper(order_code) = v_code
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_order.status not in ('pending_payment', 'paid', 'preparing') then
    raise exception 'ORDER_NOT_CANCELLABLE:%', v_order.status using errcode = 'P0003';
  end if;

  if not coalesce(v_order.stock_restored, false) then
    for v_item in select * from jsonb_array_elements(coalesce(v_order.items, '[]'::jsonb))
    loop
      v_product_id := trim(coalesce(v_item->>'productId', ''));
      v_qty := greatest(0, coalesce((v_item->>'qty')::integer, 0));
      v_variant_id := case
        when nullif(trim(coalesce(v_item->>'variantId', '')), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then (v_item->>'variantId')::uuid
        else null
      end;

      if v_qty <= 0 or v_product_id = '' then
        continue;
      end if;

      -- Check if variant stock movement was recorded for this order
      if v_variant_id is not null then
        select * into v_mov
        from public.stock_movements
        where reference_type = 'order'
          and reference_id = v_order.order_code
          and variant_id = v_variant_id
          and movement_type = 'order_sale'
        limit 1;

        if found then
          select * into v_ws
          from public.warehouse_stock
          where warehouse_id = v_mov.warehouse_id
            and variant_id = v_variant_id
          for update;

          if found then
            v_new_balance := v_ws.quantity_on_hand + v_qty;
            update public.warehouse_stock
              set quantity_on_hand = v_new_balance, updated_at = now()
              where id = v_ws.id;

            insert into public.stock_movements (
              warehouse_id,
              variant_id,
              quantity_change,
              balance_after,
              movement_type,
              reference_type,
              reference_id,
              note_fa,
              idempotency_key
            ) values (
              v_ws.warehouse_id,
              v_variant_id,
              v_qty,
              v_new_balance,
              'customer_return',
              'order',
              v_order.order_code,
              'بازگشت موجودی بابت لغو سفارش ' || v_order.order_code,
              'order-cancel:' || v_order.order_code || ':' || v_variant_id::text || ':' || coalesce(v_item->>'key', v_qty::text)
            ) on conflict (idempotency_key) do nothing;

            select coalesce(sum(greatest(0, ws.quantity_on_hand - ws.reserved_qty)), 0)::integer
              into v_total_var_avail
              from public.warehouse_stock ws
              join public.product_variants pv on pv.id = ws.variant_id
              where pv.product_id = v_product_id;

            update public.products
              set stock_count = greatest(0, coalesce(v_total_var_avail, 0)),
                  in_stock = coalesce(v_total_var_avail, 0) > 0,
                  updated_at = now()
              where id = v_product_id;
            continue;
          end if;
        end if;
      end if;

      update public.products
        set stock_count = stock_count + v_qty,
            in_stock = true,
            updated_at = now()
        where id = v_product_id;
    end loop;

    if v_order.coupon_code is not null then
      update public.coupon_redemptions
        set status = 'cancelled'
        where order_code = v_order.order_code
          and status = 'applied';
      get diagnostics v_redemp_count = row_count;
      if v_redemp_count > 0 then
        update public.coupons
          set used_count = greatest(0, coalesce(used_count, 0) - 1)
          where upper(code) = upper(v_order.coupon_code);
      end if;
    end if;
  end if;

  update public.orders
    set status = 'cancelled',
        stock_restored = true,
        admin_note = coalesce(p_admin_note, admin_note),
        updated_at = now()
    where id = v_order.id
    returning * into v_updated;

  return jsonb_build_object(
    'ok', true,
    'order', to_jsonb(v_updated)
  );
end;
$$;

revoke all on function public.place_order_atomic(jsonb) from public, anon, authenticated;
revoke all on function public.cancel_order_atomic(text, text) from public, anon, authenticated;
grant execute on function public.place_order_atomic(jsonb) to service_role;
grant execute on function public.cancel_order_atomic(text, text) to service_role;
