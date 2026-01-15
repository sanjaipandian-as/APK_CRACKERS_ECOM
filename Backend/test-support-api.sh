#!/bin/bash

# Test Support API Endpoints
echo "==================================="
echo "Testing Support API Endpoints"
echo "==================================="
echo ""

# Test 1: Create Support Ticket
echo "Test 1: Creating a support ticket..."
curl -X POST http://localhost:5000/api/support/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 98765 43210",
    "subject": "Test Support Request",
    "category": "general",
    "message": "This is a test support message to verify the API is working correctly."
  }'

echo -e "\n\n"

# Test 2: Create another ticket with different category
echo "Test 2: Creating a product inquiry ticket..."
curl -X POST http://localhost:5000/api/support/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product Information Request",
    "category": "product",
    "message": "I would like to know more about your firecracker products and pricing."
  }'

echo -e "\n\n"

# Test 3: Test validation - missing required field
echo "Test 3: Testing validation (missing subject)..."
curl -X POST http://localhost:5000/api/support/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid User",
    "email": "invalid@example.com",
    "category": "general",
    "message": "This should fail because subject is missing."
  }'

echo -e "\n\n"
echo "==================================="
echo "Tests completed!"
echo "==================================="
