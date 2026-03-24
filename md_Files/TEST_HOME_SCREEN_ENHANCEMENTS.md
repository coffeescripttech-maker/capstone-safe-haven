# Test Home Screen Enhancements - Quick Guide

## Prerequisites
1. Backend server running on port 3001
2. Mobile app running (Expo Go or development build)
3. User logged in with valid credentials
4. Location permissions granted

## Testing Steps

### 1. Start Backend Server
```powershell
cd MOBILE_APP/backend
npm run dev
```

### 2. Start Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

### 3. Test Features

#### A. Welcome Message in Widget
- **Expected**: See "Hello, {YourName}! 👋 Stay safe and informed" at the top of the main widget
- **Location**: Inside the date/time/location card (not separate)

#### B. Real-Time Clock
- **Expected**: Time updates every second
- **Format**: 12-hour with AM/PM (e.g., "10:30:45 AM")
- **Date**: Full format (e.g., "Wednesday, March 4, 2026")

#### C. Actual Location Address
- **Expected**: See actual address like "Quezon City, Metro Manila"
- **Not**: Just coordinates like "14.5995°, 120.9842°"
- **Also Shows**: Precise coordinates below the address
- **Test**: 
  1. Grant location permission if not already granted
  2. Wait a few seconds for reverse geocoding
  3. Should see city/municipality and province

#### D. Weather Information
- **Expected**: Weather card showing:
  - Weather icon/emoji (☀️, ⛅, 🌧️, etc.)
  - Current temperature (e.g., "28°C")
  - Weather description (e.g., "Partly cloudy")
  - Feels like temperature
  - Humidity percentage
  - Wind speed in km/h
- **Test**:
  1. Wait for weather to load (may take 2-3 seconds)
  2. Should see weather card below location
  3. Pull down to refresh and update weather

#### E. Pull-to-Refresh
- **Expected**: Updates both nearest center AND weather
- **Test**:
  1. Pull down on the home screen
  2. See refresh indicator
  3. Weather should update with latest data

## Troubleshooting

### Weather Not Showing
**Possible Causes**:
1. Backend not running
2. Weather API endpoint not accessible
3. Network connection issue
4. Location not available

**Check**:
```powershell
# Test weather endpoint directly
curl "http://localhost:3001/api/v1/admin/weather/location?lat=14.5995&lon=120.9842" -H "Authorization: Bearer YOUR_TOKEN"
```

### Location Shows Coordinates Only
**Possible Causes**:
1. Reverse geocoding API rate limit
2. Network issue
3. Invalid coordinates

**Solution**:
- Wait a few seconds and pull to refresh
- Check internet connection
- Nominatim API has 1 request/second limit

### Backend Errors
**Check Backend Logs**:
```powershell
# In backend terminal, look for:
# - "Error fetching weather"
# - "Reverse geocoding error"
```

### Mobile App Errors
**Check Metro Bundler**:
- Look for red error screens
- Check console for API errors
- Verify API_CONFIG.BASE_URL in mobile/src/constants/config.ts

## Expected API Calls

When home screen loads with location:
1. `GET /api/v1/admin/weather/location?lat={lat}&lon={lon}` - Weather data
2. `GET /api/v1/centers/nearby?lat={lat}&lng={lon}&radius=50` - Nearest center
3. Nominatim reverse geocoding (external API)

## Visual Verification

### Widget Should Look Like:
```
┌─────────────────────────────────────┐
│ 🛡️ Hello, John! 👋                  │
│    Stay safe and informed           │
├─────────────────────────────────────┤
│ 10:30:45 AM                         │
│ Wednesday, March 4, 2026            │
├─────────────────────────────────────┤
│ 📍 Current Location                 │
│ Quezon City, Metro Manila           │
│ 14.676041°N, 121.043701°E          │
├─────────────────────────────────────┤
│ ⛅  28°C                            │
│     Partly cloudy                   │
│ ┌─────────────────────────────────┐ │
│ │ Feels like  Humidity  Wind      │ │
│ │   30°C        75%     13 km/h   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Success Criteria

✅ Welcome message appears in main widget (not separate)
✅ Time updates every second
✅ Date shows full format
✅ Location shows actual address (not just coordinates)
✅ Coordinates still visible for reference
✅ Weather icon and temperature display
✅ Weather description shows
✅ Weather details (feels like, humidity, wind) visible
✅ Pull-to-refresh updates weather
✅ No console errors
✅ Smooth performance

## Common Issues

### Issue: "Loading weather..." never completes
**Solution**: 
- Check backend is running
- Verify weather route is accessible
- Check network connection

### Issue: Address shows "Location unavailable"
**Solution**:
- Check internet connection
- Wait and try pull-to-refresh
- Nominatim API may be rate-limited

### Issue: Weather shows old data
**Solution**:
- Pull down to refresh
- Weather updates on location change and manual refresh

### Issue: Widget looks cramped
**Solution**:
- This is expected - we consolidated to save space
- All information is still accessible
- Scroll down for more content

## Performance Notes

- Weather API call: ~500ms - 2s
- Reverse geocoding: ~500ms - 1s
- Time updates: Every 1 second (minimal performance impact)
- Total initial load: ~2-3 seconds for all data

## Next Test Scenarios

1. **Different Locations**: Move to different areas and verify address changes
2. **Different Weather**: Test in different weather conditions
3. **Offline Mode**: Test behavior when offline
4. **Permission Denied**: Test when location permission is denied
5. **Slow Network**: Test with slow 3G connection

---

**Ready to Test!** 🚀

Start the backend and mobile app, then verify each feature works as expected.
