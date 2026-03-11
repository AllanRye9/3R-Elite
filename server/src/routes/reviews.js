const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(generalLimiter);

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'productId, rating, and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.sellerId === req.user.id) {
      return res.status(403).json({ error: 'You cannot review your own product' });
    }

    const existing = await prisma.review.findFirst({
      where: { productId, userId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId: req.user.id,
        productId,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
