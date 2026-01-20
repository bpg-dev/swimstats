// Package swimmer provides swimmer domain logic.
package swimmer

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/bpg/swimstats/backend/internal/domain"
	"github.com/bpg/swimstats/backend/internal/store/db"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// Service provides swimmer business logic.
type Service struct {
	repo *postgres.SwimmerRepository
}

// NewService creates a new swimmer service.
func NewService(repo *postgres.SwimmerRepository) *Service {
	return &Service{repo: repo}
}

// Swimmer represents a swimmer with computed fields.
type Swimmer struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	BirthDate       string    `json:"birth_date"`
	Gender          string    `json:"gender"`
	CurrentAge      int       `json:"current_age"`
	CurrentAgeGroup string    `json:"current_age_group"`
}

// Input represents input for creating/updating a swimmer.
type Input struct {
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"`
	Gender    string `json:"gender"`
}

// Validate validates the swimmer input.
func (i Input) Validate() error {
	if i.Name == "" {
		return errors.New("name is required")
	}
	if len(i.Name) > 255 {
		return errors.New("name must be at most 255 characters")
	}
	if i.BirthDate == "" {
		return errors.New("birth_date is required")
	}
	if _, err := time.Parse("2006-01-02", i.BirthDate); err != nil {
		return errors.New("birth_date must be a valid date in YYYY-MM-DD format")
	}
	if i.Gender != "male" && i.Gender != "female" {
		return errors.New("gender must be 'male' or 'female'")
	}
	return nil
}

// Get retrieves the swimmer profile.
// In single-user mode, returns the first swimmer.
func (s *Service) Get(ctx context.Context) (*Swimmer, error) {
	dbSwimmer, err := s.repo.GetFirst(ctx)
	if err != nil {
		if errors.Is(err, postgres.ErrNotFound) {
			return nil, postgres.ErrNotFound
		}
		return nil, fmt.Errorf("get swimmer: %w", err)
	}
	return toSwimmer(dbSwimmer), nil
}

// GetByID retrieves a swimmer by ID.
func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Swimmer, error) {
	dbSwimmer, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return toSwimmer(dbSwimmer), nil
}

// Create creates a new swimmer.
func (s *Service) Create(ctx context.Context, input Input) (*Swimmer, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	birthDate, _ := time.Parse("2006-01-02", input.BirthDate)

	params := db.CreateSwimmerParams{
		Name:      input.Name,
		BirthDate: pgtype.Date{Time: birthDate, Valid: true},
		Gender:    input.Gender,
	}

	dbSwimmer, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create swimmer: %w", err)
	}
	return toSwimmer(dbSwimmer), nil
}

// Update updates an existing swimmer.
func (s *Service) Update(ctx context.Context, id uuid.UUID, input Input) (*Swimmer, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	birthDate, _ := time.Parse("2006-01-02", input.BirthDate)

	params := db.UpdateSwimmerParams{
		ID:        id,
		Name:      input.Name,
		BirthDate: pgtype.Date{Time: birthDate, Valid: true},
		Gender:    input.Gender,
	}

	dbSwimmer, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update swimmer: %w", err)
	}
	return toSwimmer(dbSwimmer), nil
}

// CreateOrUpdate creates a swimmer if none exists, otherwise updates the first one.
func (s *Service) CreateOrUpdate(ctx context.Context, input Input) (*Swimmer, bool, error) {
	// Check if swimmer exists
	existing, err := s.repo.GetFirst(ctx)
	if err != nil && !errors.Is(err, postgres.ErrNotFound) {
		return nil, false, fmt.Errorf("check existing: %w", err)
	}

	if existing != nil {
		// Update existing
		swimmer, err := s.Update(ctx, existing.ID, input)
		return swimmer, false, err
	}

	// Create new
	swimmer, err := s.Create(ctx, input)
	return swimmer, true, err
}

// Exists checks if a swimmer exists.
func (s *Service) Exists(ctx context.Context) (bool, error) {
	count, err := s.repo.Count(ctx)
	if err != nil {
		return false, fmt.Errorf("count swimmers: %w", err)
	}
	return count > 0, nil
}

// toSwimmer converts a database swimmer to a domain swimmer with computed fields.
func toSwimmer(dbSwimmer *db.Swimmer) *Swimmer {
	birthDate := dbSwimmer.BirthDate.Time.Format("2006-01-02")
	currentAge := domain.AgeAtDate(dbSwimmer.BirthDate.Time, time.Now())
	ageGroup := domain.AgeGroupFromAge(currentAge)

	return &Swimmer{
		ID:              dbSwimmer.ID,
		Name:            dbSwimmer.Name,
		BirthDate:       birthDate,
		Gender:          dbSwimmer.Gender,
		CurrentAge:      currentAge,
		CurrentAgeGroup: string(ageGroup),
	}
}
