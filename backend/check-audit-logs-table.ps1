# Check if audit_logs table exists and has data

Write-Host "Checking audit_logs table..." -ForegroundColor Cyan

# Read database credentials from .env
$envContent = Get-Content .env
$dbHost = ($envContent | Select-String "DB_HOST=(.+)").Matches.Groups[1].Value
$dbUser = ($envContent | Select-String "DB_USER=(.+)").Matches.Groups[1].Value
$dbPassword = ($envContent | Select-String "DB_PASSWORD=(.+)").Matches.Groups[1].Value
$dbName = ($envContent | Select-String "DB_NAME=(.+)").Matches.Groups[1].Value

Write-Host "Database: $dbName" -ForegroundColor Yellow

# Check if table exists
Write-Host "`nChecking if audit_logs table exists..." -ForegroundColor Yellow
$checkTableQuery = "SHOW TABLES LIKE 'audit_logs';"
$tableExists = mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $checkTableQuery 2>&1

if ($tableExists -match "audit_logs") {
    Write-Host "✓ audit_logs table exists" -ForegroundColor Green
    
    # Check table structure
    Write-Host "`nTable structure:" -ForegroundColor Yellow
    $describeQuery = "DESCRIBE audit_logs;"
    mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $describeQuery
    
    # Check row count
    Write-Host "`nChecking row count..." -ForegroundColor Yellow
    $countQuery = "SELECT COUNT(*) as count FROM audit_logs;"
    mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $countQuery
    
    # Show sample data
    Write-Host "`nSample data (last 5 rows):" -ForegroundColor Yellow
    $sampleQuery = "SELECT id, user_id, role, action, resource, status, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5;"
    mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $sampleQuery
    
} else {
    Write-Host "✗ audit_logs table does NOT exist" -ForegroundColor Red
    Write-Host "Run the migration: database/migrations/003_create_audit_logs_table.sql" -ForegroundColor Yellow
}

Write-Host "`nDone!" -ForegroundColor Cyan
