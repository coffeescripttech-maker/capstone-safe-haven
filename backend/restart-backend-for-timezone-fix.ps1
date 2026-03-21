# Restart Backend to Apply Timezone Fix
# This script stops any running backend process and starts it fresh

Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Kill any process running on port 3001
Write-Host "🛑 Stopping any process on port 3001..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "✅ Stopped process on port 3001" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "ℹ️  No process found on port 3001" -ForegroundColor Gray
    }
} catch {
    Write-Host "ℹ️  Port 3001 is free" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Note: The server will start in a new window" -ForegroundColor Yellow
Write-Host "   Close this window when you're done testing" -ForegroundColor Yellow
Write-Host ""

# Start the backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "✅ Backend server starting..." -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Wait 5-10 seconds, then test the API:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001/api/v1/incidents/35" -ForegroundColor White
Write-Host ""
Write-Host "📅 Expected: createdAt should show PH time (UTC+8)" -ForegroundColor Cyan
Write-Host "   UTC: 2026-03-20T16:16:52.000Z (4:16 PM)" -ForegroundColor Gray
Write-Host "   PH:  2026-03-21T00:16:52.000Z (12:16 AM next day)" -ForegroundColor Green
Write-Host ""
