"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { listingId, reason } = req.body;
        if (!listingId || !reason)
            return next((0, errorHandler_1.createError)('Missing required fields', 400));
        const report = await prisma_1.prisma.report.create({
            data: { reporterId: req.user.userId, listingId, reason },
        });
        res.status(201).json(report);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map