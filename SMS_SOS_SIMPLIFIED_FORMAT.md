# SMS-Based SOS - Simplified Format (No Email)

## ✅ UPDATED: Email Removed from SMS

Email address removed from SMS format to avoid issues with `@` symbol in SMS messages.

---

## 📱 New SMS Format (Simplified)

```
SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567
```

**Format:** `SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE`

### Data Included:
1. ✅ SOS identifier
2. ✅ Target agency
3. ✅ GPS coordinates (lat, lng)
4. ✅ User ID (for database lookup)
5. ✅ Full name
6. ✅ Phone number
7. ❌ Email (removed - causes SMS issues)

---

## 🔄 How It Works

### When User Clicks SOS (Offline):

```
1. User clicks SOS button
2. Selects agency (PNP, BFP, MDRRMO, LGU, BARANGAY, ALL)
3. Confirms (3 second countdown)
4. SMS app opens with pre-filled message ✅
5. User presses SEND in SMS app ⚠️ (REQUIRED)
6. SMS sends to 09923150633
7. Gateway receives and forwards to backend
8. Backend creates SOS alert
9. Responders notified
```

**Important**: User MUST press SEND in SMS app (OS security requirement)

---

## 📊 Example Messages

```
SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567
SOS|PNP|14.599500,120.984200|123|Juan Dela Cruz|09171234567
SOS|BFP|14.600000,120.985000|456|Maria Santos|09181234567
SOS|MDRRMO|0,0|789|Pedro Reyes|09191234567
```

---

## ✅ Why Email Was Removed

### SMS Compatibility Issues
- `@` symbol can cause SMS parsing issues
- Some carriers block messages with email addresses
- SMS is meant for simple text, not email addresses
- Keeps message shorter and cleaner

### User Identification Still Reliable
- ✅ User ID (primary lookup - fastest)
- ✅ Phone number (secondary lookup)
- ✅ Name (human identification)
- ✅ Backend can get email from database using user ID

---

## 🎯 Backend Processing

```typescript
// Parse SMS
const [_, agency, coords, userId, name, phone] = message.split('|');

// Find user by ID (fast)
const user = await findUserById(userId);

// Or fallback to phone
if (!user) {
  user = await findUserByPhone(phone);
}

// Get email from database
const userEmail = user.email;

// Create SOS alert with all data
```

---

## 📱 User Alert Message

```
Title: 📱 SMS Ready to Send

Message:
Your emergency SMS is ready!

📱 To: 09923150633
📍 Location: Included
👤 Your info: Citizen Citizen

⚠️ IMPORTANT: Please press SEND in the SMS app 
to complete your emergency alert.

The message has been pre-filled with all your information.

Button: [OK]
```

---

## 🧪 Test Again

### Your Test Data
```
Message: SOS|ALL|13.174030,123.732330|6|Citizen Citizen|09171234567
To: 09923150633
```

**This should work now!**

1. SMS app opens with this message
2. Press SEND
3. SMS sends to gateway
4. Backend receives webhook
5. Backend finds user ID 6
6. Backend gets email from database
7. Creates SOS alert
8. Responders notified

---

## ✅ Summary

✅ **Simplified format**: Removed email (causes SMS issues)

✅ **Still complete**: User ID, name, phone, GPS, agency

✅ **Reliable identification**: User ID + phone number

✅ **Backend gets email**: From database using user ID

✅ **SMS-friendly**: No special characters that cause issues

✅ **Shorter message**: Faster to send, lower cost

Ready to test - just press SEND in the SMS app!
