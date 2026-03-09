# Apply analytics permission for agency roles migration
Write-Host "========================================"
Write-Host "Add Analytics Permission for Agency Roles"
Write-Host "========================================"
Write-Host ""

# Load environment variables from backend .env
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (Test-Path $envPath) {
    Write-Host "Loading database credentials from .env..."
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    Write-Host "Error: .env file not found at $envPath"
    exit 1
}

$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

Write-Host "Database: $DB_NAME"
Write-Host "Host: $DB_HOST"
Write-Host ""

# Apply migration
$migrationFile = Join-Path $PSScriptRoot "migrations\012_add_analytics_permission_agency_roles.sql"

Write-Host "Applying migration: 012_add_analytics_permission_agency_roles.sql"

Get-Content $migrationFile | & mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!"
} else {
    Write-Host "Migration failed!"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Verifying Permissions"
Write-Host "========================================"
Write-Host ""

# Verify permissions
Write-Host "Analytics permissions:"
$query = "SELECT role, resource, action FROM role_permissions WHERE resource = 'analytics' ORDER BY role;"
echo $query | & mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -t

Write-Host ""
Write-Host "========================================"
Write-Host "Migration Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Recompile backend: cd backend; npm run build"
Write-Host "2. Restart backend server"
Write-Host "3. Test BFP/PNP login and dashboard access"
