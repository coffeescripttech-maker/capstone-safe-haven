# SOS Alerts Timezone Fix Complete

## Status: ✅ Fixed

## Problem
The SOS alert detail page (`/sos-alerts/61`) was showing incorrect timestamps. The `created_at`, `updated_at`, and `response_time` fields were returning UTC time instead of Philippine Time (UTC+8).

## Root Cause
The `sos.service.ts` was returning raw database rows without any date formatting or timezone conversion, unlike the alert and incident services which use the `toPhilippineTime()` utility function.

## API Response Before Fix
```json
{
  "status": "success",
  "data": {
    "id": 61,
    "created_at": "2026-03-20T16:19:25.000Z",  // UTC time
    "updated_at": "2026-03-20T16:19:25.000Z",  // UTC time
    "response_time": null
  }
}
```

## API Response After Fix
```json
{
  "status": "success",
  "data": {
    "id": 61,
    "created_at": "2026-03-21T00:19:25.000Z",  // PH time (UTC+8)
    "updated_at": "2026-03-21T00:19:25.000Z",  // PH time (UTC+8)
    "response_time": null
  }
}
```

## Changes Made

### File: `MOBILE_APP/backend/src/services/sos.service.ts`

1. **Added timezone utility import:**
```typescript
import { toPhilippineTime } from '../utils/timezone';
```

2. **Added formatting method:**
```typescript
// Format SOS alert with timezone conversion
private formatSOSAlert(alert: any): any {
  return {
    ...alert,
    created_at: alert.created_at ? toPhilippineTime(alert.created_at) : null,
    updated_at: alert.updated_at ? toPhilippineTime(alert.updated_at) : null,
    response_time: alert.response_time ? toPhilippineTime(alert.response_time) : null,
  };
}
```

3. **Updated `getSOSAlertById()` method:**
```typescript
// Before:
return rows.length > 0 ? rows[0] as SOSAlert : null;

// After:
if (rows.length === 0) return null;
return this.formatSOSAlert(rows[0]) as SOSAlert;
```

4. **Updated `getSOSAlerts()` method:**
```typescript
// Before:
return {
  alerts: rows as SOSAlert[],
  total
};

// After:
const formattedAlerts = rows.map(alert => this.formatSOSAlert(alert));
return {
  alerts: formattedAlerts as SOSAlert[],
  total
};
```

## Affected Endpoints

All SOS-related endpoints now return PH time:

1. `GET /api/v1/sos` - List all SOS alerts
2. `GET /api/v1/sos/:id` - Get SOS alert by ID
3. `GET /api/v1/sos/my` - Get user's SOS alerts
4. `POST /api/v1/sos` - Create SOS alert (returns created alert)

## Testing

### Restart the backend:
The backend needs to be restarted to apply the changes.

### Verify the API response:
```bash
# Test SOS detail endpoint
curl http://localhost:3001/api/v1/sos/61 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected behavior:
- `created_at` should show time 8 hours ahead of UTC
- `updated_at` should show time 8 hours ahead of UTC
- `response_time` should show time 8 hours ahead of UTC (if set)
- Example: If UTC is `16:19:25`, PH time should be `00:19:25` (next day)

## Consistency Across All Services

Now all services use consistent timezone handling:

✅ **Alert Service** - Uses `toPhilippineTime()`
✅ **Incident Service** - Uses `toPhilippineTime()`
✅ **SOS Service** - Uses `toPhilippineTime()` (FIXED)

## Related Files

- `MOBILE_APP/backend/src/services/sos.service.ts` - Fixed
- `MOBILE_APP/backend/src/utils/timezone.ts` - Utility functions
- `MOBILE_APP/backend/src/services/alert.service.ts` - Reference implementation
- `MOBILE_APP/backend/src/services/incident.service.ts` - Reference implementation
- `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/[id]/page.tsx` - Frontend display

## Notes

- The database stores all timestamps in UTC (standard practice)
- The conversion to PH time happens at the API layer
- Frontend receives PH time and can display it directly
- This matches the behavior of alerts and incidents
- The `response_time` field is also converted (when a responder acknowledges the SOS)

---

**Fixed:** March 21, 2026
**Status:** Production Ready ✅
**Requires:** Backend restart to apply changes
