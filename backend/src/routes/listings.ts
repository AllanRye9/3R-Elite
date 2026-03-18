import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

const router = Router();

// ─── Featured Deal ──────────────────────────────────────────────────────────

router.get('/featured-deal', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const listing = await prisma.listing.findFirst({
      where: {
        status: 'ACTIVE',
        placement: 'FEATURED_DEAL',
        placementExpiresAt: { gt: now },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(listing);
  } catch (err) {
    next(err);
  }
});

// ─── Latest Collections ─────────────────────────────────────────────────────

router.get('/latest-collections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const limit = Math.min(12, Math.max(1, parseInt(req.query.limit as string || '8')));

    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        placement: 'LATEST_COLLECTIONS',
        placementExpiresAt: { gt: now },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      category, location, country, priceMin, priceMax,
      condition, sort = 'createdAt', page = '1', limit = '20', q,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
      ...(country && { country: country as 'UAE' | 'UGANDA' }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(condition && { condition: condition as 'NEW' | 'USED' }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...((priceMin || priceMax) && {
        price: {
          ...(priceMin && { gte: parseFloat(priceMin) }),
          ...(priceMax && { lte: parseFloat(priceMax) }),
        },
      }),
      ...(category && {
        category: { slug: category },
      }),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'views' ? { views: 'desc' }
      : { createdAt: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, price, currency, condition, images, imageIds, location, country, categoryId, expiresAt } = req.body;

    if (!title || !description || price == null || !location || !country || !categoryId) {
      return next(createError('Missing required fields', 400));
    }

    // Build the initial images array: use provided URLs or temp preview URLs from imageIds.
    let initialImages: string[] = images || [];

    // If imageIds supplied, resolve temp preview URLs for backward-compat display.
    if (Array.isArray(imageIds) && imageIds.length > 0) {
      const productImages = await prisma.productImage.findMany({
        where: { id: { in: imageIds as string[] }, sellerId: req.user!.userId },
      });
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const tempUrls = productImages.map((pi) => `${baseUrl}/uploads/temp/${pi.tempPath}`);
      initialImages = [...initialImages, ...tempUrls];
    }

    const listing = await prisma.listing.create({
      data: {
        title, description,
        price: parseFloat(price),
        currency: currency || 'AED',
        condition: condition || 'USED',
        status: 'PENDING',
        images: initialImages,
        location, country,
        userId: req.user!.userId,
        categoryId,
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Link ProductImage records to this listing.
    if (Array.isArray(imageIds) && imageIds.length > 0) {
      await prisma.productImage.updateMany({
        where: { id: { in: imageIds as string[] }, sellerId: req.user!.userId },
        data: { listingId: listing.id },
      });
    }

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        user: { select: { id: true, name: true, avatar: true, phone: true, country: true, createdAt: true } },
        productImages: {
          where: { status: 'APPROVED' },
          select: { id: true, cdnUrl: true, uploadedAt: true },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!listing) return next(createError('Listing not found', 404));

    await prisma.listing.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });

    res.json(listing);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return next(createError('Listing not found', 404));
    if (listing.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return next(createError('Forbidden', 403));
    }

    const { title, description, price, condition, images, location, status, expiresAt } = req.body;

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price != null && { price: parseFloat(price) }),
        ...(condition && { condition }),
        ...(images && { images }),
        ...(location && { location }),
        ...(status && { status }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return next(createError('Listing not found', 404));
    if (listing.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return next(createError('Forbidden', 403));
    }

    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/favorite', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user!.userId, listingId: req.params.id } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({ data: { userId: req.user!.userId, listingId: req.params.id } });
      res.json({ favorited: true });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:id/favorites', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user!.userId, listingId: req.params.id } },
    });
    res.json({ favorited: !!favorite });
  } catch (err) {
    next(err);
  }
});

export default router;
