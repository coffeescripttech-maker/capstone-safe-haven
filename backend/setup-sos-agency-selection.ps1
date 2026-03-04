# Setup SOS Agency Selection Feature
# This script applies the database migration for target_agency column

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SOS Agency Selection Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$DB_HOST = "localhost"
$DB_USER = "root"
$DB_NAME = "safehaven_db"
$MIGRATION_FILE = "..\database\migrations\011_add_target_agency_to_sos.sql"

Write-Host "Step 1: Checking if migration file exists..." -ForegroundColor Yellow
if (!(Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Migration file not found: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migration file found" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Applying database migration..." -ForegroundColor Yellow
Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host "Migration: 011_add_target_agency_to_sos.sql" -ForegroundColor Gray
Write-Host ""

# Apply migration
try {
    Get-Content $MIGRATION_FILE | mysql -u $DB_USER -p $DB_NAME
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 3: Verifying migration..." -ForegroundColor Yellow
$verifyQuery = "DESCRIBE sos_alerts;"
$result = $verifyQuery | mysql -u $DB_USER -p $DB_NAME

if ($result -match "target_agency") {
    Write-Host "✅ target_agency column added successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not verify target_agency column" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 4: Checking existing SOS alerts..." -ForegroundColor Yellow
$countQuery = "SELECT COUNT(*) as count FROM sos_alerts;"
$count = $countQuery | mysql -u $DB_USER -p $DB_NAME -N

Write-Host "Found $count existing SOS alert(s)" -ForegroundColor Gray
if ($count -gt 0) {
    Write-Host "ℹ️  Existing alerts will have target_agency = 'all' by default" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart backend server: npm run dev" -ForegroundColor White
Write-Host "2. Test mobile app SOS button" -ForegroundColor White
Write-Host "3. Verify agency selection appears" -ForegroundColor White
Write-Host "4. Send test SOS with different agencies" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: ../SOS_AGENCY_SELECTION_IMPLEMENTATION.md" -ForegroundColor Gray
