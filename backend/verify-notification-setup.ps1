# Verify Notification System Setup
Write-Host "🔍 Verifying SafeHaven Notification System Setup..." -ForegroundColor Cyan

# Check if TypeScript compiles without errors
Write-Host "Checking TypeScript compilation..." -ForegroundColor Yellow

try {
    # Try to compile TypeScript
    npx tsc --noEmit --skipLibCheck
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ TypeScript compilation error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if all required files exist
Write-Host "Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "src/routes/notifications.routes.ts",
    "src/controllers/notification.controller.ts",
    "src/routes/index.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Some required files are missing" -ForegroundColor Red
    exit 1
}

# Check if notification routes are properly imported
Write-Host "Checking route imports..." -ForegroundColor Yellow

$indexContent = Get-Content "src/routes/index.ts" -Raw
if ($indexContent -match "notificationRoutes" -and $indexContent -match "/notifications") {
    Write-Host "✅ Notification routes properly imported" -ForegroundColor Green
} else {
    Write-Host "❌ Notification routes not properly imported" -ForegroundColor Red
    exit 1
}

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredDeps = @("express", "jsonwebtoken", "mysql2")

foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
        Write-Host "✅ $dep dependency found" -ForegroundColor Green
    } else {
        Write-Host "❌ $dep dependency missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Notification system setup verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Apply database migration: ./database/apply-notification-system.ps1" -ForegroundColor White
Write-Host "2. Start backend server: npm run dev" -ForegroundColor White
Write-Host "3. Test integration: ./test-notification-integration.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Available endpoints after server start:" -ForegroundColor Yellow
Write-Host "  POST http://localhost:3001/api/notifications/register-device" -ForegroundColor White
Write-Host "  GET  http://localhost:3001/api/notifications/unread" -ForegroundColor White
Write-Host "  POST http://localhost:3001/api/notifications/mark-read" -ForegroundColor White
Write-Host "  POST http://localhost:3001/api/notifications/test" -ForegroundColor White