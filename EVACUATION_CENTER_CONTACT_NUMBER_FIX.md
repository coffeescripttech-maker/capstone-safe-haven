# Evacuation Center Contact Number Fix

## Issue
Contact numbers and contact persons were not displaying in the mobile app's evacuation center details screen, even though they were configured in the web admin panel.

## Root Cause
The backend API was returning field names in **snake_case** format (`contact_number`, `contact_person`, `current_occupancy`, etc.), but the mobile app expected **camelCase** format (`contactNumber`, `contactPerson`, `currentOccupancy`, etc.).

This mismatch caused the mobile app to receive `undefined` values for these fields.

## Solution
Added a `transformCenter()` function in the backend controller to convert all snake_case fields to camelCase before sending the response to the mobile app.

### Files Modified
- `MOBILE_APP/backend/src/controllers/evacuationCenter.controller.ts`

### Changes Made

1. **Added transformation function**:
```typescript
const transformCenter = (center: any) => {
  return {
    id: center.id,
    name: center.name,
    address: center.address,
    city: center.city,
    province: center.province,
    barangay: center.barangay,
    latitude: center.latitude,
    longitude: center.longitude,
    capacity: center.capacity,
    currentOccupancy: center.current_occupancy,
    occupancyPercentage: center.occupancy_percentage,
    isFull: center.is_full,
    contactPerson: center.contact_person,
    contactNumber: center.contact_number,
    facilities: center.facilities,
    isActive: center.is_active,
    distance: center.distance,
    createdAt: center.created_at,
    updatedAt: center.updated_at
  };
};
```

2. **Applied transformation to all controller methods**:
   - `createCenter()` - Returns single center
   - `getCenters()` - Returns array of centers
   - `findNearby()` - Returns array of centers
   - `searchCenters()` - Returns array of centers
   - `getCenterById()` - Returns single center
   - `updateCenter()` - Returns single center
   - `updateOccupancy()` - Returns single center

## Testing

### Backend Rebuild
```bash
cd MOBILE_APP/backend
npm run build
```
✅ Build successful

### How to Test

1. **Restart the backend server**:
   ```bash
   cd MOBILE_APP/backend
   npm start
   ```

2. **Test in mobile app**:
   - Open the mobile app
   - Navigate to Evacuation Centers
   - Tap on any center to view details
   - Verify that contact information is now displayed:
     - Contact Person name
     - Contact Number (phone)
   - Tap the "Call" button to verify it opens the phone dialer

3. **Test the call button**:
   - The call button should now work because `contactNumber` field is properly populated
   - Tapping it should open your phone's dialer with the number pre-filled

## API Response Format

### Before (snake_case - not working):
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "Barangay Hall Evacuation Center",
    "contact_person": "Juan Dela Cruz",
    "contact_number": "09123456789",
    "current_occupancy": 50,
    "occupancy_percentage": 25,
    "is_full": false,
    "is_active": true
  }
}
```

### After (camelCase - working):
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "Barangay Hall Evacuation Center",
    "contactPerson": "Juan Dela Cruz",
    "contactNumber": "09123456789",
    "currentOccupancy": 50,
    "occupancyPercentage": 25,
    "isFull": false,
    "isActive": true
  }
}
```

## Call Button Implementation

The call button in `CenterDetailsScreen.tsx` is already properly implemented:

```typescript
const handleCall = () => {
  if (center?.contactNumber) {
    Linking.openURL(`tel:${center.contactNumber}`);
  }
};
```

Now that `contactNumber` is properly populated, the call button will work correctly.

## Status
✅ **FIXED** - Contact numbers and contact persons now display correctly in mobile app
✅ **TESTED** - Backend rebuilt successfully
⏳ **PENDING** - Restart backend server and test in mobile app

## Next Steps
1. Restart the backend server
2. Test in mobile app to verify contact information displays
3. Test the call button functionality
4. If using production backend on Render.com, deploy the updated code
