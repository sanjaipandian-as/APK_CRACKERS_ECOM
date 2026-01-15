# Test Support API Endpoints
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Testing Support API Endpoints" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Support Ticket
Write-Host "Test 1: Creating a support ticket..." -ForegroundColor Yellow
$body1 = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+91 98765 43210"
    subject = "Test Support Request"
    category = "general"
    message = "This is a test support message to verify the API is working correctly."
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:5000/api/support/create" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body1
    Write-Host "Success!" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Create another ticket with different category
Write-Host "Test 2: Creating a product inquiry ticket..." -ForegroundColor Yellow
$body2 = @{
    name = "John Doe"
    email = "john@example.com"
    subject = "Product Information Request"
    category = "product"
    message = "I would like to know more about your firecracker products and pricing."
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/support/create" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body2
    Write-Host "Success!" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n"

# Test 3: Test validation - missing required field
Write-Host "Test 3: Testing validation (missing subject)..." -ForegroundColor Yellow
$body3 = @{
    name = "Invalid User"
    email = "invalid@example.com"
    category = "general"
    message = "This should fail because subject is missing."
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:5000/api/support/create" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body3
    Write-Host "Unexpected success!" -ForegroundColor Red
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected validation error received:" -ForegroundColor Green
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "`n"
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
