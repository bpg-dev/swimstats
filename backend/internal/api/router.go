// Package api provides HTTP API routing and handlers.
package api

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/bpg/swimstats/backend/internal/api/handlers"
	"github.com/bpg/swimstats/backend/internal/api/middleware"
)

// Router holds dependencies for the API router.
type Router struct {
	logger *slog.Logger
	// Add service dependencies here as they're created
}

// NewRouter creates a new API router with all dependencies.
func NewRouter(logger *slog.Logger) *Router {
	return &Router{
		logger: logger,
	}
}

// Handler returns the configured HTTP handler with all routes.
func (rt *Router) Handler() http.Handler {
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.RecoveryMiddleware(rt.logger))
	r.Use(middleware.LoggingMiddleware(rt.logger))
	r.Use(middleware.NewCORSHandler(middleware.DefaultCORSConfig()).Handler)

	// Health check (no auth required)
	r.Get("/health", handlers.HealthCheck)
	r.Get("/api/health", handlers.HealthCheck)

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Public routes (no auth)
		r.Group(func(r chi.Router) {
			r.Get("/health", handlers.HealthCheck)
		})

		// Protected routes (auth required)
		r.Group(func(r chi.Router) {
			// TODO: Add auth middleware when T026 is complete
			// r.Use(middleware.AuthMiddleware(rt.authProvider))

			// Auth endpoints
			r.Get("/auth/me", handlers.NotImplemented)

			// Swimmer profile
			r.Get("/swimmer", handlers.NotImplemented)
			r.Put("/swimmer", handlers.NotImplemented)

			// Meets
			r.Get("/meets", handlers.NotImplemented)
			r.Post("/meets", handlers.NotImplemented)
			r.Get("/meets/{id}", handlers.NotImplemented)
			r.Put("/meets/{id}", handlers.NotImplemented)
			r.Delete("/meets/{id}", handlers.NotImplemented)

			// Times
			r.Get("/times", handlers.NotImplemented)
			r.Post("/times", handlers.NotImplemented)
			r.Post("/times/batch", handlers.NotImplemented)
			r.Get("/times/{id}", handlers.NotImplemented)
			r.Put("/times/{id}", handlers.NotImplemented)
			r.Delete("/times/{id}", handlers.NotImplemented)

			// Personal Bests
			r.Get("/personal-bests", handlers.NotImplemented)

			// Standards
			r.Get("/standards", handlers.NotImplemented)
			r.Post("/standards", handlers.NotImplemented)
			r.Get("/standards/{id}", handlers.NotImplemented)
			r.Put("/standards/{id}", handlers.NotImplemented)
			r.Delete("/standards/{id}", handlers.NotImplemented)
			r.Put("/standards/{id}/times", handlers.NotImplemented)
			r.Post("/standards/import", handlers.NotImplemented)

			// Comparisons
			r.Get("/comparisons", handlers.NotImplemented)

			// Progress
			r.Get("/progress/{event}", handlers.NotImplemented)

			// Data export/import (full access only)
			r.Get("/data/export", handlers.NotImplemented)
			r.Post("/data/import", handlers.NotImplemented)
		})
	})

	return r
}
