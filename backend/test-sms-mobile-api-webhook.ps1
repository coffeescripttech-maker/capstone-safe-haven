# Test SMS Mobile API Webhook Format
# This tests the exact format that SMS Mobile API sends

$baseUrl = "http://localhost:3001"

Write-Host "`n=== Testing SMS Mobile API Webhook Format ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Testing webhook health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/webhook/health" -Method Get
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Test 2: SMS Mobile API Format (their actual format)
Write-Host "`n2. Testing SMS Mobile API webhook format..." -ForegroundColor Yellow

$smsPayload = @{
    date = "2026-03-27"
    hour = "09:23:02"
    time_received = "20260327172254316"
    message = "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|Not provided"
    number = "639923150633"
    guid = "5C9D42DF-105D-4126-8F26-60D6C1E32BB3"
} | ConvertTo-Json

Write-Host "Sending payload:" -ForegroundColor Gray
Write-Host $smsPayload -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/webhook/sms-sos" `
        -Method Post `
        -ContentType "application/json" `
        -Body $smsPayload
    
    Write-Host "✅ SMS webhook processed successfully" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ SMS webhook failed: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Different agency targets
Write-Host "`n3. Testing different agency targets..." -ForegroundColor Yellow

$agencies = @("PNP", "BFP", "MDRRMO", "LGU", "BARANGAY", "ALL")

foreach ($agency in $agencies) {
    Write-Host "`nTesting agency: $agency" -ForegroundColor Gray
    
    $testPayload = @{
        date = "2026-03-27"
        hour = "10:30:00"
        time_received = (Get-Date -Format "yyyyMMddHHmmssfff")
        message = "SOS|$agency|14.5995,120.9842|6|Test User|09171234567"
        number = "639171234567"
        guid = [guid]::NewGuid().ToString()
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/webhook/sms-sos" `
            -Method Post `
            -ContentType "application/json" `
            -Body $testPayload
        
        Write-Host "  ✅ $agency - Success (SOS ID: $($response.sosId))" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $agency - Failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Check backend logs for detailed processing information" -ForegroundColor Gray
