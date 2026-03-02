# Create Test Users for RBAC Testing
# This script creates 7 test users (one for each role)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SafeHaven RBAC Test Users Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to database directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Running test user generation script..." -ForegroundColor Yellow
Write-Host ""

# Run the Node.js script
node generate-test-users.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Test Users Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now login with these credentials:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Password: Test123!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Emails:" -ForegroundColor Cyan
    Write-Host "    • superadmin@test.safehaven.com  (Super Admin)" -ForegroundColor White
    Write-Host "    • admin@test.safehaven.com       (Admin)" -ForegroundColor White
    Write-Host "    • mdrrmo@test.safehaven.com      (MDRRMO)" -ForegroundColor White
    Write-Host "    • pnp@test.safehaven.com         (PNP)" -ForegroundColor White
    Write-Host "    • bfp@test.safehaven.com         (BFP)" -ForegroundColor White
    Write-Host "    • lgu@test.safehaven.com         (LGU Officer - Manila)" -ForegroundColor White
    Write-Host "    • citizen@test.safehaven.com     (Citizen)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Error creating test users. Check the output above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
