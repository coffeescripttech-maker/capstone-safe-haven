# Test Incident Timezone Fix
# This script tests that incidents return Philippine Time (UTC+8)

Write-Host "🧪 Testing Incident Timezone Fix..." -ForegroundColor Cyan
Write-Host ""

# Get token (replace with your actual token or login first)
$token = "YOUR_TOKEN_HERE"

# Test incident ID
$incidentId = 32

Write-Host "📍 Testing incident #$incidentId" -ForegroundColor Yellow
Write-Host ""

# Make API request
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/incidents/$incidentId" -Headers $headers -Method Get
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
    Write-Host ""
    
    # Extract and display the timestamps
    $createdAt = $response.data.createdAt
    $updatedAt = $response.data.updatedAt
    
    Write-Host "📅 Timestamps:" -ForegroundColor Cyan
    Write-Host "  Created At: $createdAt"
    Write-Host "  Updated At: $updatedAt"
    Write-Host ""
    
    # Parse the timestamp to check the hour
    $createdDate = [DateTime]::Parse($createdAt)
    $hour = $createdDate.Hour
    
    Write-Host "🕐 Time Analysis:" -ForegroundColor Cyan
    Write-Host "  Hour: $hour"
    Write-Host "  Expected: Should be 8 hours ahead of UTC"
    Write-Host ""
    
    # Check if it looks like PH time (8 hours ahead)
    if ($hour -ge 8) {
        Write-Host "✅ PASS: Timestamp appears to be in Philippine Time (UTC+8)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Timestamp appears to still be in UTC" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Backend is running (npm run dev in backend folder)"
    Write-Host "  2. You have a valid token"
    Write-Host "  3. Incident #$incidentId exists"
}

Write-Host ""
Write-Host "📝 Note:" -ForegroundColor Cyan
Write-Host "  - Database stores times in UTC (standard practice)"
Write-Host "  - API converts to Philippine Time (UTC+8) when returning data"
Write-Host "  - Example: UTC 02:08:44 → PH Time 10:08:44"
Write-Host ""
