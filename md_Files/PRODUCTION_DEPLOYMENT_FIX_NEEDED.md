# Production Deployment Fix Needed ❗

## Error on Production
```
GET https://safe-haven-backend-api.onrender.com/api/v1/sms-blast/contact-groups 500
Error: Cannot read properties of undefined (reading 'role')
```

## Root Cause
The backend deployed on Render.com doesn't have the latest code changes that include:
1. 'lgu' role support in SMS blast permissions
2. Updated User type definition
3. WebSocket improvements for incidents
4. Philippine timezone fixes

## Files That Need to Be Deployed

### Backend Changes (Render.com)
1. `src/middleware/smsAuth.ts` - Added 'lgu' role
2. `src/routes/smsBlast.routes.ts` - Added 'lgu' to all routes
3. `src/services/recipientFilter.service.ts` - Updated User type with 'lgu'
4. `src/services/incident.service.ts` - Added WebSocket broadcast
5. `src/utils/timezone.ts` - Philippine timezone utilities
6. `src/services/alert.service.ts` - Timezone conversion

### Frontend Changes (Vercel)
1. `src/components/header/SOSNotificationBell.tsx` - WebSocket + logging
2. `src/components/header/IncidentNotificationBell.tsx` - WebSocket + logging

## How to Deploy

### Option 1: Git Push (Recommended)
```bash
# Commit all changes
git add .
git commit -m "fix: Add lgu role support and WebSocket improvements"
git push origin main

# Render and Vercel will auto-deploy
```

### Option 2: Manual Deployment

#### Backend (Render.com)
1. Go to Render dashboard
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for build to complete
5. Check logs for errors

#### Frontend (Vercel)
1. Go to Vercel dashboard
2. Find your project
3. Click "Redeploy"
4. Select latest commit
5. Wait for deployment

## Verification Steps

### 1. Check Backend is Updated
```bash
# Test the endpoint
curl https://safe-haven-backend-api.onrender.com/api/v1/health

# Should return version with latest changes
```

### 2. Check User Role Support
```bash
# Login and check token
curl -X POST https://safe-haven-backend-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lgu@test.com","password":"password123"}'

# Should return token without errors
```

### 3. Test SMS Blast Access
```bash
# With LGU user token
curl https://safe-haven-backend-api.onrender.com/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 200, not 500
```

## Environment Variables to Check

### Backend (Render.com)
```env
PORT=3001
JWT_SECRET=your-production-secret
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=safehaven_db
NODE_ENV=production
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://safe-haven-backend-api.onrender.com
```

## Quick Fix for Immediate Issue

If you can't deploy right now, you can temporarily:

1. **Change user role from 'lgu' to 'lgu_officer'** in database:
```sql
UPDATE users 
SET role = 'lgu_officer' 
WHERE role = 'lgu';
```

2. **Or login with a different user** that has role:
   - super_admin
   - admin
   - mdrrmo
   - pnp
   - bfp
   - lgu_officer

## Files Changed Summary

### Critical (Must Deploy)
- ✅ `backend/src/middleware/smsAuth.ts`
- ✅ `backend/src/routes/smsBlast.routes.ts`
- ✅ `backend/src/services/recipientFilter.service.ts`

### Important (Should Deploy)
- ✅ `backend/src/services/incident.service.ts`
- ✅ `backend/src/utils/timezone.ts`
- ✅ `backend/src/services/alert.service.ts`

### Nice to Have (Can Deploy Later)
- ✅ `web_app/src/components/header/SOSNotificationBell.tsx`
- ✅ `web_app/src/components/header/IncidentNotificationBell.tsx`

## Build Commands

### Backend
```bash
cd MOBILE_APP/backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd MOBILE_APP/web_app
npm install
npm run build
```

## Troubleshooting After Deployment

### Backend Still Showing Error
1. Check Render logs for build errors
2. Verify environment variables are set
3. Check database connection
4. Restart the service

### Frontend Not Updated
1. Clear Vercel cache
2. Redeploy with "Clear cache and redeploy"
3. Check browser cache (Ctrl+Shift+R)
4. Verify NEXT_PUBLIC_API_URL is correct

## Testing After Deployment

1. **Login to production web admin**
2. **Check browser console** for WebSocket logs
3. **Try accessing SMS Blast** page
4. **Send test SOS** from mobile app
5. **Verify real-time** notifications work

## Rollback Plan

If deployment causes issues:

### Render (Backend)
1. Go to Render dashboard
2. Click on service
3. Go to "Events" tab
4. Click "Rollback" on previous deployment

### Vercel (Frontend)
1. Go to Vercel dashboard
2. Click on project
3. Go to "Deployments" tab
4. Find previous working deployment
5. Click "..." → "Promote to Production"

## Status

🔴 **NEEDS DEPLOYMENT** - Production backend is missing latest code changes. Deploy to Render.com to fix the error.

## Priority

**HIGH** - Users with 'lgu' role cannot access SMS blast features until this is deployed.

## Estimated Time

- Git push + auto-deploy: 5-10 minutes
- Manual deployment: 10-15 minutes
- Verification: 5 minutes
- **Total: 15-30 minutes**
