package importer

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/bpg/swimstats/backend/internal/domain/meet"
	"github.com/bpg/swimstats/backend/internal/domain/swimmer"
	timeservice "github.com/bpg/swimstats/backend/internal/domain/time"
)

// Service handles importing swimmer data from JSON files.
type Service struct {
	swimmerService *swimmer.Service
	meetService    *meet.Service
	timeService    *timeservice.Service
}

// NewService creates a new importer service.
func NewService(
	swimmerService *swimmer.Service,
	meetService *meet.Service,
	timeService *timeservice.Service,
) *Service {
	return &Service{
		swimmerService: swimmerService,
		meetService:    meetService,
		timeService:    timeService,
	}
}

// ImportSwimmerData imports a complete swimmer dataset from parsed JSON.
func (s *Service) ImportSwimmerData(ctx context.Context, data *SwimmerImport) (*ImportResult, error) {
	result := &ImportResult{
		Success: false,
		Errors:  []string{},
	}

	// 1. Parse and validate swimmer
	parsedSwimmer, err := s.parseSwimmer(&data.Swimmer)
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Swimmer validation failed: %v", err))
		return result, err
	}

	// 2. Create or update swimmer
	swimmerID, err := s.createOrUpdateSwimmer(ctx, parsedSwimmer)
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Failed to create/update swimmer: %v", err))
		return result, err
	}

	result.SwimmerID = swimmerID
	result.SwimmerName = parsedSwimmer.Name

	// 3. Import each meet with its times
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

	result.Success = len(result.Errors) == 0 || result.MeetsCreated > 0
	return result, nil
}

// parseSwimmer validates and parses swimmer data.
func (s *Service) parseSwimmer(data *SwimmerData) (*ParsedSwimmer, error) {
	if data.Name == "" {
		return nil, fmt.Errorf("swimmer name is required")
	}

	if data.Gender != "female" && data.Gender != "male" {
		return nil, fmt.Errorf("gender must be 'female' or 'male', got: %s", data.Gender)
	}

	birthDate, err := time.Parse("2006-01-02", data.BirthDate)
	if err != nil {
		return nil, fmt.Errorf("invalid birth_date format (expected YYYY-MM-DD): %v", err)
	}

	return &ParsedSwimmer{
		Name:      data.Name,
		BirthDate: birthDate,
		Gender:    data.Gender,
	}, nil
}

// parseMeet validates and parses meet data.
func (s *Service) parseMeet(data *MeetData) (*ParsedMeet, error) {
	if data.Name == "" {
		return nil, fmt.Errorf("meet name is required")
	}

	if data.CourseType != "25m" && data.CourseType != "50m" {
		return nil, fmt.Errorf("course_type must be '25m' or '50m', got: %s", data.CourseType)
	}

	startDate, err := time.Parse("2006-01-02", data.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date format (expected YYYY-MM-DD): %v", err)
	}

	endDate, err := time.Parse("2006-01-02", data.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date format (expected YYYY-MM-DD): %v", err)
	}

	if endDate.Before(startDate) {
		return nil, fmt.Errorf("end_date cannot be before start_date")
	}

	// Parse times
	var parsedTimes []ParsedTime
	for i, timeData := range data.Times {
		parsedTime, err := s.parseTime(&timeData, startDate, endDate)
		if err != nil {
			return nil, fmt.Errorf("time %d validation failed: %v", i+1, err)
		}
		parsedTimes = append(parsedTimes, *parsedTime)
	}

	return &ParsedMeet{
		Name:       data.Name,
		City:       data.City,
		Country:    data.Country,
		StartDate:  startDate,
		EndDate:    endDate,
		CourseType: data.CourseType,
		Times:      parsedTimes,
	}, nil
}

// parseTime validates and parses time data.
func (s *Service) parseTime(data *TimeData, meetStart, meetEnd time.Time) (*ParsedTime, error) {
	if data.Event == "" {
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

	if !validEvents[data.Event] {
		return nil, fmt.Errorf("invalid event code: %s", data.Event)
	}

	// Parse time string to milliseconds
	timeMS, err := parseTimeToMS(data.Time)
	if err != nil {
		return nil, fmt.Errorf("invalid time format: %v", err)
	}

	// Parse and validate event date
	eventDate, err := time.Parse("2006-01-02", data.EventDate)
	if err != nil {
		return nil, fmt.Errorf("invalid event_date format (expected YYYY-MM-DD): %v", err)
	}

	if eventDate.Before(meetStart) || eventDate.After(meetEnd) {
		return nil, fmt.Errorf("event_date %s is outside meet date range (%s to %s)",
			data.EventDate, meetStart.Format("2006-01-02"), meetEnd.Format("2006-01-02"))
	}

	return &ParsedTime{
		Event:     data.Event,
		TimeMS:    int32(timeMS),
		EventDate: eventDate,
		Notes:     data.Notes,
	}, nil
}

// parseTimeToMS converts a time string (MM:SS.HH or SS.HH) to milliseconds.
func parseTimeToMS(timeStr string) (int, error) {
	parts := strings.Split(timeStr, ":")

	var totalSeconds float64
	var err error

	if len(parts) == 1 {
		// Format: SS.HH (e.g., "28.45")
		totalSeconds, err = strconv.ParseFloat(parts[0], 64)
		if err != nil {
			return 0, fmt.Errorf("invalid time format: %s", timeStr)
		}
	} else if len(parts) == 2 {
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
	} else {
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
		Name:      parsed.Name,
		BirthDate: parsed.BirthDate.Format("2006-01-02"),
		Gender:    parsed.Gender,
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
