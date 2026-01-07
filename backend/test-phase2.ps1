# SafeHaven Phase 2 API Test Script
# Tests: Disaster Alerts, Evacuation Centers, Emergency Contacts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven Phase 2 API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Test counters
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    try {
        & $Test
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "  ✗ FAILED: $_" -ForegroundColor Red
        $script:failed++
    }
    Write-Host ""
}

# ============================================
# STEP 1: Health Check
# ============================================
Write-Host "STEP 1: Health Check" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-Endpoint "Health endpoint" {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($health.status -ne "ok") { throw "Health check failed" }
    Write-Host "  Server is running!" -ForegroundColor Gray
}

# ============================================
# STEP 2: Authentication
# ============================================
Write-Host "STEP 2: Authentication Setup" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$token = $null
$adminToken = $null

Test-Endpoint "Register/Login Admin User" {
    $registerBody = @{
        email = "admin@safehaven.com"
        phone = "09123456789"
        password = "Admin123!"
        firstName = "Admin"
        lastName = "User"
    } | ConvertTo-Json

    try {
        $register = Invoke-RestMethod -Uri "$apiUrl/auth/register" `
            -Method Post `
            -Body $registerBody `
            -ContentType "application/json"
        $script:adminToken = $register.data.accessToken
        Write-Host "  Admin registered successfully" -ForegroundColor Gray
    } catch {
        # Try login if registration fails
        $loginBody = @{
            email = "admin@safehaven.com"
            password = "Admin123!"
        } | ConvertTo-Json
        
        $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json"
        $script:adminToken = $login.data.accessToken
        Write-Host "  Admin logged in successfully" -ForegroundColor Gray
    }
    
    if (-not $script:adminToken) { throw "Failed to get admin token" }
}

# ============================================
# STEP 3: Disaster Alerts
# ============================================
Write-Host "STEP 3: Disaster Alerts" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$alertId = $null

Test-Endpoint "Create Disaster Alert (Admin)" {
    $alertBody = @{
        alert_type = "typhoon"
        severity = "critical"
        title = "Typhoon Odette Approaching"
        description = "Strong typhoon expected to make landfall in Visayas region. Residents are advised to evacuate to designated centers."
        source = "PAGASA"
        affected_areas = @("Cebu", "Bohol", "Leyte")
        latitude = 10.3157
        longitude = 123.8854
        radius_km = 100
        start_time = "2024-01-15T08:00:00Z"
        end_time = "2024-01-16T20:00:00Z"
        metadata = @{
            wind_speed = 185
            signal_number = 4
        }
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts" `
        -Method Post `
        -Body $alertBody `
        -Headers $headers `
        -ContentType "application/json"
    
    $script:alertId = $alert.data.id
    Write-Host "  Alert ID: $($alert.data.id)" -ForegroundColor Gray
    Write-Host "  Title: $($alert.data.title)" -ForegroundColor Gray
}

Test-Endpoint "Get All Alerts (Public)" {
    $alerts = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Get
    if ($alerts.data.alerts.Count -eq 0) { throw "No alerts found" }
    Write-Host "  Found $($alerts.data.total) alerts" -ForegroundColor Gray
}

Test-Endpoint "Get Alert by ID (Public)" {
    if (-not $script:alertId) { throw "No alert ID available" }
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts/$($script:alertId)" -Method Get
    Write-Host "  Alert: $($alert.data.title)" -ForegroundColor Gray
}

Test-Endpoint "Search Alerts (Public)" {
    $searchUrl = "$apiUrl/alerts/search?q=typhoon"
    $results = Invoke-RestMethod -Uri $searchUrl -Method Get
    Write-Host "  Found $($results.data.Count) results" -ForegroundColor Gray
}

Test-Endpoint "Update Alert (Admin)" {
    if (-not $script:alertId) { throw "No alert ID available" }
    $updateBody = @{
        severity = "high"
        description = "Typhoon intensity has decreased. Continue to monitor updates."
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $updated = Invoke-RestMethod -Uri "$apiUrl/alerts/$($script:alertId)" `
        -Method Put `
        -Body $updateBody `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "  Updated severity to: $($updated.data.severity)" -ForegroundColor Gray
}

# ============================================
# STEP 4: Evacuation Centers
# ============================================
Write-Host "STEP 4: Evacuation Centers" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$centerId = $null

Test-Endpoint "Create Evacuation Center (Admin)" {
    $centerBody = @{
        name = "Cebu City Sports Center"
        address = "M.J. Cuenco Ave, Cebu City"
        city = "Cebu City"
        province = "Cebu"
        barangay = "Mabolo"
        latitude = 10.3157
        longitude = 123.8854
        capacity = 5000
        contact_person = "Juan Dela Cruz"
        contact_number = "09123456789"
        facilities = @("medical", "food", "water", "restrooms", "power", "wifi")
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $center = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" `
        -Method Post `
        -Body $centerBody `
        -Headers $headers `
        -ContentType "application/json"
    
    $script:centerId = $center.data.id
    Write-Host "  Center ID: $($center.data.id)" -ForegroundColor Gray
    Write-Host "  Name: $($center.data.name)" -ForegroundColor Gray
    Write-Host "  Capacity: $($center.data.capacity)" -ForegroundColor Gray
}

Test-Endpoint "Get All Centers (Public)" {
    $centers = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" -Method Get
    if ($centers.data.centers.Count -eq 0) { throw "No centers found" }
    Write-Host "  Found $($centers.data.total) centers" -ForegroundColor Gray
}

Test-Endpoint "Find Nearby Centers (Public)" {
    $params = @{
        lat = 10.3157
        lng = 123.8854
        radius = 50
    }
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '&'
    $nearbyUrl = "$apiUrl/evacuation-centers/nearby?$queryString"
    $nearby = Invoke-RestMethod -Uri $nearbyUrl -Method Get
    Write-Host "  Found $($nearby.data.Count) nearby centers" -ForegroundColor Gray
    if ($nearby.data.Count -gt 0) {
        $distance = $nearby.data[0].distance
        Write-Host "  Nearest: $($nearby.data[0].name) - $distance km" -ForegroundColor Gray
    }
}

Test-Endpoint "Search Centers (Public)" {
    $searchUrl = "$apiUrl/evacuation-centers/search?q=Cebu"
    $results = Invoke-RestMethod -Uri $searchUrl -Method Get
    Write-Host "  Found $($results.data.Count) results" -ForegroundColor Gray
}

Test-Endpoint "Update Center Occupancy (Admin)" {
    if (-not $script:centerId) { throw "No center ID available" }
    $occupancyBody = @{
        occupancy = 1500
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $updated = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers/$($script:centerId)/occupancy" `
        -Method Patch `
        -Body $occupancyBody `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "  Occupancy: $($updated.data.current_occupancy)/$($updated.data.capacity)" -ForegroundColor Gray
    Write-Host "  Percentage: $($updated.data.occupancy_percentage)%" -ForegroundColor Gray
}

# ============================================
# STEP 5: Emergency Contacts
# ============================================
Write-Host "STEP 5: Emergency Contacts" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$contactId = $null

Test-Endpoint "Create Emergency Contact (Admin)" {
    $contactBody = @{
        category = "Police"
        name = "Philippine National Police"
        phone = "09171234567"
        alternate_phone = "09181234567"
        email = "pnp@example.com"
        address = "Camp Crame, Quezon City"
        is_national = $true
        display_order = 0
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $contact = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" `
        -Method Post `
        -Body $contactBody `
        -Headers $headers `
        -ContentType "application/json"
    
    $script:contactId = $contact.data.id
    Write-Host "  Contact ID: $($contact.data.id)" -ForegroundColor Gray
    Write-Host "  Name: $($contact.data.name)" -ForegroundColor Gray
    Write-Host "  Phone: $($contact.data.phone)" -ForegroundColor Gray
}

Test-Endpoint "Get All Contacts Grouped (Public)" {
    $contacts = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" -Method Get
    $categories = $contacts.data.PSObject.Properties.Name
    Write-Host "  Found $($categories.Count) categories" -ForegroundColor Gray
    foreach ($cat in $categories) {
        $catData = $contacts.data.$cat
        Write-Host "    - ${cat}: $($catData.Count) contacts" -ForegroundColor Gray
    }
}

Test-Endpoint "Get Contacts by Category (Public)" {
    $police = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts/category/Police" -Method Get
    Write-Host "  Found $($police.data.Count) police contacts" -ForegroundColor Gray
}

Test-Endpoint "Get All Categories (Public)" {
    $categories = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts/categories" -Method Get
    Write-Host "  Categories: $($categories.data -join ', ')" -ForegroundColor Gray
}

Test-Endpoint "Search Contacts (Public)" {
    $searchUrl = "$apiUrl/emergency-contacts/search?q=police"
    $results = Invoke-RestMethod -Uri $searchUrl -Method Get
    Write-Host "  Found $($results.data.Count) results" -ForegroundColor Gray
}

# ============================================
# STEP 6: Advanced Features
# ============================================
Write-Host "STEP 6: Advanced Features" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-Endpoint "Get Alert Statistics (Admin)" {
    if (-not $script:alertId) { throw "No alert ID available" }
    $headers = @{ Authorization = "Bearer $adminToken" }
    $stats = Invoke-RestMethod -Uri "$apiUrl/alerts/$($script:alertId)/statistics" `
        -Method Get `
        -Headers $headers
    
    Write-Host "  Total notifications: $($stats.data.total_notifications)" -ForegroundColor Gray
}

Test-Endpoint "Get Center Statistics (Admin)" {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $stats = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers/admin/statistics" `
        -Method Get `
        -Headers $headers
    
    Write-Host "  Total centers: $($stats.data.total_centers)" -ForegroundColor Gray
    Write-Host "  Total capacity: $($stats.data.total_capacity)" -ForegroundColor Gray
    Write-Host "  Total occupancy: $($stats.data.total_occupancy)" -ForegroundColor Gray
}

# ============================================
# RESULTS
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Your Phase 2 implementation is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review any failed tests" -ForegroundColor Gray
Write-Host "  2. Check server logs in backend/logs/" -ForegroundColor Gray
Write-Host "  3. Test broadcasting: POST /api/v1/alerts/ID/broadcast" -ForegroundColor Gray
Write-Host "  4. Add more test data for realistic scenarios" -ForegroundColor Gray
Write-Host ""
