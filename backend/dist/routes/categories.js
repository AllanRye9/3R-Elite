"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const router = (0, express_1.Router)();
router.get('/', async (_req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            where: { parentId: null },
            include: { children: true },
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:slug/subcategories', async (req, res, next) => {
    try {
        const parent = await prisma_1.prisma.category.findUnique({ where: { slug: req.params.slug } });
        if (!parent) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        const subcategories = await prisma_1.prisma.category.findMany({
            where: { parentId: parent.id },
            orderBy: { name: 'asc' },
        });
        res.json(subcategories);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map