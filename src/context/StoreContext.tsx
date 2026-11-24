import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORY_ITEMS,
  DEFAULT_BRANDS,
  hydrateOrderImages,
  hydrateProduct,
  resolveProductImage,
  SEED_PRODUCTS,
} from '../data/catalog';
import { authApi, storeApi } from '../lib/authApi';
import { localStore } from '../lib/localStore';
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
  UserNotification,
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
import {
  applyDocumentSeoMeta,
  buildRouteSeoMetadata,
  SITE_ORIGIN,
} from '../utils/seo';

export type AppRoute =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; slug: string }
  | { page: 'blog' }
  | { page: 'blog-detail'; slug: string }
  | { page: 'compare' }
  | { page: 'installments' }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'order-confirmed'; code: string }
  | { page: 'tracking'; code?: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'faq' }
  | { page: 'terms' }
  | { page: 'account' }
  | { page: 'public-profile'; username: string }
  | { page: 'status' }
  | { page: 'not-found'; path: string };

export interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
  image?: string;
  actionLabel?: string;
  actionHref?: string;
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
  attributeFilters: {},
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
  if (path === '/blog') {
    return { route: { page: 'blog' } };
  }
  if (path.startsWith('/blog/')) {
    const slug = decodeURIComponent(path.replace('/blog/', '').trim());
    return slug ? { route: { page: 'blog-detail', slug } } : { route: { page: 'not-found', path } };
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
  if (path === '/faq') return { route: { page: 'faq' } };
  if (path === '/terms') return { route: { page: 'terms' } };
  if (path === '/account') return { route: { page: 'account' } };
  if (path.startsWith('/u/')) {
    const rawUsername = decodeURIComponent(path.replace('/u/', '').trim())
      .replace(/^@+/, '')
      .toLowerCase();
    return rawUsername
      ? { route: { page: 'public-profile', username: rawUsername } }
      : { route: { page: 'not-found', path } };
  }
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
  removeRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  couponRules: CouponRule[];
  storeSettings: StoreSettings;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  cart: CartItem[];
  cartSummary: CartSummary;
  cartPulseTick: number;
  addToCart: (
    product: Product,
    opts?: {
      variantId?: string;
      sku?: string;
      partNumber?: string;
      simType?: string;
      colorName?: string;
      colorHex?: string;
      storageLabel?: string;
      warranty?: string;
      unitPrice?: number;
      originalUnitPrice?: number;
      stockCount?: number;
      qty?: number;
    }
  ) => void;
  updateCartQty: (key: string, delta: number) => void;
  removeCartItem: (key: string) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<{ valid: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareIds: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  recentlyViewedIds: string[];
  markProductViewed: (productId: string) => void;
  stockAlerts: string[];
  toggleStockAlert: (
    productId: string,
    opts?: { email?: string; variantId?: string | null }
  ) => Promise<boolean>;
  notifications: UserNotification[];
  unreadNotificationCount: number;
  notificationsLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  orders: OrderRecord[];
  ordersLoading: boolean;
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
  upsertProduct: (fresh: Product) => void;
  createDemoOrder: (form: CheckoutFormData) => Promise<OrderRecord>;
  cancelCustomerOrder: (orderCode: string, phone?: string) => Promise<OrderRecord>;
  reorderFromOrder: (order: OrderRecord) => Promise<{ addedCount: number; skippedCount: number }>;
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
    username?: string;
    nationalId?: string;
    birthDate?: string;
    newsletterOptIn?: boolean;
    avatarUrl?: string;
  }) => Promise<DemoUser>;
  updateUserUsername: (username: string) => Promise<DemoUser>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
  addUserAddress: (payload: Omit<UserAddress, 'id'>) => Promise<DemoUser>;
  updateUserAddress: (id: string, payload: Omit<UserAddress, 'id'>) => Promise<DemoUser>;
  setDefaultUserAddress: (id: string) => Promise<DemoUser>;
  deleteUserAddress: (id: string) => Promise<DemoUser>;
  toasts: ToastItem[];
  showToast: (
    message: string,
    tone?: ToastItem['tone'],
    meta?: { image?: string; actionLabel?: string; actionHref?: string }
  ) => void;
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
  const [products, setProducts] = useState<Product[]>([]);
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
  const [cart, setCart] = useState<CartItem[]>(() => localStore.loadCart());
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() =>
    localStore.loadAppliedCoupon()
  );
  const [guestWishlist, setGuestWishlist] = useState<string[]>(() => localStore.loadWishlist());
  const [compareIds, setCompareIds] = useState<string[]>(() => localStore.loadCompare());
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => localStore.loadRecent());
  const [stockAlerts, setStockAlerts] = useState<string[]>(() => localStore.loadStockAlerts());
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  const [guestOrders, setGuestOrders] = useState<OrderRecord[]>(() => localStore.loadOrders());
  const [ordersState, setOrdersState] = useState<{
    userId: string | null;
    list: OrderRecord[];
    loading: boolean;
  }>({ userId: null, list: [], loading: false });
  const [user, setUser] = useState<DemoUser | null>(() => localStore.loadUser());
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [resendStatus, setResendStatus] = useState<ResendServiceStatus | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [cartPulseTick, setCartPulseTick] = useState<number>(0);

  const userRef = useRef<DemoUser | null>(user);
  const cartRef = useRef<CartItem[]>(cart);
  const guestWishlistRef = useRef<string[]>(guestWishlist);
  const stockAlertsRef = useRef<string[]>(stockAlerts);
  const cartMutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const wishlistMutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    guestWishlistRef.current = guestWishlist;
  }, [guestWishlist]);

  useEffect(() => {
    stockAlertsRef.current = stockAlerts;
  }, [stockAlerts]);

  const hydrateCartList = useCallback((items: CartItem[]): CartItem[] => {
    return items.map((item) => ({
      ...item,
      image: resolveProductImage(item.image, item.productId || item.slug, item.brand),
    }));
  }, []);

  const syncAuthenticatedCart = useCallback(
    (nextCart: CartItem[]) => {
      cartMutationQueueRef.current = cartMutationQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (!userRef.current) return;
          const res = await authApi.replaceCart(nextCart);
          const hydrated = hydrateCartList(res.items || []);
          cartRef.current = hydrated;
          setCart(hydrated);
          localStore.saveCart(hydrated);
        })
        .catch(() => undefined);
    },
    [hydrateCartList]
  );

  const hydrateAuthenticatedSession = useCallback(
    async (authedUser: DemoUser, isExplicitLogin: boolean) => {
      let nextUser = authedUser;
      const pendingGuestWishlist = guestWishlistRef.current;
      if (pendingGuestWishlist.length > 0) {
        const mergedWishlist = Array.from(
          new Set([...(authedUser.wishlist || []), ...pendingGuestWishlist])
        );
        try {
          const savedWl = await authApi.saveWishlist(mergedWishlist);
          nextUser = { ...authedUser, ...savedWl.user, wishlist: savedWl.wishlist };
        } catch {
          // Keep current user wishlist if offline
        }
        setGuestWishlist([]);
        guestWishlistRef.current = [];
        localStore.saveWishlist([]);
      }

      userRef.current = nextUser;
      setUser(nextUser);
      localStore.saveUser(nextUser);

      const guestCartItems = cartRef.current;
      const shouldMergeCart =
        localStore.hasGuestCartDirty() || (isExplicitLogin && guestCartItems.length > 0);
      try {
        const res = shouldMergeCart
          ? await authApi.mergeCart(guestCartItems)
          : await authApi.getCart();
        const hydrated = hydrateCartList(res.items || []);
        cartRef.current = hydrated;
        setCart(hydrated);
        localStore.saveCart(hydrated);
        localStore.setGuestCartDirty(false);
      } catch {
        // Keep existing local cart if offline
      }

      setNotificationsLoading(true);
      const [alertsResult, notifResult] = await Promise.allSettled([
        authApi.getStockAlerts(),
        authApi.getNotifications(),
      ]);
      if (alertsResult.status === 'fulfilled' && Array.isArray(alertsResult.value.productIds)) {
        const serverAlertIds = alertsResult.value.productIds;
        stockAlertsRef.current = serverAlertIds;
        setStockAlerts(serverAlertIds);
      }
      if (notifResult.status === 'fulfilled' && Array.isArray(notifResult.value.notifications)) {
        setNotifications(notifResult.value.notifications);
      }
      setNotificationsLoading(false);

      return nextUser;
    },
    [hydrateCartList]
  );

  const refreshNotifications = useCallback(async () => {
    if (!userRef.current) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const res = await authApi.getNotifications();
      setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
    } catch {
      // Keep current notifications if offline
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await authApi.markNotificationRead(id);
    } catch {
      // Keep optimistic state if offline
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await authApi.markAllNotificationsRead();
    } catch {
      // Keep optimistic state if offline
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await authApi.deleteNotification(id);
    } catch {
      // Keep optimistic state if offline
    }
  }, []);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      tone: ToastItem['tone'] = 'success',
      meta?: { image?: string; actionLabel?: string; actionHref?: string }
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, ...meta }]);
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

  const removeRecentSearch = useCallback((q: string) => {
    const clean = q.trim().toLowerCase();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item.toLowerCase() !== clean);
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

  const upsertProduct = useCallback((fresh: Product) => {
    const hydrated = hydrateProduct(fresh);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === hydrated.id || p.slug === hydrated.slug);
      if (idx === -1) return [hydrated, ...prev];
      const next = [...prev];
      next[idx] = hydrated;
      return next;
    });
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
      } else {
        // Offline / unreachable backend fallback only after the live request actually fails
        setProducts((prev) => (prev.length > 0 ? prev : SEED_PRODUCTS));
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
          userRef.current = authStatus.user;
          setUser(authStatus.user);
          localStore.saveUser(authStatus.user);
          void hydrateAuthenticatedSession(authStatus.user, false);
        } else {
          userRef.current = null;
          setUser(null);
          setNotifications([]);
          setOrdersState({ userId: null, list: [], loading: false });
          localStore.saveUser(null);
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
  }, [hydrateAuthenticatedSession, refreshCatalogMetadata, refreshProducts]);

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
    const seoMeta = buildRouteSeoMetadata({
      route,
      categories,
      products,
      activeCategory: filters.category,
      searchQuery: filters.searchQuery,
      origin: SITE_ORIGIN,
    });
    applyDocumentSeoMeta(seoMeta);
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
        variantId?: string;
        sku?: string;
        partNumber?: string;
        simType?: string;
        colorName?: string;
        colorHex?: string;
        storageLabel?: string;
        warranty?: string;
        unitPrice?: number;
        originalUnitPrice?: number;
        stockCount?: number;
        qty?: number;
      }
    ) => {
      const effectiveStock = opts?.stockCount ?? product.stockCount;
      if (!product.inStock || effectiveStock <= 0) {
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
      const key = `${product.id}__${opts?.variantId || colorName}__${storageLabel}__${warranty}`;

      const prev = cartRef.current;
      const idx = prev.findIndex((item) => item.key === key);
      let updated: CartItem[];
      if (idx >= 0) {
        updated = prev.map((item, i) =>
          i === idx
            ? { ...item, qty: Math.min(effectiveStock || 10, item.qty + addQty) }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            key,
            productId: product.id,
            ...(opts?.variantId ? { variantId: opts.variantId } : {}),
            ...(opts?.sku ? { sku: opts.sku } : {}),
            ...(opts?.partNumber ? { partNumber: opts.partNumber } : {}),
            ...(opts?.simType ? { simType: opts.simType } : {}),
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
            qty: Math.min(effectiveStock || 10, addQty),
            stockCount: effectiveStock,
          },
        ];
      }
      cartRef.current = updated;
      setCart(updated);
      localStore.saveCart(updated);
      if (userRef.current) {
        syncAuthenticatedCart(updated);
      } else {
        localStore.setGuestCartDirty(true);
      }

      setCartPulseTick((n) => n + 1);

      showToast(`«${product.nameFa}» به سبد خرید اضافه شد.`, 'success', {
        image: product.image,
        actionLabel: 'مشاهده سبد',
        actionHref: '/cart',
      });
    },
    [showToast, syncAuthenticatedCart]
  );

  const updateCartQty = useCallback(
    (key: string, delta: number) => {
      const updated = cartRef.current
        .map((item) => {
          if (item.key !== key) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return { ...item, qty: Math.min(item.stockCount || 10, nextQty) };
        })
        .filter((x): x is CartItem => x !== null);
      cartRef.current = updated;
      setCart(updated);
      localStore.saveCart(updated);
      if (userRef.current) {
        syncAuthenticatedCart(updated);
      } else {
        localStore.setGuestCartDirty(true);
      }
    },
    [syncAuthenticatedCart]
  );

  const removeCartItem = useCallback(
    (key: string) => {
      const updated = cartRef.current.filter((item) => item.key !== key);
      cartRef.current = updated;
      setCart(updated);
      localStore.saveCart(updated);
      if (userRef.current) {
        syncAuthenticatedCart(updated);
      } else {
        localStore.setGuestCartDirty(true);
      }
      showToast('کالا از سبد خرید حذف شد.', 'info');
    },
    [showToast, syncAuthenticatedCart]
  );

  const clearCart = useCallback(() => {
    cartRef.current = [];
    setCart([]);
    setAppliedCoupon(null);
    localStore.saveCart([]);
    localStore.saveAppliedCoupon(null);
    localStore.setGuestCartDirty(false);
    if (userRef.current) {
      syncAuthenticatedCart([]);
    }
  }, [syncAuthenticatedCart]);

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
    async (code: string): Promise<{ valid: boolean; message: string }> => {
      try {
        const evaluation = await storeApi.validateCoupon(code, cartSummary.netSubtotal);
        if (evaluation.valid && evaluation.code) {
          setAppliedCoupon(evaluation.code);
          localStore.saveAppliedCoupon(evaluation.code);
          showToast(evaluation.message, 'success');
        } else {
          showToast(evaluation.message, 'error');
        }
        return { valid: evaluation.valid, message: evaluation.message };
      } catch {
        const fallback = evaluateCoupon(code, cartSummary.netSubtotal, couponRules);
        if (fallback.valid && fallback.code) {
          setAppliedCoupon(fallback.code);
          localStore.saveAppliedCoupon(fallback.code);
          showToast(fallback.message, 'success');
        } else {
          showToast(fallback.message, 'error');
        }
        return { valid: fallback.valid, message: fallback.message };
      }
    },
    [cartSummary.netSubtotal, couponRules, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    localStore.saveAppliedCoupon(null);
    showToast('کد تخفیف حذف شد.', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const activeUser = userRef.current;
      if (activeUser) {
        const previousWishlist = activeUser.wishlist ?? [];
        const exists = previousWishlist.includes(productId);
        const optimisticWishlist = exists
          ? previousWishlist.filter((id) => id !== productId)
          : [...previousWishlist, productId];

        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, wishlist: optimisticWishlist };
          userRef.current = next;
          localStore.saveUser(next);
          return next;
        });

        wishlistMutationQueueRef.current = wishlistMutationQueueRef.current
          .catch(() => undefined)
          .then(async () => {
            try {
              const res = await authApi.toggleWishlist(productId);
              setUser((prev) => {
                const next = prev
                  ? { ...prev, ...res.user, wishlist: res.wishlist }
                  : res.user;
                userRef.current = next;
                localStore.saveUser(next);
                return next;
              });
              showToast(
                res.added
                  ? 'به لیست علاقه‌مندی‌های حساب کاربری اضافه شد.'
                  : 'از لیست علاقه‌مندی‌ها حذف شد.',
                'info'
              );
            } catch (err) {
              setUser((prev) => {
                if (!prev) return prev;
                const curr = prev.wishlist ?? [];
                const reverted = exists
                  ? curr.includes(productId)
                    ? curr
                    : [...curr, productId]
                  : curr.filter((id) => id !== productId);
                const next = { ...prev, wishlist: reverted };
                userRef.current = next;
                localStore.saveUser(next);
                return next;
              });
              showToast(
                err instanceof Error ? err.message : 'خطا در ذخیره علاقه‌مندی در پایگاه داده.',
                'error'
              );
            }
          });
        return;
      }

      setGuestWishlist((prev) => {
        const exists = prev.includes(productId);
        const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        guestWishlistRef.current = updated;
        localStore.saveWishlist(updated);
        showToast(
          exists ? 'از لیست علاقه‌مندی‌ها حذف شد.' : 'به لیست علاقه‌مندی‌های شما اضافه شد.',
          'info'
        );
        return updated;
      });
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    (productId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          const updated = prev.filter((id) => id !== productId);
          localStore.saveCompare(updated);
          showToast('محصول از لیست مقایسه حذف شد.', 'info');
          return updated;
        }
        if (prev.length >= 3) {
          showToast('حداکثر ۳ کالا به‌طور هم‌زمان قابل مقایسه هستند.', 'error');
          return prev;
        }
        const updated = [...prev, productId];
        localStore.saveCompare(updated);
        showToast('محصول به لیست مقایسه اضافه شد.', 'success');
        return updated;
      });
    },
    [showToast]
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    localStore.saveCompare([]);
  }, []);

  const markProductViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => {
      const updated = [productId, ...prev.filter((id) => id !== productId)].slice(0, 6);
      localStore.saveRecent(updated);
      return updated;
    });
  }, []);

  const toggleStockAlert = useCallback(
    async (
      productId: string,
      opts?: { email?: string; variantId?: string | null }
    ): Promise<boolean> => {
      const currentlySubscribed = stockAlertsRef.current.includes(productId);
      const guestEmail = opts?.email?.trim();

      if (userRef.current || guestEmail) {
        try {
          if (currentlySubscribed) {
            await storeApi.removeStockAlert(productId, guestEmail || undefined);
            const updated = stockAlertsRef.current.filter((id) => id !== productId);
            stockAlertsRef.current = updated;
            setStockAlerts(updated);
            if (!userRef.current) {
              localStore.toggleStockAlert(productId);
            }
            showToast('اطلاع‌رسانی موجودی لغو شد.', 'info');
            return false;
          } else {
            await storeApi.subscribeStockAlert({
              productId,
              variantId: opts?.variantId ?? null,
              email: guestEmail || undefined,
            });
            const updated = stockAlertsRef.current.includes(productId)
              ? stockAlertsRef.current
              : [...stockAlertsRef.current, productId];
            stockAlertsRef.current = updated;
            setStockAlerts(updated);
            if (!userRef.current && !localStore.loadStockAlerts().includes(productId)) {
              localStore.toggleStockAlert(productId);
            }
            showToast(
              'درخواست اطلاع‌رسانی موجودی ثبت شد؛ به محض شارژ شدن به شما اطلاع می‌دهیم.',
              'success'
            );
            return true;
          }
        } catch (err) {
          showToast(
            err instanceof Error ? err.message : 'خطا در ثبت درخواست اطلاع‌رسانی موجودی.',
            'error'
          );
          return currentlySubscribed;
        }
      }

      const updated = localStore.toggleStockAlert(productId);
      stockAlertsRef.current = updated;
      setStockAlerts(updated);
      const isAdded = updated.includes(productId);
      showToast(
        isAdded
          ? 'درخواست اطلاع‌رسانی موجودی ثبت شد؛ به محض شارژ شدن به شما اطلاع می‌دهیم.'
          : 'اطلاع‌رسانی موجودی لغو شد.',
        'info'
      );
      return isAdded;
    },
    [showToast]
  );

  const createDemoOrder = useCallback(
    async (form: CheckoutFormData): Promise<OrderRecord> => {
      const summary = calculateCartSummary(
        cart,
        appliedCoupon,
        couponRules,
        storeSettings.freeShippingThreshold,
        { city: form.city, deliverySlot: form.deliverySlot }
      );
      const code = generateOrderCode();
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const cleanEmail = form.email?.trim() || undefined;
      const draftOrder: OrderRecord = {
        orderCode: code,
        shaparakRef: String(Math.floor(10000000 + Math.random() * 89999999)),
        customerName: form.fullName.trim(),
        customerPhone: toEnglishDigits(form.phone.trim()),
        ...(cleanEmail ? { customerEmail: cleanEmail } : {}),
        city: form.city.trim(),
        shippingAddress: form.address.trim(),
        postalCode: toEnglishDigits(form.postalCode.trim()),
        deliverySlot: summary.deliverySlot,
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
        setGuestOrders((prev) => {
          const next = [saved, ...prev.filter((o) => o.orderCode !== saved.orderCode)];
          localStore.saveOrders(next);
          return next;
        });
      }

      clearCart();
      void refreshProducts();
      showToast(`سفارش ${saved.orderCode} با موفقیت ثبت شد.`, 'success');
      return saved;
    },
    [appliedCoupon, cart, clearCart, couponRules, refreshProducts, showToast, storeSettings.freeShippingThreshold, user]
  );

  const cancelCustomerOrder = useCallback(
    async (orderCode: string, phone?: string): Promise<OrderRecord> => {
      const res = await authApi.cancelOrder(orderCode, { phone });
      const updated = hydrateOrderImages(res.order);
      if (userRef.current) {
        setOrdersState((prev) => ({
          ...prev,
          list: prev.list.map((o) => (o.orderCode === updated.orderCode ? updated : o)),
        }));
      } else {
        setGuestOrders((prev) => {
          const next = prev.map((o) => (o.orderCode === updated.orderCode ? updated : o));
          localStore.saveOrders(next);
          return next;
        });
      }
      showToast(`سفارش ${updated.orderCode} با موفقیت لغو شد.`, 'info');
      return updated;
    },
    [showToast]
  );

  const reorderFromOrder = useCallback(
    async (order: OrderRecord): Promise<{ addedCount: number; skippedCount: number }> => {
      let liveProducts = products;
      try {
        const fetched = await storeApi.getProducts();
        if (Array.isArray(fetched) && fetched.length > 0) {
          liveProducts = fetched.map(hydrateProduct);
          setProducts(liveProducts);
        }
      } catch {
        // Fallback to current cached products if network fails
      }

      const pdpCache = new Map<string, Product>();
      let addedCount = 0;
      let skippedCount = 0;
      let nextCart = [...cartRef.current];

      for (const item of order.items) {
        const baseProduct = liveProducts.find(
          (p) => p.id === item.productId || p.slug === item.slug
        );
        if (!baseProduct) {
          skippedCount += 1;
          continue;
        }
        let detailedProduct = pdpCache.get(baseProduct.slug);
        if (!detailedProduct) {
          try {
            const pdpRes = await storeApi.getProductBySlug(baseProduct.slug);
            detailedProduct = hydrateProduct(pdpRes.product);
          } catch {
            detailedProduct = baseProduct;
          }
          pdpCache.set(baseProduct.slug, detailedProduct);
        }

        const matchedVariant = item.variantId
          ? detailedProduct.variants?.find((v) => v.id === item.variantId)
          : item.sku
          ? detailedProduct.variants?.find((v) => v.sku === item.sku)
          : undefined;

        const availableStock =
          typeof matchedVariant?.availableStock === 'number'
            ? matchedVariant.availableStock
            : detailedProduct.stockCount;

        if (!detailedProduct.inStock || availableStock <= 0) {
          skippedCount += 1;
          continue;
        }

        const unitPrice = matchedVariant ? matchedVariant.priceToman : detailedProduct.price;
        const originalUnitPrice = matchedVariant
          ? matchedVariant.originalPriceToman || matchedVariant.priceToman
          : detailedProduct.originalPrice || detailedProduct.price;
        const colorName = matchedVariant?.colorNameFa || item.colorName;
        const colorHex = matchedVariant?.colorHex || item.colorHex;
        const storageLabel = matchedVariant?.storage || item.storageLabel;
        const warranty = item.warranty || matchedVariant?.warrantyName || detailedProduct.warranty;
        const key = `${detailedProduct.id}__${matchedVariant?.id || colorName}__${storageLabel}__${warranty}`;
        const addQty = Math.min(availableStock, Math.max(1, item.qty));

        const existingIdx = nextCart.findIndex((c) => c.key === key);
        if (existingIdx >= 0) {
          nextCart[existingIdx] = {
            ...nextCart[existingIdx],
            unitPrice,
            originalUnitPrice,
            stockCount: availableStock,
            qty: Math.min(availableStock, nextCart[existingIdx].qty + addQty),
          };
        } else {
          nextCart = [
            ...nextCart,
            {
              key,
              productId: detailedProduct.id,
              ...(matchedVariant
                ? {
                    variantId: matchedVariant.id,
                    sku: matchedVariant.sku,
                    partNumber: matchedVariant.partNumber || undefined,
                    simType: matchedVariant.simType || undefined,
                  }
                : {}),
              slug: detailedProduct.slug,
              nameFa: detailedProduct.nameFa,
              brand: detailedProduct.brand,
              image: detailedProduct.image,
              colorName,
              colorHex,
              storageLabel,
              warranty,
              unitPrice,
              originalUnitPrice,
              qty: addQty,
              stockCount: availableStock,
            },
          ];
        }
        addedCount += 1;
      }

      if (addedCount > 0) {
        cartRef.current = nextCart;
        setCart(nextCart);
        localStore.saveCart(nextCart);
        if (userRef.current) {
          syncAuthenticatedCart(nextCart);
        } else {
          localStore.setGuestCartDirty(true);
        }
        setCartPulseTick((n) => n + 1);
        if (skippedCount > 0) {
          showToast(
            `${toPersianDigits(addedCount)} کالا به سبد خرید اضافه شد (${toPersianDigits(skippedCount)} کالا ناموجود بود).`,
            'info'
          );
        } else {
          showToast('کالاهای این سفارش با موجودی روز به سبد خرید اضافه شدند.', 'success');
        }
        navigate('/cart');
      } else {
        showToast('متاسفانه کالاهای این سفارش در حال حاضر موجود نیستند.', 'error');
      }

      return { addedCount, skippedCount };
    },
    [navigate, products, showToast, syncAuthenticatedCart]
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
    userRef.current = nextUser;
    localStore.saveUser(nextUser);
    setUser(nextUser);
  }, []);

  const loginDemoUser = useCallback(
    (nextUser: DemoUser) => {
      userRef.current = nextUser;
      localStore.saveUser(nextUser);
      setUser(nextUser);
      void hydrateAuthenticatedSession(nextUser, true);
      showToast(`خوش آمدید، ${nextUser.fullName}!`, 'success');
    },
    [hydrateAuthenticatedSession, showToast]
  );

  const logoutDemoUser = useCallback(
    async (allDevices = false) => {
      try {
        await authApi.logout(allDevices);
      } catch {
        // Ignore offline fallback
      }
      userRef.current = null;
      cartRef.current = [];
      guestWishlistRef.current = [];
      localStore.saveUser(null);
      localStore.saveCart([]);
      localStore.saveAppliedCoupon(null);
      localStore.saveWishlist([]);
      localStore.setGuestCartDirty(false);
      setCart([]);
      setAppliedCoupon(null);
      setGuestWishlist([]);
      setNotifications([]);
      const guestAlerts = localStore.loadStockAlerts();
      stockAlertsRef.current = guestAlerts;
      setStockAlerts(guestAlerts);
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
      username?: string;
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

  const updateUserUsername = useCallback(
    async (username: string) => {
      const res = await authApi.updateUsername(username);
      setAuthenticatedUser(res.user);
      showToast(`نام کاربری شما به @${res.user.username} تغییر یافت.`, 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
  );

  const deleteUserAccount = useCallback(
    async (currentPassword?: string) => {
      await authApi.deleteAccount({ currentPassword });
      userRef.current = null;
      cartRef.current = [];
      guestWishlistRef.current = [];
      localStore.saveUser(null);
      localStore.saveCart([]);
      localStore.saveAppliedCoupon(null);
      localStore.saveWishlist([]);
      localStore.setGuestCartDirty(false);
      setCart([]);
      setAppliedCoupon(null);
      setGuestWishlist([]);
      setNotifications([]);
      const guestAlerts = localStore.loadStockAlerts();
      stockAlertsRef.current = guestAlerts;
      setStockAlerts(guestAlerts);
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
        removeRecentSearch,
        clearRecentSearches,
        couponRules,
        storeSettings,
        filters,
        setFilters,
        resetFilters,
        cart,
        cartSummary,
        cartPulseTick,
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
        notifications,
        unreadNotificationCount,
        notificationsLoading,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        orders,
        ordersLoading,
        productsLoading,
        refreshProducts,
        upsertProduct,
        createDemoOrder,
        cancelCustomerOrder,
        reorderFromOrder,
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
        updateUserUsername,
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
