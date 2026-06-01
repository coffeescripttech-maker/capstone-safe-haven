# ⚠️ SOS Incident Types - SMS Fallback Missing

## Issue Found

The **Report Incident** flow (with incident types) does **NOT** have SMS fallback functionality, while the **Quick SOS** button does.

---

## Current Status

### ✅ Quick SOS Button (SOSButton.tsx)
- **Has SMS fallback**: YES ✅
- **Works offline**: YES ✅
- **Sends SMS automatically**: YES ✅
- **Location**: `mobile/src/components/home/SOSButton.tsx`

**Flow:**
```
1. User clicks SOS button
2. Selects agency
3. Confirms
4. If ONLINE → API call
5. If OFFLINE → Automatic SMS send
```

### ❌ Report Incident (IncidentTypeDetailScreen.tsx)
- **Has SMS fallback**: NO ❌
- **Works offline**: NO ❌
- **Sends SMS automatically**: NO ❌
- **Location**: `mobile/src/screens/sos/IncidentTypeDetailScreen.tsx`

**Current Flow:**
```
1. User selects incident type
2. Reviews details
3. Confirms
4. ONLY tries API call
5. If offline → FAILS ❌
```

---

## What Needs to Be Fixed

### Add SMS Fallback to IncidentTypeDetailScreen

The `handleSendSOS()` function needs to:

1. **Try API first** (if online)
2. **Fall back to SMS** (if offline or API fails)
3. **Include incident type data** in SMS message
4. **Use same SMS service** as Quick SOS

---

## SMS Message Format (With Incident Type)

### Current Quick SOS Format:
```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

### New Format (With Incident Type):
```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com|5|Fire Emergency
```

**Added Fields:**
- `5` = Incident Type ID
- `Fire Emergency` = Incident Type Name

---

## Implementation Plan

### Step 1: Update SMS Service
- Add support for incident type fields
- Update message format to include incident type ID and name

### Step 2: Update IncidentTypeDetailScreen
- Import SMS service
- Import network context
- Add SMS fallback logic to `handleSendSOS()`
- Show appropriate success/error messages

### Step 3: Update Backend Webhook
- Parse incident type fields from SMS
- Save incident type when creating SOS alert from SMS

### Step 4: Test
- Test offline incident reporting
- Verify SMS includes incident type data
- Verify backend processes incident type correctly

---

## Files to Modify

1. **Mobile App**
   - `mobile/src/services/sms.ts` - Add incident type support
   - `mobile/src/screens/sos/IncidentTypeDetailScreen.tsx` - Add SMS fallback

2. **Backend**
   - `backend/src/controllers/smsWebhook.controller.ts` - Parse incident type from SMS

---

## Priority

**HIGH** - Users reporting incidents offline will fail without this fix.

---

## Next Steps

1. Update SMS service to support incident types
2. Add SMS fallback to IncidentTypeDetailScreen
3. Update backend webhook to handle incident type in SMS
4. Test complete offline flow
