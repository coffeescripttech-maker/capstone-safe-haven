# Alert Automation - Quick Start Guide 🚀

## Overview
This guide will help you quickly test the Smart Alert Automation system that automatically monitors weather and earthquake data and creates alerts for admin approval.

## Prerequisites

✅ Backend server running (`npm run dev` in backend folder)
✅ Frontend server running (`npm run dev` in web_app folder)
✅ Database schema applied (see Setup below)
✅ Admin account with valid token

## Setup (One-Time)

### 1. Apply Database Schema
```bash
cd backend
node apply-alert-schema.js
```

Expected output:
```
✓ Alert automation schema created successfully!
Tables created:
  - alert_rules (with 6 default rules)
  - alert_automation_logs
  - Updated disaster_alerts table
```

### 2. Restart Backend Server
```bash
cd backend
npm run dev
```

### 3. Access Admin Dashboard
Open browser: `http://localhost:3001/alert-automation`

## Quick Test Flow

### Test 1: Manual Monitoring Trigger

1. **Navigate to Alert Automation**
   - Login as admin
   - Click "Alert Automation" in sidebar
   - You should see the main dashboard

2. **Trigger Monitoring**
   - Click "Trigger Monitoring" button
   - Wait for response (5-10 seconds)
   - Alert shows: "Monitoring complete! Weather: X, Earthquakes: Y"

3. **Check Results**
   - If alerts were created, they appear in "Pending Alerts" section
   - Each alert shows:
     - Source icon (🌦️ weather or 🌍 earthquake)
     - Title and description
     - Severity badge
     - Trigger data (temperature, magnitude, etc.)
     - Users targeted count

### Test 2: Approve Alert

1. **Review Alert Details**
   - Read the alert title and description
   - Check trigger data (weather conditions or earthquake info)
   - Note the number of users targeted

2. **Approve Alert**
   - Click green "Approve" button
   - Alert disappears from pending list
   - Stats update (Approved Today +1)
   - Push notifications sent to targeted users

3. **Verify in Logs**
   - Click "View Logs" button
   - Find the approved alert in logs
   - Status should be "Approved"
   - Users notified count should match targeted count

### Test 3: Reject Alert

1. **Review Alert**
   - Look at another pending alert
   - Decide it's not necessary

2. **Reject Alert**
   - Click red "Reject" button
   - Enter rejection reason (optional)
   - Alert disappears from pending list
   - Stats update (Rejected Today +1)

3. **Verify in Logs**
   - Check logs page
   - Find the rejected alert
   - Status should be "Rejected"
   - Reason should be displayed

### Test 4: View Automation Logs

1. **Navigate to Logs**
   - Click "View Logs" button from dashboard
   - Or navigate to `/alert-automation/logs`

2. **Explore Logs**
   - See all automation events
   - Click stats cards to filter by status
   - Expand "View trigger data" to see raw data
   - Click "View Alert" to see related alert

3. **Filter Logs**
   - Click "Created" stat card → Shows only created events
   - Click "Approved" stat card → Shows only approved events
   - Click "Skipped" stat card → Shows skipped events
   - Click "Clear filter" to see all

### Test 5: Manage Rules

1. **Navigate to Rules**
   - Click "Manage Rules" button from dashboard
   - Or navigate to `/alert-automation/rules`

2. **View Rules**
   - See all 6 default rules
   - Filter by type: All, Weather, Earthquake
   - Each rule shows:
     - Trigger conditions
     - Alert template
     - Active/Inactive status

3. **Disable a Rule**
   - Click the green power icon on any rule
   - Icon turns gray (PowerOff)
   - Rule is now inactive
   - Won't trigger new alerts

4. **Enable a Rule**
   - Click the gray power icon
   - Icon turns green (Power)
   - Rule is now active
   - Will trigger alerts when conditions met

5. **Delete a Rule**
   - Click trash icon
   - Confirm deletion
   - Rule is removed from list

## Default Rules

### Weather Rules
1. **Heavy Rain Warning**
   - Trigger: Precipitation > 50mm
   - Severity: Warning
   - Type: Flood

2. **Extreme Heat Advisory**
   - Trigger: Temperature > 38°C
   - Severity: Warning
   - Type: Heat Wave

3. **Strong Wind Warning**
   - Trigger: Wind Speed > 60km/h
   - Severity: Warning
   - Type: Storm

### Earthquake Rules
4. **Moderate Earthquake Alert**
   - Trigger: M5.0-5.9
   - Severity: Warning
   - Radius: 100km

5. **Strong Earthquake Alert**
   - Trigger: M6.0-6.9
   - Severity: Critical
   - Radius: 200km

6. **Major Earthquake Alert**
   - Trigger: M7.0+
   - Severity: Critical
   - Radius: 300km

## API Testing (Optional)

### Using PowerShell

```powershell
# Set your admin token
$env:ADMIN_TOKEN = "your_admin_token_here"

# Get pending alerts
$headers = @{ "Authorization" = "Bearer $env:ADMIN_TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/pending" -Headers $headers

# Trigger monitoring
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/trigger" -Method POST -Headers $headers

# Get logs
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/logs" -Headers $headers

# Get rules
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/rules" -Headers $headers
```

## Expected Behavior

### When Monitoring Runs

1. **Weather Check**
   - Fetches current weather for 6 Philippine cities
   - Evaluates against 3 weather rules
   - Creates alert if threshold exceeded
   - Skips if similar alert exists (last hour)

2. **Earthquake Check**
   - Fetches recent earthquakes from USGS (last 24h, M4+)
   - Evaluates against 3 earthquake rules
   - Creates alert if magnitude threshold exceeded
   - Skips if alert for same earthquake exists

3. **Alert Creation**
   - Alert created with status "pending approval"
   - Users targeted based on location
   - Log entry created with status "created"
   - Appears in admin dashboard

4. **Duplicate Prevention**
   - Weather: Checks last hour for same city
   - Earthquake: Checks for same earthquake ID
   - If duplicate found, logs "skipped" status

### When Alert Approved

1. **Notification Sending**
   - Finds all targeted users
   - Filters by notification preferences
   - Sends push notifications via Firebase
   - Batch processing (500 users per batch)

2. **Status Updates**
   - Alert marked as approved
   - Log status changed to "approved"
   - Users notified count updated
   - Stats updated in dashboard

### When Alert Rejected

1. **Status Updates**
   - Alert marked as inactive
   - Log status changed to "rejected"
   - Reason recorded in log
   - Stats updated in dashboard

2. **No Notifications**
   - Users are NOT notified
   - Alert is hidden from public view
   - Remains in logs for audit

## Troubleshooting

### No Pending Alerts After Trigger

**Possible Reasons:**
1. No weather/earthquake conditions met thresholds
2. Similar alerts already exist (duplicate prevention)
3. All rules are disabled

**Solutions:**
- Check logs for "skipped" events
- Lower rule thresholds temporarily
- Enable all rules
- Wait for actual weather/earthquake events

### Monitoring Trigger Fails

**Possible Reasons:**
1. Backend server not running
2. External APIs (Open-Meteo, USGS) down
3. Network connectivity issues

**Solutions:**
- Check backend console for errors
- Verify internet connection
- Try again in a few minutes
- Check API status pages

### Approve/Reject Not Working

**Possible Reasons:**
1. Not logged in as admin
2. Token expired
3. Database connection issue

**Solutions:**
- Re-login as admin
- Check browser console for errors
- Verify backend is running
- Check database connection

### Push Notifications Not Sent

**Possible Reasons:**
1. Firebase not configured
2. Users don't have FCM tokens
3. Notification preferences disabled

**Solutions:**
- Check Firebase Admin SDK setup
- Verify users have registered FCM tokens
- Check user notification preferences
- Look for errors in backend console

## Monitoring Schedule (Future)

To run monitoring automatically every 5 minutes:

### Option 1: Node-Cron
```javascript
// backend/src/server.ts
const cron = require('node-cron');
const { alertAutomationService } = require('./services/alertAutomation.service');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled monitoring...');
  await alertAutomationService.monitorAndCreateAlerts();
});
```

### Option 2: Bull Queue
```javascript
// backend/src/queues/monitoring.queue.ts
const Queue = require('bull');
const monitoringQueue = new Queue('monitoring');

monitoringQueue.process(async (job) => {
  await alertAutomationService.monitorAndCreateAlerts();
});

// Add recurring job
monitoringQueue.add({}, {
  repeat: { cron: '*/5 * * * *' }
});
```

## Success Indicators

✅ Database schema applied without errors
✅ Admin dashboard loads successfully
✅ Manual trigger creates alerts (if conditions met)
✅ Approve button sends notifications
✅ Reject button updates status
✅ Logs show all events
✅ Rules can be toggled and deleted
✅ Stats update in real-time

## Next Steps

1. **Test with Real Data**
   - Wait for actual weather events
   - Monitor for earthquakes
   - Verify alert accuracy

2. **Set Up Scheduled Monitoring**
   - Choose cron or Bull queue
   - Set 5-minute interval
   - Monitor for errors

3. **Add User Location Data**
   - Update users table schema
   - Collect location on registration
   - Enable radius-based targeting

4. **Customize Rules**
   - Adjust thresholds based on testing
   - Add new rules for specific scenarios
   - Fine-tune alert templates

## Support

If you encounter issues:
1. Check backend console for errors
2. Check browser console for errors
3. Review logs in `/alert-automation/logs`
4. Verify database schema is applied
5. Ensure all services are running

---

**Happy Testing! 🎉**

The Smart Alert Automation system is designed to reduce admin workload and improve response times. With automatic monitoring and intelligent targeting, your users will receive timely alerts when they need them most.
