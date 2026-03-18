# Assign Pangasinan jurisdiction to admin users for environmental monitoring
# PowerShell script for Windows

Write-Host "🌍 Assigning Pangasinan jurisdiction to admin users..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "MOBILE_APP/backend" -ErrorAction SilentlyContinue

# Run the Node.js script
try {
    node assign-pangasinan-jurisdiction.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Pangasinan jurisdiction assignment completed successfully!" -ForegroundColor Green
        Write-Host "🌦️ Environmental monitoring now includes Pangasinan cities" -ForegroundColor Cyan
        Write-Host "📝 Restart the backend server to apply changes" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Script execution failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running script: $_" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")