// Package handlers provides HTTP handlers for the API.
package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
)

// HealthChecker provides database health checking.
type HealthChecker interface {
	Ping(ctx context.Context) error
	Health(ctx context.Context) map[string]interface{}
}

// HealthHandler handles health check endpoints.
type HealthHandler struct {
	db      HealthChecker
	version string
}

// NewHealthHandler creates a new health handler.
func NewHealthHandler(db HealthChecker, version string) *HealthHandler {
	return &HealthHandler{
		db:      db,
		version: version,
	}
}

// HealthResponse represents the health check response.
type HealthResponse struct {
	Status    string                 `json:"status"`
	Version   string                 `json:"version"`
	Timestamp string                 `json:"timestamp"`
	Database  map[string]interface{} `json:"database,omitempty"`
}

// Health handles GET /health
func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	response := HealthResponse{
		Status:    "healthy",
		Version:   h.version,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	// Check database connectivity
	if h.db != nil {
		if err := h.db.Ping(ctx); err != nil {
			response.Status = "unhealthy"
			response.Database = map[string]interface{}{
				"status": "down",
				"error":  err.Error(),
			}
			middleware.WriteJSON(w, http.StatusServiceUnavailable, response)
			return
		}
		response.Database = h.db.Health(ctx)
	}

	middleware.WriteJSON(w, http.StatusOK, response)
}

// Ready handles GET /ready (Kubernetes readiness probe)
func (h *HealthHandler) Ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if h.db != nil {
		if err := h.db.Ping(ctx); err != nil {
			middleware.WriteError(w, http.StatusServiceUnavailable, "database not ready", "NOT_READY")
			return
		}
	}

	middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

// Live handles GET /live (Kubernetes liveness probe)
func (h *HealthHandler) Live(w http.ResponseWriter, r *http.Request) {
	middleware.WriteJSON(w, http.StatusOK, map[string]string{"status": "alive"})
}
