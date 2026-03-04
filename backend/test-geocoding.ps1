# Test Geocoding Feature

Write-Host "Testing Geocoding Feature..." -ForegroundColor Cyan

# Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = '{"email":"superadmin@test.safehaven.com","password":"Test123!"}'
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

if ($login.token) {
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $login.token
    $headers = @{"Authorization" = "Bearer $token"}
    
    # Update profile with address
    Write-Host "`n2. Updating profile with address..." -ForegroundColor Yellow
    $profileBody = @{
        address = "123 Main Street"
        barangay = "Poblacion"
        city = "Cebu City"
        province = "Cebu"
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/profile" -Method PUT -Headers $headers -ContentType "application/json" -Body $profileBody
        
        Write-Host "✓ Profile updated" -ForegroundColor Green
        Write-Host "`nProfile Data:" -ForegroundColor Cyan
        $result.data.profile | Format-List
        
        if ($result.data.profile.latitude -and $result.data.profile.longitude) {
            Write-Host "✓ Geocoding SUCCESS!" -ForegroundColor Green
            Write-Host "  Latitude: $($result.data.profile.latitude)" -ForegroundColor White
            Write-Host "  Longitude: $($result.data.profile.longitude)" -ForegroundColor White
            Write-Host "  Location: https://www.google.com/maps?q=$($result.data.profile.latitude),$($result.data.profile.longitude)" -ForegroundColor Cyan
        } else {
            Write-Host "✗ Geocoding FAILED - No coordinates returned" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "✗ Profile update failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    
} else {
    Write-Host "✗ Login failed" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
