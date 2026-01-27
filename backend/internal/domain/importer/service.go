package importer

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/domain/meet"
	"github.com/bpg/swimstats/backend/internal/domain/standard"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	timeservice "github.com/bpg/swimstats/backend/internal/domain/time"
)

// Service handles importing swimmer data from JSON files.
type Service struct {
	swimmerService  *swimmer.Service
	meetService     *meet.Service
	timeService     *timeservice.Service
	standardService *standard.Service
}

// NewService creates a new importer service.
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

// ImportSwimmerData imports a complete swimmer dataset from parsed JSON.
// Sections are optional and will REPLACE existing data if present.
func (s *Service) ImportSwimmerData(ctx context.Context, data *ImportData) (*ImportResult, error) {
	result := &ImportResult{
		Success: false,
		Errors:  []string{},
	}

	var swimmerID string

	// 1. Replace swimmer if present in import data
	if data.Swimmer != nil {
		parsedSwimmer, err := s.parseSwimmer(data.Swimmer)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Swimmer validation failed: %v", err))
			return result, err
		}

		swimmerID, err = s.createOrUpdateSwimmer(ctx, parsedSwimmer)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to create/update swimmer: %v", err))
			return result, err
		}

		result.SwimmerID = swimmerID
		result.SwimmerName = parsedSwimmer.Name
		result.SwimmerReplaced = true
	} else {
		// Get existing swimmer ID for meets/times import
		swimmerData, err := s.swimmerService.Get(ctx)
		if err != nil {
			result.Errors = append(result.Errors, "No swimmer profile exists. Import must include swimmer section.")
			return result, fmt.Errorf("no swimmer profile found")
		}
		swimmerID = swimmerData.ID.String()
	}

	// 2. Replace meets if present in import data
	if len(data.Meets) > 0 {
		// Delete ALL existing meets (cascades to delete times)
		meetsDeleted, err := s.deleteAllMeets(ctx)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to delete existing meets: %v", err))
			return result, err
		}
		result.MeetsDeleted = meetsDeleted

		// Import new meets with their times
		for i, meetData := range data.Meets {
			parsedMeet, err := s.parseMeet(&meetData)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Meet %d (%s) validation failed: %v", i+1, meetData.Name, err))
				continue
			}

			meetID, timesCreated, skipped, err := s.importMeet(ctx, swimmerID, parsedMeet)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to import meet %s: %v", meetData.Name, err))
				continue
			}

			result.MeetsCreated++
			result.TimesCreated += timesCreated
			result.SkippedTimes += skipped

			if skipped > 0 {
				result.SkippedReason = append(result.SkippedReason,
					fmt.Sprintf("Meet %s (ID: %s): %d duplicate event(s) skipped", meetData.Name, meetID, skipped))
			}
		}
	}

	// 3. Replace custom standards if present in import data
	if len(data.Standards) > 0 {
		// Delete all custom standards (exclude preloaded)
		standardsDeleted, err := s.deleteAllCustomStandards(ctx)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to delete existing standards: %v", err))
			return result, err
		}
		result.StandardsDeleted = standardsDeleted

		// Import new standards
		for i, standardData := range data.Standards {
			parsedStandard, err := s.parseStandard(&standardData)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Standard %d (%s) validation failed: %v", i+1, standardData.Name, err))
				continue
			}

			err = s.importStandard(ctx, parsedStandard)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to import standard %s: %v", standardData.Name, err))
				continue
			}

			result.StandardsCreated++
		}
	}

	result.Success = len(result.Errors) == 0 || result.MeetsCreated > 0 || result.StandardsCreated > 0 || result.SwimmerReplaced
	return result, nil
}

// parseSwimmer validates and parses swimmer data.
func (s *Service) parseSwimmer(data *SwimmerData) (*ParsedSwimmer, error) {
	// Sanitize input
	name := strings.TrimSpace(data.Name)
	gender := strings.TrimSpace(data.Gender)
	birthDateStr := strings.TrimSpace(data.BirthDate)

	if name == "" {
		return nil, fmt.Errorf("swimmer name is required")
	}

	if gender != "female" && gender != "male" {
		return nil, fmt.Errorf("gender must be 'female' or 'male', got: %s", gender)
	}

	birthDate, err := time.Parse("2006-01-02", birthDateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid birth_date format (expected YYYY-MM-DD): %v", err)
	}

	// Validate threshold_percent if provided
	if data.ThresholdPercent != nil {
		if *data.ThresholdPercent < 0 || *data.ThresholdPercent > 100 {
			return nil, fmt.Errorf("threshold_percent must be between 0 and 100, got: %f", *data.ThresholdPercent)
		}
	}

	return &ParsedSwimmer{
		Name:             name,
		BirthDate:        birthDate,
		Gender:           gender,
		ThresholdPercent: data.ThresholdPercent,
	}, nil
}

// parseMeet validates and parses meet data.
func (s *Service) parseMeet(data *MeetData) (*ParsedMeet, error) {
	// Sanitize input
	name := strings.TrimSpace(data.Name)
	city := strings.TrimSpace(data.City)
	country := strings.TrimSpace(data.Country)
	courseType := strings.TrimSpace(data.CourseType)
	startDateStr := strings.TrimSpace(data.StartDate)
	endDateStr := strings.TrimSpace(data.EndDate)

	if name == "" {
		return nil, fmt.Errorf("meet name is required")
	}

	if courseType != "25m" && courseType != "50m" {
		return nil, fmt.Errorf("course_type must be '25m' or '50m', got: %s", courseType)
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date format (expected YYYY-MM-DD): %v", err)
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date format (expected YYYY-MM-DD): %v", err)
	}

	if endDate.Before(startDate) {
		return nil, fmt.Errorf("end_date cannot be before start_date")
	}

	// Parse times
	parsedTimes := make([]ParsedTime, 0, len(data.Times))
	for i, timeData := range data.Times {
		parsedTime, err := s.parseTime(&timeData, startDate, endDate)
		if err != nil {
			return nil, fmt.Errorf("time %d validation failed: %v", i+1, err)
		}
		parsedTimes = append(parsedTimes, *parsedTime)
	}

	return &ParsedMeet{
		Name:       name,
		City:       city,
		Country:    country,
		StartDate:  startDate,
		EndDate:    endDate,
		CourseType: courseType,
		Times:      parsedTimes,
	}, nil
}

// parseTime validates and parses time data.
func (s *Service) parseTime(data *TimeData, meetStart, meetEnd time.Time) (*ParsedTime, error) {
	// Sanitize input
	event := strings.TrimSpace(data.Event)
	timeStr := strings.TrimSpace(data.Time)
	eventDateStr := strings.TrimSpace(data.EventDate)
	notes := strings.TrimSpace(data.Notes)

	if event == "" {
		return nil, fmt.Errorf("event is required")
	}

	// Validate event code (basic validation - list of valid events)
	validEvents := map[string]bool{
		"50FR": true, "100FR": true, "200FR": true, "400FR": true, "800FR": true, "1500FR": true,
		"50BK": true, "100BK": true, "200BK": true,
		"50BR": true, "100BR": true, "200BR": true,
		"50FL": true, "100FL": true, "200FL": true,
		"200IM": true, "400IM": true,
	}

	if !validEvents[event] {
		return nil, fmt.Errorf("invalid event code: %s", event)
	}

	// Parse time string to milliseconds
	timeMS, err := parseTimeToMS(timeStr)
	if err != nil {
		return nil, fmt.Errorf("invalid time format: %v", err)
	}

	// Parse and validate event date
	if eventDateStr == "" {
		return nil, fmt.Errorf("event_date is required")
	}
	eventDate, err := time.Parse("2006-01-02", eventDateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid event_date format (expected YYYY-MM-DD): %v", err)
	}

	if eventDate.Before(meetStart) || eventDate.After(meetEnd) {
		return nil, fmt.Errorf("event_date %s is outside meet date range (%s to %s)",
			eventDateStr, meetStart.Format("2006-01-02"), meetEnd.Format("2006-01-02"))
	}

	return &ParsedTime{
		Event:     event,
		TimeMS:    int32(timeMS),
		EventDate: eventDate,
		Notes:     notes,
	}, nil
}

// parseTimeToMS converts a time string (MM:SS.HH or SS.HH) to milliseconds.
func parseTimeToMS(timeStr string) (int, error) {
	parts := strings.Split(timeStr, ":")

	var totalSeconds float64
	var err error

	switch len(parts) {
	case 1:
		// Format: SS.HH (e.g., "28.45")
		totalSeconds, err = strconv.ParseFloat(parts[0], 64)
		if err != nil {
			return 0, fmt.Errorf("invalid time format: %s", timeStr)
		}
	case 2:
		// Format: MM:SS.HH (e.g., "1:02.34")
		minutes, err := strconv.Atoi(parts[0])
		if err != nil {
			return 0, fmt.Errorf("invalid minutes in time: %s", timeStr)
		}

		seconds, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			return 0, fmt.Errorf("invalid seconds in time: %s", timeStr)
		}

		totalSeconds = float64(minutes)*60 + seconds
	default:
		return 0, fmt.Errorf("invalid time format (expected MM:SS.HH or SS.HH): %s", timeStr)
	}

	// Convert to milliseconds
	milliseconds := int(totalSeconds * 1000)

	if milliseconds <= 0 {
		return 0, fmt.Errorf("time must be positive: %s", timeStr)
	}

	return milliseconds, nil
}

// createOrUpdateSwimmer creates a new swimmer or updates existing one.
func (s *Service) createOrUpdateSwimmer(ctx context.Context, parsed *ParsedSwimmer) (string, error) {
	input := swimmer.Input{
		Name:             parsed.Name,
		BirthDate:        parsed.BirthDate.Format("2006-01-02"),
		Gender:           parsed.Gender,
		ThresholdPercent: parsed.ThresholdPercent,
	}

	created, _, err := s.swimmerService.CreateOrUpdate(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to create/update swimmer: %w", err)
	}

	return created.ID.String(), nil
}

// importMeet creates a meet and its associated times.
// Returns: meetID, timesCreated, timesSkipped, error
func (s *Service) importMeet(ctx context.Context, swimmerID string, parsed *ParsedMeet) (string, int, int, error) {
	// Create meet
	meetInput := meet.Input{
		Name:       parsed.Name,
		City:       parsed.City,
		Country:    parsed.Country,
		StartDate:  parsed.StartDate.Format("2006-01-02"),
		EndDate:    parsed.EndDate.Format("2006-01-02"),
		CourseType: parsed.CourseType,
	}

	createdMeet, err := s.meetService.Create(ctx, meetInput)
	if err != nil {
		return "", 0, 0, fmt.Errorf("failed to create meet: %w", err)
	}

	// Import times
	timesCreated := 0
	timesSkipped := 0

	swimmerUUID, err := uuid.Parse(swimmerID)
	if err != nil {
		return createdMeet.ID.String(), 0, 0, fmt.Errorf("invalid swimmer ID: %w", err)
	}

	for _, timeData := range parsed.Times {
		timeInput := timeservice.Input{
			MeetID:    createdMeet.ID,
			Event:     timeData.Event,
			TimeMS:    int(timeData.TimeMS),
			EventDate: timeData.EventDate.Format("2006-01-02"),
			Notes:     timeData.Notes,
		}

		_, err := s.timeService.Create(ctx, swimmerUUID, timeInput)
		if err != nil {
			// Check if it's a duplicate event error
			if strings.Contains(err.Error(), "DUPLICATE_EVENT") {
				timesSkipped++
				continue
			}
			return createdMeet.ID.String(), timesCreated, timesSkipped, fmt.Errorf("failed to create time for event %s: %w", timeData.Event, err)
		}

		timesCreated++
	}

	return createdMeet.ID.String(), timesCreated, timesSkipped, nil
}

// Preview analyzes the import data and returns what will be deleted/replaced.
func (s *Service) Preview(ctx context.Context, data *ImportData) (*PreviewResult, error) {
	preview := &PreviewResult{}

	// Check if swimmer will be replaced
	preview.WillReplaceSwimmer = data.Swimmer != nil

	// Count existing meets and times if meets section is present
	if len(data.Meets) > 0 {
		// Get swimmer to count their meets/times
		swimmerData, err := s.swimmerService.Get(ctx)
		if err != nil {
			// If no swimmer exists yet, counts are 0
			preview.CurrentMeetsCount = 0
			preview.CurrentTimesCount = 0
		} else {
			// Count existing meets
			meetList, err := s.meetService.List(ctx, meet.ListParams{
				CourseType: nil,
				Limit:      10000,
				Offset:     0,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to list meets: %w", err)
			}
			preview.CurrentMeetsCount = len(meetList.Meets)

			// Count existing times across all meets
			timeList, err := s.timeService.List(ctx, timeservice.ListParams{
				SwimmerID:  swimmerData.ID,
				MeetID:     nil,
				CourseType: nil,
				Event:      nil,
				Limit:      10000,
				Offset:     0,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to list times: %w", err)
			}
			preview.CurrentTimesCount = len(timeList.Times)
		}

		// Count new meets and times from import data
		preview.NewMeetsCount = len(data.Meets)
		totalTimes := 0
		for _, meetData := range data.Meets {
			totalTimes += len(meetData.Times)
		}
		preview.NewTimesCount = totalTimes
	}

	// Count existing custom standards if standards section is present
	if len(data.Standards) > 0 {
		standardList, err := s.standardService.List(ctx, standard.ListParams{
			CourseType: nil,
			Gender:     nil,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to list standards: %w", err)
		}

		// Count only custom standards (exclude preloaded)
		customCount := 0
		for _, std := range standardList.Standards {
			if !std.IsPreloaded {
				customCount++
			}
		}
		preview.CurrentStandardsCount = customCount
		preview.NewStandardsCount = len(data.Standards)
	}

	return preview, nil
}

// deleteAllMeets deletes all meets for the current swimmer.
// Returns the count of deleted meets.
func (s *Service) deleteAllMeets(ctx context.Context) (int, error) {
	meetList, err := s.meetService.List(ctx, meet.ListParams{
		CourseType: nil,
		Limit:      10000,
		Offset:     0,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to list meets: %w", err)
	}

	deletedCount := 0
	for _, m := range meetList.Meets {
		err := s.meetService.Delete(ctx, m.ID)
		if err != nil {
			return deletedCount, fmt.Errorf("failed to delete meet %s: %w", m.Name, err)
		}
		deletedCount++
	}

	return deletedCount, nil
}

// deleteAllCustomStandards deletes all custom (non-preloaded) standards.
// Returns the count of deleted standards.
func (s *Service) deleteAllCustomStandards(ctx context.Context) (int, error) {
	standardList, err := s.standardService.List(ctx, standard.ListParams{
		CourseType: nil,
		Gender:     nil,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to list standards: %w", err)
	}

	deletedCount := 0
	for _, std := range standardList.Standards {
		if std.IsPreloaded {
			continue // Skip preloaded standards
		}

		err := s.standardService.Delete(ctx, std.ID)
		if err != nil {
			return deletedCount, fmt.Errorf("failed to delete standard %s: %w", std.Name, err)
		}
		deletedCount++
	}

	return deletedCount, nil
}

// parseStandard validates and parses standard data.
func (s *Service) parseStandard(data *StandardData) (*ParsedStandard, error) {
	if data.Name == "" {
		return nil, fmt.Errorf("standard name is required")
	}

	if data.CourseType != "25m" && data.CourseType != "50m" {
		return nil, fmt.Errorf("course_type must be '25m' or '50m', got: %s", data.CourseType)
	}

	if data.Gender != "female" && data.Gender != "male" {
		return nil, fmt.Errorf("gender must be 'female' or 'male', got: %s", data.Gender)
	}

	// Parse times for each event
	parsedTimes := make(map[string][]ParsedStandardTime)
	for event, timeStrings := range data.Times {
		var timesForEvent []ParsedStandardTime
		for _, timeStr := range timeStrings {
			// Format: "ageGroup:time" (e.g., "10&U:29.50")
			parts := strings.SplitN(timeStr, ":", 2)
			if len(parts) != 2 {
				return nil, fmt.Errorf("invalid time format for event %s: %s (expected format: ageGroup:time)", event, timeStr)
			}

			ageGroup := parts[0]
			timeMS, err := parseTimeToMS(parts[1])
			if err != nil {
				return nil, fmt.Errorf("invalid time for event %s, age group %s: %v", event, ageGroup, err)
			}

			timesForEvent = append(timesForEvent, ParsedStandardTime{
				AgeGroup: ageGroup,
				TimeMS:   int32(timeMS),
			})
		}
		parsedTimes[event] = timesForEvent
	}

	return &ParsedStandard{
		Name:        data.Name,
		Description: data.Description,
		CourseType:  data.CourseType,
		Gender:      data.Gender,
		Times:       parsedTimes,
	}, nil
}

// importStandard creates a standard and its associated times.
func (s *Service) importStandard(ctx context.Context, parsed *ParsedStandard) error {
	// Create standard
	standardInput := standard.Input{
		Name:        parsed.Name,
		Description: parsed.Description,
		CourseType:  parsed.CourseType,
		Gender:      parsed.Gender,
	}

	createdStandard, err := s.standardService.Create(ctx, standardInput)
	if err != nil {
		return fmt.Errorf("failed to create standard: %w", err)
	}

	// Create standard times
	var times []standard.StandardTimeInput
	for event, timesForEvent := range parsed.Times {
		for _, t := range timesForEvent {
			times = append(times, standard.StandardTimeInput{
				Event:    event,
				AgeGroup: t.AgeGroup,
				TimeMs:   int(t.TimeMS),
			})
		}
	}

	_, err = s.standardService.SetTimes(ctx, createdStandard.ID, times)
	if err != nil {
		return fmt.Errorf("failed to set standard times: %w", err)
	}

	return nil
}
