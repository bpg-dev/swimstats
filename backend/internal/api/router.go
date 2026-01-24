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
	"github.com/bpg/swimstats/backend/internal/domain/exporter"
	"github.com/bpg/swimstats/backend/internal/domain/importer"
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
	swimmerService    *swimmer.Service
	meetService       *meet.Service
	timeService       *timeservice.Service
	pbService         *comparison.PersonalBestService
	comparisonService *comparison.ComparisonService
	progressService   *comparison.ProgressService
	standardService   *standard.Service
	importService     *importer.Service
	exportService     *exporter.Service

	// Handlers
	authHandler       *handlers.AuthHandler
	swimmerHandler    *handlers.SwimmerHandler
	meetHandler       *handlers.MeetHandler
	timeHandler       *handlers.TimeHandler
	pbHandler         *handlers.PersonalBestHandler
	comparisonHandler *handlers.ComparisonHandler
	progressHandler   *handlers.ProgressHandler
	standardHandler   *handlers.StandardHandler
	importHandler     *handlers.ImportHandler
	exportHandler     *handlers.ExportHandler
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
	comparisonService := comparison.NewComparisonService(timeRepo, standardRepo, swimmerRepo)
	progressService := comparison.NewProgressService(timeRepo)
	standardService := standard.NewService(standardRepo)
	importService := importer.NewService(swimmerService, meetService, timeService, standardService)
	exportService := exporter.NewService(swimmerService, meetService, timeService, standardService)

	// Create handlers
	authHandler := handlers.NewAuthHandler(authProvider)
	swimmerHandler := handlers.NewSwimmerHandler(swimmerService, logger)
	meetHandler := handlers.NewMeetHandler(meetService, logger)
	timeHandler := handlers.NewTimeHandler(timeService, swimmerService, logger)
	pbHandler := handlers.NewPersonalBestHandler(pbService, swimmerService, logger)
	comparisonHandler := handlers.NewComparisonHandler(comparisonService, swimmerService, logger)
	progressHandler := handlers.NewProgressHandler(progressService, swimmerService, logger)
	standardHandler := handlers.NewStandardHandler(standardService, logger)
	importHandler := handlers.NewImportHandler(importService, logger)
	exportHandler := handlers.NewExportHandler(exportService, logger)

	return &Router{
		logger:            logger,
		authProvider:      authProvider,
		pool:              pool,
		swimmerService:    swimmerService,
		meetService:       meetService,
		timeService:       timeService,
		pbService:         pbService,
		comparisonService: comparisonService,
		progressService:   progressService,
		standardService:   standardService,
		importService:     importService,
		exportService:     exportService,
		authHandler:       authHandler,
		swimmerHandler:    swimmerHandler,
		meetHandler:       meetHandler,
		timeHandler:       timeHandler,
		pbHandler:         pbHandler,
		comparisonHandler: comparisonHandler,
		progressHandler:   progressHandler,
		standardHandler:   standardHandler,
		importHandler:     importHandler,
		exportHandler:     exportHandler,
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
			r.Post("/standards/import/json", rt.standardHandler.ImportStandardsFromJSON)
			r.Get("/standards/{id}", rt.standardHandler.GetStandard)
			r.Put("/standards/{id}", rt.standardHandler.UpdateStandard)
			r.Delete("/standards/{id}", rt.standardHandler.DeleteStandard)
			r.Put("/standards/{id}/times", rt.standardHandler.SetStandardTimes)

			// Comparisons
			r.Get("/comparisons", rt.comparisonHandler.GetComparison)

			// Progress
			r.Get("/progress/{event}", rt.progressHandler.GetProgressData)

			// Data export/import
			r.Get("/data/export", rt.exportHandler.ExportAllData)
			r.Post("/data/import/preview", rt.importHandler.PreviewImport)
			r.Post("/data/import", rt.importHandler.ImportSwimmerData)
		})
	})

	return r
}
