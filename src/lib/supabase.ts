import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CartItem,
  DemoUser,
  OrderRecord,
  Product,
  ProductReview,
  SupportTicket,
} from '../types/store';
import { DEMO_SAMPLE_ORDER, INITIAL_REVIEWS, SEED_PRODUCTS } from '../data/catalog';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const KEYS = {
  CART: 'amir_mobile_cart_v1',
  WISHLIST: 'amir_mobile_wishlist_v1',
  ORDERS: 'amir_mobile_orders_v1',
  TICKETS: 'amir_mobile_tickets_v1',
  USER: 'amir_mobile_user_v1',
  REVIEWS: 'amir_mobile_reviews_v1',
  NEWSLETTER: 'amir_mobile_newsletter_v1',
  NOTIFY_ME: 'amir_mobile_notify_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in private mode
  }
}

export const storeRepository = {
  async fetchProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          return SEED_PRODUCTS.map((seed) => {
            const match = data.find((row) => row.id === seed.id || row.slug === seed.slug);
            if (!match) return seed;
            return {
              ...seed,
              price: Number(match.price) || seed.price,
              originalPrice: match.original_price ? Number(match.original_price) : seed.originalPrice,
              inStock: typeof match.in_stock === 'boolean' ? match.in_stock : seed.inStock,
              stockCount: typeof match.stock_count === 'number' ? match.stock_count : seed.stockCount,
            };
          });
        }
      } catch {
        // Fallback seamlessly to local catalog
      }
    }
    return SEED_PRODUCTS;
  },

  loadCart(): CartItem[] {
    return readStorage<CartItem[]>(KEYS.CART, []);
  },

  saveCart(items: CartItem[]): void {
    writeStorage(KEYS.CART, items);
  },

  loadWishlist(): string[] {
    return readStorage<string[]>(KEYS.WISHLIST, []);
  },

  saveWishlist(ids: string[]): void {
    writeStorage(KEYS.WISHLIST, ids);
  },

  loadUser(): DemoUser | null {
    return readStorage<DemoUser | null>(KEYS.USER, null);
  },

  saveUser(user: DemoUser | null): void {
    writeStorage(KEYS.USER, user);
  },

  loadOrders(): OrderRecord[] {
    const stored = readStorage<OrderRecord[]>(KEYS.ORDERS, []);
    if (stored.length === 0) {
      return [DEMO_SAMPLE_ORDER];
    }
    const hasSample = stored.some((o) => o.orderCode === DEMO_SAMPLE_ORDER.orderCode);
    return hasSample ? stored : [...stored, DEMO_SAMPLE_ORDER];
  },

  async createOrder(order: OrderRecord): Promise<OrderRecord> {
    const existing = this.loadOrders().filter((o) => o.orderCode !== order.orderCode);
    writeStorage(KEYS.ORDERS, [order, ...existing]);

    if (supabase) {
      try {
        await supabase.from('orders').insert({
          order_code: order.orderCode,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          shipping_address: `${order.city}، ${order.shippingAddress}`,
          postal_code: order.postalCode,
          coupon_code: order.couponCode,
          subtotal: order.subtotal,
          discount_total: order.productDiscount + order.couponDiscount,
          shipping_cost: order.shippingCost,
          total_amount: order.totalAmount,
          status: order.status,
          delivery_pin: order.deliveryPin,
          imei_sample: order.imeiSample,
          items: order.items,
        });
      } catch {
        // Already saved locally for portfolio resilience
      }
    }
    return order;
  },

  async findOrderByCode(orderCode: string): Promise<OrderRecord | null> {
    const normalized = orderCode.trim().toUpperCase().replace(/^#/, '');
    const localMatch = this.loadOrders().find(
      (o) => o.orderCode.toUpperCase() === normalized
    );
    if (localMatch) return localMatch;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_code', normalized)
          .maybeSingle();
        if (!error && data) {
          return {
            orderCode: data.order_code,
            shaparakRef: '84729104',
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            city: '',
            shippingAddress: data.shipping_address,
            postalCode: data.postal_code,
            deliverySlot: 'express',
            couponCode: data.coupon_code,
            subtotal: Number(data.subtotal),
            productDiscount: Number(data.discount_total || 0),
            couponDiscount: 0,
            shippingCost: Number(data.shipping_cost || 0),
            totalAmount: Number(data.total_amount),
            status: (data.status as OrderRecord['status']) || 'preparing',
            deliveryPin: data.delivery_pin,
            imeiSample: data.imei_sample,
            items: (data.items as CartItem[]) || [],
            createdAt: 'ثبت شده در پایگاه داده',
          };
        }
      } catch {
        // Ignore network errors
      }
    }
    return null;
  },

  async submitSupportTicket(ticket: SupportTicket): Promise<SupportTicket> {
    const existing = readStorage<SupportTicket[]>(KEYS.TICKETS, []);
    writeStorage(KEYS.TICKETS, [ticket, ...existing]);

    if (supabase) {
      try {
        await supabase.from('support_tickets').insert({
          ticket_code: ticket.ticketCode,
          full_name: ticket.fullName,
          phone: ticket.phone,
          department: ticket.department,
          order_code: ticket.orderCode || null,
          message: ticket.message,
        });
      } catch {
        // Saved locally
      }
    }
    return ticket;
  },

  async subscribeNewsletter(contact: string): Promise<void> {
    const existing = readStorage<string[]>(KEYS.NEWSLETTER, []);
    if (!existing.includes(contact)) {
      writeStorage(KEYS.NEWSLETTER, [contact, ...existing]);
    }
    if (supabase) {
      try {
        await supabase.from('newsletter_subscribers').upsert({ contact });
      } catch {
        // Saved locally
      }
    }
  },

  loadReviews(productId: string): ProductReview[] {
    const map = readStorage<Record<string, ProductReview[]>>(KEYS.REVIEWS, {});
    return map[productId] ?? INITIAL_REVIEWS;
  },

  addReview(productId: string, review: ProductReview): ProductReview[] {
    const map = readStorage<Record<string, ProductReview[]>>(KEYS.REVIEWS, {});
    const current = map[productId] ?? INITIAL_REVIEWS;
    const updated = [review, ...current];
    map[productId] = updated;
    writeStorage(KEYS.REVIEWS, map);
    return updated;
  },

  loadStockAlerts(): string[] {
    return readStorage<string[]>(KEYS.NOTIFY_ME, []);
  },

  toggleStockAlert(productId: string): string[] {
    const current = this.loadStockAlerts();
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    writeStorage(KEYS.NOTIFY_ME, updated);
    return updated;
  },
};
