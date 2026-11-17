import express, { type Request, type Response } from 'express';
import type { AuthStorageAdapter, StoredUserRecord } from './authStore.ts';
import { toPublicUser } from './authStore.ts';
import {
  normalizeOrderStatus,
  sanitizeAuditDetails,
  type ProductCategory,
  type ProductDTO,
} from './storeData.ts';

export interface AdminAuthenticatedRequest extends Request {
  authUser?: StoredUserRecord;
  authSessionId?: string;
}

const VALID_CATEGORIES = new Set<ProductCategory>([
  'phones',
  'tablets',
  'smartwatches',
  'audio',
  'chargers',
  'cases',
  'gaming',
]);

function slugifyProductInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createAdminRouter(storage: AuthStorageAdapter) {
  const router = express.Router();

  router.get('/me', (req: AdminAuthenticatedRequest, res: Response) => {
    res.json({ user: toPublicUser(req.authUser!) });
  });

  router.get('/stats', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ stats });
    } catch (err) {
      next(err);
    }
  });

  router.get('/products', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const products = await storage.listProducts({
        category: typeof req.query.category === 'string' ? req.query.category : undefined,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        brand: typeof req.query.brand === 'string' ? req.query.brand : undefined,
        inStock: req.query.inStock === 'true',
        sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
      });
      res.json({ products, total: products.length });
    } catch (err) {
      next(err);
    }
  });

  router.get('/products/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const product = await storage.findProductByIdOrSlug(String(req.params.id || ''));
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      res.json({ product });
    } catch (err) {
      next(err);
    }
  });

  router.post('/products', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const body = req.body || {};
      const nameFa = String(body.nameFa || body.name_fa || '').trim();
      const nameEn = String(body.nameEn || body.name_en || nameFa).trim();
      const brand = String(body.brand || '').trim();
      const categoryRaw = String(body.category || '').trim() as ProductCategory;
      const price = Number(body.price);
      const stockCount = Math.floor(Number(body.stockCount ?? body.stock_count ?? 0));

      if (nameFa.length < 2 || !brand || !VALID_CATEGORIES.has(categoryRaw)) {
        res.status(400).json({ error: 'نام محصول، برند و دسته‌بندی معتبر الزامی است.' });
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ error: 'قیمت محصول باید عدد مثبت باشد.' });
        return;
      }
      if (!Number.isFinite(stockCount) || stockCount < 0) {
        res.status(400).json({ error: 'موجودی کالا نمی‌تواند منفی باشد.' });
        return;
      }

      const rawSlug = String(body.slug || body.id || slugifyProductInput(nameEn) || `prod-${Date.now()}`).trim();
      const slug = slugifyProductInput(rawSlug) || `prod-${Date.now()}`;
      const id = String(body.id || slug).trim();

      const duplicate =
        (await storage.findProductByIdOrSlug(id)) || (await storage.findProductByIdOrSlug(slug));
      if (duplicate) {
        res.status(409).json({ error: 'محصولی با این شناسه یا اسلاگ قبلاً ثبت شده است.' });
        return;
      }

      const originalPriceRaw = body.originalPrice ?? body.original_price;
      const originalPrice =
        originalPriceRaw !== undefined && originalPriceRaw !== null && Number(originalPriceRaw) > price
          ? Math.round(Number(originalPriceRaw))
          : undefined;
      const discountPercent =
        typeof body.discountPercent === 'number'
          ? body.discountPercent
          : originalPrice
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const inStock =
        typeof body.inStock === 'boolean'
          ? body.inStock && stockCount > 0
          : stockCount > 0;

      const productPayload: ProductDTO = {
        id,
        slug,
        nameFa,
        nameEn,
        brand,
        category: categoryRaw,
        price: Math.round(price),
        originalPrice,
        discountPercent,
        inStock,
        stockCount,
        expressDelivery: body.expressDelivery !== false,
        warranty: String(body.warranty || '۱۸ ماهه امیر سرویس + کد رجیستری همتا').trim(),
        badgeText: body.badgeText ? String(body.badgeText).trim() : undefined,
        rating: Number.isFinite(Number(body.rating)) ? Number(body.rating) : 4.8,
        reviewCount: Math.max(0, Math.floor(Number(body.reviewCount ?? 0))),
        recommendPercent: Number.isFinite(Number(body.recommendPercent))
          ? Number(body.recommendPercent)
          : 95,
        image: String(body.image || body.imageUrl || body.image_url || '').trim(),
        colorLabel: String(body.colorLabel || 'مشکی').trim(),
        colors: Array.isArray(body.colors) && body.colors.length > 0
          ? body.colors
          : [{ id: 'midnight', name: String(body.colorLabel || 'مشکی'), hex: '#1e293b' }],
        storageOptions:
          Array.isArray(body.storageOptions) && body.storageOptions.length > 0
            ? body.storageOptions
            : [{ label: '۲۵۶ گیگابایت', subtitle: 'نسخه استاندارد', priceDelta: 0 }],
        specs: {
          display: String(body.specs?.display || 'OLED 120Hz'),
          displayDetails: String(body.specs?.displayDetails || 'کیفیت پرچمدار'),
          chipset: String(body.specs?.chipset || 'پردازنده پرچمدار'),
          chipsetDetails: String(body.specs?.chipsetDetails || 'نسل جدید'),
          camera: String(body.specs?.camera || 'دوربین حرفه‌ای'),
          cameraDetails: String(body.specs?.cameraDetails || 'لرزشگیر اپتیکال'),
          battery: String(body.specs?.battery || '۵۰۰۰ میلی‌آمپر'),
          batteryDetails: String(body.specs?.batteryDetails || 'فست شارژ'),
          storageDefault: String(body.specs?.storageDefault || '۲۵۶ گیگابایت'),
          ram: String(body.specs?.ram || '۸ گیگ'),
          os: String(body.specs?.os || 'نسخه رسمی گلوبال'),
        },
        isFeaturedDeal: Boolean(body.isFeaturedDeal),
        isPopular: Boolean(body.isPopular),
        salesRank: Math.max(1, Math.floor(Number(body.salesRank ?? 100))),
        releaseOrder: Math.max(1, Math.floor(Number(body.releaseOrder ?? 100))),
      };

      const created = await storage.createProduct(productPayload);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'product.create',
        entityType: 'product',
        entityId: created.id,
        details: sanitizeAuditDetails({
          slug: created.slug,
          nameFa: created.nameFa,
          price: created.price,
          stockCount: created.stockCount,
        }),
      });

      res.status(201).json({ product: created });
    } catch (err) {
      next(err);
    }
  });

  const handleUpdateProduct = async (req: AdminAuthenticatedRequest, res: Response, next: express.NextFunction) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const existing = await storage.findProductByIdOrSlug(targetId);
      if (!existing) {
        res.status(404).json({ error: 'محصول مورد نظر یافت نشد.' });
        return;
      }

      const body = req.body || {};
      const patch: Partial<ProductDTO> = {};

      if (body.nameFa !== undefined || body.name_fa !== undefined) {
        patch.nameFa = String(body.nameFa ?? body.name_fa).trim();
      }
      if (body.nameEn !== undefined || body.name_en !== undefined) {
        patch.nameEn = String(body.nameEn ?? body.name_en).trim();
      }
      if (body.brand !== undefined) patch.brand = String(body.brand).trim();
      if (body.category !== undefined) {
        const cat = String(body.category).trim() as ProductCategory;
        if (!VALID_CATEGORIES.has(cat)) {
          res.status(400).json({ error: 'دسته‌بندی محصول نامعتبر است.' });
          return;
        }
        patch.category = cat;
      }
      if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price <= 0) {
          res.status(400).json({ error: 'قیمت باید عدد مثبت باشد.' });
          return;
        }
        patch.price = Math.round(price);
      }
      if (body.originalPrice !== undefined || body.original_price !== undefined) {
        const orig = Number(body.originalPrice ?? body.original_price);
        patch.originalPrice = Number.isFinite(orig) && orig > 0 ? Math.round(orig) : undefined;
      }
      if (body.discountPercent !== undefined || body.discount_percent !== undefined) {
        patch.discountPercent = Math.max(0, Math.min(99, Number(body.discountPercent ?? body.discount_percent)));
      }
      if (body.stockCount !== undefined || body.stock_count !== undefined) {
        const sc = Math.floor(Number(body.stockCount ?? body.stock_count));
        if (!Number.isFinite(sc) || sc < 0) {
          res.status(400).json({ error: 'موجودی کالا نمی‌تواند منفی باشد.' });
          return;
        }
        patch.stockCount = sc;
      }
      if (typeof body.inStock === 'boolean' || typeof body.in_stock === 'boolean') {
        patch.inStock = Boolean(body.inStock ?? body.in_stock);
      }
      if (typeof body.expressDelivery === 'boolean') patch.expressDelivery = body.expressDelivery;
      if (body.warranty !== undefined) patch.warranty = String(body.warranty).trim();
      if (body.badgeText !== undefined) patch.badgeText = body.badgeText ? String(body.badgeText).trim() : undefined;
      if (body.image !== undefined || body.imageUrl !== undefined || body.image_url !== undefined) {
        patch.image = String(body.image ?? body.imageUrl ?? body.image_url ?? '').trim();
      }
      if (body.colorLabel !== undefined) patch.colorLabel = String(body.colorLabel).trim();
      if (Array.isArray(body.colors)) patch.colors = body.colors;
      if (Array.isArray(body.storageOptions)) patch.storageOptions = body.storageOptions;
      if (body.specs && typeof body.specs === 'object') patch.specs = body.specs;
      if (typeof body.isFeaturedDeal === 'boolean') patch.isFeaturedDeal = body.isFeaturedDeal;
      if (typeof body.isPopular === 'boolean') patch.isPopular = body.isPopular;
      if (body.salesRank !== undefined) patch.salesRank = Number(body.salesRank);
      if (body.releaseOrder !== undefined) patch.releaseOrder = Number(body.releaseOrder);

      const updated = await storage.updateProduct(existing.id, patch);
      if (!updated) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'product.update',
        entityType: 'product',
        entityId: updated.id,
        details: sanitizeAuditDetails({
          changedFields: Object.keys(patch),
          price: updated.price,
          stockCount: updated.stockCount,
          inStock: updated.inStock,
        }),
      });

      res.json({ product: updated });
    } catch (err) {
      next(err);
    }
  };

  router.patch('/products/:id', handleUpdateProduct);
  router.put('/products/:id', handleUpdateProduct);

  router.patch('/products/:id/inventory', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const existing = await storage.findProductByIdOrSlug(targetId);
      if (!existing) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const stockCount = Math.floor(Number(req.body?.stockCount ?? req.body?.stock_count));
      if (!Number.isFinite(stockCount) || stockCount < 0) {
        res.status(400).json({ error: 'تعداد موجودی باید عدد صحیح غیرمنفی باشد.' });
        return;
      }
      const inStock =
        typeof req.body?.inStock === 'boolean'
          ? req.body.inStock && stockCount > 0
          : stockCount > 0;

      const updated = await storage.updateProductInventory(existing.id, stockCount, inStock);
      if (!updated) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'product.inventory_update',
        entityType: 'product',
        entityId: updated.id,
        details: sanitizeAuditDetails({
          previousStock: existing.stockCount,
          newStock: updated.stockCount,
          inStock: updated.inStock,
        }),
      });

      res.json({ product: updated });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/products/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const existing = await storage.findProductByIdOrSlug(targetId);
      if (!existing) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const deleted = await storage.deleteProduct(existing.id);
      if (!deleted) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }

      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'product.delete',
        entityType: 'product',
        entityId: existing.id,
        details: sanitizeAuditDetails({
          slug: existing.slug,
          nameFa: existing.nameFa,
        }),
      });

      res.json({ ok: true, id: existing.id });
    } catch (err) {
      next(err);
    }
  });

  router.get('/orders', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const page = Math.max(1, Math.floor(Number(req.query.page || 1)));
      const limit = Math.min(200, Math.max(1, Math.floor(Number(req.query.limit || 50))));
      const offset = (page - 1) * limit;
      const result = await storage.listAllOrders({
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        limit,
        offset,
      });
      res.json({
        orders: result.orders,
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/orders/:code', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const order = await storage.findOrderByCode(String(req.params.code || ''));
      if (!order) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }
      res.json({ order });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/orders/:code/status', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const code = String(req.params.code || '').trim();
      const rawStatus = String(req.body?.status || '').trim().toLowerCase();
      if (!['paid', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(rawStatus)) {
        res.status(400).json({ error: 'وضعیت سفارش معتبر نیست.' });
        return;
      }

      const existing = await storage.findOrderByCode(code);
      if (!existing) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const nextStatus = normalizeOrderStatus(rawStatus);
      const adminNote =
        req.body?.adminNote !== undefined ? String(req.body.adminNote).trim() : undefined;
      const updated = await storage.updateOrderStatus(existing.orderCode, nextStatus, adminNote);
      if (!updated) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'order.status_update',
        entityType: 'order',
        entityId: updated.orderCode,
        details: sanitizeAuditDetails({
          previousStatus: existing.status,
          newStatus: updated.status,
          adminNote: updated.adminNote,
        }),
      });

      res.json({ order: updated });
    } catch (err) {
      next(err);
    }
  });

  router.get('/customers', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const page = Math.max(1, Math.floor(Number(req.query.page || 1)));
      const limit = Math.min(200, Math.max(1, Math.floor(Number(req.query.limit || 50))));
      const offset = (page - 1) * limit;
      const result = await storage.listCustomers({
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        limit,
        offset,
      });
      res.json({
        customers: result.customers,
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/customers/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const result = await storage.getCustomerByIdWithOrders(String(req.params.id || ''));
      if (!result) {
        res.status(404).json({ error: 'کاربر یافت نشد.' });
        return;
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/audit-logs', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const limit = Math.min(200, Math.max(1, Math.floor(Number(req.query.limit || 50))));
      const offset = Math.max(0, Math.floor(Number(req.query.offset || 0)));
      const result = await storage.listAuditLogs({
        action: typeof req.query.action === 'string' ? req.query.action : undefined,
        entityType: typeof req.query.entityType === 'string' ? req.query.entityType : undefined,
        limit,
        offset,
      });
      res.json({
        logs: result.logs,
        total: result.total,
        limit,
        offset,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
