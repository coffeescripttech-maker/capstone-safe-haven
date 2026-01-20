# Restart Backend Server
Write-Host "=== Restarting SafeHaven Backend Server ===" -ForegroundColor Cyan
Write-Host ""

# Stop all node processes (be careful with this!)
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Node processes stopped" -ForegroundColor Green
Write-Host ""

Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Run this command in a new terminal:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or press Ctrl+C and run: npm run dev" -ForegroundColor Yellow
