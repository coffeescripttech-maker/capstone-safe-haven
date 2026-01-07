# Complete Test Script - Handles admin setup automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven Phase 2 - Complete Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Step 1: Register user
Write-Host "Step 1: Registering test user..." -ForegroundColor Yellow
$registerBody = @{
    email = "testadmin@safehaven.com"
    phone = "09987654321"
    password = "Admin123!"
    firstName = "Test"
    lastName = "Admin"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$apiUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "   User registered successfully" -ForegroundColor Green
    $userId = $register.data.user.id
} catch {
    Write-Host "   User already exists, logging in..." -ForegroundColor Gray
    $loginBody = @{
        email = "testadmin@safehaven.com"
        password = "Admin123!"
    } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $userId = $login.data.user.id
}

Write-Host ""
Write-Host "IMPORTANT: Manual Step Required" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Please run this SQL command to make the user an admin:" -ForegroundColor White
Write-Host ""
Write-Host "UPDATE users SET role = 'admin' WHERE id = $userId;" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or if you prefer using email:" -ForegroundColor White
Write-Host "UPDATE users SET role = 'admin' WHERE email = 'testadmin@safehaven.com';" -ForegroundColor Cyan
Write-Host ""
Write-Host "After running the SQL command, press any key to continue testing..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""
Write-Host ""

# Step 2: Login with admin privileges
Write-Host "Step 2: Logging in with admin privileges..." -ForegroundColor Yellow
$loginBody = @{
    email = "testadmin@safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $login.data.accessToken
    $userRole = $login.data.user.role
    Write-Host "   Logged in as: $userRole" -ForegroundColor Green
    
    if ($userRole -ne "admin") {
        Write-Host "   WARNING: User is not an admin! Tests will fail." -ForegroundColor Red
        Write-Host "   Please run the SQL command above and try again." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "   Login failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 3: Running Phase 2 Tests..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

$passed = 0
$failed = 0

# Test 1: Create Disaster Alert
Write-Host "Test 1: Create Disaster Alert..." -ForegroundColor Cyan
try {
    $alertBody = @{
        alert_type = "typhoon"
        severity = "critical"
        title = "Typhoon Odette Approaching"
        description = "Strong typhoon expected to make landfall in Visayas region"
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
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Post -Body $alertBody -Headers $headers -ContentType "application/json"
    $alertId = $alert.data.id
    Write-Host "   PASSED - Alert ID: $alertId" -ForegroundColor Green
    Write-Host "   Title: $($alert.data.title)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 2: Get All Alerts
Write-Host "Test 2: Get All Alerts (Public)..." -ForegroundColor Cyan
try {
    $alerts = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Get
    Write-Host "   PASSED - Found $($alerts.data.total) alerts" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 3: Update Alert
if ($alertId) {
    Write-Host "Test 3: Update Alert..." -ForegroundColor Cyan
    try {
        $updateBody = @{
            severity = "high"
            description = "Typhoon intensity decreased"
        } | ConvertTo-Json

        $headers = @{ Authorization = "Bearer $adminToken" }
        $updated = Invoke-RestMethod -Uri "$apiUrl/alerts/$alertId" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
        Write-Host "   PASSED - Updated severity to: $($updated.data.severity)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "   FAILED - $_" -ForegroundColor Red
        $failed++
    }
}

# Test 4: Create Evacuation Center
Write-Host "Test 4: Create Evacuation Center..." -ForegroundColor Cyan
try {
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
    $center = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" -Method Post -Body $centerBody -Headers $headers -ContentType "application/json"
    $centerId = $center.data.id
    Write-Host "   PASSED - Center ID: $centerId" -ForegroundColor Green
    Write-Host "   Name: $($center.data.name)" -ForegroundColor Gray
    Write-Host "   Capacity: $($center.data.capacity)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 5: Get All Centers
Write-Host "Test 5: Get All Centers (Public)..." -ForegroundColor Cyan
try {
    $centers = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" -Method Get
    Write-Host "   PASSED - Found $($centers.data.total) centers" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 6: Update Center Occupancy
if ($centerId) {
    Write-Host "Test 6: Update Center Occupancy..." -ForegroundColor Cyan
    try {
        $occupancyBody = @{
            occupancy = 1500
        } | ConvertTo-Json

        $headers = @{ Authorization = "Bearer $adminToken" }
        $updated = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers/$centerId/occupancy" -Method Patch -Body $occupancyBody -Headers $headers -ContentType "application/json"
        Write-Host "   PASSED - Occupancy: $($updated.data.current_occupancy)/$($updated.data.capacity)" -ForegroundColor Green
        Write-Host "   Percentage: $($updated.data.occupancy_percentage)%" -ForegroundColor Gray
        $passed++
    } catch {
        Write-Host "   FAILED - $_" -ForegroundColor Red
        $failed++
    }
}

# Test 7: Create Emergency Contact
Write-Host "Test 7: Create Emergency Contact..." -ForegroundColor Cyan
try {
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
    $contact = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" -Method Post -Body $contactBody -Headers $headers -ContentType "application/json"
    $contactId = $contact.data.id
    Write-Host "   PASSED - Contact ID: $contactId" -ForegroundColor Green
    Write-Host "   Name: $($contact.data.name)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 8: Get All Contacts
Write-Host "Test 8: Get All Contacts (Public)..." -ForegroundColor Cyan
try {
    $contacts = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" -Method Get
    $categories = $contacts.data.PSObject.Properties.Name
    Write-Host "   PASSED - Found $($categories.Count) categories" -ForegroundColor Green
    foreach ($cat in $categories) {
        $catData = $contacts.data.$cat
        Write-Host "     - ${cat}: $($catData.Count) contacts" -ForegroundColor Gray
    }
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 9: Get Alert Statistics
if ($alertId) {
    Write-Host "Test 9: Get Alert Statistics..." -ForegroundColor Cyan
    try {
        $headers = @{ Authorization = "Bearer $adminToken" }
        $stats = Invoke-RestMethod -Uri "$apiUrl/alerts/$alertId/statistics" -Method Get -Headers $headers
        Write-Host "   PASSED - Total notifications: $($stats.data.total_notifications)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "   FAILED - $_" -ForegroundColor Red
        $failed++
    }
}

# Test 10: Get Center Statistics
Write-Host "Test 10: Get Center Statistics..." -ForegroundColor Cyan
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $stats = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers/admin/statistics" -Method Get -Headers $headers
    Write-Host "   PASSED" -ForegroundColor Green
    Write-Host "     Total centers: $($stats.data.total_centers)" -ForegroundColor Gray
    Write-Host "     Total capacity: $($stats.data.total_capacity)" -ForegroundColor Gray
    Write-Host "     Total occupancy: $($stats.data.total_occupancy)" -ForegroundColor Gray
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "SUCCESS! ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Your Phase 2 implementation is working perfectly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What's been tested:" -ForegroundColor Cyan
    Write-Host "  - Disaster Alerts (Create, Read, Update)" -ForegroundColor Gray
    Write-Host "  - Evacuation Centers (Create, Read, Update Occupancy)" -ForegroundColor Gray
    Write-Host "  - Emergency Contacts (Create, Read)" -ForegroundColor Gray
    Write-Host "  - Statistics endpoints" -ForegroundColor Gray
} else {
    Write-Host "Some tests failed. Check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test broadcasting: POST /api/v1/alerts/ID/broadcast" -ForegroundColor Gray
Write-Host "  2. Test search endpoints" -ForegroundColor Gray
Write-Host "  3. Test nearby centers with different coordinates" -ForegroundColor Gray
Write-Host "  4. Add more test data" -ForegroundColor Gray
Write-Host ""
