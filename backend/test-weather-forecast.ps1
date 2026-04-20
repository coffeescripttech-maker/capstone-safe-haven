# Test Weather Forecast API Endpoints

$baseUrl = "http://localhost:3001/api"

Write-Host "=== Testing Weather Forecast API ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@safehaven.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get Weather Forecasts
Write-Host "Step 2: Fetching weather forecasts..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $forecastResponse = Invoke-RestMethod -Uri "$baseUrl/weather/forecasts" -Method Get -Headers $headers
    Write-Host "✓ Weather forecasts fetched successfully" -ForegroundColor Green
    Write-Host "Total forecasts: $($forecastResponse.data.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    # Display forecast details
    Write-Host "Forecast Details:" -ForegroundColor Yellow
    foreach ($forecast in $forecastResponse.data) {
        Write-Host "  Location: $($forecast.location)" -ForegroundColor White
        Write-Host "  Temperature: $($forecast.temperature)°C" -ForegroundColor White
        Write-Host "  Humidity: $($forecast.humidity)%" -ForegroundColor White
        Write-Host "  Wind Speed: $($forecast.wind_speed) km/h" -ForegroundColor White
        Write-Host "  Precipitation Probability: $($forecast.precipitation_probability)%" -ForegroundColor White
        Write-Host "  Weather: $($forecast.weather_condition)" -ForegroundColor White
        Write-Host "  Severity: $($forecast.severity)" -ForegroundColor White
        Write-Host "  Advance Notice: $($forecast.advance_notice_hours) hours" -ForegroundColor Cyan
        Write-Host "  Alert Triggered: $($forecast.alert_triggered)" -ForegroundColor $(if ($forecast.alert_triggered) { "Red" } else { "Green" })
        Write-Host "  ---" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch weather forecasts: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get Forecast-Triggered Alerts
Write-Host "Step 3: Fetching forecast-triggered alerts..." -ForegroundColor Yellow
try {
    $alertsResponse = Invoke-RestMethod -Uri "$baseUrl/weather/forecast-alerts" -Method Get -Headers $headers
    Write-Host "✓ Forecast alerts fetched successfully" -ForegroundColor Green
    Write-Host "Total alerts: $($alertsResponse.data.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($alertsResponse.data.Count -gt 0) {
        Write-Host "Alert Details:" -ForegroundColor Yellow
        foreach ($alert in $alertsResponse.data) {
            Write-Host "  Alert: $($alert.alert_title)" -ForegroundColor White
            Write-Host "  Type: $($alert.alert_type)" -ForegroundColor White
            Write-Host "  Severity: $($alert.severity)" -ForegroundColor White
            Write-Host "  Advance Notice: $($alert.advance_notice_hours) hours" -ForegroundColor Cyan
            Write-Host "  Status: $($alert.status)" -ForegroundColor $(if ($alert.status -eq "sent") { "Green" } else { "Yellow" })
            Write-Host "  Triggered: $($alert.triggered_at)" -ForegroundColor Gray
            Write-Host "  ---" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No forecast-triggered alerts found" -ForegroundColor Gray
        Write-Host "  (Alerts are created automatically when severe weather is detected)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch forecast alerts: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the web portal at http://localhost:3000/weather-forecast" -ForegroundColor White
Write-Host "2. The page should now show real weather data from Open-Meteo API" -ForegroundColor White
Write-Host "3. Forecast-triggered alerts will appear when severe weather is detected" -ForegroundColor White
