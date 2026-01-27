// Package migrate provides database migration functionality.
package migrate

import (
	"errors"
	"fmt"
	"log/slog"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5" // pgx driver
	"github.com/golang-migrate/migrate/v4/source/iofs"

	"github.com/bpg/swimstats/backend/migrations"
)

// Run executes all pending database migrations.
// Returns the number of migrations applied and any error.
func Run(databaseURL string, logger *slog.Logger) (int, error) {
	// Create source driver from embedded filesystem
	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return 0, fmt.Errorf("create migration source: %w", err)
	}

	// Convert postgres:// to pgx5:// for the driver
	pgxURL := "pgx5" + databaseURL[8:] // Replace "postgres" with "pgx5"

	// Create migrate instance
	m, err := migrate.NewWithSourceInstance("iofs", source, pgxURL)
	if err != nil {
		return 0, fmt.Errorf("create migrate instance: %w", err)
	}
	defer func() {
		srcErr, dbErr := m.Close()
		if srcErr != nil {
			logger.Warn("failed to close migration source", "error", srcErr)
		}
		if dbErr != nil {
			logger.Warn("failed to close migration database", "error", dbErr)
		}
	}()

	// Get current version before migration
	versionBefore, dirty, err := m.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return 0, fmt.Errorf("get current version: %w", err)
	}
	if dirty {
		return 0, fmt.Errorf("database is in dirty state at version %d, manual intervention required", versionBefore)
	}

	logger.Info("starting database migration",
		"current_version", versionBefore,
	)

	// Run migrations
	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return 0, fmt.Errorf("run migrations: %w", err)
	}

	// Get version after migration
	versionAfter, _, err := m.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return 0, fmt.Errorf("get new version: %w", err)
	}

	applied := int(versionAfter - versionBefore)
	if errors.Is(err, migrate.ErrNoChange) || applied == 0 {
		logger.Info("database is up to date", "version", versionAfter)
		return 0, nil
	}

	logger.Info("migrations applied successfully",
		"from_version", versionBefore,
		"to_version", versionAfter,
		"applied_count", applied,
	)

	return applied, nil
}
