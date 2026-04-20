# Apply Weather Forecast Migration
# Adds advance_notice_hours and forecast_data columns to disaster_alerts table

Write-Host "🔄 Applying Weather Forecast Migration..." -ForegroundColor Cyan

# Database connection details
$dbHost = "localhost"
$dbUser = "root"
$dbPassword = "root"  # Change this to your MySQL password
$dbName = "safehaven_db"

# Read migration file
$migrationFile = Join-Path $PSScriptRoot "migrations\014_add_advance_notice_hours.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

$sql = Get-Content $migrationFile -Raw

Write-Host "📄 Migration file loaded" -ForegroundColor Green
Write-Host "📊 Executing SQL..." -ForegroundColor Yellow

# Execute migration using mysql command
$mysqlCmd = "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName"

try {
    $sql | & mysql -h $dbHost -u $dbUser -p$dbPassword $dbName
    
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Added columns:" -ForegroundColor Cyan
    Write-Host "  • advance_notice_hours (INT)" -ForegroundColor White
    Write-Host "  • forecast_data (JSON)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Update alertAutomation.service.ts with forecast monitoring" -ForegroundColor White
    Write-Host "  2. Restart backend server" -ForegroundColor White
    Write-Host "  3. Check logs for predictive alerts" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error applying migration: $_" -ForegroundColor Red
    exit 1
}
