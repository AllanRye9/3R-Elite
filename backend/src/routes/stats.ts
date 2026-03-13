import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [activeListings, totalUsers, totalListings] = await Promise.all([
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.listing.count(),
    ]);
    res.json({
      activeListings,
      totalUsers,
      totalListings,
      countries: 2,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
