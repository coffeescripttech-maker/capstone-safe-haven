# SMS Blast - Quick Test Reference

## 🚀 Quick Start (5 Minutes)

### 1. Start Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

### 2. Login as Superadmin
```powershell
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"superadmin@safehaven.ph","password":"Admin123!"}'
```

**Copy the token from response!**

### 3. Send Test SMS
```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "TEST: Emergency alert test. Please ignore.",
    "recipientFilters": {"provinces": ["Metro Manila"]},
    "language": "en",
    "priority": "normal"
  }'
```

---

## 📋 Common Test Scenarios

### Scenario 1: Simple English SMS
```json
{
  "message": "ALERT: Typhoon approaching. Seek shelter.",
  "recipientFilters": {"provinces": ["Metro Manila"]},
  "language": "en",
  "priority": "critical"
}
```

### Scenario 2: Filipino SMS with Unicode
```json
{
  "message": "ALERTO: Malakas na bagyo. Lumikas sa ligtas na lugar.",
  "recipientFilters": {"cities": ["Manila"]},
  "language": "fil",
  "priority": "high"
}
```

### Scenario 3: Using Template
```json
{
  "templateId": "get-from-templates-endpoint",
  "templateVariables": {
    "name": "Pepito",
    "location": "Metro Manila",
    "signal": "3"
  },
  "recipientFilters": {"provinces": ["Metro Manila"]},
  "language": "en",
  "priority": "critical"
}
```

### Scenario 4: Specific City/Barangay
```json
{
  "message": "Local alert for Quezon City residents.",
  "recipientFilters": {
    "provinces": ["Metro Manila"],
    "cities": ["Quezon City"],
    "barangays": ["Diliman"]
  },
  "language": "en",
  "priority": "normal"
}
```

---

## 🔍 Check Status Commands

### Get SMS Blast Status
```powershell
curl -X GET http://localhost:3001/api/sms-blast/BLAST_ID `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View History
```powershell
curl -X GET http://localhost:3001/api/sms-blast/history `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Credit Balance
```powershell
curl -X GET http://localhost:3001/api/sms-blast/credits/balance `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Templates
```powershell
curl -X GET http://localhost:3001/api/sms-blast/templates `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👥 Test Different Roles

### Superadmin (Full Access)
- Email: `superadmin@safehaven.ph`
- Password: `Admin123!`
- Can send to: **Any location**

### Admin (Limited Access)
- Email: `admin.manila@safehaven.ph`
- Password: `Admin123!`
- Can send to: **Metro Manila only**

### Regular User (No Access)
- Email: `user@example.com`
- Password: `User123!`
- Can send to: **None (should get 403 error)**

---

## ⚠️ Expected Errors to Test

### 1. Jurisdiction Violation (Admin)
```json
{
  "error": {
    "code": "JURISDICTION_VIOLATION",
    "message": "You do not have permission to send SMS to users in Cebu"
  }
}
```

### 2. Unauthorized Access (Regular User)
```json
{
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "Access denied. Only Admin and Superadmin roles can send SMS blasts."
  }
}
```

### 3. Insufficient Credits
```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Insufficient SMS credits. Required: 1000, Available: 500"
  }
}
```

### 4. Empty Recipients
```json
{
  "error": {
    "code": "EMPTY_RECIPIENT_LIST",
    "message": "No recipients found matching the specified filters"
  }
}
```

---

## 🛠️ Troubleshooting

### Backend Not Starting?
```powershell
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

### No Recipients Found?
```powershell
# Check users in database
mysql -u root -proot -D safehaven_db -e "SELECT COUNT(*) FROM users WHERE province='Metro Manila' AND phone_number IS NOT NULL AND status='active';"
```

### Need More Credits?
```powershell
# Update credits in database
mysql -u root -proot -D safehaven_db -e "UPDATE sms_credits SET balance=10000 ORDER BY created_at DESC LIMIT 1;"
```

### Check Backend Logs
```powershell
# View logs
cat MOBILE_APP/backend/logs/combined.log

# Or tail logs in real-time
Get-Content MOBILE_APP/backend/logs/combined.log -Wait -Tail 50
```

---

## 📊 Success Indicators

✅ **SMS Blast Created Successfully**
- Response has `"success": true`
- `blastId` is returned
- `recipientCount` > 0
- `status` is "queued" or "scheduled"

✅ **SMS Processing**
- Status changes: queued → processing → completed
- `sentCount` increases
- `deliveredCount` increases
- `failedCount` stays low

✅ **Multi-Language Working**
- English: `encoding: "GSM-7"`, 160 chars/part
- Filipino: `encoding: "UCS-2"`, 70 chars/part
- Character count adjusts correctly

---

## 🎯 Testing Checklist

**Basic Tests:**
- [ ] Login as Superadmin
- [ ] Send simple SMS
- [ ] Check SMS status
- [ ] View history

**Role Tests:**
- [ ] Superadmin sends to any location ✓
- [ ] Admin sends to their jurisdiction ✓
- [ ] Admin blocked from other locations ✗
- [ ] Regular user blocked from SMS ✗

**Language Tests:**
- [ ] English SMS (GSM-7)
- [ ] Filipino SMS (UCS-2)
- [ ] Character count correct
- [ ] Multi-part messages

**Advanced Tests:**
- [ ] Use template
- [ ] Schedule SMS
- [ ] Create contact group
- [ ] Multi-part message (160+ chars)

---

## 📞 Need More Help?

See the complete guide: `MOBILE_APP/SMS_BLAST_TESTING_GUIDE.md`

**Key Files:**
- API Implementation: `MOBILE_APP/backend/SMS_BLAST_API_IMPLEMENTATION.md`
- Backend Logs: `MOBILE_APP/backend/logs/combined.log`
- Test Script: `MOBILE_APP/backend/test-sms-blast-endpoint.ps1`

**Database Tables:**
- `sms_blasts` - SMS blast records
- `sms_jobs` - Individual message queue
- `sms_templates` - Message templates
- `sms_audit_logs` - Activity logs
- `sms_credits` - Credit balance

---

## 🎉 Quick Win Test

**Copy-paste this entire block to test everything at once:**

```powershell
# 1. Login
$response = curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"superadmin@safehaven.ph","password":"Admin123!"}' | ConvertFrom-Json
$token = $response.token

# 2. Check balance
curl -X GET http://localhost:3001/api/sms-blast/credits/balance -H "Authorization: Bearer $token"

# 3. Send test SMS
curl -X POST http://localhost:3001/api/sms-blast -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"message":"TEST: This is a test alert. Please ignore.","recipientFilters":{"provinces":["Metro Manila"]},"language":"en","priority":"normal"}'

# 4. View history
curl -X GET http://localhost:3001/api/sms-blast/history -H "Authorization: Bearer $token"
```

**Expected Result:** All 4 commands succeed with 200 OK responses! 🎊
