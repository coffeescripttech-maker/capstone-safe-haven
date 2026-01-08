# Test Evacuation Centers API
Write-Host "Testing Evacuation Centers API..." -ForegroundColor Cyan

# Get all centers
Write-Host "`n1. GET /api/v1/evacuation-centers" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/evacuation-centers" -Method Get
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.data.centers) {
        Write-Host "`nTotal centers: $($response.data.centers.Count)" -ForegroundColor Cyan
        Write-Host "Pagination:" -ForegroundColor Cyan
        Write-Host "  Total: $($response.data.total)" -ForegroundColor White
        Write-Host "  Page: $($response.data.page)" -ForegroundColor White
        Write-Host "  Limit: $($response.data.limit)" -ForegroundColor White
    } else {
        Write-Host "`nNo centers found or unexpected structure" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
