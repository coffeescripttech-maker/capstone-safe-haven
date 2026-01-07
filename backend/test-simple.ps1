# Simple SafeHaven Phase 2 Test Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven Phase 2 API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"
$passed = 0
$failed = 0

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "   PASSED - Server is running" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 2: Register/Login Admin
Write-Host "2. Admin Authentication..." -ForegroundColor Yellow
$adminToken = $null
try {
    $registerBody = @{
        email = "admin@safehaven.com"
        phone = "09123456789"
        password = "Admin123!"
        firstName = "Admin"
        lastName = "User"
    } | ConvertTo-Json

    try {
        $register = Invoke-RestMethod -Uri "$apiUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
        $adminToken = $register.data.accessToken
        Write-Host "   PASSED - Admin registered" -ForegroundColor Green
    } catch {
        $loginBody = @{
            email = "admin@safehaven.com"
            password = "Admin123!"
        } | ConvertTo-Json
        
        $login = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $adminToken = $login.data.accessToken
        Write-Host "   PASSED - Admin logged in" -ForegroundColor Green
    }
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 3: Create Disaster Alert
Write-Host "3. Create Disaster Alert..." -ForegroundColor Yellow
$alertId = $null
try {
    $alertBody = @{
        alert_type = "typhoon"
        severity = "critical"
        title = "Typhoon Odette Approaching"
        description = "Strong typhoon expected to make landfall"
        source = "PAGASA"
        affected_areas = @("Cebu", "Bohol")
        latitude = 10.3157
        longitude = 123.8854
        radius_km = 100
        start_time = "2024-01-15T08:00:00Z"
        end_time = "2024-01-16T20:00:00Z"
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $alert = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Post -Body $alertBody -Headers $headers -ContentType "application/json"
    $alertId = $alert.data.id
    Write-Host "   PASSED - Alert ID: $alertId" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 4: Get All Alerts
Write-Host "4. Get All Alerts..." -ForegroundColor Yellow
try {
    $alerts = Invoke-RestMethod -Uri "$apiUrl/alerts" -Method Get
    Write-Host "   PASSED - Found $($alerts.data.total) alerts" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 5: Create Evacuation Center
Write-Host "5. Create Evacuation Center..." -ForegroundColor Yellow
$centerId = $null
try {
    $centerBody = @{
        name = "Cebu City Sports Center"
        address = "M.J. Cuenco Ave, Cebu City"
        city = "Cebu City"
        province = "Cebu"
        latitude = 10.3157
        longitude = 123.8854
        capacity = 5000
        contact_number = "09123456789"
        facilities = @("medical", "food", "water")
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $center = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" -Method Post -Body $centerBody -Headers $headers -ContentType "application/json"
    $centerId = $center.data.id
    Write-Host "   PASSED - Center ID: $centerId" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 6: Get All Centers
Write-Host "6. Get All Centers..." -ForegroundColor Yellow
try {
    $centers = Invoke-RestMethod -Uri "$apiUrl/evacuation-centers" -Method Get
    Write-Host "   PASSED - Found $($centers.data.total) centers" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 7: Create Emergency Contact
Write-Host "7. Create Emergency Contact..." -ForegroundColor Yellow
$contactId = $null
try {
    $contactBody = @{
        category = "Police"
        name = "Philippine National Police"
        phone = "09171234567"
        is_national = $true
        display_order = 0
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $adminToken" }
    $contact = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" -Method Post -Body $contactBody -Headers $headers -ContentType "application/json"
    $contactId = $contact.data.id
    Write-Host "   PASSED - Contact ID: $contactId" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   FAILED - $_" -ForegroundColor Red
    $failed++
}

# Test 8: Get All Contacts
Write-Host "8. Get All Contacts..." -ForegroundColor Yellow
try {
    $contacts = Invoke-RestMethod -Uri "$apiUrl/emergency-contacts" -Method Get
    $categories = $contacts.data.PSObject.Properties.Name
    Write-Host "   PASSED - Found $($categories.Count) categories" -ForegroundColor Green
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
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Your Phase 2 implementation is working!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check the errors above." -ForegroundColor Yellow
}
Write-Host ""
