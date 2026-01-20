package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type ProgressDataPoint struct {
	ID            string `json:"id"`
	TimeMS        int    `json:"time_ms"`
	TimeFormatted string `json:"time_formatted"`
	Date          string `json:"date"`
	MeetName      string `json:"meet_name"`
	Event         string `json:"event"`
	IsPersonalBest bool  `json:"is_pb"`
}

type ProgressData struct {
	SwimmerID  string              `json:"swimmer_id"`
	Event      string              `json:"event"`
	CourseType string              `json:"course_type"`
	StartDate  *string             `json:"start_date,omitempty"`
	EndDate    *string             `json:"end_date,omitempty"`
	DataPoints []ProgressDataPoint `json:"data_points"`
}

func TestProgressAPI(t *testing.T) {
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

	// Setup swimmer
	swimmerInput := SwimmerInput{
		Name:      "Progress Test Swimmer",
		BirthDate: "2012-05-15",
		Gender:    "female",
	}
	rr := client.Put("/api/v1/swimmer", swimmerInput)
	require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

	var swimmer Swimmer
	AssertJSONBody(t, rr, &swimmer)

	// Create meets across different dates
	meetInput1 := MeetInput{
		Name:       "Progress Meet 1",
		City:       "Toronto",
		Country:    "Canada",
		StartDate:  "2026-01-10",
		EndDate:    "2026-01-10",
		CourseType: "25m",
	}
	rr = client.Post("/api/v1/meets", meetInput1)
	require.Equal(t, http.StatusCreated, rr.Code)
	var meet1 Meet
	AssertJSONBody(t, rr, &meet1)

	meetInput2 := MeetInput{
		Name:       "Progress Meet 2",
		City:       "Toronto",
		Country:    "Canada",
		StartDate:  "2026-01-15",
		EndDate:    "2026-01-15",
		CourseType: "25m",
	}
	rr = client.Post("/api/v1/meets", meetInput2)
	require.Equal(t, http.StatusCreated, rr.Code)
	var meet2 Meet
	AssertJSONBody(t, rr, &meet2)

	meetInput3 := MeetInput{
		Name:       "Progress Meet 3",
		City:       "Toronto",
		Country:    "Canada",
		StartDate:  "2026-01-20",
		EndDate:    "2026-01-20",
		CourseType: "25m",
	}
	rr = client.Post("/api/v1/meets", meetInput3)
	require.Equal(t, http.StatusCreated, rr.Code)
	var meet3 Meet
	AssertJSONBody(t, rr, &meet3)

	t.Run("GET /progress/{event} returns progress data ordered by date", func(t *testing.T) {
		// Add times in non-chronological order to test sorting
		timeInput1 := TimeInput{
			MeetID:    meet2.ID,
			Event:     "50FR",
			TimeMS:    28850,
			EventDate: "2026-01-15",
		}
		rr := client.Post("/api/v1/times", timeInput1)
		require.Equal(t, http.StatusCreated, rr.Code)

		timeInput2 := TimeInput{
			MeetID:    meet1.ID,
			Event:     "50FR",
			TimeMS:    29200,
			EventDate: "2026-01-10",
		}
		rr = client.Post("/api/v1/times", timeInput2)
		require.Equal(t, http.StatusCreated, rr.Code)

		timeInput3 := TimeInput{
			MeetID:    meet3.ID,
			Event:     "50FR",
			TimeMS:    28600,
			EventDate: "2026-01-20",
		}
		rr = client.Post("/api/v1/times", timeInput3)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Fetch progress data
		rr = client.Get("/api/v1/progress/50FR?course_type=25m")
		require.Equal(t, http.StatusOK, rr.Code)

		var progressData ProgressData
		AssertJSONBody(t, rr, &progressData)

		// Verify data
		assert.Equal(t, swimmer.ID, progressData.SwimmerID)
		assert.Equal(t, "50FR", progressData.Event)
		assert.Equal(t, "25m", progressData.CourseType)
		assert.Len(t, progressData.DataPoints, 3)

		// Verify chronological order
		assert.Equal(t, "2026-01-10", progressData.DataPoints[0].Date)
		assert.Equal(t, "2026-01-15", progressData.DataPoints[1].Date)
		assert.Equal(t, "2026-01-20", progressData.DataPoints[2].Date)

		// Verify PB detection (fastest time should be marked)
		assert.False(t, progressData.DataPoints[0].IsPersonalBest) // 29.20 - not PB
		assert.False(t, progressData.DataPoints[1].IsPersonalBest) // 28.85 - not PB
		assert.True(t, progressData.DataPoints[2].IsPersonalBest)  // 28.60 - PB
	})

	t.Run("GET /progress/{event} filters by date range", func(t *testing.T) {
		// Filter to only include meet2 (2026-01-15)
		rr := client.Get("/api/v1/progress/50FR?course_type=25m&start_date=2026-01-14&end_date=2026-01-16")
		require.Equal(t, http.StatusOK, rr.Code)

		var progressData ProgressData
		AssertJSONBody(t, rr, &progressData)

		// Should only have 1 data point
		assert.Len(t, progressData.DataPoints, 1)
		assert.Equal(t, "2026-01-15", progressData.DataPoints[0].Date)
		assert.Equal(t, "Progress Meet 2", progressData.DataPoints[0].MeetName)
	})

	t.Run("GET /progress/{event} requires course_type parameter", func(t *testing.T) {
		rr := client.Get("/api/v1/progress/50FR")
		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})

	t.Run("GET /progress/{event} returns empty array for no data", func(t *testing.T) {
		// Query for an event with no times
		rr := client.Get("/api/v1/progress/200IM?course_type=25m")
		require.Equal(t, http.StatusOK, rr.Code)

		var progressData ProgressData
		AssertJSONBody(t, rr, &progressData)

		assert.Equal(t, "200IM", progressData.Event)
		assert.Empty(t, progressData.DataPoints)
	})

	t.Run("GET /progress/{event} separates course types", func(t *testing.T) {
		// Create a 50m meet
		meetInput50m := MeetInput{
			Name:       "50m Meet",
			City:       "Toronto",
			Country:    "Canada",
			StartDate:  "2026-01-25",
			EndDate:    "2026-01-25",
			CourseType: "50m",
		}
		rr := client.Post("/api/v1/meets", meetInput50m)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet50m Meet
		AssertJSONBody(t, rr, &meet50m)

		// Add a 50m time
		timeInput50m := TimeInput{
			MeetID:    meet50m.ID,
			Event:     "50FR",
			TimeMS:    27500,
			EventDate: "2026-01-25",
		}
		rr = client.Post("/api/v1/times", timeInput50m)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Query for 25m data - should not include 50m time
		rr = client.Get("/api/v1/progress/50FR?course_type=25m")
		require.Equal(t, http.StatusOK, rr.Code)
		var progressData25m ProgressData
		AssertJSONBody(t, rr, &progressData25m)
		assert.Len(t, progressData25m.DataPoints, 3) // Only the 3 from 25m meets

		// Query for 50m data - should only include 50m time
		rr = client.Get("/api/v1/progress/50FR?course_type=50m")
		require.Equal(t, http.StatusOK, rr.Code)
		var progressData50m ProgressData
		AssertJSONBody(t, rr, &progressData50m)
		assert.Len(t, progressData50m.DataPoints, 1)
		assert.Equal(t, "50m Meet", progressData50m.DataPoints[0].MeetName)
	})
}
