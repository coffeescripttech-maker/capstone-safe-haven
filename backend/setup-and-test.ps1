# Setup and Test Script for SafeHaven Phase 2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeHaven Phase 2 - Setup and Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Update user to admin
Write-Host "Step 1: Setting up admin user..." -ForegroundColor Yellow
Write-Host "Please run this SQL command manually in your MySQL client:" -ForegroundColor Gray
Write-Host ""
Write-Host "UPDATE users SET role = 'admin' WHERE email = 'admin@safehaven.com';" -ForegroundColor White
Write-Host ""
Write-Host "Press any key once you've run the SQL command..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Run tests
Write-Host "Step 2: Running tests..." -ForegroundColor Yellow
Write-Host ""

.\test-simple.ps1
