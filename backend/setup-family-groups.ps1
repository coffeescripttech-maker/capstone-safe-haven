# Setup Family/Group Locator Tables

Write-Host "Setting up Family/Group Locator tables..." -ForegroundColor Cyan

# Check if MySQL is accessible
try {
    mysql -u root -e "SELECT 1" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Cannot connect to MySQL. Make sure MySQL is running." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: MySQL command not found. Make sure MySQL is installed and in PATH." -ForegroundColor Red
    exit 1
}

# Run the SQL script
Write-Host "Creating tables..." -ForegroundColor Yellow
Get-Content ../database/family_groups.sql | mysql -u root safehaven_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tables created successfully!" -ForegroundColor Green
    Write-Host "`nTables created:" -ForegroundColor Cyan
    Write-Host "  - groups" -ForegroundColor White
    Write-Host "  - group_members" -ForegroundColor White
    Write-Host "  - location_shares" -ForegroundColor White
    Write-Host "  - group_alerts" -ForegroundColor White
} else {
    Write-Host "❌ Error creating tables" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Family/Group Locator setup complete!" -ForegroundColor Green
