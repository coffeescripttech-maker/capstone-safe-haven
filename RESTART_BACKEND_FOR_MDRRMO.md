# Restart Backend to Apply MDRRMO Changes

## Problem

Getting error: **"Insufficient permissions - SMS blast access restricted to Admins and Superadmins"**

This means the backend is still running the OLD compiled code that doesn't include MDRRMO in SMS Blast access.

## Solution: Restart Backend

### Step 1: Stop Current Backend

Press `Ctrl + C` in the terminal where backend is running

### Step 2: Compile Backend

```bash
cd MOBILE_APP/backend
npm run build
```

### Step 3: Start Backend

```bash
npm run dev
```

### Step 4: Verify

1. Login as MDRRMO user
2. Go to http://localhost:3000/sms-blast
3. Should work without "Insufficient permissions" error

## Quick Restart Script

Run this in PowerShell:

```powershell
cd MOBILE_APP/backend
npm run build
npm run dev
```

## What Changed

The following files were updated to include MDRRMO:

1. **backend/src/routes/smsBlast.routes.ts** - Added MDRRMO to all route permissions
2. **backend/src/middleware/smsAuth.ts** - Updated TypeScript types
3. **backend/src/services/incident.service.ts** - Fixed incident filtering
4. **backend/src/services/sos.service.ts** - Fixed SOS filtering
5. **web_app/src/layout/AppSidebar.tsx** - Added MDRRMO to SMS Blast menu

All these changes need the backend to be recompiled and restarted!

## Troubleshooting

### If still getting error after restart:

1. **Check if backend restarted**: Look for "Server running on port 3001" message
2. **Clear browser cache**: Hard refresh with `Ctrl + Shift + R`
3. **Check user role**: Make sure you're logged in as MDRRMO user
4. **Check jurisdiction**: MDRRMO user needs jurisdiction assigned (see SMS_BLAST_JURISDICTION_SETUP.md)

### Check Backend Logs

Look for this in backend console:
```
Filtering SOS alerts for role mdrrmo: mdrrmo, all
```

This confirms MDRRMO filtering is working.

## Summary

The code changes are done, but you need to:
1. ✅ Stop backend
2. ✅ Compile: `npm run build`
3. ✅ Start: `npm run dev`
4. ✅ Test SMS Blast as MDRRMO user

That's it!
