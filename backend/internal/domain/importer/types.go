// Package importer provides functionality to import swimmer data from JSON files.
package importer

import (
	"time"
)

// ImportData represents the root structure for importing swimmer data.
// All sections are optional - if present, they will REPLACE existing data.
type ImportData struct {
	FormatVersion string         `json:"format_version,omitempty"`
	Swimmer       *SwimmerData   `json:"swimmer,omitempty"`
	Meets         []MeetData     `json:"meets,omitempty"`
	Standards     []StandardData `json:"standards,omitempty"`
}

// SwimmerImport is deprecated, use ImportData instead.
// Kept for backward compatibility.
type SwimmerImport = ImportData

// SwimmerData represents swimmer profile information for import.
type SwimmerData struct {
	Name             string   `json:"name"`
	BirthDate        string   `json:"birth_date"`                  // YYYY-MM-DD format
	Gender           string   `json:"gender"`                      // "female" or "male"
	ThresholdPercent *float64 `json:"threshold_percent,omitempty"` // "almost there" threshold percentage
}

// MeetData represents a meet with its associated times for import.
type MeetData struct {
	Name       string     `json:"name"`
	City       string     `json:"city"`
	Country    string     `json:"country"`
	StartDate  string     `json:"start_date"`  // YYYY-MM-DD format
	EndDate    string     `json:"end_date"`    // YYYY-MM-DD format
	CourseType string     `json:"course_type"` // "25m" or "50m"
	Times      []TimeData `json:"times"`
}

// TimeData represents a swim time for import.
type TimeData struct {
	Event     string `json:"event"`      // Event code (e.g., "50FR", "100BK")
	Time      string `json:"time"`       // Time in MM:SS.HH or SS.HH format
	EventDate string `json:"event_date"` // YYYY-MM-DD format
	Notes     string `json:"notes"`      // Optional notes
}

// StandardData represents a time standard for import.
type StandardData struct {
	Name        string              `json:"name"`
	Description string              `json:"description"`
	CourseType  string              `json:"course_type"` // "25m" or "50m"
	Gender      string              `json:"gender"`      // "female" or "male"
	Times       map[string][]string `json:"times"`       // Event -> [age_group:time, ...]
}

// ImportRequest wraps ImportData with a confirmation flag.
type ImportRequest struct {
	Data      ImportData `json:"data"`
	Confirmed bool       `json:"confirmed"`
}

// PreviewResult contains information about what will be deleted during import.
type PreviewResult struct {
	WillReplaceSwimmer    bool `json:"will_replace_swimmer"`
	CurrentMeetsCount     int  `json:"current_meets_count"`
	CurrentTimesCount     int  `json:"current_times_count"`
	CurrentStandardsCount int  `json:"current_standards_count"`
	NewMeetsCount         int  `json:"new_meets_count"`
	NewTimesCount         int  `json:"new_times_count"`
	NewStandardsCount     int  `json:"new_standards_count"`
}

// ImportResult contains the results of an import operation.
type ImportResult struct {
	Success          bool     `json:"success"`
	SwimmerReplaced  bool     `json:"swimmer_replaced,omitempty"`
	SwimmerID        string   `json:"swimmer_id,omitempty"`
	SwimmerName      string   `json:"swimmer_name,omitempty"`
	MeetsDeleted     int      `json:"meets_deleted,omitempty"`
	MeetsCreated     int      `json:"meets_created"`
	TimesCreated     int      `json:"times_created"`
	StandardsDeleted int      `json:"standards_deleted,omitempty"`
	StandardsCreated int      `json:"standards_created"`
	Errors           []string `json:"errors,omitempty"`
	SkippedTimes     int      `json:"skipped_times,omitempty"`
	SkippedReason    []string `json:"skipped_reason,omitempty"`
}

// ParsedSwimmer is the validated swimmer data ready for database insertion.
type ParsedSwimmer struct {
	Name             string
	BirthDate        time.Time
	Gender           string
	ThresholdPercent *float64
}

// ParsedMeet is the validated meet data ready for database insertion.
type ParsedMeet struct {
	Name       string
	City       string
	Country    string
	StartDate  time.Time
	EndDate    time.Time
	CourseType string
	Times      []ParsedTime
}

// ParsedTime is the validated time data ready for database insertion.
type ParsedTime struct {
	Event     string
	TimeMS    int32
	EventDate time.Time
	Notes     string
}

// ParsedStandard is the validated standard data ready for database insertion.
type ParsedStandard struct {
	Name        string
	Description string
	CourseType  string
	Gender      string
	Times       map[string][]ParsedStandardTime
}

// ParsedStandardTime represents a single time entry in a standard.
type ParsedStandardTime struct {
	AgeGroup string
	TimeMS   int32
}
