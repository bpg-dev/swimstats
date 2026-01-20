package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/comparison"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// ProgressHandler handles progress chart API requests.
type ProgressHandler struct {
	progressService *comparison.ProgressService
	swimmerService  *swimmer.Service
}

// NewProgressHandler creates a new progress handler.
func NewProgressHandler(progressService *comparison.ProgressService, swimmerService *swimmer.Service) *ProgressHandler {
	return &ProgressHandler{
		progressService: progressService,
		swimmerService:  swimmerService,
	}
}

// GetProgressData handles GET /progress/{event} requests.
func (h *ProgressHandler) GetProgressData(w http.ResponseWriter, r *http.Request) {
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

	// Get event from URL path
	event := chi.URLParam(r, "event")
	if event == "" {
		middleware.WriteError(w, http.StatusBadRequest, "event is required", "VALIDATION_ERROR")
		return
	}

	// Get course_type from query (required)
	courseType := r.URL.Query().Get("course_type")
	if courseType == "" {
		middleware.WriteError(w, http.StatusBadRequest, "course_type is required", "VALIDATION_ERROR")
		return
	}

	// Get optional date range filters
	var startDate, endDate *time.Time
	if startStr := r.URL.Query().Get("start_date"); startStr != "" {
		parsed, err := time.Parse("2006-01-02", startStr)
		if err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid start_date format (expected YYYY-MM-DD)", "VALIDATION_ERROR")
			return
		}
		startDate = &parsed
	}
	if endStr := r.URL.Query().Get("end_date"); endStr != "" {
		parsed, err := time.Parse("2006-01-02", endStr)
		if err != nil {
			middleware.WriteError(w, http.StatusBadRequest, "invalid end_date format (expected YYYY-MM-DD)", "VALIDATION_ERROR")
			return
		}
		endDate = &parsed
	}

	progressData, err := h.progressService.GetProgressData(ctx, sw.ID, courseType, event, startDate, endDate)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteError(w, http.StatusInternalServerError, "failed to get progress data", "INTERNAL_ERROR")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, progressData)
}
