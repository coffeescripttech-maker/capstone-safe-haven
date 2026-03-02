# PowerShell Script: Apply Enhanced RBAC Migrations
# Description: Applies all RBAC database migrations to MySQL database
# Usage: .\apply-rbac-migrations.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enhanced RBAC Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from backend .env file
$envPath = "..\backend\.env"
if (Test-Path $envPath) {
    Write-Host "Loading database configuration from .env..." -ForegroundColor Yellow
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# Get database credentials
$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

if (-not $DB_HOST -or -not $DB_USER -or -not $DB_NAME) {
    Write-Host "Error: Database configuration incomplete in .env file" -ForegroundColor Red
    Write-Host "Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME" -ForegroundColor Red
    exit 1
}

Write-Host "Database: $DB_NAME" -ForegroundColor Green
Write-Host "Host: $DB_HOST" -ForegroundColor Green
Write-Host ""

# Confirm before proceeding
$confirmation = Read-Host "This will modify the database schema. Continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Yellow
Write-Host ""

# Change to migrations directory
Set-Location -Path "migrations"

# Apply each migration in order
$migrations = @(
    "001_enhance_rbac_users_table.sql",
    "002_create_role_permissions_table.sql",
    "003_create_audit_logs_table.sql",
    "004_seed_role_permissions.sql"
)

$success = $true

foreach ($migration in $migrations) {
    Write-Host "Applying $migration..." -ForegroundColor Cyan
    
    # Build mysql command
    $mysqlCmd = "mysql -h $DB_HOST -u $DB_USER"
    if ($DB_PASSWORD) {
        $mysqlCmd += " -p$DB_PASSWORD"
    }
    $mysqlCmd += " $DB_NAME"
    
    # Execute migration
    Get-Content $migration | & cmd /c $mysqlCmd 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $migration applied successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Error applying $migration" -ForegroundColor Red
        $success = $false
        break
    }
}

# Return to database directory
Set-Location -Path ".."

Write-Host ""
if ($success) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "All migrations completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary of changes:" -ForegroundColor Cyan
    Write-Host "  • Users table updated with 7 roles" -ForegroundColor White
    Write-Host "  • Jurisdiction column added to users" -ForegroundColor White
    Write-Host "  • role_permissions table created" -ForegroundColor White
    Write-Host "  • audit_logs table created" -ForegroundColor White
    Write-Host "  • Initial permissions seeded for all roles" -ForegroundColor White
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Migration failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and fix any issues." -ForegroundColor Yellow
    exit 1
}
