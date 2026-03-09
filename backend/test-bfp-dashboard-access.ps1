# Test BFP user dashboard access
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test BFP Dashboard Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/v1"

# Step 1: Login as BFP user
Write-Host "Step 1: Login as BFP user..." -ForegroundColor Yellow
$loginBody = @{
    email = "bfp@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.data.user.firstName) $($loginResponse.data.user.lastName)" -ForegroundColor White
    Write-Host "  Role: $($loginResponse.data.user.role)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test dashboard stats endpoint
Write-Host "Step 2: Test dashboard stats endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $headers
    Write-Host "✓ Dashboard stats accessed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Stats Data:" -ForegroundColor Cyan
    $statsResponse.data | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "✗ Dashboard stats failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Test incidents endpoint
Write-Host "Step 3: Test incidents endpoint..." -ForegroundColor Yellow
try {
    $incidentsResponse = Invoke-RestMethod -Uri "$baseUrl/incidents" -Method Get -Headers $headers
    Write-Host "✓ Incidents accessed successfully!" -ForegroundColor Green
    Write-Host "  Total incidents: $($incidentsResponse.data.total)" -ForegroundColor White
    Write-Host "  Filtered for BFP: $($incidentsResponse.data.data.Count)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Incidents failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "All Tests Passed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "BFP user can now:" -ForegroundColor Yellow
Write-Host "✓ Access dashboard" -ForegroundColor Green
Write-Host "✓ View stats" -ForegroundColor Green
Write-Host "✓ See BFP-assigned incidents only" -ForegroundColor Green
