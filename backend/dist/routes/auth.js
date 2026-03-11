"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('country').isIn(['UAE', 'UGANDA']),
];
router.post('/register', registerValidation, async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password, name, phone, country } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return next((0, errorHandler_1.createError)('Email already registered', 400));
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { email, password: hashedPassword, name, phone, country },
            select: { id: true, email: true, name: true, role: true, country: true, createdAt: true },
        });
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
        res.status(201).json({ user, accessToken, refreshToken });
    }
    catch (err) {
        next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next((0, errorHandler_1.createError)('Email and password required', 400));
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return next((0, errorHandler_1.createError)('Invalid credentials', 401));
        if (user.isBanned)
            return next((0, errorHandler_1.createError)('Account is banned', 403));
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return next((0, errorHandler_1.createError)('Invalid credentials', 401));
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
        const { password: _, refreshToken: __, ...userData } = user;
        res.json({ user: userData, accessToken, refreshToken });
    }
    catch (err) {
        next(err);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return next((0, errorHandler_1.createError)('Refresh token required', 400));
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.refreshToken !== refreshToken) {
            return next((0, errorHandler_1.createError)('Invalid refresh token', 401));
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
        res.json({ accessToken, refreshToken: newRefreshToken });
    }
    catch {
        logger_1.logger.error('Refresh token verification failed');
        next((0, errorHandler_1.createError)('Invalid refresh token', 401));
    }
});
router.post('/logout', auth_1.authenticate, async (req, res, next) => {
    try {
        await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { refreshToken: null },
        });
        res.json({ message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map