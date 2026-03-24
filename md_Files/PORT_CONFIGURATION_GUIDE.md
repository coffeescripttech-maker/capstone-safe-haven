# Port Configuration Guide - SafeHaven Project

## Current Port Setup (ISSUE FOUND!)

### ⚠️ PROBLEM: Port Conflict

Both the **backend** and **web_app** are trying to use **port 3001**, which will cause a conflict!

```
❌ CURRENT (CONFLICTING):
┌─────────────────────────────────────────────────┐
│  Backend API Server                             │
│  Port: 3001 (from backend/.env)                 │
│  URL: http://localhost:3001                     │
└─────────────────────────────────────────────────┘
                    ↓ CONFLICT! ↓
┌─────────────────────────────────────────────────┐
│  Web App (Next.js)                              │
│  Port: 3001 (from web_app/.env.local)           │
│  URL: http://localhost:3001                     │
└─────────────────────────────────────────────────┘
```

## ✅ RECOMMENDED SOLUTION

Use the standard port configuration:

```
✅ RECOMMENDED:
┌─────────────────────────────────────────────────┐
│  Web App (Next.js Frontend)                     │
│  Port: 3000 (Next.js default)                   │
│  URL: http://localhost:3000                     │
└─────────────────────────────────────────────────┘
                    ↓ API Calls ↓
┌─────────────────────────────────────────────────┐
│  Backend API Server                             │
│  Port: 3001 (Express/Node.js)                   │
│  URL: http://localhost:3001                     │
│  API Base: http://localhost:3001/api/v1         │
└─────────────────────────────────────────────────┘
                    ↓ Database ↓
┌─────────────────────────────────────────────────┐
│  MySQL Database                                  │
│  Port: 3306 (MySQL default)                     │
└─────────────────────────────────────────────────┘
```

## Files to Update

### 1. Backend Configuration (Already Correct ✅)

**File: `MOBILE_APP/backend/.env`**
```env
PORT=3001  # ✅ Keep this as 3001
```

**Backend runs on:** `http://localhost:3001`
**API endpoints:** `http://localhost:3001/api/v1/*`

### 2. Web App Configuration (NEEDS FIX ❌)

**File: `MOBILE_APP/web_app/.env.local`**

**CHANGE THIS:**
```env
# ❌ WRONG - Conflicts with backend
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**TO THIS:**
```env
# ✅ CORRECT - Web app on 3000, API on 3001
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. Backend CORS Configuration (NEEDS FIX ❌)

**File: `MOBILE_APP/backend/.env`**

**CHANGE THIS:**
```env
# ❌ WRONG - Should allow 3000 for web app
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:3001
```

**TO THIS:**
```env
# ✅ CORRECT - Allow web app (3000), mobile (19006)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## Quick Fix Commands

### Option 1: Manual Edit (Recommended)

1. Open `MOBILE_APP/web_app/.env.local`
2. Change `NEXTAUTH_URL=http://localhost:3001` to `NEXTAUTH_URL=http://localhost:3000`
3. Save the file

### Option 2: PowerShell Command

```powershell
# Navigate to project root
cd MOBILE_APP

# Update web_app .env.local
(Get-Content web_app/.env.local) -replace 'NEXTAUTH_URL=http://localhost:3001', 'NEXTAUTH_URL=http://localhost:3000' | Set-Content web_app/.env.local

# Update backend .env (remove 3001 from CORS)
(Get-Content backend/.env) -replace 'ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:3001', 'ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006' | Set-Content backend/.env
```

## How to Start the Applications

### 1. Start Backend First (Port 3001)

```powershell
cd MOBILE_APP/backend
npm run dev
```

**Expected output:**
```
SafeHaven API Server running on port 3001
Environment: development
```

**Test backend:**
```powershell
curl http://localhost:3001/health
```

### 2. Start Web App Second (Port 3000)

```powershell
cd MOBILE_APP/web_app
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Access web app:**
Open browser: `http://localhost:3000`

### 3. Start Mobile App (Optional - Port 19006)

```powershell
cd MOBILE_APP/mobile
npm start
```

**Expected output:**
```
Metro waiting on exp://192.168.x.x:19000
```

## Port Summary Table

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Web App** | 3000 | http://localhost:3000 | Next.js admin dashboard |
| **Backend API** | 3001 | http://localhost:3001 | Express REST API |
| **Mobile Dev** | 19006 | http://localhost:19006 | Expo development server |
| **MySQL** | 3306 | localhost:3306 | Database |

## Testing the Configuration

### 1. Test Backend API

```powershell
# Health check
curl http://localhost:3001/health

# Login endpoint
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@safehaven.com","password":"Admin@123"}'
```

### 2. Test Web App

1. Open browser: `http://localhost:3000`
2. You should see the login page
3. Login with: `admin@safehaven.com` / `Admin@123`
4. Check browser console - API calls should go to `http://localhost:3001/api/v1/*`

### 3. Check for Port Conflicts

```powershell
# Check what's running on port 3000
netstat -ano | findstr :3000

# Check what's running on port 3001
netstat -ano | findstr :3001
```

## Troubleshooting

### Issue: "Port 3000 already in use"

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or start on different port
$env:PORT=3002; npm run dev
```

### Issue: "Port 3001 already in use"

**Solution:**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Issue: "CORS error when calling API"

**Check:**
1. Backend CORS allows `http://localhost:3000`
2. Web app is calling `http://localhost:3001/api/v1/*`
3. Both servers are running

**Fix:**
```env
# In backend/.env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### Issue: "Cannot connect to API"

**Check:**
1. Backend is running on port 3001
2. Web app `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
3. No firewall blocking localhost connections

## Environment Variables Reference

### Backend (.env)
```env
PORT=3001                                    # Backend API port
ALLOWED_ORIGINS=http://localhost:3000,...   # Allow web app
DB_PORT=3306                                # MySQL port
```

### Web App (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000          # Web app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Public web app URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1  # Backend API
```

### Mobile App (.env)
```env
API_URL=http://localhost:3001/api/v1        # Backend API
# Or use your computer's IP for physical devices
# API_URL=http://192.168.1.100:3001/api/v1
```

## Production Configuration

In production, you'll have different URLs:

```env
# Production Web App
NEXTAUTH_URL=https://safehaven.com
NEXT_PUBLIC_API_URL=https://api.safehaven.com/api/v1

# Production Backend
PORT=3001  # Or whatever your hosting provides
ALLOWED_ORIGINS=https://safehaven.com,https://www.safehaven.com
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  SAFEHAVEN PORT CONFIGURATION                   │
├─────────────────────────────────────────────────┤
│  Web App:     http://localhost:3000             │
│  Backend API: http://localhost:3001             │
│  Mobile Dev:  http://localhost:19006            │
│  MySQL DB:    localhost:3306                    │
├─────────────────────────────────────────────────┤
│  Start Order:                                   │
│  1. Backend  (cd backend && npm run dev)        │
│  2. Web App  (cd web_app && npm run dev)        │
│  3. Mobile   (cd mobile && npm start)           │
└─────────────────────────────────────────────────┘
```

## Need Help?

If you're still confused:
1. Check which ports are in use: `netstat -ano | findstr :300`
2. Make sure backend is on 3001, web app on 3000
3. Update `.env.local` to use port 3000 for NEXTAUTH_URL
4. Restart both servers after changing config
