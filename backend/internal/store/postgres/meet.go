package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/bpg/swimstats/backend/internal/store/db"
)

// MeetRepository provides meet data access.
type MeetRepository struct {
	queries *db.Queries
}

// NewMeetRepository creates a new meet repository.
func NewMeetRepository(queries *db.Queries) *MeetRepository {
	return &MeetRepository{queries: queries}
}

// Get retrieves a meet by ID.
func (r *MeetRepository) Get(ctx context.Context, id uuid.UUID) (*db.Meet, error) {
	meet, err := r.queries.GetMeet(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get meet: %w", err)
	}
	return &meet, nil
}

// GetWithTimeCount retrieves a meet with its time count.
func (r *MeetRepository) GetWithTimeCount(ctx context.Context, id uuid.UUID) (*db.GetMeetWithTimeCountRow, error) {
	meet, err := r.queries.GetMeetWithTimeCount(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get meet with time count: %w", err)
	}
	return &meet, nil
}

// ListMeetsParams contains parameters for listing meets.
type ListMeetsParams struct {
	CourseType *string
	Limit      int32
	Offset     int32
}

// List lists meets with optional filtering.
func (r *MeetRepository) List(ctx context.Context, params ListMeetsParams) ([]db.ListMeetsRow, error) {
	// Convert nil to empty string for the SQL IS NULL check pattern
	courseType := ""
	if params.CourseType != nil {
		courseType = *params.CourseType
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 50
	}

	meets, err := r.queries.ListMeets(ctx, db.ListMeetsParams{
		Column1: courseType,
		Limit:   limit,
		Offset:  params.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list meets: %w", err)
	}
	return meets, nil
}

// Count returns the total number of meets matching the filter.
func (r *MeetRepository) Count(ctx context.Context, courseType *string) (int64, error) {
	ct := ""
	if courseType != nil {
		ct = *courseType
	}

	count, err := r.queries.CountMeets(ctx, ct)
	if err != nil {
		return 0, fmt.Errorf("count meets: %w", err)
	}
	return count, nil
}

// Create creates a new meet.
func (r *MeetRepository) Create(ctx context.Context, params db.CreateMeetParams) (*db.Meet, error) {
	meet, err := r.queries.CreateMeet(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create meet: %w", err)
	}
	return &meet, nil
}

// Update updates an existing meet.
func (r *MeetRepository) Update(ctx context.Context, params db.UpdateMeetParams) (*db.Meet, error) {
	meet, err := r.queries.UpdateMeet(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update meet: %w", err)
	}
	return &meet, nil
}

// Delete deletes a meet.
func (r *MeetRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteMeet(ctx, id); err != nil {
		return fmt.Errorf("delete meet: %w", err)
	}
	return nil
}

// GetRecent retrieves the most recent meets.
func (r *MeetRepository) GetRecent(ctx context.Context, courseType *string, limit int32) ([]db.GetRecentMeetsRow, error) {
	ct := ""
	if courseType != nil {
		ct = *courseType
	}

	if limit <= 0 {
		limit = 10
	}

	meets, err := r.queries.GetRecentMeets(ctx, db.GetRecentMeetsParams{
		Column1: ct,
		Limit:   limit,
	})
	if err != nil {
		return nil, fmt.Errorf("get recent meets: %w", err)
	}
	return meets, nil
}
