# Role-Based Rate Limiting Implementation

## Overview

The role-based rate limiting middleware enforces different request limits based on user roles, preventing abuse while allowing higher-privilege users more flexibility.

## Rate Limits by Role

| Role | Requests per Hour | Use Case |
|------|------------------|----------|
| super_admin | 1000 | System administrators with full access |
| admin | 500 | Platform administrators |
| pnp | 300 | Philippine National Police officers |
| bfp | 300 | Bureau of Fire Protection officers |
| mdrrmo | 300 | MDRRMO coordinators |
| lgu_officer | 200 | Local Government Unit officers |
| citizen | 100 | Regular users |

## Implementation Details

### Storage
- **Development**: In-memory Map storage
- **Production**: Should be migrated to Redis for distributed systems

### Window
- **Duration**: 1 hour (60 minutes)
- **Reset**: Automatic after window expires

### Headers
The middleware sets the following response headers:
- `X-RateLimit-Limit`: Maximum requests allowed per hour
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: ISO timestamp when the limit resets
- `Retry-After`: Seconds until limit resets (only on 429 responses)

### Response on Limit Exceeded
```json
{
  "status": "error",
  "message": "Rate limit exceeded for role 'citizen'. You can make 100 requests per hour.",
  "limit": 100,
  "remaining": 0,
  "resetTime": "2024-01-15T15:30:00.000Z",
  "retryAfter": 1800
}
```

## Usage

### Basic Usage

The middleware must be applied **after** the `authenticate` middleware to access `req.user`:

```typescript
import { authenticate } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';

// Apply to specific routes
router.get('/api/alerts', 
  authenticate, 
  roleBasedRateLimiter, 
  alertController.getAlerts
);

// Apply to all routes in a router
router.use(authenticate);
router.use(roleBasedRateLimiter);
```

### Global Application

To apply to all authenticated routes:

```typescript
// In server.ts or app.ts
app.use('/api', authenticate, roleBasedRateLimiter);
```

### Utility Functions

#### Get Rate Limit Status
```typescript
import { getRateLimitStatus } from '../middleware/rateLimiter';

const status = getRateLimitStatus(userId, 'citizen');
console.log(status);
// {
//   limit: 100,
//   remaining: 75,
//   resetTime: Date
// }
```

#### Clear Rate Limit (for testing)
```typescript
import { clearRateLimit, clearAllRateLimits } from '../middleware/rateLimiter';

// Clear specific user
clearRateLimit(userId, 'citizen');

// Clear all (use with caution)
clearAllRateLimits();
```

## Testing

### Manual Testing

Run the test script:
```bash
node test-role-rate-limiter.js
```

This will:
1. Test super_admin rate limits (high limit)
2. Test citizen rate limits (low limit)
3. Compare different role limits
4. Verify 429 responses when limits exceeded

### Expected Behavior

1. **Within Limit**: Request succeeds with rate limit headers
2. **Limit Exceeded**: 429 response with Retry-After header
3. **After Reset**: Limit resets and requests succeed again

### Test Different Roles

To test other roles, update the test script with appropriate credentials:

```javascript
const TEST_USERS = {
  pnp: { email: 'pnp@example.com', password: 'password' },
  bfp: { email: 'bfp@example.com', password: 'password' },
  mdrrmo: { email: 'mdrrmo@example.com', password: 'password' },
  lgu_officer: { email: 'lgu@example.com', password: 'password' }
};
```

## Production Considerations

### Redis Integration

For production deployments with multiple server instances, replace the in-memory store with Redis:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// In roleBasedRateLimiter middleware:
const key = `rate_limit:${userId}:${userRole}`;
const count = await redis.incr(key);

if (count === 1) {
  await redis.expire(key, 3600); // 1 hour
}

if (count > limit) {
  // Return 429
}
```

### Monitoring

Monitor rate limiting metrics:
- Number of 429 responses per role
- Average requests per user per hour
- Peak usage times
- Users hitting limits frequently

### Adjusting Limits

To adjust limits, modify the `ROLE_LIMITS` object in `rateLimiter.ts`:

```typescript
const ROLE_LIMITS: Record<string, number> = {
  super_admin: 2000,  // Increased from 1000
  admin: 1000,        // Increased from 500
  // ... other roles
};
```

## Security Considerations

1. **Bypass Prevention**: Rate limiting is enforced at the middleware level, preventing bypass attempts
2. **User-Based**: Limits are per user, not per IP, preventing shared IP issues
3. **Role-Based**: Different roles have appropriate limits for their use cases
4. **Graceful Degradation**: If rate limiting fails, requests proceed (fail-open for availability)

## Troubleshooting

### Issue: Rate limits not working

**Check:**
1. Middleware is applied after `authenticate`
2. `req.user` is populated with role information
3. User role matches one of the defined roles

### Issue: All users getting same limit

**Check:**
1. User role is correctly extracted from JWT
2. Role value matches keys in `ROLE_LIMITS` object
3. Middleware is receiving authenticated requests

### Issue: Limits resetting too quickly

**Check:**
1. `WINDOW_MS` is set to 3600000 (1 hour)
2. Server time is correct
3. No duplicate middleware applications

## Requirements Satisfied

This implementation satisfies **Requirement 12.3**:
> THE RBAC_System SHALL implement rate limiting per Role to prevent abuse

- ✅ Different limits for each role
- ✅ Returns 429 when limit exceeded
- ✅ Includes Retry-After header
- ✅ Tracks requests per user per hour
- ✅ Automatic cleanup of expired entries
