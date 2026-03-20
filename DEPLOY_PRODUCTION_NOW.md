# Deploy Production Backend - Quick Fix

## The Problem
Production backend on Render.com is missing the 'lgu' role support, causing:
```
Error: Cannot read properties of undefined (reading 'role')
```

## Quick Solution - Deploy Latest Backend

### Step 1: Commit All Changes
```bash
cd MOBILE_APP
git add .
git commit -m "fix: Add lgu role support and WebSocket improvements"
git push origin main
```

### Step 2: Deploy to Render.com

#### Option A: Auto-Deploy (If Connected to Git)
1. Go to https://dashboard.render.com
2. Find your backend service: `safe-haven-backend-api`
3. It should auto-deploy when you push to main
4. Wait 5-10 minutes for build to complete
5. Check logs for "Server running on port 3001"

#### Option B: Manual Deploy
1. Go to https://dashboard.render.com
2. Click on `safe-haven-backend-api` service
3. Click "Manual Deploy" button
4. Select "Deploy latest commit"
5. Wait for build to complete

### Step 3: Verify Deployment

Test the endpoint:
```bash
# Should return 200, not 500
curl https://safe-haven-backend-api.onrender.com/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## What Gets Fixed

### Backend Changes Deployed:
✅ 'lgu' role added to SMS blast permissions
✅ Updated User type definition
✅ WebSocket improvements for incidents
✅ Philippine timezone fixes
✅ Comprehensive logging

### Files Updated:
- `backend/src/middleware/smsAuth.ts`
- `backend/src/routes/smsBlast.routes.ts`
- `backend/src/services/recipientFilter.service.ts`
- `backend/src/services/incident.service.ts`
- `backend/src/utils/timezone.ts`
- `backend/src/services/alert.service.ts`

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend
```bash
cd MOBILE_APP/web_app
git push origin main
```

Vercel will auto-deploy from your git repository.

### Step 2: Verify Frontend
1. Go to https://vercel.com/dashboard
2. Check deployment status
3. Visit your production URL
4. Check browser console for WebSocket logs

## Environment Variables to Verify

### Render.com (Backend)
Make sure these are set:
```env
PORT=3001
JWT_SECRET=your-production-secret
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=safehaven_db
NODE_ENV=production
```

### Vercel (Frontend)
Make sure this is set:
```env
NEXT_PUBLIC_API_URL=https://safe-haven-backend-api.onrender.com
```

## Testing After Deployment

### 1. Test Login
```bash
curl -X POST https://safe-haven-backend-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@test.com","password":"your-password"}'
```

### 2. Test SMS Blast Access
Login to web admin → Go to SMS Blast page → Should load without errors

### 3. Test WebSocket
- Login to web admin
- Open browser console
- Should see: `✅ [SOS WebSocket] Connected successfully!`
- Should see: `✅ [Incident WebSocket] Connected successfully!`

### 4. Test Real-Time Notifications
- Send SOS from mobile app
- Web admin should receive notification instantly
- Check browser console for logs

## Rollback Plan (If Issues)

### Render.com
1. Go to dashboard
2. Click on service
3. Go to "Events" tab
4. Find previous working deployment
5. Click "Rollback"

### Vercel
1. Go to dashboard
2. Click on project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "..." → "Promote to Production"

## Build Time Estimate
- Backend build: 5-10 minutes
- Frontend build: 3-5 minutes
- Total: 10-15 minutes

## Status Check Commands

### Check Backend Health
```bash
curl https://safe-haven-backend-api.onrender.com/api/v1/health
```

### Check Frontend
Visit: https://capstone-safe-haven.vercel.app

## Common Issues

### Issue: Build Failed on Render
**Solution:** Check Render logs for TypeScript errors, install missing dependencies

### Issue: Environment Variables Missing
**Solution:** Go to Render dashboard → Service → Environment → Add missing vars

### Issue: Database Connection Failed
**Solution:** Check DB credentials in Render environment variables

### Issue: Frontend Still Shows Old Code
**Solution:** 
1. Clear browser cache (Ctrl+Shift+R)
2. Check Vercel deployment status
3. Verify NEXT_PUBLIC_API_URL is correct

## Success Indicators

✅ Backend deployed successfully
✅ Frontend deployed successfully
✅ SMS Blast page loads without errors
✅ WebSocket shows green dot (connected)
✅ Real-time notifications working
✅ No console errors

## Need Help?

If deployment fails:
1. Check Render build logs
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test endpoints with curl
5. Check browser console for errors

## Quick Test Script

After deployment, run this:
```bash
# Test backend health
curl https://safe-haven-backend-api.onrender.com/api/v1/health

# Test login (replace with your credentials)
curl -X POST https://safe-haven-backend-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# If login works, copy the token and test SMS blast
curl https://safe-haven-backend-api.onrender.com/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Should return 200 OK, not 500 error.

---

**Priority:** HIGH - Deploy now to fix production error
**Time Required:** 15-20 minutes
**Risk:** Low (can rollback if needed)
