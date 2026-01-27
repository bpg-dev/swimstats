// Package auth provides OIDC authentication for SwimStats.
package auth

import (
	"fmt"
	"os"
)

// AccessLevel represents the user's access level.
type AccessLevel string

const (
	// AccessLevelFull allows read and write operations.
	AccessLevelFull AccessLevel = "full"
	// AccessLevelViewOnly allows only read operations.
	AccessLevelViewOnly AccessLevel = "view_only"
)

// IsValid checks if the access level is valid.
func (a AccessLevel) IsValid() bool {
	return a == AccessLevelFull || a == AccessLevelViewOnly
}

// CanWrite returns true if the access level allows write operations.
func (a AccessLevel) CanWrite() bool {
	return a == AccessLevelFull
}

// User represents an authenticated user.
type User struct {
	ID          string      `json:"id"`
	Email       string      `json:"email"`
	Name        string      `json:"name,omitempty"`
	AccessLevel AccessLevel `json:"access_level"`
}

// Config holds OIDC authentication configuration.
type Config struct {
	// Issuer is the OIDC provider URL (e.g., https://auth.example.com/application/o/swimstats/)
	Issuer string

	// ClientID is the OAuth2 client ID
	ClientID string

	// ClientSecret is the OAuth2 client secret (for confidential clients)
	ClientSecret string

	// RedirectURL is where the OIDC provider redirects after auth
	RedirectURL string

	// FullAccessClaim is the claim or group that grants full access
	// Users without this claim get view-only access
	FullAccessClaim string

	// Scopes are the OAuth2 scopes to request
	Scopes []string

	// SkipValidation disables token validation in development mode
	SkipValidation bool
}

// DefaultConfig returns default OIDC configuration from environment variables.
func DefaultConfig() Config {
	return Config{
		Issuer:          getEnv("OIDC_ISSUER", ""),
		ClientID:        getEnv("OIDC_CLIENT_ID", ""),
		ClientSecret:    getEnv("OIDC_CLIENT_SECRET", ""),
		RedirectURL:     getEnv("OIDC_REDIRECT_URL", "http://localhost:5173/auth/callback"),
		FullAccessClaim: getEnv("OIDC_FULL_ACCESS_CLAIM", "swimstats_admin"),
		Scopes:          []string{"openid", "email", "profile"},
		SkipValidation:  getEnv("ENV", "production") == "development",
	}
}

// Validate checks that the configuration is complete.
func (c Config) Validate() error {
	if c.SkipValidation {
		return nil // In dev mode, we allow mock auth
	}

	if c.Issuer == "" {
		return fmt.Errorf("OIDC_ISSUER is required")
	}
	if c.ClientID == "" {
		return fmt.Errorf("OIDC_CLIENT_ID is required")
	}
	return nil
}

// getEnv returns environment variable or default.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
