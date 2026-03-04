// ═══════════════════════════════════════════════════════════════════════════
// PayLoom API Gateway — Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const { authRoutes } = require('./routes/auth.routes');
const { productRoutes } = require('./routes/product.routes');
const { orderRoutes } = require('./routes/order.routes');
const { paymentRoutes } = require('./routes/payment.routes');
const { payoutRoutes } = require('./routes/payout.routes');
const { analyticsRoutes } = require('./routes/analytics.routes');

// Middleware
const { errorHandler } = require('./middleware/error.middleware');
const { logger } = require('./middleware/logger.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────────────────────────────────────
// Security Middleware
// ───────────────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ───────────────────────────────────────────────────────────────────────────
// Logging Middleware
// ───────────────────────────────────────────────────────────────────────────
app.use(logger);

// ───────────────────────────────────────────────────────────────────────────
// Health Check
// ───────────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ───────────────────────────────────────────────────────────────────────────
// API Routes
// ───────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// ───────────────────────────────────────────────────────────────────────────
// 404 Handler
// ───────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ───────────────────────────────────────────────────────────────────────────
// Error Handler (Must be last)
// ───────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

// ───────────────────────────────────────────────────────────────────────────
// Initialize Services & Start Server
// ───────────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    console.log('🚀 Initializing PayLoom API Gateway...');
    
    // Initialize Database
    await initializeDatabase();
    console.log('✅ Database connected');
    
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis cache initialized');
    
    // Start Server
    app.listen(PORT, () => {
      console.log(`\n✅ PayLoom API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
