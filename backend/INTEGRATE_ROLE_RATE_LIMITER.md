# Integrating Role-Based Rate Limiter

## Quick Start

The role-based rate limiter is now available and can be integrated into your routes.

## Option 1: Global Application (Recommended)

Apply to all authenticated API routes in `server.ts`:

```typescript
import { authenticate } from './middleware/auth';
import { roleBasedRateLimiter } from './middleware/rateLimiter';

// Apply to all API routes after authentication
app.use('/api/v1', authenticate, roleBasedRateLimiter);
app.use('/api/v1', routes);
```

**Pros:**
- Simple, one-line integration
- Consistent rate limiting across all endpoints
- Easy to maintain

**Cons:**
- Applies to all routes (including public ones if not careful)

## Option 2: Per-Route Application

Apply to specific routes that need role-based rate limiting:

```typescript
import { authenticate, requirePermission } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';

// Example: Alert routes
router.post('/', 
  authenticate,                              // 1. Authenticate user
  roleBasedRateLimiter,                      // 2. Check rate limit
  requirePermission('alerts', 'create'),     // 3. Check permissions
  alertController.createAlert                // 4. Execute handler
);
```

**Pros:**
- Fine-grained control
- Can exclude specific routes
- Can combine with other rate limiters

**Cons:**
- More verbose
- Need to add to each route

## Option 3: Router-Level Application

Apply to all routes in a specific router:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply to all routes in this router
router.use(authenticate);
router.use(roleBasedRateLimiter);

// All routes below will have role-based rate limiting
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
```

**Pros:**
- Applies to all routes in router
- Clean and maintainable
- Good for protected resource groups

**Cons:**
- All-or-nothing for the router

## Integration Examples

### Example 1: Alert Routes

```typescript
// MOBILE_APP/backend/src/routes/alert.routes.ts
import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';
import { AlertController } from '../controllers/alert.controller';

const router = Router();
const alertController = new AlertController();

// Public routes - no rate limiting needed
router.get('/', alertController.getAlerts);
router.get('/:id', alertController.getAlertById);

// Protected routes with role-based rate limiting
router.post('/', 
  authenticate, 
  roleBasedRateLimiter,
  requirePermission('alerts', 'create'), 
  alertController.createAlert
);

router.put('/:id', 
  authenticate, 
  roleBasedRateLimiter,
  requirePermission('alerts', 'update'), 
  alertController.updateAlert
);

router.delete('/:id', 
  authenticate, 
  roleBasedRateLimiter,
  requirePermission('alerts', 'delete'), 
  alertController.deactivateAlert
);

export default router;
```

### Example 2: Admin Routes

```typescript
// MOBILE_APP/backend/src/routes/admin.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// Apply to all admin routes
router.use(authenticate);
router.use(roleBasedRateLimiter);
router.use(authorize('admin', 'super_admin'));

// All routes below have role-based rate limiting
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);

export default router;
```

### Example 3: Mixed Approach

```typescript
// MOBILE_APP/backend/src/routes/incident.routes.ts
import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { roleBasedRateLimiter } from '../middleware/rateLimiter';
import { IncidentController } from '../controllers/incident.controller';

const router = Router();
const incidentController = new IncidentController();

// Public read - no auth, no rate limiting
router.get('/', incidentController.getIncidents);

// Authenticated read with role-based rate limiting
router.get('/my-incidents', 
  authenticate, 
  roleBasedRateLimiter,
  incidentController.getMyIncidents
);

// Create/Update with role-based rate limiting
router.post('/', 
  authenticate, 
  roleBasedRateLimiter,
  requirePermission('incidents', 'create'), 
  incidentController.createIncident
);

router.put('/:id', 
  authenticate, 
  roleBasedRateLimiter,
  requirePermission('incidents', 'update'), 
  incidentController.updateIncident
);

export default router;
```

## Middleware Order

**CRITICAL:** The middleware order matters!

### Correct Order:
```typescript
router.post('/',
  authenticate,              // 1. FIRST: Authenticate and attach req.user
  roleBasedRateLimiter,      // 2. SECOND: Check rate limit (needs req.user)
  requirePermission(...),    // 3. THIRD: Check permissions
  controller.handler         // 4. LAST: Execute business logic
);
```

### Incorrect Order (Will Not Work):
```typescript
router.post('/',
  roleBasedRateLimiter,      // ❌ WRONG: req.user not available yet
  authenticate,              // ❌ WRONG: Should be first
  requirePermission(...),
  controller.handler
);
```

## Testing Integration

After integrating, test with:

```bash
# Start the server
npm run dev

# In another terminal, run the test
node test-role-rate-limiter.js
```

Expected output:
- Super admin should have 1000 requests/hour limit
- Citizen should have 100 requests/hour limit
- 429 responses when limit exceeded
- Rate limit headers on all responses

## Monitoring

Check rate limiting in action:

```bash
# Make a request and check headers
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -i http://localhost:3000/api/v1/alerts

# Look for these headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 2024-01-15T15:30:00.000Z
```

## Troubleshooting

### Issue: Rate limiting not working

**Solution:** Ensure `authenticate` middleware runs before `roleBasedRateLimiter`

```typescript
// ✅ Correct
router.post('/', authenticate, roleBasedRateLimiter, handler);

// ❌ Wrong
router.post('/', roleBasedRateLimiter, authenticate, handler);
```

### Issue: All users getting same limit

**Solution:** Check that JWT contains role information

```typescript
// In auth.service.ts, ensure JWT includes role:
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role  // ← Must include role
  },
  JWT_SECRET
);
```

### Issue: 429 responses too frequent

**Solution:** Adjust limits in `rateLimiter.ts`:

```typescript
const ROLE_LIMITS: Record<string, number> = {
  super_admin: 2000,  // Increase from 1000
  citizen: 200,       // Increase from 100
  // ...
};
```

## Next Steps

1. Choose integration approach (global, per-route, or router-level)
2. Update routes to include `roleBasedRateLimiter`
3. Test with `test-role-rate-limiter.js`
4. Monitor rate limiting in production
5. Adjust limits based on usage patterns

## Production Checklist

- [ ] Role-based rate limiter integrated
- [ ] Middleware order verified (authenticate → rateLimiter → permissions)
- [ ] Test script passes for all roles
- [ ] Rate limit headers visible in responses
- [ ] 429 responses working correctly
- [ ] Monitoring set up for rate limit metrics
- [ ] Consider Redis integration for distributed systems
