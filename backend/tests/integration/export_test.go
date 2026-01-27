package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type ExportData struct {
	FormatVersion string           `json:"format_version"`
	Swimmer       SwimmerExport    `json:"swimmer"`
	Meets         []MeetExport     `json:"meets"`
	Standards     []StandardExport `json:"standards"`
}

type SwimmerExport struct {
	Name             string  `json:"name"`
	BirthDate        string  `json:"birth_date"`
	Gender           string  `json:"gender"`
	ThresholdPercent float64 `json:"threshold_percent"`
}

type MeetExport struct {
	Name       string       `json:"name"`
	City       string       `json:"city"`
	Country    string       `json:"country"`
	StartDate  string       `json:"start_date"`
	EndDate    string       `json:"end_date"`
	CourseType string       `json:"course_type"`
	Times      []TimeExport `json:"times"`
}

type TimeExport struct {
	Event     string `json:"event"`
	Time      string `json:"time"`
	EventDate string `json:"event_date"`
	Notes     string `json:"notes"`
}

type StandardExport struct {
	Name        string              `json:"name"`
	Description string              `json:"description"`
	CourseType  string              `json:"course_type"`
	Gender      string              `json:"gender"`
	Times       map[string][]string `json:"times"`
}

func TestExportAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	// Clean tables for a fresh start
	testDB.CleanTables(t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("GET /data/export returns complete swimmer data", func(t *testing.T) {
		// Setup: Create swimmer
		swimmerInput := SwimmerInput{
			Name:      "Export Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		// Setup: Create a meet
		meetInput := MeetInput{
			Name:       "Export Test Meet",
			City:       "Toronto",
			Country:    "Canada",
			StartDate:  "2026-01-15",
			EndDate:    "2026-01-15",
			CourseType: "25m",
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		// Setup: Add times
		timeInput := TimeInput{
			MeetID:    meet.ID,
			Event:     "50FR",
			TimeMS:    29500,
			EventDate: "2026-01-15",
			Notes:     "Test time",
		}
		rr = client.Post("/api/v1/times", timeInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Export data
		rr = client.Get("/api/v1/data/export")
		require.Equal(t, http.StatusOK, rr.Code)

		var exportData ExportData
		AssertJSONBody(t, rr, &exportData)

		// Verify swimmer data
		assert.Equal(t, "Export Test Swimmer", exportData.Swimmer.Name)
		assert.Equal(t, "2012-05-15", exportData.Swimmer.BirthDate)
		assert.Equal(t, "female", exportData.Swimmer.Gender)

		// Verify meets
		assert.Len(t, exportData.Meets, 1)
		assert.Equal(t, "Export Test Meet", exportData.Meets[0].Name)
		assert.Equal(t, "Toronto", exportData.Meets[0].City)
		assert.Equal(t, "25m", exportData.Meets[0].CourseType)

		// Verify times within meet
		assert.Len(t, exportData.Meets[0].Times, 1)
		assert.Equal(t, "50FR", exportData.Meets[0].Times[0].Event)
		assert.Equal(t, "29.50", exportData.Meets[0].Times[0].Time)
		assert.Equal(t, "2026-01-15", exportData.Meets[0].Times[0].EventDate)
		assert.Equal(t, "Test time", exportData.Meets[0].Times[0].Notes)

		// Standards should be empty (no custom standards created)
		assert.Empty(t, exportData.Standards)
	})

	t.Run("GET /data/export excludes preloaded standards", func(t *testing.T) {
		// Export should only include custom standards, not preloaded ones
		rr := client.Get("/api/v1/data/export")
		require.Equal(t, http.StatusOK, rr.Code)

		var exportData ExportData
		AssertJSONBody(t, rr, &exportData)

		// Should have no standards (all are preloaded)
		assert.Empty(t, exportData.Standards)
	})

	t.Run("Export and import round-trip preserves data integrity", func(t *testing.T) {
		// Setup: Create a fresh swimmer with meet, times, and custom standard
		testDB.CleanTables(t)

		// Create swimmer with custom threshold
		thresholdPercent := 5.5
		swimmerInput := SwimmerInputWithThreshold{
			Name:             "Round Trip Swimmer",
			BirthDate:        "2013-08-20",
			Gender:           "male",
			ThresholdPercent: &thresholdPercent,
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{
			Name:       "Round Trip Meet",
			City:       "Vancouver",
			Country:    "Canada",
			StartDate:  "2026-01-10",
			EndDate:    "2026-01-11",
			CourseType: "50m",
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		// Add multiple times with notes
		times := []TimeInput{
			{MeetID: meet.ID, Event: "100FR", TimeMS: 58500, EventDate: "2026-01-10", Notes: "Prelims heat 3"},
			{MeetID: meet.ID, Event: "200FR", TimeMS: 132000, EventDate: "2026-01-11", Notes: "Finals lane 4"},
		}
		for _, timeInput := range times {
			rr = client.Post("/api/v1/times", timeInput)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		// Create a custom standard
		standardReq := struct {
			Data      interface{} `json:"data"`
			Confirmed bool        `json:"confirmed"`
		}{
			Data: map[string]interface{}{
				"standards": []map[string]interface{}{
					{
						"name":        "Roundtrip Test Standard",
						"description": "Custom standard for testing",
						"course_type": "50m",
						"gender":      "male",
						"times": map[string][]string{
							"100FR": {"10U:1:10.00", "11-12:1:05.00"},
							"200FR": {"10U:2:30.00", "11-12:2:20.00"},
						},
					},
				},
			},
			Confirmed: true,
		}
		rr = client.Post("/api/v1/data/import", standardReq)
		require.Equal(t, http.StatusOK, rr.Code)

		// Export data
		rr = client.Get("/api/v1/data/export")
		require.Equal(t, http.StatusOK, rr.Code)
		var exportData ExportData
		AssertJSONBody(t, rr, &exportData)

		// Verify export has format version
		assert.Equal(t, "1.0", exportData.FormatVersion)

		// Verify export contains expected swimmer data including threshold
		assert.Equal(t, "Round Trip Swimmer", exportData.Swimmer.Name)
		assert.Equal(t, "2013-08-20", exportData.Swimmer.BirthDate)
		assert.Equal(t, "male", exportData.Swimmer.Gender)
		assert.Equal(t, 5.5, exportData.Swimmer.ThresholdPercent)

		// Verify meets
		require.Len(t, exportData.Meets, 1)
		assert.Equal(t, "Round Trip Meet", exportData.Meets[0].Name)
		assert.Equal(t, "Vancouver", exportData.Meets[0].City)
		assert.Equal(t, "Canada", exportData.Meets[0].Country)
		assert.Equal(t, "50m", exportData.Meets[0].CourseType)
		assert.Equal(t, "2026-01-10", exportData.Meets[0].StartDate)
		assert.Equal(t, "2026-01-11", exportData.Meets[0].EndDate)
		require.Len(t, exportData.Meets[0].Times, 2)

		// Verify times including notes
		assert.Equal(t, "100FR", exportData.Meets[0].Times[0].Event)
		assert.Equal(t, "58.50", exportData.Meets[0].Times[0].Time)
		assert.Equal(t, "2026-01-10", exportData.Meets[0].Times[0].EventDate)
		assert.Equal(t, "Prelims heat 3", exportData.Meets[0].Times[0].Notes)
		assert.Equal(t, "200FR", exportData.Meets[0].Times[1].Event)
		assert.Equal(t, "2:12.00", exportData.Meets[0].Times[1].Time)
		assert.Equal(t, "2026-01-11", exportData.Meets[0].Times[1].EventDate)
		assert.Equal(t, "Finals lane 4", exportData.Meets[0].Times[1].Notes)

		// Verify custom standard was exported
		require.Len(t, exportData.Standards, 1)
		assert.Equal(t, "Roundtrip Test Standard", exportData.Standards[0].Name)
		assert.Equal(t, "Custom standard for testing", exportData.Standards[0].Description)
		assert.Equal(t, "50m", exportData.Standards[0].CourseType)
		assert.Equal(t, "male", exportData.Standards[0].Gender)
		assert.Contains(t, exportData.Standards[0].Times, "100FR")
		assert.Contains(t, exportData.Standards[0].Times, "200FR")

		// Clean database completely
		testDB.CleanTables(t)

		// Import data back (wrap in request with confirmation)
		importReq := struct {
			Data      ExportData `json:"data"`
			Confirmed bool       `json:"confirmed"`
		}{
			Data:      exportData,
			Confirmed: true,
		}
		rr = client.Post("/api/v1/data/import", importReq)
		require.Equal(t, http.StatusOK, rr.Code)

		// Export again
		rr = client.Get("/api/v1/data/export")
		require.Equal(t, http.StatusOK, rr.Code)
		var secondExport ExportData
		AssertJSONBody(t, rr, &secondExport)

		// Verify format version preserved
		assert.Equal(t, exportData.FormatVersion, secondExport.FormatVersion)

		// Verify swimmer data preserved (including threshold_percent)
		assert.Equal(t, exportData.Swimmer.Name, secondExport.Swimmer.Name)
		assert.Equal(t, exportData.Swimmer.BirthDate, secondExport.Swimmer.BirthDate)
		assert.Equal(t, exportData.Swimmer.Gender, secondExport.Swimmer.Gender)
		assert.Equal(t, exportData.Swimmer.ThresholdPercent, secondExport.Swimmer.ThresholdPercent)

		// Verify meets preserved (all fields)
		require.Len(t, secondExport.Meets, len(exportData.Meets))
		assert.Equal(t, exportData.Meets[0].Name, secondExport.Meets[0].Name)
		assert.Equal(t, exportData.Meets[0].City, secondExport.Meets[0].City)
		assert.Equal(t, exportData.Meets[0].Country, secondExport.Meets[0].Country)
		assert.Equal(t, exportData.Meets[0].StartDate, secondExport.Meets[0].StartDate)
		assert.Equal(t, exportData.Meets[0].EndDate, secondExport.Meets[0].EndDate)
		assert.Equal(t, exportData.Meets[0].CourseType, secondExport.Meets[0].CourseType)

		// Verify times preserved (all fields including notes)
		require.Len(t, secondExport.Meets[0].Times, len(exportData.Meets[0].Times))
		for i := range exportData.Meets[0].Times {
			assert.Equal(t, exportData.Meets[0].Times[i].Event, secondExport.Meets[0].Times[i].Event)
			assert.Equal(t, exportData.Meets[0].Times[i].Time, secondExport.Meets[0].Times[i].Time)
			assert.Equal(t, exportData.Meets[0].Times[i].EventDate, secondExport.Meets[0].Times[i].EventDate)
			assert.Equal(t, exportData.Meets[0].Times[i].Notes, secondExport.Meets[0].Times[i].Notes)
		}

		// Verify custom standards preserved (all fields)
		require.Len(t, secondExport.Standards, len(exportData.Standards))
		assert.Equal(t, exportData.Standards[0].Name, secondExport.Standards[0].Name)
		assert.Equal(t, exportData.Standards[0].Description, secondExport.Standards[0].Description)
		assert.Equal(t, exportData.Standards[0].CourseType, secondExport.Standards[0].CourseType)
		assert.Equal(t, exportData.Standards[0].Gender, secondExport.Standards[0].Gender)
		assert.Equal(t, len(exportData.Standards[0].Times), len(secondExport.Standards[0].Times))
		for event, times := range exportData.Standards[0].Times {
			assert.Equal(t, times, secondExport.Standards[0].Times[event])
		}
	})
}
