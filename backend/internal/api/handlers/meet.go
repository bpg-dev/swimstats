package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/meet"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// MeetHandler handles meet API requests.
type MeetHandler struct {
	service *meet.Service
	logger  *slog.Logger
}

// NewMeetHandler creates a new meet handler.
func NewMeetHandler(service *meet.Service, logger *slog.Logger) *MeetHandler {
	return &MeetHandler{service: service, logger: logger}
}

// ListMeets handles GET /meets requests.
func (h *MeetHandler) ListMeets(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	params := meet.ListParams{}

	if courseType := r.URL.Query().Get("course_type"); courseType != "" {
		params.CourseType = &courseType
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

	list, err := h.service.List(ctx, params)
	if err != nil {
		middleware.WriteInternalError(w, h.logger, err, "failed to list meets")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, list)
}

// GetMeet handles GET /meets/{id} requests.
func (h *MeetHandler) GetMeet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid meet ID", "INVALID_INPUT")
		return
	}

	m, err := h.service.Get(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "meet not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get meet")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, m)
}

// CreateMeet handles POST /meets requests.
func (h *MeetHandler) CreateMeet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	var input meet.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	m, err := h.service.Create(ctx, input)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to create meet")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, m)
}

// UpdateMeet handles PUT /meets/{id} requests.
func (h *MeetHandler) UpdateMeet(w http.ResponseWriter, r *http.Request) {
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
		middleware.WriteError(w, http.StatusBadRequest, "invalid meet ID", "INVALID_INPUT")
		return
	}

	var input meet.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	m, err := h.service.Update(ctx, id, input)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "meet not found", "NOT_FOUND")
			return
		}
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to update meet")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, m)
}

// DeleteMeet handles DELETE /meets/{id} requests.
func (h *MeetHandler) DeleteMeet(w http.ResponseWriter, r *http.Request) {
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
		middleware.WriteError(w, http.StatusBadRequest, "invalid meet ID", "INVALID_INPUT")
		return
	}

	err = h.service.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "meet not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to delete meet")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
