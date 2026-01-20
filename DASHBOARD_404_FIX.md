# Dashboard 404 Error - Fix Guide

## Problem
The admin dashboard page is showing a 404 error when trying to fetch stats:
```
GET http://localhost:3000/api/v1/admin/stats 404 (Not Found)
```

## Root Cause
The backend `/admin/stats` endpoint exists and is properly configured, but the error suggests one of these issues:

1. **Backend server not running**
2. **Routes not loading properly**
3. **Authentication middleware blocking the request**

## Solution Steps

### Step 1: Verify Backend is Running
```powershell
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Database connected successfully
```

### Step 2: Test the Endpoint Directly
```powershell
# Set your admin token
$env:ADMIN_TOKEN = "your_admin_token_here"

# Run the test script
cd backend
.\test-dashboard-api.ps1
```

### Step 3: Check Backend Console
Look for any errors in the backend console when the request is made. Common issues:
- Database connection errors
- Authentication middleware errors
- Route registration errors

### Step 4: Verify Token is Valid
```powershell
# Test authentication
$headers = @{ "Authorization" = "Bearer $env:ADMIN_TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" -Headers $headers
```

If this fails, you need to:
1. Login again to get a fresh token
2. Update your token in localStorage
3. Or use the test-token.ps1 script to get a valid token

## Quick Fix

If the backend is running but the dashboard still shows 404:

### Option 1: Restart Backend Server
```powershell
cd backend
# Stop the server (Ctrl+C)
npm run dev
```

### Option 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Check Route Registration
Verify in `backend/src/routes/index.ts`:
```typescript
router.use('/admin', adminRoutes);  // This should be present
```

Verify in `backend/src/server.ts`:
```typescript
app.use('/api/v1', routes);  // This should be present
```

## Testing the Fix

### Test 1: Direct API Call
```powershell
$env:ADMIN_TOKEN = "your_token"
$headers = @{ "Authorization" = "Bearer $env:ADMIN_TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stats" -Headers $headers
```

Expected response:
```json
{
  "success": true,
  "data": {
    "alerts": { "total": 10, "active": 5 },
    "incidents": { "total": 20, "pending": 3, ... },
    ...
  }
}
```

### Test 2: Dashboard Page
1. Navigate to `http://localhost:3001/dashboard`
2. Open DevTools Console (F12)
3. Look for successful API calls
4. Dashboard should load with stats

## Common Issues

### Issue 1: "Cannot GET /api/v1/admin/stats"
**Cause**: Routes not registered properly
**Fix**: Check `backend/src/routes/index.ts` and restart server

### Issue 2: "401 Unauthorized"
**Cause**: Invalid or expired token
**Fix**: Login again or use test-token.ps1 to get a fresh token

### Issue 3: "500 Internal Server Error"
**Cause**: Database query error
**Fix**: Check backend console for SQL errors, verify database schema

### Issue 4: CORS Error
**Cause**: Frontend and backend on different ports
**Fix**: Verify CORS is enabled in backend/src/server.ts

## Verification Checklist

- [ ] Backend server is running on port 3000
- [ ] Frontend server is running on port 3001
- [ ] Admin token is valid and not expired
- [ ] `/admin/stats` endpoint returns 200 OK
- [ ] Dashboard page loads without errors
- [ ] Stats cards show real data

## Alternative: Use Mock Data (Temporary)

If you need the dashboard to work immediately while debugging the API:

1. Comment out the API call in `web_app/src/app/(admin)/dashboard/page.tsx`
2. Use mock data:

```typescript
// Temporary mock data
const mockStats = {
  alerts: { total: 10, active: 5 },
  incidents: { total: 20, pending: 3, in_progress: 5, resolved: 12 },
  centers: { total: 8, active: 8 },
  sos: { active: 2 },
  users: { total: 150, admins: 3, users: 147 },
  today: { alerts: 2, incidents: 5, sos: 1, users: 3 }
};
setStats(mockStats);
```

## Need Help?

If the issue persists:

1. Check backend console for errors
2. Check browser console for errors
3. Verify database is running
4. Verify all tables exist
5. Try restarting both servers

## Files to Check

- `backend/src/routes/index.ts` - Route registration
- `backend/src/routes/admin.routes.ts` - Admin routes
- `backend/src/controllers/admin.controller.ts` - Controller
- `backend/src/services/admin.service.ts` - Service logic
- `web_app/src/app/(admin)/dashboard/page.tsx` - Frontend page
- `web_app/src/lib/safehaven-api.ts` - API client

---

**Status**: Ready to debug
**Priority**: High (blocks dashboard functionality)
**Estimated Fix Time**: 5-10 minutes
