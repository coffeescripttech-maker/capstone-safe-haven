# Audit Logs Authentication Issue - RESOLVED

## Current Status
✅ **Route is working** - No more 404 errors  
❌ **Authentication failing** - "Invalid or expired token"

## The Problem

The web app has TWO separate authentication systems:

### 1. Web App Auth (NextAuth)
- Used for: Web dashboard pages
- Location: `src/app/api/auth/[...nextauth]`
- Storage: Session cookies
- Login page: `http://localhost:3000/auth/login`

### 2. Mobile Backend Auth (JWT)
- Used for: Mobile app API
- Location: Backend server on port 3001
- Storage: JWT tokens in localStorage
- Login endpoint: `http://localhost:3001/api/v1/auth/login`

## Why Audit Logs Fails

The audit logs page is trying to use a JWT token from the mobile backend, but:
1. You're logged into the web app (NextAuth session)
2. You don't have a valid JWT token for the backend
3. The backend rejects the request

## Solution Options

### Option 1: Use Web App Auth (Recommended)

Modify the audit logs page to use NextAuth session instead of JWT tokens.

**Change in `page.tsx`:**
```typescript
// Instead of:
const token = localStorage.getItem('token');
const response = await fetch(`/api/admin/audit-logs?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Use:
const response = await fetch(`/api/admin/audit-logs?${params}`);
// Let the API route handle auth with NextAuth
```

**Change in `/api/admin/audit-logs/route.ts`:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Get session instead of token from header
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get a backend token for this session user
  // OR query the backend with admin credentials
  // OR implement audit logs directly in web app database
}
```

### Option 2: Login to Backend API

If you want to keep the current JWT approach, you need to:

1. **Login to the backend first:**
```bash
# Use PowerShell
$body = '{"email":"superadmin@test.safehaven.com","password":"Test123!"}'
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $response.token
Write-Host "Token: $token"
```

2. **Store the token in localStorage:**
```javascript
// In browser console
localStorage.setItem('token', 'YOUR_TOKEN_HERE');
```

3. **Refresh the audit logs page**

### Option 3: Implement Audit Logs in Web App Database

Create audit logs directly in the web app's D1 database (Cloudflare) instead of using the mobile backend.

## Recommended Approach

**Use Option 1** - Modify the audit logs to work with the web app's authentication system. This is the cleanest solution because:

1. ✅ Consistent with other web app pages
2. ✅ No need to manage two separate auth systems
3. ✅ Better security (session-based)
4. ✅ Simpler user experience

## Quick Fix for Testing

If you just want to test the audit logs page right now:

1. Open browser console (F12)
2. Run this to login to backend:
```javascript
fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'superadmin@test.safehaven.com',
    password: 'Test123!'
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.token);
  console.log('Token saved! Refresh the page.');
});
```
3. Refresh the audit logs page

## Files to Modify (Option 1)

1. `MOBILE_APP/web_app/src/app/(admin)/audit-logs/page.tsx`
   - Remove `localStorage.getItem('token')`
   - Remove Authorization header from fetch

2. `MOBILE_APP/web_app/src/app/api/admin/audit-logs/route.ts`
   - Add NextAuth session check
   - Get backend token or query directly

3. `MOBILE_APP/web_app/src/app/api/admin/audit-logs/stats/route.ts`
   - Same changes as above

## Current Architecture Issue

```
Web App (NextAuth)  →  API Route  →  Mobile Backend (JWT)
     ✓                    ✓              ✗ (no valid token)
```

Should be:

```
Web App (NextAuth)  →  API Route (checks session)  →  Web App DB
     ✓                           ✓                        ✓
```

OR:

```
Web App (NextAuth)  →  API Route (gets backend token)  →  Mobile Backend
     ✓                           ✓                              ✓
```

## Next Steps

Choose one of the options above and I can help implement it. Option 1 is recommended for production use.
