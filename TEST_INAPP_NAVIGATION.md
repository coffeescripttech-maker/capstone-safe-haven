# 🗺️ Test In-App Navigation - Quick Guide

## What to Test
The "Get Directions" button now shows routes INSIDE the app using Mapbox.

## Prerequisites
✅ Mapbox token configured in `app.json` and `.env`
✅ Location permission granted on device
✅ Internet connection (for route fetching)

## Testing Steps

### 1. Clear Metro Cache
```bash
cd MOBILE_APP/mobile
npm start -- --clear
```

### 2. Open App on Device
- Launch SafeHaven app
- Navigate to "Evacuation Centers"
- Select any center

### 3. Test "Get Directions" Button
1. Click the blue "Get Directions" button
2. Grant location permission when prompted
3. Wait for route to load (~1-2 seconds)

### 4. Verify Route Display
✅ **Blue polyline** showing route from your location to center
✅ **Two markers**:
   - Blue pin = Your location
   - Colored pin = Evacuation center (Green/Yellow/Red)
✅ **Route info overlay** at top of map:
   - Distance (e.g., "2.5 km")
   - Duration (e.g., "8 mins")

### 5. Test Button States
- **Before click**: Shows "Get Directions" with navigate icon
- **During load**: Shows spinner + "Loading..."
- **After load**: Returns to "Get Directions"

### 6. Test Error Handling

#### Permission Denied
1. Deny location permission
2. Should show alert: "Permission Required"
3. Offers "Open in Maps" as fallback

#### No Route Found
- If Mapbox can't find route
- Shows alert: "Route Not Found"
- Offers "Open in Maps" as fallback

## Expected Behavior

### Success Case
```
1. User clicks "Get Directions"
2. Permission granted
3. Location fetched
4. Route calculated
5. Blue line appears on map
6. Distance/duration shown
7. Alert: "🗺️ Route Found - Distance: 2.5 km, Time: 8 mins"
```

### Fallback Case
```
1. User clicks "Get Directions"
2. Permission denied OR route fails
3. Alert offers "Open in Maps"
4. Opens Google Maps externally
```

## Visual Checklist

- [ ] Blue route line visible
- [ ] User location marker (blue)
- [ ] Center marker (colored)
- [ ] Distance displayed
- [ ] Duration displayed
- [ ] Loading spinner works
- [ ] Fallback to Google Maps works

## Troubleshooting

### Route Not Showing
1. Check internet connection
2. Verify Mapbox token in `app.json`
3. Check console for errors
4. Try clearing Metro cache

### Permission Issues
1. Go to device Settings > Apps > SafeHaven
2. Enable Location permission
3. Restart app

### Map Not Loading
1. Verify Google Maps API key in `app.json`
2. Check if map shows before clicking button
3. Try restarting app

## Debug Info

Check console logs for:
- `📍 Getting current location...`
- `✅ Current location: {...}`
- `🗺️ Fetching route...`
- `✅ Route loaded successfully`

## Success Criteria

✅ Route displays in-app (no external app)
✅ Distance and duration accurate
✅ Loading states work correctly
✅ Fallback to Google Maps available
✅ Permission handling works
✅ No crashes or errors

---

**Ready to Test!** 🚀
