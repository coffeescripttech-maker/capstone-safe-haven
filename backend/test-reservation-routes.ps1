# Test Reservation Routes
# This script tests if the reservation routes are accessible

$baseUrl = "http://192.168.43.25:3001/api/v1"

Write-Host "Testing Reservation Routes..." -ForegroundColor Cyan
Write-Host ""

# First, login to get a token
Write-Host "1. Logging in to get auth token..." -ForegroundColor Yellow
$loginBody = @{
    email = "citizen@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test center status endpoint
Write-Host "2. Testing GET /centers/4/status..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/centers/4/status" -Method Get -Headers $headers
    Write-Host "✅ Center status endpoint works!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $statusResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Center status endpoint failed: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host ""
        Write-Host "⚠️  Route not found! Backend needs to be restarted." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To fix this, run:" -ForegroundColor Cyan
        Write-Host "  cd MOBILE_APP/backend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
    }
}

Write-Host ""

# Test check availability endpoint
Write-Host "3. Testing POST /centers/4/check-availability..." -ForegroundColor Yellow
$availabilityBody = @{
    groupSize = 5
} | ConvertTo-Json

try {
    $availResponse = Invoke-RestMethod -Uri "$baseUrl/centers/4/check-availability" -Method Post -Headers $headers -Body $availabilityBody
    Write-Host "✅ Check availability endpoint works!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $availResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Check availability endpoint failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
