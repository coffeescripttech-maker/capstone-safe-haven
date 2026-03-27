# Clear SOS Bell Cache - Quick Fix

## Problem
The SOS bell shows "No new SOS alerts" because it saved a timestamp when you clicked it, marking all alerts as "viewed".

## Quick Fix (Do This Now)

### Option 1: Clear localStorage in Browser Console
1. Open browser console (F12)
2. Run this command:
```javascript
// Clear the "last viewed" timestamp
const userId = JSON.parse(localStorage.getItem('safehaven_user')).id;
localStorage.removeItem(`sos_bell_last_viewed_${userId}`);
console.log('✅ SOS bell cache cleared! Refresh the page.');
```
3. Refresh the page (F5)
4. You should now see all 126 "sent" status alerts

### Option 2: Clear All localStorage
1. Open browser console (F12)
2. Run:
```javascript
localStorage.clear();
console.log('✅ All cache cleared! You will need to login again.');
```
3. Refresh and login again

### Option 3: Use Incognito/Private Window
1. Open a new incognito/private browser window
2. Go to: https://capstone-safe-haven.vercel.app/
3. Login
4. Check the SOS bell - should show all alerts

## Why This Happened

When you clicked the SOS bell, it ran this code:
```javascript
localStorage.setItem(`sos_bell_last_viewed_${userId}`, new Date().toISOString());
```

This saved the current time (e.g., "2026-03-27T12:37:04.451Z") as "last viewed".

Now when the component loads, it filters alerts:
```javascript
const newAlertsOnly = alerts.filter((alert) => {
  const alertTime = new Date(alert.created_at);
  return alertTime > lastViewed; // Only show alerts AFTER last viewed time
});
```

Since all 126 alerts were created BEFORE you clicked the bell, they're all filtered out!

## Permanent Fix (Already Done in Code)

I've updated the code to:
1. Start with current time for first-time users (not 5 minutes ago)
2. Only show truly NEW alerts (created after opening the page)
3. Better logging to debug issues

But this code needs to be deployed to Vercel to take effect.

## Test the Fix

After clearing localStorage:

1. **Refresh the page** - Should see alerts
2. **Click bell** - Badge resets to 0
3. **Send new SOS from mobile** - Badge should increment
4. **Check console** for:
   - `🚨 [SOS WebSocket] NEW SOS ALERT RECEIVED!`
   - Sound should play
   - Badge should increment

## Deploy Updated Code

To deploy the fixes I made:

```powershell
cd MOBILE_APP/web_app
git add .
git commit -m "Fix SOS notification bell badge count and sound"
git push
```

Vercel will auto-deploy the changes.
