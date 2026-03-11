import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId, reason } = req.body;
    if (!listingId || !reason) return next(createError('Missing required fields', 400));

    const report = await prisma.report.create({
      data: { reporterId: req.user!.userId, listingId, reason },
    });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
