# Fix Permissions 404 Error

## Problem
The permissions page shows: `GET http://localhost:3000/api/admin/permissions 404 (Not Found)`
Response: `{"error":"Route not found"}`

## Root Cause
Next.js dev server hasn't picked up the API route file at `web_app/src/app/api/admin/permissions/route.ts`. This happens when:
1. Route files are created while the dev server is running
2. The `.next` cache is stale
3. Turbopack hasn't detected the new route

## Solution

### Option 1: Restart Next.js Dev Server (Recommended)
```powershell
# In the web_app directory
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Option 2: Clear Cache and Restart
```powershell
cd MOBILE_APP/web_app

# Stop the dev server (Ctrl+C)

# Clear the Next.js cache
Remove-Item -Recurse -Force .next

# Restart the dev server
npm run dev
```

### Option 3: Hard Refresh Browser
After restarting the server:
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Verification

After restarting, the route should work:

1. Check the route exists:
   ```
   GET http://localhost:3000/api/admin/permissions
   ```

2. Should return permissions data (with valid token) or 401 (without token)

3. The permissions page should load without 404 errors

## Files Involved

- `web_app/src/app/api/admin/permissions/route.ts` - Main GET/POST route
- `web_app/src/app/api/admin/permissions/[id]/route.ts` - DELETE route
- `web_app/src/app/api/admin/permissions/history/route.ts` - History route
- `web_app/src/app/(admin)/permissions/page.tsx` - Frontend page

## Quick Test

```powershell
# Test if backend is working
curl http://localhost:3001/api/v1/admin/permissions -H "Authorization: Bearer YOUR_TOKEN"

# Test if web app proxy is working (after restart)
curl http://localhost:3000/api/admin/permissions -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. Stop the Next.js dev server
2. Restart it with `npm run dev`
3. Refresh the browser
4. Login and navigate to `/permissions`
5. The page should now load correctly

---
**Issue:** Next.js route not detected
**Solution:** Restart dev server
**Status:** Requires manual restart
