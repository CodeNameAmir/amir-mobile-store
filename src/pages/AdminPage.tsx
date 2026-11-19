import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FolderTree,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { STORE_ASSETS } from '../data/assets';
import { adminApi, type AdminStatsResponse } from '../lib/authApi';
import type {
  BrandItem,
  CategoryItem,
  CustomSpecItem,
  OrderRecord,
  OrderStatus,
  Product,
} from '../types/store';
import { formatPersianDate, formatToman, toPersianDigits } from '../utils/storeLogic';

type AdminTab = 'categories' | 'brands' | 'products' | 'orders';

const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'paid', label: 'پرداخت موفق' },
  { value: 'preparing', label: 'در حال آماده‌سازی' },
  { value: 'shipped', label: 'تحویل به پیک / در مسیر ارسال' },
  { value: 'delivered', label: 'تحویل‌شده به مشتری' },
  { value: 'cancelled', label: 'لغو شده' },
];

const QUICK_IMAGE_PRESETS = [
  { label: 'آیفون ۱۶ (اصلی)', url: STORE_ASSETS.heroIphone },
  { label: 'آیفون (نمای کناری)', url: STORE_ASSETS.iphoneSide },
  { label: 'آیفون (ماژول دوربین)', url: STORE_ASSETS.iphoneCamera },
  { label: 'هواوی پورا ۷۰ اولترا', url: STORE_ASSETS.huaweiPura },
  { label: 'گلکسی اولترا', url: STORE_ASSETS.samsungUltra },
  { label: 'شیائومی لایکا', url: STORE_ASSETS.xiaomiLeica },
  { label: 'بنر پرومو پرچمداران', url: STORE_ASSETS.promoShowcase },
];

interface CategoryFormState {
  id?: string;
  label: string;
  slug: string;
  subtitle: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  image: string;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_CATEGORY_FORM: CategoryFormState = {
  label: '',
  slug: '',
  subtitle: '',
  parentId: '',
  sortOrder: 10,
  isActive: true,
  image: '',
  seoTitle: '',
  seoDescription: '',
};

interface ProductFormState {
  editingId?: string;
  nameFa: string;
  nameEn: string;
  slug: string;
  category: string;
  brand: string;
  customBrand: string;
  price: string;
  originalPrice: string;
  stockCount: string;
  inStock: boolean;
  expressDelivery: boolean;
  isFeaturedDeal: boolean;
  isPopular: boolean;
  warranty: string;
  image: string;
  images: string[];
  display: string;
  chipset: string;
  camera: string;
  battery: string;
  ram: string;
  os: string;
  storageDefault: string;
  customSpecs: CustomSpecItem[];
  priceUpdatedAt?: string;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  nameFa: '',
  nameEn: '',
  slug: '',
  category: 'phones',
  brand: 'Apple',
  customBrand: '',
  price: '',
  originalPrice: '',
  stockCount: '5',
  inStock: true,
  expressDelivery: true,
  isFeaturedDeal: false,
  isPopular: true,
  warranty: '۱۸ ماهه امیر سرویس + کد رجیستری همتا',
  image: STORE_ASSETS.heroIphone,
  images: [],
  display: 'OLED 120Hz',
  chipset: 'پردازنده پرچمدار',
  camera: '۵۰ مگاپیکسل حرفه‌ای',
  battery: '۵۰۰۰ میلی‌آمپر',
  ram: '۱۲ گیگ',
  os: 'نسخه رسمی گلوبال',
  storageDefault: '۲۵۶ گیگابایت',
  customSpecs: [{ label: '', value: '' }],
};

export const AdminPage: React.FC = () => {
  const {
    user,
    authLoading,
    categories: storeCategories,
    brands: storeBrands,
    products: storeProducts,
    refreshProducts,
    refreshCatalogMetadata,
    buildHref,
    handleLinkClick,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [adminCategories, setAdminCategories] = useState<CategoryItem[]>(storeCategories);
  const [adminBrands, setAdminBrands] = useState<BrandItem[]>(storeBrands);
  const [adminProducts, setAdminProducts] = useState<Product[]>(storeProducts);
  const [adminOrders, setAdminOrders] = useState<OrderRecord[]>([]);

  // Category editor
  const [catForm, setCatForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM);
  const [savingCat, setSavingCat] = useState(false);

  // Brand editor
  const [brandName, setBrandName] = useState('');
  const [brandLabelFa, setBrandLabelFa] = useState('');
  const [brandIsActive, setBrandIsActive] = useState(true);
  const [savingBrand, setSavingBrand] = useState(false);

  // Product editor
  const [prodForm, setProdForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [savingProd, setSavingProd] = useState(false);

  // Order edits keyed by orderCode
  const [orderEdits, setOrderEdits] = useState<
    Record<string, { status: OrderStatus; adminNote: string }>
  >({});
  const [savingOrderCode, setSavingOrderCode] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const [st, cats, brs, prods, ords] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.listCategories(),
        adminApi.listBrands(),
        adminApi.listProducts(),
        adminApi.listOrders(),
      ]);
      if (st) setStats(st);
      setAdminCategories(cats);
      setAdminBrands(brs);
      setAdminProducts(prods);
      setAdminOrders(ords);
      const editMap: Record<string, { status: OrderStatus; adminNote: string }> = {};
      for (const ord of ords) {
        editMap[ord.orderCode] = {
          status: ord.status,
          adminNote: ord.adminNote || '',
        };
      }
      setOrderEdits(editMap);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات مدیریت.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const sortedCategories = useMemo(
    () =>
      [...adminCategories].sort(
        (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || a.label.localeCompare(b.label, 'fa')
      ),
    [adminCategories]
  );

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of adminCategories) {
      map.set(c.id, c.label);
    }
    return map;
  }, [adminCategories]);

  if (authLoading && !user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-[#e5eeff] p-10 text-center text-sm font-bold text-[#434655]">
          در حال بررسی سطح دسترسی حساب کاربری...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#e5eeff] p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#0b1c30]">ورود به پنل مدیریت فروشگاه</h1>
          <p className="text-xs sm:text-sm text-[#434655] leading-6">
            برای مدیریت دسته‌بندی‌ها، برندها، محصولات و سفارش‌ها ابتدا با حساب مدیر وارد شوید.
          </p>
          <a
            href={buildHref('/account')}
            onClick={(e) => handleLinkClick(e, '/account')}
            data-testid="admin-signin-link"
            className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center"
          >
            ورود به حساب کاربری
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-rose-200 p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#0b1c30]">دسترسی مدیر لازم است</h1>
          <p className="text-xs sm:text-sm text-[#434655] leading-6">
            حساب کاربری فعلی شما دارای نقش مشتری است و مجوز تغییر تنظیمات پنل مدیریت را ندارد.
          </p>
          <a
            href={buildHref('/')}
            onClick={(e) => handleLinkClick(e, '/')}
            className="h-11 px-6 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center"
          >
            بازگشت به فروشگاه
          </a>
        </div>
      </div>
    );
  }

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (catForm.label.trim().length < 2) {
      showToast('عنوان دسته‌بندی باید حداقل ۲ کاراکتر باشد.', 'error');
      return;
    }
    setSavingCat(true);
    try {
      await adminApi.saveCategory({
        id: catForm.id,
        label: catForm.label.trim(),
        slug: catForm.slug.trim() || undefined,
        subtitle: catForm.subtitle.trim(),
        parentId: catForm.parentId || null,
        sortOrder: Number(catForm.sortOrder) || 100,
        isActive: catForm.isActive,
        image: catForm.image.trim(),
        seoTitle: catForm.seoTitle.trim(),
        seoDescription: catForm.seoDescription.trim(),
      });
      showToast('دسته‌بندی با موفقیت ذخیره شد.', 'success');
      setCatForm(EMPTY_CATEGORY_FORM);
      await Promise.all([loadAdminData(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره دسته‌بندی.', 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleToggleCategoryActive = async (cat: CategoryItem) => {
    try {
      await adminApi.saveCategory({
        ...cat,
        isActive: cat.isActive === false,
      });
      showToast(
        cat.isActive === false ? `دسته‌بندی «${cat.label}» فعال شد.` : `دسته‌بندی «${cat.label}» غیرفعال شد.`,
        'info'
      );
      await Promise.all([loadAdminData(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در تغییر وضعیت دسته‌بندی.', 'error');
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    try {
      await adminApi.deleteCategory(cat.id);
      showToast(`دسته‌بندی «${cat.label}» حذف شد.`, 'info');
      await Promise.all([loadAdminData(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در حذف دسته‌بندی.', 'error');
    }
  };

  // Brand Handlers
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim().length < 2) {
      showToast('نام برند (انگلیسی) باید حداقل ۲ کاراکتر باشد.', 'error');
      return;
    }
    setSavingBrand(true);
    try {
      await adminApi.saveBrand({
        name: brandName.trim(),
        labelFa: brandLabelFa.trim() || undefined,
        isActive: brandIsActive,
      });
      showToast(`برند ${brandName.trim()} ثبت شد.`, 'success');
      setBrandName('');
      setBrandLabelFa('');
      setBrandIsActive(true);
      await Promise.all([loadAdminData(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره برند.', 'error');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleDeleteBrand = async (brand: BrandItem) => {
    try {
      await adminApi.deleteBrand(brand.id);
      showToast(`برند ${brand.name} حذف شد.`, 'info');
      await Promise.all([loadAdminData(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در حذف برند.', 'error');
    }
  };

  // Product Handlers
  const startEditProduct = (p: Product) => {
    const knownBrand = adminBrands.some((b) => b.name.toLowerCase() === p.brand.toLowerCase());
    setProdForm({
      editingId: p.id,
      nameFa: p.nameFa,
      nameEn: p.nameEn,
      slug: p.slug,
      category: p.category,
      brand: knownBrand ? p.brand : '__custom__',
      customBrand: knownBrand ? '' : p.brand,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      stockCount: String(p.stockCount),
      inStock: p.inStock,
      expressDelivery: p.expressDelivery,
      isFeaturedDeal: Boolean(p.isFeaturedDeal),
      isPopular: Boolean(p.isPopular),
      warranty: p.warranty,
      image: p.image,
      images: p.images && p.images.length > 0 ? [...p.images] : [p.image].filter(Boolean),
      display: p.specs.display,
      chipset: p.specs.chipset,
      camera: p.specs.camera,
      battery: p.specs.battery,
      ram: p.specs.ram,
      os: p.specs.os,
      storageDefault: p.specs.storageDefault,
      customSpecs:
        p.customSpecs && p.customSpecs.length > 0
          ? p.customSpecs.map((s) => ({ ...s }))
          : [{ label: '', value: '' }],
      priceUpdatedAt: p.priceUpdatedAt,
    });
    setActiveTab('products');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedBrand = (
      prodForm.brand === '__custom__' ? prodForm.customBrand : prodForm.brand
    ).trim();
    const priceNum = Number(prodForm.price);
    const origNum = Number(prodForm.originalPrice);
    const stockNum = Math.max(0, Math.floor(Number(prodForm.stockCount || '0')));

    if (prodForm.nameFa.trim().length < 2 || !resolvedBrand || !prodForm.category) {
      showToast('نام فارسی محصول، برند و دسته‌بندی الزامی هستند.', 'error');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      showToast('قیمت فروش باید عدد معتبر بزرگتر از صفر باشد.', 'error');
      return;
    }

    const cleanCustomSpecs = prodForm.customSpecs
      .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
      .filter((item) => item.label && item.value);

    const primaryImage = prodForm.image.trim() || prodForm.images[0] || STORE_ASSETS.heroIphone;
    const gallery = Array.from(
      new Set([primaryImage, ...prodForm.images.map((u) => u.trim())].filter(Boolean))
    );

    const payload: Partial<Product> = {
      nameFa: prodForm.nameFa.trim(),
      nameEn: prodForm.nameEn.trim() || prodForm.nameFa.trim(),
      slug: prodForm.slug.trim() || undefined,
      category: prodForm.category,
      brand: resolvedBrand,
      price: Math.round(priceNum),
      originalPrice: Number.isFinite(origNum) && origNum > priceNum ? Math.round(origNum) : undefined,
      stockCount: stockNum,
      inStock: prodForm.inStock && stockNum > 0,
      expressDelivery: prodForm.expressDelivery,
      isFeaturedDeal: prodForm.isFeaturedDeal,
      isPopular: prodForm.isPopular,
      warranty: prodForm.warranty.trim(),
      image: primaryImage,
      images: gallery,
      specs: {
        display: prodForm.display.trim() || 'OLED 120Hz',
        displayDetails: 'کیفیت پرچمدار',
        chipset: prodForm.chipset.trim() || 'پردازنده پرچمدار',
        chipsetDetails: 'نسل جدید',
        camera: prodForm.camera.trim() || 'دوربین حرفه‌ای',
        cameraDetails: 'لرزشگیر اپتیکال',
        battery: prodForm.battery.trim() || '۵۰۰۰ میلی‌آمپر',
        batteryDetails: 'فست شارژ',
        storageDefault: prodForm.storageDefault.trim() || '۲۵۶ گیگابایت',
        ram: prodForm.ram.trim() || '۱۲ گیگ',
        os: prodForm.os.trim() || 'نسخه رسمی گلوبال',
      },
      customSpecs: cleanCustomSpecs,
    };

    setSavingProd(true);
    try {
      // Ensure brand also exists in BrandItem catalog if custom
      if (!adminBrands.some((b) => b.name.toLowerCase() === resolvedBrand.toLowerCase())) {
        await adminApi.saveBrand({ name: resolvedBrand, isActive: true }).catch(() => undefined);
      }
      if (prodForm.editingId) {
        await adminApi.updateProduct(prodForm.editingId, payload);
        showToast('محصول با موفقیت ویرایش شد.', 'success');
      } else {
        await adminApi.createProduct(payload);
        showToast('محصول جدید با موفقیت ثبت شد.', 'success');
      }
      setProdForm(EMPTY_PRODUCT_FORM);
      await Promise.all([loadAdminData(), refreshProducts(), refreshCatalogMetadata()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره محصول.', 'error');
    } finally {
      setSavingProd(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    try {
      await adminApi.deleteProduct(p.id);
      showToast(`محصول «${p.nameFa}» حذف شد.`, 'info');
      await Promise.all([loadAdminData(), refreshProducts()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در حذف محصول.', 'error');
    }
  };

  // Order Status Handler
  const handleSaveOrderStatus = async (orderCode: string) => {
    const edit = orderEdits[orderCode];
    if (!edit) return;
    setSavingOrderCode(orderCode);
    try {
      const res = await adminApi.updateOrderStatus(orderCode, {
        status: edit.status,
        adminNote: edit.adminNote.trim() || undefined,
      });
      setAdminOrders((prev) =>
        prev.map((o) => (o.orderCode === orderCode ? res.order : o))
      );
      showToast(`وضعیت سفارش ${orderCode} به‌روزرسانی شد.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در تغییر وضعیت سفارش.', 'error');
    } finally {
      setSavingOrderCode(null);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Header & KPI Bar */}
      <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-xs font-extrabold">
              <Settings2 className="w-4 h-4" />
              <span>پنل مدیریت یکپارچه فروشگاه موبایل امیر</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
              مدیریت دسته‌بندی‌ها، برندها، محصولات و سفارش‌ها
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAdminData()}
              disabled={loading}
              className="h-10 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>بروزرسانی</span>
            </button>
            <a
              href={buildHref('/catalog')}
              onClick={(e) => handleLinkClick(e, '/catalog')}
              className="h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold inline-flex items-center"
            >
              مشاهده فروشگاه
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#eff4ff]">
          <div className="p-3.5 rounded-2xl bg-[#f8f9ff]">
            <p className="text-[11px] text-[#434655]">دسته‌بندی‌ها</p>
            <p className="text-xl font-black text-[#0b1c30] tabular-nums-fa mt-1">
              {toPersianDigits(adminCategories.length)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f9ff]">
            <p className="text-[11px] text-[#434655]">برندهای ثبت‌شده</p>
            <p className="text-xl font-black text-[#0b1c30] tabular-nums-fa mt-1">
              {toPersianDigits(adminBrands.length)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f9ff]">
            <p className="text-[11px] text-[#434655]">محصولات</p>
            <p className="text-xl font-black text-[#0b1c30] tabular-nums-fa mt-1">
              {toPersianDigits(adminProducts.length)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f9ff]">
            <p className="text-[11px] text-[#434655]">کل سفارش‌ها / فروش</p>
            <p className="text-sm sm:text-base font-black text-[#004ac6] tabular-nums-fa mt-1">
              {toPersianDigits(stats?.totalOrders ?? adminOrders.length)} سفارش ·{' '}
              {formatToman(stats?.totalRevenue ?? 0)} ت
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(
            [
              { id: 'categories', label: 'دسته‌بندی‌های تودرتو و سئو', icon: <FolderTree className="w-4 h-4" /> },
              { id: 'brands', label: 'مدیریت برندها', icon: <Tag className="w-4 h-4" /> },
              { id: 'products', label: 'محصولات، گالری و مشخصات ویژه', icon: <Package className="w-4 h-4" /> },
              { id: 'orders', label: 'سفارش‌ها و وضعیت فاکتور', icon: <ListChecks className="w-4 h-4" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`admin-tab-${tab.id}`}
              className={`h-10 px-4 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#004ac6] text-white shadow-sm'
                  : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TAB 1: UNLIMITED NESTED CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveCategory}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
              <h2 className="text-base font-black text-[#0b1c30]">
                {catForm.id ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید (نامحدود)'}
              </h2>
              {catForm.id && (
                <button
                  type="button"
                  onClick={() => setCatForm(EMPTY_CATEGORY_FORM)}
                  className="text-xs font-bold text-[#004ac6] hover:underline"
                >
                  انصراف و ایجاد جدید
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="cat-label" className="text-xs font-bold text-[#0b1c30] block">
                  عنوان دسته‌بندی *
                </label>
                <input
                  id="cat-label"
                  type="text"
                  required
                  value={catForm.label}
                  onChange={(e) => setCatForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="مثال: گوشی‌های تاشو"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-slug" className="text-xs font-bold text-[#0b1c30] block">
                  اسلاگ انگلیسی (اختیاری)
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  dir="ltr"
                  value={catForm.slug}
                  onChange={(e) => setCatForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="foldable-phones"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-parent" className="text-xs font-bold text-[#0b1c30] block">
                  دسته مادر (ساختار تودرتو)
                </label>
                <select
                  id="cat-parent"
                  value={catForm.parentId}
                  onChange={(e) => setCatForm((p) => ({ ...p, parentId: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs font-bold"
                >
                  <option value="">دسته اصلی (بدون والد)</option>
                  {sortedCategories
                    .filter((c) => c.id !== catForm.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-sort" className="text-xs font-bold text-[#0b1c30] block">
                  ترتیب نمایش (Sort Order)
                </label>
                <input
                  id="cat-sort"
                  type="number"
                  value={catForm.sortOrder}
                  onChange={(e) => setCatForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-subtitle" className="text-xs font-bold text-[#0b1c30] block">
                توضیح کوتاه زیرعنوان
              </label>
              <input
                id="cat-subtitle"
                type="text"
                value={catForm.subtitle}
                onChange={(e) => setCatForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="جدیدترین پرچمداران تاشو با گارانتی ۱۸ ماهه"
                className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-image" className="text-xs font-bold text-[#0b1c30] block">
                لینک تصویر اختصاصی دسته‌بندی
              </label>
              <input
                id="cat-image"
                type="text"
                dir="ltr"
                value={catForm.image}
                onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="/assets/... یا https://..."
                className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_IMAGE_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCatForm((p) => ({ ...p, image: preset.url }))}
                    className="px-2 py-1 rounded-lg bg-[#eff4ff] text-[#004ac6] text-[10px] font-bold"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-seo-title" className="text-xs font-bold text-[#0b1c30] block">
                عنوان سئو (SEO Title)
              </label>
              <input
                id="cat-seo-title"
                type="text"
                value={catForm.seoTitle}
                onChange={(e) => setCatForm((p) => ({ ...p, seoTitle: e.target.value }))}
                placeholder="خرید گوشی موبایل پرچمدار | فروشگاه موبایل امیر"
                className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-seo-desc" className="text-xs font-bold text-[#0b1c30] block">
                توضیحات سئو (Meta Description)
              </label>
              <textarea
                id="cat-seo-desc"
                rows={2}
                value={catForm.seoDescription}
                onChange={(e) => setCatForm((p) => ({ ...p, seoDescription: e.target.value }))}
                placeholder="بررسی قیمت و خرید انواع گوشی هوشمند با رجیستری همتا و ضمانت اصالت..."
                className="w-full p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-[#0b1c30] cursor-pointer">
              <input
                type="checkbox"
                checked={catForm.isActive}
                onChange={(e) => setCatForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#004ac6]"
              />
              <span>این دسته‌بندی در فروشگاه فعال و قابل نمایش باشد</span>
            </label>

            <button
              type="submit"
              disabled={savingCat}
              data-testid="save-category-btn"
              className="w-full h-11 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{savingCat ? 'در حال ذخیره...' : catForm.id ? 'بروزرسانی دسته‌بندی' : 'ثبت دسته‌بندی'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-black text-[#0b1c30]">
              فهرست دسته‌بندی‌ها ({toPersianDigits(sortedCategories.length)})
            </h2>
            <div className="space-y-3">
              {sortedCategories.map((cat) => (
                <div
                  key={cat.id}
                  data-testid={`admin-category-row-${cat.id}`}
                  className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#dce9ff] overflow-hidden shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <SmartImage src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-5 h-5 text-[#004ac6]" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-[#0b1c30]">
                          {cat.label}
                        </span>
                        <code dir="ltr" className="text-[10px] px-2 py-0.5 rounded bg-white text-[#434655]">
                          {cat.slug}
                        </code>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6] font-bold">
                          ترتیب: {toPersianDigits(cat.sortOrder ?? 100)}
                        </span>
                        {cat.parentId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                            زیرمجموعه: {categoryNameMap.get(cat.parentId) || cat.parentId}
                          </span>
                        )}
                      </div>
                      {(cat.seoTitle || cat.subtitle) && (
                        <p className="text-[11px] text-[#434655] line-clamp-1">
                          {cat.seoTitle || cat.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleToggleCategoryActive(cat)}
                      data-testid={`toggle-cat-${cat.id}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        cat.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat.isActive !== false ? 'فعال' : 'غیرفعال'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCatForm({
                          id: cat.id,
                          label: cat.label,
                          slug: cat.slug,
                          subtitle: cat.subtitle || '',
                          parentId: cat.parentId || '',
                          sortOrder: cat.sortOrder ?? 100,
                          isActive: cat.isActive !== false,
                          image: cat.image || '',
                          seoTitle: cat.seoTitle || '',
                          seoDescription: cat.seoDescription || '',
                        })
                      }
                      data-testid={`edit-cat-${cat.id}`}
                      aria-label={`ویرایش ${cat.label}`}
                      className="p-2 rounded-xl bg-white border border-[#dce9ff] text-[#0b1c30] hover:text-[#004ac6]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCategory(cat)}
                      data-testid={`delete-cat-${cat.id}`}
                      aria-label={`حذف ${cat.label}`}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDS MANAGEMENT */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveBrand}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4"
          >
            <h2 className="text-base font-black text-[#0b1c30]">افزودن یا ویرایش برند دلخواه</h2>
            <p className="text-xs text-[#434655] leading-6">
              هر برند دلخواه مانند <span dir="ltr" className="font-bold">Huawei</span>،{' '}
              <span dir="ltr" className="font-bold">Google</span> یا <span dir="ltr" className="font-bold">Nothing</span>{' '}
              را اضافه کنید تا در فرم ثبت محصول، فیلترهای کاتالوگ و جستجوی هوشمند نمایش داده شود.
            </p>
            <div className="space-y-1">
              <label htmlFor="brand-name-en" className="text-xs font-bold text-[#0b1c30] block">
                نام برند (انگلیسی) *
              </label>
              <input
                id="brand-name-en"
                type="text"
                dir="ltr"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Huawei"
                data-testid="brand-name-input"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="brand-name-fa" className="text-xs font-bold text-[#0b1c30] block">
                نام فارسی برند (اختیاری)
              </label>
              <input
                id="brand-name-fa"
                type="text"
                value={brandLabelFa}
                onChange={(e) => setBrandLabelFa(e.target.value)}
                placeholder="هواوی"
                data-testid="brand-label-fa-input"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#0b1c30] cursor-pointer">
              <input
                type="checkbox"
                checked={brandIsActive}
                onChange={(e) => setBrandIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#004ac6]"
              />
              <span>برند فعال باشد</span>
            </label>
            <button
              type="submit"
              disabled={savingBrand}
              data-testid="save-brand-btn"
              className="w-full h-11 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{savingBrand ? 'در حال ثبت...' : 'ذخیره برند'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-black text-[#0b1c30]">
              برندهای ثبت‌شده ({toPersianDigits(adminBrands.length)})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminBrands.map((b) => (
                <div
                  key={b.id}
                  data-testid={`admin-brand-card-${b.id}`}
                  className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex items-center justify-between gap-3"
                >
                  <div>
                    <p dir="ltr" className="text-sm font-black text-[#0b1c30] text-right">
                      {b.name}
                    </p>
                    {b.labelFa && <p className="text-xs text-[#434655] mt-0.5">{b.labelFa}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        b.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.isActive !== false ? 'فعال' : 'غیرفعال'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteBrand(b)}
                      data-testid={`delete-brand-${b.id}`}
                      aria-label={`حذف برند ${b.name}`}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS, MULTI-IMAGE GALLERY & CUSTOM SPECS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-6 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
              <h2 className="text-base font-black text-[#0b1c30]">
                {prodForm.editingId ? 'ویرایش محصول و مشخصات فنی' : 'افزودن محصول جدید'}
              </h2>
              {prodForm.editingId && (
                <button
                  type="button"
                  onClick={() => setProdForm(EMPTY_PRODUCT_FORM)}
                  className="text-xs font-bold text-[#004ac6] hover:underline"
                >
                  انصراف
                </button>
              )}
            </div>

            {prodForm.priceUpdatedAt && (
              <div className="p-3 rounded-xl bg-[#eff4ff] text-xs font-bold text-[#004ac6]">
                آخرین به‌روزرسانی قیمت ثبت‌شده: {formatPersianDate(prodForm.priceUpdatedAt)}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="prod-name-fa" className="text-xs font-bold text-[#0b1c30] block">
                  نام فارسی محصول *
                </label>
                <input
                  id="prod-name-fa"
                  type="text"
                  required
                  value={prodForm.nameFa}
                  onChange={(e) => setProdForm((p) => ({ ...p, nameFa: e.target.value }))}
                  placeholder="گوشی موبایل هواوی Pura 70"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-name-en" className="text-xs font-bold text-[#0b1c30] block">
                  نام انگلیسی / مدل
                </label>
                <input
                  id="prod-name-en"
                  type="text"
                  dir="ltr"
                  value={prodForm.nameEn}
                  onChange={(e) => setProdForm((p) => ({ ...p, nameEn: e.target.value }))}
                  placeholder="Huawei Pura 70 Pro 512GB"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-cat" className="text-xs font-bold text-[#0b1c30] block">
                  دسته‌بندی *
                </label>
                <select
                  id="prod-cat"
                  value={prodForm.category}
                  onChange={(e) => setProdForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs font-bold"
                >
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-brand" className="text-xs font-bold text-[#0b1c30] block">
                  برند *
                </label>
                <select
                  id="prod-brand"
                  value={prodForm.brand}
                  onChange={(e) => setProdForm((p) => ({ ...p, brand: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs font-bold"
                >
                  {adminBrands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} {b.labelFa ? `(${b.labelFa})` : ''}
                    </option>
                  ))}
                  <option value="__custom__">+ وارد کردن برند جدید...</option>
                </select>
              </div>

              {prodForm.brand === '__custom__' && (
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="prod-custom-brand" className="text-xs font-bold text-[#0b1c30] block">
                    نام برند جدید (مثلاً Huawei یا Nothing)
                  </label>
                  <input
                    id="prod-custom-brand"
                    type="text"
                    dir="ltr"
                    value={prodForm.customBrand}
                    onChange={(e) => setProdForm((p) => ({ ...p, customBrand: e.target.value }))}
                    placeholder="Huawei"
                    className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="prod-price" className="text-xs font-bold text-[#0b1c30] block">
                  قیمت فروش (تومان) *
                </label>
                <input
                  id="prod-price"
                  type="number"
                  required
                  value={prodForm.price}
                  onChange={(e) => setProdForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="64500000"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-orig-price" className="text-xs font-bold text-[#0b1c30] block">
                  قیمت قبل از تخفیف (اختیاری)
                </label>
                <input
                  id="prod-orig-price"
                  type="number"
                  value={prodForm.originalPrice}
                  onChange={(e) => setProdForm((p) => ({ ...p, originalPrice: e.target.value }))}
                  placeholder="69000000"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-stock" className="text-xs font-bold text-[#0b1c30] block">
                  موجودی انبار
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  value={prodForm.stockCount}
                  onChange={(e) => setProdForm((p) => ({ ...p, stockCount: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-slug" className="text-xs font-bold text-[#0b1c30] block">
                  اسلاگ URL (اختیاری)
                </label>
                <input
                  id="prod-slug"
                  type="text"
                  dir="ltr"
                  value={prodForm.slug}
                  onChange={(e) => setProdForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="huawei-pura-70-pro"
                  className="w-full h-10 px-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] text-xs text-left"
                />
              </div>
            </div>

            {/* Multi-Image Gallery Editor */}
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3">
              <p className="text-xs font-black text-[#0b1c30] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#004ac6]" />
                <span>تصویر اصلی و گالری چندتصویری محصول (اسلایدر)</span>
              </p>
              <div className="space-y-1">
                <label htmlFor="prod-main-img" className="text-[11px] font-bold text-[#434655] block">
                  آدرس تصویر اصلی
                </label>
                <input
                  id="prod-main-img"
                  type="text"
                  dir="ltr"
                  value={prodForm.image}
                  onChange={(e) => setProdForm((p) => ({ ...p, image: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-left"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="لینک تصویر جدید گالری..."
                  className="flex-1 h-9 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs text-left"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = newGalleryUrl.trim();
                    if (!url) return;
                    setProdForm((p) => ({
                      ...p,
                      images: Array.from(new Set([...p.images, url])),
                    }));
                    setNewGalleryUrl('');
                  }}
                  className="h-9 px-3 rounded-xl bg-[#004ac6] text-white text-xs font-bold shrink-0"
                >
                  + افزودن به گالری
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setProdForm((p) => ({
                        ...p,
                        images: Array.from(new Set([...p.images, preset.url])),
                      }))
                    }
                    className="px-2 py-1 rounded-lg bg-white border border-[#dce9ff] text-[10px] font-bold text-[#004ac6]"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              {prodForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {prodForm.images.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="relative w-14 h-14 rounded-xl bg-white border border-[#dce9ff] overflow-hidden group"
                    >
                      <SmartImage src={imgUrl} alt={`گالری ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setProdForm((p) => ({
                            ...p,
                            images: p.images.filter((_, i) => i !== idx),
                          }))
                        }
                        aria-label="حذف تصویر از گالری"
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flexible Custom Technical Specs Builder */}
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-[#0b1c30] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#004ac6]" />
                  <span>مشخصات فنی ویژه و دلخواه محصول (نامحدود)</span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setProdForm((p) => ({
                      ...p,
                      customSpecs: [...p.customSpecs, { label: '', value: '' }],
                    }))
                  }
                  data-testid="add-custom-spec-btn"
                  className="px-2.5 py-1 rounded-lg bg-[#004ac6] text-white text-[11px] font-bold"
                >
                  + ردیف مشخصه جدید
                </button>
              </div>

              <div className="space-y-2">
                {prodForm.customSpecs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) =>
                        setProdForm((p) => ({
                          ...p,
                          customSpecs: p.customSpecs.map((s, i) =>
                            i === idx ? { ...s, label: e.target.value } : s
                          ),
                        }))
                      }
                      placeholder="عنوان مشخصه (مثلاً توان خروجی / گواهی IP)"
                      className="col-span-5 h-9 px-2.5 rounded-xl bg-white border border-[#dce9ff] text-xs"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        setProdForm((p) => ({
                          ...p,
                          customSpecs: p.customSpecs.map((s, i) =>
                            i === idx ? { ...s, value: e.target.value } : s
                          ),
                        }))
                      }
                      placeholder="مقدار (مثلاً IP68 / ۶۵ وات GaN)"
                      className="col-span-6 h-9 px-2.5 rounded-xl bg-white border border-[#dce9ff] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProdForm((p) => ({
                          ...p,
                          customSpecs:
                            p.customSpecs.length > 1
                              ? p.customSpecs.filter((_, i) => i !== idx)
                              : [{ label: '', value: '' }],
                        }))
                      }
                      aria-label="حذف مشخصه"
                      className="col-span-1 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold text-[#0b1c30]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodForm.inStock}
                  onChange={(e) => setProdForm((p) => ({ ...p, inStock: e.target.checked }))}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span>موجود برای فروش</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodForm.expressDelivery}
                  onChange={(e) => setProdForm((p) => ({ ...p, expressDelivery: e.target.checked }))}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span>ارسال اکسپرس</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodForm.isFeaturedDeal}
                  onChange={(e) => setProdForm((p) => ({ ...p, isFeaturedDeal: e.target.checked }))}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span>پیشنهاد ویژه</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingProd}
              data-testid="save-product-btn"
              className="w-full h-11 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-extrabold"
            >
              {savingProd
                ? 'در حال ذخیره...'
                : prodForm.editingId
                ? 'ذخیره تغییرات محصول'
                : 'ثبت محصول جدید در فروشگاه'}
            </button>
          </form>

          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
            <h2 className="text-base font-black text-[#0b1c30]">
              لیست محصولات فروشگاه ({toPersianDigits(adminProducts.length)})
            </h2>
            <div className="space-y-3 max-h-[820px] overflow-y-auto pl-1">
              {adminProducts.map((p) => (
                <div
                  key={p.id}
                  data-testid={`admin-product-row-${p.id}`}
                  className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#dce9ff] overflow-hidden shrink-0">
                      <SmartImage src={p.image} alt={p.nameFa} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-extrabold text-[#0b1c30] truncate">{p.nameFa}</p>
                      <p className="text-[11px] text-[#434655] tabular-nums-fa">
                        {p.brand} · {formatToman(p.price)} ت · موجودی {toPersianDigits(p.stockCount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={buildHref(`/product/${p.slug}`)}
                      onClick={(e) => handleLinkClick(e, `/product/${p.slug}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[11px] font-bold text-[#004ac6]"
                    >
                      مشاهده
                    </a>
                    <button
                      type="button"
                      onClick={() => startEditProduct(p)}
                      data-testid={`edit-prod-${p.id}`}
                      aria-label={`ویرایش ${p.nameFa}`}
                      className="p-2 rounded-xl bg-white border border-[#dce9ff] text-[#0b1c30] hover:text-[#004ac6]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteProduct(p)}
                      data-testid={`delete-prod-${p.id}`}
                      aria-label={`حذف ${p.nameFa}`}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & INVOICE STATUS MANAGEMENT */}
      {activeTab === 'orders' && (
        <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0b1c30]">
                مدیریت وضعیت سفارش‌ها ({toPersianDigits(adminOrders.length)})
              </h2>
              <p className="text-xs text-[#434655] mt-0.5">
                تغییر وضعیت در این بخش بلافاصله هم در صفحه رهگیری مرسوله و هم در صفحه فاکتور سفارش نمایش داده می‌شود.
              </p>
            </div>
          </div>

          {adminOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#f8f9ff] text-center text-xs sm:text-sm text-[#434655]">
              هنوز سفارشی در سیستم ثبت نشده است. برای بررسی، یک سفارش جدید ثبت کنید و وضعیت آن را اینجا تغییر دهید.
            </div>
          ) : (
            <div className="space-y-3">
              {adminOrders.map((ord) => {
                const edit = orderEdits[ord.orderCode] || {
                  status: ord.status,
                  adminNote: ord.adminNote || '',
                };
                return (
                  <div
                    key={ord.orderCode}
                    data-testid={`admin-order-row-${ord.orderCode}`}
                    className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#dce9ff] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-[#434655]">
                          کد سفارش:{' '}
                          <strong dir="ltr" className="text-sm text-[#004ac6] font-black">
                            {ord.orderCode}
                          </strong>{' '}
                          · {ord.customerName} (<span dir="ltr">{ord.customerPhone}</span>)
                        </p>
                        <p className="text-xs font-bold text-[#0b1c30] tabular-nums-fa">
                          مبلغ کل: {formatToman(ord.totalAmount)} تومان · {ord.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={buildHref(`/order-confirmed/${ord.orderCode}`)}
                          onClick={(e) => handleLinkClick(e, `/order-confirmed/${ord.orderCode}`)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold text-[#004ac6]"
                        >
                          مشاهده فاکتور
                        </a>
                        <a
                          href={buildHref(`/tracking/${ord.orderCode}`)}
                          onClick={(e) => handleLinkClick(e, `/tracking/${ord.orderCode}`)}
                          className="px-3 py-1.5 rounded-xl bg-[#eff4ff] text-xs font-bold text-[#0b1c30]"
                        >
                          صفحه پیگیری
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <select
                        value={edit.status}
                        onChange={(e) =>
                          setOrderEdits((prev) => ({
                            ...prev,
                            [ord.orderCode]: {
                              ...edit,
                              status: e.target.value as OrderStatus,
                            },
                          }))
                        }
                        data-testid={`order-status-select-${ord.orderCode}`}
                        className="sm:col-span-4 h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs font-bold"
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={edit.adminNote}
                        onChange={(e) =>
                          setOrderEdits((prev) => ({
                            ...prev,
                            [ord.orderCode]: {
                              ...edit,
                              adminNote: e.target.value,
                            },
                          }))
                        }
                        placeholder="یادداشت مدیر یا کد رهگیری پستی..."
                        className="sm:col-span-6 h-10 px-3 rounded-xl bg-white border border-[#dce9ff] text-xs"
                      />
                      <button
                        type="button"
                        disabled={savingOrderCode === ord.orderCode}
                        onClick={() => void handleSaveOrderStatus(ord.orderCode)}
                        data-testid={`save-order-status-${ord.orderCode}`}
                        className="sm:col-span-2 h-10 px-4 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{savingOrderCode === ord.orderCode ? 'ثبت...' : 'ذخیره'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
