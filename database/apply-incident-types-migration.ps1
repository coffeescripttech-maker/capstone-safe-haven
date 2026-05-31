# PowerShell script to apply incident types migration

Write-Host "🚀 Applying Incident Types Migration..." -ForegroundColor Cyan

# Load environment variables
$envFile = Join-Path $PSScriptRoot ".." "backend" ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

# Get database credentials
$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

Write-Host "📊 Database: $DB_NAME" -ForegroundColor Yellow
Write-Host "🖥️  Host: $DB_HOST" -ForegroundColor Yellow

# Path to migration file
$migrationFile = Join-Path $PSScriptRoot "migrations" "add_incident_types.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Migration file: $migrationFile" -ForegroundColor Yellow

# Apply migration using mysql command
Write-Host "`n🔄 Applying migration..." -ForegroundColor Cyan

try {
    # Apply the migration
    Get-Content $migrationFile | mysql -h $DB_HOST -u $DB_USER "-p$DB_PASSWORD" $DB_NAME 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Migration applied successfully!" -ForegroundColor Green
        Write-Host "✅ Created incident_types table" -ForegroundColor Green
        Write-Host "✅ Created incident_type_responders table" -ForegroundColor Green
        Write-Host "✅ Inserted 20 incident types" -ForegroundColor Green
        Write-Host "✅ Configured responders for each type" -ForegroundColor Green
        
        # Verify the data
        Write-Host "`n📊 Verifying data..." -ForegroundColor Cyan
        $verifyQuery = "SELECT COUNT(*) as count FROM incident_types;"
        $count = mysql -h $DB_HOST -u $DB_USER "-p$DB_PASSWORD" $DB_NAME -e $verifyQuery -s -N 2>&1
        Write-Host "✅ Total incident types: $count" -ForegroundColor Green
    }
    else {
        throw "MySQL command failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "`n❌ Error applying migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Incident Types System is ready!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart the backend server" -ForegroundColor White
Write-Host "2. Test the API endpoint: GET /api/incident-types" -ForegroundColor White
Write-Host "3. Update the mobile app to use new incident types" -ForegroundColor White
