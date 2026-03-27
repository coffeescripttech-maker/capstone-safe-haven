# SMS-Based SOS - User Alert Messages Guide

## 📱 All Possible Alert Messages

This guide shows every alert message users will see when using the SOS button, helping you understand what feedback they get in different scenarios.

---

## ✅ SUCCESS MESSAGES

### 1. Online Success (API)
```
Title: ✅ SOS Sent Successfully!

Message:
Your emergency alert has been sent to PNP responders via internet. 
Help is on the way!

Button: [OK]
```

**When shown:**
- User has internet connection
- API request succeeds
- Fastest method (2-3 seconds)

**What happened:**
- ✅ SOS saved to database
- ✅ WebSocket broadcast sent
- ✅ Responders notified immediately
- ✅ Shows in notification bell

---

### 2. Offline Success (SMS)
```
Title: ✅ SOS Sent via SMS!

Message:
Your emergency alert has been sent to PNP responders via SMS.

📱 Sent to: 09923150633
📍 Location: Included
👤 Your info: Juan Dela Cruz

Authorities will be notified shortly. Stay safe!

Button: [OK]
```

**When shown:**
- User is offline (no internet)
- SMS sent successfully
- Requires cellular load

**What happened:**
- ✅ SMS sent to gateway automatically
- ✅ Gateway will forward to backend via webhook
- ✅ Backend will create SOS alert
- ✅ Responders will be notified (10-30 seconds)

**Data sent in SMS:**
```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

---

## ❌ ERROR MESSAGES

### 3. SMS Not Available
```
Title: ❌ SMS Not Available

Message:
Your device does not support SMS sending. 
Please call emergency services directly at 911.

Buttons: 
[Try Again] [Call 911] [Cancel]
```

**When shown:**
- Device doesn't support SMS (rare)
- Emulator (SMS not supported)

**User action needed:**
- Call 911 directly
- Or test on physical device

---

### 4. SMS Send Failed
```
Title: ❌ SMS Send Failed

Message:
Failed to send SMS. Possible reasons:

• No cellular load/credits
• No SIM card inserted
• SMS permission denied
• Cellular network unavailable

Please call emergency services directly at 911.

Buttons: 
[Try Again] [Call 911] [Cancel]
```

**When shown:**
- User has no cellular load
- No SIM card in device
- SMS permission denied
- Cellular network unavailable

**User action needed:**
- Check cellular load/credits
- Check SIM card inserted
- Grant SMS permission
- Enable cellular network
- Or call 911 directly

---

### 5. No Connection (Both Failed)
```
Title: ❌ No Connection

Message:
Cannot send SOS alert:

• No internet connection
• SMS sending failed

Please ensure you have cellular load and try again, 
or call 911 directly.

Buttons: 
[Try Again] [Call 911] [Cancel]
```

**When shown:**
- User is offline (no internet)
- SMS also failed (no load or SIM)

**User action needed:**
- Check cellular load
- Check SIM card
- Try again
- Or call 911 directly

---

### 6. Unknown Error
```
Title: ❌ SOS Send Failed

Message:
Failed to send emergency alert. Please try again or 
call emergency services directly at 911.

Error: [specific error message]

Buttons: 
[Try Again] [Call 911] [Cancel]
```

**When shown:**
- Unexpected error occurred
- Network timeout
- Server error

**User action needed:**
- Try again
- Or call 911 directly

---

## 🎯 Alert Message Logic

### Decision Tree

```
User clicks SOS
    ↓
Selects agency
    ↓
Confirms
    ↓
Is online?
    ├─ YES → Try API
    │         ├─ Success → ✅ "SOS Sent Successfully!" (via internet)
    │         └─ Failed → Try SMS fallback
    │
    └─ NO → Try SMS
              ├─ SMS available?
              │   ├─ YES → Send SMS
              │   │         ├─ Success → ✅ "SOS Sent via SMS!" (with details)
              │   │         └─ Failed → ❌ "SMS Send Failed" (no load/SIM)
              │   │
              │   └─ NO → ❌ "SMS Not Available" (device doesn't support)
              │
              └─ Both failed → ❌ "No Connection" (try again or call 911)
```

---

## 📊 Alert Message Comparison

| Scenario | Title | Key Info | Action Buttons |
|----------|-------|----------|----------------|
| Online success | ✅ SOS Sent Successfully! | Via internet, help on the way | [OK] |
| Offline success | ✅ SOS Sent via SMS! | Gateway number, location, user info | [OK] |
| SMS unavailable | ❌ SMS Not Available | Device doesn't support | [Try Again] [Call 911] [Cancel] |
| SMS failed | ❌ SMS Send Failed | No load/SIM/permission | [Try Again] [Call 911] [Cancel] |
| Both failed | ❌ No Connection | No internet + no SMS | [Try Again] [Call 911] [Cancel] |
| Unknown error | ❌ SOS Send Failed | Error details | [Try Again] [Call 911] [Cancel] |

---

## 🎨 User Experience

### Success Flow (Online)
```
1. User clicks SOS
2. Selects PNP
3. Confirms
4. Countdown: 3... 2... 1...
5. Vibration: buzz-buzz-buzz (success pattern)
6. Alert: "✅ SOS Sent Successfully!"
7. Message: "Sent to PNP responders via internet"
8. User feels confident help is coming
```

### Success Flow (Offline)
```
1. User clicks SOS
2. Selects PNP
3. Confirms
4. Countdown: 3... 2... 1...
5. SMS sends automatically (no user interaction)
6. Vibration: buzz-buzz-buzz (success pattern)
7. Alert: "✅ SOS Sent via SMS!"
8. Message shows:
   - Gateway number: 09923150633
   - Location: Included
   - User info: Juan Dela Cruz
9. User feels confident SMS was sent
```

### Error Flow (No Load)
```
1. User clicks SOS
2. Selects PNP
3. Confirms
4. Countdown: 3... 2... 1...
5. SMS fails (no load)
6. Vibration: buzz-buzz-buzz (error pattern)
7. Alert: "❌ SMS Send Failed"
8. Message explains:
   - Possible reasons (no load, no SIM, etc.)
   - Action needed (check load, call 911)
9. User has clear next steps
```

---

## 💡 Key Features

### Clear Success Feedback
- ✅ Different messages for online vs offline
- ✅ Shows which method was used (API or SMS)
- ✅ Shows target agency
- ✅ Shows what data was sent
- ✅ Reassures user help is coming

### Detailed Error Messages
- ✅ Specific error titles
- ✅ Explains what went wrong
- ✅ Lists possible reasons
- ✅ Suggests actions to take
- ✅ Always offers "Call 911" option

### Action Buttons
- ✅ "Try Again" - Reopens SOS dialog
- ✅ "Call 911" - Direct emergency call
- ✅ "Cancel" - Dismisses alert

### Vibration Patterns
- ✅ Success: [100, 50, 100, 50, 100] - Triple buzz
- ✅ Error: [100, 100, 100] - Three long buzzes
- ✅ Countdown: [100] - Single buzz per second

---

## 🧪 Testing Each Alert

### Test Success Messages

#### Test 1: Online Success
```
1. Ensure WiFi/data is ON
2. Click SOS → Select PNP → Confirm
3. Should show: "✅ SOS Sent Successfully!"
4. Message: "via internet"
```

#### Test 2: Offline Success
```
1. Turn OFF WiFi/data (airplane mode)
2. Turn ON cellular
3. Ensure device has SMS load
4. Click SOS → Select PNP → Confirm
5. Should show: "✅ SOS Sent via SMS!"
6. Message includes gateway number and user info
```

### Test Error Messages

#### Test 3: SMS Not Available
```
1. Test in emulator (no SMS support)
2. Click SOS → Select PNP → Confirm
3. Should show: "❌ SMS Not Available"
4. Message: "device does not support SMS"
```

#### Test 4: SMS Send Failed
```
1. Use physical device with no SIM or no load
2. Turn OFF WiFi/data
3. Click SOS → Select PNP → Confirm
4. Should show: "❌ SMS Send Failed"
5. Message lists possible reasons
```

#### Test 5: No Connection
```
1. Turn OFF WiFi/data
2. Remove SIM card or disable cellular
3. Click SOS → Select PNP → Confirm
4. Should show: "❌ No Connection"
5. Message: "No internet + SMS failed"
```

---

## 📋 Alert Message Checklist

### Success Messages
- ✅ Clear title with checkmark emoji
- ✅ Explains which method was used
- ✅ Shows target agency
- ✅ Shows what data was sent (SMS only)
- ✅ Reassures user help is coming
- ✅ Success vibration pattern

### Error Messages
- ✅ Clear title with X emoji
- ✅ Explains what went wrong
- ✅ Lists possible reasons
- ✅ Suggests specific actions
- ✅ Offers "Try Again" button
- ✅ Offers "Call 911" button
- ✅ Error vibration pattern

---

## 🎯 Summary

The SOS button now provides **proper, detailed alerts** for every scenario:

✅ **Success via API**: Clear message that internet was used

✅ **Success via SMS**: Detailed message showing gateway, location, user info

✅ **SMS Not Available**: Explains device doesn't support SMS

✅ **SMS Send Failed**: Lists all possible reasons (no load, no SIM, etc.)

✅ **No Connection**: Explains both methods failed

✅ **Unknown Error**: Shows specific error details

✅ **Action Buttons**: Try Again, Call 911, Cancel options

✅ **Vibration Feedback**: Different patterns for success vs error

Users will always know exactly what happened and what to do next!
