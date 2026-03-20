# Restart Backend with Notification System
Write-Host "🔄 Restarting SafeHaven Backend with Notification System..." -ForegroundColor Cyan

# Kill any existing backend processes
Write-Host "Stopping existing backend processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*backend*" -or $_.CommandLine -like "*backend*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Navigate to backend directory
Set-Location "MOBILE_APP/backend"

# Install any missing dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
npm install

# Start the backend server
Write-Host "Starting backend server with notification system..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Notification endpoints:" -ForegroundColor Cyan
Write-Host "  POST /api/notifications/register-device" -ForegroundColor White
Write-Host "  GET  /api/notifications/unread" -ForegroundColor White
Write-Host "  POST /api/notifications/mark-read" -ForegroundColor White
Write-Host "  POST /api/notifications/test" -ForegroundColor White
Write-Host "  GET  /api/notifications/settings" -ForegroundColor White
Write-Host "  PUT  /api/notifications/settings" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start with nodemon for development
npm run dev