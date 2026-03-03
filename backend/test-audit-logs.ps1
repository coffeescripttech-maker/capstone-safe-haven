# Test Audit Logs API Endpoint

Write-Host "Testing Audit Logs API..." -ForegroundColor Cyan

# First, login to get token
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@safehaven.com","password":"Admin@123"}'

if ($loginResponse.token) {
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.token
    
    # Test audit logs endpoint
    Write-Host "`n2. Testing GET /api/v1/admin/audit-logs..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $auditLogsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs?limit=10&offset=0" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✓ Audit logs retrieved successfully" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $auditLogsResponse | ConvertTo-Json -Depth 5
        
    } catch {
        Write-Host "✗ Failed to get audit logs" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    # Test audit logs stats endpoint
    Write-Host "`n3. Testing GET /api/v1/admin/audit-logs/stats..." -ForegroundColor Yellow
    try {
        $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs/stats" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✓ Audit log stats retrieved successfully" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $statsResponse | ConvertTo-Json -Depth 5
        
    } catch {
        Write-Host "✗ Failed to get audit log stats" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host "✗ Login failed" -ForegroundColor Red
    $loginResponse | ConvertTo-Json
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
