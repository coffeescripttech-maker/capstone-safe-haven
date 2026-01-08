# Test if token is being sent to /users endpoint
Write-Host "Testing /users endpoint with token..." -ForegroundColor Cyan

# Get token from a successful login first
$loginBody = @{
    email = "mdexter958@gmail.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "`nLogging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken

Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Green

# Test /users endpoint
Write-Host "`nTesting /users endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users" -Method GET -Headers $headers
    Write-Host "✅ SUCCESS! Users endpoint works with token" -ForegroundColor Green
    Write-Host "Total users: $($usersResponse.data.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED! Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
