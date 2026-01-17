// Package domain contains core domain types and utilities for SwimStats.
package domain

import "fmt"

// CourseType represents the pool length.
type CourseType string

const (
	Course25m CourseType = "25m"
	Course50m CourseType = "50m"
)

// IsValid checks if the course type is valid.
func (c CourseType) IsValid() bool {
	return c == Course25m || c == Course50m
}

// String returns the string representation.
func (c CourseType) String() string {
	return string(c)
}

// Gender represents swimmer's gender for standards matching.
type Gender string

const (
	GenderFemale Gender = "female"
	GenderMale   Gender = "male"
)

// IsValid checks if the gender is valid.
func (g Gender) IsValid() bool {
	return g == GenderFemale || g == GenderMale
}

// String returns the string representation.
func (g Gender) String() string {
	return string(g)
}

// AgeGroup represents competition age groups per Swimming Canada.
type AgeGroup string

const (
	AgeGroup10U   AgeGroup = "10U"
	AgeGroup11_12 AgeGroup = "11-12"
	AgeGroup13_14 AgeGroup = "13-14"
	AgeGroup15_17 AgeGroup = "15-17"
	AgeGroupOpen  AgeGroup = "OPEN"
)

// IsValid checks if the age group is valid.
func (a AgeGroup) IsValid() bool {
	switch a {
	case AgeGroup10U, AgeGroup11_12, AgeGroup13_14, AgeGroup15_17, AgeGroupOpen:
		return true
	default:
		return false
	}
}

// String returns the string representation.
func (a AgeGroup) String() string {
	return string(a)
}

// EventCode represents standard swimming events.
type EventCode string

// Freestyle events.
const (
	Event50FR   EventCode = "50FR"
	Event100FR  EventCode = "100FR"
	Event200FR  EventCode = "200FR"
	Event400FR  EventCode = "400FR"
	Event800FR  EventCode = "800FR"
	Event1500FR EventCode = "1500FR"
)

// Backstroke events.
const (
	Event50BK  EventCode = "50BK"
	Event100BK EventCode = "100BK"
	Event200BK EventCode = "200BK"
)

// Breaststroke events.
const (
	Event50BR  EventCode = "50BR"
	Event100BR EventCode = "100BR"
	Event200BR EventCode = "200BR"
)

// Butterfly events.
const (
	Event50FL  EventCode = "50FL"
	Event100FL EventCode = "100FL"
	Event200FL EventCode = "200FL"
)

// Individual Medley events.
const (
	Event200IM EventCode = "200IM"
	Event400IM EventCode = "400IM"
)

// ValidEventCodes contains all valid event codes.
var ValidEventCodes = []EventCode{
	Event50FR, Event100FR, Event200FR, Event400FR, Event800FR, Event1500FR,
	Event50BK, Event100BK, Event200BK,
	Event50BR, Event100BR, Event200BR,
	Event50FL, Event100FL, Event200FL,
	Event200IM, Event400IM,
}

// IsValid checks if the event code is valid.
func (e EventCode) IsValid() bool {
	for _, valid := range ValidEventCodes {
		if e == valid {
			return true
		}
	}
	return false
}

// String returns the string representation.
func (e EventCode) String() string {
	return string(e)
}

// Description returns human-readable event name.
func (e EventCode) Description() string {
	descriptions := map[EventCode]string{
		Event50FR:   "50m Freestyle",
		Event100FR:  "100m Freestyle",
		Event200FR:  "200m Freestyle",
		Event400FR:  "400m Freestyle",
		Event800FR:  "800m Freestyle",
		Event1500FR: "1500m Freestyle",
		Event50BK:   "50m Backstroke",
		Event100BK:  "100m Backstroke",
		Event200BK:  "200m Backstroke",
		Event50BR:   "50m Breaststroke",
		Event100BR:  "100m Breaststroke",
		Event200BR:  "200m Breaststroke",
		Event50FL:   "50m Butterfly",
		Event100FL:  "100m Butterfly",
		Event200FL:  "200m Butterfly",
		Event200IM:  "200m Individual Medley",
		Event400IM:  "400m Individual Medley",
	}
	if desc, ok := descriptions[e]; ok {
		return desc
	}
	return string(e)
}

// Stroke returns the stroke type for the event.
func (e EventCode) Stroke() string {
	switch e {
	case Event50FR, Event100FR, Event200FR, Event400FR, Event800FR, Event1500FR:
		return "Freestyle"
	case Event50BK, Event100BK, Event200BK:
		return "Backstroke"
	case Event50BR, Event100BR, Event200BR:
		return "Breaststroke"
	case Event50FL, Event100FL, Event200FL:
		return "Butterfly"
	case Event200IM, Event400IM:
		return "Individual Medley"
	default:
		return "Unknown"
	}
}

// EventsByStroke returns events grouped by stroke type.
func EventsByStroke() map[string][]EventCode {
	return map[string][]EventCode{
		"Freestyle":         {Event50FR, Event100FR, Event200FR, Event400FR, Event800FR, Event1500FR},
		"Backstroke":        {Event50BK, Event100BK, Event200BK},
		"Breaststroke":      {Event50BR, Event100BR, Event200BR},
		"Butterfly":         {Event50FL, Event100FL, Event200FL},
		"Individual Medley": {Event200IM, Event400IM},
	}
}

// ValidationError represents a domain validation error.
type ValidationError struct {
	Field   string
	Message string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// NewValidationError creates a new validation error.
func NewValidationError(field, message string) ValidationError {
	return ValidationError{Field: field, Message: message}
}
