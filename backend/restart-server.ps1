# Restart Backend Server
Write-Host "Restarting SafeHaven Backend Server..." -ForegroundColor Cyan

# Stop any running node processes on port 3000
Write-Host "`nStopping existing server..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($proc in $processes) {
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process $proc" -ForegroundColor Green
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "No existing server found on port 3000" -ForegroundColor Gray
}

# Start the server
Write-Host "`nStarting server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "`n✅ Server restart initiated!" -ForegroundColor Green
Write-Host "Check the new PowerShell window for server logs" -ForegroundColor Cyan
