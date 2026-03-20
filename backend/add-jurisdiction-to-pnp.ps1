# Add jurisdiction to PNP user
# This script updates the PNP user to have Pangasinan jurisdiction

Write-Host "Adding jurisdiction to PNP user..." -ForegroundColor Cyan

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$dbHost = $env:DB_HOST
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD
$dbName = $env:DB_NAME

Write-Host "Database: $dbName@$dbHost" -ForegroundColor Yellow

# Run the SQL script
$sqlFile = "add-jurisdiction-to-pnp.sql"

if (Test-Path $sqlFile) {
    Write-Host "Running SQL script: $sqlFile" -ForegroundColor Green
    
    # Execute SQL
    mysql -h $dbHost -u $dbUser -p$dbPassword $dbName < $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Jurisdiction added successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "PNP user now has jurisdiction: Pangasinan" -ForegroundColor Cyan
        Write-Host "The user can now access SMS blast features." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to add jurisdiction" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}
