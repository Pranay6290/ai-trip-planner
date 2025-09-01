import telemetryService from '../services/telemetryService.js';
import { monitoring } from '../config/apis.js';

// Request tracking middleware
export const requestTracker = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate request ID
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Track request start
  req.startTime = startTime;
  
  // Override res.json to track response
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Track API usage
    telemetryService.trackApiUsage(
      'internal_api',
      `${req.method} ${req.path}`,
      responseTime,
      res.statusCode,
      req.user?.uid
    );
    
    // Track performance
    if (responseTime > monitoring.alertThresholds.responseTime) {
      telemetryService.trackPerformance('slow_api_response', responseTime, {
        endpoint: `${req.method} ${req.path}`,
        statusCode: res.statusCode,
        userId: req.user?.uid
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Error tracking middleware
export const errorTracker = (err, req, res, next) => {
  const context = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.uid
  };
  
  // Track error
  telemetryService.trackError(err, context, req.user?.uid);
  
  // Log error
  console.error(`[${req.requestId}] Error:`, {
    message: err.message,
    stack: err.stack,
    context
  });
  
  // Send error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(statusCode).json({
    error: true,
    message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    services: {}
  };
  
  try {
    // Check database connection
    const { getFirestore } = await import('../config/firebase.js');
    const db = getFirestore();
    if (db) {
      await db.collection('health').doc('check').get();
      health.services.database = 'healthy';
    } else {
      health.services.database = 'unavailable';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'unhealthy';
  }
  
  // Check external APIs
  try {
    // This would check Google APIs, weather service, etc.
    health.services.external_apis = 'healthy';
  } catch (error) {
    health.services.external_apis = 'degraded';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

// Rate limiting with telemetry
export const createRateLimiter = (options) => {
  return (req, res, next) => {
    // Implementation would use redis or in-memory store
    // For now, we'll use a simple in-memory approach
    
    const key = `${req.ip}_${req.path}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // This is a simplified implementation
    // In production, use redis-based rate limiting
    
    if (req.rateLimitExceeded) {
      telemetryService.trackEvent('rate_limit_exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user?.uid
      });
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
    
    next();
  };
};

// API quota monitoring
export const quotaMonitor = (service, endpoint) => {
  return async (req, res, next) => {
    const quotaKey = `${service}_${endpoint}_${new Date().toDateString()}`;
    
    // Check current usage (this would be stored in Redis in production)
    const currentUsage = await getCurrentQuotaUsage(quotaKey);
    const quotaLimit = getQuotaLimit(service, endpoint);
    
    if (currentUsage >= quotaLimit * monitoring.alertThresholds.quotaUsage) {
      // Send alert
      await sendQuotaAlert(service, endpoint, currentUsage, quotaLimit);
    }
    
    if (currentUsage >= quotaLimit) {
      telemetryService.trackEvent('quota_exceeded', {
        service,
        endpoint,
        currentUsage,
        quotaLimit,
        userId: req.user?.uid
      });
      
      return res.status(429).json({
        error: 'Quota Exceeded',
        message: `Daily quota exceeded for ${service} ${endpoint}`,
        quotaLimit,
        currentUsage
      });
    }
    
    // Increment usage
    await incrementQuotaUsage(quotaKey);
    
    next();
  };
};

// Helper functions (would be implemented with Redis in production)
async function getCurrentQuotaUsage(key) {
  // Simplified implementation
  return 0;
}

function getQuotaLimit(service, endpoint) {
  // Return quota limits from configuration
  return 1000; // Default
}

async function incrementQuotaUsage(key) {
  // Increment usage counter
}

async function sendQuotaAlert(service, endpoint, usage, limit) {
  const alert = {
    type: 'quota_warning',
    service,
    endpoint,
    usage,
    limit,
    percentage: (usage / limit) * 100,
    timestamp: new Date().toISOString()
  };
  
  // Send to monitoring service (Slack, Discord, etc.)
  console.warn('Quota Alert:', alert);
  
  // Track alert
  telemetryService.trackEvent('quota_alert', alert);
}

// Metrics collection middleware
export const metricsCollector = (req, res, next) => {
  // Collect custom metrics
  const metrics = {
    activeConnections: getActiveConnections(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: Date.now()
  };
  
  // Store metrics (would use time-series database in production)
  telemetryService.trackEvent('system_metrics', metrics);
  
  next();
};

function getActiveConnections() {
  // Return number of active connections
  return 0; // Simplified
}

export default {
  requestTracker,
  errorTracker,
  healthCheck,
  createRateLimiter,
  quotaMonitor,
  metricsCollector
};
