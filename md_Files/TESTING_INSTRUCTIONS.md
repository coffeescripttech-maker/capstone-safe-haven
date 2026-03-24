# Testing Instructions - Phase 2

## Current Status

✅ **Server is running** on `http://localhost:3000`  
✅ **Database is connected**  
✅ **All code compiled successfully** (no TypeScript errors)

## Quick Test (Recommended)

### Step 1: Run the complete test script
```powershell
cd backend
.\test-complete.ps1
```

### Step 2: When prompted, run this SQL command

Open your MySQL client (MySQL Workbench, phpMyAdmin, or command line) and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'testadmin@safehaven.com';
```

Or if you know the user ID:
```sql
UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;
```

### Step 3: Press any key to continue

The script will automatically test all Phase 2 features!

---

## What Gets Tested

The test script will verify:

### ✅ Disaster Alerts
- Create alert with metadata
- Get all alerts (public endpoint)
- Update alert severity
- Get alert statistics

### ✅ Evacuation Centers
- Create center with facilities
- Get all centers (public endpoint)
- Update center occupancy
- Get center statistics

### ✅ Emergency Contacts
- Create contact (national)
- Get all contacts grouped by category
- Verify category grouping

---

## Manual Testing (Alternative)

If you prefer to test manually, here are the key endpoints:

### 1. Health Check
```powershell
curl http://localhost:3000/health
```

### 2. Register User
```powershell
$body = @{
    email = "test@example.com"
    phone = "09123456789"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/auth/register" `
     -ContentType "application/json" `
     -Body $body
```

### 3. Make User Admin (SQL)
```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

### 4. Login
```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = curl -Method POST -Uri "http://localhost:3000/api/v1/auth/login" `
     -ContentType "application/json" `
     -Body $body | ConvertFrom-Json

$token = $response.data.accessToken
```

### 5. Create Alert
```powershell
$alert = @{
    alert_type = "typhoon"
    severity = "critical"
    title = "Test Typhoon"
    description = "Test description"
    source = "PAGASA"
    affected_areas = @("Cebu")
    latitude = 10.3157
    longitude = 123.8854
    radius_km = 50
    start_time = "2024-01-15T08:00:00Z"
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/alerts" `
     -Headers @{Authorization="Bearer $token"} `
     -ContentType "application/json" `
     -Body $alert
```

---

## Expected Results

When all tests pass, you should see:

```
========================================
TEST RESULTS
========================================
Passed: 10
Failed: 0

SUCCESS! ALL TESTS PASSED!
Your Phase 2 implementation is working perfectly!
```

---

## Troubleshooting

### Server not running?
```powershell
cd backend
npm run dev
```

### Database connection error?
- Check MySQL is running
- Verify credentials in `backend/.env`
- Ensure database `safehaven_db` exists

### Permission errors?
- Make sure you ran the SQL command to set role='admin'
- Verify the user exists: `SELECT * FROM users WHERE email = 'testadmin@safehaven.com';`

### Port 3000 already in use?
```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

---

## What's Next After Testing?

Once all tests pass:

1. ✅ **Phase 2 is complete!**
2. **Add more test data** for realistic scenarios
3. **Test broadcasting** - Send notifications to users
4. **Test search endpoints** - Search alerts, centers, contacts
5. **Test nearby centers** - Use different coordinates
6. **Move to Phase 3** - SOS Alerts, Incident Reporting, etc.
7. **Or start Mobile App** - React Native implementation

---

## Files Created for Testing

- `backend/test-complete.ps1` - Complete automated test (RECOMMENDED)
- `backend/test-simple.ps1` - Simple 8-test script
- `backend/make-admin.sql` - SQL to make user admin
- `backend/setup-and-test.ps1` - Setup helper

---

## Need Help?

Check these files for more information:
- `API_DOCUMENTATION.md` - All API endpoints
- `PHASE_2_IMPLEMENTATION_COMPLETE.md` - What was built
- `QUICK_TEST_GUIDE.md` - Manual testing guide
- Server logs: `backend/logs/combined.log`

---

## Summary

Your Phase 2 implementation is **READY TO TEST**! 

Just run `.\test-complete.ps1`, update one user to admin role in SQL, and watch all tests pass! 🎉
