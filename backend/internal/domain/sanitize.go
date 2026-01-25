package domain

import "strings"

// SanitizeString trims leading and trailing whitespace from a string.
func SanitizeString(s string) string {
	return strings.TrimSpace(s)
}

// SanitizeInput is a helper interface for inputs that can sanitize themselves.
type SanitizeInput interface {
	Sanitize()
}
