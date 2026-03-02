import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Extended request interface to include user information
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    jurisdiction?: string | null;
  };
}

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

/**
 * Role-based rate limiting middleware
 * Applies different rate limits based on user role
 * Requirements: 12.3
 * 
 * Rate limits per hour:
 * - super_admin: 1000 requests/hour
 * - admin: 500 requests/hour
 * - pnp, bfp, mdrrmo (agencies): 300 requests/hour
 * - lgu_officer: 200 requests/hour
 * - citizen: 100 requests/hour
 * 
 * Returns 429 Too Many Requests when limit exceeded with Retry-After header
 */

// Store for tracking request counts per user
// In production, this should use Redis for distributed systems
const requestStore = new Map<string, { count: number; resetTime: number }>();

// Role-based rate limits (requests per hour)
const ROLE_LIMITS: Record<string, number> = {
  super_admin: 1000,
  admin: 500,
  pnp: 300,
  bfp: 300,
  mdrrmo: 300,
  lgu_officer: 200,
  citizen: 100
};

// Default limit for unknown roles
const DEFAULT_LIMIT = 100;

// Window duration in milliseconds (1 hour)
const WINDOW_MS = 60 * 60 * 1000;

/**
 * Clean up expired entries from the request store
 * Runs periodically to prevent memory leaks
 */
const cleanupStore = () => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now > value.resetTime) {
      requestStore.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupStore, 5 * 60 * 1000);

/**
 * Role-based rate limiter middleware
 * Must be applied after authenticate middleware to access req.user
 * 
 * @example
 * router.get('/api/resource', authenticate, roleBasedRateLimiter, handler);
 */
export const roleBasedRateLimiter = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // If user is not authenticated, apply default limit
    // This should rarely happen as authenticate middleware should run first
    const userId = req.user?.id || 0;
    const userRole = req.user?.role || 'citizen';
    
    // Get rate limit for this role
    const limit = ROLE_LIMITS[userRole] || DEFAULT_LIMIT;
    
    // Create unique key for this user
    const key = `rate_limit:${userId}:${userRole}`;
    
    // Get current time
    const now = Date.now();
    
    // Get or create entry for this user
    let entry = requestStore.get(key);
    
    // If no entry exists or window has expired, create new entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + WINDOW_MS
      };
      requestStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Calculate remaining requests and reset time
    const remaining = Math.max(0, limit - entry.count);
    const resetTime = Math.ceil((entry.resetTime - now) / 1000); // seconds until reset
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    // Check if limit exceeded
    if (entry.count > limit) {
      // Set Retry-After header (in seconds)
      res.setHeader('Retry-After', resetTime.toString());
      
      // Return 429 Too Many Requests
      res.status(429).json({
        status: 'error',
        message: `Rate limit exceeded for role '${userRole}'. You can make ${limit} requests per hour.`,
        limit,
        remaining: 0,
        resetTime: new Date(entry.resetTime).toISOString(),
        retryAfter: resetTime
      });
      return;
    }
    
    // Request is within limit, proceed
    next();
  } catch (error) {
    // If rate limiting fails, log error but don't block request
    console.error('Rate limiting error:', error);
    next();
  }
};

/**
 * Get current rate limit status for a user
 * Useful for debugging and monitoring
 */
export const getRateLimitStatus = (userId: number, role: string): {
  limit: number;
  remaining: number;
  resetTime: Date | null;
} => {
  const key = `rate_limit:${userId}:${role}`;
  const entry = requestStore.get(key);
  const limit = ROLE_LIMITS[role] || DEFAULT_LIMIT;
  
  if (!entry) {
    return {
      limit,
      remaining: limit,
      resetTime: null
    };
  }
  
  const now = Date.now();
  if (now > entry.resetTime) {
    return {
      limit,
      remaining: limit,
      resetTime: null
    };
  }
  
  return {
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetTime: new Date(entry.resetTime)
  };
};

/**
 * Clear rate limit for a specific user
 * Useful for testing or manual intervention
 */
export const clearRateLimit = (userId: number, role: string): void => {
  const key = `rate_limit:${userId}:${role}`;
  requestStore.delete(key);
};

/**
 * Clear all rate limits
 * Useful for testing
 */
export const clearAllRateLimits = (): void => {
  requestStore.clear();
};
