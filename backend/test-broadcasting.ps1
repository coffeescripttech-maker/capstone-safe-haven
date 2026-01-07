# Broadcasting Test Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven - Broadcasting Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Step 1: Login as admin
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "testadmin@safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $login.data.accessToken
    Write-Host "   Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to login: $_" -ForegroundColor Red
    exit
}

# Step 2: Create test users with profiles
Write-Host ""
Write-Host "Step 2: Creating test users..." -ForegroundColor Yellow

$testUsers = @(
    @{
        email = "user1@cebu.com"
        phone = "09111111111"
        password = "User123!"
        firstName = "Maria"
        lastName = "Santos"
        city = "Cebu City"
        province = "Cebu"
        latitude = 10.3157
        longitude = 123.8854
    },
    @{
        email = "user2@bohol.com"
        phone = "09222222222"
        password = "User123!"
        firstName = "Juan"
        lastName = "Cruz"
        city = "Tagbilaran"
        province = "Bohol"
        latitude = 9.6472
        longitude = 123.8530
    },
    @{
        email = "user3@leyte.com"
        phone = "09333333333"
        password = "User123!"
        firstName = "Pedro"
        lastName = "Reyes"
        city = "Tacloban"
        province = "Leyte"
        latitude = 11.2447
        longitude = 125.0036
    }
)

$userTokens = @()

foreach ($user in $testUsers) {
    try {
        # Register user
        $registerBody = @{
            email = $user.email
            phone = $user.phone
            password = $user.password
            firstName = $user.firstName
            lastName = $user.lastName
        } | ConvertTo-Json

        try {
            $register = Invoke-RestMethod -Uri "$apiUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
            $userToken = $register.data.accessToken
            Write-Host "   Created: $($user.firstName) $($user.lastName)" -ForegroundColor Green
        } catch {
            # User exists, login instead
            $loginBody = @{
                email = $user.email
                password = $user.password
            } | ConvertTo-Json
            $loginResult = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
            $userToken = $loginResult.data.accessToken
            Write-Host "   Logged in: $($user.firstName) $($user.lastName)" -ForegroundColor Gray
        }

        # Update profile with location
        $profileBody = @{
            city = $user.city
            province = $user.province
            latitude = $user.latitude
            longitude = $user.longitude
        } | ConvertTo-Json

        $headers = @{ Authorization = "Bearer $userToken" }
        Invoke-RestMethod -Uri "$apiUrl/auth/profile" -Method Put -Body $profileBody -Headers $headers -ContentType "application/json" | Out-Null

        $userTokens += @{
            name = "$($user.firstName) $($user.lastName)"
            token = $userToken
            location = "$($user.city), $($user.province)"
        }
    } catch {
        Write-Host "   Failed to create $($user.firstName): $_" -ForegroundColor Red
    }
}

Write-Host "   Created/Updated $($userTokens.Count) users" -ForegroundColor Green

# Step 3: Add device tokens for push notifications
Write-Host ""
Write-Host "Step 3: Adding device tokens..." -ForegroundColor Yellow

foreach ($user in $userTokens) {
    try {
        # Generate a fake FCM token
        $deviceToken = "fcm_token_" + [guid]::NewGuid().ToString().Replace("-", "").Substring(0, 20)
        
        $tokenBody = @{
            token = $deviceToken
            platform = "android"
        } | ConvertTo-Json

        $headers = @{ Authorization = "Bearer $($user.token)" }
        
        # Note: You'll need to create this endpoint or add tokens directly to DB
        # For now, we'll note this in the output
        Write-Host "   Device token for $($user.name): $deviceToken" -ForegroundColor Gray
    } catch {
        Write-Host "   Note: Device token endpoint not implemented yet" -ForegroundColor Yellow
    }
}

# Step 4: Create an alert
Write-Host ""
Write-Host "Step 4: Creating disaster alert..." -ForegroundColor Yellow

$alertBody = @{
    alert_type = "typhoon"
    severity = "critical"
    title = "Typhoon Rolly Approaching Visayas"
    description = "Super Typhoon Rolly is expected to make landfall in the Visayas region within 24 hours. Wind speeds up to 200 km/h expected. Residents are advised to evacuate immediately to designated evacuation centers."
    source = "PAGASA"
    affected_areas = @("Cebu", "Bohol", "Leyte")
    latitude = 10.5
    longitude = 124.0
    radius_km = 150
    start_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
    end_time = (Get-Date).AddHours(48).ToString("yyyy-MM-ddTHH:mm:ssZ")
    metadata = @{
        wind_speed = 200
        signal_number = 4
        eye_diameter = 25
    }
} | ConvertTo-Json

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Post -Body $alertBody -Headers $headers -ContentType "application/json"
    $alertId = $alert.data.id
    Write-Host "   Alert created: ID $alertId" -ForegroundColor Green
    Write-Host "   Title: $($alert.data.title)" -ForegroundColor Gray
    Write-Host "   Affected areas: $($alert.data.affected_areas -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "   Failed to create alert: $_" -ForegroundColor Red
    exit
}

# Step 5: Broadcast the alert
Write-Host ""
Write-Host "Step 5: Broadcasting alert to targeted users..." -ForegroundColor Yellow
Write-Host "   This will send notifications to users in affected areas" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $broadcast = Invoke-RestMethod -Uri "$apiUrl/alerts/$alertId/broadcast" -Method Post -Headers $headers
    
    Write-Host "   BROADCAST SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Results:" -ForegroundColor Cyan
    Write-Host "   ----------------------------------------" -ForegroundColor Gray
    Write-Host "   Total Recipients:    $($broadcast.data.total_recipients)" -ForegroundColor White
    Write-Host "   Push Sent:           $($broadcast.data.push_sent)" -ForegroundColor Green
    Write-Host "   Push Failed:         $($broadcast.data.push_failed)" -ForegroundColor $(if ($broadcast.data.push_failed -gt 0) { "Red" } else { "Gray" })
    Write-Host "   SMS Sent:            $($broadcast.data.sms_sent)" -ForegroundColor Green
    Write-Host "   SMS Failed:          $($broadcast.data.sms_failed)" -ForegroundColor $(if ($broadcast.data.sms_failed -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
} catch {
    Write-Host "   Failed to broadcast: $_" -ForegroundColor Red
    exit
}

# Step 6: Get broadcast statistics
Write-Host "Step 6: Checking broadcast statistics..." -ForegroundColor Yellow

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $stats = Invoke-RestMethod -Uri "$apiUrl/alerts/$alertId/statistics" -Method Get -Headers $headers
    
    Write-Host "   Statistics:" -ForegroundColor Cyan
    Write-Host "   ----------------------------------------" -ForegroundColor Gray
    Write-Host "   Total Notifications: $($stats.data.total_notifications)" -ForegroundColor White
    Write-Host "   Push Count:          $($stats.data.push_count)" -ForegroundColor White
    Write-Host "   SMS Count:           $($stats.data.sms_count)" -ForegroundColor White
    Write-Host "   Successful:          $($stats.data.successful)" -ForegroundColor Green
    Write-Host "   Failed:              $($stats.data.failed)" -ForegroundColor $(if ($stats.data.failed -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
} catch {
    Write-Host "   Failed to get statistics: $_" -ForegroundColor Red
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BROADCASTING TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What happened:" -ForegroundColor Yellow
Write-Host "  1. Created 3 test users in different locations" -ForegroundColor Gray
Write-Host "  2. Created a critical typhoon alert" -ForegroundColor Gray
Write-Host "  3. Broadcast alert to users in affected areas" -ForegroundColor Gray
Write-Host "  4. Tracked notification delivery statistics" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Push notifications require Firebase setup" -ForegroundColor Yellow
Write-Host "      SMS requires Semaphore API key in .env" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure Firebase credentials in .env" -ForegroundColor Gray
Write-Host "  2. Add Semaphore API key for SMS" -ForegroundColor Gray
Write-Host "  3. Test with real device tokens" -ForegroundColor Gray
Write-Host ""
