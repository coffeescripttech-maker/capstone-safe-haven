# Test Group Join Functionality

$baseUrl = "http://192.168.43.25:3001/api/v1"

Write-Host "=== Testing Group Join Functionality ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as a user to create a group
Write-Host "Step 1: Login as user to create group..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    email = "citizen@test.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token1 = $loginResponse.data.token
Write-Host "✓ Logged in as citizen@test.com" -ForegroundColor Green
Write-Host "Token: $($token1.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# Step 2: Create a group
Write-Host "Step 2: Creating a family group..." -ForegroundColor Yellow
$createResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST `
    -Headers @{ Authorization = "Bearer $token1" } `
    -Body (@{
        name = "Test Family Group"
        description = "Testing group join"
    } | ConvertTo-Json) -ContentType "application/json"

$inviteCode = $createResponse.data.inviteCode
Write-Host "✓ Group created successfully!" -ForegroundColor Green
Write-Host "Group ID: $($createResponse.data.id)" -ForegroundColor Gray
Write-Host "Invite Code: $inviteCode" -ForegroundColor Cyan
Write-Host ""

# Step 3: Login as another user to join
Write-Host "Step 3: Login as another user to join group..." -ForegroundColor Yellow
$loginResponse2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    email = "sheilla@test.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token2 = $loginResponse2.data.token
Write-Host "✓ Logged in as sheilla@test.com" -ForegroundColor Green
Write-Host ""

# Step 4: Join group with invite code
Write-Host "Step 4: Joining group with invite code: $inviteCode" -ForegroundColor Yellow
try {
    $joinResponse = Invoke-RestMethod -Uri "$baseUrl/groups/join" -Method POST `
        -Headers @{ Authorization = "Bearer $token2" } `
        -Body (@{
            inviteCode = $inviteCode
        } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "✓ Successfully joined group!" -ForegroundColor Green
    Write-Host "Group Name: $($joinResponse.data.name)" -ForegroundColor Gray
    Write-Host "Member Count: $($joinResponse.data.memberCount)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to join group" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Details: $($errorDetails.message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 5: Verify group members
Write-Host "Step 5: Checking group members..." -ForegroundColor Yellow
try {
    $membersResponse = Invoke-RestMethod -Uri "$baseUrl/groups/$($createResponse.data.id)/members" -Method GET `
        -Headers @{ Authorization = "Bearer $token1" }
    
    Write-Host "✓ Group has $($membersResponse.data.Count) members:" -ForegroundColor Green
    foreach ($member in $membersResponse.data) {
        Write-Host "  - $($member.userName) ($($member.role))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to fetch members" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
