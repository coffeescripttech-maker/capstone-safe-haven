# Test Alerts API

Write-Host "Testing Alerts API..." -ForegroundColor Cyan

# Get all alerts
Write-Host "`n1. GET /api/v1/alerts (all alerts)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/alerts" -Method Get
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Get active alerts only
Write-Host "`n2. GET /api/v1/alerts?is_active=true (active only)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/alerts?is_active=true" -Method Get
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
