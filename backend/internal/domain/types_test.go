package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEventCode_IsSplit(t *testing.T) {
	tests := []struct {
		event    EventCode
		expected bool
	}{
		{Event50FRS, true},
		{Event100FRS, true},
		{Event200FRS, true},
		{Event50BKS, true},
		{Event100BKS, true},
		{Event50FR, false},
		{Event100FR, false},
		{Event200FR, false},
		{Event400FR, false},
		{Event50BK, false},
		{Event100BK, false},
		{Event200IM, false},
		{EventCode("INVALID"), false},
	}

	for _, tc := range tests {
		t.Run(string(tc.event), func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.event.IsSplit())
		})
	}
}

func TestEventCode_BaseEvent(t *testing.T) {
	tests := []struct {
		event    EventCode
		expected EventCode
	}{
		{Event50FRS, Event50FR},
		{Event100FRS, Event100FR},
		{Event200FRS, Event200FR},
		{Event50BKS, Event50BK},
		{Event100BKS, Event100BK},
		// Non-split events return themselves
		{Event50FR, Event50FR},
		{Event100FR, Event100FR},
		{Event200IM, Event200IM},
		{Event400FR, Event400FR},
	}

	for _, tc := range tests {
		t.Run(string(tc.event), func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.event.BaseEvent())
		})
	}
}

func TestEventCode_SplitVariant(t *testing.T) {
	tests := []struct {
		event         EventCode
		expectedSplit EventCode
		expectedOk    bool
	}{
		{Event50FR, Event50FRS, true},
		{Event100FR, Event100FRS, true},
		{Event200FR, Event200FRS, true},
		{Event50BK, Event50BKS, true},
		{Event100BK, Event100BKS, true},
		// Events without split variants
		{Event400FR, "", false},
		{Event800FR, "", false},
		{Event1500FR, "", false},
		{Event200BK, "", false},
		{Event50BR, "", false},
		{Event200IM, "", false},
		// Split events themselves don't have split variants
		{Event100FRS, "", false},
		{Event50BKS, "", false},
	}

	for _, tc := range tests {
		t.Run(string(tc.event), func(t *testing.T) {
			split, ok := tc.event.SplitVariant()
			assert.Equal(t, tc.expectedOk, ok)
			assert.Equal(t, tc.expectedSplit, split)
		})
	}
}

func TestEventCode_IsValid_SplitCodes(t *testing.T) {
	// Split codes should be valid
	splitCodes := []EventCode{Event50FRS, Event100FRS, Event200FRS, Event50BKS, Event100BKS}
	for _, code := range splitCodes {
		t.Run(string(code)+"_valid", func(t *testing.T) {
			assert.True(t, code.IsValid())
		})
	}

	// Invalid split-like codes should not be valid
	invalidCodes := []EventCode{"400FRS", "800FRS", "1500FRS", "200BKS", "50BRS", "100FLS", "200IMS"}
	for _, code := range invalidCodes {
		t.Run(string(code)+"_invalid", func(t *testing.T) {
			assert.False(t, code.IsValid())
		})
	}
}

func TestIndividualEventCodes(t *testing.T) {
	// Should contain exactly the original 17 base events
	assert.Len(t, IndividualEventCodes, 17)

	// Should not contain any split events
	for _, code := range IndividualEventCodes {
		assert.False(t, code.IsSplit(), "IndividualEventCodes should not contain split event %s", code)
	}

	// Should contain known base events
	expected := []EventCode{
		Event50FR, Event100FR, Event200FR, Event400FR, Event800FR, Event1500FR,
		Event50BK, Event100BK, Event200BK,
		Event50BR, Event100BR, Event200BR,
		Event50FL, Event100FL, Event200FL,
		Event200IM, Event400IM,
	}
	assert.Equal(t, expected, IndividualEventCodes)
}

func TestSplitEventCodes(t *testing.T) {
	assert.Len(t, SplitEventCodes, 5)

	// All should be split events
	for _, code := range SplitEventCodes {
		assert.True(t, code.IsSplit(), "SplitEventCodes should only contain split events, got %s", code)
		assert.True(t, code.IsValid(), "SplitEventCodes should only contain valid events, got %s", code)
	}

	expected := []EventCode{Event50FRS, Event100FRS, Event200FRS, Event50BKS, Event100BKS}
	assert.Equal(t, expected, SplitEventCodes)
}

func TestValidEventCodes_IncludesSplits(t *testing.T) {
	// Build the combined list locally for assertions
	allCodes := append(append([]EventCode{}, IndividualEventCodes...), SplitEventCodes...)

	// Should contain all 22 event codes (17 individual + 5 split)
	assert.Len(t, allCodes, 22)

	// Check all split codes are valid
	for _, split := range SplitEventCodes {
		assert.True(t, split.IsValid(), "split event %s should be valid", split)
	}

	// Check all individual codes are valid
	for _, ind := range IndividualEventCodes {
		assert.True(t, ind.IsValid(), "individual event %s should be valid", ind)
	}

	// Verify the map-based validation covers all codes
	for _, ec := range allCodes {
		assert.True(t, ec.IsValid(), "event code %s should be valid", ec)
	}
}

func TestEventCode_Description_SplitEvents(t *testing.T) {
	tests := []struct {
		event    EventCode
		expected string
	}{
		{Event50FRS, "50m Freestyle Split"},
		{Event100FRS, "100m Freestyle Split"},
		{Event200FRS, "200m Freestyle Split"},
		{Event50BKS, "50m Backstroke Split"},
		{Event100BKS, "100m Backstroke Split"},
	}

	for _, tc := range tests {
		t.Run(string(tc.event), func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.event.Description())
		})
	}
}

func TestEventCode_Stroke_SplitEvents(t *testing.T) {
	tests := []struct {
		event    EventCode
		expected string
	}{
		{Event50FRS, "Freestyle"},
		{Event100FRS, "Freestyle"},
		{Event200FRS, "Freestyle"},
		{Event50BKS, "Backstroke"},
		{Event100BKS, "Backstroke"},
	}

	for _, tc := range tests {
		t.Run(string(tc.event), func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.event.Stroke())
		})
	}
}

func TestEventsByStroke_IncludesSplits(t *testing.T) {
	byStroke := EventsByStroke()

	// Freestyle should include split events
	freestyle := byStroke["Freestyle"]
	assert.Contains(t, freestyle, Event50FRS)
	assert.Contains(t, freestyle, Event100FRS)
	assert.Contains(t, freestyle, Event200FRS)

	// Backstroke should include split events
	backstroke := byStroke["Backstroke"]
	assert.Contains(t, backstroke, Event50BKS)
	assert.Contains(t, backstroke, Event100BKS)

	// Other strokes should not have split events
	for _, code := range byStroke["Breaststroke"] {
		assert.False(t, code.IsSplit())
	}
	for _, code := range byStroke["Butterfly"] {
		assert.False(t, code.IsSplit())
	}
	for _, code := range byStroke["Individual Medley"] {
		assert.False(t, code.IsSplit())
	}
}
