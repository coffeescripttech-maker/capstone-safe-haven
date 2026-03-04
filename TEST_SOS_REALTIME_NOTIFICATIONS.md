# Test SOS Real-Time Notifications - Quick Guide

## Prerequisites
1. Backend server running on port 3001
2. Web app running on port 3000
3. Mobile app running (for sending SOS)
4. Admin/responder user logged into web portal

## Testing Steps

### 1. Start Servers
```powershell
# Terminal 1 - Backend
cd MOBILE_APP/backend
npm run dev

# Terminal 2 - Web App
cd MOBILE_APP/web_app
npm run dev

# Terminal 3 - Mobile App (optional)
cd MOBILE_APP/mobile
npm start
```

### 2. Login to Web Portal
1. Open http://localhost:3000
2. Login with admin or responder credentials
3. You should see the bell icon in the header (top right)

### 3. Test Notification Bell

#### A. Check Bell Icon
- **Expected**: Bell icon visible next to user dropdown
- **Location**: Top right corner of header
- **Style**: White background, gray icon, rounded

#### B. Send Test SOS Alert

**Option 1: From Mobile App**
1. Open mobile app
2. Login as a citizen user
3. Click SOS button on home screen
4. Select target agency (e.g., "All Agencies")
5. Confirm SOS alert

**Option 2: Direct API Call**
```powershell
# Get auth token first (login as citizen)
$token = "YOUR_CITIZEN_TOKEN"

# Send SOS alert
curl -X POST http://localhost:3001/api/v1/sos `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "latitude": 14.5995,
    "longitude": 120.9842,
    "message": "Test emergency - need immediate help!",
    "targetAgency": "all",
    "userInfo": {
      "name": "Test User",
      "phone": "+639123456789"
    }
  }'
```

#### C. Verify Notification
**Within 10 seconds, you should see:**
1. ✅ Sound plays (beep or notification sound)
2. ✅ Red badge appears on bell icon
3. ✅ Badge shows "1" (or count of new alerts)
4. ✅ Pulse animation around badge
5. ✅ Bell icon changes color on hover

#### D. Open Notification Dropdown
1. Click the bell icon
2. **Expected**:
   - Dropdown opens below bell
   - Shows the new SOS alert
   - Displays user name, message, time
   - Shows target agency with icon
   - Priority color indicator
   - "View All Alerts" button at bottom

#### E. Test Alert Actions
1. **Click on alert**: Should navigate to `/sos-alerts/{id}`
2. **Click "View All"**: Should navigate to `/sos-alerts`
3. **Click "Clear all"**: Should remove all notifications
4. **Click outside**: Should close dropdown

### 4. Test Auto-Refresh on SOS Page

1. Navigate to http://localhost:3000/sos-alerts
2. Send another SOS alert (from mobile or API)
3. **Expected**: Within 15 seconds, new alert appears in the list
4. **No loading spinner** (silent refresh)
5. Statistics update automatically

### 5. Test Role-Based Filtering

#### A. Test as PNP User
1. Login as PNP user
2. Send SOS with `targetAgency: "pnp"`
3. **Expected**: Notification appears
4. Send SOS with `targetAgency: "bfp"`
5. **Expected**: No notification (not for PNP)

#### B. Test as Admin
1. Login as admin user
2. Send SOS with any target agency
3. **Expected**: All notifications appear

### 6. Test Multiple Alerts

1. Send 3-5 SOS alerts quickly
2. **Expected**:
   - Badge shows correct count (e.g., "5")
   - Sound plays for each new alert
   - Dropdown shows all alerts (up to 10)
   - Most recent at top

### 7. Test Edge Cases

#### A. No New Alerts
1. Open dropdown
2. Click "Clear all"
3. **Expected**: "No new SOS alerts" message

#### B. Badge Overflow
1. Send 10+ alerts
2. **Expected**: Badge shows "9+"

#### C. Long Messages
1. Send alert with very long message
2. **Expected**: Message truncated with "..." (line-clamp-2)

#### D. Missing Location
1. Send alert without latitude/longitude
2. **Expected**: No location indicator shown

## Visual Verification

### Bell Icon States

#### No Notifications
```
┌─────┐
│ 🔔  │  ← Gray bell, no badge
└─────┘
```

#### New Notifications
```
┌─────┐
│ 🔔  │  ← Bell with red badge
│  (3)│  ← Pulse animation
└─────┘
```

### Dropdown Layout
```
┌─────────────────────────────────────┐
│ 🚨 SOS Alerts          [3 new]  [X] │ ← Header
├─────────────────────────────────────┤
│ 🔴 John Doe          🚨 ALL         │
│    Emergency - need help!           │
│    ⏰ 2:30 PM  📍 Location available│
│                                 👁️  │
├─────────────────────────────────────┤
│ 🟠 Jane Smith        🚒 BFP         │
│    Fire emergency!                  │
│    ⏰ 2:28 PM  📍 Location available│
│                                 👁️  │
├─────────────────────────────────────┤
│ Clear all          [View All Alerts]│ ← Footer
└─────────────────────────────────────┘
```

## Success Criteria

✅ Bell icon visible in header
✅ Polling starts automatically (check Network tab)
✅ New SOS triggers notification within 10 seconds
✅ Sound plays for new alerts
✅ Badge shows correct unread count
✅ Pulse animation works
✅ Dropdown opens/closes properly
✅ Alert preview shows all info
✅ Click alert navigates to details page
✅ "View All" navigates to SOS page
✅ "Clear all" removes notifications
✅ Auto-refresh works on SOS page (15 sec)
✅ Role-based filtering works
✅ No console errors

## Troubleshooting

### Issue: No sound playing
**Check**:
1. Browser audio not muted
2. Click page first (browsers require user interaction)
3. Check browser console for audio errors
4. Try different browser

**Solution**:
```javascript
// In browser console, test audio
const audio = new Audio();
audio.src = '/notification-sound.mp3';
audio.play();
```

### Issue: Notifications not appearing
**Check**:
1. Network tab - API calls every 10 seconds?
2. Backend running and accessible?
3. User has correct role permissions?
4. SOS alerts have 'sent' status?

**Debug**:
```powershell
# Check SOS alerts directly
curl http://localhost:3001/api/v1/admin/sos?status=sent `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Badge count wrong
**Check**:
1. Clear browser cache
2. Refresh page (Ctrl+F5)
3. Check lastCheckTime in component state

**Debug**:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Issue: Dropdown not closing
**Check**:
1. Click outside dropdown
2. Press Escape key
3. Check browser console for errors

## Performance Testing

### Network Activity
1. Open DevTools → Network tab
2. Filter by "sos"
3. **Expected**: Request every 10 seconds
4. **Size**: ~1-2 KB per request

### Memory Usage
1. Open DevTools → Performance Monitor
2. Let run for 5 minutes
3. **Expected**: Stable memory usage
4. **No memory leaks**

### CPU Usage
1. Open DevTools → Performance
2. Record for 30 seconds
3. **Expected**: Minimal CPU usage
4. **No performance issues**

## Browser Compatibility

Test in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Mac)
- ✅ Mobile browsers

## API Monitoring

### Check Backend Logs
```powershell
# In backend terminal, look for:
# - "SOS alert created by user X"
# - "Notifications sent for SOS alert X"
# - No errors
```

### Check API Responses
```powershell
# Get SOS alerts
curl http://localhost:3001/api/v1/admin/sos?status=sent `
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "status": "success",
  "data": {
    "alerts": [...],
    "total": 5
  }
}
```

## Common Issues

### 1. CORS Errors
**Solution**: Ensure backend CORS is configured for localhost:3000

### 2. 401 Unauthorized
**Solution**: Check token is valid, login again if needed

### 3. Empty Alerts Array
**Solution**: Ensure SOS alerts exist with 'sent' status

### 4. Polling Not Starting
**Solution**: Check useEffect dependencies, refresh page

## Next Steps After Testing

1. ✅ Verify all features work
2. ✅ Test with real users
3. ✅ Monitor performance
4. ✅ Gather feedback
5. ✅ Consider WebSocket upgrade (optional)

---

**Ready to Test!** 🚀

Start all servers and follow the testing steps above. The notification system should work seamlessly!
