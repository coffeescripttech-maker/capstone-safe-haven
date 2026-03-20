# Check SMS Blast Permissions for All Roles
Write-Host "Checking SMS Blast Permissions..." -ForegroundColor Cyan

# Database credentials from .env
$env:MYSQL_HOST = "localhost"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "admin"
$env:MYSQL_DATABASE = "safehaven_db"

Write-Host "`n1. Checking all user roles in database..." -ForegroundColor Yellow

$query = @"
SELECT 
    id,
    email,
    role,
    jurisdiction,
    is_active
FROM users
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'mdrrmo' THEN 3
        WHEN 'pnp' THEN 4
        WHEN 'bfp' THEN 5
        WHEN 'lgu_officer' THEN 6
        WHEN 'citizen' THEN 7
        ELSE 8
    END,
    email;
"@

mysql -h localhost -u root -padmin safehaven_db -e $query

Write-Host "`n2. SMS Blast Access Rules:" -ForegroundColor Yellow
Write-Host "   ✅ super_admin - FULL ACCESS" -ForegroundColor Green
Write-Host "   ✅ admin - FULL ACCESS (jurisdiction restricted)" -ForegroundColor Green
Write-Host "   ✅ mdrrmo - FULL ACCESS (jurisdiction restricted)" -ForegroundColor Green
Write-Host "   ✅ pnp - FULL ACCESS (jurisdiction restricted)" -ForegroundColor Green
Write-Host "   ✅ bfp - FULL ACCESS (jurisdiction restricted)" -ForegroundColor Green
Write-Host "   ✅ lgu_officer - FULL ACCESS (jurisdiction restricted)" -ForegroundColor Green
Write-Host "   ❌ citizen - NO ACCESS" -ForegroundColor Red

Write-Host "`n3. Checking for any citizen users..." -ForegroundColor Yellow

$citizenQuery = @"
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) as name,
    role
FROM users
WHERE role = 'citizen'
LIMIT 10;
"@

mysql -h localhost -u root -padmin safehaven_db -e $citizenQuery

Write-Host "`n4. If you're getting permission errors, check:" -ForegroundColor Yellow
Write-Host "   - Your JWT token is valid" -ForegroundColor White
Write-Host "   - Your user role is NOT 'citizen'" -ForegroundColor White
Write-Host "   - Your token hasn't been blacklisted (logged out)" -ForegroundColor White

Write-Host "`nDone!" -ForegroundColor Green
