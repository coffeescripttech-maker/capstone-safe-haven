# Test Dashboard API Endpoints
# Make sure backend server is running first!

Write-Host "=== Testing Dashboard API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Check if ADMIN_TOKEN is set
if (-not $env:ADMIN_TOKEN) {
    Write-Host "ERROR: ADMIN_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Please set it first:" -ForegroundColor Yellow
    Write-Host '  $env:ADMIN_TOKEN = "your_admin_token_here"' -ForegroundColor White
    Write-Host ""
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $env:ADMIN_TOKEN"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:3000/api/v1"

# Test 1: Get Dashboard Stats
Write-Host "1. Testing GET /admin/stats" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Stats:" -ForegroundColor Cyan
    $response.data | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# Test 2: Get Analytics
Write-Host "2. Testing GET /admin/analytics" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/analytics?days=7" -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Analytics data received" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# Test 3: Get Activity
Write-Host "3. Testing GET /admin/activity" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/activity?limit=5" -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Activity:" -ForegroundColor Cyan
    $response.data | ConvertTo-Json -Depth 2
    Write-Host ""
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# Test 4: Get System Health
Write-Host "4. Testing GET /admin/health" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Headers $headers -Method Get
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Health:" -ForegroundColor Cyan
    $response.data | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Dashboard API Tests Complete ===" -ForegroundColor Cyan
