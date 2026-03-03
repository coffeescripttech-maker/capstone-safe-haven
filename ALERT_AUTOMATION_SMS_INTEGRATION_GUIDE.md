# Alert Automation SMS Integration Guide

## Current State Analysis

### What Happens When You Approve an Alert?

When you click "Approve" on an alert in the Alert Automation page (`/alert-automation`):

1. **Frontend** calls: `POST /api/v1/admin/alert-automation/alerts/{id}/approve`
2. **Controller** (`alertAutomation.controller.ts`) calls: `alertAutomationService.approveAlert()`
3. **Service** (`alertAutomation.service.ts`) does:
   - Updates alert status to approved
   - Calls `alertTargetingService.sendNotificationsForAlert(alertId)`
4. **Alert Targeting** (`alertTargeting.service.ts`) does:
   - Finds users based on location (city or radius)
   - Sends **PUSH NOTIFICATIONS ONLY** via Firebase Cloud Messaging (FCM)
   - **DOES NOT SEND SMS** ❌

### Current Notification Flow

```
Approve Alert
    ↓
Update Database (status = approved)
    ↓
Find Target Users (by city or radius)
    ↓
Send Push Notifications (FCM) ✅
    ↓
SMS NOT SENT ❌
```

## Problem

**SMS messages are NOT automatically sent when an alert is approved.**

The system only sends push notifications to mobile app users. Users who:
- Don't have the mobile app installed
- Have disabled push notifications
- Have poor internet connection
- Are in areas with no data coverage

...will NOT receive any notification.

## Solution: Integrate SMS Blast

To send SMS when an alert is approved, we need to integrate the SMS Blast system with the Alert Automation system.

### Option 1: Automatic SMS on Approval (Recommended)

Modify `alertAutomationService.approveAlert()` to automatically send SMS after approval.

**Implementation**:

```typescript
// In alertAutomation.service.ts

import { IProgAPIClient } from './iProgAPIClient.service';
import { v4 as uuidv4 } from 'uuid';

const iProgClient = new IProgAPIClient();

async approveAlert(alertId: number, adminId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Update alert status
    await connection.query(
      `UPDATE disaster_alerts 
       SET auto_approved = 1, approved_by = ?, approved_at = NOW()
       WHERE id = ? AND source IN ('auto_weather', 'auto_earthquake')`,
      [adminId, alertId]
    );
    
    // 2. Update log
    await connection.query(
      `UPDATE alert_automation_logs 
       SET status = 'approved'
       WHERE alert_id = ?`,
      [alertId]
    );
    
    // 3. Get alert details
    const [alerts] = await connection.query<any[]>(
      `SELECT * FROM disaster_alerts WHERE id = ?`,
      [alertId]
    );
    
    if (alerts.length === 0) {
      throw new Error('Alert not found');
    }
    
    const alert = alerts[0];
    
    // 4. Find target users with phone numbers
    let targetUsers: any[] = [];
    
    if (alert.source === 'auto_weather' && alert.affected_areas) {
      const affectedAreas = JSON.parse(alert.affected_areas);
      const [users] = await connection.query<any[]>(
        `SELECT id, phone_number, first_name, last_name, city
         FROM users 
         WHERE city IN (?) 
         AND phone_number IS NOT NULL 
         AND phone_number != ''`,
        [affectedAreas]
      );
      targetUsers = users;
    } else if (alert.source === 'auto_earthquake' && alert.latitude && alert.longitude) {
      const [users] = await connection.query<any[]>(
        `SELECT 
          id, phone_number, first_name, last_name,
          (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
           cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
           sin(radians(latitude)))) AS distance
         FROM users
         WHERE phone_number IS NOT NULL 
         AND phone_number != ''
         AND latitude IS NOT NULL
         AND longitude IS NOT NULL
         HAVING distance <= ?`,
        [alert.latitude, alert.longitude, alert.latitude, alert.radius_km]
      );
      targetUsers = users;
    }
    
    console.log(`[Alert Automation] Found ${targetUsers.length} users with phone numbers`);
    
    // 5. Send SMS if there are target users
    if (targetUsers.length > 0) {
      const blastId = uuidv4();
      const message = `${alert.title}\n\n${alert.description}\n\nStay safe! - SafeHaven`;
      
      // Create SMS blast record
      await connection.query(
        `INSERT INTO sms_blasts (
          id, user_id, message, template_id, language,
          recipient_count, estimated_cost, status, created_at
        ) VALUES (?, ?, ?, NULL, 'en', ?, ?, 'processing', NOW())`,
        [blastId, adminId, message, targetUsers.length, targetUsers.length]
      );
      
      // Send SMS via bulk API
      const messages = targetUsers.map(user => ({
        phoneNumber: user.phone_number,
        message: message
      }));
      
      try {
        const bulkResult = await iProgClient.sendBulkSMS(messages);
        
        let sentCount = 0;
        let failedCount = 0;
        
        bulkResult.results.forEach(result => {
          if (result.success) sentCount++;
          else failedCount++;
        });
        
        // Update blast status
        await connection.query(
          `UPDATE sms_blasts 
           SET status = ?, actual_cost = ?, completed_at = NOW() 
           WHERE id = ?`,
          [sentCount > 0 ? 'completed' : 'failed', bulkResult.totalCreditsUsed, blastId]
        );
        
        console.log(`[Alert Automation] SMS sent: ${sentCount} success, ${failedCount} failed`);
      } catch (smsError) {
        console.error('[Alert Automation] SMS sending failed:', smsError);
        // Don't fail the approval if SMS fails
      }
    }
    
    // 6. Send push notifications
    await alertTargetingService.sendNotificationsForAlert(alertId);
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

### Option 2: Manual SMS After Approval

Keep approval separate from SMS sending. Admin approves alert, then manually sends SMS from SMS Blast page.

**Pros**:
- More control over SMS content
- Can review before sending
- Can choose specific recipients

**Cons**:
- Extra step required
- Slower response time
- May forget to send SMS

### Option 3: Prompt for SMS on Approval

Show a dialog when approving asking "Send SMS to affected users?"

**Implementation**:
- Frontend shows confirmation dialog
- If "Yes", call both approve and SMS endpoints
- If "No", only approve (push notifications only)

## Recommended Implementation Steps

### Step 1: Add SMS Sending to Approval

1. Update `alertAutomation.service.ts` with SMS integration (see Option 1 code above)
2. Import required services:
   ```typescript
   import { IProgAPIClient } from './iProgAPIClient.service';
   import { v4 as uuidv4 } from 'uuid';
   ```

### Step 2: Test the Integration

1. Create a test alert rule
2. Trigger monitoring to generate an alert
3. Approve the alert
4. Verify:
   - Push notifications sent ✅
   - SMS messages sent ✅
   - SMS blast record created ✅
   - Credits deducted ✅

### Step 3: Add SMS Toggle (Optional)

Add a checkbox in the approval dialog:
```typescript
// In alert-automation page
const [sendSMS, setSendSMS] = useState(true);

// Pass to approval API
await api.post(`/admin/alert-automation/alerts/${alertId}/approve`, {
  sendSMS: sendSMS
});
```

## Alert Data Structure

From your API response:
```json
{
  "id": 11,
  "alert_type": "earthquake",
  "title": "Earthquake Alert - M5.3",
  "description": "Moderate earthquake detected in your area...",
  "source": "auto_earthquake",
  "affected_areas": ["32 km WSW of Sangay, Philippines"],
  "latitude": "6.38710000",
  "longitude": "123.75790000",
  "radius_km": 100,
  "status": "approved"
}
```

### SMS Message Format

**For Earthquake**:
```
🚨 Earthquake Alert - M5.3

Moderate earthquake detected in your area. Location: 32 km WSW of Sangay, Philippines. Depth: 10.0km.

Stay safe! - SafeHaven
```

**For Weather/Flood**:
```
⚠️ Heavy Rain Warning - Legazpi City

Heavy rainfall detected. Flooding possible in low-lying areas. Current conditions: 28.1°C, 0.1mm rain, 7.6km/h winds.

Stay safe! - SafeHaven
```

## User Targeting Logic

### Weather Alerts (Flood, Typhoon)
- Target by **city** from `affected_areas`
- Query: `SELECT * FROM users WHERE city IN (affected_areas) AND phone_number IS NOT NULL`

### Earthquake Alerts
- Target by **radius** from epicenter
- Query: `SELECT * FROM users WHERE distance <= radius_km AND phone_number IS NOT NULL`
- Uses Haversine formula to calculate distance

## Cost Estimation

- **1 SMS = 1 credit** (iProg pricing)
- **Earthquake M5.3, 100km radius**: ~500-1000 users = 500-1000 credits
- **Flood warning, 1 city**: ~100-500 users = 100-500 credits

## Benefits of SMS Integration

1. **Wider Reach**: Users without app still get notified
2. **Reliability**: SMS works without internet
3. **Immediate**: No need to open app
4. **Critical**: For life-threatening emergencies
5. **Compliance**: Government may require SMS for disasters

## Testing Checklist

- [ ] Approve earthquake alert → SMS sent to users within radius
- [ ] Approve weather alert → SMS sent to users in affected cities
- [ ] Check SMS blast history shows the alert
- [ ] Verify credits deducted correctly
- [ ] Test with 2-3 test users first
- [ ] Check SMS message format is clear
- [ ] Verify no duplicate SMS sent
- [ ] Test rejection (no SMS sent)

## Files to Modify

1. ✅ `MOBILE_APP/backend/src/services/alertAutomation.service.ts`
   - Add SMS sending to `approveAlert()` method

2. ⚠️ `MOBILE_APP/web_app/src/app/(admin)/alert-automation/page.tsx` (Optional)
   - Add SMS toggle checkbox
   - Show SMS count in approval confirmation

3. ⚠️ `MOBILE_APP/backend/src/controllers/alertAutomation.controller.ts` (Optional)
   - Accept `sendSMS` parameter

## Summary

**Current**: Approve alert → Push notifications only ✅
**Needed**: Approve alert → Push notifications ✅ + SMS ✅

The integration is straightforward - just add SMS sending logic to the `approveAlert()` method using the existing SMS blast infrastructure. This ensures users in affected areas receive critical alerts even without the mobile app.
