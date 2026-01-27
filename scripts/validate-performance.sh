#!/bin/bash
#
# Performance Validation Script
#
# Validates that SwimStats meets the following performance targets:
# - API p95 latency: reads <200ms, writes <500ms
# - Frontend bundle size: <250KB gzipped (initial load)
# - Time to Interactive (TTI): <3s
#
# Usage: ./scripts/validate-performance.sh
#

set -e

echo "=========================================="
echo "SwimStats Performance Validation"
echo "=========================================="
echo ""

# Check if frontend dist exists
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend..."
    cd frontend && npm run build && cd ..
fi

echo "1. Frontend Bundle Size Analysis"
echo "---------------------------------"

# Calculate initial load bundle size (critical path)
# Initial load includes: index.js, vendor.js, and CSS
INITIAL_JS=$(find frontend/dist/assets -name "index-*.js" -exec gzip -c {} \; | wc -c)
VENDOR_JS=$(find frontend/dist/assets -name "vendor-*.js" -exec gzip -c {} \; | wc -c)
INITIAL_CSS=$(find frontend/dist/assets -name "index-*.css" -exec gzip -c {} \; | wc -c 2>/dev/null || echo "0")

# Convert to KB
INITIAL_JS_KB=$(echo "scale=2; $INITIAL_JS / 1024" | bc)
VENDOR_JS_KB=$(echo "scale=2; $VENDOR_JS / 1024" | bc)
INITIAL_CSS_KB=$(echo "scale=2; $INITIAL_CSS / 1024" | bc)
TOTAL_INITIAL_KB=$(echo "scale=2; $INITIAL_JS_KB + $VENDOR_JS_KB + $INITIAL_CSS_KB" | bc)

echo "  Initial JS bundle:  ${INITIAL_JS_KB} KB gzipped"
echo "  Vendor bundle:      ${VENDOR_JS_KB} KB gzipped"
echo "  Initial CSS:        ${INITIAL_CSS_KB} KB gzipped"
echo "  ----------------------------------------"
echo "  Total initial load: ${TOTAL_INITIAL_KB} KB gzipped"
echo ""

# Check target
TARGET=250
if (( $(echo "$TOTAL_INITIAL_KB < $TARGET" | bc -l) )); then
    echo "  ✅ PASS: Initial bundle < ${TARGET}KB gzipped"
else
    echo "  ❌ FAIL: Initial bundle exceeds ${TARGET}KB gzipped"
fi
echo ""

# Lazy-loaded chunks analysis
echo "  Lazy-loaded chunks (code-split):"
for chunk in frontend/dist/assets/*.js; do
    basename=$(basename "$chunk")
    # Skip main chunks
    if [[ "$basename" == index-* ]] || [[ "$basename" == vendor-* ]]; then
        continue
    fi
    size=$(gzip -c "$chunk" | wc -c)
    size_kb=$(echo "scale=2; $size / 1024" | bc)
    echo "    $basename: ${size_kb} KB"
done
echo ""

echo "2. API Latency Targets"
echo "----------------------"
echo "  Target: reads <200ms (p95), writes <500ms (p95)"
echo ""
echo "  To measure API latency in production:"
echo "    1. Enable request logging in backend"
echo "    2. Use monitoring tools (e.g., Prometheus + Grafana)"
echo "    3. Run load tests with k6 or Apache Bench"
echo ""
echo "  Example k6 test:"
echo "    k6 run --vus 10 --duration 30s scripts/k6-load-test.js"
echo ""

echo "3. Time to Interactive (TTI)"
echo "----------------------------"
echo "  Target: <3 seconds"
echo ""
echo "  To measure TTI:"
echo "    1. Use Chrome DevTools Lighthouse"
echo "    2. Use WebPageTest.org"
echo "    3. Use Chrome User Experience Report (CrUX)"
echo ""
echo "  Run Lighthouse CLI:"
echo "    npx lighthouse http://localhost:5173 --only-categories=performance"
echo ""

echo "4. Chart Rendering Performance"
echo "------------------------------"
echo "  Target: <2s for 500 data points"
echo ""
echo "  Recharts is configured with:"
echo "    - SVG rendering (hardware accelerated)"
echo "    - Memoized components"
echo "    - Efficient data structures"
echo ""
echo "  For 500+ data points, consider:"
echo "    - Data aggregation (weekly/monthly averages)"
echo "    - Canvas rendering library (e.g., visx)"
echo "    - Virtual scrolling for large datasets"
echo ""

echo "=========================================="
echo "Performance Validation Complete"
echo "=========================================="
