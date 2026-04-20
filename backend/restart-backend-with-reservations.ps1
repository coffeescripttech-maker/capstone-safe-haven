# Restart Backend with Reservation Routes
# This script stops any running backend and starts it fresh

Write-Host "🔄 Restarting Backend with Reservation Routes..." -ForegroundColor Cyan
Write-Host ""

# Kill any process on port 3001
Write-Host "1. Stopping any process on port 3001..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "✅ Stopped process on port 3001" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "ℹ️  No process running on port 3001" -ForegroundColor Gray
    }
} catch {
    Write-Host "ℹ️  Port 3001 is free" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Backend will start in this terminal window" -ForegroundColor Yellow
Write-Host "⚠️  Keep this window open!" -ForegroundColor Yellow
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting in 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start the backend
npm run dev
