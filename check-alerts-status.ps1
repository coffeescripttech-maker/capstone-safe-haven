# Check Alerts Status
# Verifies alerts are in database and accessible via API

Write-Host "Checking Alerts Status..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://192.168.43.25:3001/api/v1"
$email = "admin@test.safehaven.com"
$password = "Test123!"

# Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "[OK] Logged in" -ForegroundColor Green
Write-Host ""

# Check active alerts
Write-Host "Step 2: Checking active alerts..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

$alerts = Invoke-RestMethod -Uri "$baseUrl/alerts?is_active=true&limit=10" -Headers $headers

Write-Host "[INFO] Total active alerts: $($alerts.data.total)" -ForegroundColor Cyan
Write-Host ""

if ($alerts.data.alerts.Count -gt 0) {
    Write-Host "Recent Alerts:" -ForegroundColor Green
    Write-Host ""
    
    $alerts.data.alerts | Select-Object -First 5 | ForEach-Object {
        Write-Host "  ID: $($_.id)" -ForegroundColor White
        Write-Host "  Title: $($_.title)" -ForegroundColor White
        Write-Host "  Severity: $($_.severity)" -ForegroundColor $(if ($_.severity -eq 'critical' -or $_.severity -eq 'high') { 'Red' } else { 'Yellow' })
        Write-Host "  Type: $($_.alert_type)" -ForegroundColor White
        Write-Host "  Active: $($_.is_active)" -ForegroundColor Green
        Write-Host "  Created: $($_.created_at)" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host "[WARNING] No active alerts found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "  1. If alerts exist but not showing in mobile app:" -ForegroundColor White
Write-Host "     - Check mobile app is logged in" -ForegroundColor Gray
Write-Host "     - Check WebSocket connection logs" -ForegroundColor Gray
Write-Host "     - Pull down to refresh alerts list" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Check mobile console for:" -ForegroundColor White
Write-Host "     - 'WebSocket connected'" -ForegroundColor Gray
Write-Host "     - 'WebSocket authenticated'" -ForegroundColor Gray
Write-Host "     - 'Received new alert'" -ForegroundColor Gray
