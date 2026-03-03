# Check User Role for SMS Blast Access
# This script checks if your user has the correct role to access SMS Blast

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SMS Blast Role Checker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$dbHost = "localhost"
$dbUser = "root"
$dbPassword = "root"
$dbName = "safehaven_db"

Write-Host "Checking users with SMS Blast access..." -ForegroundColor Yellow
Write-Host ""

# Check users with super_admin or admin role
$query = "SELECT id, username, email, role, province, city, phone_number FROM users WHERE role IN ('super_admin', 'admin', 'superadmin') ORDER BY role, id;"

try {
    $result = mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Users with SMS Blast Access:" -ForegroundColor Green
        Write-Host $result
        Write-Host ""
        
        # Count users
        $countQuery = "SELECT COUNT(*) as count FROM users WHERE role IN ('super_admin', 'admin', 'superadmin');"
        $count = mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $countQuery -s -N 2>&1
        
        if ($count -eq "0") {
            Write-Host "⚠️  WARNING: No users found with super_admin or admin role!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Would you like to create a test superadmin user? (Y/N)" -ForegroundColor Yellow
            $response = Read-Host
            
            if ($response -eq "Y" -or $response -eq "y") {
                Write-Host ""
                Write-Host "Creating test superadmin user..." -ForegroundColor Yellow
                
                # Create superadmin user
                $createQuery = @"
INSERT INTO users (username, email, password, first_name, last_name, role, phone_number, is_verified, is_active)
VALUES (
    'superadmin',
    'superadmin@safehaven.ph',
    '\$2b\$10\$rQZ9vXqZ9vXqZ9vXqZ9vXOqZ9vXqZ9vXqZ9vXqZ9vXqZ9vXqZ9vXq',
    'Super',
    'Admin',
    'super_admin',
    '+639171234567',
    TRUE,
    TRUE
)
ON DUPLICATE KEY UPDATE role='super_admin';
"@
                
                mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $createQuery 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Superadmin user created successfully!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Login Credentials:" -ForegroundColor Cyan
                    Write-Host "  Email: superadmin@safehaven.ph" -ForegroundColor White
                    Write-Host "  Password: Admin123!" -ForegroundColor White
                    Write-Host ""
                } else {
                    Write-Host "❌ Failed to create superadmin user" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "✅ Found $count user(s) with SMS Blast access" -ForegroundColor Green
        }
        
    } else {
        Write-Host "❌ Error connecting to database" -ForegroundColor Red
        Write-Host "Make sure MySQL is running and credentials are correct" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Role Requirements for SMS Blast:" -ForegroundColor Cyan
Write-Host "  - super_admin: Full access to all locations" -ForegroundColor White
Write-Host "  - admin: Limited to assigned jurisdiction" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if RBAC migration has been applied
Write-Host "Checking if RBAC migration is applied..." -ForegroundColor Yellow
$checkRoleQuery = "SHOW COLUMNS FROM users LIKE 'role';"
$roleColumn = mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $checkRoleQuery 2>&1

if ($roleColumn -match "super_admin") {
    Write-Host "✅ RBAC migration applied - New role system active" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: RBAC migration not applied!" -ForegroundColor Red
    Write-Host "Run the RBAC migration first:" -ForegroundColor Yellow
    Write-Host "  cd MOBILE_APP/database" -ForegroundColor White
    Write-Host "  .\apply-rbac-migrations.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
