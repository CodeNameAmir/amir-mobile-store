import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SEED_PRODUCTS } from '../data/catalog';
import { authApi } from '../lib/authApi';
import { storeRepository } from '../lib/supabase';
import type {
  CartItem,
  CategoryId,
  CheckoutFormData,
  CouponRule,
  DemoUser,
  FilterState,
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
  formatToman,
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
  maxPrice: 150_000_000,
  storage: null,
  ram: null,
  colorId: null,
  sortBy: 'newest',
};

function parseHashRoute(hashRaw: string): { route: AppRoute; categoryParam?: CategoryId; queryParam?: string } {
  const clean = hashRaw.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = clean.split('?');
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const params = new URLSearchParams(queryPart || '');

  if (path === '/' || path === '') {
    return { route: { page: 'home' } };
  }
  if (path === '/catalog') {
    const cat = (params.get('cat') as CategoryId | null) || undefined;
    const q = params.get('q') || undefined;
    return { route: { page: 'catalog' }, categoryParam: cat, queryParam: q };
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
  if (path === '/status') return { route: { page: 'status' } };

  return { route: { page: 'not-found', path } };
}

interface StoreContextValue {
  route: AppRoute;
  navigate: (to: string) => void;
  navigateToCatalog: (opts?: { category?: CategoryId; searchQuery?: string; discountedOnly?: boolean }) => void;
  products: Product[];
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
  createDemoOrder: (form: CheckoutFormData) => Promise<OrderRecord>;
  findOrder: (code: string) => Promise<OrderRecord | null>;
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
  }) => Promise<DemoUser>;
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
  const initialParsed = useMemo(() => parseHashRoute(window.location.hash), []);
  const [route, setRoute] = useState<AppRoute>(initialParsed.route);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
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

  useEffect(() => {
    let active = true;
    Promise.all([
      storeRepository.fetchProducts(),
      storeRepository.fetchActiveCoupons(),
      storeRepository.fetchStoreSettings(),
      authApi.getStatus().catch(() => null),
    ]).then(([fetchedProducts, fetchedCoupons, fetchedSettings, authStatus]) => {
      if (!active) return;
      setProducts(fetchedProducts);
      setProductsLoading(false);
      setCouponRules(fetchedCoupons);
      setStoreSettings(fetchedSettings);
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
    return () => {
      active = false;
    };
  }, []);

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
          list: Array.isArray(res.orders) ? res.orders : [],
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

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute(window.location.hash);
      setRoute(parsed.route);
      if (parsed.route.page === 'catalog') {
        setFilters((prev) => ({
          ...prev,
          category: parsed.categoryParam ?? prev.category,
          searchQuery: parsed.queryParam !== undefined ? parsed.queryParam : prev.searchQuery,
        }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const normalized = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`;
    if (window.location.hash === normalized) {
      const parsed = parseHashRoute(normalized);
      setRoute(parsed.route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = normalized;
  }, []);

  const navigateToCatalog = useCallback(
    (opts?: { category?: CategoryId; searchQuery?: string; discountedOnly?: boolean }) => {
      const cat = opts?.category ?? 'all';
      const q = opts?.searchQuery ?? '';
      setFilters({
        ...DEFAULT_FILTERS,
        category: cat,
        searchQuery: q,
        discountedOnly: Boolean(opts?.discountedOnly),
      });
      const params = new URLSearchParams();
      if (cat !== 'all') params.set('cat', cat);
      if (q.trim()) params.set('q', q.trim());
      const suffix = params.toString();
      navigate(suffix ? `/catalog?${suffix}` : '/catalog');
    },
    [navigate]
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
      const newOrder: OrderRecord = {
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
      let saved: OrderRecord;
      if (user) {
        const uid = user.id ?? null;
        try {
          const res = await authApi.createOrder(newOrder);
          saved = res.order;
          setOrdersState((prev) => ({
            userId: uid,
            list: [saved, ...prev.list.filter((o) => o.orderCode !== saved.orderCode)],
            loading: false,
          }));
        } catch {
          saved = await storeRepository.createOrder(newOrder, { skipLocalCache: true });
          setOrdersState((prev) => ({
            userId: uid,
            list: [saved, ...prev.list.filter((o) => o.orderCode !== saved.orderCode)],
            loading: false,
          }));
          void authApi.notifyOrderPlaced({
            orderCode: saved.orderCode,
            totalFormatted: formatToman(saved.totalAmount),
            itemsCount: newOrder.items.length,
          });
        }
      } else {
        saved = await storeRepository.createOrder(newOrder);
        setGuestOrders(storeRepository.loadOrders());
      }
      clearCart();
      showToast(`سفارش آزمایشی ${saved.orderCode} با موفقیت ثبت شد.`, 'success');
      return saved;
    },
    [appliedCoupon, cart, clearCart, couponRules, showToast, storeSettings.freeShippingThreshold, user]
  );

  const findOrder = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase().replace(/^#/, '');
      const fromSupabase = await storeRepository.findOrderByCode(code);
      if (fromSupabase) return fromSupabase;
      const fromState = orders.find((o) => o.orderCode.toUpperCase() === normalized);
      if (fromState) return fromState;
      return authApi.findOrderByCode(code);
    },
    [orders]
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
    }) => {
      const res = await authApi.updateProfile(payload);
      setAuthenticatedUser(res.user);
      showToast('مشخصات حساب کاربری با موفقیت به‌روزرسانی شد.', 'success');
      return res.user;
    },
    [setAuthenticatedUser, showToast]
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
        navigate,
        navigateToCatalog,
        products,
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
        createDemoOrder,
        findOrder,
        user,
        authLoading,
        resendStatus,
        setAuthenticatedUser,
        loginDemoUser,
        logoutDemoUser,
        updateUserProfile,
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
