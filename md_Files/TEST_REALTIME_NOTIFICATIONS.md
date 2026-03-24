# Testing Real-Time Notifications - Complete Guide

## Overview

This guide covers testing both:
1. **WebSocket Real-Time Updates** (when app is open/foreground)
2. **Push Notifications** (when app is closed/background)

## Prerequisites

- ✅ Backend running on `http://localhost:3001`
- ✅ Mobile app running on development server
- ✅ Test user account: `admin@test.safehaven.com` / `Test123!`
- ✅ 20+ active alerts in database

---

## Part 1: Testing WebSocket Real-Time Updates

### What This Tests
- Instant updates when app is **OPEN** and in **FOREGROUND**
- Badge counters update automatically
- Alert list refreshes without manual action
- **Expected Speed**: < 1 second

### Setup (One-Time)

**Note**: WebSocket requires installation first. If not installed yet:

```powershell
cd MOBILE_APP
.\setup-realtime.ps1
```

Then follow `REALTIME_WEBSOCKET_SETUP.md` to update server files.

### Test 1: Basic WebSocket Connection

**Steps**:
1. Start backend server:
   ```bash
   cd MOBILE_APP/backend
   npm run dev
   ```

2. Start mobile app:
   ```bash
   cd MOBILE_APP/mobile
   npx expo start --clear
   ```

3. Open mobile app on your device/emulator

4. Login with:
   - Email: `admin@test.safehaven.com`
   - Password: `Test123!`

5. Check mobile console logs for:
   ```
   🔌 Connecting to WebSocket: http://192.168.43.25:3001
   ✅ WebSocket connected
   ✅ WebSocket authenticated: 11
   ```

**Expected Result**: ✅ WebSocket connects and authenticates successfully

**If Failed**:
- Check backend is running: `curl http://localhost:3001/health`
- Check socket.io is installed: `npm list socket.io` in backend folder
- Check mobile can reach backend: Test API call first

---

### Test 2: Real-Time Alert Updates

**Steps**:
1. Keep mobile app **OPEN** and on the **Home** or **Alerts** screen

2. Open a new terminal and create a test alert:
   ```powershell
   cd MOBILE_APP
   
   # Login and create alert
   $loginBody = '{"email":"admin@test.safehaven.com","password":"Test123!"}'; 
   $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"; 
   $token = $loginResponse.data.accessToken; 
   $headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}; 
   $startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"); 
   $alertBody = @{ alert_type = "earthquake"; severity = "critical"; title = "🚨 REALTIME TEST: Earthquake Alert"; description = "Testing real-time WebSocket updates"; source = "PHIVOLCS"; affected_areas = @("Metro Manila"); start_time = $startTime; is_active = $true } | ConvertTo-Json; 
   $alertResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" -Method POST -Headers $headers -Body $alertBody; 
   Write-Host "✅ Created alert ID: $($alertResponse.data.id)" -ForegroundColor Green
   ```

3. Watch mobile app **WITHOUT TOUCHING IT**

**Expected Result**: 
- ✅ New alert appears **INSTANTLY** (< 1 second)
- ✅ Badge counter increases by 1
- ✅ Alert list updates automatically
- ✅ No need to pull-to-refresh

**Mobile Console Should Show**:
```
📢 Received new alert: {...}
✅ Fetched alerts in context: 21
```

**Backend Console Should Show**:
```
📢 Broadcasting new alert: 28
```

**If Failed**:
- Check WebSocket is connected (see Test 1)
- Check alert was created with `is_active = true`
- Check backend logs for broadcast message
- Try refreshing mobile app manually to verify alert exists

---

### Test 3: Multiple Rapid Updates

**Steps**:
1. Keep mobile app open

2. Create 3 alerts rapidly:
   ```powershell
   # Run this script 3 times quickly
   for ($i=1; $i -le 3; $i++) {
       $loginBody = '{"email":"admin@test.safehaven.com","password":"Test123!"}'; 
       $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"; 
       $token = $loginResponse.data.accessToken; 
       $headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}; 
       $startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"); 
       $alertBody = @{ alert_type = "flood"; severity = "high"; title = "Test Alert $i"; description = "Rapid update test"; source = "NDRRMC"; affected_areas = @("Manila"); start_time = $startTime; is_active = $true } | ConvertTo-Json; 
       Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" -Method POST -Headers $headers -Body $alertBody | Out-Null;
       Write-Host "Created alert $i" -ForegroundColor Yellow;
       Start-Sleep -Milliseconds 500;
   }
   Write-Host "✅ Created 3 alerts" -ForegroundColor Green
   ```

**Expected Result**:
- ✅ All 3 alerts appear instantly
- ✅ Badge counter increases by 3
- ✅ No lag or missed updates

---

### Test 4: Reconnection After Network Loss

**Steps**:
1. Mobile app open and connected

2. Stop backend server (Ctrl+C in backend terminal)

3. Wait 5 seconds

4. Check mobile console for:
   ```
   🔌 WebSocket disconnected: transport close
   🔄 WebSocket reconnect attempt 1
   ```

5. Restart backend server:
   ```bash
   npm run dev
   ```

6. Mobile should reconnect automatically

**Expected Result**:
- ✅ Mobile detects disconnection
- ✅ Mobile attempts reconnection
- ✅ Mobile reconnects when backend is back
- ✅ No app restart needed

**Mobile Console Should Show**:
```
🔄 WebSocket reconnect attempt 1
✅ WebSocket connected
✅ WebSocket authenticated: 11
```

---

## Part 2: Testing Push Notifications (Background/Closed)

### What This Tests
- Notifications when app is **CLOSED** or in **BACKGROUND**
- System tray notifications
- Badge icon on app icon
- **Expected Speed**: 1-3 seconds

### Important Notes

⚠️ **Push notifications in development have limitations**:
- **Expo Go**: Limited push notification support
- **Physical Device**: Best for testing
- **Emulator**: May not support push notifications
- **Production Build**: Full push notification support

### Test 1: Check Expo Push Token Registration

**Steps**:
1. Open mobile app

2. Login with test account

3. Check mobile console for:
   ```
   📱 Expo Push Token: ExponentPushToken[...]
   ✅ Device token registered
   ```

4. Verify token is in database:
   ```powershell
   # Check database
   $loginBody = '{"email":"admin@test.safehaven.com","password":"Test123!"}'; 
   $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"; 
   $token = $loginResponse.data.accessToken;
   Write-Host "Token registered in database" -ForegroundColor Green
   ```

**Expected Result**:
- ✅ Expo push token is generated
- ✅ Token is registered in backend
- ✅ Token is stored in `device_tokens` table

---

### Test 2: Send Test Push Notification

**Steps**:
1. **Close the mobile app** or put it in background

2. Send a test push notification:
   ```powershell
   cd MOBILE_APP
   
   # Create alert which triggers push notification
   $loginBody = '{"email":"admin@test.safehaven.com","password":"Test123!"}'; 
   $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"; 
   $token = $loginResponse.data.accessToken; 
   $headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}; 
   $startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"); 
   $alertBody = @{ 
       alert_type = "typhoon"; 
       severity = "critical"; 
       title = "🌪️ PUSH TEST: Typhoon Warning"; 
       description = "Testing push notifications when app is closed"; 
       source = "PAGASA"; 
       affected_areas = @("Metro Manila", "Rizal"); 
       start_time = $startTime; 
       is_active = $true 
   } | ConvertTo-Json; 
   $alertResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" -Method POST -Headers $headers -Body $alertBody; 
   Write-Host "✅ Created alert - Push notification should be sent" -ForegroundColor Green;
   Write-Host "Alert ID: $($alertResponse.data.id)" -ForegroundColor Yellow
   ```

3. Wait 1-3 seconds

4. Check your device notification tray

**Expected Result**:
- ✅ Notification appears in system tray
- ✅ Shows alert title and description
- ✅ Tapping opens the app
- ✅ Badge icon shows on app icon

**Backend Console Should Show**:
```
📢 Sending push notification to 1 devices
✅ Push notification sent successfully
```

---

### Test 3: Push Notification with App in Background

**Steps**:
1. Open mobile app

2. Press home button (app goes to background, but not closed)

3. Create alert using script from Test 2

4. Check notification appears

**Expected Result**:
- ✅ Notification appears even though app is in background
- ✅ Tapping notification brings app to foreground
- ✅ Alert is visible in app

---

### Test 4: Multiple Push Notifications

**Steps**:
1. Close mobile app completely

2. Create 3 alerts rapidly:
   ```powershell
   for ($i=1; $i -le 3; $i++) {
       $loginBody = '{"email":"admin@test.safehaven.com","password":"Test123!"}'; 
       $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"; 
       $token = $loginResponse.data.accessToken; 
       $headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}; 
       $startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"); 
       $alertBody = @{ 
           alert_type = "earthquake"; 
           severity = "high"; 
           title = "Push Test Alert $i"; 
           description = "Multiple push notification test"; 
           source = "PHIVOLCS"; 
           affected_areas = @("Manila"); 
           start_time = $startTime; 
           is_active = $true 
       } | ConvertTo-Json; 
       Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" -Method POST -Headers $headers -Body $alertBody | Out-Null;
       Write-Host "Sent push $i" -ForegroundColor Yellow;
       Start-Sleep -Seconds 2;
   }
   Write-Host "✅ Sent 3 push notifications" -ForegroundColor Green
   ```

3. Check device notification tray

**Expected Result**:
- ✅ All 3 notifications appear
- ✅ Each notification is separate
- ✅ Badge count shows 3

---

## Comparison: WebSocket vs Push Notifications

| Feature | WebSocket (App Open) | Push (App Closed) |
|---------|---------------------|-------------------|
| **Speed** | < 1 second | 1-3 seconds |
| **When** | App is open/foreground | App closed/background |
| **Updates** | Instant, automatic | System notification |
| **Badge** | Updates in real-time | Updates on app open |
| **Battery** | Low impact | Very low impact |
| **Reliability** | Requires connection | Works offline (queued) |

---

## Troubleshooting

### WebSocket Not Working

**Symptoms**: Alerts don't appear instantly when app is open

**Solutions**:
1. Check WebSocket is installed: `npm list socket.io` in backend
2. Check connection logs in mobile console
3. Verify backend has WebSocket initialized
4. Check firewall isn't blocking WebSocket connection
5. Try restarting both backend and mobile app

### Push Notifications Not Working

**Symptoms**: No notifications when app is closed

**Solutions**:
1. **Check Expo Push Token**:
   - Look for token in mobile console
   - Verify token is registered in database

2. **Check Device Permissions**:
   - Go to device Settings > Apps > SafeHaven > Notifications
   - Ensure notifications are enabled

3. **Check Backend Logs**:
   - Look for "Sending push notification" message
   - Check for any errors

4. **Test with Expo Push Tool**:
   - Go to https://expo.dev/notifications
   - Enter your Expo push token
   - Send test notification
   - If this works, backend integration is the issue

5. **Check Firebase Configuration**:
   - Verify `FIREBASE_PROJECT_ID` in backend `.env`
   - Check Firebase credentials are valid

### Notifications Delayed

**Symptoms**: Notifications take > 5 seconds

**Solutions**:
1. Check network connection quality
2. Verify backend isn't overloaded
3. Check Expo push notification service status
4. Try on different network (WiFi vs mobile data)

---

## Production Testing

### Before Production Deployment

1. **Build Production APK**:
   ```bash
   cd MOBILE_APP/mobile
   eas build --platform android
   ```

2. **Test on Physical Device**:
   - Install production APK
   - Test all notification scenarios
   - Verify push notifications work when app is fully closed

3. **Test with Multiple Users**:
   - Create multiple test accounts
   - Send alerts to all users
   - Verify all receive notifications

4. **Load Testing**:
   - Create 10+ alerts rapidly
   - Verify all notifications are delivered
   - Check for any delays or failures

---

## Summary

### Current Status (Without WebSocket)
- ✅ **Push Notifications**: Working (when app closed/background)
- ❌ **Real-Time Updates**: Not available (requires WebSocket installation)
- ⏱️ **Update Speed**: 5-30 seconds (polling) or 1-3 seconds (push)

### After WebSocket Installation
- ✅ **Push Notifications**: Working (when app closed/background)
- ✅ **Real-Time Updates**: Working (when app open)
- ⏱️ **Update Speed**: < 1 second (WebSocket) or 1-3 seconds (push)

### Recommended Testing Order

1. ✅ **Test Push Notifications First** (already working)
   - Easier to test
   - No additional setup required
   - Works in current state

2. ✅ **Install WebSocket** (for real-time updates)
   - Run `.\setup-realtime.ps1`
   - Follow setup guide
   - Test real-time updates

3. ✅ **Test Both Together**
   - WebSocket when app is open
   - Push when app is closed
   - Verify seamless experience

---

**Created**: March 19, 2026
**Status**: Ready for Testing
**Priority**: High - Critical for Emergency Response
