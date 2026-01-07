# Setup Incident Reporting Feature

Write-Host "Setting up Incident Reporting feature..." -ForegroundColor Cyan

# Install mobile dependencies
Write-Host "`nInstalling mobile dependencies..." -ForegroundColor Yellow
Set-Location mobile
npm install

# Compile backend
Write-Host "`nCompiling backend..." -ForegroundColor Yellow
Set-Location ../backend
npm run build

Write-Host "`n✅ Incident Reporting feature setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend && npm start"
Write-Host "2. Start mobile app: cd mobile && npx expo start"
Write-Host "3. Test incident reporting feature"
