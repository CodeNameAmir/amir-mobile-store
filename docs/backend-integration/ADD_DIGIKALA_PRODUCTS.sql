-- =============================================================================
-- Amir Mobile Store — Digikala Products Import Script (11 Smartphones)
-- Source: Live Digikala product pages & variant pricing (Converted Rial -> Toman)
-- Safe & Idempotent: Run this script directly in Supabase Dashboard -> SQL Editor.
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure core category ("phones") and brands ("Apple", "Samsung", "Xiaomi") exist
INSERT INTO public.categories (id, slug, label, name_fa, name_en, title_en, subtitle, icon, icon_name, sort_order, is_active)
SELECT 'phones', 'phones', 'گوشی موبایل', 'گوشی موبایل', 'Mobile Phones', 'Mobile Phones', 'اپل، سامسونگ، شیائومی، هواوی', 'Smartphone', 'Smartphone', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones');

INSERT INTO public.brands (id, slug, name, name_en, name_fa, label_fa, sort_order, is_active, is_featured)
SELECT 'Apple', 'apple', 'Apple', 'Apple', 'اپل', 'اپل', 1, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE lower(name) = 'apple' OR lower(id) = 'apple');

INSERT INTO public.brands (id, slug, name, name_en, name_fa, label_fa, sort_order, is_active, is_featured)
SELECT 'Samsung', 'samsung', 'Samsung', 'Samsung', 'سامسونگ', 'سامسونگ', 2, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung');

INSERT INTO public.brands (id, slug, name, name_en, name_fa, label_fa, sort_order, is_active, is_featured)
SELECT 'Xiaomi', 'xiaomi', 'Xiaomi', 'Xiaomi', 'شیائومی', 'شیائومی', 3, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE lower(name) = 'xiaomi' OR lower(id) = 'xiaomi');

-- 2. Ensure default warranty & central warehouse exist
INSERT INTO public.warranties (code, provider_name, duration_months, coverage_fa, is_active)
SELECT 'amir-18m', '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا', 18, 'گارانتی رسمی تعمیرات و تعویض سخت‌افزار به همراه انتقال مالکیت قطعی در سامانه همتا', true
WHERE NOT EXISTS (SELECT 1 FROM public.warranties WHERE code = 'amir-18m' OR provider_name = '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا');

INSERT INTO public.warehouses (code, name_fa, city, address_fa, address, is_central, is_active)
SELECT 'WH-THR-CENTRAL', 'انبار مرکزی تهران', 'تهران', 'تهران، مرکز پردازش و انبار مرکزی امیر موبایل', 'تهران، مرکز پردازش و انبار مرکزی امیر موبایل', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses WHERE code = 'WH-THR-CENTRAL');

-- -----------------------------------------------------------------------------
-- Product: Apple iPhone 18 Pro Max ZAA Dual SIM Storage 256GB and RAM 12GB Mobile Phone - Not Active Without Without Registration Code (DKP-22834618)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'iphone-18-pro-max-zaa-256',
  'iphone-18-pro-max-zaa-256',
  'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری',
  'Apple iPhone 18 Pro Max ZAA Dual SIM Storage 256GB and RAM 12GB Mobile Phone - Not Active Without Without Registration Code',
  'iPhone 18 Pro Max ZAA',
  'آیفون ۱۸ پرو مکس پارت نامبر ZAA با ظرفیت ۲۵۶ گیگابایت و رم ۱۲ گیگابایت، مجهز به تراشه ۲ نانومتری Apple A20 Pro، نمایشگر ۶.۹ اینچی ۱۲۰ هرتز با روشنایی ۳۰۰۰ نیت و دوربین ۴۸ مگاپیکسلی با دیافراگم متغیر.',
  'Apple',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'apple' OR lower(id) = 'apple' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  414999000,
  550000000,
  25,
  true,
  18,
  true,
  '۱۸ ماهه جامع امیر سرویس + تضمین اصالت',
  'پرچمدار جدید اپل',
  4.8,
  4,
  96,
  'https://dkstatics-public.digikala.com/digikala-products/ebc7743211c9981e056c1ee468895d226d5179fd_1795349921.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/ebc7743211c9981e056c1ee468895d226d5179fd_1795349921.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/882d240469f500d1cfa9ca85e1658bb10b769361_1794849472.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8f9be6b4cc9a6342317b3398204b4160c070a6fe_1795349892.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/15e1a63b9cbce2a30c8f5c48a1bb44d09d1d134a_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/935270f6af1cd5aa4a699e75a1c58a7185be8f77_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3c72123b6b5ef99415b8081feeea7ab835b2cdd2_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a4b9bddd292ef07ffaed5271dcd5bc94bf21475e_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'آبی',
  '[{"id":"blue-1","name":"آبی","hex":"#0000FF"},{"id":"crimson-2","name":"زرشکی","hex":"#6a1313"},{"id":"black-3","name":"مشکی","hex":"#000000"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۱۲ گیگابایت · پارت نامبر ZAA","priceDelta":0}]'::jsonb,
  '{"display":"۶.۹ اینچ LTPO Super Retina XDR OLED","displayDetails":"۱۲۰Hz ProMotion · ۳۰۰۰ نیت · 1320x2868","chipset":"Apple A20 Pro (2 nm)","chipsetDetails":"۶ هسته‌ای · پشتیبانی Apple Intelligence","camera":"۴۸ مگاپیکسل حرفه‌ای","cameraDetails":"دیافراگم متغیر f/1.48-f/4.0 · سلفی ۱۸ MP","battery":"۵۳۹۱ میلی‌آمپر ساعت","batteryDetails":"شارژ سریع سیمی و MagSafe · بدنه IP68","storageDefault":"۲۵۶ گیگابایت","ram":"۱۲ گیگابایت","os":"iOS 27"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22834618"},{"label":"وضعیت رجیستری و اکتیو","value":"نات اکتیو · بدون کد رجیستری"},{"label":"ویژگی‌های اختصاصی","value":"مودم Apple C2 · دکمه Camera Control · اسکنر LiDAR"}]'::jsonb,
  true,
  true,
  true,
  true,
  15,
  15,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'iphone-18-pro-max-zaa-256';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/ebc7743211c9981e056c1ee468895d226d5179fd_1795349921.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', true, 0),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/882d240469f500d1cfa9ca85e1658bb10b769361_1794849472.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 1),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/8f9be6b4cc9a6342317b3398204b4160c070a6fe_1795349892.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 2),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/15e1a63b9cbce2a30c8f5c48a1bb44d09d1d134a_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 3),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/935270f6af1cd5aa4a699e75a1c58a7185be8f77_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 4),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/3c72123b6b5ef99415b8081feeea7ab835b2cdd2_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 5),
  ('iphone-18-pro-max-zaa-256', 'https://dkstatics-public.digikala.com/digikala-products/a4b9bddd292ef07ffaed5271dcd5bc94bf21475e_1795349891.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 18 Pro Max ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - نات اکتیو بدون کد رجیستری', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'iphone-18-pro-max-zaa-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22834618-BLUE',
    'DKV-92649800',
    'آبی',
    'Blue',
    '#0000FF',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM + eSIM',
    414999000,
    550000000,
    381799080,
    true
  ),
  (
    'iphone-18-pro-max-zaa-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22834618-CRIMSON',
    'DKV-92649830',
    'زرشکی',
    'Crimson',
    '#6a1313',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM + eSIM',
    414999000,
    550000000,
    381799080,
    true
  ),
  (
    'iphone-18-pro-max-zaa-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22834618-BLACK',
    'DKV-92625593',
    'مشکی',
    'Black',
    '#000000',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM + eSIM',
    414999000,
    550000000,
    381799080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'iphone-18-pro-max-zaa-256';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'iphone-18-pro-max-zaa-256', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.9::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Apple A20 Pro (2 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 48::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5391::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 35::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت + eSIM', NULL::numeric, NULL::boolean),
  ('os', 'iOS 27', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (تا عمق ۶ متر به مدت ۳۰ دقیقه)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy S26 Ultra Dual SIM Storage 256GB and RAM 12GB Mobile Phone - Vietnam (DKP-21462684)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-s26-ultra-256-vietnam',
  'galaxy-s26-ultra-256-vietnam',
  'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام',
  'Samsung Galaxy S26 Ultra Dual SIM Storage 256GB and RAM 12GB Mobile Phone - Vietnam',
  'Galaxy S26 Ultra',
  'گلکسی S26 اولترا نسخه ویتنام با حافظه ۲۵۶ گیگابایت و رم ۱۲ گیگابایت، پردازنده پرچمدار Snapdragon 8 Elite Gen 5، دوربین اصلی ۲۰۰ مگاپیکسلی با فوکوس لیزری و شارژ سریع ۶۰ وات.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  410599000,
  447759700,
  8,
  true,
  24,
  true,
  '۱۸ ماهه صدرتل + کد رجیستری همتا',
  '۸٪ تخفیف · پرچمدار',
  4.7,
  103,
  94,
  'https://dkstatics-public.digikala.com/digikala-products/f763c68074bc2007562135176a588d2324593b63_1779812739.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/f763c68074bc2007562135176a588d2324593b63_1779812739.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a03d51446b0ad545f9b8ae426fe2dba9ab2b8943_1779812660.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0257e1136df211c6e4205661c765f4ffe544694e_1779812663.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/76a787c42cf42baaae1552aeefad7ae7471463de_1779812666.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3567c486f2970256488b961a06935eb12684b868_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9670dc9ed193b46a05d0d33931579fbd8c80fa3e_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/58a3d785c4d7d3492f9ed006fa5c2a073125263a_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'بنفش',
  '[{"id":"purple-1","name":"بنفش","hex":"#800080"},{"id":"black-2","name":"مشکی","hex":"#000000"},{"id":"white-3","name":"سفید","hex":"#FFFFFF"},{"id":"blue-4","name":"آبی","hex":"#0000FF"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۱۲ گیگابایت · ساخت ویتنام","priceDelta":0}]'::jsonb,
  '{"display":"۶.۹ اینچ Dynamic LTPO AMOLED 2X","displayDetails":"۱۲۰Hz · ۲۶۰۰ نیت · QHD+ 1440x3120","chipset":"Snapdragon 8 Elite Gen 5","chipsetDetails":"۸ هسته‌ای Oryon V3 تا ۴.۷۴ گیگاهرتز","camera":"۲۰۰ مگاپیکسل","cameraDetails":"لرزشگیر OIS + فوکوس لیزری · سلفی ۱۲ MP","battery":"۵۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۶۰ وات · قلم S-Pen","storageDefault":"۲۵۶ گیگابایت","ram":"۱۲ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-21462684"},{"label":"کشور مونتاژ","value":"ویتنام (Vietnam)"},{"label":"قابلیت‌های ویژه","value":"قلم S-Pen · Privacy Display · Samsung DeX"}]'::jsonb,
  true,
  true,
  true,
  true,
  16,
  16,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-s26-ultra-256-vietnam';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/f763c68074bc2007562135176a588d2324593b63_1779812739.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', true, 0),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/a03d51446b0ad545f9b8ae426fe2dba9ab2b8943_1779812660.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 1),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/0257e1136df211c6e4205661c765f4ffe544694e_1779812663.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 2),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/76a787c42cf42baaae1552aeefad7ae7471463de_1779812666.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 3),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/3567c486f2970256488b961a06935eb12684b868_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 4),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/9670dc9ed193b46a05d0d33931579fbd8c80fa3e_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 5),
  ('galaxy-s26-ultra-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/58a3d785c4d7d3492f9ed006fa5c2a073125263a_1779812669.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S26 Ultra دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-s26-ultra-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21462684-PURPLE',
    'DKV-80771020',
    'بنفش',
    'Purple',
    '#800080',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    410599000,
    447759700,
    377751080,
    true
  ),
  (
    'galaxy-s26-ultra-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21462684-BLACK',
    'DKV-80771029',
    'مشکی',
    'Black',
    '#000000',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    410599000,
    436859800,
    377751080,
    true
  ),
  (
    'galaxy-s26-ultra-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21462684-WHITE',
    NULL,
    'سفید',
    'White',
    '#FFFFFF',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    410599000,
    447759700,
    377751080,
    true
  ),
  (
    'galaxy-s26-ultra-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21462684-BLUE',
    NULL,
    'آبی',
    'Blue',
    '#0000FF',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    410599000,
    447759700,
    377751080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-s26-ultra-256-vietnam';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-s26-ultra-256-vietnam', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.9::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Snapdragon 8 Elite Gen 5', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 200::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5000::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 60::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (مقاوم در برابر آب تا ۱.۵ متر)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Apple iPhone 17 CH Dual SIM Storage 256GB And RAM 8GB Mobile Phone - Not Activated (DKP-20127115)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'iphone-17-ch-256',
  'iphone-17-ch-256',
  'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو',
  'Apple iPhone 17 CH Dual SIM Storage 256GB And RAM 8GB Mobile Phone - Not Activated',
  'iPhone 17 CH',
  'آیفون ۱۷ دو سیم‌کارت پارت نامبر CH نات اکتیو با ظرفیت ۲۵۶ گیگابایت و رم ۸ گیگابایت، مجهز به نمایشگر ۶.۳ اینچی ۱۲۰ هرتز LTPO OLED و پردازنده Apple A19.',
  'Apple',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'apple' OR lower(id) = 'apple' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  359999000,
  419999000,
  14,
  true,
  30,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  '۱۴٪ تخفیف',
  4.7,
  1051,
  94,
  'https://dkstatics-public.digikala.com/digikala-products/0a8fff942ea8ee0359edadad85daae399b0e357c_1763462145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/0a8fff942ea8ee0359edadad85daae399b0e357c_1763462145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/06b8ea02eb1fc9e981b63fb6aa41a332ab038f9c_1763462149.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b94bf3fc911f830f35aec53b7acae0f3f5392175_1763462153.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c3af3b8483bdb18afa58bff7667c96f4cfcec1f3_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ba3b55c8e6e4c81dab9b8659c03cc5727e696704_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/30eef3650c66d4f013fe269891e4459ae8491b3a_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7407bdf5e3f209893f0d6bb9af87ee779855649b_1763462203.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'بنفش',
  '[{"id":"purple-1","name":"بنفش","hex":"#800080"},{"id":"blue-2","name":"آبی","hex":"#0000FF"},{"id":"green-3","name":"سبز","hex":"#008000"},{"id":"white-4","name":"سفید","hex":"#FFFFFF"},{"id":"black-5","name":"مشکی","hex":"#000000"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · پارت نامبر CH","priceDelta":0}]'::jsonb,
  '{"display":"۶.۳ اینچ LTPO Super Retina XDR OLED","displayDetails":"۱۲۰Hz ProMotion · رزولوشن 1206x2622","chipset":"Apple A19 (3 nm)","chipsetDetails":"۶ هسته‌ای تا ۴.۲۶ گیگاهرتز","camera":"۴۸ مگاپیکسل","cameraDetails":"دیافراگم f/1.6 · لرزشگیر اپتیکال · سلفی ۱۲ MP","battery":"۳۶۹۲ میلی‌آمپر ساعت","batteryDetails":"شارژ ۲۵ وات · IP68","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"iOS 26"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20127115"},{"label":"وضعیت دستگاه","value":"نات اکتیو · پارت نامبر CH دو سیم‌کارت فیزیکی"}]'::jsonb,
  true,
  true,
  true,
  true,
  17,
  17,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'iphone-17-ch-256';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/0a8fff942ea8ee0359edadad85daae399b0e357c_1763462145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', true, 0),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/06b8ea02eb1fc9e981b63fb6aa41a332ab038f9c_1763462149.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 1),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/b94bf3fc911f830f35aec53b7acae0f3f5392175_1763462153.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 2),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/c3af3b8483bdb18afa58bff7667c96f4cfcec1f3_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 3),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/ba3b55c8e6e4c81dab9b8659c03cc5727e696704_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 4),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/30eef3650c66d4f013fe269891e4459ae8491b3a_1763462200.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 5),
  ('iphone-17-ch-256', 'https://dkstatics-public.digikala.com/digikala-products/7407bdf5e3f209893f0d6bb9af87ee779855649b_1763462203.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 CH دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - نات اکتیو', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'iphone-17-ch-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20127115-PURPLE',
    'DKV-74448678',
    'بنفش',
    'Purple',
    '#800080',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    359999000,
    419999000,
    331199080,
    true
  ),
  (
    'iphone-17-ch-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20127115-BLUE',
    'DKV-74448645',
    'آبی',
    'Blue',
    '#0000FF',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    359999000,
    398999000,
    331199080,
    true
  ),
  (
    'iphone-17-ch-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20127115-GREEN',
    'DKV-74448669',
    'سبز',
    'Green',
    '#008000',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    359999000,
    401020000,
    331199080,
    true
  ),
  (
    'iphone-17-ch-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20127115-WHITE',
    'DKV-75094885',
    'سفید',
    'White',
    '#FFFFFF',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    359999000,
    419999000,
    331199080,
    true
  ),
  (
    'iphone-17-ch-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20127115-BLACK',
    'DKV-75094879',
    'مشکی',
    'Black',
    '#000000',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    359999000,
    419999000,
    331199080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'iphone-17-ch-256';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'iphone-17-ch-256', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.3::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Apple A19 (3 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 48::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 3692::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 25::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'iOS 26', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (تا عمق ۶ متر به مدت ۳۰ دقیقه)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Apple iPhone 17 Pro Max ZAA Single SIM + eSim Storage 512GB And RAM 12GB Mobile Phone - Activated - with 20W Apple Charger (DKP-20673446)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'iphone-17-pro-max-zaa-512',
  'iphone-17-pro-max-zaa-512',
  'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل',
  'Apple iPhone 17 Pro Max ZAA Single SIM + eSim Storage 512GB And RAM 12GB Mobile Phone - Activated - with 20W Apple Charger',
  'iPhone 17 Pro Max ZAA',
  'آیفون ۱۷ پرو مکس پارت نامبر ZAA تک سیم‌کارت + eSIM با حافظه ۵۱۲ گیگابایت و رم ۱۲ گیگابایت به همراه آداپتور شارژ ۲۰ وات اپل.',
  'Apple',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'apple' OR lower(id) = 'apple' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  660490000,
  NULL,
  0,
  true,
  6,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  'همراه شارژر ۲۰ وات اپل',
  4.8,
  0,
  96,
  'https://dkstatics-public.digikala.com/digikala-products/03ae89fd7239f88dbe47b1718fbf619f8a080f87_1795358614.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/03ae89fd7239f88dbe47b1718fbf619f8a080f87_1795358614.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b463535fc2eb647ad7ae69bdd5477a6486cbf1ab_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/adec0f3305b5401971433bdf2073db13b68c91b8_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a54f504d312aad6eed0f509f3c804c8d50ea7745_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9cd795b6018dd1238337807894a8d672744f75a1_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/57456f3d22270e4d920ea5fe9d27c5cdb4ff045d_1760438662.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d7c2c99c9d234fa34235ce7521ff6b61f032efa7_1760438662.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'نارنجی',
  '[{"id":"orange-1","name":"نارنجی","hex":"#FFA501"}]'::jsonb,
  '[{"label":"۵۱۲ گیگابایت","subtitle":"رم ۱۲ گیگابایت · همراه شارژر ۲۰ وات اپل","priceDelta":0}]'::jsonb,
  '{"display":"۶.۹ اینچ LTPO Super Retina XDR OLED","displayDetails":"۱۲۰Hz · ۳۰۰۰ نیت · 1320x2868","chipset":"Apple A19 Pro (3 nm)","chipsetDetails":"۶ هسته‌ای تا ۴.۲۶ گیگاهرتز","camera":"۴۸ مگاپیکسل","cameraDetails":"لرزشگیر سنسور شیفت · فیلمبرداری 4K 120fps · سلفی ۱۸ MP","battery":"۴۸۲۳ میلی‌آمپر ساعت","batteryDetails":"شارژ سریع ۳۰ وات + آداپتور ۲۰ وات اپل داخل پک","storageDefault":"۵۱۲ گیگابایت","ram":"۱۲ گیگابایت","os":"iOS 26"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20673446"},{"label":"اقلام ویژه باندل","value":"همراه با شارژر اورجینال ۲۰ وات اپل"},{"label":"وضعیت دستگاه","value":"اکتیو · پارت نامبر ZAA (سنگاپور)"}]'::jsonb,
  true,
  false,
  false,
  true,
  18,
  18,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'iphone-17-pro-max-zaa-512';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/03ae89fd7239f88dbe47b1718fbf619f8a080f87_1795358614.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', true, 0),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/b463535fc2eb647ad7ae69bdd5477a6486cbf1ab_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 1),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/adec0f3305b5401971433bdf2073db13b68c91b8_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 2),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/a54f504d312aad6eed0f509f3c804c8d50ea7745_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 3),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/9cd795b6018dd1238337807894a8d672744f75a1_1760438661.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 4),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/57456f3d22270e4d920ea5fe9d27c5cdb4ff045d_1760438662.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 5),
  ('iphone-17-pro-max-zaa-512', 'https://dkstatics-public.digikala.com/digikala-products/d7c2c99c9d234fa34235ce7521ff6b61f032efa7_1760438662.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA تک سیم کارت + eSim ظرفیت 512 گیگابایت و رم 12 گیگابایت - اکتیو - به همراه شارژر 20 وات اپل', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'iphone-17-pro-max-zaa-512',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20673446-ORANGE',
    'DKV-83017163',
    'نارنجی',
    'Orange',
    '#FFA501',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Single SIM + eSIM',
    660490000,
    NULL,
    607650800,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'iphone-17-pro-max-zaa-512';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'iphone-17-pro-max-zaa-512', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.9::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Apple A19 Pro (3 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 48::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 4823::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 30::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'تک سیم‌کارت + eSIM', NULL::numeric, NULL::boolean),
  ('os', 'iOS 26', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (تا عمق ۶ متر به مدت ۳۰ دقیقه)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy S25 FE Dual SIM Storage 256GB And 8GB Mobile Phone - Vietnam - With 45W Samsung Charger (DKP-20592831)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-s25-fe-256-vietnam',
  'galaxy-s25-fe-256-vietnam',
  'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ',
  'Samsung Galaxy S25 FE Dual SIM Storage 256GB And 8GB Mobile Phone - Vietnam - With 45W Samsung Charger',
  'Galaxy S25 FE',
  'گوشی سامسونگ Galaxy S25 FE نسخه ویتنام با حافظه ۲۵۶ گیگابایت و رم ۸ گیگابایت، پردازنده ۱۰ هسته‌ای Exynos 2400 و نمایشگر ۶.۷ اینچی Dynamic LTPO AMOLED 2X به همراه شارژر ۴۵ وات.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  192916000,
  194865000,
  1,
  true,
  24,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  'همراه شارژر ۴۵ وات',
  4.4,
  212,
  88,
  'https://dkstatics-public.digikala.com/digikala-products/95b2aeae56eaf62116a6b7ce162eaa04a9157309_1764666061.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/95b2aeae56eaf62116a6b7ce162eaa04a9157309_1764666061.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/fce377900ac0f73a60c8c94fc2fe4588578859cf_1764607976.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e685a271510b2a7d3d8a35f79eb995a9e0e47cca_1764607980.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3696bc624d46179c5af8682f7560dc6864c1f89e_1764607985.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a34d3f425a2d1d7d4c80d3f4c6fe0124eabb0589_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2fc2292eea2f171b1b2993ee45f074d36711c59a_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ea2b5caa779679fc8f8a7ac58a2f918673ea248c_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'سرمه ای',
  '[{"id":"navy-1","name":"سرمه ای","hex":"#002171"},{"id":"blue-2","name":"آبی","hex":"#0000FF"},{"id":"black-3","name":"مشکی","hex":"#000000"},{"id":"white-4","name":"سفید","hex":"#FFFFFF"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · همراه شارژر ۴۵ وات سامسونگ","priceDelta":0}]'::jsonb,
  '{"display":"۶.۷ اینچ Dynamic LTPO AMOLED 2X","displayDetails":"۱۲۰Hz · ۱۹۰۰ نیت · 1080x2340","chipset":"Exynos 2400 (4 nm)","chipsetDetails":"۱۰ هسته‌ای تا ۳.۲ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.8 · لرزشگیر OIS · سلفی ۱۲ MP","battery":"۴۹۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۴۵ وات (همراه آداپتور ۴۵ وات)","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20592831"},{"label":"اقلام ویژه باندل","value":"همراه با آداپتور شارژ ۴۵ وات سامسونگ"},{"label":"کشور مونتاژ","value":"ویتنام"}]'::jsonb,
  true,
  false,
  false,
  true,
  19,
  19,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-s25-fe-256-vietnam';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/95b2aeae56eaf62116a6b7ce162eaa04a9157309_1764666061.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', true, 0),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/fce377900ac0f73a60c8c94fc2fe4588578859cf_1764607976.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 1),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/e685a271510b2a7d3d8a35f79eb995a9e0e47cca_1764607980.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 2),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/3696bc624d46179c5af8682f7560dc6864c1f89e_1764607985.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 3),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/a34d3f425a2d1d7d4c80d3f4c6fe0124eabb0589_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 4),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/2fc2292eea2f171b1b2993ee45f074d36711c59a_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 5),
  ('galaxy-s25-fe-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/ea2b5caa779679fc8f8a7ac58a2f918673ea248c_1764607992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل S25 FE دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - ویتنام - به همراه شارژر 45 وات سامسونگ', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-s25-fe-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20592831-NAVY',
    'DKV-79090925',
    'سرمه ای',
    'Navy',
    '#002171',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    192916000,
    194865000,
    177482720,
    true
  ),
  (
    'galaxy-s25-fe-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20592831-BLUE',
    'DKV-79090920',
    'آبی',
    'Blue',
    '#0000FF',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    192916000,
    194865000,
    177482720,
    true
  ),
  (
    'galaxy-s25-fe-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20592831-BLACK',
    'DKV-79090895',
    'مشکی',
    'Black',
    '#000000',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    192916000,
    194865000,
    177482720,
    true
  ),
  (
    'galaxy-s25-fe-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-20592831-WHITE',
    'DKV-79090913',
    'سفید',
    'White',
    '#FFFFFF',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    192916000,
    194865000,
    177482720,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-s25-fe-256-vietnam';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-s25-fe-256-vietnam', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.7::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Exynos 2400 (4 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 4900::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 45::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (مقاوم در برابر آب تا ۱.۵ متر)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy S25 Ultra Dual SIM 512GB And 12GB RAM Mobile Phone - Vietnam Pack (DKP-17918958)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-s25-ultra-512-vietnam',
  'galaxy-s25-ultra-512-vietnam',
  'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام',
  'Samsung Galaxy S25 Ultra Dual SIM 512GB And 12GB RAM Mobile Phone - Vietnam Pack',
  'Galaxy S25 Ultra',
  'پرچمدار سامسونگ Galaxy S25 Ultra پک ویتنام با ظرفیت ۵۱۲ گیگابایت و رم ۱۲ گیگابایت، مجهز به تراشه Snapdragon 8 Elite، دوربین ۲۰۰ مگاپیکسلی و قلم S-Pen.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  462000000,
  NULL,
  0,
  true,
  12,
  true,
  '۱۸ ماهه آیین کیفیت + کد رجیستری همتا',
  'پک ویتنام · ۵۱۲ گیگ',
  4.6,
  262,
  92,
  'https://dkstatics-public.digikala.com/digikala-products/b898a97a346068c4f8e95cc9c7cfdf2b5f700e3f_1738145246.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/b898a97a346068c4f8e95cc9c7cfdf2b5f700e3f_1738145246.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e700df7b307749ca60caa11d7f3c7a04d00a9c9f_1756393592.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/59b9e306824e687ce81138f2825b9c5434d97697_1756393593.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/04c75c51cbbc07ea2a81ac41df5f13838fbe22b0_1744474810.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0f9f02b78b5f4a68a36288a4ab73fe7f7ae42253_1744474811.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d471c3d8e041ab3d97d83dc1dc4605e0ff34ed31_1742051916.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f9b3e1c3dcc4ef950da9db9d7de9155e16f487ef_1742051912.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'مشکی',
  '[{"id":"black-1","name":"مشکی","hex":"#000000"},{"id":"jet-black-2","name":"مشکی براق ( جت بلک)","hex":"#444548"}]'::jsonb,
  '[{"label":"۵۱۲ گیگابایت","subtitle":"رم ۱۲ گیگابایت · پک ویتنام","priceDelta":0}]'::jsonb,
  '{"display":"۶.۹ اینچ Dynamic LTPO AMOLED 2X","displayDetails":"۱۲۰Hz · ۲۶۰۰ نیت · QHD+ 1440x3120","chipset":"Snapdragon 8 Elite (3 nm)","chipsetDetails":"۸ هسته‌ای Oryon V2 تا ۴.۴۷ گیگاهرتز","camera":"۲۰۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.7 · OIS · سلفی ۱۲ MP","battery":"۵۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۴۵ وات · قلم S-Pen داخل جعبه","storageDefault":"۵۱۲ گیگابایت","ram":"۱۲ گیگابایت","os":"Android 15"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-17918958"},{"label":"پک و کشور ساخت","value":"پک ویتنام با قلم S-Pen"}]'::jsonb,
  true,
  false,
  false,
  true,
  20,
  20,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-s25-ultra-512-vietnam';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/b898a97a346068c4f8e95cc9c7cfdf2b5f700e3f_1738145246.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', true, 0),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/e700df7b307749ca60caa11d7f3c7a04d00a9c9f_1756393592.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 1),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/59b9e306824e687ce81138f2825b9c5434d97697_1756393593.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 2),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/04c75c51cbbc07ea2a81ac41df5f13838fbe22b0_1744474810.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 3),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/0f9f02b78b5f4a68a36288a4ab73fe7f7ae42253_1744474811.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 4),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/d471c3d8e041ab3d97d83dc1dc4605e0ff34ed31_1742051916.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 5),
  ('galaxy-s25-ultra-512-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/f9b3e1c3dcc4ef950da9db9d7de9155e16f487ef_1742051912.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy S25 Ultra دو سیم کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت - پک ویتنام', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-s25-ultra-512-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-17918958-BLACK',
    'DKV-71474198',
    'مشکی',
    'Black',
    '#000000',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    462000000,
    NULL,
    425040000,
    true
  ),
  (
    'galaxy-s25-ultra-512-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-17918958-JETBLACK',
    'DKV-84711020',
    'مشکی براق ( جت بلک)',
    'Jet Black',
    '#444548',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    462000000,
    NULL,
    425040000,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-s25-ultra-512-vietnam';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-s25-ultra-512-vietnam', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.9::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Snapdragon 8 Elite (3 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 200::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5000::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 45::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 15', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (مقاوم در برابر آب تا ۱.۵ متر)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Xiaomi Redmi Note 17 4G Dual SIM Storage 256GB and RAM 8 GB Mobile Phone (DKP-22624841)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'redmi-note-17-4g-256',
  'redmi-note-17-4g-256',
  'گوشی موبایل شیائومی مدل Redmi Note 17 4G دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت',
  'Xiaomi Redmi Note 17 4G Dual SIM Storage 256GB and RAM 8 GB Mobile Phone',
  'Redmi Note 17 4G',
  'گوشی شیائومی Redmi Note 17 4G با حافظه ۲۵۶ گیگابایت و رم ۸ گیگابایت، نمایشگر ۶.۹ اینچی AMOLED ۱۲۰ هرتز و باتری کم‌نظیر ۷۷۰۰ میلی‌آمپر ساعتی با شارژ سریع ۴۵ وات.',
  'Xiaomi',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'xiaomi' OR lower(id) = 'xiaomi' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  80999000,
  86511300,
  6,
  true,
  18,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  '۶٪ تخفیف · باتری ۷۷۰۰',
  4.8,
  18,
  96,
  'https://dkstatics-public.digikala.com/digikala-products/e6f10bb94774a632e48f85821b0398142f69c099_1793782797.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/e6f10bb94774a632e48f85821b0398142f69c099_1793782797.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e08662a821d64ff09adc6afc3ee880336677bb4e_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9041a6d4559629dbd97f2b15cbdb3c3fdd4ca943_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6ef67d5081cf531368dc9cc962254815374f27e3_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'بنفش',
  '[{"id":"purple-1","name":"بنفش","hex":"#800080"},{"id":"light-blue-2","name":"آبی روشن","hex":"#aee9fc"},{"id":"black-3","name":"مشکی","hex":"#000000"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · نسخه 4G","priceDelta":0}]'::jsonb,
  '{"display":"۶.۹ اینچ AMOLED","displayDetails":"۱۲۰Hz · ۱۸۰۰ نیت · 1080x2396","chipset":"Snapdragon 6s 4G Gen 2 (6 nm)","chipsetDetails":"۸ هسته‌ای تا ۲.۹ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.8 · PDAF · سلفی ۱۶ MP","battery":"۷۷۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۴۵ وات · باتری فوق‌پرظرفیت","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22624841"},{"label":"نقطه قوت","value":"باتری غول‌پیکر ۷۷۰۰ میلی‌آمپری + نمایشگر ۶.۹ اینچی AMOLED"}]'::jsonb,
  true,
  true,
  true,
  true,
  21,
  21,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'redmi-note-17-4g-256';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('redmi-note-17-4g-256', 'https://dkstatics-public.digikala.com/digikala-products/e6f10bb94774a632e48f85821b0398142f69c099_1793782797.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Redmi Note 17 4G دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت', true, 0),
  ('redmi-note-17-4g-256', 'https://dkstatics-public.digikala.com/digikala-products/e08662a821d64ff09adc6afc3ee880336677bb4e_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Redmi Note 17 4G دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت', false, 1),
  ('redmi-note-17-4g-256', 'https://dkstatics-public.digikala.com/digikala-products/9041a6d4559629dbd97f2b15cbdb3c3fdd4ca943_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Redmi Note 17 4G دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت', false, 2),
  ('redmi-note-17-4g-256', 'https://dkstatics-public.digikala.com/digikala-products/6ef67d5081cf531368dc9cc962254815374f27e3_1788007074.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Redmi Note 17 4G دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت', false, 3);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'redmi-note-17-4g-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22624841-PURPLE',
    'DKV-92439338',
    'بنفش',
    'Purple',
    '#800080',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    80999000,
    86511300,
    74519080,
    true
  ),
  (
    'redmi-note-17-4g-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22624841-LIGHTBLUE',
    'DKV-92403872',
    'آبی روشن',
    'Light Blue',
    '#aee9fc',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    80999000,
    86511300,
    74519080,
    true
  ),
  (
    'redmi-note-17-4g-256',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22624841-BLACK',
    'DKV-92087450',
    'مشکی',
    'Black',
    '#000000',
    '۲۵۶ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    80999000,
    86511300,
    74519080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'redmi-note-17-4g-256';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'redmi-note-17-4g-256', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.9::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Snapdragon 6s 4G Gen 2', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 7700::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 45::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, false::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP65 (مقاوم در برابر گرد و غبار و پاشش آب)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy A57 Dual SIM Storage 256GB And RAM 12GB Mobile Phone - Vietnam (DKP-21660241)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-a57-256-vietnam',
  'galaxy-a57-256-vietnam',
  'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام',
  'Samsung Galaxy A57 Dual SIM Storage 256GB And RAM 12GB Mobile Phone - Vietnam',
  'Galaxy A57',
  'گوشی سامسونگ Galaxy A57 نسخه ویتنام با حافظه ۲۵۶ گیگابایت و رم ۱۲ گیگابایت، تراشه Exynos 1680، نمایشگر ۶.۷ اینچی Super AMOLED ۱۲۰ هرتز و گواهی ضدآب IP68.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  161999000,
  NULL,
  0,
  true,
  18,
  true,
  '۱۸ ماهه هماهنگ (داریا همراه)',
  'میان‌رده جدید ۲۰۲۶',
  4.5,
  150,
  90,
  'https://dkstatics-public.digikala.com/digikala-products/04cdc74409e5916ba60fb49ee59894e893dc4fd0_1790687799.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/04cdc74409e5916ba60fb49ee59894e893dc4fd0_1790687799.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9f7c19aa98b4a63196a55213bc395149e63c094f_1776267138.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/17c329e5f61844c28e528834c46e5f03eaf53ff3_1782822447.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/738ae43e9cd2f008533f040e16c8c79878eb6fea_1776267139.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0cb28a3dff0165d5abf42dc62a387e1d5deedffb_1776267140.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/fa8abf92584c938948eab61ff2195e1ab9bbb6a6_1776267141.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/fcb015e9b522f1978f9123e716ed0ba6800953e7_1782822447.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'آبی',
  '[{"id":"blue-1","name":"آبی","hex":"#0000FF"},{"id":"gray-2","name":"خاکستری","hex":"#9E9E9E"},{"id":"navy-3","name":"سرمه ای","hex":"#002171"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۱۲ گیگابایت · ساخت ویتنام","priceDelta":0}]'::jsonb,
  '{"display":"۶.۷ اینچ Super AMOLED","displayDetails":"۱۲۰Hz · ۱۹۰۰ نیت · 1080x2340","chipset":"Exynos 1680 (4 nm)","chipsetDetails":"۸ هسته‌ای تا ۲.۹ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.8 · لرزشگیر OIS · سلفی ۱۲ MP","battery":"۵۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۴۵ وات · استاندارد IP68","storageDefault":"۲۵۶ گیگابایت","ram":"۱۲ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-21660241"},{"label":"کشور مونتاژ","value":"ویتنام"},{"label":"پشتیبانی نرم‌افزاری","value":"۶ سال آپدیت رسمی سیستم‌عامل"}]'::jsonb,
  true,
  false,
  false,
  true,
  22,
  22,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-a57-256-vietnam';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/04cdc74409e5916ba60fb49ee59894e893dc4fd0_1790687799.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', true, 0),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/9f7c19aa98b4a63196a55213bc395149e63c094f_1776267138.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 1),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/17c329e5f61844c28e528834c46e5f03eaf53ff3_1782822447.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 2),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/738ae43e9cd2f008533f040e16c8c79878eb6fea_1776267139.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 3),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/0cb28a3dff0165d5abf42dc62a387e1d5deedffb_1776267140.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 4),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/fa8abf92584c938948eab61ff2195e1ab9bbb6a6_1776267141.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 5),
  ('galaxy-a57-256-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/fcb015e9b522f1978f9123e716ed0ba6800953e7_1782822447.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A57 دو سیم‌کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-a57-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21660241-BLUE',
    'DKV-83648948',
    'آبی',
    'Blue',
    '#0000FF',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    161999000,
    NULL,
    149039080,
    true
  ),
  (
    'galaxy-a57-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21660241-GRAY',
    'DKV-83700301',
    'خاکستری',
    'Gray',
    '#9E9E9E',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    161200000,
    164000000,
    148304000,
    true
  ),
  (
    'galaxy-a57-256-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21660241-NAVY',
    'DKV-80922623',
    'سرمه ای',
    'Navy',
    '#002171',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    161999000,
    NULL,
    149039080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-a57-256-vietnam';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-a57-256-vietnam', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.7::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Exynos 1680 (4 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5000::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 45::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 (ضد آب تا عمق ۱.۵ متر)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy A27 Dual SIM Storage 128GB and RAM 8GB Mobile Phone - Vietnam (DKP-22118518)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-a27-128-vietnam',
  'galaxy-a27-128-vietnam',
  'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام',
  'Samsung Galaxy A27 Dual SIM Storage 128GB and RAM 8GB Mobile Phone - Vietnam',
  'Galaxy A27',
  'گوشی سامسونگ Galaxy A27 نسخه ویتنام با ظرفیت ۱۲۸ گیگابایت و رم ۸ گیگابایت، پردازنده Snapdragon 6 Gen 3، نمایشگر ۶.۷ اینچی Super AMOLED ۱۲۰ هرتز و دوربین ۵۰ مگاپیکسلی مجهز به OIS.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  95999000,
  97200000,
  1,
  true,
  18,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  'اقتصادی محبوب',
  4.6,
  13,
  92,
  'https://dkstatics-public.digikala.com/digikala-products/e2debbbe506f3f2d57becc424fca2ad767298a83_1790756355.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/e2debbbe506f3f2d57becc424fca2ad767298a83_1790756355.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1732c442452ce20e1f6601edcb241fbe567f444b_1795020780.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8cd9996a51bcbfa202cae9062278f8b80f405e85_1795020785.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9907e96da3d3ee2e25e492c04dc44cf60f5784b9_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c6aa65cf5213039a72cd95cd473ffe11bd6c9af9_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2050786e148c7d818b9a5d6c092a6c256634d6e0_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d23d1fed43014581b53f1cbbdad08a15f517d1d0_1782734425.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'مشکی',
  '[{"id":"black-1","name":"مشکی","hex":"#000000"},{"id":"pink-2","name":"صورتی","hex":"#ffc0cb"},{"id":"blue-3","name":"آبی","hex":"#0000FF"}]'::jsonb,
  '[{"label":"۱۲۸ گیگابایت","subtitle":"رم ۸ گیگابایت · ساخت ویتنام","priceDelta":0}]'::jsonb,
  '{"display":"۶.۷ اینچ Super AMOLED","displayDetails":"۱۲۰Hz · 1080x2340","chipset":"Snapdragon 6 Gen 3 (4 nm)","chipsetDetails":"۸ هسته‌ای تا ۲.۴ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.8 · لرزشگیر OIS · سلفی ۱۲ MP","battery":"۵۰۰۰ میلی‌آمپر ساعت","batteryDetails":"شارژ سریع ۲۵ وات · IP64","storageDefault":"۱۲۸ گیگابایت","ram":"۸ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22118518"},{"label":"کشور مونتاژ","value":"ویتنام"}]'::jsonb,
  true,
  false,
  false,
  false,
  23,
  23,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-a27-128-vietnam';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/e2debbbe506f3f2d57becc424fca2ad767298a83_1790756355.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', true, 0),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/1732c442452ce20e1f6601edcb241fbe567f444b_1795020780.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 1),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/8cd9996a51bcbfa202cae9062278f8b80f405e85_1795020785.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 2),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/9907e96da3d3ee2e25e492c04dc44cf60f5784b9_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 3),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/c6aa65cf5213039a72cd95cd473ffe11bd6c9af9_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 4),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/2050786e148c7d818b9a5d6c092a6c256634d6e0_1782734424.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 5),
  ('galaxy-a27-128-vietnam', 'https://dkstatics-public.digikala.com/digikala-products/d23d1fed43014581b53f1cbbdad08a15f517d1d0_1782734425.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A27 دو سیم کارت ظرفیت 128 گیگابایت و رم 8 گیگابایت - ویتنام', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-a27-128-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22118518-BLACK',
    'DKV-82786873',
    'مشکی',
    'Black',
    '#000000',
    '۱۲۸ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    95999000,
    97200000,
    88319080,
    true
  ),
  (
    'galaxy-a27-128-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22118518-PINK',
    'DKV-84711597',
    'صورتی',
    'Pink',
    '#ffc0cb',
    '۱۲۸ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    95999000,
    97200000,
    88319080,
    true
  ),
  (
    'galaxy-a27-128-vietnam',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-22118518-BLUE',
    'DKV-82786881',
    'آبی',
    'Blue',
    '#0000FF',
    '۱۲۸ گیگابایت',
    '۸ گیگابایت',
    'Dual SIM (Physical)',
    95999000,
    97200000,
    88319080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-a27-128-vietnam';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-a27-128-vietnam', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.7::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Snapdragon 6 Gen 3 (4 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5000::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 25::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP64 (مقاوم در برابر پاشش آب و گرد و غبار)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Samsung Galaxy A56 Dual SIM Storage 256GB And 12GB RAM Mobile Phone - With 25W Samsung Charger (DKP-19279020)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'galaxy-a56-256-charger25w',
  'galaxy-a56-256-charger25w',
  'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ',
  'Samsung Galaxy A56 Dual SIM Storage 256GB And 12GB RAM Mobile Phone - With 25W Samsung Charger',
  'Galaxy A56',
  'گوشی سامسونگ Galaxy A56 با حافظه ۲۵۶ گیگابایت و رم ۱۲ گیگابایت، تراشه Exynos 1580 و نمایشگر Super AMOLED به همراه شارژر ۲۵ وات سامسونگ.',
  'Samsung',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'samsung' OR lower(id) = 'samsung' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  139372000,
  140780000,
  1,
  true,
  6,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  'همراه شارژر ۲۵ وات',
  4.5,
  66,
  90,
  'https://dkstatics-public.digikala.com/digikala-products/833ec7e95ed1ee6426eefabe4acde00b93d8fcfe_1747664580.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/833ec7e95ed1ee6426eefabe4acde00b93d8fcfe_1747664580.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/10a4450bf6882a6cf041d5f64d617d34f908f59c_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1f36893dd52378e597d14e5bd70c2f49abe9ccda_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ee19ab607f5fd9d36b11efb3c1a2c01ba54a5c51_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c564c483efdd8a905d831fd0635a4b96d3883f7e_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4fb7696f4455e8cddcce77ba9fd112456b4bf36b_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8f88d5aa73ddcc7437cd43215473f8bcfbfa28c2_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'زیتونی',
  '[{"id":"olive-1","name":"زیتونی","hex":"#808000"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۱۲ گیگابایت · همراه شارژر ۲۵ وات سامسونگ","priceDelta":0}]'::jsonb,
  '{"display":"۶.۷ اینچ Super AMOLED","displayDetails":"۱۲۰Hz · ۱۹۰۰ نیت · 1080x2340","chipset":"Exynos 1580 (4 nm)","chipsetDetails":"۸ هسته‌ای تا ۲.۹ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.8 · لرزشگیر OIS · سلفی ۱۲ MP","battery":"۵۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۴۵ وات (همراه شارژر ۲۵ وات سامسونگ)","storageDefault":"۲۵۶ گیگابایت","ram":"۱۲ گیگابایت","os":"Android 15"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-19279020"},{"label":"اقلام ویژه باندل","value":"همراه با شارژر ۲۵ وات سامسونگ"}]'::jsonb,
  true,
  false,
  false,
  true,
  24,
  24,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'galaxy-a56-256-charger25w';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/833ec7e95ed1ee6426eefabe4acde00b93d8fcfe_1747664580.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', true, 0),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/10a4450bf6882a6cf041d5f64d617d34f908f59c_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 1),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/1f36893dd52378e597d14e5bd70c2f49abe9ccda_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 2),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/ee19ab607f5fd9d36b11efb3c1a2c01ba54a5c51_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 3),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/c564c483efdd8a905d831fd0635a4b96d3883f7e_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 4),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/4fb7696f4455e8cddcce77ba9fd112456b4bf36b_1752427753.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 5),
  ('galaxy-a56-256-charger25w', 'https://dkstatics-public.digikala.com/digikala-products/8f88d5aa73ddcc7437cd43215473f8bcfbfa28c2_1752427752.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل سامسونگ مدل Galaxy A56 دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - به همراه شارژر 25 وات سامسونگ', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'galaxy-a56-256-charger25w',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-19279020-OLIVE',
    'DKV-79088024',
    'زیتونی',
    'Olive',
    '#808000',
    '۲۵۶ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    139372000,
    140780000,
    128222240,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'galaxy-a56-256-charger25w';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'galaxy-a56-256-charger25w', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.7::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'Exynos 1580 (4 nm)', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 5000::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 45::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 15', NULL::numeric, NULL::boolean),
  ('water_resistance', 'مقاوم در برابر آب و گرد و غبار', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- -----------------------------------------------------------------------------
-- Product: Xiaomi Poco X8 Pro Dual SIM Storage 512GB And RAM 12GB Mobile Phone (DKP-21872900)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id, slug, name_fa, name_en, model_name, description_fa,
  brand, category, brand_id, category_id, warranty_id,
  price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty,
  badge_text, rating, review_count, recommend_percent,
  image_url, images, color_label, colors, storage_options, specs, custom_specs,
  is_published, is_featured, is_featured_deal, is_popular,
  sales_rank, release_order, price_updated_at, updated_at
)
VALUES (
  'poco-x8-pro-512',
  'poco-x8-pro-512',
  'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت',
  'Xiaomi Poco X8 Pro Dual SIM Storage 512GB And RAM 12GB Mobile Phone',
  'Poco X8 Pro',
  'گوشی گیمینگ و قدرتمند شیائومی Poco X8 Pro با ظرفیت ۵۱۲ گیگابایت و رم ۱۲ گیگابایت، تراشه Dimensity 8500 Ultra، نمایشگر AMOLED با روشنایی ۳۵۰۰ نیت، باتری ۶۵۰۰ میلی‌آمپر ساعتی و شارژ سریع ۱۰۰ وات.',
  'Xiaomi',
  'phones',
  (SELECT id FROM public.brands WHERE lower(name) = 'xiaomi' OR lower(id) = 'xiaomi' LIMIT 1),
  (SELECT id FROM public.categories WHERE lower(id) = 'phones' OR lower(slug) = 'phones' LIMIT 1),
  (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
  158999000,
  174442000,
  9,
  true,
  18,
  true,
  '۱۸ ماهه شرکتی + کد رجیستری همتا',
  '۹٪ تخفیف · گیمینگ',
  4.4,
  106,
  88,
  'https://dkstatics-public.digikala.com/digikala-products/8ecf0fce5b38abf901a73e816e5107e2d01bfb7c_1790769104.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
  '["https://dkstatics-public.digikala.com/digikala-products/8ecf0fce5b38abf901a73e816e5107e2d01bfb7c_1790769104.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/26f599e25cf611777c28deb04c9bffc012c392ad_1779576063.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/43a8627f8832e820887e8a7ff09022b8dd77a88f_1779576064.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/649839dbfdd46db77be367596d84880269a30371_1779576065.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5b7483836d1dbf3d89eff49cb85f789c82b5fd22_1779576066.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1fe074c5543d6ace6e4783c6c45d5b78e3077804_1779576067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/cd4579dffabd5efb96d32fca61ea0978e41b6726_1779576068.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]'::jsonb,
  'سبز',
  '[{"id":"green-1","name":"سبز","hex":"#008000"},{"id":"black-2","name":"مشکی","hex":"#000000"},{"id":"yellow-3","name":"زرد","hex":"#FFFF00"}]'::jsonb,
  '[{"label":"۵۱۲ گیگابایت","subtitle":"رم ۱۲ گیگابایت · UFS 4.1","priceDelta":0}]'::jsonb,
  '{"display":"۶.۵۹ اینچ AMOLED","displayDetails":"۱۲۰Hz · ۳۵۰۰ نیت · 1268x2756 · Dolby Vision","chipset":"Mediatek Dimensity 8500 Ultra","chipsetDetails":"۸ هسته‌ای Cortex-A725 تا ۳.۴ گیگاهرتز","camera":"۵۰ مگاپیکسل","cameraDetails":"دیافراگم f/1.5 · لرزشگیر OIS · سلفی ۲۰ MP","battery":"۶۵۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۱۰۰ وات (شارژر داخل جعبه)","storageDefault":"۵۱۲ گیگابایت","ram":"۱۲ گیگابایت","os":"Android 16"}'::jsonb,
  '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-21872900"},{"label":"اقلام داخل جعبه","value":"کابل USB Type-C و آداپتور ۱۰۰ وات"},{"label":"حسگر و بدنه","value":"اثرانگشت اولتراسونیک زیر صفحه · فریم آلومینیوم"}]'::jsonb,
  true,
  true,
  true,
  true,
  25,
  25,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  warranty_id = EXCLUDED.warranty_id,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  warranty = EXCLUDED.warranty,
  badge_text = EXCLUDED.badge_text,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  recommend_percent = EXCLUDED.recommend_percent,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  color_label = EXCLUDED.color_label,
  colors = EXCLUDED.colors,
  storage_options = EXCLUDED.storage_options,
  specs = EXCLUDED.specs,
  custom_specs = EXCLUDED.custom_specs,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  price_updated_at = now(),
  updated_at = now();

DELETE FROM public.product_images WHERE product_id = 'poco-x8-pro-512';
INSERT INTO public.product_images (product_id, image_url, alt_text_fa, is_cover, sort_order)
VALUES
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/8ecf0fce5b38abf901a73e816e5107e2d01bfb7c_1790769104.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', true, 0),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/26f599e25cf611777c28deb04c9bffc012c392ad_1779576063.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 1),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/43a8627f8832e820887e8a7ff09022b8dd77a88f_1779576064.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 2),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/649839dbfdd46db77be367596d84880269a30371_1779576065.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 3),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/5b7483836d1dbf3d89eff49cb85f789c82b5fd22_1779576066.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 4),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/1fe074c5543d6ace6e4783c6c45d5b78e3077804_1779576067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 5),
  ('poco-x8-pro-512', 'https://dkstatics-public.digikala.com/digikala-products/cd4579dffabd5efb96d32fca61ea0978e41b6726_1779576068.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'گوشی موبایل شیائومی مدل Poco X8 Pro دو سیم‌کارت ظرفیت 512 گیگابایت و رم 12 گیگابایت', false, 6);

INSERT INTO public.product_variants (
  product_id, warranty_id, sku, barcode, color_name_fa, color_name_en, color_hex,
  storage, ram, sim_type, price_toman, original_price_toman, cost_price_toman, is_published
)
VALUES
  (
    'poco-x8-pro-512',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21872900-GREEN',
    'DKV-92344698',
    'سبز',
    'Green',
    '#008000',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    158999000,
    174442000,
    146279080,
    true
  ),
  (
    'poco-x8-pro-512',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21872900-BLACK',
    'DKV-92344740',
    'مشکی',
    'Black',
    '#000000',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    158999000,
    169636900,
    146279080,
    true
  ),
  (
    'poco-x8-pro-512',
    (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1),
    'DKP-21872900-YELLOW',
    'DKV-92397515',
    'زرد',
    'Yellow',
    '#FFFF00',
    '۵۱۲ گیگابایت',
    '۱۲ گیگابایت',
    'Dual SIM (Physical)',
    158999000,
    174442000,
    146279080,
    true
  )
ON CONFLICT (sku) DO UPDATE SET
  price_toman = EXCLUDED.price_toman,
  original_price_toman = EXCLUDED.original_price_toman,
  cost_price_toman = EXCLUDED.cost_price_toman,
  color_name_fa = EXCLUDED.color_name_fa,
  color_name_en = EXCLUDED.color_name_en,
  color_hex = EXCLUDED.color_hex,
  storage = EXCLUDED.storage,
  ram = EXCLUDED.ram,
  sim_type = EXCLUDED.sim_type,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.product_attribute_values WHERE product_id = 'poco-x8-pro-512';
INSERT INTO public.product_attribute_values (product_id, attribute_id, value_text, value_number, value_boolean)
SELECT 'poco-x8-pro-512', ad.id, v.val_text, v.val_num, v.val_bool
FROM (VALUES
  ('screen_size', NULL::text, 6.59::numeric, NULL::boolean),
  ('refresh_rate', NULL::text, 120::numeric, NULL::boolean),
  ('chipset', 'MediaTek Dimensity 8500 Ultra', NULL::numeric, NULL::boolean),
  ('main_camera_mp', NULL::text, 50::numeric, NULL::boolean),
  ('battery_mah', NULL::text, 6500::numeric, NULL::boolean),
  ('fast_charge_w', NULL::text, 100::numeric, NULL::boolean),
  ('network_5g', NULL::text, NULL::numeric, true::boolean),
  ('sim_type', 'دو سیم‌کارت (نانو)', NULL::numeric, NULL::boolean),
  ('os', 'Android 16', NULL::numeric, NULL::boolean),
  ('water_resistance', 'IP68 / IP69K (تا عمق ۱.۵ متر)', NULL::numeric, NULL::boolean)
) AS v(code, val_text, val_num, val_bool)
JOIN public.attribute_definitions ad ON ad.code = v.code;

-- 3. Seed warehouse stock & opening balance movements for all newly added variants
DO $$
DECLARE
  v_wh_id UUID;
BEGIN
  SELECT id INTO v_wh_id
  FROM public.warehouses
  WHERE is_active = true
  ORDER BY is_central DESC, created_at ASC
  LIMIT 1;

  IF v_wh_id IS NOT NULL THEN
    INSERT INTO public.warehouse_stock (
      warehouse_id, variant_id, shelf_location, quantity_on_hand, reserved_qty, min_stock_alert
    )
    SELECT
      v_wh_id,
      pv.id,
      'DK-PHONE-01',
      6,
      0,
      2
    FROM public.product_variants pv
    WHERE pv.product_id IN ('iphone-18-pro-max-zaa-256', 'galaxy-s26-ultra-256-vietnam', 'iphone-17-ch-256', 'iphone-17-pro-max-zaa-512', 'galaxy-s25-fe-256-vietnam', 'galaxy-s25-ultra-512-vietnam', 'redmi-note-17-4g-256', 'galaxy-a57-256-vietnam', 'galaxy-a27-128-vietnam', 'galaxy-a56-256-charger25w', 'poco-x8-pro-512')
      AND NOT EXISTS (
        SELECT 1 FROM public.warehouse_stock ws
        WHERE ws.warehouse_id = v_wh_id AND ws.variant_id = pv.id
      );

    INSERT INTO public.stock_movements (
      warehouse_id, variant_id, quantity_change, balance_after,
      movement_type, shelf_location, reference_type, reference_id,
      note_fa, idempotency_key
    )
    SELECT
      v_wh_id,
      pv.id,
      6,
      6,
      'opening_balance',
      'DK-PHONE-01',
      'digikala_import',
      pv.product_id,
      'موجودی اولیه ورود محصول از دیجی‌کالا',
      'dk-opening-' || pv.sku
    FROM public.product_variants pv
    WHERE pv.product_id IN ('iphone-18-pro-max-zaa-256', 'galaxy-s26-ultra-256-vietnam', 'iphone-17-ch-256', 'iphone-17-pro-max-zaa-512', 'galaxy-s25-fe-256-vietnam', 'galaxy-s25-ultra-512-vietnam', 'redmi-note-17-4g-256', 'galaxy-a57-256-vietnam', 'galaxy-a27-128-vietnam', 'galaxy-a56-256-charger25w', 'poco-x8-pro-512')
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
