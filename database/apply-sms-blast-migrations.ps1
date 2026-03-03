# PowerShell Script: Apply SMS Blast Migrations
# Description: Applies all SMS blast database migrations
# Requirements: 6.1, 18.4

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMS Blast Emergency Alerts - Database Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from backend/.env
$envFile = "backend/.env"
if (Test-Path $envFile) {
    Write-Host "Loading database credentials from $envFile..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

# Get database credentials
$dbHost = $env:DB_HOST
if ([string]::IsNullOrEmpty($dbHost)) { $dbHost = "localhost" }

$dbPort = $env:DB_PORT
if ([string]::IsNullOrEmpty($dbPort)) { $dbPort = "3306" }

$dbUser = $env:DB_USER
if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "root" }

$dbPassword = $env:DB_PASSWORD
$dbName = $env:DB_NAME
if ([string]::IsNullOrEmpty($dbName)) { $dbName = "safehaven_db" }

Write-Host "Database Configuration:" -ForegroundColor Green
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host "  Port: $dbPort" -ForegroundColor White
Write-Host "  User: $dbUser" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host ""

# Confirm before proceeding
$confirmation = Read-Host "Apply SMS blast migrations to database '$dbName'? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Yellow
Write-Host ""

# Change to migrations directory
Set-Location -Path "database/migrations"

# Array of migration files
$migrations = @(
    "008_create_sms_blast_tables.sql",
    "009_add_phone_fields_to_users.sql",
    "010_seed_sms_templates.sql"
)

$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    Write-Host "Applying $migration..." -ForegroundColor Cyan
    
    # Build mysql command
    $mysqlCmd = "mysql -h $dbHost -P $dbPort -u $dbUser"
    if (![string]::IsNullOrEmpty($dbPassword)) {
        $mysqlCmd += " -p$dbPassword"
    }
    $mysqlCmd += " $dbName"
    
    # Execute migration
    try {
        Get-Content $migration | & cmd /c $mysqlCmd 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $migration applied successfully" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ $migration failed" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "  ✗ $migration failed: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "All SMS blast migrations applied successfully! ✓" -ForegroundColor Green
    
    # Run verification queries
    Write-Host ""
    Write-Host "Verifying migrations..." -ForegroundColor Yellow
    
    $verifyQuery = @"
SELECT COUNT(*) as sms_tables_created FROM information_schema.tables 
WHERE table_schema = '$dbName' AND table_name LIKE 'sms_%';
"@
    
    $result = $verifyQuery | & cmd /c $mysqlCmd -N 2>&1
    Write-Host "SMS tables created: $result" -ForegroundColor White
    
    $templateQuery = "SELECT COUNT(*) as default_templates FROM sms_templates WHERE is_default = TRUE;"
    $templateResult = $templateQuery | & cmd /c $mysqlCmd -N 2>&1
    Write-Host "Default templates seeded: $templateResult" -ForegroundColor White
    
} else {
    Write-Host "Some migrations failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

# Return to original directory
Set-Location -Path "../.."

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
