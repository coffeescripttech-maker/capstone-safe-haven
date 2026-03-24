# SMS Blast Emergency Alerts - Complete Testing Guide

## Overview

This guide will walk you through testing the SMS Blast Emergency Alerts feature step-by-step. You'll learn how to access the feature, send test SMS messages, and verify all functionality works correctly.

## Prerequisites

Before testing, ensure:
1. ✅ Backend server is running (`npm run dev` in `MOBILE_APP/backend`)
2. ✅ Database migrations have been applied (SMS tables exist)
3. ✅ You have test user accounts with different roles
4. ✅ iProg SMS API credentials are configured (or mock mode is enabled)

---

## Part 1: Environment Setup

### Step 1: Start the Backend Server

```powershell
cd MOBILE_APP/backend
npm run dev
```

**Expected Output:**
```
Server running on port 3001
Database connected successfully
Redis connected successfully
```

### Step 2: Verify Database Tables

Check that SMS tables exist:

```powershell
# Run this in MOBILE_APP/backend
node -e "const pool = require('./dist/config/database').default; pool.query('SHOW TABLES LIKE \"sms_%\"').then(([rows]) => console.log(rows)).catch(console.error).finally(() => process.exit());"
```

**Expected Tables:**
- `sms_blasts`
- `sms_jobs`
- `sms_templates`
- `contact_groups`
- `sms_audit_logs`
- `sms_credits`
- `sms_usage`

### Step 3: Verify Test Users Exist

You need users with these roles:
- **Superadmin** - Full access to all locations
- **Admin** - Limited to specific jurisdiction (e.g., Metro Manila)
- **Regular User** - Cannot access SMS blast feature

Check existing users:

```powershell
# In MOBILE_APP/backend
mysql -u root -proot -D safehaven_db -e "SELECT id, username, email, role, province, city FROM users WHERE role IN ('superadmin', 'admin') LIMIT 5;"
```

If you don't have test users, create them using the existing script:

```powershell
cd MOBILE_APP/backend
node create-test-users.js
```

---

## Part 2: Testing with Superadmin Role

### Step 1: Login as Superadmin

**Using Postman or cURL:**

```powershell
# Login request
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "superadmin@safehaven.ph",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "superadmin@safehaven.ph",
    "role": "superadmin"
  }
}
```

**Save the token** - you'll need it for all subsequent requests!

### Step 2: Check SMS Credit Balance

```powershell
curl -X GET http://localhost:3001/api/sms-blast/credits/balance `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "balance": 10000,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### Step 3: List Available SMS Templates

```powershell
curl -X GET http://localhost:3001/api/sms-blast/templates `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "templates": [
    {
      "id": "template-uuid-1",
      "name": "Typhoon Alert - English",
      "category": "typhoon",
      "content": "ALERT: Typhoon {name} approaching {location}. Signal #{signal}. Seek shelter immediately.",
      "variables": ["name", "location", "signal"],
      "language": "en",
      "isDefault": true
    },
    {
      "id": "template-uuid-2",
      "name": "Typhoon Alert - Filipino",
      "category": "typhoon",
      "content": "ALERTO: Papalapit ang Bagyong {name} sa {location}. Signal #{signal}. Magpunta sa ligtas na lugar.",
      "variables": ["name", "location", "signal"],
      "language": "fil",
      "isDefault": true
    }
  ]
}
```

### Step 4: Send a Test SMS Blast (Simple Message)

**Test Case: Send to all users in Metro Manila**

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "TEST: This is a test emergency alert. Please ignore.",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en",
    "priority": "normal"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-123",
  "recipientCount": 45,
  "estimatedCost": 45,
  "status": "queued",
  "message": "SMS blast created successfully",
  "details": {
    "messagePreview": "TEST: This is a test emergency alert. Please ignore.",
    "metrics": {
      "characterCount": 52,
      "smsPartCount": 1,
      "language": "en",
      "encoding": "GSM-7"
    }
  }
}
```

### Step 5: Send SMS Using a Template

**Test Case: Typhoon warning with template**

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "templateId": "template-uuid-1",
    "templateVariables": {
      "name": "Pepito",
      "location": "Metro Manila",
      "signal": "3"
    },
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en",
    "priority": "critical"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-456",
  "recipientCount": 45,
  "estimatedCost": 45,
  "status": "queued",
  "message": "SMS blast created successfully",
  "details": {
    "messagePreview": "ALERT: Typhoon Pepito approaching Metro Manila. Signal #3. Seek shelter immediately.",
    "metrics": {
      "characterCount": 85,
      "smsPartCount": 1,
      "language": "en",
      "encoding": "GSM-7"
    }
  }
}
```

### Step 6: Check SMS Blast Status

```powershell
curl -X GET http://localhost:3001/api/sms-blast/blast-uuid-456 `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "blast": {
    "id": "blast-uuid-456",
    "status": "processing",
    "message": "ALERT: Typhoon Pepito approaching Metro Manila...",
    "recipientCount": 45,
    "sentCount": 30,
    "deliveredCount": 25,
    "failedCount": 0,
    "pendingCount": 15,
    "estimatedCost": 45,
    "actualCost": 30,
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Step 7: Test Filipino Language SMS

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "ALERTO: Malakas na bagyo. Lumikas sa ligtas na lugar. Magdala ng pagkain at tubig.",
    "recipientFilters": {
      "cities": ["Quezon City"]
    },
    "language": "fil",
    "priority": "high"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-789",
  "recipientCount": 12,
  "estimatedCost": 12,
  "status": "queued",
  "details": {
    "messagePreview": "ALERTO: Malakas na bagyo. Lumikas sa ligtas na lugar. Magdala ng pagkain at tubig.",
    "metrics": {
      "characterCount": 82,
      "smsPartCount": 2,
      "language": "fil",
      "encoding": "UCS-2"
    }
  }
}
```

**Note:** Filipino text uses UCS-2 encoding, so character limit is 70 per SMS part instead of 160.

### Step 8: View SMS Blast History

```powershell
curl -X GET "http://localhost:3001/api/sms-blast/history?limit=10" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "blasts": [
    {
      "id": "blast-uuid-789",
      "message": "ALERTO: Malakas na bagyo...",
      "recipientCount": 12,
      "status": "completed",
      "createdAt": "2024-01-15T10:40:00.000Z",
      "createdBy": "superadmin"
    },
    {
      "id": "blast-uuid-456",
      "message": "ALERT: Typhoon Pepito...",
      "recipientCount": 45,
      "status": "completed",
      "createdAt": "2024-01-15T10:35:00.000Z",
      "createdBy": "superadmin"
    }
  ],
  "totalCount": 2
}
```

---

## Part 3: Testing with Admin Role (Jurisdiction Restrictions)

### Step 1: Login as Admin

```powershell
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin.manila@safehaven.ph",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "admin_manila",
    "email": "admin.manila@safehaven.ph",
    "role": "admin",
    "province": "Metro Manila"
  }
}
```

### Step 2: Test Jurisdiction Enforcement (Should Succeed)

Admin can send to their assigned jurisdiction:

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Local alert for Metro Manila residents.",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en",
    "priority": "normal"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-abc",
  "recipientCount": 45,
  "estimatedCost": 45,
  "status": "queued"
}
```

### Step 3: Test Jurisdiction Violation (Should Fail)

Admin tries to send to a different province:

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Alert for Cebu",
    "recipientFilters": {
      "provinces": ["Cebu"]
    },
    "language": "en",
    "priority": "normal"
  }'
```

**Expected Response (Error):**
```json
{
  "error": {
    "code": "JURISDICTION_VIOLATION",
    "message": "You do not have permission to send SMS to users in Cebu",
    "timestamp": "2024-01-15T10:45:00.000Z"
  }
}
```

---

## Part 4: Testing with Regular User (Should Be Denied)

### Step 1: Login as Regular User

```powershell
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "user@example.com",
    "password": "User123!"
  }'
```

### Step 2: Attempt to Access SMS Blast (Should Fail)

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer USER_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Test",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en"
  }'
```

**Expected Response (Error):**
```json
{
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "Access denied. Only Admin and Superadmin roles can send SMS blasts.",
    "timestamp": "2024-01-15T10:50:00.000Z"
  }
}
```

---

## Part 5: Advanced Testing Scenarios

### Test 1: Multi-Part SMS Message

Send a long message that requires multiple SMS parts:

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "EMERGENCY ALERT: A strong typhoon is approaching your area. Please evacuate immediately to the nearest evacuation center. Bring essential items including food, water, medicine, and important documents. Stay tuned to local radio for updates. Do not attempt to cross flooded areas. Your safety is our priority.",
    "recipientFilters": {
      "cities": ["Manila"]
    },
    "language": "en",
    "priority": "critical"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-xyz",
  "recipientCount": 20,
  "estimatedCost": 60,
  "details": {
    "metrics": {
      "characterCount": 320,
      "smsPartCount": 3,
      "encoding": "GSM-7"
    }
  }
}
```

**Note:** 320 characters = 3 SMS parts, so cost is 3 credits per recipient (20 × 3 = 60 credits total)

### Test 2: Scheduled SMS Blast

Schedule an SMS for future delivery:

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Scheduled test alert",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en",
    "priority": "normal",
    "scheduledTime": "2024-01-15T15:00:00.000Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "blastId": "blast-uuid-scheduled",
  "recipientCount": 45,
  "estimatedCost": 45,
  "status": "scheduled",
  "scheduledTime": "2024-01-15T15:00:00.000Z"
}
```

### Test 3: Create Custom Template

```powershell
curl -X POST http://localhost:3001/api/sms-blast/templates `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Custom Evacuation Alert",
    "category": "evacuation",
    "content": "EVACUATION: Residents of {barangay} must evacuate to {center} by {time}. Bring essentials only.",
    "language": "en"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "templateId": "template-uuid-custom",
  "message": "Template created successfully"
}
```

### Test 4: Create Contact Group

```powershell
curl -X POST http://localhost:3001/api/sms-blast/contact-groups `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Metro Manila Residents",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "groupId": "group-uuid-123",
  "memberCount": 45,
  "message": "Contact group created successfully"
}
```

### Test 5: Send to Contact Group

```powershell
curl -X POST http://localhost:3001/api/sms-blast `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Alert for contact group",
    "recipientFilters": {
      "contactGroupIds": ["group-uuid-123"]
    },
    "language": "en",
    "priority": "normal"
  }'
```

---

## Part 6: Testing Web Interface (If Available)

If you have a web admin panel:

### Step 1: Access Admin Dashboard

1. Open browser: `http://localhost:3000/admin` (or your web app URL)
2. Login with Superadmin credentials
3. Navigate to **SMS Blast** section in the sidebar

### Step 2: Compose SMS Message

1. Click **"New SMS Blast"** button
2. Choose message type:
   - **Custom Message** - Type your own message
   - **Use Template** - Select from dropdown
3. Fill in template variables if using a template
4. Select recipients:
   - Choose Province, City, or Barangay
   - Or select a Contact Group
5. Choose language: English or Filipino
6. Set priority: Critical, High, or Normal
7. Click **"Preview"** to see final message and recipient count

### Step 3: Review and Send

1. Review the preview:
   - Message content
   - Recipient count
   - Estimated cost
   - Character count and SMS parts
2. Click **"Send Now"** or **"Schedule for Later"**
3. Confirm the send action
4. View the blast status in the dashboard

### Step 4: Monitor Delivery

1. Go to **"SMS History"** page
2. Click on a blast to see details:
   - Sent count
   - Delivered count
   - Failed count
   - Pending count
3. View individual message statuses
4. Export audit logs if needed

---

## Part 7: Troubleshooting

### Issue 1: "Insufficient Credits" Error

**Problem:** SMS blast fails with insufficient credits error

**Solution:**
```powershell
# Update SMS credits in database
mysql -u root -proot -D safehaven_db -e "UPDATE sms_credits SET balance = 10000 WHERE id = (SELECT id FROM sms_credits ORDER BY created_at DESC LIMIT 1);"
```

### Issue 2: No Recipients Found

**Problem:** Recipient count is 0

**Solution:**
- Verify users exist in the selected location
- Check that users have valid phone numbers
- Ensure users are active (not deactivated)

```powershell
# Check users in Metro Manila with phone numbers
mysql -u root -proot -D safehaven_db -e "SELECT COUNT(*) as count FROM users WHERE province = 'Metro Manila' AND phone_number IS NOT NULL AND phone_number != '' AND status = 'active';"
```

### Issue 3: SMS Not Sending

**Problem:** SMS blast status stuck in "queued"

**Solution:**
- Check if queue worker is running
- Verify Redis connection
- Check iProg API credentials

```powershell
# Check queue worker logs
cd MOBILE_APP/backend
npm run dev
# Look for queue processing logs
```

### Issue 4: Template Not Found

**Problem:** Template ID returns "not found" error

**Solution:**
```powershell
# List all templates
curl -X GET http://localhost:3001/api/sms-blast/templates `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Use the correct template ID from the response
```

---

## Part 8: Testing Checklist

Use this checklist to ensure all features work:

### Basic Functionality
- [ ] Login as Superadmin
- [ ] Check SMS credit balance
- [ ] List available templates
- [ ] Send simple SMS blast
- [ ] Send SMS using template
- [ ] View SMS blast status
- [ ] View SMS blast history

### Role-Based Access
- [ ] Superadmin can send to any location
- [ ] Admin can send to their jurisdiction only
- [ ] Admin cannot send outside jurisdiction
- [ ] Regular user cannot access SMS blast

### Language Support
- [ ] Send English SMS (GSM-7 encoding)
- [ ] Send Filipino SMS (UCS-2 encoding)
- [ ] Verify character count for Filipino (70 chars/part)
- [ ] Test diacritical marks (ñ, á, é, í, ó, ú)

### Advanced Features
- [ ] Send multi-part SMS (160+ characters)
- [ ] Schedule SMS for future delivery
- [ ] Create custom template
- [ ] Create contact group
- [ ] Send to contact group
- [ ] Set message priority (critical, high, normal)

### Error Handling
- [ ] Test insufficient credits error
- [ ] Test jurisdiction violation
- [ ] Test unauthorized access
- [ ] Test invalid template ID
- [ ] Test empty recipient list

---

## Part 9: Sample Test Data

### Test Users

Create these test users for comprehensive testing:

```sql
-- Superadmin
INSERT INTO users (username, email, password, role, province, phone_number, status)
VALUES ('superadmin', 'superadmin@safehaven.ph', '$2b$10$...', 'superadmin', NULL, '+639171234567', 'active');

-- Admin for Metro Manila
INSERT INTO users (username, email, password, role, province, city, phone_number, status)
VALUES ('admin_manila', 'admin.manila@safehaven.ph', '$2b$10$...', 'admin', 'Metro Manila', 'Manila', '+639181234567', 'active');

-- Admin for Cebu
INSERT INTO users (username, email, password, role, province, city, phone_number, status)
VALUES ('admin_cebu', 'admin.cebu@safehaven.ph', '$2b$10$...', 'admin', 'Cebu', 'Cebu City', '+639191234567', 'active');

-- Regular users in Metro Manila
INSERT INTO users (username, email, password, role, province, city, barangay, phone_number, status)
VALUES 
  ('user1', 'user1@example.com', '$2b$10$...', 'user', 'Metro Manila', 'Manila', 'Ermita', '+639171111111', 'active'),
  ('user2', 'user2@example.com', '$2b$10$...', 'user', 'Metro Manila', 'Quezon City', 'Diliman', '+639172222222', 'active'),
  ('user3', 'user3@example.com', '$2b$10$...', 'user', 'Metro Manila', 'Makati', 'Poblacion', '+639173333333', 'active');
```

### Test Templates

Default templates should be seeded automatically. If not, create them:

```sql
INSERT INTO sms_templates (id, name, category, content, variables, language, is_default, created_by)
VALUES 
  (UUID(), 'Typhoon Alert - English', 'typhoon', 'ALERT: Typhoon {name} approaching {location}. Signal #{signal}. Seek shelter immediately.', '["name","location","signal"]', 'en', TRUE, 1),
  (UUID(), 'Typhoon Alert - Filipino', 'typhoon', 'ALERTO: Papalapit ang Bagyong {name} sa {location}. Signal #{signal}. Magpunta sa ligtas na lugar.', '["name","location","signal"]', 'fil', TRUE, 1);
```

---

## Summary

You now have a complete guide to test the SMS Blast Emergency Alerts feature! Start with Part 1 (Environment Setup), then test with different roles (Parts 2-4), and finally try advanced scenarios (Part 5).

**Quick Start Command:**
```powershell
# 1. Start backend
cd MOBILE_APP/backend
npm run dev

# 2. In another terminal, test login
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"superadmin@safehaven.ph","password":"Admin123!"}'

# 3. Use the token to send test SMS
curl -X POST http://localhost:3001/api/sms-blast -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"message":"Test alert","recipientFilters":{"provinces":["Metro Manila"]},"language":"en","priority":"normal"}'
```

**Need Help?**
- Check backend logs: `MOBILE_APP/backend/logs/combined.log`
- Check database: `mysql -u root -proot -D safehaven_db`
- Review API documentation: `MOBILE_APP/backend/SMS_BLAST_API_IMPLEMENTATION.md`

Happy Testing! 🚀
