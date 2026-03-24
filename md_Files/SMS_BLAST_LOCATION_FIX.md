# SMS Blast Location Data Fix

## Issue
The SMS Blast recipient selection and contact group creation pages were using hardcoded province data instead of fetching actual location data from the database.

## What Was Fixed

### Backend Changes

1. **Created Location Controller** (`backend/src/controllers/location.controller.ts`)
   - `getProvinces()` - Fetches unique provinces from `user_profiles` table
   - `getCities(province?)` - Fetches unique cities, optionally filtered by province
   - `getBarangays(province?, city?)` - Fetches unique barangays, optionally filtered
   - `getAllLocations()` - Fetches all location data in one request

2. **Created Location Routes** (`backend/src/routes/location.routes.ts`)
   - `GET /api/v1/locations/provinces` - Get all provinces
   - `GET /api/v1/locations/cities?province=X` - Get cities (filtered)
   - `GET /api/v1/locations/barangays?province=X&city=Y` - Get barangays (filtered)
   - `GET /api/v1/locations/all` - Get all location data at once

3. **Updated Routes Index** (`backend/src/routes/index.ts`)
   - Added location routes to the main router

### Frontend Changes

1. **Updated SMS Blast API Library** (`web_app/src/lib/sms-blast-api.ts`)
   - Added `getProvinces()` method
   - Added `getCities(province?)` method
   - Added `getBarangays(province?, city?)` method
   - Added `getAllLocations()` method

2. **Updated Send SMS Blast Page** (`web_app/src/app/(admin)/sms-blast/send/page.tsx`)
   - Added state for provinces, cities, and barangays from database
   - Modified `loadInitialData()` to fetch location data
   - Updated province dropdown to use database data instead of hardcoded values
   - Shows "No provinces found in database" if empty

3. **Updated Contact Groups Page** (`web_app/src/app/(admin)/sms-blast/contact-groups/page.tsx`)
   - Added state for provinces from database
   - Added `loadProvinces()` function
   - Updated province dropdown to use database data
   - Shows "No provinces found in database" if empty

## Database Schema Used

The location data is fetched from the `user_profiles` table which has:
- `province` VARCHAR(100)
- `city` VARCHAR(100)
- `barangay` VARCHAR(100)

The queries filter out NULL and empty values and return distinct, sorted results.

## Testing

Run the test script to verify the endpoints work:

```powershell
cd MOBILE_APP/backend
.\test-location-api.ps1
```

This will test:
1. Login authentication
2. Fetch all provinces
3. Fetch all cities
4. Fetch cities filtered by province
5. Fetch all barangays
6. Fetch all locations in one request

## Benefits

1. **Dynamic Data**: Location dropdowns now show actual data from your database
2. **Accurate Targeting**: SMS blasts will target real user locations
3. **Scalable**: As users are added with new locations, they automatically appear
4. **Filtered Queries**: Can fetch cities for specific provinces, barangays for specific cities
5. **Performance**: Single endpoint to fetch all location data at once

## Next Steps

1. Start the backend server
2. Run the test script to verify endpoints work
3. Test the web interface to see database provinces in dropdowns
4. Consider adding cascading dropdowns (select province → filter cities → filter barangays)

## Notes

- The location endpoints require authentication (Bearer token)
- Empty results will show "No provinces found in database" message
- Make sure users in your database have province/city/barangay data populated
- You can use the test users created earlier which have location data
