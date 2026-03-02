# Test Web App Permissions Endpoint
Write-Host "Testing Web App Permissions..." -ForegroundColor Cyan

# Test if web app is running
Write-Host ""
Write-Host "1. Checking if web app is running on port 3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing -UseBasicParsing
    Write-Host "Web app is running" -ForegroundColor Green
} catch {
    Write-Host "Web app is not running on port 3000" -ForegroundColor Red
    Write-Host "Please start the web app with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test if backend is running
Write-Host ""
Write-Host "2. Checking if backend is running on port 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5 -UseBasicParsing -UseBasicParsing
    Write-Host "Backend is running" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running on port 3001" -ForegroundColor Red
    Write-Host "Please start the backend with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Login to get token
Write-Host ""
Write-Host "3. Logging in to get token..." -ForegroundColor Yellow
$loginBody = @{
    email = "superadmin@test.safehaven.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful" -ForegroundColor Green
} catch {
    Write-Host "Login failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test backend permissions endpoint directly
Write-Host ""
Write-Host "4. Testing backend endpoint directly..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/permissions" -Method GET -Headers $headers
    Write-Host "Backend endpoint working" -ForegroundColor Green
    Write-Host "  Permissions count: $($backendResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "Backend endpoint failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test web app proxy endpoint
Write-Host ""
Write-Host "5. Testing web app proxy endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $webResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/permissions" -Method GET -Headers $headers
    Write-Host "Web app proxy working" -ForegroundColor Green
    Write-Host "  Permissions count: $($webResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "Web app proxy failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "  1. Restart the Next.js dev server" -ForegroundColor White
    Write-Host "  2. Clear .next cache: Remove-Item -Recurse -Force web_app/.next" -ForegroundColor White
    Write-Host "  3. Check if route file exists at: web_app/src/app/api/admin/permissions/route.ts" -ForegroundColor White
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Green
