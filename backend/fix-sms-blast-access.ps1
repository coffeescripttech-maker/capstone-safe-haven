# Fix SMS Blast Access - Update User Role
# This script updates your user account to have SMS Blast access

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Fix SMS Blast Access" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$dbHost = "localhost"
$dbUser = "root"
$dbPassword = "root"
$dbName = "safehaven_db"

Write-Host "This script will update a user to have SMS Blast access" -ForegroundColor Yellow
Write-Host ""

# Show current users
Write-Host "Current users in database:" -ForegroundColor Cyan
$listQuery = "SELECT id, username, email, role FROM users LIMIT 10;"
mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $listQuery 2>&1

Write-Host ""
Write-Host "Enter the email of the user you want to grant SMS Blast access:" -ForegroundColor Yellow
$userEmail = Read-Host

Write-Host ""
Write-Host "Select role:" -ForegroundColor Yellow
Write-Host "  1. super_admin (Full access to all locations)" -ForegroundColor White
Write-Host "  2. admin (Limited to specific jurisdiction)" -ForegroundColor White
$roleChoice = Read-Host "Enter choice (1 or 2)"

$newRole = if ($roleChoice -eq "1") { "super_admin" } else { "admin" }

Write-Host ""
Write-Host "Updating user $userEmail to role: $newRole..." -ForegroundColor Yellow

# Update user role
$updateQuery = "UPDATE users SET role = '$newRole' WHERE email = '$userEmail';"
mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $updateQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ User role updated successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Show updated user
    $checkQuery = "SELECT id, username, email, role, province, city FROM users WHERE email = '$userEmail';"
    Write-Host "Updated user details:" -ForegroundColor Cyan
    mysql -h $dbHost -u $dbUser -p$dbPassword -D $dbName -e $checkQuery 2>&1
    
    Write-Host ""
    Write-Host "✅ You can now access SMS Blast in the web app!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Logout from the web app" -ForegroundColor White
    Write-Host "  2. Login again with: $userEmail" -ForegroundColor White
    Write-Host "  3. Look for 'SMS Blast' in the sidebar menu" -ForegroundColor White
    
} else {
    Write-Host "❌ Failed to update user role" -ForegroundColor Red
    Write-Host "Please check if the email exists in the database" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
