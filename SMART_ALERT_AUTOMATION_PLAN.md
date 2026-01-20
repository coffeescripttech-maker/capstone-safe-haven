# Smart Alert Automation - Integration Plan

## Overview
Connect environmental monitoring (weather + earthquakes) with the alert management system to automatically create and send alerts to mobile app users based on real-time data.

## Current System Status

### ✅ What We Have
1. **Environmental Monitoring**
   - Real-time weather data (6 PH cities)
   - Real-time earthquake data (USGS)
   - Admin dashboard with visualizations

2. **Alert Management System**
   - Admin can create disaster alerts
   - Alerts stored in `disaster_alerts` table
   - Push notifications to mobile users
   - Mobile app displays alerts

3. **Mobile App**
   - Users receive push notifications
   - View alerts in AlertsListScreen
   - Location-based filtering
   - Offline support

### 🎯 What We'll Build
**Intelligent Alert Automation System** that:
- Monitors weather/earthquake data continuously
- Automatically creates alerts when thresholds are exceeded
- Sends targeted push notifications to affected users
- Provides admin oversight and manual override

## Use Cases

### Use Case 1: Severe Weather Alert
**Scenario**: Heavy rain detected in Manila (>50mm precipitation)
**Action**:
1. System detects high precipitation
2. Auto-creates "Heavy Rain Warning" alert
3. Sends push notification to users in Manila area
4. Alert appears in mobile app
5. Admin can review/modify/cancel

### Use Case 2: Earthquake Alert
**Scenario**: M5.5 earthquake detected near Cebu
**Action**:
1. System detects significant earthquake
2. Auto-creates "Earthquake Alert" with magnitude and location
3. Sends push notification to users within 100km radius
4. Provides safety instructions
5. Links to evacuation centers

### Use Case 3: Typhoon Warning
**Scenario**: Multiple cities show extreme weather conditions
**Action**:
1. System detects pattern across cities
2. Auto-creates "Typhoon Warning" alert
3. Sends nationwide push notification
4. Provides preparedness guide links
5. Updates evacuation center status

## Architecture

### Components to Build

#### 1. Alert Rules Engine (Backend)
**File**: `backend/src/services/alertRules.service.ts`
- Define thresholds for auto-alerts
- Evaluate weather/earthquake data
- Determine alert severity
- Calculate affected areas

#### 2. Alert Automation Service (Backend)
**File**: `backend/src/services/alertAutomation.service.ts`
- Scheduled job (runs every 5 minutes)
- Fetches latest environmental data
- Evaluates against rules
- Creates alerts automatically
- Triggers push notifications

#### 3. Alert Targeting Service (Backend)
**File**: `backend/src/services/alertTargeting.service.ts`
- Find users in affected areas
- Filter by user location/city
- Calculate distance from epicenter
- Batch send push notifications

#### 4. Admin Alert Review UI (Web App)
**File**: `web_app/src/app/(admin)/alert-automation/page.tsx`
- View auto-generated alerts
- Approve/reject/modify alerts
- Configure alert rules
- View automation logs
- Manual override controls

#### 5. Enhanced Mobile Alerts (Mobile App)
**Updates**: Existing alert screens
- Show alert source (auto vs manual)
- Display environmental data
- Link to monitoring data
- Action buttons (I'm safe, Need help)

## Alert Rules Configuration

### Weather-Based Rules

```typescript
const weatherRules = {
  heavyRain: {
    threshold: { precipitation: 50 }, // mm
    severity: 'warning',
    title: 'Heavy Rain Warning',
    description: 'Heavy rainfall detected. Flooding possible.',
    actionRequired: 'Stay indoors, avoid low-lying areas'
  },
  extremeHeat: {
    threshold: { temperature: 38 }, // °C
    severity: 'warning',
    title: 'Extreme Heat Advisory',
    description: 'Dangerously high temperatures.',
    actionRequired: 'Stay hydrated, avoid outdoor activities'
  },
  strongWinds: {
    threshold: { windSpeed: 60 }, // km/h
    severity: 'warning',
    title: 'Strong Wind Warning',
    description: 'High winds detected. Secure loose objects.',
    actionRequired: 'Stay indoors, secure outdoor items'
  }
};
```

### Earthquake-Based Rules

```typescript
const earthquakeRules = {
  moderate: {
    threshold: { magnitude: 5.0 },
    severity: 'warning',
    title: 'Earthquake Alert',
    description: 'Moderate earthquake detected.',
    actionRequired: 'Drop, Cover, Hold On. Check for damage.',
    radius: 100 // km
  },
  strong: {
    threshold: { magnitude: 6.0 },
    severity: 'critical',
    title: 'Strong Earthquake Alert',
    description: 'Strong earthquake detected. Aftershocks expected.',
    actionRequired: 'Evacuate if building damaged. Move to open area.',
    radius: 200 // km
  },
  major: {
    threshold: { magnitude: 7.0 },
    severity: 'critical',
    title: 'Major Earthquake Alert',
    description: 'Major earthquake. Tsunami possible.',
    actionRequired: 'Evacuate coastal areas immediately. Seek high ground.',
    radius: 300 // km
  }
};
```

## Implementation Phases

### Phase 1: Backend Alert Automation (2-3 days)
1. Create alert rules service
2. Create alert automation service
3. Create alert targeting service
4. Set up scheduled job (cron/bull queue)
5. Test with mock data

**Files to Create**:
- `backend/src/services/alertRules.service.ts`
- `backend/src/services/alertAutomation.service.ts`
- `backend/src/services/alertTargeting.service.ts`
- `backend/src/jobs/monitoringJob.ts`
- `backend/src/config/alertRules.ts`

### Phase 2: Admin Review Interface (1-2 days)
1. Create alert automation dashboard
2. Add rule configuration UI
3. Add approval workflow
4. Add automation logs
5. Add manual override controls

**Files to Create**:
- `web_app/src/app/(admin)/alert-automation/page.tsx`
- `web_app/src/app/(admin)/alert-automation/rules/page.tsx`
- `web_app/src/app/(admin)/alert-automation/logs/page.tsx`

### Phase 3: Enhanced Mobile Experience (1 day)
1. Update alert cards to show source
2. Add environmental data display
3. Add "I'm Safe" button
4. Add "Need Help" button
5. Link to relevant guides

**Files to Update**:
- `mobile/src/components/alerts/AlertCard.tsx`
- `mobile/src/screens/alerts/AlertDetailsScreen.tsx`

### Phase 4: Testing & Refinement (1 day)
1. Test with real weather data
2. Test with earthquake scenarios
3. Verify push notifications
4. Test user targeting
5. Refine thresholds

## Database Schema Updates

### New Table: `alert_automation_logs`
```sql
CREATE TABLE alert_automation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_type ENUM('weather', 'earthquake') NOT NULL,
  trigger_data JSON NOT NULL,
  rule_matched VARCHAR(100) NOT NULL,
  alert_id INT,
  status ENUM('created', 'skipped', 'error') NOT NULL,
  reason TEXT,
  users_notified INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES disaster_alerts(id)
);
```

### New Table: `alert_rules`
```sql
CREATE TABLE alert_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('weather', 'earthquake') NOT NULL,
  conditions JSON NOT NULL,
  alert_template JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Update: `disaster_alerts` table
```sql
ALTER TABLE disaster_alerts 
ADD COLUMN source ENUM('manual', 'auto_weather', 'auto_earthquake') DEFAULT 'manual',
ADD COLUMN source_data JSON,
ADD COLUMN auto_approved BOOLEAN DEFAULT FALSE;
```

## User Targeting Strategy

### Location-Based Targeting

```typescript
// For weather alerts
const targetUsers = await getUsersByCity(affectedCity);

// For earthquake alerts
const targetUsers = await getUsersWithinRadius(
  epicenterLat,
  epicenterLon,
  radiusKm
);

// For nationwide alerts
const targetUsers = await getAllActiveUsers();
```

### Smart Filtering
- Only send to users who haven't received similar alert in last hour
- Respect user notification preferences
- Consider user's last known location
- Batch notifications to avoid overwhelming users

## Admin Controls

### Alert Automation Dashboard
- **Auto-Generated Alerts**: List of alerts created by system
- **Pending Approval**: Alerts waiting for admin review
- **Active Rules**: Current automation rules
- **Automation Logs**: History of all automation events
- **Statistics**: Success rate, users notified, false positives

### Rule Management
- **Create Rule**: Define new automation rule
- **Edit Rule**: Modify thresholds and templates
- **Enable/Disable**: Turn rules on/off
- **Test Rule**: Simulate with sample data
- **Delete Rule**: Remove rule

### Manual Override
- **Approve**: Send auto-generated alert
- **Modify**: Edit before sending
- **Reject**: Cancel auto-generated alert
- **Escalate**: Upgrade severity
- **Broadcast**: Send to all users

## Push Notification Strategy

### Notification Priority
1. **Critical** (M6+ earthquake, typhoon): Immediate, bypass DND
2. **High** (M5+ earthquake, severe weather): Immediate
3. **Medium** (M4+ earthquake, warnings): Normal priority
4. **Low** (advisories): Can be delayed

### Notification Content
```typescript
{
  title: "🌧️ Heavy Rain Warning - Manila",
  body: "Heavy rainfall detected. Flooding possible in low-lying areas.",
  data: {
    alertId: 123,
    type: "weather",
    severity: "warning",
    source: "auto_weather",
    actionRequired: "Stay indoors, avoid travel"
  }
}
```

## Benefits

### For Users
✅ **Faster Alerts**: Automatic detection and notification
✅ **Location-Specific**: Only relevant alerts
✅ **Actionable Info**: Clear instructions
✅ **Real-Time**: Based on live data
✅ **Comprehensive**: Weather + earthquakes

### For Admins
✅ **Reduced Workload**: Automation handles routine alerts
✅ **Better Coverage**: Never miss an event
✅ **Data-Driven**: Based on real environmental data
✅ **Oversight**: Review and approve before sending
✅ **Analytics**: Track effectiveness

### For LGU
✅ **Proactive**: Early warning system
✅ **Reliable**: Based on official data sources
✅ **Scalable**: Handles many users
✅ **Auditable**: Complete logs
✅ **Cost-Effective**: Free data sources

## Success Metrics

### Technical Metrics
- Alert creation latency < 1 minute
- Notification delivery rate > 95%
- False positive rate < 5%
- System uptime > 99%

### User Metrics
- User engagement with alerts
- "I'm Safe" response rate
- Alert acknowledgment time
- User feedback ratings

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create spec** - Formal requirements document
3. **Implement Phase 1** - Backend automation
4. **Test thoroughly** - Ensure reliability
5. **Deploy gradually** - Start with one rule
6. **Monitor & refine** - Adjust thresholds

## Questions to Consider

1. **Approval Workflow**: Should all auto-alerts require admin approval first?
2. **Notification Frequency**: Max alerts per user per day?
3. **Threshold Values**: Are the suggested thresholds appropriate for PH?
4. **False Positives**: How to handle and learn from them?
5. **User Preferences**: Let users customize alert types?

Would you like me to proceed with creating a formal spec for this feature?
