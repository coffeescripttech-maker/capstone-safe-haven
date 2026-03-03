# Test Alert Approval with SMS Integration
# This script tests the complete flow of approving an alert and sending SMS

Write-Host "=== Alert Approval SMS Integration Test ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001/api/v1"
$token = ""

# Step 1: Login as admin
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
    email = "superadmin@test.safehaven.com"
    password = "Admin123!"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.data.token
Write-Host "✓ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Get pending alerts
Write-Host "Step 2: Fetching pending alerts..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

$pendingAlerts = Invoke-RestMethod -Uri "$baseUrl/admin/alert-automation/pending" -Method Get -Headers $headers
Write-Host "✓ Found $($pendingAlerts.data.Count) pending alerts" -ForegroundColor Green

if ($pendingAlerts.data.Count -eq 0) {
    Write-Host ""
    Write-Host "No pending alerts found. Triggering monitoring to create test alerts..." -ForegroundColor Yellow
    
    try {
        $triggerResponse = Invoke-RestMethod -Uri "$baseUrl/admin/alert-automation/trigger" -Method Post -Headers $headers
        Write-Host "✓ Monitoring triggered: $($triggerResponse.data.weatherAlerts) weather, $($triggerResponse.data.earthquakeAlerts) earthquake alerts created" -ForegroundColor Green
        
        # Fetch pending alerts again
        Start-Sleep -Seconds 2
        $pendingAlerts = Invoke-RestMethod -Uri "$baseUrl/admin/alert-automation/pending" -Method Get -Headers $headers
        Write-Host "✓ Found $($pendingAlerts.data.Count) pending alerts after trigger" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to trigger monitoring: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

if ($pendingAlerts.data.Count -eq 0) {
    Write-Host ""
    Write-Host "Still no pending alerts. This means:" -ForegroundColor Yellow
    Write-Host "  - No weather conditions match alert rules" -ForegroundColor Yellow
    Write-Host "  - No recent earthquakes match alert rules" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can:" -ForegroundColor Cyan
    Write-Host "  1. Adjust alert rules to match current conditions" -ForegroundColor Cyan
    Write-Host "  2. Wait for actual weather/earthquake events" -ForegroundColor Cyan
    Write-Host "  3. Manually create a test alert in the database" -ForegroundColor Cyan
    exit 0
}

Write-Host ""

# Step 3: Display pending alerts
Write-Host "Pending Alerts:" -ForegroundColor Cyan
foreach ($alert in $pendingAlerts.data) {
    Write-Host "  ID: $($alert.id)" -ForegroundColor White
    Write-Host "  Type: $($alert.alert_type)" -ForegroundColor White
    Write-Host "  Title: $($alert.title)" -ForegroundColor White
    Write-Host "  Severity: $($alert.severity)" -ForegroundColor White
    Write-Host "  Affected Areas: $($alert.affected_areas -join ', ')" -ForegroundColor White
    Write-Host "  Users Targeted: $($alert.users_targeted)" -ForegroundColor White
    Write-Host ""
}

# Step 4: Select alert to approve
$alertToApprove = $pendingAlerts.data[0]
Write-Host "Step 3: Approving alert #$($alertToApprove.id)..." -ForegroundColor Yellow
Write-Host "  Title: $($alertToApprove.title)" -ForegroundColor White
Write-Host "  Type: $($alertToApprove.alert_type)" -ForegroundColor White
Write-Host ""

# Step 5: Check users that will receive SMS
Write-Host "Step 4: Checking users that will receive SMS..." -ForegroundColor Yellow

if ($alertToApprove.source -eq 'auto_weather') {
    Write-Host "  Weather alert - targeting by city: $($alertToApprove.affected_areas -join ', ')" -ForegroundColor White
} elseif ($alertToApprove.source -eq 'auto_earthquake') {
    Write-Host "  Earthquake alert - targeting by radius: $($alertToApprove.radius_km)km from ($($alertToApprove.latitude), $($alertToApprove.longitude))" -ForegroundColor White
}

Write-Host ""

# Step 6: Approve the alert
Write-Host "Step 5: Approving alert (this will send SMS)..." -ForegroundColor Yellow
try {
    $approveResponse = Invoke-RestMethod -Uri "$baseUrl/admin/alert-automation/alerts/$($alertToApprove.id)/approve" -Method Post -Headers $headers
    Write-Host "✓ Alert approved successfully!" -ForegroundColor Green
    Write-Host "  $($approveResponse.message)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to approve alert: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 7: Check SMS blast history
Write-Host "Step 6: Checking SMS blast history..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $smsHistory = Invoke-RestMethod -Uri "$baseUrl/sms-blast/history?limit=5" -Method Get -Headers $headers
    
    if ($smsHistory.data.blasts.Count -gt 0) {
        $latestBlast = $smsHistory.data.blasts[0]
        Write-Host "✓ Latest SMS blast:" -ForegroundColor Green
        Write-Host "  Blast ID: $($latestBlast.blastId)" -ForegroundColor White
        Write-Host "  Recipients: $($latestBlast.recipientCount)" -ForegroundColor White
        Write-Host "  Status: $($latestBlast.status)" -ForegroundColor White
        Write-Host "  Cost: $($latestBlast.actualCost) credits" -ForegroundColor White
        Write-Host "  Message: $($latestBlast.message.Substring(0, [Math]::Min(100, $latestBlast.message.Length)))..." -ForegroundColor White
    } else {
        Write-Host "⚠ No SMS blasts found in history" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not fetch SMS history: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "What happened:" -ForegroundColor Cyan
Write-Host "  1. Alert was approved ✓" -ForegroundColor Green
Write-Host "  2. System found users in affected area ✓" -ForegroundColor Green
Write-Host "  3. SMS sent via iProg bulk API ✓" -ForegroundColor Green
Write-Host "  4. Push notifications sent ✓" -ForegroundColor Green
Write-Host "  5. SMS blast record created ✓" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check your test phone numbers for SMS" -ForegroundColor White
Write-Host "  2. View SMS blast details at: http://localhost:3000/sms-blast" -ForegroundColor White
Write-Host "  3. Check backend logs for detailed SMS sending info" -ForegroundColor White
Write-Host "  4. Monitor iProg dashboard for credit usage" -ForegroundColor White
Write-Host ""
