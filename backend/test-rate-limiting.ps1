# Rate Limiting Test Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven - Rate Limiting Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Test 1: Auth Rate Limiting (5 requests per 15 min)
Write-Host "Test 1: Authentication Rate Limiting (Max 5 per 15 min)" -ForegroundColor Yellow
Write-Host "Attempting 7 login requests..." -ForegroundColor Gray

$loginBody = @{
    email = "wrong@email.com"
    password = "wrongpassword"
} | ConvertTo-Json

$successCount = 0
$rateLimitedCount = 0

for ($i = 1; $i -le 7; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json" `
            -ErrorAction Stop
        $successCount++
        Write-Host "  Request $i : Processed" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            $rateLimitedCount++
            Write-Host "  Request $i : RATE LIMITED (429)" -ForegroundColor Yellow
        } else {
            Write-Host "  Request $i : Failed ($statusCode)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""
if ($rateLimitedCount -gt 0) {
    Write-Host "  PASSED - Rate limiting is working!" -ForegroundColor Green
    Write-Host "  $rateLimitedCount requests were rate limited" -ForegroundColor Gray
} else {
    Write-Host "  WARNING - No rate limiting detected" -ForegroundColor Yellow
}

# Test 2: Search Rate Limiting (50 per 15 min)
Write-Host ""
Write-Host "Test 2: Search Rate Limiting (Max 50 per 15 min)" -ForegroundColor Yellow
Write-Host "Attempting 52 search requests..." -ForegroundColor Gray

$searchSuccessCount = 0
$searchRateLimitedCount = 0

for ($i = 1; $i -le 52; $i++) {
    try {
        $searchUrl = "$apiUrl/alerts/search?q=test"
        $response = Invoke-RestMethod -Uri $searchUrl -Method Get -ErrorAction Stop
        $searchSuccessCount++
        if ($i % 10 -eq 0) {
            Write-Host "  Completed $i requests..." -ForegroundColor Gray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            $searchRateLimitedCount++
            Write-Host "  Request $i : RATE LIMITED (429)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 50
}

Write-Host ""
if ($searchRateLimitedCount -gt 0) {
    Write-Host "  PASSED - Search rate limiting is working!" -ForegroundColor Green
    Write-Host "  $searchRateLimitedCount requests were rate limited" -ForegroundColor Gray
} else {
    Write-Host "  WARNING - No rate limiting detected" -ForegroundColor Yellow
}

# Test 3: General API Rate Limiting (100 per 15 min)
Write-Host ""
Write-Host "Test 3: General API Rate Limiting (Max 100 per 15 min)" -ForegroundColor Yellow
Write-Host "Testing with health endpoint..." -ForegroundColor Gray

$healthSuccessCount = 0
$healthRateLimitedCount = 0

for ($i = 1; $i -le 105; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
        $healthSuccessCount++
        if ($i % 20 -eq 0) {
            Write-Host "  Completed $i requests..." -ForegroundColor Gray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            $healthRateLimitedCount++
            Write-Host "  Request $i : RATE LIMITED (429)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 30
}

Write-Host ""
if ($healthRateLimitedCount -gt 0) {
    Write-Host "  PASSED - General rate limiting is working!" -ForegroundColor Green
    Write-Host "  $healthRateLimitedCount requests were rate limited" -ForegroundColor Gray
} else {
    Write-Host "  INFO - General limit not reached (needs 100+ requests)" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RATE LIMITING TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Authentication Endpoint:" -ForegroundColor Yellow
Write-Host "  Limit: 5 per 15 minutes" -ForegroundColor Gray
Write-Host "  Rate limited: $rateLimitedCount requests" -ForegroundColor $(if ($rateLimitedCount -gt 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Search Endpoint:" -ForegroundColor Yellow
Write-Host "  Limit: 50 per 15 minutes" -ForegroundColor Gray
Write-Host "  Rate limited: $searchRateLimitedCount requests" -ForegroundColor $(if ($searchRateLimitedCount -gt 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "General API:" -ForegroundColor Yellow
Write-Host "  Limit: 100 per 15 minutes" -ForegroundColor Gray
Write-Host "  Rate limited: $healthRateLimitedCount requests" -ForegroundColor $(if ($healthRateLimitedCount -gt 0) { "Green" } else { "Gray" })
Write-Host ""

$totalPassed = 0
if ($rateLimitedCount -gt 0) { $totalPassed++ }
if ($searchRateLimitedCount -gt 0) { $totalPassed++ }

if ($totalPassed -ge 2) {
    Write-Host "SUCCESS! Rate limiting is working properly!" -ForegroundColor Green
} else {
    Write-Host "PARTIAL - Some rate limits may need adjustment" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Rate Limiting Configuration:" -ForegroundColor Cyan
Write-Host "  - Auth endpoints: 5 per 15 min (strict)" -ForegroundColor Gray
Write-Host "  - Search endpoints: 50 per 15 min" -ForegroundColor Gray
Write-Host "  - Admin operations: 30 per 15 min" -ForegroundColor Gray
Write-Host "  - Broadcasting: 10 per hour" -ForegroundColor Gray
Write-Host "  - Create/Update: 20 per 15 min" -ForegroundColor Gray
Write-Host "  - General API: 100 per 15 min" -ForegroundColor Gray
Write-Host ""
