# Test Predictive Weather Alerts - Quick Start

## Prerequisites

✅ MySQL server running
✅ Backend server running
✅ Mobile app or web portal open

---

## Step 1: Apply Database Migration

```powershell
# Start MySQL if not running
# Then apply migration:

cd MOBILE_APP/backend
node apply-forecast-migration.js
```

Expected output:
```
🔄 Applying Weather Forecast Migration...
✅ Connected to database
📄 Migration file loaded
📊 Executing SQL...
✅ Migration applied successfully!

Added columns:
  • advance_notice_hours (INT)
  • forecast_data (JSON)
```

---

## Step 2: Restart Backend

```powershell
cd MOBILE_APP/backend
npm run dev
```

Wait for:
```
✅ Server running on http://192.168.43.25:3001
✅ WebSocket server running
```

---

## Step 3: Trigger Forecast Monitoring

The system automatically runs every 15 minutes, but you can test immediately:

### Option A: Wait for Automatic Cycle
Just wait 15 minutes and check logs for:
```
[Alert Automation] Starting monitoring cycle...
[Forecast] Created predictive alert for Dagupan City (3h advance)
[Alert Automation] Cycle complete. Current: 0, Forecast: 1, Earthquakes: 0
```

### Option B: Manual Test (Recommended)

Create a test script:

```powershell
# Create test file
cd MOBILE_APP/backend
```

Create `test-forecast-monitoring.js`:
```javascript
const { alertAutomationService } = require('./dist/services/alertAutomation.service');

async function test() {
  console.log('🧪 Testing forecast monitoring...\n');
  
  try {
    const result = await alertAutomationService.monitorWeatherWithForecast();
    console.log(`\n✅ Test complete!`);
    console.log(`Predictive alerts created: ${result}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

test();
```

Run test:
```powershell
node test-forecast-monitoring.js
```

---

## Step 4: Check Results

### In Backend Logs:

Look for:
```
[Forecast] Analyzing forecast for Dagupan City...
[Forecast] Severe weather detected in 3 hours!
[Forecast] Created predictive alert for Dagupan City (3h advance)
[Forecast] Created alert #123 for Dagupan City, targeted 45 users
```

Or:
```
[Forecast] Analyzing forecast for Dagupan City...
[Forecast] No severe weather forecast
```

### In Database:

```sql
SELECT 
  id, 
  title, 
  severity, 
  advance_notice_hours,
  source,
  created_at
FROM disaster_alerts
WHERE advance_notice_hours IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

Expected result:
```
+-----+----------------------------------------+----------+----------------------+-------------+---------------------+
| id  | title                                  | severity | advance_notice_hours | source      | created_at          |
+-----+----------------------------------------+----------+----------------------+-------------+---------------------+
| 123 | ⚠️ Severe Weather Expected in 3 Hours | high     | 3                    | auto_weather| 2024-01-15 10:00:00 |
+-----+----------------------------------------+----------+----------------------+-------------+---------------------+
```

---

## Step 5: View in Mobile App

1. Open SafeHaven mobile app
2. Go to **Emergency Alerts** tab
3. Look for alerts with **orange badge**: "⏰ 3h advance notice"
4. Tap alert to see full details:
   - Expected time: "3:00 PM"
   - Conditions: Rainfall, wind speed, probability
   - Preparation instructions

### Expected Display:

```
┌─────────────────────────────────────┐
│ 🌀 ⚠️ Severe Weather Expected      │
│     in 3 Hours                      │
│                                     │
│ TYPHOON                    [HIGH]   │
│                                     │
│ Dagupan City will experience...    │
│                                     │
│ 📡 auto_weather    2 hours ago      │
│                                     │
│ ⏰ 3h advance notice                │ ← Orange badge
│                                     │
│ Affected: Dagupan City              │
└─────────────────────────────────────┘
```

---

## Step 6: View in Web Portal

1. Login to web portal
2. Go to **Emergency Alerts** page
3. Look for alerts with clock badge next to severity

### Expected Display:

```
| Title                              | Type    | Severity        | Source       | Location      |
|------------------------------------|---------|-----------------|--------------|---------------|
| ⚠️ Severe Weather Expected in 3h  | Typhoon | [HIGH] ⏰ 3h   | Auto Weather | Dagupan City  |
```

---

## Troubleshooting

### No Alerts Created?

**Reason**: No severe weather forecast in next 24 hours (this is good!)

**Solution**: Check forecast data manually:

```powershell
cd MOBILE_APP/backend
node -e "
const { weatherService } = require('./dist/services/weather.service');

async function check() {
  const analysis = await weatherService.analyzeForecast(16.0433, 120.3397, 'Dagupan City');
  console.log('Forecast Analysis:', analysis);
  
  if (analysis.hasSevereWeather) {
    console.log('✅ Severe weather detected!');
    console.log(\`Hours until: \${analysis.hoursUntil}\`);
    console.log(\`Severity: \${analysis.severity}\`);
  } else {
    console.log('✅ No severe weather forecast (this is good!)');
  }
}

check();
"
```

### Migration Failed?

**Error**: `ECONNREFUSED` or `Access denied`

**Solution**: 
1. Check MySQL is running
2. Verify credentials in `apply-forecast-migration.js`
3. Update password if needed:
   ```javascript
   password: 'your_mysql_password'
   ```

### Columns Already Exist?

**Error**: `Duplicate column name 'advance_notice_hours'`

**Solution**: Migration already applied! Skip to Step 2.

---

## Expected Behavior

### Scenario 1: Clear Weather
```
[Forecast] Analyzing forecast for all cities...
[Forecast] No severe weather forecast
Result: 0 alerts created ✅
```

### Scenario 2: Severe Weather in 3 Hours
```
[Forecast] Analyzing Dagupan City...
[Forecast] Severe weather detected in 3 hours!
[Forecast] Conditions: 80mm rain, 65km/h winds, 85% probability
[Forecast] Creating predictive alert...
[Forecast] Alert #123 created, targeted 45 users
Result: 1 alert created ✅
```

### Scenario 3: Recent Alert Exists
```
[Forecast] Analyzing Dagupan City...
[Forecast] Severe weather detected in 2 hours!
[Forecast] Skipped - recent alert exists within last hour
Result: 0 alerts created (prevented duplicate) ✅
```

---

## Success Criteria

✅ Database migration applied successfully
✅ Backend starts without errors
✅ Forecast monitoring runs without errors
✅ Alerts created with `advance_notice_hours` field
✅ Mobile app shows orange advance notice badge
✅ Web portal shows clock badge with hours
✅ Alert description includes timing and conditions

---

## Next Steps After Testing

1. Monitor system for 24 hours
2. Verify alerts are created at appropriate times
3. Check user feedback on advance notice
4. Adjust thresholds if needed (too many/few alerts)
5. Consider adding SMS notifications for predictive alerts

---

## Support

If you encounter issues:
1. Check backend logs for errors
2. Verify database columns exist
3. Test forecast API manually
4. Check alert automation logs table

---

## Status: Ready to Test! 🚀

All code is in place. Just apply the migration and restart the backend to start receiving predictive weather alerts!
