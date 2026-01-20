# Fix Logo Loading Issue - SafeHaven
# This script helps troubleshoot and fix logo loading issues

Write-Host "=== SafeHaven Logo Loading Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if logo file exists
Write-Host "1. Checking if my_logo.jpg exists..." -ForegroundColor Yellow
$logoPath = "public/images/logo/my_logo.jpg"
if (Test-Path $logoPath) {
    Write-Host "   ✓ Logo file found at: $logoPath" -ForegroundColor Green
    $fileInfo = Get-Item $logoPath
    Write-Host "   File size: $($fileInfo.Length) bytes" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Logo file NOT found at: $logoPath" -ForegroundColor Red
    Write-Host "   Please make sure the file exists in the correct location" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✓ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ .next folder doesn't exist (already clean)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Clearing node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✓ node_modules/.cache deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ node_modules/.cache doesn't exist" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Hard refresh your browser:" -ForegroundColor White
Write-Host "   - Chrome/Edge: Ctrl + Shift + R" -ForegroundColor Cyan
Write-Host "   - Firefox: Ctrl + F5" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. If still not working, check browser console (F12) for errors" -ForegroundColor White
Write-Host ""
Write-Host "The logo should now load correctly!" -ForegroundColor Green
