# Setup Real-Time WebSocket System
# Installs dependencies for backend and mobile

Write-Host "🚀 Setting up Real-Time WebSocket System..." -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install socket.io
npm install --save-dev @types/socket.io

Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install mobile dependencies
Write-Host "📦 Installing mobile dependencies..." -ForegroundColor Yellow
Set-Location ../mobile
npm install socket.io-client

Write-Host "✅ Mobile dependencies installed" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "✅ Real-Time WebSocket dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/src/server.ts (see REALTIME_WEBSOCKET_SETUP.md)" -ForegroundColor White
Write-Host "2. Update backend/src/services/alert.service.ts (see REALTIME_WEBSOCKET_SETUP.md)" -ForegroundColor White
Write-Host "3. Update mobile/App.tsx (see REALTIME_WEBSOCKET_SETUP.md)" -ForegroundColor White
Write-Host "4. Restart backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "5. Restart mobile: cd mobile && npx expo start --clear" -ForegroundColor White
