# Simple Notification System Test
Write-Host "🔔 Testing SafeHaven Notification System" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:3001/api/v1"

# Test credentials
$ADMIN_EMAIL = "admin@test.safehaven.com"
$ADMIN_PASSWORD = "Test123!"

Write-Host ""
Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow

try {
    $loginBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host ""
    Write-Host "Step 2: Test device token registration..." -ForegroundColor Yellow
    
    $deviceBody = @{
        deviceToken = "ExponentPushToken[test-device-123]"
        platform = "mobile"
    } | ConvertTo-Json
    
    try {
        $deviceResponse = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/register-device" -Method POST -Headers $headers -Body $deviceBody
        Write-Host "✅ Device token registered successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Device registration endpoint not available yet" -ForegroundColor Yellow
        Write-Host "   This is expected if notification routes aren't fully set up" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Step 3: Test creating an alert (should trigger notifications)..." -ForegroundColor Yellow
    
    $alertBody = @{
        title = "Test Emergency Alert"
        description = "This is a test alert to verify notification system"
        severity = "high"
        alertType = "test"
        affectedAreas = @("Test Area")
        isActive = $true
    } | ConvertTo-Json
    
    try {
        $alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $alertBody
        Write-Host "✅ Alert created successfully" -ForegroundColor Green
        Write-Host "   Alert ID: $($alertResponse.data.id)" -ForegroundColor White
        Write-Host "   This should have triggered notification database triggers" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Failed to create alert: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Step 4: Test notification settings..." -ForegroundColor Yellow
    
    try {
        $settingsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/settings" -Headers $headers
        Write-Host "✅ Notification settings retrieved" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Notification settings endpoint not available yet" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📱 Mobile App Testing Instructions:" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "1. Open your mobile app (make sure it's running)" -ForegroundColor White
    Write-Host "2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor White
    Write-Host "3. Check if badge counters appear on:" -ForegroundColor White
    Write-Host "   - Header notification bell" -ForegroundColor Gray
    Write-Host "   - Alerts tab in bottom navigation" -ForegroundColor Gray
    Write-Host "   - Home screen alert cards" -ForegroundColor Gray
    Write-Host "4. Go to Settings > Notifications to test settings" -ForegroundColor White
    Write-Host "5. Create a new alert from web admin to test real-time updates" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🌐 Web App Testing Instructions:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "2. Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor White
    Write-Host "3. Go to Alerts section and create a new alert" -ForegroundColor White
    Write-Host "4. Check if notification bell shows badge count" -ForegroundColor White
    Write-Host "5. Verify mobile app receives the notification" -ForegroundColor White
    
    Write-Host ""
    Write-Host "✅ Basic notification system test completed!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running on http://localhost:3001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Apply database migration if not done yet" -ForegroundColor White
Write-Host "2. Restart backend server to load notification routes" -ForegroundColor White
Write-Host "3. Test end-to-end flow from web admin to mobile app" -ForegroundColor White
Write-Host "4. Check badge counters and notification sounds" -ForegroundColor White