import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { revieweeId, listingId, rating, comment } = req.body;
    if (!revieweeId || !listingId || !rating) return next(createError('Missing required fields', 400));
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return next(createError('Rating must be an integer between 1 and 5', 400));
    }

    const review = await prisma.review.create({
      data: { reviewerId: req.user!.userId, revieweeId, listingId, rating: ratingNum, comment },
      include: { reviewer: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export default router;
