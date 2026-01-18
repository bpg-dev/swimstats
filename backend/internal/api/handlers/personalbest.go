package handlers

import (
	"errors"
	"net/http"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/comparison"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// PersonalBestHandler handles personal best API requests.
type PersonalBestHandler struct {
	pbService      *comparison.PersonalBestService
	swimmerService *swimmer.Service
}

// NewPersonalBestHandler creates a new personal best handler.
func NewPersonalBestHandler(pbService *comparison.PersonalBestService, swimmerService *swimmer.Service) *PersonalBestHandler {
	return &PersonalBestHandler{
		pbService:      pbService,
		swimmerService: swimmerService,
	}
}

// GetPersonalBests handles GET /personal-bests requests.
func (h *PersonalBestHandler) GetPersonalBests(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get swimmer profile
	sw, err := h.swimmerService.Get(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "swimmer profile not found", "NOT_FOUND")
			return
		}
		middleware.WriteError(w, http.StatusInternalServerError, "failed to get swimmer", "INTERNAL_ERROR")
		return
	}

	// Get course_type from query (required)
	courseType := r.URL.Query().Get("course_type")
	if courseType == "" {
		middleware.WriteError(w, http.StatusBadRequest, "course_type is required", "VALIDATION_ERROR")
		return
	}

	pbs, err := h.pbService.GetPersonalBests(ctx, sw.ID, courseType)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteError(w, http.StatusInternalServerError, "failed to get personal bests", "INTERNAL_ERROR")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, pbs)
}
