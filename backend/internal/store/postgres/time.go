package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/bpg/swimstats/backend/internal/store/db"
)

// TimeRepository provides time data access.
type TimeRepository struct {
	queries *db.Queries
}

// NewTimeRepository creates a new time repository.
func NewTimeRepository(queries *db.Queries) *TimeRepository {
	return &TimeRepository{queries: queries}
}

// Get retrieves a time by ID.
func (r *TimeRepository) Get(ctx context.Context, id uuid.UUID) (*db.Time, error) {
	time, err := r.queries.GetTime(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get time: %w", err)
	}
	return &time, nil
}

// GetWithMeet retrieves a time with its meet details.
func (r *TimeRepository) GetWithMeet(ctx context.Context, id uuid.UUID) (*db.GetTimeWithMeetRow, error) {
	time, err := r.queries.GetTimeWithMeet(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get time with meet: %w", err)
	}
	return &time, nil
}

// ListTimesParams contains parameters for listing times.
type ListTimesParams struct {
	SwimmerID  uuid.UUID
	CourseType *string
	Event      *string
	MeetID     *uuid.UUID
	Limit      int32
	Offset     int32
}

// List lists times with optional filtering.
func (r *TimeRepository) List(ctx context.Context, params ListTimesParams) ([]db.ListTimesRow, error) {
	// Convert nil to empty/zero values for the SQL IS NULL check pattern
	courseType := ""
	event := ""
	meetID := uuid.Nil

	if params.CourseType != nil {
		courseType = *params.CourseType
	}
	if params.Event != nil {
		event = *params.Event
	}
	if params.MeetID != nil {
		meetID = *params.MeetID
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 100
	}

	times, err := r.queries.ListTimes(ctx, db.ListTimesParams{
		SwimmerID: params.SwimmerID,
		Column2:   courseType,
		Column3:   event,
		Column4:   meetID,
		Limit:     limit,
		Offset:    params.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list times: %w", err)
	}
	return times, nil
}

// Count returns the total number of times matching the filter.
func (r *TimeRepository) Count(ctx context.Context, params ListTimesParams) (int64, error) {
	courseType := ""
	event := ""
	meetID := uuid.Nil

	if params.CourseType != nil {
		courseType = *params.CourseType
	}
	if params.Event != nil {
		event = *params.Event
	}
	if params.MeetID != nil {
		meetID = *params.MeetID
	}

	count, err := r.queries.CountTimes(ctx, db.CountTimesParams{
		SwimmerID: params.SwimmerID,
		Column2:   courseType,
		Column3:   event,
		Column4:   meetID,
	})
	if err != nil {
		return 0, fmt.Errorf("count times: %w", err)
	}
	return count, nil
}

// Create creates a new time.
func (r *TimeRepository) Create(ctx context.Context, params db.CreateTimeParams) (*db.Time, error) {
	time, err := r.queries.CreateTime(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create time: %w", err)
	}
	return &time, nil
}

// Update updates an existing time.
func (r *TimeRepository) Update(ctx context.Context, params db.UpdateTimeParams) (*db.Time, error) {
	time, err := r.queries.UpdateTime(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update time: %w", err)
	}
	return &time, nil
}

// Delete deletes a time.
func (r *TimeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteTime(ctx, id); err != nil {
		return fmt.Errorf("delete time: %w", err)
	}
	return nil
}

// ListByMeet lists all times for a specific meet.
func (r *TimeRepository) ListByMeet(ctx context.Context, meetID uuid.UUID) ([]db.Time, error) {
	times, err := r.queries.ListTimesByMeet(ctx, meetID)
	if err != nil {
		return nil, fmt.Errorf("list times by meet: %w", err)
	}
	return times, nil
}

// GetPersonalBests retrieves personal bests for a swimmer in a course type.
func (r *TimeRepository) GetPersonalBests(ctx context.Context, swimmerID uuid.UUID, courseType string) ([]db.GetPersonalBestsRow, error) {
	pbs, err := r.queries.GetPersonalBests(ctx, db.GetPersonalBestsParams{
		SwimmerID:  swimmerID,
		CourseType: courseType,
	})
	if err != nil {
		return nil, fmt.Errorf("get personal bests: %w", err)
	}
	return pbs, nil
}

// GetPersonalBestForEvent retrieves the personal best for a specific event.
func (r *TimeRepository) GetPersonalBestForEvent(ctx context.Context, swimmerID uuid.UUID, courseType, event string) (*db.GetPersonalBestForEventRow, error) {
	pb, err := r.queries.GetPersonalBestForEvent(ctx, db.GetPersonalBestForEventParams{
		SwimmerID:  swimmerID,
		CourseType: courseType,
		Event:      event,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get personal best for event: %w", err)
	}
	return &pb, nil
}

// IsPersonalBest checks if a time would be a new personal best.
func (r *TimeRepository) IsPersonalBest(ctx context.Context, swimmerID uuid.UUID, courseType, event string, timeMS int32, excludeID *uuid.UUID) (bool, error) {
	excludeUUID := uuid.Nil
	if excludeID != nil {
		excludeUUID = *excludeID
	}

	result, err := r.queries.IsPersonalBest(ctx, db.IsPersonalBestParams{
		SwimmerID:  swimmerID,
		CourseType: courseType,
		Event:      event,
		TimeMs:     timeMS,
		ID:         excludeUUID,
	})
	if err != nil {
		return false, fmt.Errorf("check is personal best: %w", err)
	}
	return result, nil
}

// GetTotalTimeCount returns the total number of times for a swimmer.
func (r *TimeRepository) GetTotalTimeCount(ctx context.Context, swimmerID uuid.UUID) (int32, error) {
	count, err := r.queries.GetTotalTimeCount(ctx, swimmerID)
	if err != nil {
		return 0, fmt.Errorf("get total time count: %w", err)
	}
	return count, nil
}

// GetTotalMeetCount returns the total number of meets a swimmer has times in.
func (r *TimeRepository) GetTotalMeetCount(ctx context.Context, swimmerID uuid.UUID) (int32, error) {
	count, err := r.queries.GetTotalMeetCount(ctx, swimmerID)
	if err != nil {
		return 0, fmt.Errorf("get total meet count: %w", err)
	}
	return count, nil
}

// EventExistsForMeet checks if an event already exists for a specific meet and swimmer.
func (r *TimeRepository) EventExistsForMeet(ctx context.Context, swimmerID, meetID uuid.UUID, event string) (bool, error) {
	exists, err := r.queries.EventExistsForMeet(ctx, db.EventExistsForMeetParams{
		SwimmerID: swimmerID,
		MeetID:    meetID,
		Event:     event,
	})
	if err != nil {
		return false, fmt.Errorf("check event exists for meet: %w", err)
	}
	return exists, nil
}
