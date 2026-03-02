# Direct backend test
Write-Host "Testing backend directly..." -ForegroundColor Cyan

# Login
Write-Host "`nStep 1: Login..." -ForegroundColor Yellow
$login = curl.exe -s -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" --data "@login-payload.json"
Write-Host $login

$loginData = $login | ConvertFrom-Json
if ($loginData.status -eq "success") {
    $token = $loginData.data.accessToken
    Write-Host "`nStep 2: Test permissions endpoint..." -ForegroundColor Yellow
    $perms = curl.exe -s -X GET http://localhost:3001/api/v1/admin/permissions -H "Authorization: Bearer $token"
    Write-Host $perms
} else {
    Write-Host "Login failed!" -ForegroundColor Red
}
