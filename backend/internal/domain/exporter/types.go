// Package exporter provides functionality to export swimmer data to JSON files.
package exporter

// ExportData represents the complete export structure containing all user data.
type ExportData struct {
	Swimmer   SwimmerExport    `json:"swimmer"`
	Meets     []MeetExport     `json:"meets"`
	Standards []StandardExport `json:"standards,omitempty"`
}

// SwimmerExport represents swimmer profile information for export.
type SwimmerExport struct {
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"` // YYYY-MM-DD format
	Gender    string `json:"gender"`     // "female" or "male"
}

// MeetExport represents a meet with its associated times for export.
type MeetExport struct {
	Name       string       `json:"name"`
	City       string       `json:"city"`
	Country    string       `json:"country"`
	StartDate  string       `json:"start_date"`  // YYYY-MM-DD format
	EndDate    string       `json:"end_date"`    // YYYY-MM-DD format
	CourseType string       `json:"course_type"` // "25m" or "50m"
	Times      []TimeExport `json:"times"`
}

// TimeExport represents a swim time for export.
type TimeExport struct {
	Event     string `json:"event"`      // Event code (e.g., "50FR", "100BK")
	Time      string `json:"time"`       // Time in MM:SS.HH or SS.HH format
	EventDate string `json:"event_date"` // YYYY-MM-DD format
	Notes     string `json:"notes"`      // Optional notes
}

// StandardExport represents a time standard for export (custom standards only).
type StandardExport struct {
	Name        string              `json:"name"`
	Description string              `json:"description"`
	Season      string              `json:"season"`
	CourseType  string              `json:"course_type"` // "25m" or "50m"
	Gender      string              `json:"gender"`      // "female" or "male"
	Times       map[string][]string `json:"times"`       // Event -> [age_group:time, ...]
}
