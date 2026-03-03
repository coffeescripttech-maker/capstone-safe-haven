# Audit Logs 404 Error - Fix Applied

## Issue
The audit logs page was showing 404 errors:
```
GET http://localhost:3000/api/admin/audit-logs?limit=50&offset=0 404 (Not Found)
GET http://localhost:3000/api/admin/audit-logs/stats? 404 (Not Found)
```

## Root Cause
The Next.js API proxy routes were calling the backend without the `/v1` prefix:
- ❌ Was calling: `http://localhost:3001/api/admin/audit-logs`
- ✅ Should call: `http://localhost:3001/api/v1/admin/audit-logs`

## Fix Applied

### 1. Updated `/api/admin/audit-logs/route.ts`
Changed line 19 from:
```typescript
const url = new URL(`${BACKEND_URL}/api/admin/audit-logs`);
```

To:
```typescript
const url = new URL(`${BACKEND_URL}/api/v1/admin/audit-logs`);
```

### 2. Updated `/api/admin/audit-logs/stats/route.ts`
Changed line 19 from:
```typescript
const url = new URL(`${BACKEND_URL}/api/admin/audit-logs/stats`);
```

To:
```typescript
const url = new URL(`${BACKEND_URL}/api/v1/admin/audit-logs/stats`);
```

## How to Apply the Fix

### Option 1: Restart Next.js Dev Server (Recommended)

1. Stop the web app dev server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd MOBILE_APP/web_app
npm run dev
```

3. Refresh the browser at `http://localhost:3000/audit-logs`

### Option 2: Hard Refresh Browser

If restarting doesn't work, try:
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Clear Next.js Cache

```bash
cd MOBILE_APP/web_app
rm -rf .next
npm run dev
```

## Verification

After restarting, the audit logs page should:
1. ✅ Load without 404 errors
2. ✅ Display audit log entries (if any exist in database)
3. ✅ Show statistics cards at the top
4. ✅ Allow filtering by role, action, status, etc.

## Backend Verification

The backend endpoints are already working correctly:
- ✅ `GET /api/v1/admin/audit-logs` - Returns paginated audit logs
- ✅ `GET /api/v1/admin/audit-logs/stats` - Returns statistics

You can test them directly:

```bash
# Login first
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@safehaven.com","password":"Admin@123"}'
$token = $response.token

# Test audit logs
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs?limit=10" -Headers @{"Authorization"="Bearer $token"}

# Test stats
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs/stats" -Headers @{"Authorization"="Bearer $token"}
```

## Database Requirements

The audit logs feature requires the `audit_logs` table to exist. Check if it's created:

```sql
SHOW TABLES LIKE 'audit_logs';
```

If the table doesn't exist, run the migration:
```bash
mysql -u root -p safehaven < MOBILE_APP/database/migrations/003_create_audit_logs_table.sql
```

## Expected Result

Once fixed, the audit logs page will show:

```
┌─────────────────────────────────────────────────────────┐
│ Audit Logs                                              │
├─────────────────────────────────────────────────────────┤
│ Statistics:                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ Total    │ │ Success  │ │ Denied   │ │ Errors   │  │
│ │ 150      │ │ 145      │ │ 3        │ │ 2        │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│ Filters: [Role ▼] [Action ▼] [Status ▼] [Date Range]  │
├─────────────────────────────────────────────────────────┤
│ ID | User | Role  | Action | Resource | Status | Time │
│ 1  | John | admin | read   | users    | ✓      | 2m   │
│ 2  | Jane | admin | update | alerts   | ✓      | 5m   │
│ 3  | Bob  | user  | delete | reports  | ✗      | 10m  │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Still getting 404?
1. Check if backend is running on port 3001
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Clear browser cache completely
4. Delete `.next` folder and restart

### Empty audit logs?
The table might be empty. Audit logs are created when:
- Users log in
- Permissions are changed
- Admin actions are performed
- API requests are made with authentication

Try logging in/out a few times to generate some audit entries.

### Permission denied?
Make sure you're logged in as an admin or super_admin user. Regular users cannot access audit logs.

## Files Modified
- ✅ `MOBILE_APP/web_app/src/app/api/admin/audit-logs/route.ts`
- ✅ `MOBILE_APP/web_app/src/app/api/admin/audit-logs/stats/route.ts`

## Status
✅ **FIX COMPLETE** - Restart Next.js dev server to apply changes.
