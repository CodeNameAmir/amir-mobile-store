import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORY_ITEMS,
  DEFAULT_BRANDS,
  hydrateOrderImages,
  hydrateProduct,
  SEED_PRODUCTS,
} from '../data/catalog';
import { authApi, storeApi } from '../lib/authApi';
import { storeRepository } from '../lib/supabase';
import type {
  BrandItem,
  CartItem,
  CategoryId,
  CategoryItem,
  CheckoutFormData,
  CouponRule,
  DemoUser,
  FilterState,
  OrderLookupResult,
  OrderRecord,
  Product,
  ResendServiceStatus,
  StoreSettings,
  UserAddress,
} from '../types/store';
import {
  calculateCartSummary,
  DEFAULT_COUPON_RULES,
  evaluateCoupon,
  FREE_SHIPPING_THRESHOLD,
  generateOrderCode,
  toEnglishDigits,
  toPersianDigits,
  type CartSummary,
} from '../utils/storeLogic';

export type AppRoute =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; slug: string }
  | { page: 'compare' }
  | { page: 'installments' }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'order-confirmed'; code: string }
  | { page: 'tracking'; code?: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'terms' }
  | { page: 'account' }
  | { page: 'admin' }
  | { page: 'status' }
  | { page: 'not-found'; path: string };

export interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
}

export const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  searchQuery: '',
  brands: [],
  inStockOnly: false,
  discountedOnly: false,
  expressOnly: false,
  minPrice: 0,
  maxPrice: Infinity,
  storage: null,
  ram: null,
  colorId: null,
  sortBy: 'newest',
};

export function normalizeAppTarget(to: string): string {
  const clean = to.replace(/^#/, '').trim();
  if (!clean) return '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function parseAppUrl(urlInput: string): {
  route: AppRoute;
  categoryParam?: CategoryId;
  queryParam?: string;
  brandParam?: string;
} {
  const clean = normalizeAppTarget(urlInput);
  const [pathPart, queryPart] = clean.split('?');
  const path = pathPart.length > 1 ? pathPart.replace(/\/+$/, '') : pathPart || '/';
  const params = new URLSearchParams(queryPart || '');

  if (path === '/' || path === '') {
    return { route: { page: 'home' } };
  }
  if (path === '/catalog') {
    const cat = (params.get('cat') as CategoryId | null) || undefined;
    const q = params.get('q') || undefined;
    const brand = params.get('brand') || undefined;
    return { route: { page: 'catalog' }, categoryParam: cat, queryParam: q, brandParam: brand };
  }
  if (path.startsWith('/product/')) {
    const slug = decodeURIComponent(path.replace('/product/', '').trim());
    return slug ? { route: { page: 'product', slug } } : { route: { page: 'not-found', path } };
  }
  if (path === '/compare') return { route: { page: 'compare' } };
  if (path === '/installments') return { route: { page: 'installments' } };
  if (path === '/cart') return { route: { page: 'cart' } };
  if (path === '/checkout') return { route: { page: 'checkout' } };
  if (path.startsWith('/order-confirmed/')) {
    const code = decodeURIComponent(path.replace('/order-confirmed/', '').trim());
    return code
      ? { route: { page: 'order-confirmed', code } }
      : { route: { page: 'not-found', path } };
  }
  if (path === '/tracking') return { route: { page: 'tracking' } };
  if (path.startsWith('/tracking/')) {
    const code = decodeURIComponent(path.replace('/tracking/', '').trim());
    return { route: { page: 'tracking', code: code || undefined } };
  }
  if (path === '/about') return { route: { page: 'about' } };
  if (path === '/contact') return { route: { page: 'contact' } };
  if (path === '/terms') return { route: { page: 'terms' } };
  if (path === '/account') return { route: { page: 'account' } };
  if (path === '/admin') return { route: { page: 'admin' } };
  if (path === '/status') return { route: { page: 'status' } };

  return { route: { page: 'not-found', path } };
}

const RECENT_SEARCHES_KEY = 'amir_recent_searches_v1';

function loadStoredRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 6)
      : [];
  } catch {
    return [];
  }
}

function saveStoredRecentSearches(items: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 6)));
  } catch {
    // Ignore quota errors
  }
}

interface StoreContextValue {
  route: AppRoute;
  navigating: boolean;
  buildHref: (to: string) => string;
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, to: string, after?: () => void) => void;
  navigate: (to: string) => void;
  navigateToCatalog: (opts?: {
    category?: CategoryId;
    searchQuery?: string;
    discountedOnly?: boolean;
    brand?: string;
  }) => void;
  products: Product[];
  categories: CategoryItem[];
  brands: BrandItem[];
  refreshCatalogMetadata: () => Promise<void>;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  couponRules: CouponRule[];
  storeSettings: StoreSettings;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  cart: CartItem[];
  cartSummary: CartSummary;
  addToCart: (product: Product, opts?: { colorName?: string; colorHex?: string; storageLabel?: string; warranty?: string; unitPrice?: number; originalUnitPrice?: number; qty?: number }) => void;
  updateCartQty: (key: string, delta: number) => void;
  removeCartItem: (key: string) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { valid: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareIds: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  recentlyViewedIds: string[];
  markProductViewed: (productId: string) => void;
  stockAlerts: string[];
  toggleStockAlert: (productId: string) => void;
  orders: OrderRecord[];
  ordersLoading: boolean;
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
  createDemoOrder: (form: CheckoutFormData) => Promise<OrderRecord>;
  findOrder: (code: string) => Promise<OrderRecord | null>;
  lookupOrder: (code: string) => Promise<OrderLookupResult>;
  verifyGuestOrder: (code: string, phone: string) => Promise<OrderRecord>;
  user: DemoUser | null;
  authLoading: boolean;
  resendStatus: ResendServiceStatus | null;
  setAuthenticatedUser: (user: DemoUser) => void;
  loginDemoUser: (user: DemoUser) => void;
  logoutDemoUser: (allDevices?: boolean) => Promise<void>;
  updateUserProfile: (payload: {
    fullName: string;
    phone: string;
    nationalId?: string;
    birthDate?: string;
    newsletterOptIn?: boolean;
    avatarUrl?: string;
  }) => Promise<DemoUser>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
  addUserAddress: (payload: Omit<UserAddress, 'id'>) => Promise<DemoUser>;
  updateUserAddress: (id: string, payload: Omit<UserAddress, 'id'>) => Promise<DemoUser>;
  setDefaultUserAddress: (id: string) => Promise<DemoUser>;
  deleteUserAddress: (id: string) => Promise<DemoUser>;
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialParsed = useMemo(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const normalized = normalizeAppTarget(window.location.hash);
      window.history.replaceState(null, '', normalized);
      return parseAppUrl(normalized);
    }
    return parseAppUrl(`${window.location.pathname}${window.location.search}`);
  }, []);

  const [route, setRoute] = useState<AppRoute>(initialParsed.route);
  const [navigating, setNavigating] = useState<boolean>(false);
  const navTimerRef = useRef<number | null>(null);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORY_ITEMS);
  const [brands, setBrands] = useState<BrandItem[]>(DEFAULT_BRANDS);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadStoredRecentSearches());
  const [couponRules, setCouponRules] = useState<CouponRule[]>(DEFAULT_COUPON_RULES);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    announcementText: 'ارسال رایگان برای خریدهای بالای ۱ میلیون تومان به سراسر ایران',
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    supportPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
  });
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    category: initialParsed.categoryParam ?? 'all',
    searchQuery: initialParsed.queryParam ?? '',
    brands: initialParsed.brandParam ? [initialParsed.brandParam] : [],
  }));
  const [cart, setCart] = useState<CartItem[]>(() => storeRepository.loadCart());
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [guestWishlist, setGuestWishlist] = useState<string[]>(() => storeRepository.loadWishlist());
  const [compareIds, setCompareIds] = useState<string[]>(() => storeRepository.loadCompare());
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => storeRepository.loadRecent());
  const [stockAlerts, setStockAlerts] = useState<string[]>(() => storeRepository.loadStockAlerts());
  const [guestOrders, setGuestOrders] = useState<OrderRecord[]>(() => storeRepository.loadOrders());
  const [ordersState, setOrdersState] = useState<{
    userId: string | null;
    list: OrderRecord[];
    loading: boolean;
  }>({ userId: null, list: [], loading: false });
  const [user, setUser] = useState<DemoUser | null>(() => storeRepository.loadUser());
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [resendStatus, setResendStatus] = useState<ResendServiceStatus | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastItem['tone'] = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  const addRecentSearch = useCallback((q: string) => {
    const clean = q.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      saveStoredRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveStoredRecentSearches([]);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const fetched = await storeApi.getProducts();
      setProducts(fetched.map(hydrateProduct));
    } catch {
      // Keep current products if backend is temporarily unreachable
    }
  }, []);

  const refreshCatalogMetadata = useCallback(async () => {
    try {
      const [fetchedCats, fetchedBrands] = await Promise.all([
        storeApi.getCategories().catch(() => null),
        storeApi.getBrands().catch(() => null),
      ]);
      if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        setCategories(fetchedCats);
      }
      if (Array.isArray(fetchedBrands) && fetchedBrands.length > 0) {
        setBrands(fetchedBrands);
      }
    } catch {
      // Keep current metadata
    }
  }, []);

  useEffect(() => {
    let active = true;
    let lastRefreshAt = Date.now();
    Promise.all([
      storeApi.getProducts().catch(() => null),
      storeApi.getCategories().catch(() => null),
      storeApi.getBrands().catch(() => null),
      storeApi.getStoreConfig().catch(() => null),
      authApi.getStatus().catch(() => null),
    ]).then(([fetchedProducts, fetchedCats, fetchedBrands, fetchedConfig, authStatus]) => {
      if (!active) return;
      if (Array.isArray(fetchedProducts)) {
        setProducts(fetchedProducts.map(hydrateProduct));
      }
      if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        setCategories(fetchedCats);
      }
      if (Array.isArray(fetchedBrands) && fetchedBrands.length > 0) {
        setBrands(fetchedBrands);
      }
      setProductsLoading(false);
      if (fetchedConfig) {
        if (Array.isArray(fetchedConfig.coupons)) {
          setCouponRules(fetchedConfig.coupons);
        }
        if (fetchedConfig.settings) {
          setStoreSettings(fetchedConfig.settings);
        }
      }
      if (authStatus) {
        setResendStatus({
          resendConfigured: authStatus.resendConfigured,
          fromAddress: authStatus.fromAddress,
          usingTestSender: authStatus.usingTestSender,
        });
        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
          storeRepository.saveUser(authStatus.user);
        } else {
          setUser(null);
          setOrdersState({ userId: null, list: [], loading: false });
          storeRepository.saveUser(null);
        }
      }
      setAuthLoading(false);
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshAt > 30_000) {
        lastRefreshAt = Date.now();
        void refreshProducts();
        void refreshCatalogMetadata();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshCatalogMetadata, refreshProducts]);

  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) {
      setOrdersState({ userId: null, list: [], loading: false });
      return;
    }
    let active = true;
    setOrdersState((prev) => ({
      userId: uid,
      list: prev.userId === uid ? prev.list : [],
      loading: true,
    }));
    authApi
      .getMyOrders()
      .then((res) => {
        if (!active) return;
        setOrdersState({
          userId: uid,
          list: Array.isArray(res.orders) ? res.orders.map(hydrateOrderImages) : [],
          loading: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setOrdersState({ userId: uid, list: [], loading: false });
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const wishlist = useMemo(
    () => (user ? user.wishlist ?? [] : guestWishlist),
    [user, guestWishlist]
  );

  const ordersLoading = useMemo(() => {
    if (!user?.id) return false;
    return ordersState.loading || ordersState.userId !== user.id;
  }, [ordersState.loading, ordersState.userId, user?.id]);

  const orders = useMemo(
    () => (user ? (ordersState.userId === user.id ? ordersState.list : []) : guestOrders),
    [user, ordersState.userId, ordersState.list, guestOrders]
  );

  const triggerNavigationTransition = useCallback(() => {
    if (navTimerRef.current) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setNavigating(false);
      return;
    }
    setNavigating(true);
    navTimerRef.current = window.setTimeout(() => {
      setNavigating(false);
      navTimerRef.current = null;
    }, 180);
  }, []);

  useEffect(() => {
    const syncFromLocation = () => {
      const target =
        window.location.hash && window.location.hash.startsWith('#/')
          ? normalizeAppTarget(window.location.hash)
          : `${window.location.pathname}${window.location.search}`;
      const parsed = parseAppUrl(target);
      setRoute(parsed.route);
      if (parsed.route.page === 'catalog') {
        setFilters((prev) => ({
          ...prev,
          category: parsed.categoryParam ?? prev.category,
          searchQuery: parsed.queryParam !== undefined ? parsed.queryParam : prev.searchQuery,
          brands: parsed.brandParam ? [parsed.brandParam] : prev.brands,
        }));
      }
      triggerNavigationTransition();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, [triggerNavigationTransition]);

  useEffect(() => {
    const baseTitle = 'فروشگاه موبایل امیر | خرید گوشی موبایل، تبلت و لوازم جانبی اصل';
    const baseDesc =
      'مرجع تخصصی فروش گوشی موبایل پرچمدار اپل، سامسونگ، شیائومی و هواوی با گارانتی ۱۸ ماهه امیر سرویس و رجیستری همتا.';
    let title = baseTitle;
    let description = baseDesc;

    if (route.page === 'catalog') {
      if (filters.category === 'offers') {
        title = 'پیشنهادات طلایی و تخفیف‌های ویژه | فروشگاه موبایل امیر';
      } else if (filters.category !== 'all') {
        const activeCat = categories.find(
          (c) => c.slug === filters.category || c.id === filters.category
        );
        if (activeCat) {
          title = activeCat.seoTitle || `${activeCat.label} | فروشگاه موبایل امیر`;
          description = activeCat.seoDescription || activeCat.subtitle || baseDesc;
        }
      } else if (filters.searchQuery.trim()) {
        title = `نتایج جستجو: ${filters.searchQuery} | فروشگاه موبایل امیر`;
      } else {
        title = 'کاتالوگ محصولات | فروشگاه موبایل امیر';
      }
    } else if (route.page === 'product') {
      const prod = products.find((p) => p.slug === route.slug);
      if (prod) {
        title = `${prod.nameFa} | فروشگاه موبایل امیر`;
        description = `خرید و بررسی مشخصات ${prod.nameFa} (${prod.brand}) با گارانتی معتبر و ارسال سریع.`;
      }
    } else if (route.page === 'admin') {
      title = 'پنل مدیریت فروشگاه | فروشگاه موبایل امیر';
    } else if (route.page === 'account') {
      title = 'حساب کاربری | فروشگاه موبایل امیر';
    } else if (route.page === 'cart' || route.page === 'checkout') {
      title = 'سبد خرید و تکمیل سفارش | فروشگاه موبایل امیر';
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [categories, filters.category, filters.searchQuery, products, route]);

  const buildHref = useCallback((to: string): string => normalizeAppTarget(to), []);

  const navigate = useCallback(
    (to: string) => {
      const normalized = normalizeAppTarget(to);
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== normalized) {
        window.history.pushState(null, '', normalized);
      }
      const parsed = parseAppUrl(normalized);
      setRoute(parsed.route);
      if (parsed.route.page === 'catalog') {
        setFilters((prev) => ({
          ...prev,
          category: parsed.categoryParam ?? 'all',
          searchQuery: parsed.queryParam ?? '',
          brands: parsed.brandParam ? [parsed.brandParam] : [],
        }));
      }
      triggerNavigationTransition();
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [triggerNavigationTransition]
  );

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, to: string, after?: () => void) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      e.preventDefault();
      after?.();
      navigate(to);
    },
    [navigate]
  );

  const navigateToCatalog = useCallback(
    (opts?: {
      category?: CategoryId;
      searchQuery?: string;
      discountedOnly?: boolean;
      brand?: string;
    }) => {
      const cat = opts?.category ?? 'all';
      const q = opts?.searchQuery ?? '';
      if (q.trim()) {
        addRecentSearch(q.trim());
      }
      setFilters({
        ...DEFAULT_FILTERS,
        category: cat,
        searchQuery: q,
        brands: opts?.brand ? [opts.brand] : [],
        discountedOnly: Boolean(opts?.discountedOnly),
      });
      const params = new URLSearchParams();
      if (cat !== 'all') params.set('cat', cat);
      if (q.trim()) params.set('q', q.trim());
      if (opts?.brand) params.set('brand', opts.brand);
      const suffix = params.toString();
      navigate(suffix ? `/catalog?${suffix}` : '/catalog');
    },
    [addRecentSearch, navigate]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      opts?: {
        colorName?: string;
        colorHex?: string;
        storageLabel?: string;
        warranty?: string;
        unitPrice?: number;
        originalUnitPrice?: number;
        qty?: number;
      }
    ) => {
      if (!product.inStock) {
        showToast('این کالا در حال حاضر ناموجود است.', 'info');
        return;
      }
      const color = product.colors[0];
      const storage = product.storageOptions[0];
      const colorName = opts?.colorName ?? color?.name ?? product.colorLabel;
      const colorHex = opts?.colorHex ?? color?.hex ?? '#1e293b';
      const storageLabel = opts?.storageLabel ?? storage?.label ?? product.specs.storageDefault;
      const warranty = opts?.warranty ?? product.warranty;
      const unitPrice = opts?.unitPrice ?? product.price;
      const originalUnitPrice = opts?.originalUnitPrice ?? product.originalPrice ?? product.price;
      const addQty = Math.max(1, opts?.qty ?? 1);
      const key = `${product.id}__${colorName}__${storageLabel}__${warranty}`;

      setCart((prev) => {
        const idx = prev.findIndex((item) => item.key === key);
        let updated: CartItem[];
        if (idx >= 0) {
          updated = prev.map((item, i) =>
            i === idx
              ? { ...item, qty: Math.min(product.stockCount || 10, item.qty + addQty) }
              : item
          );
        } else {
          updated = [
            ...prev,
            {
              key,
              productId: product.id,
              slug: product.slug,
              nameFa: product.nameFa,
              brand: product.brand,
              image: product.image,
              colorName,
              colorHex,
              storageLabel,
              warranty,
              unitPrice,
              originalUnitPrice,
              qty: Math.min(product.stockCount || 10, addQty),
              stockCount: product.stockCount,
            },
          ];
        }
        storeRepository.saveCart(updated);
        return updated;
      });
      showToast(`«${product.nameFa}» به سبد خرید اضافه شد.`, 'success');
    },
    [showToast]
  );

  const updateCartQty = useCallback((key: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.key !== key) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return { ...item, qty: Math.min(item.stockCount || 10, nextQty) };
        })
        .filter((x): x is CartItem => x !== null);
      storeRepository.saveCart(updated);
      return updated;
    });
  }, []);

  const removeCartItem = useCallback(
    (key: string) => {
      setCart((prev) => {
        const updated = prev.filter((item) => item.key !== key);
        storeRepository.saveCart(updated);
        return updated;
      });
      showToast('کالا از سبد خرید حذف شد.', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    storeRepository.saveCart([]);
  }, []);

  const cartSummary = useMemo(
    () =>
      calculateCartSummary(
        cart,
        appliedCoupon,
        couponRules,
        storeSettings.freeShippingThreshold
      ),
    [cart, appliedCoupon, couponRules, storeSettings.freeShippingThreshold]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const evaluation = evaluateCoupon(code, cartSummary.netSubtotal, couponRules);
      if (evaluation.valid && evaluation.code) {
        setAppliedCoupon(evaluation.code);
        showToast(evaluation.message, 'success');
      } else {
        showToast(evaluation.message, 'error');
      }
      return { valid: evaluation.valid, message: evaluation.message };
    },
    [cartSummary.netSubtotal, couponRules, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('کد تخفیف حذف شد.', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      if (user) {
        const previousWishlist = user.wishlist ?? [];
        const exists = previousWishlist.includes(productId);
        const optimisticWishlist = exists
          ? previousWishlist.filter((id) => id !== productId)
          : [...previousWishlist, productId];

        const optimisticUser = { ...user, wishlist: optimisticWishlist };
        setUser(optimisticUser);
        storeRepository.saveUser(optimisticUser);

        void authApi
          .toggleWishlist(productId)
          .then((res) => {
            setUser(res.user);
            storeRepository.saveUser(res.user);
            showToast(
              res.added
                ? 'به لیست علاقه‌مندی‌های حساب کاربری اضافه شد.'
                : 'از لیست علاقه‌مندی‌ها حذف شد.',
              'info'
            );
          })
          .catch((err) => {
            const revertedUser = { ...user, wishlist: previousWishlist };
            setUser(revertedUser);
            storeRepository.saveUser(revertedUser);
            showToast(
              err instanceof Error ? err.message : 'خطا در ذخیره علاقه‌مندی در پایگاه داده.',
              'error'
            );
          });
        return;
      }

      setGuestWishlist((prev) => {
        const exists = prev.includes(productId);
        const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        storeRepository.saveWishlist(updated);
        showToast(
          exists ? 'از لیست علاقه‌مندی‌ها حذف شد.' : 'به لیست علاقه‌مندی‌های شما اضافه شد.',
          'info'
        );
        return updated;
      });
    },
    [showToast, user]
  );

  const toggleCompare = useCallback(
    (productId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          const updated = prev.filter((id) => id !== productId);
          storeRepository.saveCompare(updated);
          showToast('محصول از لیست مقایسه حذف شد.', 'info');
          return updated;
        }
        if (prev.length >= 3) {
          showToast('حداکثر ۳ کالا به‌طور هم‌زمان قابل مقایسه هستند.', 'error');
          return prev;
        }
        const updated = [...prev, productId];
        storeRepository.saveCompare(updated);
        showToast('محصول به لیست مقایسه اضافه شد.', 'success');
        return updated;
      });
    },
    [showToast]
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    storeRepository.saveCompare([]);
  }, []);

  const markProductViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => {
      const updated = [productId, ...prev.filter((id) => id !== productId)].slice(0, 6);
      storeRepository.saveRecent(updated);
      return updated;
    });
  }, []);

  const toggleStockAlert = useCallback(
    (productId: string) => {
      const updated = storeRepository.toggleStockAlert(productId);
      setStockAlerts(updated);
      const isAdded = updated.includes(productId);
      showToast(
        isAdded
          ? 'درخواست اطلاع‌رسانی موجودی ثبت شد؛ به محض شارژ شدن به شما اطلاع می‌دهیم.'
          : 'اطلاع‌رسانی موجودی لغو شد.',
        'info'
      );
    },
    [showToast]
  );

  const createDemoOrder = useCallback(
    async (form: CheckoutFormData): Promise<OrderRecord> => {
      const summary = calculateCartSummary(
        cart,
        appliedCoupon,
        couponRules,
        storeSettings.freeShippingThreshold
      );
      const code = generateOrderCode();
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const draftOrder: OrderRecord = {
        orderCode: code,
        shaparakRef: String(Math.floor(10000000 + Math.random() * 89999999)),
        customerName: form.fullName.trim(),
        customerPhone: toEnglishDigits(form.phone.trim()),
        city: form.city.trim(),
        shippingAddress: form.address.trim(),
        postalCode: toEnglishDigits(form.postalCode.trim()),
        deliverySlot: form.deliverySlot,
        couponCode: appliedCoupon,
        subtotal: summary.netSubtotal,
        productDiscount: summary.productDiscount,
        couponDiscount: summary.couponDiscount,
        shippingCost: summary.shippingCost,
        totalAmount: summary.totalPayable,
        status: 'preparing',
        deliveryPin: toPersianDigits(Math.floor(1000 + Math.random() * 8999)),
        imeiSample: `35918239${Math.floor(1000000 + Math.random() * 8999999)}`,
        items: [...cart],
        createdAt: `امروز · ساعت ${toPersianDigits(hh)}:${toPersianDigits(mm)}`,
      };

      const res = await authApi.createOrder(draftOrder);
      const saved = hydrateOrderImages(res.order);

      if (user) {
        const uid = user.id ?? null;
        setOrdersState((prev) => ({
          userId: uid,
          list: [saved, ...prev.list.filter((o) => o.orderCode !== saved.orderCode)],
          loading: false,
        }));
      } else {
        setGuestOrders((prev) => [saved, ...prev.filter((o) => o.orderCode !== saved.orderCode)]);
      }

      clearCart();
      void refreshProducts();
      showToast(`سفارش ${saved.orderCode} با موفقیت ثبت شد.`, 'success');
      return saved;
    },
    [appliedCoupon, cart, clearCart, couponRules, refreshProducts, showToast, storeSettings.freeShippingThreshold, user]
  );

  const lookupOrder = useCallback(async (code: string): Promise<OrderLookupResult> => {
    const result = await authApi.lookupOrderByCode(code);
    if (result.order) {
      return {
        ...result,
        order: hydrateOrderImages(result.order),
      };
    }
    return result;
  }, []);

  const verifyGuestOrder = useCallback(
    async (code: string, phone: string): Promise<OrderRecord> => {
      const res = await authApi.verifyGuestOrder(code, phone);
      const hydrated = hydrateOrderImages(res.order);
      if (!user) {
        setGuestOrders((prev) => [
          hydrated,
          ...prev.filter((o) => o.orderCode !== hydrated.orderCode),
        ]);
      }
      return hydrated;
    },
    [user]
  );

  const findOrder = useCallback(
    async (code: string) => {
      const res = await lookupOrder(code);
      return res.order;
    },
    [lookupOrder]
  );

  const setAuthenticatedUser = useCallback((nextUser: DemoUser) => {
    storeRepository.saveUser(nextUser);
    setUser(nextUser);
  }, []);

  const loginDemoUser = useCallback(
    (nextUser: DemoUser) => {
      storeRepository.saveUser(nextUser);
      setUser(nextUser);
      showToast(`خوش آمدید، ${nextUser.fullName}!`, 'success');
    },
    [showToast]
  );

  const logoutDemoUser = useCallback(
    async (allDevices = false) => {
      try {
        await authApi.logout(allDevices);
      } catch {
        // Ignore offline fallback
      }
      storeRepository.saveUser(null);
      setOrdersState({ userId: null, list: [], loading: false });
      setUser(null);
      showToast(
        allDevices ? 'از همه نشست‌ها و دستگاه‌ها خارج شدید.' : 'از حساب کاربری خارج شدید.',
        'info'
      );
    },
    [showToast]
  );

  const updateUserProfile = useCallback(
    async (payload: {
      fullName: string;
      phone: string;
      nationalId?: string;
      birthDate?: string;
      newsletterOptIn?: boolean;
      avatarUrl?: string;
    }) => {
      const res = await authApi.updateProfile(payload);
      setAuthenticatedUser(res.user);
      showToast('مشخصات حساب کاربری با موفقیت به‌روزرسانی شد.', 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  const deleteUserAccount = useCallback(
    async (currentPassword?: string) => {
      await authApi.deleteAccount({ currentPassword });
      storeRepository.saveUser(null);
      setOrdersState({ userId: null, list: [], loading: false });
      setUser(null);
      showToast('حساب کاربری شما با موفقیت حذف شد.', 'info');
      navigate('/');
    },
    [navigate, showToast]
  );

  const addUserAddress = useCallback(
    async (payload: Omit<UserAddress, 'id'>) => {
      const res = await authApi.addAddress(payload);
      setAuthenticatedUser(res.user);
      showToast('آدرس جدید به دفترچه آدرس‌ها اضافه شد.', 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  const updateUserAddress = useCallback(
    async (id: string, payload: Omit<UserAddress, 'id'>) => {
      const res = await authApi.updateAddress(id, payload);
      setAuthenticatedUser(res.user);
      showToast('آدرس با موفقیت ویرایش شد.', 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  const setDefaultUserAddress = useCallback(
    async (id: string) => {
      const res = await authApi.setDefaultAddress(id);
      setAuthenticatedUser(res.user);
      showToast('آدرس پیش‌فرض ارسال تغییر یافت.', 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  const deleteUserAddress = useCallback(
    async (id: string) => {
      const res = await authApi.deleteAddress(id);
      setAuthenticatedUser(res.user);
      showToast('آدرس حذف شد.', 'info');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        route,
        navigating,
        buildHref,
        handleLinkClick,
        navigate,
        navigateToCatalog,
        products,
        categories,
        brands,
        refreshCatalogMetadata,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        couponRules,
        storeSettings,
        filters,
        setFilters,
        resetFilters,
        cart,
        cartSummary,
        addToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        compareIds,
        toggleCompare,
        clearCompare,
        recentlyViewedIds,
        markProductViewed,
        stockAlerts,
        toggleStockAlert,
        orders,
        ordersLoading,
        productsLoading,
        refreshProducts,
        createDemoOrder,
        findOrder,
        lookupOrder,
        verifyGuestOrder,
        user,
        authLoading,
        resendStatus,
        setAuthenticatedUser,
        loginDemoUser,
        logoutDemoUser,
        updateUserProfile,
        deleteUserAccount,
        addUserAddress,
        updateUserAddress,
        setDefaultUserAddress,
        deleteUserAddress,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
