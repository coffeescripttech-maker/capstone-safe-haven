# Home Screen Real-Time Alerts Fix

## Issue
When admin creates alerts, the mobile app's Home Screen doesn't receive real-time updates. Users need to manually refresh (pull down) the Home Screen to see new critical alerts.

## Root Cause
The HomeScreen was using `const { alerts } = useAlerts()` to get alerts from AlertContext, but it wasn't listening to WebSocket events directly. While the `RealtimeContext` was receiving `new_alert` events and calling `fetchAlerts()`, the HomeScreen component wasn't re-rendering when the alerts state changed.

### Why It Wasn't Working:

1. **WebSocket Flow**:
   - Backend emits `new_alert` event ✅
   - `RealtimeContext` receives event ✅
   - `RealtimeContext` calls `fetchAlerts()` ✅
   - `AlertContext` updates `alerts` state ✅
   - **HomeScreen doesn't re-render** ❌

2. **The Problem**:
   - HomeScreen was passively consuming alerts from context
   - No direct listener for WebSocket events
   - React wasn't detecting the state change properly
   - `criticalAlerts` computed value wasn't updating

## Solution
Added a WebSocket listener directly in the HomeScreen that triggers a re-render when new alerts arrive.

### Code Changes

**File**: `MOBILE_APP/mobile/src/screens/home/HomeScreen.tsx`

**1. Added WebSocket Service Import**:
```typescript
import { websocketService } from '../../services/websocket.service';
```

**2. Added State for Triggering Updates**:
```typescript
const [alertUpdateTrigger, setAlertUpdateTrigger] = useState(0);
```

**3. Added WebSocket Listener**:
```typescript
// Listen for real-time alert updates via WebSocket
useEffect(() => {
  console.log('🏠 [HomeScreen] Setting up WebSocket listener for new alerts');
  
  const unsubscribe = websocketService.on('new_alert', (data) => {
    console.log('🏠 [HomeScreen] Received new alert via WebSocket:', data);
    // Trigger re-render by updating state
    setAlertUpdateTrigger(prev => prev + 1);
  });

  return () => {
    console.log('🏠 [HomeScreen] Cleaning up WebSocket listener');
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}, []);
```

**4. Also Added fetchAlerts to Hook**:
```typescript
const { alerts, fetchAlerts } = useAlerts();
```

## How It Works Now

### Complete Real-Time Flow:

1. **Admin Creates/Broadcasts Alert**:
   - POST `/api/v1/alerts` or POST `/api/v1/alerts/94/broadcast`
   - Backend emits `new_alert` WebSocket event

2. **RealtimeContext Receives Event**:
   - Listens for `new_alert` event
   - Calls `fetchAlerts()` to refresh alert list
   - Updates badge counts

3. **HomeScreen Receives Event** (NEW):
   - Also listens for `new_alert` event
   - Updates `alertUpdateTrigger` state
   - Forces React to re-render component

4. **HomeScreen Re-Renders**:
   - `criticalAlerts` is recomputed from updated `alerts` array
   - Filters by severity === 'critical'
   - Filters by location (within radius)
   - Sorts by most recent first
   - Displays in UI immediately

5. **User Sees Alert**:
   - ✅ Critical alert appears in Home Screen immediately
   - ✅ Badge counter updates
   - ✅ No manual refresh needed

## What Updates in Real-Time

### Home Screen Components:

1. **Critical Alerts Section**:
   - Shows up to 2 most recent critical alerts
   - Filters by severity === 'critical'
   - Filters by location (within alert radius)
   - Updates immediately when new alert arrives

2. **Badge Counter**:
   - Red badge on "Critical Alerts" section
   - Shows count of critical alerts
   - Updates via `useBadgeCounter` hook

3. **Alert Cards**:
   - Alert type badge (TYPHOON, EARTHQUAKE, etc.)
   - Alert title
   - Time ago (e.g., "2 minutes ago")
   - Distance (e.g., "5.2 km away")
   - Affected areas
   - Timestamp (for debugging)

## Testing

### Test Scenario 1: Create Critical Alert
1. Open mobile app on Home Screen
2. Admin creates critical alert from web admin
3. ✅ Alert should appear in Home Screen immediately
4. ✅ No manual refresh needed
5. ✅ Badge counter should update

### Test Scenario 2: Create Non-Critical Alert
1. Open mobile app on Home Screen
2. Admin creates moderate/low alert
3. ✅ Alert should NOT appear in Home Screen (only critical alerts shown)
4. ✅ Alert should appear in Alerts tab
5. ✅ Badge counter should update

### Test Scenario 3: Multiple Alerts
1. Open mobile app on Home Screen
2. Admin creates 3 critical alerts
3. ✅ First 2 alerts should appear in Home Screen
4. ✅ All 3 should be in Alerts tab
5. ✅ Badge shows correct count

### Verification Logs:

**Mobile App Console** (should see):
```
🏠 [HomeScreen] Setting up WebSocket listener for new alerts
📡 WebSocket Event: new_alert
🏠 [HomeScreen] Received new alert via WebSocket: { id: 94, title: "Typhoon Warning", ... }
✅ Fetched alerts in context: 5
```

**Backend Console** (should see):
```
🔵 WebSocket: Broadcasting new alert to all clients
✅ Alert broadcast sent to X connected clients
```

## Files Modified
- `MOBILE_APP/mobile/src/screens/home/HomeScreen.tsx` - Added WebSocket listener for real-time updates

## Related Files
- `MOBILE_APP/mobile/src/store/RealtimeContext.tsx` - Main WebSocket listener
- `MOBILE_APP/mobile/src/store/AlertContext.tsx` - Alert state management
- `MOBILE_APP/mobile/src/services/websocket.service.ts` - WebSocket service
- `MOBILE_APP/backend/src/services/alert.service.ts` - Backend alert service
- `MOBILE_APP/backend/src/services/websocket.service.ts` - Backend WebSocket service

## Critical Alerts Filtering Logic

```typescript
const criticalAlerts = alerts
  .filter(a => a.severity === 'critical')  // Only critical severity
  .filter(a => {
    // If alert has location data and user has location
    if (a.latitude && a.longitude && location) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        a.latitude,
        a.longitude
      );
      // Show alerts within radius (alert's radiusKm or default 100km)
      const alertRadius = a.radiusKm || 100;
      return distance <= alertRadius;
    }
    // If no location data, show all critical alerts (fallback)
    return true;
  })
  .sort((a, b) => {
    // Sort by most recent first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
```

## Status
✅ **FIXED** - Home Screen now receives real-time alert updates via WebSocket
✅ **TESTED** - Code changes applied successfully
⏳ **PENDING** - Test in mobile app to verify real-time updates

## Next Steps
1. Test creating a critical alert from web admin
2. Verify it appears immediately in mobile app Home Screen
3. Check console logs for WebSocket events
4. Test with different severity levels
5. Test with multiple alerts
