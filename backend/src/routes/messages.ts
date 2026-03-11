import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, listingId, content } = req.body;
    if (!receiverId || !listingId || !content) {
      return next(createError('Missing required fields', 400));
    }

    const message = await prisma.message.create({
      data: { senderId: req.user!.userId, receiverId, listingId, content },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group into conversations by listingId + other user
    const convMap = new Map<string, typeof messages[0]>();
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.listingId}__${otherId}`;
      if (!convMap.has(key)) convMap.set(key, msg);
    }

    res.json(Array.from(convMap.values()));
  } catch (err) {
    next(err);
  }
});

router.get('/:listingId/:userId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId, userId } = req.params;
    const meId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: meId, receiverId: userId },
          { senderId: userId, receiverId: meId },
        ],
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: { listingId, senderId: userId, receiverId: meId, read: false },
      data: { read: true },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

export default router;
