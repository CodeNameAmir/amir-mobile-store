import express, { type Request, type Response } from 'express';
import {
  StockMovementError,
  toPublicUser,
  type AuthStorageAdapter,
  type StoredUserRecord,
} from './authStore.ts';
import {
  normalizeOrderStatus,
  sanitizeAuditDetails,
  VALID_STOCK_MOVEMENT_TYPES,
  type AttributeDataType,
  type AttributeDefinitionDTO,
  type BrandDTO,
  type CategoryDTO,
  type CustomSpecItemDTO,
  type ProductCategory,
  type ProductDTO,
  type ProductVariantDTO,
  type StockMovementType,
  type WarehouseDTO,
  type WarrantyDTO,
} from './storeData.ts';

export interface AdminAuthenticatedRequest extends Request {
  authUser?: StoredUserRecord;
  authSessionId?: string;
}

function slugifyProductInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface AdminRouterOptions {
  onStockRestocked?: (info: {
    productId: string;
    variantId?: string | null;
    stockCount: number;
  }) => Promise<void> | void;
}

export function createAdminRouter(storage: AuthStorageAdapter, options?: AdminRouterOptions) {
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
      const [variants, attributeValues] = await Promise.all([
        storage.listProductVariants(product.id, true).catch(() => []),
        storage.listProductAttributes(product.id).catch(() => []),
      ]);
      res.json({ product: { ...product, variants, attributeValues } });
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
      const categoryRaw = String(body.category || '').trim().toLowerCase() as ProductCategory;
      const price = Number(body.price);
      const stockCount = Math.floor(Number(body.stockCount ?? body.stock_count ?? 0));

      if (nameFa.length < 2 || !brand || categoryRaw.length < 2) {
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

      const primaryImage = String(body.image || body.imageUrl || body.image_url || '').trim();
      const rawImages = Array.isArray(body.images)
        ? body.images.map((u: unknown) => String(u || '').trim()).filter(Boolean)
        : [];
      const imagesList = Array.from(new Set([primaryImage, ...rawImages].filter(Boolean)));
      const customSpecs: CustomSpecItemDTO[] = Array.isArray(body.customSpecs)
        ? body.customSpecs
            .map((item: { label?: unknown; value?: unknown }) => ({
              label: String(item?.label || '').trim(),
              value: String(item?.value || '').trim(),
            }))
            .filter((item: CustomSpecItemDTO) => item.label && item.value)
        : [];
      const nowIso = new Date().toISOString();

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
        image: primaryImage || imagesList[0] || '',
        images: imagesList.length > 0 ? imagesList : undefined,
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
        customSpecs: customSpecs.length > 0 ? customSpecs : undefined,
        editorialReview:
          typeof (body.editorialReview ?? body.editorial_review) === 'string' &&
          String(body.editorialReview ?? body.editorial_review).trim()
            ? String(body.editorialReview ?? body.editorial_review).trim()
            : undefined,
        priceUpdatedAt: String(body.priceUpdatedAt || nowIso),
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
        const cat = String(body.category).trim().toLowerCase() as ProductCategory;
        if (cat.length < 2) {
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
      if (Array.isArray(body.images)) {
        patch.images = body.images.map((u: unknown) => String(u || '').trim()).filter(Boolean);
      }
      if (body.colorLabel !== undefined) patch.colorLabel = String(body.colorLabel).trim();
      if (Array.isArray(body.colors)) patch.colors = body.colors;
      if (Array.isArray(body.storageOptions)) patch.storageOptions = body.storageOptions;
      if (body.specs && typeof body.specs === 'object') patch.specs = body.specs;
      if (Array.isArray(body.customSpecs)) {
        patch.customSpecs = body.customSpecs
          .map((item: { label?: unknown; value?: unknown }) => ({
            label: String(item?.label || '').trim(),
            value: String(item?.value || '').trim(),
          }))
          .filter((item: CustomSpecItemDTO) => item.label && item.value);
      }
      if (body.editorialReview !== undefined || body.editorial_review !== undefined) {
        const rawEditorial = body.editorialReview ?? body.editorial_review;
        patch.editorialReview = rawEditorial ? String(rawEditorial).trim() : undefined;
      }
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

      if ((existing.stockCount <= 0 || !existing.inStock) && updated.inStock && updated.stockCount > 0) {
        void Promise.resolve(
          options?.onStockRestocked?.({
            productId: updated.id,
            stockCount: updated.stockCount,
          })
        ).catch(() => undefined);
      }

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

      if ((existing.stockCount <= 0 || !existing.inStock) && updated.inStock && updated.stockCount > 0) {
        void Promise.resolve(
          options?.onStockRestocked?.({
            productId: updated.id,
            stockCount: updated.stockCount,
          })
        ).catch(() => undefined);
      }

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
      if (!['pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(rawStatus)) {
        res.status(400).json({ error: 'وضعیت سفارش معتبر نیست.' });
        return;
      }

      const existing = await storage.findOrderByCode(code);
      if (!existing) {
        res.status(404).json({ error: 'سفارش یافت نشد.' });
        return;
      }

      const nextStatus = normalizeOrderStatus(rawStatus);
      if (existing.status === 'expired' && nextStatus !== 'expired') {
        res.status(409).json({
          error: 'این سفارش منقضی شده و موجودی آن به انبار بازگردانده شده است؛ تغییر وضعیت ممکن نیست.',
        });
        return;
      }
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

  // Unlimited Nested Category Management
  router.get('/categories', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const categories = await storage.listCategories(true);
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  });

  const handleSaveCategory = async (
    req: AdminAuthenticatedRequest,
    res: Response,
    next: express.NextFunction
  ) => {
    try {
      const body = req.body || {};
      const label = String(body.label || '').trim();
      if (label.length < 2) {
        res.status(400).json({ error: 'عنوان دسته‌بندی باید حداقل ۲ کاراکتر باشد.' });
        return;
      }
      const paramId = req.params.id ? String(req.params.id).trim() : '';
      const rawSlug = String(body.slug || paramId || slugifyProductInput(label) || `cat-${Date.now()}`).trim();
      const slug = slugifyProductInput(rawSlug) || `cat-${Date.now()}`;
      const id = paramId || String(body.id || slug).trim();
      const parentIdRaw = body.parentId !== undefined && body.parentId !== null ? String(body.parentId).trim() : '';
      const parentId = parentIdRaw && parentIdRaw !== id ? parentIdRaw : null;

      const categoryPayload: CategoryDTO = {
        id,
        slug,
        label,
        titleEn: body.titleEn ? String(body.titleEn).trim() : undefined,
        subtitle: String(body.subtitle || '').trim(),
        descriptionFa: body.descriptionFa ? String(body.descriptionFa).trim() : undefined,
        iconName: body.iconName ? String(body.iconName).trim() : undefined,
        parentId,
        isActive: body.isActive !== false,
        image: String(body.image || '').trim(),
        seoTitle: String(body.seoTitle || '').trim(),
        seoDescription: String(body.seoDescription || '').trim(),
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.floor(Number(body.sortOrder)) : 100,
      };

      const saved = await storage.upsertCategory(categoryPayload);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: paramId ? 'category.update' : 'category.create',
        entityType: 'category',
        entityId: saved.id,
        details: sanitizeAuditDetails({ label: saved.label, slug: saved.slug, isActive: saved.isActive }),
      });

      res.status(paramId ? 200 : 201).json({ category: saved });
    } catch (err) {
      next(err);
    }
  };

  router.post('/categories', handleSaveCategory);
  router.put('/categories/:id', handleSaveCategory);
  router.patch('/categories/:id', handleSaveCategory);

  router.delete('/categories/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const deleted = await storage.deleteCategory(targetId);
      if (!deleted) {
        res.status(404).json({ error: 'دسته‌بندی یافت نشد.' });
        return;
      }
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'category.delete',
        entityType: 'category',
        entityId: targetId,
        details: sanitizeAuditDetails({ targetId }),
      });
      res.json({ ok: true, id: targetId });
    } catch (err) {
      next(err);
    }
  });

  // Brand Management (custom brands like Huawei, Nothing, etc.)
  router.get('/brands', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const brands = await storage.listBrands();
      res.json({ brands });
    } catch (err) {
      next(err);
    }
  });

  router.post('/brands', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const name = String(req.body?.name || '').trim();
      const labelFa = String(req.body?.labelFa || '').trim();
      if (name.length < 2) {
        res.status(400).json({ error: 'نام برند باید حداقل ۲ کاراکتر باشد.' });
        return;
      }
      const id = String(req.body?.id || slugifyProductInput(name) || `brand-${Date.now()}`).trim();
      const brand: BrandDTO = {
        id,
        name,
        labelFa: labelFa || undefined,
        slug: req.body?.slug ? slugifyProductInput(String(req.body.slug)) : id,
        logoUrl: req.body?.logoUrl ? String(req.body.logoUrl).trim() : undefined,
        websiteUrl: req.body?.websiteUrl ? String(req.body.websiteUrl).trim() : undefined,
        isFeatured: Boolean(req.body?.isFeatured),
        isActive: req.body?.isActive !== false,
      };
      const saved = await storage.upsertBrand(brand);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'brand.upsert',
        entityType: 'brand',
        entityId: saved.id,
        details: sanitizeAuditDetails({ name: saved.name, labelFa: saved.labelFa }),
      });
      res.status(201).json({ brand: saved });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/brands/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const deleted = await storage.deleteBrand(targetId);
      if (!deleted) {
        res.status(404).json({ error: 'برند یافت نشد.' });
        return;
      }
      res.json({ ok: true, id: targetId });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================================
  // V3 Enterprise Schema Admin APIs: Roles, Warranties, Attributes, Variants, Warehouses & Stock Ledger
  // ============================================================================
  router.get('/roles', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const roles = await storage.listRoles();
      res.json({ roles });
    } catch (err) {
      next(err);
    }
  });

  // Warranties
  router.get('/warranties', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const warranties = await storage.listWarranties(true);
      res.json({ warranties });
    } catch (err) {
      next(err);
    }
  });

  const handleSaveWarranty = async (
    req: AdminAuthenticatedRequest,
    res: Response,
    next: express.NextFunction
  ) => {
    try {
      const body = req.body || {};
      const paramId = req.params.id ? String(req.params.id).trim() : '';
      const existing = paramId
        ? (await storage.listWarranties(true)).find((w) => w.id === paramId) || null
        : null;
      if (paramId && !existing) {
        res.status(404).json({ error: 'گارانتی مورد نظر یافت نشد.' });
        return;
      }
      const providerName = String(
        body.providerName ?? body.provider_name ?? existing?.providerName ?? ''
      ).trim();
      const durationMonths = Math.max(
        1,
        Math.floor(
          Number(body.durationMonths ?? body.duration_months ?? existing?.durationMonths ?? 18)
        )
      );
      const coverageFa = String(
        body.coverageFa ?? body.coverage_fa ?? existing?.coverageFa ?? ''
      ).trim();
      if (providerName.length < 2 || coverageFa.length < 4) {
        res.status(400).json({ error: 'نام شرکت گارانتی و شرح پوشش گارانتی الزامی است.' });
        return;
      }
      const payload: WarrantyDTO = {
        id: paramId || String(body.id || '').trim(),
        providerName,
        durationMonths,
        coverageFa,
        termsUrl:
          body.termsUrl !== undefined
            ? body.termsUrl
              ? String(body.termsUrl).trim()
              : null
            : existing?.termsUrl ?? null,
        isActive:
          typeof body.isActive === 'boolean' ? body.isActive : existing ? existing.isActive : true,
      };
      const saved = await storage.upsertWarranty(payload);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: paramId ? 'warranty.update' : 'warranty.create',
        entityType: 'warranty',
        entityId: saved.id,
        details: sanitizeAuditDetails({ providerName: saved.providerName, durationMonths: saved.durationMonths }),
      });
      res.status(paramId ? 200 : 201).json({ warranty: saved });
    } catch (err) {
      next(err);
    }
  };

  router.post('/warranties', handleSaveWarranty);
  router.patch('/warranties/:id', handleSaveWarranty);

  router.delete('/warranties/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const id = String(req.params.id || '').trim();
      const deleted = await storage.deleteWarranty(id);
      if (!deleted) {
        res.status(404).json({ error: 'گارانتی مورد نظر یافت نشد.' });
        return;
      }
      res.json({ ok: true, id });
    } catch (err) {
      next(err);
    }
  });

  // Technical Attributes (EAV)
  router.get('/attributes', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const attributes = await storage.listAttributes(category);
      res.json({ attributes });
    } catch (err) {
      next(err);
    }
  });

  router.post('/attributes', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const body = req.body || {};
      const code = slugifyProductInput(String(body.code || '')).replace(/-/g, '_');
      const nameFa = String(body.nameFa || body.name_fa || '').trim();
      const nameEn = String(body.nameEn || body.name_en || code).trim();
      const dataTypeRaw = String(body.dataType || body.data_type || 'text').trim().toLowerCase();
      const dataType: AttributeDataType = ['text', 'number', 'boolean', 'select'].includes(dataTypeRaw)
        ? (dataTypeRaw as AttributeDataType)
        : 'text';
      if (code.length < 2 || nameFa.length < 2) {
        res.status(400).json({ error: 'کد ویژگی و عنوان فارسی معتبر الزامی است.' });
        return;
      }
      const payload: AttributeDefinitionDTO = {
        id: String(body.id || '').trim(),
        code,
        nameFa,
        nameEn,
        dataType,
        unit: body.unit ? String(body.unit).trim() : null,
        isFilterable: body.isFilterable !== false,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.floor(Number(body.sortOrder)) : 50,
        categoryIds: Array.isArray(body.categoryIds)
          ? body.categoryIds.map((c: unknown) => String(c || '').trim()).filter(Boolean)
          : undefined,
      };
      const saved = await storage.upsertAttribute(payload);
      res.status(201).json({ attribute: saved });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/attributes/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const target = String(req.params.id || '').trim();
      const deleted = await storage.deleteAttribute(target);
      if (!deleted) {
        res.status(404).json({ error: 'ویژگی فنی یافت نشد.' });
        return;
      }
      res.json({ ok: true, id: target });
    } catch (err) {
      next(err);
    }
  });

  router.put('/products/:id/attributes', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const product = await storage.findProductByIdOrSlug(String(req.params.id || ''));
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const rawValues = Array.isArray(req.body?.values) ? req.body.values : null;
      if (!rawValues) {
        res.status(400).json({ error: 'فیلد values باید به صورت آرایه ارسال شود.' });
        return;
      }
      const saved = await storage.setProductAttributes(product.id, rawValues);
      res.json({ productId: product.id, attributeValues: saved });
    } catch (err) {
      next(err);
    }
  });

  // Product Variants (SKU / Part Number / Color / Storage / Cost Price)
  router.get('/products/:id/variants', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const product = await storage.findProductByIdOrSlug(String(req.params.id || ''));
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const variants = await storage.listProductVariants(product.id, true);
      res.json({ productId: product.id, variants });
    } catch (err) {
      next(err);
    }
  });

  router.post('/products/:id/variants', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const product = await storage.findProductByIdOrSlug(String(req.params.id || ''));
      if (!product) {
        res.status(404).json({ error: 'محصول یافت نشد.' });
        return;
      }
      const body = req.body || {};
      const sku = String(body.sku || '').trim().toUpperCase();
      const colorNameFa = String(body.colorNameFa || body.color_name_fa || '').trim();
      const priceToman = Number(body.priceToman ?? body.price_toman);
      if (sku.length < 3 || colorNameFa.length < 2 || !Number.isFinite(priceToman) || priceToman <= 0) {
        res.status(400).json({ error: 'کد SKU، نام رنگ فارسی و قیمت معتبر (مثبت) الزامی است.' });
        return;
      }
      const payload: ProductVariantDTO = {
        id: String(body.id || '').trim(),
        productId: product.id,
        warrantyId: body.warrantyId ? String(body.warrantyId).trim() : null,
        sku,
        barcode: body.barcode ? String(body.barcode).trim() : null,
        partNumber: body.partNumber ? String(body.partNumber).trim() : null,
        colorId: body.colorId ? String(body.colorId).trim() : undefined,
        colorNameFa,
        colorNameEn: body.colorNameEn ? String(body.colorNameEn).trim() : null,
        colorHex: String(body.colorHex || '#1e293b').trim(),
        storage: body.storage ? String(body.storage).trim() : null,
        ram: body.ram ? String(body.ram).trim() : null,
        simType: body.simType ? String(body.simType).trim() : null,
        priceToman: Math.round(priceToman),
        originalPriceToman:
          body.originalPriceToman !== undefined && Number(body.originalPriceToman) > 0
            ? Math.round(Number(body.originalPriceToman))
            : null,
        costPriceToman:
          body.costPriceToman !== undefined && Number(body.costPriceToman) >= 0
            ? Math.round(Number(body.costPriceToman))
            : null,
        isPublished: body.isPublished !== false,
      };
      const saved = await storage.upsertProductVariant(payload);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'variant.upsert',
        entityType: 'product_variant',
        entityId: saved.id,
        details: sanitizeAuditDetails({ productId: product.id, sku: saved.sku, priceToman: saved.priceToman }),
      });
      res.status(201).json({ variant: saved });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/variants/:variantId', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const existing = await storage.findVariantByIdOrSku(String(req.params.variantId || ''));
      if (!existing) {
        res.status(404).json({ error: 'تنوع کالا یافت نشد.' });
        return;
      }
      const body = req.body || {};
      const nextPrice =
        body.priceToman !== undefined ? Number(body.priceToman) : existing.priceToman;
      if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        res.status(400).json({ error: 'قیمت تنوع باید عدد مثبت باشد.' });
        return;
      }
      const merged: ProductVariantDTO = {
        ...existing,
        warrantyId: body.warrantyId !== undefined ? (body.warrantyId ? String(body.warrantyId) : null) : existing.warrantyId,
        sku: body.sku ? String(body.sku).trim().toUpperCase() : existing.sku,
        barcode: body.barcode !== undefined ? (body.barcode ? String(body.barcode).trim() : null) : existing.barcode,
        partNumber: body.partNumber !== undefined ? (body.partNumber ? String(body.partNumber).trim() : null) : existing.partNumber,
        colorNameFa: body.colorNameFa ? String(body.colorNameFa).trim() : existing.colorNameFa,
        colorNameEn: body.colorNameEn !== undefined ? (body.colorNameEn ? String(body.colorNameEn).trim() : null) : existing.colorNameEn,
        colorHex: body.colorHex ? String(body.colorHex).trim() : existing.colorHex,
        storage: body.storage !== undefined ? (body.storage ? String(body.storage).trim() : null) : existing.storage,
        ram: body.ram !== undefined ? (body.ram ? String(body.ram).trim() : null) : existing.ram,
        simType: body.simType !== undefined ? (body.simType ? String(body.simType).trim() : null) : existing.simType,
        priceToman: Math.round(nextPrice),
        originalPriceToman:
          body.originalPriceToman !== undefined
            ? Number(body.originalPriceToman) > 0
              ? Math.round(Number(body.originalPriceToman))
              : null
            : existing.originalPriceToman,
        costPriceToman:
          body.costPriceToman !== undefined
            ? Number(body.costPriceToman) >= 0
              ? Math.round(Number(body.costPriceToman))
              : null
            : existing.costPriceToman,
        isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : existing.isPublished,
      };
      const saved = await storage.upsertProductVariant(merged);
      res.json({ variant: saved });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/variants/:variantId', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const id = String(req.params.variantId || '').trim();
      const deleted = await storage.deleteProductVariant(id);
      if (!deleted) {
        res.status(404).json({ error: 'تنوع کالا یافت نشد.' });
        return;
      }
      res.json({ ok: true, id });
    } catch (err) {
      next(err);
    }
  });

  // Multi-Warehouse & Stock Ledger
  router.get('/warehouses', async (_req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const warehouses = await storage.listWarehouses(true);
      res.json({ warehouses });
    } catch (err) {
      next(err);
    }
  });

  const handleSaveWarehouse = async (
    req: AdminAuthenticatedRequest,
    res: Response,
    next: express.NextFunction
  ) => {
    try {
      const body = req.body || {};
      const paramId = req.params.id ? String(req.params.id).trim() : '';
      const existing = paramId
        ? (await storage.listWarehouses(true)).find((w) => w.id === paramId) || null
        : null;
      if (paramId && !existing) {
        res.status(404).json({ error: 'انبار مورد نظر یافت نشد.' });
        return;
      }
      const code = String(body.code ?? existing?.code ?? '').trim().toUpperCase();
      const nameFa = String(body.nameFa ?? body.name_fa ?? existing?.nameFa ?? '').trim();
      const city = String(body.city ?? existing?.city ?? '').trim();
      if (code.length < 2 || nameFa.length < 2 || city.length < 2) {
        res.status(400).json({ error: 'کد انبار، نام انبار و شهر الزامی است.' });
        return;
      }
      const payload: WarehouseDTO = {
        id: paramId || String(body.id || '').trim(),
        code,
        nameFa,
        city,
        addressFa:
          body.addressFa !== undefined
            ? body.addressFa
              ? String(body.addressFa).trim()
              : null
            : existing?.addressFa ?? null,
        isActive:
          typeof body.isActive === 'boolean' ? body.isActive : existing ? existing.isActive : true,
      };
      const saved = await storage.upsertWarehouse(payload);
      res.status(paramId ? 200 : 201).json({ warehouse: saved });
    } catch (err) {
      next(err);
    }
  };

  router.post('/warehouses', handleSaveWarehouse);
  router.patch('/warehouses/:id', handleSaveWarehouse);

  router.get('/warehouse-stock', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const stock = await storage.listWarehouseStock({
        warehouseId: typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined,
        variantId: typeof req.query.variantId === 'string' ? req.query.variantId : undefined,
        productId: typeof req.query.productId === 'string' ? req.query.productId : undefined,
        lowStockOnly: req.query.lowStockOnly === 'true',
      });
      res.json({ stock, total: stock.length });
    } catch (err) {
      next(err);
    }
  });

  router.get('/stock-movements', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const movements = await storage.listStockMovements({
        warehouseId: typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined,
        variantId: typeof req.query.variantId === 'string' ? req.query.variantId : undefined,
        movementType: typeof req.query.movementType === 'string' ? req.query.movementType : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      });
      res.json({ movements, total: movements.length });
    } catch (err) {
      next(err);
    }
  });

  router.post('/stock-movements', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const body = req.body || {};
      const warehouseId = String(body.warehouseId || body.warehouse_id || '').trim();
      const variantId = String(body.variantId || body.variant_id || '').trim();
      const movementTypeRaw = String(body.movementType || body.movement_type || '').trim();
      const quantityChange = Math.trunc(Number(body.quantityChange ?? body.quantity_change));

      if (!warehouseId || !variantId) {
        res.status(400).json({ error: 'شناسه انبار (warehouseId) و تنوع کالا (variantId) الزامی است.' });
        return;
      }
      if (!VALID_STOCK_MOVEMENT_TYPES.includes(movementTypeRaw as StockMovementType)) {
        res.status(400).json({ error: 'نوع تراکنش انبار (movementType) معتبر نیست.' });
        return;
      }
      if (!Number.isFinite(quantityChange) || quantityChange === 0) {
        res.status(400).json({ error: 'مقدار تغییر موجودی (quantityChange) باید عدد صحیح غیرصفر باشد.' });
        return;
      }

      const variantBefore = await storage.findVariantByIdOrSku(variantId).catch(() => null);
      const productBefore = variantBefore
        ? await storage.findProductByIdOrSlug(variantBefore.productId).catch(() => null)
        : null;
      const prevProductStock = productBefore?.stockCount ?? 0;
      const prevVariantStock = variantBefore?.availableStock ?? 0;

      const admin = req.authUser!;
      const result = await storage.recordStockMovement({
        warehouseId,
        variantId,
        movementType: movementTypeRaw as StockMovementType,
        quantityChange,
        referenceType: body.referenceType ? String(body.referenceType).trim() : null,
        referenceId: body.referenceId ? String(body.referenceId).trim() : null,
        idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey).trim() : null,
        noteFa: body.noteFa ? String(body.noteFa).trim() : null,
        createdBy: admin.id,
        shelfLocation: body.shelfLocation !== undefined ? String(body.shelfLocation).trim() : undefined,
        minStockAlert:
          body.minStockAlert !== undefined && Number.isFinite(Number(body.minStockAlert))
            ? Number(body.minStockAlert)
            : undefined,
      });

      if (!result.deduplicated) {
        await storage.createAuditLog({
          adminUserId: admin.id,
          adminEmail: admin.email,
          action: 'inventory.stock_movement',
          entityType: 'warehouse_stock',
          entityId: result.stock.id || variantId,
          details: sanitizeAuditDetails({
            warehouseId,
            variantId,
            movementType: movementTypeRaw,
            quantityChange,
            balanceAfter: result.movement.balanceAfter,
            idempotencyKey: result.movement.idempotencyKey,
          }),
        });

        const restockedProductId = result.stock.productId || variantBefore?.productId;
        if (
          restockedProductId &&
          result.stock.availableQty > 0 &&
          (prevProductStock <= 0 || prevVariantStock <= 0)
        ) {
          void Promise.resolve(
            options?.onStockRestocked?.({
              productId: restockedProductId,
              variantId: result.stock.variantId,
              stockCount: result.stock.availableQty,
            })
          ).catch(() => undefined);
        }
      }

      res.status(result.deduplicated ? 200 : 201).json(result);
    } catch (err) {
      if (err instanceof StockMovementError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  });

  // Review Moderation & Rating Recalculation
  router.get('/reviews', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const page = Math.max(1, Math.floor(Number(req.query.page || 1)));
      const limit = Math.min(200, Math.max(1, Math.floor(Number(req.query.limit || 50))));
      const offset = (page - 1) * limit;
      const statusParam = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : 'all';
      const isApproved =
        statusParam === 'pending'
          ? false
          : statusParam === 'approved'
          ? true
          : typeof req.query.isApproved === 'string'
          ? req.query.isApproved === 'true'
          : undefined;
      const result = await storage.listAllReviews({
        isApproved,
        productId: typeof req.query.productId === 'string' ? req.query.productId : undefined,
        limit,
        offset,
      });
      res.json({
        reviews: result.reviews,
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/reviews/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const reviewId = String(req.params.id || '').trim();
      if (!reviewId || typeof req.body?.isApproved !== 'boolean') {
        res.status(400).json({ error: 'وضعیت تایید دیدگاه (isApproved) باید به‌صورت boolean ارسال شود.' });
        return;
      }
      const existing = await storage.findProductReviewById(reviewId);
      if (!existing) {
        res.status(404).json({ error: 'دیدگاه مورد نظر یافت نشد.' });
        return;
      }
      const updated = await storage.moderateProductReview(reviewId, req.body.isApproved);
      if (!updated) {
        res.status(404).json({ error: 'دیدگاه مورد نظر یافت نشد.' });
        return;
      }
      const product = await storage.findProductByIdOrSlug(updated.productId);
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: updated.isApproved ? 'review.approve' : 'review.reject',
        entityType: 'product_review',
        entityId: updated.id,
        details: sanitizeAuditDetails({
          productId: updated.productId,
          rating: updated.rating,
          verified: updated.verified,
          isApproved: updated.isApproved,
        }),
      });
      res.json({
        review: updated,
        productRating: product
          ? { rating: product.rating, reviewCount: product.reviewCount }
          : undefined,
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/reviews/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const reviewId = String(req.params.id || '').trim();
      const existing = await storage.findProductReviewById(reviewId);
      if (!existing) {
        res.status(404).json({ error: 'دیدگاه مورد نظر یافت نشد.' });
        return;
      }
      const deleted = await storage.deleteProductReview(reviewId);
      if (!deleted) {
        res.status(404).json({ error: 'دیدگاه مورد نظر یافت نشد.' });
        return;
      }
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'review.delete',
        entityType: 'product_review',
        entityId: reviewId,
        details: sanitizeAuditDetails({ productId: existing.productId }),
      });
      res.json({ ok: true, id: reviewId });
    } catch (err) {
      next(err);
    }
  });

  // Product Q&A Moderation & Answer
  router.patch('/questions/:id', async (req: AdminAuthenticatedRequest, res: Response, next) => {
    try {
      const questionId = String(req.params.id || '').trim();
      if (!questionId) {
        res.status(400).json({ error: 'شناسه پرسش معتبر نیست.' });
        return;
      }
      const answer =
        req.body?.answer !== undefined
          ? req.body.answer
            ? String(req.body.answer).trim()
            : null
          : undefined;
      const isApproved =
        typeof req.body?.isApproved === 'boolean' ? req.body.isApproved : undefined;
      const updated = await storage.answerProductQuestion(questionId, {
        ...(answer !== undefined ? { answer } : {}),
        ...(isApproved !== undefined ? { isApproved } : {}),
      });
      if (!updated) {
        res.status(404).json({ error: 'پرسش مورد نظر یافت نشد.' });
        return;
      }
      const admin = req.authUser!;
      await storage.createAuditLog({
        adminUserId: admin.id,
        adminEmail: admin.email,
        action: 'question.answer',
        entityType: 'product_question',
        entityId: updated.id,
        details: sanitizeAuditDetails({
          productId: updated.productId,
          hasAnswer: Boolean(updated.answer),
          isApproved: updated.isApproved,
        }),
      });
      res.json({ question: updated });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
