package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type ExportData struct {
	Swimmer   SwimmerExport    `json:"swimmer"`
	Meets     []MeetExport     `json:"meets"`
	Standards []StandardExport `json:"standards"`
}

type SwimmerExport struct {
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"`
	Gender    string `json:"gender"`
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
	Season      string              `json:"season"`
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
		// Setup: Create a fresh swimmer with meet and times
		testDB.CleanTables(t)

		swimmerInput := SwimmerInput{
			Name:      "Round Trip Swimmer",
			BirthDate: "2013-08-20",
			Gender:    "male",
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

		// Add multiple times
		times := []TimeInput{
			{MeetID: meet.ID, Event: "100FR", TimeMS: 58500, EventDate: "2026-01-10", Notes: "Prelims"},
			{MeetID: meet.ID, Event: "200FR", TimeMS: 132000, EventDate: "2026-01-11", Notes: "Finals"},
		}
		for _, timeInput := range times {
			rr = client.Post("/api/v1/times", timeInput)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		// Export data
		rr = client.Get("/api/v1/data/export")
		require.Equal(t, http.StatusOK, rr.Code)
		var exportData ExportData
		AssertJSONBody(t, rr, &exportData)

		// Verify export contains expected data
		assert.Equal(t, "Round Trip Swimmer", exportData.Swimmer.Name)
		assert.Len(t, exportData.Meets, 1)
		assert.Len(t, exportData.Meets[0].Times, 2)

		// Clean database
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

		// Verify both exports match
		assert.Equal(t, exportData.Swimmer.Name, secondExport.Swimmer.Name)
		assert.Equal(t, exportData.Swimmer.BirthDate, secondExport.Swimmer.BirthDate)
		assert.Equal(t, exportData.Swimmer.Gender, secondExport.Swimmer.Gender)

		assert.Len(t, secondExport.Meets, len(exportData.Meets))
		if len(secondExport.Meets) > 0 {
			assert.Equal(t, exportData.Meets[0].Name, secondExport.Meets[0].Name)
			assert.Equal(t, exportData.Meets[0].City, secondExport.Meets[0].City)
			assert.Equal(t, exportData.Meets[0].CourseType, secondExport.Meets[0].CourseType)
			assert.Len(t, secondExport.Meets[0].Times, len(exportData.Meets[0].Times))

			// Check times
			for i := range exportData.Meets[0].Times {
				assert.Equal(t, exportData.Meets[0].Times[i].Event, secondExport.Meets[0].Times[i].Event)
				assert.Equal(t, exportData.Meets[0].Times[i].Time, secondExport.Meets[0].Times[i].Time)
				assert.Equal(t, exportData.Meets[0].Times[i].EventDate, secondExport.Meets[0].Times[i].EventDate)
			}
		}
	})
}
