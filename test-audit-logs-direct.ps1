# Test audit logs endpoint directly (bypass Next.js)

Write-Host "Testing Audit Logs Backend Endpoint..." -ForegroundColor Cyan

# Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@safehaven.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    if ($loginResponse.token) {
        Write-Host "✓ Login successful" -ForegroundColor Green
        $token = $loginResponse.token
        
        # Test audit logs endpoint
        Write-Host "`n2. Testing audit logs endpoint..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        try {
            $auditResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs?limit=10&offset=0" `
                -Method GET `
                -Headers $headers
            
            Write-Host "✓ Audit logs endpoint working!" -ForegroundColor Green
            Write-Host "`nResponse:" -ForegroundColor Cyan
            $auditResponse | ConvertTo-Json -Depth 3
            
        } catch {
            Write-Host "✗ Audit logs endpoint failed" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response: $responseBody" -ForegroundColor Red
            }
        }
        
        # Test stats endpoint
        Write-Host "`n3. Testing stats endpoint..." -ForegroundColor Yellow
        try {
            $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/audit-logs/stats" `
                -Method GET `
                -Headers $headers
            
            Write-Host "✓ Stats endpoint working!" -ForegroundColor Green
            Write-Host "`nResponse:" -ForegroundColor Cyan
            $statsResponse | ConvertTo-Json -Depth 3
            
        } catch {
            Write-Host "✗ Stats endpoint failed" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
        }
        
    } else {
        Write-Host "✗ Login failed - no token received" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If backend works, restart Next.js:" -ForegroundColor White
Write-Host "   cd MOBILE_APP/web_app" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Refresh page at http://localhost:3000/audit-logs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
