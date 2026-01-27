package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type ImportData struct {
	Swimmer   *SwimmerExport   `json:"swimmer,omitempty"`
	Meets     []MeetExport     `json:"meets,omitempty"`
	Standards []StandardExport `json:"standards,omitempty"`
}

type ImportRequest struct {
	Data      ImportData `json:"data"`
	Confirmed bool       `json:"confirmed"`
}

type ImportPreview struct {
	WillReplaceSwimmer    bool `json:"will_replace_swimmer"`
	CurrentMeetsCount     int  `json:"current_meets_count"`
	CurrentTimesCount     int  `json:"current_times_count"`
	CurrentStandardsCount int  `json:"current_standards_count"`
	NewMeetsCount         int  `json:"new_meets_count"`
	NewTimesCount         int  `json:"new_times_count"`
	NewStandardsCount     int  `json:"new_standards_count"`
}

func TestImportAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	testDB.CleanTables(t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("POST /data/import/preview returns correct counts", func(t *testing.T) {
		// Create existing data
		swimmerInput := SwimmerInput{
			Name:      "Preview Test Swimmer",
			BirthDate: "2012-03-10",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{
			Name:       "Existing Meet",
			City:       "Toronto",
			Country:    "Canada",
			StartDate:  "2026-01-10",
			EndDate:    "2026-01-10",
			CourseType: "25m",
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		timeInput := TimeInput{
			MeetID:    meet.ID,
			Event:     "50FR",
			TimeMS:    30000,
			EventDate: "2026-01-10",
		}
		rr = client.Post("/api/v1/times", timeInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Preview import that will replace meets
		importData := ImportData{
			Meets: []MeetExport{
				{
					Name:       "New Meet",
					City:       "Vancouver",
					Country:    "Canada",
					StartDate:  "2026-01-15",
					EndDate:    "2026-01-15",
					CourseType: "50m",
					Times: []TimeExport{
						{Event: "100FR", Time: "1:00.00", EventDate: "2026-01-15"},
						{Event: "200FR", Time: "2:10.00", EventDate: "2026-01-15"},
					},
				},
			},
		}

		rr = client.Post("/api/v1/data/import/preview", importData)
		require.Equal(t, http.StatusOK, rr.Code)

		var preview ImportPreview
		AssertJSONBody(t, rr, &preview)

		// Verify counts
		assert.False(t, preview.WillReplaceSwimmer)
		assert.Equal(t, 1, preview.CurrentMeetsCount)
		assert.Equal(t, 1, preview.CurrentTimesCount)
		assert.Equal(t, 1, preview.NewMeetsCount)
		assert.Equal(t, 2, preview.NewTimesCount)
	})

	t.Run("POST /data/import without confirmation is rejected", func(t *testing.T) {
		importData := ImportRequest{
			Data: ImportData{
				Swimmer: &SwimmerExport{
					Name:      "Test",
					BirthDate: "2010-01-01",
					Gender:    "male",
				},
			},
			Confirmed: false,
		}

		rr := client.Post("/api/v1/data/import", importData)
		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})

	t.Run("POST /data/import replaces meets", func(t *testing.T) {
		testDB.CleanTables(t)

		// Create initial swimmer and meet
		swimmerInput := SwimmerInput{
			Name:      "Replace Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{
			Name:       "Old Meet",
			City:       "Toronto",
			Country:    "Canada",
			StartDate:  "2026-01-01",
			EndDate:    "2026-01-01",
			CourseType: "25m",
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Import new meets (should delete old one)
		importReq := ImportRequest{
			Data: ImportData{
				Meets: []MeetExport{
					{
						Name:       "New Meet 1",
						City:       "Vancouver",
						Country:    "Canada",
						StartDate:  "2026-01-15",
						EndDate:    "2026-01-15",
						CourseType: "50m",
						Times: []TimeExport{
							{Event: "50FR", Time: "28.50", EventDate: "2026-01-15"},
						},
					},
				},
			},
			Confirmed: true,
		}

		rr = client.Post("/api/v1/data/import", importReq)
		require.Equal(t, http.StatusOK, rr.Code)

		// Verify old meet is deleted and new meet exists
		rr = client.Get("/api/v1/meets")
		require.Equal(t, http.StatusOK, rr.Code)

		var meetList struct {
			Meets []Meet `json:"meets"`
		}
		AssertJSONBody(t, rr, &meetList)

		require.Len(t, meetList.Meets, 1)
		assert.Equal(t, "New Meet 1", meetList.Meets[0].Name)
		assert.Equal(t, "Vancouver", meetList.Meets[0].City)
	})

	t.Run("POST /data/import with custom standard", func(t *testing.T) {
		testDB.CleanTables(t)

		// Create swimmer
		swimmerInput := SwimmerInput{
			Name:      "Standard Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		// Import with custom standard
		importReq := ImportRequest{
			Data: ImportData{
				Standards: []StandardExport{
					{
						Name:        "Custom Test Standard",
						Description: "Test standard",
						CourseType:  "25m",
						Gender:      "female",
						Times: map[string][]string{
							"50FR":  {"10U:30.00", "11-12:28.00"},
							"100FR": {"10U:1:05.00", "11-12:1:00.00"},
						},
					},
				},
			},
			Confirmed: true,
		}

		rr = client.Post("/api/v1/data/import", importReq)
		require.Equal(t, http.StatusOK, rr.Code)

		// Verify standard was created
		rr = client.Get("/api/v1/standards")
		require.Equal(t, http.StatusOK, rr.Code)

		var standardList struct {
			Standards []Standard `json:"standards"`
		}
		AssertJSONBody(t, rr, &standardList)

		// Find our custom standard (filter out preloaded ones)
		var customStandard *Standard
		for i, std := range standardList.Standards {
			if std.Name == "Custom Test Standard" {
				customStandard = &standardList.Standards[i]
				break
			}
		}

		require.NotNil(t, customStandard)
		assert.Equal(t, "Test standard", customStandard.Description)
		assert.Equal(t, "25m", customStandard.CourseType)
		assert.Equal(t, "female", customStandard.Gender)
	})
}
