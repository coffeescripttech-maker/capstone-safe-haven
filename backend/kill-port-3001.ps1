# Script to kill process using port 3001
Write-Host "Finding process using port 3001..." -ForegroundColor Yellow

# Find the process using port 3001
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($process) {
    Write-Host "Found process with PID: $process" -ForegroundColor Cyan
    
    # Get process details
    $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
    
    if ($processInfo) {
        Write-Host "Process Name: $($processInfo.ProcessName)" -ForegroundColor Cyan
        Write-Host "Process Path: $($processInfo.Path)" -ForegroundColor Cyan
        
        # Ask for confirmation
        $confirm = Read-Host "Do you want to kill this process? (Y/N)"
        
        if ($confirm -eq 'Y' -or $confirm -eq 'y') {
            try {
                Stop-Process -Id $process -Force
                Write-Host "✅ Process killed successfully!" -ForegroundColor Green
                Write-Host "You can now run 'npm run dev' again" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to kill process: $_" -ForegroundColor Red
                Write-Host "Try running this script as Administrator" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Operation cancelled" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not get process details" -ForegroundColor Red
    }
} else {
    Write-Host "✅ No process found using port 3001" -ForegroundColor Green
    Write-Host "Port 3001 is available!" -ForegroundColor Green
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
