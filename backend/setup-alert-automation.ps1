# Setup Alert Automation System
# Run this script to set up the database schema for alert automation

Write-Host "=== SafeHaven Alert Automation Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow

try {
    # Run the schema setup
    Write-Host "Creating alert automation tables..." -ForegroundColor Green
    Get-Content ..\database\alert_automation_schema.sql | mysql -u root -p safehaven_db
    
    Write-Host ""
    Write-Host "Alert automation schema created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tables created:" -ForegroundColor Cyan
    Write-Host "  - alert_rules (with 6 default rules)" -ForegroundColor White
    Write-Host "  - alert_automation_logs" -ForegroundColor White
    Write-Host "  - Updated disaster_alerts table" -ForegroundColor White
    Write-Host ""
    Write-Host "Default Rules Installed:" -ForegroundColor Cyan
    Write-Host "  1. Heavy Rain Warning (>50mm)" -ForegroundColor White
    Write-Host "  2. Extreme Heat Advisory (>38C)" -ForegroundColor White
    Write-Host "  3. Strong Wind Warning (>60km/h)" -ForegroundColor White
    Write-Host "  4. Moderate Earthquake Alert (M5.0-5.9)" -ForegroundColor White
    Write-Host "  5. Strong Earthquake Alert (M6.0-6.9)" -ForegroundColor White
    Write-Host "  6. Major Earthquake Alert (M7.0+)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your backend server" -ForegroundColor White
    Write-Host "2. Test the automation: .\test-alert-automation.ps1" -ForegroundColor White
    Write-Host "3. Access admin dashboard: http://localhost:3001/alert-automation" -ForegroundColor White
    
} catch {
    Write-Host "Error setting up schema" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  - MySQL is running" -ForegroundColor White
    Write-Host "  - Database safehaven_db exists" -ForegroundColor White
    Write-Host "  - You have the correct MySQL password" -ForegroundColor White
}
