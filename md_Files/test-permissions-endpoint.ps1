# Test Permissions Endpoint
Write-Host "Testing Permissions Endpoint..." -ForegroundColor Cyan

# First, login to get a token
Write-Host "`n1. Logging in as super_admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "super@safehaven.com"
    password = "Super@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test GET /api/v1/admin/permissions
Write-Host "`n2. Testing GET /api/v1/admin/permissions..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $permissionsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/permissions" -Method GET -Headers $headers
    Write-Host "✓ Permissions endpoint working" -ForegroundColor Green
    Write-Host "Total permissions: $($permissionsResponse.data.Count)" -ForegroundColor Gray
    
    # Show first 5 permissions
    Write-Host "`nFirst 5 permissions:" -ForegroundColor Cyan
    $permissionsResponse.data | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - $($_.role): $($_.resource) -> $($_.action)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Permissions endpoint failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test the web app proxy endpoint
Write-Host "`n3. Testing web app proxy endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $proxyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/permissions" -Method GET -Headers $headers
    Write-Host "✓ Web app proxy working" -ForegroundColor Green
    Write-Host "Total permissions: $($proxyResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Web app proxy failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nThis might be because:" -ForegroundColor Yellow
    Write-Host "  1. Web app is not running on port 3000" -ForegroundColor White
    Write-Host "  2. Next.js hasn't picked up the route file" -ForegroundColor White
    Write-Host "  3. Try restarting the web app dev server" -ForegroundColor White
}

Write-Host "`n✓ Testing complete!" -ForegroundColor Green
