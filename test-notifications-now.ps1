# Simple Notification System Test
Write-Host "Testing SafeHaven Notification System" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:3001/api/v1"
$ADMIN_EMAIL = "admin@test.safehaven.com"
$ADMIN_PASSWORD = "Test123!"

Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow

$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login successful" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Step 2: Creating test alert..." -ForegroundColor Yellow
    
    $alertBody = @{
        title = "Test Emergency Alert"
        description = "This is a test alert to verify notification system"
        severity = "high"
        alertType = "flood"
        affectedAreas = @("Test Area")
        isActive = $true
    } | ConvertTo-Json
    
    $alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $alertBody
    Write-Host "Alert created successfully - ID: $($alertResponse.data.id)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Mobile App Testing:" -ForegroundColor Cyan
    Write-Host "1. Open your mobile app" -ForegroundColor White
    Write-Host "2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor White
    Write-Host "3. Check badge counters on header, alerts tab, and home cards" -ForegroundColor White
    Write-Host "4. Go to Settings > Notifications to test settings" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Web App Testing:" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost:3000" -ForegroundColor White
    Write-Host "2. Login with same credentials" -ForegroundColor White
    Write-Host "3. Create alerts and verify mobile receives notifications" -ForegroundColor White
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}