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

// JSONFileInput represents the JSON file format for bulk importing standards.
type JSONFileInput struct {
	Season     string                         `json:"season"`
	Source     string                         `json:"source"`
	CourseType string                         `json:"course_type"`
	Gender     string                         `json:"gender"`
	Standards  map[string]JSONStandardMeta    `json:"standards"`
	AgeGroups  []string                       `json:"age_groups"`
	Times      map[string]map[string]JSONTime `json:"times"` // event -> age_group -> times
}

// JSONStandardMeta contains metadata for a standard in the JSON file.
type JSONStandardMeta struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

// JSONTime contains the time values for different standards.
type JSONTime map[string]string // standard_code -> time_string (e.g., "OSC" -> "1:05.32")

// JSONImportResult contains the results of a JSON file import.
type JSONImportResult struct {
	Standards []StandardWithTimes `json:"standards"`
	Imported  int                 `json:"imported"`
	Skipped   int                 `json:"skipped"`
	Errors    []string            `json:"errors,omitempty"`
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

// ImportFromJSON imports standards from a JSON file format.
// Each standard code (e.g., "OSC", "OAG") in the file creates a separate standard.
func (s *Service) ImportFromJSON(ctx context.Context, input JSONFileInput) (*JSONImportResult, error) {
	// Validate basic fields
	if input.CourseType != "25m" && input.CourseType != "50m" {
		return nil, errors.New("validation: course_type must be '25m' or '50m'")
	}
	if input.Gender != "female" && input.Gender != "male" {
		return nil, errors.New("validation: gender must be 'female' or 'male'")
	}
	if len(input.Standards) == 0 {
		return nil, errors.New("validation: no standards defined in file")
	}
	if len(input.Times) == 0 {
		return nil, errors.New("validation: no times defined in file")
	}

	result := &JSONImportResult{
		Standards: make([]StandardWithTimes, 0),
	}

	// Process each standard type (e.g., OSC, OAG)
	for code, meta := range input.Standards {
		// Build the standard name
		name := meta.Name
		if name == "" {
			name = fmt.Sprintf("%s %s %s", input.Source, code, input.Season)
		}

		// Check if standard already exists
		emptyID := uuid.UUID{}
		exists, err := s.repo.NameExists(ctx, name, emptyID)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: failed to check name: %v", code, err))
			result.Skipped++
			continue
		}
		if exists {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: standard '%s' already exists", code, name))
			result.Skipped++
			continue
		}

		// Collect times for this standard
		var times []StandardTimeInput
		for event, ageGroups := range input.Times {
			for ageGroupRaw, stdTimes := range ageGroups {
				timeStr, ok := stdTimes[code]
				if !ok || timeStr == "" {
					continue // No time for this standard
				}

				// Parse time string to milliseconds
				timeMs, err := parseTimeString(timeStr)
				if err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("%s/%s/%s: invalid time '%s': %v", code, event, ageGroupRaw, timeStr, err))
					continue
				}

				// Map age group to our format
				ageGroup := mapAgeGroup(ageGroupRaw)
				if !domain.AgeGroup(ageGroup).IsValid() {
					result.Errors = append(result.Errors, fmt.Sprintf("%s/%s: unknown age group '%s'", code, event, ageGroupRaw))
					continue
				}

				// Validate event
				if !domain.EventCode(event).IsValid() {
					result.Errors = append(result.Errors, fmt.Sprintf("%s: unknown event '%s'", code, event))
					continue
				}

				times = append(times, StandardTimeInput{
					Event:    event,
					AgeGroup: ageGroup,
					TimeMs:   timeMs,
				})
			}
		}

		if len(times) == 0 {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: no valid times found", code))
			result.Skipped++
			continue
		}

		// Create the standard with times
		importInput := ImportInput{
			Name:        name,
			Description: meta.Description,
			CourseType:  input.CourseType,
			Gender:      input.Gender,
			Times:       times,
		}

		std, err := s.Import(ctx, importInput)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: failed to import: %v", code, err))
			result.Skipped++
			continue
		}

		result.Standards = append(result.Standards, *std)
		result.Imported++
	}

	return result, nil
}

// parseTimeString parses a time string like "1:05.32" or "0:28.50" to milliseconds.
func parseTimeString(s string) (int, error) {
	if s == "" {
		return 0, errors.New("empty time string")
	}

	// Handle formats: "M:SS.ss", "MM:SS.ss", "S.ss", "SS.ss"
	var minutes, seconds, hundredths int

	// Try "M:SS.ss" or "MM:SS.ss" format first
	n, err := fmt.Sscanf(s, "%d:%d.%d", &minutes, &seconds, &hundredths)
	if err == nil && n == 3 {
		// Adjust hundredths if only one digit was provided
		if hundredths < 10 && len(s) > 0 && s[len(s)-2] == '.' {
			hundredths *= 10
		}
		totalMs := (minutes*60+seconds)*1000 + hundredths*10
		return totalMs, nil
	}

	// Try "S.ss" or "SS.ss" format (with leading "0:")
	n, err = fmt.Sscanf(s, "0:%d.%d", &seconds, &hundredths)
	if err == nil && n == 2 {
		if hundredths < 10 && len(s) > 0 && s[len(s)-2] == '.' {
			hundredths *= 10
		}
		totalMs := seconds*1000 + hundredths*10
		return totalMs, nil
	}

	// Try plain "SS.ss" format
	var secondsFloat float64
	n, err = fmt.Sscanf(s, "%f", &secondsFloat)
	if err == nil && n == 1 {
		return int(secondsFloat * 1000), nil
	}

	return 0, fmt.Errorf("cannot parse time: %s", s)
}

// mapAgeGroup maps JSON age group codes to our internal format.
func mapAgeGroup(raw string) string {
	switch raw {
	case "10U", "10&U", "10 & Under":
		return "10U"
	case "11U", "11&U", "11 & Under":
		return "10U" // Map 11U to 10U for now
	case "12", "12U":
		return "11-12"
	case "13U", "13&U", "13 & Under":
		return "13-14"
	case "14":
		return "13-14"
	case "15":
		return "15-17"
	case "16":
		return "15-17"
	case "17O", "17&O", "17 & Over", "17+", "OPEN", "Open":
		return "OPEN"
	default:
		return raw
	}
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
