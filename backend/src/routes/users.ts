import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, country: true, isVerified: true, createdAt: true },
    });
    if (!user) return next(createError('User not found', 404));
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, avatar, country } = req.body;
    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (country) data.country = country;
    if (avatar !== undefined) data.avatar = avatar || null;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, country: true, isVerified: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/favorites', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
      include: {
        listing: {
          include: { category: true, user: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.map((f) => f.listing));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/reviews', async (req, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.params.id },
      include: { reviewer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

export default router;
