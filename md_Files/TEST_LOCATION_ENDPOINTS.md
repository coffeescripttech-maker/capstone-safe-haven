# Quick Test: Location Endpoints

## Start the Backend

```powershell
cd MOBILE_APP/backend
npm run dev
```

## Run the Test Script

```powershell
# In a new terminal
cd MOBILE_APP/backend
.\test-location-api.ps1
```

## Expected Output

```
=== Testing Location API Endpoints ===

1. Logging in...
✓ Login successful

2. Testing GET /locations/provinces
✓ Provinces fetched successfully
   Found X provinces:
   - Metro Manila
   - Cebu
   - Davao
   - ...

3. Testing GET /locations/cities
✓ Cities fetched successfully
   Found X cities

4. Testing GET /locations/cities?province=Metro Manila
✓ Filtered cities fetched successfully
   Found X cities in Metro Manila

5. Testing GET /locations/barangays
✓ Barangays fetched successfully
   Found X barangays

6. Testing GET /locations/all
✓ All locations fetched successfully
   Provinces: X
   Cities: X
   Barangays: X

=== Location API Tests Complete ===
```

## Test in Web Interface

1. Start the web app:
```powershell
cd MOBILE_APP/web_app
npm run dev
```

2. Login as admin (admin@safehaven.com / Admin123!)

3. Navigate to SMS Blast → Send SMS

4. Check the "Select Recipients" section - Province dropdown should show database provinces

5. Navigate to SMS Blast → Contact Groups → New Group

6. Check the province dropdown - should show database provinces

## Manual API Testing

### Get Provinces
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/locations/provinces" -Headers $headers
```

### Get Cities (All)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/locations/cities" -Headers $headers
```

### Get Cities (Filtered by Province)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/locations/cities?province=Metro Manila" -Headers $headers
```

### Get All Locations
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/locations/all" -Headers $headers
```

## Troubleshooting

### No provinces showing?
- Check if users in database have province data in user_profiles table
- Run: `SELECT DISTINCT province FROM user_profiles WHERE province IS NOT NULL;`

### Authentication error?
- Make sure you're logged in and using a valid token
- Token is stored in localStorage as 'safehaven_token'

### 404 error?
- Make sure backend server is running
- Check that location routes are registered in routes/index.ts
- Verify the URL is correct: `/api/v1/locations/...`
