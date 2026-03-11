"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { receiverId, listingId, content } = req.body;
        if (!receiverId || !listingId || !content) {
            return next((0, errorHandler_1.createError)('Missing required fields', 400));
        }
        const message = await prisma_1.prisma.message.create({
            data: { senderId: req.user.userId, receiverId, listingId, content },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
            },
        });
        res.status(201).json(message);
    }
    catch (err) {
        next(err);
    }
});
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const messages = await prisma_1.prisma.message.findMany({
            where: { OR: [{ senderId: userId }, { receiverId: userId }] },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
                listing: { select: { id: true, title: true, images: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Group into conversations by listingId + other user
        const convMap = new Map();
        for (const msg of messages) {
            const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const key = `${msg.listingId}__${otherId}`;
            if (!convMap.has(key))
                convMap.set(key, msg);
        }
        res.json(Array.from(convMap.values()));
    }
    catch (err) {
        next(err);
    }
});
router.get('/:listingId/:userId', auth_1.authenticate, async (req, res, next) => {
    try {
        const { listingId, userId } = req.params;
        const meId = req.user.userId;
        const messages = await prisma_1.prisma.message.findMany({
            where: {
                listingId,
                OR: [
                    { senderId: meId, receiverId: userId },
                    { senderId: userId, receiverId: meId },
                ],
            },
            include: { sender: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
        });
        await prisma_1.prisma.message.updateMany({
            where: { listingId, senderId: userId, receiverId: meId, read: false },
            data: { read: true },
        });
        res.json(messages);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map