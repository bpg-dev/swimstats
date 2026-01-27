package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	timeservice "github.com/bpg/swimstats/backend/internal/domain/time"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// isDuplicateEventInBatchError checks if the error is about duplicate events in a batch.
func isDuplicateEventInBatchError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "duplicate event in batch")
}

// TimeHandler handles time API requests.
type TimeHandler struct {
	timeService    *timeservice.Service
	swimmerService *swimmer.Service
	logger         *slog.Logger
}

// NewTimeHandler creates a new time handler.
func NewTimeHandler(timeService *timeservice.Service, swimmerService *swimmer.Service, logger *slog.Logger) *TimeHandler {
	return &TimeHandler{
		timeService:    timeService,
		swimmerService: swimmerService,
		logger:         logger,
	}
}

// ListTimes handles GET /times requests.
func (h *TimeHandler) ListTimes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sw, err := h.swimmerService.Get(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "swimmer profile not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get swimmer")
		return
	}

	// Parse query parameters
	params := timeservice.ListParams{
		SwimmerID: sw.ID,
	}

	if courseType := r.URL.Query().Get("course_type"); courseType != "" {
		params.CourseType = &courseType
	}

	if event := r.URL.Query().Get("event"); event != "" {
		params.Event = &event
	}

	if meetIDStr := r.URL.Query().Get("meet_id"); meetIDStr != "" {
		if meetID, err := uuid.Parse(meetIDStr); err == nil {
			params.MeetID = &meetID
		}
	}

	if limit := r.URL.Query().Get("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil {
			params.Limit = l
		}
	}

	if offset := r.URL.Query().Get("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil {
			params.Offset = o
		}
	}

	list, err := h.timeService.List(ctx, params)
	if err != nil {
		middleware.WriteInternalError(w, h.logger, err, "failed to list times")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, list)
}

// GetTime handles GET /times/{id} requests.
func (h *TimeHandler) GetTime(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid time ID", "INVALID_INPUT")
		return
	}

	t, err := h.timeService.Get(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "time not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get time")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, t)
}

// CreateTime handles POST /times requests.
func (h *TimeHandler) CreateTime(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	sw, err := h.swimmerService.Get(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusBadRequest, "swimmer profile required", "PRECONDITION_FAILED")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get swimmer")
		return
	}

	var input timeservice.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	t, err := h.timeService.Create(ctx, sw.ID, input)
	if err != nil {
		if errors.Is(err, postgres.ErrDuplicateEvent) {
			middleware.WriteError(w, http.StatusConflict, "event already exists for this meet", "DUPLICATE_EVENT")
			return
		}
		if isValidationError(err) || errors.Is(err, errors.New("meet not found")) {
			status := http.StatusBadRequest
			if errors.Is(err, errors.New("meet not found")) {
				status = http.StatusNotFound
			}
			middleware.WriteError(w, status, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to create time")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, t)
}

// CreateBatchTimes handles POST /times/batch requests.
func (h *TimeHandler) CreateBatchTimes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	sw, err := h.swimmerService.Get(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusBadRequest, "swimmer profile required", "PRECONDITION_FAILED")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get swimmer")
		return
	}

	var input timeservice.BatchInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	result, err := h.timeService.CreateBatch(ctx, sw.ID, input)
	if err != nil {
		if errors.Is(err, postgres.ErrDuplicateEvent) {
			middleware.WriteError(w, http.StatusConflict, err.Error(), "DUPLICATE_EVENT")
			return
		}
		if isDuplicateEventInBatchError(err) || isValidationError(err) || errors.Is(err, errors.New("meet not found")) {
			status := http.StatusBadRequest
			if errors.Is(err, errors.New("meet not found")) {
				status = http.StatusNotFound
			}
			middleware.WriteError(w, status, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to create times")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, result)
}

// UpdateTime handles PUT /times/{id} requests.
func (h *TimeHandler) UpdateTime(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid time ID", "INVALID_INPUT")
		return
	}

	var input timeservice.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	t, err := h.timeService.Update(ctx, id, input)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "time not found", "NOT_FOUND")
			return
		}
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to update time")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, t)
}

// DeleteTime handles DELETE /times/{id} requests.
func (h *TimeHandler) DeleteTime(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid time ID", "INVALID_INPUT")
		return
	}

	err = h.timeService.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "time not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to delete time")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
