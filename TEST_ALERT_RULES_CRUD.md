# Test Alert Rules CRUD - Quick Guide

## Quick Test Checklist

### ✅ Test 1: View Rules List
1. Navigate to: http://localhost:3001/alert-automation/rules
2. Should see existing rules (4 default rules)
3. Filter tabs should work (All, Weather, Earthquake)
4. "Create Rule" button should be enabled (blue)

**Expected**: Rules list displays correctly with all filters working

---

### ✅ Test 2: Create Weather Rule
1. Click "Create Rule" button
2. Fill in form:
   ```
   Rule Name: Test Heat Alert
   Rule Type: Weather
   Priority: 5
   Status: Active (checked)
   
   Min Temperature: 30
   
   Alert Type: weather
   Severity: Warning
   Title: Test Heat Warning
   Description: This is a test heat warning alert
   ```
3. Click "Create Rule"

**Expected**: 
- Redirected to rules list
- New rule appears in the list
- Rule shows as active

---

### ✅ Test 3: Edit Rule
1. Find the rule you just created
2. Click the Edit icon (pencil)
3. Change:
   ```
   Min Temperature: 32
   Title: Updated Test Heat Warning
   ```
4. Click "Save Changes"

**Expected**:
- Redirected to rules list
- Rule shows updated values
- Temperature threshold is now 32°C

---

### ✅ Test 4: Toggle Rule Status
1. Find your test rule
2. Click the Power icon (green)
3. Icon should change to gray (PowerOff)
4. Click again to re-enable

**Expected**:
- Status changes immediately
- Icon changes color
- No page reload needed

---

### ✅ Test 5: Create Earthquake Rule
1. Click "Create Rule"
2. Fill in form:
   ```
   Rule Name: Test Earthquake Alert
   Rule Type: Earthquake
   Priority: 10
   Status: Active
   
   Min Magnitude: 4.5
   Alert Radius: 80
   
   Alert Type: earthquake
   Severity: Critical
   Title: Test Earthquake Detected
   Description: This is a test earthquake alert
   ```
3. Click "Create Rule"

**Expected**:
- New earthquake rule created
- Shows in Earthquake filter tab
- Has earthquake icon 🌍

---

### ✅ Test 6: Delete Rule
1. Find your test rule
2. Click the Trash icon (red)
3. Confirm deletion in dialog
4. Rule should disappear

**Expected**:
- Confirmation dialog appears
- After confirming, rule is removed
- List updates immediately

---

## Test Scenarios

### Scenario 1: Create Comprehensive Weather Rule
```
Name: Severe Storm Warning
Type: Weather
Priority: 15

Conditions:
- Min Temperature: 25
- Min Precipitation: 100
- Min Wind Speed: 80

Alert:
- Type: weather
- Severity: Extreme
- Title: Severe Storm Warning
- Description: Dangerous storm conditions with heavy rain and strong winds. Seek shelter immediately.
```

### Scenario 2: Create Shallow Earthquake Rule
```
Name: Shallow Earthquake Alert
Type: Earthquake
Priority: 20

Conditions:
- Min Magnitude: 5.5
- Max Depth: 30
- Alert Radius: 200

Alert:
- Type: earthquake
- Severity: Extreme
- Title: Shallow Earthquake Detected
- Description: A shallow earthquake has been detected. This type of earthquake can cause significant damage. Drop, Cover, and Hold On.
```

---

## Validation Tests

### Test Empty Fields
1. Try to create rule without name
2. Try to create rule without title
3. Try to create rule without description

**Expected**: Form shows validation errors

### Test Invalid Numbers
1. Try negative temperature
2. Try magnitude > 10
3. Try priority > 100

**Expected**: Form validates or accepts (depending on HTML5 validation)

---

## API Tests (Optional)

### Test Create via API
```powershell
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "API Test Rule"
    type = "weather"
    conditions = @{
        temperature = @{ min = 28 }
    }
    alert_template = @{
        alert_type = "weather"
        severity = "Warning"
        title = "API Test Alert"
        description = "Created via API"
    }
    is_active = $true
    priority = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/rules" -Method Post -Headers $headers -Body $body
```

### Test Update via API
```powershell
$ruleId = 5  # Replace with actual ID
$body = @{
    priority = 10
    conditions = @{
        temperature = @{ min = 30 }
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/alert-automation/rules/$ruleId" -Method Put -Headers $headers -Body $body
```

---

## Troubleshooting

### Form doesn't submit
- Check browser console for errors
- Verify all required fields are filled
- Check network tab for API response

### Changes don't save
- Verify backend server is running
- Check authentication token is valid
- Look at backend logs for errors

### Rules don't appear
- Refresh the page
- Check filter tabs (All/Weather/Earthquake)
- Verify rule was created in database

---

## Database Verification

### Check created rules
```sql
SELECT id, name, type, is_active, priority, created_at 
FROM alert_rules 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check rule conditions
```sql
SELECT id, name, conditions, alert_template 
FROM alert_rules 
WHERE name LIKE '%Test%';
```

### Count rules by type
```sql
SELECT type, COUNT(*) as count 
FROM alert_rules 
GROUP BY type;
```

---

## Success Indicators

✅ All forms load without errors  
✅ Create form successfully creates rules  
✅ Edit form loads existing data  
✅ Edit form saves changes  
✅ Toggle changes status immediately  
✅ Delete removes rules  
✅ Validation works on required fields  
✅ Navigation works (back buttons, redirects)  
✅ No TypeScript errors in console  
✅ No API errors in network tab  

---

## Quick Commands

### Start Frontend
```powershell
cd web_app
npm run dev
```

### Start Backend
```powershell
cd backend
npm run dev
```

### Check Rules in Database
```powershell
cd backend
node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'safehaven_db' }); const [rows] = await conn.query('SELECT id, name, type, is_active FROM alert_rules'); console.table(rows); await conn.end(); })();"
```

---

## Expected Results

After testing, you should have:
- ✅ 4 default rules (from initial setup)
- ✅ 2+ test rules you created
- ✅ Verified edit functionality works
- ✅ Verified toggle functionality works
- ✅ Verified delete functionality works

**All CRUD operations working perfectly!** 🎉
