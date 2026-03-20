# Apply Notification System Migration
# This script creates the notification system tables and triggers

Write-Host "Applying notification system migration..." -ForegroundColor Green

# Database connection details
$env:MYSQL_HOST = "localhost"
$env:MYSQL_PORT = "3306"
$env:MYSQL_DATABASE = "safehaven_db"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = ""

# Apply the migration
try {
    Write-Host "Creating notification system tables..." -ForegroundColor Yellow
    
    mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE < "migrations/013_notification_system.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Notification system migration applied successfully!" -ForegroundColor Green
        
        # Verify tables were created
        Write-Host "Verifying tables..." -ForegroundColor Yellow
        
        $tables = @(
            "device_tokens",
            "user_notifications", 
            "user_notification_settings"
        )
        
        foreach ($table in $tables) {
            $result = mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE -e "SHOW TABLES LIKE '$table';" --skip-column-names
            
            if ($result -eq $table) {
                Write-Host "✅ Table '$table' created successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Table '$table' not found" -ForegroundColor Red
            }
        }
        
        # Check triggers
        Write-Host "Verifying triggers..." -ForegroundColor Yellow
        
        $triggers = @(
            "alert_notification_trigger",
            "sos_notification_trigger",
            "incident_notification_trigger"
        )
        
        foreach ($trigger in $triggers) {
            $result = mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE -e "SHOW TRIGGERS LIKE '%$trigger%';" --skip-column-names
            
            if ($result) {
                Write-Host "✅ Trigger '$trigger' created successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Trigger '$trigger' not found" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "🎉 Notification system is ready!" -ForegroundColor Green
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Restart the backend server" -ForegroundColor White
        Write-Host "2. Test notification registration from mobile app" -ForegroundColor White
        Write-Host "3. Send test notifications from admin panel" -ForegroundColor White
        
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error applying migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}