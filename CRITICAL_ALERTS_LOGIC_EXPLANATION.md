# Critical Alerts Logic - Mobile App Explanation

## Overview
The "Critical Alerts" section on the mobile app home screen displays emergency alerts that require immediate attention from users.

## How It Works

### 1. Data Source
**File**: `mobile/src/store/AlertContext.tsx`

Alerts come from the backend API endpoint: `GET /api/v1/disaster-alerts`

```typescript
const { alerts: fetchedAlerts } = await alertsService.getAlerts({
  isActive: true,  // Only fetch active alerts
});
```

### 2. Filtering Logic
**File**: `mobile/src/screens/home/HomeScreen.tsx` (Line 135)

```typescript
const criticalAlerts = alerts.filter(a => a.severity === 'critical');
```

**Condition**: Only alerts with `severity === 'critical'` are shown in the Critical Alerts section.

### 3. Display Condition
**File**: `mobile/src/screens/home/HomeScreen.tsx` (Line 280)

```typescript
{criticalAlerts.length > 0 && (
  <View style={styles.criticalSection}>
    {/* Critical alerts UI */}
  </View>
)}
```

**Condition**: The Critical Alerts section only appears if there is at least 1 critical alert.

### 4. Display Limit
**File**: `mobile/src/screens/home/HomeScreen.tsx` (Line 286)

```typescript
{criticalAlerts.slice(0, 2).map((alert, index) => (
  // Render alert card
))}
```

**Limit**: Only the first 2 critical alerts are displayed on the home screen.

## Complete Flow

```
1. App loads → AlertContext fetches alerts from API
   ↓
2. Filter: isActive = true (only active alerts)
   ↓
3. HomeScreen filters: severity = 'critical'
   ↓
4. Check: criticalAlerts.length > 0?
   ↓ YES
5. Display first 2 critical alerts in red banner
   ↓ NO
6. Hide Critical Alerts section
```

## Alert Severity Levels

From the database/API, alerts can have these severity levels:
- `info` - Informational alerts (blue)
- `warning` - Warning alerts (yellow/orange)
- `critical` - Critical alerts (red) ← **Only these show in Critical Alerts section**

## Database Table

**Table**: `disaster_alerts`

**Key Fields**:
- `severity` - ENUM('info', 'warning', 'critical')
- `is_active` - BOOLEAN (must be TRUE)
- `title` - Alert title
- `alert_type` - Type of disaster (typhoon, earthquake, flood, etc.)

## Example Query

To see which alerts would appear in Critical Alerts:

```sql
SELECT id, title, alert_type, severity, is_active, created_at
FROM disaster_alerts
WHERE severity = 'critical' 
  AND is_active = TRUE
ORDER BY created_at DESC
LIMIT 2;
```

## When Critical Alerts Appear

The Critical Alerts section will appear when:

1. ✅ At least 1 alert exists in the database
2. ✅ Alert has `severity = 'critical'`
3. ✅ Alert has `is_active = TRUE`
4. ✅ User has internet connection (to fetch alerts)

## When Critical Alerts DON'T Appear

The section is hidden when:

1. ❌ No alerts in database
2. ❌ All alerts have severity 'info' or 'warning' (none are 'critical')
3. ❌ All critical alerts have `is_active = FALSE`
4. ❌ User is offline and no cached critical alerts exist

## Auto-Refresh

**File**: `mobile/src/store/AlertContext.tsx` (Line 44)

```typescript
const interval = setInterval(() => {
  refreshAlerts();
}, REFRESH_INTERVALS.ALERTS);
```

Alerts are automatically refreshed every X seconds (defined in config) to ensure users see the latest critical alerts.

## UI Appearance

When critical alerts exist:
- **Red banner** with warning icon
- **"CRITICAL ALERTS"** header in white text
- **Up to 2 alerts** displayed
- Each alert shows:
  - Alert title
  - Alert type (TYPHOON, EARTHQUAKE, etc.)
- Tapping opens the full Alerts screen

## Testing

### To Test Critical Alerts Display:

1. **Create a critical alert** in the web admin:
   - Go to http://localhost:3000/alerts/create
   - Set Severity: "Critical"
   - Set Status: "Active"
   - Save

2. **Open mobile app**:
   - Pull down to refresh home screen
   - Critical Alerts section should appear at top
   - Should show red banner with alert

3. **Verify filtering**:
   - Create alerts with severity "info" or "warning"
   - These should NOT appear in Critical Alerts section
   - They should only appear in "Active Alerts" count

### To Test Critical Alerts Hidden:

1. **Deactivate all critical alerts**:
   - Set `is_active = FALSE` for all critical alerts
   - Or delete all critical alerts

2. **Open mobile app**:
   - Pull down to refresh
   - Critical Alerts section should be hidden
   - Only "Active Alerts" and "Nearest Center" cards visible

## Summary

**Simple Answer**: 
The Critical Alerts section shows alerts from the database where:
- `severity = 'critical'` 
- `is_active = TRUE`
- Maximum 2 alerts displayed
- Section is hidden if no critical alerts exist

**Purpose**: To immediately notify users of life-threatening emergencies that require urgent action (evacuations, severe weather, etc.)
