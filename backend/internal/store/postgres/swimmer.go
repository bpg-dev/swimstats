package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/bpg/swimstats/backend/internal/store/db"
)

// SwimmerRepository provides swimmer data access.
type SwimmerRepository struct {
	queries *db.Queries
}

// NewSwimmerRepository creates a new swimmer repository.
func NewSwimmerRepository(queries *db.Queries) *SwimmerRepository {
	return &SwimmerRepository{queries: queries}
}

// Get retrieves a swimmer by ID.
func (r *SwimmerRepository) Get(ctx context.Context, id uuid.UUID) (*db.Swimmer, error) {
	swimmer, err := r.queries.GetSwimmer(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get swimmer: %w", err)
	}
	return &swimmer, nil
}

// GetFirst retrieves the first swimmer (for single-user mode).
func (r *SwimmerRepository) GetFirst(ctx context.Context) (*db.Swimmer, error) {
	swimmer, err := r.queries.GetSwimmerByUserID(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get first swimmer: %w", err)
	}
	return &swimmer, nil
}

// Create creates a new swimmer.
func (r *SwimmerRepository) Create(ctx context.Context, params db.CreateSwimmerParams) (*db.Swimmer, error) {
	swimmer, err := r.queries.CreateSwimmer(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create swimmer: %w", err)
	}
	return &swimmer, nil
}

// Update updates an existing swimmer.
func (r *SwimmerRepository) Update(ctx context.Context, params db.UpdateSwimmerParams) (*db.Swimmer, error) {
	swimmer, err := r.queries.UpdateSwimmer(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update swimmer: %w", err)
	}
	return &swimmer, nil
}

// Delete deletes a swimmer.
func (r *SwimmerRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteSwimmer(ctx, id); err != nil {
		return fmt.Errorf("delete swimmer: %w", err)
	}
	return nil
}

// List lists all swimmers.
func (r *SwimmerRepository) List(ctx context.Context) ([]db.Swimmer, error) {
	swimmers, err := r.queries.ListSwimmers(ctx)
	if err != nil {
		return nil, fmt.Errorf("list swimmers: %w", err)
	}
	return swimmers, nil
}

// Count returns the total number of swimmers.
func (r *SwimmerRepository) Count(ctx context.Context) (int64, error) {
	count, err := r.queries.CountSwimmers(ctx)
	if err != nil {
		return 0, fmt.Errorf("count swimmers: %w", err)
	}
	return count, nil
}
