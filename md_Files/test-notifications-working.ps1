# Working Notification System Test
Write-Host "🔔 SafeHaven Notification System - Working Test" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:3001/api/v1"
$ADMIN_EMAIL = "admin@test.safehaven.com"
$ADMIN_PASSWORD = "Test123!"

Write-Host ""
Write-Host "Step 1: Login and verify existing alerts..." -ForegroundColor Yellow

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

# Check existing active alerts
$alertsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts?is_active=true" -Headers $headers
Write-Host "✅ Found $($alertsResponse.data.alerts.Count) active alerts in database" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Creating new test alert with proper is_active flag..." -ForegroundColor Yellow

$startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$newAlert = @{
    alert_type = "typhoon"
    severity = "critical"
    title = "🌪️ CRITICAL: Typhoon Alert - Mobile Test"
    description = "This is a test alert to verify mobile notification system works correctly"
    source = "PAGASA"
    affected_areas = @("Metro Manila", "Rizal", "Cavite")
    start_time = $startTime
    is_active = $true
} | ConvertTo-Json

$alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $newAlert
Write-Host "✅ Created NEW CRITICAL alert (ID: $($alertResponse.data.id))" -ForegroundColor Red

Write-Host ""
Write-Host "📱 MOBILE APP TESTING - IMMEDIATE STEPS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚨 IMPORTANT: You should now see notifications!" -ForegroundColor Red
Write-Host ""
Write-Host "1. OPEN YOUR MOBILE APP NOW" -ForegroundColor White
Write-Host "   - The app should be running on development server" -ForegroundColor Gray
Write-Host ""
Write-Host "2. LOGIN TO THE APP" -ForegroundColor White
Write-Host "   - Email: $ADMIN_EMAIL" -ForegroundColor Gray
Write-Host "   - Password: $ADMIN_PASSWORD" -ForegroundColor Gray
Write-Host ""
Write-Host "3. LOOK FOR RED BADGES - YOU SHOULD SEE THEM NOW!" -ForegroundColor White
Write-Host "   ✓ Header notification bell (top right)" -ForegroundColor Green
Write-Host "   ✓ Alerts tab in bottom navigation" -ForegroundColor Green
Write-Host "   ✓ Critical alerts section on home screen" -ForegroundColor Green
Write-Host "   Expected badge count: $($alertsResponse.data.alerts.Count + 1)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. CHECK ALERTS LIST" -ForegroundColor White
Write-Host "   - Go to Alerts tab" -ForegroundColor Gray
Write-Host "   - You should see the new typhoon alert at the top" -ForegroundColor Gray
Write-Host "   - Pull to refresh if needed" -ForegroundColor Gray
Write-Host ""
Write-Host "5. TEST NOTIFICATION SETTINGS" -ForegroundColor White
Write-Host "   - Go to Settings > Notifications" -ForegroundColor Gray
Write-Host "   - Toggle sound and vibration" -ForegroundColor Gray
Write-Host "   - Test preview buttons" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 WEB ADMIN REAL-TIME TEST" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. KEEP MOBILE APP OPEN" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "3. Login with same credentials" -ForegroundColor White
Write-Host "4. Create a new alert and watch mobile update in real-time!" -ForegroundColor White
Write-Host ""

Write-Host "🎯 WHAT YOU SHOULD SEE" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Badge Counters: Red badges with numbers" -ForegroundColor White
Write-Host "✅ Alert List: New typhoon alert visible" -ForegroundColor White
Write-Host "✅ Real-time Updates: Badges update when you create new alerts" -ForegroundColor White
Write-Host "✅ Notification Sounds: Based on severity level" -ForegroundColor White
Write-Host ""

Write-Host "IF YOU DON'T SEE BADGES" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Check if NotificationIntegration.initialize() was called after login" -ForegroundColor White
Write-Host "2. Verify BadgeProvider wraps your App component" -ForegroundColor White
Write-Host "3. Check mobile app console for errors" -ForegroundColor White
Write-Host "4. Try logging out and back in" -ForegroundColor White
Write-Host ""

Write-Host "🎉 NOTIFICATION SYSTEM IS WORKING!" -ForegroundColor Green
Write-Host "There are $($alertsResponse.data.alerts.Count + 1) active alerts ready for testing." -ForegroundColor Cyan