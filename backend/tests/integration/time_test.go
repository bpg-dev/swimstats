package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type TimeInput struct {
	MeetID    string `json:"meet_id"`
	Event     string `json:"event"`
	TimeMS    int    `json:"time_ms"`
	Notes     string `json:"notes,omitempty"`
	EventDate string `json:"event_date"`
}

type TimeBatchInput struct {
	MeetID string `json:"meet_id"`
	Times  []struct {
		Event  string `json:"event"`
		TimeMS int    `json:"time_ms"`
		Notes  string `json:"notes,omitempty"`
	} `json:"times"`
}

type TimeRecord struct {
	ID             string `json:"id"`
	MeetID         string `json:"meet_id"`
	Event          string `json:"event"`
	TimeMS         int    `json:"time_ms"`
	TimeFormatted  string `json:"time_formatted"`
	Notes          string `json:"notes,omitempty"`
	IsPB           bool   `json:"is_pb,omitempty"`
	Meet           *Meet  `json:"meet,omitempty"`
}

type TimeList struct {
	Times []TimeRecord `json:"times"`
	Total int          `json:"total"`
}

type BatchResponse struct {
	Times  []TimeRecord `json:"times"`
	NewPBs []string     `json:"new_pbs"`
}

func TestTimeAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	// Helper to create swimmer and meet
	setupSwimmerAndMeet := func(t *testing.T, courseType string) (swimmerID, meetID string) {
		t.Helper()
		
		// Create swimmer
		swimmerInput := SwimmerInput{
			Name:      "Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)
		
		var swimmer Swimmer
		AssertJSONBody(t, rr, &swimmer)
		swimmerID = swimmer.ID

		// Create meet
		meetInput := MeetInput{
			Name:       "Test Meet",
			City:       "Toronto",
			StartDate:  "2026-03-15",
			CourseType: courseType,
		}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		
		var meet Meet
		AssertJSONBody(t, rr, &meet)
		meetID = meet.ID

		return swimmerID, meetID
	}

	t.Run("POST /times creates a time", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		input := TimeInput{
			MeetID: meetID,
			Event:  "100FR",
			TimeMS: 65320, // 1:05.32
			Notes:  "Heat 3",
		}

		rr := client.Post("/api/v1/times", input)
		
		assert.Equal(t, http.StatusCreated, rr.Code, "got %d: %s", rr.Code, rr.Body.String())

		var time TimeRecord
		AssertJSONBody(t, rr, &time)
		assert.NotEmpty(t, time.ID)
		assert.Equal(t, meetID, time.MeetID)
		assert.Equal(t, "100FR", time.Event)
		assert.Equal(t, 65320, time.TimeMS)
		assert.Equal(t, "1:05.32", time.TimeFormatted)
		assert.Equal(t, "Heat 3", time.Notes)
	})

	t.Run("GET /times lists times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		// Create multiple times
		times := []TimeInput{
			{MeetID: meetID, Event: "100FR", TimeMS: 65320},
			{MeetID: meetID, Event: "200FR", TimeMS: 145000},
			{MeetID: meetID, Event: "50FL", TimeMS: 32500},
		}

		for _, ti := range times {
			rr := client.Post("/api/v1/times", ti)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/times")
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var list TimeList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 3, list.Total)
		assert.Len(t, list.Times, 3)
	})

	t.Run("GET /times filters by event", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID1 := setupSwimmerAndMeet(t, "25m")

		// Create second meet for same event
		meetInput := MeetInput{Name: "Meet 2", City: "Ottawa", StartDate: "2026-04-15", CourseType: "25m"}
		rr := client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet2 Meet
		AssertJSONBody(t, rr, &meet2)

		times := []TimeInput{
			{MeetID: meetID1, Event: "100FR", TimeMS: 65320},
			{MeetID: meet2.ID, Event: "100FR", TimeMS: 64000}, // Same event, different meet
			{MeetID: meetID1, Event: "200FR", TimeMS: 145000},
		}

		for _, ti := range times {
			rr := client.Post("/api/v1/times", ti)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr = client.Get("/api/v1/times?event=100FR")
		
		var list TimeList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 2, list.Total)
		for _, ti := range list.Times {
			assert.Equal(t, "100FR", ti.Event)
		}
	})

	t.Run("GET /times filters by course_type", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID25 := setupSwimmerAndMeet(t, "25m")
		
		// Create another meet with 50m course
		meetInput := MeetInput{
			Name:       "50m Meet",
			City:       "Ottawa",
			StartDate:  "2026-04-15",
			CourseType: "50m",
		}
		rr := client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet50 Meet
		AssertJSONBody(t, rr, &meet50)

		// Add times to both meets
		rr = client.Post("/api/v1/times", TimeInput{MeetID: meetID25, Event: "100FR", TimeMS: 65320})
		require.Equal(t, http.StatusCreated, rr.Code)
		rr = client.Post("/api/v1/times", TimeInput{MeetID: meet50.ID, Event: "100FR", TimeMS: 68000})
		require.Equal(t, http.StatusCreated, rr.Code)

		rr = client.Get("/api/v1/times?course_type=25m")
		
		var list TimeList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 1, list.Total)
	})

	t.Run("GET /times/{id} returns a specific time", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		input := TimeInput{MeetID: meetID, Event: "100BR", TimeMS: 75000}
		rr := client.Post("/api/v1/times", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created TimeRecord
		AssertJSONBody(t, rr, &created)

		rr = client.Get("/api/v1/times/" + created.ID)
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var time TimeRecord
		AssertJSONBody(t, rr, &time)
		assert.Equal(t, created.ID, time.ID)
		assert.Equal(t, "100BR", time.Event)
		// Should include meet details
		assert.NotNil(t, time.Meet)
	})

	t.Run("PUT /times/{id} updates a time", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		input := TimeInput{MeetID: meetID, Event: "100FR", TimeMS: 65320}
		rr := client.Post("/api/v1/times", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created TimeRecord
		AssertJSONBody(t, rr, &created)

		// Update
		input.TimeMS = 64000
		input.Notes = "Final"
		rr = client.Put("/api/v1/times/"+created.ID, input)
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var updated TimeRecord
		AssertJSONBody(t, rr, &updated)
		assert.Equal(t, 64000, updated.TimeMS)
		assert.Equal(t, "Final", updated.Notes)
	})

	t.Run("DELETE /times/{id} deletes a time", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		input := TimeInput{MeetID: meetID, Event: "100FR", TimeMS: 65320}
		rr := client.Post("/api/v1/times", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created TimeRecord
		AssertJSONBody(t, rr, &created)

		rr = client.Delete("/api/v1/times/" + created.ID)
		
		assert.Equal(t, http.StatusNoContent, rr.Code)

		// Verify deleted
		rr = client.Get("/api/v1/times/" + created.ID)
		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("POST /times validates input", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		testCases := []struct {
			name  string
			input TimeInput
		}{
			{
				name:  "invalid meet_id",
				input: TimeInput{MeetID: "00000000-0000-0000-0000-000000000000", Event: "100FR", TimeMS: 65320},
			},
			{
				name:  "invalid event",
				input: TimeInput{MeetID: meetID, Event: "INVALID", TimeMS: 65320},
			},
			{
				name:  "zero time",
				input: TimeInput{MeetID: meetID, Event: "100FR", TimeMS: 0},
			},
			{
				name:  "negative time",
				input: TimeInput{MeetID: meetID, Event: "100FR", TimeMS: -1000},
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				rr := client.Post("/api/v1/times", tc.input)
				assert.True(t, rr.Code == http.StatusBadRequest || rr.Code == http.StatusNotFound,
					"expected 400 or 404, got %d: %s", rr.Code, rr.Body.String())
			})
		}
	})

	t.Run("view-only access cannot create times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		client.SetMockUser("view_only")
		defer client.SetMockUser("full")

		input := TimeInput{MeetID: meetID, Event: "100FR", TimeMS: 65320}
		rr := client.Post("/api/v1/times", input)
		
		assert.Equal(t, http.StatusForbidden, rr.Code)
	})

	t.Run("POST /times rejects duplicate event for same meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID := setupSwimmerAndMeet(t, "25m")

		// Create first time
		input := TimeInput{MeetID: meetID, Event: "100FR", TimeMS: 65320}
		rr := client.Post("/api/v1/times", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Try to create second time for same event at same meet
		input.TimeMS = 64000 // Different time, same event
		rr = client.Post("/api/v1/times", input)
		
		assert.Equal(t, http.StatusConflict, rr.Code)
		AssertJSONError(t, rr, "DUPLICATE_EVENT")
	})

	t.Run("POST /times allows same event at different meets", func(t *testing.T) {
		testDB.ClearTables(ctx, t)
		_, meetID1 := setupSwimmerAndMeet(t, "25m")

		// Create second meet
		meetInput := MeetInput{Name: "Meet 2", City: "Ottawa", StartDate: "2026-04-15", CourseType: "25m"}
		rr := client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet2 Meet
		AssertJSONBody(t, rr, &meet2)

		// Create time at first meet
		input := TimeInput{MeetID: meetID1, Event: "100FR", TimeMS: 65320}
		rr = client.Post("/api/v1/times", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Create same event at second meet - should succeed
		input.MeetID = meet2.ID
		rr = client.Post("/api/v1/times", input)
		
		assert.Equal(t, http.StatusCreated, rr.Code)
	})
}

func TestTimeBatchAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("POST /times/batch creates multiple times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create swimmer
		swimmerInput := SwimmerInput{Name: "Test", BirthDate: "2012-05-15", Gender: "female"}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		// Create meet
		meetInput := MeetInput{Name: "Meet", City: "Toronto", StartDate: "2026-03-15", CourseType: "25m"}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		// Batch create times
		input := map[string]interface{}{
			"meet_id": meet.ID,
			"times": []map[string]interface{}{
				{"event": "100FR", "time_ms": 65320, "notes": "Heat"},
				{"event": "200FR", "time_ms": 145000},
				{"event": "50FL", "time_ms": 32500, "notes": "Final"},
			},
		}

		rr = client.Post("/api/v1/times/batch", input)
		
		assert.Equal(t, http.StatusCreated, rr.Code, "got %d: %s", rr.Code, rr.Body.String())

		var response BatchResponse
		AssertJSONBody(t, rr, &response)
		assert.Len(t, response.Times, 3)
		// All times should be PBs since they're first entries
		assert.Len(t, response.NewPBs, 3)
	})

	t.Run("POST /times/batch identifies new PBs", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Setup
		swimmerInput := SwimmerInput{Name: "Test", BirthDate: "2012-05-15", Gender: "female"}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{Name: "Meet 1", City: "Toronto", StartDate: "2026-03-15", CourseType: "25m"}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet1 Meet
		AssertJSONBody(t, rr, &meet1)

		// Create initial time
		timeInput := TimeInput{MeetID: meet1.ID, Event: "100FR", TimeMS: 65320}
		rr = client.Post("/api/v1/times", timeInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Create second meet with faster time
		meetInput.Name = "Meet 2"
		meetInput.StartDate = "2026-04-15"
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet2 Meet
		AssertJSONBody(t, rr, &meet2)

		// Batch create: one faster (new PB), one new event (PB)
		input := map[string]interface{}{
			"meet_id": meet2.ID,
			"times": []map[string]interface{}{
				{"event": "100FR", "time_ms": 64000},  // Faster - new PB
				{"event": "200FR", "time_ms": 145000}, // New event - PB
			},
		}

		rr = client.Post("/api/v1/times/batch", input)
		assert.Equal(t, http.StatusCreated, rr.Code)

		var response BatchResponse
		AssertJSONBody(t, rr, &response)
		assert.Len(t, response.Times, 2)
		// Should have 2 new PBs: faster 100FR and first 200FR
		assert.Len(t, response.NewPBs, 2)
		assert.Contains(t, response.NewPBs, "100FR")
		assert.Contains(t, response.NewPBs, "200FR")
	})

	t.Run("POST /times/batch rejects duplicate events in batch", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Setup
		swimmerInput := SwimmerInput{Name: "Test", BirthDate: "2012-05-15", Gender: "female"}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{Name: "Meet", City: "Toronto", StartDate: "2026-03-15", CourseType: "25m"}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		// Try to batch create with duplicate events in the same batch
		input := map[string]interface{}{
			"meet_id": meet.ID,
			"times": []map[string]interface{}{
				{"event": "100FR", "time_ms": 65320},
				{"event": "100FR", "time_ms": 64000}, // Duplicate event
				{"event": "200FR", "time_ms": 145000},
			},
		}

		rr = client.Post("/api/v1/times/batch", input)
		assert.Equal(t, http.StatusBadRequest, rr.Code, "got %d: %s", rr.Code, rr.Body.String())
	})

	t.Run("POST /times/batch rejects events already in meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Setup
		swimmerInput := SwimmerInput{Name: "Test", BirthDate: "2012-05-15", Gender: "female"}
		rr := client.Put("/api/v1/swimmer", swimmerInput)
		require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

		meetInput := MeetInput{Name: "Meet", City: "Toronto", StartDate: "2026-03-15", CourseType: "25m"}
		rr = client.Post("/api/v1/meets", meetInput)
		require.Equal(t, http.StatusCreated, rr.Code)
		var meet Meet
		AssertJSONBody(t, rr, &meet)

		// Create first time
		timeInput := TimeInput{MeetID: meet.ID, Event: "100FR", TimeMS: 65320}
		rr = client.Post("/api/v1/times", timeInput)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Try to batch create with an event that already exists
		input := map[string]interface{}{
			"meet_id": meet.ID,
			"times": []map[string]interface{}{
				{"event": "100FR", "time_ms": 64000}, // Already exists
				{"event": "200FR", "time_ms": 145000},
			},
		}

		rr = client.Post("/api/v1/times/batch", input)
		assert.Equal(t, http.StatusConflict, rr.Code)
		AssertJSONError(t, rr, "DUPLICATE_EVENT")
	})
}

func TestTimeFormatting(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	testCases := []struct {
		timeMS    int
		formatted string
	}{
		{28450, "28.45"},       // Under a minute
		{65320, "1:05.32"},     // Over a minute
		{145670, "2:25.67"},    // Multiple minutes
		{1002180, "16:42.18"},  // Long distance
	}

	for _, tc := range testCases {
		t.Run(tc.formatted, func(t *testing.T) {
			testDB.ClearTables(ctx, t)

			// Setup
			swimmerInput := SwimmerInput{Name: "Test", BirthDate: "2012-05-15", Gender: "female"}
			rr := client.Put("/api/v1/swimmer", swimmerInput)
			require.True(t, rr.Code == http.StatusCreated || rr.Code == http.StatusOK)

			meetInput := MeetInput{Name: "Meet", City: "Toronto", StartDate: "2026-03-15", CourseType: "25m"}
			rr = client.Post("/api/v1/meets", meetInput)
			require.Equal(t, http.StatusCreated, rr.Code)
			var meet Meet
			AssertJSONBody(t, rr, &meet)

			// Create time
			timeInput := TimeInput{MeetID: meet.ID, Event: "100FR", TimeMS: tc.timeMS}
			rr = client.Post("/api/v1/times", timeInput)
			require.Equal(t, http.StatusCreated, rr.Code)

			var time TimeRecord
			AssertJSONBody(t, rr, &time)
			assert.Equal(t, tc.formatted, time.TimeFormatted)
		})
	}
}
