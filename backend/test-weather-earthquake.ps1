# Test Weather and Earthquake APIs
# Run this after starting the backend server

Write-Host "=== Weather & Earthquake API Test ===" -ForegroundColor Cyan
Write-Host ""

# Get admin token (update with your actual admin token)
$token = $env:ADMIN_TOKEN
if (-not $token) {
    Write-Host "ERROR: ADMIN_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Run: `$env:ADMIN_TOKEN = 'your_admin_token_here'" -ForegroundColor Yellow
    Write-Host "Or get token from: backend/test-token.ps1" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:3000/api/v1"

# Test 1: Get Philippines Weather
Write-Host "1. Testing Philippines Weather..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/weather/philippines" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Cities with weather data: $($response.data.Count)" -ForegroundColor Cyan
    foreach ($city in $response.data) {
        Write-Host "  - $($city.name): $($city.temperature)°C, $($city.weatherDescription)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get Location Weather (Manila)
Write-Host "2. Testing Location Weather (Manila)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/weather/location?lat=14.5995&lon=120.9842" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "  Temperature: $($response.data.temperature)°C" -ForegroundColor Cyan
    Write-Host "  Humidity: $($response.data.humidity)%" -ForegroundColor Cyan
    Write-Host "  Wind Speed: $($response.data.windSpeed) km/h" -ForegroundColor Cyan
    Write-Host "  Condition: $($response.data.weatherDescription) $($response.data.weatherIcon)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Recent Earthquakes (last 7 days, magnitude 4+)
Write-Host "3. Testing Recent Earthquakes (7 days, M4+)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/earthquakes/recent?days=7&minMagnitude=4" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Total earthquakes: $($response.data.count)" -ForegroundColor Cyan
    if ($response.data.count -gt 0) {
        Write-Host "Recent earthquakes:" -ForegroundColor White
        $response.data.earthquakes | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - M$($_.magnitude) - $($_.place) - $(([DateTime]$_.time).ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor White
        }
    } else {
        Write-Host "  No earthquakes found in the specified period" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Earthquake Statistics (last 30 days)
Write-Host "4. Testing Earthquake Statistics (30 days)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/earthquakes/stats?days=30" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Total earthquakes: $($response.data.total)" -ForegroundColor Cyan
    Write-Host "By magnitude:" -ForegroundColor White
    Write-Host "  - Minor (2-4): $($response.data.byMagnitude.minor)" -ForegroundColor White
    Write-Host "  - Light (4-5): $($response.data.byMagnitude.light)" -ForegroundColor White
    Write-Host "  - Moderate (5-6): $($response.data.byMagnitude.moderate)" -ForegroundColor White
    Write-Host "  - Strong (6-7): $($response.data.byMagnitude.strong)" -ForegroundColor White
    Write-Host "  - Major (7+): $($response.data.byMagnitude.major)" -ForegroundColor White
    
    if ($response.data.latest) {
        Write-Host "Latest earthquake:" -ForegroundColor White
        Write-Host "  M$($response.data.latest.magnitude) - $($response.data.latest.place)" -ForegroundColor Cyan
    }
    
    if ($response.data.strongest) {
        Write-Host "Strongest earthquake:" -ForegroundColor White
        Write-Host "  M$($response.data.strongest.magnitude) - $($response.data.strongest.place)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check that all tests passed" -ForegroundColor White
Write-Host "2. Integrate into admin dashboard UI" -ForegroundColor White
Write-Host "3. Add auto-refresh for real-time monitoring" -ForegroundColor White
