# Fix Photo Upload Issue - MySQL Packet Size

Write-Host "Fixing photo upload issue..." -ForegroundColor Cyan

Write-Host "`nThe error 'max_allowed_packet' means photos are too large for MySQL." -ForegroundColor Yellow
Write-Host "`nTwo solutions:" -ForegroundColor Cyan

Write-Host "`n1. QUICK FIX - Increase MySQL packet size:" -ForegroundColor Green
Write-Host "   Run this SQL command in MySQL Workbench:" -ForegroundColor White
Write-Host "   SET GLOBAL max_allowed_packet=67108864;" -ForegroundColor Yellow
Write-Host "   Then restart your backend server" -ForegroundColor White

Write-Host "`n2. PERMANENT FIX - Edit MySQL config file:" -ForegroundColor Green
Write-Host "   Location: C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" -ForegroundColor White
Write-Host "   Add under [mysqld] section:" -ForegroundColor White
Write-Host "   max_allowed_packet=64M" -ForegroundColor Yellow
Write-Host "   Then restart MySQL service" -ForegroundColor White

Write-Host "`n3. CODE FIX - Already applied:" -ForegroundColor Green
Write-Host "   ✅ Reduced photo quality from 70% to 30%" -ForegroundColor White
Write-Host "   ✅ Fixed deprecated MediaTypeOptions warning" -ForegroundColor White
Write-Host "   ✅ Photos will now be smaller" -ForegroundColor White

Write-Host "`nRecommended steps:" -ForegroundColor Cyan
Write-Host "1. Open MySQL Workbench" -ForegroundColor White
Write-Host "2. Run: SET GLOBAL max_allowed_packet=67108864;" -ForegroundColor Yellow
Write-Host "3. Restart backend: cd backend && npm start" -ForegroundColor White
Write-Host "4. Try uploading photos again" -ForegroundColor White

Write-Host "`nAlternatively, you can:" -ForegroundColor Cyan
Write-Host "- Upload fewer photos (1-2 instead of 5)" -ForegroundColor White
Write-Host "- Use smaller resolution images" -ForegroundColor White
Write-Host "- The app now uses 30% quality (was 70%)" -ForegroundColor White

Write-Host "`n✅ Code fixes applied! Restart your app to use lower quality photos." -ForegroundColor Green
