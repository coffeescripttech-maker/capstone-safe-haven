# Test Alert Automation APIs

Write-Host "=== Alert Automation API Test ===" -ForegroundColor Cyan
Write-Host ""

# Get admin token
$token = $env:ADMIN_TOKEN
if (-not $token) {
    Write-Host "ERROR: ADMIN_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Run: `$env:ADMIN_TOKEN = 'your_admin_token_here'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:3000/api/v1/admin/alert-automation"

# Test 1: Get Alert Rules
Write-Host "1. Getting Alert Rules..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/rules" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Total rules: $($response.data.Count)" -ForegroundColor Cyan
    foreach ($rule in $response.data) {
        $status = if ($rule.is_active) { "✓ Active" } else { "✗ Inactive" }
        Write-Host "  - $($rule.name) [$($rule.type)] $status" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Manually Trigger Monitoring
Write-Host "2. Triggering Manual Monitoring Cycle..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/trigger" -Headers $headers -Method Post
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Weather alerts created: $($response.data.weatherAlerts)" -ForegroundColor Cyan
    Write-Host "Earthquake alerts created: $($response.data.earthquakeAlerts)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Pending Alerts
Write-Host "3. Getting Pending Auto-Generated Alerts..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/pending" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Pending alerts: $($response.data.Count)" -ForegroundColor Cyan
    if ($response.data.Count -gt 0) {
        foreach ($alert in $response.data) {
            Write-Host "  - [$($alert.source)] $($alert.title)" -ForegroundColor White
            Write-Host "    Severity: $($alert.severity) | Targeted: $($alert.users_targeted) users" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No pending alerts" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Automation Logs
Write-Host "4. Getting Automation Logs..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/logs?limit=10" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Recent logs: $($response.data.Count)" -ForegroundColor Cyan
    if ($response.data.Count -gt 0) {
        foreach ($log in $response.data) {
            $statusColor = switch ($log.status) {
                "created" { "Green" }
                "skipped" { "Yellow" }
                "error" { "Red" }
                "approved" { "Cyan" }
                "rejected" { "Magenta" }
                default { "White" }
            }
            Write-Host "  - [$($log.trigger_type)] $($log.rule_matched) - $($log.status)" -ForegroundColor $statusColor
            if ($log.reason) {
                Write-Host "    Reason: $($log.reason)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  No logs yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get Weather Rules Only
Write-Host "5. Getting Weather Rules..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/rules?type=weather" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Weather rules: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Get Earthquake Rules Only
Write-Host "6. Getting Earthquake Rules..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/rules?type=earthquake" -Headers $headers -Method Get
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Earthquake rules: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check pending alerts in admin dashboard" -ForegroundColor White
Write-Host "2. Approve/reject alerts as needed" -ForegroundColor White
Write-Host "3. Monitor automation logs" -ForegroundColor White
Write-Host "4. Configure rules as needed" -ForegroundColor White
