# Test Estimate Recipients Endpoint
# This script tests the new estimate endpoint that counts recipients before sending

$baseUrl = "http://localhost:3001/api/v1"

Write-Host "=== Testing Estimate Recipients Endpoint ===" -ForegroundColor Cyan
Write-Host ""

# First, login to get a token
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Estimate with province filter
Write-Host "2. Testing estimate with province filter" -ForegroundColor Yellow
$estimateBody1 = @{
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    language = "en"
} | ConvertTo-Json

try {
    $estimateResponse1 = Invoke-RestMethod -Uri "$baseUrl/sms-blast/estimate" -Method Post -Body $estimateBody1 -Headers $headers -ContentType "application/json"
    Write-Host "✓ Estimate successful" -ForegroundColor Green
    Write-Host "   Recipient Count: $($estimateResponse1.data.recipientCount)" -ForegroundColor Gray
    Write-Host "   Estimated Cost: $($estimateResponse1.data.estimatedCost) credits" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Estimate failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Estimate with multiple provinces
Write-Host "3. Testing estimate with multiple provinces" -ForegroundColor Yellow
$estimateBody2 = @{
    recipientFilters = @{
        provinces = @("Metro Manila", "Cebu")
    }
    language = "en"
} | ConvertTo-Json

try {
    $estimateResponse2 = Invoke-RestMethod -Uri "$baseUrl/sms-blast/estimate" -Method Post -Body $estimateBody2 -Headers $headers -ContentType "application/json"
    Write-Host "✓ Estimate successful" -ForegroundColor Green
    Write-Host "   Recipient Count: $($estimateResponse2.data.recipientCount)" -ForegroundColor Gray
    Write-Host "   Estimated Cost: $($estimateResponse2.data.estimatedCost) credits" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Estimate failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Estimate with message (to calculate SMS parts)
Write-Host "4. Testing estimate with message" -ForegroundColor Yellow
$longMessage = "This is a test emergency alert message that is longer than 160 characters to test multi-part SMS calculation. This message should be split into multiple SMS parts and the cost should reflect that."
$estimateBody3 = @{
    recipientFilters = @{
        provinces = @("Metro Manila")
    }
    message = $longMessage
    language = "en"
} | ConvertTo-Json

try {
    $estimateResponse3 = Invoke-RestMethod -Uri "$baseUrl/sms-blast/estimate" -Method Post -Body $estimateBody3 -Headers $headers -ContentType "application/json"
    Write-Host "✓ Estimate successful" -ForegroundColor Green
    Write-Host "   Recipient Count: $($estimateResponse3.data.recipientCount)" -ForegroundColor Gray
    Write-Host "   Character Count: $($estimateResponse3.data.characterCount)" -ForegroundColor Gray
    Write-Host "   SMS Parts: $($estimateResponse3.data.smsPartCount)" -ForegroundColor Gray
    Write-Host "   Estimated Cost: $($estimateResponse3.data.estimatedCost) credits" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Estimate failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Estimate with no filters (should fail or return 0)
Write-Host "5. Testing estimate with no filters" -ForegroundColor Yellow
$estimateBody4 = @{
    recipientFilters = @{
        provinces = @()
    }
    language = "en"
} | ConvertTo-Json

try {
    $estimateResponse4 = Invoke-RestMethod -Uri "$baseUrl/sms-blast/estimate" -Method Post -Body $estimateBody4 -Headers $headers -ContentType "application/json"
    Write-Host "✓ Estimate returned" -ForegroundColor Green
    Write-Host "   Recipient Count: $($estimateResponse4.data.recipientCount)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✓ Expected behavior - no filters provided" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Estimate Recipients Tests Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: The recipient count should update in real-time in the web interface" -ForegroundColor Yellow
Write-Host "when you select provinces in the SMS Blast send page." -ForegroundColor Yellow
