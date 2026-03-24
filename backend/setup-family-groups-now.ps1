# Setup Family Groups Tables

Write-Host "=== Setting up Family Groups Tables ===" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVarialahat po sir kahit sa SOS
Jocelyn
Example: nag report ako kay bfp dpt si bfp and super admin lng po yung makakakita 

Same with pnp, dpt sila lng ni super admin 

Lgu, sila lng ni super admin 

Mdrrmo, sila lng ni super adminble($name, $value, "Process")
        }
    }
}

$dbHost = $env:DB_HOST
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD
$dbName = $env:DB_NAME

Write-Host "Database: $dbName@$dbHost" -ForegroundColor Gray
Write-Host ""

# Read SQL file
$sqlFile = Join-Path $PSScriptRoot "..\database\family_groups.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

$sql = Get-Content $sqlFile -Raw

Write-Host "Executing SQL script..." -ForegroundColor Yellow

# Execute SQL using mysql command
try {
    $passwordArg = "-p$dbPassword"
    $sql | mysql -h $dbHost -u $dbUser $passwordArg $dbName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Family groups tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to create tables" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error executing SQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart the backend server" -ForegroundColor Gray
Write-Host "2. Test group creation and joining" -ForegroundColor Gray
