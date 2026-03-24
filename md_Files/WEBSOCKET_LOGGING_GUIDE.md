# WebSocket Connection Logging Guide

## Overview
Comprehensive logging has been added to help debug WebSocket connections for real-time notifications (SOS, Incidents, Alerts).

## How to Check WebSocket Connection

### 1. Open Browser Console
- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I`
- **Firefox:** Press `F12` or `Ctrl+Shift+K`
- Go to the "Console" tab

### 2. Login to Web Admin Dashboard
When you login, you should see these logs:

```
🔵 [SOS WebSocket] Initializing connection...
🔵 [SOS WebSocket] API URL: http://localhost:3001
✅ [SOS WebSocket] Connected successfully!
✅ [SOS WebSocket] Socket ID: abc123xyz

🔵 [Incident WebSocket] Initializing connection...
🔵 [Incident WebSocket] API URL: http://localhost:3001
✅ [Incident WebSocket] Connected successfully!
✅ [Incident WebSocket] Socket ID: def456uvw
```

### 3. Visual Connection Indicator
Look at the notification bell icons in the header:
- **Green dot** at bottom-right = WebSocket connected ✅
- **Gray dot** at bottom-right = Polling mode only ⚠️

### 4. When SOS is Sent from Mobile App
You should see:

```
🚨 [SOS WebSocket] New SOS alert received!
🚨 [SOS WebSocket] Payload: { type: 'sos', data: {...} }
🚨 [SOS WebSocket] Updated alerts list: 1 alerts
🚨 [SOS WebSocket] Unread count: 1
🔊 [SOS WebSocket] Playing notification sound...
```

### 5. When Incident is Reported from Mobile App
You should see:

```
🔔 [Incident WebSocket] New incident received!
🔔 [Incident WebSocket] Payload: { type: 'incident', data: {...} }
🔔 [Incident WebSocket] Updated incidents list: 1 incidents
🔔 [Incident WebSocket] Unread count: 1
🔊 [Incident WebSocket] Playing notification sound...
```

## Troubleshooting

### Problem: No WebSocket Connection Logs

**Check 1: Token in localStorage**
```javascript
// In browser console, run:
localStorage.getItem('token')
```
- Should return a JWT token string
- If `null`, you need to login again

**Check 2: Backend is Running**
```bash
cd MOBILE_APP/backend
npm run dev
```
- Should see: `Server running on port 3001`
- Should see: `WebSocket server initialized`

**Check 3: Correct API URL**
```javascript
// In browser console, run:
console.log(process.env.NEXT_PUBLIC_API_URL)
```
- Should be: `http://localhost:3001` or your backend URL
- Check `.env.local` file in web_app folder

### Problem: Connection Error

**Error:** `🔴 [SOS WebSocket] Connection error: ...`

**Solutions:**
1. **CORS Issue** - Check backend allows your frontend origin
2. **Wrong URL** - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. **Backend Not Running** - Start backend with `npm run dev`
4. **Port Mismatch** - Backend should be on port 3001

### Problem: Connected but No Events Received

**Check Backend Logs:**
```bash
# In backend terminal, you should see:
✅ WebSocket broadcast sent for SOS 123
📢 Broadcasting new SOS: 123
```

**If you don't see backend logs:**
1. Backend might not be broadcasting
2. Check `backend/src/services/sos.service.ts` has WebSocket broadcast code
3. Rebuild backend: `npm run build`

### Problem: Gray Dot (Polling Mode)

**Reasons:**
1. WebSocket failed to connect
2. Token is invalid or expired
3. Backend WebSocket server not initialized
4. Network/firewall blocking WebSocket

**Fallback:**
- Polling still works (checks every 30 seconds)
- Not real-time but functional

## Log Prefixes Explained

| Prefix | Meaning |
|--------|---------|
| 🔵 | Info - Normal operation |
| ✅ | Success - Connection/operation succeeded |
| ❌ | Disconnected - Connection lost |
| 🔴 | Error - Something went wrong |
| 🚨 | SOS Alert - New SOS received |
| 🔔 | Incident - New incident received |
| 🔊 | Sound - Notification sound playing |
| 📡 | Event - WebSocket event received |
| 🔍 | Polling - HTTP polling check |
| ⚠️ | Warning - Non-critical issue |

## Testing WebSocket Connection

### Test 1: Send SOS from Mobile App
1. Login to mobile app as citizen
2. Go to SOS screen
3. Send SOS alert
4. Check web admin console for logs
5. Should see notification bell badge increment
6. Should hear notification sound

### Test 2: Report Incident from Mobile App
1. Login to mobile app as citizen
2. Go to "Report Incident"
3. Fill form and submit
4. Check web admin console for logs
5. Should see notification bell badge increment
6. Should hear notification sound

### Test 3: Check Backend Broadcast
```bash
# In backend terminal, watch for:
📢 Broadcasting new SOS: 123
📢 Broadcasting new incident: 456
```

## Backend Logging

### Enable Debug Logs
In `backend/src/services/websocket.service.ts`, logs are already enabled:

```typescript
logger.info(`📢 Broadcasting new SOS: ${sos.id}`);
logger.info(`📢 Broadcasting new incident: ${incident.id}`);
logger.info(`✅ User ${userId} authenticated via WebSocket`);
```

### Check Backend Console
When web admin connects:
```
✅ User 10 authenticated via WebSocket
👤 User 10 connected (Socket: abc123xyz)
```

When SOS is sent:
```
📢 Broadcasting new SOS: 123
```

When incident is reported:
```
📢 Broadcasting new incident: 456
```

## Network Tab Debugging

### Check WebSocket Connection in Network Tab
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Should see connection to `localhost:3001`
4. Click on it to see:
   - **Status:** 101 Switching Protocols
   - **Messages:** Real-time events

### WebSocket Messages
You should see messages like:
```json
{
  "type": "new_sos",
  "data": {
    "id": 123,
    "userId": 45,
    "message": "Emergency!",
    ...
  }
}
```

## Environment Variables

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Web Admin (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=http://192.168.43.25:3001
```

## Common Issues & Solutions

### Issue 1: "No token found in localStorage"
**Solution:** Login again to get a fresh token

### Issue 2: "Connection error: Invalid namespace"
**Solution:** Check API URL doesn't have `/api/v1` at the end

### Issue 3: "Connection error: Unauthorized"
**Solution:** Token is invalid or expired, login again

### Issue 4: Events received but no notification
**Solution:** Check browser console for JavaScript errors

### Issue 5: Sound not playing
**Solution:** 
- Check browser allows autoplay
- Check `/notification-sound.mp3` exists in public folder
- Fallback beep should still work

## Performance Monitoring

### Check Connection Health
```javascript
// In browser console:
// For SOS
console.log('SOS WebSocket:', socketRef.current?.connected);

// For Incidents  
console.log('Incident WebSocket:', socketRef.current?.connected);
```

### Monitor Event Frequency
All events are logged with timestamps, so you can see:
- How often events are received
- Latency between send and receive
- Any duplicate events

## Best Practices

1. **Keep Console Open** during testing
2. **Check Both** frontend and backend logs
3. **Test with Multiple** admin users
4. **Verify Badge Counts** match actual events
5. **Test Reconnection** by stopping/starting backend

## Quick Checklist

- [ ] Backend running on port 3001
- [ ] Web admin can login
- [ ] Console shows WebSocket connected (✅)
- [ ] Green dot visible on notification bells
- [ ] Mobile app can send SOS/incident
- [ ] Web admin receives notification instantly
- [ ] Badge count increments
- [ ] Notification sound plays
- [ ] Backend logs show broadcast messages

## Support

If WebSocket still not working after checking all above:
1. Share browser console logs
2. Share backend terminal logs
3. Check firewall/antivirus settings
4. Try different browser
5. Check network proxy settings
