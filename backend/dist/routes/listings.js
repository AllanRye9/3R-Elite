"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { category, location, country, priceMin, priceMax, condition, sort = 'createdAt', page = '1', limit = '20', q, } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const where = {
            status: 'ACTIVE',
            ...(country && { country: country }),
            ...(location && { location: { contains: location, mode: 'insensitive' } }),
            ...(condition && { condition: condition }),
            ...(q && {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ],
            }),
            ...((priceMin || priceMax) && {
                price: {
                    ...(priceMin && { gte: parseFloat(priceMin) }),
                    ...(priceMax && { lte: parseFloat(priceMax) }),
                },
            }),
            ...(category && {
                category: { slug: category },
            }),
        };
        const orderBy = sort === 'price_asc' ? { price: 'asc' }
            : sort === 'price_desc' ? { price: 'desc' }
                : sort === 'views' ? { views: 'desc' }
                    : { createdAt: 'desc' };
        const [listings, total] = await Promise.all([
            prisma_1.prisma.listing.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    user: { select: { id: true, name: true, avatar: true } },
                },
                orderBy,
                skip,
                take: limitNum,
            }),
            prisma_1.prisma.listing.count({ where }),
        ]);
        res.json({
            listings,
            pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
        });
    }
    catch (err) {
        next(err);
    }
});
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { title, description, price, currency, condition, images, location, country, categoryId, expiresAt } = req.body;
        if (!title || !description || price == null || !location || !country || !categoryId) {
            return next((0, errorHandler_1.createError)('Missing required fields', 400));
        }
        const listing = await prisma_1.prisma.listing.create({
            data: {
                title, description,
                price: parseFloat(price),
                currency: currency || 'AED',
                condition: condition || 'USED',
                images: images || [],
                location, country,
                userId: req.user.userId,
                categoryId,
                ...(expiresAt && { expiresAt: new Date(expiresAt) }),
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
        res.status(201).json(listing);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const listing = await prisma_1.prisma.listing.findUnique({
            where: { id: req.params.id },
            include: {
                category: true,
                user: { select: { id: true, name: true, avatar: true, phone: true, country: true, createdAt: true } },
            },
        });
        if (!listing)
            return next((0, errorHandler_1.createError)('Listing not found', 404));
        await prisma_1.prisma.listing.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
        res.json(listing);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const listing = await prisma_1.prisma.listing.findUnique({ where: { id: req.params.id } });
        if (!listing)
            return next((0, errorHandler_1.createError)('Listing not found', 404));
        if (listing.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return next((0, errorHandler_1.createError)('Forbidden', 403));
        }
        const { title, description, price, condition, images, location, status, expiresAt } = req.body;
        const updated = await prisma_1.prisma.listing.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price != null && { price: parseFloat(price) }),
                ...(condition && { condition }),
                ...(images && { images }),
                ...(location && { location }),
                ...(status && { status }),
                ...(expiresAt && { expiresAt: new Date(expiresAt) }),
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const listing = await prisma_1.prisma.listing.findUnique({ where: { id: req.params.id } });
        if (!listing)
            return next((0, errorHandler_1.createError)('Listing not found', 404));
        if (listing.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return next((0, errorHandler_1.createError)('Forbidden', 403));
        }
        await prisma_1.prisma.listing.delete({ where: { id: req.params.id } });
        res.json({ message: 'Listing deleted' });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:id/favorite', auth_1.authenticate, async (req, res, next) => {
    try {
        const existing = await prisma_1.prisma.favorite.findUnique({
            where: { userId_listingId: { userId: req.user.userId, listingId: req.params.id } },
        });
        if (existing) {
            await prisma_1.prisma.favorite.delete({ where: { id: existing.id } });
            res.json({ favorited: false });
        }
        else {
            await prisma_1.prisma.favorite.create({ data: { userId: req.user.userId, listingId: req.params.id } });
            res.json({ favorited: true });
        }
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/favorites', auth_1.authenticate, async (req, res, next) => {
    try {
        const favorite = await prisma_1.prisma.favorite.findUnique({
            where: { userId_listingId: { userId: req.user.userId, listingId: req.params.id } },
        });
        res.json({ favorited: !!favorite });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=listings.js.map