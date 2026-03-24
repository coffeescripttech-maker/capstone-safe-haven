# Incident & SOS Timezone Fix - Complete

## Problem Identified

The backend was adding 8 hours to timestamps using `toPhilippineTime()` utility and returning them with ISO format (Z suffix). This caused a **double-conversion issue**:

1. Backend adds 8 hours: `16:19 UTC` → `00:19 PH time` → returns as `"2026-03-21T00:19:25.000Z"`
2. Browser sees 'Z' suffix (UTC indicator) and adds 8 hours again: `00:19 UTC + 8 hours` → `08:19 AM`
3. Result: Time displays 8 hours ahead in notification bells

## Root Cause

The 'Z' suffix in ISO 8601 format tells the browser "this is UTC time". When the backend returns Philippine time with a 'Z' suffix, the browser incorrectly interprets it as UTC and converts it again.

## Solution Applied

**Reverted timezone conversion in backend services** - Let the browser handle timezone conversion naturally:

### Changes Made

1. **incident.service.ts**
   - Removed `toPhilippineTime()` import
   - Removed timezone conversion in `getUserIncidents()` method
   - Removed timezone conversion in `formatIncidentForRole()` method
   - Now returns UTC timestamps as-is from database

2. **sos.service.ts**
   - Removed `toPhilippineTime()` import
   - Removed `formatSOSAlert()` method
   - Removed timezone conversion in `getSOSAlerts()` method
   - Removed timezone conversion in `getSOSAlertById()` method
   - Now returns UTC timestamps as-is from database

## How It Works Now

### Backend
- Database stores: `2026-03-20 16:19:25` (UTC)
- API returns: `"2026-03-20T16:19:25.000Z"` (UTC with Z suffix)

### Frontend (Browser in PH timezone)
- Receives: `"2026-03-20T16:19:25.000Z"`
- Browser interprets as UTC
- Converts to local timezone: `16:19 UTC + 8 hours = 00:19 AM (March 21)` ✅ CORRECT!

### Benefits

1. **Standard web practice** - ISO 8601 with Z suffix is designed for this
2. **Works for all timezones** - Users in different timezones see correct local time
3. **No double conversion** - Browser handles timezone conversion once
4. **Consistent behavior** - Detail pages and notification bells show same time

## Testing

### Test Incident API
```powershell
.\backend\test-incident-timezone.ps1
```

Expected: `created_at` should show UTC time (8 hours behind PH time)

### Test SOS API
```powershell
# Test SOS alert endpoint
curl http://192.168.43.25:3001/api/v1/sos-alerts/61
```

Expected: `created_at` should show UTC time (8 hours behind PH time)

### Test Notification Bells
1. Open web app notification bells (Incident or SOS)
2. Check time display
3. Should now show correct Philippine time (not 8 hours ahead)

## Files Modified

- `MOBILE_APP/backend/src/services/incident.service.ts`
- `MOBILE_APP/backend/src/services/sos.service.ts`

## Next Steps

1. ✅ Revert timezone conversion in backend
2. ⏳ Restart backend server
3. ⏳ Test incident API endpoint
4. ⏳ Test SOS API endpoint
5. ⏳ Test notification bells in web app
6. ⏳ Verify detail pages still show correct time

## Status

**REVERTED** - Backend now returns UTC timestamps. Browser handles timezone conversion.

---

**Date:** March 21, 2026
**Issue:** Double timezone conversion causing 8-hour offset
**Resolution:** Let browser handle timezone conversion (standard practice)
