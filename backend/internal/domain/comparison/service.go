package comparison

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/store/db"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// ComparisonService provides time comparison business logic.
type ComparisonService struct {
	timeRepo     *postgres.TimeRepository
	standardRepo *postgres.StandardRepository
	swimmerRepo  *postgres.SwimmerRepository
}

// NewComparisonService creates a new comparison service.
func NewComparisonService(
	timeRepo *postgres.TimeRepository,
	standardRepo *postgres.StandardRepository,
	swimmerRepo *postgres.SwimmerRepository,
) *ComparisonService {
	return &ComparisonService{
		timeRepo:     timeRepo,
		standardRepo: standardRepo,
		swimmerRepo:  swimmerRepo,
	}
}

// ComparisonStatus represents the status of an event comparison.
type ComparisonStatus string

const (
	StatusAchieved    ComparisonStatus = "achieved"
	StatusAlmost      ComparisonStatus = "almost"
	StatusNotAchieved ComparisonStatus = "not_achieved"
	StatusNoTime      ComparisonStatus = "no_time"
	StatusNoStandard  ComparisonStatus = "no_standard"
)

// EventComparison represents a single event's comparison.
type EventComparison struct {
	Event               string           `json:"event"`
	Status              ComparisonStatus `json:"status"`
	SwimmerTimeMS       *int             `json:"swimmer_time_ms"`
	SwimmerTimeFormatted *string         `json:"swimmer_time_formatted"`
	StandardTimeMS      *int             `json:"standard_time_ms"`
	StandardTimeFormatted *string        `json:"standard_time_formatted"`
	DifferenceMS        *int             `json:"difference_ms"`
	DifferenceFormatted *string          `json:"difference_formatted"`
	DifferencePercent   *float64         `json:"difference_percent"`
	AgeGroup            string           `json:"age_group"`
	MeetName            *string          `json:"meet_name"`
	Date                *string          `json:"date"`

	// Adjacent age groups
	PrevAgeGroup              *string `json:"prev_age_group,omitempty"`
	PrevStandardTimeMS        *int    `json:"prev_standard_time_ms,omitempty"`
	PrevStandardTimeFormatted *string `json:"prev_standard_time_formatted,omitempty"`
	PrevAchieved              bool    `json:"prev_achieved"`

	NextAgeGroup              *string `json:"next_age_group,omitempty"`
	NextStandardTimeMS        *int    `json:"next_standard_time_ms,omitempty"`
	NextStandardTimeFormatted *string `json:"next_standard_time_formatted,omitempty"`
	NextAchieved              bool    `json:"next_achieved"`
}

// ComparisonSummary provides aggregate statistics.
type ComparisonSummary struct {
	TotalEvents int `json:"total_events"`
	Achieved    int `json:"achieved"`
	Almost      int `json:"almost"`
	NotAchieved int `json:"not_achieved"`
	NoTime      int `json:"no_time"`
}

// ComparisonResult represents the full comparison result.
type ComparisonResult struct {
	StandardID       uuid.UUID         `json:"standard_id"`
	StandardName     string            `json:"standard_name"`
	CourseType       string            `json:"course_type"`
	SwimmerName      string            `json:"swimmer_name"`
	SwimmerAgeGroup  string            `json:"swimmer_age_group"`
	ThresholdPercent float64           `json:"threshold_percent"`
	Comparisons      []EventComparison `json:"comparisons"`
	Summary          ComparisonSummary `json:"summary"`
}

// DefaultThresholdPercent is the default "almost there" threshold.
const DefaultThresholdPercent = 3.0

// Compare compares a swimmer's personal bests against a standard.
func (s *ComparisonService) Compare(ctx context.Context, swimmerID, standardID uuid.UUID, courseType string, thresholdPercent *float64) (*ComparisonResult, error) {
	// Get swimmer
	swimmer, err := s.swimmerRepo.Get(ctx, swimmerID)
	if err != nil {
		return nil, fmt.Errorf("get swimmer: %w", err)
	}

	// Get standard
	standard, err := s.standardRepo.Get(ctx, standardID)
	if err != nil {
		return nil, fmt.Errorf("get standard: %w", err)
	}

	// Get standard times
	standardTimes, err := s.standardRepo.ListTimes(ctx, standardID)
	if err != nil {
		return nil, fmt.Errorf("get standard times: %w", err)
	}

	// Build standard times map: event -> age_group -> time_ms
	stdTimesMap := make(map[string]map[string]int32)
	for _, st := range standardTimes {
		if stdTimesMap[st.Event] == nil {
			stdTimesMap[st.Event] = make(map[string]int32)
		}
		stdTimesMap[st.Event][st.AgeGroup] = st.TimeMs
	}

	// Get swimmer's personal bests for this course type
	pbs, err := s.timeRepo.GetPersonalBests(ctx, swimmerID, courseType)
	if err != nil {
		return nil, fmt.Errorf("get personal bests: %w", err)
	}

	// Build PB map: event -> PB row
	pbMap := make(map[string]db.GetPersonalBestsRow)
	for _, pb := range pbs {
		pbMap[pb.Event] = pb
	}

	// Determine threshold
	threshold := DefaultThresholdPercent
	if thresholdPercent != nil {
		threshold = *thresholdPercent
	}

	// Calculate swimmer's current age group for display
	currentAge := domain.AgeAtDate(swimmer.BirthDate.Time, time.Now())
	currentAgeGroup := string(domain.AgeGroupFromAge(currentAge))

	// Build comparisons for all events
	allEvents := domain.ValidEventCodes
	comparisons := make([]EventComparison, 0, len(allEvents))
	summary := ComparisonSummary{}

	for _, event := range allEvents {
		comp := EventComparison{
			Event:    string(event),
			AgeGroup: currentAgeGroup,
		}

		pb, hasPB := pbMap[string(event)]
		
		if hasPB {
			// Determine age group at time of swim for this PB
			ageAtSwim := currentAge
			if pb.MeetDate.Valid {
				ageAtSwim = domain.AgeAtDate(swimmer.BirthDate.Time, pb.MeetDate.Time)
			}
			ageGroupAtSwim := string(domain.AgeGroupFromAge(ageAtSwim))
			comp.AgeGroup = ageGroupAtSwim

			swimmerTime := int(pb.TimeMs)
			swimmerTimeFormatted := domain.FormatTime(swimmerTime)
			comp.SwimmerTimeMS = &swimmerTime
			comp.SwimmerTimeFormatted = &swimmerTimeFormatted

			meetName := pb.MeetName
			comp.MeetName = &meetName

			if pb.MeetDate.Valid {
				date := pb.MeetDate.Time.Format("2006-01-02")
				comp.Date = &date
			}

			// Get standard time for this event and age group
			stdTimeMS, actualAgeGroup, hasStandard := getStandardTime(stdTimesMap, string(event), ageGroupAtSwim)

			if hasStandard {
				// Update the age group to the one actually used (may be OPEN if it fell back)
				comp.AgeGroup = actualAgeGroup

				standardTime := int(stdTimeMS)
				standardTimeFormatted := domain.FormatTime(standardTime)
				comp.StandardTimeMS = &standardTime
				comp.StandardTimeFormatted = &standardTimeFormatted

				// Calculate difference
				diff := swimmerTime - standardTime
				diffFormatted := formatDifference(diff)
				comp.DifferenceMS = &diff
				comp.DifferenceFormatted = &diffFormatted

				// Calculate percentage difference
				diffPercent := float64(diff) / float64(standardTime) * 100
				comp.DifferencePercent = &diffPercent

				// Determine status
				if diff <= 0 {
					comp.Status = StatusAchieved
					summary.Achieved++
				} else if diffPercent <= threshold {
					comp.Status = StatusAlmost
					summary.Almost++
				} else {
					comp.Status = StatusNotAchieved
					summary.NotAchieved++
				}
			} else {
				comp.Status = StatusNoStandard
			}

			// Check previous age group
			prevAG := domain.PreviousAgeGroup(domain.AgeGroup(ageGroupAtSwim))
			if prevAG != "" {
				prevStdTimeMS, hasPrevStandard := getStandardTimeExact(stdTimesMap, string(event), string(prevAG))
				if hasPrevStandard {
					prevAgeGroupStr := string(prevAG)
					prevStandardTime := int(prevStdTimeMS)
					prevStandardTimeFormatted := domain.FormatTime(prevStandardTime)
					comp.PrevAgeGroup = &prevAgeGroupStr
					comp.PrevStandardTimeMS = &prevStandardTime
					comp.PrevStandardTimeFormatted = &prevStandardTimeFormatted
					// Check if swimmer achieved this standard
					comp.PrevAchieved = swimmerTime <= prevStandardTime
				}
			}

			// Check next age group
			nextAG := domain.NextAgeGroup(domain.AgeGroup(ageGroupAtSwim))
			if nextAG != "" {
				nextStdTimeMS, hasNextStandard := getStandardTimeExact(stdTimesMap, string(event), string(nextAG))
				if hasNextStandard {
					nextAgeGroupStr := string(nextAG)
					nextStandardTime := int(nextStdTimeMS)
					nextStandardTimeFormatted := domain.FormatTime(nextStandardTime)
					comp.NextAgeGroup = &nextAgeGroupStr
					comp.NextStandardTimeMS = &nextStandardTime
					comp.NextStandardTimeFormatted = &nextStandardTimeFormatted
					// Check if swimmer achieved this standard
					comp.NextAchieved = swimmerTime <= nextStandardTime
				}
			}
		} else {
			// No PB for this event
			// Still check if standard has a time for current age group
			stdTimeMS, actualAgeGroup, hasStandard := getStandardTime(stdTimesMap, string(event), currentAgeGroup)
			if hasStandard {
				// Update the age group to the one actually used (may be OPEN if it fell back)
				comp.AgeGroup = actualAgeGroup

				standardTime := int(stdTimeMS)
				standardTimeFormatted := domain.FormatTime(standardTime)
				comp.StandardTimeMS = &standardTime
				comp.StandardTimeFormatted = &standardTimeFormatted
			}

			// Check previous age group (even without PB)
			prevAG := domain.PreviousAgeGroup(domain.AgeGroup(currentAgeGroup))
			if prevAG != "" {
				prevStdTimeMS, hasPrevStandard := getStandardTimeExact(stdTimesMap, string(event), string(prevAG))
				if hasPrevStandard {
					prevAgeGroupStr := string(prevAG)
					prevStandardTime := int(prevStdTimeMS)
					prevStandardTimeFormatted := domain.FormatTime(prevStandardTime)
					comp.PrevAgeGroup = &prevAgeGroupStr
					comp.PrevStandardTimeMS = &prevStandardTime
					comp.PrevStandardTimeFormatted = &prevStandardTimeFormatted
				}
			}

			// Check next age group (even without PB)
			nextAG := domain.NextAgeGroup(domain.AgeGroup(currentAgeGroup))
			if nextAG != "" {
				nextStdTimeMS, hasNextStandard := getStandardTimeExact(stdTimesMap, string(event), string(nextAG))
				if hasNextStandard {
					nextAgeGroupStr := string(nextAG)
					nextStandardTime := int(nextStdTimeMS)
					nextStandardTimeFormatted := domain.FormatTime(nextStandardTime)
					comp.NextAgeGroup = &nextAgeGroupStr
					comp.NextStandardTimeMS = &nextStandardTime
					comp.NextStandardTimeFormatted = &nextStandardTimeFormatted
				}
			}

			comp.Status = StatusNoTime
			summary.NoTime++
		}

		comparisons = append(comparisons, comp)
		summary.TotalEvents++
	}

	return &ComparisonResult{
		StandardID:       standardID,
		StandardName:     standard.Name,
		CourseType:       courseType,
		SwimmerName:      swimmer.Name,
		SwimmerAgeGroup:  currentAgeGroup,
		ThresholdPercent: threshold,
		Comparisons:      comparisons,
		Summary:          summary,
	}, nil
}

// getStandardTime looks up a standard time, trying the specific age group first,
// then falling back to OPEN if not found. Returns the time, the age group that was used, and whether found.
func getStandardTime(stdTimesMap map[string]map[string]int32, event, ageGroup string) (int32, string, bool) {
	if eventTimes, ok := stdTimesMap[event]; ok {
		if timeMS, ok := eventTimes[ageGroup]; ok {
			return timeMS, ageGroup, true
		}
		// Fall back to OPEN
		if timeMS, ok := eventTimes["OPEN"]; ok {
			return timeMS, "OPEN", true
		}
	}
	return 0, "", false
}

// getStandardTimeExact looks up a standard time for the exact age group without fallback.
// Used for prev/next age group checks to avoid showing age groups that don't exist in the standard.
func getStandardTimeExact(stdTimesMap map[string]map[string]int32, event, ageGroup string) (int32, bool) {
	if eventTimes, ok := stdTimesMap[event]; ok {
		if timeMS, ok := eventTimes[ageGroup]; ok {
			return timeMS, true
		}
	}
	return 0, false
}

// formatDifference formats a time difference in milliseconds.
func formatDifference(diffMS int) string {
	if diffMS == 0 {
		return "0.00"
	}

	prefix := ""
	if diffMS < 0 {
		prefix = "-"
		diffMS = -diffMS
	} else {
		prefix = "+"
	}

	return prefix + domain.FormatTime(diffMS)
}
