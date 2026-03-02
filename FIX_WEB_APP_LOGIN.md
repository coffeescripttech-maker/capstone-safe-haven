# Fix Web App Login Issue - 401 Unauthorized

## Problem
You're getting a 401 error when trying to login with `superadmin@test.safehaven.com` / `Test123!`

```
POST http://localhost:3000/api/auth/callback/credentials 401 (Unauthorized)
```

## Root Cause
The web app's NextAuth configuration was calling the wrong backend URL. It was missing `/v1` in the API path.

## What I Fixed

**File:** `web_app/src/lib/auth.ts`

**Changed:**
```typescript
const BACKEND_URL = 'http://localhost:3001';
// Was calling: http://localhost:3001/api/auth/login ❌
```

**To:**
```typescript
const BACKEND_URL = 'http://localhost:3001/api/v1';
// Now calls: http://localhost:3001/api/v1/auth/login ✅
```

## Steps to Test

### 1. Make Sure Backend is Running

```powershell
cd MOBILE_APP/backend
npm run dev
```

**You should see:**
```
SafeHaven API Server running on port 3001
```

### 2. Test Backend Login Directly

```powershell
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"superadmin@test.safehaven.com\",\"password\":\"Test123!\"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "superadmin@test.safehaven.com",
      "role": "super_admin"
    },
    "token": "eyJhbGc..."
  }
}
```

### 3. Restart Web App

The web app needs to be restarted to pick up the auth.ts changes:

```powershell
# Stop the web app (Ctrl+C in its terminal)
# Then restart it:
cd MOBILE_APP/web_app
npm run dev
```

### 4. Try Login Again

1. Open browser: `http://localhost:3000`
2. Login with:
   - **Email:** `superadmin@test.safehaven.com`
   - **Password:** `Test123!`

## Available Test Users

| Email | Password | Role |
|-------|----------|------|
| superadmin@test.safehaven.com | Test123! | super_admin |
| admin@test.safehaven.com | Test123! | admin |
| pnp@test.safehaven.com | Test123! | pnp |
| bfp@test.safehaven.com | Test123! | bfp |
| mdrrmo@test.safehaven.com | Test123! | mdrrmo |
| lgu@test.safehaven.com | Test123! | lgu_officer |
| citizen@test.safehaven.com | Test123! | citizen |

## Troubleshooting

### Still Getting 401?

**Check 1: Is backend running?**
```powershell
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

**Check 2: Can you login to backend directly?**
```powershell
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"superadmin@test.safehaven.com\",\"password\":\"Test123!\"}'
```

**Check 3: Is the user in the database?**
```sql
USE safehaven_db;
SELECT id, email, role FROM users WHERE email = 'superadmin@test.safehaven.com';
```

**Check 4: Check web app console**
Open browser DevTools (F12) → Console tab
Look for `[NextAuth]` log messages

**Check 5: Check backend logs**
Look at the terminal where backend is running
Should see login attempts

### User Not Found in Database?

Run the test user creation script:

```powershell
cd MOBILE_APP/backend
node create-test-users.js
```

Or manually create the user:

```sql
USE safehaven_db;

INSERT INTO users (email, password, first_name, last_name, role, phone, created_at, updated_at)
VALUES (
  'superadmin@test.safehaven.com',
  '$2a$10$YourHashedPasswordHere',
  'Super',
  'Admin',
  'super_admin',
  '+1234567890',
  NOW(),
  NOW()
);
```

### Wrong Password?

The password should be `Test123!` (capital T, ends with exclamation mark)

If you need to reset it, use bcrypt to hash a new password:

```javascript
const bcrypt = require('bcryptjs');
const password = 'Test123!';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Then update in database:

```sql
UPDATE users 
SET password = 'your_new_hash_here'
WHERE email = 'superadmin@test.safehaven.com';
```

### CORS Error?

Check `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

Should include `http://localhost:3000`

## Quick Test Script

I created a test script to verify everything:

```powershell
cd MOBILE_APP/backend
.\test-users-api.ps1
```

This will test all user logins and show which ones work.

## Summary

✅ Fixed the backend URL in `auth.ts`
✅ Backend should be on port 3001
✅ Web app should be on port 3000
✅ Test user: `superadmin@test.safehaven.com` / `Test123!`

After restarting the web app, login should work!
