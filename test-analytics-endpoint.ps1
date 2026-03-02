# Test Analytics Endpoint
Write-Host "Testing Analytics Endpoint..." -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n1. Checking if backend is running on port 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test"}' -ErrorAction SilentlyContinue
    Write-Host "Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "Backend is NOT running on port 3001" -ForegroundColor Red
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  cd MOBILE_APP/backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    exit 1
}

# Try to login with admin credentials
Write-Host "`n2. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@safehaven.com"
    password = "admin123"
} | ConvertTo-Json

$token = $null

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    
    if ($loginResponse.success) {
        Write-Host "Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token obtained" -ForegroundColor Gray
    }
} catch {
    Write-Host "Login error with admin credentials" -ForegroundColor Red
    Write-Host "Trying with super_admin credentials..." -ForegroundColor Yellow
    
    $loginBody2 = @{
        email = "superadmin@safehaven.com"
        password = "super123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody2 -ErrorAction Stop
        
        if ($loginResponse.success) {
            Write-Host "Login successful as super_admin!" -ForegroundColor Green
            $token = $loginResponse.data.token
        }
    } catch {
        Write-Host "Could not login with any admin credentials" -ForegroundColor Red
        exit 1
    }
}

if (-not $token) {
    Write-Host "Failed to get authentication token" -ForegroundColor Red
    exit 1
}

# Test the analytics endpoint
Write-Host "`n3. Testing /api/v1/admin/stats endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/stats" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($statsResponse.success) {
        Write-Host "Analytics endpoint is working!" -ForegroundColor Green
        Write-Host "`nStats Data:" -ForegroundColor Cyan
        $statsResponse.data | ConvertTo-Json -Depth 3
    } else {
        Write-Host "Analytics endpoint returned error" -ForegroundColor Red
    }
} catch {
    Write-Host "Analytics endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 403) {
            Write-Host "`nThis is a PERMISSION issue. The user doesn't have 'analytics' read permission." -ForegroundColor Yellow
            Write-Host "Check the role_permissions table in the database." -ForegroundColor Yellow
        } elseif ($statusCode -eq 401) {
            Write-Host "`nThis is an AUTHENTICATION issue. The token is invalid or expired." -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "`nThe endpoint doesn't exist. Check the backend routes." -ForegroundColor Yellow
        }
    }
}

Write-Host "`n4. Testing /api/v1/admin/analytics endpoint..." -ForegroundColor Yellow
try {
    $analyticsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/analytics?days=30" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($analyticsResponse.success) {
        Write-Host "Analytics data endpoint is working!" -ForegroundColor Green
    } else {
        Write-Host "Analytics data endpoint returned error" -ForegroundColor Red
    }
} catch {
    Write-Host "Analytics data endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
