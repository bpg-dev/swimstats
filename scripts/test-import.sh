#!/bin/bash
# Test the swimmer data import functionality

set -e

API_URL="${API_URL:-http://localhost:8080}"
IMPORT_FILE="${1:-data/sample-swimmer-import.json}"

if [ ! -f "$IMPORT_FILE" ]; then
    echo "❌ Import file not found: $IMPORT_FILE"
    echo "Usage: $0 [import-file.json]"
    exit 1
fi

echo "📥 Importing swimmer data from: $IMPORT_FILE"
echo "   Target API: $API_URL/api/v1/data/import"
echo ""

# Wrap the data in the new format with confirmation
IMPORT_DATA=$(cat "$IMPORT_FILE")
REQUEST_BODY=$(jq -n --argjson data "$IMPORT_DATA" '{data: $data, confirmed: true}')

# Make the request and capture response
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/data/import" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer dev-token" \
    -d "$REQUEST_BODY")

# Split response and status code
HTTP_STATUS=$(echo "$RESPONSE" | tail -1)
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_STATUS"
echo ""

# Pretty print JSON response
echo "$HTTP_BODY" | python3 -m json.tool

# Check if successful
if [ "$HTTP_STATUS" = "200" ]; then
    echo ""
    echo "✅ Import completed successfully!"

    # Extract summary from response
    SUCCESS=$(echo "$HTTP_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
    SWIMMER_NAME=$(echo "$HTTP_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('swimmer_name', 'N/A'))")
    MEETS=$(echo "$HTTP_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('meets_created', 0))")
    TIMES=$(echo "$HTTP_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('times_created', 0))")
    SKIPPED=$(echo "$HTTP_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('skipped_times', 0))")

    echo ""
    echo "📊 Summary:"
    echo "   Swimmer: $SWIMMER_NAME"
    echo "   Meets created: $MEETS"
    echo "   Times created: $TIMES"
    if [ "$SKIPPED" != "0" ]; then
        echo "   Times skipped: $SKIPPED (duplicates)"
    fi
else
    echo ""
    echo "❌ Import failed with HTTP $HTTP_STATUS"
    exit 1
fi
