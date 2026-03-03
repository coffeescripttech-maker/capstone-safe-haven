# Test Location API Endpoints
# This script tests the new location endpoints that fetch provinces, cities, and barangays from the database

$baseUrl = "http://localhost:3001/api/v1"

Write-Host "=== Testing Location API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# First, login to get a token
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Get all provinces
Write-Host "2. Testing GET /locations/provinces" -ForegroundColor Yellow
try {
    $provincesResponse = Invoke-RestMethod -Uri "$baseUrl/locations/provinces" -Method Get -Headers $headers
    Write-Host "✓ Provinces fetched successfully" -ForegroundColor Green
    Write-Host "   Found $($provincesResponse.data.provinces.Count) provinces:" -ForegroundColor Gray
    $provincesResponse.data.provinces | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch provinces: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Get all cities
Write-Host "3. Testing GET /locations/cities" -ForegroundColor Yellow
try {
    $citiesResponse = Invoke-RestMethod -Uri "$baseUrl/locations/cities" -Method Get -Headers $headers
    Write-Host "✓ Cities fetched successfully" -ForegroundColor Green
    Write-Host "   Found $($citiesResponse.data.cities.Count) cities" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch cities: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Get cities filtered by province (if we have provinces)
if ($provincesResponse.data.provinces.Count -gt 0) {
    $testProvince = $provincesResponse.data.provinces[0]
    Write-Host "4. Testing GET /locations/cities?province=$testProvince" -ForegroundColor Yellow
    try {
        $filteredCitiesResponse = Invoke-RestMethod -Uri "$baseUrl/locations/cities?province=$testProvince" -Method Get -Headers $headers
        Write-Host "✓ Filtered cities fetched successfully" -ForegroundColor Green
        Write-Host "   Found $($filteredCitiesResponse.data.cities.Count) cities in $testProvince" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Failed to fetch filtered cities: $_" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 4: Get all barangays
Write-Host "5. Testing GET /locations/barangays" -ForegroundColor Yellow
try {
    $barangaysResponse = Invoke-RestMethod -Uri "$baseUrl/locations/barangays" -Method Get -Headers $headers
    Write-Host "✓ Barangays fetched successfully" -ForegroundColor Green
    Write-Host "   Found $($barangaysResponse.data.barangays.Count) barangays" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch barangays: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Get all locations in one request
Write-Host "6. Testing GET /locations/all" -ForegroundColor Yellow
try {
    $allLocationsResponse = Invoke-RestMethod -Uri "$baseUrl/locations/all" -Method Get -Headers $headers
    Write-Host "✓ All locations fetched successfully" -ForegroundColor Green
    Write-Host "   Provinces: $($allLocationsResponse.data.provinces.Count)" -ForegroundColor Gray
    Write-Host "   Cities: $($allLocationsResponse.data.cities.Count)" -ForegroundColor Gray
    Write-Host "   Barangays: $($allLocationsResponse.data.barangays.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch all locations: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Location API Tests Complete ===" -ForegroundColor Cyan
