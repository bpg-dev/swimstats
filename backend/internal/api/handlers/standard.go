package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/api/middleware"
	"github.com/bpg/swimstats/backend/internal/domain/standard"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// StandardHandler handles standard API requests.
type StandardHandler struct {
	service *standard.Service
	logger  *slog.Logger
}

// NewStandardHandler creates a new standard handler.
func NewStandardHandler(service *standard.Service, logger *slog.Logger) *StandardHandler {
	return &StandardHandler{service: service, logger: logger}
}

// ListStandards handles GET /standards requests.
func (h *StandardHandler) ListStandards(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	params := standard.ListParams{}

	if courseType := r.URL.Query().Get("course_type"); courseType != "" {
		params.CourseType = &courseType
	}

	if gender := r.URL.Query().Get("gender"); gender != "" {
		params.Gender = &gender
	}

	list, err := h.service.List(ctx, params)
	if err != nil {
		middleware.WriteInternalError(w, h.logger, err, "failed to list standards")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, list)
}

// GetStandard handles GET /standards/{id} requests.
func (h *StandardHandler) GetStandard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid standard ID", "INVALID_INPUT")
		return
	}

	std, err := h.service.GetWithTimes(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "standard not found", "NOT_FOUND")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to get standard")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, std)
}

// CreateStandard handles POST /standards requests.
func (h *StandardHandler) CreateStandard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	var input standard.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	std, err := h.service.Create(ctx, input)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to create standard")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, std)
}

// UpdateStandard handles PUT /standards/{id} requests.
func (h *StandardHandler) UpdateStandard(w http.ResponseWriter, r *http.Request) {
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
		middleware.WriteError(w, http.StatusBadRequest, "invalid standard ID", "INVALID_INPUT")
		return
	}

	var input standard.Input
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	std, err := h.service.Update(ctx, id, input)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "standard not found", "NOT_FOUND")
			return
		}
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to update standard")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, std)
}

// DeleteStandard handles DELETE /standards/{id} requests.
func (h *StandardHandler) DeleteStandard(w http.ResponseWriter, r *http.Request) {
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
		middleware.WriteError(w, http.StatusBadRequest, "invalid standard ID", "INVALID_INPUT")
		return
	}

	err = h.service.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "standard not found", "NOT_FOUND")
			return
		}
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to delete standard")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SetStandardTimes handles PUT /standards/{id}/times requests.
func (h *StandardHandler) SetStandardTimes(w http.ResponseWriter, r *http.Request) {
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
		middleware.WriteError(w, http.StatusBadRequest, "invalid standard ID", "INVALID_INPUT")
		return
	}

	var body struct {
		Times []standard.StandardTimeInput `json:"times"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	std, err := h.service.SetTimes(ctx, id, body.Times)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			middleware.WriteError(w, http.StatusNotFound, "standard not found", "NOT_FOUND")
			return
		}
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to set standard times")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, std)
}

// ImportStandard handles POST /standards/import requests.
func (h *StandardHandler) ImportStandard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	var input standard.ImportInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid request body", "INVALID_INPUT")
		return
	}

	std, err := h.service.Import(ctx, input)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to import standard")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, std)
}

// ImportStandardsFromJSON handles POST /standards/import/json requests.
// This endpoint accepts the JSON file format with multiple standards.
func (h *StandardHandler) ImportStandardsFromJSON(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Check write access
	user := middleware.GetUser(ctx)
	if user != nil && !user.AccessLevel.CanWrite() {
		middleware.WriteError(w, http.StatusForbidden, "write access required", "FORBIDDEN")
		return
	}

	var input standard.JSONFileInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "invalid JSON file format", "INVALID_INPUT")
		return
	}

	result, err := h.service.ImportFromJSON(ctx, input)
	if err != nil {
		if isValidationError(err) {
			middleware.WriteError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
			return
		}
		middleware.WriteInternalError(w, h.logger, err, "failed to import standards")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, result)
}
