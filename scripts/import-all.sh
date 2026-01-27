#!/bin/bash
# Import all time standards and Alice's 2025-2026 season data

set -e

API_URL="${API_URL:-http://localhost:8080}"

echo "════════════════════════════════════════════════════════"
echo "🏊 SwimStats Data Import"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ Backend not responding at $API_URL"
    echo "   Please start the backend server first"
    echo ""
    echo "   To start the backend:"
    echo "   cd backend && go run cmd/server/main.go"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Step 1: Import time standards
echo "════════════════════════════════════════════════════════"
echo "Step 1: Importing Time Standards"
echo "════════════════════════════════════════════════════════"
echo ""
./scripts/import-standards.sh data

echo ""
echo "════════════════════════════════════════════════════════"
echo "Step 2: Importing Alice's 2025-2026 Season Data"
echo "════════════════════════════════════════════════════════"
echo ""
./scripts/test-import.sh data/alice-boldyrev-2025-2026.json

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ All imports completed successfully!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🚀 You can now access the application:"
echo "   Backend API: $API_URL"
echo "   Frontend: http://localhost:5173 (if running)"
