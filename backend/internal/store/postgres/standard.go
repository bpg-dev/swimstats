package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/bpg/swimstats/backend/internal/store/db"
)

// StandardRepository provides standard data access.
type StandardRepository struct {
	queries *db.Queries
}

// NewStandardRepository creates a new standard repository.
func NewStandardRepository(queries *db.Queries) *StandardRepository {
	return &StandardRepository{queries: queries}
}

// Get retrieves a standard by ID.
func (r *StandardRepository) Get(ctx context.Context, id uuid.UUID) (*db.TimeStandard, error) {
	standard, err := r.queries.GetStandard(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get standard: %w", err)
	}
	return &standard, nil
}

// ListStandardsParams contains parameters for listing standards.
type ListStandardsParams struct {
	CourseType *string
	Gender     *string
}

// List lists standards with optional filtering.
func (r *StandardRepository) List(ctx context.Context, params ListStandardsParams) ([]db.TimeStandard, error) {
	courseType := ""
	if params.CourseType != nil {
		courseType = *params.CourseType
	}

	gender := ""
	if params.Gender != nil {
		gender = *params.Gender
	}

	standards, err := r.queries.ListStandards(ctx, db.ListStandardsParams{
		Column1: courseType,
		Column2: gender,
	})
	if err != nil {
		return nil, fmt.Errorf("list standards: %w", err)
	}
	return standards, nil
}

// Create creates a new standard.
func (r *StandardRepository) Create(ctx context.Context, params db.CreateStandardParams) (*db.TimeStandard, error) {
	standard, err := r.queries.CreateStandard(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create standard: %w", err)
	}
	return &standard, nil
}

// Update updates an existing standard.
func (r *StandardRepository) Update(ctx context.Context, params db.UpdateStandardParams) (*db.TimeStandard, error) {
	standard, err := r.queries.UpdateStandard(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update standard: %w", err)
	}
	return &standard, nil
}

// Delete deletes a standard.
func (r *StandardRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteStandard(ctx, id); err != nil {
		return fmt.Errorf("delete standard: %w", err)
	}
	return nil
}

// Exists checks if a standard exists.
func (r *StandardRepository) Exists(ctx context.Context, id uuid.UUID) (bool, error) {
	exists, err := r.queries.StandardExists(ctx, id)
	if err != nil {
		return false, fmt.Errorf("check standard exists: %w", err)
	}
	return exists, nil
}

// NameExists checks if a standard name is already taken (excluding the given ID).
func (r *StandardRepository) NameExists(ctx context.Context, name string, excludeID uuid.UUID) (bool, error) {
	exists, err := r.queries.StandardNameExists(ctx, db.StandardNameExistsParams{
		Name: name,
		ID:   excludeID,
	})
	if err != nil {
		return false, fmt.Errorf("check standard name exists: %w", err)
	}
	return exists, nil
}

// ListTimes lists all times for a standard.
func (r *StandardRepository) ListTimes(ctx context.Context, standardID uuid.UUID) ([]db.StandardTime, error) {
	times, err := r.queries.ListStandardTimes(ctx, standardID)
	if err != nil {
		return nil, fmt.Errorf("list standard times: %w", err)
	}
	return times, nil
}

// UpsertTime creates or updates a standard time.
func (r *StandardRepository) UpsertTime(ctx context.Context, params db.UpsertStandardTimeParams) (*db.StandardTime, error) {
	st, err := r.queries.UpsertStandardTime(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("upsert standard time: %w", err)
	}
	return &st, nil
}

// DeleteTimes deletes all times for a standard.
func (r *StandardRepository) DeleteTimes(ctx context.Context, standardID uuid.UUID) error {
	if err := r.queries.DeleteStandardTimesByStandardID(ctx, standardID); err != nil {
		return fmt.Errorf("delete standard times: %w", err)
	}
	return nil
}

// GetTimeForEventAndAge retrieves a specific standard time.
func (r *StandardRepository) GetTimeForEventAndAge(ctx context.Context, standardID uuid.UUID, event, ageGroup string) (*db.StandardTime, error) {
	st, err := r.queries.GetStandardTimeForEventAndAge(ctx, db.GetStandardTimeForEventAndAgeParams{
		StandardID: standardID,
		Event:      event,
		AgeGroup:   ageGroup,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get standard time: %w", err)
	}
	return &st, nil
}
