# Dashboard Permissions Page 404 Fix

## Issue
After successful login, the Permissions page was showing a 404 error:
```
GET http://localhost:3000/api/admin/permissions 404 (Not Found)
```

## Root Cause
The Next.js API route files were calling the backend with incorrect URLs. They were missing `/api/v1` in the path.

**Incorrect:**
```typescript
${BACKEND_URL}/api/admin/permissions
```

**Correct:**
```typescript
${BACKEND_URL}/api/v1/admin/permissions
```

The backend Express routes are all mounted under `/api/v1`, so all API calls must include this prefix.

## Files Fixed

### 1. `/api/admin/permissions` route
**File:** `MOBILE_APP/web_app/src/app/api/admin/permissions/route.ts`

Fixed both GET and POST handlers:
- GET: `${BACKEND_URL}/api/v1/admin/permissions`
- POST: `${BACKEND_URL}/api/v1/admin/permissions`

### 2. `/api/admin/permissions/history` route
**File:** `MOBILE_APP/web_app/src/app/api/admin/permissions/history/route.ts`

Fixed GET handler:
- GET: `${BACKEND_URL}/api/v1/admin/permissions/history`

### 3. `/api/admin/permissions/[id]` route
**File:** `MOBILE_APP/web_app/src/app/api/admin/permissions/[id]/route.ts`

Fixed DELETE handler:
- DELETE: `${BACKEND_URL}/api/v1/admin/permissions/:id`

## Backend Routes (Reference)
From `MOBILE_APP/backend/src/routes/admin.routes.ts`:
```typescript
router.get('/permissions', authorize('super_admin'), adminController.getAllPermissions);
router.get('/permissions/history', authorize('super_admin'), adminController.getPermissionHistory);
router.post('/permissions', authorize('super_admin'), adminController.addPermission);
router.delete('/permissions/:id', authorize('super_admin'), adminController.removePermission);
```

These routes are mounted at `/api/v1/admin` in the backend server.

## Testing
After the fix, the Permissions page should:
1. Load successfully after login
2. Display all role permissions in a grouped table
3. Allow adding new permissions (super_admin only)
4. Allow removing permissions (super_admin only)
5. Show permission change history

## Related Issues Fixed
This is the same type of issue we fixed earlier with the login authentication:
- Login was calling `/auth/login` instead of `/api/v1/auth/login`
- Now permissions routes are also fixed to use `/api/v1/admin/permissions`

## Pattern to Remember
All backend API calls from the Next.js web app must use the full path:
```
http://localhost:3001/api/v1/{route}
```

Not just:
```
http://localhost:3001/{route}
```
