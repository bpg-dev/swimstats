package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/comparison"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// ComparisonHandler handles comparison API requests.
type ComparisonHandler struct {
	comparisonService *comparison.ComparisonService
	swimmerService    *swimmer.Service
	logger            *slog.Logger
}

// NewComparisonHandler creates a new comparison handler.
func NewComparisonHandler(comparisonService *comparison.ComparisonService, swimmerService *swimmer.Service, logger *slog.Logger) *ComparisonHandler {
	return &ComparisonHandler{
		comparisonService: comparisonService,
		swimmerService:    swimmerService,
		logger:            logger,
	}
}

// GetComparison handles GET /comparisons requests.
// Query parameters:
//   - standard_id (required): UUID of the time standard to compare against
//   - course_type (optional): "25m" or "50m", defaults to "25m"
//   - threshold (optional): "almost there" threshold percentage, defaults to 3.0
func (h *ComparisonHandler) GetComparison(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get standard_id parameter (required)
	standardIDStr := r.URL.Query().Get("standard_id")
	if standardIDStr == "" {
		middleware.WriteError(w, http.StatusBadRequest, "standard_id is required", "INVALID_INPUT")
		return
	}

	standardID, err := uuid.Parse(standardIDStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid standard_id", "INVALID_INPUT")
		return
	}

	// Get course_type parameter (optional, defaults to "25m")
	courseType := r.URL.Query().Get("course_type")
	if courseType == "" {
		courseType = "25m"
	}
	if courseType != "25m" && courseType != "50m" {
		middleware.WriteError(w, http.StatusBadRequest, "course_type must be '25m' or '50m'", "INVALID_INPUT")
		return
	}

	// Get threshold parameter (optional)
	var threshold *float64
	if thresholdStr := r.URL.Query().Get("threshold"); thresholdStr != "" {
		t, err := strconv.ParseFloat(thresholdStr, 64)
		if err != nil || t < 0 || t > 100 {
			middleware.WriteError(w, http.StatusBadRequest, "threshold must be a number between 0 and 100", "INVALID_INPUT")
			return
		}
		threshold = &t
	}

	// Get swimmer profile
	swimmerProfile, err := h.swimmerService.Get(ctx)
	if err != nil {
		if err == postgres.ErrNotFound {
			middleware.WriteError(w, http.StatusNotFound, "swimmer profile not found - please set up your profile first", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get swimmer profile")
		return
	}

	// Use swimmer's configured threshold if no explicit threshold provided
	if threshold == nil {
		threshold = &swimmerProfile.ThresholdPercent
	}

	// Perform comparison
	result, err := h.comparisonService.Compare(ctx, swimmerProfile.ID, standardID, courseType, threshold)
	if err != nil {
		if err == postgres.ErrNotFound {
			middleware.WriteError(w, http.StatusNotFound, "standard not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to compare times")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, result)
}
