# Test SMS Blast Endpoint
# This script tests the POST /api/sms-blast endpoint

Write-Host "Testing SMS Blast Endpoint" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001/api"
$token = $env:TEST_TOKEN

if (-not $token) {
    Write-Host "ERROR: TEST_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:TEST_TOKEN = 'your-jwt-token'" -ForegroundColor Yellow
    exit 1
}

# Test 1: Create SMS blast with valid data
Write-Host "Test 1: Create SMS blast with valid data" -ForegroundColor Green
$body = @{
    message = "Test emergency alert: This is a test message"
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    language = "en"
    priority = "normal"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sms-blast" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Blast ID: $($response.data.blastId)" -ForegroundColor Cyan
    Write-Host "Recipient Count: $($response.data.recipientCount)" -ForegroundColor Cyan
    Write-Host "Estimated Cost: $($response.data.estimatedCost)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Create SMS blast without message (should fail)
Write-Host "Test 2: Create SMS blast without message (should fail)" -ForegroundColor Green
$body = @{
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    language = "en"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sms-blast" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✗ Should have failed but succeeded" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ Correctly rejected: $($_.Exception.Message)" -ForegroundColor Green
    Write-Host ""
}

# Test 3: Create SMS blast without authentication (should fail)
Write-Host "Test 3: Create SMS blast without authentication (should fail)" -ForegroundColor Green
$body = @{
    message = "Test alert"
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    language = "en"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sms-blast" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✗ Should have failed but succeeded" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ Correctly rejected: Authentication required" -ForegroundColor Green
    Write-Host ""
}

# Test 4: Create scheduled SMS blast
Write-Host "Test 4: Create scheduled SMS blast" -ForegroundColor Green
$scheduledTime = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$body = @{
    message = "Scheduled test alert"
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    language = "en"
    scheduledTime = $scheduledTime
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sms-blast" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Blast ID: $($response.data.blastId)" -ForegroundColor Cyan
    Write-Host "Status: $($response.data.status)" -ForegroundColor Cyan
    Write-Host "Scheduled Time: $($response.data.scheduledTime)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete" -ForegroundColor Cyan

