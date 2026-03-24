# Quick Test for Real-Time WebSocket Notifications
# Creates a test alert to verify real-time updates

Write-Host "Testing Real-Time WebSocket Notifications" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://192.168.43.25:3001/api/v1"
$email = "admin@test.safehaven.com"
$password = "Test123!"

Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    # Extract token from response (it's in data.accessToken)
    $token = $loginResponse.data.accessToken
    
    if (-not $token) {
        Write-Host "[ERROR] No token in response" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "[OK] Login successful" -ForegroundColor Green
    Write-Host "[DEBUG] Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Creating test alert..." -ForegroundColor Yellow
Write-Host "[WATCH] Check your mobile app - alert should appear in < 1 second!" -ForegroundColor Cyan
Write-Host ""

$alertBody = @{
    alert_type = "earthquake"
    severity = "high"
    title = "Real-Time Test Alert - $(Get-Date -Format 'HH:mm:ss')"
    description = "This is a test alert to verify real-time WebSocket notifications are working. You should see this instantly!"
    source = "PHIVOLCS"
    affected_areas = @("Pangasinan", "La Union")
    start_time = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    is_active = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $alertResponse = Invoke-RestMethod -Uri "$baseUrl/alerts" -Method Post -Body $alertBody -Headers $headers
    Write-Host "[OK] Alert created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Alert Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($alertResponse.id)" -ForegroundColor White
    Write-Host "  Title: $($alertResponse.title)" -ForegroundColor White
    Write-Host "  Severity: $($alertResponse.severity)" -ForegroundColor White
    Write-Host ""
    Write-Host "[SUCCESS] Check your mobile app - the alert should appear instantly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What to verify:" -ForegroundColor Yellow
    Write-Host "  1. Alert appears in mobile app within 1 second" -ForegroundColor White
    Write-Host "  2. Badge counter updates automatically" -ForegroundColor White
    Write-Host "  3. No need to refresh or pull down" -ForegroundColor White
    Write-Host "  4. Check console logs for WebSocket messages" -ForegroundColor White
} catch {
    Write-Host "[ERROR] Failed to create alert: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "WebSocket Connection Status:" -ForegroundColor Cyan
Write-Host "  Backend: Check for 'Broadcasting new alert' in backend logs" -ForegroundColor White
Write-Host "  Mobile: Check for 'Received new alert' in mobile logs" -ForegroundColor White
