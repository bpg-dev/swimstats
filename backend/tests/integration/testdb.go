// Package integration provides integration test utilities.
package integration

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TestDB provides a test database connection.
type TestDB struct {
	Pool *pgxpool.Pool
	DSN  string
}

// TestDBConfig holds test database configuration.
type TestDBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

// DefaultTestDBConfig returns the default test database configuration.
// Uses environment variables or defaults to local Docker PostgreSQL.
func DefaultTestDBConfig() TestDBConfig {
	return TestDBConfig{
		Host:     getEnvOrDefault("TEST_DB_HOST", "localhost"),
		Port:     getEnvIntOrDefault("TEST_DB_PORT", 5432),
		User:     getEnvOrDefault("TEST_DB_USER", "swimstats"),
		Password: getEnvOrDefault("TEST_DB_PASSWORD", "swimstats"),
		Database: getEnvOrDefault("TEST_DB_NAME", "swimstats_test"),
	}
}

// DSN returns the connection string for the test database.
func (c TestDBConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		c.User, c.Password, c.Host, c.Port, c.Database,
	)
}

// NewTestDB creates a new test database connection.
func NewTestDB(t *testing.T) *TestDB {
	t.Helper()

	cfg := DefaultTestDBConfig()
	dsn := cfg.DSN()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Verify connection
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		t.Fatalf("Failed to ping test database: %v", err)
	}

	return &TestDB{
		Pool: pool,
		DSN:  dsn,
	}
}

// Close closes the test database connection.
func (db *TestDB) Close() {
	if db.Pool != nil {
		db.Pool.Close()
	}
}

// CleanTables truncates all tables for a fresh test state.
func (db *TestDB) CleanTables(t *testing.T) {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Tables in order respecting foreign key constraints
	tables := []string{
		"standard_times",
		"time_standards",
		"times",
		"meets",
		"swimmers",
	}

	for _, table := range tables {
		_, err := db.Pool.Exec(ctx, fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table))
		if err != nil {
			t.Logf("Warning: Failed to truncate %s: %v", table, err)
		}
	}
}

// ExecSQL executes raw SQL for test setup.
func (db *TestDB) ExecSQL(t *testing.T, sql string, args ...interface{}) {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Pool.Exec(ctx, sql, args...)
	if err != nil {
		t.Fatalf("Failed to execute SQL: %v\nSQL: %s", err, sql)
	}
}

// Helper functions for environment variables
func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvIntOrDefault(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultVal
}

// SetupTestSuite is a helper for setting up the test suite.
// Call this at the beginning of TestMain.
func SetupTestSuite() error {
	// Add any global test setup here
	return nil
}

// TeardownTestSuite is a helper for cleaning up after the test suite.
// Call this at the end of TestMain.
func TeardownTestSuite() error {
	// Add any global test teardown here
	return nil
}
