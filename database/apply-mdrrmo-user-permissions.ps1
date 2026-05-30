# Apply MDRRMO User Management Permissions
# This script adds user management permissions for MDRRMO role

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MDRRMO User Management Permissions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
    Write-Host "✓ Loaded environment variables" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# Database connection details
$DB_HOST = $env:DB_HOST
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_NAME = $env:DB_NAME

Write-Host ""
Write-Host "Database: $DB_NAME" -ForegroundColor Yellow
Write-Host ""

# SQL to add MDRRMO user management permissions
$sql = @"
-- Add MDRRMO user management permissions
-- MDRRMO can create and update users, but NOT delete

-- Check if permissions already exist
SELECT COUNT(*) as count FROM role_permissions 
WHERE role = 'mdrrmo' AND resource = 'users';

-- Add permissions if they don't exist
INSERT IGNORE INTO role_permissions (role, resource, action) VALUES
('mdrrmo', 'users', 'create'),
('mdrrmo', 'users', 'read'),
('mdrrmo', 'users', 'update');

-- Verify the permissions were added
SELECT role, resource, action 
FROM role_permissions 
WHERE role = 'mdrrmo' AND resource = 'users'
ORDER BY action;
"@

# Save SQL to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$sql | Out-File -FilePath $tempFile -Encoding UTF8

try {
    Write-Host "Adding MDRRMO user management permissions..." -ForegroundColor Yellow
    
    # Execute SQL
    $result = & mysql -h $DB_HOST -u $DB_USER -p"$DB_PASSWORD" $DB_NAME -e "source $tempFile" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MDRRMO user management permissions added successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "MDRRMO can now:" -ForegroundColor Cyan
        Write-Host "  ✓ Create new users" -ForegroundColor Green
        Write-Host "  ✓ Read user information" -ForegroundColor Green
        Write-Host "  ✓ Update user details (email, name, etc.)" -ForegroundColor Green
        Write-Host "  ✗ Delete users (only super_admin can delete)" -ForegroundColor Yellow
        Write-Host ""
        
        # Show current MDRRMO permissions
        Write-Host "Current MDRRMO permissions:" -ForegroundColor Cyan
        & mysql -h $DB_HOST -u $DB_USER -p"$DB_PASSWORD" $DB_NAME -e "SELECT resource, GROUP_CONCAT(action ORDER BY action) as actions FROM role_permissions WHERE role = 'mdrrmo' GROUP BY resource ORDER BY resource;" -t
    } else {
        Write-Host "✗ Error adding permissions: $result" -ForegroundColor Red
        exit 1
    }
} finally {
    # Clean up temp file
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart the backend server" -ForegroundColor White
Write-Host "2. Test with mdrrmo@test.safehaven.com" -ForegroundColor White
Write-Host "3. MDRRMO should see 'Add User' and 'Edit' buttons" -ForegroundColor White
Write-Host "4. MDRRMO should NOT see 'Delete' button" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
