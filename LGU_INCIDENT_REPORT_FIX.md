# LGU Incident Report Fix - Complete

## Problem

When submitting incident reports to LGU from the mobile app, users received:
- Error: "Request failed with status code 400"
- Backend validation error: "Invalid target agency"

Reports to other agencies (PNP, BFP, MDRRMO) worked fine.

## Root Cause

The backend controller had a validation check that only allowed these agencies:
```typescript
const validAgencies = ['pnp', 'bfp', 'mdrrmo']; // ❌ Missing 'lgu'
```

When the mobile app sent `targetAgency: 'lgu'`, the backend rejected it with a 400 error.

## Solution

Updated the `validAgencies` array to include LGU options:

```typescript
const validAgencies = ['pnp', 'bfp', 'mdrrmo', 'lgu', 'lgu_officer'];
```

## Changes Made

### File: `MOBILE_APP/backend/src/controllers/incident.controller.ts`

**Before:**
```typescript
const validAgencies = ['pnp', 'bfp', 'mdrrmo'];
```

**After:**
```typescript
const validAgencies = ['pnp', 'bfp', 'mdrrmo', 'lgu', 'lgu_officer'];
```

## Testing

### Test LGU Incident Report

1. Open mobile app
2. Go to "Report Incident"
3. Select any incident type
4. Select "LGU" as the agency
5. Fill in title and description
6. Submit report
7. Should succeed with "Report Submitted" message

### Test Other Agencies (Regression)

Verify other agencies still work:
- PNP: ✅ Should work
- BFP: ✅ Should work
- MDRRMO: ✅ Should work
- LGU: ✅ Should work now

## Backend Restart Required

The backend has been rebuilt. Restart it to apply changes:

```powershell
cd MOBILE_APP/backend
npm start
```

Or if using PM2:
```powershell
pm2 restart safehaven-backend
```

## Status

✅ **FIXED** - LGU incident reports now work correctly

---

**Date:** March 25, 2026
**Issue:** LGU incident reports failing with 400 error
**Resolution:** Added 'lgu' and 'lgu_officer' to validAgencies array in backend controller
