# Critical Alerts Location Filtering - COMPLETE ✅

## Implementation Summary

Successfully implemented location-based filtering for Critical Alerts section in the mobile app home screen. Alerts are now filtered by proximity to user's location, sorted by time, and display enhanced information.

## Changes Made

### 1. Added Helper Functions (HomeScreen.tsx)

#### Distance Calculation
```typescript
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
```

#### Time Ago Formatting
```typescript
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const alertTime = new Date(dateString);
  const diffMs = now.getTime() - alertTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
```

### 2. Updated Alert Filtering Logic

**Before:**
```typescript
const criticalAlerts = alerts.filter(a => a.severity === 'critical');
```

**After:**
```typescript
const criticalAlerts = alerts
  .filter(a => a.severity === 'critical')
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

### 3. Enhanced UI Display

**New Features:**
- ✅ Time ago display (e.g., "15m ago", "2h ago")
- ✅ Distance from user (e.g., "📍 5.2 km away")
- ✅ Affected areas list (e.g., "Affected: Manila, Quezon")
- ✅ Better layout with header/footer structure

**UI Structure:**
```
┌─────────────────────────────────────┐
│ Heavy Rain Warning      15m ago     │  ← Title + Time
│ FLOOD              📍 5.2 km away   │  ← Type + Distance
│ Affected: Manila, Quezon City       │  ← Affected Areas
└─────────────────────────────────────┘
```

### 4. New Styles Added

```typescript
criticalAlertHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: SPACING.xs,
},
criticalAlertTime: {
  fontSize: TYPOGRAPHY.sizes.xs,
  color: COLORS.white,
  opacity: 0.9,
  fontWeight: TYPOGRAPHY.weights.medium,
},
criticalAlertFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.xs,
},
criticalAlertDistance: {
  fontSize: TYPOGRAPHY.sizes.xs,
  color: COLORS.white,
  opacity: 0.95,
  fontWeight: TYPOGRAPHY.weights.medium,
},
criticalAlertAreas: {
  fontSize: TYPOGRAPHY.sizes.xs,
  color: COLORS.white,
  opacity: 0.85,
  fontStyle: 'italic',
  marginTop: SPACING.xs,
},
```

## How It Works

### Location Filtering
1. **User has location + Alert has location**: Calculate distance and filter by radius
2. **User has no location**: Show all critical alerts (fallback)
3. **Alert has no location**: Show to all users (fallback)

### Radius Logic
- Uses alert's `radiusKm` field if available
- Falls back to 100km default radius
- Example: Typhoon with 150km radius affects users within 150km

### Time Sorting
- Most recent alerts appear first
- Ensures users see latest critical information
- Older alerts pushed down or hidden (max 2 shown)

### Distance Display
- Only shown when both user and alert have location data
- Calculated using Haversine formula (accurate for Earth's curvature)
- Displayed in kilometers with 1 decimal place

### Affected Areas
- Shows list of affected provinces/cities/barangays
- Truncated to 1 line with ellipsis if too long
- Only displayed if alert has `affectedAreas` data

## Testing Scenarios

### Scenario 1: User in Manila with Location Permission
```
✅ Alert in Manila (5km away) → SHOWN
✅ Alert in Quezon City (15km away) → SHOWN
✅ Alert in Cavite (45km away) → SHOWN
❌ Alert in Davao (800km away) → HIDDEN
```

### Scenario 2: User Without Location Permission
```
✅ All critical alerts shown (fallback behavior)
⚠️ No distance information displayed
⚠️ Prompt to enable location for better filtering
```

### Scenario 3: Multiple Critical Alerts
```
Alert A: Created 5 minutes ago, 10km away
Alert B: Created 2 hours ago, 5km away
Alert C: Created 1 hour ago, 50km away

Display Order:
1. Alert A (most recent)
2. Alert C (second most recent)
(Alert B not shown - only 2 alerts displayed)
```

### Scenario 4: Alert Without Location Data
```
✅ Shown to all users regardless of location
⚠️ No distance displayed
✅ Still shows time ago and affected areas
```

## Benefits

### Before Implementation
- ❌ Showed ALL critical alerts (irrelevant ones too)
- ❌ No indication of how recent alerts are
- ❌ No distance information
- ❌ No affected areas display
- ❌ Random order (not sorted)

### After Implementation
- ✅ Shows only NEARBY critical alerts
- ✅ Displays time ago (e.g., "15m ago")
- ✅ Shows distance from user (e.g., "5.2 km away")
- ✅ Lists affected areas
- ✅ Sorted by most recent first
- ✅ Better user experience and relevance

## Database Fields Used

From `disaster_alerts` table:
- `severity` - Filter for 'critical'
- `latitude` - Alert location (optional)
- `longitude` - Alert location (optional)
- `radius_km` - Affected radius (optional, defaults to 100km)
- `affected_areas` - JSON array of affected locations
- `created_at` - For time sorting and "time ago" display
- `is_active` - Only show active alerts

## Files Modified

1. **MOBILE_APP/mobile/src/screens/home/HomeScreen.tsx**
   - Added `calculateDistance()` helper function
   - Added `formatTimeAgo()` helper function
   - Updated `criticalAlerts` filtering logic
   - Enhanced UI to show time, distance, and affected areas
   - Added new styles for enhanced display

## Configuration

### Default Alert Radius
```typescript
const alertRadius = a.radiusKm || 100; // 100km default
```

### Maximum Alerts Shown
```typescript
criticalAlerts.slice(0, 2) // Show maximum 2 alerts
```

### Time Format Options
- "Just now" - Less than 1 minute
- "15m ago" - Less than 1 hour
- "2h ago" - Less than 24 hours
- "3d ago" - 24 hours or more

## Future Enhancements

### Possible Improvements:
1. **User Preference**: Allow users to set custom alert radius (50km, 100km, 200km)
2. **Alert Categories**: Filter by alert type (show only typhoons, earthquakes, etc.)
3. **Notification Settings**: Different radius for push notifications vs display
4. **Map View**: Show alerts on map with radius circles
5. **Alert History**: View past critical alerts in the area

## Testing Instructions

### Test 1: Location-Based Filtering
1. Enable location permission in mobile app
2. Create test alerts at different distances:
   - Alert A: Same city as user (should show)
   - Alert B: 50km away (should show)
   - Alert C: 500km away (should hide)
3. Verify only nearby alerts appear

### Test 2: Time Sorting
1. Create 3 critical alerts:
   - Alert A: Created now
   - Alert B: Created 1 hour ago
   - Alert C: Created 5 minutes ago
2. Verify display order: A, C, B (most recent first)

### Test 3: Distance Display
1. Enable location permission
2. Create alert with location data
3. Verify distance shows correctly (e.g., "📍 5.2 km away")

### Test 4: Affected Areas
1. Create alert with `affected_areas`: ["Manila", "Quezon City"]
2. Verify "Affected: Manila, Quezon City" displays

### Test 5: No Location Permission
1. Disable location permission
2. Verify all critical alerts still show (fallback)
3. Verify no distance information displayed

## Summary

Critical Alerts section now provides:
- **Relevant alerts**: Only shows alerts near user's location
- **Timely information**: Sorted by most recent first
- **Distance context**: Shows how far away the alert is
- **Affected areas**: Lists impacted locations
- **Better UX**: More informative and actionable for users

Users can now quickly see the most relevant critical alerts in their area with all the context they need to take action!

---

**Status**: ✅ COMPLETE
**Date**: 2026-03-12
**Files Modified**: 1 (HomeScreen.tsx)
**Lines Added**: ~80 lines (helpers + filtering + UI + styles)
