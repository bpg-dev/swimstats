// Package time provides time domain logic.
package time

import (
	"context"
	"errors"
	"fmt"

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
	Notes         string    `json:"notes,omitempty"`
	IsPB          bool      `json:"is_pb,omitempty"`
	Meet          *Meet     `json:"meet,omitempty"`
}

// Meet represents basic meet info embedded in a time record.
type Meet struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	City       string    `json:"city"`
	Date       string    `json:"date"`
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
	MeetID uuid.UUID `json:"meet_id"`
	Event  string    `json:"event"`
	TimeMS int       `json:"time_ms"`
	Notes  string    `json:"notes,omitempty"`
}

// BatchInput represents input for batch time creation.
type BatchInput struct {
	MeetID uuid.UUID `json:"meet_id"`
	Times  []struct {
		Event  string `json:"event"`
		TimeMS int    `json:"time_ms"`
		Notes  string `json:"notes,omitempty"`
	} `json:"times"`
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
		times[i] = TimeRecord{
			ID:            row.ID,
			MeetID:        row.MeetID,
			Event:         row.Event,
			TimeMS:        int(row.TimeMs),
			TimeFormatted: domain.FormatTime(int(row.TimeMs)),
			Notes:         row.Notes.String,
			Meet: &Meet{
				ID:         row.MeetID,
				Name:       row.MeetName,
				City:       row.MeetCity,
				Date:       row.MeetDate.Time.Format("2006-01-02"),
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

	// Check for duplicate event in the same meet
	exists, err := s.timeRepo.EventExistsForMeet(ctx, input.MeetID, input.Event)
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

	params := db.CreateTimeParams{
		SwimmerID: swimmerID,
		MeetID:    input.MeetID,
		Event:     input.Event,
		TimeMs:    int32(input.TimeMS),
		Notes:     notes,
	}

	dbTime, err := s.timeRepo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create time: %w", err)
	}

	// Check if this is a PB
	isPB, _ := s.timeRepo.IsPersonalBest(ctx, swimmerID, meet.CourseType, input.Event, int32(input.TimeMS), &dbTime.ID)

	return &TimeRecord{
		ID:            dbTime.ID,
		MeetID:        dbTime.MeetID,
		Event:         dbTime.Event,
		TimeMS:        int(dbTime.TimeMs),
		TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
		Notes:         dbTime.Notes.String,
		IsPB:          isPB,
		Meet: &Meet{
			ID:         meet.ID,
			Name:       meet.Name,
			City:       meet.City,
			Date:       meet.Date.Time.Format("2006-01-02"),
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

	// Check for duplicate events already in the meet
	for event := range seenEvents {
		exists, err := s.timeRepo.EventExistsForMeet(ctx, input.MeetID, event)
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

		params := db.CreateTimeParams{
			SwimmerID: swimmerID,
			MeetID:    input.MeetID,
			Event:     t.Event,
			TimeMs:    int32(t.TimeMS),
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

		times = append(times, TimeRecord{
			ID:            dbTime.ID,
			MeetID:        dbTime.MeetID,
			Event:         dbTime.Event,
			TimeMS:        int(dbTime.TimeMs),
			TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
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

	var notes pgtype.Text
	if input.Notes != "" {
		notes = pgtype.Text{String: input.Notes, Valid: true}
	}

	params := db.UpdateTimeParams{
		ID:     id,
		MeetID: input.MeetID,
		Event:  input.Event,
		TimeMs: int32(input.TimeMS),
		Notes:  notes,
	}

	dbTime, err := s.timeRepo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update time: %w", err)
	}

	return &TimeRecord{
		ID:            dbTime.ID,
		MeetID:        dbTime.MeetID,
		Event:         dbTime.Event,
		TimeMS:        int(dbTime.TimeMs),
		TimeFormatted: domain.FormatTime(int(dbTime.TimeMs)),
		Notes:         dbTime.Notes.String,
		Meet: &Meet{
			ID:         meet.ID,
			Name:       meet.Name,
			City:       meet.City,
			Date:       meet.Date.Time.Format("2006-01-02"),
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
	return &TimeRecord{
		ID:            row.ID,
		MeetID:        row.MeetID,
		Event:         row.Event,
		TimeMS:        int(row.TimeMs),
		TimeFormatted: domain.FormatTime(int(row.TimeMs)),
		Notes:         row.Notes.String,
		Meet: &Meet{
			ID:         row.MeetID,
			Name:       row.MeetName,
			City:       row.MeetCity,
			Date:       row.MeetDate.Time.Format("2006-01-02"),
			CourseType: row.MeetCourseType,
		},
	}
}
