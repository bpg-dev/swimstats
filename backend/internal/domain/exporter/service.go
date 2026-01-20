package exporter

import (
	"context"
	"fmt"
	"sort"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/domain/meet"
	"github.com/bpg/swimstats/backend/internal/domain/standard"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	timeservice "github.com/bpg/swimstats/backend/internal/domain/time"
)

// Service handles exporting swimmer data to JSON format.
type Service struct {
	swimmerService  *swimmer.Service
	meetService     *meet.Service
	timeService     *timeservice.Service
	standardService *standard.Service
}

// NewService creates a new exporter service.
func NewService(
	swimmerService *swimmer.Service,
	meetService *meet.Service,
	timeService *timeservice.Service,
	standardService *standard.Service,
) *Service {
	return &Service{
		swimmerService:  swimmerService,
		meetService:     meetService,
		timeService:     timeService,
		standardService: standardService,
	}
}

// ExportAll exports all user data including swimmer profile, meets, times, and custom standards.
func (s *Service) ExportAll(ctx context.Context) (*ExportData, error) {
	export := &ExportData{
		Meets:     []MeetExport{},
		Standards: []StandardExport{},
	}

	// 1. Export swimmer
	swimmerData, err := s.swimmerService.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get swimmer: %w", err)
	}

	export.Swimmer = SwimmerExport{
		Name:      swimmerData.Name,
		BirthDate: swimmerData.BirthDate,
		Gender:    swimmerData.Gender,
	}

	// 2. Export meets with times
	// Use a large limit to get all meets
	meetList, err := s.meetService.List(ctx, meet.ListParams{
		CourseType: nil, // Get all course types
		Limit:      10000, // Large limit to get all meets
		Offset:     0,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list meets: %w", err)
	}

	meets := meetList.Meets

	// Sort meets by start date (oldest first for chronological export)
	// Dates are already strings in YYYY-MM-DD format, so lexicographic sort works
	sort.Slice(meets, func(i, j int) bool {
		return meets[i].StartDate < meets[j].StartDate
	})

	for _, m := range meets {
		meetExport := MeetExport{
			Name:       m.Name,
			City:       m.City,
			Country:    m.Country,
			StartDate:  m.StartDate,
			EndDate:    m.EndDate,
			CourseType: m.CourseType,
			Times:      []TimeExport{},
		}

		// Get times for this meet
		meetID := m.ID
		timeList, err := s.timeService.List(ctx, timeservice.ListParams{
			SwimmerID:  swimmerData.ID,
			MeetID:     &meetID,
			CourseType: nil,
			Event:      nil,
			Limit:      10000, // Large limit to get all times
			Offset:     0,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to get times for meet %s: %w", m.Name, err)
		}

		times := timeList.Times

		// Sort times by event date
		sort.Slice(times, func(i, j int) bool {
			return times[i].EventDate < times[j].EventDate
		})

		for _, t := range times {
			timeExport := TimeExport{
				Event:     t.Event,
				Time:      domain.FormatTime(t.TimeMS),
				EventDate: t.EventDate,
				Notes:     t.Notes,
			}
			meetExport.Times = append(meetExport.Times, timeExport)
		}

		export.Meets = append(export.Meets, meetExport)
	}

	// 3. Export custom standards (exclude preloaded ones)
	standardList, err := s.standardService.List(ctx, standard.ListParams{
		CourseType: nil,
		Gender:     nil,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list standards: %w", err)
	}

	// Filter to custom standards only
	for _, std := range standardList.Standards {
		if std.IsPreloaded {
			continue // Skip preloaded standards
		}

		standardExport := StandardExport{
			Name:        std.Name,
			Description: std.Description,
			Season:      "", // Custom standards don't have a season
			CourseType:  std.CourseType,
			Gender:      std.Gender,
			Times:       make(map[string][]string),
		}

		// Get all standard times for this standard
		standardWithTimes, err := s.standardService.GetWithTimes(ctx, std.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get times for standard %s: %w", std.Name, err)
		}

		// Group times by event
		for _, st := range standardWithTimes.Times {
			timeStr := fmt.Sprintf("%s:%s", st.AgeGroup, st.TimeFormatted)
			standardExport.Times[st.Event] = append(standardExport.Times[st.Event], timeStr)
		}

		export.Standards = append(export.Standards, standardExport)
	}

	return export, nil
}
