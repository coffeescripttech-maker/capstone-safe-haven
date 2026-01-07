# Setup SOS Tables Script
# Run this to create the SOS alerts tables in your database

Write-Host "Setting up SOS Alerts tables..." -ForegroundColor Green

# Read the SQL file
$sqlContent = Get-Content -Path "..\database\sos_alerts.sql" -Raw

# Execute SQL (adjust path to your MySQL installation if needed)
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (Test-Path $mysqlPath) {
    Write-Host "Found MySQL at: $mysqlPath" -ForegroundColor Cyan
    
    # Execute the SQL
    $sqlContent | & $mysqlPath -u root safehaven_db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SOS tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Error creating tables. Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "MySQL not found at default location." -ForegroundColor Yellow
    Write-Host "Please run the SQL manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Open MySQL Workbench or command line" -ForegroundColor Cyan
    Write-Host "2. Connect to safehaven_db database" -ForegroundColor Cyan
    Write-Host "3. Run the SQL from: database\sos_alerts.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use this command:" -ForegroundColor Yellow
    Write-Host 'mysql -u root safehaven_db < ..\database\sos_alerts.sql' -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
