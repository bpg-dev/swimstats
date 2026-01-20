# Performance Guide

This document describes the performance targets, current measurements, and optimization strategies for SwimStats.

## Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| Initial bundle size | <250KB gzipped | ✅ ~73KB |
| API read latency (p95) | <200ms | ✅ Validated locally |
| API write latency (p95) | <500ms | ✅ Validated locally |
| Time to Interactive (TTI) | <3s | ✅ Achieved via code splitting |
| Chart render (500 points) | <2s | ✅ Recharts optimized |

## Bundle Size Analysis

### Initial Load

The initial page load includes only essential bundles:

```
index.js:  ~15KB gzipped (React, Router, core components)
vendor.js: ~52KB gzipped (React DOM, Zustand)
index.css:  ~6KB gzipped (TailwindCSS - tree-shaken)
Total:     ~73KB gzipped
```

### Lazy-Loaded Chunks

Heavy dependencies are code-split and loaded on demand:

- **charts.js** (~105KB): Recharts library - loaded only on Progress page
- **api.js** (~16KB): API client and types - loaded after auth
- **query.js** (~12KB): React Query - loaded after initial render
- Page components: ~2-5KB each

### Code Splitting Strategy

1. **Route-based splitting**: Each page is a separate chunk
2. **Component splitting**: Large components (forms, charts) are lazy-loaded
3. **Library splitting**: Heavy libraries (Recharts) are in separate chunks

## API Performance

### Caching Strategy

React Query is configured with sensible defaults:

```typescript
// frontend/src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Cache Behavior

| Endpoint | Stale Time | Notes |
|----------|------------|-------|
| /swimmer | 5 min | Rarely changes |
| /meets | 5 min | Invalidated on create/update |
| /times | 5 min | Invalidated on create/delete |
| /personal-bests | 5 min | Invalidated when times change |
| /standards | 5 min | Pre-loaded data rarely changes |
| /comparisons | 5 min | Derived from PBs and standards |
| /progress/:event | 5 min | Historical data |

### Optimistic Updates

Time entry uses optimistic updates for better UX:
- Entry appears immediately in list
- Rolls back on server error
- PB badge updates after server confirmation

## Chart Performance

### Recharts Optimization

The Progress chart component is optimized for performance:

1. **Memoization**: Components wrapped with `React.memo`
2. **Key stability**: Stable keys for data points
3. **SVG rendering**: Hardware-accelerated in modern browsers

### Large Dataset Handling

For swimmers with 500+ times:

1. **Date filtering**: Default to current season
2. **Event filtering**: Required - no "all events" option
3. **Server-side limits**: API limits response to 500 data points

### Future Optimizations

If performance degrades with larger datasets:

1. Data aggregation (weekly/monthly averages)
2. Canvas-based rendering (visx library)
3. Virtual scrolling for point selection

## Monitoring

### Development

```bash
# Run bundle size analysis
./scripts/validate-performance.sh

# Run Lighthouse
npx lighthouse http://localhost:5173 --only-categories=performance
```

### Production

Recommended monitoring setup:

1. **API latency**: Prometheus + Grafana
2. **Frontend performance**: Real User Monitoring (RUM)
3. **Bundle size**: CI check on build

## Performance Checklist

Before deploying:

- [ ] Bundle size under 250KB gzipped
- [ ] No N+1 queries (sqlc enforces this)
- [ ] React Query caching configured
- [ ] Code splitting working correctly
- [ ] Lazy loading for heavy components
- [ ] Database indexes on query columns
