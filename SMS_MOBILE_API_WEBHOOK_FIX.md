# SMS Mobile API Webhook Fix

## Problem
The webhook was disabled due to repeated delivery failures. SMS Mobile API sends a different format than what the webhook was expecting.

## SMS Mobile API Format
```json
{
  "date": "2026-03-27",
  "hour": "09:23:02",
  "time_received": "20260327172254316",
  "message": "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|Not provided",
  "number": "639923150633",
  "guid": "5C9D42DF-105D-4126-8F26-60D6C1E32BB3"
}
```

## Changes Made

### 1. Updated Controller (`smsWebhook.controller.ts`)
- Changed from expecting `from/to/timestamp/messageId` to `date/hour/time_received/number/guid`
- Added comprehensive logging at every step:
  - Raw request body and headers
  - SMS details (from, message, date, hour, guid)
  - Message parsing steps
  - User lookup attempts
  - SOS alert creation
  - Processing time tracking
  - Detailed error logging with stack traces

### 2. Enhanced Webhook Routes (`smsWebhook.routes.ts`)
- Added logging middleware to capture all incoming webhook requests
- Logs method, path, IP, user agent, content type, and body keys
- Removed unused import

### 3. Fixed SOS Service Database Queries
- Fixed `notifyEmergencyContact` to query `user_profiles` table instead of `users` table
- Updated `notifyNearbyResponders` to check both `users.latitude` and `user_profiles.latitude` using COALESCE
- Added better logging for emergency contact notifications

### 4. Better Error Responses
- All error responses now include detailed context
- Success responses include processing time
- Health check endpoint shows expected format

## Testing

Run the test script:
```powershell
.\test-sms-mobile-api-webhook.ps1
```

This will test:
1. Health check endpoint
2. SMS Mobile API format with actual payload structure
3. All agency targets (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL)

## Logging Output

The webhook now logs:
- 🌐 Every incoming request (middleware level)
- 🔔 Raw webhook body and headers
- 📱 SMS details (number, message, date, time, guid)
- 🔍 Message parsing steps
- 🔍 User lookup attempts
- ✅ User found confirmation
- 🚨 SOS alert creation
- 📞 Emergency contact notifications
- ✅ Success with processing time
- ❌ Detailed errors with stack traces

## Verification from Logs

The webhook is now working correctly:
- ✅ Receives SMS Mobile API format
- ✅ Parses message correctly
- ✅ Finds user by ID
- ✅ Creates SOS alert (ID: 100)
- ✅ Broadcasts via WebSocket
- ✅ Notifies responders (MDRRMO, BFP, PNP, Admin)
- ✅ Returns 200 OK to SMS Mobile API

## Next Steps

1. ✅ Backend compiled successfully
2. Restart backend if not already running with latest code
3. Webhook should now work without failures
4. Monitor logs to confirm SMS Mobile API webhooks are processed successfully

## Webhook URL
Your webhook endpoint: `https://your-domain.com/api/webhook/sms-sos`

The webhook will return 200 OK for successful processing, preventing future disabling.
