# Test Evacuation Center Coordinates
Write-Host "Testing Evacuation Center Coordinates..." -ForegroundColor Cyan

# Get existing center
Write-Host "`n1. Getting existing center (ID 2)..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/evacuation-centers/2" -Method GET -UseBasicParsing
$center = ($response.Content | ConvertFrom-Json).data
Write-Host "Current coordinates:" -ForegroundColor Green
Write-Host "  Latitude: $($center.latitude)" -ForegroundColor White
Write-Host "  Longitude: $($center.longitude)" -ForegroundColor White

# Update with new coordinates
Write-Host "`n2. Updating center with new coordinates..." -ForegroundColor Yellow
$updateData = @{
    name = $center.name
    address = $center.address
    city = $center.city
    province = $center.province
    latitude = 13.176902
    longitude = 123.730188
    capacity = $center.capacity
} | ConvertTo-Json

Write-Host "Sending update data:" -ForegroundColor Cyan
Write-Host $updateData -ForegroundColor White

$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/evacuation-centers/2" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $updateData `
    -UseBasicParsing

$updatedCenter = ($updateResponse.Content | ConvertFrom-Json).data
Write-Host "`nUpdated coordinates:" -ForegroundColor Green
Write-Host "  Latitude: $($updatedCenter.latitude)" -ForegroundColor White
Write-Host "  Longitude: $($updatedCenter.longitude)" -ForegroundColor White

# Verify by fetching again
Write-Host "`n3. Verifying by fetching again..." -ForegroundColor Yellow
$verifyResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/evacuation-centers/2" -Method GET -UseBasicParsing
$verifiedCenter = ($verifyResponse.Content | ConvertFrom-Json).data
Write-Host "Verified coordinates:" -ForegroundColor Green
Write-Host "  Latitude: $($verifiedCenter.latitude)" -ForegroundColor White
Write-Host "  Longitude: $($verifiedCenter.longitude)" -ForegroundColor White

# Check if coordinates match
if ($verifiedCenter.latitude -eq 13.176902 -and $verifiedCenter.longitude -eq 123.730188) {
    Write-Host "`n✅ SUCCESS: Coordinates saved and retrieved correctly!" -ForegroundColor Green
} else {
    Write-Host "`n❌ FAILED: Coordinates don't match!" -ForegroundColor Red
    Write-Host "Expected: 13.176902, 123.730188" -ForegroundColor Yellow
    Write-Host "Got: $($verifiedCenter.latitude), $($verifiedCenter.longitude)" -ForegroundColor Yellow
}
