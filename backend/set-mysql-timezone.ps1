# Set MySQL timezone to Philippine Time
# Run this script to configure MySQL server timezone

Write-Host "Setting MySQL timezone to Philippine Time (UTC+8)..." -ForegroundColor Yellow

# Execute SQL commands
mysql -u root -p -e "SET GLOBAL time_zone = '+08:00'; SET time_zone = '+08:00'; SELECT @@global.time_zone, @@session.time_zone, NOW() as current_time;"

Write-Host "`nMySQL timezone has been set to UTC+8 (Philippine Time)" -ForegroundColor Green
Write-Host "Please restart your MySQL server for changes to take effect" -ForegroundColor Cyan
