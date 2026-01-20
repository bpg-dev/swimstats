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

// ImportSwimmerData handles POST /api/v1/data/import
// Imports a complete swimmer dataset from JSON.
func (h *ImportHandler) ImportSwimmerData(w http.ResponseWriter, r *http.Request) {
	var importData importer.SwimmerImport

	if err := json.NewDecoder(r.Body).Decode(&importData); err != nil {
		h.logger.Error("Failed to decode import data", "error", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	result, err := h.service.ImportSwimmerData(r.Context(), &importData)
	if err != nil && !result.Success {
		h.logger.Error("Import failed completely", "error", err, "errors", result.Errors)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(result)
		return
	}

	if len(result.Errors) > 0 {
		h.logger.Warn("Import completed with errors",
			"meets_created", result.MeetsCreated,
			"times_created", result.TimesCreated,
			"errors", result.Errors)
	} else {
		h.logger.Info("Import successful",
			"swimmer_id", result.SwimmerID,
			"meets_created", result.MeetsCreated,
			"times_created", result.TimesCreated,
			"skipped_times", result.SkippedTimes)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
