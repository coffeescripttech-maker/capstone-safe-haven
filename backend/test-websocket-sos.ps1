# Test WebSocket SOS Broadcast
# This script creates a test SOS alert to verify WebSocket notifications

Write-Host "🧪 Testing WebSocket SOS Broadcast..." -ForegroundColor Cyan
Write-Host ""

# Get token (login as admin)
Write-Host "🔐 Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "https://capstone-safe-haven.onrender.com/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@safehaven.com","password":"admin123"}'

$token = $loginResponse.data.token
Write-Host "✅ Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Create a test SOS alert
Write-Host "🚨 Creating test SOS alert..." -ForegroundColor Yellow
$sosBody = @{
    userId = 6
    latitude = 13.174030
    longitude = 123.732330
    message = "TEST: WebSocket notification test"
    targetAgency = "all"
} | ConvertTo-Json

Write-Host "📤 Request body:" -ForegroundColor Gray
Write-Host $sosBody -ForegroundColor Gray
Write-Host ""

try {
    $sosResponse = Invoke-RestMethod -Uri "https://capstone-safe-haven.onrender.com/api/v1/sos" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $sosBody
    
    Write-Host "✅ SOS Alert Created!" -ForegroundColor Green
    Write-Host "   SOS ID: $($sosResponse.data.id)" -ForegroundColor Cyan
    Write-Host "   User ID: $($sosResponse.data.userId)" -ForegroundColor Cyan
    Write-Host "   Target Agency: $($sosResponse.data.target_agency)" -ForegroundColor Cyan
    Write-Host "   Status: $($sosResponse.data.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📢 WebSocket broadcast should have been sent!" -ForegroundColor Yellow
    Write-Host "   Check browser console for: '🚨 [SOS WebSocket] NEW SOS ALERT RECEIVED!'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔊 Notification sound should have played!" -ForegroundColor Yellow
    Write-Host "🔔 Badge count should have incremented!" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error creating SOS alert:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Test complete!" -ForegroundColor Green
