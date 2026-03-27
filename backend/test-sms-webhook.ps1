# Test SMS Webhook Endpoint

Write-Host "🧪 Testing SMS Webhook Endpoint..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/v1"
$webhookSecret = "safehaven_webhook_secret_2026"

# Test data - simulates SMS from gateway
$testPayload = @{
    from = "+639171234567"
    to = "+639923150633"
    message = "SOS|PNP|14.5995,120.9842|1|Juan Dela Cruz|09171234567|juan@email.com"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    messageId = "test-sms-12345"
} | ConvertTo-Json

Write-Host "📱 Test SMS Message:" -ForegroundColor Yellow
Write-Host "SOS|PNP|14.5995,120.9842|1|Juan Dela Cruz|09171234567|juan@email.com" -ForegroundColor White
Write-Host ""

Write-Host "📡 Sending webhook request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/webhooks/sms-sos" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "X-Webhook-Secret" = $webhookSecret
        } `
        -Body $testPayload

    Write-Host "✅ Webhook processed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "✅ SOS Alert ID: $($response.sosId)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next: Check web app notification bell for new SOS alert" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Webhook test failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Ensure backend is running: npm start" -ForegroundColor White
    Write-Host "2. Check user ID 1 exists in database" -ForegroundColor White
    Write-Host "3. Verify webhook secret in .env matches" -ForegroundColor White
}
