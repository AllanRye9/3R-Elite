import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/subcategories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!parent) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    const subcategories = await prisma.category.findMany({
      where: { parentId: parent.id },
      orderBy: { name: 'asc' },
    });
    res.json(subcategories);
  } catch (err) {
    next(err);
  }
});

export default router;
