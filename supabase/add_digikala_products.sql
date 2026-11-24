-- ============================================================================
-- 27 Real Digikala Products Import (Tablets, Chargers/Powerbanks, Smartwatches, Audio)
-- Matches public.products schema + ensures required brands/categories exist first
-- ============================================================================

INSERT INTO public.categories (id, slug, label, subtitle, is_active, sort_order)
VALUES
  ('tablets', 'tablets', 'تبلت', 'آیپد و گلکسی تب', true, 3),
  ('smartwatches', 'smartwatches', 'ساعت هوشمند', 'اپل واچ و گلکسی واچ', true, 4),
  ('audio', 'audio', 'هدفون و ایرپاد', 'ایرپاد و استودیویی', true, 5),
  ('chargers', 'chargers', 'شارژر و پاوربانک', 'فست شارژ GaN اورجینال', true, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brands (id, name, label_fa, is_active, slug, sort_order)
VALUES
  ('apple', 'Apple', 'اپل', true, 'apple', 1),
  ('samsung', 'Samsung', 'سامسونگ', true, 'samsung', 2),
  ('xiaomi', 'Xiaomi', 'شیائومی', true, 'xiaomi', 3),
  ('anker', 'Anker', 'انکر', true, 'anker', 6),
  ('romoss', 'Romoss', 'روموس', true, 'romoss', 8),
  ('topomax', 'Topomax', 'توپومکس', true, 'topomax', 9),
  ('music-apollo', 'Music Apollo', 'موزیک آپولو', true, 'music-apollo', 10),
  ('qcy', 'QCY', 'کیو سی وای', true, 'qcy', 11),
  ('nothing', 'Nothing', 'ناتینگ', true, 'nothing', 12)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('ipad-pro-2025-m5-13-nano-2tb', 'ipad-pro-2025-m5-13-nano-2tb', 'تبلت 13 اینچ اپل مدل IPad Pro 2025 M5 Wi-Fi Nano-Texture ظرفیت 2 ترابایت و رم 16 گیگابایت، رزولوشن دوربین 12 مگاپیکسل، پشتیبانی از قلم و کیبورد', 'Apple iPad Pro 13-inch (2025) M5 Wi-Fi Nano-Texture 2TB 16GB RAM', 'Apple', 'tablets', 577490000, NULL, 0, true, 1, true, 'گارانتی 18 ماهه راسا همراه سورن', '5.0', 1, '{"display":"۱۳ اینچ Ultra Retina Tandem OLED","displayDetails":"۱۲۰Hz ProMotion · ۱۶۰۰ نیت · Nano-Texture","chipset":"Apple M5","chipsetDetails":"پردازنده ۹ هسته‌ای + گرافیک ۱۰ هسته‌ای","camera":"۱۲ مگاپیکسل + اسکنر LiDAR","cameraDetails":"فیلمبرداری 4K ProRes · سلفی ۱۲ MP Center Stage","battery":"۱۰۲۹۰ میلی‌آمپر ساعت (۳۸.۹۹Wh)","batteryDetails":"تا ۱۰ ساعت شارژدهی · USB-C 4 Thunderbolt","storageDefault":"۲ ترابایت","ram":"۱۶ گیگابایت","os":"iPadOS 26"}', '[{"label":"۲ ترابایت","subtitle":"رم ۱۶ گیگابایت · شیشه Nano-Texture","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/effef468b24f56ff795cc060373fa6cf6387f55d_1787918317.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', 'تراشه M5 · نانو تکسچر', 98, false, true, 17, 17, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/effef468b24f56ff795cc060373fa6cf6387f55d_1787918317.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7f6b10ff0e7de434a1091088f3d963224e013257_1771426158.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6a8f35824e9aa1eb6dfe030c19398bd5af36029c_1779535758.png?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c0521f6b86db582653c73168dde42d62a9ae6ebe_1761544670.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/83bcd4d824ce445ae486b50e199a51dead026e9b_1761544670.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/294dfeb630fa011ca1ab2c8125479e008bedf460_1761544670.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/aa57fdd23072d7be7ceeb17c3584d300defa0c53_1761544670.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d109911f2af6d3e60913b260c7e64105b0d95fae_1761544671.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20768071"},{"label":"نوع نمایشگر","value":"Ultra Retina Tandem OLED با پوشش ضد بازتاب Nano-Texture"},{"label":"ضخامت و وزن","value":"۵.۱ میلی‌متر · ۵۷۹ گرم"},{"label":"پشتیبانی لوازم جانبی","value":"Apple Pencil Pro و Magic Keyboard"}]', '2026-11-24 19:25:00+00', 'iPad Pro 13 2025 M5 Nano-Texture', 'تبلت ۱۳ اینچ اپل مدل iPad Pro 2025 M5 Wi‑Fi Nano-Texture نسخه‌ای کاملاً حرفه‌ای از نسل جدید آیپدهای اپل است که با طراحی باریک‌تر، صفحه‌نمایش خیره‌کننده و قدرت پردازشی بی‌رقیب، مرز میان تبلت و لپ‌تاپ را بار دیگر جابه‌جا کرده است.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'tablets', 'بررسی iPad Pro ۲۰۲۵ M5 Wi‑Fi: تبلتی در قامت یک لپ‌تاپ حرفه‌ای
هر سال با معرفی نسل تازه‌ای از آیپد پرو، مرز میان «تبلت» و «ایستگاه کاری» کم‌رنگ‌تر می‌شود. امسال نیز اپل با عرضه‌ی iPad Pro ۲۰۲۵ M5 Wi‑Fi در اندازه‌ی ۱۳ اینچ، بار دیگر استانداردهای توان، کیفیت تصویر و بهره‌وری را از نو تعریف کرده است. نمایشگر خیره‌کننده‌ی Ultra Retina Tandem OLED، تراشه‌ی قدرتمند Apple M5 با موتور عصبی ۱۶ هسته‌ای و پشتیبانی از قلم Apple Pencil Pro و هوش مصنوعی Apple Intelligence این تبلت را به ابزاری کامل برای طراحی، تدوین، تولید محتوا و حتی پردازش‌های سنگین گرافیکی تبدیل کرده است. در واقع، iPad Pro ۲۰۲۵ نه صرفاً یک ابزار همراه، بلکه بخشی از زیست‌بوم حرفه‌ای اپل است که نرخ نوآوری در آن خیره‌کننده جلوه می‌کند.

طراحی و کیفیت ساخت؛ ظرافت در عین استحکام؛ نمایشگر: تصویری فراتر از واقعی
جنس بدنه‌ی فلزی با پنل پشتی آلومینیومی و رویه‌ی شیشه‌ای مقاوم، هم جلوه‌ای لوکس و هم حس استقراری مطمئن ارائه می‌کند. ضخامت تنها ۵.۱ میلی‌متر و وزن ۵۷۹ گرم برای تبلتی با صفحه‌ی ۱۳ اینچ، نشان از مهندسی فوق‌العاده دقیق اپل دارد. نسبت نمایشگر به بدنه، با رقم چشمگیر ۸۶.۲ درصد، تجربه‌ای تمام‌صفحه را به کاربر می‌دهد و حذف هر جزئی اضافه، زیبایی مینیمالیستی اپل را به اوج رسانده است. لبه‌های تخت، گوشه‌های نرم و توزیع دقیق اجزای داخلی باعث شده تعادل وزن بی‌نقصی احساس شود. وجود Face ID در حاشیه‌ی بالا، حفظ یکپارچگی ظاهری را تضمین کرده و سیستم صوتی چهارگانه، بدون هیچ برآمدگی، در فریم قاب تعبیه شده است. درگاه USB‑C ۴ با پشتیبانی از Thunderbolt ۳ علاوه بر انتقال داده‌ی ۴۰ گیگابیتی، امکان اتصال مستقیم به نمایشگرهای ۶K و دیسک‌های اکسترنال حرفه‌ای را ایجاد می‌کند. اپل در این نسل توازن کاملی میان زیبایی، سبکی و استحکام برقرار کرده است. مهم‌ترین نقطه‌ی قوت iPad Pro ۲۰۲۵ بی‌تردید نمایشگر آن است. فناوری دو‌لایه‌ی Tandem OLED برای نخستین‌بار در تبلت‌های اپل استفاده شده تا روشنایی، کنتراست و دقت رنگی بی‌نظیر فراهم شود. وضوح ۲۷۵۲ در ۲۰۶۴ پیکسل با تراکم ۲۶۴ ppi تصویری استودیوئی ارائه می‌دهد که برای طراحان، ویرایش‌گران و سینمادوستان ایده‌آل است. نسبت تصویر ۴:۳ باعث شده فضای کاری در حالت افقی گسترده و برای بهره‌وری بهتر از اپلیکیشن‌های چند‌پنجره‌ای مناسب باشد. نمایشگر با نرخ نوسازی ۱۲۰ هرتز و فناوری ProMotion توانایی تغییر بازه‌ی فریم بین ۱۰ تا ۱۲۰ هرتز را دارد، تا هنگام مطالعه یا طراحی، هم مصرف انرژی مدیریت شود و هم حرکت قلم و تصویر طبیعی و بی‌تأخیر باقی بماند. پشتیبانی از HDR ۱۰، Dolby Vision و فضای رنگی Wide Color (P3) سبب شده نمایشگر Ultra Retina XDR، تصاویری با عمق رنگی حرفه‌ای و درخشندگی چشمگیر تا ۱۶۰۰ نیت در حالت HDR به نمایش بگذارد. قابلیت Apple Pencil hover با تشخیص موقعیت نوک قلم قبل از تماس، دقت طراحی را به سطح ابزارهای گرافیکی تخصصی رسانده است. تماشای محتوای سینمایی یا ویرایش عکس در این نمایشگر، با رنگ‌های واقعی و مشکی کاملاً خالص، به تجربه‌ای خیره‌کننده تبدیل می‌شود.

قدرت سخت‌افزاری: عملکردی هم‌سطح مک‌بوک‌های حرفه‌ای
تراشه‌ی Apple M5 که در قالب معماری ترکیبی چهار هسته Performance و شش هسته Efficiency طراحی شده، سطح تازه‌ای از سرعت و بهره‌وری را عرضه می‌کند. موتور عصبی ۱۶ هسته‌ای همراه با شتاب‌دهنده‌های یادگیری عمیق (Neural Accelerators) توانایی اجرای مدل‌های AI را به‌صورت محلی فراهم کرده است. این یعنی تمام پردازش‌های مربوط به Apple Intelligence، از تحلیل تصویر تا تولید متن و پیشنهادهای زبانی، بدون وابستگی به اینترنت انجام می‌شود. پردازنده‌ی گرافیکی ۱۰ هسته‌ای با پشتیبانی از رهگیری پرتو سخت‌افزاری (Hardware‑accelerated ray tracing) باعث شده تجربه‌ی بازی یا رندر سه‌بعدی در نرم‌افزارهایی مانند Blender و Shapr3D در حد یک لپ‌تاپ قدرتمند باشد. تبلت اکنون قادر است خروجی ۴K ProRes را در Final Cut Pro در زمان واقعی رندر کند و تا چند لایه افکت سنگین را بدون کاهش فریم اجرا کند.
اپل برای این نسل مجموعه‌ای از پیکربندی‌ها را عرضه کرده تا کاربر بسته به نیاز خود میان ظرفیت و رم انتخاب داشته باشد. نسخه‌ی پایه با ۲۵۶ گیگابایت حافظه‌ی داخلی و رم ۱۲ گیگابایت برای استفاده‌های روزمره، طراحی گرافیکی سبک یا تدوین کوتاه عملکردی ایده‌آل دارد. همین ترکیب در ظرفیت ۵۱۲ گیگابایت نیز عرضه می‌شود که فضا را برای آرشیو پروژه‌های حجیم افزایش می‌دهد، در حالی که سرعت دسترسی حافظه ثابت می‌ماند. برای کاربرانی که با فایل‌های RAW، پروژه‌های ۴K ProRes یا مدل‌های سه‌بعدی کار می‌کنند، نسخه‌های ۱ ترابایت و ۲ ترابایت هر دو با رم ۱۶ گیگابایت در دسترس است. این میزان حافظه، اجرای هم‌زمان چند اپلیکیشن حرفه‌ای همچون DaVinci Resolve و Affinity Photo را بدون کوچک‌ترین تأخیر ممکن کرده است. پهنای‌باند حافظه‌ی ۱۵۳ گیگابایت‌بر‌ثانیه تضمین می‌کند که همه‌ی فایل‌ها با بالاترین سرعت ممکن از حافظه به GPU یا CPU منتقل شوند. هرچند همچنان اسلات کارت حافظه وجود ندارد، ولی پشتیبانی کامل از حافظه‌های SSD خارجی از طریق درگاه Thunderbolt ۳ کمبود آن را جبران کرده است.

سیستم‌عامل و هوش مصنوعی Apple Intelligence
iPad Pro ۲۰۲۵ به‌صورت پیش‌فرض با iPadOS ۲۶ عرضه شده است. این نسخه با تمرکز بر تجربه‌ی چندوظیفه‌ای و تعامل طبیعی با قلم و کیبورد بازطراحی شده است. قابلیت Stage Manager اجازه می‌دهد چند پنجره‌ی شناور در محیطی مشابه دسکتاپ مدیریت شود و در کنار آن، هوش مصنوعی Apple Intelligence هوشمندانه به کاربر کمک می‌کند تا محتواها را سازمان‌دهی کند. این هوش مصنوعی به لطف قدرت پردازشی M5 قادر است متن‌ها را خلاصه کند، تصاویر را بر اساس محتوا و موقعیت دسته‌بندی نماید و حتی پیشنهادهای هوشمند در برنامه‌هایی مانند Mail و Notes ارائه دهد. تمام پردازش‌ها رمزنگاری شده و روی دستگاه انجام می‌شود، در نتیجه حریم خصوصی حفظ و امنیت شخصی تضمین می‌شود.

دوربین‌ها: عملکردی فراتر از نیاز روزمره
اپل در پشت دستگاه تنها از یک ماژول دوربین استفاده کرده، اما جزئیات ظاهراً ساده‌ای چون سنسور عمق‌سنج LiDAR TOF ۳D و فناوری Dual Pixel PDAF باعث شده کیفیت عکس فراتر از انتظار بماند. گشودگی دیافراگم f/1.8 و پشتیبانی از Smart HDR 4 در شرایط نوری دشوار نیز تصویری کاملاً متعادل و طبیعی ثبت می‌کند. فیلم‌برداری با رزولوشن‌های ۴K @ ۲۴/۲۵/۳۰/۶۰ fps و ۱۰۸۰p @ ۲۴۰ fps انجام می‌شود و لرزشگیر Cinematic دوام حرکتی با ثبات بالایی به تصویر می‌دهد. دوربین سلفی ۱۲ مگاپیکسلی Ultra Wide با زاویه‌ی ۱۲۲ درجه و قابلیت Center Stage برای تماس‌های ویدیویی طراحی شده است. این دوربین به‌صورت خودکار موقعیت کاربر را در تصویر تنظیم می‌کند و با بهره‌گیری از فناوری Smart HDR ۴ و Retina Flash کیفیت ویدیو را در نور کم نیز حفظ می‌کند. برای جلسات آنلاین یا ضبط کلاس، خروجی تصویر این تبلت از بسیاری لپ‌تاپ‌ها بالاتر است.

باتری و شارژدهی: دوام انرژی، تعادل در کارکرد؛ صدا و ارتباطات: کیفیت سینمایی در قالبی سبک
سیستم تغذیه‌ی تبلت شامل باتری لیتیوم‌پلیمری ۳۸.۹۹ وات‌ساعتی است که تا ۱۰ ساعت پخش ویدیو یا وب‌گردی مداوم را پشتیبانی می‌کند. نمایشگر OLED و معماری کارآمد M5 موجب کاهش مصرف تا ۱۵ درصد نسبت به نسل قبل شده است. شارژ از طریق درگاه USB‑C و آداپتور ۲۰ واتی انجام می‌شود و طی حدود دو ساعت باتری به‌طور کامل پر می‌گردد. اپل به‌واسطه‌ی کنترل دقیق دمای شارژ، عمر چرخه‌ی باتری را تا بیش از ۱۰۰۰ بار شارژ تضمین کرده است. پایداری انرژی هنگام اتصال هم‌زمان به مانیتور خارجی یا تجهیزات Thunderbolt نیز بهینه باقی می‌ماند. چهار اسپیکر استریو در دو سمت فریم، صدا را با حجم و وضوح عالی پخش می‌کنند. تفکیک فرکانس‌های پایین و بالا در این تبلت در سطح دستگاه‌های صوتی جداگانه است. پشتیبانی از Dolby Atmos و Spatial Audio باعث شده صدای سه‌بعدی در فیلم و موسیقی کاملاً فراگیر احساس شود. از لحاظ ارتباطی، آیپد پرو ۲۰۲۵ فاقد سیم‌کارت است اما از Wi‑Fi ۷ و Bluetooth ۶ بهره می‌برد که هر دو نسبت به نسل قبل جهشی محسوس در پایداری و سرعت دارند. فناوری‌های مکان‌یابی GPS، GLONASS و GALILEO نیز برای برنامه‌های ناوبری و AR دقیق عمل می‌کنند. در کنار Face ID که از داده‌ی چهره در تراشه‌ی Secure Enclave نگه‌داری می‌کند، مجموعه‌ای از حسگرها همچون شتاب‌سنج، ژیروسکوپ، فشارسنج و قطب‌نما، دقت موقعیت و کنترل حرکت را افزایش داده است. این ترکیب پشتوانه‌ی اجرای روان برنامه‌های واقعیت افزوده و طراحی حرکتی دقیق است. امنیت داده‌ها نیز در بالاترین سطح حفظ می‌شود زیرا تمام اطلاعات بیومتریک فقط در دستگاه ذخیره می‌گردد.

مقایسه با نسل قبل
در مقایسه با iPad Pro ۲۰۲۴ M4، نسل جدید جهشی چشمگیر در نمایشگر، تراشه و هوش مصنوعی تجربه کرده است. فناوری Tandem OLED در برابر mini‑LED قبلی، ۵۰ درصد روشن‌تر و ۲ برابر کنتراست بالاتر ارائه می‌دهد. تراشه‌ی M5 با معماری 10 هسته‌ای و گرافیک ۱۰ هسته‌ای نسبت به M4 حدود ۳۰ درصد سرعت بیشتر و ۱۵ درصد صرفه‌جویی انرژی دارد. در کنار آن، معرفی Apple Intelligence و قابلیت‌های پردازش هوش مصنوعی محلی، بزرگ‌ترین تمایز میان دو نسل است. طراحی نیز باریک‌تر شده (۵.۱ میلی‌متر در M5 در برابر ۵.۹ میلی‌متر در M4) و حاشیه‌ی نمایشگر کاهش یافته تا نسبت صفحه به بدنه از ۸۵ به ۸۶ درصد برسد. مجموع این تغییرات، iPad Pro ۲۰۲۵ را نسخه‌ای پخته‌تر و هوشمندتر از همیشه ساخته است.

جمع‌بندی: آیپد پروی آینده، امروز در دسترس
تبلت iPad Pro ۲۰۲۵ M5 Wi‑Fi عصاره‌ی تفکر مهندسی اپل در ترکیب قدرت، زیبایی و هوشمندی است. نمایشگر خیره‌کننده‌ی ۱۳ اینچی OLED، سرعت خیره‌کننده‌ی تراشه M5، رم تا ۱۶ گیگابایت و ذخیره‌سازی تا ۲ ترابایت، این محصول را به گزینه‌ای حرفه‌ای برای طراحان، هنرمندان دیجیتال، برنامه‌نویسان و مدیران خلاق بدل کرده است. هرچند نبود درگاه سیم‌کارت یا کارت حافظه هنوز پابرجاست، اما در مقابل، تسلط کم‌نظیر اپل بر هماهنگی سخت‌افزار و نرم‌افزار، تجربه‌ای یکدست و مطمئن مهیا کرده است. از اجرای نرم‌افزارهای سنگین گرفته تا تماشای فیلم و بازی‌های گرافیکی، همه با سکوت، خنکی و سرعت انجام می‌شود. آیپد پرو ۲۰۲۵، تجسمی از آینده‌ی ابزارهای محاسباتی اپل است؛ دستگاهی که قصد دارد لپ‌تاپ‌ها را پشت سر بگذارد و معیار جدیدی برای مفهوم «کار و خلاقیت» در دنیای دیجیتال ایجاد کند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-pad-2-256', 'xiaomi-redmi-pad-2-256', 'تبلت ۱۱ اینچ شیائومی مدل Redmi Pad 2 Wi-Fi با ظرفیت 256 گیگابایت و رم 8 گیگابایت، رزولوشن دوربین اصلی ۸ مگاپیکسل، پشتیبانی از قلم', 'Xiaomi Redmi Pad 2 Wi-Fi 11-inch Tablet 256GB 8GB RAM', 'Xiaomi', 'tablets', 66030000, NULL, 0, true, 1, true, 'گارانتی 18 ماهه شرکتی', '4.5', 530, '{"display":"۱۱ اینچ IPS LCD 2.5K","displayDetails":"۹۰Hz · رزولوشن ۲۵۶۰×۱۶۰۰ · ۶۰۰ نیت","chipset":"MediaTek Helio G100 Ultra","chipsetDetails":"معماری ۶ نانومتری · ۸ هسته‌ای","camera":"۸ مگاپیکسل عریض","cameraDetails":"سلفی ۵ مگاپیکسل · فیلمبرداری 1080p","battery":"۹۰۰۰ میلی‌آمپر ساعت","batteryDetails":"شارژ سریع ۱۸ وات PD2 / QC2","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"Android 15 · HyperOS 2"}', '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · نسخه Wi-Fi","priceDelta":0}]', '[{"id":"purple-1","hex":"#800080","name":"بنفش"},{"id":"gray-2","hex":"#9E9E9E","name":"خاکستری"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/e62ead0d22347d5d702374fdb007fb9c53b39804_1787918316.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'بنفش', 'پرفروش شیائومی', 90, false, true, 18, 18, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/e62ead0d22347d5d702374fdb007fb9c53b39804_1787918316.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7b909917a9445038bfd43c8d2a22aecb00a43a96_1771426148.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f0aad0b618ee6b11c78810d4f0eb54f9bf962c09_1765289578.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8756c9a88d9a0caa3dfe673ed2088eace075d5a5_1765288992.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9908a71ff350c794946945a7fc7f0a516369a8e1_1765288362.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/22d4a33f65867788aa545df92ecf762528828cf5_1756888498.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/378de1bd3a78a9737b61501eadbc307f129e6975_1756888499.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/cca1eb71f842045afe9c70647260b888c1df242f_1756888499.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20334735"},{"label":"کارت حافظه","value":"پشتیبانی از microSDXC تا ۲ ترابایت"},{"label":"وزن بدنه فلزی","value":"۵۱۰ گرم · پشتیبانی از قلم"}]', '2026-11-24 19:25:00+00', 'Redmi Pad 2 Wi-Fi', 'تبلت ۱۱ اینچی شیائومی مدل Redmi Pad 2 Wi-Fi، با ظرفیت داخلی ۲۵۶ گیگابایت و رم ۸ گیگابایت، یک گزینه پیشرفته و شیک برای کاربرانی است که به ترکیب قدرت پردازش، کیفیت نمایشگر و امکانات چندرسانه‌ای اهمیت می‌دهند. بدنه این دستگاه از جنس فلز با قاب جلویی شیشه‌ای، فریم و پشت آلومینیومی طراحی شده و وزن ۵۱۰ گرم آن، استفاده طولانی‌مدت را بدون احساس خستگی ممکن می‌کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'tablets', 'بررسی Redmi Pad 2 Wi-Fi با ظرفیت 256 گیگابایت و رم 8 گیگابایت: ورود قدرتمند شیائومی به بازار تبلت‌های کارآمد
شیائومی با معرفی Redmi Pad 2 Wi‑Fi در تاریخ ۵ ژوئن ۲۰۲۵، بار دیگر استانداردهای جدیدی را برای تبلت‌های میان‌رده ارتقاء داده است. این مدل با ترکیب سخت‌افزار به‌روز، نمایشگر باکیفیت، امکانات چندرسانه‌ای پیشرفته و پشتیبانی از قلم، پاسخی کامل به نیاز کاربرانی است که به دنبال دستگاهی همه‌کاره برای کار، مطالعه و سرگرمی هستند. طراحی فلزی خوش‌حس، وزن سبک و ضخامت متعادل این دستگاه، آن را در زمره محصولات جذاب و باارزش بازار قرار داده است.

ارتباطات و اتصال؛ باتری و حسگرها: پوشش کامل بی‌سیم
تبلت فاقد شیار سیم‌کارت است، اما مجموعه‌ای کامل از ارتباطات بی‌سیم را ارائه می‌دهد: Wi‑Fi 802.11 a/b/g/n/ac دوبانده با قابلیت Wi‑Fi Direct، بلوتوث ۵.۳ با اتصال پایدار و کم‌مصرف، و درگاه USB Type‑C برای شارژ و انتقال داده. وجود جک ۳.۵ میلی‌متری صدا انعطاف استفاده از هدفون‌های باسیم را نیز ایجاد می‌کند. فناوری‌های مکان‌یابی GPS، GALILEO، GLONASS و BDS، دقت بالا در جهت‌یابی و استفاده از اپلیکیشن‌های نقشه را تضمین می‌کنند. حسگر شتاب‌سنج (Accelerometer) هماهنگی حرکتی دستگاه را در کاربردهای مختلف – از چرخش خودکار صفحه تا بازی‌های مبتنی بر حرکت – تضمین می‌کند. مجموعه سخت‌افزار و نرم‌افزار، تجربه‌ای بدون لگ و روان برای کاربر ایجاد کرده است.
باتری لیتیوم‌پلیمری ۹۰۰۰ میلی‌آمپرساعت تا ۱۷ ساعت پخش فیلم را پشتیبانی می‌کند، بنابراین یک روز کامل استفاده ترکیبی بدون نیاز به شارژ مجدد ممکن است. توان شارژ ۱۸ وات با پشتیبانی از استانداردهای PD2 و QC2، امکان شارژ ایمن و نسبتا سریع را فراهم می‌کند. مدیریت هوشمند انرژی در HyperOS 2 مصرف را بهینه کرده و عمر باتری را حفظ می‌کند.

جمع‌بندی: ارزش خرید در کلاس خود
Redmi Pad 2 Wi‑Fi ترکیبی از عملکرد بالا، طراحی ممتاز و امکانات چندرسانه‌ای کامل را با قیمتی رقابتی ارائه می‌کند. نمایشگر باکیفیت، باتری بادوام، اسپیکرهای Dolby Atmos و پشتیبانی از قلم هوشمند، این دستگاه را به انتخابی ایده‌آل برای کاربرانی تبدیل کرده که به یک تبلت همه‌کاره و مدرن نیاز دارند. از محیط کار و کلاس درس گرفته تا سفر و سرگرمی، این مدل توانایی پوشش تمام سناریوهای استفاده روزانه را دارد.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-pad-2-pro-matte-256', 'xiaomi-redmi-pad-2-pro-matte-256', 'تبلت 12.1 اینچ شیائومی مدل Redmi Pad 2 Pro Wi-Fi نسخه Matte Glass، ظرفیت 256 گیگابایت و رم 8 گیگابایت، رزولوشن دوربین 8 مگاپیکسل، پشتیبانی از قلم و کیبورد', 'Xiaomi Redmi Pad 2 Pro Wi-Fi Matte Glass 12.1-inch 256GB 8GB RAM', 'Xiaomi', 'tablets', 89990000, NULL, 0, true, 2, true, 'گارانتی 18 ماهه دیجی کالا سرویس', '4.7', 55, '{"display":"۱۲.۱ اینچ IPS LCD مات","displayDetails":"۱۲۰Hz · رزولوشن ۲۵۶۰×۱۶۰۰ · ۶۰۰ نیت","chipset":"Snapdragon 7s Gen 4","chipsetDetails":"معماری ۴ نانومتری · گرافیک Adreno 810","camera":"۸ مگاپیکسل + فلاش LED","cameraDetails":"سلفی ۸ مگاپیکسل عریض · 1080p","battery":"۱۲۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۳۳ وات USB-C","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"Android 15 · HyperOS 2"}', '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · نسخه Matte Glass","priceDelta":0}]', '[{"id":"gray-1","hex":"#9E9E9E","name":"خاکستری"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/1afc7cac4d70cb987e81d0114817687e34c63ba3_1790059143.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'خاکستری', 'نمایشگر مات ۱۲.۱ اینچ', 95, false, true, 19, 19, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/1afc7cac4d70cb987e81d0114817687e34c63ba3_1790059143.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/30873628b4700504a0241074be3be047cb0b4158_1790059143.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/56894edee967674864ccec6760bbe46a829f967e_1790059144.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/aa8c7b894d3d5f292da2a5562edfb2d1e9b95bed_1790059144.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/63374bb4c6289a7ef61a7b01bb09cbd0b194ad43_1790059145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/715996f285a2cf9b8d9d0af58135c9fe39daa5b4_1790059145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7259da2317a9dc74b974d2191e18f3b14eaab63c_1790059145.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ffcefc9b8c978fe7a66d9cda7d72924e6c0c38c9_1790059146.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22795713"},{"label":"حافظه رم و داخلی","value":"۸ گیگابایت LPDDR4X · ۲۵۶ گیگابایت UFS"},{"label":"ابعاد و وزن","value":"۲۷۹.۸×۱۸۱.۷×۷.۵ میلی‌متر · ۶۱۰ گرم"}]', '2026-11-24 19:25:00+00', 'Redmi Pad 2 Pro Matte Glass', 'تبلت 12.1 اینچ شیائومی مدل Redmi Pad 2 Pro نسخه‌ی Matte Glass، ظرفیت 256 گیگابایت و رم 8 گیگابایت یک گزینه مناسب برای کاربرانی است که نمایشگر بزرگ، عملکرد روان و طراحی حرفه‌ای را در یک دستگاه همه‌منظوره می‌خواهند. این تبلت با بدنه فلزی و وزن 610 گرم، استحکام مناسبی ارائه می‌دهد و به‌دلیل ضخامت 7.5 میلی‌متری، در استفاده روزمره احساس خوش‌دستی دارد.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'tablets', 'بررسی تبلت 12.1 اینچ شیائومی مدل Redmi Pad 2 Pro Wi-Fi Matte Glass، ظرفیت 256 گیگابایت و رم 8 گیگابایت
تبلت Redmi Pad 2 Pro را می‌توان یکی از کامل‌ترین و حرفه‌ای‌ترین محصولات میان‌رده شیائومی در سال‌های اخیر دانست؛ محصولی که با نمایشگر بزرگ ۱۲.۱ اینچ، سخت‌افزار قدرتمند، سیستم‌عامل به‌روز، پشتیبانی از قلم، کیفیت ساخت فلزی و باتری عظیم‌الجثه ۱۲۰۰۰ میلی‌آمپرساعتی، به‌گونه‌ای طراحی شده که فاصله میان تبلت‌های اقتصادی و تبلت‌های پرچم‌دار را تا حد زیادی از میان بردارد. این مدل در سپتامبر ۲۰۲۵ معرفی شد و برخلاف نسخه قبلی خود، روی تجربه چندوظیفگی، تولید محتوا، یادداشت‌برداری، سرگرمی و استفاده آموزشی تمرکز بیشتری دارد. ترکیب حافظه داخلی ۲۵۶ گیگابایت با رم ۸ گیگابایت و تراشه Snapdragon 7s Gen 4 نیز موجب شده Redmi Pad 2 Pro به گزینه‌ای قدرتمند برای دانشجویان، طراحان تازه‌کار، کاربران خانگی و حتی حرفه‌ای‌هایی که تبلتی سبک و قابل‌اعتماد می‌خواهند تبدیل شود.

سیستم‌عامل و امکانات هوشمند و ارتباطات، اتصالات و فناوری‌های بی‌سیم
این تبلت به‌طور پیش‌فرض با سیستم‌عامل Android ۱۵ و رابط کاربری HyperOS ۲ عرضه می‌شود. HyperOS بر پایه یک طراحی ساده، روان و بسیار بهینه‌شده توسعه یافته و امکانات متعددی برای مدیریت پنجره‌ها، مولتی‌تسکینگ، امنیت و کنترل دستگاه‌های خانگی هوشمند فراهم می‌کند. پشتیبانی از تقسیم صفحه، شناور کردن برنامه‌ها، حالت نویسندگی با قلم و کارکرد روان برنامه‌های محبوب اندروید از جمله نقاط قوت این رابط کاربری است. نسخه Android ۱۵ نیز در زمینه مدیریت انرژی، امنیت و سرعت اجرای برنامه‌ها پیشرفت قابل توجهی داشته و دستگاه را برای چندین سال به‌روز و قابل‌استفاده نگه می‌دارد.
Redmi Pad 2 Pro فاقد پشتیبانی از سیم‌کارت است و تمرکز آن بر کاربری Wi-Fi است. پشتیبانی از Wi-Fi ۶ سرعت بالا، پایداری بیشتر و تأخیر کمتر را فراهم می‌کند؛ موضوعی که در کلاس‌های آنلاین، تماس‌های تصویری و استریم ویدئو اهمیت بالایی دارد. نسخه بلوتوث ۵.۴ نیز جدیدترین نسل فناوری بلوتوث در سال ۲۰۲۵ است که اتصال پایدارتر، مصرف انرژی کمتر و کیفیت انتقال صوت بهتری را ارائه می‌دهد. پورت USB Type-C نیز برای شارژ، انتقال داده و اتصال لوازم جانبی در نظر گرفته شده است. وجود شیار کارت حافظه جدا از درگاه Type-C، یک مزیت مهم محسوب می‌شود زیرا اجازه می‌دهد کاربر بدون محدودیت ظرفیت داخلی، حجم وسیعی از محتوای چندرسانه‌ای را ذخیره کند. همچنین این تبلت به جک 3.5 میلی‌متری هم مجهز است که در قسمت صوت هم کارایی لازم را ارائه می‌دهد.

جمع‌بندی
تبلت Redmi Pad 2 Pro ترکیبی کم‌نظیر از طراحی زیبا، نمایشگر ۱۲۰ هرتز، سخت‌افزار قدرتمند، حافظه داخلی فراوان، پشتیبانی از قلم، باتری بزرگ ۱۲۰۰۰ میلی‌آمپر ساعت و امکانات کامل ارتباطی است. این مدل برای دانشجویان، طراحان تازه‌کار، کاربران خانگی، افرادی که جلسات آنلاین زیادی دارند و کسانی که تبلتی قدرتمند اما مقرون‌به‌صرفه می‌خواهند یکی از بهترین گزینه‌های سال ۲۰۲۵ محسوب می‌شود. اگر به‌دنبال تبلتی هستید که بتواند جایگزین لپ‌تاپ سبک شما شود، تجربه چندرسانه‌ای فوق‌العاده ارائه دهد و در عین حال قیمت اقتصادی داشته باشد، Redmi Pad 2 Pro انتخابی کاملاً منطقی و ارزشمند است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-tab-a11-plus-256', 'samsung-galaxy-tab-a11-plus-256', 'تبلت 11 اینچ سامسونگ مدل Galaxy Tab A11 Plus Wi-Fi، ظرفیت 256 گیگابایت و رم 8 گیگابایت، رزولوشن دوربین 8 مگاپیکسل', 'Samsung Galaxy Tab A11 Plus Wi-Fi 11-inch Tablet 256GB 8GB RAM', 'Samsung', 'tablets', 77418000, 78200000, 1, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.5', 102, '{"display":"۱۱ اینچ TFT LCD","displayDetails":"۹۰Hz · رزولوشن ۱۹۲۰×۱۲۰۰","chipset":"MediaTek Dimensity 7300","chipsetDetails":"معماری ۴ نانومتری · گرافیک Mali-G615","camera":"۸ مگاپیکسل عریض","cameraDetails":"سلفی ۵ مگاپیکسل · فیلمبرداری 1080p","battery":"۷۰۴۰ میلی‌آمپر ساعت","batteryDetails":"شارژ سریع ۲۵ وات · تا ۱۵ ساعت ویدیو","storageDefault":"۲۵۶ گیگابایت","ram":"۸ گیگابایت","os":"Android 16 · One UI 8"}', '[{"label":"۲۵۶ گیگابایت","subtitle":"رم ۸ گیگابایت · نسخه Wi-Fi","priceDelta":0}]', '[{"id":"silver-1","hex":"#dedede","name":"نقره ای"},{"id":"gray-2","hex":"#9E9E9E","name":"خاکستری"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/3818ae16a8c151cdf9a568b0059bcd128a5ad9bb_1787918317.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'نقره ای', '۱٪ تخفیف', 91, false, false, 20, 20, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/3818ae16a8c151cdf9a568b0059bcd128a5ad9bb_1787918317.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4711b7a8f0c2da5bce0e160931c910c586c98396_1789726194.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/14c1a635e17553e3118dd3f0119f89aea1b9075d_1775908841.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e8b15d2ab4526414b1c7a6b59ffe541e70a0640f_1765189637.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/aa4fc94adf2021c5e532e31c94d4d3f01400924b_1765189666.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4f5b0b62dcb9b34f324899880975a240b76415ac_1765189666.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3f7284b1345715db8fd8d8b6a65bf062cb1ee9e4_1765189678.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/eb2bf49fd859e21597987c1cc1ecddf4233c75e1_1765189678.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-21050955"},{"label":"پشتیبانی حافظه","value":"microSD تا ۲ ترابایت"},{"label":"وزن بدنه فلزی","value":"۴۷۷ گرم · ضخامت ۶.۹ میلی‌متر"}]', '2026-11-24 19:25:00+00', 'Galaxy Tab A11 Plus Wi-Fi', 'تبلت 11 اینچ سامسونگ مدل Galaxy Tab A11 Plus Wi‑Fi، ظرفیت 256 گیگابایت و رم 8 گیگابایت یک تبلت استاندارد و خوش‌ساخت است که برای کاربران دانش‌آموز، دانشجو و افرادی که استفاده روزمره و آموزشی دارند، گزینه‌ای بسیار به‌صرفه محسوب می‌شود. طراحی فلزی با ضخامت 6.9 میلی‌متر و وزن 477 گرم، حس کیفیت بالا و سبکی مطلوب را منتقل می‌کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'tablets', 'بررسی تبلت 11 اینچ سامسونگ مدل Galaxy Tab A11 Plus Wi-Fi، ظرفیت 256 گیگابایت و رم 8 گیگابایت
تبلت Galaxy Tab A11 Plus Wi‑Fi یکی از جذاب‌ترین تبلت‌های میان‌رده سامسونگ در سال ۲۰۲۵ است؛ محصولی که با ابعاد جمع‌وجور، وزن کم، نمایشگر ۱۱ اینچی با رفرش‌ریت ۹۰ هرتز، پردازنده مدیاتک Dimensity 7300، بدنه فلزی، باتری با دوام بالا و جدیدترین نسخه سیستم‌عامل اندروید توانسته جایگاه ویژه‌ای در بازار آموزش، سرگرمی، یادداشت‌برداری و کاربری روزمره پیدا کند. سامسونگ در این مدل تلاش کرده تعادلی بی‌نقص میان قیمت مناسب، طراحی ممتاز، قدرت پردازشی بالا و امکانات نرم‌افزاری کامل برقرار کند؛ ویژگی‌هایی که این تبلت را تبدیل به گزینه‌ای محبوب برای دانش‌آموزان، دانشجویان، کاربران خانگی و حتی افرادی که در سفر از تبلت برای کارهای سبک و نیمه‌حرفه‌ای استفاده می‌کنند کرده است.

اسپیکرها و کیفیت صوتی و سنسورها و تجربه کاربری
وجود اسپیکرهای استریو تجربه صوتی مطلوبی ارائه می‌دهد و هنگام تماشای فیلم، بازی و شرکت در کلاس‌های آنلاین، شفافیت و حجم صدای مناسبی ایجاد می‌کند. ترکیب اسپیکر استریو با نمایشگر ۱۱ اینچی، Galaxy Tab A11 Plus را به گزینه‌ای مناسب برای سرگرمی خانگی و آموزشی تبدیل کرده است. وجود سنسورهای شتاب‌سنج، ژیروسکوپ، قطب‌نما و سنسور روشنایی باعث می‌شود دستگاه بتواند به‌صورت هوشمند چرخش صفحه، سطح روشنایی و برخی قابلیت‌های نرم‌افزاری را کنترل کند. ژیروسکوپ در بازی‌ها و برنامه‌های واقعیت افزوده نقشی مهم دارد و سنسور روشنایی نیز تجربه مشاهده صفحه را در محیط‌های تاریک یا روشن بهینه می‌کند.

جمع‌بندی
Galaxy Tab A11 Plus Wi‑Fi یکی از متعادل‌ترین تبلت‌های میان‌رده سامسونگ در سال ۲۰۲۵ است. ترکیب نمایشگر ۱۱ اینچ با نرخ نوسازی ۹۰ هرتز، پردازنده ۴ نانومتری Dimensity 7300، بدنه فلزی، باتری پرظرفیت، اسپیکرهای استریو و جدیدترین نسخه Android همراه با One UI ۸ باعث شده این مدل برای استفاده آموزشی، سرگرمی، مطالعه و کارهای روزمره کاملاً ایده‌آل باشد. وجود دو نسخه حافظه‌ای مختلف نیز باعث می‌شود کاربران بتوانند بسته به نیاز، بین مدل اقتصادی‌تر یا مدل با ظرفیت و رم بالاتر انتخاب کنند، بدون اینکه در تجربه کاربری تفاوتی از نظر طراحی، نمایشگر، پردازنده، باتری و امکانات نرم‌افزاری مشاهده شود. اگر به‌دنبال تبلتی هستید که کیفیت ساخت بالا، عملکرد نرم و روان، طراحی سبک و امکانات به‌روز را با قیمتی منطقی ارائه دهد، Galaxy Tab A11 Plus یکی از بهترین انتخاب‌های بازار در سال ۲۰۲۵ است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-tab-s10-lite-128', 'samsung-galaxy-tab-s10-lite-128', 'تبلت 10.9 اینچ سامسونگ مدل Galaxy Tab S10 Lite Wi-Fi با ظرفیت 128 گیگابایت و رم 6 گیگابایت، رزولوشن دوربین اصلی ۸ مگاپیکسل، پشتیبانی از قلم', 'Samsung Galaxy Tab S10 Lite Wi-Fi 10.9-inch 128GB 6GB RAM', 'Samsung', 'tablets', 98740000, NULL, 0, true, 2, true, 'گارانتی 18 ماهه شرکتی', '4.5', 101, '{"display":"۱۰.۹ اینچ TFT LCD","displayDetails":"۹۰Hz · رزولوشن ۲۱۱۲×۱۳۲۰","chipset":"Exynos 1380","chipsetDetails":"معماری ۵ نانومتری · ۸ هسته‌ای","camera":"۸ مگاپیکسل عریض","cameraDetails":"سلفی ۵ مگاپیکسل عریض","battery":"۸۰۰۰ میلی‌آمپر ساعت","batteryDetails":"فست شارژ ۲۵ وات (شارژ کامل ۱۲۰ دقیقه)","storageDefault":"۱۲۸ گیگابایت","ram":"۶ گیگابایت","os":"Android 15 · One UI 7"}', '[{"label":"۱۲۸ گیگابایت","subtitle":"رم ۶ گیگابایت · پشتیبانی قلم","priceDelta":0}]', '[{"id":"gray-1","hex":"#9E9E9E","name":"خاکستری"},{"id":"silver-2","hex":"#dedede","name":"نقره ای"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/4b09b5bc5ab4fb5959bff40051454db01e41ccca_1771426149.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'خاکستری', 'پشتیبانی قلم S-Pen', 90, false, true, 21, 21, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/4b09b5bc5ab4fb5959bff40051454db01e41ccca_1771426149.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e1d4dac095f126f566c04612b2d43d6f11fc5b80_1757150249.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/13254ba175c2c761ed0521034561dfd305e7c587_1757150249.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6fa14074b1d1195a6891960d6601618e3a383811_1757150248.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8a468ec518785a9a0979fb174c0b5c6e2d85f05c_1757150249.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f11c3a025f679aee4848e2548f83abff42d48b5f_1757150307.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a4b684634a3e6cdd487c3b39ce4851b583e3261f_1757150423.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/82b2f00f4aac6eb8a6157c7bc6b5de14ff69059b_1757150249.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20361833"},{"label":"امکانات ویژه","value":"پشتیبانی از قلم · تقسیم صفحه · Galaxy AI"},{"label":"ابعاد و وزن","value":"۲۵۴.۳×۱۶۵.۸×۶.۶ میلی‌متر · ۵۲۴ گرم"}]', '2026-11-24 19:25:00+00', 'Galaxy Tab S10 Lite Wi-Fi', 'تبلت 10.9 اینچی سامسونگ مدل Galaxy Tab S10 Lite Wi-Fi، با ظرفیت داخلی 128 گیگابایت و رم 6 گیگابایت، ترکیبی از طراحی ظریف، عملکرد قدرتمند و امکانات هوشمند است که پاسخ‌گوی نیازهای حرفه‌ای و روزمره کاربران خواهد بود. بدنه فلزی این دستگاه با قاب جلو شیشه‌ای و پشت و فریم آلومینیومی، احساسی لوکس و مقاوم به کاربر منتقل می‌کند. وزن 524 گرم و ضخامت 6.6 میلی‌متر، استفاده راحت در طول روز را ممکن می‌سازد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'tablets', 'بررسی Galaxy Tab S10 Lite Wi-Fi با ظرفیت 128 گیگابایت و رم 6 گیگابایت: ورود به نسل تازه کاربردی و هوشمند
در تاریخ ۲۵ آگوست ۲۰۲۵، سامسونگ با معرفی Galaxy Tab S10 Lite فصل تازه‌ای از تجربه کار با تبلت‌های میان‌رده قدرتمند را آغاز کرد. این محصول با تمرکز بر تعادل میان قیمت، امکانات حرفه‌ای و طراحی لوکس، بازار را هدف گرفته است. بدنه فلزی مقاوم، نمایشگر روان، قلم S‑Pen و قدرت پردازشی قابل توجه، همگی نشان می‌دهند که سامسونگ سعی داشته تبلتی فراهم کند که مخاطبانی از طیف گسترده – از دانشجویان و طراحان گرفته تا مدیران و کاربرانی علاقه‌مند به سرگرمی – را پوشش دهد.

مقایسه با نسل قبلی: جهش در کیفیت و سرعت
در مقایسه با Galaxy Tab S9 Lite، این مدل ارتقاءهای مهمی را تجربه کرده است. کاهش وزن به 524 گرم و ضخامت به 6.6 میلی‌متر حمل آسان‌تر را فراهم کرده است. نرخ نوسازی نمایشگر از 60 هرتز به 90 هرتز رسیده و تعامل بصری روان‌تر شده است. تراشه جدید Exynos 1380 با معماری ۵ نانومتری، سرعت و کارایی بهتر در پردازش‌های سنگین و چندوظیفگی ارائه می‌دهد. نسخه بلوتوث ۵.۳ و Wi‑Fi 6 اتصال سریع‌تر و پایدارتر ایجاد کرده‌اند. همچنین بهره‌مندی از Android 15 و One UI 7 با ابزارهای هوش مصنوعی پیشرفته‌تر نسبت به نسخه قبلی، تجربه‌ای مدرن‌تر و هوشمندتر فراهم کرده است.

جمع‌بندی: انتخابی ارزشمند برای سال ۲۰۲۵
Galaxy Tab S10 Lite با ترکیب طراحی زیبا، نمایشگر روان، پردازنده قدرتمند، باتری بادوام و امکانات هوش مصنوعی، یک گزینه متعادل اما حرفه‌ای محسوب می‌شود. قابلیت پشتیبانی از S‑Pen آن را برای خلاقیت و یادداشت‌برداری بی‌نظیر کرده و سخت‌افزار به‌روز، استفاده چندوظیفه‌ای روان را تضمین می‌کند. برای کاربری روزمره، آموزشی و سرگرمی، این مدل در میان تبلت‌های میان‌رده موجود در بازار، انتخابی منطقی و ارزشمند است که کیفیت ساخت سامسونگ را با امکانات هوشمند عصر جدید تلفیق کرده است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('romoss-phc10-powerbank-10000', 'romoss-phc10-powerbank-10000', 'پاوربانک 15 وات روموس مدل PHC10 ظرفیت 10000 میلی‌آمپرساعت به همراه کابل USB-C', 'Romoss PHC10 10000mAh 15W Power Bank with Built-in Cables', 'Romoss', 'chargers', 2398000, 7500000, 68, true, 10, true, 'گارانتی اصالت و سلامت فیزیکی کالا', '4.5', 6, '{"display":"نشانگر LED میزان شارژ","displayDetails":"بدنه مقاوم ABS ضد گردوغبار","chipset":"حفاظت اتصال کوتاه و نوسان","chipsetDetails":"شارژ همزمان ۴ دستگاه","camera":"پورت USB-A و USB-C + کابل داخلی","cameraDetails":"کابل متصل لایتنینگ، USB-C و MicroUSB","battery":"۱۰۰۰۰ میلی‌آمپر ساعت","batteryDetails":"توان خروجی ۱۵ وات · باتری لیتیوم‌پلیمر","storageDefault":"۱۰۰۰۰ میلی‌آمپر","ram":"۱۵ وات","os":"سازگار با iOS و اندروید"}', '[{"label":"۱۰۰۰۰ میلی‌آمپر","subtitle":"کابل متصل USB-C و لایتنینگ","priceDelta":0}]', '[{"id":"pink-1","hex":"#ffc0cb","name":"صورتی"},{"id":"black-2","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/d64ee8a9aca93a7baa52d1b4e1c707daab4c8eba_1793876067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'صورتی', '۶۸٪ تخفیف ویژه', 90, true, false, 22, 22, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/d64ee8a9aca93a7baa52d1b4e1c707daab4c8eba_1793876067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/77f62e803e0d2dc313789bfae5683a004fb8cdf7_1793878546.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/da120fd11c0d9ea22714f14db6215101b566d174_1793876066.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8edabbf5e70f8cb1f486d2150ea437be60e8bbc2_1793876067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a09f478951fb032cb285c0e0711986ba9c1211c6_1793876615.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9ca194ec8bc674f5c54ad3cf3020774484d0c4fe_1793876067.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-23159638"},{"label":"تعداد خروجی","value":"چهار درگاه (USB-A / USB-C / لایتنینگ / MicroUSB)"},{"label":"توان خروجی","value":"۱۵ وات فست شارژ"}]', '2026-11-24 19:25:00+00', 'Romoss PHC10 10000mAh', 'پاوربانک روموس PHC10 برای زمانی ساخته شده که می‌خواهید بدون حمل کابل‌های جداگانه، شارژ دستگاه را مدیریت کنید. سه کابل متصل Type-C، Micro-USB و Lightning کنار پورت USB و درگاه ورودی-خروجی Type-C، استفاده روزمره را ساده‌تر می‌کند و برای شارژ همزمان چند دستگاه، از تلفن همراه تا تبلت و حتی اسپیکر بلوتوثی و ... فضای کافی می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'romoss', 'chargers', 'پاوربانک روموس PHC10 برای زمانی ساخته شده که می‌خواهید بدون حمل کابل‌های جداگانه، شارژ دستگاه را مدیریت کنید. سه کابل متصل Type-C، Micro-USB و Lightning کنار پورت USB و درگاه ورودی-خروجی Type-C، استفاده روزمره را ساده‌تر می‌کند و برای شارژ همزمان چند دستگاه، از تلفن همراه تا تبلت و حتی اسپیکر بلوتوثی و ... فضای کافی می‌دهد. ظرفیت 10000 میلی‌آمپرساعت در بدنه‌ای نازک و قابل حمل با وزن 236 گرم و ابعاد 15 × 7 × 2 سانتی‌متر قرار گرفته تا همراه‌بردن آن در کیف یا کوله راحت باشد. نمایشگر LED میزان شارژ، وضعیت باتری را روشن و قابل‌فهم نشان می‌دهد و پشتیبانی از شارژ سریع با توان خروجی 15 وات، سرعت شارژ را در حد نیازهای روزمره نگه می‌دارد. بدنه پلاستیک ABS و مقاومت در برابر نفوذ گرد و غبار هم تصویر یک شارژر همراه جمع‌وجور و کاربردی را کامل می‌کند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-integrated-cable-powerbank-20000', 'xiaomi-integrated-cable-powerbank-20000', 'پاوربانک 33 وات شیائومی مدل Integrated Cable ظرفیت 20000 میلی آمپر ساعت - گلوبال', 'Xiaomi 20000mAh 33W Integrated Cable Power Bank - Global', 'Xiaomi', 'chargers', 5599000, 6500000, 14, true, 10, true, 'گارانتی 18 ماهه آگرین ارتباطات ایرانیان', '4.5', 3125, '{"display":"نشانگر LED وضعیت باتری","displayDetails":"بدنه ترکیبی مقاوم PC + ABS","chipset":"تراشه کنترل شارژ هوشمند ۳۳W","chipsetDetails":"شارژ همزمان ۳ دستگاه","camera":"کابل متصل USB-C + پورت USB-A و USB-C","cameraDetails":"کابل داخلی برای ورودی و خروجی","battery":"۲۰۰۰۰ میلی‌آمپر ساعت","batteryDetails":"توان خروجی تا ۳۳ وات · لیتیوم یونی","storageDefault":"۲۰۰۰۰ میلی‌آمپر","ram":"۳۳ وات","os":"نسخه گلوبال"}', '[{"label":"۲۰۰۰۰ میلی‌آمپر","subtitle":"کابل داخلی ۳۳ وات USB-C","priceDelta":0}]', '[{"id":"cream-1","hex":"#F5E8D8","name":"کرم"},{"id":"navy-2","hex":"#002171","name":"سرمه ای"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/aebf94cb5841f5c6c35d00542cbde9469436a88d_1786910553.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'کرم', '۱۴٪ تخفیف', 91, true, true, 23, 23, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/aebf94cb5841f5c6c35d00542cbde9469436a88d_1786910553.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/48dc44287ceac32f4d020780a0bd3c2822813ac8_1765742309.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7b9fd7c852a6ebab4d34442a40e5d70c1a1cb414_1765741657.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6cf3fe76e5a3e09a9307468b5d12f2dd076da303_1754240762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/205414bdcd7b90f9fa600b547abf72adb12295ae_1741098890.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8f57edfe4ee34ca8c9edf774f973161745397ecd_1741098890.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2177950ee428f935783f89ad46447049385f417c_1741592876.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/577446f1b4ab66d1edcb1f1d881b1b12abc9c18d_1741592876.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-18524083"},{"label":"ابعاد و وزن","value":"۱۲.۷×۷.۰۵×۳.۰۵ سانتی‌متر · ۳۴۲ گرم"},{"label":"ظرفیت واقعی خروجی","value":"۱۲۰۰۰ میلی‌آمپر ساعت"}]', '2026-11-24 19:25:00+00', 'Xiaomi Integrated Cable 33W 20000mAh', 'پاوربانک 33 وات شیائومی مدل PB2030MI ظرفیت 20000 میلی‌آمپر‌ساعت - گلوبال، یک شارژر همراه با باتری لیتیوم یونی و توان خروجی کلی 33 وات است. ظرفیت اسمی این مدل 20000 میلی‌آمپر‌ساعت و ظرفیت واقعی آن 12000 میلی‌آمپر‌ساعت اعلام شده است؛ بنابراین برای شارژ گوشی موبایل، تبلت و اسپیکر بلوتوثی قابل استفاده خواهد بود.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'chargers', 'پاوربانک PB2030MI یکی از جدیدترین محصولات شیائومی در رده پاوربانک‌های پرقدرت و سریع است که با توان خروجی ۳۳ وات، ظرفیت بالا و طراحی کاربرپسند، جایگاه ویژه‌ای در میان شارژرهای همراه میان‌رده و حرفه‌ای پیدا کرده است. این مدل با بهره‌گیری از فناوری‌های شارژ سریع PD و QC، قابلیت شارژ همزمان سه دستگاه و باتری قدرتمند لیتیوم یونی، به گونه‌ای طراحی شده که نیاز کاربران مدرن را در تمامی شرایط، از استفاده روزمره گرفته تا سفرهای طولانی، پاسخ دهد.

طراحی و کیفیت ساخت
شیائومی در طراحی PB2030MI همان زبان طراحی مینیمال و دقیق خود را ادامه داده است. بدنه‌ی پاوربانک از ترکیب پلاستیک مقاوم PC + ABS ساخته شده که علاوه بر مقاومت بالا در برابر حرارت و ضربه، وزنی سبک و خوش‌دست دارد. وزن ۳۴۲ گرمی آن برای پاوربانکی با ظرفیت ۲۰۰۰۰ میلی‌آمپرساعت، بسیار مناسب است و امکان حمل آسان در کیف یا کوله‌پشتی را فراهم می‌کند.
سطح مات بدنه علاوه بر جلوگیری از جذب اثر انگشت، جلوه‌ای حرفه‌ای به دستگاه داده است. طراحی مستطیلی با لبه‌های نرم، ارگونومی مطلوبی ایجاد کرده تا در دست گرفتن دستگاه راحت باشد. در قسمت بالایی بدنه، نشانگرهای LED وضعیت شارژ پاوربانک را به‌صورت چهار چراغ مجزا نشان می‌دهند و در کنار آن، درگاه‌های ورودی و خروجی به‌صورت منظم تعبیه شده‌اند.

درگاه‌ها و پیکربندی هوشمند
پاوربانک PB2030MI از یک درگاه USB-A، یک درگاه USB-C و یک کابل داخلی USB-C بهره می‌برد که به‌صورت هوشمند درون بدنه جای گرفته است. وجود این کابل داخلی، مزیتی چشمگیر برای کاربران محسوب می‌شود؛ زیرا در مواقعی که کابل اضافی همراه ندارید، می‌توانید بدون دردسر دستگاه خود را شارژ کنید.
درگاه USB-C نقش دوگانه دارد و هم به‌عنوان ورودی برای شارژ پاوربانک و هم به‌عنوان خروجی برای شارژ دستگاه‌های دیگر استفاده می‌شود. در کنار آن، پورت USB-A نیز برای شارژ همزمان دستگاه‌های قدیمی‌تر کاربرد دارد. در مجموع، این پاوربانک قادر است سه دستگاه را به‌صورت همزمان شارژ کند که برای کاربران چنددستگاهی، مانند افرادی که گوشی، تبلت و هدفون بلوتوثی را هم‌زمان استفاده می‌کنند، بسیار کاربردی است.

عملکرد فنی و سرعت شارژ
پاوربانک PB2030MI با توان خروجی حداکثر ۳۳ وات، یکی از سریع‌ترین پاوربانک‌های کلاس خود محسوب می‌شود. پشتیبانی از فناوری‌های Power Delivery 2.0 و Quick Charge 2.0 باعث می‌شود شارژ دستگاه‌هایی مانند گوشی‌های شیائومی، سامسونگ، اپل و حتی برخی لپ‌تاپ‌های سبک با سرعت قابل‌توجهی انجام شود.
در حالت خروجی USB-C، این پاوربانک می‌تواند با ولتاژهای ۵، ۹ و ۱۲ ولت و شدت جریان حداکثر ۳ آمپر عمل کند. این یعنی می‌توانید گوشی‌هایی مانند Xiaomi 13، Samsung S23 یا iPhone 14 را در مدت کمتر از یک ساعت از صفر تا ۵۰ درصد شارژ کنید. درگاه USB-A نیز از فناوری شارژ سریع QC پشتیبانی می‌کند و برای شارژ تبلت‌ها، اسپیکرهای بلوتوثی یا پاوربانک‌های دیگر نیز کارایی دارد.

از دیگر نکات برجسته، توانایی شارژ سریع خود پاوربانک است. ورودی Type-C با توان ۳ آمپر، امکان شارژ کامل دستگاه را در حدود ۹.۵ ساعت فراهم می‌کند. با استفاده از شارژر سریع‌تر (مثلاً شارژر ۳۳ وات خود شیائومی)، این زمان به‌صورت محسوس کاهش می‌یابد.

مدیریت هوشمند و شارژ ایمن
مانند سایر محصولات پرمیوم شیائومی، پاوربانک PB2030MI نیز مجهز به سیستم مدیریت هوشمند شارژ (Smart Power Management) است که به‌صورت خودکار جریان و ولتاژ مناسب را برای هر دستگاه تنظیم می‌کند. این فناوری ضمن افزایش بازده انرژی، مانع از شارژ بیش از حد یا تخلیه بیش از اندازه می‌شود.
وجود مدارهای محافظتی چندلایه، ایمنی کامل دستگاه‌ها را در برابر افزایش دما، نوسانات برق، اتصال کوتاه و جریان اضافه تضمین می‌کند. این سیستم به‌ویژه در زمان شارژ همزمان چند دستگاه اهمیت دارد، زیرا از کاهش راندمان یا گرم شدن بیش از حد جلوگیری می‌کند.

ظرفیت واقعی و عملکرد انرژی
پاوربانک PB2030MI با ظرفیت اسمی ۲۰۰۰۰ میلی‌آمپرساعت، در عمل ظرفیتی حدود ۱۲۰۰۰ میلی‌آمپرساعت را در اختیار کاربر قرار می‌دهد؛ که معادل حدود دو و نیم بار شارژ کامل یک گوشی پرچم‌دار یا چهار بار شارژ گوشی‌های میان‌رده است. این میزان ظرفیت برای سفرهای یک‌روزه یا استفاده مداوم در محیط کار کافی است.
بهره‌گیری از سلول‌های لیتیوم یونی باکیفیت بالا موجب افزایش طول عمر شارژ و کاهش افت انرژی در طول زمان شده است. حتی پس از چند ماه استفاده مداوم، افت محسوس در ظرفیت ذخیره‌سازی مشاهده نمی‌شود که این مسئله از مزایای برجسته باتری‌های ساخت شیائومی است.

کاربردها و تجربه کاربری
یکی از نقاط قوت این پاوربانک، تطبیق‌پذیری بالا با دستگاه‌های مختلف است. از گوشی‌های هوشمند و تبلت‌ها گرفته تا اسپیکرهای بلوتوثی، ساعت‌های هوشمند و حتی کنسول‌های دستی مانند Nintendo Switch، همگی با درگاه‌های این پاوربانک سازگارند. این ویژگی، آن را به گزینه‌ای ایده‌آل برای کاربران چندمنظوره تبدیل کرده است.
همچنین، طراحی کابل داخلی USB-C علاوه بر راحتی، در سفرها و شرایط اضطراری بسیار مفید است؛ چراکه نیازی به حمل کابل جداگانه ندارید. این موضوع به‌ویژه برای کاربران آیفون با مبدل‌های PD یا دارندگان دستگاه‌های Type-C اهمیت دارد.

توان واقعی شارژ سریع و بازده انرژی
پاوربانک PB2030MI با پشتیبانی از توان خروجی ۳۳ وات، در عمل یکی از سریع‌ترین پاوربانک‌های ۲۰۰۰۰ میلی‌آمپرساعتی در بازار است. در آزمایش‌های میدانی، گوشی‌هایی مانند Xiaomi 13T Pro یا Poco F6 در مدت کمتر از ۶۵ دقیقه به‌طور کامل شارژ شدند. حتی در صورت اتصال دو دستگاه، عملکرد شارژ دچار افت چشمگیری نمی‌شود، زیرا مدارهای داخلی توان را به‌صورت پویا میان پورت‌ها تقسیم می‌کنند.
توان خروجی چندگانه (۵V، ۹V و ۱۲V) باعث می‌شود دستگاه به‌صورت هوشمند ولتاژ متناسب با هر نوع دیوایس را انتخاب کند. این ویژگی به‌ویژه برای کاربرانی که چند برند مختلف دستگاه دارند (مثلاً گوشی سامسونگ و تبلت آیپد)، بسیار سودمند است.

طراحی ارگونومیک و جزئیات کاربردی
یکی از نقاط قوت طراحی این پاوربانک، نحوه تعبیه کابل داخلی USB-C درون بدنه است. این کابل با ظرافت خاصی در شیار مخصوص قرار گرفته و در زمان نیاز به‌راحتی بیرون کشیده می‌شود. این طراحی ضمن جلوگیری از گم شدن کابل، ظاهر دستگاه را نیز تمیز و منظم نگه می‌دارد.
چهار چراغ LED در بخش جانبی، به‌طور دقیق میزان شارژ باقی‌مانده را نمایش می‌دهند. نور ملایم این چراغ‌ها باعث می‌شود در محیط‌های تاریک نیز به‌راحتی وضعیت باتری را تشخیص دهید.

جمع‌بندی نهایی
پاوربانک ۳۳ وات شیائومی مدل PB2030MI نمونه‌ای از توازن کامل میان ظرفیت بالا، سرعت شارژ چشمگیر و طراحی هوشمند است. این دستگاه با بهره‌گیری از فناوری‌های PD 2.0 و QC 2.0، توان خروجی ۳۳ وات، کابل داخلی Type-C و امکان شارژ همزمان سه دستگاه، یکی از کامل‌ترین گزینه‌ها برای کاربران حرفه‌ای به‌شمار می‌رود.
بدنه‌ی مقاوم، مدیریت هوشمند شارژ، باتری بادوام و سازگاری گسترده با انواع دستگاه‌ها، از این پاوربانک ابزاری مطمئن ساخته است. اگر به دنبال پاوربانکی هستید که در عین سبک بودن، بتواند به سرعت گوشی، تبلت یا گجت‌های شما را شارژ کند و در عین حال طراحی تمیز و بادوامی داشته باشد، شیائومی PB2030MI انتخابی کاملاً منطقی و ارزشمند است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-powerbank-20000', 'xiaomi-redmi-powerbank-20000', 'پاوربانک 18 وات شیائومی مدل Redmi ظرفیت 20000 میلی‌آمپرساعت', 'Xiaomi Redmi 20000mAh 18W Fast Charge Power Bank', 'Xiaomi', 'chargers', 3499000, 4200000, 17, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.2', 22160, '{"display":"نشانگر LED درصد شارژ","displayDetails":"بدنه مقاوم در برابر ضربه ABS","chipset":"مدار هوشمند کنترل ولتاژ","chipsetDetails":"پشتیبانی شارژ گوشی و تبلت","camera":"پورت دوگانه USB-A + ورودی Type-C","cameraDetails":"کابل USB-A به USB-C","battery":"۲۰۰۰۰ میلی‌آمپر ساعت","batteryDetails":"توان خروجی ۱۸ وات · لیتیوم یونی","storageDefault":"۲۰۰۰۰ میلی‌آمپر","ram":"۱۸ وات","os":"شارژ ایمن دوطرفه"}', '[{"label":"۲۰۰۰۰ میلی‌آمپر","subtitle":"فست شارژ ۱۸ وات","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/16c1fbd2b0960bf9b7c8bc1940e064a254c7d43e_1786910548.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۱۷٪ تخفیف · اقتصادی', 85, false, true, 24, 24, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/16c1fbd2b0960bf9b7c8bc1940e064a254c7d43e_1786910548.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a8f1631dd6f6f7c0d615b88cf9afa7002f402427_1762156862.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/114687192.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/119156302.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/119156305.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/119156307.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/119156315.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/119156311.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-2271206"},{"label":"ابعاد و وزن","value":"۱۵.۴×۷.۳۶×۲.۷۳ سانتی‌متر · ۴۷۰ گرم"},{"label":"مقاومت فیزیکی","value":"بدنه مقاوم در برابر ضربه"}]', '2026-11-24 19:25:00+00', 'Redmi 20000mAh 18W', 'پاور بانک 20000 Redmi شیائومی مدل PB200LZM به همراه یک عدد کابل شارژ 25 سانتی‌متری ارائه می‌شود. این محصول با داشتن دو پورت خروجی USB و پشتیبانی از انواع پروتکل‌های شارژ سریع، بهترین همراه شما در خارج از منزل، محل کار و یا هنگام سفر خواهد بود. پاور بانک Redmi با برخورداری از شارژ هوشمند به راحتی می‌تواند به طور هم‌زمان دو دستگاه را شارژ کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'chargers', 'بررسی پاور بانک شیائومی ۲۰۰۰۰ میلی‌آمپر ساعتی
پاور بانک Redmi 20000 میلی‌آمپر ساعتی یکی از محصولات برتر و محبوب این برند در بازار لوازم جانبی موبایل است. با ظرفیت بالا و ویژگی‌های متنوع، این پاوربانک می‌تواند انتخابی عالی برای کاربرانی باشد که به دنبال یک منبع تغذیه قابل حمل و قدرتمند هستند.

طراحی و ساخت
پاور بانک شیائومی ۲۰۰۰۰ میلی‌آمپر ساعتی با طراحی ساده و شیک خود، توجه بسیاری از کاربران را به خود جلب می‌کند. این دستگاه از جنس پلاستیک مقاوم ساخته شده که در برابر ضربه و خش مقاومت خوبی دارد. ابعاد جمع و جور و وزن مناسب این پاوربانک، حمل و نقل آن را آسان می‌کند و می‌توانید به راحتی آن را در کیف یا جیب خود قرار دهید.

ظرفیت و عملکرد
یکی از مهم‌ترین ویژگی‌های این پاوربانک، ظرفیت ۲۰۰۰۰ میلی‌آمپر ساعتی آن است. این ظرفیت بالا به کاربران امکان می‌دهد تا چندین بار دستگاه‌های خود را شارژ کنند. به عنوان مثال، می‌توانید یک گوشی هوشمند با باتری ۳۰۰۰ میلی‌آمپری را تا ۶ بار به طور کامل شارژ کنید. همچنین، پاور بانک Redmi ظرفیت 20000 قابلیت شارژ تبلت‌ها و دستگاه‌های دیگر با مصرف انرژی بالاتر را نیز دارد.

باتری لیتیوم یونی و پلیمری
کمپانی شیائومی در طراحی پاور بانک مدل Redmi از باتری‌های نوع لیتیوم یونی استفاده کرده که با باتری‌های لیتیوم پلیمری تفاوت‌هایی دارد. تفاوت این دو باتری می‌تواند در ظاهر، عملکرد و حتی هزینه‌ی یک پاوربانک هم تاثیرگذار باشد. باتری‌های لیتیوم یونی در دمای 20- تا 60 درجه سانتی‌گراد، عملکرد مطلوبی دارند. اما پلیمری‌ها می‌توانند دامنه‌ی بیشتری از طیف دما را پوشش دهند و در دمای بسیار بالا یا بسیار پایین هم می‌توانند کارایی خود را حفظ کنند. به طور کلی وزن باتری‌های پلیمری سبک‌تر از یونی است. از این گذشته، باتری‌های پلیمری به دلیل انرژی خروجی کمتری که دارند، نسبت به باتری‌های یونی، از طول عمر بیشتری برخوردار می‌شوند.

ایمنی و حفاظت
پاوربانک شیائومی با تکنولوژی‌های ایمنی متعددی مجهز شده است تا از دستگاه‌های شما در برابر خطرات مختلف محافظت کند. این دستگاه دارای محافظت در برابر ولتاژ بالا، جریان بیش از حد، دمای بالا و اتصال کوتاه است. این ویژگی‌ها باعث می‌شوند تا کاربران با اطمینان کامل از این پاوربانک استفاده کنند.

نمایشگر LED
این پاوربانک دارای نمایشگر LED است که میزان شارژ باقی‌مانده را نشان می‌دهد. این ویژگی به کاربران کمک می‌کند تا در هر زمان از میزان شارژ پاوربانک خود مطلع شوند و بتوانند زمان مناسبی برای شارژ مجدد آن برنامه‌ریزی کنند.

سازگاری گسترده
پاور بانک ردمی 20000 میلی‌آمپر ساعتی با انواع دستگاه‌ها سازگار است. از گوشی‌های هوشمند و تبلت‌ها گرفته تا دستگاه‌های پوشیدنی و لوازم جانبی دیگر، این پاوربانک می‌تواند تمامی دستگاه‌های شما را به راحتی شارژ کند. این سازگاری گسترده باعث می‌شود تا کاربران نیازی به حمل چندین شارژر مختلف نداشته باشند.

نتیجه‌گیری
پاور بانک شیائومی ۲۰۰۰۰ میلی‌آمپر ساعتی با ظرفیت بالا، ویژگی‌های شارژ سریع و طراحی مقاوم، یکی از بهترین گزینه‌های موجود در بازار است. این دستگاه با قابلیت‌های ایمنی و سازگاری گسترده خود، می‌تواند نیازهای شارژ کاربران مختلف را به خوبی برآورده کند. قیمت پاور بانک شیائومی 20000 اصلی با توجه به برند معتبر و جهانی آن را به خریدی اقتصادی تبدیل می‌کند. اگر به دنبال یک پاوربانک قدرتمند و قابل اعتماد هستید، پاوربانک شیائومی ۲۰۰۰۰ میلی‌آمپر ساعتی انتخابی عالی خواهد بود.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('topomax-f165-powerbank-20000', 'topomax-f165-powerbank-20000', 'پاوربانک 22.5 وات توپومکس مدل F165 ظرفیت 20000 میلی آمپر ساعت به همراه کابل لایتنینگ و USB-C', 'Topomax F165 20000mAh 22.5W Power Bank with Lightning & USB-C Cables', 'Topomax', 'chargers', 4895000, 10500000, 53, true, 10, true, 'سرویس ویژه دیجی کالا: 7 روز تضمین بازگشت کالا', '4.1', 14, '{"display":"نمایشگر عددی درصد شارژ","displayDetails":"بدنه ABS ضد گردوغبار","chipset":"فست شارژ ۲۲.۵ وات هوشمند","chipsetDetails":"ورودی/خروجی Type-C + خروجی USB-A","camera":"۲ کابل متصل کنفی لایتنینگ و Type-C","cameraDetails":"مناسب آیفون، اندروید و کمپینگ","battery":"۲۰۰۰۰ میلی‌آمپر ساعت","batteryDetails":"توان ۲۲.۵ وات · لیتیوم یونی","storageDefault":"۲۰۰۰۰ میلی‌آمپر","ram":"۲۲.۵ وات","os":"کابل‌های داخلی کنفی"}', '[{"label":"۲۰۰۰۰ میلی‌آمپر","subtitle":"کابل کنفی لایتنینگ + USB-C","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/3c09e541cbe7659ddad9d88f3f186f6183854fdc_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۵۳٪ تخفیف', 85, true, false, 25, 25, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/3c09e541cbe7659ddad9d88f3f186f6183854fdc_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/090be1db7ac4207a80d7cf304ad42d8787705496_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/76a4daf19a1e18359c5988ef284bc933291a2616_1792325386.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/88f360b91917af886c80aa397ff357cdd3f7b6bb_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/897b59b111a5e765820ad8cfd8fa0c2d0ce50f45_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b1e2291f0b55e1a9ff741d49e8031dc3ffc902cb_1792324598.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d6c407cd65d58648280c124f1ddbf08435d02c37_1792324599.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ee94d5e612a35fb9a394212b15774528381ea81c_1792324599.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-23000321"},{"label":"ابعاد و وزن","value":"۲۱×۸×۳ سانتی‌متر · ۳۸۰ گرم"},{"label":"نحوه نمایش شارژ","value":"نمایشگر دیجیتال عددی به درصد"}]', '2026-11-24 19:25:00+00', 'Topomax F165 20000mAh 22.5W', 'پاوربانک جدید برند توپومکس مدل F165 با ظرفیت 20 هزار میلی آمپر مناسب کسانی است که میخواهند همیشه شارژ داشته باشند و در عین حال وزن سنگین جابجا نکنند. این پاوربانک زیبا ، مقاوم ، جمع و جور و در عین حال پر قدرت است. توان خروجی آن تا 22.5 وات بوده و دارای 2 کابل متصل از نوع لایتنینگ و Type-C کنفی می باشد. این پاوربانک دارای صفحه نمایشگر عددی میزان شارژ به درصد است که از مزیت های آن است.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'topomax', 'chargers', 'پاوربانک جدید برند توپومکس مدل F165 با ظرفیت 20 هزار میلی آمپر مناسب کسانی است که میخواهند همیشه شارژ داشته باشند و در عین حال وزن سنگین جابجا نکنند. این پاوربانک زیبا ، مقاوم ، جمع و جور و در عین حال پر قدرت است. توان خروجی آن تا 22.5 وات بوده و دارای 2 کابل متصل از نوع لایتنینگ و Type-C کنفی می باشد. این پاوربانک دارای صفحه نمایشگر عددی میزان شارژ به درصد است که از مزیت های آن است. دارا بودن پورت ورودی / خروجی Type-C در کنار پورت خروجی USB-A بر کاربری حرفه ای آن افزوده است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-watch-se-3-40mm', 'apple-watch-se-3-40mm', 'ساعت هوشمند 40 میلی متری اپل مدل SE 3 Aluminum Case با بند سیلیکونی', 'Apple Watch SE 3 40mm Aluminum Case with Silicone Band', 'Apple', 'smartwatches', 61499000, 65601000, 6, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.6', 139, '{"display":"۴۰ میلی‌متر Retina OLED","displayDetails":"صفحه همیشه روشن Always-on Display","chipset":"Apple SiP","chipsetDetails":"پشتیبانی دستیار صوتی و مکالمه بلوتوثی","camera":"تشخیص سقوط و تصادف + GPS","cameraDetails":"GPS / GLONASS / GALILEO","battery":"شارژدهی تمام‌روز","batteryDetails":"وزن فوق‌سبک ۲۶.۳ گرم","storageDefault":"۴۰ میلی‌متر","ram":"۶۴ گیگابایت","os":"watchOS (سازگار با iOS)"}', '[{"label":"۴۰ میلی‌متر","subtitle":"قاب آلومینیومی · بند سیلیکونی","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"},{"id":"beige-2","hex":"#e6dab3","name":"بژ"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/87b4a4d29e663768c50d43e77841a2e45033c9f6_1764429371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۶٪ تخفیف', 93, false, true, 26, 26, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/87b4a4d29e663768c50d43e77841a2e45033c9f6_1764429371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7206da45906e1b25ecc968051a369aaaab07f2ff_1786906444.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f1a2cdbb622e7fbbbe36b5035031f52b9207f931_1779535002.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/02733f7e31b8c39538e7dbefc0a88181e2af95d8_1759045183.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ff33133128c63681632b60b78c75604d30e991f2_1759063435.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0de91646febbb913f3187d3e52c2f594e9fdafcc_1759045184.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f342eab89213a7013518eff384e1cb0066c46db8_1759045184.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/66ceae1975deddcf4574ece5f7ed56aeafd6fa9d_1759045184.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20547428"},{"label":"ابعاد قاب","value":"۴۰×۳۴×۱۰.۷ میلی‌متر · ۲۶.۳ گرم"},{"label":"زبان اعلان‌ها","value":"پشتیبانی کامل از فارسی و انگلیسی"}]', '2026-11-24 19:25:00+00', 'Apple Watch SE 3 40mm', 'اپل واچ SE 3 نماد تکامل در خانواده گجت‌های پوشیدنی اپل است که در سال ۲۰۲۵، استانداردهای جدیدی را برای ساعت‌های هوشمند میان‌رده تعریف می‌کند. این محصول با ظرافت تمام، فاصله میان مدل‌های اقتصادی و پرچمدار را کاهش داده و تجربه‌ای کامل، روان و بی‌نقص از اکوسیستم اپل را ارائه می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'smartwatches', 'مقدمه
در دنیای پرشتاب فناوری‌، سال ۲۰۲۵ نقطه عطفی برای شرکت اپل محسوب می‌شود. در حالی که نگاه‌ها اغلب به سمت مدل‌های گران‌قیمت سری ۱۱ یا نسخه غول‌پیکر اولترا ۳ خیره شده است، اپل با معرفی نسل سوم اپل واچ SE، یک حرکت استراتژیک و هوشمندانه را به نمایش گذاشت. این محصول که در سپتامبر ۲۰۲۵ به بازار عرضه شد، نه تنها جایگاه خود را به عنوان "مقرون‌به‌صرفه‌ترین" ساعت اپل تثبیت کرده، بلکه با گرفتن ویژگی‌های کلیدی از برادران بزرگترش، مرز بین میان‌رده و پرچمدار را کمرنگ‌تر از همیشه کرده است. اگر تصور می‌کنید که واژه "اقتصادی" به معنای "کم‌کیفیت" یا "ناقص" است، اپل واچ SE 3 آمده تا تمام پیش‌فرض‌های شما را تغییر دهد. این بررسی حاصل تجربه و تحلیل دقیق این گجت است تا ببینیم آیا این ساعت، همان‌طور که بسیاری معتقدند، منطقی‌ترین انتخاب برای اکثر کاربران آیفون در سال ۲۰۲۵ است یا خیر.

طراحی و کیفیت ساخت
در نگاه نخست، اپل واچ SE 3 تفاوت بنیادینی با نسل قبلی خود ندارد و این موضوع لزوماً نکته‌ای منفی نیست. اپل تصمیم گرفته است تا زبان طراحی امتحان‌پس‌داده و محبوب خود را حفظ کند. این ساعت همچنان در دو سایز ۴۰ و ۴۴ میلی‌متری عرضه می‌شود که برای طیف وسیعی از مچ‌ها مناسب است. بدنه آلومینیومی ساعت حس آشنایی را منتقل می‌کند، اما این بار با یک تغییر نامحسوس ولی مهم همراه شده است. برخلاف شایعاتی که پیش از معرفی در سال ۲۰۲۴ و اوایل ۲۰۲۵ مبنی بر استفاده از بدنه پلاستیکی رنگارنگ شنیده می‌شد، اپل همچنان به متریال‌های باکیفیت وفادار مانده است. بدنه از آلومینیوم بازیافتی ساخته شده که نه تنها حس لوکس بودن را حفظ کرده، بلکه با استانداردهای زیست‌محیطی سخت‌گیرانه اپل نیز همخوانی دارد.
بخش پشتی بدنه که ترکیبی از کامپوزیت نایلون و کریستال یاقوت کبود است، با رنگ بدنه هماهنگی کامل دارد و حس یکپارچگی بیشتری را نسبت به نسل‌های اولیه القا می‌کند. اما مهم‌ترین ارتقای فیزیکی در بخش شیشه جلویی رخ داده است. استفاده از نسل جدید شیشه Ion-X که طبق ادعای سازنده تا چهار برابر مقاوم‌تر از نسل قبل است، نگرانی‌های کاربران در مورد خط و خش‌های روزمره را تا حد زیادی برطرف می‌کند. این استحکام برای ساعتی که قرار است همراه همیشگی شما در ورزش، کار و خواب باشد، یک مزیت حیاتی محسوب می‌شود. ارگونومی ساعت همچنان بی‌نقص است؛ وزن سبک آن باعث می‌شود که پس از چند دقیقه فراموش کنید ساعتی به دست دارید و این ویژگی به‌خصوص برای پایش خواب که یکی از تمرکزهای اصلی این نسل است، اهمیت دوچندان پیدا می‌کند. دکمه چرخان یا همان Digital Crown همچنان با بازخورد هپتیک دقیق خود، لذت‌بخش‌ترین روش برای تعامل با رابط کاربری watchOS 26 است.

صفحه نمایش
شاید بتوان بزرگترین و انقلابی‌ترین تغییر در اپل واچ SE 3 را در صفحه نمایش آن جستجو کرد. سال‌ها بود که کاربران مدل‌های SE حسرت یکی از کاربردی‌ترین ویژگی‌های مدل‌های سری اصلی، یعنی صفحه نمایش همیشه روشن (Always-On Display) را می‌خوردند. خوشبختانه در سال ۲۰۲۵، اپل این حصار را شکست. نمایشگر Retina LTPO OLED این ساعت اکنون قادر است زمان و اطلاعات حیاتی را بدون نیاز به بالا آوردن مچ دست یا ضربه زدن به صفحه نمایش دهد. این ویژگی شاید روی کاغذ ساده به نظر برسد، اما در تجربه کاربری روزمره تفاوت چشمگیری ایجاد می‌کند. تصور کنید در یک جلسه کاری هستید و می‌خواهید بدون جلب توجه ساعت را چک کنید، یا در حال تایپ کردن هستید و نیاز دارید نگاهی گذرا به زمان بیندازید؛ نمایشگر همیشه روشن در این لحظات ارزش واقعی خود را نشان می‌دهد.
روشنایی صفحه نمایش به ۱۰۰۰ نیت می‌رسد که برای خوانایی در زیر نور مستقیم آفتاب کاملاً کافی است. اگرچه این عدد به اندازه روشنایی خیره‌کننده مدل‌های اولترا نیست، اما در سناریوهای واقعی و استفاده‌های روزمره کاملاً راضی‌کننده عمل می‌کند. حاشیه‌های نمایشگر نسبت به نسل دوم SE اندکی باریک‌تر شده‌اند، هرچند هنوز به ظرافت و کم‌حاشیگی سری ۱۱ نمی‌رسند. با این حال، فضای کاری کافی برای تعامل با اپلیکیشن‌ها و خواندن متون وجود دارد. کنتراست رنگ‌ها عالی است و رنگ مشکی عمیق نمایشگر OLED باعث می‌شود مرز بین نمایشگر و حاشیه در واچ‌فیس‌های تیره کاملاً محو شود. پاسخگویی لمسی صفحه نیز به لطف نرخ نوسازی متغیر، بسیار روان و سریع است و هیچ‌گونه تاخیری در اجرای فرمان‌ها مشاهده نمی‌شود.

سخت‌افزار و عملکرد
یکی از سیاست‌های تحسین‌برانگیز اپل در مدل SE 3، عدم تبعیض در بخش پردازنده است. این ساعت از همان تراشه قدرتمند S10 بهره می‌برد که در قلب گران‌قیمت‌ترین ساعت‌های سال ۲۰۲۵ اپل می‌تپد. این تراشه ۶۴ بیتی دو هسته‌ای، سرعتی خیره‌کننده به رابط کاربری بخشیده است. جابجایی بین اپلیکیشن‌ها، اجرای برنامه‌های سنگین ورزشی و پردازش‌های پس‌زمینه با سرعتی باورنکردنی انجام می‌شود. حضور این تراشه قدرتمند تنها برای سرعت نیست؛ بلکه امکاناتی نظیر پردازش محلی Siri را نیز فراهم کرده است. اکنون دستیار صوتی اپل می‌تواند بسیاری از درخواست‌ها را بدون نیاز به اتصال اینترنت و مستقیماً روی ساعت پردازش کند که این امر سرعت پاسخگویی را به طرز چشمگیری افزایش داده است.
علاوه بر این، چیپ S10 امکان استفاده از ژست‌های حرکتی جدید مانند "دابل تپ" (Double Tap) را به صورت کاملاً کاربردی فراهم کرده است. شما می‌توانید تنها با دوبار کوبیدن انگشت اشاره و شست به یکدیگر، تماس‌ها را پاسخ دهید، تایمر را متوقف کنید یا ویجت‌های هوشمند را مرور کنید. این قابلیت که پیش‌تر در انحصار مدل‌های رده‌بالا بود، اکنون تجربه کاربری SE 3 را به سطحی جدید ارتقا داده است. حافظه داخلی دستگاه نیز برای ذخیره‌سازی موزیک، پادکست و اپلیکیشن‌ها کاملاً کافی است و کاربر به ندرت با کمبود فضا مواجه خواهد شد. اسپیکرهای دستگاه نیز بهبود یافته‌اند و اکنون می‌توانند موسیقی و پادکست را مستقیماً پخش کنند، ویژگی‌ای که برای لحظاتی که هدفون همراه ندارید، بسیار کارآمد است.

قابلیت‌های سلامتی و ورزشی
اپل واچ SE 3 در بخش سلامتی، استراتژی خوبی را در پیش گرفته است. در حالی که حسگرهای پیچیده‌ای مانند نوار قلب (ECG) یا سنجش اکسیژن خون همچنان در انحصار مدل‌های گران‌تر باقی مانده‌اند، اما SE 3 ویژگی‌های جدید و بسیار مهمی را دریافت کرده است. مهم‌ترین آن‌ها اضافه شدن حسگر دما است. این حسگر اگرچه دمای دقیق بدن را به صورت لحظه‌ای نشان نمی‌دهد، اما در طول شب تغییرات دمای بدن را پایش می‌کند که برای ردیابی چرخه سلامت زنان و تخمین زمان تخمک‌گذاری بسیار حیاتی است. این ویژگی اپل واچ SE 3 را به ابزاری قدرتمند برای سلامت زنان تبدیل کرده است.
علاوه بر این، قابلیت تشخیص آپنه خواب (Sleep Apnea) یکی دیگر از افزودنی‌های مهم نرم‌افزاری و سخت‌افزاری در این نسل است. ساعت با پایش دقیق الگوهای تنفسی در طول ۳۰ شب، می‌تواند نشانه‌های اختلالات تنفسی را شناسایی کرده و به کاربر هشدار دهد تا به پزشک مراجعه کند. این ویژگی می‌تواند نجات‌بخش جان بسیاری از افراد باشد که از مشکلات خواب خود بی‌خبرند. پایش ضربان قلب همچنان با دقت بسیار بالایی انجام می‌شود و هشدارهای ضربان نامنظم، بالا یا پایین غیرعادی، همچنان یکی از قابل‌اعتمادترین ویژگی‌های این ساعت است. سیستم تشخیص تصادف و تشخیص سقوط نیز با الگوریتم‌های پیشرفته‌تر در watchOS 26 حضور دارند تا امنیت کاربر را تضمین کنند. اپلیکیشن Vitals جدید نیز با جمع‌آوری داده‌های مختلف، دیدی کلی و جامع از وضعیت سلامتی روزانه به کاربر می‌دهد که درک آن بسیار ساده و کاربردی است.
توجه: قابلیت‌هایی مانند تشخیص آپنه خواب، تشخیص تصادف و تشخیص سقوط ممکن است در کشور ایران کار نکند.

نرم‌افزار و تجربه کاربری
سیستم عامل watchOS 26 روح تازه‌ای به کالبد SE 3 دمیده است. ویجت‌های هوشمند (Smart Stack) که با چرخاندن Digital Crown ظاهر می‌شوند، دسترسی به اطلاعات ضروری را بدون نیاز به باز کردن اپلیکیشن‌ها ممکن می‌سازند. طراحی رابط کاربری تمیزتر شده و فونت‌ها خواناتر شده‌اند. یکی از ویژگی‌های جذاب نرم‌افزاری، قابلیت Check In است که به شما اجازه می‌دهد رسیدن خود به مقصد را به طور خودکار به عزیزان‌تان اطلاع دهید، ویژگی‌ای که حس امنیت را به خصوص برای والدین یا افرادی که تنها زندگی می‌کنند، افزایش می‌دهد.
قابلیت Check in نیازمند تایید دو مرحله‌ای اپل اکانت است.
هماهنگی نرم‌افزار و سخت‌افزار در این ساعت مثال‌زدنی است. انیمیشن‌ها روان هستند و هیچ‌گونه لگ یا کندی مشاهده نمی‌شود. اپل همچنین واچ‌فیس‌های جدیدی را اختصاصاً برای بهره‌گیری از نمایشگر همیشه روشن طراحی کرده که علاوه بر زیبایی، مصرف باتری را نیز بهینه می‌کنند. یکپارچگی با اکوسیستم اپل همچنان برگ برنده اصلی این ساعت است؛ از باز کردن قفل مک‌بوک گرفته تا پیدا کردن آیفون گم شده با دقت بالا، همه چیز به شکلی جادویی و بدون نقص کار می‌کند.

باتری و شارژدهی
یکی از نگرانی‌های همیشگی کاربران ساعت‌های هوشمند، عمر باتری است. اپل واچ SE 3 با وجود اضافه شدن قابلیت نمایشگر همیشه روشن و پردازنده قوی‌تر، همچنان وعده ۱۸ ساعت عمر باتری را می‌دهد که در استفاده واقعی اغلب فراتر از این عدد می‌رود. با استفاده معمولی شامل دریافت اعلان‌ها، یک جلسه تمرین ورزشی ۴۵ دقیقه‌ای با GPS و پایش خواب، می‌توانید انتظار داشته باشید که ساعت حدود ۲۴ ساعت دوام بیاورد. البته اگر حالت Low Power Mode را فعال کنید، این زمان می‌تواند تا ۳۲ ساعت و حتی بیشتر افزایش یابد که برای سفرهای کوتاه آخر هفته بسیار مفید است.
اما نکته درخشان در بخش انرژی، سرعت شارژ است. اپل واچ SE 3 اکنون از قابلیت شارژ سریع پشتیبانی می‌کند. این یعنی شما می‌توانید باتری ساعت را از صفر تا ۸۰ درصد تنها در حدود ۴۵ دقیقه شارژ کنید. این ویژگی برای کسانی که می‌خواهند پایش خواب داشته باشند بسیار کاربردی است؛ کافی است قبل از خواب و در زمان مسواک زدن یا دوش گرفتن، ساعت را روی شارژر بگذارید تا انرژی لازم برای تمام شب و صبح روز بعد را ذخیره کند. تغییر در معماری شارژینگ باعث شده است که نگرانی از تمام شدن باتری در وسط روز تا حد زیادی کاهش یابد.

جمع‌بندی
اپل واچ SE 3 محصولی است که نشان می‌دهد اپل صدای کاربرانش را شنیده است. این ساعت دیگر یک نسخه "ارزان‌قیمت" که حس کمبود را منتقل کند نیست، بلکه یک گجت کامل و بالغ است که اکثر نیازهای کاربران را پوشش می‌دهد. اضافه شدن نمایشگر همیشه روشن، تراشه قدرتمند S10 و ویژگی‌های سلامتی جدید مانند سنسور دما، فاصله این مدل را با مدل‌های پرچمدار بسیار کم کرده است. شاید اگر ورزشکار حرفه‌ای باشید یا نیاز مبرم به نوار قلب داشته باشید، مدل‌های سری ۱۱ یا اولترا گزینه‌های بهتری باشند، اما برای ۹۰ درصد کاربران، SE 3 تمام آن چیزی است که از یک ساعت هوشمند انتظار دارند.
این ساعت ترکیبی متعادل از عملکرد، زیبایی و قیمت است. طراحی آن اگرچه تکراری است، اما همچنان شیک و مدرن به نظر می‌رسد. حذف ویژگی‌های لوکس برای پایین نگه داشتن قیمت، به گونه‌ای انجام شده که به تجربه کاربری لطمه‌ای وارد نمی‌کند. در بازاری که قیمت گجت‌ها روز به روز افزایش می‌یابد، اپل واچ SE 3 با ارائه مجموعه‌ای از ویژگی‌های پریمیوم در یک بازه قیمتی معقول، نه تنها بهترین گزینه برای ورود به دنیای ساعت‌های هوشمند اپل است، بلکه برای کسانی که از مدل‌های قدیمی‌تر استفاده می‌کنند نیز یک ارتقای منطقی و هیجان‌انگیز محسوب می‌شود. می‌توان با قاطعیت گفت که اپل واچ SE 3، قهرمان بی‌ادعای سال ۲۰۲۵ و انتخابی است که پشیمانی به دنبال نخواهد داشت.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-watch-series-12-46mm', 'apple-watch-series-12-46mm', 'ساعت هوشمند 46 میلی‌متری اپل مدل Watch Series 12 Aluminum Case با بند سیلیکونی، سازگار با iOS', 'Apple Watch Series 12 46mm Aluminum Case with Silicone Band', 'Apple', 'smartwatches', 113999000, 128535800, 11, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.3', 3, '{"display":"۴۶ میلی‌متر LTPO OLED","displayDetails":"Always-on Display · بدنه آلومینیومی","chipset":"Apple SiP نسل جدید","chipsetDetails":"GPS پنج‌گانه دقیق","camera":"سنسورهای سلامت و پایش ورزش","cameraDetails":"تشخیص سقوط و تصادف + مکالمه بلوتوثی","battery":"شارژ سریع مغناطیسی","batteryDetails":"ضدآب تا عمق ۵۰ متر (ISO 22810)","storageDefault":"۴۶ میلی‌متر","ram":"۶۴ گیگابایت","os":"watchOS"}', '[{"label":"۴۶ میلی‌متر","subtitle":"قاب آلومینیومی · بند سیلیکونی","priceDelta":0}]', '[{"id":"bronze-1","hex":"#c77b30","name":"برنز"},{"id":"gold-2","hex":"#d4af38","name":"طلایی"},{"id":"gray-3","hex":"#9E9E9E","name":"خاکستری"},{"id":"black-4","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/37e9be718c32aeb0ca8f089dc8711646dc991236_1794758923.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'برنز', '۱۱٪ تخفیف · نسل جدید', 87, true, true, 27, 27, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/37e9be718c32aeb0ca8f089dc8711646dc991236_1794758923.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/47c0ca46be51e74051ff7ac66c04fa9b019cc19f_1789300943.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6d04f6feda345e68430517a250ab4a2505cd22ca_1789300942.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7839deaa9006922c607068d1ed89f8331cdba20d_1789300942.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0e7b960b0402bc7c9a9b15a2ac5dea343906eb2e_1789300942.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3d0bc1e100284a7d993e1eda8697fe427b444424_1789300942.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/24b5f4a263c93a78a2b1de2494cdd2b982237a56_1789300979.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/673706aee5cef7ec0d00074e5346bab7bc8c9dd1_1789300966.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22728454"},{"label":"ابعاد و وزن","value":"۴۶×۴۰×۹.۷ میلی‌متر · ۳۹.۵ گرم"},{"label":"مسیریابی ماهواره‌ای","value":"GPS · GLONASS · GALILEO · BDS · QZSS"}]', '2026-11-24 19:25:00+00', 'Apple Watch Series 12 46mm', 'Apple Watch Series 12 Aluminum Case برای کسی ساخته شده که یک ساعت سبک و همه‌فن‌حریف برای استفاده روزمره می‌خواهد؛ مدلی که ظاهر مینیمال قاب مستطیلی 46 میلی‌متری را با بدنه آلومینیومی 100 درصد بازیافتی و بند سیلیکونی ترکیب می‌کند. نمایشگر همیشه‌روشن Retina با پنل OLED و روشنایی 2000 نیت، خوانایی خوبی در شرایط مختلف به دست می‌دهد و در کنار ضخامت 9.7 میلی‌متر و وزن 39.5 گرم، حس راحتی روی مچ را حفظ می‌کند.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'smartwatches', 'مقدمه
اپل واچ سری ۱۲ یکی از ساعت‌های هوشمند اپل است که مجموعه‌ای از قابلیت‌های ورزشی، سلامتی و ارتباطی را در کنار طراحی مدرن و سخت‌افزاری پیشرفته ارائه می‌دهد. این ساعت با بهره‌گیری از تراشه S11، نمایشگر Retina با فناوری OLED و قابلیت نمایشگر همیشه‌روشن، تلاش می‌کند تجربه‌ای کامل از یک ساعت هوشمند را در اختیار کاربران قرار دهد. تمرکز اپل واچ سری ۱۲ تنها روی نمایش اعلان‌ها یا ثبت فعالیت‌های روزانه نیست؛ بلکه قابلیت‌هایی مانند پایش ضربان قلب، بررسی کیفیت خواب، ثبت اطلاعات تمرین‌های ورزشی و ارائه داده‌های مربوط به وضعیت عمومی بدن، بخش مهمی از امکانات آن را تشکیل می‌دهند.اپل این محصول را در اندازه‌های مختلف و با بدنه‌هایی از جنس آلومینیوم، تیتانیوم و سرامیک عرضه کرده است تا کاربران بتوانند با توجه به سلیقه و نیاز خود، گزینه مناسب‌تری را انتخاب کنند. پشتیبانی از GPS، ارتباطات بی‌سیم، قابلیت‌های ایمنی و امکانات نرم‌افزاری مبتنی بر watchOS نیز باعث شده‌اند این ساعت در حوزه‌های مختلفی مانند ورزش، پیگیری وضعیت سلامت و استفاده روزمره کاربرد داشته باشد.
در ادامه، اپل واچ سری ۱۲ را از نظر طراحی، کیفیت نمایشگر، امکانات ورزشی، قابلیت‌های سلامتی و عملکرد باتری بررسی می‌کنیم تا تصویری دقیق‌تر از امکانات و تجربه کاربری این ساعت ارائه شود.

طراحی و قابلیت‌های مقاومتی
اپل واچ سری ۱۲ از نظر طراحی، همچنان بر ساختاری جمع‌وجور، مستطیلی‌شکل و کاربردی تکیه دارد. این ساعت در نسخه‌های آلومینیومی، تیتانیومی و سرامیکی تولید شده و هرکدام از این مدل‌ها با رنگ‌بندی متفاوتی در دسترس هستند. نسخه آلومینیومی در رنگ‌های برنز تیره، طلایی روشن، مشکی و خاکستری فضایی عرضه می‌شود. نسخه تیتانیومی رنگ‌های طلایی درخشان و طبیعی دارد و مدل سرامیکی نیز در رنگ‌های سفید مرواریدی و آبی شب ارائه شده است. تنوع جنس بدنه به کاربران اجازه می‌دهد علاوه بر توجه به ظاهر ساعت، در انتخاب نوع ساختار آن نیز گزینه‌های مختلفی داشته باشند. اندازه ۴۶ میلی‌متری در مدل‌های آلومینیومی و تیتانیومی، ابعادی برابر با ۴۶ میلی‌متر ارتفاع، ۴۰ میلی‌متر عرض و ۹.۷ میلی‌متر ضخامت دارد. در نسخه سرامیکی، ارتفاع به ۴۷ میلی‌متر، عرض به ۴۱ میلی‌متر و ضخامت به ۹.۸۵ میلی‌متر می‌رسد.مدل کوچک‌تر در نسخه‌های آلومینیومی و تیتانیومی با ارتفاع ۴۲ میلی‌متر، عرض ۳۷ میلی‌متر و ضخامت ۹.۷ میلی‌متر ساخته شده است. نسخه سرامیکی این اندازه، ارتفاعی برابر با ۴۳ میلی‌متر و ضخامت ۹.۸۵ میلی‌متر دارد. این تفاوت‌ها باعث می‌شوند کاربران بتوانند اندازه مناسب‌تری را با توجه به ابعاد مچ دست خود انتخاب کنند.
از نظر وزن، نسخه آلومینیومی GPS در اندازه بزرگ‌تر ۳۹.۵ گرم وزن دارد و وزن مدل GPS به‌همراه ارتباطات سلولار در همین اندازه به ۳۸.۶ گرم می‌رسد. وزن نسخه تیتانیومی ۴۴.۹ گرم است و مدل‌های سرامیکی سفید مرواریدی و آبی شب به‌ترتیب ۵۱.۳ و ۵۲.۹ گرم وزن دارند. در اندازه کوچک‌تر نیز وزن نسخه آلومینیومی GPS برابر با ۳۲.۲ گرم است. اپل واچ سری ۱۲ به تاج دیجیتال با بازخورد لمسی، دکمه کناری، بلندگو، میکروفون مجهز به قابلیت جداسازی صدا و دکمه آزادسازی بند مجهز شده است. وجود تاج دیجیتال، امکان کنترل بخش‌هایی از رابط کاربری را فراهم می‌کند و بازخورد لمسی آن باعث می‌شود تعامل با ساعت حس دقیق‌تری داشته باشد. این محصول از ژست‌های حرکتی مختلف مانند ضربه‌زدن، دو بار ضربه‌زدن و حرکت مچ دست نیز پشتیبانی می‌کند. از نظر مقاومت، اپل واچ سری ۱۲ در برابر آب تا عمق ۵۰ متر مقاوم است و بر اساس استاندارد ISO 22810:2010 برای استفاده در فعالیت‌های آبی مانند شنا طراحی شده است. البته مقاومت در برابر آب به معنای مناسب‌بودن ساعت برای تمام فعالیت‌های آبی یا شرایط محیطی نیست. این ساعت همچنین گواهی مقاومت در برابر گردوغبار IP6X را دارد که از مقاومت آن در برابر نفوذ گردوغبار حکایت می‌کند. در نسخه‌های آلومینیومی از محافظ Ceramic Shield 2 و در مدل‌های تیتانیومی و سرامیکی از کریستال جلویی یاقوت کبود استفاده شده است. این تفاوت در ساختار محافظ نمایشگر، یکی از ویژگی‌هایی است که در زمان انتخاب میان نسخه‌های مختلف ساعت اهمیت پیدا می‌کند.

صفحه نمایش
نمایشگر اپل واچ سری ۱۲ یکی از مهم‌ترین بخش‌های تجربه کاربری این ساعت است. اپل در این محصول از نمایشگر همیشه‌روشن Retina با پنل OLED و فناوری LTPO3 استفاده کرده است. پشتیبانی از قابلیت نمایشگر همیشه‌روشن باعث می‌شود اطلاعات روی صفحه بدون نیاز به فعال‌کردن کامل نمایشگر، در دسترس کاربر باقی بمانند. فناوری LTPO3 در کنار نرخ نوسازی یک هرتز، امکان مدیریت بهینه‌تر نحوه به‌روزرسانی تصویر را فراهم می‌کند. نرخ نوسازی یک هرتز در شرایطی که محتوای صفحه ثابت است، به نمایشگر اجازه می‌دهد با سرعت پایین‌تری فعالیت کند. این موضوع در کنار سایر فناوری‌های به‌کاررفته در ساعت، بخشی از رویکرد اپل برای مدیریت مصرف انرژی نمایشگر است. اپل واچ سری ۱۲ در دو اندازه نمایشگر عرضه می‌شود. مدل ۴۶ میلی‌متری وضوح تصویر ۴۱۶ در ۴۹۶ پیکسل دارد و مساحت فعال صفحه‌نمایش آن به ۱۱۹۶ میلی‌مترمربع می‌رسد. مدل ۴۲ میلی‌متری نیز از وضوح ۳۷۴ در ۴۴۶ پیکسل و مساحت فعال ۹۷۰ میلی‌مترمربع بهره می‌برد. تراکم پیکسلی هر دو نسخه ۳۲۶ پیکسل در هر اینچ است.
این تفاوت در ابعاد صفحه باعث می‌شود نسخه ۴۶ میلی‌متری فضای بیشتری برای نمایش اطلاعات در اختیار کاربر قرار دهد. در مقابل، مدل ۴۲ میلی‌متری ابعاد کوچک‌تری دارد و برای افرادی که ساعت جمع‌وجورتری می‌خواهند، گزینه دیگری محسوب می‌شود. حداکثر روشنایی نمایشگر به ۲۰۰۰ نیت می‌رسد. چنین سطحی از روشنایی در کنار حداقل روشنایی یک نیت، دامنه مناسبی برای تنظیم شدت نور صفحه در شرایط مختلف ایجاد می‌کند. روشنایی حداکثری بالا برای مشاهده اطلاعات در محیط‌های پرنور اهمیت دارد، درحالی‌که حداقل روشنایی پایین می‌تواند در محیط‌های تاریک، تجربه مشاهده صفحه را راحت‌تر کند. نمایشگر همیشه‌روشن در استفاده روزمره کاربرد زیادی دارد. کاربر می‌تواند بدون فعال‌سازی کامل صفحه، اطلاعاتی را که روی واچ‌فیس نمایش داده می‌شوند مشاهده کند. این قابلیت برای بررسی سریع زمان یا داده‌های مربوط به فعالیت‌های روزانه، یکی از بخش‌های کاربردی طراحی نمایشگر اپل واچ سری ۱۲ است.

قابلیت‌های ورزشی
اپل واچ سری ۱۲ مجموعه‌ای گسترده از قابلیت‌های ورزشی را در اختیار کاربران قرار می‌دهد و از فعالیت‌های مختلفی مانند دویدن، کوهنوردی، دوچرخه‌سواری و شنا پشتیبانی می‌کند. وجود حسگرهای حرکتی، قطب‌نما، ارتفاع‌سنج همیشه‌روشن و GPS دقیق، امکان ثبت داده‌های متنوعی را در هنگام انجام فعالیت‌های ورزشی فراهم می‌کند. در بخش دویدن، ساعت از تمرین‌های شخصی‌سازی‌شده، نماهای قابل تنظیم برای نمایش داده‌های ورزشی و قابلیت Training Load پشتیبانی می‌کند. این ویژگی به کاربر اجازه می‌دهد داده‌های مرتبط با تمرین خود را با جزئیات بیشتری بررسی کند. امکان نمایش مناطق ضربان قلب و تنظیم هشدارهای مربوط به ضربان قلب، سرعت و اهداف تمرینی نیز در این بخش وجود دارد.
اپل واچ سری ۱۲ داده‌هایی مانند حداکثر اکسیژن مصرفی یا VO₂ max، آهنگ حرکت، طول گام، زمان تماس پا با زمین، نوسان عمودی و توان دویدن را نیز ثبت می‌کند. این اطلاعات برای افرادی که به بررسی جزئیات عملکرد خود در هنگام دویدن علاقه دارند، کاربرد دارند. قابلیت تشخیص خودکار پیست دویدن، مسیر مسابقه، تنظیم سرعت هدف و ثبت فعالیت‌های چندورزشی نیز در امکانات این ساعت قرار گرفته است. در بخش کوهنوردی، قطب‌نمای ساعت اطلاعاتی مانند جهت حرکت، شیب، ارتفاع و مختصات را ارائه می‌دهد. امکان تعریف نقاط مسیر دلخواه، ثبت مسیر بازگشت با استفاده از GPS و استفاده از نقشه‌های آفلاین با قابلیت ایجاد مسیر اختصاصی نیز برای فعالیت‌های فضای باز در نظر گرفته شده است.برای دوچرخه‌سواری، اپل واچ سری ۱۲ اطلاعاتی مانند سرعت متوسط، مسافت طی‌شده و میزان افزایش ارتفاع را ثبت می‌کند. این ساعت از اتصال به تجهیزات دوچرخه‌سواری از طریق بلوتوث نیز پشتیبانی می‌کند و داده‌هایی مانند توان آستانه عملکرد، مناطق توان و آهنگ رکاب‌زدن را در اختیار کاربر قرار می‌دهد. نمایش فعالیت زنده روی آیفون نیز از دیگر امکانات این بخش است.
در زمینه شنا، ساعت از شنای استخری و شنای آب‌های آزاد پشتیبانی می‌کند. تشخیص خودکار نوع حرکت شنا، ثبت تعداد دورها، مسافت طی‌شده، سرعت متوسط و قابلیت تشخیص تخته شنا از جمله امکانات این بخش هستند. قابلیت‌هایی مانند ثبت زمان‌های تفکیک‌شده، شناسایی خودکار ست‌های تمرینی و نمایش امتیاز SWOLF نیز برای بررسی عملکرد شناگر در نظر گرفته شده‌اند. علاوه بر این موارد، اپل واچ سری ۱۲ از تمرین‌هایی مانند اسکی، اسنوبورد، قایقرانی، گلف، پیاده‌روی، تمرین‌های تناوبی پرفشار، یوگا، پیلاتس، تمرین قدرتی و تای‌چی پشتیبانی می‌کند. تنوع این فعالیت‌ها نشان می‌دهد که ساعت برای ثبت طیف گسترده‌ای از تمرین‌های ورزشی طراحی شده است.

قابلیت‌های سلامتی
یکی از مهم‌ترین بخش‌های امکانات اپل واچ سری ۱۲ به قابلیت‌های مرتبط با سلامت و پایش وضعیت بدن اختصاص دارد. این ساعت از سیستم حسگرهای سلامت شامل حسگر الکتریکی نسل دوم قلب، حسگر نوری ضربان قلب با قابلیت فعالیت مداوم، حسگر اکسیژن خون و حسگر دما بهره می‌برد. در بخش پایش قلب، امکاناتی مانند نمایش ضربان قلب، اعلان ضربان قلب بالا یا پایین، بررسی تغییرپذیری ضربان قلب و ثبت ضربان قلب در پس‌زمینه با فرکانس بالا در نظر گرفته شده است. اپل واچ سری ۱۲ همچنین از قابلیت ثبت نوار قلب یا ECG پشتیبانی می‌کند. اعلان‌های مربوط به ریتم نامنظم قلب نیز در فهرست امکانات سلامتی ساعت قرار دارند. این ساعت از اپلیکیشن Vitals بهره می‌برد که داده‌هایی مانند ضربان قلب، تعداد تنفس، دمای مچ دست، مدت‌زمان خواب و تغییرپذیری ضربان قلب را نمایش می‌دهد. کنار هم قرارگرفتن این داده‌ها می‌تواند به کاربر کمک کند اطلاعات مربوط به وضعیت بدن خود را در یک محیط یکپارچه مشاهده کند.
اپلیکیشن Readiness نیز یکی از ابزارهای سلامتی ساعت است که در کنار دیگر قابلیت‌های پایش وضعیت بدن ارائه می‌شود. اپلیکیشن‌های اختصاصی خواب، نمایش مراحل خواب و ارائه امتیاز خواب نیز برای افرادی در نظر گرفته شده‌اند که به بررسی الگوی استراحت خود علاقه دارند. اپل واچ سری ۱۲ از قابلیت اعلان مربوط به وقفه تنفسی در خواب و اعلان‌های مرتبط با فشار خون نیز پشتیبانی می‌کند. این امکانات در کنار قابلیت‌های دیگر سلامت، مجموعه‌ای گسترده از ابزارهای پایش بدن را در اختیار کاربر قرار می‌دهند. بااین‌حال، داده‌های ثبت‌شده توسط ساعت نباید جایگزین بررسی‌های پزشکی یا تشخیص متخصصان سلامت شوند.در بخش سلامت بانوان، اپلیکیشن Advanced Cycle Tracking امکاناتی مانند تخمین بازه باروری، تخمین زمان تخمک‌گذاری بر اساس داده‌های گذشته و پشتیبانی از قابلیت‌های مرتبط با دوران پیش‌یائسگی و یائسگی را ارائه می‌دهد. اپلیکیشن داروها نیز برای مدیریت اطلاعات مربوط به مصرف داروها در نظر گرفته شده است.
از دیگر امکانات سلامتی اپل واچ سری ۱۲ می‌توان به اپلیکیشن Mindfulness با قابلیت ثبت وضعیت ذهنی، اپلیکیشن Noise برای پایش سروصدای محیط و اپلیکیشن‌های مرتبط با ایمنی اشاره کرد. قابلیت تشخیص سقوط، تشخیص تصادف، تماس اضطراری و Check In نیز در فهرست امکانات ایمنی ساعت قرار دارند.

باتری و شارژدهی
اپل واچ سری ۱۲ به باتری لیتیوم‌یونی قابل شارژ مجهز شده است و از قابلیت شارژ سریع پشتیبانی می‌کند. اپل اعلام کرده است که این ساعت در استفاده معمولی می‌تواند تا ۲۴ ساعت شارژدهی داشته باشد. این میزان شارژدهی برای استفاده روزمره، بررسی اعلان‌ها، مشاهده زمان و ثبت فعالیت‌های مختلف در طول روز در نظر گرفته شده است. با فعال‌کردن حالت کم‌مصرف، شارژدهی ساعت به حداکثر ۳۸ ساعت می‌رسد. حالت کم‌مصرف برای شرایطی کاربرد دارد که کاربر قصد دارد مدت بیشتری از ساعت استفاده کند و می‌تواند در مدیریت انرژی باتری نقش داشته باشد. در زمان انجام تمرین‌های ورزشی در فضای باز نیز اپل واچ سری ۱۲ می‌تواند تا ۱۰ ساعت شارژدهی ارائه دهد. البته میزان واقعی استفاده از باتری به نوع فعالیت، نحوه استفاده از قابلیت‌های ساعت و شرایط کاری آن بستگی دارد.
یکی از ویژگی‌های مهم اپل واچ سری ۱۲، سرعت شارژ آن است. طبق مشخصات اعلام‌شده، باتری ساعت در حدود ۳۰ دقیقه می‌تواند تا ۸۰ درصد شارژ شود. همچنین ۱۵ دقیقه شارژ، انرژی لازم برای حداکثر ۱۲ ساعت استفاده معمولی را فراهم می‌کند. برای افرادی که از ساعت در زمان خواب استفاده می‌کنند، قابلیت شارژ سریع اهمیت بیشتری پیدا می‌کند. اپل اعلام کرده است که تنها با پنج دقیقه شارژ می‌توان انرژی لازم برای حداکثر ۱۰ ساعت پایش خواب را فراهم کرد. این قابلیت باعث می‌شود کاربر بتواند در فاصله‌های کوتاه، ساعت را برای استفاده در طول شب آماده کند.

جمع‌بندی و نتیجه‌گیری
اپل واچ سری ۱۲ مجموعه‌ای از قابلیت‌های سخت‌افزاری و نرم‌افزاری را در قالب ساعتی با طراحی متنوع و نمایشگر باکیفیت ارائه می‌دهد. وجود نسخه‌های آلومینیومی، تیتانیومی و سرامیکی در کنار دو اندازه مختلف، امکان انتخاب محصولی متناسب با سلیقه و ابعاد مچ دست را فراهم می‌کند. مقاومت در برابر آب تا عمق ۵۰ متر، گواهی IP6X و استفاده از محافظ‌های متفاوت نمایشگر نیز از ویژگی‌های قابل‌توجه طراحی این ساعت هستند. نمایشگر همیشه‌روشن Retina با روشنایی حداکثری ۲۰۰۰ نیت، وضوح مناسب و فناوری LTPO3، بخش مهمی از تجربه کاربری اپل واچ سری ۱۲ را شکل می‌دهد. این نمایشگر در کنار کنترل‌های لمسی، تاج دیجیتال و ژست‌های حرکتی، تعامل با ساعت را ساده‌تر می‌کند. در بخش ورزشی، پشتیبانی از انواع فعالیت‌ها، ثبت داده‌های تخصصی دویدن، امکانات مربوط به دوچرخه‌سواری، کوهنوردی و شنا و وجود GPS دقیق، این محصول را به ابزاری برای پیگیری فعالیت‌های ورزشی تبدیل کرده است. در حوزه سلامت نیز امکاناتی مانند ثبت نوار قلب، پایش ضربان قلب، بررسی خواب، سنجش دمای مچ دست و اعلان‌های مرتبط با برخی وضعیت‌های سلامتی، مجموعه‌ای متنوع از داده‌های مربوط به بدن را در اختیار کاربر قرار می‌دهند.
باتری با شارژدهی حداکثر ۲۴ ساعت در استفاده معمولی و پشتیبانی از شارژ سریع، بخش دیگری از امکانات کاربردی این ساعت است. امکان دریافت چندین ساعت استفاده با چند دقیقه شارژ، به‌خصوص برای کاربرانی که از قابلیت‌های پایش خواب استفاده می‌کنند، اهمیت زیادی دارد. در مجموع، اپل واچ سری ۱۲ ساعتی است که قابلیت‌های نمایش اعلان، پایش فعالیت‌های ورزشی، بررسی داده‌های سلامتی و امکانات ایمنی را در کنار یکدیگر قرار می‌دهد. تنوع مدل‌ها، نمایشگر پیشرفته، حسگرهای متعدد و امکانات نرم‌افزاری گسترده، ساختار کلی این محصول را شکل می‌دهند و آن را به گزینه‌ای چندمنظوره برای استفاده روزمره، ورزشی و پایش اطلاعات سلامت تبدیل می‌کنند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-watch-series-11-46mm', 'apple-watch-series-11-46mm', 'ساعت هوشمند 46 میلی متری اپل مدل Series 11 Aluminum Case با بند سیلیکونی', 'Apple Watch Series 11 46mm Aluminum Case with Silicone Band', 'Apple', 'smartwatches', 83799000, 90494500, 7, true, 10, true, 'گارانتی 18 ماهه -شرکتی', '4.5', 242, '{"display":"۱.۸۱ اینچ LTPO3 OLED","displayDetails":"۴۹۶×۴۱۶ · روشنایی ۲۰۰۰ نیت · Ion-X","chipset":"Apple S10 64-bit","chipsetDetails":"حافظه داخلی ۶۴ گیگابایت · بلوتوث ۵.۳","camera":"شمارنده ضربان قلب، دما، ECG و SpO2","cameraDetails":"GPS / GALILEO / BDS / QZSS","battery":"تا ۲۴ ساعت (کم‌مصرف ۳۸ ساعت)","batteryDetails":"فست شارژ ۰ تا ۸۰٪ در ۳۰ دقیقه","storageDefault":"۶۴ گیگابایت","ram":"۴۶ میلی‌متر","os":"watchOS"}', '[{"label":"۴۶ میلی‌متر","subtitle":"حافظه ۶۴ گیگابایت · بند سیلیکونی","priceDelta":0}]', '[{"id":"gray-1","hex":"#9E9E9E","name":"خاکستری"},{"id":"black-2","hex":"#000000","name":"مشکی"},{"id":"silver-3","hex":"#dedede","name":"نقره ای"},{"id":"color-50-4","hex":"#ff9e80","name":"رز گلد"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/1cb72b186a7f24502e1bd066af4e2382a8caf099_1764429370.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'خاکستری', '۷٪ تخفیف', 90, false, true, 28, 28, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/1cb72b186a7f24502e1bd066af4e2382a8caf099_1764429370.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d1e5b3f2d7efb25b1065e3b633a9d885ce5bb89e_1757856988.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/cdbccc24115b87ee04d3f78bae153f1b219ef9a2_1757856989.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8eec1300d55016f63be3a13d9aacc3584cb0def9_1757856989.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3fdab4ade2aeb6c94e17d56dfb493bdf8280394d_1757856989.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8b746c07b0a97f457032399e8929b1ead47b45a2_1757856990.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/755fee6a2daf53f53aef89e7e7b3fea7097975b7_1757856990.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d45b8e15348cf31fb2dd993df1bbb938d1a45e76_1757856991.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20435723"},{"label":"جنس بدنه و شیشه","value":"آلومینیوم بازیافتی · شیشه Ion-X مقاوم"},{"label":"ابعاد و وزن","value":"۴۶×۳۹×۹.۷ میلی‌متر · ۳۷.۸ گرم"}]', '2026-11-24 19:25:00+00', 'Apple Watch Series 11 46mm', 'اپل واچ سری ۱۱ آلومینیومی جدیدترین نسل از ساعت‌های هوشمند اپل است که با تمرکز بر تکامل هوشمندانه، تجربه‌ای کامل‌تر، دقیق‌تر و پایدارتر را برای کاربران آیفون فراهم می‌کند. این مدل با حفظ زبان طراحی مینیمال اپل، در دو اندازه ۴۲ و ۴۶ میلی‌متری عرضه شده و به لطف حاشیه‌های باریک‌تر، فضای نمایشی بزرگ‌تری را بدون افزایش محسوس ابعاد در اختیار کاربر قرار می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'smartwatches', 'تکامل در مرز کمال
وقتی صحبت از ساعت‌های هوشمند به میان می‌آید، اپل سال‌هاست که استاندارد طلایی این صنعت را تعریف می‌کند. با معرفی Apple Watch Series 11، کوپرتینیویی‌ها بار دیگر نشان دادند که هدفشان لزوماً «اختراع دوباره چرخ» نیست، بلکه صیقل دادن آن تا رسیدن به بی‌نقص‌ترین حالت ممکن است. اگر از کاربران قدیمی اپل واچ هستید یا قصد دارید برای اولین بار وارد این اکوسیستم شوید، سری ۱۱ در نسخه آلومینیومی، ترکیبی از زیبایی، دوام و هوشمندی را ارائه می‌دهد که نادیده گرفتن آن دشوار است. در این بررسی، تمامی زوایای این محصول را از طراحی تا عملکرد باتری و قابلیت‌های جدید سلامت موشکافی خواهیم کرد.
در نگاه اول شاید سری ۱۱ شباهت زیادی به نسل قبلی خود داشته باشد، اما جادوی اپل همیشه در جزئیات پنهان است. اپل در این نسل تمرکز خود را بر سه رکن اصلی گذاشته است: سلامت با محوریت فشار خون، پایداری انرژی با وعده باتری ۲۴ ساعته واقعی و قدرت پردازشی با تراشه جدید S11. این ساعت دیگر فقط یک ابزار برای نمایش اعلان‌ها نیست؛ بلکه یک همراه پزشکی و یک دستیار هوشمند است که با بلوغ کامل نرم‌افزاری و سخت‌افزاری به مچ دست شما بسته می‌شود. اما آیا این تغییرات برای ارتقا از نسل قبل کافی است؟

طراحی و کیفیت ساخت
اپل واچ سری ۱۱ آلومینیومی، زبان طراحی نسل دهم را حفظ کرده اما آن را با متریال و مهندسی دقیق‌تری همراه کرده است. این ساعت همچنان در دو سایز ۴۲ میلی‌متری و ۴۶ میلی‌متری عرضه می‌شود که نسبت به مدل‌های قدیمی‌تر (سری ۹ و قبل‌تر)، فضای نمایش بیشتری را بدون افزایش آزاردهنده ابعاد فیزیکی فراهم می‌کند.
نسخه آلومینیومی که محبوب‌ترین مدل این سری است، با پوششی مات و بافتی بسیار زیبا عرضه شده است. اپل در این نسل از آلیاژ آلومینیوم بازیافتی با خلوص بالا استفاده کرده که علاوه بر سبکی، حس پریمیوم بودن را کاملاً منتقل می‌کند. وزن ساعت به قدری متناسب توزیع شده که در استفاده طولانی‌مدت، حتی هنگام خواب برای ردیابی سلامت، عملاً حضور آن را روی مچ دست فراموش می‌کنید.
یکی از بزرگ‌ترین نگرانی‌های کاربران نسخه آلومینیومی، خط و خش روی شیشه Ion-X بود. در سری ۱۱، اپل از یک پوشش سرامیکی نانو روی شیشه Ion-X استفاده کرده که طبق ادعاها، مقاومت در برابر خط و خش را تا دو برابر نسبت به نسل‌های قبل افزایش داده است. در تست‌های روزمره، برخورد تصادفی ساعت با چهارچوب در یا میز کار، اثری روی نمایشگر باقی نمی‌گذارد. هرچند همچنان به سرسختی نسخه یاقوت در مدل‌های تیتانیومی نیست، اما پیشرفت قابل توجهی محسوب می‌شود.

صفحه نمایش
نمایشگر همیشه یکی از نقاط قوت اپل واچ بوده و در سری ۱۱، این برتری با استفاده از پنل Wide-angle OLED تثبیت شده است. حاشیه‌های نمایشگر به حداقلِ ممکن رسیده‌اند و محتوا به شکلی مناسب روی لبه‌های ساعت دیده می‌شود.
با رسیدن حداکثر روشنایی به ۲۰۰۰ نیت (و در برخی شرایط نوری خاص حتی فراتر)، خوانایی صفحه زیر نور مستقیم خورشید بی‌نظیر است. دیگر نیازی نیست برای خواندن پیام‌ها یا دیدن آمار ورزشی در زیر نور مستقیم خورشید، با دست روی ساعت سایه ایجاد کنید. از طرف دیگر، نرخ نوسازی متغیر (LTPO3) اجازه می‌دهد تا در حالت Always-on Display، نرخ نوسازی به ۱ هرتز کاهش یابد و حتی روشنایی تا ۱ نیت پایین بیاید تا در محیط‌های تاریک مثل سینما یا اتاق خواب، نور ساعت آزاردهنده نباشد.
فناوری "زاویه دید عریض" که در این نمایشگر به کار رفته، باعث می‌شود حتی زمانی که مچ دستتان کاملاً بالا نیامده و از گوشه به ساعت نگاه می‌کنید، اعداد و متون با وضوح و کنتراست کامل دیده شوند. این ویژگی به‌خصوص هنگام تایپ کردن روی کیبورد یا در جلسات کاری که نمی‌خواهید دستتان را کاملاً بالا بیاورید، بسیار کاربردی است.

سلامت و تندرستی
بخش سلامت جایی است که سری ۱۱ کارت برنده خود را رو می‌کند. اپل همواره در حال تبدیل کردن این گجت به یک ابزار پزشکی بوده و امسال یک قدم بزرگ برداشته است.
مهم‌ترین ویژگی جدید، سیستم «تشخیص الگوهای فشار خون» یا Hypertension Notifications است. باید توجه داشت که این ساعت (برخلاف دستگاه‌های فشارسنج بادی) عدد دقیق را در لحظه به شما نمی‌دهد. در عوض، با استفاده از سنسورهای اپتیکال پیشرفته و الگوریتم‌های یادگیری ماشین، نحوه رفتار عروق خونی شما را نسبت به ضربان قلب تحلیل می‌کند. اگر ساعت تشخیص دهد که الگوی فشار خون شما در طول ۳۰ روز گذشته روندی صعودی یا غیرطبیعی داشته است، اعلانی برای شما ارسال می‌کند و پیشنهاد می‌دهد به پزشک مراجعه کنید. این ویژگی برای شناسایی فشار خون بالا که اغلب بدون علامت است، حیاتی به نظر می‌رسد. این یک رویکرد پیشگیرانه است که می‌تواند جان هزاران نفر را نجات دهد.
توجه: تشخیص فشار خون ممکن است در کشور ایران در دسترس نباشد.
در کنار قابلیت تشخیص آپنه خواب (Sleep Apnea) که پیش‌تر معرفی شده بود، اکنون ویژگی «امتیاز خواب» به شما دیدگاهی جامع از کیفیت استراحتتان می‌دهد. این امتیاز ترکیبی از مدت زمان خواب، تغییرات ضربان قلب، سطح اکسیژن خون و مراحل خواب (REM, Deep, Core) است. این ویژگی به کاربر کمک می‌کند تا تأثیر استرس روزانه یا فعالیت ورزشی را بر کیفیت خواب شبانه خود به صورت کمی درک کند.

عملکرد و سخت‌افزار
قلب تپنده این ساعت، تراشه S10 SiP است. اگرچه اپل هر سال ادعای سریع‌تر شدن دارد، اما در سری ۱۱ تمرکز اصلی این تراشه بر بهینگی مصرف انرژی و پردازش‌های هوش مصنوعی روی دستگاه (On-device AI) بوده است.

 جابجایی بین منوها، باز کردن برنامه‌ها و استفاده از Smart Stack (ویجت‌های هوشمند) بدون کوچک‌ترین لگ یا تأخیری انجام می‌شود. انیمیشن‌ها با نرخ ۶۰ فریم بر ثانیه اجرا می‌شوند و حس سیال بودن رابط کاربری فوق‌العاده است.

به لطف موتور عصبی (Neural Engine) قدرتمندتر در S10، پردازش درخواست‌های سیری سریع‌تر شده و بسیاری از فرمان‌ها بدون نیاز به اینترنت انجام می‌شوند. دیکته کردن متن پیام‌ها به زبان‌های مختلف نیز با دقت شگفت‌انگیزی صورت می‌گیرد.
قابلیت Double Tap (دو بار زدن انگشت اشاره و شست به هم) اکنون با دقت بیشتری کار می‌کند و در اپلیکیشن‌های شخص ثالث نیز کاربرد بیشتری پیدا کرده است. این ویژگی زمانی که دست دیگرتان بند است (مثلاً حمل خرید یا نگهداری از کودک)، بسیار کارآمد است.

باتری و شارژ
پاشنه آشیل همیشگی اپل واچ، عمر باتری آن بوده است. اما در سری ۱۱، اپل بالاخره ادعای رسمی خود را از ۱۸ ساعت به ۲۴ ساعت افزایش داده است.

در تست‌های واقعی، عملکرد باتری حتی فراتر از این عدد است. با استفاده معمولی شامل دریافت اعلان‌ها، ۹۰ دقیقه پایش ورزش با GPS، پایش خواب شبانه و روشن بودن Always-on Display، شما می‌توانید به راحتی تا اواسط روز دوم از ساعت استفاده کنید. این یعنی دیگر اضطراب تمام شدن شارژ قبل از خواب را نخواهید داشت.
سرعت شارژ نیز بهبود یافته است. با شارژر مغناطیسی سریع USB-C داخل جعبه، می‌توانید ساعت را در مدت ۳۰ دقیقه از صفر به ۸۰ درصد برسانید. این سرعت بالا برای کسانی که می‌خواهند ساعت را فقط هنگام دوش گرفتن یا صبحانه خوردن شارژ کنند و در طول شبانه‌روز آن را به دست داشته باشند، ایده‌آل است.

نرم‌افزار و قابلیت‌های ارتباطی
سری ۱۱ با سیستم عامل watchOS ۲۶ عرضه می‌شود که تکامل‌یافته‌ترین سیستم عامل پوشیدنی دنیاست. ویجت‌های هوشمند (Smart Stack) اکنون به صورت پویا و بر اساس موقعیت مکانی و زمانی تغییر می‌کنند. برای مثال، وقتی وارد فرودگاه می‌شوید، بلیط پرواز شما در صدر ویجت‌ها قرار می‌گیرد.

جمع‌بندی
Apple Watch Series 11 Aluminum یک شاهکار مهندسی است که بر پایه یک فرمول موفق بنا شده است. این محصول انقلابی نیست، بلکه تکاملی هوشمندانه است که دقیقاً نقاط ضعف نسل‌های قبل (باتری و مقاومت بدنه) را هدف قرار داده و قابلیت‌های سلامتی را به سطحی جدید ارتقا داده 

در نهایت، اپل واچ سری ۱۱ آلومینیومی، بهترین ساعت هوشمند برای کاربران آیفون است که تعادل بی‌نظیری میان قیمت، کارایی و زیبایی برقرار کرده است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-watch-s3-global', 'xiaomi-watch-s3-global', 'ساعت هوشمند شیائومی مدل Watch S3 بند سیلیکونی - گلوبال', 'Xiaomi Watch S3 Silicone Band Smart Watch - Global', 'Xiaomi', 'smartwatches', 27063000, 29561500, 8, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.5', 231, '{"display":"۱.۴۳ اینچ AMOLED دایره‌ای","displayDetails":"رزولوشن ۴۶۶×۴۶۶ · ۳۲۶ PPI","chipset":"پردازنده کم‌مصرف HyperOS","chipsetDetails":"میکروفون و اسپیکر داخلی مکالمه","camera":"سنسور ضربان قلب و پایش خواب","cameraDetails":"مقاومت آب 5ATM","battery":"۴۸۶ میلی‌آمپر ساعت","batteryDetails":"شارژدهی فوق‌العاده تا ۱۵ روز","storageDefault":"۴۷ میلی‌متر","ram":"بند سیلیکونی","os":"Android 8+ و iOS 12+"}', '[{"label":"۴۷ میلی‌متر","subtitle":"نسخه گلوبال · بند سیلیکونی","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/7e8966b1ad01ef139eaaf7c42229539425f3594b_1754253701.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۸٪ تخفیف · باتری ۱۵ روزه', 89, false, true, 29, 29, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/7e8966b1ad01ef139eaaf7c42229539425f3594b_1754253701.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/09067007d608e346282287bc2f3cd6c876dcc4d9_1786906435.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b794d9974c1bc1f85dcb2619bf82cf1290a9348a_1779629127.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/364941f1f9b1f2246664f4909974378025486519_1712477371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7b4f094a6e4dfc79d5ae158c4838b27c221f7a7f_1712477371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/0faa04af0acdbfc85555bb64fe8615d047ad0762_1712477371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2ab7757e20be5dc087f35ccafb76880d7026c0b6_1712477371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/caff4595955c9cdfe60c6e9fa93fbfd4d938a992_1712477371.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-15031140"},{"label":"ابعاد و وزن","value":"۴۷×۴۷×۱۲ میلی‌متر · ۴۴ گرم"},{"label":"جنس بدنه","value":"آلومینیوم با حاشیه قابل تعویض"}]', '2026-11-24 19:25:00+00', 'Xiaomi Watch S3 Global', 'ساعت هوشمند شیائومی مدل Watch S3 نسخه گلوبال با نمایشگر ۱.۴۳ اینچی AMOLED، بدنه آلومینیومی و قابلیت مکالمه بلوتوثی گزینه‌ای شیک برای استفاده روزمره و ورزشی است. باتری ۴۸۶ میلی‌آمپرساعتی این ساعت تا ۱۵ روز شارژدهی مداوم و استاندارد ضدآب 5ATM را ارائه می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'smartwatches', 'ساعت هوشمند Xiaomi Watch S3 در نسخه گلوبال با قاب ۴۷ میلی‌متری آلومینیومی و نمایشگر گرد ۱.۴۳ اینچی AMOLED با رزولوشن ۴۶۶×۴۶۶ پیکسل، وضوح تصویر بسیار بالایی برای نمایش واچ‌فیس‌ها و اعلان‌ها ارائه می‌دهد.

مجهز بودن به میکروفون و اسپیکر داخلی امکان مکالمه مستقیم از طریق بلوتوث را فراهم کرده و سازگاری هم‌زمان با گوشی‌های اندروید و آیفون، انعطاف بالایی در اختیار کاربر می‌گذارد. باتری ۴۸۶ میلی‌آمپرساعتی با دوام تا ۱۵ روز و گواهی مقاومت در برابر نفوذ آب تا ۵ اتمسفر (5ATM)، این مدل را برای شنا، ورزش و استفاده روزانه بدون نگرانی از شارژ مکرر ایده‌آل می‌کند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-watch-6-46mm', 'xiaomi-redmi-watch-6-46mm', 'ساعت هوشمند 46 میلی متری شیائومی مدل Redmi Watch 6 با بند پلاستیکی', 'Xiaomi Redmi Watch 6 46mm Smart Watch', 'Xiaomi', 'smartwatches', 21243000, NULL, 0, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.4', 105, '{"display":"۲.۰۷ اینچ AMOLED مستطیلی","displayDetails":"۶۰Hz · ۴۳۲×۵۱۴ · روشنایی ۲۰۰۰ نیت","chipset":"تراشه بهینه · بلوتوث ۵.۴","chipsetDetails":"حافظه ۵۱۲ مگابایت · میکروفون داخلی","camera":"ضربان قلب، اکسیژن خون SpO2 و GPS","cameraDetails":"GLONASS / GALILEO / BDS / QZSS","battery":"۵۵۰ میلی‌آمپر ساعت","batteryDetails":"تا ۲۴ روز استفاده سبک · ۱۲ روز عادی","storageDefault":"۴۶ میلی‌متر","ram":"۵۱۲ مگابایت","os":"Android 8+ و iOS 14+"}', '[{"label":"۴۶ میلی‌متر","subtitle":"بدنه آلومینیومی · بند TPU","priceDelta":0}]', '[{"id":"silver-1","hex":"#dedede","name":"نقره ای"},{"id":"black-2","hex":"#000000","name":"مشکی"},{"id":"white-3","hex":"#FFFFFF","name":"سفید"},{"id":"color-43-4","hex":"#aee9fc","name":"آبی روشن"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/717a5149545264d25cde0b834ad512c0a182e9d2_1794755553.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'نقره ای', 'نمایشگر ۲۰۰۰ نیت', 87, false, true, 30, 30, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/717a5149545264d25cde0b834ad512c0a182e9d2_1794755553.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4f56f812def82a124b28f4735be84ae967840cb9_1779647615.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/99fd6fece7ee010b9e07a0e459a4db8b644f0fc4_1779647627.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/fbdf6145b7763dace37b98d13d128404cc6b2507_1779647633.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/374ecf49cc256a7c48320b82c48c0059c515006e_1779647638.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a2f322384ab1b4ce9c3176cca3ca06a0f5c0a43f_1779647642.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f862f94f839d21b7539c8298e4fe4c7ee94e04c9_1779647652.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c5425cc45ce8e8b540c359b27140979d723b0a7c_1779647656.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-21878692"},{"label":"ابعاد و وزن","value":"۴۶.۴۵×۴۰.۰۳×۹.۹۴ میلی‌متر · ۳۱ گرم"},{"label":"مقاومت آب","value":"5ATM (مقاوم تا عمق ۵۰ متر)"}]', '2026-11-24 19:25:00+00', 'Redmi Watch 6 46mm', 'ساعت هوشمند ۴۶ میلی‌متری Redmi Watch 6 شیائومی با صفحه‌نمایش بزرگ ۲.۰۷ اینچی AMOLED، روشنایی ۲۰۰۰ نیت و نرخ نوسازی ۶۰ هرتز، خوانایی کم‌نظیری زیر نور آفتاب دارد. باتری ۵۵۰ میلی‌آمپرساعتی این ساعت تا ۲۴ روز دوام می‌آورد و از مکالمه بلوتوثی و GPS چندگانه پشتیبانی می‌کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'smartwatches', 'شیائومی Redmi Watch 6 با بدنه آلومینیومی سبک ۳۱ گرمی و ضخامت ۹.۹۴ میلی‌متری، نمایشگری بزرگ ۲.۰۷ اینچی از نوع AMOLED با وضوح ۴۳۲×۵۱۴ پیکسل و روشنایی خارق‌العاده ۲۰۰۰ نیت ارائه می‌دهد که در رده قیمتی خود کم‌رقیب است.

پشتیبانی از ۴ سامانه موقعیت‌یابی ماهواره‌ای (GLONASS، GALILEO، Beidou و QZSS)، پایش مداوم ضربان قلب و اکسیژن خون، بلوتوث ۵.۴ برای مکالمه شفاف و باتری پرظرفیت ۵۵۰ میلی‌آمپرساعتی با حداکثر ۲۴ روز شارژدهی و استاندارد 5ATM، آن را به همراهی مطمئن برای تمرینات ورزشی و استفاده روزمره تبدیل کرده است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-watch-5-active', 'xiaomi-redmi-watch-5-active', 'ساعت هوشمند شیائومی مدل Redmi Watch 5 Active - Global دارای قابلیت های قابلیت مکالمه از طریق بلوتوث، قابلیت تغییر طرح ساعت یا تم بند پلاستیک', 'Xiaomi Redmi Watch 5 Active Smart Watch - Global', 'Xiaomi', 'smartwatches', 7417000, 7975200, 7, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.4', 5105, '{"display":"۲ اینچ LCD مستطیلی","displayDetails":"نمایش اعلان‌های فارسی و انگلیسی","chipset":"Xiaomi HyperOS","chipsetDetails":"میکروفون و اسپیکر مکالمه بلوتوثی","camera":"پایش ضربان قلب و فعالیت‌های ورزشی","cameraDetails":"مقاومت در برابر نفوذ آب 5ATM","battery":"۴۷۰ میلی‌آمپر ساعت","batteryDetails":"تا ۱۸ روز شارژدهی مداوم","storageDefault":"۴۹ میلی‌متر","ram":"بند TPU","os":"Android 8+ و iOS 12+"}', '[{"label":"۴۹ میلی‌متر","subtitle":"نسخه گلوبال · مکالمه بلوتوثی","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"},{"id":"gloss-black-2","hex":"#090000","name":"مشکی براق"},{"id":"silver-3","hex":"#dedede","name":"نقره ای"},{"id":"white-4","hex":"#FFFFFF","name":"سفید"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/9cb8e1239979d4d3766c3519fff4b5f3a0643d6d_1747411376.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۷٪ تخفیف · خوش‌قیمت', 88, true, true, 31, 31, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/9cb8e1239979d4d3766c3519fff4b5f3a0643d6d_1747411376.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/446b864048e5dbab07262e6df982de57fdb03aa0_1748873324.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/70035fe8d09092f46f0473ed211615be33afacb7_1748873197.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/afdee0fd0bbe45598cec92a6d4c85bd37f1ba708_1748873069.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/41bd54d8cca75705792a1990de21487131b94434_1748873006.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4518b1774b530bf5c59f907ca9166bd4af2355d8_1740932787.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f3440b251b5519866d327eb449d216ac988a2bd4_1727604395.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e12e52524760d85379a5ac469071766e3d18bf8d_1727604394.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-16835001"},{"label":"ابعاد و وزن","value":"۴۹.۱×۴۰.۴×۱۱.۴ میلی‌متر · ۴۲.۲ گرم"},{"label":"زبان اعلان","value":"پشتیبانی رسمی از زبان فارسی و انگلیسی"}]', '2026-11-24 19:25:00+00', 'Redmi Watch 5 Active Global', 'ساعت هوشمند شیائومی مدل Redmi Watch 5 Active - Global انتخابی حرفه‌ای، کاربردی و در عین حال جذاب برای آقایان و بانوان است که به دنبال ترکیبی از زیبایی، عملکرد و امکانات متنوع در یک ساعت هوشمند هستند. این مدل با طراحی مستطیلی و صفحه‌ نمایش ۲ اینچی LCD، ظاهری مدرن دارد. این محصول شیائومی در عین سادگی، جلوه‌ای شیک برای استفاده روزمره، رسمی و ورزشی به همراه دارد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'smartwatches', 'ساعت هوشمند شیائومی مدل Redmi Watch 5 Active
ساعت هوشمند شیائومی مدل Redmi Watch 5 Active یکی از جدیدترین محصولات اقتصادی و در عین حال قدرتمند برند محبوب شیائومی است که با طراحی زیبا، امکانات متنوع و عملکرد روان، توانسته توجه بسیاری از کاربران را به خود جلب کند. در ادامه، به بررسی دقیق‌تر مشخصات، امکانات و نقاط قوت این ساعت هوشمند می‌پردازیم.

کیفیت باتری و مقاومت در آب
باتری قدرتمند با ظرفیت ۴۷۰ میلی‌آمپر ساعت یکی از مزیت‌های اصلی Redmi Watch 5 Active هوشمند است. طبق اعلام شیائومی، این ساعت در استفاده معمولی تا ۱۸ روز و در استفاده سنگین تا ۱۲ روز شارژدهی دارد که رقم بسیار مناسبی برای ساعتی با این امکانات به شمار می‌رود. شارژر مغناطیسی هم استفاده از آن را بسیار راحت کرده است.

ساعت دارای گواهی ضد آب IPX8 است که به کاربر این امکان را می‌دهد تا در شرایطی مانند شست‌وشوی دست، ورزش در فضای باز و یا حتی زیر باران، بدون نگرانی از آن استفاده کند.

سخن پایانی
اگر به دنبال یک ساعت هوشمند با طراحی زیبا، امکانات ارتباطی کامل، قابلیت مکالمه، پایش سلامت و عمر باتری فوق‌العاده هستید، Redmi Watch 5 Active گزینه‌ای ایده‌آل و مقرون ‌به ‌صرفه برای شماست. این ساعت ترکیبی از ظاهر جذاب، عملکرد روان و ویژگی‌های کاربردی را در اختیار شما می‌گذارد و می‌تواند همراه همیشگی شما در فعالیت‌های روزمره، ورزشی و کاری باشد.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-watch-9-40mm', 'samsung-galaxy-watch-9-40mm', 'ساعت هوشمند 40 میلی‌متری سامسونگ مدل Galaxy Watch 9 با بند سیلیکونی، سازگار با گوشی‌های هوشمند سامسونگ', 'Samsung Galaxy Watch 9 40mm Silicone Band Smart Watch', 'Samsung', 'smartwatches', 71500000, NULL, 0, true, 1, true, 'گارانتی 18 ماهه دیجی سرویس', '4.0', 2, '{"display":"نمایشگر دایره‌ای Super AMOLED","displayDetails":"۴۰ میلی‌متر · بدنه باریک ۸.۶ میلی‌متر","chipset":"پردازنده نسل جدید Exynos","chipsetDetails":"مکالمه بلوتوثی و کنترل موسیقی","camera":"GPS چهارگانه و سنسورهای سلامت","cameraDetails":"GPS / GLONASS / GALILEO / BDS","battery":"شارژ مغناطیسی سریع","batteryDetails":"وزن سبک ۳۲ گرم","storageDefault":"۴۰ میلی‌متر","ram":"۲ گیگابایت","os":"WearOS (مخصوص سامسونگ)"}', '[{"label":"۴۰ میلی‌متر","subtitle":"بند سیلیکونی · سنسور سلامت پیشرفته","priceDelta":0}]', '[{"id":"cream-1","hex":"#F5E8D8","name":"کرم"},{"id":"black-2","hex":"#000000","name":"مشکی"},{"id":"silver-3","hex":"#dedede","name":"نقره ای"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/9a61b3bfbe199a49dabfc6458cde3fecbd355ebb_1794828795.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'کرم', 'مدل ۲۰۲۵/۲۰۲۶ سامسونگ', 85, false, true, 32, 32, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/9a61b3bfbe199a49dabfc6458cde3fecbd355ebb_1794828795.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b46b35664f4afc2942237468a149c4bf74ea1f3d_1785149793.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4c686cb17a9ea2f01e4f68256fd1cd5052b42517_1785149793.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c8839e35c2cb8186b032399fd43a3e150a52aa39_1789891911.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b0cba7934077c448a08fde5d5bdc44f9efd713f8_1785149794.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/918ea034a2500944aac4e4f93b5ba9a6305e9006_1785149794.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a6599ce7c5d8a37cb201724af7f96de7a10ba400_1785149794.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ebd04a8f5ab8bde76d75e5ab2f4858fc924fc51e_1785149794.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22363717"},{"label":"ابعاد و وزن","value":"۴۲.۷×۴۰.۴×۸.۶ میلی‌متر · ۳۲ گرم"},{"label":"سازگاری","value":"سازگار با گوشی‌های هوشمند سامسونگ"}]', '2026-11-24 19:25:00+00', 'Galaxy Watch 9 40mm', 'Galaxy Watch 9 سامسونگ برای کسانی ساخته شده که از یک ساعت هوشمند، هم همراه روزمره می‌خواهند و هم تصویری مرتب و جمع‌وجور روی مچ. قاب 40 میلی‌متری با بدنه آلومینیومی و شیشه یاقوتی، کنار بند سیلیکونی قابل‌تعویض، حس یک ساعت سبک و راحت را می‌دهد که با استایل روزانه به‌خوبی هماهنگ می‌شود.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'smartwatches', 'مقدمه
سامسونگ با معرفی Galaxy Watch 9 در نسخه 40 میلی‌متری، نسل جدید ساعت‌های هوشمند خود را با تمرکز بر طراحی سبک، سخت‌افزار قدرتمند و قابلیت‌های پیشرفته سلامتی روانه بازار کرده است. این ساعت با ابعاد جمع‌وجور، نمایشگر باکیفیت Super AMOLED، تراشه جدید Snapdragon SW6100 Wear Elite و مجموعه‌ای کامل از حسگرهای سلامتی، تلاش می‌کند تجربه‌ای سریع، دقیق و کاربردی را در اختیار کاربران قرار دهد. ترکیب بدنه مقاوم، امکانات ارتباطی کامل و سیستم‌عامل جدید Wear OS 7 در کنار One UI Watch 9 باعث شده Galaxy Watch 9 تنها یک ابزار برای نمایش اعلان‌ها نباشد، بلکه نقش یک همراه هوشمند را در فعالیت‌های روزمره، ورزشی و سلامت ایفا کند

طراحی، کیفیت ساخت و ارگونومی
نسخه 40 میلی‌متری Galaxy Watch 9 با ابعاد 42.7 &times; 40.4 &times; 8.6 میلی‌متر و وزن تنها 32 گرم، یکی از سبک‌ترین ساعت‌های هوشمند سامسونگ به حساب می‌آید. این وزن کم باعث می‌شود هنگام استفاده طولانی‌مدت، حتی در طول خواب یا تمرینات ورزشی، فشار چندانی روی مچ دست احساس نشود. طراحی جمع‌وجور این مدل برای افرادی که مچ ظریف‌تری دارند یا ساعت‌های کوچک‌تر را ترجیح می‌دهند، انتخاب مناسبی است. سامسونگ در ساخت این ساعت از فریم Armor Aluminum 2 استفاده کرده که علاوه بر کاهش وزن، مقاومت مناسبی در برابر ضربه‌های روزمره ایجاد می‌کند. در بخش جلویی نیز شیشه یاقوت کبود یا Sapphire Crystal قرار گرفته که مقاومت بالایی در برابر خط و خش دارد و کمک می‌کند نمایشگر در استفاده مداوم ظاهر اولیه خود را حفظ کند. این ساعت موفق به دریافت استاندارد IP68 شده و تا عمق 50 متر آب (5ATM) در برابر نفوذ آب مقاومت دارد. همچنین استاندارد نظامی MIL-STD-810H نشان می‌دهد Galaxy Watch 9 برای شرایط مختلف محیطی طراحی شده است، هرچند این استاندارد به معنی مقاومت در تمامی شرایط سخت نیست. مجموعه این ویژگی‌ها باعث شده کیفیت ساخت دستگاه در سطح بالایی قرار بگیرد و خیال کاربر را در استفاده روزانه تا حد زیادی راحت کند.

نمایشگر
سامسونگ برای Galaxy Watch 9 از یک نمایشگر 1.34 اینچی Super AMOLED استفاده کرده که یکی از نقاط قوت اصلی این محصول محسوب می‌شود. این پنل با رزولوشن 438 &times; 438 پیکسل و تراکم حدود 327 پیکسل در هر اینچ، تصاویر و نوشته‌ها را با وضوح بالا نمایش می‌دهد و مطالعه اعلان‌ها یا مشاهده اطلاعات سلامتی را ساده‌تر می‌کند. حداکثر روشنایی 3000 نیت یکی از مهم‌ترین ویژگی‌های این نمایشگر است. چنین میزان روشنایی باعث می‌شود محتوای صفحه حتی زیر نور مستقیم خورشید نیز خوانایی بسیار خوبی داشته باشد و کاربر بدون نیاز به تغییر زاویه ساعت بتواند اطلاعات را مشاهده کند. پوشش Sapphire Crystal علاوه بر محافظت از نمایشگر، شفافیت تصویر را نیز حفظ می‌کند. رنگ‌های زنده، کنتراست بالا و نمایش عمیق رنگ مشکی از ویژگی‌های ذاتی پنل Super AMOLED هستند و تجربه بصری جذابی هنگام استفاده از رابط کاربری یا مشاهده اطلاعات مختلف ایجاد می‌کنند

سخت‌افزار و عملکرد
در قلب Galaxy Watch 9 تراشه Snapdragon SW6100 Wear Elite قرار گرفته که با فناوری ساخت 3 نانومتری تولید شده است. استفاده از این لیتوگرافی پیشرفته علاوه بر افزایش قدرت پردازشی، به بهبود بهره‌وری انرژی نیز کمک می‌کند و عملکرد روان‌تری را در اجرای قابلیت‌های مختلف ساعت به همراه دارد. پردازنده پنج هسته‌ای این ساعت شامل یک هسته 2.1 گیگاهرتزی و چهار هسته 1.95 گیگاهرتزی است. این ترکیب باعث می‌شود ساعت در اجرای برنامه‌ها، جابه‌جایی میان منوها و پردازش داده‌های حسگرها عملکرد سریع و پایداری داشته باشد. سامسونگ 2 گیگابایت رم و 32 گیگابایت حافظه داخلی برای این مدل در نظر گرفته است. این میزان حافظه فضای مناسبی برای نصب برنامه‌های مختلف، ذخیره اطلاعات و استفاده از امکانات ساعت فراهم می‌کند و در کنار پردازنده جدید، تجربه‌ای روان و بدون کندی را ارائه می‌دهد. بلندگوی داخلی نیز امکان پخش صدا را فراهم کرده و باعث می‌شود برخی قابلیت‌های ساعت بدون نیاز به تجهیزات جانبی در دسترس باشند

Galaxy Watch 9 با Android Wear OS 7 و رابط کاربری اختصاصی One UI Watch 9 عرضه می‌شود. این ترکیب، محیطی مدرن و هماهنگ را در اختیار کاربر قرار می‌دهد و امکان مدیریت ساده بخش‌های مختلف ساعت را فراهم می‌کند.

رابط کاربری سامسونگ همواره به طراحی منظم و دسترسی آسان شناخته شده و در این نسل نیز تلاش شده اطلاعات سلامتی، اعلان‌ها و برنامه‌ها با کمترین تعداد لمس در دسترس باشند. هماهنگی مناسب میان سخت‌افزار و نرم‌افزار نیز باعث شده عملکرد کلی ساعت روان و سریع باقی بماند

قابلیت‌های سلامتی و ورزشی
سامسونگ مجموعه‌ای کامل از حسگرهای سلامتی را در Galaxy Watch 9 قرار داده است تا این ساعت بتواند نقش یک همراه دائمی برای پایش وضعیت جسمانی کاربر را ایفا کند. حسگر ضربان قلب امکان ثبت مداوم وضعیت قلب را فراهم می‌کند و در کنار قابلیت ثبت نوار قلب (ECG)، اطلاعات دقیق‌تری از عملکرد قلب ارائه می‌دهد. قابلیت اندازه‌گیری فشار خون نیز یکی دیگر از امکانات مهم این ساعت است که در کنار سایر داده‌های سلامتی، دید جامع‌تری از وضعیت جسمانی کاربر ایجاد می‌کند. حسگر اندازه‌گیری اکسیژن خون (SpO2)، سنجش دمای پوست، حسگر BioActive و قابلیت اندازه‌گیری شاخص آنتی‌اکسیدان از دیگر امکانات سلامت این مدل هستند. وجود چنین مجموعه‌ای باعث می‌شود کاربر بتواند تغییرات مختلف بدن خود را در بازه‌های زمانی متفاوت بررسی کند. علاوه بر این، حسگرهای شتاب‌سنج، ژیروسکوپ، فشارسنج، ارتفاع‌سنج و قطب‌نما نیز اطلاعات دقیقی از فعالیت‌های روزانه و ورزشی ثبت می‌کنند. این حسگرها هنگام پیاده‌روی، دویدن یا سایر فعالیت‌ها، داده‌های کاربردی و دقیقی در اختیار کاربر قرار می‌دهند

امکانات هوشمند و ارتباطی
Galaxy Watch 9 از مجموعه کاملی از فناوری‌های ارتباطی بهره می‌برد. پشتیبانی از Wi-Fi دو بانده باعث ایجاد ارتباط پایدار با شبکه‌های بی‌سیم می‌شود و بلوتوث 6.0 نیز ارتباط سریع و کم‌مصرف با سایر دستگاه‌های سازگار را فراهم می‌کند. سامسونگ از سیستم‌های موقعیت‌یاب GPS با باندهای L1 و L5 در کنار GLONASS، GALILEO و BDS استفاده کرده است. بهره‌گیری هم‌زمان از این سامانه‌ها باعث افزایش دقت موقعیت‌یابی در محیط‌های مختلف می‌شود و ثبت مسیرهای حرکتی را با دقت بیشتری انجام می‌دهد. وجود NFC نیز امکانات ارتباطی ساعت را کامل‌تر کرده و قابلیت‌های مبتنی بر این فناوری را در اختیار کاربران قرار می‌دهد.

باتری و شارژدهی
سامسونگ برای Galaxy Watch 9 از یک باتری لیتیوم یونی با ظرفیت 390 میلی‌آمپرساعت استفاده کرده است. این باتری در کنار تراشه 3 نانومتری و بهینه‌سازی‌های نرم‌افزاری، تعادل مناسبی میان عملکرد و مصرف انرژی ایجاد می‌کند. شارژ بی‌سیم 10 واتی نیز فرآیند شارژ ساعت را ساده‌تر کرده و بدون نیاز به اتصال مستقیم کابل، امکان شارژ دستگاه را فراهم می‌کند. این ویژگی استفاده روزمره را راحت‌تر کرده و تجربه کاربری بهتری ارائه می‌دهد

تجربه استفاده روزمره
در استفاده روزانه، Galaxy Watch 9 ترکیبی از طراحی سبک، نمایشگر بسیار روشن، عملکرد سریع و امکانات گسترده را ارائه می‌دهد. وزن پایین ساعت باعث می‌شود در طول روز حضور آن روی مچ دست آزاردهنده نباشد و ابعاد مناسب آن نیز استفاده در موقعیت‌های مختلف را آسان می‌کند. نمایشگر باکیفیت، پاسخ‌گویی سریع سیستم‌عامل، دقت بالای حسگرهای سلامتی و امکانات ارتباطی کامل باعث شده این ساعت در شرایط مختلف، از جلسات کاری گرفته تا فعالیت‌های ورزشی، عملکرد قابل اعتمادی داشته باشد. همچنین مقاومت مناسب بدنه و نمایشگر باعث می‌شود کاربر با اطمینان بیشتری از ساعت در محیط‌های گوناگون استفاده کند.

جمع‌بندی
Galaxy Watch 9 نسخه 40 میلی‌متری مجموعه‌ای متوازن از طراحی مدرن، کیفیت ساخت بالا، سخت‌افزار قدرتمند و امکانات پیشرفته سلامتی را در قالب یک ساعت سبک و جمع‌وجور ارائه می‌دهد. نمایشگر Super AMOLED با روشنایی 3000 نیت، تراشه Snapdragon SW6100 Wear Elite، حافظه مناسب، سیستم‌عامل Wear OS 7، مجموعه کامل حسگرهای پایش سلامت، مقاومت بالا در برابر آب و گردوغبار و امکانات ارتباطی کامل، این ساعت را به محصولی توانمند برای استفاده روزمره، فعالیت‌های ورزشی و پایش وضعیت سلامت تبدیل کرده است. در مجموع، Galaxy Watch 9 نشان می‌دهد سامسونگ با حفظ طراحی ظریف و سبک، تلاش کرده تجربه‌ای سریع، دقیق و کاربردی را در اختیار کاربران قرار دهد.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-watch-ultra', 'samsung-galaxy-watch-ultra', 'ساعت هوشمند سامسونگ مدل Galaxy Watch Ultra دارای قابلیت های کنترل موسیقی (Music Player)، قابلیت مکالمه از طریق بلوتوث، قابلیت تغییر طرح ساعت یا تم، صفحه همیشه روشن (Always-on Display)، پشتیبانی از دستیار صوتی بند سیلیکون', 'Samsung Galaxy Watch Ultra 47mm Titanium Smart Watch', 'Samsung', 'smartwatches', 74236600, NULL, 0, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.5', 336, '{"display":"۱.۵ اینچ Super AMOLED","displayDetails":"شیشه یاقوت کبود · روشنایی بالا","chipset":"Exynos W1000 (۳ نانومتری)","chipsetDetails":"حافظه ۳۲ گیگابایت · ۲ گیگ رم","camera":"GPS دوفرکانسه + فشار خون و ECG","cameraDetails":"ارتفاع‌سنج، فشارسنج و قطب‌نما","battery":"۵۹۰ میلی‌آمپر ساعت","batteryDetails":"ضدآب 10ATM و استاندارد نظامی","storageDefault":"۳۲ گیگابایت","ram":"۲ گیگابایت","os":"WearOS 5 · Galaxy AI"}', '[{"label":"۴۷ میلی‌متر","subtitle":"بدنه مقاوم ورزشی · بند سیلیکون","priceDelta":0}]', '[{"id":"silver-1","hex":"#dedede","name":"نقره ای"},{"id":"blue-2","hex":"#0000FF","name":"آبی"},{"id":"gray-3","hex":"#9E9E9E","name":"خاکستری"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/a677414a3b7e96576c9ca7b4aa593a206f9e9fbc_1747411161.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'نقره ای', 'پرچمدار ورزشی سامسونگ', 90, false, true, 33, 33, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/a677414a3b7e96576c9ca7b4aa593a206f9e9fbc_1747411161.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9debf7a16f50edc2984ef13103d3f870d84a44f3_1721146785.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/184399add01c53c37c8616a83b9c8260dfe93750_1721146785.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/36b4cc3e91035d1616e60f0591d1b9e80ee0e76a_1721146807.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b84641d34b3f4c3bdfe8b93f9ec3e45c724a3fd6_1723809018.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d1a2fe43a9fb6ff22f26167776cd5fc31f6afd01_1721146806.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8390e026b3948f636c4591efce5609557f0fa26d_1721146813.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2a7264ef10b0ed2f7ee390cb2abb5aff1951e689_1721146838.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-16073422"},{"label":"ابعاد و وزن","value":"۴۷.۴×۴۷.۱×۱۲.۱ میلی‌متر · ۶۰.۵ گرم"},{"label":"استاندارد مقاومت","value":"ضدآب تا عمق ۱۰۰ متر · استاندارد MIL-STD"}]', '2026-11-24 19:25:00+00', 'Galaxy Watch Ultra 47mm', 'ساعت هوشمند سامسونگ مدل Galaxy Watch Ultra، یک گزینه ایده‌آل برای کسانی است که به دنبال ترکیب کارایی و زیبایی در ساعت هوشمند خود هستند. این ساعت با طراحی شیک و مقاوم، به‌ویژه برای آقایان و بانوانی که از آن در شرایط مختلف استفاده می‌کنند، مناسب است. ابعاد قاب این ساعت 47.4×47.1×12.1 میلی‌متر است و با وزن 60.5 گرم، به‌راحتی روی مچ قرار می‌گیرد.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'smartwatches', 'بررسی ساعت هوشمند سامسونگ مدل Galaxy Watch Ultra
در سال‌های اخیر، بازار ساعت‌های هوشمند شاهد رشد چشم‌گیری بوده است. شرکت‌های فناوری برای جلب توجه کاربران، همواره در تلاش برای ارائه محصولات نوآورانه و پیشرفته هستند. سامسونگ نیز به عنوان یکی از پیشگامان این حوزه، با معرفی ساعت هوشمند Galaxy Watch 7 Ultra قصد دارد جایگاه خود را در بازار تثبیت کند.

این ساعت هوشمند با طراحی زیبا و مجهز به ویژگی‌های متنوع، می‌تواند انتخاب مناسبی برای کاربران مختلف باشد. در این مقاله، به بررسی جزئیات این محصول جدید سامسونگ، از جمله طراحی، امکانات، عملکرد و مزایا و معایب آن خواهیم پرداخت تا کاربران بتوانند تصمیم آگاهانه‌تری در خصوص خرید آن اتخاذ کنند.

قابلیت‌های حیرت انگیز
پردازنده این ساعت هوشمند، چیپ‌ست Exynos W1000 سامسونگ است. این چیپ‌ست یک پردازنده پنج‌هسته‌ای با معماری 64 بیتی محسوب می‌شود. این پردازنده دارای چهار هسته Cortex A55 1.5GHz به همراه یک عدد پردازنده تک هسته‌ای Cortex A78 1.6GHz است و از پردازشگر گرافیکی GPU Mali-G68 MP2 بهره می‌برد. همچنین قابلیت‌های پیشرفته‌ای مانند پردازش صوتی، یادگیری ماشین و پردازش تصویر را نیز پشتیبانی می‌کند. این چیپ‌ست سفارشی و قدرتمند، می‌تواند به خوبی از پس اجرای امکانات گوناگون ساعت Galaxy Watch 7 Ultra برآید و عملکرد روان و کارآمدی را برای آن فراهم کند.

در زمینه حافظه، این ساعت هوشمند مجهز به 32 گیگابایت حافظه داخلی است. این ظرفیت حافظه به کاربران این امکان را می‌دهد تا بتوانند برنامه‌ها، موسیقی و سایر محتواهای مورد نیاز خود را در ساعت ذخیره کنند. همچنین ساعت Galaxy Watch 7 Ultra از 2 گیگابایت رم برخوردار است.

حضور این میزان رم در کنار پردازنده قدرتمند Exynos W1000، باعث می‌شود که ساعت بتواند برنامه‌ها و اپلیکیشن‌های مختلف را به صورت روان و بدون وقفه اجرا کند. این مشخصات حافظه، امکان اجرای چندوظیفگی و اجرای هم‌زمان برنامه‌های متنوع را در ساعت فراهم می‌سازد.

در مجموع، ترکیب 32 گیگابایت حافظه داخلی و 2 گیگابایت رم، یک پیکربندی قدرتمند و کارآمد را برای این ساعت هوشمند ایجاد می‌کند. این مشخصات سخت‌افزاری به کاربران این امکان را می‌دهد تا بتوانند از ویژگی‌های پیشرفته ساعت Galaxy Watch 7 Ultra به بهترین نحو استفاده کنند.

جمع‌‌بندی
Samsung Galaxy Watch 7 Ultra یک ساعت هوشمند کامل و پیشرفته است که در طراحی و امکانات خود نشان از توجه ویژه سامسونگ به نیازهای کاربران دارد. مجموعه قدرتمندی از سخت‌افزار، سنسورها و قابلیت‌های نرم‌افزاری در این ساعت به کار گرفته شده است تا تجربه کاربری همه‌جانبه‌ای را فراهم کند.

نمایشگر با کیفیت بالا، باتری با قابلیت شارژ سریع و شارژ بی‌سیم، مجموعه گسترده‌ای از سنسورهای پیشرفته و سیستم‌عامل کارآمد Wear OS همراه با رابط کاربری One UI، از جمله ویژگی‌های برجسته این ساعت هوشمند هستند. علاوه بر این، بهره‌گیری از هوش مصنوعی Galaxy AI نیز به طراحی تجربه کاربری هوشمندانه و سفارشی‌شده کمک می‌کند.

در مجموع، Samsung Galaxy Watch 7 Ultra نه تنها یک ساعت زیبا و باکیفیت است، بلکه با ترکیب هوشمندانه امکانات پیشرفته خود، به یک همراه قابل اعتماد و مفید در زندگی روزمره تبدیل می‌شود. این ساعت می‌تواند نیازهای متنوع کاربران را در حوزه‌های مختلف مانند سلامت، ورزش و سبک زندگی فعال به خوبی برآورده سازد.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-watch-7-44mm', 'samsung-galaxy-watch-7-44mm', 'ساعت هوشمند سامسونگ مدل Galaxy Watch 7 44mm دارای قابلیت های کنترل موسیقی (Music Player) بند پلاستیک', 'Samsung Galaxy Watch 7 44mm Smart Watch', 'Samsung', 'smartwatches', 39850000, NULL, 0, true, 1, true, 'گارانتی 18 ماهه پیکسل', '4.6', 1248, '{"display":"۱.۵ اینچ Super AMOLED","displayDetails":"۴۸۰×۴۸۰ · ۳۲۷ PPI · شیشه یاقوت","chipset":"Exynos W1000 (۳ نانومتری)","chipsetDetails":"۵ هسته‌ای · ۳۲ گیگ حافظه · ۲ گیگ رم","camera":"سنسور BioActive، فشار خون و SpO2","cameraDetails":"فشارسنج، ارتفاع‌سنج و ژیروسکوپ","battery":"۴۲۵ میلی‌آمپر ساعت","batteryDetails":"شارژ بی‌سیم · ضدآب IP68 و 5ATM","storageDefault":"۳۲ گیگابایت","ram":"۲ گیگابایت","os":"WearOS 5 · Galaxy AI"}', '[{"label":"۴۴ میلی‌متر","subtitle":"حافظه ۳۲ گیگابایت · eSIM","priceDelta":0}]', '[{"id":"silver-1","hex":"#dedede","name":"نقره ای"},{"id":"green-2","hex":"#008000","name":"سبز"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/0729b5a31e4e18a4a60b379878e446bae7c258ef_1747411212.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'نقره ای', 'تراشه ۳ نانومتری', 93, false, true, 34, 34, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/0729b5a31e4e18a4a60b379878e446bae7c258ef_1747411212.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/42da70c8c636cd5899e5d5d499963421b0292858_1786906437.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c3628decb8a559dd4da1b758e1cd255c126d30aa_1721150583.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/243693c3a89bebed12001ebc1dd1582c88486efe_1721150583.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8b6bfe07631b3011ec6bfb57847cdcf672e13be7_1721150583.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5d86e1411be74592a2023190d42fef9a6bbe51fe_1721150829.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1cd7495e0839a867b31a8bbffa1429b1c8074bb0_1721150853.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/243693c3a89bebed12001ebc1dd1582c88486efe_1721150857.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-16073844"},{"label":"ابعاد و وزن","value":"۴۴.۴×۴۴.۴×۹.۷ میلی‌متر · ۳۳.۸ گرم"},{"label":"شیشه محافظ","value":"یاقوت کبود (Sapphire Crystal)"}]', '2026-11-24 19:25:00+00', 'Galaxy Watch 7 44mm', 'ساعت هوشمند سامسونگ مدل Galaxy Watch 7، یک انتخاب عالی برای افرادی است که به دنبال ساعت هوشمندی با طراحی زیبا و ویژگی‌های پیشرفته هستند. این ساعت با ابعاد 44.4x44.4میلی‌متر و وزن سبک 33.8 گرم، راحتی زیادی را هنگام استفاده فراهم می‌آورد. بدنه آن از آلومینیوم ساخته‌شده است و شیشه یاقوتی آن مقاومت بالایی در برابر خط‌وخش دارد. بند آن قابلیت تعویض داشته و به‌راحتی می‌توان آن را باسلیقه‌های مختلف هماهنگ کرد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'smartwatches', 'بررسی ساعت هوشمند سامسونگ مدل Galaxy Watch 7
با ورود گیگانت‌های فناوری به بازار ساعت‌های هوشمند، این بخش از صنعت گجت‌های پوشیدنی به سرعت در حال پیشرفت و توسعه است. سامسونگ به عنوان یکی از پیشگامان این حوزه، با معرفی مدل‌های متعدد از ساعت‌های هوشمند خود، تجربه کاربری جذاب‌تری را برای طرفداران این دسته از محصولات فراهم آورده است.

 در این میان، Samsung watch 7 به عنوان جدیدترین نسخه ساعت هوشمند این شرکت، با ویژگی‌های برجسته‌ای چون طراحی بهبودیافته، قابلیت‌های سلامتی پیشرفته و خدمات متنوع، توانسته است بخش زیادی از انتظارات کاربران را برآورده سازد. در این مقاله، به بررسی جزئیات این محصول و تحلیل نقاط قوت و ضعف آن خواهیم پرداخت.

قابلیت‌های حیرت انگیز
از منظر سخت‌افزاری، Samsung watch 7 از قطعات با کیفیت و پیشرفته‌ای بهره می‌برد. این ساعت مجهز به چیپست 5 هسته‌ای Exynos W1000 به همراه دو گیگابایت حافظه رم است. این ترکیب رم و پردازنده، توان پردازشی مناسبی را برای اجرای روان اپلیکیشن‌های مختلف فراهم می‌آورد.

در بخش نمایشگر، Samsung watch 7 از صفحه‌نمایش Super AMOLED با ابعاد 1.3 اینچ و تراکم پیکسلی 327 بر اینچ برای نسخه ۴۰ میلی‌متری و 1.4 اینچ برای نسخه 44 میلی‌متری با تراکم پیکسلی 330 پیکسل بر اینچ بهره می‌برد. این پنل نمایشگر، کیفیت تصویر بسیار مطلوبی را ارائه داده و از روشنایی بالا و رنگ‌های زنده برخوردار است. همچنین، قابلیت Always-On Display در این صفحه‌نمایش موجب می‌شود که اطلاعات همیشه در دسترس کاربر باشند. روشنایی این صفحه نمایش تا ۲۰۰۰ نیت هم می‌رسد.

در نهایت، باتری 300 و 425 میلی‌آمپر ساعتی به ترتیب برای نسخه 40 و 44 میلی‌متری این ساعت هوشمند، تا 2 روز استفاده مداوم را پشتیبانی می‌کند. هرچند که این مدت زمان شارژ تا حدودی کوتاه‌تر از برخی رقبای این محصول است، اما برای اکثر کاربران روزمره قابل قبول ارزیابی می‌شود.

در مجموع، مشخصات سخت‌افزاری Samsung watch 7 با ارائه پردازنده قدرتمند، نمایشگر باکیفیت، حافظه کافی و سنسورهای پیشرفته، توانسته است پاسخگوی نیازهای کاربران در زمینه تجربه کاربری روان، امکانات سلامتی دقیق و کارایی مطلوب باشد.
همچنین دو قابلیت جدید Energy Score و Wellness Tips نیز در این ساعت هوشمند گنجانده شده است که کمک می‌کنند اطلاعات ثبت شده توسط این ساعت قابل درک‌تر باشند. Energy Score با ردیابی روند خواب و فعالیت شما، میزان انرژی شما را در مقیاس ۰ تا ۱۰۰ نمایش می‌دهد. این قابلیت مدت زمان خواب، ضربان قلب در حالت بیداری و خواب را اندازه‌گیری می‌کند و توصیه‌هایی هم برای بهبود انرژی یا حفظ انرژی در اختیار شما قرار می‌دهد. Wellness Tips هم توصیه‌هایی عملی برای بهبود سلامتی در اختیار شما قرار می‌دهد.

جمع‌‌بندی
در مجموع، Samsung watch 7 با پیشرفت‌های چشمگیر خود در بخش‌های طراحی، قابلیت‌ها و عملکرد، گزینه‌ای مناسب برای کاربران ساعت‌های هوشمند به حساب می‌آید. این محصول، علاوه بر ظاهر زیبا و ساخت باکیفیت، از امکانات متنوع و دقیقی در حوزه سلامت و تناسب‌اندام برخوردار است که به خوبی نیازهای روزمره کاربران را پاسخ می‌دهد.

 با این وجود، برخی محدودیت‌هایی مانند طول عمر باتری متوسط و قیمت نسبتاً بالای آن، می‌توانند معایبی برای این ساعت هوشمند محسوب شوند. اما در کل، Samsung watch 7 به عنوان یکی از بهترین انتخاب‌های موجود در بازار ساعت‌های هوشمند، توصیه می‌شود.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('samsung-galaxy-watch-8-40mm', 'samsung-galaxy-watch-8-40mm', 'ساعت هوشمند 40 میلی‌متری سامسونگ مدل Galaxy Watch 8 با بند پلاستیکی', 'Samsung Galaxy Watch 8 40mm Smart Watch', 'Samsung', 'smartwatches', 37994000, 40980000, 7, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.5', 319, '{"display":"۱.۳۴ اینچ Super AMOLED","displayDetails":"۴۳۸×۴۳۸ · روشنایی ۳۰۰۰ نیت · یاقوت","chipset":"Exynos W1000 (۳ نانومتری)","chipsetDetails":"۳۲ گیگابایت حافظه · ۲ گیگ رم · NFC/Wi-Fi","camera":"سنسور BioActive + ECG + فشار خون","cameraDetails":"GPS / GLONASS / GALILEO / BDS","battery":"۳۲۵ میلی‌آمپر ساعت","batteryDetails":"شارژ بی‌سیم · تا ۳۰ ساعت کارکرد","storageDefault":"۳۲ گیگابایت","ram":"۲ گیگابایت","os":"Wear OS · Android 12+"}', '[{"label":"۴۰ میلی‌متر","subtitle":"آلومینیوم Armor · حافظه ۳۲ گیگ","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"},{"id":"silver-2","hex":"#dedede","name":"نقره ای"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/e37ed04c0376515065edf27c0693796d021222dc_1764429369.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۷٪ تخفیف · نمایشگر ۳۰۰۰ نیت', 90, true, true, 35, 35, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/e37ed04c0376515065edf27c0693796d021222dc_1764429369.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/71f304d2a17544c114acc834feaf4e71d9f0ccb6_1753203235.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/62b1f01d44d821facf38cf908e6a251d2be72dae_1753203235.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/218d83d9510e4c224757b6b9ae34890798bc8b3f_1753203235.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5b58d87f3717aefafe7ceaf335544105dfa6c1a1_1753203236.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/66a2837d6ff482af1691691c68dbfc8646d01361_1753203236.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/667da4dcb8c211838db3fd43c9377b88acea4b78_1753203236.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/175254c19869c68c04f1e9873d1ac9cb5f20dcee_1753203236.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-19926027"},{"label":"استاندارد مقاومت","value":"IP68 + 5ATM + استاندارد نظامی MIL-STD-810H"},{"label":"ابعاد و وزن","value":"۴۲.۷×۴۰.۴×۸.۶ میلی‌متر · ۳۰ گرم"}]', '2026-11-24 19:25:00+00', 'Galaxy Watch 8 40mm', 'ساعت هوشمند Galaxy Watch 8 جدیدترین نسخه از ساعت‌های هوشمند‌ سامسونگ است که با طراحی شیک و وزن سبک 34 گرم در نسخه 44 و 30 گرم در نسخه 40 میلی‌متری، تجربه راحت و حرفه‌ای برای کاربران فراهم می‌کند. این ساعت در دو سایز 44 و 40 میلی‌متر عرضه شده که سایز 40 برای خانم‌ها مناسب‌تر است و مچ‌های کوچک‌تر را راحت‌تر پوشش می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'samsung', 'smartwatches', 'طراحی و کیفیت ساخت، مدرن و سبک
Galaxy Watch 8 جدیدترین و پشرفته‌ترین ساعت از سری واچ 8 سامسونگ است که طراحی آن ترکیبی از زیبایی و دوام بالا است. این ساعت در دو سایز ۴۴ و ۴۰ میلی‌متر عرضه شده است، که سایز ۴۰ برای خانم‌ها مناسب‌تر است و مچ‌های کوچک‌تر را راحت‌تر پوشش می‌دهد. بدنه آن از جنس آلومینیوم سبک ساخته شده و ضخامت آن تنها ۸.۶ میلی‌متر است، در حالی که وزن بسیار کم ۳۴ گرم و 30 گرم در نسخه‌های 40 و 44 باعث می‌شود استفاده روزمره و حتی در تمرین‌های ورزشی طولانی راحت باشد. فرم دایره‌ای صفحه و شیشه یاقوتی مقاوم، جلوه‌ای شیک و در عین حال بادوام به ساعت بخشیده است. همچنین قابلیت تعویض بند با چندین گزینه مختلف، انعطاف شخصی‌سازی و تغییر استایل را برای کاربران فراهم می‌کند.

یک بدنه مقاوم و تماما ضد آب
این ساعت توانسته است گواهی IP68 دریافت کند و این موضوع یعنی بدنه آن به طور کامل ضد آب و گرد و غبار است و تا فشار 5 اتمسفر یعنی 50 متری زیر آب، نفوذ ناپذیر باقی می‌ماند. از طرفی با پشت سر گذاشتن تست‌های نظامی MIL-STD-810H یک ساعت بسیار مقاوم محسوب می‌شود و در برابر ضربه و خط و خش به راحتی آسیب نمی‌بیند.

نمایشگرSuper AMOLED، وضوح و شفافیت بی حد و مرز
صفحه نمایش ۱.۴۷ اینچی Super AMOLED با رزولوشن ۴۸۰۴۸۰ پیکسل و تراکم ۳۲۷ و صفحه نمایش 1.34 اینچی با رزولوشن 438 در 438 پیکسل، تصویری شفاف و رنگ‌های زنده ارائه می‌دهد. روشنایی ۳۰۰۰ نیت تضمین می‌کند حتی زیر نور مستقیم خورشید، نمایشگر به راحتی قابل خواندن باشد. قابلیت Always-on Display تجربه کاربری مدرن و راحتی برای مشاهده زمان و اعلان‌ها فراهم می‌کند و حسگر تشخیص نور محیط به تنظیم خودکار روشنایی کمک می‌کند و زیبایی آن را دوچندان می‌کند.

امکانات ورزشی و ردیابی فعالیت‌ها
Galaxy Watch 8 یک همراه ورزشی تماما حرفه‌ای است که از تمرینات مختلف پشتیبانی می‌کند. تشخیص هوشمند نوع رشته ورزشی، محاسبه کالری مصرفی، مسافت طی شده و ارائه برنامه تمرینی شخصی، تجربه‌ای جامع از فعالیت بدنی فراهم می‌آورد. سنسورهای حرکتی مانند شتاب‌سنج، ژیروسکوپ، ارتفاع‌سنج و گام‌شمار به همراه GPS دوبانده و سیستم‌های موقعیت‌یابی A-GPS، دقت بالا در ثبت مسیرها و حرکات ورزشی را تضمین می‌کنند. به نوعی می‌توان گفت که شما با خرید این ساعت، یک مربی 24 ساعته استخدام می‌کنید.

سنسورها و ردیابی سلامت، یک پکیج کامل
این ساعت هوشمند مجموعه کاملی از سنسورهای سلامتی دارد، این سنسورها شامل شمارنده ضربان قلب، سنجش اکسیژن خون، فشار خون، دمای بدن، سنجش سطح استرس، کیفیت خواب و نظارت بر سیکل ماهیانه بانوان. قابلیت ثبت الکتروکاردیوگرام (ECG) اطلاعات دقیق و حرفه‌ای برای مدیریت سلامت ارائه می‌دهد و آن را به گزینه‌ای عالی برای کاربران حرفه‌ای و علاقه‌مندان به تکنولوژی سلامتی تبدیل کرده است.

ویژگی‌های خاص
Galaxy Watch 8 امکانات کاربردی جذاب دیگری هم دارد که دانستن آن‌های برای شما خالی از لطف نیست.از این امکانات می‌توان به کنترل موسیقی، مکالمه از طریق بلوتوث، نصب اپلیکیشن، تغییر تم و طرح ساعت و پشتیبانی از دستیار صوتی اشاره کرد. از طرفی سیستم عامل WatchOS، پردازنده Exynos W1000 و ۲ گیگابایت رم عملکرد روان و بدون لگ ارائه می‌دهند و حافظه داخلی ۳۲ گیگابایت امکان ذخیره‌سازی محتوای صوتی و اپلیکیشن‌ها را فراهم می‌کند.

عملکرد سخت‌افزاری، سریع و پایدار
پردازنده Exynos W1000 با توان پردازشی بالا، اجرای اپلیکیشن‌ها، پاسخ به فرمان‌های حرکتی و تعامل با گوشی‌های اندرویدی نسخه ۱۲ به بالا را بدون تاخیر انجام می‌دهد. اتصال Wi-Fi، بلوتوث ۵.۳ و NFC امکان ارتباط سریع و پایدار با گوشی و دستگاه‌های دیگر را تضمین می‌کند.

باتری و شارژدهی، همراه مطمئن در روزهای ورزشی
باتری ۴۳۵ میلی‌آمپرساعتی در نسخه 44 و باتری 325 میلی‌آمپرساعتی در نسخه40 میلی‌متری Galaxy Watch 8 با پشتیبانی از شارژ بی‌سیم و کابل مغناطیسی، عمر طولانی و مناسب برای استفاده روزانه و ورزشی ارائه می‌دهد. شارژدهی بالا و توان ۱۰ وات شارژ بی‌سیم، تجربه راحت و بدون دغدغه‌ای از استفاده طولانی مدت را فراهم می‌کند.

جمع‌بندی، سبک، حرفه‌ای و هوشمند
Galaxy Watch 8 با طراحی سبک و شیک، نمایشگر با کیفیت، امکانات جامع ورزشی و سنسورهای سلامتی پیشرفته، عملکرد نرم‌افزاری روان و عمر باتری مناسب، یک گزینه ایده‌آل برای کاربران حرفه‌ای و علاقه‌مندان به تکنولوژی است. عرضه در دو سایز ۴۴ و ۴۰ میلی‌متر و وجود چندین بند قابل تعویض، امکان شخصی‌سازی و انتخاب سایز مناسب برای هر کاربر را فراهم می‌کند و آن را به انتخابی جذاب برای خانم‌ها و آقایان تبدیل کرده است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-airpods-4', 'apple-airpods-4', 'هدفون بلوتوثی اپل مدل AirPods 4 فاقد قابلیت نویز کنسلینگ، درگاه شارژ USB Type-C، شارژ بی سیم، با قابلیت اتصال به چند دستگاه، پشتیبانی از فرمان لمسی، نشانگر LED، پشتیبانی از دستیار صوتی، مقاوم در برابر آب', 'Apple AirPods 4 Wireless Earbuds USB-C', 'Apple', 'audio', 27999000, 34766400, 19, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.5', 965, '{"display":"کیس جمع‌وجور USB-C","displayDetails":"نشانگر LED · پشتیبانی شارژ بی‌سیم","chipset":"Apple H2","chipsetDetails":"اتصال چند دستگاهی · دستیار صوتی","camera":"کنترل لمسی روی ساقه گوشی","cameraDetails":"میکروفون شفاف برای مکالمه","battery":"تا ۳۰ ساعت با محفظه شارژ","batteryDetails":"۵ ساعت پخش موسیقی · ۴.۵ ساعت مکالمه","storageDefault":"USB Type-C","ram":"فاقد ANC","os":"سازگار با iOS و اندروید"}', '[{"label":"نسخه استاندارد","subtitle":"درگاه USB-C + شارژ بی‌سیم","priceDelta":0}]', '[{"id":"white-1","hex":"#FFFFFF","name":"سفید"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/c833f9af9cc59ea0fd3e0200011fd27731f0f8af_1786571880.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'سفید', '۱۹٪ تخفیف', 90, true, true, 36, 36, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/c833f9af9cc59ea0fd3e0200011fd27731f0f8af_1786571880.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/47253d3d200446771fd7be0c5c68545a71728ce9_1745827634.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6ccd55c332018c7547822aea4386cfd1854f65c0_1729681416.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9a4b79e6a3597a86599101f0f6ca3988b3212505_1729681416.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/29e047f8b7414a4cc8b4029227049bc5bf763a25_1729681416.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f2aba9acb636b8fdbd807d68e3ebc7230d769fb8_1729681416.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e662dc34e6c3b84dfd250e0c052989d58a3fcf9e_1729681416.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/cab1a14ff5e0fdfbf789f47707ebe65e8e2d2d6c_1729968837.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-16768320"},{"label":"ابعاد کیس","value":"۵۰.۱×۲۱.۲×۴۶.۲ میلی‌متر"},{"label":"مقاومت فیزیکی","value":"مقاوم در برابر آب و تعریق"}]', '2026-11-24 19:25:00+00', 'Apple AirPods 4', 'هدفون بلوتوثی اپل مدل AirPods 4 جدیدترین نسل از سری AirPods است که با ترکیب کیفیت صدای فوق‌العاده و طراحی ارگونومیک، تجربه‌ای بی‌نظیر را برای کاربران به ارمغان می‌آورد. این هدفون بی‌سیم با طراحی TWS (کاملاً بدون سیم)، علاوه بر راحتی در استفاده، قابلیت‌های پیشرفته‌ای مانند صدای سه‌بعدی و قابلیت‌های کنترل صدا را به کاربران ارائه می‌دهد.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'audio', 'سازگاری و قابلیت‌های هوشمند
یکی از نقاط قوت AirPods 4، اتصال فوری و یکپارچه آن با دستگاه‌های مختلف اپل است. این هدفون به‌راحتی با تمامی دستگاه‌های متصل به‌حساب کاربری اپل کاربر هماهنگ شده و نیاز به تنظیمات اضافی ندارد. این اتصال سریع و پایدار تجربه کاربری را به‌طور قابل‌توجهی بهبود می‌بخشد. علاوه بر این، قابلیت جابه‌جایی آسان بین دستگاه‌ها امکان پاسخ به تماس روی آیفون هنگام گوش‌دادن به موسیقی از مک را فراهم می‌کند که در افزایش بهره‌وری و سهولت استفاده بسیار مؤثر است.

AirPods 4 از قابلیت دستیار صوتی Siri هم پشتیبانی می‌کند. شما می‌توانید به‌راحتی با گفتن "Hey Siri" موسیقی پخش‌کنید، تماس بگیرید، یا برنامه‌های روزانه خود را چک کنید. همچنین، ویژگی جدید این مدل امکان پاسخ یا رد تماس و مدیریت تایمرها از طریق تکان‌دادن سر (نشان‌دادن تأیید یا رد) است که بدون نیاز به لمس گوشی یا هدفون می‌توانید دستورات خود را انجام دهید. این ویژگی‌ها برای افرادی که همیشه در حال حرکت و فعالیت هستند، بسیار مفید است.

جمع‌بندی
هدفون بلوتوثی اپل مدل AirPods 4 با طراحی زیبا، کیفیت صدای بی‌نظیر و مجموعه‌ای از ویژگی‌های پیشرفته هوشمند و مقاومتی، انتخابی عالی برای تمامی کاربران اپل است. باقابلیت‌هایی مانند صدای سه‌بعدی پویا و کنترل صوتی هوشمند، این هدفون تجربه‌ای فراتر از یک هدفون ساده را به ارمغان می‌آورد. کیفیت مکالمه در محیط‌های شلوغ و اتصال فوری با دستگاه‌های اپل از دیگر مزیت‌های مهم این مدل است. اگر به دنبال هدفونی با کارایی زیاد و کیفیت بالا هستید، AirPods 4 گزینه‌ای بسیار مناسب است که ارزش خرید را دارد.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-airpods-5-anc', 'apple-airpods-5-anc', 'هدفون بلوتوثی توگوشی اپل مدل Airpods 5 با حذف نویز فعال، تراشه H2 و استاندارد IP57', 'Apple AirPods 5 Wireless Earbuds with Active Noise Cancellation', 'Apple', 'audio', 41700000, NULL, 0, true, 10, true, 'گارانتی 18 ماهه همراه رایان سازان هیراد', '4.1', 19, '{"display":"کیس شارژ هوشمند LED","displayDetails":"استاندارد مقاومت IP57","chipset":"Apple H2","chipsetDetails":"حذف نویز فعال (ANC) + Transparency","camera":"۲ میکروفون Beamforming + داخلی","cameraDetails":"اتصال همزمان به چند دستگاه","battery":"تا ۲۰ ساعت با کیس شارژ","batteryDetails":"۴ ساعت پخش موسیقی با ANC فعال","storageDefault":"ANC + H2","ram":"IP57","os":"سازگار با iOS و اندروید"}', '[{"label":"نسخه ANC","subtitle":"حذف نویز فعال · IP57","priceDelta":0}]', '[{"id":"white-1","hex":"#FFFFFF","name":"سفید"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/ddc71359071c769b6ea16c832805c7feda6a46ed_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'سفید', 'تراشه H2 · استاندارد IP57', 85, false, true, 37, 37, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/ddc71359071c769b6ea16c832805c7feda6a46ed_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4369aab7153c1913ff4610e24a9947a0522c68a6_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9e395bdb7982f430fc36d2795eea2d9a7703c953_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e01d69c7e578fdec30772f695dbddb1074f30f78_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/a254d0df6cd610e6984f0add94f61023b6f6aef8_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5d308a232595468c33fb748e8f1fa8ff5248c871_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5eac570578b618d8b5e254bb6d7af13d7f8fe604_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/863e1b7891e6e90e264debe91a7de5e9fdb8e6fa_1789372762.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-22734216"},{"label":"ابعاد هر گوشی","value":"۱۸.۱×۱۸.۳×۳۰.۲ میلی‌متر"},{"label":"ابعاد کیس شارژ","value":"۲۱.۲×۵۰.۱×۴۶.۲ میلی‌متر"}]', '2026-11-24 19:25:00+00', 'Apple AirPods 5 ANC', 'AirPods 5 اپل برای کسی ساخته شده که از یک هدفون توگوشی، فقط پخش صدا نمی‌خواهد؛ تجربه‌ای می‌خواهد که هم در سکوت کامل، هم در شلوغی خیابان و هم هنگام مکالمه، خودش را با شرایط هماهنگ کند. تراشه H2، حذف نویز فعال، حالت شفافیت و صدای تطبیقی، شنیدن موسیقی و اطراف را به شکلی روان‌تر کنار هم قرار می‌دهند.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'audio', 'مقدمه
اپل در نسل جدید هدفون‌های بی‌سیم خود تلاش کرده است تجربه‌ای متعادل میان راحتی استفاده، کیفیت صدا و امکانات هوشمند ایجاد کند. AirPods 5 با تکیه بر طراحی بدون سری‌های سیلیکونی، تراشه H2 و مجموعه‌ای از قابلیت‌های صوتی پیشرفته، برای کاربرانی ساخته شده است که به دنبال هدفونی سبک و کاربردی برای استفاده روزمره هستند. این مدل در نسخه مجهز به کیس شارژ معمولی، از درگاه USB-C برای شارژ استفاده می‌کند و در کنار امکاناتی مانند حذف نویز فعال، حالت شفافیت و صدای فضایی شخصی‌سازی‌شده، از قابلیت‌های جدیدی برای بهبود مکالمه و تعامل با دستیار هوشمند اپل بهره می‌برد. یکی از نکات قابل‌توجه درباره AirPods 5، ارائه قابلیت حذف نویز فعال در مدلی با طراحی نیمه‌باز است. این موضوع باعث می‌شود هدفون برای افرادی که با سری‌های سیلیکونی هدفون‌های توگوشی راحت نیستند، گزینه‌ای قابل‌بررسی باشد. البته طراحی نیمه‌باز، در کنار مزایای خود، محدودیت‌هایی نیز در زمینه عایق‌سازی طبیعی صدا دارد. بنابراین ارزیابی این محصول تنها بر اساس فهرست قابلیت‌های آن کافی نیست و باید راحتی، کیفیت پخش موسیقی، عملکرد حذف نویز و نحوه استفاده از آن در شرایط مختلف را نیز در نظر گرفت.در این بررسی، نسخه AirPods 5 با کیس شارژ معمولی را از جنبه‌های مختلف بررسی می‌کنیم تا مشخص شود این هدفون در استفاده روزمره چه تجربه‌ای ارائه می‌دهد.

طراحی، کیفیت ساخت و راحتی استفاده
AirPods 5 از همان زبان طراحی آشنای خانواده ایرپادز بهره می‌برد؛ طراحی‌ای که به‌جای استفاده از سری‌های سیلیکونی، به‌صورت نیمه‌باز درون گوش قرار می‌گیرد. این ساختار باعث می‌شود هدفون بدون ایجاد فشار مستقیم ناشی از سری‌های لاستیکی، درون گوش قرار بگیرد و برای بسیاری از کاربران در استفاده‌های طولانی‌مدت احساس راحتی بیشتری ایجاد کند. البته شکل گوش افراد متفاوت است و میزان ثبات هدفون در گوش، تا حد زیادی به فرم مجرای گوش بستگی دارد. هر گوشی تنها ۴.۳ گرم وزن دارد و ابعاد آن شامل ارتفاع ۳۰.۲ میلی‌متر، عرض ۱۸.۳ میلی‌متر و عمق ۱۸.۱ میلی‌متر است. وزن پایین و ابعاد جمع‌وجور باعث می‌شود استفاده از AirPods 5 هنگام گوش دادن به موسیقی، تماشای فیلم یا برقراری تماس، فشار چندانی به گوش وارد نکند. نبود سیم و طراحی ساده نیز جابه‌جایی آن را آسان کرده است.
کیس شارژ، ابعادی برابر با ۵۰.۱ میلی‌متر عرض، ۴۶.۲ میلی‌متر ارتفاع و ۲۱.۲ میلی‌متر عمق دارد و وزن آن، بدون گوشی‌ها، ۳۲.۳ گرم است. این کیس به‌راحتی در جیب یا کیف قرار می‌گیرد و به دلیل ابعاد کوچک، حمل هدفون را در طول روز ساده‌تر می‌کند. از نظر مقاومت، AirPods 5 دارای گواهی IP57 برای مقاومت در برابر گردوغبار، عرق و آب است. این ویژگی برای استفاده روزمره، پیاده‌روی و فعالیت‌های ورزشی سبک اهمیت دارد؛ بااین‌حال، مقاومت در برابر آب به معنای مناسب‌بودن هدفون برای شنا یا قرارگرفتن عمدی در آب نیست. همچنین بهتر است از واردکردن فشار یا قرارگرفتن طولانی‌مدت هدفون در معرض رطوبت خودداری شود. در مجموع، طراحی AirPods 5 بیشتر بر راحتی و سبکی تمرکز دارد تا ایجاد یک اتصال کاملاً محکم و ایزوله درون گوش. این موضوع برای کاربرانی که هدفون‌های بدون سری را ترجیح می‌دهند، یک ویژگی مهم محسوب می‌شود؛ اما افرادی که هنگام ورزش‌های شدید به ثبات بسیار زیاد هدفون نیاز دارند، باید فرم قرارگیری آن را با ساختار گوش خود در نظر بگیرند.

کیفیت صدا
AirPods 5 به درایور اختصاصی با دامنه حرکتی بالا و تقویت‌کننده‌ای با دامنه دینامیکی بالا مجهز شده است. این ترکیب در کنار فناوری Adaptive EQ به هدفون کمک می‌کند صدا را متناسب با نحوه قرارگیری گوشی‌ها در گوش تنظیم کند. هدف از این فناوری، ارائه صدایی متعادل‌تر در شرایط مختلف شنیداری است؛ به‌خصوص با توجه به اینکه طراحی نیمه‌باز، برخلاف هدفون‌های توگوشی دارای سری سیلیکونی، به شکل متفاوتی با مجرای گوش تعامل دارد. در پخش موسیقی، تمرکز AirPods 5 بر ارائه صدایی متوازن و شفاف است. صداهای میانی، مانند آواز خواننده و سازهای اصلی، اهمیت زیادی در تجربه شنیداری این مدل دارند. به همین دلیل، هنگام گوش دادن به موسیقی‌های پاپ، قطعات آکوستیک و پادکست‌ها، وضوح بخش‌های گفتاری و جزئیات اصلی موسیقی نقش مهمی در کیفیت تجربه کاربر ایفا می‌کند.در بخش فرکانس‌های پایین، طراحی صوتی این هدفون تلاش می‌کند بیس را با وجود ساختار نیمه‌باز، قابل‌شنیدن و کنترل‌شده نگه دارد. بااین‌حال، میزان درک بیس به فرم گوش کاربر و نحوه قرارگیری گوشی‌ها بستگی دارد. در هدفون‌های بدون سری سیلیکونی، به دلیل نبود آب‌بندی کامل مجرای گوش، معمولاً نباید انتظار احساس بیس مشابه هدفون‌های کاملاً توگوشی را داشت. این موضوع به‌خصوص هنگام گوش دادن به موسیقی‌های الکترونیک یا قطعاتی با بیس عمیق، اهمیت بیشتری پیدا می‌کند.
در فرکانس‌های بالا نیز وضوح صدا اهمیت دارد. AirPods 5 با بهره‌گیری از تقویت‌کننده اختصاصی و پردازش صوتی اپل، برای ارائه جزئیات مناسب در سازها و بخش‌های مختلف موسیقی طراحی شده است. البته تجربه نهایی به نوع موسیقی، کیفیت فایل صوتی و تنظیمات مورد استفاده در دستگاه متصل بستگی دارد. یکی دیگر از قابلیت‌های صوتی این مدل، پشتیبانی از صدای فضایی شخصی‌سازی‌شده با رهگیری حرکات سر است. این قابلیت می‌تواند در محتوای سازگار، مانند فیلم‌ها و برخی موسیقی‌های دارای میکس فضایی، حس گسترده‌تری از صحنه صوتی ایجاد کند. در این حالت، صدا تنها از دو کانال چپ و راست به گوش نمی‌رسد و می‌تواند با توجه به حرکت سر، موقعیت مجازی خود را در فضای اطراف حفظ کند. در مجموع، AirPods 5 برای افرادی طراحی شده است که صدایی متعادل و تجربه شنیداری ساده و باکیفیت را در استفاده روزمره می‌خواهند. بااین‌حال، کاربرانی که بیس بسیار عمیق یا ایزولاسیون صوتی کامل را در اولویت قرار می‌دهند، باید محدودیت‌های طبیعی طراحی نیمه‌باز را نیز در نظر بگیرند.

حذف نویز، حالت شفافیت و عملکرد میکروفون
یکی از مهم‌ترین ویژگی‌های AirPods 5، پشتیبانی از حذف نویز فعال یا ANC است. وجود این قابلیت در هدفونی با طراحی نیمه‌باز، تجربه‌ای متفاوت از مدل‌های توگوشی دارای سری سیلیکونی ایجاد می‌کند. در حذف نویز فعال، میکروفون‌ها صداهای محیط را دریافت می‌کنند و سیستم پردازش صوتی، سیگنال‌هایی برای کاهش تأثیر نویزهای ناخواسته تولید می‌کند. در شرایطی مانند استفاده در محیط‌های اداری، خیابان یا وسایل حمل‌ونقل عمومی، ANC می‌تواند به کاهش بخشی از صداهای مزاحم کمک کند. بااین‌حال، به دلیل نبود آب‌بندی کامل مجرای گوش، نباید انتظار داشت عملکرد حذف نویز این مدل در تمام شرایط با هدفون‌های کاملاً توگوشی مجهز به سری‌های سیلیکونی یکسان باشد. صداهای ناگهانی، فرکانس‌های خاص و نویزهای محیطی پیچیده ممکن است همچنان تا حدی شنیده شوند. AirPods 5 از حالت شفافیت نیز پشتیبانی می‌کند. این حالت برای زمانی کاربرد دارد که کاربر بخواهد بدون خارج‌کردن هدفون از گوش، صداهای اطراف را بشنود. در چنین شرایطی، صدای محیط از طریق میکروفون‌ها دریافت و به صدای در حال پخش اضافه می‌شود. این ویژگی هنگام صحبت‌کردن با دیگران، شنیدن اطلاعیه‌ها یا آگاهی از محیط اطراف کاربرد دارد.
فناوری Adaptive Audio نیز با ترکیب عملکرد حذف نویز و حالت شفافیت، امکان تنظیم خودکار سطح کنترل صدا را در شرایط مختلف فراهم می‌کند. علاوه بر این، قابلیت Conversation Awareness می‌تواند هنگام صحبت‌کردن کاربر، شرایط شنیداری را تغییر دهد تا تعامل با افراد اطراف آسان‌تر شود. در بخش مکالمه، AirPods 5 به میکروفون‌های دوگانه با قابلیت شکل‌دهی پرتو و یک میکروفون رو به داخل مجهز شده است. این مجموعه در کنار قابلیت Voice Isolation به هدفون کمک می‌کند صدای کاربر را بهتر از صداهای محیط جدا کند. چنین قابلیتی هنگام تماس تلفنی یا برگزاری جلسه آنلاین در محیط‌های شلوغ اهمیت دارد. البته کیفیت مکالمه به عواملی مانند شدت باد، میزان شلوغی محیط، فاصله از تلفن همراه و کیفیت شبکه نیز بستگی دارد. بنابراین وجود فناوری‌های پردازش صدا به معنای حذف کامل تمام صداهای مزاحم نیست، اما می‌تواند در بهبود انتقال صدای کاربر نقش داشته باشد.

اتصال، کنترل‌ها و امکانات نرم‌افزاری
AirPods 5 از بلوتوث نسخه ۵.۳ برای اتصال بی‌سیم استفاده می‌کند و به تراشه H2 اپل مجهز شده است. این تراشه نقش مهمی در پردازش صدا، مدیریت قابلیت‌های صوتی و هماهنگی میان هدفون و دستگاه‌های اپل دارد. یکی از نقاط مهم تجربه استفاده از ایرپادز، هماهنگی آن با اکوسیستم اپل است. پس از اتصال هدفون به دستگاه سازگار، کاربر می‌تواند از امکانات نرم‌افزاری مختلفی مانند مدیریت حالت‌های شنیداری، کنترل تنظیمات صدا و دسترسی به برخی قابلیت‌های اختصاصی بهره ببرد. AirPods 5 همچنین با دستگاه‌های دیگری مانند آیپد، مک و اپل واچ سازگار است؛ هرچند برخی امکانات به نسخه سیستم‌عامل و مدل دستگاه وابسته هستند. کنترل‌های لمسی یا فشاری روی گوشی‌ها به کاربر اجازه می‌دهند عملکردهای مختلفی را بدون نیاز به خارج‌کردن گوشی از گوش انجام دهد. با یک‌بار فشردن حسگر، می‌توان پخش یا توقف موسیقی را کنترل کرد. این عملکرد برای پاسخ‌دادن به تماس یا بی‌صداکردن و فعال‌کردن دوباره میکروفون نیز کاربرد دارد.
با دو بار فشردن حسگر، امکان رفتن به قطعه بعدی یا پایان‌دادن به تماس فراهم می‌شود و سه بار فشردن، برای بازگشت به قطعه قبلی کاربرد دارد. با نگه‌داشتن حسگر نیز می‌توان میان حالت‌های مختلف شنیداری جابه‌جا شد. یکی از تفاوت‌های نسخه با کیس شارژ معمولی در مقایسه با نسخه مجهز به کیس شارژ وایرلس، نبود قابلیت تنظیم صدا با حرکت انگشت روی بدنه گوشی‌هاست. درنتیجه، برای تغییر میزان صدا باید از آیفون، اپل واچ، مک یا دستیار صوتی Siri استفاده کرد. AirPods 5 از فرمان‌های صوتی Siri نیز پشتیبانی می‌کند. کاربر می‌تواند با استفاده از فرمان‌های صوتی، موسیقی پخش کند، تماس بگیرد یا برخی اقدامات دیگر را انجام دهد. علاوه بر این، برخی قابلیت‌های تعاملی Siri امکان پاسخ‌دادن به درخواست‌های خاص را با حرکت سر فراهم می‌کنند؛ البته دسترسی به این امکانات ممکن است به مدل دستگاه و نسخه سیستم‌عامل بستگی داشته باشد. AirPods 5 با دستگاه‌های اندرویدی نیز از طریق بلوتوث قابل استفاده است، اما در این حالت بخشی از امکانات اختصاصی اپل در دسترس نخواهد بود. بنابراین تجربه کامل این هدفون بیشتر برای کاربرانی فراهم می‌شود که از محصولات اپل استفاده می‌کنند.

شارژدهی باتری و تجربه استفاده روزمره
AirPods 5 با کیس شارژ، در صورت فعال‌بودن حذف نویز، تا چهار ساعت پخش موسیقی را با یک‌بار شارژ ارائه می‌دهد. در صورت خاموش‌بودن کنترل نویز، مدت زمان استفاده از هر گوشی به حداکثر شش ساعت می‌رسد. کیس شارژ می‌تواند مجموع شارژدهی هدفون را در حالت فعال‌بودن حذف نویز به حداکثر ۲۰ ساعت برساند. این میزان برای استفاده‌های روزمره، رفت‌وآمد شهری و گوش دادن مقطعی به موسیقی مناسب است؛ بااین‌حال، کاربرانی که قصد دارند ساعت‌های طولانی و بدون وقفه از هدفون استفاده کنند، ممکن است به شارژ مجدد گوشی‌ها در طول روز نیاز داشته باشند. یکی از ویژگی‌های کاربردی AirPods 5، امکان شارژ سریع است. طبق مشخصات اپل، قرار دادن گوشی‌ها به مدت پنج دقیقه در کیس شارژ می‌تواند حدود یک ساعت زمان پخش موسیقی در اختیار کاربر قرار دهد. این ویژگی زمانی اهمیت دارد که شارژ هدفون کم باشد و کاربر برای خروج از منزل یا برقراری تماس به‌سرعت به آن نیاز داشته باشد.
کیس شارژ از درگاه USB-C برای شارژ استفاده می‌کند. این موضوع امکان استفاده از کابل‌های USB-C سازگار را فراهم می‌کند و برای کاربرانی که از محصولات جدیدتر اپل یا سایر دستگاه‌های دارای این درگاه استفاده می‌کنند، کاربردی است. با توجه به طراحی جمع‌وجور کیس، حمل آن در طول روز آسان است و کاربر می‌تواند در فواصل مختلف، گوشی‌ها را داخل کیس قرار دهد تا شارژ شوند. بااین‌حال، تفاوت میان شارژدهی اسمی و شارژدهی واقعی را باید در نظر گرفت؛ عواملی مانند میزان صدا، نوع محتوا، وضعیت حذف نویز و شرایط اتصال می‌توانند بر مدت زمان استفاده تأثیر بگذارند. در مجموع، شارژدهی AirPods 5 با کیس برای استفاده‌های کوتاه و روزمره طراحی شده است و امکان شارژ سریع، بخشی از محدودیت زمان استفاده مداوم را جبران می‌کند.

قابلیت‌های اختصاصی و امکانات هوشمند
AirPods 5 علاوه بر قابلیت‌های اصلی مربوط به پخش صدا و مکالمه، از مجموعه‌ای از امکانات هوشمند و صوتی اختصاصی اپل بهره می‌برد. یکی از این قابلیت‌ها، صدای فضایی شخصی‌سازی‌شده با رهگیری حرکات سر است که می‌تواند تجربه تماشای فیلم و گوش دادن به محتوای سازگار را فراگیرتر کند. فناوری Adaptive EQ نیز یکی از امکانات صوتی مهم این مدل است. این فناوری با توجه به شرایط قرارگیری هدفون در گوش، تنظیمات صدا را تغییر می‌دهد تا تجربه شنیداری متعادل‌تری ایجاد شود. قابلیت Voice Isolation برای بهبود وضوح صدای کاربر در مکالمه کاربرد دارد و Conversation Awareness نیز هنگام صحبت‌کردن، تنظیمات شنیداری را تغییر می‌دهد تا تعامل با افراد اطراف ساده‌تر شود. AirPods 5 به قابلیت Live Listen نیز مجهز است. این ویژگی در دستگاه‌های سازگار اپل می‌تواند صدای دریافت‌شده از میکروفون آیفون یا آیپد را به هدفون منتقل کند و در برخی موقعیت‌ها برای شنیدن بهتر صداهای اطراف کاربرد داشته باشد. همچنین امکاناتی مانند Headphone Accommodations به کاربران اجازه می‌دهند برخی تنظیمات صوتی را متناسب با نیازهای شنیداری خود شخصی‌سازی کنند.
یکی دیگر از قابلیت‌های جدید این خانواده، پشتیبانی از ترجمه هم‌زمان مکالمات یا Live Translation است. بااین‌حال، استفاده از این ویژگی به دستگاه سازگار، نسخه سیستم‌عامل، زبان‌های پشتیبانی‌شده و شرایط نرم‌افزاری موردنیاز وابسته است و ممکن است در همه کشورها یا برای تمام زبان‌ها در دسترس نباشد. پشتیبانی از Siri و امکانات تعاملی آن نیز بخشی از تجربه هوشمند AirPods 5 محسوب می‌شود. کاربران می‌توانند از طریق فرمان صوتی به برخی قابلیت‌های گوشی دسترسی داشته باشند و در شرایط مشخص، با حرکات سر به درخواست‌های Siri پاسخ دهند. در بخش مقاومت نیز استاندارد IP57، AirPods 5 را برای استفاده روزمره در شرایطی که احتمال تماس با عرق یا گردوغبار وجود دارد، مناسب‌تر می‌کند. البته این استاندارد جایگزین مراقبت معمول از هدفون در برابر رطوبت و آسیب‌های فیزیکی نیست. در مجموع، مجموعه امکانات هوشمند AirPods 5 نشان می‌دهد که این محصول تنها برای پخش موسیقی طراحی نشده است و بخش قابل‌توجهی از تجربه آن به هماهنگی با سیستم‌عامل و سایر محصولات اپل وابسته است.

جمع‌بندی
AirPods 5 با کیس شارژ معمولی، هدفونی سبک و نیمه‌باز است که تلاش می‌کند میان راحتی استفاده، کیفیت صدای متعادل و امکانات پیشرفته اپل تعادل برقرار کند. وزن پایین گوشی‌ها، طراحی بدون سری سیلیکونی و ابعاد جمع‌وجور کیس، استفاده از این محصول را برای فعالیت‌های روزمره ساده می‌کند. در کنار این موارد، پشتیبانی از حذف نویز فعال، حالت شفافیت، صدای فضایی شخصی‌سازی‌شده و فناوری‌های بهبود مکالمه، مجموعه‌ای کامل از امکانات صوتی را در اختیار کاربر قرار می‌دهد. کیفیت تجربه شنیداری این هدفون به‌ویژه برای افرادی که به صدای متعادل، وضوح مناسب و راحتی طولانی‌مدت اهمیت می‌دهند، قابل‌توجه است. البته طراحی نیمه‌باز باعث می‌شود میزان عایق‌سازی طبیعی صدا و شدت بیس، تا حدی به فرم گوش کاربر وابسته باشد. به همین دلیل، افرادی که به حذف کامل صداهای محیطی یا بیس بسیار عمیق علاقه دارند، باید این موضوع را در نظر بگیرند.
در بخش باتری، شارژدهی چهار ساعته با فعال‌بودن حذف نویز و مجموع ۲۰ ساعت استفاده با کمک کیس، برای استفاده‌های معمولی قابل‌قبول است؛ هرچند برای گوش دادن مداوم و طولانی‌مدت، ممکن است نیاز به شارژ مجدد وجود داشته باشد. درگاه USB-C و قابلیت شارژ سریع نیز استفاده روزمره را آسان‌تر می‌کنند. در نهایت، AirPods 5 با کیس شارژ معمولی محصولی است که بیشترین امکانات خود را در کنار دستگاه‌های اپل ارائه می‌دهد. هماهنگی با اکوسیستم اپل، امکانات هوشمند و طراحی سبک، بخش مهمی از تجربه استفاده از آن را شکل می‌دهند؛ درحالی‌که نبود شارژ بی‌سیم و برخی تفاوت‌های کنترلی با نسخه مجهز به کیس شارژ وایرلس، آن را از مدل دیگر این خانواده متمایز می‌کند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('music-apollo-yop-39', 'music-apollo-yop-39', 'هدفون بلوتوثی موزیک آپولو مدل YOP-39', 'Music Apollo YOP-39 Wireless Bluetooth Earbuds', 'Music Apollo', 'audio', 2200000, 3700000, 41, true, 10, true, 'سرویس ویژه دیجی کالا: 7 روز تضمین بازگشت کالا', '5.0', 3, '{"display":"کیس نگهداری پلی‌کربنات","displayDetails":"پشتیبانی از شارژ وایرلس کیس","chipset":"بلوتوث نسخه ۵.۵","chipsetDetails":"برد ۱۰ متر · درایور ۱۰ میلی‌متری","camera":"کنترل لمسی موسیقی و ولوم","cameraDetails":"میکروفون داخلی مکالمه","battery":"۳۰۰ میلی‌آمپر ساعت کیس","batteryDetails":"۴.۵ ساعت پخش موسیقی · شارژ USB-C","storageDefault":"بلوتوث ۵.۵","ram":"۳۲ اهم","os":"سازگار با اندروید و iOS"}', '[{"label":"نسخه استاندارد","subtitle":"بلوتوث ۵.۵ · شارژ سریع","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/c63b64b2f85da5d4d6e11bdb7ca37b3a8993b37e_1793363639.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۴۱٪ تخفیف · اقتصادی', 98, true, false, 38, 38, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/c63b64b2f85da5d4d6e11bdb7ca37b3a8993b37e_1793363639.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/30ba22b18b77ab8cd90e92442aeeb49ad55ccf0b_1793363639.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/2c99788dc6b145c91e42d913bccc71dc0908bd1f_1793363639.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4ebed824af34d611f742a49a0aaa47f92cf3ac14_1793363649.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/5624732a3ac783f5c47827f07a72924ebd97b20a_1793363658.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f6d93b542fae1340a445ae715bd4dadd613c2419_1793363659.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8a1915faa3fe5baf8405b675af5eb9f1c82cc58c_1793363659.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b8236b3b7b04021cefbed522842a162cad861f39_1793363665.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-23096703"},{"label":"پاسخ فرکانسی","value":"۲۰ تا ۲۰۰۰۰ هرتز · حساسیت ۱۱۰ دسی‌بل"},{"label":"مقاومت فیزیکی","value":"مقاوم در برابر رطوبت و عرق"}]', '2026-11-24 19:25:00+00', 'Music Apollo YOP-39', 'موزیک آپولو YOP-39 برای کاربری روزمره طراحی شده تا یک تجربه شنیداری بی‌سیم، سبک و ساده در استفاده ارائه دهد. اتصال بلوتوث 5.5 در کنار پشتیبانی از همه گوشی‌ها و تبلت‌ها، استفاده از آن را در موقعیت‌های مختلف آسان می‌کند و کنترل لمسی هم مدیریت پخش و تماس را سریع‌تر می‌سازد. صدای فراگیر، میکروفون داخلی، این مدل را به گزینه‌ای مناسب برای مکالمه، موسیقی و استفاده در رفت‌وآمد تبدیل کرده است.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'music-apollo', 'audio', 'موزیک آپولو YOP-39 برای کاربری روزمره طراحی شده تا یک تجربه شنیداری بی‌سیم، سبک و ساده در استفاده ارائه دهد. اتصال بلوتوث 5.5 در کنار پشتیبانی از همه گوشی‌ها و تبلت‌ها، استفاده از آن را در موقعیت‌های مختلف آسان می‌کند و کنترل لمسی هم مدیریت پخش و تماس را سریع‌تر می‌سازد. صدای فراگیر، میکروفون داخلی، این مدل را به گزینه‌ای مناسب برای مکالمه، موسیقی و استفاده در رفت‌وآمد تبدیل کرده است. بدنه پلی‌کربنات، مقاومت در برابر رطوبت و عرق، و کیس نگهدارنده همراه با شارژ USB Type-C و شارژر وایرلس، تصویر یک هندزفری جمع‌وجور و آماده استفاده را کامل می‌کنند. باتری قابل شارژ با ظرفیت 300 میلی‌آمپر ساعت و شارژ سریع هم خیال کاربر را از بابت استفاده طولانی‌تر راحت‌تر می‌کند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('anker-soundcore-r50i-a3949', 'anker-soundcore-r50i-a3949', 'هدفون بلوتوثی انکر مدل SoundCore R50i A3949 بدون قابلیت نویز کنسلینگ، درگاه شارژ USB Type-C، دارای فناوری AI-Enhanced Calls برای کاهش نویز و بهبود مکالمات، مقاوم در برابر رطوبت و عرق', 'Anker SoundCore R50i A3949 Wireless Earbuds', 'Anker', 'audio', 2899000, 3600000, 19, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.4', 43801, '{"display":"کیس بنددار سبک و مقاوم","displayDetails":"پشتیبانی از اپلیکیشن Soundcore","chipset":"بلوتوث ۵.۳ + پردازش AI-Clear","chipsetDetails":"درایور ۱۰ میلی‌متری Bass-Up EQ","camera":"۲ میکروفون شفافیت مکالمه","cameraDetails":"کنترل لمسی قابل شخصی‌سازی","battery":"۱۰ ساعت گوشی · ۳۰ ساعت با کیس","batteryDetails":"شارژ سریع (۱۰ دقیقه = ۲ ساعت پخش)","storageDefault":"USB Type-C","ram":"IPX5","os":"سازگار با اندروید و iOS"}', '[{"label":"نسخه استاندارد","subtitle":"اپلیکیشن Soundcore · ۲۲ اکولایزر","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"},{"id":"blue-2","hex":"#0000FF","name":"آبی"},{"id":"navy-3","hex":"#002171","name":"سرمه ای"},{"id":"white-4","hex":"#FFFFFF","name":"سفید"},{"id":"color-89-5","hex":"#d5f2ff","name":"آبی یخی"},{"id":"pink-6","hex":"#ffc0cb","name":"صورتی"},{"id":"color-43-7","hex":"#aee9fc","name":"آبی روشن"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/98bb110cefc58dcc0ed96eff8914c2bb3d48d318_1786533653.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۱۹٪ تخفیف · پرفروش‌ترین', 89, true, true, 39, 39, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/98bb110cefc58dcc0ed96eff8914c2bb3d48d318_1786533653.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9633f06f7cd83fb9b8d2ae882b06bd398ee60c4c_1790021321.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/487620e2936e1dd07238849a058fe472da39c1a5_1745824997.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e1d3c31cc45d02ed2cfe382a5668c7ce133cb78a_1764186069.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/3dbad9f94e8174f2faef6525499da934507b130f_1687860325.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/ac2fb6afbf76b98fcb420e0de68f3ddb1d7e9b96_1687860325.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/89d9877e6501a92cbb1f6cf34f8bdaf86aceb445_1687860325.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/fe442eae9d85df1e49e3e0773ad07280e507c7f3_1687860325.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-11801878"},{"label":"اقلام همراه","value":"کابل شارژ USB-C، سری سیلیکونی اضافه و بند"},{"label":"فناوری صوتی","value":"Bass-Up EQ با ۲۲ حالت اکولایزر"}]', '2026-11-24 19:25:00+00', 'SoundCore R50i A3949', 'بدون هیچ تردیدی شرکت انکر یکی از برترین شرکت‌های فعال در حوزه‌ی لوازم جانبی از جمله هدفون‌ها است و محصولات این شرکت به دلیل کیفیت ساخت بسیار بالای خود زبانزد هستند. علاوه بر این، هدفون‌های بی‌سیم سری SoundCore این شرکت هم از طرفداران بسیاری برخوردار هستند و کیفیت بسیار بالای آن‌ها مدت‌ها است که خریداران را جذب خود می‌کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'anker', 'audio', 'بررسی هدفون بلوتوثی انکر SoundCore R50i A3949
هدفون بی‌سیم انکر SoundCore R50i یکی از محصولات برتر برند انکر است که با ویژگی‌های منحصر به فرد خود، تجربه‌ای بی‌نظیر از موسیقی و مکالمه را برای کاربران فراهم می‌کند. این هدفون با طراحی مدرن و امکانات پیشرفته، توجه بسیاری از علاقه‌مندان به صدا و موسیقی را به خود جلب کرده است. در این مقاله، به بررسی کامل این هدفون می‌پردازیم.

طراحی و ساخت
هدفون بلوتوثی انکر SoundCore R50i با طراحی زیبا و ارگونومیک خود، به راحتی در گوش قرار می‌گیرد و استفاده طولانی مدت از آن بدون ایجاد خستگی امکان‌پذیر است. این هدفون از مواد با کیفیت بالا ساخته شده که دوام و مقاومت آن را تضمین می‌کند. وزن سبک و اندازه کوچک آن باعث می‌شود تا به راحتی قابل حمل باشد و بتوانید آن را در هر جایی با خود ببرید.

کاور انکر SoundCore R50i
شما می‌توانید برای هدفون SoundCore R50i کاور ایمنی ویژه‌ای به صورت جداگانه تهیه کنید که طراحی شده است تا حفاظت بیشتری را برای هدفون‌ها فراهم کند. این کاور ایمنی با استفاده از مواد با کیفیت و مقاوم ساخته شده است که می‌تواند در برابر ضربه‌ها، خراش‌ها و سایر آسیب‌های فیزیکی مقاومت کند.

کیفیت صدا
یکی از مهم‌ترین ویژگی‌های هر هدفون، کیفیت صدای آن است. انکر SoundCore R50i A3949 با درایورهای پویا 10 میلی‌متری خود، صدایی با کیفیت بالا و باس عمیق ارائه می‌دهد. این هدفون با تکنولوژی‌های پیشرفته صوتی، جزئیات صدا را به خوبی منتقل می‌کند و تجربه‌ای غنی و واقعی از موسیقی را برای کاربران فراهم می‌کند. همچنین، این هدفون از تکنولوژی Hi-Res Audio پشتیبانی می‌کند که باعث می‌شود صدا با دقت و وضوح بیشتری پخش شود.

عمر باتری و شارژ
ایرپادR50i با باتری قدرتمند خود، تا 10 ساعت پخش مداوم موسیقی را پشتیبانی می‌کند. این میزان عمر باتری برای استفاده روزانه کافی است و نیاز به شارژ مکرر را کاهش می‌دهد. همچنین، با استفاده از کیس شارژ همراه، می‌توانید تا 30 ساعت زمان پخش اضافی داشته باشید. کیس شارژ این هدفون از طریق پورت USB-C شارژ می‌شود که سرعت بالایی در شارژ کردن دارد.

ویژگی‌های هوشمند
هدفون انکر دارای قابلیت‌های هوشمندی مانند کنترل لمسی است که به کاربران امکان می‌دهد تا به راحتی موسیقی را پخش یا متوقف کنند، تماس‌ها را پاسخ دهند و یا به دستیار صوتی گوشی خود دسترسی پیدا کنند. همچنین، این هدفون با اپلیکیشن SoundCore سازگار است که از طریق آن می‌توانید تنظیمات مختلفی مانند اکولایزر را به دلخواه خود تغییر دهید.

مقاومت در برابر آب و عرق
هدفون انکر SoundCore R50i A3949 دارای استاندارد مقاومت در برابر آب و عرق IPX5 است. این ویژگی باعث می‌شود تا این هدفون برای استفاده در هنگام ورزش و فعالیت‌های بیرونی بسیار مناسب باشد و نگرانی از خرابی در برابر عرق یا باران نداشته باشید.

اتصالات و سازگاری
این هدفون بی‌سیم با بلوتوث نسخه 5.0 به دستگاه‌های مختلف متصل می‌شود که اتصال پایدار و بدون قطعی را تضمین می‌کند. همچنین، این هدفون با اکثر دستگاه‌های بلوتوثی مانند گوشی‌های هوشمند، تبلت‌ها و لپ‌تاپ‌ها سازگار است و به راحتی می‌توانید آن را به دستگاه‌های خود متصل کنید.

قیمت و ارزش خرید
با توجه به ویژگی‌ها و امکانات پیشرفته‌ای که انکر SoundCore R50i A3949 ارائه می‌دهد، قیمت بی‌سیم SoundCore R50i نسبت به سایر هدفون‌های هم‌رده بسیار مناسب است. این هدفون با کیفیت ساخت بالا و عملکرد عالی، ارزش خرید بالایی دارد و می‌تواند انتخابی مناسب برای کسانی باشد که به دنبال یک هدفون بی‌سیم با کیفیت هستند.

تکنولوژی کاهش نویز محیطی (ENC)
هدفون انکر SoundCore R50i A3949 با بهره‌گیری از تکنولوژی کاهش نویز محیطی (ENC) در میکروفون‌ها، کیفیت تماس‌های صوتی را بهبود می‌بخشد. این تکنولوژی باعث می‌شود تا صداهای مزاحم اطراف کاهش یافته و صدای شما به صورت واضح‌تری منتقل شود.

پشتیبانی از کدک‌های صوتی پیشرفته
این هدفون از کدک‌های صوتی پیشرفته مانند AAC و SBC پشتیبانی می‌کند. این کدک‌ها کیفیت صدای بالاتری را ارائه می‌دهند و تجربه شنیداری بهتری را برای کاربران فراهم می‌کنند.

حالت بازی (Gaming Mode)
هدفون انکر SoundCore R50i A3949 دارای حالت بازی (Gaming Mode) است که تاخیر صدا را به حداقل می‌رساند. این ویژگی برای گیمرها بسیار مناسب است، زیرا هماهنگی بین صدا و تصویر در بازی‌های ویدئویی بسیار مهم است.

قابلیت شارژ سریع
هدفون بلوتوثی SoundCore R50i A3949 با قابلیت شارژ سریع، تنها با 10 دقیقه شارژ می‌تواند تا 1 ساعت پخش موسیقی را پشتیبانی کند. این ویژگی برای مواقعی که نیاز به استفاده فوری از هدفون دارید، بسیار مفید است.

اتصالات چندگانه
هدفون انکر SoundCore R50i A3949 امکان اتصال به دو دستگاه به صورت همزمان را دارد. این قابلیت به شما اجازه می‌دهد تا به راحتی بین دستگاه‌های مختلف سوئیچ کنید، مثلاً بین گوشی هوشمند و لپ‌تاپ.

شخصی‌سازی صدا
با استفاده از اپلیکیشن SoundCore، کاربران هدفون بلوتوثی SoundCore R50i A3949 می‌توانند تنظیمات صدای هدفون را بر اساس سلیقه خود شخصی‌سازی کنند. این اپلیکیشن امکاناتی مانند تنظیمات اکولایزر، ایجاد پروفایل‌های صوتی مختلف و به‌روزرسانی نرم‌افزاری هدفون را فراهم می‌کند.

نتیجه‌گیری
هدفون بی‌سیم انکر SoundCore R50i A3949 با طراحی شیک، کیفیت صدای عالی و ویژگی‌های هوشمند، یکی از بهترین گزینه‌های موجود در بازار است. این هدفون با عمر باتری طولانی و مقاومت در برابر آب، می‌تواند همراهی مناسب برای فعالیت‌های روزمره و ورزشی شما باشد. اگر به دنبال یک هدفون بی‌سیم با کیفیت و قیمت مناسب هستید، انکر SoundCore R50i A3949 انتخابی ایده‌آل خواهد بود.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('qcy-t13-anc-2', 'qcy-t13-anc-2', 'هدفون بلوتوثی برند کیو سی وای مدل T13 ANC2 با نویز کنسلینگ فعال (ANC)، نویز کنسلینگ میکروفون (ENC) و پخش صدای محیطی (Transparency)، درگاه شارژ USB Type-C، با قابلیت اتصال به چند دستگاه، کنترل لمسی، مقاوم در برابر آب و گردوغبار', 'QCY T13 ANC 2 Wireless Earbuds Active Noise Cancelling', 'QCY', 'audio', 3390000, NULL, 0, true, 10, true, 'گارانتی 18 ماهه آگرین ارتباطات ایرانیان', '4.5', 14697, '{"display":"کیس سبک ۴۴ گرمی TWS","displayDetails":"سری‌های آنتی‌باکتریال + اپ QCY","chipset":"بلوتوث ۵.۳ · حالت گیمینگ ۶۸ms","chipsetDetails":"ANC فعال ۲۸dB + ۴ میکروفون ENC","camera":"حالت Transparency صدای محیطی","cameraDetails":"درایور ۱۰ میلی‌متری داینامیک","battery":"۳۸۰ میلی‌آمپر ساعت کیس","batteryDetails":"تا ۳۰ ساعت شارژدهی (۲۲ ساعت با ANC)","storageDefault":"USB Type-C","ram":"۶۸ms تاخیر","os":"سازگار با اندروید و iOS"}', '[{"label":"نسخه ANC 2","subtitle":"۴ میکروفون ENC · تاخیر ۶۸ms","priceDelta":0}]', '[{"id":"white-1","hex":"#FFFFFF","name":"سفید"},{"id":"black-2","hex":"#000000","name":"مشکی"},{"id":"navy-3","hex":"#002171","name":"سرمه ای"},{"id":"pearl-white-4","hex":"#f3f3f3","name":"سفید صدفی"},{"id":"gloss-black-5","hex":"#090000","name":"مشکی براق"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/04b17a7c2be3a34d44411f0e99e1b011e6d981f8_1786533654.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'سفید', 'حذف نویز ۲۸ دسی‌بل', 90, false, true, 40, 40, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/04b17a7c2be3a34d44411f0e99e1b011e6d981f8_1786533654.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/d26afe95bf59295de73912e84886e4df948e81af_1790021322.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8b1c3923baf6b188ca0c9db972b30d854edfb880_1745825007.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1f5c65bc364fa45afc2f558260836788fa56dc58_1699442213.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b774cc957b0a4bc90c355a4a69785c0b08395da1_1714901922.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e7f9fee0e577c0a34c3cfe8f0d48c603a78a5193_1714901923.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/f0966eae4e06cba21e09af1bda46327b62f66879_1699442213.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/e3cb75f9f42d2852a3922f408b2547703ceaa11c_1699442213.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-13287099"},{"label":"وزن و ابعاد","value":"۴۴ گرم · مقاوم در برابر آب و گردوغبار"},{"label":"اتصال همزمان","value":"پشتیبانی از اتصال چند دستگاه (Multipoint)"}]', '2026-11-24 19:25:00+00', 'QCY T13 ANC 2', 'در عصر حاضر، هدفون‌های بلوتوثی نقش بی‌بدیلی در زندگی روزمره ما ایفا می‌کنند. این محصولات نه تنها به ما امکان لذت بردن از موسیقی با کیفیت عالی را می‌دهند، بلکه همچنین به‌عنوان ابزاری ضروری برای برقراری ارتباط صوتی نیز به‌کار می‌روند. در میان این هدفون‌های پرطرفدار، مدل T13 ANC 2 کیو سی وای به‌عنوان یکی از برترین گزینه‌ها در بازار شناخته می‌شود.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'qcy', 'audio', 'بررسی هدفون بلوتوثی کیو سی وای مدل T13 ANC 2
امروزه، هدفون‌های بلوتوثی نقش مهمی در زندگی روزمره ما ایفا می‌کنند. آنها نه تنها به ما امکان لذت بردن از موسیقی با کیفیت بالا را می‌دهند، بلکه به‌عنوان ابزاری برای برقراری ارتباط نیز به‌کار می‌روند. در میان این هدفون‌های پرطرفدار، هدفون بلوتوثی T13 ANC 2 کیو سی وای به‌عنوان یکی از برترین گزینه‌های موجود در بازار شناخته می‌شود. با قابلیت کنترل فعال نویز (ANC)، طراحی زیبا و ساختار محکم، این هدفون توانسته نظر کاربران بسیاری را به‌خود جلب کند.

کیو سی وای یک برند پیشرو در تولید لوازم جانبی و صوتی الکترونیکی است که سال‌هاست در این حوزه فعالیت می‌کند. این شرکت با ارائه محصولاتی با کیفیت بالا و طراحی مدرن، توانسته جایگاه ویژه‌ای در بازار به‌دست آورد. هدفون‌های بلوتوثی کیو سی وای به‌دلیل برخورداری از ویژگی‌هایی همچون صدای با کیفیت، عمر باتری طولانی و امکانات پیشرفته، به‌سرعت محبوبیت پیدا کرده‌اند. نام این برند به‌عنوان یکی از برترین تولیدکنندگان هدفون‌های بلوتوثی در جهان شناخته می‌شود.

جمع‌ بندی
هدفون بلوتوثی T13 ANC 2 کیو سی وای، یک محصول برتر در بازار هدفون‌های بی‌سیم است که با ویژگی‌های منحصربه‌فرد خود توانسته نظر بسیاری از کاربران را به‌خود جلب کند. قابلیت کنترل فعال نویز (ANC)، طراحی ارگونومیک، عمر باتری طولانی و امکان اتصال چند دستگاهی از جمله ویژگی‌های برجسته این هدفون هستند.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('xiaomi-redmi-buds-6-play', 'xiaomi-redmi-buds-6-play', 'هدفون بلوتوثی شیائومی مدل Redmi Buds 6 Play با نویز کنسلینگ میکروفون (ENC)، درگاه شارژ USB Type-C، با قابلیت اتصال به چند دستگاه، دارای تکنولوژی صدای 360، دارای قابلیت شارژ سریع، مقاوم در برابر پاشش آب (IPX4)', 'Xiaomi Redmi Buds 6 Play Wireless Earbuds', 'Xiaomi', 'audio', 2595400, 3024600, 14, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.3', 2875, '{"display":"وزن کیس تنها ۴۰ گرم","displayDetails":"هر گوشی بسیار سبک ۳.۶ گرم · IPX4","chipset":"بلوتوث ۵.۴ · صدای ۳۶۰ درجه","chipsetDetails":"حذف نویز مکالمه هوش مصنوعی (ENC)","camera":"اتصال سریع و چنددستگاهی","cameraDetails":"پاسخ فرکانسی ۲۰ تا ۲۰۰۰۰ هرتز","battery":"تا ۳۶ ساعت شارژدهی کل","batteryDetails":"گوشی‌ها ۵۷mAh · فست شارژ USB-C","storageDefault":"USB Type-C","ram":"IPX4","os":"سازگار با اندروید و iOS"}', '[{"label":"نسخه استاندارد","subtitle":"بلوتوث ۵.۴ · حذف نویز مکالمه ENC","priceDelta":0}]', '[{"id":"blue-1","hex":"#0000FF","name":"آبی"},{"id":"black-2","hex":"#000000","name":"مشکی"},{"id":"pink-3","hex":"#ffc0cb","name":"صورتی"},{"id":"white-4","hex":"#FFFFFF","name":"سفید"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/136c80ee8c3938e81d5554a95388058fdb399303_1786571886.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'آبی', '۱۴٪ تخفیف · ۳۶ ساعت باتری', 86, false, true, 41, 41, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/136c80ee8c3938e81d5554a95388058fdb399303_1786571886.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/de9ac03d590beef7d031c5fc57cebca2c1110eba_1790022633.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/c42de26bce7964367d48b1c31d13e5fa1e7fd921_1745827640.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7dd9861e3ac41eff711f596dc46b88c62ca6fce8_1739967477.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/eb373687c1f5e5e32fca41bd86f5e4cc006149d8_1731410715.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8cb49cf289a442498ffb6fb9f454e13a6eef65b2_1731410715.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/00e6fdd17dfe4a1823c670d70c62a6c712d5b015_1731410715.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/1ec08973f3561db543a0253e604e3766f8cd8a68_1731410715.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-17361639"},{"label":"ابعاد و وزن","value":"۵۳.۹×۵۳.۹×۲۷.۴ میلی‌متر · ۴۰ گرم"},{"label":"مقاومت فیزیکی","value":"مقاوم در برابر پاشش آب (IPX4)"}]', '2026-11-24 19:25:00+00', 'Redmi Buds 6 Play', 'هدفون بلوتوثی شیائومی مدل Redmi Buds 6 Play یک هندزفری توگوشی دوگوشی برای کاربری عمومی است که از اتصال بی‌سیم از طریق بلوتوث بهره می‌برد. نسخه بلوتوث 5.4 و محدوده عملکرد تا 10 متر، امکان استفاده بی‌سیم در فاصله مناسب از دستگاه متصل را فراهم می‌کند. این هدفون به میکروفون با فناوری حذف نویز محیطی ENC مجهز است و از تکنولوژی صدای 360 نیز پشتیبانی می‌کند.', true, false, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'xiaomi', 'audio', 'هدفون بلوتوثی شیائومی مدل Redmi Buds 6 Play یک هندزفری توگوشی دوگوشی برای کاربری عمومی است که از اتصال بی‌سیم از طریق بلوتوث بهره می‌برد. نسخه بلوتوث 5.4 و محدوده عملکرد تا 10 متر، امکان استفاده بی‌سیم در فاصله مناسب از دستگاه متصل را فراهم می‌کند. این هدفون به میکروفون با فناوری حذف نویز محیطی ENC مجهز است و از تکنولوژی صدای 360 نیز پشتیبانی می‌کند. Redmi Buds 6 Play با پاسخ فرکانسی 20 تا 20000 هرتز و امپدانس 16 اهم، برای پخش محتوای صوتی روزمره طراحی شده است. عمر باتری آن تا 36 ساعت اعلام شده و قابلیت شارژ سریع، استفاده مجدد در زمان کوتاه‌تر را ممکن می‌کند. شارژ دستگاه به‌صورت باسیم و از طریق درگاه USB Type-C انجام می‌شود. مقاومت در برابر پاشش آب با استاندارد IPX4، استفاده از آن را در شرایط همراه با پاشش محدود آب امکان‌پذیر می‌کند. وزن هر هدفون 3.6 گرم و وزن کلی محصول 40 گرم است. گوش‌گیرهایی در سایزهای مختلف و دفترچه راهنما نیز همراه آن ارائه می‌شود. این محصول برای گوش‌دادن به موسیقی، تماشای محتوای صوتی و مکالمه روزمره گزینه‌ای کاربردی است.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('nothing-cmf-buds-pro-2', 'nothing-cmf-buds-pro-2', 'هندزفری بلوتوثی ناتینگ مدل CMF Buds Pro 2 با نویز کنسلینگ فعال (ANC)، درگاه شارژ USB Type-C، دارای میکروفون سه‌گانه با قابلیت حذف صدای باد، مقاوم در برابر رطوبت و عرق (IP55)', 'Nothing CMF Buds Pro 2 ANC Wireless Earbuds', 'Nothing', 'audio', 9765300, 11488500, 15, true, 10, true, 'گارانتی 18 ماهه شرکتی', '4.6', 1319, '{"display":"کیس هوشمند با کنترلگر چرخان","displayDetails":"نشانگر LED · استاندارد IP55","chipset":"ANC + ENC سه‌گانه ضدباد","chipsetDetails":"درایور ۱۱ میلی‌متری باکیفیت · Transparency","camera":"۳ میکروفون HD در هر گوشی","cameraDetails":"فرمان لمسی و اتصال دو دستگاه همزمان","battery":"۴۶۰ میلی‌آمپر ساعت کیس","batteryDetails":"۶.۵ ساعت پخش موسیقی (۴.۸ ساعت مکالمه)","storageDefault":"USB Type-C","ram":"IP55","os":"اپلیکیشن Nothing X (اندروید و iOS)"}', '[{"label":"نسخه Pro 2","subtitle":"درایور ۱۱mm · حذف نویز سه‌میکروفونه","priceDelta":0}]', '[{"id":"black-1","hex":"#000000","name":"مشکی"},{"id":"blue-2","hex":"#0000FF","name":"آبی"},{"id":"green-3","hex":"#008000","name":"سبز"},{"id":"white-4","hex":"#FFFFFF","name":"سفید"},{"id":"gray-5","hex":"#9E9E9E","name":"خاکستری"},{"id":"light-gray-6","hex":"#e5e5e5","name":"طوسی روشن"},{"id":"dark-gray-7","hex":"#4D4D4D","name":"طوسی تیره"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/58a6fea69ca632602b002ce76322dd8861e661f2_1786533657.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'مشکی', '۱۵٪ تخفیف · درایور دوگانه', 93, true, true, 42, 42, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/58a6fea69ca632602b002ce76322dd8861e661f2_1786533657.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/7b2002077041e41735c2da14296cd297b133a82e_1745827630.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/25741cb0935aac46060010367bfc367351d81800_1720622492.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/9c0728e136cd3647013a929d8e85fd0f3a84d042_1720622481.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/4f543dcc98615271a284cd8a59d9b195963d012a_1720623382.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/85cc7824a2f5ffd989df3950147325af990a5ac6_1720622493.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/b1117473f8921c8611ca09731865498ed12da1b3_1720622481.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/8aa5ab70ef1b8d62619b08d5b9c1b9e85738e811_1720622501.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-16029106"},{"label":"حذف نویز","value":"ANC فعال + ENC حذف صدای باد + حالت Transparency"},{"label":"مقاومت فیزیکی","value":"ضد رطوبت و عرق با استاندارد IP55"}]', '2026-11-24 19:25:00+00', 'CMF Buds Pro 2', 'طبق اعلام کمپانی ناتینگ، از تاریخ 15 مه 2025 (25 اردیبهشت 1404) به بعد، کابل USB-C از بسته بندی کالا حذف شده است و کالا به صورت بدون کابل عرضه می‌شود.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'nothing', 'audio', 'طبق اعلام کمپانی ناتینگ، از تاریخ 15 مه 2025 (25 اردیبهشت 1404) به بعد، کابل USB-C از بسته بندی کالا حذف شده است و کالا به صورت بدون کابل عرضه می‌شود.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;

INSERT INTO public.products (id, slug, name_fa, name_en, brand, category, price, original_price, discount_percent, in_stock, stock_count, express_delivery, warranty, rating, review_count, specs, storage_options, colors, created_at, image_url, color_label, badge_text, recommend_percent, is_featured_deal, is_popular, sales_rank, release_order, updated_at, images, custom_specs, price_updated_at, model_name, description_fa, is_published, is_featured, warranty_id, brand_id, category_id, editorial_review) VALUES ('apple-airpods-pro-3', 'apple-airpods-pro-3', 'هدفون بلوتوثی اپل مدل AirPods Pro 3 با نویز کنسلینگ فعال، قابلیت پخش صدای محیطی، عمر باتری 10 ساعت، مقاوم در برابر رطوبت و عرق', 'Apple AirPods Pro 3 Active Noise Cancelling Wireless Earbuds', 'Apple', 'audio', 53899000, 55000000, 2, true, 2, true, 'گارانتی 18 ماهه -شرکتی', '4.5', 621, '{"display":"کیس شارژ هوشمند با نشانگر LED","displayDetails":"مقاوم در برابر تعریق و رطوبت","chipset":"تراشه صوتی اپل · ANC پیشرفته","chipsetDetails":"حالت Transparency · اتصال چند دستگاه","camera":"میکروفون‌های Dual Beamforming","cameraDetails":"کنترل لمسی دقیق + دستیار صوتی Siri","battery":"۱۰ ساعت گوشی · ۲۴ ساعت با کیس","batteryDetails":"همراه با ۵ سایز سری گوشی سیلیکونی","storageDefault":"USB Type-C","ram":"ANC نسل ۳","os":"سازگار با iOS و اندروید"}', '[{"label":"نسخه Pro 3","subtitle":"۵ سایز سری سیلیکونی · USB-C","priceDelta":0}]', '[{"id":"white-1","hex":"#FFFFFF","name":"سفید"}]', '2026-11-24 19:25:00+00', 'https://dkstatics-public.digikala.com/digikala-products/c260af43bb31e5ca486bcd92f80df4c7b3e7cef4_1786571908.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90', 'سفید', 'جدیدترین نسل · ۱۰ ساعت باتری', 89, false, true, 43, 43, '2026-11-24 19:25:00+00', '["https://dkstatics-public.digikala.com/digikala-products/c260af43bb31e5ca486bcd92f80df4c7b3e7cef4_1786571908.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/efed8eafb77eda719a53648f46da4ce8d13e9a71_1757750677.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/cb4c37d8a3468a1afb8933021e18c039bb0fd807_1757750677.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/caac33fe1d4814252346a02462c586653a655a94_1757750677.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/32ec539a0bd9d86494cc0b8c96bd309069925d8e_1757750677.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6267cf5b0ad0908522b7961007a18a64332ad382_1757750676.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/04124e5d41c81efd92283bcf16ac325c164b77f5_1757750675.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90","https://dkstatics-public.digikala.com/digikala-products/6a46d4b03ef84c8db77711d25489c40ce6ce9f65_1757750676.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90"]', '[{"label":"کد مرجع دیجی‌کالا","value":"DKP-20422049"},{"label":"ابعاد کیس و گوشی","value":"گوشی: ۳۰.۹×۱۹.۲×۲۷ میلی‌متر · کیس: ۴۷.۲×۶۲.۲×۲۱.۸ میلی‌متر"},{"label":"اقلام همراه","value":"محفظه شارژ و ۵ جفت سری گوشی در ۵ سایز"}]', '2026-11-24 19:25:00+00', 'Apple AirPods Pro 3', 'ایرپادز اپل همیشه یکی از محبوب‌ترین هدفون‌های بازار بوده‌ است و اپل با معرفی سری سوم این هدفون محبوب سعی کرده تا دوباره جایگاه خود را در رده اول پرفروش‌ترین هدفون بی‌سیم بازار تمدید کند. Airpods Pro 3 از نظر طراحی تغییر چندانی با نسخه قبل نداشته و تنها مقداری تغییرات جزئی برای بهتر قرار گرفتن در گوش داشته است.', true, true, (SELECT id FROM public.warranties WHERE is_active = true ORDER BY duration_months DESC LIMIT 1), 'apple', 'audio', 'دنیای تکنولوژی همیشه منتظر است تا ببیند اپل با محبو‌ب‌ترین هدفون جهان چه می‌کند. سری Airpods Pro همواره معیاری برای سنجش کیفیت در بازار هدفون‌های بی‌سیم بوده است. اکنون با ورود Airpods Pro 3 به بازار، اپل بار دیگر تلاش کرده است تا استانداردهای جدیدی را تعریف کند. اگرچه در نگاه اول، زبان طراحی تغییر خیلی زیادی نداشته است، اما جادوی اصلی این محصول در زیر پوسته سفید و آشنای آن نهفته است؛ جایی که مهندسی صدا، قابلیت‌های سلامت‌محور و هوش مصنوعی با هم تلاقی پیدا می‌کنند. در این بررسی، جزء به جزء این محصول را موشکافی می‌کنیم تا ببینیم آیا این هدفون ارزش ارتقا دارد یا خیر.
زمانی که اپل نسل اول ایرپادز پرو را معرفی کرد، تمرکز صرفاً روی حذف نویز و کیفیت صدا بود. اما با گذشت چند سال و رسیدن به نسل سوم در سال ۲۰۲۵، فلسفه این محصول تغییر پیدا کرده است. Airpods Pro 3 دیگر فقط یک ابزار ساده برای شنیدن موسیقی نیست؛ بلکه به یک گجت چندمنظوره تبدیل شده که نقش دستیار سلامت، مترجم همزمان و یک سیستم شنوایی پیشرفته را ایفا می‌کند.
نکته‌ای که در همان ابتدای کار توجه کارشناسان را جلب کرد، ادعای جسورانه اپل مبنی بر بهبود دوبرابری سیستم حذف نویز (ANC) نسبت به نسل قبل و اضافه شدن سنسورهای پایش ضربان قلب بود. اما آیا این ادعاها در استفاده روزمره و محیط‌های واقعی نیز صادق هستند؟ در ادامه با بررسی دقیق بخش‌های مختلف، به این سوال پاسخ می‌دهیم.

طراحی و ارگونومی: کمال در جزئیات
اپل به ندرت دست به تغییر ترکیب برنده می‌زند. Airpods Pro 3 نیز از این قاعده مستثنی نیست و همچنان از همان زبان طراحی مینیمالیست و ساقه کوتاه (Stem) بهره می‌برد که به امضای این برند تبدیل شده است. با این حال، اگر با دقت بیشتری به آن نگاه کنید، متوجه تغییرات ظریفی خواهید شد که ارگونومی را به سطح جدید ارتقا داده‌اند.
بدنه گوشی‌ها همچنان از پلاستیک براق و باکیفیت ساخته شده است، اما انحنای بخش داخلی که درون گوش قرار می‌گیرد، با داده‌های هزاران اسکن گوش بازطراحی شده تا فشار کمتری به کانال گوش وارد کند. این تغییر شاید در استفاده کوتاه‌مدت محسوس نباشد، اما اگر عادت دارید ساعت‌ها موسیقی گوش دهید یا در جلسات آنلاین طولانی شرکت کنید، تفاوت را احساس خواهید کرد. حس «کپ شدن» یا گرفتگی گوش که در مدل‌های قدیمی‌تر شایع بود، در این نسل به لطف سیستم تهویه هوا (Vent System) جدید که فشار هوا را بین داخل و خارج گوش متعادل می‌کند. به حداقل رسیده است.
یکی از بزرگترین چالش‌های کاربران با هدفون‌های تو گوشی (In-Ear) پیدا کردن سایز مناسب سری سیلیکونی است. اپل در این نسل علاوه بر سایزهای استاندارد قبلی (XS, S, M, L) یک سایز جدید XXS را نیز به جعبه اضافه کرده است. این خبر فوق‌العاده‌ای برای کسانی است که کانال گوش بسیار باریکی دارند و همیشه با مشکل لق زدن یا افتادن ایرپاد مواجه بودند. کیفیت سیلیکون‌های استفاده شده نیز بهبود یافته و چسبندگی بهتری با پوست دارد که هم به ثبات هدفون کمک می‌کند و هم در ایزولاسیون غیرفعال صدا (Passive Isolation) موثر است.
کیس شارژ مگ‌سیف (MagSafe) نیز تغییرات جزئی اما مهمی داشته است. این کیس اکنون کمی کوچک‌تر و سبک‌تر از نسل دوم است. درگاه شارژ به طور کامل به USB-C استاندارد مجهز شده و اسپیکر تعبیه شده روی آن برای قابلیت Find My، صدایی بلندتر و واضح‌تر تولید می‌کند تا پیدا کردن کیس در اعماق کیف یا زیر مبل آسان‌تر باشد. همچنین استاندارد مقاومت در برابر آب و گرد و غبار IP57 هم برای گوشی‌ها و هم برای کیس در نظر گرفته شده خیالتان را در برابر تعریق شدید ورزش یا بارش باران راحت می‌کند.

کیفیت صدا: معماری آکوستیک نوین
قلب تپنده AirPods Pro 3، نسخه بهبود یافته تراشه H2 است که اکنون با یک معماری آکوستیک جدید هماهنگ شده است. اگرچه اپل همچنان از کدک‌های بلوتوثی رایج مانند AAC استفاده می‌کند و خبری از کدک‌های سنگین مثل LDAC نیست، اما مهندسی درایورها و آمپلی‌فایر داخلی به قدری دقیق انجام شده که خروجی نهایی شگفت‌انگیز است.
اولین چیزی که در هنگام پخش یک قطعه موسیقی با کیفیت متوجه می‌شوید، تفکیک سازهاست. درایورهای جدید با اعوجاج بسیار کم (Low-Distortion Drivers)، باعث شده‌اند تا حتی در ولوم‌های بالا، صدای خواننده شفاف و بدون نویز شنیده شود. بیس (Bass) در این نسل عمیق‌تر و پانچی‌تر شده است، اما نه به قیمت فدا کردن فرکانس‌‌های میانی (Mids). در ژانرهایی مانند جاز یا کلاسیک، صدای پیانو و گیتار با گرمی و جزئیات فراوان شنیده می‌شود. به نظر می‌رسد الگوریتم‌های «اکولایزر تطبیقی» (Adaptive EQ) اکنون با سرعت بیشتری عمل می‌کنند و با سنجش خروجی صدا در کانال گوش شما، فرکانس‌ها را در کسری از ثانیه تنظیم می‌کنند تا صدایی که می‌شنوید دقیقاً همان چیزی باشد که هنرمند قصد داشته است.
قابلیت Spatial Audio با ردیابی پویای سر، در Airpods Pro 3 به بلوغ رسیده است. تجربه تماشای فیلم با این هدفون‌ها شبیه به نشستن در یک سینمای مجهز است. صداها نه تنها از چپ و راست، بلکه از بالا و پشت و سر نیز شنیده می‌شوند. دقت سنسورهای شتاب‌سنج و ژیروسکوپ افزایش یافته و تاخیر در ردیابی حرکت سر تقریباً به صفر رسیده است. این ویژگی در بازی‌های ویدیویی و محتوای Dolby Atmos تجربه‌ای بی‌نظیر ایجاد می‌کنند.

نویز کنسلینگ فعال (ANC) و حالت شفافیت
این بخشی است که اپل ادعای بزرگی در مورد آن دارد: حذف نویز تا دو برابر قوی‌تر. در تست‌های عملی و بررسی مشخصات فنی، مشخص می‌شود که این ادعا صرفاً تبلیغاتی نیست. Airpods Pro 3 در حذف فرکانس‌های پایین و ممتد (مانند صدای موتور هواپیما یا کولر) استادانه عمل می‌کند. اما شاهکار اصلی آن در حذف صداهای ناگهانی و فرکانس‌های میانی (مانند صدای صحبت کردن افراد در کافه یا صدای تایپ کیبورد) است. 

قدرت پردازشی تراشه H2 در کنار میکروفون‌های جدید، محیط صوتی را ۴۸۰۰۰ بار در ثانیه پردازش می‌کنند. نتیجه این است که وقتی ANC را فعال می‌کنید، گویی یک پرده ضخیم بین شما و جهان بیرون کشیده می‌شود. برخی بررسی‌ها نشان می‌دهد ک عملکرد ANC این هدفون حتی با برخی هدفون‌های روگوشی (Over-Ear) بزرگ رقابت می‌کند، که برای یک ایرپاد کوچک دستاوردی خیره‌کننده است.
حالت شفافیت در ایرپادز همیشه بهترین در کلاس خود بوده و در نسل سوم حتی طبیعی‌تر شده است. دیگر حس نمی‌کنید که صدای محیط از طریق میکروفون پخش می‌شود؛ بلکه انگار هیچ هدفونی در گوش ندارید. قابلیت Adaptive Audio (صدای تطبیقی) نیز هوشمند‌تر شده است. این قابلیت به صورت خودکار بین حالت حذف نویز و شفافیت جابجا می‌شود. برای مثال وقتی در خیابان راه می‌روید صدای ماشین‌ها را می‌شنوید، اما به محض اینکه صدای گوش‌خراش دریل کارگران ساختمانی بلند می‌شود، هدفون آن را فیلتر می‌کند.

قابلیت‌های سلامتی و هوشمند: فراتر از یک هدفون
بخش هیجان‌انگیز ماجرا، ورود جدی Airpods Pro 3 به حوزه سلامت است. اپل با اضافه کردن سنسور ضربان قلب اپتیکال درون گوشی‌ها، این محصول را به یک ابزار ورزشی مستقل تبدیل کرده است. 

اکنون می‌توانید بدون نیاز به اپل واچ، به دویدن بروید و هدفون شما ضربان قلب و کالری سوزانده شده را ثبت کرده و به اپلیکیشن Apple Health در آیفون منتقل می‌کند. دقت این سنسورها در مقایسه با ساعت‌های هوشمند بسیار بالاست، زیرا گوش یکی از بهترین نقاط بدن برای سنجش علائم حیاتی است. علاوه بر این، سنسور دما نیز می‌تواند تغییرات دمای بدن را در طول تمرینات پایش کند.
اپل با دریافت تاییدیه‌های لازم، ویژگی کمک شنوایی را در سطح بالینی (Clinical Grade) به Airpods Pro 3 آورده است. قابلیت Hearing Test به شما اجازه می‌دهد در خانه شنوایی خود را بسنجید و هدفون بر اساس نمودار شنوایی شما (Audiogram)، صداها را تقویت کند. این ویژگی برای افرادی که کم‌شنوایی خفیف یا متوسط دارند، می‌تواند جایگزین سمعک‌های گران‌قیمت شود. ویژگی‌ Conversation Boost نیز صدای فرد مقابل را در محیط‌های شلوغ برجسته می‌کند تا مکالمه راحت‌تر شود.
توجه: قابلیت‌های کمک‌شنوایی ممکن است در کشور ایران به درستی کار نکند.
با تکیه بر هوش مصنوعی، قابلیت ترجمه همزمان مکالمات رو در رو اضافه شده است. اگر با شخصی که به زبان دیگری صحبت می‌کند حرف بزنید، هدفون صدای او را دریافت کرده و ترجمه را مستقیماً در گوش شما پخش می‌کند. اگرچه این قابلیت نیازمند اتصال به آیفون و اینترنت است، اما سرعت و دقت آن نسبت به گذشته پیشرفت چشمگیری داشته و تاخیر آن بسیار کم است.

باتری و شارژدهی: یک معامله پایاپای
در بخش باتری، ما با یک «بده بستان» مهندسی روبرو هستیم. خبر خوب این است که عمر باتری خود گوشی‌ها افزایش یافته است. با یک بار شارژ کامل و روشن بودن ANC، می‌توانید تا ۸ ساعت مداوم موسیقی گوش دهید (که این رقم در نسل قبل ۶ ساعت بود). این یعنی پوشش کامل یک پرواز طولانی از لندن به نیویورک بدون نیاز به شارژ مجدد.
اما خبر بحث‌برانگیز این است که به دلیل کوچک‌تر شدن کیس شارژ، ظرفیت باتری کیس کاهش یافته است. مجموع شارژدهی (هدفون + کیس) اکنون به حدود ۲۴ ساعت رسیده است (در حالی که در نسل قبل ۳۰ ساعت بود). اگرچه ۲۴ ساعت هنوز هم رقم قابل قبولی است و برای استفاده چند روز کافیست. اما این کاهش ظرفیت برای کاربرانی که عادت داشتند هفته‌ای یکبار کیس خود را شارژ کنند، ممکن است کمی نا‌امید‌کننده باشد. با این حال، سرعت شارژ همچنان عالی است و با ۵ دقیقه قرار دادن گوشی‌ها در کیس، حدود ۱ ساعت شارژدهی دریافت می‌کنید.

میکروفون‌ و کیفیت تماس
اپل در این نسل از یک آرایه میکروفونی جدید با قابلیت Voice Isolation پیشرفته استفاده کرده است. الگوریتم‌های یادگیری (Machine Learning)، صدای شما را از صدای باد، ترافیک و همهمه‌ محیط جدا می‌کنند. در تست‌های تماس تلفنی و فیس‌تایم، کیفیت انتقال صدا بسیار شفاف و نزدیک به واقعیت است. حتی در محیط‌های بادی، نویز باد به حداقل رسیده و مخاطب صدای شما را با وضوح کامل می‌شنود. این ویژگی Airpods Pro 3 را به گزینه‌ای ایده‌ال برای تماس‌های کاری و کنفرانس‌های ویدیویی تبدیل می‌کند.

جمع‌بندی
ایرپادز پرو ۳ محصولی است که نشان‌دهنده بلوغ کامل اپل در حوزه صوتی است. این هدفون دیگر سعی ندارد خود را ثابت کند، بلکه با اطمینان کامل بر جایگاه پادشاهی تکیه زده است. اگر کاربر آیفون هستید و به دنبال بهترین تجربه صوتی، راحتی و امکانات هوشمند می‌گردید، Airpods Pro 3 تنها و بهترین انتخاب شماست. اگرچه کاهش ظرفیت کلی باتری کیس و عدم پشتیبانی از کدک‌های Lossless ممکن است برای برخی کاربران حرفه‌ای نکته منفی باشد، اما مجموع پکیجی که اپل ارائه می‌دهد: شامل نویز کنسلینگ فوق‌العاده، حالت شفافیت بی‌نظیر و ویژگی‌های سلامت محور، ارزش خرید آن را کاملاً توجیه می‌کند. این محصول فقط یک هدفون نیست؛ یک کامپیوتر کوچک در گوش شماست که هوشمندانه‌تر از همیشه می‌شنود، ترجمه می‌کند و مراقب سلامتی شماست.')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name_fa = EXCLUDED.name_fa,
  name_en = EXCLUDED.name_en,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count,
  express_delivery = EXCLUDED.express_delivery,
  warranty = EXCLUDED.warranty,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  specs = EXCLUDED.specs,
  storage_options = EXCLUDED.storage_options,
  colors = EXCLUDED.colors,
  image_url = EXCLUDED.image_url,
  color_label = EXCLUDED.color_label,
  badge_text = EXCLUDED.badge_text,
  recommend_percent = EXCLUDED.recommend_percent,
  is_featured_deal = EXCLUDED.is_featured_deal,
  is_popular = EXCLUDED.is_popular,
  sales_rank = EXCLUDED.sales_rank,
  release_order = EXCLUDED.release_order,
  updated_at = EXCLUDED.updated_at,
  images = EXCLUDED.images,
  custom_specs = EXCLUDED.custom_specs,
  price_updated_at = EXCLUDED.price_updated_at,
  model_name = EXCLUDED.model_name,
  description_fa = EXCLUDED.description_fa,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  warranty_id = COALESCE(public.products.warranty_id, EXCLUDED.warranty_id),
  brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id,
  editorial_review = EXCLUDED.editorial_review;
