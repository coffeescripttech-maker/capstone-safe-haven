# Test Predictive Weather Alerts
# Complete testing workflow

Write-Host "🌦️  Predictive Weather Alerts - Testing Workflow" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Step 1: Check if backend is compiled
Write-Host "Step 1: Checking backend compilation..." -ForegroundColor Yellow
if (-not (Test-Path "dist/services/weather.service.js")) {
    Write-Host "❌ Backend not compiled. Running build..." -ForegroundColor Red
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build complete" -ForegroundColor Green
} else {
    Write-Host "✅ Backend already compiled" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check current forecast
Write-Host "Step 2: Checking current weather forecast..." -ForegroundColor Yellow
Write-Host ""
node check-forecast.js
Write-Host ""

# Step 3: Ask user if they want to run full test
Write-Host "Step 3: Run full monitoring test?" -ForegroundColor Yellow
$response = Read-Host "This will create alerts if severe weather is forecast (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Running full forecast monitoring test..." -ForegroundColor Cyan
    Write-Host ""
    node test-forecast-monitoring.js
} else {
    Write-Host ""
    Write-Host "✅ Test complete! No alerts created." -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 To create alerts, run: node test-forecast-monitoring.js" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ Testing workflow complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check database: SELECT * FROM disaster_alerts WHERE advance_notice_hours IS NOT NULL;" -ForegroundColor White
Write-Host "  2. Open mobile app to see advance notice badges" -ForegroundColor White
Write-Host "  3. Check web portal emergency alerts page" -ForegroundColor White
Write-Host ""
