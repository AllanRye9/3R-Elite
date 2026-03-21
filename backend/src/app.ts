import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import listingRoutes from './routes/listings';
import categoryRoutes from './routes/categories';
import messageRoutes from './routes/messages';
import reportRoutes from './routes/reports';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import statsRoutes from './routes/stats';
import docRoutes from './routes/doc';
import { getServiceReadiness } from './utils/serviceConfig';

const app = express();

// Support a comma-separated list of allowed origins in CORS_ORIGIN so that
// multiple deployment URLs (e.g. Railway + Render) can be whitelisted without
// requiring code changes.
const rawCorsOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = rawCorsOrigins.split(',').map((o) => o.trim()).filter(Boolean);

// CORS must be registered before helmet so that CORS response headers
// (Access-Control-Allow-Origin, etc.) are present on every response –
// including preflight OPTIONS replies – before helmet adds its own
// restrictive Cross-Origin-* headers.
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Return false instead of an error so the response still gets CORS
    // headers (the browser can read the rejection) rather than blowing up
    // the request entirely.
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security middleware – configured so its Cross-Origin-* defaults do not
// strip or conflict with the CORS headers set above.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Health check – must be registered before the rate-limiter so monitoring
// tools that call /health frequently are not throttled or blocked.
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    logger.error('Health check failed – database unreachable', err);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/health/services', (_req: Request, res: Response) => {
  const readiness = getServiceReadiness();
  const status = readiness.jwt.ready ? 200 : 503;
  res.status(status).json({
    status: readiness.jwt.ready ? 'ok' : 'error',
    services: readiness,
  });
});

// General API rate limit — generous enough for normal multi-tab browsing.
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use('/api/', limiter);

// Strict limiter for auth mutation endpoints (login / register) to prevent
// brute-force and credential-stuffing attacks while keeping normal use smooth.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,       // 15 minutes
  max: 20,                          // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes before trying again.' },
});

// Light limiter for /api/users/me — called on every page load and tab focus.
// 300 per 15 minutes allows up to ~20 reloads/minute for a single browser.
const meLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/admin-register', authLimiter);
app.use('/api/users/me', meLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/doc', docRoutes);

// 404 handler for unmatched API routes – must come after all route registrations.
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use(errorHandler);

export default app;
