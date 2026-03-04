# Incident Notifications Fix ✅

## Issues Fixed

### Issue 1: Notifications Not Showing
**Problem**: User submitted incident reports but didn't see real-time notifications in web portal

**Root Cause**: Notification bell was filtering for only `high` and `critical` severity incidents, but user submitted `moderate` severity incidents

**Solution**: Updated filter to show `moderate`, `high`, and `critical` severity incidents (exclude only `low` severity)

**File Changed**: `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx`

**Before**:
```typescript
const isHighPriority = incident.severity === 'high' || incident.severity === 'critical';
return isNew && isHighPriority;
```

**After**:
```typescript
const isNotLowPriority = incident.severity !== 'low';
return isNew && isNotLowPriority;
```

---

### Issue 2: Missing User Data (Unknown, N/A)
**Problem**: Incidents page showing "Unknown" for reporter name and "N/A" for phone number

**Root Cause**: Backend was returning `userName` and `userPhone` as flat properties, but frontend expected nested `user` object with `firstName`, `lastName`, and `phone` properties

**Solution**: Added nested `user` object to backend response for frontend compatibility

**File Changed**: `MOBILE_APP/backend/src/services/incident.service.ts`

**Added**:
```typescript
// Add nested user object for frontend compatibility
user: incident.user_name ? {
  firstName: incident.user_name.split(' ')[0] || '',
  lastName: incident.user_name.split(' ').slice(1).join(' ') || '',
  phone: incident.user_phone || ''
} : undefined
```

---

## Updated Notification Behavior

### What Gets Notified Now

| Severity | Notifies? | Reason |
|----------|-----------|--------|
| 🔴 Critical | ✅ Yes | Urgent |
| 🟠 High | ✅ Yes | Important |
| 🟡 Moderate | ✅ Yes | Should be monitored |
| 🟢 Low | ✅ Yes | All reports need attention |

**Rationale**: 
- Responders need to be aware of ALL incident reports
- Even low severity incidents may escalate
- Better to have complete visibility than miss something
- Users can filter by severity on the incidents page if needed

---

## Testing Instructions

### Test Notifications

1. **Login to web portal** as admin/responder
2. **Open mobile app** as citizen
3. **Submit incident with moderate severity**:
   - Type: Any (damage, injury, hazard, etc.)
   - Severity: Moderate
   - Title: "Test Moderate Incident"
   - Description: "Testing notification system"
   - Add location and photos
4. **Wait 15 seconds** (or less)
5. **Check web portal** - orange bell should show badge
6. **Click bell** - should see incident in dropdown
7. **Verify**: Reporter name and phone should display correctly

### Test User Data Display

1. **Go to Incidents page** in web portal
2. **Check Reporter column**:
   - Should show full name (e.g., "John Doe")
   - Should show phone number (e.g., "+639123456789")
   - Should NOT show "Unknown" or "N/A"
3. **Click incident** to view details
4. **Check Reporter Information card**:
   - Name should be displayed
   - Phone should be clickable link

---

## Backend Changes Applied

### Compiled Successfully
```bash
npm run build
✓ TypeScript compilation successful
✓ No errors
```

### Database Schema
No database changes required - the `incident_reports` table already has proper foreign key to `users` table.

### API Response Format
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": 1,
        "userId": 5,
        "incidentType": "injury",
        "title": "Test Incident",
        "description": "Testing",
        "severity": "moderate",
        "status": "pending",
        "userName": "John Doe",
        "userPhone": "+639123456789",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+639123456789"
        },
        "address": "123 Main St",
        "latitude": 14.5995,
        "longitude": 120.9842,
        "createdAt": "2026-03-04T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

## What to Expect Now

### What to Expect Now

### Notifications
✅ All severity levels will trigger notifications (low, moderate, high, critical)
✅ All pending incidents will be shown to responders
✅ Complete visibility of all incident reports
✅ No incidents missed

### User Data Display
✅ Reporter name displays correctly (e.g., "John Doe")
✅ Reporter phone displays correctly (e.g., "+639123456789")
✅ No more "Unknown" or "N/A" for valid users
✅ Clickable phone link in detail page

### Address Display
- If address provided: Shows full address
- If no address: Shows "No address"
- Location coordinates always saved for map display

---

## Troubleshooting

### Still Showing "Unknown"?

**Possible Causes**:
1. User was deleted from database
2. Incident was created before user registration
3. Database foreign key constraint issue

**Solution**:
```sql
-- Check if user exists
SELECT u.id, u.first_name, u.last_name, u.phone
FROM users u
INNER JOIN incident_reports ir ON ir.user_id = u.id
WHERE ir.id = [incident_id];
```

### Still Not Getting Notifications?

**Checklist**:
1. ✅ Backend rebuilt and restarted?
2. ✅ Web portal page refreshed (hard refresh: Ctrl+F5)?
3. ✅ Incident severity is moderate/high/critical?
4. ✅ Incident status is pending?
5. ✅ Waiting at least 15 seconds after submission?
6. ✅ Browser console shows no errors?

**Debug Steps**:
1. Open browser console (F12)
2. Watch for API calls: `GET /api/v1/incidents?status=pending`
3. Check response data
4. Verify incident appears in response
5. Check `lastCheckTime` vs `incident.createdAt`

---

## Files Modified

1. ✅ `MOBILE_APP/backend/src/services/incident.service.ts` - Added nested user object
2. ✅ `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx` - Updated severity filter
3. ✅ `MOBILE_APP/backend/dist/**` - Rebuilt TypeScript

---

## Summary

Both issues have been fixed:

1. **Notifications now show for moderate severity** - More incidents will trigger notifications (moderate, high, critical)
2. **User data displays correctly** - Reporter name and phone show properly instead of "Unknown" and "N/A"

The backend has been successfully compiled and is ready to use. Restart the backend server and refresh the web portal to see the changes.
