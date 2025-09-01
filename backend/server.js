import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import tripRoutes from './routes/tripRoutes.js';
import authRoutes from './routes/authRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Import monitoring and telemetry
import {
  requestTracker,
  errorTracker,
  healthCheck,
  createRateLimiter,
  metricsCollector
} from './middleware/monitoring.js';
import telemetryService from './services/telemetryService.js';
import { rateLimits } from './config/apis.js';

// Load environment variables
dotenv.config();

// Initialize Firebase (with error handling)
try {
  await import('./config/firebase.js');
  console.log('✅ Firebase configuration loaded');
} catch (error) {
  console.warn('⚠️ Firebase configuration warning:', error.message);
  console.warn('Some features may not work without proper Firebase setup');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Request tracking and metrics
app.use(requestTracker);
app.use(metricsCollector);

// Rate limiting with telemetry
const globalLimiter = createRateLimiter(rateLimits.global);
const apiLimiter = createRateLimiter(rateLimits.api);
app.use(globalLimiter);
app.use('/api', apiLimiter);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check endpoint (no dependencies)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Comprehensive health check endpoint with monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Analytics endpoint for internal monitoring
app.get('/api/analytics/stats/:eventName', async (req, res) => {
  try {
    const { eventName } = req.params;
    const { timeRange = '7d' } = req.query;
    const stats = await telemetryService.getEventStats(eventName, timeRange);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

// API routes
app.use('/api/trips', tripRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler with telemetry
app.use(errorTracker);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Trip Planner Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`👨‍💻 Created by: Pranay Gupta`);
});