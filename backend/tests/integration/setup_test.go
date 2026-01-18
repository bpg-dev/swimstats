package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/bpg/swimstats/backend/internal/api"
	"github.com/bpg/swimstats/backend/internal/auth"
)

// APIClient is a helper for making API requests in tests.
type APIClient struct {
	t           *testing.T
	handler     http.Handler
	accessLevel string
}

// NewAPIClient creates a new API test client.
func NewAPIClient(t *testing.T, handler http.Handler) *APIClient {
	return &APIClient{
		t:           t,
		handler:     handler,
		accessLevel: "full",
	}
}

// SetMockUser sets the mock user access level ("full" or "view_only").
func (c *APIClient) SetMockUser(accessLevel string) {
	c.accessLevel = accessLevel
}

// ClearMockUser removes the mock user (for testing unauthenticated access).
func (c *APIClient) ClearMockUser() {
	c.accessLevel = ""
}

// Get performs a GET request.
func (c *APIClient) Get(path string) *httptest.ResponseRecorder {
	return c.doRequest("GET", path, nil)
}

// Post performs a POST request with JSON body.
func (c *APIClient) Post(path string, body interface{}) *httptest.ResponseRecorder {
	return c.doRequest("POST", path, body)
}

// Put performs a PUT request with JSON body.
func (c *APIClient) Put(path string, body interface{}) *httptest.ResponseRecorder {
	return c.doRequest("PUT", path, body)
}

// Delete performs a DELETE request.
func (c *APIClient) Delete(path string) *httptest.ResponseRecorder {
	return c.doRequest("DELETE", path, nil)
}

func (c *APIClient) doRequest(method, path string, body interface{}) *httptest.ResponseRecorder {
	c.t.Helper()

	var reqBody *bytes.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			c.t.Fatalf("Failed to marshal request body: %v", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	var req *http.Request
	var err error
	if reqBody != nil {
		req, err = http.NewRequest(method, path, reqBody)
	} else {
		req, err = http.NewRequest(method, path, nil)
	}
	if err != nil {
		c.t.Fatalf("Failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	// Send mock user as JSON so the auth provider can parse it (unless cleared)
	if c.accessLevel != "" {
		mockUserJSON, _ := json.Marshal(map[string]string{
			"email":  "test@swimstats.local",
			"name":   "Test User",
			"access": c.accessLevel,
		})
		req.Header.Set("X-Mock-User", string(mockUserJSON))
	}

	rr := httptest.NewRecorder()
	c.handler.ServeHTTP(rr, req)
	return rr
}

// AssertJSONBody unmarshals the response body into target.
func AssertJSONBody(t *testing.T, rr *httptest.ResponseRecorder, target interface{}) {
	t.Helper()
	if err := json.Unmarshal(rr.Body.Bytes(), target); err != nil {
		t.Fatalf("Failed to unmarshal response: %v\nBody: %s", err, rr.Body.String())
	}
}

// SetupTestDB creates a test database connection.
// Uses the local Docker PostgreSQL instance.
func SetupTestDB(ctx interface{}, t *testing.T) *TestDB {
	t.Helper()
	return NewTestDB(t)
}

// ClearTables truncates all tables.
func (db *TestDB) ClearTables(ctx interface{}, t *testing.T) {
	t.Helper()
	db.CleanTables(t)
}

// TeardownTestDB closes the database connection.
func (db *TestDB) TeardownTestDB(ctx interface{}, t *testing.T) {
	t.Helper()
	db.Close()
}

// setupTestHandler creates the API handler for testing with the real router.
func setupTestHandler(t *testing.T, testDB *TestDB) http.Handler {
	t.Helper()

	// Create a logger that discards output during tests (or use slog.Default())
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelWarn, // Only show warnings and errors during tests
	}))

	// Create auth provider in dev mode (skips real OIDC validation)
	authCfg := auth.Config{
		SkipValidation: true,
	}
	authProvider, err := auth.NewProvider(context.Background(), authCfg, logger)
	if err != nil {
		t.Fatalf("Failed to create auth provider: %v", err)
	}

	// Create the router with all dependencies
	router := api.NewRouter(logger, authProvider, testDB.Pool)

	return router.Handler()
}
