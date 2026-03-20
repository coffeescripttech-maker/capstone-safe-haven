# Restart Backend Server with WebSocket Fix
# This script stops any running backend process and starts a fresh one

Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Kill any process on port 3001
Write-Host "🛑 Stopping any process on port 3001..." -ForegroundColor Yellow
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    foreach ($p in $process) {
        Write-Host "   Killing process $p on port $port" -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3001 cleared" -ForegroundColor Green
} else {
    Write-Host "   No process found on port 3001" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "   Backend will run on: http://localhost:3001" -ForegroundColor Gray
Write-Host "   WebSocket will run on: ws://localhost:3001/ws" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Watch for these logs:" -ForegroundColor Yellow
Write-Host "   ✅ WebSocket server initialized" -ForegroundColor Gray
Write-Host "   🔌 New WebSocket connection: [socket-id]" -ForegroundColor Gray
Write-Host "   🔐 Attempting to authenticate socket [socket-id]" -ForegroundColor Gray
Write-Host "   ✅ User [id] ([email]) authenticated on socket [socket-id]" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start the backend server
npm start
