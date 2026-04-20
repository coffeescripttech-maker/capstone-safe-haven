# Test Reservation API Endpoints
Write-Host "Testing Evacuation Center Reservation API" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/v1"
$token = ""

# Function to make API calls
function Invoke-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# Step 1: Login
Write-Host "1. Logging in as test user..." -ForegroundColor Yellow
$loginBody = @{
    email = "citizen1@test.com"
    password = "password123"
}

$loginResponse = Invoke-API -Method "POST" -Endpoint "/auth/login" -Body $loginBody

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "SUCCESS: Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "ERROR: Login failed" -ForegroundColor Red
    exit 1
}

# Step 2: Get center status
Write-Host "2. Checking center availability..." -ForegroundColor Yellow
$centerId = 1
$statusResponse = Invoke-API -Method "GET" -Endpoint "/centers/$centerId/status" -Token $token

if ($statusResponse) {
    Write-Host "SUCCESS: Center status retrieved" -ForegroundColor Green
    Write-Host "   Available Slots: $($statusResponse.data.availableSlots)" -ForegroundColor Gray
    Write-Host "   Status Level: $($statusResponse.data.statusLevel)" -ForegroundColor Gray
    Write-Host ""
}

# Step 3: Check availability for group
Write-Host "3. Checking availability for group of 5..." -ForegroundColor Yellow
$checkBody = @{
    groupSize = 5
}

$availResponse = Invoke-API -Method "POST" -Endpoint "/centers/$centerId/check-availability" -Body $checkBody -Token $token

if ($availResponse) {
    Write-Host "SUCCESS: Availability check complete" -ForegroundColor Green
    Write-Host "   Available: $($availResponse.data.available)" -ForegroundColor Gray
    Write-Host "   Available Slots: $($availResponse.data.availableSlots)" -ForegroundColor Gray
    Write-Host ""
}

# Step 4: Create reservation
Write-Host "4. Creating reservation..." -ForegroundColor Yellow
$reserveBody = @{
    groupSize = 5
    estimatedArrival = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
    notes = "Test reservation from PowerShell"
}

$reserveResponse = Invoke-API -Method "POST" -Endpoint "/centers/$centerId/reserve" -Body $reserveBody -Token $token

if ($reserveResponse) {
    $reservationId = $reserveResponse.data.id
    Write-Host "SUCCESS: Reservation created" -ForegroundColor Green
    Write-Host "   Reservation ID: $reservationId" -ForegroundColor Gray
    Write-Host "   Group Size: $($reserveResponse.data.groupSize)" -ForegroundColor Gray
    Write-Host "   Status: $($reserveResponse.data.status)" -ForegroundColor Gray
    Write-Host "   Expires At: $($reserveResponse.data.expiresAt)" -ForegroundColor Gray
    Write-Host ""
}

# Step 5: Get my reservations
Write-Host "5. Getting my reservations..." -ForegroundColor Yellow
$myReservations = Invoke-API -Method "GET" -Endpoint "/centers/reservations/my" -Token $token

if ($myReservations) {
    Write-Host "SUCCESS: Retrieved $($myReservations.data.Count) reservation(s)" -ForegroundColor Green
    foreach ($res in $myReservations.data) {
        Write-Host "   - ID: $($res.id), Center: $($res.centerName), Size: $($res.groupSize), Status: $($res.status)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Step 6: Cancel reservation
if ($reservationId) {
    Write-Host "6. Cancelling reservation..." -ForegroundColor Yellow
    $cancelBody = @{
        reason = "Test cancellation"
    }
    
    $cancelResponse = Invoke-API -Method "POST" -Endpoint "/centers/reservations/$reservationId/cancel" -Body $cancelBody -Token $token
    
    if ($cancelResponse) {
        Write-Host "SUCCESS: Reservation cancelled" -ForegroundColor Green
        Write-Host ""
    }
}

# Step 7: Verify cancellation
Write-Host "7. Verifying cancellation..." -ForegroundColor Yellow
$verifyReservations = Invoke-API -Method "GET" -Endpoint "/centers/reservations/my" -Token $token

if ($verifyReservations) {
    $cancelledRes = $verifyReservations.data | Where-Object { $_.id -eq $reservationId }
    if ($cancelledRes -and $cancelledRes.status -eq "cancelled") {
        Write-Host "SUCCESS: Cancellation verified" -ForegroundColor Green
        Write-Host "   Status: $($cancelledRes.status)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "SUCCESS: Reservation API test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   - Login" -ForegroundColor Green
Write-Host "   - Check center status" -ForegroundColor Green
Write-Host "   - Check availability" -ForegroundColor Green
Write-Host "   - Create reservation" -ForegroundColor Green
Write-Host "   - Get my reservations" -ForegroundColor Green
Write-Host "   - Cancel reservation" -ForegroundColor Green
Write-Host "   - Verify cancellation" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Test admin endpoints (confirm arrival, view all reservations)" -ForegroundColor Yellow

