# Test Emergency Contacts API

Write-Host "Testing Emergency Contacts API..." -ForegroundColor Cyan

# Get all contacts
Write-Host "`n1. GET /api/v1/emergency-contacts" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/emergency-contacts" -Method Get
Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10

# Get categories
Write-Host "`n2. GET /api/v1/emergency-contacts/categories" -ForegroundColor Yellow
$categories = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/emergency-contacts/categories" -Method Get
Write-Host "Categories:" -ForegroundColor Green
$categories | ConvertTo-Json -Depth 10
