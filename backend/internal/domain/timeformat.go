package domain

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// TimeMS represents a swim time in milliseconds.
type TimeMS int

// FormatTime converts milliseconds to display format (MM:SS.ss or SS.ss).
func FormatTime(ms int) string {
	if ms <= 0 {
		return "0.00"
	}

	totalSeconds := ms / 1000
	hundredths := (ms % 1000) / 10
	minutes := totalSeconds / 60
	seconds := totalSeconds % 60

	if minutes == 0 {
		return fmt.Sprintf("%d.%02d", seconds, hundredths)
	}
	return fmt.Sprintf("%d:%02d.%02d", minutes, seconds, hundredths)
}

// ParseTime converts display format to milliseconds.
// Supported formats: "28.45", "1:05.32", "16:42.18"
func ParseTime(s string) (int, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, NewValidationError("time", "time cannot be empty")
	}

	// Pattern for MM:SS.ss or SS.ss
	withMinutes := regexp.MustCompile(`^(\d+):(\d{1,2})\.(\d{1,2})$`)
	withoutMinutes := regexp.MustCompile(`^(\d+)\.(\d{1,2})$`)

	var minutes, seconds, hundredths int
	var err error

	if matches := withMinutes.FindStringSubmatch(s); matches != nil {
		minutes, err = strconv.Atoi(matches[1])
		if err != nil {
			return 0, NewValidationError("time", "invalid minutes value")
		}
		seconds, err = strconv.Atoi(matches[2])
		if err != nil {
			return 0, NewValidationError("time", "invalid seconds value")
		}
		hundredths, err = parseHundredths(matches[3])
		if err != nil {
			return 0, err
		}
	} else if matches := withoutMinutes.FindStringSubmatch(s); matches != nil {
		seconds, err = strconv.Atoi(matches[1])
		if err != nil {
			return 0, NewValidationError("time", "invalid seconds value")
		}
		hundredths, err = parseHundredths(matches[2])
		if err != nil {
			return 0, err
		}
	} else {
		return 0, NewValidationError("time", "invalid time format, expected SS.ss or MM:SS.ss")
	}

	// Validate ranges
	if seconds >= 60 && minutes > 0 {
		return 0, NewValidationError("time", "seconds must be less than 60 when minutes are present")
	}
	if hundredths > 99 {
		return 0, NewValidationError("time", "hundredths must be less than 100")
	}

	totalMs := (minutes*60+seconds)*1000 + hundredths*10
	if totalMs <= 0 {
		return 0, NewValidationError("time", "time must be greater than zero")
	}

	return totalMs, nil
}

// parseHundredths handles 1 or 2 digit hundredths (e.g., "5" -> 50, "05" -> 5)
func parseHundredths(s string) (int, error) {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0, NewValidationError("time", "invalid hundredths value")
	}
	// If single digit, multiply by 10 (e.g., "5" means 0.50)
	if len(s) == 1 {
		val *= 10
	}
	return val, nil
}

// TimeDifference calculates the difference between two times and returns formatted string.
// Positive result means time1 is slower than time2.
func TimeDifference(time1Ms, time2Ms int) string {
	diff := time1Ms - time2Ms
	if diff == 0 {
		return "0.00"
	}

	prefix := "+"
	if diff < 0 {
		prefix = "-"
		diff = -diff
	}

	return prefix + FormatTime(diff)
}

// TimeDifferencePercent calculates percentage difference.
// Positive means time1 is slower than time2.
func TimeDifferencePercent(time1Ms, time2Ms int) float64 {
	if time2Ms == 0 {
		return 0
	}
	return float64(time1Ms-time2Ms) / float64(time2Ms) * 100
}
