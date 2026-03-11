# Test SOS Filtering - Verify Role-Based Access
# This script tests that PNP/BFP only see their assigned SOS alerts

Write-Host "=== Testing SOS Filtering ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"

# Test users
$users = @{
    "Super Admin" = @{ email = "superadmin@test.safehaven.com"; password = "Test123!@#"; expectedAll = $true }
    "MDRRMO" = @{ email = "admin@test.safehaven.com"; password = "Test123!@#"; expectedAll = $true }
    "PNP" = @{ email = "pnp@test.safehaven.com"; password = "Test123!@#"; expectedAll = $false; agency = "pnp" }
    "BFP" = @{ email = "bfp@test.safehaven.com"; password = "Test123!@#"; expectedAll = $false; agency = "bfp" }
}

foreach ($userName in $users.Keys) {
    $user = $users[$userName]
    
    Write-Host "Testing: $userName ($($user.email))" -ForegroundColor Yellow
    
    # Login
    try {
        $loginBody = @{
            email = $user.email
            password = $user.password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $token = $loginResponse.token
        
        Write-Host "  ✓ Login successful" -ForegroundColor Green
        Write-Host "  Role: $($loginResponse.user.role)" -ForegroundColor Gray
        
        # Get SOS alerts
        $headers = @{
            "Authorization" = "Bearer $token"
            "ngrok-skip-browser-warning" = "true"
        }
        
        $sosResponse = Invoke-RestMethod -Uri "$baseUrl/sos" -Method Get -Headers $headers
        
        Write-Host "  ✓ Retrieved $($sosResponse.total) SOS alerts" -ForegroundColor Green
        
        # Check target agencies
        if ($sosResponse.alerts.Count -gt 0) {
            $agencies = $sosResponse.alerts | Select-Object -ExpandProperty targetAgency -Unique
            Write-Host "  Target Agencies: $($agencies -join ', ')" -ForegroundColor Gray
            
            # Verify filtering
            if ($user.expectedAll) {
                Write-Host "  ✓ Expected: See ALL SOS alerts" -ForegroundColor Green
            } else {
                $expectedAgencies = @($user.agency, "all")
                $unexpectedAgencies = $agencies | Where-Object { $_ -notin $expectedAgencies }
                
                if ($unexpectedAgencies.Count -eq 0) {
                    Write-Host "  ✓ Filtering correct: Only sees $($user.agency) and 'all' SOS" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ ERROR: Seeing unexpected agencies: $($unexpectedAgencies -join ', ')" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  No SOS alerts found" -ForegroundColor Gray
        }
        
        # Get SOS statistics
        $statsResponse = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $headers
        Write-Host "  SOS Stats - Total: $($statsResponse.sosAlerts.total)" -ForegroundColor Gray
        
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Yellow
Write-Host "  - Super Admin: Sees ALL SOS alerts" -ForegroundColor Gray
Write-Host "  - MDRRMO: Sees ALL SOS alerts" -ForegroundColor Gray
Write-Host "  - PNP: Only sees PNP + 'all' SOS alerts" -ForegroundColor Gray
Write-Host "  - BFP: Only sees BFP + 'all' SOS alerts" -ForegroundColor Gray
