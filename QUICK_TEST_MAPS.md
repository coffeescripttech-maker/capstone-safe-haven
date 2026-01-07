# 🗺️ Quick Test Guide - Maps Feature

## Start the App

```bash
cd mobile
npm start
```

Then press `a` for Android or scan QR code with Expo Go.

---

## Test Checklist

### 1. Centers Map View ✅
1. Open app and go to **Centers** tab
2. You should see a map (default view)
3. **Expected**: Map loads with center markers

### 2. Tap Markers ✅
1. Tap any center marker on the map
2. **Expected**: Info card slides up from bottom
3. **Expected**: Card shows center name, address, capacity
4. **Expected**: Status badge shows "Available" or "Full"

### 3. View Center Details ✅
1. From the info card, tap "View Details"
2. **Expected**: Navigate to Center Details screen
3. **Expected**: See map preview at top
4. **Expected**: See full center information
5. **Expected**: See capacity bar with color
6. **Expected**: See facilities chips
7. **Expected**: See Call and Directions buttons

### 4. Switch to List View ✅
1. From map, tap the list icon (top right)
2. **Expected**: Navigate to Centers List screen
3. **Expected**: See list of centers with distances
4. **Expected**: See map icon in header

### 5. Back to Map View ✅
1. From list, tap map icon in header
2. **Expected**: Navigate back to map
3. **Expected**: Map shows all centers again

### 6. My Location Button ✅
1. On map, tap the location icon (below list button)
2. **Expected**: Map centers on your location
3. **Expected**: Blue dot shows your position
4. **Expected**: Blue circle shows 5km radius

### 7. Alert Details ✅
1. Go to **Alerts** tab
2. Tap any alert card
3. **Expected**: Navigate to Alert Details screen
4. **Expected**: See affected area on map (colored circle)
5. **Expected**: Circle color matches severity
6. **Expected**: See full alert information
7. **Expected**: See timeline, source, metadata

### 8. Call & Directions ✅
1. Go to Center Details screen
2. Tap "Call" button
3. **Expected**: Phone dialer opens
4. Tap "Directions" button
5. **Expected**: Google Maps opens with directions

---

## What You Should See

### Centers Map
- 🗺️ Interactive map
- 📍 Green/orange/red markers for centers
- 🔵 Blue dot for your location
- 🔵 Blue circle (5km radius)
- 📱 Info card when tapping markers

### Center Details
- 🗺️ Static map preview
- 📊 Capacity bar (color-coded)
- 🏥 Facilities chips with icons
- 📞 Call button (green)
- 🧭 Directions button (blue)

### Alert Details
- 🗺️ Affected area visualization
- 🎨 Color-coded circle (severity)
- 📋 Full alert information
- ⏰ Timeline with dates
- 📡 Source information

---

## Common Issues

### Map is blank/gray
**Normal in Expo Go** - Maps work but without custom styling. For full features, use development build.

### Markers not showing
- Check if backend is running
- Check if centers have valid coordinates
- Check console for errors

### "My Location" not working
- Grant location permission when prompted
- Check if location services are enabled on device

### Navigation not working
- Make sure you're tapping the correct buttons
- Check console for navigation errors

---

## Expected Behavior

### Marker Colors
- 🟢 Green = Available (< 70% full)
- 🟠 Orange = Filling up (70-90% full)
- 🔴 Red = Full (> 90% full)

### Navigation Flow
```
Centers Tab → Map View
  ├─ Tap marker → Info card → View Details → Center Details
  ├─ List button → Centers List
  └─ My Location button → Center on user

Centers List
  ├─ Map button → Back to Map View
  └─ Tap card → Center Details

Alerts Tab → Alerts List
  └─ Tap alert → Alert Details (with map)
```

---

## Success Criteria

- ✅ Map loads successfully
- ✅ Markers appear for all centers
- ✅ Tapping markers shows info card
- ✅ "View Details" navigates correctly
- ✅ Switch between map/list works
- ✅ Alert details shows affected area
- ✅ Call button opens dialer
- ✅ Directions button opens maps
- ✅ No crashes or errors

---

## Next Steps After Testing

If everything works:
1. ✅ Maps integration is complete!
2. Consider adding more features (see MAPS_INTEGRATION_COMPLETE.md)
3. Move to next phase (offline mode, SOS button, etc.)

If issues found:
1. Check console for errors
2. Verify backend is running
3. Check API responses
4. See MAPS_SETUP.md for troubleshooting

---

**Happy testing! 🎉**
