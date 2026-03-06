// Package comparison provides personal best and comparison domain logic.
package comparison

import (
	"context"
	"fmt"
	"sort"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// PersonalBestService provides personal best business logic.
type PersonalBestService struct {
	timeRepo *postgres.TimeRepository
}

// NewPersonalBestService creates a new personal best service.
func NewPersonalBestService(timeRepo *postgres.TimeRepository) *PersonalBestService {
	return &PersonalBestService{
		timeRepo: timeRepo,
	}
}

// PersonalBest represents a personal best time.
type PersonalBest struct {
	Event         string `json:"event"`
	TimeMS        int    `json:"time_ms"`
	TimeFormatted string `json:"time_formatted"`
	TimeID        string `json:"time_id"`
	MeetName      string `json:"meet"`
	Date          string `json:"date"`
	IsFromSplit   bool   `json:"is_from_split"`
}

// PersonalBestList represents a list of personal bests.
type PersonalBestList struct {
	CourseType    string         `json:"course_type"`
	PersonalBests []PersonalBest `json:"personal_bests"`
}

// GetPersonalBests retrieves all personal bests for a swimmer in a course type.
func (s *PersonalBestService) GetPersonalBests(ctx context.Context, swimmerID uuid.UUID, courseType string) (*PersonalBestList, error) {
	// Validate course type
	if !domain.CourseType(courseType).IsValid() {
		return nil, fmt.Errorf("invalid course type: %s", courseType)
	}

	rows, err := s.timeRepo.GetPersonalBests(ctx, swimmerID, courseType)
	if err != nil {
		return nil, fmt.Errorf("get personal bests: %w", err)
	}

	pbs := make([]PersonalBest, len(rows))
	for i, row := range rows {
		date := ""
		if row.MeetDate.Valid {
			date = row.MeetDate.Time.Format("2006-01-02")
		}

		pbs[i] = PersonalBest{
			Event:         row.Event,
			TimeMS:        int(row.TimeMs),
			TimeFormatted: domain.FormatTime(int(row.TimeMs)),
			TimeID:        row.ID.String(),
			MeetName:      row.MeetName,
			Date:          date,
		}
	}

	// Merge split PBs into base event PBs (keep the faster time)
	pbMap := make(map[string]*PersonalBest)
	for i := range pbs {
		baseEvent := string(domain.EventCode(pbs[i].Event).BaseEvent())
		existing, exists := pbMap[baseEvent]
		if !exists {
			pb := pbs[i]
			pb.IsFromSplit = domain.EventCode(pbs[i].Event).IsSplit()
			pb.Event = baseEvent
			pbMap[baseEvent] = &pb
		} else if pbs[i].TimeMS < existing.TimeMS {
			// Keep the faster time
			pb := pbs[i]
			pb.IsFromSplit = domain.EventCode(pbs[i].Event).IsSplit()
			pb.Event = baseEvent
			pbMap[baseEvent] = &pb
		}
	}

	// Rebuild the slice from the map
	merged := make([]PersonalBest, 0, len(pbMap))
	for _, pb := range pbMap {
		merged = append(merged, *pb)
	}
	// Sort by event code for consistent ordering
	sort.Slice(merged, func(i, j int) bool {
		return merged[i].Event < merged[j].Event
	})

	return &PersonalBestList{
		CourseType:    courseType,
		PersonalBests: merged,
	}, nil
}

// GetPersonalBestsByStroke returns personal bests organized by stroke.
func (s *PersonalBestService) GetPersonalBestsByStroke(ctx context.Context, swimmerID uuid.UUID, courseType string) (map[string][]PersonalBest, error) {
	list, err := s.GetPersonalBests(ctx, swimmerID, courseType)
	if err != nil {
		return nil, err
	}

	// Group by stroke
	byStroke := make(map[string][]PersonalBest)
	for _, pb := range list.PersonalBests {
		stroke := domain.EventCode(pb.Event).Stroke()
		byStroke[stroke] = append(byStroke[stroke], pb)
	}

	return byStroke, nil
}

// IsPersonalBest checks if a given time would be a new personal best.
func (s *PersonalBestService) IsPersonalBest(ctx context.Context, swimmerID uuid.UUID, courseType, event string, timeMS int, excludeTimeID *uuid.UUID) (bool, error) {
	return s.timeRepo.IsPersonalBest(ctx, swimmerID, courseType, event, int32(timeMS), excludeTimeID)
}
