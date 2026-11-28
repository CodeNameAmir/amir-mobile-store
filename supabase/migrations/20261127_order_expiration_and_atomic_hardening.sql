-- ============================================================================
-- Migration: 20261127_order_expiration_and_atomic_hardening.sql
-- Purpose:
--   1. Add nullable expires_at & expired_at to public.orders (non-destructive:
--      historical orders without expires_at stay NULL and are never expired)
--   2. Support 'expired' in public.orders.status and public.coupon_redemptions.status
--   3. Add partial index idx_orders_pending_expiration for fast expiration scans
--   4. Update place_order_atomic to set expires_at = created_at + interval '30 minutes'
--      for new pending_payment / unpaid orders inside PostgreSQL
--   5. Harden cancel_order_atomic lock order (products -> warehouse_stock) and
--      idempotency guards against already-expired/cancelled orders
--   6. Create expire_pending_orders_atomic(p_limit) using FOR UPDATE SKIP LOCKED
--      for atomic, exact-once stock + coupon restoration and expiration transition
-- Idempotent: Safe to run multiple times in Supabase SQL Editor.
-- ============================================================================

-- 1. Additive columns on public.orders (historical orders keep expires_at = NULL)
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

-- 2. Expand coupon_redemptions.status check constraint to allow 'expired'
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

-- 3. Updated transactional order placement RPC (sets DB-backed 30-min expires_at)
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
  v_status text := coalesce(nullif(trim(coalesce(p_payload->>'status', '')), ''), 'pending_payment');
  v_payment_status text := coalesce(nullif(trim(coalesce(p_payload->>'payment_status', '')), ''), 'unpaid');
  v_now timestamptz := now();
  v_expires_at timestamptz := case
    when v_status = 'pending_payment' and v_payment_status = 'unpaid'
    then v_now + interval '30 minutes'
    else null
  end;
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

    -- Always lock parent product row first
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
          set quantity_on_hand = v_new_balance, updated_at = v_now
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
              updated_at = v_now
          where id = v_product_id;
        continue;
      end if;
    end if;

    -- Product-level stock when variant has no warehouse_stock row
    if not coalesce(v_prod.in_stock, false) or coalesce(v_prod.stock_count, 0) < v_qty then
      raise exception 'INSUFFICIENT_PRODUCT_STOCK:%', v_prod.name_fa using errcode = 'P0001';
    end if;

    update public.products
      set stock_count = greatest(0, stock_count - v_qty),
          in_stock = (stock_count - v_qty) > 0,
          updated_at = v_now
      where id = v_product_id;
  end loop;

  -- Lock & validate coupon limits
  if v_coupon_code is not null then
    select * into v_coupon from public.coupons where upper(code) = v_coupon_code for update;
    if not found or not coalesce(v_coupon.is_active, true) then
      raise exception 'COUPON_INVALID' using errcode = 'P0001';
    end if;
    if v_coupon.starts_at is not null and v_now < v_coupon.starts_at then
      raise exception 'COUPON_NOT_STARTED' using errcode = 'P0001';
    end if;
    if v_coupon.expires_at is not null and v_now > v_coupon.expires_at then
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
    expires_at,
    expired_at,
    created_at,
    updated_at,
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
    v_status,
    v_payment_status,
    coalesce(p_payload->>'delivery_pin', ''),
    coalesce(p_payload->>'imei_sample', ''),
    v_idemp_key,
    false,
    v_expires_at,
    null,
    v_now,
    v_now,
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

-- 4. Hardened transactional order cancellation RPC (consistent lock order & expiry rejection)
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
  v_prod public.products%rowtype;
  v_item jsonb;
  v_product_id text;
  v_variant_id uuid;
  v_qty integer;
  v_mov public.stock_movements%rowtype;
  v_ws public.warehouse_stock%rowtype;
  v_new_balance integer;
  v_total_var_avail integer;
  v_redemp_count integer := 0;
  v_return_exists boolean := false;
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
    for v_item in
      select elem
      from jsonb_array_elements(coalesce(v_order.items, '[]'::jsonb)) as elem
      order by coalesce(elem->>'productId', ''), coalesce(elem->>'variantId', ''), coalesce(elem->>'key', '')
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

      -- Lock parent product first (same order as place_order_atomic to prevent deadlocks)
      select * into v_prod from public.products where id = v_product_id for update;

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
            select exists(
              select 1
              from public.stock_movements
              where reference_type = 'order'
                and reference_id = v_order.order_code
                and variant_id = v_variant_id
                and movement_type = 'customer_return'
                and idempotency_key = ('order-cancel:' || v_order.order_code || ':' || v_variant_id::text || ':' || coalesce(v_item->>'key', v_qty::text))
            ) into v_return_exists;

            if not v_return_exists then
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
              );
            end if;

            select coalesce(sum(greatest(0, ws.quantity_on_hand - ws.reserved_qty)), 0)::integer
              into v_total_var_avail
              from public.warehouse_stock ws
              join public.product_variants pv on pv.id = ws.variant_id
              where pv.product_id = v_product_id;

            if v_prod.id is not null then
              update public.products
                set stock_count = greatest(0, coalesce(v_total_var_avail, 0)),
                    in_stock = coalesce(v_total_var_avail, 0) > 0,
                    updated_at = now()
                where id = v_product_id;
            end if;
            continue;
          end if;
        end if;
      end if;

      if v_prod.id is not null then
        update public.products
          set stock_count = stock_count + v_qty,
              in_stock = true,
              updated_at = now()
          where id = v_product_id;
      end if;
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

-- 5. Transactional Order Expiration RPC (30-minute pending_payment / unpaid expiry)
create or replace function public.expire_pending_orders_atomic(
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 100), 500));
  v_now timestamptz := now();
  v_order public.orders%rowtype;
  v_updated public.orders%rowtype;
  v_prod public.products%rowtype;
  v_item jsonb;
  v_product_id text;
  v_variant_id uuid;
  v_qty integer;
  v_mov public.stock_movements%rowtype;
  v_ws public.warehouse_stock%rowtype;
  v_new_balance integer;
  v_total_var_avail integer;
  v_redemp_count integer := 0;
  v_return_exists boolean := false;
  v_processed_count integer := 0;
  v_expired_count integer := 0;
  v_expired_codes jsonb := '[]'::jsonb;
  v_expired_orders jsonb := '[]'::jsonb;
begin
  for v_order in
    select *
    from public.orders
    where status = 'pending_payment'
      and payment_status = 'unpaid'
      and expires_at is not null
      and expires_at <= v_now
    order by expires_at asc
    limit v_limit
    for update skip locked
  loop
    v_processed_count := v_processed_count + 1;

    -- Guard after row lock in case concurrent transaction modified status/payment
    if v_order.status <> 'pending_payment'
       or v_order.payment_status <> 'unpaid'
       or v_order.expires_at is null
       or v_order.expires_at > v_now then
      continue;
    end if;

    if not coalesce(v_order.stock_restored, false) then
      for v_item in
        select elem
        from jsonb_array_elements(coalesce(v_order.items, '[]'::jsonb)) as elem
        order by coalesce(elem->>'productId', ''), coalesce(elem->>'variantId', ''), coalesce(elem->>'key', '')
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

        -- Lock parent product row first to keep lock order uniform with place_order_atomic
        select * into v_prod from public.products where id = v_product_id for update;

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
              select exists(
                select 1
                from public.stock_movements
                where reference_type = 'order'
                  and reference_id = v_order.order_code
                  and variant_id = v_variant_id
                  and movement_type = 'customer_return'
                  and idempotency_key = ('order-expire:' || v_order.order_code || ':' || v_variant_id::text || ':' || coalesce(v_item->>'key', v_qty::text))
              ) into v_return_exists;

              if not v_return_exists then
                v_new_balance := v_ws.quantity_on_hand + v_qty;
                update public.warehouse_stock
                  set quantity_on_hand = v_new_balance, updated_at = v_now
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
                  'بازگشت خودکار موجودی بابت انقضای مهلت پرداخت سفارش ' || v_order.order_code,
                  'order-expire:' || v_order.order_code || ':' || v_variant_id::text || ':' || coalesce(v_item->>'key', v_qty::text)
                );
              end if;

              select coalesce(sum(greatest(0, ws.quantity_on_hand - ws.reserved_qty)), 0)::integer
                into v_total_var_avail
                from public.warehouse_stock ws
                join public.product_variants pv on pv.id = ws.variant_id
                where pv.product_id = v_product_id;

              if v_prod.id is not null then
                update public.products
                  set stock_count = greatest(0, coalesce(v_total_var_avail, 0)),
                      in_stock = coalesce(v_total_var_avail, 0) > 0,
                      updated_at = v_now
                  where id = v_product_id;
              end if;
              continue;
            end if;
          end if;
        end if;

        if v_prod.id is not null then
          update public.products
            set stock_count = stock_count + v_qty,
                in_stock = true,
                updated_at = v_now
            where id = v_product_id;
        end if;
      end loop;

      if v_order.coupon_code is not null then
        update public.coupon_redemptions
          set status = 'expired'
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
      set status = 'expired',
          stock_restored = true,
          expired_at = coalesce(expired_at, v_now),
          updated_at = v_now
      where id = v_order.id
        and status = 'pending_payment'
        and payment_status = 'unpaid'
        and expires_at is not null
        and expires_at <= v_now
      returning * into v_updated;

    if found then
      v_expired_count := v_expired_count + 1;
      v_expired_codes := v_expired_codes || jsonb_build_array(v_updated.order_code);
      v_expired_orders := v_expired_orders || jsonb_build_array(
        jsonb_build_object(
          'orderCode', v_updated.order_code,
          'userId', v_updated.user_id,
          'customerName', v_updated.customer_name,
          'customerEmail', v_updated.customer_email,
          'totalAmount', v_updated.total_amount,
          'expiredAt', v_updated.expired_at
        )
      );
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'processed', v_processed_count,
    'expired', v_expired_count,
    'expiredOrderCodes', v_expired_codes,
    'expiredOrders', v_expired_orders
  );
end;
$$;

revoke all on function public.place_order_atomic(jsonb) from public, anon, authenticated;
revoke all on function public.cancel_order_atomic(text, text) from public, anon, authenticated;
revoke all on function public.expire_pending_orders_atomic(integer) from public, anon, authenticated;

grant execute on function public.place_order_atomic(jsonb) to service_role;
grant execute on function public.cancel_order_atomic(text, text) to service_role;
grant execute on function public.expire_pending_orders_atomic(integer) to service_role;
