package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/bpg/swimstats/backend/internal/domain/exporter"
)

// ExportHandler handles data export operations.
type ExportHandler struct {
	service *exporter.Service
	logger  *slog.Logger
}

// NewExportHandler creates a new export handler.
func NewExportHandler(service *exporter.Service, logger *slog.Logger) *ExportHandler {
	return &ExportHandler{
		service: service,
		logger:  logger,
	}
}

// ExportAllData handles GET /api/v1/data/export
// Exports all swimmer data including meets, times, and custom standards to JSON.
func (h *ExportHandler) ExportAllData(w http.ResponseWriter, r *http.Request) {
	exportData, err := h.service.ExportAll(r.Context())
	if err != nil {
		h.logger.Error("Failed to export data", "error", err)
		http.Error(w, "Failed to export data", http.StatusInternalServerError)
		return
	}

	h.logger.Info("Data export successful",
		"meets_count", len(exportData.Meets),
		"custom_standards_count", len(exportData.Standards),
		"swimmer", exportData.Swimmer.Name)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", "attachment; filename=\"swimstats-export.json\"")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(exportData)
}
