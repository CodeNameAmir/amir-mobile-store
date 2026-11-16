-- ============================================================================
-- Optional Initial Catalog Seed for public.products
-- Run this once after schema.sql if you want the initial 14 products visible
-- inside your future Admin Panel immediately.
-- ============================================================================

insert into public.products (
  id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent,
  in_stock, stock_count, express_delivery, warranty, badge_text, rating, review_count,
  recommend_percent, color_label, is_featured_deal, is_popular, sales_rank, release_order,
  colors, storage_options, specs
)
values
(
  'iphone-16-pro-max', 'iphone-16-pro-max',
  'گوشی موبایل اپل مدل iPhone 16 Pro Max دو سیم‌کارت',
  'Apple iPhone 16 Pro Max Dual SIM 5G - Titanium Edition',
  'Apple', 'phones', 94200000, 98000000, 4, true, 5, true,
  '۱۸ ماهه جامع امیر سرویس + کد رجیستری همتا', '۴٪ تخفیف', 4.9, 142, 96, 'تیتانیوم کویری',
  false, true, 1, 1,
  '[{"id":"desert","name":"تیتانیوم کویری (Desert Titanium)","hex":"#C5B4A0"},{"id":"midnight","name":"تیتانیوم مشکی (Black Titanium)","hex":"#2A2B2D"},{"id":"silver","name":"تیتانیوم سفید (White Titanium)","hex":"#E3E4E5"},{"id":"titanium","name":"تیتانیوم طبیعی (Natural Titanium)","hex":"#8E8B82"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"نسخه استاندارد","priceDelta":0},{"label":"۵۱۲ گیگابایت","subtitle":"پیشنهاد ادیتورها","priceDelta":12300000},{"label":"۱ ترابایت","subtitle":"فیلمبرداری ProRes","priceDelta":25600000}]'::jsonb,
  '{"display":"۶.۹ اینچ OLED","displayDetails":"۱۲۰Hz ProMotion · ۲۰۰۰ نیت","chipset":"Apple A18 Pro","chipsetDetails":"معماری ۳ نانومتری","camera":"۴۸ + ۴۸ + ۱۲ MP","cameraDetails":"زوم اپتیکال ۵ برابری","battery":"۴۶۸۵ میلی‌آمپر","batteryDetails":"شارژ بی‌سیم مگ‌سیف","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگ","os":"iOS 18"}'::jsonb
),
(
  'galaxy-s24-ultra', 'galaxy-s24-ultra',
  'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra 5G',
  'Samsung Galaxy S24 Ultra 5G Titanium Gray',
  'Samsung', 'phones', 63800000, 68500000, 7, true, 3, true,
  '۱۸ ماهه هماهنگ + رجیستری رسمی', '۷٪ تخفیف', 4.8, 118, 95, 'خاکستری تیتانیوم',
  true, true, 2, 2,
  '[{"id":"titanium","name":"خاکستری تیتانیوم","hex":"#9c9589"},{"id":"midnight","name":"مشکی تیتانیوم","hex":"#1e293b"},{"id":"purple","name":"بنفش تیتانیوم","hex":"#581c87"}]'::jsonb,
  '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۱۲ گیگابایت","priceDelta":0},{"label":"۵۱۲ گیگابایت","subtitle":"رم ۱۲ گیگابایت","priceDelta":7400000}]'::jsonb,
  '{"display":"۶.۸ اینچ Dynamic AMOLED 2X","displayDetails":"۱۲۰Hz · قلم S-Pen","chipset":"Snapdragon 8 Gen 3","chipsetDetails":"نسخه اختصاصی Galaxy","camera":"۲۰۰ + ۵۰ + ۱۲ + ۱۰ MP","cameraDetails":"زوم ۱۰۰ برابری Space Zoom","battery":"۵۰۰۰ میلی‌آمپر","batteryDetails":"فست شارژ ۴۵ وات","storageDefault":"۵۱۲ گیگابایت","ram":"۱۲ گیگ","os":"Android 14 · Galaxy AI"}'::jsonb
),
(
  'xiaomi-14-ultra', 'xiaomi-14-ultra',
  'گوشی موبایل شیائومی مدل Xiaomi 14 Ultra دوربین لایکا',
  'Xiaomi 14 Ultra 5G Leica Optics - 512GB',
  'Xiaomi', 'phones', 57900000, 61500000, 6, true, 4, true,
  '۱۸ ماهه تسکو + کد همتا', 'ویژه عکاسی', 4.9, 68, 94, 'مشکی چرمی',
  false, true, 4, 3,
  '[{"id":"midnight","name":"مشکی چرمی","hex":"#1f2937"},{"id":"silver","name":"سفید سرامیکی","hex":"#e2e8f0"}]'::jsonb,
  '[{"label":"۵۱۲ گیگابایت","subtitle":"رم ۱۶ گیگابایت","priceDelta":0}]'::jsonb,
  '{"display":"۶.۷۳ اینچ LTPO AMOLED","displayDetails":"۱۲۰Hz · Dolby Vision","chipset":"Snapdragon 8 Gen 3","chipsetDetails":"سیستم خنک‌کننده IceLoop","camera":"۵۰ MP چهارگانه لایکا","cameraDetails":"لنز Summilux متغیر","battery":"۵۰۰۰ میلی‌آمپر","batteryDetails":"فست شارژ ۹۰ وات","storageDefault":"۵۱۲ گیگابایت","ram":"۱۶ گیگ","os":"HyperOS"}'::jsonb
),
(
  'airpods-pro-2-usbc', 'airpods-pro-2-usbc',
  'هندزفری بی‌سیم اپل مدل AirPods Pro 2 نسل جدید تایپ‌سی',
  'Apple AirPods Pro (2nd Gen) MagSafe USB-C',
  'Apple', 'audio', 10850000, 14200000, 24, true, 11, true,
  '۱۲ ماهه طلایی امیر سرویس', '۲۴٪ تخفیف', 4.9, 175, 97, 'سفید',
  true, false, 7, 7,
  '[{"id":"silver","name":"سفید","hex":"#f1f5f9"}]'::jsonb,
  '[{"label":"نسخه USB-C","subtitle":"پشتیبانی MagSafe","priceDelta":0}]'::jsonb,
  '{"display":"محفظه شارژ هوشمند","displayDetails":"اسپیکر داخلی Find My","chipset":"Apple H2","chipsetDetails":"حذف نویز فعال ۲ برابری","camera":"حسگر لمسی دقیق","cameraDetails":"تنظیم صدا با سوایپ","battery":"۳۰ ساعت شارژدهی","batteryDetails":"شارژ USB-C و مگ‌سیف","storageDefault":"پورت Type-C","ram":"۸ گیگ","os":"سازگار با iOS و اندروید"}'::jsonb
),
(
  'apple-watch-ultra-2', 'apple-watch-ultra-2',
  'ساعت هوشمند اپل واچ اولترا ۲ بدنه تیتانیوم',
  'Apple Watch Ultra 2 Titanium 49mm',
  'Apple', 'smartwatches', 43200000, 48000000, 10, true, 2, true,
  '۱۸ ماهه امیر سرویس', '۱۰٪ تخفیف', 4.9, 53, 98, 'تیتانیوم طبیعی',
  true, false, 8, 8,
  '[{"id":"titanium","name":"تیتانیوم طبیعی","hex":"#9c9589"}]'::jsonb,
  '[{"label":"۴۹ میلی‌متر","subtitle":"بند آلپاین / تریل","priceDelta":0}]'::jsonb,
  '{"display":"۴۹ میلی‌متر Retina OLED","displayDetails":"روشنایی ۳۰۰۰ نیت","chipset":"Apple S9 SiP","chipsetDetails":"کنترل با ژست Double Tap","camera":"سنسور اکسیژن و ECG","cameraDetails":"GPS دوفرکانسه دقیق","battery":"تا ۷۲ ساعت شارژدهی","batteryDetails":"مقاوم تا عمق ۱۰۰ متر","storageDefault":"۶۴ گیگابایت","ram":"۸ گیگ","os":"watchOS 11"}'::jsonb
),
(
  'anker-prime-powerbank-24000', 'anker-prime-powerbank-24000',
  'پاوربانک ۲۴۰۰۰ انکر مدل Prime با توان خروجی 140W',
  'Anker 737 Power Bank (PowerCore 24K) 140W GaN',
  'Anker', 'chargers', 6970000, 8500000, 18, true, 5, true,
  '۱۸ ماهه گارانتی تعویض انکر', '۱۸٪ تخفیف', 4.9, 92, 96, 'خاکستری متالیک',
  true, false, 9, 9,
  '[{"id":"midnight","name":"خاکستری متالیک","hex":"#334155"}]'::jsonb,
  '[{"label":"۲۴۰۰۰ میلی‌آمپر","subtitle":"نمایشگر دیجیتال","priceDelta":0}]'::jsonb,
  '{"display":"نمایشگر دیجیتال هوشمند","displayDetails":"نمایش لحظه‌ای توان وات","chipset":"PowerIQ 3.0 + PD 3.1","chipsetDetails":"پشتیبانی شارژ مک‌بوک","camera":"۲ پورت USB-C + ۱ USB-A","cameraDetails":"توزیع هوشمند انرژی","battery":"۲۴۰۰۰ میلی‌آمپر","batteryDetails":"توان خروجی ۱۴۰ وات","storageDefault":"۲۴۰۰۰ میلی‌آمپر","ram":"۸ گیگ","os":"ActiveShield 2.0"}'::jsonb
)
on conflict (id) do nothing;
