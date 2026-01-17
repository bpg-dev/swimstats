package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/bpg/swimstats/backend/internal/auth"
)

// contextKey is the type for context keys in this package.
type contextKey string

const (
	// UserContextKey is the context key for the authenticated user.
	UserContextKey contextKey = "user"
)

// AuthMiddleware creates middleware that validates authentication tokens.
func AuthMiddleware(provider *auth.Provider, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var token string

			// Check Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}

			// In dev mode, also check X-Mock-User header
			if token == "" && provider.IsDevMode() {
				mockUser := r.Header.Get("X-Mock-User")
				if mockUser != "" {
					token = mockUser
				}
			}

			// No token provided
			if token == "" {
				WriteError(w, http.StatusUnauthorized, "authentication required", "UNAUTHORIZED")
				return
			}

			// Verify token
			user, err := provider.VerifyToken(r.Context(), token)
			if err != nil {
				logger.Warn("token verification failed", "error", err)
				WriteError(w, http.StatusUnauthorized, "invalid token", "INVALID_TOKEN")
				return
			}

			// Add user to context
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireWriteAccess creates middleware that requires full access level.
func RequireWriteAccess(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := GetUser(r.Context())
			if user == nil {
				WriteError(w, http.StatusUnauthorized, "authentication required", "UNAUTHORIZED")
				return
			}

			if !user.AccessLevel.CanWrite() {
				logger.Warn("write access denied",
					"user_id", user.ID,
					"access_level", user.AccessLevel,
					"path", r.URL.Path,
					"method", r.Method,
				)
				WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetUser returns the authenticated user from the context.
func GetUser(ctx context.Context) *auth.User {
	user, ok := ctx.Value(UserContextKey).(*auth.User)
	if !ok {
		return nil
	}
	return user
}

// OptionalAuth creates middleware that attempts to authenticate but doesn't require it.
// Useful for endpoints that behave differently for authenticated vs anonymous users.
func OptionalAuth(provider *auth.Provider, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var token string

			// Check Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}

			// In dev mode, also check X-Mock-User header
			if token == "" && provider.IsDevMode() {
				mockUser := r.Header.Get("X-Mock-User")
				if mockUser != "" {
					token = mockUser
				}
			}

			// If we have a token, try to verify it
			if token != "" {
				user, err := provider.VerifyToken(r.Context(), token)
				if err == nil {
					ctx := context.WithValue(r.Context(), UserContextKey, user)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
				// Token invalid, but optional - continue without user
				logger.Debug("optional auth token invalid", "error", err)
			}

			next.ServeHTTP(w, r)
		})
	}
}
