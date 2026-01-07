# Firebase Push Notification Test

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven - Firebase Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Step 1: Login as test user
Write-Host "Step 1: Logging in as test user..." -ForegroundColor Yellow
$loginBody = @{
    email = "user1@cebu.com"
    password = "User123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $userToken = $login.data.accessToken
    $userId = $login.data.user.id
    Write-Host "   Logged in as: $($login.data.user.firstName) $($login.data.user.lastName)" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
} catch {
    Write-Host "   Failed to login: $_" -ForegroundColor Red
    exit
}

# Step 2: Register a device token
Write-Host ""
Write-Host "Step 2: Registering device token..." -ForegroundColor Yellow

# Generate a realistic FCM token format
$deviceToken = "fcm_test_" + [guid]::NewGuid().ToString().Replace("-", "")

$tokenBody = @{
    token = $deviceToken
    platform = "android"
} | ConvertTo-Json

try {
    $headers = @{ Authorization = "Bearer $userToken" }
    $response = Invoke-RestMethod -Uri "$apiUrl/auth/device-token" `
        -Method Post `
        -Body $tokenBody `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "   Device token registered successfully!" -ForegroundColor Green
    Write-Host "   Token: $deviceToken" -ForegroundColor Gray
} catch {
    Write-Host "   Failed to register device token: $_" -ForegroundColor Red
    Write-Host "   This is expected if the endpoint doesn't exist yet" -ForegroundColor Yellow
    
    # Try to add directly to database
    Write-Host ""
    Write-Host "   Attempting to add token directly to database..." -ForegroundColor Yellow
    Write-Host "   Please run this SQL command:" -ForegroundColor White
    Write-Host ""
    Write-Host "   INSERT INTO device_tokens (user_id, token, platform) VALUES ($userId, '$deviceToken', 'android');" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Press any key after running the SQL command..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Step 3: Login as admin
Write-Host ""
Write-Host "Step 3: Logging in as admin..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "testadmin@safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $adminLogin = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminLogin.data.accessToken
    Write-Host "   Admin logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to login as admin: $_" -ForegroundColor Red
    exit
}

# Step 4: Create a test alert
Write-Host ""
Write-Host "Step 4: Creating test alert..." -ForegroundColor Yellow

$alertBody = @{
    alert_type = "typhoon"
    severity = "critical"
    title = "URGENT: Typhoon Warning"
    description = "Super Typhoon approaching Cebu. Evacuate immediately to designated centers. Wind speeds up to 200 km/h expected."
    source = "PAGASA"
    affected_areas = @("Cebu", "Cebu City")
    latitude = 10.3157
    longitude = 123.8854
    radius_km = 50
    start_time = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    end_time = (Get-Date).AddHours(24).ToString("yyyy-MM-ddTHH:mm:ssZ")
    metadata = @{
        wind_speed = 200
        signal_number = 4
    }
} | ConvertTo-Json

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts" `
        -Method Post `
        -Body $alertBody `
        -Headers $headers `
        -ContentType "application/json"
    
    $alertId = $alert.data.id
    Write-Host "   Alert created: ID $alertId" -ForegroundColor Green
    Write-Host "   Title: $($alert.data.title)" -ForegroundColor Gray
} catch {
    Write-Host "   Failed to create alert: $_" -ForegroundColor Red
    exit
}

# Step 5: Broadcast the alert
Write-Host ""
Write-Host "Step 5: Broadcasting alert with Firebase..." -ForegroundColor Yellow
Write-Host "   This will attempt to send push notifications via Firebase" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $broadcast = Invoke-RestMethod -Uri "$apiUrl/alerts/$alertId/broadcast" `
        -Method Post `
        -Headers $headers
    
    Write-Host "   BROADCAST COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Results:" -ForegroundColor Cyan
    Write-Host "   ----------------------------------------" -ForegroundColor Gray
    Write-Host "   Total Recipients:    $($broadcast.data.total_recipients)" -ForegroundColor White
    Write-Host "   Push Sent:           $($broadcast.data.push_sent)" -ForegroundColor $(if ($broadcast.data.push_sent -gt 0) { "Green" } else { "Yellow" })
    Write-Host "   Push Failed:         $($broadcast.data.push_failed)" -ForegroundColor $(if ($broadcast.data.push_failed -gt 0) { "Red" } else { "Gray" })
    Write-Host "   SMS Sent:            $($broadcast.data.sms_sent)" -ForegroundColor $(if ($broadcast.data.sms_sent -gt 0) { "Green" } else { "Gray" })
    Write-Host "   SMS Failed:          $($broadcast.data.sms_failed)" -ForegroundColor $(if ($broadcast.data.sms_failed -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
    
    if ($broadcast.data.push_sent -gt 0) {
        Write-Host "   SUCCESS! Firebase push notifications are working!" -ForegroundColor Green
    } elseif ($broadcast.data.push_failed -gt 0) {
        Write-Host "   WARNING: Push notifications failed" -ForegroundColor Yellow
        Write-Host "   This could mean:" -ForegroundColor Gray
        Write-Host "     - Firebase credentials are invalid" -ForegroundColor Gray
        Write-Host "     - Device tokens are invalid/expired" -ForegroundColor Gray
        Write-Host "     - Firebase project settings need adjustment" -ForegroundColor Gray
    } else {
        Write-Host "   INFO: No push notifications attempted" -ForegroundColor Yellow
        Write-Host "   This could mean:" -ForegroundColor Gray
        Write-Host "     - No device tokens in database" -ForegroundColor Gray
        Write-Host "     - User not in affected area" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Failed to broadcast: $_" -ForegroundColor Red
}

# Step 6: Check server logs
Write-Host ""
Write-Host "Step 6: Checking server logs..." -ForegroundColor Yellow
Write-Host "   Check backend/logs/combined.log for Firebase initialization status" -ForegroundColor Gray
Write-Host ""

if (Test-Path "logs/combined.log") {
    $logs = Get-Content "logs/combined.log" -Tail 20 | Select-String -Pattern "Firebase|Push notification"
    if ($logs) {
        Write-Host "   Recent Firebase logs:" -ForegroundColor Cyan
        foreach ($log in $logs) {
            Write-Host "   $log" -ForegroundColor Gray
        }
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIREBASE TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration Status:" -ForegroundColor Yellow
Write-Host "  FIREBASE_PROJECT_ID: safe-haven-52be4" -ForegroundColor Gray
Write-Host "  FIREBASE_CLIENT_EMAIL: firebase-adminsdk-fbsvc@..." -ForegroundColor Gray
Write-Host "  FIREBASE_PRIVATE_KEY: Configured" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check if Firebase initialized in server logs" -ForegroundColor Gray
Write-Host "  2. Verify Firebase project settings in console" -ForegroundColor Gray
Write-Host "  3. Test with real mobile device token" -ForegroundColor Gray
Write-Host "  4. Check Firebase Cloud Messaging is enabled" -ForegroundColor Gray
Write-Host ""
Write-Host "To test with real device:" -ForegroundColor Yellow
Write-Host "  1. Install SafeHaven mobile app" -ForegroundColor Gray
Write-Host "  2. Login and get FCM token" -ForegroundColor Gray
Write-Host "  3. Token will be automatically registered" -ForegroundColor Gray
Write-Host "  4. Broadcast alerts will send real notifications" -ForegroundColor Gray
Write-Host ""
