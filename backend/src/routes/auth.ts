import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';

const router = Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('country').isIn(['UAE', 'UGANDA', 'KENYA', 'CHINA']),
];

router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, phone, country } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError('Email already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, country },
      select: { id: true, email: true, name: true, role: true, country: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      logger.error(`Welcome email failed for ${user.email}: ${String(err)}`)
    );

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError('Email and password required', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(createError('Invalid credentials', 401));
    if (user.isBanned) return next(createError('Account is banned', 403));

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(createError('Invalid credentials', 401));

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    const { password: _, refreshToken: __, ...userData } = user;
    res.json({ user: userData, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('Refresh token required', 400));

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.refreshToken !== refreshToken) {
      return next(createError('Invalid refresh token', 401));
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    logger.error('Refresh token verification failed');
    next(createError('Invalid refresh token', 401));
  }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to revoke refresh token if provided; ignore auth errors so expired
    // tokens don't block users from logging out.
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        });
      } catch {
        // Token is invalid/expired – still return success so client clears local storage
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/admin-register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, adminSecret, country } = req.body;

    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret || !adminSecret || adminSecret !== expectedSecret) {
      return next(createError('Invalid admin secret', 403));
    }

    if (!email || !password || !name) {
      return next(createError('Email, password, and name are required', 400));
    }

    if (password.length < 8) {
      return next(createError('Password must be at least 8 characters', 400));
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError('Email already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: 'ADMIN', country: country || 'UAE' },
      select: { id: true, email: true, name: true, role: true, country: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

// Forgot password — sends reset link via email
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required', 400));

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to avoid email enumeration
    if (!user) {
      res.json({ message: 'If that email is registered you will receive a reset link shortly.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpiry: resetExpiry },
    });

    sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) =>
      logger.error(`Password reset email failed for ${user.email}: ${String(err)}`)
    );

    res.json({ message: 'If that email is registered you will receive a reset link shortly.' });
  } catch (err) {
    next(err);
  }
});

// Reset password — validates token and sets new password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return next(createError('Token and new password are required', 400));
    if (password.length < 6) return next(createError('Password must be at least 6 characters', 400));

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) return next(createError('Reset token is invalid or has expired', 400));

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        refreshToken: null, // invalidate existing sessions
      },
    });

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
});

export default router;
