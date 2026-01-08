# Test Incidents API
Write-Host "Testing Incidents API..." -ForegroundColor Cyan

# Get all incidents
Write-Host "`n1. GET /api/v1/incidents" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/incidents" -Method Get
Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5

# Count incidents
if ($response.data.data) {
    Write-Host "`nTotal incidents: $($response.data.data.Count)" -ForegroundColor Cyan
    Write-Host "Pagination info:" -ForegroundColor Cyan
    Write-Host "  Total: $($response.data.total)" -ForegroundColor White
    Write-Host "  Page: $($response.data.page)" -ForegroundColor White
    Write-Host "  Limit: $($response.data.limit)" -ForegroundColor White
} else {
    Write-Host "`nNo incidents found or unexpected structure" -ForegroundColor Red
}
