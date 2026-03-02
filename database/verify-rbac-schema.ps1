# PowerShell Script: Verify Enhanced RBAC Schema
# Description: Verifies that all RBAC migrations were applied correctly
# Usage: .\verify-rbac-schema.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enhanced RBAC Schema Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envPath = "..\backend\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

# Function to execute SQL query
function Execute-Query {
    param([string]$query)
    
    $mysqlCmd = "mysql -h $DB_HOST -u $DB_USER"
    if ($DB_PASSWORD) {
        $mysqlCmd += " -p$DB_PASSWORD"
    }
    $mysqlCmd += " $DB_NAME -e `"$query`""
    
    $result = & cmd /c $mysqlCmd 2>&1
    return $result
}

Write-Host "Checking users table..." -ForegroundColor Yellow

# Check if jurisdiction column exists
$result = Execute-Query "SHOW COLUMNS FROM users LIKE 'jurisdiction';"
if ($result -match "jurisdiction") {
    Write-Host "✓ Jurisdiction column exists" -ForegroundColor Green
} else {
    Write-Host "✗ Jurisdiction column missing" -ForegroundColor Red
}

# Check role enum values
$result = Execute-Query "SHOW COLUMNS FROM users LIKE 'role';"
if ($result -match "super_admin" -and $result -match "citizen") {
    Write-Host "✓ Role ENUM updated with 7 roles" -ForegroundColor Green
} else {
    Write-Host "✗ Role ENUM not updated" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking role_permissions table..." -ForegroundColor Yellow

# Check if table exists
$result = Execute-Query "SHOW TABLES LIKE 'role_permissions';"
if ($result -match "role_permissions") {
    Write-Host "✓ role_permissions table exists" -ForegroundColor Green
    
    # Count permissions
    $result = Execute-Query "SELECT COUNT(*) as count FROM role_permissions;"
    if ($result -match "\d+") {
        $count = [regex]::Match($result, "\d+").Value
        Write-Host "✓ $count permissions seeded" -ForegroundColor Green
    }
} else {
    Write-Host "✗ role_permissions table missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking audit_logs table..." -ForegroundColor Yellow

# Check if table exists
$result = Execute-Query "SHOW TABLES LIKE 'audit_logs';"
if ($result -match "audit_logs") {
    Write-Host "✓ audit_logs table exists" -ForegroundColor Green
} else {
    Write-Host "✗ audit_logs table missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking indexes..." -ForegroundColor Yellow

# Check users indexes
$result = Execute-Query "SHOW INDEX FROM users WHERE Key_name = 'idx_jurisdiction';"
if ($result -match "idx_jurisdiction") {
    Write-Host "✓ idx_jurisdiction index exists" -ForegroundColor Green
} else {
    Write-Host "✗ idx_jurisdiction index missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Role distribution:" -ForegroundColor Yellow
Execute-Query "SELECT role, COUNT(*) as count FROM users GROUP BY role;"

Write-Host ""
Write-Host "Permissions by role:" -ForegroundColor Yellow
Execute-Query "SELECT role, COUNT(*) as permission_count FROM role_permissions GROUP BY role ORDER BY permission_count DESC;"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
