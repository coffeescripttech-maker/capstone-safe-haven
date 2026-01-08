# Update User Role to Admin
Write-Host "Updating User Role..." -ForegroundColor Cyan

# Get user email
$email = Read-Host "Enter user email (e.g., admin@example.com)"

if (-not $email) {
    Write-Host "❌ Email is required!" -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdating user role to 'admin'..." -ForegroundColor Yellow

# Connect to MySQL and update role
$mysqlCommand = @"
USE safehaven_db;
UPDATE users SET role = 'admin' WHERE email = '$email';
SELECT id, email, role FROM users WHERE email = '$email';
"@

Write-Host "Executing SQL..." -ForegroundColor Gray
mysql -u root -e $mysqlCommand

Write-Host "`n✅ User role updated!" -ForegroundColor Green
Write-Host "Please log out and log in again in the web app to refresh your token." -ForegroundColor Yellow
