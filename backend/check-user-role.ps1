# Check user role in database
$query = "SELECT id, email, role FROM users WHERE email = 'mdexter958@gmail.com';"

Write-Host "Checking user role..." -ForegroundColor Cyan

# Using mysql command (no password)
& "C:\xampp\mysql\bin\mysql.exe" -u root safehaven_db -e $query

Write-Host "`nDone!" -ForegroundColor Green
