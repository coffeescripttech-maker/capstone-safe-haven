# Test Weather Forecast Page - Quick Fix Script

Write-Host "=== Weather Forecast Page - Quick Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "Step 1: Checking if backend is running on port 3001..." -ForegroundColor Yellow
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/health" -Method Get -ErrorAction SilentlyContinue
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is NOT running on port 3001" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd MOBILE_APP/backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if web app is running
Write-Host "Step 2: Checking if web app is running on port 3000..." -ForegroundColor Yellow
try {
    $webTest = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -ErrorAction SilentlyContinue
    Write-Host "✓ Web app is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Web app is NOT running on port 3000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the web app:" -ForegroundColor Yellow
    Write-Host "  cd MOBILE_APP/web_app" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Step 3: Testing backend weather API directly..." -ForegroundColor Yellow

# Login to get token
$loginBody = @{
    email = "admin@safehaven.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test weather forecasts endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Testing: GET http://localhost:3001/api/weather/forecasts" -ForegroundColor Gray
    $forecastResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/weather/forecasts" -Method Get -Headers $headers
    Write-Host "✓ Weather forecasts API working" -ForegroundColor Green
    Write-Host "  Forecasts returned: $($forecastResponse.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Weather forecasts API failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test forecast alerts endpoint
try {
    Write-Host "Testing: GET http://localhost:3001/api/weather/forecast-alerts" -ForegroundColor Gray
    $alertsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/weather/forecast-alerts" -Method Get -Headers $headers
    Write-Host "✓ Forecast alerts API working" -ForegroundColor Green
    Write-Host "  Alerts returned: $($alertsResponse.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Forecast alerts API failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open your browser to: http://localhost:3000/weather-forecast" -ForegroundColor White
Write-Host "2. The page should now load with real weather data" -ForegroundColor White
Write-Host "3. Check browser console (F12) for any errors" -ForegroundColor White
Write-Host ""
Write-Host "If you still see errors:" -ForegroundColor Yellow
Write-Host "- Make sure you're logged in to the web portal" -ForegroundColor White
Write-Host "- Clear browser cache and refresh" -ForegroundColor White
Write-Host "- Check browser console for detailed error messages" -ForegroundColor White
