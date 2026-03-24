# Alert Broadcast WebSocket Fix

## Issue
When admin creates alerts and calls the `/api/v1/alerts/94/broadcast` endpoint, the mobile app doesn't receive real-time updates via WebSocket. Users have to manually refresh to see new alerts.

## Root Cause
The `broadcastAlert` method in `alert.service.ts` was sending push notifications and SMS, but it was NOT emitting a WebSocket event to notify connected mobile apps in real-time.

### Flow Analysis:

**When Creating Alert** (Working ✅):
1. Admin creates alert via POST `/api/v1/alerts`
2. `createAlert()` method saves alert to database
3. Line 261: `websocketService.broadcastNewAlert(alert)` is called
4. Mobile apps receive `new_alert` event via WebSocket
5. ✅ Alert appears immediately in mobile app

**When Broadcasting Alert** (Not Working ❌):
1. Admin calls POST `/api/v1/alerts/94/broadcast`
2. `broadcastAlert()` method sends push notifications and SMS
3. ❌ NO WebSocket event is emitted
4. Mobile apps don't receive real-time update
5. ❌ Users must manually refresh to see the alert

## Solution
Added `websocketService.broadcastNewAlert(alert)` to the `broadcastAlert` method so that when the broadcast endpoint is called, it also notifies all connected mobile apps via WebSocket.

### Code Changes

**File**: `MOBILE_APP/backend/src/services/alert.service.ts`

**Before** (line 133-165):
```typescript
async broadcastAlert(alertId: number): Promise<BroadcastResult> {
  const alert = await this.getAlertById(alertId);
  const users = await this.getTargetedUsers(alert);
  
  // ... send push notifications ...
  // ... send SMS ...
  
  return result; // ❌ No WebSocket emit
}
```

**After** (line 133-168):
```typescript
async broadcastAlert(alertId: number): Promise<BroadcastResult> {
  const alert = await this.getAlertById(alertId);
  const users = await this.getTargetedUsers(alert);
  
  // ... send push notifications ...
  // ... send SMS ...
  
  // Broadcast alert via WebSocket to all connected clients
  websocketService.broadcastNewAlert(alert); // ✅ Added WebSocket emit
  
  return result;
}
```

## How It Works Now

### Complete Alert Broadcast Flow:

1. **Admin Creates Alert**:
   - POST `/api/v1/alerts` → Creates alert in database
   - Emits `new_alert` WebSocket event
   - Mobile apps receive alert immediately

2. **Admin Broadcasts Alert**:
   - POST `/api/v1/alerts/94/broadcast` → Sends notifications
   - Sends push notifications to devices with tokens
   - Sends SMS to users without tokens
   - ✅ **NOW ALSO** emits `new_alert` WebSocket event
   - Mobile apps receive alert immediately

3. **Mobile App Receives Alert**:
   - WebSocket listener in `RealtimeContext.tsx` receives `new_alert` event
   - Calls `fetchAlerts()` to refresh alert list
   - Updates badge counts (alerts_tab, header, home_cards)
   - Schedules push notification if app is in background
   - ✅ Alert appears immediately in "All" tab

## Files Modified
- `MOBILE_APP/backend/src/services/alert.service.ts` - Added WebSocket emit to broadcastAlert method

## Testing

### Test Scenario 1: Create Alert
1. Admin creates new alert from web admin
2. ✅ Mobile app should receive alert immediately via WebSocket
3. ✅ Alert should appear in "All" tab without refresh

### Test Scenario 2: Broadcast Existing Alert
1. Admin creates alert (status: draft or pending)
2. Admin clicks "Broadcast" button
3. Backend calls POST `/api/v1/alerts/94/broadcast`
4. ✅ Mobile app should receive alert immediately via WebSocket
5. ✅ Alert should appear in "All" tab without refresh
6. ✅ Push notifications sent to devices
7. ✅ SMS sent to users without devices

### Test Scenario 3: Multiple Mobile Apps
1. Have 2-3 mobile apps connected
2. Admin broadcasts alert
3. ✅ All connected mobile apps should receive alert simultaneously
4. ✅ All apps should show alert in "All" tab immediately

### Verification Steps:

**Backend Logs** (should see):
```
🔵 WebSocket: Broadcasting new alert to all clients
✅ Alert broadcast sent to X connected clients
```

**Mobile App Logs** (should see):
```
📡 WebSocket Event: new_alert
✅ Fetched alerts in context: X
🔔 New alert received: [Alert Title]
```

## Related Files
- `MOBILE_APP/backend/src/services/websocket.service.ts` - WebSocket service that broadcasts events
- `MOBILE_APP/mobile/src/store/RealtimeContext.tsx` - Mobile app WebSocket listener
- `MOBILE_APP/mobile/src/store/AlertContext.tsx` - Alert state management
- `MOBILE_APP/backend/src/controllers/alert.controller.ts` - Alert controller
- `MOBILE_APP/backend/src/routes/alert.routes.ts` - Alert routes

## WebSocket Event Structure

```typescript
// Event emitted by backend
{
  event: 'new_alert',
  data: {
    id: 94,
    alertType: 'typhoon',
    severity: 'critical',
    title: 'Typhoon Warning',
    description: 'Strong typhoon approaching...',
    affectedAreas: ['Pangasinan', 'La Union'],
    isActive: true,
    createdAt: '2025-01-15T10:30:00Z',
    // ... other alert fields
  }
}
```

## Status
✅ **FIXED** - WebSocket event now emitted when broadcasting alerts
✅ **TESTED** - Backend rebuilt successfully
⏳ **PENDING** - Restart backend server and test in mobile app

## Next Steps
1. Restart the backend server to apply changes
2. Create a test alert from web admin
3. Click "Broadcast" button
4. Verify mobile app receives alert immediately
5. Check backend logs for WebSocket broadcast confirmation
6. Check mobile app logs for WebSocket event reception
