const express = require('express');
const prisma = require('../lib/prisma');
const { auth, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// GET /api/products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search, categoryId, minPrice, maxPrice, condition,
      page = 1, limit = 12, sort = 'newest',
    } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (condition) where.condition = condition;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'oldest' ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          seller: { select: { id: true, name: true, avatar: true } },
          category: true,
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((p) => ({
      ...p,
      avgRating: p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0,
      reviewCount: p.reviews.length,
    }));

    res.json({
      products: productsWithRating,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, price, stock, condition, categoryId } = req.body;
    if (!title || !description || !price || !categoryId) {
      return res.status(400).json({ error: 'Title, description, price, and categoryId are required' });
    }

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 1,
        condition: condition || 'new',
        images,
        sellerId: req.user.id,
        categoryId,
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, avatar: true, bio: true, location: true, createdAt: true } },
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const avgRating = product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

    res.json({ ...product, avgRating, reviewCount: product.reviews.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, price, stock, condition, categoryId } = req.body;
    const newImages = req.files ? req.files.map((f) => f.path) : [];

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(condition && { condition }),
        ...(categoryId && { categoryId }),
        ...(newImages.length > 0 && { images: newImages }),
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
        category: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
