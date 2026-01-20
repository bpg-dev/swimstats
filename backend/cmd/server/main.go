// Package main provides the server entrypoint for SwimStats.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bpg/swimstats/backend/internal/api"
	"github.com/bpg/swimstats/backend/internal/auth"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// Config holds server configuration.
type Config struct {
	Port        int
	Environment string
	DatabaseURL string
}

// getEnv returns environment variable or default.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

// getEnvInt returns environment variable as int or default.
func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		var result int
		if _, err := fmt.Sscanf(val, "%d", &result); err == nil {
			return result
		}
	}
	return defaultVal
}

// loadConfig loads configuration from environment.
func loadConfig() Config {
	return Config{
		Port:        getEnvInt("PORT", 8080),
		Environment: getEnv("ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://swimstats:swimstats@localhost:5432/swimstats?sslmode=disable"),
	}
}

func main() {
	// Configure structured logging
	logLevel := slog.LevelInfo
	if os.Getenv("ENV") == "development" {
		logLevel = slog.LevelDebug
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: logLevel,
	}))
	slog.SetDefault(logger)

	// Load configuration
	cfg := loadConfig()
	logger.Info("starting server",
		"port", cfg.Port,
		"environment", cfg.Environment,
	)

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Connect to database
	db, err := postgres.NewFromDSN(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1) //nolint:gocritic // exitAfterDefer - acceptable in main initialization
	}
	defer db.Close()

	logger.Info("connected to database")

	// Initialize auth provider
	authConfig := auth.DefaultConfig()
	if err := authConfig.Validate(); err != nil {
		logger.Error("invalid auth config", "error", err)
		os.Exit(1)
	}

	authProvider, err := auth.NewProvider(ctx, authConfig, logger)
	if err != nil {
		logger.Error("failed to create auth provider", "error", err)
		os.Exit(1)
	}

	// Create router with dependencies
	router := api.NewRouter(logger, authProvider, db.Pool)

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router.Handler(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("server listening", "addr", server.Addr)
		serverErrors <- server.ListenAndServe()
	}()

	// Wait for interrupt signal or server error
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	case sig := <-shutdown:
		logger.Info("shutdown signal received", "signal", sig.String())

		// Create context with timeout for graceful shutdown
		shutdownCtx, shutdownCancel := context.WithTimeout(ctx, 30*time.Second)
		defer shutdownCancel()

		// Attempt graceful shutdown
		if err := server.Shutdown(shutdownCtx); err != nil {
			logger.Error("graceful shutdown failed", "error", err)
			if err := server.Close(); err != nil {
				logger.Error("forced shutdown failed", "error", err)
			}
		}
	}

	logger.Info("server stopped")
}
