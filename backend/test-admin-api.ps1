# Test Admin API Endpoints

$baseUrl = "http://localhost:3000/api/v1"

Write-Host "=== Testing Admin API ===" -ForegroundColor Cyan
Write-Host ""

# First, login as admin to get token
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
    email = "admin@safehaven.com"
    password = "admin123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.data.token
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# Test dashboard stats
Write-Host "2. Getting dashboard statistics..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "✓ Stats retrieved successfully" -ForegroundColor Green
    Write-Host "Stats:" -ForegroundColor Gray
    $statsResponse.data | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get stats: $_" -ForegroundColor Red
    Write-Host ""
}

# Test analytics
Write-Host "3. Getting analytics data..." -ForegroundColor Yellow
try {
    $analyticsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/analytics?days=30" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "✓ Analytics retrieved successfully" -ForegroundColor Green
    Write-Host "Analytics:" -ForegroundColor Gray
    Write-Host "- Alerts over time: $($analyticsResponse.data.alertsOverTime.Count) days" -ForegroundColor Gray
    Write-Host "- Incidents by type: $($analyticsResponse.data.incidentsByType.Count) types" -ForegroundColor Gray
    Write-Host "- Alerts by severity: $($analyticsResponse.data.alertsBySeverity.Count) levels" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get analytics: $_" -ForegroundColor Red
    Write-Host ""
}

# Test activity feed
Write-Host "4. Getting recent activity..." -ForegroundColor Yellow
try {
    $activityResponse = Invoke-RestMethod -Uri "$baseUrl/admin/activity?limit=10" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "✓ Activity retrieved successfully" -ForegroundColor Green
    Write-Host "Recent activities: $($activityResponse.data.Count) items" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get activity: $_" -ForegroundColor Red
    Write-Host ""
}

# Test system health
Write-Host "5. Getting system health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "✓ Health retrieved successfully" -ForegroundColor Green
    Write-Host "System Health:" -ForegroundColor Gray
    $healthResponse.data | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get health: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Admin API Test Complete ===" -ForegroundColor Cyan
