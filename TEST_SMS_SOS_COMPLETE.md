# SMS-Based SOS - Complete Testing Guide

## ✅ Implementation Status: COMPLETE

All code implemented, dependencies installed, and ready for testing.

---

## 🎯 What to Test

### 1. Success Scenarios
- ✅ Online SOS (via API)
- ✅ Offline SOS (via SMS)
- ✅ No GPS available (sends with 0,0)

### 2. Error Scenarios
- ✅ No cellular load
- ✅ No SIM card
- ✅ SMS permission denied
- ✅ Device doesn't support SMS

### 3. User Feedback
- ✅ Success alerts (different for API vs SMS)
- ✅ Error alerts (specific reasons)
- ✅ Action buttons (Try Again, Call 911)
- ✅ Vibration patterns

---

## 📱 SMS Message Format

```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

### Complete Data Sent:
1. ✅ SOS identifier
2. ✅ Target agency (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL)
3. ✅ GPS coordinates (latitude, longitude)
4. ✅ **User ID** (database ID for fast lookup)
5. ✅ Full name
6. ✅ Phone number
7. ✅ **Email address**

---

## 🧪 Testing Steps

### Test 1: Online SOS (API Method)

**Setup:**
```powershell
# Start backend
cd MOBILE_APP/backend
npm start

# Start mobile app
cd MOBILE_APP/mobile
npx expo start
```

**Test:**
1. Open app on device
2. Ensure WiFi/data is ON
3. Click SOS button
4. Select agency (e.g., PNP)
5. Confirm
6. Wait for countdown

**Expected Result:**
```
✅ Alert: "SOS Sent Successfully!"
✅ Message: "sent to PNP responders via internet"
✅ Vibration: Triple buzz (success)
✅ Check web app notification bell - new SOS appears
```

---

### Test 2: Offline SOS (SMS Method)

**Setup:**
```powershell
# Backend must be running
cd MOBILE_APP/backend
npm start

# Mobile app running on PHYSICAL DEVICE
```

**Test:**
1. Open app on physical device (NOT emulator)
2. Turn OFF WiFi and mobile data (airplane mode)
3. Turn ON cellular (for SMS only)
4. Ensure device has SMS load/credits
5. Click SOS button
6. Select agency (e.g., PNP)
7. Confirm
8. Wait for countdown

**Expected Result:**
```
✅ Alert: "SOS Sent via SMS!"
✅ Message shows:
   - Gateway: 09923150633
   - Location: Included (or Not available)
   - User info: Your name
✅ Vibration: Triple buzz (success)
✅ Check phone's sent messages - SMS to 09923150633
✅ Check web app notification bell (after webhook processes)
```

**SMS Content:**
```
SOS|PNP|14.5995,120.9842|123|Juan Dela Cruz|09171234567|juan@email.com
```

---

### Test 3: No GPS Available

**Test:**
1. Turn OFF location services
2. Open app
3. Click SOS button
4. Select agency
5. Confirm

**Expected Result:**
```
✅ Alert shows warning: "Location not available"
✅ SMS sent with coordinates: "0,0"
✅ Backend still processes it
✅ Responders notified (without exact location)
```

---

### Test 4: No Cellular Load

**Test:**
1. Use device with no SMS credits
2. Turn OFF WiFi/data
3. Click SOS button
4. Select agency
5. Confirm

**Expected Result:**
```
❌ Alert: "SMS Send Failed"
❌ Message: "Failed to send SMS. Possible reasons:"
   • No cellular load/credits
   • No SIM card inserted
   • SMS permission denied
   • Cellular network unavailable
❌ Vibration: Three long buzzes (error)
✅ Buttons: [Try Again] [Call 911] [Cancel]
```

---

### Test 5: No SIM Card

**Test:**
1. Remove SIM card from device
2. Turn OFF WiFi/data
3. Click SOS button
4. Select agency
5. Confirm

**Expected Result:**
```
❌ Alert: "SMS Send Failed"
❌ Message lists possible reasons
❌ Vibration: Error pattern
✅ Buttons: [Try Again] [Call 911] [Cancel]
```

---

### Test 6: Emulator (No SMS Support)

**Test:**
1. Run app in Android emulator
2. Turn OFF WiFi/data
3. Click SOS button
4. Select agency
5. Confirm

**Expected Result:**
```
❌ Alert: "SMS Not Available"
❌ Message: "Your device does not support SMS sending"
❌ Vibration: Error pattern
✅ Buttons: [Try Again] [Call 911] [Cancel]
```

---

## 🔍 Verification Checklist

### Success Alerts
- [ ] Online success shows "via internet"
- [ ] Offline success shows "via SMS"
- [ ] SMS success shows gateway number
- [ ] SMS success shows location status
- [ ] SMS success shows user info
- [ ] Success vibration plays (triple buzz)
- [ ] Modal closes after success

### Error Alerts
- [ ] SMS unavailable shows correct message
- [ ] SMS failed lists possible reasons
- [ ] No connection explains both failed
- [ ] Unknown error shows error details
- [ ] Error vibration plays (three long buzzes)
- [ ] "Try Again" button reopens modal
- [ ] "Call 911" button works
- [ ] "Cancel" button dismisses alert

### Data Verification
- [ ] SMS includes user ID
- [ ] SMS includes full name
- [ ] SMS includes phone number
- [ ] SMS includes email address
- [ ] SMS includes GPS coordinates
- [ ] SMS includes target agency
- [ ] Backend receives webhook
- [ ] Backend creates SOS alert
- [ ] Notification bell shows alert

---

## 📊 Expected Outcomes

### Online Test
```
Time: 2-3 seconds
Method: API
Result: ✅ Success
Alert: "SOS Sent Successfully!"
Backend: Immediate save
Notification: Instant (WebSocket)
```

### Offline Test
```
Time: 10-30 seconds
Method: SMS
Result: ✅ Success
Alert: "SOS Sent via SMS!"
Backend: Delayed (webhook)
Notification: Delayed (10-30 sec)
```

### No Load Test
```
Time: 3-5 seconds
Method: SMS attempt
Result: ❌ Failed
Alert: "SMS Send Failed"
Reason: No cellular load
Action: Try Again or Call 911
```

---

## 🚀 Quick Start Testing

### Backend
```powershell
cd MOBILE_APP/backend
npm start
```

### Mobile App
```powershell
cd MOBILE_APP/mobile
npm install
npx expo start
```

### Test Webhook (Optional)
```powershell
cd MOBILE_APP/backend
.\test-sms-webhook.ps1
```

---

## ✅ Summary

The SOS button now provides **comprehensive user feedback**:

✅ **Success Messages**: Different for online (API) vs offline (SMS)

✅ **Error Messages**: Specific reasons for each failure type

✅ **Action Buttons**: Try Again, Call 911, Cancel

✅ **Vibration Patterns**: Different for success vs error

✅ **Complete Data**: User ID, name, phone, email, GPS, agency

✅ **Automatic Send**: SMS sends without user interaction

✅ **Clear Feedback**: Users always know what happened

Ready to test on physical device!
