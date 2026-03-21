# Test WebSocket Authentication - Quick Guide 🧪

## What Was Fixed

The mobile app was getting authentication error when connecting to WebSocket:
```
❌ [WebSocket] Authentication failed: {"message": "Authentication token required"}
```

**Root Cause**: Token wasn't being passed in the `auth` object during Socket.IO connection.

**Fix Applied**: Added `auth: { token: token }` to the socket connection options.

---

## Quick Test Steps

### 1. Start Backend Server
```powershell
cd MOBILE_APP/backend
npm run dev
```

Expected output:
```
✅ WebSocket server initialized
Server running on port 3001
```

### 2. Start Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

Then press `a` for Android or `i` for iOS.

### 3. Login to Mobile App
- Open the app on your device/emulator
- Login with any test user credentials

### 4. Check Console Logs

**Look for these SUCCESS messages:**

```
✅ [WebSocket] Auth token found and cleaned: eyJhbGc...
🔌 [WebSocket] Connection Details:
   API URL: http://192.168.43.25:3001/api/v1
   WebSocket URL: http://192.168.43.25:3001
   Path: /ws
✅ [WebSocket] CONNECTED SUCCESSFULLY!
   Socket ID: abc123xyz
   Transport: websocket
✅ [WebSocket] AUTHENTICATED SUCCESSFULLY!
   User ID: 1
🎉 [WebSocket] Ready to receive real-time updates!
```

**If you see these, authentication is working! ✅**

### 5. Test Real-Time Alerts

#### A. Open Web Admin
```
http://localhost:3000
```

#### B. Create New Alert
1. Go to Emergency Alerts page
2. Click "Create Alert"
3. Fill in alert details:
   - Title: "Test Real-Time Alert"
   - Severity: Critical
   - Alert Type: Typhoon
   - Description: "Testing WebSocket real-time updates"
4. Click "Create & Broadcast"

#### C. Check Mobile App

**Expected behavior:**
1. Alert appears immediately in HomeScreen critical alerts section
2. No need to pull down to refresh
3. Badge counter increments

**Expected console logs:**
```
📢 [WebSocket] NEW ALERT RECEIVED!
   Alert: {id: 94, title: "Test Real-Time Alert", ...}
🏠 [HomeScreen] Received new alert via WebSocket
📢 New alert received via WebSocket
```

### 6. Test Background Notifications

1. Put mobile app in background (press home button)
2. Create another alert from web admin
3. Check device for push notification

**Expected:**
- Push notification appears on device
- Notification title: "🚨 CRITICAL: Typhoon"
- Notification body: "Test Real-Time Alert"

---

## Troubleshooting

### ❌ Still Getting "Authentication token required"

**Check:**
1. Token is stored in AsyncStorage with key `safehaven_token`
2. Token is not expired (check JWT expiration)
3. Backend JWT_SECRET matches the one used to sign the token

**Fix:**
```typescript
// Check token in mobile app
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('safehaven_token');
console.log('Token:', token);
```

### ❌ Connection Timeout

**Check:**
1. Backend is running on `http://192.168.43.25:3001`
2. Mobile device can reach backend (same network)
3. Firewall not blocking port 3001

**Test connection:**
```powershell
# From mobile device browser
http://192.168.43.25:3001/api/v1/health
```

### ❌ Alerts Not Appearing in Real-Time

**Check:**
1. WebSocket is connected (green dot in notification bell)
2. Alert is being broadcast from backend
3. HomeScreen is listening for `new_alert` events

**Backend logs should show:**
```
📢 Broadcasting new alert: 94
```

**Mobile logs should show:**
```
📢 [WebSocket] NEW ALERT RECEIVED!
🏠 [HomeScreen] Received new alert via WebSocket
```

---

## Success Criteria ✅

- [x] Mobile app connects to WebSocket without authentication error
- [x] Console shows "AUTHENTICATED SUCCESSFULLY"
- [x] Creating alert from web admin appears immediately in mobile app
- [x] No manual refresh needed
- [x] Badge counter updates automatically
- [x] Push notification appears when app is in background

---

## What's Next?

Once WebSocket authentication is working:

1. **Test All Event Types**
   - New alerts
   - Alert updates
   - New incidents
   - New SOS alerts
   - Badge updates

2. **Test Reconnection**
   - Disconnect from network
   - Reconnect
   - Verify automatic reconnection

3. **Test Multiple Devices**
   - Connect multiple mobile devices
   - Verify all receive real-time updates

4. **Production Deployment**
   - Update backend URL to production
   - Test with production database
   - Verify SSL/TLS connection

---

## Quick Reference

### Backend WebSocket URL
- Local: `http://192.168.43.25:3001`
- Production: `https://safe-haven-backend-api.onrender.com`

### WebSocket Path
- `/ws`

### Authentication
- Token passed in `auth.token` object
- Token stored in AsyncStorage as `safehaven_token`

### Events
- `new_alert` - New emergency alerts
- `alert_updated` - Alert updates
- `new_incident` - New incident reports
- `new_sos` - New SOS alerts
- `badge_update` - Badge count updates
- `notification` - General notifications

---

**Status**: Ready for testing! 🚀
