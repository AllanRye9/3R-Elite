import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, listings, reports, activeListings] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.report.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
    ]);
    res.json({ users, listings, reports, activeListings });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '20'));
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, country: true, isBanned: true, isVerified: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.user.count();
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

router.get('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '20'));
    const listings = await prisma.listing.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.listing.count();
    res.json({ listings, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
});

router.put('/listings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { ...(status && { status }) },
    });
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

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

export default router;
