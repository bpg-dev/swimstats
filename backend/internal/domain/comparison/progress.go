package comparison

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// ProgressService provides time progression business logic.
type ProgressService struct {
	timeRepo *postgres.TimeRepository
}

// NewProgressService creates a new progress service.
func NewProgressService(timeRepo *postgres.TimeRepository) *ProgressService {
	return &ProgressService{
		timeRepo: timeRepo,
	}
}

// ProgressDataPoint represents a single data point for progress visualization.
type ProgressDataPoint struct {
	ID             string `json:"id"`
	TimeMS         int    `json:"time_ms"`
	TimeFormatted  string `json:"time_formatted"`
	Date           string `json:"date"`
	MeetName       string `json:"meet_name"`
	Event          string `json:"event"`
	IsPersonalBest bool   `json:"is_pb"`
}

// ProgressData represents the complete progress data for an event.
type ProgressData struct {
	SwimmerID  string              `json:"swimmer_id"`
	Event      string              `json:"event"`
	CourseType string              `json:"course_type"`
	StartDate  *string             `json:"start_date,omitempty"`
	EndDate    *string             `json:"end_date,omitempty"`
	DataPoints []ProgressDataPoint `json:"data_points"`
}

// GetProgressData retrieves time progression data for visualization.
func (s *ProgressService) GetProgressData(
	ctx context.Context,
	swimmerID uuid.UUID,
	courseType string,
	event string,
	startDate *time.Time,
	endDate *time.Time,
) (*ProgressData, error) {
	// Validate inputs
	if !domain.CourseType(courseType).IsValid() {
		return nil, fmt.Errorf("invalid course type: %s", courseType)
	}
	if !domain.EventCode(event).IsValid() {
		return nil, fmt.Errorf("invalid event: %s", event)
	}

	// Query progress data
	rows, err := s.timeRepo.GetProgressData(ctx, swimmerID, courseType, event, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("get progress data: %w", err)
	}

	// Convert to domain objects
	dataPoints := make([]ProgressDataPoint, len(rows))
	for i, row := range rows {
		date := ""
		if row.Date.Valid {
			date = row.Date.Time.Format("2006-01-02")
		}

		dataPoints[i] = ProgressDataPoint{
			ID:             row.ID.String(),
			TimeMS:         int(row.TimeMs),
			TimeFormatted:  domain.FormatTime(int(row.TimeMs)),
			Date:           date,
			MeetName:       row.MeetName,
			Event:          row.Event,
			IsPersonalBest: row.IsPb,
		}
	}

	// Build result
	result := &ProgressData{
		SwimmerID:  swimmerID.String(),
		Event:      event,
		CourseType: courseType,
		DataPoints: dataPoints,
	}

	if startDate != nil {
		start := startDate.Format("2006-01-02")
		result.StartDate = &start
	}
	if endDate != nil {
		end := endDate.Format("2006-01-02")
		result.EndDate = &end
	}

	return result, nil
}
