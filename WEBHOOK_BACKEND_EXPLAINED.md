# SMS Webhook Backend - Complete Explanation

## 🎯 What is a Webhook?

A **webhook** is like a doorbell for your backend. When someone (in this case, the SMS gateway) wants to notify your server about something, they "ring the doorbell" by sending an HTTP request to a specific URL.

---

## 🔄 Complete Flow Explained

### Step-by-Step Process

```
1. USER SENDS SMS
   User's phone → SMS: "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567"
   Recipient: 09923150633 (SMS Gateway number)
   
2. SMS GATEWAY RECEIVES
   Gateway phone receives the SMS
   SMSMobileAPI app reads the SMS content
   
3. GATEWAY CALLS YOUR WEBHOOK
   SMSMobileAPI sends HTTP POST to your backend:
   
   POST https://your-backend.com/api/v1/webhooks/sms-sos
   Headers: {
     "Content-Type": "application/json",
     "X-Webhook-Secret": "safehaven_webhook_secret_2026"
   }
   Body: {
     "from": "+639171234567",
     "to": "+639923150633",
     "message": "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567",
     "timestamp": "2026-03-27T10:30:00Z",
     "messageId": "sms-12345"
   }
   
4. YOUR BACKEND RECEIVES WEBHOOK
   Route: /api/v1/webhooks/sms-sos
   Controller: smsWebhook.controller.ts
   Method: receiveSMS()
   
5. BACKEND PROCESSES
   - Validates webhook secret (security)
   - Parses SMS message
   - Finds user in database
   - Creates SOS alert
   - Broadcasts via WebSocket
   
6. RESPONDERS NOTIFIED
   - WebSocket sends to all connected clients
   - Notification bell shows new SOS
   - Responders see the alert
```

---

## 📂 Backend Files Explained

### 1. Webhook Controller (`smsWebhook.controller.ts`)

This is the **brain** that processes incoming SMS webhooks.

```typescript
export class SMSWebhookController {
  async receiveSMS(req: Request, res: Response): Promise<void> {
    // 1. RECEIVE webhook data
    const { from, to, message, timestamp, messageId } = req.body;
    
    // 2. VALIDATE the message format
    const parts = message.split('|');
    // Expected: ["SOS", "ALL", "13.174030,123.732330", "6", "Citizen Citizen", "09171234567"]
    
    // 3. EXTRACT data from SMS
    const agency = parts[1];        // "ALL"
    const coordinates = parts[2];   // "13.174030,123.732330"
    const userId = parts[3];        // "6"
    const userName = parts[4];      // "Citizen Citizen"
    const userPhone = parts[5];     // "09171234567"
    
    // 4. FIND user in database
    const user = await this.findUserById(userId);
    
    // 5. CREATE SOS alert (same as API method)
    const sosAlert = await sosService.createSOSAlert({
      userId: user.id,
      latitude: 13.174030,
      longitude: 123.732330,
      message: 'Emergency! I need help! (Sent via SMS)',
      source: 'sms',  // Mark as SMS-originated
      targetAgency: 'all',
      userInfo: { name: userName, phone: userPhone }
    });
    
    // 6. RESPOND to webhook (tells gateway we processed it)
    res.status(200).json({
      status: 'success',
      sosId: sosAlert.id
    });
  }
}
```

**What it does:**
- ✅ Receives webhook from SMS gateway
- ✅ Validates message format
- ✅ Extracts all data (agency, GPS, user ID, name, phone)
- ✅ Finds user in database
- ✅ Creates SOS alert
- ✅ Responds to gateway

---

### 2. Webhook Routes (`smsWebhook.routes.ts`)

This defines the **URL endpoint** where webhooks are received.

```typescript
import { Router } from 'express';
import { smsWebhookController } from '../controllers/smsWebhook.controller';
import { validateWebhookSecret } from '../middleware/webhookAuth';

const router = Router();

// Health check (no auth)
router.get('/health', smsWebhookController.healthCheck);

// Webhook endpoint (validates secret)
router.post('/sms-sos', validateWebhookSecret, smsWebhookController.receiveSMS);

export default router;
```

**What it does:**
- ✅ Defines URL: `/api/v1/webhooks/sms-sos`
- ✅ Requires POST method
- ✅ Validates webhook secret (security)
- ✅ Routes to controller

---

### 3. Webhook Authentication (`webhookAuth.ts`)

This is the **security guard** that checks if the webhook is legitimate.

```typescript
export const validateWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET;
  // "safehaven_webhook_secret_2026"
  
  const secret = req.headers['x-webhook-secret'];
  
  if (secret !== expectedSecret) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid webhook secret'
    });
  }
  
  next(); // Secret is valid, continue
};
```

**What it does:**
- ✅ Checks webhook secret in header
- ✅ Compares with expected secret from .env
- ✅ Blocks unauthorized requests
- ✅ Allows legitimate webhooks through

---

### 4. Routes Registration (`routes/index.ts`)

This **connects** the webhook routes to your main API.

```typescript
import smsWebhookRoutes from './smsWebhook.routes';

// ... other routes ...

// SMS Webhook (public endpoint)
router.use('/webhooks', smsWebhookRoutes);
```

**What it does:**
- ✅ Registers webhook routes under `/api/v1/webhooks`
- ✅ Makes endpoint accessible at `/api/v1/webhooks/sms-sos`

---

## 🔐 Security Explained

### Why Webhook Secret?

Without security, **anyone** could send fake webhooks to your backend:

```
❌ Attacker sends fake webhook:
POST /api/v1/webhooks/sms-sos
Body: { "message": "SOS|ALL|0,0|999|Fake User|09999999999" }

Result: Creates fake SOS alert!
```

### With Webhook Secret:

```
✅ Gateway sends webhook with secret:
POST /api/v1/webhooks/sms-sos
Headers: { "X-Webhook-Secret": "safehaven_webhook_secret_2026" }

✅ Backend validates secret
✅ Only processes if secret matches
✅ Blocks fake webhooks
```

---

## 📊 Data Processing Flow

### 1. Webhook Arrives
```json
{
  "from": "+639171234567",
  "to": "+639923150633",
  "message": "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567",
  "timestamp": "2026-03-27T10:30:00Z",
  "messageId": "sms-12345"
}
```

### 2. Parse SMS Message
```typescript
const parts = message.split('|');
// ["SOS", "ALL", "13.174030,123.732330", "6", "Citizen Citizen", "09171234567"]

const agency = parts[1];           // "ALL"
const [lat, lng] = parts[2].split(','); // [13.174030, 123.732330]
const userId = parseInt(parts[3]); // 6
const userName = parts[4];         // "Citizen Citizen"
const userPhone = parts[5];        // "09171234567"
```

### 3. Find User in Database
```typescript
// Try by user ID first (fastest)
const user = await findUserById(6);

// Result:
{
  id: 6,
  first_name: "Citizen",
  last_name: "Citizen",
  phone: "09171234567",
  email: "newdexm@gmail.com"
}
```

### 4. Create SOS Alert
```typescript
const sosAlert = await sosService.createSOSAlert({
  userId: 6,
  latitude: 13.174030,
  longitude: 123.732330,
  message: 'Emergency! I need help! (Sent via SMS)',
  source: 'sms',
  targetAgency: 'all',
  userInfo: {
    userId: 6,
    name: "Citizen Citizen",
    phone: "09171234567",
    smsFrom: "+639171234567",
    smsMessageId: "sms-12345"
  }
});

// Saved to database:
{
  id: 123,
  user_id: 6,
  latitude: 13.174030,
  longitude: 123.732330,
  message: "Emergency! I need help! (Sent via SMS)",
  status: "sent",
  priority: "high",
  target_agency: "all",
  source: "sms",  // ← Marks as SMS-originated
  created_at: "2026-03-27 18:30:00"
}
```

### 5. Broadcast via WebSocket
```typescript
websocketService.broadcastNewSOS(sosAlert);

// Sends to all connected web app clients:
{
  type: 'new_sos',
  data: {
    id: 123,
    user_id: 6,
    latitude: 13.174030,
    longitude: 123.732330,
    target_agency: 'all',
    status: 'sent',
    // ... all SOS data
  }
}
```

### 6. Notification Bell Updates
```typescript
// Web app receives WebSocket message
// SOSNotificationBell.tsx updates
// Shows new SOS alert with red badge
// Responders see: "Citizen Citizen needs help!"
```

---

## 🔍 User Lookup Methods

### Primary: By User ID (Fastest)
```typescript
private async findUserById(userId: number): Promise<any> {
  const [users] = await pool.query(
    'SELECT id, first_name, last_name, phone, email FROM users WHERE id = ?',
    [userId]
  );
  
  return users[0] || null;
}
```

**Why fastest:**
- Direct database lookup by primary key
- No string matching needed
- Most reliable

### Secondary: By Phone Number (Fallback)
```typescript
private async findUserByPhone(phone: string): Promise<any> {
  // Try exact match
  let [users] = await pool.query(
    'SELECT * FROM users WHERE phone = ?',
    [phone]
  );
  
  if (users.length > 0) return users[0];
  
  // Try with +63 prefix
  const phoneWith63 = `+63${phone.replace(/^0/, '')}`;
  [users] = await pool.query(
    'SELECT * FROM users WHERE phone = ?',
    [phoneWith63]
  );
  
  if (users.length > 0) return users[0];
  
  // Try without prefix (09XX format)
  const phoneWithout63 = phone.replace(/^\+?63/, '0');
  [users] = await pool.query(
    'SELECT * FROM users WHERE phone = ?',
    [phoneWithout63]
  );
  
  return users[0] || null;
}
```

**Why needed:**
- Handles different phone formats
- Fallback if user ID fails
- More flexible matching

---

## 🚨 Error Handling

### Invalid SMS Format
```typescript
if (parts.length < 6 || parts[0] !== 'SOS') {
  return res.status(400).json({
    status: 'error',
    message: 'Invalid SMS format'
  });
}
```

### Invalid Agency
```typescript
const validAgencies = ['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all'];

if (!validAgencies.includes(agency)) {
  return res.status(400).json({
    status: 'error',
    message: 'Invalid agency'
  });
}
```

### User Not Found
```typescript
if (!user) {
  return res.status(404).json({
    status: 'error',
    message: 'User not found'
  });
}
```

---

## 🧪 Testing the Webhook

### Test with curl/PowerShell
```powershell
# Test webhook directly
.\test-sms-webhook.ps1

# Or manually:
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/webhooks/sms-sos" `
  -Method Post `
  -Headers @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = "safehaven_webhook_secret_2026"
  } `
  -Body (@{
    from = "+639171234567"
    to = "+639923150633"
    message = "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    messageId = "test-123"
  } | ConvertTo-Json)
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "SOS alert processed successfully",
  "sosId": 123
}
```

---

## 📡 SMSMobileAPI Configuration

### What You Need to Configure

In SMSMobileAPI dashboard:

```
Webhook URL: https://your-backend.com/api/v1/webhooks/sms-sos
Method: POST
Header Name: X-Webhook-Secret
Header Value: safehaven_webhook_secret_2026
Events: Incoming SMS
Trigger: When SMS received on 09923150633
```

### How Gateway Sends Webhook

When SMS arrives at 09923150633, SMSMobileAPI:

1. Reads the SMS content
2. Formats it as JSON
3. Adds your webhook secret to headers
4. Sends POST request to your backend
5. Waits for 200 OK response
6. Retries if your backend is down

---

## 🔄 Backend Processing Steps

### Step 1: Receive Webhook
```typescript
async receiveSMS(req: Request, res: Response): Promise<void> {
  const { from, to, message, timestamp, messageId } = req.body;
  
  logger.info('📱 SMS Webhook received:', { from, message });
```

### Step 2: Validate Format
```typescript
  // Parse: "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567"
  const parts = message.trim().split('|');
  
  if (parts.length < 6 || parts[0].toUpperCase() !== 'SOS') {
    return res.status(400).json({ error: 'Invalid format' });
  }
```

### Step 3: Extract Data
```typescript
  const [_, targetAgency, coordinates, userIdStr, userName, userPhone] = parts;
  
  // Parse coordinates
  const [latStr, lngStr] = coordinates.split(',');
  const latitude = parseFloat(latStr);   // 13.174030
  const longitude = parseFloat(lngStr);  // 123.732330
  
  // Parse user ID
  const userId = parseInt(userIdStr);    // 6
```

### Step 4: Validate Agency
```typescript
  const validAgencies = ['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all'];
  const agency = targetAgency.toLowerCase();
  
  if (!validAgencies.includes(agency)) {
    return res.status(400).json({ error: 'Invalid agency' });
  }
```

### Step 5: Find User
```typescript
  // Try by user ID first (fastest)
  let user = null;
  
  if (userId && !isNaN(userId)) {
    user = await this.findUserById(userId);
  }
  
  // Fallback to phone lookup
  if (!user) {
    user = await this.findUserByPhone(userPhone);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
```

### Step 6: Create SOS Alert
```typescript
  const sosAlert = await sosService.createSOSAlert({
    userId: user.id,
    latitude: latitude,
    longitude: longitude,
    message: 'Emergency! I need help! (Sent via SMS)',
    source: 'sms',
    targetAgency: agency,
    userInfo: {
      userId: user.id,
      name: userName,
      phone: userPhone,
      smsFrom: from,
      smsMessageId: messageId
    }
  });
```

**This does:**
- Saves to `sos_alerts` table
- Broadcasts via WebSocket
- Notifies responders
- Same as regular API SOS

### Step 7: Respond to Gateway
```typescript
  res.status(200).json({
    status: 'success',
    message: 'SOS alert processed successfully',
    sosId: sosAlert.id
  });
}
```

**Why important:**
- Tells gateway we processed it successfully
- Gateway won't retry
- Gateway marks SMS as handled

---

## 🗄️ Database Operations

### What Gets Saved

```sql
INSERT INTO sos_alerts (
  user_id,
  latitude,
  longitude,
  message,
  user_info,
  status,
  priority,
  target_agency,
  source
) VALUES (
  6,                                    -- User ID
  13.174030,                            -- Latitude
  123.732330,                           -- Longitude
  'Emergency! I need help! (Sent via SMS)',
  '{"userId":6,"name":"Citizen Citizen","phone":"09171234567","smsFrom":"+639171234567","smsMessageId":"sms-12345"}',
  'sent',                               -- Status
  'high',                               -- Priority
  'all',                                -- Target agency
  'sms'                                 -- Source (SMS vs API)
);
```

### Result in Database

| id | user_id | latitude | longitude | target_agency | source | status | created_at |
|----|---------|----------|-----------|---------------|--------|--------|------------|
| 123 | 6 | 13.174030 | 123.732330 | all | sms | sent | 2026-03-27 18:30:00 |

---

## 📡 WebSocket Broadcast

After saving to database, backend broadcasts to all connected clients:

```typescript
websocketService.broadcastNewSOS(sosAlert);

// Sends to all web app users:
{
  type: 'new_sos',
  data: {
    id: 123,
    user_id: 6,
    first_name: "Citizen",
    last_name: "Citizen",
    phone: "09171234567",
    latitude: 13.174030,
    longitude: 123.732330,
    target_agency: 'all',
    status: 'sent',
    priority: 'high',
    created_at: '2026-03-27T18:30:00.000Z'
  }
}
```

### Who Receives Broadcast?

Based on `target_agency = 'all'`:
- ✅ Super Admin (sees all)
- ✅ MDRRMO (sees 'all' and 'mdrrmo')
- ✅ PNP (sees 'all' and 'pnp')
- ✅ BFP (sees 'all' and 'bfp')
- ✅ LGU Officers (sees 'all', 'lgu', 'barangay')

---

## 🎯 Complete Example

### Your Test SMS
```
From: Your phone
To: 09923150633
Message: SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567
```

### Gateway Webhook to Backend
```json
POST http://localhost:3001/api/v1/webhooks/sms-sos
Headers: {
  "X-Webhook-Secret": "safehaven_webhook_secret_2026"
}
Body: {
  "from": "+639171234567",
  "message": "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567"
}
```

### Backend Processing
```
1. Validates secret ✅
2. Parses message ✅
3. Extracts: agency=ALL, lat=13.174030, lng=123.732330, userId=6
4. Finds user ID 6 in database ✅
5. Creates SOS alert (id=123) ✅
6. Broadcasts via WebSocket ✅
7. Responds: { "status": "success", "sosId": 123 } ✅
```

### Web App Updates
```
1. WebSocket receives new_sos event
2. SOSNotificationBell adds alert to list
3. Badge count increases
4. Shows: "Citizen Citizen needs help!"
5. Responders can click to see details
```

---

## 🔧 Configuration

### Backend Environment (`.env`)
```env
SMS_GATEWAY_NUMBER=09923150633
SMS_WEBHOOK_SECRET=safehaven_webhook_secret_2026
```

### Webhook Endpoint
```
URL: http://localhost:3001/api/v1/webhooks/sms-sos
Method: POST
Auth: X-Webhook-Secret header
Public: Yes (no user authentication needed)
```

---

## 📋 Summary

The webhook backend works like this:

1. **SMS Gateway calls your webhook** when SMS arrives
2. **Webhook controller receives** the SMS data
3. **Validates secret** for security
4. **Parses SMS message** to extract data
5. **Finds user** in database (by ID or phone)
6. **Creates SOS alert** (same as API method)
7. **Broadcasts via WebSocket** to responders
8. **Responds to gateway** with success

It's essentially a **bridge** between the SMS world and your backend API. The SMS gateway does the hard work of receiving SMS, and your webhook just processes the data like any other SOS alert.

The key difference from regular API SOS:
- ✅ No user authentication needed (webhook has its own secret)
- ✅ Marks source as 'sms' in database
- ✅ Includes SMS metadata (from number, message ID)
- ✅ Otherwise identical to API SOS

Your backend is ready to receive webhooks from SMSMobileAPI!
