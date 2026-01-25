# Testing Strategy

This document describes the testing strategy and coverage goals for SwimStats.

## Testing Philosophy

SwimStats follows a **testing pyramid** approach:
1. **Unit Tests**: Fast, isolated tests for business logic
2. **Integration Tests**: API-level tests with real database
3. **Component Tests**: React component behavior with mocked APIs
4. **Accessibility Tests**: WCAG 2.1 AA compliance via axe-core

## Test Locations

### Backend (`backend/`)

```
backend/
├── internal/
│   └── domain/time/
│       └── format_test.go       # Unit tests for time formatting
└── tests/
    └── integration/
        ├── testdb.go            # Test database setup
        ├── api_client.go        # HTTP test client
        ├── meet_test.go         # Meet API integration tests
        ├── time_test.go         # Time API integration tests
        ├── personalbest_test.go # Personal best API tests
        ├── standard_test.go     # Standards API tests
        ├── comparison_test.go   # Comparison API tests
        ├── progress_test.go     # Progress API tests
        └── export_import_test.go# Export/Import API tests
```

### Frontend (`frontend/`)

```
frontend/
├── tests/
│   ├── setup.ts                 # Test setup with MSW
│   ├── mocks/
│   │   └── handlers.ts          # MSW API mock handlers
│   ├── components/
│   │   ├── meets.test.tsx       # Meet components tests
│   │   ├── times.test.tsx       # Time components tests
│   │   ├── comparison.test.tsx  # Comparison tests
│   │   ├── progress.test.tsx    # Progress chart tests
│   │   └── settings.test.tsx    # Settings tests
│   └── accessibility/
│       └── a11y.test.tsx        # Accessibility tests (27 tests)
```

## Running Tests

### Backend

```bash
cd backend

# Run all tests
go test ./...

# Run with verbose output
go test -v ./...

# Run integration tests only
go test -v ./tests/integration/...

# Run with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend

```bash
cd frontend

# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm test -- --run tests/accessibility/a11y.test.tsx
```

## Coverage Goals

| Area | Target | Notes |
|------|--------|-------|
| Critical paths (time entry, PB calculation) | >90% | Business-critical |
| API handlers | >80% | Via integration tests |
| UI components | >70% | Via component tests |
| Utilities/helpers | >90% | Pure functions |

## Test Types Explained

### Backend Integration Tests

Integration tests use a real PostgreSQL database (via Docker) and test the full request/response cycle:

```go
func TestMeetAPI(t *testing.T) {
    ctx := context.Background()
    testDB := SetupTestDB(ctx, t)
    defer testDB.TeardownTestDB(ctx, t)

    handler := setupTestHandler(t, testDB)
    client := NewAPIClient(t, handler)
    client.SetMockUser("full")

    t.Run("POST /meets creates meet", func(t *testing.T) {
        input := MeetInput{Name: "Test Meet", ...}
        rr := client.Post("/api/v1/meets", input)
        require.Equal(t, http.StatusCreated, rr.Code)
    })
}
```

### Frontend Component Tests

Component tests use MSW (Mock Service Worker) to mock API responses:

```tsx
describe('MeetList', () => {
  it('displays meets from API', async () => {
    // MSW handler returns mock data
    render(<TestWrapper><MeetList /></TestWrapper>);

    await waitFor(() => {
      expect(screen.getByText('Test Meet')).toBeInTheDocument();
    });
  });
});
```

### Accessibility Tests

Accessibility tests use axe-core to check WCAG compliance:

```tsx
describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## CI Integration

Tests run automatically on every pull request:

1. **Backend Lint**: golangci-lint
2. **Backend Test**: go test with PostgreSQL service
3. **Frontend Lint**: ESLint + Prettier
4. **Frontend Test**: Vitest with coverage

See `.github/workflows/ci.yaml` for the full configuration.

## Adding New Tests

### Backend

1. Add test file in `tests/integration/` for API tests
2. Add test file in `internal/domain/*/` for unit tests
3. Follow existing patterns with table-driven tests
4. Use testify for assertions

### Frontend

1. Add test file in `tests/components/` for component tests
2. Add mock handlers in `tests/mocks/handlers.ts`
3. Use React Testing Library patterns
4. Use MSW for API mocking

## Test Database Setup

### Local Development

```bash
# Create test database
createdb swimstats_test

# Run migrations using the embedded migrate command
cd backend && DATABASE_URL="postgres://swimstats:swimstats@localhost:5432/swimstats_test?sslmode=disable" \
  go run ./cmd/server migrate
```

### CI Environment

The CI workflow automatically:
1. Starts PostgreSQL container
2. Runs migrations
3. Runs tests with clean database

## Troubleshooting

### Tests failing locally but passing in CI

- Ensure you're running against a clean test database
- Check that migrations are up to date
- Verify environment variables match CI

### MSW handlers not matching

- Check that handler URL patterns match the actual API calls
- Verify request methods (GET, POST, etc.)
- Check the browser console for unhandled requests

### Coverage report showing 0%

- Backend domain packages show 0% because coverage is measured at the integration test level
- The actual code is exercised through integration tests
- Use `go test -coverprofile=coverage.out ./...` for aggregate coverage
