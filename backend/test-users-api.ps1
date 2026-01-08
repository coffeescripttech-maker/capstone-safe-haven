# Test Users API
Write-Host "Testing Users API..." -ForegroundColor Cyan

# Test 1: Get all users
Write-Host "`n1. Getting all users..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users" -Method GET -UseBasicParsing
    $data = ($response.Content | ConvertFrom-Json)
    Write-Host "✅ Success! Found $($data.data.total) users" -ForegroundColor Green
    Write-Host "Users:" -ForegroundColor White
    $data.data.users | ForEach-Object {
        Write-Host "  - $($_.first_name) $($_.last_name) ($($_.email)) - Role: $($_.role)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Get user statistics
Write-Host "`n2. Getting user statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users/statistics" -Method GET -UseBasicParsing
    $stats = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Statistics:" -ForegroundColor White
    Write-Host "  Total Users: $($stats.total_users)" -ForegroundColor White
    Write-Host "  Active Users: $($stats.active_users)" -ForegroundColor White
    Write-Host "  Verified Users: $($stats.verified_users)" -ForegroundColor White
    Write-Host "  Admin Users: $($stats.admin_users)" -ForegroundColor White
    Write-Host "  LGU Users: $($stats.lgu_users)" -ForegroundColor White
    Write-Host "  New Today: $($stats.new_today)" -ForegroundColor White
    Write-Host "  New This Week: $($stats.new_this_week)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Get single user (ID 1)
Write-Host "`n3. Getting user details (ID 1)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users/1" -Method GET -UseBasicParsing
    $user = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "User Details:" -ForegroundColor White
    Write-Host "  Name: $($user.first_name) $($user.last_name)" -ForegroundColor White
    Write-Host "  Email: $($user.email)" -ForegroundColor White
    Write-Host "  Phone: $($user.phone)" -ForegroundColor White
    Write-Host "  Role: $($user.role)" -ForegroundColor White
    Write-Host "  Active: $($user.is_active)" -ForegroundColor White
    Write-Host "  Verified: $($user.is_verified)" -ForegroundColor White
    if ($user.profile.city) {
        Write-Host "  Location: $($user.profile.city), $($user.profile.province)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Filter by role
Write-Host "`n4. Filtering users by role (admin)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users?role=admin" -Method GET -UseBasicParsing
    $data = ($response.Content | ConvertFrom-Json)
    Write-Host "✅ Success! Found $($data.data.total) admin users" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Search users
Write-Host "`n5. Searching users..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users?search=admin" -Method GET -UseBasicParsing
    $data = ($response.Content | ConvertFrom-Json)
    Write-Host "✅ Success! Found $($data.data.total) matching users" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
