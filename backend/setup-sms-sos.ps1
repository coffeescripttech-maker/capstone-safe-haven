# Setup SMS-based SOS Feature

Write-Host "🚀 Setting up SMS-based SOS feature..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Apply database migration
Write-Host "📦 Step 1: Applying database migration..." -ForegroundColor Yellow
node apply-sms-source-migration.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migration applied" -ForegroundColor Green
Write-Host ""

# Step 2: Build backend
Write-Host "🔨 Step 2: Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built" -ForegroundColor Green
Write-Host ""

# Step 3: Show next steps
Write-Host "✅ SMS-based SOS setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart backend: npm start" -ForegroundColor White
Write-Host "2. Install mobile dependencies: cd ../mobile && npm install" -ForegroundColor White
Write-Host "3. Configure SMSMobileAPI webhook:" -ForegroundColor White
Write-Host "   - URL: https://your-backend.com/api/v1/webhooks/sms-sos" -ForegroundColor Gray
Write-Host "   - Secret: safehaven_webhook_secret_2026" -ForegroundColor Gray
Write-Host "4. Test on physical device with SIM card" -ForegroundColor White
Write-Host ""
Write-Host "📱 SMS Format: SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE|EMAIL" -ForegroundColor Yellow
Write-Host "📱 Gateway Number: 09923150633" -ForegroundColor Yellow
Write-Host ""
