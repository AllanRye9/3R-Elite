require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const sellerRoutes = require('./routes/sellers');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// CORS
app.use(cors({ origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'], credentials: true }));

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later.' },
});

app.use('/api/', generalLimiter);

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', generalLimiter, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('Database connected');

    if (process.env.NODE_ENV === 'production') {
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('Migrations applied');
      } catch (e) {
        console.warn('Migration warning:', e.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
