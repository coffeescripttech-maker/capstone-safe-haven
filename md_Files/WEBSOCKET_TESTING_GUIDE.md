# WebSocket Real-Time Testing Guide

## Overview

This guide walks you through testing the real-time WebSocket notification system step-by-step.

## Prerequisites

✅ Dependencies installed (socket.io, socket.io-client)
✅ Backend code updated (server.ts, alert.service.ts)
✅ Mobile code updated (App.tsx)
✅ Test credentials: admin@test.safehaven.com / Test123!

## Testing Flow

### Phase 1: Start Backend

```powershell
cd MOBILE_APP/backend
npm run dev
```

**Look for these logs:**
```
✅ WebSocket server initialized
SafeHaven API Server running on port 3001
WebSocket server ready at ws://localhost:3001/ws
```

✅ If you see these logs, backend is ready!

### Phase 2: Start Mobile App

```powershell
cd MOBILE_APP/mobile
npx expo start --clear
```

Press `a` for Android or `i` for iOS

**Look for these logs:**
```
🚀 App starting...
✅ All modules loaded successfully
```

✅ If you see these logs, mobile app is ready!

### Phase 3: Login to Mobile App

1. Open app on device/emulator
2. Login with:
   - Email: `admin@test.safehaven.com`
   - Password: `Test123!`

**Look for these logs in mobile console:**
```
🔌 Connecting to WebSocket: http://192.168.43.25:3001
✅ WebSocket connected
✅ WebSocket authenticated: 11
```

**Look for these logs in backend console:**
```
🔌 New WebSocket connection: <socket-id>
✅ User 11 authenticated on socket <socket-id>
```

✅ If you see both sets of logs, WebSocket is connected!

### Phase 4: Test Real-Time Alert

Keep mobile app open and visible, then run:

```powershell
cd MOBILE_APP
.\test-realtime-quick.ps1
```

**What happens:**

1. **Script runs** (2 seconds)
   ```
   🧪 Testing Real-Time WebSocket Notifications
   Step 1: Login as admin...
   ✅ Login successful
   Step 2: Creating test alert...
   ⏱️  Check your mobile app - alert should appear in < 1 second!
   ```

2. **Backend broadcasts** (< 100ms)
   ```
   📢 Broadcasting new alert: 123
   ```

3. **Mobile receives** (< 100ms)
   ```
   📢 Received new alert: {...}
   ```

4. **UI updates** (< 500ms)
   - Alert appears in list
   - Badge counter increments
   - No refresh needed!

**Total time: < 1 second from creation to display!**

✅ If alert appears instantly, real-time is working!

## Detailed Verification

### Backend Logs to Check

```
[timestamp] info: SafeHaven API Server running on port 3001
[timestamp] info: WebSocket server ready at ws://localhost:3001/ws
[timestamp] info: ✅ WebSocket server initialized
[timestamp] info: 🔌 New WebSocket connection: abc123def456
[timestamp] info: ✅ User 11 authenticated on socket abc123def456
[timestamp] info: 📢 Broadcasting new alert: 123
```

### Mobile Logs to Check

```
🚀 App starting...
✅ All modules loaded successfully
🔌 User authenticated, connecting to WebSocket...
🔌 Connecting to WebSocket: http://192.168.43.25:3001
✅ WebSocket connected
✅ WebSocket authenticated: 11
📢 Received new alert: {
  id: 123,
  title: "Real-Time Test Alert - 14:30:45",
  severity: "high",
  ...
}
```

### Mobile UI to Check

1. **Alerts Screen**
   - New alert appears at top of list
   - Shows correct title, severity, time
   - No loading spinner
   - No pull-to-refresh needed

2. **Badge Counter**
   - Home screen badge increments
   - Shows correct count
   - Updates automatically

3. **Performance**
   - Alert appears in < 1 second
   - No lag or delay
   - Smooth animation

## Test Scenarios

### Scenario 1: Basic Real-Time Alert

**Steps:**
1. Login to mobile app
2. Navigate to Alerts screen
3. Run `test-realtime-quick.ps1`
4. Watch alert appear instantly

**Expected:**
- Alert appears in < 1 second
- Badge counter updates
- No refresh needed

### Scenario 2: Multiple Alerts

**Steps:**
1. Run `test-realtime-quick.ps1` multiple times
2. Watch each alert appear

**Expected:**
- Each alert appears instantly
- Badge counter increments each time
- All alerts visible in list

### Scenario 3: Reconnection

**Steps:**
1. Login to mobile app
2. Stop backend server
3. Mobile shows disconnected
4. Start backend server
5. Mobile reconnects automatically

**Expected:**
- Mobile detects disconnection
- Attempts to reconnect
- Reconnects within 2 seconds
- Continues receiving alerts

**Mobile Logs:**
```
🔌 WebSocket disconnected: transport close
🔄 WebSocket reconnect attempt 1
✅ WebSocket connected
✅ WebSocket authenticated: 11
```

### Scenario 4: Background/Foreground

**Steps:**
1. Login to mobile app
2. Put app in background
3. Run `test-realtime-quick.ps1`
4. Bring app to foreground

**Expected:**
- Push notification received in background
- Alert visible when app opens
- Badge counter updated

### Scenario 5: Multiple Users

**Steps:**
1. Login on Device A
2. Login on Device B (different user)
3. Run `test-realtime-quick.ps1`
4. Both devices receive alert

**Expected:**
- Both devices show alert instantly
- Both badge counters update
- No interference between users

## Performance Benchmarks

### Latency Test

| Step | Target | Actual |
|------|--------|--------|
| Alert created | 0ms | 0ms |
| Backend broadcast | < 50ms | ? |
| Mobile receives | < 100ms | ? |
| UI updates | < 500ms | ? |
| **Total** | **< 1 second** | **?** |

### Connection Test

| Metric | Target | Actual |
|--------|--------|--------|
| Initial connection | < 500ms | ? |
| Authentication | < 200ms | ? |
| Reconnection | < 2 seconds | ? |
| Message delivery | < 100ms | ? |

## Troubleshooting

### Problem: No WebSocket Connection

**Symptoms:**
- No "✅ WebSocket connected" in logs
- Alerts don't appear automatically

**Debug Steps:**
1. Check backend is running:
   ```powershell
   curl http://192.168.43.25:3001/health
   ```

2. Check mobile API_URL:
   ```powershell
   cat MOBILE_APP/mobile/.env | Select-String API_URL
   ```

3. Check firewall:
   ```powershell
   Test-NetConnection -ComputerName 192.168.43.25 -Port 3001
   ```

4. Restart both services

### Problem: Connection Drops

**Symptoms:**
- "🔌 WebSocket disconnected" in logs
- Frequent reconnection attempts

**Debug Steps:**
1. Check network stability
2. Use WiFi instead of mobile data
3. Check backend logs for errors
4. Increase timeout in websocket.service.ts

### Problem: Alerts Not Appearing

**Symptoms:**
- WebSocket connected
- No alerts showing up

**Debug Steps:**
1. Check backend logs for "📢 Broadcasting"
2. Check mobile logs for "📢 Received"
3. Verify RealtimeProvider in App.tsx
4. Check alert has `is_active = true`
5. Restart mobile with `--clear`

## Success Indicators

✅ **Backend**
- WebSocket server initialized
- Accepts connections
- Authenticates users
- Broadcasts alerts

✅ **Mobile**
- Connects to WebSocket
- Authenticates successfully
- Receives messages
- Updates UI automatically

✅ **User Experience**
- Alerts appear instantly (< 1 second)
- No manual refresh needed
- Badge counters update automatically
- Smooth, responsive UI

## Comparison: Before vs After

### Before (Polling)
```
User opens app
  ↓
App polls API every 30 seconds
  ↓
User waits 0-30 seconds
  ↓
Alert appears
```
**Delay: 0-30 seconds**

### After (WebSocket)
```
Alert created
  ↓
Backend broadcasts (< 50ms)
  ↓
Mobile receives (< 100ms)
  ↓
UI updates (< 500ms)
  ↓
Alert appears
```
**Delay: < 1 second**

## Next Steps

After successful testing:

1. ✅ Verify all test scenarios pass
2. ✅ Monitor performance metrics
3. ✅ Test with multiple users
4. ✅ Test reconnection scenarios
5. ⏳ Deploy to staging
6. ⏳ Load testing
7. ⏳ Production deployment

## Summary

The real-time WebSocket system provides instant alert notifications, which is critical for emergency response. Follow this guide to verify everything works correctly before deploying to production.

**Key Metrics:**
- Alert delivery: < 1 second
- Connection time: < 500ms
- Reconnection: < 2 seconds
- Battery impact: Minimal

**Status**: Ready for Testing 🚀
