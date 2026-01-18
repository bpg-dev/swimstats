package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type PersonalBest struct {
	Event         string `json:"event"`
	TimeMS        int    `json:"time_ms"`
	TimeFormatted string `json:"time_formatted"`
	TimeID        string `json:"time_id"`
	MeetName      string `json:"meet"`
	Date          string `json:"date"`
}

type PersonalBestList struct {
	CourseType    string         `json:"course_type"`
	PersonalBests []PersonalBest `json:"personal_bests"`
}

func TestPersonalBestsAPI(t *testing.T) {
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

	// Helper to setup swimmer and meet
	setupSwimmerAndMeet := func(t *testing.T, courseType string) string {
		t.Helper()

		// Create swimmer
		swimmerInput := SwimmerInput{
			Name:      "PB Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		// Create meet
		meetInput := MeetInput{
			Name:       "PB Test Meet",
			City:       "Toronto",
			Country:    "Canada",
			Date:       "2026-01-15",
			CourseType: courseType,
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		var meet Meet
		AssertJSONBody(t, rr, &meet)
		return meet.ID
	}

	t.Run("GET /personal-bests requires course_type parameter", func(t *testing.T) {
		// First ensure swimmer exists
		swimmerInput := SwimmerInput{
			Name:      "Course Type Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		// Now test that course_type is required
		rr = client.Get("/api/v1/personal-bests")
		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})

	t.Run("GET /personal-bests returns empty list when no times", func(t *testing.T) {
		// Ensure swimmer exists
		swimmerInput := SwimmerInput{
			Name:      "Empty PB Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		rr = client.Get("/api/v1/personal-bests?course_type=25m")
		assert.Equal(t, http.StatusOK, rr.Code)

		var pbs PersonalBestList
		AssertJSONBody(t, rr, &pbs)
		assert.Equal(t, "25m", pbs.CourseType)
		assert.Empty(t, pbs.PersonalBests)
	})

	t.Run("GET /personal-bests returns fastest times per event", func(t *testing.T) {
		meetID := setupSwimmerAndMeet(t, "25m")

		// Create multiple times for same event - different speeds
		times := []TimeInput{
			{MeetID: meetID, Event: "100FR", TimeMS: 65000}, // 1:05.00 (fastest)
			{MeetID: meetID, Event: "100FR", TimeMS: 66000}, // 1:06.00
			{MeetID: meetID, Event: "100FR", TimeMS: 67000}, // 1:07.00
			{MeetID: meetID, Event: "50FR", TimeMS: 28500},  // 28.50
		}

		for _, input := range times {
			rr := client.Post("/api/v1/times", input)
			require.Equal(t, http.StatusCreated, rr.Code, "failed to create time: %v", rr.Body.String())
		}

		// Get personal bests
		rr := client.Get("/api/v1/personal-bests?course_type=25m")
		assert.Equal(t, http.StatusOK, rr.Code)

		var pbs PersonalBestList
		AssertJSONBody(t, rr, &pbs)
		assert.Equal(t, "25m", pbs.CourseType)
		assert.Len(t, pbs.PersonalBests, 2) // 100FR and 50FR

		// Find the 100FR PB and verify it's the fastest
		var pb100FR *PersonalBest
		for i := range pbs.PersonalBests {
			if pbs.PersonalBests[i].Event == "100FR" {
				pb100FR = &pbs.PersonalBests[i]
				break
			}
		}
		require.NotNil(t, pb100FR, "100FR PB not found")
		assert.Equal(t, 65000, pb100FR.TimeMS, "PB should be the fastest time")
	})

	t.Run("GET /personal-bests respects course_type filter", func(t *testing.T) {
		// Create meets for both course types
		meet25m := setupSwimmerAndMeet(t, "25m")

		// Create 50m meet
		meetInput := MeetInput{
			Name:       "Long Course Meet",
			City:       "Toronto",
			Country:    "Canada",
			Date:       "2026-02-15",
			CourseType: "50m",
		}
		rr := client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		var meet50m Meet
		AssertJSONBody(t, rr, &meet50m)

		// Add times to both
		rr = client.Post("/api/v1/times", TimeInput{MeetID: meet25m, Event: "200FR", TimeMS: 130000})
		require.Equal(t, http.StatusCreated, rr.Code)

		rr = client.Post("/api/v1/times", TimeInput{MeetID: meet50m.ID, Event: "200FR", TimeMS: 135000})
		require.Equal(t, http.StatusCreated, rr.Code)

		// Check 25m PBs
		rr = client.Get("/api/v1/personal-bests?course_type=25m")
		assert.Equal(t, http.StatusOK, rr.Code)

		var pbs25m PersonalBestList
		AssertJSONBody(t, rr, &pbs25m)
		assert.Equal(t, "25m", pbs25m.CourseType)

		// Find 200FR PB for 25m
		found := false
		for _, pb := range pbs25m.PersonalBests {
			if pb.Event == "200FR" {
				assert.Equal(t, 130000, pb.TimeMS)
				found = true
				break
			}
		}
		assert.True(t, found, "200FR PB not found in 25m results")

		// Check 50m PBs
		rr = client.Get("/api/v1/personal-bests?course_type=50m")
		assert.Equal(t, http.StatusOK, rr.Code)

		var pbs50m PersonalBestList
		AssertJSONBody(t, rr, &pbs50m)
		assert.Equal(t, "50m", pbs50m.CourseType)

		// Find 200FR PB for 50m
		found = false
		for _, pb := range pbs50m.PersonalBests {
			if pb.Event == "200FR" {
				assert.Equal(t, 135000, pb.TimeMS)
				found = true
				break
			}
		}
		assert.True(t, found, "200FR PB not found in 50m results")
	})

	t.Run("GET /personal-bests requires authentication", func(t *testing.T) {
		client.ClearMockUser()
		rr := client.Get("/api/v1/personal-bests?course_type=25m")
		assert.Equal(t, http.StatusUnauthorized, rr.Code)
		client.SetMockUser("full")
	})
}
