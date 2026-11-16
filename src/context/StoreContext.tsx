import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SEED_PRODUCTS } from '../data/catalog';
import { storeRepository } from '../lib/supabase';
import type {
  CartItem,
  CategoryId,
  CheckoutFormData,
  DemoUser,
  FilterState,
  OrderRecord,
  Product,
} from '../types/store';
import {
  calculateCartSummary,
  evaluateCoupon,
  generateOrderCode,
  toEnglishDigits,
  toPersianDigits,
  type CartSummary,
} from '../utils/storeLogic';

export type AppRoute =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; slug: string }
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
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  cart: CartItem[];
  cartSummary: CartSummary;
  addToCart: (product: Product, opts?: { colorName?: string; colorHex?: string; storageLabel?: string; unitPrice?: number; originalUnitPrice?: number; qty?: number }) => void;
  updateCartQty: (key: string, delta: number) => void;
  removeCartItem: (key: string) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { valid: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  stockAlerts: string[];
  toggleStockAlert: (productId: string) => void;
  orders: OrderRecord[];
  createDemoOrder: (form: CheckoutFormData) => Promise<OrderRecord>;
  findOrder: (code: string) => Promise<OrderRecord | null>;
  user: DemoUser | null;
  loginDemoUser: (user: DemoUser) => void;
  logoutDemoUser: () => void;
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialParsed = useMemo(() => parseHashRoute(window.location.hash), []);
  const [route, setRoute] = useState<AppRoute>(initialParsed.route);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    category: initialParsed.categoryParam ?? 'all',
    searchQuery: initialParsed.queryParam ?? '',
  }));
  const [cart, setCart] = useState<CartItem[]>(() => storeRepository.loadCart());
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => storeRepository.loadWishlist());
  const [stockAlerts, setStockAlerts] = useState<string[]>(() => storeRepository.loadStockAlerts());
  const [orders, setOrders] = useState<OrderRecord[]>(() => storeRepository.loadOrders());
  const [user, setUser] = useState<DemoUser | null>(() => storeRepository.loadUser());
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
    storeRepository.fetchProducts().then((fetched) => {
      if (active) setProducts(fetched);
    });
    return () => {
      active = false;
    };
  }, []);

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
      const unitPrice = opts?.unitPrice ?? product.price;
      const originalUnitPrice = opts?.originalUnitPrice ?? product.originalPrice ?? product.price;
      const addQty = Math.max(1, opts?.qty ?? 1);
      const key = `${product.id}__${colorName}__${storageLabel}`;

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
              warranty: product.warranty,
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
    () => calculateCartSummary(cart, appliedCoupon),
    [cart, appliedCoupon]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const evaluation = evaluateCoupon(code, cartSummary.netSubtotal);
      if (evaluation.valid && evaluation.code) {
        setAppliedCoupon(evaluation.code);
        showToast(evaluation.message, 'success');
      } else {
        showToast(evaluation.message, 'error');
      }
      return { valid: evaluation.valid, message: evaluation.message };
    },
    [cartSummary.netSubtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('کد تخفیف حذف شد.', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
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
    [showToast]
  );

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
      const summary = calculateCartSummary(cart, appliedCoupon);
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
      const saved = await storeRepository.createOrder(newOrder);
      setOrders(storeRepository.loadOrders());
      clearCart();
      showToast(`سفارش آزمایشی ${saved.orderCode} با موفقیت ثبت شد.`, 'success');
      return saved;
    },
    [appliedCoupon, cart, clearCart, showToast]
  );

  const findOrder = useCallback(async (code: string) => {
    return storeRepository.findOrderByCode(code);
  }, []);

  const loginDemoUser = useCallback(
    (nextUser: DemoUser) => {
      storeRepository.saveUser(nextUser);
      setUser(nextUser);
      showToast(`خوش آمدید، ${nextUser.fullName}!`, 'success');
    },
    [showToast]
  );

  const logoutDemoUser = useCallback(() => {
    storeRepository.saveUser(null);
    setUser(null);
    showToast('از حساب کاربری خارج شدید.', 'info');
  }, [showToast]);

  return (
    <StoreContext.Provider
      value={{
        route,
        navigate,
        navigateToCatalog,
        products,
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
        stockAlerts,
        toggleStockAlert,
        orders,
        createDemoOrder,
        findOrder,
        user,
        loginDemoUser,
        logoutDemoUser,
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
