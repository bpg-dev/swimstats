// Package time provides time domain logic.
package time

import (
	"context"
	"errors"
	"fmt"
	gotime "time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/store/db"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// Service provides time business logic.
type Service struct {
	timeRepo *postgres.TimeRepository
	meetRepo *postgres.MeetRepository
}

// NewService creates a new time service.
func NewService(timeRepo *postgres.TimeRepository, meetRepo *postgres.MeetRepository) *Service {
	return &Service{
		timeRepo: timeRepo,
		meetRepo: meetRepo,
	}
}

// TimeRecord represents a recorded time with computed fields.
type TimeRecord struct {
	ID            uuid.UUID `json:"id"`
	MeetID        uuid.UUID `json:"meet_id"`
	Event         string    `json:"event"`
	TimeMS        int       `json:"time_ms"`
	TimeFormatted string    `json:"time_formatted"`
	EventDate     string    `json:"event_date,omitempty"`
	Notes         string    `json:"notes,omitempty"`
	IsPB          bool      `json:"is_pb,omitempty"`
	Meet          *Meet     `json:"meet,omitempty"`
}

// Meet represents basic meet info embedded in a time record.
type Meet struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	City       string    `json:"city"`
	StartDate  string    `json:"start_date"`
	EndDate    string    `json:"end_date"`
	CourseType string    `json:"course_type"`
}

// TimeList represents a paginated list of times.
type TimeList struct {
	Times []TimeRecord `json:"times"`
	Total int          `json:"total"`
}

// BatchResult represents the result of a batch time creation.
type BatchResult struct {
	Times  []TimeRecord `json:"times"`
	NewPBs []string     `json:"new_pbs"`
}

// Input represents input for creating/updating a time.
type Input struct {
	MeetID    uuid.UUID `json:"meet_id"`
	Event     string    `json:"event"`
	TimeMS    int       `json:"time_ms"`
	EventDate string    `json:"event_date,omitempty"`
	Notes     string    `json:"notes,omitempty"`
}

// BatchTimeInput represents a single time in a batch.
type BatchTimeInput struct {
	Event     string `json:"event"`
	TimeMS    int    `json:"time_ms"`
	EventDate string `json:"event_date,omitempty"`
	Notes     string `json:"notes,omitempty"`
}

// BatchInput represents input for batch time creation.
type BatchInput struct {
	MeetID uuid.UUID        `json:"meet_id"`
	Times  []BatchTimeInput `json:"times"`
}

// Validate validates the time input.
func (i Input) Validate() error {
	if i.MeetID == uuid.Nil {
		return errors.New("meet_id is required")
	}
	if !domain.IsValidEvent(i.Event) {
		return errors.New("invalid event code")
	}
	if i.TimeMS <= 0 {
		return errors.New("time_ms must be positive")
	}
	if len(i.Notes) > 1000 {
		return errors.New("notes must be at most 1000 characters")
	}
	if i.EventDate != "" {
		if _, err := gotime.Parse("2006-01-02", i.EventDate); err != nil {
			return errors.New("event_date must be a valid date in YYYY-MM-DD format")
		}
	}
	return nil
}

// ValidateEventDate validates that the event date is within the meet's date range.
func ValidateEventDate(eventDate string, meetStartDate, meetEndDate gotime.Time) error {
	if eventDate == "" {
		return nil // Event date is optional
	}

	ed, err := gotime.Parse("2006-01-02", eventDate)
	if err != nil {
		return errors.New("event_date must be a valid date in YYYY-MM-DD format")
	}

	// Normalize to date-only comparison
	startDate := gotime.Date(meetStartDate.Year(), meetStartDate.Month(), meetStartDate.Day(), 0, 0, 0, 0, gotime.UTC)
	endDate := gotime.Date(meetEndDate.Year(), meetEndDate.Month(), meetEndDate.Day(), 0, 0, 0, 0, gotime.UTC)
	eventDateNorm := gotime.Date(ed.Year(), ed.Month(), ed.Day(), 0, 0, 0, 0, gotime.UTC)

	if eventDateNorm.Before(startDate) || eventDateNorm.After(endDate) {
		return fmt.Errorf("event_date must be within meet dates (%s to %s)",
			startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	}

	return nil
}

// ListParams contains parameters for listing times.
type ListParams struct {
	SwimmerID  uuid.UUID
	CourseType *string
	Event      *string
	MeetID     *uuid.UUID
	Limit      int
	Offset     int
}

// Get retrieves a time by ID with meet details.
func (s *Service) Get(ctx context.Context, id uuid.UUID) (*TimeRecord, error) {
	row, err := s.timeRepo.GetWithMeet(ctx, id)
	if err != nil {
		return nil, err
	}
	return toTimeRecordFromRow(row), nil
}

// List retrieves a paginated list of times.
func (s *Service) List(ctx context.Context, params ListParams) (*TimeList, error) {
	limit := int32(params.Limit)
	if limit <= 0 {
		limit = 100
	}

	rows, err := s.timeRepo.List(ctx, postgres.ListTimesParams{
		SwimmerID:  params.SwimmerID,
		CourseType: params.CourseType,
		Event:      params.Event,
		MeetID:     params.MeetID,
		Limit:      limit,
		Offset:     int32(params.Offset),
	})
	if err != nil {
		return nil, fmt.Errorf("list times: %w", err)
	}

	count, err := s.timeRepo.Count(ctx, postgres.ListTimesParams{
		SwimmerID:  params.SwimmerID,
		CourseType: params.CourseType,
		Event:      params.Event,
		MeetID:     params.MeetID,
	})
	if err != nil {
		return nil, fmt.Errorf("count times: %w", err)
	}

	times := make([]TimeRecord, len(rows))
	for i, row := range rows {
		var eventDate string
		if row.EventDate.Valid {
			eventDate = row.EventDate.Time.Format("2006-01-02")
		}

		times[i] = TimeRecord{
			ID:            row.ID,
			MeetID:        row.MeetID,
			Event:         row.Event,
			TimeMS:        int(row.TimeMs),
			TimeFormatted: domain.FormatTime(int(row.TimeMs)),
			EventDate:     eventDate,
			Notes:         row.Notes.String,
			Meet: &Meet{
				ID:         row.MeetID,
				Name:       row.MeetName,
				City:       row.MeetCity,
				StartDate:  row.MeetStartDate.Time.Format("2006-01-02"),
				EndDate:    row.MeetEndDate.Time.Format("2006-01-02"),
				CourseType: row.MeetCourseType,
			},
		}
	}

	return &TimeList{
		Times: times,
		Total: int(count),
	}, nil
}

// Create creates a new time.
func (s *Service) Create(ctx context.Context, swimmerID uuid.UUID, input Input) (*TimeRecord, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Verify meet exists and get course type
	meet, err := s.meetRepo.Get(ctx, input.MeetID)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			return nil, fmt.Errorf("meet not found")
		}
		return nil, fmt.Errorf("get meet: %w", err)
	}

	// Validate event date is within meet range
	if err := ValidateEventDate(input.EventDate, meet.StartDate.Time, meet.EndDate.Time); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Check for duplicate event in the same meet
	exists, err := s.timeRepo.EventExistsForMeet(ctx, swimmerID, input.MeetID, input.Event)
	if err != nil {
		return nil, fmt.Errorf("check duplicate event: %w", err)
	}
	if exists {
		return nil, postgres.ErrDuplicateEvent
	}

	var notes pgtype.Text
	if input.Notes != "" {
		notes = pgtype.Text{String: input.Notes, Valid: true}
	}

	var eventDate pgtype.Date
	if input.EventDate != "" {
		ed, _ := gotime.Parse("2006-01-02", input.EventDate)
		eventDate = pgtype.Date{Time: ed, Valid: true}
	}

	params := db.CreateTimeParams{
		SwimmerID: swimmerID,
		MeetID:    input.MeetID,
		Event:     input.Event,
		TimeMs:    int32(input.TimeMS),
		EventDate: eventDate,
		Notes:     notes,
	}

	dbTime, err := s.timeRepo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create time: %w", err)
	}

	// Check if this is a PB
	isPB, _ := s.timeRepo.IsPersonalBest(ctx, swimmerID, meet.CourseType, input.Event, int32(input.TimeMS), &dbTime.ID)

	var eventDateStr string
	if dbTime.EventDate.Valid {
		eventDateStr = dbTime.EventDate.Time.Format("2006-01-02")
	}

	return &TimeRecord{
		ID:            dbTime.ID,
		MeetID:        dbTime.MeetID,
		Event:         dbTime.Event,
		TimeMS:        int(dbTime.TimeMs),
		TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
		EventDate:     eventDateStr,
		Notes:         dbTime.Notes.String,
		IsPB:          isPB,
		Meet: &Meet{
			ID:         meet.ID,
			Name:       meet.Name,
			City:       meet.City,
			StartDate:  meet.StartDate.Time.Format("2006-01-02"),
			EndDate:    meet.EndDate.Time.Format("2006-01-02"),
			CourseType: meet.CourseType,
		},
	}, nil
}

// CreateBatch creates multiple times in a batch.
func (s *Service) CreateBatch(ctx context.Context, swimmerID uuid.UUID, input BatchInput) (*BatchResult, error) {
	if input.MeetID == uuid.Nil {
		return nil, errors.New("meet_id is required")
	}
	if len(input.Times) == 0 {
		return nil, errors.New("at least one time is required")
	}

	// Check for duplicate events within the batch
	seenEvents := make(map[string]bool)
	for _, t := range input.Times {
		if seenEvents[t.Event] {
			return nil, fmt.Errorf("duplicate event in batch: %s", t.Event)
		}
		seenEvents[t.Event] = true
	}

	// Verify meet exists and get course type
	meet, err := s.meetRepo.Get(ctx, input.MeetID)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			return nil, fmt.Errorf("meet not found")
		}
		return nil, fmt.Errorf("get meet: %w", err)
	}

	// Validate event dates are within meet range
	for _, t := range input.Times {
		if err := ValidateEventDate(t.EventDate, meet.StartDate.Time, meet.EndDate.Time); err != nil {
			return nil, fmt.Errorf("validation for %s: %w", t.Event, err)
		}
	}

	// Check for duplicate events already in the meet
	for event := range seenEvents {
		exists, err := s.timeRepo.EventExistsForMeet(ctx, swimmerID, input.MeetID, event)
		if err != nil {
			return nil, fmt.Errorf("check duplicate event: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("%w: %s", postgres.ErrDuplicateEvent, event)
		}
	}

	// Get existing PBs for comparison
	existingPBs := make(map[string]int32)
	pbs, _ := s.timeRepo.GetPersonalBests(ctx, swimmerID, meet.CourseType)
	for _, pb := range pbs {
		existingPBs[pb.Event] = pb.TimeMs
	}

	times := make([]TimeRecord, 0, len(input.Times))
	newPBs := make(map[string]bool)

	for _, t := range input.Times {
		if !domain.IsValidEvent(t.Event) {
			return nil, fmt.Errorf("invalid event code: %s", t.Event)
		}
		if t.TimeMS <= 0 {
			return nil, fmt.Errorf("time_ms must be positive for event %s", t.Event)
		}

		var notes pgtype.Text
		if t.Notes != "" {
			notes = pgtype.Text{String: t.Notes, Valid: true}
		}

		var eventDate pgtype.Date
		if t.EventDate != "" {
			ed, _ := gotime.Parse("2006-01-02", t.EventDate)
			eventDate = pgtype.Date{Time: ed, Valid: true}
		}

		params := db.CreateTimeParams{
			SwimmerID: swimmerID,
			MeetID:    input.MeetID,
			Event:     t.Event,
			TimeMs:    int32(t.TimeMS),
			EventDate: eventDate,
			Notes:     notes,
		}

		dbTime, err := s.timeRepo.Create(ctx, params)
		if err != nil {
			return nil, fmt.Errorf("create time for %s: %w", t.Event, err)
		}

		// Check if this is a new PB
		isPB := false
		if existingPB, exists := existingPBs[t.Event]; !exists || int32(t.TimeMS) < existingPB {
			isPB = true
			// Only add to newPBs if it's the fastest we've seen for this event in this batch
			if !newPBs[t.Event] || int32(t.TimeMS) < existingPBs[t.Event] {
				newPBs[t.Event] = true
				existingPBs[t.Event] = int32(t.TimeMS) // Update for subsequent comparisons in batch
			}
		}

		var eventDateStr string
		if dbTime.EventDate.Valid {
			eventDateStr = dbTime.EventDate.Time.Format("2006-01-02")
		}

		times = append(times, TimeRecord{
			ID:            dbTime.ID,
			MeetID:        dbTime.MeetID,
			Event:         dbTime.Event,
			TimeMS:        int(dbTime.TimeMs),
			TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
			EventDate:     eventDateStr,
			Notes:         dbTime.Notes.String,
			IsPB:          isPB,
		})
	}

	// Convert newPBs map to slice
	pbSlice := make([]string, 0, len(newPBs))
	for event := range newPBs {
		pbSlice = append(pbSlice, event)
	}

	return &BatchResult{
		Times:  times,
		NewPBs: pbSlice,
	}, nil
}

// Update updates an existing time.
func (s *Service) Update(ctx context.Context, id uuid.UUID, input Input) (*TimeRecord, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Verify meet exists
	meet, err := s.meetRepo.Get(ctx, input.MeetID)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			return nil, fmt.Errorf("meet not found")
		}
		return nil, fmt.Errorf("get meet: %w", err)
	}

	// Validate event date is within meet range
	if err := ValidateEventDate(input.EventDate, meet.StartDate.Time, meet.EndDate.Time); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	var notes pgtype.Text
	if input.Notes != "" {
		notes = pgtype.Text{String: input.Notes, Valid: true}
	}

	var eventDate pgtype.Date
	if input.EventDate != "" {
		ed, _ := gotime.Parse("2006-01-02", input.EventDate)
		eventDate = pgtype.Date{Time: ed, Valid: true}
	}

	params := db.UpdateTimeParams{
		ID:        id,
		MeetID:    input.MeetID,
		Event:     input.Event,
		TimeMs:    int32(input.TimeMS),
		EventDate: eventDate,
		Notes:     notes,
	}

	dbTime, err := s.timeRepo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update time: %w", err)
	}

	var eventDateStr string
	if dbTime.EventDate.Valid {
		eventDateStr = dbTime.EventDate.Time.Format("2006-01-02")
	}

	return &TimeRecord{
		ID:            dbTime.ID,
		MeetID:        dbTime.MeetID,
		Event:         dbTime.Event,
		TimeMS:        int(dbTime.TimeMs),
		TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
		EventDate:     eventDateStr,
		Notes:         dbTime.Notes.String,
		Meet: &Meet{
			ID:         meet.ID,
			Name:       meet.Name,
			City:       meet.City,
			StartDate:  meet.StartDate.Time.Format("2006-01-02"),
			EndDate:    meet.EndDate.Time.Format("2006-01-02"),
			CourseType: meet.CourseType,
		},
	}, nil
}

// Delete deletes a time.
func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	// First check if time exists
	_, err := s.timeRepo.Get(ctx, id)
	if err != nil {
		return err
	}

	if err := s.timeRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete time: %w", err)
	}
	return nil
}

func toTimeRecordFromRow(row *db.GetTimeWithMeetRow) *TimeRecord {
	var eventDate string
	if row.EventDate.Valid {
		eventDate = row.EventDate.Time.Format("2006-01-02")
	}

	return &TimeRecord{
		ID:            row.ID,
		MeetID:        row.MeetID,
		Event:         row.Event,
		TimeMS:        int(row.TimeMs),
		TimeFormatted: domain.FormatTime(int(row.TimeMs)),
		EventDate:     eventDate,
		Notes:         row.Notes.String,
		Meet: &Meet{
			ID:         row.MeetID,
			Name:       row.MeetName,
			City:       row.MeetCity,
			StartDate:  row.MeetStartDate.Time.Format("2006-01-02"),
			EndDate:    row.MeetEndDate.Time.Format("2006-01-02"),
			CourseType: row.MeetCourseType,
		},
	}
}
