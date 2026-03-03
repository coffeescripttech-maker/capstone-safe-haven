# Simple test for audit logs backend

Write-Host "Testing Backend..." -ForegroundColor Cyan

# Login
$loginBody = '{"email":"superadmin@test.safehaven.com","password":"Test123!"}'
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

if ($login.token) {
    Write-Host "Login OK" -ForegroundColor Green
    
    # Test audit logs
    $headers = @{"Authorization" = "Bearer $($login.token)"}
    $url = "http://localhost:3001/api/v1/admin/audit-logs?limit=10"
    
    try {
        $result = Invoke-RestMethod -Uri $url -Headers $headers
        Write-Host "Audit Logs OK" -ForegroundColor Green
        $result | ConvertTo-Json -Depth 2
    } catch {
        Write-Host "Audit Logs FAILED" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
} else {
    Write-Host "Login FAILED" -ForegroundColor Red
}
