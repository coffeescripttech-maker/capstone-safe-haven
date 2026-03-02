# Analytics Page Access Issue - SOLVED

## Problem
Cannot access `http://localhost:3000/analytics` page.

## Root Cause
The backend server (port 3001) is **NOT RUNNING**. The analytics page calls the backend API endpoint `/api/v1/admin/stats` which requires:
1. Backend server to be running on port 3001
2. Valid authentication token
3. User with 'analytics' read permission (admin, super_admin, or mdrrmo role)

## Solution

### Step 1: Start the Backend Server
```powershell
cd MOBILE_APP/backend
npm run dev
```

The backend should start on `http://localhost:3001`

### Step 2: Start the Web App (if not running)
```powershell
cd MOBILE_APP/web_app
npm run dev
```

The web app should start on `http://localhost:3000`

### Step 3: Login with Admin Credentials
Use one of these accounts:
- **Admin**: admin@safehaven.com / admin123
- **Super Admin**: superadmin@safehaven.com / super123

### Step 4: Access Analytics Page
Navigate to: `http://localhost:3000/analytics`

## Technical Details

### Backend Endpoint
- **URL**: `http://localhost:3001/api/v1/admin/stats`
- **Method**: GET
- **Auth**: Bearer token required
- **Permission**: Requires 'analytics' read permission

### Frontend Page
- **Location**: `MOBILE_APP/web_app/src/app/(admin)/analytics/page.tsx`
- **API Call**: Uses `adminApi.getStats()` from `safehaven-api.ts`
- **Protected**: Requires admin/super_admin/lgu_officer/mdrrmo/pnp/bfp role

### Roles with Analytics Access
According to `004_seed_role_permissions.sql`:
- ✅ super_admin - Full analytics access
- ✅ admin - Full analytics access  
- ✅ mdrrmo - Read analytics access
- ❌ pnp - No analytics access
- ❌ bfp - No analytics access
- ❌ lgu_officer - No analytics access
- ❌ citizen - No analytics access

## Testing
Run the test script to verify everything is working:
```powershell
cd MOBILE_APP
./test-analytics-endpoint.ps1
```

This will:
1. Check if backend is running
2. Login with admin credentials
3. Test the `/admin/stats` endpoint
4. Test the `/admin/analytics` endpoint

## Quick Start Commands
```powershell
# Terminal 1 - Start Backend
cd MOBILE_APP/backend
npm run dev

# Terminal 2 - Start Web App
cd MOBILE_APP/web_app
npm run dev

# Terminal 3 - Test (optional)
cd MOBILE_APP
./test-analytics-endpoint.ps1
```

## Common Issues

### Issue 1: Backend Not Running
**Error**: Cannot connect to localhost:3001
**Solution**: Start the backend server (see Step 1)

### Issue 2: 401 Unauthorized
**Error**: Authentication failed
**Solution**: 
- Clear browser localStorage
- Login again with valid credentials
- Check if token is expired (7 days)

### Issue 3: 403 Forbidden
**Error**: Permission denied
**Solution**: 
- Ensure user has admin, super_admin, or mdrrmo role
- Check role_permissions table for 'analytics' read permission

### Issue 4: 404 Not Found
**Error**: Endpoint not found
**Solution**: 
- Verify backend routes are properly registered
- Check `MOBILE_APP/backend/src/routes/admin.routes.ts`
- Ensure routes are imported in `MOBILE_APP/backend/src/routes/index.ts`

## Files Involved
- Frontend Page: `MOBILE_APP/web_app/src/app/(admin)/analytics/page.tsx`
- API Client: `MOBILE_APP/web_app/src/lib/safehaven-api.ts`
- Backend Controller: `MOBILE_APP/backend/src/controllers/admin.controller.ts`
- Backend Routes: `MOBILE_APP/backend/src/routes/admin.routes.ts`
- Backend Service: `MOBILE_APP/backend/src/services/admin.service.ts`
- Permissions: `MOBILE_APP/database/migrations/004_seed_role_permissions.sql`

## Next Steps
1. Start both servers (backend and web app)
2. Login with admin credentials
3. Navigate to analytics page
4. If issues persist, run the test script for detailed diagnostics
