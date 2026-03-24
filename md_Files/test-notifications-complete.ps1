# Complete Notification System Test
Write-Host "🔔 SafeHaven Notification System - Complete Test" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:3001/api/v1"
$ADMIN_EMAIL = "admin@test.safehaven.com"
$ADMIN_PASSWORD = "Test123!"

Write-Host ""
Write-Host "Step 1: Login and get token..." -ForegroundColor Yellow

$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host ""
    Write-Host "Step 2: Creating test alerts to trigger notifications..." -ForegroundColor Yellow
    
    # Create different severity alerts
    $alertTypes = @(
        @{ type = "flood"; severity = "critical"; title = "Critical Flood Alert"; color = "Red" },
        @{ type = "earthquake"; severity = "high"; title = "High Earthquake Alert"; color = "Yellow" },
        @{ type = "typhoon"; severity = "moderate"; title = "Moderate Typhoon Alert"; color = "Gray" }
    )
    
    $createdAlerts = @()
    
    foreach ($alert in $alertTypes) {
        $startTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        $alertBody = @{
            alert_type = $alert.type
            severity = $alert.severity
            title = $alert.title
            description = "Testing notification system - $($alert.severity) severity alert"
            source = "NDRRMC"
            affected_areas = @("Manila", "Quezon City")
            start_time = $startTime
        } | ConvertTo-Json
        
        try {
            $alertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/alerts" -Method POST -Headers $headers -Body $alertBody
            $createdAlerts += $alertResponse.data.id
            Write-Host "✅ Created $($alert.severity) alert (ID: $($alertResponse.data.id))" -ForegroundColor $alert.color
        } catch {
            Write-Host "❌ Failed to create $($alert.severity) alert: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📱 MOBILE APP TESTING INSTRUCTIONS" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. OPEN YOUR MOBILE APP" -ForegroundColor White
    Write-Host "   - Make sure the app is running (development server on port 8081)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. LOGIN TO THE APP" -ForegroundColor White
    Write-Host "   - Email: $ADMIN_EMAIL" -ForegroundColor Gray
    Write-Host "   - Password: $ADMIN_PASSWORD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. CHECK BADGE COUNTERS" -ForegroundColor White
    Write-Host "   Look for RED BADGE INDICATORS on:" -ForegroundColor Gray
    Write-Host "   ✓ Header notification bell (top right corner)" -ForegroundColor Green
    Write-Host "   ✓ Alerts tab in bottom navigation" -ForegroundColor Green
    Write-Host "   ✓ Critical alerts section on home screen" -ForegroundColor Green
    Write-Host "   Expected badge count: $($createdAlerts.Count)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. TEST NOTIFICATION SETTINGS" -ForegroundColor White
    Write-Host "   - Go to Settings > Notifications" -ForegroundColor Gray
    Write-Host "   - Toggle sound and vibration settings" -ForegroundColor Gray
    Write-Host "   - Test preview buttons for sounds/vibrations" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. TEST REAL-TIME NOTIFICATIONS" -ForegroundColor White
    Write-Host "   - Keep mobile app open" -ForegroundColor Gray
    Write-Host "   - Create new alerts from web admin (next step)" -ForegroundColor Gray
    Write-Host "   - Watch badges update automatically" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🌐 WEB ADMIN TESTING INSTRUCTIONS" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. OPEN WEB ADMIN PANEL" -ForegroundColor White
    Write-Host "   - Go to: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   - Login with: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. CREATE NEW ALERTS" -ForegroundColor White
    Write-Host "   - Navigate to Alerts section" -ForegroundColor Gray
    Write-Host "   - Click 'Create New Alert'" -ForegroundColor Gray
    Write-Host "   - Fill in alert details:" -ForegroundColor Gray
    Write-Host "     * Type: flood, earthquake, typhoon, etc." -ForegroundColor Gray
    Write-Host "     * Severity: critical, high, moderate, low" -ForegroundColor Gray
    Write-Host "     * Title and description" -ForegroundColor Gray
    Write-Host "     * Mark as Active" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. VERIFY MOBILE RECEIVES NOTIFICATIONS" -ForegroundColor White
    Write-Host "   - After creating alert in web admin" -ForegroundColor Gray
    Write-Host "   - Check mobile app badge counters increase" -ForegroundColor Gray
    Write-Host "   - Verify notification sounds/vibrations play" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🎯 EXPECTED RESULTS" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Badge Counters:" -ForegroundColor Green
    Write-Host "   - Red badges appear on header, alerts tab, home cards" -ForegroundColor White
    Write-Host "   - Badge count increases when new alerts are created" -ForegroundColor White
    Write-Host "   - Badge count decreases when notifications are read" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Notification Sounds:" -ForegroundColor Green
    Write-Host "   - Critical alerts: Urgent sound + strong vibration" -ForegroundColor White
    Write-Host "   - High alerts: Alert sound + medium vibration" -ForegroundColor White
    Write-Host "   - Moderate alerts: Standard sound + light vibration" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Real-time Updates:" -ForegroundColor Green
    Write-Host "   - Mobile app updates immediately when web admin creates alerts" -ForegroundColor White
    Write-Host "   - No need to refresh or restart the app" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔧 TROUBLESHOOTING" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If badges don't appear:" -ForegroundColor Red
    Write-Host "1. Check if BadgeProvider wraps your app in App.tsx" -ForegroundColor White
    Write-Host "2. Verify NotificationIntegration.initialize() was called after login" -ForegroundColor White
    Write-Host "3. Check mobile app console for errors" -ForegroundColor White
    Write-Host ""
    Write-Host "If sounds don't play:" -ForegroundColor Red
    Write-Host "1. Check device volume settings" -ForegroundColor White
    Write-Host "2. Verify notification permissions are granted" -ForegroundColor White
    Write-Host "3. Test with notification settings screen" -ForegroundColor White
    Write-Host ""
    Write-Host "If notifications don't sync:" -ForegroundColor Red
    Write-Host "1. Check backend logs for errors" -ForegroundColor White
    Write-Host "2. Verify database triggers are working" -ForegroundColor White
    Write-Host "3. Test API endpoints manually" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎉 NOTIFICATION SYSTEM IS READY FOR TESTING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created $($createdAlerts.Count) test alerts. Start with the mobile app and work through each test scenario." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running on http://localhost:3001" -ForegroundColor Yellow
}