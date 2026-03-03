# PowerShell Script: Verify SMS Blast Schema
# Description: Verifies that SMS blast migrations were applied correctly
# Requirements: 6.1, 18.4

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMS Blast Schema Verification" -ForegroundColor Cyan
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

# Build mysql command
$mysqlCmd = "mysql -h $dbHost -P $dbPort -u $dbUser"
if (![string]::IsNullOrEmpty($dbPassword)) {
    $mysqlCmd += " -p$dbPassword"
}
$mysqlCmd += " $dbName -N"

Write-Host "Checking SMS blast tables..." -ForegroundColor Yellow
Write-Host ""

# Check tables
$tables = @(
    "sms_blasts",
    "sms_jobs",
    "sms_templates",
    "contact_groups",
    "sms_audit_logs",
    "sms_credits",
    "sms_usage"
)

$allTablesExist = $true
foreach ($table in $tables) {
    $query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$dbName' AND table_name = '$table';"
    $result = $query | & cmd /c $mysqlCmd 2>&1
    
    if ($result -eq "1") {
        Write-Host "  ✓ $table exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $table missing" -ForegroundColor Red
        $allTablesExist = $false
    }
}

Write-Host ""
Write-Host "Checking users table enhancements..." -ForegroundColor Yellow
Write-Host ""

# Check phone_verified column
$query = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = '$dbName' AND table_name = 'users' AND column_name = 'phone_verified';"
$result = $query | & cmd /c $mysqlCmd 2>&1

if ($result -eq "1") {
    Write-Host "  ✓ phone_verified column exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ phone_verified column missing" -ForegroundColor Red
    $allTablesExist = $false
}

# Check indexes
$indexes = @(
    "idx_phone_number",
    "idx_phone_verified",
    "idx_active_verified_phone"
)

foreach ($index in $indexes) {
    $query = "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = '$dbName' AND table_name = 'users' AND index_name = '$index';"
    $result = $query | & cmd /c $mysqlCmd 2>&1
    
    if ([int]$result -gt 0) {
        Write-Host "  ✓ $index exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $index missing" -ForegroundColor Red
        $allTablesExist = $false
    }
}

Write-Host ""
Write-Host "Checking default templates..." -ForegroundColor Yellow
Write-Host ""

# Count default templates
$query = "SELECT COUNT(*) FROM sms_templates WHERE is_default = TRUE;"
$templateCount = $query | & cmd /c $mysqlCmd 2>&1

Write-Host "  Default templates found: $templateCount" -ForegroundColor White

if ([int]$templateCount -eq 10) {
    Write-Host "  ✓ All 10 default templates present (5 English + 5 Filipino)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Expected 10 templates, found $templateCount" -ForegroundColor Red
    $allTablesExist = $false
}

# Show template breakdown
$query = "SELECT category, language, COUNT(*) as count FROM sms_templates WHERE is_default = TRUE GROUP BY category, language ORDER BY category, language;"
Write-Host ""
Write-Host "  Template breakdown:" -ForegroundColor White
$query | & cmd /c $mysqlCmd 2>&1 | ForEach-Object {
    Write-Host "    $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Checking SMS credits..." -ForegroundColor Yellow
Write-Host ""

# Check credits record
$query = "SELECT COUNT(*) FROM sms_credits;"
$creditsCount = $query | & cmd /c $mysqlCmd 2>&1

if ([int]$creditsCount -gt 0) {
    Write-Host "  ✓ SMS credits record exists" -ForegroundColor Green
    
    $query = "SELECT balance, daily_limit FROM sms_credits LIMIT 1;"
    $creditsInfo = $query | & cmd /c $mysqlCmd 2>&1
    Write-Host "    Balance: $creditsInfo" -ForegroundColor Gray
} else {
    Write-Host "  ✗ SMS credits record missing" -ForegroundColor Red
    $allTablesExist = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($allTablesExist) {
    Write-Host "All SMS blast schema components verified successfully! ✓" -ForegroundColor Green
} else {
    Write-Host "Some schema components are missing. Please run migrations." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
