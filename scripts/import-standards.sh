#!/bin/bash
# Import time standards from JSON files

set -e

API_URL="${API_URL:-http://localhost:8080}"
STANDARDS_DIR="${1:-data}"

echo "📥 Importing time standards from: $STANDARDS_DIR"
echo "   Target API: $API_URL/api/v1/standards/import/json"
echo ""

# Find all time standards JSON files
STANDARDS_FILES=$(find "$STANDARDS_DIR" -name "*standard*.json" -o -name "swim-ontario*.json" -o -name "swimming-canada*.json" | sort)

if [ -z "$STANDARDS_FILES" ]; then
    echo "❌ No time standards files found in $STANDARDS_DIR"
    exit 1
fi

TOTAL=0
SUCCESS=0
FAILED=0

for FILE in $STANDARDS_FILES; do
    echo "📋 Importing: $(basename $FILE)"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/standards/import/json" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer dev-token" \
        -d @"$FILE" 2>/dev/null || echo "000")

    HTTP_STATUS=$(echo "$RESPONSE" | tail -1)
    HTTP_BODY=$(echo "$RESPONSE" | sed '$d')

    TOTAL=$((TOTAL + 1))

    if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "200" ]; then
        SUCCESS=$((SUCCESS + 1))
        IMPORTED=$(echo "$HTTP_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('imported_count', 0))" 2>/dev/null || echo "?")
        echo "   ✅ Success - imported $IMPORTED standards"
    else
        FAILED=$((FAILED + 1))
        ERROR=$(echo "$HTTP_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('error', 'Unknown error'))" 2>/dev/null || echo "HTTP $HTTP_STATUS")
        echo "   ❌ Failed - $ERROR"
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   Total files: $TOTAL"
echo "   Successful: $SUCCESS"
if [ "$FAILED" -gt 0 ]; then
    echo "   Failed: $FAILED"
    exit 1
else
    echo "✅ All standards imported successfully!"
fi
