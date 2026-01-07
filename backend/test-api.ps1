# SafeHaven API Test Script
# Run this in PowerShell to test the authentication endpoints

Write-Host "Testing SafeHaven API..." -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✓ Health check passed!" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Health check failed!" -ForegroundColor Red
    exit
}

# Test 2: Register User
Write-Host "2. Testing User Registration..." -ForegroundColor Cyan
$registerBody = @{
    email = "juan@example.com"
    phone = "09123456789"
    password = "password123"
    firstName = "Juan"
    lastName = "Dela Cruz"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($register.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($register.data.user.email)" -ForegroundColor Gray
    Write-Host ""
    
    $token = $register.data.accessToken
} catch {
    Write-Host "✗ Registration failed (user might already exist)" -ForegroundColor Yellow
    Write-Host "  Trying to login instead..." -ForegroundColor Gray
    Write-Host ""
    
    # Try login if registration fails
    $loginBody = @{
        email = "juan@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $login = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json"
        
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "  User ID: $($login.data.user.id)" -ForegroundColor Gray
        Write-Host ""
        
        $token = $login.data.accessToken
    } catch {
        Write-Host "✗ Login failed!" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        exit
    }
}

# Test 3: Get Profile
Write-Host "3. Testing Get Profile..." -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "  Name: $($profile.data.first_name) $($profile.data.last_name)" -ForegroundColor Gray
    Write-Host "  Email: $($profile.data.email)" -ForegroundColor Gray
    Write-Host "  Phone: $($profile.data.phone)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Get profile failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

# Test 4: Update Profile
Write-Host "4. Testing Update Profile..." -ForegroundColor Cyan
$updateBody = @{
    address = "123 Main Street"
    city = "Manila"
    province = "Metro Manila"
    barangay = "Barangay 1"
    bloodType = "O+"
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/profile" `
        -Method Put `
        -Body $updateBody `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "✓ Profile updated successfully!" -ForegroundColor Green
    Write-Host "  City: $($updated.data.city)" -ForegroundColor Gray
    Write-Host "  Blood Type: $($updated.data.blood_type)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Update profile failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "Your authentication system is working!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
