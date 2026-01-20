// Package standard provides time standard domain logic.
package standard

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

// Service provides standard business logic.
type Service struct {
	repo *postgres.StandardRepository
}

// NewService creates a new standard service.
func NewService(repo *postgres.StandardRepository) *Service {
	return &Service{repo: repo}
}

// Standard represents a time standard with computed fields.
type Standard struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CourseType  string    `json:"course_type"`
	Gender      string    `json:"gender"`
	IsPreloaded bool      `json:"is_preloaded"`
}

// StandardTime represents a qualifying time within a standard.
type StandardTime struct {
	Event         string `json:"event"`
	AgeGroup      string `json:"age_group"`
	TimeMs        int    `json:"time_ms"`
	TimeFormatted string `json:"time_formatted"`
}

// StandardWithTimes includes the standard and all its qualifying times.
type StandardWithTimes struct {
	Standard
	Times []StandardTime `json:"times"`
}

// StandardList represents a list of standards.
type StandardList struct {
	Standards []Standard `json:"standards"`
}

// Input represents input for creating/updating a standard.
type Input struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	CourseType  string `json:"course_type"`
	Gender      string `json:"gender"`
}

// Validate validates the standard input.
func (i Input) Validate() error {
	if i.Name == "" {
		return errors.New("name is required")
	}
	if len(i.Name) > 255 {
		return errors.New("name must be at most 255 characters")
	}
	if i.CourseType != "25m" && i.CourseType != "50m" {
		return errors.New("course_type must be '25m' or '50m'")
	}
	if i.Gender != "female" && i.Gender != "male" {
		return errors.New("gender must be 'female' or 'male'")
	}
	return nil
}

// StandardTimeInput represents input for a qualifying time.
type StandardTimeInput struct {
	Event    string `json:"event"`
	AgeGroup string `json:"age_group"`
	TimeMs   int    `json:"time_ms"`
}

// Validate validates the standard time input.
func (i StandardTimeInput) Validate() error {
	if !domain.EventCode(i.Event).IsValid() {
		return fmt.Errorf("invalid event code: %s", i.Event)
	}
	if !domain.AgeGroup(i.AgeGroup).IsValid() {
		return fmt.Errorf("invalid age group: %s", i.AgeGroup)
	}
	if i.TimeMs <= 0 {
		return errors.New("time_ms must be greater than 0")
	}
	return nil
}

// ImportInput represents input for importing a complete standard with times.
type ImportInput struct {
	Name        string              `json:"name"`
	Description string              `json:"description,omitempty"`
	CourseType  string              `json:"course_type"`
	Gender      string              `json:"gender"`
	Times       []StandardTimeInput `json:"times"`
}

// Validate validates the import input.
func (i ImportInput) Validate() error {
	input := Input{
		Name:        i.Name,
		Description: i.Description,
		CourseType:  i.CourseType,
		Gender:      i.Gender,
	}
	if err := input.Validate(); err != nil {
		return err
	}
	for idx, t := range i.Times {
		if err := t.Validate(); err != nil {
			return fmt.Errorf("times[%d]: %w", idx, err)
		}
	}
	return nil
}

// ListParams contains parameters for listing standards.
type ListParams struct {
	CourseType *string
	Gender     *string
}

// Get retrieves a standard by ID (without times).
func (s *Service) Get(ctx context.Context, id uuid.UUID) (*Standard, error) {
	dbStandard, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return toStandard(dbStandard), nil
}

// GetWithTimes retrieves a standard with all its qualifying times.
func (s *Service) GetWithTimes(ctx context.Context, id uuid.UUID) (*StandardWithTimes, error) {
	dbStandard, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	dbTimes, err := s.repo.ListTimes(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get standard times: %w", err)
	}

	return toStandardWithTimes(dbStandard, dbTimes), nil
}

// List retrieves all standards matching the filter.
func (s *Service) List(ctx context.Context, params ListParams) (*StandardList, error) {
	dbStandards, err := s.repo.List(ctx, postgres.ListStandardsParams{
		CourseType: params.CourseType,
		Gender:     params.Gender,
	})
	if err != nil {
		return nil, fmt.Errorf("list standards: %w", err)
	}

	standards := make([]Standard, len(dbStandards))
	for i, dbStd := range dbStandards {
		standards[i] = *toStandard(&dbStd)
	}

	return &StandardList{Standards: standards}, nil
}

// Create creates a new standard.
func (s *Service) Create(ctx context.Context, input Input) (*Standard, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Check for duplicate name
	emptyID := uuid.UUID{}
	exists, err := s.repo.NameExists(ctx, input.Name, emptyID)
	if err != nil {
		return nil, fmt.Errorf("check name exists: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("validation: a standard with this name already exists")
	}

	var description pgtype.Text
	if input.Description != "" {
		description = pgtype.Text{String: input.Description, Valid: true}
	}

	dbStandard, err := s.repo.Create(ctx, db.CreateStandardParams{
		Name:        input.Name,
		Description: description,
		CourseType:  input.CourseType,
		Gender:      input.Gender,
		IsPreloaded: false,
	})
	if err != nil {
		return nil, fmt.Errorf("create standard: %w", err)
	}

	return toStandard(dbStandard), nil
}

// Update updates an existing standard.
func (s *Service) Update(ctx context.Context, id uuid.UUID, input Input) (*Standard, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Check standard exists
	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	// Prevent editing preloaded standards name/description but allow course_type/gender changes
	if existing.IsPreloaded {
		return nil, errors.New("preloaded standards cannot be modified")
	}

	// Check for duplicate name (excluding current standard)
	exists, err := s.repo.NameExists(ctx, input.Name, id)
	if err != nil {
		return nil, fmt.Errorf("check name exists: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("validation: a standard with this name already exists")
	}

	var description pgtype.Text
	if input.Description != "" {
		description = pgtype.Text{String: input.Description, Valid: true}
	}

	dbStandard, err := s.repo.Update(ctx, db.UpdateStandardParams{
		ID:          id,
		Name:        input.Name,
		Description: description,
		CourseType:  input.CourseType,
		Gender:      input.Gender,
	})
	if err != nil {
		return nil, fmt.Errorf("update standard: %w", err)
	}

	return toStandard(dbStandard), nil
}

// Delete deletes a standard.
func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	// Check if standard exists
	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}

	// Prevent deleting preloaded standards
	if existing.IsPreloaded {
		return errors.New("preloaded standards cannot be deleted")
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete standard: %w", err)
	}
	return nil
}

// SetTimes replaces all times for a standard with the provided list.
func (s *Service) SetTimes(ctx context.Context, standardID uuid.UUID, times []StandardTimeInput) (*StandardWithTimes, error) {
	// Check standard exists
	dbStandard, err := s.repo.Get(ctx, standardID)
	if err != nil {
		return nil, err
	}

	// Validate all times first
	for idx, t := range times {
		if err := t.Validate(); err != nil {
			return nil, fmt.Errorf("times[%d]: %w", idx, err)
		}
	}

	// Delete existing times
	if err := s.repo.DeleteTimes(ctx, standardID); err != nil {
		return nil, fmt.Errorf("delete existing times: %w", err)
	}

	// Insert new times
	dbTimes := make([]db.StandardTime, 0, len(times))
	for _, t := range times {
		dbTime, err := s.repo.UpsertTime(ctx, db.UpsertStandardTimeParams{
			StandardID: standardID,
			Event:      t.Event,
			AgeGroup:   t.AgeGroup,
			TimeMs:     int32(t.TimeMs),
		})
		if err != nil {
			return nil, fmt.Errorf("insert time: %w", err)
		}
		dbTimes = append(dbTimes, *dbTime)
	}

	return toStandardWithTimes(dbStandard, dbTimes), nil
}

// Import creates a new standard with all its times in one operation.
func (s *Service) Import(ctx context.Context, input ImportInput) (*StandardWithTimes, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	// Check for duplicate name
	emptyID := uuid.UUID{}
	exists, err := s.repo.NameExists(ctx, input.Name, emptyID)
	if err != nil {
		return nil, fmt.Errorf("check name exists: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("validation: a standard with this name already exists")
	}

	var description pgtype.Text
	if input.Description != "" {
		description = pgtype.Text{String: input.Description, Valid: true}
	}

	// Create the standard
	dbStandard, err := s.repo.Create(ctx, db.CreateStandardParams{
		Name:        input.Name,
		Description: description,
		CourseType:  input.CourseType,
		Gender:      input.Gender,
		IsPreloaded: false,
	})
	if err != nil {
		return nil, fmt.Errorf("create standard: %w", err)
	}

	// Insert all times
	dbTimes := make([]db.StandardTime, 0, len(input.Times))
	for _, t := range input.Times {
		dbTime, err := s.repo.UpsertTime(ctx, db.UpsertStandardTimeParams{
			StandardID: dbStandard.ID,
			Event:      t.Event,
			AgeGroup:   t.AgeGroup,
			TimeMs:     int32(t.TimeMs),
		})
		if err != nil {
			return nil, fmt.Errorf("insert time: %w", err)
		}
		dbTimes = append(dbTimes, *dbTime)
	}

	return toStandardWithTimes(dbStandard, dbTimes), nil
}

// Conversion helpers

func toStandard(dbStd *db.TimeStandard) *Standard {
	description := ""
	if dbStd.Description.Valid {
		description = dbStd.Description.String
	}
	return &Standard{
		ID:          dbStd.ID,
		Name:        dbStd.Name,
		Description: description,
		CourseType:  dbStd.CourseType,
		Gender:      dbStd.Gender,
		IsPreloaded: dbStd.IsPreloaded,
	}
}

func toStandardWithTimes(dbStd *db.TimeStandard, dbTimes []db.StandardTime) *StandardWithTimes {
	times := make([]StandardTime, len(dbTimes))
	for i, t := range dbTimes {
		times[i] = StandardTime{
			Event:         t.Event,
			AgeGroup:      t.AgeGroup,
			TimeMs:        int(t.TimeMs),
			TimeFormatted: domain.FormatTime(int(t.TimeMs)),
		}
	}

	std := toStandard(dbStd)
	return &StandardWithTimes{
		Standard: *std,
		Times:    times,
	}
}
