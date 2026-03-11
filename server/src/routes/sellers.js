const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/sellers/:id
router.get('/:id', async (req, res) => {
  try {
    const seller = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        createdAt: true,
        products: {
          include: {
            category: true,
            reviews: { select: { rating: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const totalProducts = seller.products.length;
    const allRatings = seller.products.flatMap((p) => p.reviews.map((r) => r.rating));
    const avgRating = allRatings.length
      ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
      : 0;

    const productsWithRating = seller.products.map((p) => ({
      ...p,
      avgRating: p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0,
      reviewCount: p.reviews.length,
    }));

    res.json({
      ...seller,
      products: productsWithRating,
      stats: {
        totalProducts,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: allRatings.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
