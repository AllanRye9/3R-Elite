"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { revieweeId, listingId, rating, comment } = req.body;
        if (!revieweeId || !listingId || !rating)
            return next((0, errorHandler_1.createError)('Missing required fields', 400));
        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return next((0, errorHandler_1.createError)('Rating must be an integer between 1 and 5', 400));
        }
        const review = await prisma_1.prisma.review.create({
            data: { reviewerId: req.user.userId, revieweeId, listingId, rating: ratingNum, comment },
            include: { reviewer: { select: { id: true, name: true, avatar: true } } },
        });
        res.status(201).json(review);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map