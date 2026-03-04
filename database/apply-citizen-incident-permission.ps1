# Apply citizen incident read permission
# This script adds the 'read' permission for citizens on incidents resource

Write-Host "🔧 Adding citizen incident read permission..." -ForegroundColor Cyan

# Load environment variables
$envPath = Join-Path $PSScriptRoot ".." "backend" ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Loaded environment variables from .env" -ForegroundColor Green
}

# Get database credentials
$dbHost = $env:DB_HOST
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD
$dbName = $env:DB_NAME

Write-Host "📊 Database: $dbName@$dbHost" -ForegroundColor Yellow

# Apply the SQL script
$sqlFile = Join-Path $PSScriptRoot "add-citizen-incident-read-permission.sql"

Write-Host "📝 Applying SQL script..." -ForegroundColor Cyan

mysql -h $dbHost -u $dbUser -p"$dbPassword" $dbName < $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Permission added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Citizens can now:" -ForegroundColor Cyan
    Write-Host "  ✓ Create incident reports" -ForegroundColor Green
    Write-Host "  ✓ Read/view incident reports" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Failed to add permission" -ForegroundColor Red
    exit 1
}
