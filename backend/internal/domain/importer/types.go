// Package importer provides functionality to import swimmer data from JSON files.
package importer

import (
	"time"
)

// SwimmerImport represents the root structure for importing swimmer data.
type SwimmerImport struct {
	Swimmer SwimmerData `json:"swimmer"`
	Meets   []MeetData  `json:"meets"`
}

// SwimmerData represents swimmer profile information for import.
type SwimmerData struct {
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"` // YYYY-MM-DD format
	Gender    string `json:"gender"`     // "female" or "male"
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

// ImportResult contains the results of an import operation.
type ImportResult struct {
	Success       bool     `json:"success"`
	SwimmerID     string   `json:"swimmer_id,omitempty"`
	SwimmerName   string   `json:"swimmer_name,omitempty"`
	MeetsCreated  int      `json:"meets_created"`
	TimesCreated  int      `json:"times_created"`
	Errors        []string `json:"errors,omitempty"`
	SkippedTimes  int      `json:"skipped_times,omitempty"`
	SkippedReason []string `json:"skipped_reason,omitempty"`
}

// ParsedSwimmer is the validated swimmer data ready for database insertion.
type ParsedSwimmer struct {
	Name      string
	BirthDate time.Time
	Gender    string
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
