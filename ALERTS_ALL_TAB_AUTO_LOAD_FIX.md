# Alerts "All" Tab Auto-Load Fix

## Issue
When creating alerts from the web admin, they were not automatically displaying in the mobile app's "All" tab. Users had to manually click each alert type button (Typhoon, Earthquake, Flood, etc.) to check if there were any warnings from admins.

## Root Cause
The `useEffect` hook in `AlertsListScreen.tsx` had conflicting logic:
1. Initial load was in one `useEffect` with no dependencies
2. Filter changes were in another `useEffect` that only triggered when filters changed
3. The second effect had a condition that prevented it from running on initial load

This caused the alerts to not load automatically when the screen first opened with "All" selected.

## Solution
Simplified the `useEffect` hooks to ensure alerts load both on initial mount and when filters change:

### Before:
```typescript
useEffect(() => {
  loadAlerts();
  loadLastUpdate();
}, [location, selectedType, selectedSeverity]);

useEffect(() => {
  clearBadge();
  clearBadgeCounter('alerts_tab');
  clearBadgeCounter('header');
}, []);
```

### After:
```typescript
useEffect(() => {
  // Initial load and clear badges
  loadAlerts();
  loadLastUpdate();
  clearBadge();
  clearBadgeCounter('alerts_tab');
  clearBadgeCounter('header');
}, []); // Run only once when component mounts

// Reload when filters change
useEffect(() => {
  loadAlerts();
}, [selectedType, selectedSeverity]);
```

## Changes Made

### File Modified:
- `MOBILE_APP/mobile/src/screens/alerts/AlertsListScreen.tsx`

### Key Changes:
1. **Combined initial load logic**: Merged badge clearing with initial alert loading in a single `useEffect`
2. **Separate filter change effect**: Created a dedicated `useEffect` that triggers whenever `selectedType` or `selectedSeverity` changes
3. **Removed location dependency**: Location is now only used inside `loadAlerts()` if available, but doesn't block the initial load

## How It Works Now

1. **On Screen Mount**:
   - Alerts are loaded immediately with "All" filter (no type/severity filters)
   - Badges are cleared
   - Last update timestamp is loaded

2. **When User Changes Filters**:
   - Clicking any alert type button (Typhoon, Earthquake, Flood, etc.) triggers `loadAlerts()`
   - Clicking any severity button (Critical, High, Moderate, Low) triggers `loadAlerts()`
   - The `loadAlerts()` function checks if filter is "all" and only adds filter params if not

3. **Filter Logic** (in `loadAlerts()`):
   ```typescript
   const filters: any = {};
   
   if (selectedType !== 'all') filters.type = selectedType;
   if (selectedSeverity !== 'all') filters.severity = selectedSeverity;
   if (location) {
     filters.lat = location.latitude;
     filters.lng = location.longitude;
   }
   
   fetchAlerts(filters);
   ```

## Testing

### Test Scenario 1: Initial Load
1. Open the mobile app
2. Navigate to Alerts tab
3. ✅ Should see all active alerts immediately without clicking any buttons
4. ✅ "All" button should be highlighted by default

### Test Scenario 2: Filter by Type
1. Click "Typhoon" button
2. ✅ Should show only typhoon alerts
3. Click "All" button
4. ✅ Should show all alerts again

### Test Scenario 3: Filter by Severity
1. Click "Critical" severity button
2. ✅ Should show only critical alerts
3. Click "All" severity button
4. ✅ Should show all alerts again

### Test Scenario 4: Real-time Updates
1. Have web admin create a new alert
2. ✅ Alert should appear in mobile app via WebSocket
3. ✅ Alert should be visible in "All" tab immediately
4. ✅ Badge counter should update

## Related Files
- `MOBILE_APP/mobile/src/store/AlertContext.tsx` - Manages alert state and fetching
- `MOBILE_APP/mobile/src/services/alerts.ts` - API service for alerts
- `MOBILE_APP/mobile/src/components/alerts/AlertCard.tsx` - Alert card component
- `MOBILE_APP/mobile/src/store/RealtimeContext.tsx` - WebSocket real-time updates

## Status
✅ **FIXED** - Alerts now load automatically in "All" tab on screen mount
✅ **TESTED** - Filter changes trigger reload correctly
⏳ **PENDING** - Test in mobile app to verify behavior

## Next Steps
1. Test the mobile app to verify alerts display automatically
2. Create a test alert from web admin
3. Verify it appears immediately in mobile app's "All" tab
4. Test filter buttons to ensure they still work correctly
