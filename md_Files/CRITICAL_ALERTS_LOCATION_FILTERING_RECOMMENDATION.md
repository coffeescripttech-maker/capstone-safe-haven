# Critical Alerts - Location Filtering Recommendation

## Current Problem

**Current Logic** (Line 135 in HomeScreen.tsx):
```typescript
const criticalAlerts = alerts.filter(a => a.severity === 'critical');
```

### Issues:
1. ❌ Shows ALL critical alerts regardless of location
2. ❌ User in Manila sees alerts from Davao (irrelevant)
3. ❌ No time sorting - old alerts may show first
4. ❌ No distance information
5. ❌ No affected area display

## Recommended Solution

### 1. Filter by Location + Sort by Time

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

### 2. Add Distance Calculation Function

```typescript
// Add this helper function in HomeScreen.tsx
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

### 3. Enhanced UI Display

```typescript
{criticalAlerts.slice(0, 2).map((alert, index) => {
  // Calculate distance if location available
  let distance: number | null = null;
  if (alert.latitude && alert.longitude && location) {
    distance = calculateDistance(
      location.latitude,
      location.longitude,
      alert.latitude,
      alert.longitude
    );
  }

  // Format time ago
  const timeAgo = formatTimeAgo(alert.createdAt);

  return (
    <TouchableOpacity
      key={`${alert.id}-${alert.alertType}-${index}`}
      style={styles.criticalAlert}
      onPress={() => navigation.navigate('Alerts')}
    >
      <View style={styles.criticalAlertHeader}>
        <Text style={styles.criticalAlertTitle} numberOfLines={2}>
          {alert.title}
        </Text>
        <Text style={styles.criticalAlertTime}>{timeAgo}</Text>
      </View>
      
      <View style={styles.criticalAlertFooter}>
        <Text style={styles.criticalAlertType}>
          {alert.alertType?.toUpperCase()}
        </Text>
        
        {distance !== null && (
          <Text style={styles.criticalAlertDistance}>
            📍 {distance.toFixed(1)} km away
          </Text>
        )}
      </View>

      {alert.affectedAreas && alert.affectedAreas.length > 0 && (
        <Text style={styles.criticalAlertAreas} numberOfLines={1}>
          Affected: {alert.affectedAreas.join(', ')}
        </Text>
      )}
    </TouchableOpacity>
  );
})}
```

### 4. Add Time Ago Helper

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

## Benefits

### Before (Current):
```
CRITICAL ALERTS
┌─────────────────────────────┐
│ Typhoon Warning - Davao     │  ← User in Manila sees this (800km away!)
│ TYPHOON                     │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Earthquake Alert - Cebu     │  ← Also irrelevant (600km away)
│ EARTHQUAKE                  │
└─────────────────────────────┘
```

### After (Improved):
```
CRITICAL ALERTS
┌─────────────────────────────┐
│ Heavy Rain Warning          │  ← Relevant to user's location
│ 15m ago                     │  ← Shows how recent
│ FLOOD                       │
│ 📍 5.2 km away              │  ← Shows distance
│ Affected: Manila, Quezon    │  ← Shows affected areas
└─────────────────────────────┘
┌─────────────────────────────┐
│ Earthquake Alert            │
│ 2h ago                      │
│ EARTHQUAKE                  │
│ 📍 45.8 km away             │
│ Affected: Rizal, Laguna     │
└─────────────────────────────┘
```

## Implementation Steps

1. ✅ Add `calculateDistance` helper function
2. ✅ Add `formatTimeAgo` helper function
3. ✅ Update `criticalAlerts` filtering logic
4. ✅ Update UI to show time, distance, and affected areas
5. ✅ Add new styles for the enhanced display

## Configuration Options

### Alert Radius Options:
- **Use alert's radiusKm**: Each alert defines its own affected radius
- **Default radius**: 100km if not specified
- **User preference**: Allow users to set their own alert radius (future feature)

### Fallback Behavior:
- If user has no location permission: Show all critical alerts
- If alert has no location data: Show to all users
- If no critical alerts nearby: Show message "No critical alerts in your area"

## Database Fields Used

From `disaster_alerts` table:
- `severity` - Filter for 'critical'
- `latitude` - Alert location
- `longitude` - Alert location
- `radius_km` - Affected radius
- `affected_areas` - JSON array of affected locations
- `created_at` - For time sorting
- `is_active` - Only show active alerts

## Testing Scenarios

### Scenario 1: User in Manila
- Alert in Manila (5km away) → ✅ Show
- Alert in Quezon City (15km away) → ✅ Show
- Alert in Davao (800km away) → ❌ Hide

### Scenario 2: No Location Permission
- Show all critical alerts (fallback behavior)
- Prompt user to enable location for better filtering

### Scenario 3: Multiple Critical Alerts
- Sort by most recent first
- Show maximum 2 alerts
- User can tap to see all in Alerts screen

## Summary

**Current**: Shows ALL critical alerts, no location filtering, no time info
**Recommended**: Shows only NEARBY critical alerts, sorted by time, with distance and affected areas

This makes the Critical Alerts section much more useful and relevant to users!
