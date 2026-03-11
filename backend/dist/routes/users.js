"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, country: true, isVerified: true, createdAt: true },
        });
        if (!user)
            return next((0, errorHandler_1.createError)('User not found', 404));
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
router.put('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const { name, phone, avatar, country } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }), ...(country && { country }) },
            select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, country: true, isVerified: true, createdAt: true },
        });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
router.get('/favorites', auth_1.authenticate, async (req, res, next) => {
    try {
        const favorites = await prisma_1.prisma.favorite.findMany({
            where: { userId: req.user.userId },
            include: {
                listing: {
                    include: { category: true, user: { select: { id: true, name: true, avatar: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(favorites.map((f) => f.listing));
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/reviews', async (req, res, next) => {
    try {
        const reviews = await prisma_1.prisma.review.findMany({
            where: { revieweeId: req.params.id },
            include: { reviewer: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reviews);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map