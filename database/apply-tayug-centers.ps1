# Apply Tayug Evacuation Centers to Database
# Adds 21 evacuation centers for all barangays in Tayug, Pangasinan

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Add Tayug Evacuation Centers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from backend .env
$envPath = Join-Path $PSScriptRoot ".." "backend" ".env"

if (Test-Path $envPath) {
    Write-Host "Loading database configuration from .env..." -ForegroundColor Yellow
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Configuration loaded" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "Please create backend/.env with database credentials" -ForegroundColor Yellow
    exit 1
}

# Get database credentials
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host ""

# Check if mysql command is available
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Host "✗ MySQL client not found in PATH" -ForegroundColor Red
    Write-Host "Please install MySQL client or add it to PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ MySQL client found" -ForegroundColor Green
Write-Host ""

# SQL file path
$sqlFile = Join-Path $PSScriptRoot "add-tayug-evacuation-centers.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "✗ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL File: $sqlFile" -ForegroundColor Cyan
Write-Host ""

# Confirm before proceeding
Write-Host "This will add 21 evacuation centers for Tayug municipality:" -ForegroundColor Yellow
Write-Host "  • Agno" -ForegroundColor White
Write-Host "  • Amistad" -ForegroundColor White
Write-Host "  • Barangay A (Poblacion)" -ForegroundColor White
Write-Host "  • Barangay B (Poblacion)" -ForegroundColor White
Write-Host "  • Barangay C (Poblacion)" -ForegroundColor White
Write-Host "  • Barangay D (Poblacion)" -ForegroundColor White
Write-Host "  • Barangobong" -ForegroundColor White
Write-Host "  • C. Lichauco" -ForegroundColor White
Write-Host "  • Carriedo" -ForegroundColor White
Write-Host "  • Evangelista" -ForegroundColor White
Write-Host "  • Guzon" -ForegroundColor White
Write-Host "  • Lawak (Dacanay)" -ForegroundColor White
Write-Host "  • Legaspi" -ForegroundColor White
Write-Host "  • Libertad" -ForegroundColor White
Write-Host "  • Magallanes" -ForegroundColor White
Write-Host "  • Panganiban" -ForegroundColor White
Write-Host "  • Saleng" -ForegroundColor White
Write-Host "  • Santo Domingo" -ForegroundColor White
Write-Host "  • Toketec" -ForegroundColor White
Write-Host "  • Trenchera" -ForegroundColor White
Write-Host "  • Zamora" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying SQL file..." -ForegroundColor Cyan

# Execute SQL file
$mysqlArgs = @(
    "-h", $DB_HOST,
    "-P", $DB_PORT,
    "-u", $DB_USER,
    "-p$DB_PASSWORD",
    $DB_NAME
)

try {
    Get-Content $sqlFile | & mysql @mysqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "21 evacuation centers added for Tayug municipality" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Verify centers in web admin: http://localhost:3000/evacuation-centers" -ForegroundColor White
        Write-Host "  2. Update coordinates with actual GPS locations" -ForegroundColor White
        Write-Host "  3. Update contact numbers with real barangay contacts" -ForegroundColor White
        Write-Host "  4. Verify centers appear in mobile app" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: Coordinates are approximate and should be verified!" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Error applying SQL file" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}
