// Package api provides HTTP API routing and handlers.
package api

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/bpg/swimstats/backend/internal/api/handlers"
	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/auth"
	"github.com/bpg/swimstats/backend/internal/domain/comparison"
	"github.com/bpg/swimstats/backend/internal/domain/meet"
	"github.com/bpg/swimstats/backend/internal/domain/standard"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	timeservice "github.com/bpg/swimstats/backend/internal/domain/time"
	"github.com/bpg/swimstats/backend/internal/store/db"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// Router holds dependencies for the API router.
type Router struct {
	logger       *slog.Logger
	authProvider *auth.Provider
	pool         *pgxpool.Pool

	// Services
	swimmerService  *swimmer.Service
	meetService     *meet.Service
	timeService     *timeservice.Service
	pbService       *comparison.PersonalBestService
	standardService *standard.Service

	// Handlers
	authHandler     *handlers.AuthHandler
	swimmerHandler  *handlers.SwimmerHandler
	meetHandler     *handlers.MeetHandler
	timeHandler     *handlers.TimeHandler
	pbHandler       *handlers.PersonalBestHandler
	standardHandler *handlers.StandardHandler
}

// NewRouter creates a new API router with all dependencies.
func NewRouter(logger *slog.Logger, authProvider *auth.Provider, pool *pgxpool.Pool) *Router {
	// Create queries instance
	queries := db.New(pool)

	// Create repositories
	swimmerRepo := postgres.NewSwimmerRepository(queries)
	meetRepo := postgres.NewMeetRepository(queries)
	timeRepo := postgres.NewTimeRepository(queries)
	standardRepo := postgres.NewStandardRepository(queries)

	// Create services
	swimmerService := swimmer.NewService(swimmerRepo)
	meetService := meet.NewService(meetRepo)
	timeService := timeservice.NewService(timeRepo, meetRepo)
	pbService := comparison.NewPersonalBestService(timeRepo)
	standardService := standard.NewService(standardRepo)

	// Create handlers
	authHandler := handlers.NewAuthHandler(authProvider)
	swimmerHandler := handlers.NewSwimmerHandler(swimmerService)
	meetHandler := handlers.NewMeetHandler(meetService)
	timeHandler := handlers.NewTimeHandler(timeService, swimmerService)
	pbHandler := handlers.NewPersonalBestHandler(pbService, swimmerService)
	standardHandler := handlers.NewStandardHandler(standardService)

	return &Router{
		logger:          logger,
		authProvider:    authProvider,
		pool:            pool,
		swimmerService:  swimmerService,
		meetService:     meetService,
		timeService:     timeService,
		pbService:       pbService,
		standardService: standardService,
		authHandler:     authHandler,
		swimmerHandler:  swimmerHandler,
		meetHandler:     meetHandler,
		timeHandler:     timeHandler,
		pbHandler:       pbHandler,
		standardHandler: standardHandler,
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

	// API v1 routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes (no auth)
		r.Group(func(r chi.Router) {
			r.Get("/health", handlers.HealthCheck)
		})

		// Protected routes (auth required)
		r.Group(func(r chi.Router) {
			// Add auth middleware
			r.Use(middleware.AuthMiddleware(rt.authProvider, rt.logger))

			// Auth endpoints
			r.Get("/auth/me", rt.authHandler.GetCurrentUser)

			// Swimmer profile
			r.Get("/swimmer", rt.swimmerHandler.GetSwimmer)
			r.Put("/swimmer", rt.swimmerHandler.PutSwimmer)

			// Meets
			r.Get("/meets", rt.meetHandler.ListMeets)
			r.Post("/meets", rt.meetHandler.CreateMeet)
			r.Get("/meets/{id}", rt.meetHandler.GetMeet)
			r.Put("/meets/{id}", rt.meetHandler.UpdateMeet)
			r.Delete("/meets/{id}", rt.meetHandler.DeleteMeet)

			// Times
			r.Get("/times", rt.timeHandler.ListTimes)
			r.Post("/times", rt.timeHandler.CreateTime)
			r.Post("/times/batch", rt.timeHandler.CreateBatchTimes)
			r.Get("/times/{id}", rt.timeHandler.GetTime)
			r.Put("/times/{id}", rt.timeHandler.UpdateTime)
			r.Delete("/times/{id}", rt.timeHandler.DeleteTime)

			// Personal Bests
			r.Get("/personal-bests", rt.pbHandler.GetPersonalBests)

			// Standards
			r.Get("/standards", rt.standardHandler.ListStandards)
			r.Post("/standards", rt.standardHandler.CreateStandard)
			r.Post("/standards/import", rt.standardHandler.ImportStandard)
			r.Get("/standards/{id}", rt.standardHandler.GetStandard)
			r.Put("/standards/{id}", rt.standardHandler.UpdateStandard)
			r.Delete("/standards/{id}", rt.standardHandler.DeleteStandard)
			r.Put("/standards/{id}/times", rt.standardHandler.SetStandardTimes)

			// Comparisons (to be implemented in US4)
			r.Get("/comparisons", handlers.NotImplemented)

			// Progress (to be implemented in US5)
			r.Get("/progress/{event}", handlers.NotImplemented)

			// Data export/import (to be implemented in Polish phase)
			r.Get("/data/export", handlers.NotImplemented)
			r.Post("/data/import", handlers.NotImplemented)
		})
	})

	return r
}
