# Check Location Data in Database
# This script checks if there's location data in the user_profiles table

Write-Host "=== Checking Location Data in Database ===" -ForegroundColor Cyan
Write-Host ""

# Database connection details from .env
$dbHost = "localhost"
$dbUser = "root"
$dbPassword = "root"
$dbName = "safehaven_db"

Write-Host "Connecting to database: $dbName" -ForegroundColor Yellow
Write-Host ""

# Check provinces
Write-Host "1. Checking Provinces..." -ForegroundColor Yellow
$provinceQuery = "SELECT DISTINCT province FROM user_profiles WHERE province IS NOT NULL AND province != '' ORDER BY province;"
try {
    $provinces = mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $provinceQuery -s -N
    if ($provinces) {
        $provinceCount = ($provinces | Measure-Object).Count
        Write-Host "✓ Found $provinceCount provinces:" -ForegroundColor Green
        $provinces | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    } else {
        Write-Host "✗ No provinces found in database" -ForegroundColor Red
        Write-Host "   You need to add location data to user_profiles table" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error querying provinces: $_" -ForegroundColor Red
}
Write-Host ""

# Check cities
Write-Host "2. Checking Cities..." -ForegroundColor Yellow
$cityQuery = "SELECT DISTINCT city FROM user_profiles WHERE city IS NOT NULL AND city != '' ORDER BY city LIMIT 10;"
try {
    $cities = mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $cityQuery -s -N
    if ($cities) {
        $cityCount = ($cities | Measure-Object).Count
        Write-Host "✓ Found cities (showing first 10):" -ForegroundColor Green
        $cities | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    } else {
        Write-Host "✗ No cities found in database" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error querying cities: $_" -ForegroundColor Red
}
Write-Host ""

# Check barangays
Write-Host "3. Checking Barangays..." -ForegroundColor Yellow
$barangayQuery = "SELECT DISTINCT barangay FROM user_profiles WHERE barangay IS NOT NULL AND barangay != '' ORDER BY barangay LIMIT 10;"
try {
    $barangays = mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $barangayQuery -s -N
    if ($barangays) {
        $barangayCount = ($barangays | Measure-Object).Count
        Write-Host "✓ Found barangays (showing first 10):" -ForegroundColor Green
        $barangays | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    } else {
        Write-Host "✗ No barangays found in database" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error querying barangays: $_" -ForegroundColor Red
}
Write-Host ""

# Check total users with location data
Write-Host "4. Checking Users with Location Data..." -ForegroundColor Yellow
$userQuery = "SELECT COUNT(*) FROM user_profiles WHERE province IS NOT NULL AND province != '';"
try {
    $userCount = mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e $userQuery -s -N
    Write-Host "✓ $userCount users have province data" -ForegroundColor Green
} catch {
    Write-Host "✗ Error querying user count: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Location Data Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: If no location data found, you can:" -ForegroundColor Yellow
Write-Host "1. Run the test user creation script: .\create-test-users.ps1" -ForegroundColor Gray
Write-Host "2. Manually add location data to existing users in user_profiles table" -ForegroundColor Gray
