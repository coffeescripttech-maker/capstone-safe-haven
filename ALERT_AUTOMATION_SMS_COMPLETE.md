# Alert Automation SMS Integration - COMPLETE ✅

## Overview
Successfully integrated automatic SMS sending when alerts are approved in the Alert Automation system. Now when an admin approves an alert, the system will:
1. Send push notifications (existing)
2. Send SMS to affected users (NEW) ✅

## What Was Implemented

### Automatic SMS on Alert Approval

When you click "Approve" on an alert in `/alert-automation`:

**Before**:
- ✅ Push notifications sent via Firebase
- ❌ No SMS sent

**After**:
- ✅ Push notifications sent via Firebase
- ✅ SMS sent to users in affected area via iProg bulk API

## User Targeting Logic

### Weather Alerts (Flood, Typhoon, Storm)
**Target**: Users by city from `user_profiles` table

**Query**:
```sql
SELECT u.id, u.phone, u.first_name, u.last_name, up.city
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE up.city IN ('Legazpi City', 'Naga City')  -- from affected_areas
AND u.phone IS NOT NULL 
AND u.phone != '';
```

**Example**:
- Alert: "Heavy Rain Warning - Legazpi City"
- Affected Areas: `["Legazpi City"]`
- Targets: All users with `city = 'Legazpi City'` in their profile

### Earthquake Alerts
**Target**: Users by radius from epicenter using GPS coordinates

**Query**:
```sql
SELECT 
  u.id, u.phone, u.first_name, u.last_name,
  (6371 * acos(cos(radians(6.3871)) * cos(radians(up.latitude)) * 
   cos(radians(up.longitude) - radians(123.7579)) + 
   sin(radians(6.3871)) * sin(radians(up.latitude)))) AS distance
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.phone IS NOT NULL 
AND u.phone != ''
AND up.latitude IS NOT NULL
AND up.longitude IS NOT NULL
HAVING distance <= 100;  -- radius_km from alert
```

**Example**:
- Alert: "Earthquake Alert - M5.3"
- Epicenter: (6.3871, 123.7579)
- Radius: 100km
- Targets: All users within 100km of epicenter

## SMS Message Format

### Earthquake Alert
```
🚨 Earthquake Alert - M5.3

Moderate earthquake detected in your area. Location: 32 km WSW of Sangay, Philippines. Depth: 10.0km.

Stay safe! - SafeHaven
```

### Weather/Flood Alert
```
⚠️ Heavy Rain Warning - Legazpi City

Heavy rainfall detected. Flooding possible in low-lying areas. Current conditions: 28.1°C, 0.1mm rain, 7.6km/h winds.

Stay safe! - SafeHaven
```

### Severity Emojis
- **Critical**: 🚨
- **High**: ⚠️
- **Moderate**: ⚡
- **Low**: ℹ️

## Implementation Details

### File Modified
`MOBILE_APP/backend/src/services/alertAutomation.service.ts`

### Changes Made

1. **Added SMS Integration to `approveAlert()` method**
   - Queries users with phone numbers in affected area
   - Creates SMS blast record
   - Sends SMS via iProg bulk API
   - Updates blast status with results

2. **Transaction Safety**
   - Uses database transactions
   - Rolls back on error
   - SMS failure doesn't block approval

3. **Logging**
   - Logs SMS sending results
   - Shows count of users targeted
   - Shows credits used

### Code Flow

```
Admin Clicks "Approve"
    ↓
Update alert status (approved)
    ↓
Get alert details (title, description, location)
    ↓
Find target users with phone numbers
    ├─ Weather: Query by city
    └─ Earthquake: Query by radius
    ↓
Create SMS blast record
    ↓
Send SMS via iProg bulk API
    ↓
Update blast status (completed/failed)
    ↓
Send push notifications (existing)
    ↓
Commit transaction
```

## Testing Guide

### Step 1: Verify Users Have Location Data

Check if users have location data in profiles:
```sql
-- Check users with city (for weather alerts)
SELECT u.id, u.phone, u.first_name, up.city, up.province
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.phone IS NOT NULL
AND up.city IS NOT NULL;

-- Check users with GPS coordinates (for earthquake alerts)
SELECT u.id, u.phone, u.first_name, up.latitude, up.longitude
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.phone IS NOT NULL
AND up.latitude IS NOT NULL
AND up.longitude IS NOT NULL;
```

### Step 2: Create Test Alert

**Option A: Trigger Monitoring**
1. Go to `/alert-automation`
2. Click "Trigger Monitoring" button
3. System checks weather/earthquake APIs
4. Creates alerts if conditions match rules

**Option B: Wait for Scheduled Job**
- System automatically checks every 15 minutes
- Creates alerts when conditions match

### Step 3: Approve Alert

1. Go to `/alert-automation`
2. See pending alerts list
3. Click "Approve" on an alert
4. System will:
   - Find users in affected area
   - Send SMS to all users with phone numbers
   - Send push notifications
   - Show success message

### Step 4: Verify SMS Sent

**Check SMS Blast History**:
1. Go to `/sms-blast`
2. See the alert SMS in history
3. Check recipient count
4. Check delivery status

**Check Backend Logs**:
```
[Alert Automation] Found X users with phone numbers for SMS
[Alert Automation] SMS sent: X success, 0 failed, X credits used
```

**Check Database**:
```sql
-- Check SMS blast record
SELECT * FROM sms_blasts 
WHERE message LIKE '%Earthquake Alert%' 
OR message LIKE '%Heavy Rain Warning%'
ORDER BY created_at DESC 
LIMIT 5;

-- Check actual cost
SELECT id, message, recipient_count, actual_cost, status, created_at
FROM sms_blasts
ORDER BY created_at DESC
LIMIT 10;
```

### Step 5: Verify Users Received SMS

Check your test phone numbers for SMS messages.

## Cost Estimation

### Weather Alert Example
- **Alert**: Heavy Rain Warning - Legazpi City
- **Affected Area**: Legazpi City
- **Users in City**: ~200 users
- **Cost**: 200 credits (1 credit per SMS)

### Earthquake Alert Example
- **Alert**: Earthquake M5.3
- **Radius**: 100km
- **Users in Radius**: ~500 users
- **Cost**: 500 credits (1 credit per SMS)

### Monthly Estimate
- **10 weather alerts/month**: ~2,000 credits
- **5 earthquake alerts/month**: ~2,500 credits
- **Total**: ~4,500 credits/month
- **Cost**: ₱4,500/month (assuming ₱1 per credit)

## Error Handling

### SMS Sending Fails
- Alert approval still succeeds ✅
- Push notifications still sent ✅
- SMS blast marked as "failed"
- Error logged to console
- Admin can manually resend from SMS Blast page

### No Users Found
- Alert approval succeeds ✅
- Push notifications sent ✅
- Log: "No users with phone numbers found for SMS"
- No SMS blast record created

### Database Error
- Transaction rolled back
- Alert not approved
- No SMS sent
- Error returned to admin

## Benefits

### 1. Wider Reach
- Users without mobile app still get notified
- Users with disabled push notifications get SMS
- Users with poor internet get SMS

### 2. Reliability
- SMS works without internet connection
- SMS works on basic phones
- SMS delivery is more reliable

### 3. Speed
- Bulk API sends to all users at once
- Much faster than individual sends
- Critical for emergency situations

### 4. Compliance
- Government may require SMS for disasters
- Meets emergency notification standards
- Provides audit trail

### 5. Integration
- Seamless with existing alert system
- Uses existing SMS blast infrastructure
- No additional setup required

## Monitoring

### Check SMS Sending Status

**Backend Logs**:
```bash
# Watch logs for SMS sending
tail -f MOBILE_APP/backend/logs/combined.log | grep "Alert Automation"
```

**Database Queries**:
```sql
-- Recent SMS blasts from alerts
SELECT 
  sb.id,
  sb.message,
  sb.recipient_count,
  sb.actual_cost,
  sb.status,
  sb.created_at
FROM sms_blasts sb
WHERE sb.message LIKE '%Stay safe! - SafeHaven%'
ORDER BY sb.created_at DESC
LIMIT 10;

-- Alert approval history
SELECT 
  da.id,
  da.title,
  da.alert_type,
  da.severity,
  da.approved_at,
  da.approved_by
FROM disaster_alerts da
WHERE da.source IN ('auto_weather', 'auto_earthquake')
AND da.auto_approved = 1
ORDER BY da.approved_at DESC
LIMIT 10;
```

### Monitor Credits Usage

Check iProg dashboard: https://sms.iprogtech.com/

## Troubleshooting

### Issue: No SMS sent after approval
**Check**:
1. Do users have phone numbers? `SELECT COUNT(*) FROM users WHERE phone IS NOT NULL`
2. Do users have location data? Check `user_profiles` table
3. Check backend logs for errors
4. Check SMS blast history for failed records

### Issue: SMS sent to wrong users
**Check**:
1. Alert `affected_areas` field - should match user cities
2. Alert `latitude`, `longitude`, `radius_km` - should cover correct area
3. User profile location data - should be accurate

### Issue: SMS sending failed
**Check**:
1. iProg API key valid? Check `.env` file
2. Sufficient credits? Check iProg dashboard
3. Network connectivity? Test API manually
4. Phone number format? Should be 639XXXXXXXXX

## Files Modified

1. ✅ `MOBILE_APP/backend/src/services/alertAutomation.service.ts`
   - Updated `approveAlert()` method
   - Added SMS sending logic
   - Added user targeting queries
   - Added transaction handling

## Summary

✅ SMS automatically sent when alert approved
✅ Users targeted by location (city or radius)
✅ Bulk API used for fast delivery
✅ SMS blast record created for tracking
✅ Credits tracked accurately
✅ Error handling prevents approval failure
✅ Push notifications still sent
✅ Transaction safety implemented
✅ Logging for monitoring

The alert automation system now provides comprehensive emergency notifications through both push notifications and SMS, ensuring critical alerts reach all users in affected areas regardless of their mobile app status.
