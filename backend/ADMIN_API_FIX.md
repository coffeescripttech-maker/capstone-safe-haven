# Admin API Fix - Authorization Import Error

## Issue
```
error TS2307: Cannot find module '../middleware/authorize'
```

## Root Cause
The admin routes were trying to import `authorizeRoles` from a non-existent `authorize` middleware file. The correct approach is to use the `authorize` function from the existing `auth` middleware.

## Solution
Changed from:
```typescript
import { authorizeRoles } from '../middleware/authorize';
router.use(authorizeRoles('admin'));
```

To:
```typescript
import { authenticate, authorize } from '../middleware/auth';
router.use(authenticate);
router.use(authorize('admin'));
```

## Fixed File
- `backend/src/routes/admin.routes.ts`

## Status
✅ **FIXED** - Backend should now compile successfully

## Next Steps
1. Restart backend server
2. Test admin API endpoints
3. Verify dashboard loads with real data

## Test Commands
```powershell
# Start backend
cd backend
npm run dev

# Test API (in another terminal)
cd backend
.\test-admin-api.ps1
```

## Expected Result
Backend compiles without errors and admin endpoints are accessible.
