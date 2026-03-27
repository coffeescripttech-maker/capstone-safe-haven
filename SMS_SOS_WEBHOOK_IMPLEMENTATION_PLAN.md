# SMS-Based SOS with Webhook Integration - Implementation Plan

## Overview

Add SMS-based SOS as a **fallback mechanism** for offline scenarios. When the app can't reach the backend (no internet), it sends an SMS to SMSMobileAPI gateway, which forwards it to your backend via webhook.

## Current vs New Flow

### Current Flow (Online Only) ✅
```
User clicks SOS
    ↓
App sends HTTP POST to backend
    ↓
Backend saves to database
    ↓
WebSocket broadcasts to responders
    ↓
Shows in web app (real-time)
```

### New Flow (Offline Fallback) 🆕
```
User clicks SOS (OFFLINE)
    ↓
App sends SMS to gateway number (e.g., +639171234567)
    ↓
SMS Gateway phone receives SMS
    ↓
SMSMobileAPI app reads SMS
    ↓
SMSMobileAPI sends webhook to your server
    ↓
Your backend processes webhook
    ↓
Backend saves to database
    ↓
WebSocket broadcasts to responders
    ↓
Shows in web app (real-time)
```

---

## Implementation Steps

### STEP 1: Backend - Create Webhook Endpoint

Create a new webhook endpoint to receive SMS from SMSMobileAPI.

**File:** `MOBILE_APP/backend/src/controllers/smsWebhook.controller.ts`

```typescript
import { Request, Response } from 'express';
import { sosService } from '../services/sos.service';
import { logger } from '../utils/logger';

export class SMSWebhookController {
  /**
   * Receive SMS webhook from SMSMobileAPI
   * 
   * Expected payload format:
   * {
   *   from: "+639171234567",
   *   message: "SOS|PNP|14.5995,120.9842|Juan Dela Cruz|09171234567",
   *   timestamp: "2026-03-25T10:30:00Z"
   * }
   */
  async receiveSMS(req: Request, res: Response): Promise<void> {
    try {
      const { from, message, timestamp } = req.body;

      logger.info('📱 SMS Webhook received:', { from, message, timestamp });

      // Validate webhook payload
      if (!from || !message) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid webhook payload'
        });
        return;
      }

      // Parse SMS message format: "SOS|AGENCY|LAT,LNG|NAME|PHONE"
      const parts = message.split('|');
      
      if (parts.length < 5 || parts[0] !== 'SOS') {
        logger.warn('Invalid SMS format:', message);
        res.status(400).json({
          status: 'error',
          message: 'Invalid SMS format'
        });
        return;
      }

      const [_, targetAgency, coordinates, userName, userPhone] = parts;
      const [latitude, longitude] = coordinates.split(',').map(parseFloat);

      // Find user by phone number
      const user = await this.findUserByPhone(userPhone);
      
      if (!user) {
        logger.warn(`User not found for phone: ${userPhone}`);
        res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
        return;
      }

      // Create SOS alert (same as regular SOS)
      const sosAlert = await sosService.createSOSAlert({
        userId: user.id,
        latitude: isNaN(latitude) ? undefined : latitude,
        longitude: isNaN(longitude) ? undefined : longitude,
        message: 'Emergency! I need help! (Sent via SMS)',
        userInfo: {
          name: userName,
          phone: userPhone,
          source: 'sms' // Mark as SMS-originated
        },
        targetAgency: targetAgency.toLowerCase() as any
      });

      logger.info(`✅ SOS alert created from SMS: ${sosAlert.id}`);

      // Respond to webhook
      res.status(200).json({
        status: 'success',
        message: 'SOS alert processed',
        sosId: sosAlert.id
      });

    } catch (error) {
      logger.error('Error processing SMS webhook:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process SMS'
      });
    }
  }

  /**
   * Find user by phone number
   */
  private async findUserByPhone(phone: string): Promise<any> {
    const pool = require('../config/database').default;
    
    // Try exact match first
    let [users] = await pool.query(
      'SELECT id, first_name, last_name, phone FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length > 0) return users[0];

    // Try without country code
    const phoneWithoutCode = phone.replace(/^\+?63/, '0');
    [users] = await pool.query(
      'SELECT id, first_name, last_name, phone FROM users WHERE phone = ? OR phone = ?',
      [phoneWithoutCode, `+63${phoneWithoutCode.substring(1)}`]
    );

    return users.length > 0 ? users[0] : null;
  }
}

export const smsWebhookController = new SMSWebhookController();
```

### STEP 2: Backend - Add Webhook Route

**File:** `MOBILE_APP/backend/src/routes/smsWebhook.routes.ts`

```typescript
import { Router } from 'express';
import { smsWebhookController } from '../controllers/smsWebhook.controller';

const router = Router();

// Webhook endpoint (NO authentication - called by external service)
// Add IP whitelist or webhook secret for security
router.post('/sms-webhook', smsWebhookController.receiveSMS.bind(smsWebhookController));

export default router;
```

### STEP 3: Backend - Register Route

**File:** `MOBILE_APP/backend/src/routes/index.ts`

Add this line:
```typescript
import smsWebhookRoutes from './smsWebhook.routes';

// ... existing routes ...

// SMS Webhook (public endpoint)
router.use('/webhooks', smsWebhookRoutes);
```

### STEP 4: Mobile App - Add SMS Fallback

**File:** `MOBILE_APP/mobile/src/components/home/SOSButton.tsx`

Update the `sendSOS` function:

```typescript
import { Linking } from 'react-native';
import { useNetwork } from '../../store/NetworkContext';

// Add at top of component
const { isOnline } = useNetwork();

const sendSOS = async () => {
  try {
    const userName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user?.email || 'SafeHaven User';

    const sosData = {
      latitude: location?.latitude,
      longitude: location?.longitude,
      message: 'Emergency! I need help!',
      targetAgency: selectedAgency,
      userInfo: {
        name: userName,
        phone: user?.phone || 'Not provided',
      },
    };

    // TRY ONLINE FIRST
    if (isOnline) {
      try {
        console.log('📡 Sending SOS via API (online)...');
        await api.post('/sos', sosData);
        
        // Success
        Vibration.vibrate([100, 50, 100, 50, 100]);
        setShowConfirm(false);
        setSending(false);
        setCountdown(3);

        RNAlert.alert(
          'SOS Sent!',
          'Your emergency alert has been sent to authorities.',
          [{ text: 'OK' }]
        );
        
        onSOSSent?.();
        return;
      } catch (apiError) {
        console.error('API failed, falling back to SMS...', apiError);
      }
    }

    // FALLBACK TO SMS (offline or API failed)
    console.log('📱 Sending SOS via SMS (offline fallback)...');
    await sendSOSviaSMS(sosData);

  } catch (error) {
    console.error('Error sending SOS:', error);
    
    Vibration.vibrate([100, 100, 100]);
    setSending(false);
    setCountdown(3);

    RNAlert.alert(
      'Error',
      'Failed to send SOS alert. Please try calling emergency services directly.',
      [{ text: 'OK' }]
    );
  }
};

const sendSOSviaSMS = async (sosData: any) => {
  try {
    // Format SMS message: "SOS|AGENCY|LAT,LNG|NAME|PHONE"
    const smsGatewayNumber = '+639171234567'; // Your SMSMobileAPI gateway number
    
    const lat = sosData.latitude || '0';
    const lng = sosData.longitude || '0';
    const agency = sosData.targetAgency.toUpperCase();
    const name = sosData.userInfo.name;
    const phone = sosData.userInfo.phone;
    
    const smsMessage = `SOS|${agency}|${lat},${lng}|${name}|${phone}`;
    
    // Open SMS app with pre-filled message
    const smsUrl = `sms:${smsGatewayNumber}?body=${encodeURIComponent(smsMessage)}`;
    
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
      
      // Success
      Vibration.vibrate([100, 50, 100, 50, 100]);
      setShowConfirm(false);
      setSending(false);
      setCountdown(3);

      RNAlert.alert(
        'SMS Ready',
        'Please send the SMS to complete your emergency alert. The message has been pre-filled.',
        [{ text: 'OK' }]
      );
      
      onSOSSent?.();
    } else {
      throw new Error('Cannot open SMS app');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
```

### STEP 5: Environment Configuration

**File:** `MOBILE_APP/backend/.env`

Add:
```env
# SMS Gateway Configuration
SMS_GATEWAY_NUMBER=+639171234567
SMS_WEBHOOK_SECRET=your-secret-key-here
```

**File:** `MOBILE_APP/mobile/.env`

Add:
```env
# SMS Gateway for offline SOS
SMS_GATEWAY_NUMBER=+639171234567
```

### STEP 6: Security - Webhook Authentication

Add webhook secret validation:

**File:** `MOBILE_APP/backend/src/middleware/webhookAuth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validateWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-webhook-secret'] || req.query.secret;
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET;

  if (!expectedSecret) {
    logger.warn('SMS_WEBHOOK_SECRET not configured');
    return next();
  }

  if (secret !== expectedSecret) {
    logger.warn('Invalid webhook secret received');
    return res.status(401).json({
      status: 'error',
      message: 'Invalid webhook secret'
    });
  }

  next();
};
```

Update route:
```typescript
router.post('/sms-webhook', validateWebhookSecret, smsWebhookController.receiveSMS);
```

---

## SMS Message Format

### From Mobile App to Gateway

```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

**Format:** `SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE|EMAIL`

**Parts:**
1. `SOS` - Identifier (always "SOS")
2. `PNP` - Target agency (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL)
3. `14.5995,120.9842` - GPS coordinates (or "0,0" if unavailable)
4. `123` - User ID from database (for fast lookup)
5. `Juan Dela Cruz` - User's full name
6. `09171234567` - User's phone number
7. `juan@email.com` - User's email address

**Example Messages:**
```
SOS|ALL|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
SOS|BFP|14.6000,120.9850|456|Maria Santos|09181234567|maria@email.com
SOS|PNP|0,0|789|Pedro Reyes|09191234567|pedro@email.com
```

### From Gateway to Backend (Webhook)

SMSMobileAPI will send webhook to your server:

```json
POST https://your-backend.com/api/v1/webhooks/sms-webhook
Headers: {
  "Content-Type": "application/json",
  "X-Webhook-Secret": "your-secret-key"
}
Body: {
  "from": "+639171234567",
  "to": "+639181234567",
  "message": "SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com",
  "timestamp": "2026-03-25T10:30:00Z",
  "messageId": "sms-12345"
}
```

---

## SMSMobileAPI Configuration

### 1. Setup Webhook URL

In SMSMobileAPI dashboard:
```
Webhook URL: https://your-backend.com/api/v1/webhooks/sms-webhook?secret=your-secret-key
Method: POST
Events: Incoming SMS
```

### 2. Get Gateway Number

SMSMobileAPI will provide you with a phone number (e.g., `+639171234567`). This is the number users will send SMS to.

### 3. Test Webhook

SMSMobileAPI usually has a "Test Webhook" button to verify your endpoint is working.

---

## Database Changes

### Add SMS Source Tracking

**File:** `MOBILE_APP/database/migrations/013_add_sos_source.sql`

```sql
-- Add source column to track how SOS was sent
ALTER TABLE sos_alerts 
ADD COLUMN source ENUM('api', 'sms') DEFAULT 'api' AFTER target_agency;

-- Add index for faster queries
ALTER TABLE sos_alerts 
ADD INDEX idx_source (source);
```

Apply migration:
```powershell
cd MOBILE_APP/backend
node -e "require('./src/config/database').default.query(require('fs').readFileSync('../database/migrations/013_add_sos_source.sql', 'utf8'))"
```

---

## Mobile App Changes

### Update SOSButton Component

**File:** `MOBILE_APP/mobile/src/components/home/SOSButton.tsx`

**Changes needed:**
1. Import `useNetwork` hook
2. Add `sendSOSviaSMS` function
3. Update `sendSOS` to try API first, fallback to SMS
4. Show appropriate success message based on method used

**Key additions:**
```typescript
import { Linking } from 'react-native';
import { useNetwork } from '../../store/NetworkContext';

// Inside component
const { isOnline } = useNetwork();

// SMS Gateway number from env
const SMS_GATEWAY_NUMBER = process.env.EXPO_PUBLIC_SMS_GATEWAY_NUMBER || '+639171234567';
```

---

## Testing

### Test 1: Online SOS (Current Flow)
```
1. Ensure device has internet
2. Press SOS button
3. Select agency
4. Confirm
5. Should send via API ✅
6. Check web app notification bell
```

### Test 2: Offline SOS (New SMS Flow)
```
1. Turn off WiFi and mobile data
2. Press SOS button
3. Select agency (e.g., PNP)
4. Confirm
5. Should open SMS app with pre-filled message ✅
6. Send the SMS manually
7. SMS goes to gateway number
8. Gateway sends webhook to backend
9. Backend creates SOS alert
10. Check web app notification bell (should appear)
```

### Test 3: Webhook Endpoint
```powershell
# Test webhook directly
curl -X POST http://localhost:3001/api/v1/webhooks/sms-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret-key" \
  -d '{
    "from": "+639171234567",
    "message": "SOS|PNP|14.5995,120.9842|Juan Dela Cruz|09171234567",
    "timestamp": "2026-03-25T10:30:00Z"
  }'

# Should return:
# { "status": "success", "message": "SOS alert processed", "sosId": 123 }
```

---

## Advantages

### 1. Works Offline
- No internet required
- Uses cellular SMS network
- More reliable in disaster scenarios

### 2. No Breaking Changes
- Current online flow unchanged
- SMS is just a fallback
- Existing features continue to work

### 3. Same Backend Processing
- Webhook creates SOS alert same way as API
- Same database table
- Same WebSocket broadcast
- Same notification bell

### 4. Unified Experience
- Responders see SMS-based SOS same as API-based
- No difference in web app UI
- Same status tracking and updates

---

## Cost Considerations

### SMSMobileAPI Pricing
- Incoming SMS: Usually FREE or very cheap
- Webhook calls: FREE
- You only pay for outgoing SMS (notifications to responders)

### Estimated Costs
- 1 SOS via SMS: ₱0 (incoming is free)
- Notifications to responders: ₱1-2 per SMS (if using SMS notifications)
- Total per SOS: ₱0-10 depending on notification method

---

## Implementation Checklist

### Backend
- [ ] Create `smsWebhook.controller.ts`
- [ ] Create `smsWebhook.routes.ts`
- [ ] Add route to `routes/index.ts`
- [ ] Create `webhookAuth.ts` middleware
- [ ] Add database migration for `source` column
- [ ] Add `SMS_GATEWAY_NUMBER` and `SMS_WEBHOOK_SECRET` to `.env`
- [ ] Test webhook endpoint with curl

### Mobile App
- [ ] Update `SOSButton.tsx` to add SMS fallback
- [ ] Add `SMS_GATEWAY_NUMBER` to `.env`
- [ ] Import `useNetwork` hook
- [ ] Add `sendSOSviaSMS` function
- [ ] Update `sendSOS` to try API first, fallback to SMS
- [ ] Test offline scenario

### SMSMobileAPI Setup
- [ ] Get gateway phone number from SMSMobileAPI
- [ ] Configure webhook URL in dashboard
- [ ] Add webhook secret
- [ ] Test webhook with their test tool

### Testing
- [ ] Test online SOS (should use API)
- [ ] Test offline SOS (should use SMS)
- [ ] Test webhook endpoint directly
- [ ] Test end-to-end: SMS → Gateway → Webhook → Backend → Web App
- [ ] Verify notification bell shows SMS-based SOS

---

## Security Considerations

### 1. Webhook Authentication
- Use `X-Webhook-Secret` header
- Validate secret on every webhook request
- Rotate secret periodically

### 2. SMS Format Validation
- Strict format: `SOS|AGENCY|LAT,LNG|NAME|PHONE`
- Reject malformed messages
- Validate agency names
- Validate coordinates range

### 3. Rate Limiting
- Limit webhook requests per IP
- Prevent spam/abuse
- Log suspicious activity

### 4. User Verification
- Match phone number to registered user
- Reject SMS from unknown numbers
- Log all webhook attempts

---

## Monitoring

### Logs to Track
```typescript
logger.info('📱 SMS Webhook received:', { from, message });
logger.info('✅ SOS alert created from SMS:', sosId);
logger.warn('Invalid SMS format:', message);
logger.error('Error processing SMS webhook:', error);
```

### Metrics to Monitor
- SMS webhooks received per hour
- Success rate (processed vs failed)
- Average processing time
- Invalid format rate
- Unknown user rate

---

## Summary

This implementation adds SMS-based SOS as a **fallback** without breaking current functionality:

1. **Online**: Uses existing API flow (fast, real-time)
2. **Offline**: Falls back to SMS → Gateway → Webhook → Backend
3. **Unified**: Both methods create same SOS alert in database
4. **Real-time**: Both trigger WebSocket broadcast to responders
5. **No Breaking Changes**: Current features continue to work

The key is that your backend already has everything needed (SOS service, WebSocket, notification bell). You just need to add a webhook endpoint that creates SOS alerts the same way the API does.

---

**Next Steps:**
1. Get SMSMobileAPI gateway number
2. Implement webhook endpoint (backend)
3. Update SOSButton with SMS fallback (mobile)
4. Configure webhook in SMSMobileAPI dashboard
5. Test end-to-end flow

**Estimated Time:** 2-3 hours

**Files to Create:** 2 new files (controller + routes)

**Files to Modify:** 3 files (SOSButton, routes/index, .env files)

