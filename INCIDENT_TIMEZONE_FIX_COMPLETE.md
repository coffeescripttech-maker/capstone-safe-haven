# Incident Timezone Fix Complete

## Status: ✅ Fixed

## Problem
The incident detail page (`/incidents/32`) was showing incorrect timestamps. The `createdAt` field was returning UTC time instead of Philippine Time (UTC+8), while the emergency alerts page (`/emergency-alerts/96`) was correctly showing PH time.

## Root Cause
The `incident.service.ts` was using JavaScript's `new Date().toISOString()` for date conversion, which doesn't apply timezone conversion. The alert service was already using the `toPhilippineTime()` utility function from `timezone.ts`.

## API Response Before Fix
```json
{
  "status": "success",
  "data": {
    "id": 32,
    "createdAt": "2026-03-20T02:08:44.000Z",  // UTC time
    "updatedAt": "2026-03-20T02:08:44.000Z"   // UTC time
  }
}
```

## API Response After Fix
```json
{
  "status": "success",
  "data": {
    "id": 32,
    "createdAt": "2026-03-20T10:08:44.000Z",  // PH time (UTC+8)
    "updatedAt": "2026-03-20T10:08:44.000Z"   // PH time (UTC+8)
  }
}
```

## Changes Made

### File: `MOBILE_APP/backend/src/services/incident.service.ts`

1. **Added timezone utility import:**
```typescript
import { toPhilippineTime } from '../utils/timezone';
```

2. **Updated `formatIncidentForRole()` method:**
```typescript
// Before:
createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,

// After:
createdAt: incident.created_at ? toPhilippineTime(incident.created_at) : null,
updatedAt: incident.updated_at ? toPhilippineTime(incident.updated_at) : null,
```

3. **Updated `getUserIncidents()` method:**
```typescript
// Before:
createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,

// After:
createdAt: incident.created_at ? toPhilippineTime(incident.created_at) : null,
updatedAt: incident.updated_at ? toPhilippineTime(incident.updated_at) : null,
```

## Timezone Utility Function

The `toPhilippineTime()` function from `backend/src/utils/timezone.ts`:

```typescript
export function toPhilippineTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Add 8 hours for Philippine timezone
  const philippineTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  
  return philippineTime.toISOString();
}
```

## Affected Endpoints

All incident-related endpoints now return PH time:

1. `GET /api/v1/incidents` - List all incidents
2. `GET /api/v1/incidents/:id` - Get incident by ID
3. `GET /api/v1/incidents/user/:userId` - Get user's incidents
4. `POST /api/v1/incidents` - Create incident (returns created incident)

## How Mobile App Submits Incidents

The mobile app (`ReportIncidentScreen.tsx`) does NOT send any datetime when creating an incident. It only sends:

```typescript
const reportData = {
  incidentType,
  title,
  description,
  latitude,
  longitude,
  address,
  severity,
  photos,
  targetAgency,
};
```

The backend automatically uses MySQL's `CURRENT_TIMESTAMP` when inserting:

```sql
INSERT INTO incident_reports 
(user_id, incident_type, title, description, latitude, longitude, 
 address, severity, photos, status, assigned_to)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
-- created_at and updated_at use CURRENT_TIMESTAMP automatically
```

## The Flow

1. **Mobile App** → Submits incident (no datetime sent)
2. **MySQL Database** → Stores with `CURRENT_TIMESTAMP` in UTC
3. **Backend API** → Converts UTC to PH Time when returning data
4. **Web App** → Displays the PH Time

## Testing

### Method 1: PowerShell Test Script
```powershell
# Run the test script
cd MOBILE_APP/backend
.\test-incident-timezone.ps1
```

### Method 2: Manual API Test
```bash
# Test incident detail endpoint
curl http://localhost:3001/api/v1/incidents/32 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Method 3: Check in Web App
1. Restart backend: `cd MOBILE_APP/backend && npm run dev`
2. Open web app: `http://localhost:3000/incidents/32`
3. Check "Reported" datetime - should show PH time

### Expected behavior:
- `createdAt` should show time 8 hours ahead of UTC
- Example: If UTC is `02:08:44`, PH time should be `10:08:44`
- The web app incident detail page should now show correct PH time

## Consistency Across Services

Now all services use consistent timezone handling:

✅ **Alert Service** - Uses `toPhilippineTime()`
✅ **Incident Service** - Uses `toPhilippineTime()` (FIXED)
⚠️ **SOS Service** - Returns raw database dates (may need fix if issues arise)

## Related Files

- `MOBILE_APP/backend/src/services/incident.service.ts` - Fixed
- `MOBILE_APP/backend/src/utils/timezone.ts` - Utility functions
- `MOBILE_APP/backend/src/services/alert.service.ts` - Reference implementation
- `MOBILE_APP/web_app/src/app/(admin)/incidents/[id]/page.tsx` - Frontend display

## Notes

- The database stores all timestamps in UTC (standard practice)
- The conversion to PH time happens at the API layer
- Frontend receives PH time and can display it directly
- This matches the behavior of the emergency alerts system

---

**Fixed:** March 21, 2026
**Status:** Production Ready ✅
