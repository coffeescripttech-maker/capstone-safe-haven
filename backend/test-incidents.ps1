# Test Incident Reporting API

$baseUrl = "http://localhost:3000/api/v1"
$token = ""  # Add your auth token here

Write-Host "Testing Incident Reporting API..." -ForegroundColor Cyan

# Test 1: Create Incident
Write-Host "`n1. Creating incident report..." -ForegroundColor Yellow
$createBody = @{
    incidentType = "damage"
    title = "Collapsed wall on Main Street"
    description = "A concrete wall collapsed after heavy rains, blocking the road"
    latitude = 14.5995
    longitude = 120.9842
    address = "Main Street, Barangay Centro, Manila"
    severity = "high"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/incidents" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $createBody
    
    Write-Host "✅ Incident created successfully!" -ForegroundColor Green
    Write-Host "Incident ID: $($response.data.id)" -ForegroundColor Cyan
    $incidentId = $response.data.id
} catch {
    Write-Host "❌ Error creating incident: $_" -ForegroundColor Red
}

# Test 2: Get All Incidents
Write-Host "`n2. Getting all incidents..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/incidents?limit=10" -Method Get
    Write-Host "✅ Retrieved $($response.data.data.Count) incidents" -ForegroundColor Green
    Write-Host "Total incidents: $($response.data.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error getting incidents: $_" -ForegroundColor Red
}

# Test 3: Get Incident by ID
if ($incidentId) {
    Write-Host "`n3. Getting incident by ID..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/incidents/$incidentId" -Method Get
        Write-Host "✅ Retrieved incident: $($response.data.title)" -ForegroundColor Green
        Write-Host "Status: $($response.data.status)" -ForegroundColor Cyan
        Write-Host "Severity: $($response.data.severity)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error getting incident: $_" -ForegroundColor Red
    }
}

# Test 4: Get My Incidents
Write-Host "`n4. Getting my incidents..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/incidents/my" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    Write-Host "✅ Retrieved $($response.data.Count) of your incidents" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting your incidents: $_" -ForegroundColor Red
}

# Test 5: Filter by Severity
Write-Host "`n5. Filtering by severity (high)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/incidents?severity=high" -Method Get
    Write-Host "✅ Retrieved $($response.data.data.Count) high severity incidents" -ForegroundColor Green
} catch {
    Write-Host "❌ Error filtering incidents: $_" -ForegroundColor Red
}

# Test 6: Filter by Status
Write-Host "`n6. Filtering by status (pending)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/incidents?status=pending" -Method Get
    Write-Host "✅ Retrieved $($response.data.data.Count) pending incidents" -ForegroundColor Green
} catch {
    Write-Host "❌ Error filtering incidents: $_" -ForegroundColor Red
}

Write-Host "`n✅ Incident Reporting API tests complete!" -ForegroundColor Green
Write-Host "`nNote: To test status updates, you need admin/LGU officer role" -ForegroundColor Yellow
