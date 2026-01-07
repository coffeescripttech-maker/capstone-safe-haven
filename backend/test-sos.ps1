# Test SOS Endpoint Script

Write-Host "Testing SOS Alert Endpoint..." -ForegroundColor Green
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3000/api/v1"

# Step 1: Login to get token
Write-Host "1. Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "mdexter958@gmail.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Send SOS Alert
Write-Host "2. Sending SOS Alert..." -ForegroundColor Cyan
$sosBody = @{
    latitude = 10.3157
    longitude = 123.8854
    message = "Emergency! Need help immediately!"
    userInfo = @{
        name = "Juan Dela Cruz"
        phone = "09123456789"
    }
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $sosResponse = Invoke-RestMethod -Uri "$baseUrl/sos" -Method Post -Body $sosBody -Headers $headers
    Write-Host "✓ SOS Alert sent successfully!" -ForegroundColor Green
    Write-Host "SOS ID: $($sosResponse.data.id)" -ForegroundColor Yellow
    Write-Host "Status: $($sosResponse.data.status)" -ForegroundColor Yellow
    Write-Host "Created: $($sosResponse.data.createdAt)" -ForegroundColor Yellow
    
    $sosId = $sosResponse.data.id
} catch {
    Write-Host "✗ SOS Alert failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Get My SOS Alerts
Write-Host "3. Getting my SOS alerts..." -ForegroundColor Cyan
try {
    $myAlertsResponse = Invoke-RestMethod -Uri "$baseUrl/sos/my-alerts" -Method Get -Headers $headers
    Write-Host "✓ Retrieved $($myAlertsResponse.data.total) SOS alert(s)" -ForegroundColor Green
    
    if ($myAlertsResponse.data.alerts.Count -gt 0) {
        Write-Host ""
        Write-Host "Recent SOS Alerts:" -ForegroundColor Yellow
        foreach ($alert in $myAlertsResponse.data.alerts | Select-Object -First 3) {
            Write-Host "  - ID: $($alert.id) | Status: $($alert.status) | Created: $($alert.created_at)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Failed to get alerts: $_" -ForegroundColor Red
}

Write-Host ""

# Step 4: Get SOS Statistics
Write-Host "4. Getting SOS statistics..." -ForegroundColor Cyan
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/sos/statistics" -Method Get -Headers $headers
    Write-Host "✓ Statistics retrieved" -ForegroundColor Green
    Write-Host "Total SOS Alerts: $($statsResponse.data.total)" -ForegroundColor Yellow
    Write-Host "Pending: $($statsResponse.data.pending)" -ForegroundColor Yellow
    Write-Host "Resolved: $($statsResponse.data.resolved)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Failed to get statistics: $_" -ForegroundColor Red
}

Write-Host ""

# Step 5: Get specific SOS Alert
if ($sosId) {
    Write-Host "5. Getting SOS alert details..." -ForegroundColor Cyan
    try {
        $detailResponse = Invoke-RestMethod -Uri "$baseUrl/sos/$sosId" -Method Get -Headers $headers
        Write-Host "✓ SOS Alert details retrieved" -ForegroundColor Green
        Write-Host "Message: $($detailResponse.data.message)" -ForegroundColor Yellow
        Write-Host "Location: $($detailResponse.data.latitude), $($detailResponse.data.longitude)" -ForegroundColor Yellow
        Write-Host "Priority: $($detailResponse.data.priority)" -ForegroundColor Yellow
    } catch {
        Write-Host "✗ Failed to get alert details: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "SOS Endpoint Testing Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
