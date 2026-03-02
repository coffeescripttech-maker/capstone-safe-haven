# Evacuation Center Automatic Geocoding & Reverse Geocoding

## Overview
The evacuation center creation and editing pages now support bidirectional geocoding:
1. **Forward Geocoding** - Address → Coordinates (with auto-update or manual modes)
2. **Reverse Geocoding** - Coordinates → Address (when clicking on map)

## How It Works

### Forward Geocoding (Address → Map)

#### Auto-Update Mode (Recommended)
1. User fills in the address fields:
   - Address (required)
   - City (required)
   - Province (required)
   - Barangay (optional)

2. System automatically (after 1.5 seconds of no typing):
   - Combines the address fields into a full address string
   - Calls Mapbox Geocoding API to convert address to coordinates
   - Updates the map center to the geocoded location
   - Places a marker on the exact location
   - Animates the map to fly to the new location
   - Updates latitude/longitude fields

3. User can toggle auto-update on/off with the checkbox

#### Manual Mode
1. User unchecks "Auto-update map when address changes"
2. Fills in address fields
3. Clicks "Find Location Now" button
4. System geocodes and updates map
5. Shows success/error toast notifications

### Reverse Geocoding (Map → Address) ✨ NEW

1. User clicks anywhere on the map
2. System automatically:
   - Updates latitude/longitude with clicked coordinates
   - Calls Mapbox Reverse Geocoding API
   - Extracts address components from the response
   - Updates address fields (Address, City, Province, Barangay)
   - Shows success notification
   - Temporarily disables auto-geocoding for 2 seconds (prevents loop)

3. User can then edit the auto-filled address if needed

## Features

✅ **Auto-Update Mode**: Map updates automatically as you type (1.5 second debounce)
✅ **Manual Mode**: Click button to geocode on demand
✅ **Reverse Geocoding**: Click map to auto-fill address fields ✨ NEW
✅ **Toggle Control**: Easy checkbox to switch between modes
✅ **Visual Feedback**: Loading spinner and status messages
✅ **Smart Debouncing**: Waits 1.5 seconds after typing stops before geocoding
✅ **Loop Prevention**: Temporarily disables auto-geocoding after map click
✅ **Error Handling**: Graceful fallback if geocoding fails
✅ **Manual Override**: Users can still click on map to adjust location
✅ **Smooth Animation**: Map flies to new location with smooth transition
✅ **Country Filter**: Restricted to Philippines (PH) for accurate results
✅ **Silent Auto-Updates**: No toast notifications for auto-geocoding (less intrusive)
✅ **Manual Feedback**: Toast notifications only for manual geocoding and reverse geocoding

## Technical Implementation

### Files Modified

1. **`src/app/(admin)/evacuation-centers/create/page.tsx`**
   - Added `isGeocoding` state
   - Added `autoGeocodeEnabled` state (default: true)
   - Added `geocodeTimeoutRef` for debouncing
   - Added `geocodeAddress()` function
   - Added auto-geocoding useEffect with 1.5 second debounce
   - Added "Find Location Now" button
   - Added auto-update toggle checkbox
   - Added helper text that changes based on mode
   - Silent notifications for auto-geocoding

2. **`src/app/(admin)/evacuation-centers/[id]/edit/page.tsx`**
   - Same changes as create page
   - Imported `useRef` for timeout management
   - Added loading check to prevent auto-geocoding during initial data fetch

3. **`src/components/MapPicker.tsx`**
   - Added `mapLoaded` state to track map initialization
   - Added `useEffect` to watch for coordinate changes from parent
   - Automatically updates marker and circle when coordinates change
   - Animates map to fly to new location with smooth transition
   - Fixed initialization to use prop values instead of state
   - Added console logging for debugging

### Auto-Geocoding Logic

```typescript
// Debounced auto-geocoding
useEffect(() => {
  if (!autoGeocodeEnabled) return;

  // Clear existing timeout
  if (geocodeTimeoutRef.current) {
    clearTimeout(geocodeTimeoutRef.current);
  }

  // Check if we have minimum required fields
  const hasMinimumFields = formData.address && formData.city && formData.province;
  
  if (hasMinimumFields) {
    // Set new timeout to geocode after 1.5 seconds of no typing
    geocodeTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Auto-geocoding triggered by address change');
      geocodeAddress();
    }, 1500);
  }

  // Cleanup timeout on unmount
  return () => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
  };
}, [formData.address, formData.city, formData.province, formData.barangay, autoGeocodeEnabled]);
```

### Geocoding Function

```typescript
const geocodeAddress = async () => {
  // Build full address from form fields
  const addressParts = [
    formData.barangay,
    formData.address,
    formData.city,
    formData.province,
    'Philippines'
  ].filter(Boolean);

  const fullAddress = addressParts.join(', ');
  
  // Call Mapbox Geocoding API
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&country=PH&limit=1`
  );

  // Update coordinates if found
  if (data.features && data.features.length > 0) {
    const [longitude, latitude] = data.features[0].center;
    setFormData(prev => ({ ...prev, latitude, longitude }));
  }
};
```

## Features

✅ **Automatic Geocoding**: Converts Philippine addresses to coordinates
✅ **Visual Feedback**: Loading spinner and status messages
✅ **Error Handling**: Graceful fallback if geocoding fails
✅ **Manual Override**: Users can still click on map to adjust location
✅ **Smooth Animation**: Map flies to new location with smooth transition
✅ **Country Filter**: Restricted to Philippines (PH) for accurate results

## User Benefits

1. **Bidirectional Geocoding**: Works both ways - address to map and map to address
2. **Automatic Updates**: Map updates as you type (no button clicking needed)
3. **Click to Fill**: Click anywhere on map to auto-fill address fields
4. **Faster Data Entry**: No need to manually search for coordinates or type addresses
5. **More Accurate**: Uses Mapbox's geocoding database
6. **Better UX**: Clear visual feedback during geocoding
7. **Flexible**: Can toggle auto-update on/off or manually adjust
8. **Less Intrusive**: Silent auto-updates, notifications only when needed
9. **Smart Debouncing**: Waits for you to finish typing before geocoding
10. **Loop Prevention**: Smart logic prevents infinite geocoding loops

## Example Usage

### Auto-Update Mode (Default)
1. Start typing: "Barangay Hall"
2. Continue: City = "Tayug"
3. Continue: Province = "Pangasinan"
4. Wait 1.5 seconds
5. Map automatically updates to show Tayug, Pangasinan
6. No button clicking needed!

### Manual Mode
1. Uncheck "Auto-update map when address changes"
2. Enter: "Libertad, Tayug, Pangasinan"
3. Click "Find Location Now"
4. Map centers on Libertad, Tayug, Pangasinan
5. Success toast shows the found location
6. Coordinates are automatically filled in

### Reverse Geocoding (Map Click) ✨ NEW
1. Click anywhere on the map
2. Coordinates update immediately
3. System reverse geocodes the location
4. Address fields auto-fill with:
   - Address (street/place name)
   - City
   - Province
   - Barangay (if available)
5. Success toast: "Address updated from map location"
6. Edit the fields if needed

### Editing an Existing Center
1. Load existing center data
2. Modify address fields if needed
3. Click "Find Location on Map" to update coordinates
4. Or manually click on map to adjust

## Requirements

- **Mapbox Token**: `NEXT_PUBLIC_MAPBOX_TOKEN` must be set in `.env.local`
- **Internet Connection**: Required for geocoding API calls
- **Valid Address**: At least address, city, and province must be filled

## Error Handling

The system handles various error scenarios:

- **Missing Fields**: Shows error if required fields are empty
- **No Results**: Shows message if address cannot be found
- **API Errors**: Graceful fallback with error message
- **No Token**: Shows error if Mapbox token is not configured

## Testing

To test the geocoding feature:

1. Navigate to `/evacuation-centers/create`
2. Fill in:
   - Address: "Barangay Hall"
   - City: "Tayug"
   - Province: "Pangasinan"
   - Barangay: "Libertad"
3. Click "Find Location on Map"
4. Verify map centers on correct location
5. Verify coordinates are updated

## Notes

- Geocoding is restricted to Philippines (country=PH)
- Returns only the best match (limit=1)
- Uses Mapbox Places API v5
- Coordinates are stored with full precision
- Map animates with 1.5 second duration
- Zoom level is set to 14 for good detail
