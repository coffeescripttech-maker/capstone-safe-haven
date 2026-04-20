# Apply FCM Token Migration
# Adds fcm_token and notification_preferences to users table

Write-Host "Applying FCM Token Migration..." -ForegroundColor Cyan

# Load environment variables
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

Write-Host "Database: $DB_NAME@$DB_HOST" -ForegroundColor Yellow

# Apply migration
$migrationFile = Join-Path $PSScriptRoot "migrations\015_add_fcm_token_to_users.sql"

Write-Host "`nApplying migration: 015_add_fcm_token_to_users.sql" -ForegroundColor Green

$mysqlCmd = "mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME"
Get-Content $migrationFile | & mysql -h $DB_HOST -u $DB_USER "-p$DB_PASSWORD" $DB_NAME 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nVerifying changes..." -ForegroundColor Cyan

# Verify the columns were added
$verifyQuery = @"
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('fcm_token', 'notification_preferences')
ORDER BY ORDINAL_POSITION;
"@

Write-Host "`nColumns added to users table:" -ForegroundColor Yellow
$verifyQuery | & mysql -h $DB_HOST -u $DB_USER "-p$DB_PASSWORD" $DB_NAME -t

Write-Host "`n✓ FCM Token migration complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart the backend server" -ForegroundColor White
Write-Host "2. Mobile app will automatically register FCM tokens on login" -ForegroundColor White
Write-Host "3. Test push notifications with predictive weather alerts" -ForegroundColor White
