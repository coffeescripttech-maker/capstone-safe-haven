# ✅ Port Configuration Fixed!

## What Was Wrong

You had **both** the backend and web_app trying to use **port 3001**, which would cause a conflict.

## What I Fixed

### 1. Web App Configuration ✅
**File:** `web_app/.env.local`

**Changed:**
```env
NEXTAUTH_URL=http://localhost:3001  ❌
```

**To:**
```env
NEXTAUTH_URL=http://localhost:3000  ✅
```

### 2. Backend CORS Configuration ✅
**File:** `backend/.env`

**Changed:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:3001  ❌
```

**To:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006  ✅
```

## Current Configuration (Correct!)

```
┌─────────────────────────────────────────┐
│  Web App (Next.js)                      │
│  Port: 3000                             │
│  URL: http://localhost:3000             │
│  Login Page: http://localhost:3000      │
└─────────────────────────────────────────┘
              ↓ Makes API calls to ↓
┌─────────────────────────────────────────┐
│  Backend API (Express)                  │
│  Port: 3001                             │
│  URL: http://localhost:3001             │
│  API: http://localhost:3001/api/v1      │
└─────────────────────────────────────────┘
              ↓ Connects to ↓
┌─────────────────────────────────────────┐
│  MySQL Database                         │
│  Port: 3306                             │
└─────────────────────────────────────────┘
```

## How to Start Everything

### Step 1: Start Backend (Port 3001)
```powershell
cd MOBILE_APP/backend
npm run dev
```

**You should see:**
```
SafeHaven API Server running on port 3001
```

### Step 2: Start Web App (Port 3000)
```powershell
cd MOBILE_APP/web_app
npm run dev
```

**You should see:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 3: Access the Application
Open your browser and go to:
```
http://localhost:3000
```

## Test Login

Use these credentials:
- **Email:** admin@safehaven.com
- **Password:** Admin@123

## Quick Reference

| What | Port | URL |
|------|------|-----|
| **Web App** | 3000 | http://localhost:3000 |
| **Backend API** | 3001 | http://localhost:3001 |
| **API Endpoints** | 3001 | http://localhost:3001/api/v1/* |
| **Database** | 3306 | localhost:3306 |

## Verify It's Working

### 1. Check Backend
```powershell
curl http://localhost:3001/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 2. Check Web App
Open browser: `http://localhost:3000`

You should see the SafeHaven login page.

### 3. Check API Connection
After logging in, open browser DevTools (F12) → Network tab
You should see API calls going to `http://localhost:3001/api/v1/*`

## Troubleshooting

### "Port already in use"

**For port 3000:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**For port 3001:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Cannot connect to API"

1. Make sure backend is running on port 3001
2. Check `web_app/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
3. Restart both servers

### "CORS error"

1. Check `backend/.env` has: `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006`
2. Restart backend server

## All Fixed! 🎉

Your port configuration is now correct:
- ✅ Web app on port 3000
- ✅ Backend on port 3001
- ✅ No conflicts
- ✅ CORS configured correctly

You can now start both servers and they will work together properly!
