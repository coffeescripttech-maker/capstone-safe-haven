# Test Predictive Weather Alerts System
# This script tests the automated weather forecast monitoring and alert creation

Write-Host "🌦️ Testing Predictive Weather Alerts System" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Backend URL
$BACKEND_URL = "http://localhost:3001/api/v1"

Write-Host "Step 1: Check weather forecast data" -ForegroundColor Yellow
Write-Host "GET $BACKEND_URL/weather/forecasts" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/weather/forecasts" -Method Get -ContentType "application/json"
    
    if ($response.status -eq "success") {
        Write-Host "✅ Weather forecast data retrieved successfully" -ForegroundColor Green
        Write-Host "   Cities monitored: $($response.data.Count)" -ForegroundColor Gray
        
        # Show forecast data
        foreach ($forecast in $response.data) {
            $severityColor = switch ($forecast.severity) {
                "critical" { "Red" }
                "high" { "Yellow" }
                "moderate" { "Cyan" }
                default { "Gray" }
            }
            
            Write-Host "   📍 $($forecast.location)" -ForegroundColor White
            Write-Host "      Severity: $($forecast.severity)" -ForegroundColor $severityColor
            Write-Host "      Precipitation: $($forecast.precipitation_probability)%" -ForegroundColor Gray
            Write-Host "      Advance Notice: $($forecast.advance_notice_hours)h" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "❌ Failed to retrieve forecast data" -ForegroundColor Red
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error fetching forecast data: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Trigger alert automation monitoring" -ForegroundColor Yellow
Write-Host "POST $BACKEND_URL/admin/alert-automation/monitor" -ForegroundColor Gray
Write-Host ""

# Note: This endpoint requires admin authentication
Write-Host "⚠️  This requires admin authentication" -ForegroundColor Yellow
Write-Host "    Run this from the backend console or with admin token" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 3: Check for auto-generated weather alerts" -ForegroundColor Yellow
Write-Host "GET $BACKEND_URL/alerts?source=auto_weather" -ForegroundColor Gray
Write-Host ""

try {
    $alertsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts?source=auto_weather&limit=10" -Method Get -ContentType "application/json"
    
    if ($alertsResponse.status -eq "success") {
        $alerts = $alertsResponse.data.alerts
        Write-Host "✅ Found $($alerts.Count) auto-generated weather alerts" -ForegroundColor Green
        Write-Host ""
        
        if ($alerts.Count -gt 0) {
            foreach ($alert in $alerts) {
                $severityColor = switch ($alert.severity) {
                    "critical" { "Red" }
                    "high" { "Yellow" }
                    "moderate" { "Cyan" }
                    default { "Gray" }
                }
                
                Write-Host "   🚨 Alert #$($alert.id)" -ForegroundColor White
                Write-Host "      Title: $($alert.title)" -ForegroundColor White
                Write-Host "      Severity: $($alert.severity)" -ForegroundColor $severityColor
                Write-Host "      Type: $($alert.alert_type)" -ForegroundColor Gray
                Write-Host "      Source: $($alert.source)" -ForegroundColor Gray
                
                if ($alert.advance_notice_hours) {
                    Write-Host "      ⏰ Advance Notice: $($alert.advance_notice_hours) hours" -ForegroundColor Cyan
                }
                
                Write-Host "      Created: $($alert.created_at)" -ForegroundColor Gray
                Write-Host "      Active: $($alert.is_active)" -ForegroundColor Gray
                Write-Host ""
            }
        } else {
            Write-Host "   ℹ️  No predictive weather alerts found yet" -ForegroundColor Gray
            Write-Host "      The system monitors forecasts every 15-30 minutes" -ForegroundColor Gray
            Write-Host "      Alerts are created when severe weather is detected" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error fetching alerts: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Manual trigger (requires backend console)" -ForegroundColor Yellow
Write-Host "========================