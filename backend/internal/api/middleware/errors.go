// Package middleware provides HTTP middleware for the API.
package middleware

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/bpg/swimstats/backend/internal/domain"
)

// ErrorResponse represents a JSON error response.
type ErrorResponse struct {
	Error   string            `json:"error"`
	Code    string            `json:"code,omitempty"`
	Details map[string]string `json:"details,omitempty"`
}

// WriteError writes a JSON error response.
func WriteError(w http.ResponseWriter, status int, message string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(ErrorResponse{
		Error: message,
		Code:  code,
	})
}

// WriteValidationError writes a validation error response.
func WriteValidationError(w http.ResponseWriter, errors map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	_ = json.NewEncoder(w).Encode(ErrorResponse{
		Error:   "validation failed",
		Code:    "VALIDATION_ERROR",
		Details: errors,
	})
}

// WriteJSON writes a JSON response.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

// HandleError handles domain errors and writes appropriate HTTP responses.
func HandleError(w http.ResponseWriter, err error, logger *slog.Logger) {
	if err == nil {
		return
	}

	switch e := err.(type) {
	case domain.ValidationError:
		WriteValidationError(w, map[string]string{e.Field: e.Message})
	default:
		logger.Error("internal error", "error", err)
		WriteError(w, http.StatusInternalServerError, "internal server error", "INTERNAL_ERROR")
	}
}

// RecoveryMiddleware recovers from panics and returns 500.
func RecoveryMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					logger.Error("panic recovered",
						"panic", rec,
						"path", r.URL.Path,
						"method", r.Method,
					)
					WriteError(w, http.StatusInternalServerError, "internal server error", "PANIC")
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}
