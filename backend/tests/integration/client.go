package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestClient provides HTTP client utilities for integration tests.
type TestClient struct {
	t       *testing.T
	handler http.Handler
	baseURL string
	headers map[string]string
}

// NewTestClient creates a new test client for the given handler.
func NewTestClient(t *testing.T, handler http.Handler) *TestClient {
	t.Helper()
	return &TestClient{
		t:       t,
		handler: handler,
		headers: make(map[string]string),
	}
}

// WithServer creates a test client with a running test server.
// Returns the client and a cleanup function.
func WithServer(t *testing.T, handler http.Handler) (*TestClient, func()) {
	t.Helper()

	server := httptest.NewServer(handler)
	client := &TestClient{
		t:       t,
		baseURL: server.URL,
		headers: make(map[string]string),
	}

	return client, server.Close
}

// SetHeader sets a header for all subsequent requests.
func (c *TestClient) SetHeader(key, value string) *TestClient {
	c.headers[key] = value
	return c
}

// SetMockUser sets the mock user header for development mode testing.
func (c *TestClient) SetMockUser(email, name, access string) *TestClient {
	mockUser := fmt.Sprintf(`{"email":"%s","name":"%s","access":"%s"}`, email, name, access)
	return c.SetHeader("X-Mock-User", mockUser)
}

// SetFullAccess sets a mock user with full access.
func (c *TestClient) SetFullAccess() *TestClient {
	return c.SetMockUser("test@example.com", "Test User", "full")
}

// SetViewOnly sets a mock user with view-only access.
func (c *TestClient) SetViewOnly() *TestClient {
	return c.SetMockUser("viewer@example.com", "View User", "view_only")
}

// Response wraps an HTTP response for easier assertions.
type Response struct {
	t          *testing.T
	StatusCode int
	Body       []byte
	Headers    http.Header
}

// DecodeJSON decodes the response body into the given value.
func (r *Response) DecodeJSON(v interface{}) *Response {
	r.t.Helper()
	if err := json.Unmarshal(r.Body, v); err != nil {
		r.t.Fatalf("Failed to decode JSON response: %v\nBody: %s", err, string(r.Body))
	}
	return r
}

// AssertStatus asserts the response has the expected status code.
func (r *Response) AssertStatus(expected int) *Response {
	r.t.Helper()
	if r.StatusCode != expected {
		r.t.Errorf("Expected status %d, got %d\nBody: %s", expected, r.StatusCode, string(r.Body))
	}
	return r
}

// AssertOK asserts the response is 200 OK.
func (r *Response) AssertOK() *Response {
	return r.AssertStatus(http.StatusOK)
}

// AssertCreated asserts the response is 201 Created.
func (r *Response) AssertCreated() *Response {
	return r.AssertStatus(http.StatusCreated)
}

// AssertNoContent asserts the response is 204 No Content.
func (r *Response) AssertNoContent() *Response {
	return r.AssertStatus(http.StatusNoContent)
}

// AssertBadRequest asserts the response is 400 Bad Request.
func (r *Response) AssertBadRequest() *Response {
	return r.AssertStatus(http.StatusBadRequest)
}

// AssertUnauthorized asserts the response is 401 Unauthorized.
func (r *Response) AssertUnauthorized() *Response {
	return r.AssertStatus(http.StatusUnauthorized)
}

// AssertForbidden asserts the response is 403 Forbidden.
func (r *Response) AssertForbidden() *Response {
	return r.AssertStatus(http.StatusForbidden)
}

// AssertNotFound asserts the response is 404 Not Found.
func (r *Response) AssertNotFound() *Response {
	return r.AssertStatus(http.StatusNotFound)
}

// GET performs a GET request.
func (c *TestClient) GET(path string) *Response {
	return c.do("GET", path, nil)
}

// POST performs a POST request with JSON body.
func (c *TestClient) POST(path string, body interface{}) *Response {
	return c.do("POST", path, body)
}

// PUT performs a PUT request with JSON body.
func (c *TestClient) PUT(path string, body interface{}) *Response {
	return c.do("PUT", path, body)
}

// DELETE performs a DELETE request.
func (c *TestClient) DELETE(path string) *Response {
	return c.do("DELETE", path, nil)
}

// do performs the actual HTTP request.
func (c *TestClient) do(method, path string, body interface{}) *Response {
	c.t.Helper()

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			c.t.Fatalf("Failed to marshal request body: %v", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	url := path
	if c.baseURL != "" {
		url = c.baseURL + path
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		c.t.Fatalf("Failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	for key, value := range c.headers {
		req.Header.Set(key, value)
	}

	var resp *http.Response

	if c.handler != nil {
		// Use httptest recorder for handler-based testing
		rec := httptest.NewRecorder()
		c.handler.ServeHTTP(rec, req)
		resp = rec.Result()
	} else {
		// Use real HTTP client for server-based testing
		client := &http.Client{}
		resp, err = client.Do(req)
		if err != nil {
			c.t.Fatalf("Failed to perform request: %v", err)
		}
	}
	defer func() { _ = resp.Body.Close() }()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.t.Fatalf("Failed to read response body: %v", err)
	}

	return &Response{
		t:          c.t,
		StatusCode: resp.StatusCode,
		Body:       respBody,
		Headers:    resp.Header,
	}
}
