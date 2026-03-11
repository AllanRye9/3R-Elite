"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('ADMIN'));
router.get('/stats', async (_req, res, next) => {
    try {
        const [users, listings, reports, activeListings] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.listing.count(),
            prisma_1.prisma.report.count(),
            prisma_1.prisma.listing.count({ where: { status: 'ACTIVE' } }),
        ]);
        res.json({ users, listings, reports, activeListings });
    }
    catch (err) {
        next(err);
    }
});
router.get('/users', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '20'));
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, country: true, isBanned: true, isVerified: true, createdAt: true },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        const total = await prisma_1.prisma.user.count();
        res.json({ users, pagination: { total, page, limit } });
    }
    catch (err) {
        next(err);
    }
});
router.put('/users/:id', async (req, res, next) => {
    try {
        const { isBanned, isVerified, role } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(isBanned !== undefined && { isBanned }),
                ...(isVerified !== undefined && { isVerified }),
                ...(role && { role }),
            },
            select: { id: true, email: true, name: true, role: true, isBanned: true, isVerified: true },
        });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
router.get('/listings', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '20'));
        const listings = await prisma_1.prisma.listing.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                category: { select: { name: true } },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        const total = await prisma_1.prisma.listing.count();
        res.json({ listings, pagination: { total, page, limit } });
    }
    catch (err) {
        next(err);
    }
});
router.put('/listings/:id', async (req, res, next) => {
    try {
        const { status } = req.body;
        const listing = await prisma_1.prisma.listing.update({
            where: { id: req.params.id },
            data: { ...(status && { status }) },
        });
        res.json(listing);
    }
    catch (err) {
        next(err);
    }
});
router.get('/reports', async (_req, res, next) => {
    try {
        const reports = await prisma_1.prisma.report.findMany({
            include: {
                reporter: { select: { id: true, name: true, email: true } },
                listing: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reports);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map