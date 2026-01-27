package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// SwimmerHandler handles swimmer API requests.
type SwimmerHandler struct {
	service *swimmer.Service
	logger  *slog.Logger
}

// NewSwimmerHandler creates a new swimmer handler.
func NewSwimmerHandler(service *swimmer.Service, logger *slog.Logger) *SwimmerHandler {
	return &SwimmerHandler{service: service, logger: logger}
}

// GetSwimmer handles GET /swimmer requests.
func (h *SwimmerHandler) GetSwimmer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sw, err := h.service.Get(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "swimmer profile not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get swimmer")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, sw)
}

// PutSwimmer handles PUT /swimmer requests (create or update).
func (h *SwimmerHandler) PutSwimmer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	var input swimmer.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	sw, created, err := h.service.CreateOrUpdate(ctx, input)
	if err != nil {
		// Check if validation error
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to save swimmer")
		return
	}

	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}

	middleware.WriteJSON(w, status, sw)
}

func isValidationError(err error) bool {
	return err != nil && (errors.Is(err, errors.New("validation")) ||
		len(err.Error()) > 0 && err.Error()[:10] == "validation")
}
