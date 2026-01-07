import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin operation rate limiter
 * Limits: 30 requests per 15 minutes per IP
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: 'error',
    message: 'Too many admin operations. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Broadcasting rate limiter
 * Limits: 10 broadcasts per hour per IP
 * Prevents notification spam
 */
export const broadcastLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    status: 'error',
    message: 'Too many broadcast attempts. You can only broadcast 10 times per hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Search rate limiter
 * Limits: 50 searches per 15 minutes per IP
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    status: 'error',
    message: 'Too many search requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create/Update rate limiter
 * Limits: 20 create/update operations per 15 minutes per IP
 */
export const createUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'error',
    message: 'Too many create/update operations. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
