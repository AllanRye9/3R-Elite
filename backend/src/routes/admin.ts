import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { uploadToCDN } from '../utils/cdn';
import fs from 'fs';
import path from 'path';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

// ─── In-memory site settings ───────────────────────────────────────────────────

const defaultSettings: Record<string, unknown> = {
  siteName: '3R Elite',
  maintenanceMode: false,
  allowRegistration: true,
  defaultCountry: 'UAE',
  itemsPerPage: 20,
  maxImagesPerListing: 10,
};

let siteSettings: Record<string, unknown> = { ...defaultSettings };

// ─── Stats ─────────────────────────────────────────────────────────────────────

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      users,
      listings,
      reports,
      activeListings,
      pendingListings,
      newUsersThisMonth,
      newListingsThisMonth,
      recentUsers,
      recentListings,
      listingsByStatusRaw,
      usersByCountryRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.report.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.listing.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.listing.findMany({
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.listing.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.user.groupBy({ by: ['country'], _count: { country: true } }),
    ]);

    const listingsByStatus = listingsByStatusRaw.reduce(
      (acc, row) => ({ ...acc, [row.status]: row._count.status }),
      {} as Record<string, number>,
    );

    const usersByCountry = usersByCountryRaw.reduce(
      (acc, row) => ({ ...acc, [row.country]: row._count.country }),
      {} as Record<string, number>,
    );

    res.json({
      users,
      listings,
      reports,
      activeListings,
      pendingListings,
      newUsersThisMonth,
      newListingsThisMonth,
      recentUsers,
      recentListings,
      listingsByStatus,
      usersByCountry,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Analytics ─────────────────────────────────────────────────────────────────

router.get('/analytics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
      recentUsers,
      recentListings,
      topCategoriesRaw,
      listingsByCountryRaw,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.listing.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.listing.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10,
      }),
      prisma.listing.groupBy({
        by: ['country'],
        _count: { country: true },
      }),
    ]);

    // Bucket users and listings by date
    const bucketByDate = (records: { createdAt: Date }[]) => {
      const counts: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        counts[d.toISOString().slice(0, 10)] = 0;
      }
      for (const record of records) {
        const key = record.createdAt.toISOString().slice(0, 10);
        if (key in counts) counts[key]++;
      }
      return Object.entries(counts).map(([date, count]) => ({ date, count }));
    };

    const userGrowth = bucketByDate(recentUsers);
    const listingGrowth = bucketByDate(recentListings);

    // Resolve category names for topCategories
    const categoryIds = topCategoriesRaw.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const topCategories = topCategoriesRaw.map((row) => ({
      name: categoryMap.get(row.categoryId) ?? 'Unknown',
      count: row._count.categoryId,
    }));

    const listingsByCountry = listingsByCountryRaw.reduce(
      (acc, row) => ({ ...acc, [row.country]: row._count.country }),
      {} as Record<string, number>,
    );

    // Revenue by category (sum of prices, top 10)
    const revenueByCategoryRaw = await prisma.listing.groupBy({
      by: ['categoryId'],
      _sum: { price: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 10,
    });

    const revCategoryIds = revenueByCategoryRaw.map((r) => r.categoryId);
    const revCategories = await prisma.category.findMany({
      where: { id: { in: revCategoryIds } },
      select: { id: true, name: true },
    });
    const revCategoryMap = new Map(revCategories.map((c) => [c.id, c.name]));

    const revenueByCategory = revenueByCategoryRaw.map((row) => ({
      name: revCategoryMap.get(row.categoryId) ?? 'Unknown',
      total: row._sum.price ?? 0,
    }));

    res.json({
      userGrowth,
      listingGrowth,
      topCategories,
      listingsByCountry,
      revenueByCategory,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Users ─────────────────────────────────────────────────────────────────────

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '20'));
    const search = (req.query.search as string || '').trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, country: true, isBanned: true, isVerified: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isBanned, isVerified, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(isBanned !== undefined && { isBanned }),
        ...(isVerified !== undefined && { isVerified }),
        ...(role && { role }),
      },
      select: { id: true, email: true, name: true, role: true, isBanned: true, isVerified: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.userId === req.params.id) {
      throw createError('Cannot delete your own account', 400);
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Listings ──────────────────────────────────────────────────────────────────

router.get('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '20'));
    const search = (req.query.search as string || '').trim();
    const status = (req.query.status as string || '').trim();

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
});

router.put('/listings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, placement, placementExpiresAt } = req.body;
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(placement !== undefined && { placement }),
        ...(placementExpiresAt !== undefined && { placementExpiresAt: placementExpiresAt ? new Date(placementExpiresAt) : null }),
      },
    });
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

// ─── Approve listing with placement & duration ─────────────────────────────────

router.put('/listings/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { placement, durationHours, customExpiry } = req.body;

    if (!placement || !['LATEST_COLLECTIONS', 'FEATURED_DEAL'].includes(placement)) {
      throw createError('placement must be LATEST_COLLECTIONS or FEATURED_DEAL', 400);
    }

    let placementExpiresAt: Date;
    if (customExpiry) {
      placementExpiresAt = new Date(customExpiry);
      if (isNaN(placementExpiresAt.getTime())) {
        throw createError('Invalid customExpiry date', 400);
      }
    } else {
      const hours = parseInt(durationHours) || 48;
      placementExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        placement,
        placementExpiresAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    res.json(listing);
  } catch (err) {
    next(err);
  }
});

// ─── Reject listing ────────────────────────────────────────────────────────────

router.put('/listings/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', placement: 'NONE', placementExpiresAt: null },
    });
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

router.delete('/listings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Categories ────────────────────────────────────────────────────────────────

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { listings: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, icon, parentId } = req.body;
    if (!name || !slug) {
      throw createError('Name and slug are required', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        ...(icon && { icon }),
        ...(parentId && { parentId }),
      },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, icon, parentId } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId }),
      },
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Reports ───────────────────────────────────────────────────────────────────

router.get('/reports', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

router.delete('/reports/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: 'Report dismissed successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Settings ──────────────────────────────────────────────────────────────────

router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(siteSettings);
  } catch (err) {
    next(err);
  }
});

router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedKeys = Object.keys(defaultSettings);
    for (const key of Object.keys(req.body)) {
      if (allowedKeys.includes(key)) {
        siteSettings[key] = req.body[key];
      }
    }
    res.json(siteSettings);
  } catch (err) {
    next(err);
  }
});

// ─── Image Moderation ──────────────────────────────────────────────────────────

router.get('/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '20'));
    const status = (req.query.status as string || 'PENDING').toUpperCase();
    const sellerId = req.query.sellerId as string | undefined;

    const where: Record<string, unknown> = { status };
    if (sellerId) where.sellerId = sellerId;

    const [images, total] = await Promise.all([
      prisma.productImage.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, email: true } },
          listing: { select: { id: true, title: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.productImage.count({ where }),
    ]);

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imagesWithUrls = images.map((img) => ({
      ...img,
      previewUrl: img.cdnUrl || `${baseUrl}/uploads/temp/${img.tempPath}`,
    }));

    res.json({ images: imagesWithUrls, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
});

router.put('/images/:id/approve', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.id } });
    if (!image) throw createError('Image not found', 404);
    if (image.status !== 'PENDING') throw createError('Image is not pending review', 400);

    const tempFilePath = path.join(process.cwd(), 'uploads', 'temp', image.tempPath);
    if (!fs.existsSync(tempFilePath)) {
      throw createError('Temporary file not found; it may have already been processed', 404);
    }

    let cdnUrl: string;
    try {
      cdnUrl = await uploadToCDN(tempFilePath, image.tempPath);
    } catch (cdnErr) {
      throw createError(`CDN upload failed: ${(cdnErr as Error).message}`, 502);
    }

    // Delete temp file after successful CDN upload.
    try { fs.unlinkSync(tempFilePath); } catch { /* best-effort */ }

    const updated = await prisma.productImage.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        cdnUrl,
        reviewedAt: new Date(),
        reviewedBy: req.user!.userId,
      },
    });

    // Update the listing's images array to replace the temp preview URL with the CDN URL.
    if (image.listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: image.listingId } });
      if (listing) {
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const tempPreviewUrl = `${baseUrl}/uploads/temp/${image.tempPath}`;
        // Replace the temp preview URL with the CDN URL; add CDN URL if not already present.
        const alreadyHasTemp = listing.images.includes(tempPreviewUrl);
        const updatedImages = alreadyHasTemp
          ? listing.images.map((u) => (u === tempPreviewUrl ? cdnUrl : u))
          : [...listing.images, cdnUrl];
        await prisma.listing.update({
          where: { id: image.listingId },
          data: { images: updatedImages },
        });
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.put('/images/:id/reject', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const image = await prisma.productImage.findUnique({ where: { id: req.params.id } });
    if (!image) throw createError('Image not found', 404);
    if (image.status !== 'PENDING') throw createError('Image is not pending review', 400);

    // Delete temp file.
    const tempFilePath = path.join(process.cwd(), 'uploads', 'temp', image.tempPath);
    try { fs.unlinkSync(tempFilePath); } catch { /* best-effort */ }

    const updated = await prisma.productImage.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: req.user!.userId,
        rejectionReason: reason || null,
      },
    });

    // Remove temp preview URL from the listing's images array.
    if (image.listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: image.listingId } });
      if (listing) {
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const tempPreviewUrl = `${baseUrl}/uploads/temp/${image.tempPath}`;
        await prisma.listing.update({
          where: { id: image.listingId },
          data: { images: listing.images.filter((u) => u !== tempPreviewUrl) },
        });
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.put('/images/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids, action, reason } = req.body as { ids: string[]; action: 'approve' | 'reject'; reason?: string };
    if (!Array.isArray(ids) || ids.length === 0) throw createError('ids array is required', 400);
    if (!['approve', 'reject'].includes(action)) throw createError('action must be approve or reject', 400);

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const adminUserId = req.user!.userId;

    const processOne = async (id: string): Promise<{ id: string; success: boolean; error?: string }> => {
      const image = await prisma.productImage.findUnique({ where: { id } });
      if (!image || image.status !== 'PENDING') {
        return { id, success: false, error: 'Not found or not pending' };
      }

      if (action === 'approve') {
        const tempFilePath = path.join(process.cwd(), 'uploads', 'temp', image.tempPath);
        if (!fs.existsSync(tempFilePath)) {
          return { id, success: false, error: 'Temp file missing' };
        }
        const cdnUrl = await uploadToCDN(tempFilePath, image.tempPath);
        try { fs.unlinkSync(tempFilePath); } catch { /* best-effort */ }
        await prisma.productImage.update({
          where: { id },
          data: { status: 'APPROVED', cdnUrl, reviewedAt: new Date(), reviewedBy: adminUserId },
        });
        if (image.listingId) {
          const listing = await prisma.listing.findUnique({ where: { id: image.listingId } });
          if (listing) {
            const tempPreviewUrl = `${baseUrl}/uploads/temp/${image.tempPath}`;
            const alreadyHasTemp = listing.images.includes(tempPreviewUrl);
            const updatedImages = alreadyHasTemp
              ? listing.images.map((u) => (u === tempPreviewUrl ? cdnUrl : u))
              : [...listing.images, cdnUrl];
            await prisma.listing.update({ where: { id: image.listingId }, data: { images: updatedImages } });
          }
        }
      } else {
        const tempFilePath = path.join(process.cwd(), 'uploads', 'temp', image.tempPath);
        try { fs.unlinkSync(tempFilePath); } catch { /* best-effort */ }
        await prisma.productImage.update({
          where: { id },
          data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: adminUserId, rejectionReason: reason || null },
        });
        if (image.listingId) {
          const listing = await prisma.listing.findUnique({ where: { id: image.listingId } });
          if (listing) {
            const tempPreviewUrl = `${baseUrl}/uploads/temp/${image.tempPath}`;
            await prisma.listing.update({
              where: { id: image.listingId },
              data: { images: listing.images.filter((u) => u !== tempPreviewUrl) },
            });
          }
        }
      }

      return { id, success: true };
    };

    const settled = await Promise.allSettled(ids.map(processOne));
    const results = settled.map((s) =>
      s.status === 'fulfilled'
        ? s.value
        : { id: 'unknown', success: false, error: (s.reason as Error).message },
    );

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
