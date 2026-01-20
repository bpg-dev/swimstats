package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/bpg/swimstats/backend/internal/domain/importer"
)

// ImportHandler handles data import operations.
type ImportHandler struct {
	service *importer.Service
	logger  *slog.Logger
}

// NewImportHandler creates a new import handler.
func NewImportHandler(service *importer.Service, logger *slog.Logger) *ImportHandler {
	return &ImportHandler{
		service: service,
		logger:  logger,
	}
}

// PreviewImport handles POST /api/v1/data/import/preview
// Analyzes import data and returns what will be deleted/replaced.
func (h *ImportHandler) PreviewImport(w http.ResponseWriter, r *http.Request) {
	var importData importer.ImportData

	if err := json.NewDecoder(r.Body).Decode(&importData); err != nil {
		h.logger.Error("Failed to decode import data", "error", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	preview, err := h.service.Preview(r.Context(), &importData)
	if err != nil {
		h.logger.Error("Failed to preview import", "error", err)
		http.Error(w, "Failed to analyze import data", http.StatusInternalServerError)
		return
	}

	h.logger.Info("Import preview generated",
		"will_replace_swimmer", preview.WillReplaceSwimmer,
		"current_meets", preview.CurrentMeetsCount,
		"new_meets", preview.NewMeetsCount,
		"current_standards", preview.CurrentStandardsCount,
		"new_standards", preview.NewStandardsCount)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(preview); err != nil {
		h.logger.Error("Failed to encode preview response", "error", err)
	}
}

// ImportSwimmerData handles POST /api/v1/data/import
// Imports a complete swimmer dataset from JSON.
// Requires confirmed=true in the request after previewing.
func (h *ImportHandler) ImportSwimmerData(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Data      importer.ImportData `json:"data"`
		Confirmed bool                `json:"confirmed"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode import request", "error", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Require confirmation for destructive operations
	if !req.Confirmed {
		// Check if any sections are present that would require confirmation
		if req.Data.Swimmer != nil || len(req.Data.Meets) > 0 || len(req.Data.Standards) > 0 {
			http.Error(w, "Import requires confirmation. Set 'confirmed: true' after previewing.", http.StatusBadRequest)
			return
		}
	}

	result, err := h.service.ImportSwimmerData(r.Context(), &req.Data)
	if err != nil && !result.Success {
		h.logger.Error("Import failed completely", "error", err, "errors", result.Errors)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		if encErr := json.NewEncoder(w).Encode(result); encErr != nil {
			h.logger.Error("Failed to encode error response", "error", encErr)
		}
		return
	}

	if len(result.Errors) > 0 {
		h.logger.Warn("Import completed with errors",
			"meets_created", result.MeetsCreated,
			"times_created", result.TimesCreated,
			"standards_created", result.StandardsCreated,
			"errors", result.Errors)
	} else {
		h.logger.Info("Import successful",
			"swimmer_id", result.SwimmerID,
			"swimmer_replaced", result.SwimmerReplaced,
			"meets_deleted", result.MeetsDeleted,
			"meets_created", result.MeetsCreated,
			"times_created", result.TimesCreated,
			"standards_deleted", result.StandardsDeleted,
			"standards_created", result.StandardsCreated,
			"skipped_times", result.SkippedTimes)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(result); err != nil {
		h.logger.Error("Failed to encode import result", "error", err)
	}
}
