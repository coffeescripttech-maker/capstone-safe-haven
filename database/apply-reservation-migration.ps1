# Apply Reservation System Migration
Write-Host "Applying Evacuation Center Reservation Migration..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Navigate to database directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $scriptPath" -ForegroundColor Gray
Write-Host ""

# Run migration script
Write-Host "Running migration script..." -ForegroundColor Yellow
node apply-reservation-migration.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What was created:" -ForegroundColor Cyan
    Write-Host "   1. center_reservations table" -ForegroundColor White
    Write-Host "   2. center_availability view" -ForegroundColor White
    Write-Host "   3. Updated evacuation_centers table" -ForegroundColor White
    Write-Host ""
    Write-Host "Next: Restart backend server" -ForegroundColor Yellow
    Write-Host "   cd ..\backend" -ForegroundColor Gray
    Write-Host "   .\restart-backend.ps1" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}
