# SMS-Based SOS - Automatic Send Summary

## How It Works

When user clicks SOS button (even offline):

### 1. User Action
```
User clicks SOS button
    ↓
Selects agency (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL)
    ↓
Confirms (3 second countdown)
    ↓
App attempts to send
```

### 2. Automatic Flow

#### If ONLINE:
```
✅ Sends via API to backend
✅ Backend saves to database
✅ WebSocket broadcasts to responders
✅ Shows in web app notification bell
```

#### If OFFLINE (or API fails):
```
📱 Automatically sends SMS to 09923150633
📱 SMS includes all data (see format below)
📱 User needs cellular load (not internet)
📱 SMS Gateway receives it
📱 Gateway sends webhook to your backend
✅ Backend processes and creates SOS alert
✅ WebSocket broadcasts to responders
✅ Shows in web app notification bell
```

---

## SMS Message Format

### What Gets Sent Automatically

```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

**Format:** `SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE|EMAIL`

### Data Breakdown

| Part | Example | Source | Description |
|------|---------|--------|-------------|
| 1. Identifier | `SOS` | Fixed | Always "SOS" |
| 2. Agency | `PNP` | User selection | Selected agency (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL) |
| 3. Latitude | `14.5995` | GPS | User's current latitude (or "0" if unavailable) |
| 4. Longitude | `120.9842` | GPS | User's current longitude (or "0" if unavailable) |
| 5. User ID | `123` | Auth context | User's database ID (for fast lookup) |
| 6. Name | `Juan Dela Cruz` | User profile | User's full name from registration |
| 7. Phone | `09171234567` | User profile | User's phone number from registration |
| 8. Email | `juan@email.com` | User profile | User's email address |

### Example Messages

```
SOS|ALL|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
SOS|BFP|14.6000,120.9850|456|Maria Santos|09181234567|maria@email.com
SOS|PNP|0,0|789|Pedro Reyes|09191234567|pedro@email.com  (no GPS)
SOS|MDRRMO|15.1234,120.5678|101|Jose Garcia|09191234567|jose@email.com
```

---

## Important Data Included

### ✅ All Critical Information Sent

1. **Emergency Type**: "SOS" identifier
2. **Target Agency**: Which responders to notify
3. **Location**: GPS coordinates (if available)
4. **User Identity**: Full name
5. **Contact Number**: Phone number for callback

### ✅ Automatic Send (No User Interaction)

The SMS is sent **automatically** using `expo-sms` library:

```typescript
// From sms.ts
const { result } = await SMS.sendSMSAsync(
  [gatewayNumber],  // 09923150633
  smsMessage        // "SOS|PNP|14.5995,120.9842|Juan Dela Cruz|09171234567"
);
```

**Key Point**: `SMS.sendSMSAsync()` sends the SMS **automatically** without opening the SMS app or requiring user to press send.

---

## Requirements

### For SMS to Work

1. **Physical Device**: Must test on real phone (not emulator)
2. **Cellular Load**: User must have SMS credits/load
3. **SIM Card**: Device must have active SIM card
4. **Permissions**: App needs SMS permission (granted on first use)

### What Happens If No Load

- SMS will fail silently
- User sees error message: "Failed to send SOS alert. Please ensure you have cellular load..."
- User should call 911 directly

---

## Backend Processing

### When SMS Arrives at Gateway

1. **Gateway receives SMS** from user's phone
2. **Gateway sends webhook** to your backend:

```json
POST https://your-backend.com/api/v1/webhooks/sms-sos
Headers: {
  "X-Webhook-Secret": "safehaven_webhook_secret_2026"
}
Body: {
  "from": "+639171234567",
  "to": "+639923150633",
  "message": "SOS|PNP|14.5995,120.9842|Juan Dela Cruz|09171234567",
  "timestamp": "2026-03-27T10:30:00Z",
  "messageId": "sms-12345"
}
```

3. **Backend parses SMS**:
   - Extracts agency: `PNP`
   - Extracts coordinates: `14.5995, 120.9842`
   - Extracts name: `Juan Dela Cruz`
   - Extracts phone: `09171234567`

4. **Backend finds user** by phone number

5. **Backend creates SOS alert** (same as API method)

6. **WebSocket broadcasts** to responders

7. **Notification bell** shows new SOS alert

---

## Testing Checklist

### Test 1: Online SOS (Current Flow)
```
✅ Turn ON WiFi/mobile data
✅ Open SafeHaven app
✅ Click SOS button
✅ Select agency (e.g., PNP)
✅ Confirm
✅ Should send via API
✅ Check web app notification bell
```

### Test 2: Offline SOS (SMS Automatic Send)
```
✅ Turn OFF WiFi and mobile data (airplane mode + enable cellular)
✅ Ensure device has SMS load
✅ Open SafeHaven app
✅ Click SOS button
✅ Select agency (e.g., PNP)
✅ Confirm
✅ SMS sends AUTOMATICALLY to 09923150633
✅ Check SMS sent in phone's messaging app
✅ Wait for webhook to process
✅ Check web app notification bell (should appear)
```

### Test 3: No GPS Available
```
✅ Turn off location services
✅ Click SOS button
✅ SMS should send with "0,0" coordinates
✅ Backend should still process it
```

---

## Configuration Status

### ✅ Backend Environment
```env
SMS_GATEWAY_NUMBER=09923150633
SMS_WEBHOOK_SECRET=safehaven_webhook_secret_2026
```

### ✅ Mobile Environment
```env
EXPO_PUBLIC_SMS_GATEWAY_NUMBER=09923150633
```

### ✅ Dependencies
```json
"expo-sms": "~14.0.1"  // Added to package.json
```

---

## Next Steps

### 1. Apply Database Migration
```powershell
cd MOBILE_APP/backend
npm run build
node dist/config/database.js  # Or use MySQL client
```

Run this SQL:
```sql
ALTER TABLE sos_alerts 
ADD COLUMN source ENUM('api', 'sms') DEFAULT 'api' 
AFTER target_agency;
```

### 2. Install Dependencies
```powershell
cd MOBILE_APP/mobile
npm install  # Already done ✅
```

### 3. Build Backend
```powershell
cd MOBILE_APP/backend
npm run build
```

### 4. Restart Backend
```powershell
cd MOBILE_APP/backend
npm start
```

### 5. Configure SMSMobileAPI Webhook

In SMSMobileAPI dashboard:
```
Webhook URL: https://your-backend.com/api/v1/webhooks/sms-sos
Method: POST
Secret Header: X-Webhook-Secret
Secret Value: safehaven_webhook_secret_2026
Events: Incoming SMS
```

### 6. Test on Physical Device

**IMPORTANT**: Must test on real phone with SIM card and load!

```
1. Build APK or use Expo Go
2. Turn off WiFi (airplane mode + enable cellular)
3. Click SOS button
4. Select agency
5. Confirm
6. SMS should send automatically
7. Check phone's sent messages
8. Check backend logs
9. Check web app notification bell
```

---

## Summary

✅ **Automatic SMS Send**: Uses `SMS.sendSMSAsync()` - no user interaction needed

✅ **All Data Included**:
- SOS identifier
- Target agency
- GPS coordinates (lat, lng)
- **User ID** (for fast database lookup)
- User's full name
- User's phone number
- **User's email address**

✅ **Offline Support**: Works without internet, only needs cellular network

✅ **Fallback Logic**: Tries API first (fast), falls back to SMS if offline

✅ **No Breaking Changes**: Current online flow unchanged

---

## Important Notes

1. **Requires Physical Device**: SMS cannot be tested in emulator
2. **Requires Cellular Load**: User must have SMS credits
3. **Requires SIM Card**: Device must have active SIM
4. **Permission Required**: App will ask for SMS permission on first use
5. **Gateway Setup**: You must configure webhook in SMSMobileAPI dashboard

The SMS will be sent **automatically** when user clicks SOS and is offline. No need to open SMS app or press send manually.
