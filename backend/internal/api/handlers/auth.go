package handlers

import (
	"net/http"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/auth"
)

// CurrentUserResponse represents the GET /auth/me response.
type CurrentUserResponse struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Name        string `json:"name,omitempty"`
	AccessLevel string `json:"access_level"`
}

// AuthHandler handles authentication-related requests.
type AuthHandler struct {
	provider *auth.Provider
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(provider *auth.Provider) *AuthHandler {
	return &AuthHandler{provider: provider}
}

// GetCurrentUser handles GET /auth/me - returns current user info.
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		middleware.WriteError(w, http.StatusUnauthorized, "authentication required", "UNAUTHORIZED")
		return
	}

	resp := CurrentUserResponse{
		ID:          user.ID,
		Email:       user.Email,
		Name:        user.Name,
		AccessLevel: string(user.AccessLevel),
	}

	middleware.WriteJSON(w, http.StatusOK, resp)
}
