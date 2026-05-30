# Auto-Navigation Troubleshooting Guide

## Issue: Route Not Showing

### Step 1: Check Browser Console
Open the browser developer tools (F12) and check the Console tab for messages:

**Expected Console Messages (Success):**
```
🔍 Checking for geolocation support...
✅ Geolocation supported, requesting position...
📍 User location obtained: { lat: X, lng: Y, accuracy: Z }
🗺️ MapViewer props: { ... }
✅ Map loaded, adding circle layer
🛣️ User location available, fetching route...
From: [lng, lat] To: [lng, lat]
✅ User location marker added
📡 Fetching from: https://api.mapbox.com/directions/...
📦 Route response: { ... }
✅ Route data: { distance: "X km", duration: "Y minutes", points: Z }
➕ Adding route to map
✅ Route layer added successfully
✅ Map bounds adjusted to show route
✅ Route displayed: Xkm, ~Y minutes
```

### Step 2: Common Issues & Solutions

#### Issue A: Location Permission Denied
**Console shows:**
```
❌ Geolocation error: { code: 1, message: "User denied Geolocation" }
⚠️ User denied location permission
```

**Solution:**
1. Look for location permission prompt in browser
2. Click "Allow" when browser asks for location access
3. If you already denied it:
   - **Chrome/Edge:** Click the lock icon in address bar → Site settings → Location → Allow
   - **Firefox:** Click the shield/lock icon → Permissions → Location → Allow
   - **Safari:** Safari menu → Settings for This Website → Location → Allow
4. Refresh the page

**Visual Indicator:**
You should see a yellow warning banner on the map:
```
⚠️ Location Access Required
Location permission denied. Please enable location access to see the route.
```

#### Issue B: Geolocation Not Supported
**Console shows:**
```
❌ Geolocation is not supported by this browser
```

**Solution:**
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Ensure you're using HTTPS (not HTTP) - geolocation requires secure context
- Check if browser is up to date

#### Issue C: Location Unavailable
**Console shows:**
```
❌ Geolocation error: { code: 2, message: "Position unavailable" }
⚠️ Location information unavailable
```

**Solution:**
- Check if device location services are enabled (Windows/Mac settings)
- Try moving to a location with better GPS signal
- Restart browser

#### Issue D: Mapbox API Error
**Console shows:**
```
❌ Error fetching route: HTTP error! status: 401
```

**Solution:**
- Check if `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Verify the Mapbox token is valid and has Directions API access
- Check Mapbox account quota/limits

**Console shows:**
```
❌ No routes found in response
```

**Solution:**
- The start and end points might be too far apart
- One of the locations might be in an area with no roads
- Try a different incident location

#### Issue E: Map Not Loading
**Console shows:**
```
❌ Map not initialized
```

**Solution:**
- Wait for the page to fully load
- Check internet connection
- Verify Mapbox token is valid
- Clear browser cache and reload

### Step 3: Test Location Manually

Open browser console and run:
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('✅ Location:', pos.coords),
  (err) => console.error('❌ Error:', err)
);
```

If this works, the issue is with the component. If it fails, the issue is with browser/device permissions.

### Step 4: Verify Mapbox Token

Check `.env.local` file:
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

Test the token:
```bash
curl "https://api.mapbox.com/directions/v5/mapbox/driving/120.5,16.0;121.0,16.5?access_token=YOUR_TOKEN"
```

Should return JSON with routes.

### Step 5: Check Network Tab

1. Open Developer Tools → Network tab
2. Filter by "mapbox"
3. Look for requests to `api.mapbox.com/directions`
4. Check if request is successful (200 status)
5. Check response data

### Step 6: Temporary Workaround

If auto-navigation isn't working, users can still:
1. Click "Open in Google Maps" button
2. Click "Navigate with Google" button
3. Use the map to see the incident location
4. Manually plan their route

## Testing Checklist

- [ ] Browser console shows no errors
- [ ] Location permission granted (check browser address bar)
- [ ] Green dot appears on map (your location)
- [ ] Orange marker appears (incident location)
- [ ] Blue line connects the two markers (route)
- [ ] Map auto-zooms to show entire route
- [ ] No warning banners appear

## Quick Test

1. Open incident detail page
2. Grant location permission when prompted
3. Wait 2-3 seconds
4. You should see:
   - ✅ Green dot (your location)
   - ✅ Orange marker (incident)
   - ✅ Blue route line
   - ✅ Map zoomed to show both

## Still Not Working?

1. Check all console messages and share them
2. Try in incognito/private mode
3. Try a different browser
4. Check if HTTPS is enabled
5. Verify device location services are on
6. Test with a different incident (different location)

## Browser-Specific Notes

### Chrome/Edge
- Most reliable for geolocation
- Clear site data: Settings → Privacy → Site Settings → View permissions and data stored across sites

### Firefox
- May need to enable `geo.enabled` in about:config
- Check permissions: about:permissions

### Safari
- Requires HTTPS
- Check System Preferences → Security & Privacy → Location Services

### Mobile Browsers
- Ensure location services are enabled in device settings
- May need to grant permission to browser app itself
- Works best in Chrome Mobile or Safari iOS
