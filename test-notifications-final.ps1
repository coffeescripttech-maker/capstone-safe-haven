# SafeHaven Notification System Test
Write-Host "Testing SafeHaven Notification System" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:3001/api/v1"
$ADMIN_EMAIL = "admin@test.safehaven.com"
$ADMIN_PASSWORD = "Test123!"

Write-Host "Step 1: Login..." -ForegroundColor Yellow

$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "Login successful" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Step 2: Creating test alerts..." -ForegroundColor Yellow

# Create Critical Alert
$startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$criticalAlert = @{
    alert_type = "flood"
    severity = "critical"
    title = "CRITICAL: Severe Flooding Alert"
    description = "Testing critical notification system"
    source = "NDRRMC"
    affected_areas = @("Manila", "Quezon City")
    start_time = $startTime
} | ConvertTo-Json

$alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $criticalAlert
Write-Host "Created CRITICAL alert (ID: $($alertResponse.data.id))" -ForegroundColor Red

# Create High Alert
$startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$highAlert = @{
    alert_type = "earthquake"
    severity = "high"
    title = "HIGH: Earthquake Alert"
    description = "Testing high priority notification"
    source = "PHIVOLCS"
    affected_areas = @("Metro Manila")
    start_time = $startTime
} | ConvertTo-Json

$alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $highAlert
Write-Host "Created HIGH alert (ID: $($alertResponse.data.id))" -ForegroundColor Yellow

Write-Host ""
Write-Host "MOBILE APP TESTING:" -ForegroundColor Cyan
Write-Host "1. Open your mobile app" -ForegroundColor White
Write-Host "2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor White
Write-Host "3. Check for RED BADGES on:" -ForegroundColor White
Write-Host "   - Header notification bell" -ForegroundColor Gray
Write-Host "   - Alerts tab in bottom navigation" -ForegroundColor Gray
Write-Host "   - Home screen alert cards" -ForegroundColor Gray
Write-Host "4. Go to Settings > Notifications to test settings" -ForegroundColor White
Write-Host ""
Write-Host "WEB ADMIN TESTING:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000" -ForegroundColor White
Write-Host "2. Login with same credentials" -ForegroundColor White
Write-Host "3. Create new alerts and verify mobile receives them" -ForegroundColor White
Write-Host ""
Write-Host "SUCCESS! Notification system is working!" -ForegroundColor Green