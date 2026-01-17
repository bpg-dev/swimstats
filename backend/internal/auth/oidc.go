package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// Provider handles OIDC authentication.
type Provider struct {
	config   Config
	provider *oidc.Provider
	verifier *oidc.IDTokenVerifier
	oauth2   oauth2.Config
	logger   *slog.Logger
}

// NewProvider creates a new OIDC authentication provider.
func NewProvider(ctx context.Context, cfg Config, logger *slog.Logger) (*Provider, error) {
	if cfg.SkipValidation {
		logger.Info("OIDC validation disabled (development mode)")
		return &Provider{
			config: cfg,
			logger: logger,
		}, nil
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	provider, err := oidc.NewProvider(ctx, cfg.Issuer)
	if err != nil {
		return nil, fmt.Errorf("create OIDC provider: %w", err)
	}

	verifier := provider.Verifier(&oidc.Config{
		ClientID: cfg.ClientID,
	})

	oauth2Config := oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       cfg.Scopes,
	}

	return &Provider{
		config:   cfg,
		provider: provider,
		verifier: verifier,
		oauth2:   oauth2Config,
		logger:   logger,
	}, nil
}

// VerifyToken verifies an ID token and returns the user info.
func (p *Provider) VerifyToken(ctx context.Context, rawToken string) (*User, error) {
	// Development mode: accept mock tokens
	if p.config.SkipValidation {
		return p.parseDevToken(rawToken)
	}

	// Remove "Bearer " prefix if present
	rawToken = strings.TrimPrefix(rawToken, "Bearer ")

	token, err := p.verifier.Verify(ctx, rawToken)
	if err != nil {
		return nil, fmt.Errorf("verify token: %w", err)
	}

	// Extract claims
	var claims struct {
		Email  string   `json:"email"`
		Name   string   `json:"name"`
		Groups []string `json:"groups"`
	}
	if err := token.Claims(&claims); err != nil {
		return nil, fmt.Errorf("parse claims: %w", err)
	}

	// Determine access level
	accessLevel := AccessLevelViewOnly
	for _, group := range claims.Groups {
		if group == p.config.FullAccessClaim {
			accessLevel = AccessLevelFull
			break
		}
	}

	return &User{
		ID:          token.Subject,
		Email:       claims.Email,
		Name:        claims.Name,
		AccessLevel: accessLevel,
	}, nil
}

// parseDevToken parses a mock token for development.
// Format: JSON in X-Mock-User header: {"email":"test@example.com","access":"full"}
func (p *Provider) parseDevToken(rawToken string) (*User, error) {
	// Try to parse as JSON
	var mockUser struct {
		Email  string `json:"email"`
		Name   string `json:"name"`
		Access string `json:"access"`
	}

	if err := json.Unmarshal([]byte(rawToken), &mockUser); err != nil {
		// Default mock user if parsing fails
		return &User{
			ID:          "dev-user",
			Email:       "dev@swimstats.local",
			Name:        "Developer",
			AccessLevel: AccessLevelFull,
		}, nil
	}

	accessLevel := AccessLevelFull
	if mockUser.Access == "view_only" {
		accessLevel = AccessLevelViewOnly
	}

	return &User{
		ID:          "mock-" + mockUser.Email,
		Email:       mockUser.Email,
		Name:        mockUser.Name,
		AccessLevel: accessLevel,
	}, nil
}

// AuthCodeURL returns the URL to redirect the user for authentication.
func (p *Provider) AuthCodeURL(state string) string {
	if p.provider == nil {
		return "" // Development mode
	}
	return p.oauth2.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// Exchange exchanges an authorization code for tokens.
func (p *Provider) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	if p.provider == nil {
		return nil, fmt.Errorf("OIDC not configured (development mode)")
	}
	return p.oauth2.Exchange(ctx, code)
}

// IsDevMode returns true if running in development mode without OIDC.
func (p *Provider) IsDevMode() bool {
	return p.config.SkipValidation
}
