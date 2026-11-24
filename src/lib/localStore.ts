import { DEMO_SAMPLE_ORDER, INITIAL_REVIEWS } from '../data/catalog';
import type { CartItem, DemoUser, OrderRecord, ProductReview } from '../types/store';

const KEYS = {
  CART: 'amir_mobile_cart_v1',
  WISHLIST: 'amir_mobile_wishlist_v1',
  COMPARE: 'amir_mobile_compare_v1',
  RECENT: 'amir_mobile_recent_v1',
  ORDERS: 'amir_mobile_orders_v1',
  USER: 'amir_mobile_user_v1',
  REVIEWS: 'amir_mobile_reviews_v1',
  NOTIFY_ME: 'amir_mobile_notify_v1',
  COUPON: 'amir_mobile_coupon_v1',
  GUEST_CART_DIRTY: 'amir_mobile_guest_cart_dirty_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readStorageArray<T>(key: string): T[] {
  const parsed = readStorage<unknown>(key, []);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in private mode
  }
}

export const localStore = {
  loadCart(): CartItem[] {
    return readStorageArray<CartItem>(KEYS.CART);
  },

  saveCart(items: CartItem[]): void {
    writeStorage(KEYS.CART, items);
  },

  loadWishlist(): string[] {
    return readStorageArray<string>(KEYS.WISHLIST);
  },

  saveWishlist(ids: string[]): void {
    writeStorage(KEYS.WISHLIST, ids);
  },

  loadCompare(): string[] {
    return readStorageArray<string>(KEYS.COMPARE);
  },

  saveCompare(ids: string[]): void {
    writeStorage(KEYS.COMPARE, ids);
  },

  loadRecent(): string[] {
    return readStorageArray<string>(KEYS.RECENT);
  },

  saveRecent(ids: string[]): void {
    writeStorage(KEYS.RECENT, ids);
  },

  loadUser(): DemoUser | null {
    const parsed = readStorage<DemoUser | null>(KEYS.USER, null);
    return parsed && typeof parsed === 'object' && typeof parsed.email === 'string' ? parsed : null;
  },

  saveUser(user: DemoUser | null): void {
    writeStorage(KEYS.USER, user);
  },

  loadOrders(): OrderRecord[] {
    const stored = readStorageArray<OrderRecord>(KEYS.ORDERS);
    return stored.filter((o) => o && o.orderCode && o.orderCode !== DEMO_SAMPLE_ORDER.orderCode);
  },

  saveOrders(orders: OrderRecord[]): void {
    writeStorage(
      KEYS.ORDERS,
      orders.filter((o) => o && o.orderCode && o.orderCode !== DEMO_SAMPLE_ORDER.orderCode)
    );
  },

  loadReviews(productId: string): ProductReview[] {
    const map = readStorage<Record<string, ProductReview[]>>(KEYS.REVIEWS, {});
    return map[productId] ?? INITIAL_REVIEWS;
  },

  loadStockAlerts(): string[] {
    return readStorageArray<string>(KEYS.NOTIFY_ME);
  },

  toggleStockAlert(productId: string): string[] {
    const current = this.loadStockAlerts();
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    writeStorage(KEYS.NOTIFY_ME, updated);
    return updated;
  },

  loadAppliedCoupon(): string | null {
    const val = readStorage<string | null>(KEYS.COUPON, null);
    return typeof val === 'string' && val.trim() ? val.trim() : null;
  },

  saveAppliedCoupon(code: string | null): void {
    try {
      if (!code || !code.trim()) {
        window.localStorage.removeItem(KEYS.COUPON);
      } else {
        window.localStorage.setItem(KEYS.COUPON, JSON.stringify(code.trim()));
      }
    } catch {
      // Ignore storage errors
    }
  },

  hasGuestCartDirty(): boolean {
    return readStorage<boolean>(KEYS.GUEST_CART_DIRTY, false) === true;
  },

  setGuestCartDirty(dirty: boolean): void {
    writeStorage(KEYS.GUEST_CART_DIRTY, dirty);
  },
};
